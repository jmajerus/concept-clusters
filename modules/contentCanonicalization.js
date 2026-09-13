// Canonicalization policy for the one-time corpus pass.  Puzzle authoring
// storage is the simplified document shape; JSON-LD is an interchange shape
// and is converted only at this boundary.  Keep this module pure so the D1
// and Git migration paths cannot drift apart.
import {
  CATEGORIES,
  canonicalizePuzzleCategoryReferences
} from "../puzzles/categories.js";
import { categoryReferenceIssues } from "./categoryReferenceMigration.js";
import {
  documentForStorage,
  canonicalizeAuthoredDocumentFields,
  documentHasRetiredBridgeTermRole,
  documentHasRetiredGenerativeAssistance
} from "./authoredPuzzleDocument.js";
import {
  isJsonLdShaped,
  puzzleFromAuthoredDocument
} from "./simplifiedPuzzleSchema.js";
import { puzzleFromJsonLd } from "./puzzleJsonLd.js";
import {
  puzzleForCanonicalPublication,
  puzzleToSimplified
} from "./puzzleSimplified.js";
import { puzzleUrn } from "./jsonLdProfile.js";

const JSON_LD_TOP_LEVEL_KEYS = new Set([
  "@context", "@id", "@type", "schemaVersion", "id", "title", "category",
  "categories", "subcategories", "large", "info", "relatedPuzzles",
  "lensMode", "lenses", "preSolve", "tags", "level", "learningIntroduction",
  "clusters", "bridges", "creator", "license", "derivedFrom", "dateCreated",
  "dateModified", "language", "version",
  // Legacy JSON-LD may still carry this field. It is recognized so import
  // compatibility can fold it into provenance; current exports omit it.
  "generativeAssistance", "provenance",
  "layouts"
]);

