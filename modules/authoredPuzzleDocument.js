// Shared draft-document policy for local and hosted authoring MCP.
// Leftover link/extraLink/seeAlso fold into `links` when a document
// enters a draft, and again when a stored draft is loaded for authoring,
// so MCP tools and the copy editor always see the current schema.
// Provenance folds generativeAssistance into the two-axis record, drops the
// legacy block when provenance is present, and may fill/normalize a parseable
// lesson byline from L1. Lesson Markdown that used the two-character sequence
// \n instead of real line breaks is decoded the same way. Storage is not
// rewritten on read. JSON-LD is interchange-only and is never what gets persisted,
// but a draft saved before that was enforced may still be stored raw JSON-LD
// (see jsonLdShapedDocumentAsSimplified below) -- that gets converted on the
// same read pass, same "not rewritten until an explicit save" rule.
// Category ids are the join key puzzles store. Legacy title references are
// still folded to the current display title for the editor on read, while
// successful saves canonicalize them to ids.
import { createPuzzleSkeleton } from "./puzzleSkeleton.js";
import {
  isJsonLdShaped,
  puzzleFromAuthoredDocument
} from "./simplifiedPuzzleSchema.js";
import { puzzleFromJsonLd } from "./puzzleJsonLd.js";
import { puzzleForCanonicalPublication } from "./puzzleSimplified.js";
import { withDecodedLearningMarkdown } from "./learningIntroduction.js";
import { canonicalizeDocumentProvenance } from "./authoringProvenance.js";
import { canonicalizeDocumentInfoLinks, hoistDocumentCitations } from "./termInfo.js";
import {
  CATEGORIES,
  canonicalizePuzzleCategoryReferences,
  categoryTitleFor
} from "../puzzles/categories.js";

export { createPuzzleSkeleton };

// Read-compatibility path for a draft stored before save_puzzle_draft
// started rejecting JSON-LD input (docs/MCP-REMOTE.md). Converts through
// the same interchange functions content:import/export use, so it's the
// one existing, tested route from JSON-LD to simplified shape rather than
// a bespoke second one. Falls through to the untouched input on a profile
// error so a genuinely malformed document still surfaces its own error
// downstream instead of a confusing one from this conversion attempt.
function jsonLdShapedDocumentAsSimplified(document, categoryRegistry = CATEGORIES) {
  if (!isJsonLdShaped(document)) return document;
  try {
    // Canonicalize the runtime puzzle before converting it to simplified
    // form.  Converting first would discard fields that only live on the
    // interchange shape (notably nested learning-introduction citations)
    // before hoistDocumentCitations can move them to puzzle info.
    const puzzle = puzzleFromJsonLd(document);
    const simplified = puzzleForCanonicalPublication(puzzle, {
      categoryRegistry: categoryRegistry || CATEGORIES
    }).simplified;
    if (!categoryRegistry) {
      // A registry is optional on the read/editor projection. Preserve the
      // source's category spelling when no live registry was supplied; the
      // explicit storage path always passes one and canonicalizes to ids.
      simplified.category = puzzle.category;
      if (puzzle.categories) simplified.categories = [...puzzle.categories];
      if (puzzle.subcategories) simplified.subcategories = structuredClone(puzzle.subcategories);
    }
    return simplified;
  } catch {
    return document;
  }
}

// Link/citation folding + provenance sync. Order: provenance first so a
// parseable credit can seed human contributors before other folds clone.
export function canonicalizeAuthoredDocumentFields(document) {
  return hoistDocumentCitations(
    canonicalizeDocumentInfoLinks(
      canonicalizeDocumentProvenance(document)
    )
  );
}

// Category references are the one schema migration that changes values, not
// just field names.  Keep it separate from documentForEditor: editors show
// category titles, but every successful draft/publication write passes
// through this canonical id conversion.
export function canonicalizeAuthoredCategoryReferences(
  document,
  { categoryRegistry = CATEGORIES } = {}
) {
  return canonicalizePuzzleCategoryReferences(document, categoryRegistry);
}

