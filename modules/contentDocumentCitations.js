import {
  categoriesForPuzzle,
  slugify,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";

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

export function puzzlesCitingCategory(puzzles, category) {
  const title = typeof category?.title === "string" ? category.title : "";
  const id = typeof category?.id === "string" ? category.id : "";
  return (puzzles || []).filter(puzzle => {
    const names = categoriesForPuzzle(puzzle);
    return names.some(name =>
      name === title || (id && (name === id || slugify(name) === id))
    );
  });
}

export function puzzlesCitingSubcategory(puzzles, categoryTitle, subcategoryId) {
  return (puzzles || []).filter(puzzle =>
    subcategoryIdForPuzzle(puzzle, categoryTitle) === subcategoryId
  );
}

export function assertCategoryUnused(puzzles, category) {
  const citing = puzzlesCitingCategory(puzzles, category);
  if (!citing.length) return;
  const sample = citingIds(citing).slice(0, 8).join(", ");
  throw new ContentCitationError(
    `Cannot withdraw ${category?.id || category?.title}: live puzzles still cite it (${sample}).`
  );
}

export function assertCategoryTitleChangeAllowed(puzzles, {
  id,
  previousTitle,
  nextTitle
} = {}) {
  const from = String(previousTitle || "").trim();
  const to = String(nextTitle || "").trim();
  if (!from || from === to) return;
  const citing = puzzlesCitingCategory(puzzles, { id, title: from });
  if (!citing.length) return;
  const sample = citingIds(citing).slice(0, 8).join(", ");
  throw new ContentCitationError(
    `Cannot rename "${from}" to "${to}": live puzzles still cite the current title (${sample}). Update those puzzles' category, categories, and subcategories keys first, then rename. See AUTHORING-REFERENCE.md (Rewording a category name).`
  );
}

export function assertSubcategoryUnused(puzzles, categoryTitle, subcategoryId) {
  const citing = puzzlesCitingSubcategory(puzzles, categoryTitle, subcategoryId);
  if (!citing.length) return;
  const sample = citingIds(citing).slice(0, 8).join(", ");
  throw new ContentCitationError(
    `Cannot remove subcategory ${subcategoryId}: live puzzles still cite it (${sample}).`
  );
}
