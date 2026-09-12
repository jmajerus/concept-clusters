// Plan the one-time migration from display-title category references to
// stable category ids.  Category documents retain their title as display
// metadata; only puzzle documents change.  The plan is pure so local tools,
// D1 maintenance jobs, and tests all use the same conversion.
import {
  CATEGORIES,
  canonicalizePuzzleCategoryReferences
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

export function planCategoryReferenceMigration({
  registry = CATEGORIES,
  rows = []
} = {}) {
  const conflicts = aliasConflicts(registry);
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
    const ambiguous = referenceValues(document)
      .filter(value => conflicts.has(value.trim()));
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