// Shape/cardinality gate only. Incomplete-but-simplified documents stay
// writable (`document: null` plus errors); JSON-LD is the same shape so a
// caller that falls back to `normalization.document ?? document` still
// needs documentForDraftStore to avoid persisting `@context`.
export function normalizeAuthoredDocument(document, options = {}) {
  const canonical = canonicalizeAuthoredCategoryReferences(document, options);
  const { puzzle, errors } = puzzleFromAuthoredDocument(canonical, options);
  return { document: puzzle ? canonical : null, errors };
}

// previousTitle -> currentTitle for every rename the merged registry
// records. A previous title that is also some category's *current* title
// is never an alias (the live title wins), so a reused name can't be
// silently rewritten to the category that used to hold it.
export function categoryTitleAliases(categoryRegistry) {
  const aliases = new Map();
  if (!categoryRegistry || typeof categoryRegistry !== "object") return aliases;
  const current = new Set(Object.keys(categoryRegistry).map(title => title.trim()));
  const conflicts = new Set();
  for (const [title, meta] of Object.entries(categoryRegistry)) {
    for (const previous of meta?.previousTitles || []) {
      const normalizedPrevious = typeof previous === "string" ? previous.trim() : "";
      if (!normalizedPrevious) continue;
      if (normalizedPrevious === title.trim() || current.has(normalizedPrevious)) continue;
      if (conflicts.has(normalizedPrevious)) continue;
      const existing = aliases.get(normalizedPrevious);
      if (existing && existing !== title) {
        aliases.delete(normalizedPrevious);
        conflicts.add(normalizedPrevious);
        continue;
      }
      aliases.set(normalizedPrevious, title);
    }
  }
  return aliases;
}

export function categoryTitleAliasConflicts(categoryRegistry) {
  const conflicts = new Map();
  if (!categoryRegistry || typeof categoryRegistry !== "object") return conflicts;
  const current = new Set(Object.keys(categoryRegistry).map(title => title.trim()));
  for (const [title, meta] of Object.entries(categoryRegistry)) {
    for (const previous of meta?.previousTitles || []) {
      const normalizedPrevious = typeof previous === "string" ? previous.trim() : "";
      if (!normalizedPrevious || current.has(normalizedPrevious)) continue;
      const targets = conflicts.get(normalizedPrevious) || new Set();
      targets.add(title);
      conflicts.set(normalizedPrevious, targets);
    }
  }
  for (const [previous, targets] of conflicts) {
    if (targets.size < 2) conflicts.delete(previous);
  }
  return conflicts;
}

// Rewrites `category`, `categories[]`, and `subcategories` keys that name a
// category by a retired title to that category's current title. Pure; the
// stored draft is untouched until an explicit save, like every other fold
// here. Returns the input object itself when nothing referenced a retired
// title, so callers can cheaply detect "no rename applied".
export function canonicalizePuzzleCategoryTitles(document, categoryRegistry) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return document;
  const aliases = categoryTitleAliases(categoryRegistry);
  if (!aliases.size) return document;
  const rename = name => {
    if (typeof name !== "string") return name;
    return aliases.get(name) || aliases.get(name.trim()) || name;
  };
  let changed = false;
  const next = { ...document };
  if (typeof document.category === "string" && rename(document.category) !== document.category) {
    next.category = rename(document.category);
    changed = true;
  }
  if (Array.isArray(document.categories)) {
    const renamed = [...new Set(document.categories.map(rename))];
    if (JSON.stringify(renamed) !== JSON.stringify(document.categories)) {
      next.categories = renamed;
      changed = true;
    }
  }
  const subcategories = document.subcategories;
  if (subcategories && typeof subcategories === "object" && !Array.isArray(subcategories)) {
    if (Object.keys(subcategories).some(key => rename(key) !== key)) {
      const rekeyed = {};
      for (const [key, value] of Object.entries(subcategories)) {
        const target = rename(key);
        // A puzzle that cites both the old and the new title keeps the
        // current title's subcategory assignment.
        if (target !== key && Object.hasOwn(subcategories, target)) continue;
        rekeyed[target] = value;
      }
      if (JSON.stringify(rekeyed) !== JSON.stringify(subcategories)) {
        next.subcategories = rekeyed;
        changed = true;
      }
    }
  }
  return changed ? next : document;
}

