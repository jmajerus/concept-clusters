import { CATALOGUES } from "../catalogues/index.js";
import { categorySlugFor } from "../puzzles/categories.js";

export const ALL_PUZZLES_CATALOGUE_ID = "all";

export function allPuzzlesCatalogue(puzzles) {
  return {
    id: ALL_PUZZLES_CATALOGUE_ID,
    title: "All Puzzles",
    info: {
      text: "The complete Concept Clusters collection, organized by subject."
    },
    entries: puzzles.map(puzzle => ({ id: puzzle.id }))
  };
}

export function catalogueById(id, puzzles, catalogues = CATALOGUES) {
  if (id === ALL_PUZZLES_CATALOGUE_ID) return allPuzzlesCatalogue(puzzles);
  return catalogues.find(catalogue => catalogue.id === id) || null;
}

export function libraryCatalogues(puzzles, catalogues = CATALOGUES) {
  return [allPuzzlesCatalogue(puzzles), ...catalogues];
}

export function puzzlesForCatalogue(catalogue, puzzles) {
  if (!catalogue) return [];
  if (catalogue.id === ALL_PUZZLES_CATALOGUE_ID) return [...puzzles];
  const puzzleById = new Map(puzzles.map(puzzle => [puzzle.id, puzzle]));
  return catalogue.entries.flatMap(entry => {
    const puzzle = puzzleById.get(entry.id);
    return puzzle ? [puzzle] : [];
  });
}

export function catalogueContainsPuzzle(catalogue, puzzleOrId, puzzles) {
  const id = typeof puzzleOrId === "string" ? puzzleOrId : puzzleOrId?.id;
  return !!id && puzzlesForCatalogue(catalogue, puzzles).some(puzzle => puzzle.id === id);
}

export function categoriesForCatalogue(catalogue, puzzles) {
  return [...new Set(puzzlesForCatalogue(catalogue, puzzles).map(puzzle => puzzle.category))];
}

export function puzzlesForCatalogueCategory(catalogue, category, puzzles) {
  return puzzlesForCatalogue(catalogue, puzzles)
    .filter(puzzle => puzzle.category === category);
}

export function resolveCategory(value, puzzles) {
  if (!value) return null;
  const names = [...new Set(puzzles.map(puzzle => puzzle.category))];
  return names.find(name => categorySlugFor(name) === value)
    || names.find(name => name === value)
    || null;
}

export function entriesForPuzzles(catalogue, puzzles) {
  const reasons = new Map((catalogue?.entries || []).map(entry => [entry.id, entry.reason]));
  return puzzles.map(puzzle => ({
    id: puzzle.id,
    ...(reasons.get(puzzle.id) ? { reason: reasons.get(puzzle.id) } : {})
  }));
}

export function catalogueProgress(catalogue, puzzles, isComplete) {
  const members = puzzlesForCatalogue(catalogue, puzzles);
  return {
    completed: members.filter(puzzle => isComplete(puzzle)).length,
    total: members.length
  };
}
