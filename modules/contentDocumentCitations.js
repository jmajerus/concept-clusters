import {
  categoriesForPuzzle,
  slugify,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import { categoryTitleAliases } from "./authoredPuzzleDocument.js";

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
  const aliases = categoryTitleAliases(categoryRegistry);
  return (puzzles || []).filter(puzzle => {
    const names = categoriesForPuzzle(puzzle);
    return names.some(name =>
      name === title
      || aliases.get(name) === title
      || (id && (name === id || slugify(name) === id))
    );
  });
}

export function puzzlesCitingSubcategory(
  puzzles,
  categoryTitle,
  subcategoryId,
  { categoryRegistry = null } = {}
) {
  const aliases = categoryTitleAliases(categoryRegistry);
  const titles = new Set([categoryTitle]);
  for (const [previous, current] of aliases) {
    if (current === categoryTitle) titles.add(previous);
  }
  return (puzzles || []).filter(puzzle =>
    [...titles].some(title => subcategoryIdForPuzzle(puzzle, title) === subcategoryId)
  );
}

export function assertCategoryUnused(puzzles, category, options = {}) {
  const citing = puzzlesCitingCategory(puzzles, category, options);
  if (!citing.length) return;
  const sample = citingIds(citing).slice(0, 8).join(", ");
  throw new ContentCitationError(
    `Cannot withdraw ${category?.id || category?.title}: live puzzles still cite it (${sample}).`
  );
}

// Renaming a category is deliberately not guarded here: the category
// records its old title under previousTitles and citing puzzles fold
// forward to the new title on their next load (authoredPuzzleDocument.js).
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