// Unlike canonicalizePuzzleCategoryTitles, this answers only whether a
// retired title was actually present.  A document can need canonical
// cleanup for another reason (for example duplicate current category
// strings); that must not be reported as a rename-specific storage flag.
export function documentHasRetiredCategoryTitle(document, categoryRegistry) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return false;
  const aliases = categoryTitleAliases(categoryRegistry);
  if (!aliases.size) return false;
  const rename = name => (
    typeof name === "string"
      ? aliases.get(name) || aliases.get(name.trim()) || name
      : name
  );
  if (typeof document.category === "string" && rename(document.category) !== document.category) return true;
  if (Array.isArray(document.categories) && document.categories.some(name => rename(name) !== name)) {
    return true;
  }
  const subcategories = document.subcategories;
  return !!(subcategories && typeof subcategories === "object" && !Array.isArray(subcategories)
    && Object.keys(subcategories).some(name => rename(name) !== name));
}

function displayPuzzleCategoryTitles(document, categoryRegistry) {
  const folded = canonicalizePuzzleCategoryTitles(document, categoryRegistry);
  if (!folded || !categoryRegistry) return folded;
  const next = { ...folded };
  if (typeof folded.category === "string") {
    next.category = categoryTitleFor(folded.category, categoryRegistry) ?? folded.category;
  }
  if (Array.isArray(folded.categories)) {
    next.categories = [...new Set(folded.categories
      .map(value => categoryTitleFor(value, categoryRegistry) ?? value))];
  }
  if (folded.subcategories && typeof folded.subcategories === "object" && !Array.isArray(folded.subcategories)) {
    next.subcategories = Object.fromEntries(Object.entries(folded.subcategories).map(([key, value]) => [
      categoryTitleFor(key, categoryRegistry) ?? key, value
    ]));
  }
  return next;
}

/**
 * @param {any} document
 * @param {{ categoryRegistry?: Record<string, any> | null }} options
 */
export function documentForEditor(document, { categoryRegistry = null } = {}) {
  const folded = withDecodedLearningMarkdown(
    canonicalizeAuthoredDocumentFields(
      jsonLdShapedDocumentAsSimplified(document, categoryRegistry)
    )
  );
  return categoryRegistry ? displayPuzzleCategoryTitles(folded, categoryRegistry) : folded;
}

// MCP authors receive the simplified content shape, not renderer bookkeeping.
// The board-layout flag is derived again on every storage/publication boundary
// and is intentionally omitted from reads so clients make decisions from the
// lesson content and the single 25-node hard limit.
export function documentForMcp(document, options = {}) {
  const authored = documentForEditor(document, options);
  if (!authored || typeof authored !== "object" || Array.isArray(authored)) {
    return authored;
  }
  const result = { ...authored };
  delete result.large;
  return result;
}

// Storage/publication boundary: editors work with display titles, but draft
// and published documents persist stable category ids. Keeping this as a
// named helper makes it difficult for a new write path to accidentally store
// the read projection again.
/**
 * @param {any} document
 * @param {{ categoryRegistry?: Record<string, any> | null }} [options]
 */
export function documentForStorage(document, { categoryRegistry = CATEGORIES } = {}) {
  const registry = categoryRegistry || CATEGORIES;
  return canonicalizeAuthoredCategoryReferences(
    documentForEditor(document, { categoryRegistry: registry }),
    { categoryRegistry: registry }
  );
}

/**
 * @param {any} draft
 * @param {{ categoryRegistry?: Record<string, any> | null }} options
 */
export function draftForAuthoring(draft, options = {}) {
  if (!draft || typeof draft !== "object") return draft;
  return { ...draft, document: documentForEditor(draft.document, options) };
}

export function draftForMcp(draft, options = {}) {
  if (!draft || typeof draft !== "object") return draft;
  return { ...draft, document: documentForMcp(draft.document, options) };
}

export const SAVE_TO_CANONICALIZE_FLAG_ID = "save-to-canonicalize";

