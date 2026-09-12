import {
  categoryIdFor,
  categoriesForPuzzle,
  puzzleBelongsToCategory,
  slugify
} from "../puzzles/categories.js";
import {
  categoryTitleAliasConflicts,
  categoryTitleAliases
} from "./authoredPuzzleDocument.js";

export class ContentCitationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ContentCitationError";
    this.status = 400;
  }
}

function citingIds(puzzles) {
  return puzzles.map(puzzle => puzzle?.id).filter(Boolean);
}

export function puzzlesCitingCategory(puzzles, category, { categoryRegistry = null } = {}) {
  const title = typeof category?.title === "string" ? category.title : "";
  const id = typeof category?.id === "string" ? category.id : "";
  if (id || title) {
    const registry = categoryRegistry || undefined;
    return (puzzles || []).filter(puzzle =>
      puzzleBelongsToCategory(puzzle, id || title, registry)
    );
  }
  const aliases = categoryTitleAliases(categoryRegistry);
  const conflicts = categoryTitleAliasConflicts(categoryRegistry);
  return (puzzles || []).filter(puzzle => {
    const names = categoriesForPuzzle(puzzle);
    return names.some(name => {
      const normalized = typeof name === "string" ? name.trim() : name;
      return normalized === title
        || aliases.get(normalized) === title
        || conflicts.get(normalized)?.has(title)
        || (id && (normalized === id || slugify(normalized) === id));
    });
  });
}

function categoryTitleCandidates(categoryTitle, categoryRegistry) {
  const titles = new Set([categoryTitle]);
  const aliases = categoryTitleAliases(categoryRegistry);
  for (const [previous, current] of aliases) {
    if (current === categoryTitle) titles.add(previous);
  }
  // A conflicted retired title is conservatively considered a citation of
  // every candidate category until the ambiguity is resolved.
  const conflicts = categoryTitleAliasConflicts(categoryRegistry);
  for (const [previous, targets] of conflicts) {
    if (targets.has(categoryTitle)) titles.add(previous);
  }
  return titles;
}

export function puzzlesCitingSubcategory(
  puzzles,
  categoryTitle,
  subcategoryId,
  { categoryRegistry = null } = {}
) {
  const titles = categoryTitleCandidates(categoryTitle, categoryRegistry);
  const categoryId = categoryIdFor(categoryTitle, categoryRegistry || undefined);
  const wantedId = typeof subcategoryId === "string" ? subcategoryId.trim() : "";
  return (puzzles || []).filter(puzzle => {
    const subcategories = puzzle?.subcategories;
    if (!subcategories || typeof subcategories !== "object" || Array.isArray(subcategories)) {
      return false;
    }
    return Object.entries(subcategories).some(([title, id]) => {
      const normalizedTitle = typeof title === "string" ? title.trim() : title;
      const normalizedId = typeof id === "string" ? id.trim() : "";
      return wantedId && normalizedId === wantedId
        && (categoryIdFor(title, categoryRegistry || undefined) === categoryId
          || titles.has(title) || titles.has(normalizedTitle));
    });
  });
}

export function assertCategoryUnused(puzzles, category, options = {}) {
  const citing = puzzlesCitingCategory(puzzles, category, options);
  if (!citing.length) return;
  const sample = citingIds(citing).slice(0, 8).join(", ");
  throw new ContentCitationError(
    `Cannot withdraw ${category?.id || category?.title}: live puzzles still cite it (${sample}).`
  );
}

// Renaming a category is deliberately not guarded here: the category id is
// stable, and previousTitles only serves legacy read compatibility.
// Only withdraw and subcategory-id removal stay blocked -- those have no
// history to resolve through.

export function assertSubcategoryUnused(puzzles, categoryTitle, subcategoryId, options = {}) {
  const citing = puzzlesCitingSubcategory(puzzles, categoryTitle, subcategoryId, options);
  if (!citing.length) return;
  const sample = citingIds(citing).slice(0, 8).join(", ");
  throw new ContentCitationError(
    `Cannot remove subcategory ${subcategoryId}: live puzzles still cite it (${sample}).`
  );
}
