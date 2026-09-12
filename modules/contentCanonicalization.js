// Canonicalization policy for the one-time corpus pass.  Puzzle authoring
// storage is the simplified document shape; JSON-LD is an interchange shape
// and is converted only at this boundary.  Keep this module pure so the D1
// and Git migration paths cannot drift apart.
import {
  CATEGORIES,
  canonicalizePuzzleCategoryReferences
} from "../puzzles/categories.js";
import {
  documentForStorage,
  canonicalizeAuthoredDocumentFields
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

const JSON_LD_TOP_LEVEL_KEYS = new Set([
  "@context", "@id", "@type", "schemaVersion", "id", "title", "category",
  "categories", "subcategories", "large", "info", "relatedPuzzles",
  "lensMode", "lenses", "preSolve", "tags", "level", "learningIntroduction",
  "clusters", "bridges", "creator", "license", "derivedFrom", "dateCreated",
  "dateModified", "language", "version", "generativeAssistance", "provenance",
  "layouts"
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

function categoryReferences(document, categoryRegistry) {
  const categoryCanonical = canonicalizePuzzleCategoryReferences(
    document,
    categoryRegistry
  );
  return sameJson(categoryCanonical, document) ? null : categoryCanonical;
}

// JSON-LD allows a small extension vocabulary, but the simplified authoring
// schema deliberately does not.  Refuse fields that would otherwise vanish
// in the conversion instead of silently losing author data.  `layouts` is a
// known JSON-LD field, but is intentionally a separate Star-layout artifact,
// not part of simplified puzzle content.
function unsupportedJsonLdFields(document) {
  const unsupported = [];
  function visit(value, path, { checkKeys = true, topLevel = false } = {}) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`, { checkKeys }));
      return;
    }
    if (!objectLike(value)) return;
    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key;
      if (checkKeys && topLevel && !JSON_LD_TOP_LEVEL_KEYS.has(key)) {
        unsupported.push(`${childPath} (unknown top-level JSON-LD field)`);
      } else if (checkKeys && topLevel && key === "layouts") {
        unsupported.push(`${childPath} (not representable in simplified content)`);
      } else if (checkKeys && key === "src") {
        unsupported.push(`${childPath} (external content sources must be materialized before canonicalization)`);
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
          visit(info, `${childPath}.${term}`);
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
      visit(child, childPath);
    }
  }
  visit(document, "", { topLevel: true });
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
 * This does not mutate the input and never writes files or D1 rows.
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
  let canonical;
  let sourceSimplified = document;
  let jsonLdIdCorrections = [];
  try {
    if (sourceFormat === "jsonld") {
      const unsupported = unsupportedJsonLdFields(document);
      if (unsupported.length) {
        return errorResult(
          [`JSON-LD fields cannot be represented in simplified content: ${unsupported.join(", ")}`],
          sourceFormat
        );
      }
      const normalizedJsonLd = normalizeLegacyJsonLdNodeIds(document);
      jsonLdIdCorrections = normalizedJsonLd.corrections;
      const puzzle = puzzleFromJsonLd(normalizedJsonLd.document);
      sourceSimplified = puzzleToSimplified(puzzle);
      canonical = documentForStorage(
        puzzleForCanonicalPublication(puzzle, {
          categoryRegistry: registry
        }).simplified,
        { categoryRegistry: registry }
      );
    } else {
      canonical = documentForStorage(document, {
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
  const fieldCanonical = canonicalizeAuthoredDocumentFields(sourceSimplified);
  if (!sameJson(fieldCanonical, sourceSimplified)) {
    reasons.push("authored-fields");
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
