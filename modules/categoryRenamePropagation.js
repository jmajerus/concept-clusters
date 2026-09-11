// Corpus-wide category rename normalization.  The live category registry's
// current title is authoritative; previousTitles are read-only aliases used
// to fold old puzzle references forward.  This module is deliberately pure so
// the same plan can be previewed against D1, Git seed files, and tests before
// a caller chooses to persist it.
import {
  canonicalizePuzzleCategoryTitles,
  categoryTitleAliasConflicts,
  categoryTitleAliases
} from "./authoredPuzzleDocument.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function canonicalizeCategoryDocument(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return document;
  const previousTitles = Array.isArray(document.previousTitles)
    ? [...new Set(document.previousTitles
      .filter(title => typeof title === "string")
      .map(title => title.trim())
      .filter(Boolean)
      .filter(title => title !== document.title))]
    : [];
  const next = { ...document };
  if (previousTitles.length) next.previousTitles = previousTitles;
  else delete next.previousTitles;
  return sameJson(next, document) ? document : next;
}

export function canonicalizeCorpusDocument({ kind, document, categoryRegistry = null } = {}) {
  if (kind === "puzzle") {
    return canonicalizePuzzleCategoryTitles(document, categoryRegistry);
  }
  if (kind === "category") {
    return canonicalizeCategoryDocument(document);
  }
  return document;
}

function documentCategoryNames(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return [];
  return [
    ...(typeof document.category === "string" ? [document.category] : []),
    ...(Array.isArray(document.categories) ? document.categories : []),
    ...(document.subcategories && typeof document.subcategories === "object" && !Array.isArray(document.subcategories)
      ? Object.keys(document.subcategories)
      : [])
  ].filter(name => typeof name === "string").map(name => name.trim());
}

function unresolvedAliases(document, conflicts) {
  if (!conflicts.size) return [];
  const names = new Set(documentCategoryNames(document));
  return [...conflicts.keys()].filter(name => names.has(name));
}

export function planCategoryRenamePropagation({ registry = {}, rows = [] } = {}) {
  const aliases = categoryTitleAliases(registry);
  const conflicts = categoryTitleAliasConflicts(registry);
  const changes = [];
  const unresolved = [];
  for (const row of rows) {
    const document = row?.document;
    if (!document || typeof document !== "object" || Array.isArray(document)) {
      unresolved.push({
        source: row?.source || "unknown",
        kind: row?.kind || "unknown",
        id: row?.id || null,
        reason: "document is not a JSON object"
      });
      continue;
    }
    const ambiguous = unresolvedAliases(document, conflicts);
    if (ambiguous.length) {
      unresolved.push({
        source: row?.source || "unknown",
        kind: row?.kind || "unknown",
        id: row?.id || document.id || null,
        reason: "category alias maps to more than one current title",
        titles: ambiguous
      });
      continue;
    }
    const next = canonicalizeCorpusDocument({
      kind: row?.kind,
      document,
      categoryRegistry: registry
    });
    if (!sameJson(next, document)) {
      changes.push({
        ...row,
        id: row?.id || document.id || null,
        before: clone(document),
        after: clone(next),
        aliases: [...aliases.entries()]
      });
    }
  }
  return {
    aliases: [...aliases.entries()].map(([previous, current]) => ({ previous, current })),
    conflicts: [...conflicts.entries()].map(([previous, targets]) => ({
      previous,
      targets: [...targets]
    })),
    changes,
    unresolved
  };
}
