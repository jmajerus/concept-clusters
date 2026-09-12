// Plan the one-time migration from display-title category references to
// stable category ids.  Category documents retain their title as display
// metadata; only puzzle documents change.  The plan is pure so local tools,
// D1 maintenance jobs, and tests all use the same conversion.
import {
  CATEGORIES,
  canonicalizePuzzleCategoryReferences,
  categoryIdFor,
  categoryReferenceKnown
} from "../puzzles/categories.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function referenceValues(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return [];
  return [
    ...(typeof document.category === "string" ? [document.category] : []),
    ...(Array.isArray(document.categories) ? document.categories : []),
    ...(document.subcategories && typeof document.subcategories === "object" && !Array.isArray(document.subcategories)
      ? Object.keys(document.subcategories)
      : [])
  ].filter(value => typeof value === "string" && value.trim());
}

function unknownReferences(document, registry) {
  return [...new Set(referenceValues(document).filter(value => {
    const trimmed = value.trim();
    // A value already equal to its slug-like spelling may be a valid id from
    // a D1-only category that is not present in a Git-only registry. Do not
    // rewrite it by guesswork; reject only values that look like an unmapped
    // display title (or contain surrounding whitespace that would be lost).
    return !categoryReferenceKnown(value, registry)
      && (value !== trimmed || categoryIdFor(value, registry) !== trimmed);
  }))];
}

function aliasConflicts(registry) {
  const current = new Set(Object.keys(registry || {}).map(key => key.trim()));
  const conflicts = new Map();
  for (const [title, metadata] of Object.entries(registry || {})) {
    for (const previous of metadata?.previousTitles || []) {
      if (typeof previous !== "string") continue;
      const alias = previous.trim();
      if (!alias || current.has(alias)) continue;
      const targets = conflicts.get(alias) || new Set();
      targets.add(title);
      conflicts.set(alias, targets);
    }
  }
  return new Map([...conflicts].filter(([, targets]) => targets.size > 1));
}

// Return the category references that cannot be resolved safely from the
// supplied registry.  Keep this check shared by the title-to-id migration and
// the broader content canonicalization pass: both writers must reject an
// unknown display title or an ambiguous retired alias before categoryIdFor()
// gets a chance to fall back to slugification.
export function categoryReferenceIssues(document, registry = CATEGORIES) {
  const conflicts = aliasConflicts(registry);
  const ambiguous = [...new Set(referenceValues(document)
    .filter(value => conflicts.has(value.trim())))];
  const ambiguousTrimmed = new Set(ambiguous.map(value => value.trim()));
  const unknown = unknownReferences(document, registry)
    .filter(value => !ambiguousTrimmed.has(value.trim()));
  return { ambiguous, unknown };
}

export function planCategoryReferenceMigration({
  registry = CATEGORIES,
  rows = []
} = {}) {
  const changes = [];
  const unresolved = [];
  for (const row of rows) {
    if (row?.kind !== "puzzle") continue;
    const document = row?.document;
    if (!document || typeof document !== "object" || Array.isArray(document)) {
      unresolved.push({
        source: row?.source || "unknown",
        kind: "puzzle",
        id: row?.id || null,
        reason: "document is not a JSON object"
      });
      continue;
    }
    const { ambiguous, unknown } = categoryReferenceIssues(document, registry);
    if (ambiguous.length) {
      unresolved.push({
        source: row?.source || "unknown",
        kind: "puzzle",
        id: row?.id || document.id || null,
        reason: "category title alias maps to more than one current category",
        values: [...new Set(ambiguous)]
      });
      continue;
    }
    if (unknown.length) {
      unresolved.push({
        source: row?.source || "unknown",
        kind: "puzzle",
        id: row?.id || document.id || null,
        reason: "category reference is not present in the supplied registry; refusing slug fallback",
        values: unknown
      });
      continue;
    }
    const after = canonicalizePuzzleCategoryReferences(document, registry);
    if (!sameJson(after, document)) {
      changes.push({
        ...row,
        id: row?.id || document.id || null,
        before: clone(document),
        after: clone(after)
      });
    }
  }
  return { changes, unresolved };
}

export function categoryReferencesAreCanonical(document, registry = CATEGORIES) {
  return sameJson(
    canonicalizePuzzleCategoryReferences(document, registry),
    document
  );
}