const SAVE_TO_CANONICALIZE_FLAG = Object.freeze({
  id: SAVE_TO_CANONICALIZE_FLAG_ID,
  message:
    "This stored draft still uses leftover link, citation, or provenance fields. Save it to persist the current schema (`links`, puzzle-level citations only, two-axis provenance). The folded form is already what authoring tools show; storage does not change until you save."
});

const SAVE_RENAMED_CATEGORIES_FLAG = Object.freeze({
  id: SAVE_TO_CANONICALIZE_FLAG_ID,
  message:
    "This stored draft still cites a category by a retired title (the category has since been renamed). Authoring tools already show the current title; save to persist it. Storage does not change until you save."
});

const SAVE_JSONLD_TO_CANONICALIZE_FLAG = Object.freeze({
  id: SAVE_TO_CANONICALIZE_FLAG_ID,
  message:
    "This stored draft is legacy JSON-LD interchange data. Save canonical form to rewrite it as the simplified authoring format used by Board and Play."
});

function withStableProvenanceKeyOrder(document) {
  const provenance = document?.provenance;
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    return document;
  }
  const { collaboration, contributors, reasoning, switch: switchId, reviewedBy } = provenance;
  return {
    ...document,
    provenance: {
      ...(collaboration !== undefined ? { collaboration } : {}),
      ...(contributors !== undefined ? { contributors } : {}),
      ...(reasoning !== undefined ? { reasoning } : {}),
      ...(switchId !== undefined ? { switch: switchId } : {}),
      ...(reviewedBy !== undefined ? { reviewedBy } : {})
    }
  };
}

export function storedDocumentNeedsCanonicalSave(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return false;
  }
  if (isJsonLdShaped(document)) return true;
  try {
    // Field folding only. Lesson Markdown newline decoding is a separate
    // ingest repair and must not raise this flag. Provenance key order alone
    // (collaboration before contributors, then optional client settings
    // and reviewedBy) is not a storage mismatch.
    const folded = canonicalizeAuthoredDocumentFields(document);
    return JSON.stringify(folded) !== JSON.stringify(withStableProvenanceKeyOrder(document));
  } catch {
    return false;
  }
}

export function storedDocumentCitesRenamedCategory(document, categoryRegistry) {
  try {
    return documentHasRetiredCategoryTitle(document, categoryRegistry);
  } catch {
    return false;
  }
}

/**
 * @param {any} storedDocument
 * @param {any} validation
 * @param {{ categoryRegistry?: Record<string, any> | null }} options
 */
export function withStorageCanonicalizeFlags(storedDocument, validation, {
  categoryRegistry = null
} = {}) {
  const flags = Array.isArray(validation?.flags) ? [...validation.flags] : [];
  if (storedDocumentNeedsCanonicalSave(storedDocument)) {
    flags.push({
      ...(isJsonLdShaped(storedDocument)
        ? SAVE_JSONLD_TO_CANONICALIZE_FLAG
        : SAVE_TO_CANONICALIZE_FLAG)
    });
  } else if (storedDocumentCitesRenamedCategory(storedDocument, categoryRegistry)) {
    flags.push({ ...SAVE_RENAMED_CATEGORIES_FLAG });
  }
  return { ...validation, flags };
}

/**
 * @param {any} supplied
 * @param {(() => any) | null | undefined} createSkeleton
 * @param {{ categoryRegistry?: Record<string, any> | null }} options
 */
export function documentForDraftStore(supplied, createSkeleton, { categoryRegistry = null } = {}) {
  if (!supplied) {
    const skeleton = documentForEditor(createSkeleton(), { categoryRegistry });
    return {
      document: canonicalizeAuthoredCategoryReferences(skeleton, {
        categoryRegistry: categoryRegistry || CATEGORIES
      }),
      normalization: null
    };
  }
  const normalization = normalizeAuthoredDocument(supplied, { categoryRegistry: categoryRegistry || CATEGORIES });
  if (isJsonLdShaped(supplied)) {
    return { document: null, normalization };
  }
  const folded = documentForEditor(normalization.document ?? supplied, { categoryRegistry });
  return {
    document: canonicalizeAuthoredCategoryReferences(folded, {
      categoryRegistry: categoryRegistry || CATEGORIES
    }),
    normalization
  };
}