// These are the fields that puzzleJsonLd.js actually reads from each JSON-LD
// node.  Keep the migration boundary explicit: puzzleFromJsonLd() preserves
// namespaced extensions, but a plain node field that is not in this vocabulary
// would otherwise disappear when the node is projected to simplified content.
const JSON_LD_CLUSTER_KEYS = new Set([
  "@id", "@type", "id", "name", "color", "fact", "terms", "seeds",
  "termInfo", "info"
]);
const JSON_LD_BRIDGE_KEYS = new Set([
  "@id", "@type", "id", "term", "clusters", "fact", "conceptId",
  // Legacy JSON-LD termRole is accepted long enough for this migration to
  // discard it; it is not emitted in current simplified or JSON-LD output.
  "termRole", "relationKind", "info", "idealTerms", "direction"
]);
const JSON_LD_LENS_KEYS = new Set([
  "@id", "@type", "id", "prompt", "explanation", "label", "definition",
  "color", "targets", "reasons", "options"
]);
const JSON_LD_LENS_OPTION_KEYS = new Set([
  "@id", "@type", "id", "label", "correct", "targets"
]);
const JSON_LD_REFERENCE_KEYS = new Set(["@id"]);
const JSON_LD_IDEAL_TERM_KEYS = new Set(["cluster", "term"]);
const JSON_LD_DIRECTION_KEYS = new Set(["kind", "from", "to"]);
const JSON_LD_RELATED_ENTRY_KEYS = new Set(["puzzle", "via", "reason"]);
const JSON_LD_RELATED_KEYS = new Set(["info", "entries"]);
const JSON_LD_INFO_KEYS = new Set([
  "text", "link", "linkLabel", "extraLink", "seeAlso", "links", "citations",
  // Legacy info.title is intentionally discarded by the authored-field fold.
  "title"
]);
const JSON_LD_LEARNING_KEYS = new Set([
  "requirement", "title", "summary", "estimatedMinutes", "credit", "content",
  "links", "sources", "citations", "revision"
]);
const JSON_LD_LEARNING_CONTENT_KEYS = new Set(["text", "mediaType", "src"]);
const JSON_LD_LINK_ENTRY_KEYS = new Set(["href", "label"]);
const JSON_LD_CITATION_KEYS = new Set([
  "title", "author", "publisher", "year", "pages", "url"
]);

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function objectLike(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// A small batch of older JSON-LD drafts used the original example's
// `cluster-`/`bridge-` namespace in @id, but omitted that namespace from the
// node's bare id.  The fragment is the identity that all bridge references
// already point at, so the lossless migration is to bring id up to the
// existing fragment rather than rewriting every reference (or silently
// choosing a new identity).  Do not repair arbitrary mismatches here: those
// remain validation errors because their intended identity cannot be inferred
// safely.
function normalizeLegacyJsonLdNodeIds(document) {
  let normalized = document;
  const corrections = [];
  for (const [collection, prefix] of [
    ["clusters", "cluster-"],
    ["bridges", "bridge-"]
  ]) {
    if (!Array.isArray(document[collection])) continue;
    document[collection].forEach((node, index) => {
      if (!objectLike(node)) return;
      const id = node.id;
      const fragment = node["@id"];
      if (typeof id !== "string" || !id.trim()
        || fragment !== `#${prefix}${id}`) return;
      if (normalized === document) normalized = JSON.parse(JSON.stringify(document));
      normalized[collection][index].id = fragment.slice(1);
      corrections.push(`${collection}[${index}].id`);
    });
  }
  return { document: normalized, corrections };
}

// Two early JSON-LD drafts called this field `related` and used a bare
// `puzzleId` on each entry.  The interchange contract is
// `relatedPuzzles.entries[].puzzle.@id`; convert only that complete, known
// shape so an unfamiliar extension is still surfaced instead of dropped.
function normalizeLegacyJsonLdRelated(document) {
  const related = document?.related;
  if (!objectLike(related) || Object.hasOwn(document, "relatedPuzzles")) {
    return { document, corrected: false };
  }
  const relatedKeys = new Set(["info", "entries"]);
  if (Object.keys(related).some(key => !relatedKeys.has(key))
    || !Array.isArray(related.entries)
    || !related.entries.length) {
    return { document, corrected: false };
  }
  const entryKeys = new Set(["puzzleId", "reason", "via"]);
  if (related.entries.some(entry => !objectLike(entry)
    || Object.keys(entry).some(key => !entryKeys.has(key))
    || typeof entry.puzzleId !== "string"
    || !entry.puzzleId.trim()
    || entry.reason !== undefined && typeof entry.reason !== "string"
    || entry.via !== undefined && !Array.isArray(entry.via))) {
    return { document, corrected: false };
  }
  const normalized = JSON.parse(JSON.stringify(document));
  normalized.relatedPuzzles = {
    ...(related.info !== undefined ? { info: related.info } : {}),
    entries: related.entries.map(entry => {
      const { puzzleId, ...rest } = entry;
      return {
        ...rest,
        puzzle: { "@id": puzzleUrn(puzzleId) }
      };
    })
  };
  delete normalized.related;
  return { document: normalized, corrected: true };
}

// JSON-LD writes the Markdown MIME type beside lesson text.  It is useful
// interchange metadata but the simplified authoring contract stores the text
// directly and has no `mediaType` key.  Only remove the known Markdown value;
// an unfamiliar value remains a validation error rather than being guessed.
function normalizeLegacyLearningMediaType(document) {
  const content = document?.learningIntroduction?.content;
  if (!objectLike(content) || content.mediaType !== "text/markdown") {
    return { document, corrected: false };
  }
  const normalized = JSON.parse(JSON.stringify(document));
  delete normalized.learningIntroduction.content.mediaType;
  return { document: normalized, corrected: true };
}

function categoryReferences(document, categoryRegistry) {
  const categoryCanonical = canonicalizePuzzleCategoryReferences(
    document,
    categoryRegistry
  );
  return sameJson(categoryCanonical, document) ? null : categoryCanonical;
}

function categoryReferenceErrors(document, categoryRegistry) {
  const { ambiguous, unknown } = categoryReferenceIssues(
    document,
    categoryRegistry
  );
  const errors = [];
  if (ambiguous.length) {
    errors.push(
      `category title alias maps to more than one current category: ${ambiguous.join(", ")}`
    );
  }
  if (unknown.length) {
    errors.push(
      `category reference is not present in the supplied registry; refusing slug fallback: ${unknown.join(", ")}`
    );
  }
  return errors;
}

// JSON-LD allows a small extension vocabulary, but the simplified authoring
// schema deliberately does not.  Refuse fields that would otherwise vanish
// in the conversion instead of silently losing author data.  `layouts` is a
// known JSON-LD field, but is intentionally a separate Star-layout artifact,
// not part of simplified puzzle content.
function unsupportedJsonLdFields(document) {
  const unsupported = [];
  function visit(value, path, {
    checkKeys = true,
    topLevel = false,
    allowedKeys = null,
    nodeKind = null
  } = {}) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`, {
        checkKeys,
        allowedKeys,
        nodeKind
      }));
      return;
    }
    if (!objectLike(value)) return;
    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key;
      if (checkKeys && allowedKeys && !allowedKeys.has(key)
        && !key.includes(":") && !key.startsWith("@")) {
        unsupported.push(`${childPath} (unknown ${nodeKind || "JSON-LD node"} field)`);
      } else if (checkKeys && topLevel && !JSON_LD_TOP_LEVEL_KEYS.has(key)) {
        unsupported.push(`${childPath} (unknown top-level JSON-LD field)`);
      } else if (checkKeys && topLevel && key === "layouts") {
        unsupported.push(`${childPath} (not representable in simplified content)`);
      } else if (checkKeys && key === "src") {
        unsupported.push(`${childPath} (external content sources must be materialized before canonicalization)`);
      } else if (checkKeys && key === "mediaType" && child !== "text/markdown") {
        unsupported.push(`${childPath} (only text/markdown is representable in simplified content)`);
      } else if (checkKeys && key.startsWith("@") && !["@context", "@id", "@type"].includes(key)) {
        unsupported.push(`${childPath} (JSON-LD metadata is not representable in simplified content)`);
      } else if (checkKeys && key.includes(":")) {
        unsupported.push(`${childPath} (namespaced extensions are not representable in simplified content)`);
      }
      // Envelope keys are intentionally discarded, as are JSON-LD node
      // metadata keys.  Their values cannot contain authored extensions that
      // need to survive the conversion.
      if (key === "@context" || key === "@id" || key === "@type") continue;
      // These objects are maps whose keys are authored values rather than
      // JSON-LD vocabulary keys. A term such as "cause:effect" or a
      // category title containing a colon is valid content and must not be
      // mistaken for a namespaced extension. Their values still get visited
      // so fixed info fields inside a termInfo entry are checked normally.
      if (key === "termInfo" && objectLike(child)) {
        for (const [term, info] of Object.entries(child)) {
          visit(info, `${childPath}.${term}`, {
            allowedKeys: JSON_LD_INFO_KEYS,
            nodeKind: "info"
          });
        }
        continue;
      }
      if ((key === "subcategories" || key === "idealTerms" || key === "reasons")
        && objectLike(child)) {
        for (const [mapKey, mappedValue] of Object.entries(child)) {
          visit(mappedValue, `${childPath}.${mapKey}`, { checkKeys: false });
        }
        continue;
      }

      // Apply the node-specific allowlists at the point where JSON-LD's
      // arrays change meaning.  References and direction objects are strict
      // too, so a typo cannot be silently discarded inside an otherwise valid
      // bridge.
      if (nodeKind === "document" && key === "clusters" && Array.isArray(child)) {
        child.forEach((node, index) => visit(node, `${childPath}[${index}]`, {
          allowedKeys: JSON_LD_CLUSTER_KEYS,
          nodeKind: "cluster"
        }));
        continue;
      }
      if (nodeKind === "document" && key === "bridges" && Array.isArray(child)) {
        child.forEach((node, index) => visit(node, `${childPath}[${index}]`, {
          allowedKeys: JSON_LD_BRIDGE_KEYS,
          nodeKind: "bridge"
        }));
        continue;
      }
      if (nodeKind === "document" && key === "lenses" && Array.isArray(child)) {
        child.forEach((node, index) => visit(node, `${childPath}[${index}]`, {
          allowedKeys: JSON_LD_LENS_KEYS,
          nodeKind: "lens"
        }));
        continue;
      }
      if (nodeKind === "bridge" && key === "clusters" && Array.isArray(child)) {
        child.forEach((node, index) => visit(node, `${childPath}[${index}]`, {
          allowedKeys: JSON_LD_REFERENCE_KEYS,
          nodeKind: "reference"
        }));
        continue;
      }
      if (nodeKind === "bridge" && key === "idealTerms" && Array.isArray(child)) {
        child.forEach((node, index) => visit(node, `${childPath}[${index}]`, {
          allowedKeys: JSON_LD_IDEAL_TERM_KEYS,
          nodeKind: "ideal-term"
        }));
        continue;
      }
      if (nodeKind === "bridge" && key === "direction" && objectLike(child)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_DIRECTION_KEYS,
          nodeKind: "direction"
        });
        continue;
      }
      if (nodeKind === "direction" && (key === "from" || key === "to")
        && objectLike(child)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_REFERENCE_KEYS,
          nodeKind: "reference"
        });
        continue;
      }
      if (nodeKind === "ideal-term" && key === "cluster" && objectLike(child)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_REFERENCE_KEYS,
          nodeKind: "reference"
        });
        continue;
      }
      if (nodeKind === "lens" && key === "options" && Array.isArray(child)) {
        child.forEach((node, index) => visit(node, `${childPath}[${index}]`, {
          allowedKeys: JSON_LD_LENS_OPTION_KEYS,
          nodeKind: "lens option"
        }));
        continue;
      }
      if (nodeKind === "document" && key === "relatedPuzzles"
        && objectLike(child) && Array.isArray(child.entries)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_RELATED_KEYS,
          nodeKind: "related-puzzles"
        });
        continue;
      }
      if (nodeKind === "related-puzzles" && key === "info") {
        visit(child, childPath, {
          allowedKeys: JSON_LD_INFO_KEYS,
          nodeKind: "info"
        });
        continue;
      }
      if (nodeKind === "related-puzzles" && key === "entries" && Array.isArray(child)) {
        child.forEach((entry, index) => visit(entry, `${childPath}[${index}]`, {
          allowedKeys: JSON_LD_RELATED_ENTRY_KEYS,
          nodeKind: "related-puzzle entry"
        }));
        continue;
      }
      if (nodeKind === "related-puzzle entry" && key === "puzzle" && objectLike(child)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_REFERENCE_KEYS,
          nodeKind: "reference"
        });
        continue;
      }
      if (nodeKind === "related-puzzle entry" && key === "via" && Array.isArray(child)) {
        child.forEach((node, index) => visit(node, `${childPath}[${index}]`));
        continue;
      }
      if (key === "info" && objectLike(child)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_INFO_KEYS,
          nodeKind: "info"
        });
        continue;
      }
      if (nodeKind === "document" && key === "learningIntroduction"
        && objectLike(child)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_LEARNING_KEYS,
          nodeKind: "learning introduction"
        });
        continue;
      }
      if (nodeKind === "learning introduction" && key === "content"
        && objectLike(child)) {
        visit(child, childPath, {
          allowedKeys: JSON_LD_LEARNING_CONTENT_KEYS,
          nodeKind: "learning content"
        });
        continue;
      }
      if ((nodeKind === "learning introduction" || nodeKind === "info")
        && (key === "links" || key === "sources" || key === "seeAlso")
        && Array.isArray(child)) {
        child.forEach((entry, index) => {
          if (objectLike(entry)) {
            visit(entry, `${childPath}[${index}]`, {
              allowedKeys: JSON_LD_LINK_ENTRY_KEYS,
              nodeKind: "link"
            });
          }
        });
        continue;
      }
      if ((nodeKind === "learning introduction" || nodeKind === "info")
        && key === "citations" && Array.isArray(child)) {
        child.forEach((entry, index) => {
          visit(entry, `${childPath}[${index}]`, {
            allowedKeys: JSON_LD_CITATION_KEYS,
            nodeKind: "citation"
          });
        });
        continue;
      }
      visit(child, childPath);
    }
  }
  visit(document, "", { topLevel: true, nodeKind: "document" });
  return [...new Set(unsupported)];
}

function errorResult(errors, sourceFormat = null) {
  return {
    sourceFormat,
    targetFormat: null,
    document: null,
    changed: false,
    reasons: [],
    errors: [...errors]
  };
}

/**
 * Convert one puzzle document to the canonical simplified storage shape.
 * This does not mutate the input and never writes files or D1 rows. Legacy
 * bridge termRole annotations are removed as part of the authored-field
 * fold; the current simplified schema has one bridge shape, with
 * relationKind/direction/idealTerms as its optional relationship annotations.
 *
 * @param {any} document
 * @param {{ categoryRegistry?: Record<string, any> }} [options]
 * @returns {{
 *   sourceFormat: "jsonld"|"simplified"|null,
 *   targetFormat: "simplified"|null,
 *   document: any,
 *   changed: boolean,
 *   reasons: string[],
 *   errors: string[]
 * }}
 */
export function canonicalizePuzzleDocument(
  document,
  { categoryRegistry = CATEGORIES } = {}
) {
  const registry = categoryRegistry || CATEGORIES;
  if (!objectLike(document)) {
    return errorResult(["document must be a JSON object"]);
  }

  const sourceFormat = isJsonLdShaped(document) ? "jsonld" : "simplified";
  const hadRetiredBridgeTermRole = documentHasRetiredBridgeTermRole(document);
  const hadRetiredGenerativeAssistance = documentHasRetiredGenerativeAssistance(document);
  let canonical;
  let sourceSimplified = document;
  let jsonLdIdCorrections = [];
  let jsonLdRelatedCorrection = false;
  let learningMediaTypeCorrection = false;
  try {
    let normalizedDocument = document;
    if (sourceFormat === "jsonld") {
      const normalizedIds = normalizeLegacyJsonLdNodeIds(normalizedDocument);
      normalizedDocument = normalizedIds.document;
      jsonLdIdCorrections = normalizedIds.corrections;
      const normalizedRelated = normalizeLegacyJsonLdRelated(normalizedDocument);
      normalizedDocument = normalizedRelated.document;
      jsonLdRelatedCorrection = normalizedRelated.corrected;
    }
    const normalizedMediaType = normalizeLegacyLearningMediaType(normalizedDocument);
    normalizedDocument = normalizedMediaType.document;
    learningMediaTypeCorrection = normalizedMediaType.corrected;

    // Check legacy titles and aliases before any storage/converter boundary
    // can turn an unknown display title into an invented slug.  A stable id
    // that is not in this checkout is still permitted when it already has its
    // own slug spelling; a display title must be present in the live registry.
    const categoryErrors = categoryReferenceErrors(normalizedDocument, registry);
    if (categoryErrors.length) {
      return errorResult(categoryErrors, sourceFormat);
    }

    if (sourceFormat === "jsonld") {
      const unsupported = unsupportedJsonLdFields(normalizedDocument);
      if (unsupported.length) {
        return errorResult(
          [`JSON-LD fields cannot be represented in simplified content: ${unsupported.join(", ")}`],
          sourceFormat
        );
      }
      const puzzle = puzzleFromJsonLd(normalizedDocument);
      sourceSimplified = puzzleToSimplified(puzzle);
      canonical = documentForStorage(
        puzzleForCanonicalPublication(puzzle, {
          categoryRegistry: registry
        }).simplified,
        { categoryRegistry: registry }
      );
    } else {
      sourceSimplified = normalizedDocument;
      canonical = documentForStorage(normalizedDocument, {
        categoryRegistry: registry
      });
    }
  } catch (error) {
    return errorResult([
      error instanceof Error ? error.message : String(error)
    ], sourceFormat);
  }

  if (!objectLike(canonical) || isJsonLdShaped(canonical)) {
    return errorResult(
      ["canonicalization did not produce a simplified document"],
      sourceFormat
    );
  }

  // Shape validation is deliberately performed after canonicalization so a
  // malformed source is reported before any migration can write it.  It also
  // catches the known long-term content issue that ordinary runtime checks
  // may not see when they load generated modules.
  const { puzzle, errors } = puzzleFromAuthoredDocument(canonical, {
    categoryRegistry: registry
  });
  if (!puzzle) return errorResult(errors, sourceFormat);

  const reasons = [];
  if (sourceFormat === "jsonld") {
    reasons.push("jsonld-to-simplified");
  }
  if (jsonLdIdCorrections.length) {
    reasons.push("jsonld-id-drift");
  }
  if (jsonLdRelatedCorrection) {
    reasons.push("jsonld-related-shape");
  }
  if (learningMediaTypeCorrection) {
    reasons.push("learning-media-type");
  }
  const fieldCanonical = canonicalizeAuthoredDocumentFields(sourceSimplified);
  if (!sameJson(fieldCanonical, sourceSimplified)) {
    reasons.push("authored-fields");
  }
  if (hadRetiredBridgeTermRole || documentHasRetiredBridgeTermRole(sourceSimplified)) {
    reasons.push("term-role-removed");
  }
  if (hadRetiredGenerativeAssistance
    || documentHasRetiredGenerativeAssistance(sourceSimplified)) {
    reasons.push("generative-assistance-removed");
  }
  const categoryCanonical = categoryReferences(fieldCanonical, registry);
  if (categoryCanonical) reasons.push("category-identifiers");
  if (!reasons.length && !sameJson(canonical, document)) {
    reasons.push("canonical-format");
  }

  return {
    sourceFormat,
    targetFormat: "simplified",
    document: canonical,
    changed: !sameJson(canonical, document),
    reasons,
    errors: []
  };
}

/**
 * Canonicalize a row returned by the D1/Git corpus scanners.  Categories and
 * catalogues have their own document contracts; this pass intentionally
 * leaves them untouched rather than applying puzzle fields to every row in
 * the shared D1 table.
 */
export function canonicalizeCorpusRow(row, options = {}) {
  if (row?.kind !== "puzzle") {
    return {
      sourceFormat: null,
      targetFormat: null,
      document: row?.document ?? null,
      changed: false,
      reasons: [],
      errors: [],
      skipped: true
    };
  }
  return canonicalizePuzzleDocument(row.document, options);
}

export { normalizeLegacyJsonLdNodeIds, unsupportedJsonLdFields };
