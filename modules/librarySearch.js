import {
  categoriesForPuzzle,
  subcategoryById,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import { libraryCatalogues } from "./catalogueRegistry.js";

// Library search matching. Pure: no DOM. overviewRenderer.js is the only
// player-facing caller; tests/library-search-engine.mjs covers the cases
// below without a browser.
//
// Query is normalized once at the public API (trim + lowercase). An empty
// query matches nothing here -- the Library screen treats empty as "show
// the normal catalogue list" rather than "match everything", so these
// helpers refuse to turn "" into a universal hit (every string includes
// the empty string).

export const PUZZLE_MATCH = {
  TITLE: 0,
  CATEGORY: 1,
  TAG: 2,
  SUBCATEGORY: 3,
  TERM: 4,
  NONE: Infinity
};

const CATALOGUE_MATCH = {
  TITLE: 0,
  INFO: 1,
  NONE: Infinity
};

function normalizeQuery(rawQuery) {
  return String(rawQuery ?? "").trim().toLowerCase();
}

function containsQuery(value, query) {
  return typeof value === "string" && value.toLowerCase().includes(query);
}

function catalogueInfoText(catalogue) {
  const info = catalogue?.info;
  if (typeof info === "string") return info;
  return typeof info?.text === "string" ? info.text : "";
}

function subcategoryMatchesQuery(puzzle, query) {
  return categoriesForPuzzle(puzzle).some(category => {
    const id = subcategoryIdForPuzzle(puzzle, category);
    if (!id) return false;
    if (containsQuery(id, query) || containsQuery(id.replaceAll("-", " "), query)) {
      return true;
    }
    return containsQuery(subcategoryById(category, id)?.title, query);
  });
}

function boardTermMatchesQuery(puzzle, query) {
  for (const cluster of puzzle.clusters || []) {
    if (containsQuery(cluster.name, query)) return true;
    if ((cluster.terms || []).some(term => containsQuery(term, query))) return true;
  }
  return (puzzle.bridges || []).some(bridge => containsQuery(bridge.term, query));
}

export function puzzleMatchRank(puzzle, rawQuery) {
  const query = normalizeQuery(rawQuery);
  if (!query) return PUZZLE_MATCH.NONE;
  if (containsQuery(puzzle.title, query)) return PUZZLE_MATCH.TITLE;
  if (categoriesForPuzzle(puzzle).some(name => containsQuery(name, query))) {
    return PUZZLE_MATCH.CATEGORY;
  }
  if ((puzzle.tags || []).some(tag => containsQuery(tag, query))) {
    return PUZZLE_MATCH.TAG;
  }
  if (subcategoryMatchesQuery(puzzle, query)) return PUZZLE_MATCH.SUBCATEGORY;
  if (boardTermMatchesQuery(puzzle, query)) return PUZZLE_MATCH.TERM;
  return PUZZLE_MATCH.NONE;
}

export function puzzleMatchesQuery(puzzle, rawQuery) {
  return puzzleMatchRank(puzzle, rawQuery) !== PUZZLE_MATCH.NONE;
}

export function rankedPuzzleMatches(puzzles, rawQuery) {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];
  return puzzles
    .map((puzzle, index) => ({ puzzle, index, rank: puzzleMatchRank(puzzle, query) }))
    .filter(item => item.rank !== PUZZLE_MATCH.NONE)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(item => item.puzzle);
}

export function catalogueMatchRank(catalogue, rawQuery) {
  const query = normalizeQuery(rawQuery);
  if (!query) return CATALOGUE_MATCH.NONE;
  if (containsQuery(catalogue.title, query)) return CATALOGUE_MATCH.TITLE;
  if (containsQuery(catalogueInfoText(catalogue), query)) return CATALOGUE_MATCH.INFO;
  return CATALOGUE_MATCH.NONE;
}

export function catalogueMatchesQuery(catalogue, rawQuery) {
  return catalogueMatchRank(catalogue, rawQuery) !== CATALOGUE_MATCH.NONE;
}

// Library's visible catalogues (All/New/levels + top-level authored), then
// any authored catalogue suppressed from that list for being nested under
// a meta parent. Nested catalogues stay reachable by search even when they
// don't get a top-level Library card (see CATALOGUES.md).
export function searchableCatalogues(puzzles, catalogues) {
  const byId = new Map();
  for (const catalogue of libraryCatalogues(puzzles, catalogues)) {
    byId.set(catalogue.id, catalogue);
  }
  for (const catalogue of catalogues) {
    if (!byId.has(catalogue.id)) byId.set(catalogue.id, catalogue);
  }
  return [...byId.values()];
}

export function matchingCatalogues(puzzles, catalogues, rawQuery) {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];
  return searchableCatalogues(puzzles, catalogues)
    .map((catalogue, index) => ({
      catalogue,
      index,
      rank: catalogueMatchRank(catalogue, query)
    }))
    .filter(item => item.rank !== CATALOGUE_MATCH.NONE)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(item => item.catalogue);
}
