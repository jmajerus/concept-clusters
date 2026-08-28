// Category-scoped puzzle discovery for authoring MCP. Reuses library search
// ranking (title, terms, tags, optional full text) so agents can check
// coverage before opening a gap-fill draft.

import { categoriesForPuzzle } from "../puzzles/categories.js";
import { categorySummary } from "./categoryDiscovery.js";
import {
  PUZZLE_MATCH,
  parseLibraryQuery,
  puzzleMatchFields,
  puzzleMatchRank
} from "./librarySearch.js";

const MATCH_KIND = Object.freeze({
  [PUZZLE_MATCH.TITLE]: "title",
  [PUZZLE_MATCH.CATEGORY]: "category",
  [PUZZLE_MATCH.TAG]: "tag",
  [PUZZLE_MATCH.CITATION]: "citation",
  [PUZZLE_MATCH.SUBCATEGORY]: "subcategory",
  [PUZZLE_MATCH.TERM]: "term",
  [PUZZLE_MATCH.FULLTEXT]: "fulltext"
});

function containsQuery(value, query) {
  return typeof value === "string" && value.toLowerCase().includes(query);
}

function filterPuzzles(puzzles, { category = null, catalogueId = null, catalogues = [] } = {}) {
  let members = puzzles;
  if (catalogueId && catalogueId !== "all") {
    const catalogue = catalogues.find(item => item.id === catalogueId);
    if (!catalogue) throw new Error(`Unknown catalogue: ${catalogueId}`);
    const ids = new Set(catalogue.entries.map(entry => entry.id));
    members = members.filter(puzzle => ids.has(puzzle.id));
  }
  if (category) {
    members = members.filter(puzzle =>
      puzzle.category === category || puzzle.categories?.includes(category)
    );
  }
  return members;
}

function matchingBoardTerm(puzzle, query) {
  for (const cluster of puzzle.clusters || []) {
    if (containsQuery(cluster.name, query)) {
      return { kind: "cluster", value: cluster.name };
    }
    for (const term of cluster.terms || []) {
      if (containsQuery(term, query)) return { kind: "term", value: term };
    }
    for (const seed of cluster.seeds || []) {
      if (containsQuery(seed, query)) return { kind: "seed", value: seed };
    }
  }
  for (const bridge of puzzle.bridges || []) {
    if (containsQuery(bridge.term, query)) {
      return { kind: "bridge", value: bridge.term };
    }
  }
  return null;
}

function matchDetail(puzzle, rawQuery, rank, options) {
  const { query } = parseLibraryQuery(rawQuery, options);
  if (!query) return null;

  switch (rank) {
    case PUZZLE_MATCH.TITLE:
      return { field: "title", value: puzzle.title };
    case PUZZLE_MATCH.CATEGORY: {
      const hit = categoriesForPuzzle(puzzle).find(name => containsQuery(name, query));
      return hit ? { field: "category", value: hit } : null;
    }
    case PUZZLE_MATCH.TAG: {
      const hit = (puzzle.tags || []).find(tag => containsQuery(tag, query));
      return hit ? { field: "tag", value: hit } : null;
    }
    case PUZZLE_MATCH.SUBCATEGORY: {
      for (const category of categoriesForPuzzle(puzzle)) {
        const id = puzzle.subcategories?.[category];
        if (id && (containsQuery(id, query) || containsQuery(id.replaceAll("-", " "), query))) {
          return { field: "subcategory", value: `${category}: ${id}` };
        }
      }
      return null;
    }
    case PUZZLE_MATCH.TERM: {
      const hit = matchingBoardTerm(puzzle, query);
      return hit ? { field: hit.kind, value: hit.value } : null;
    }
    case PUZZLE_MATCH.FULLTEXT: {
      const fields = puzzleMatchFields(puzzle, rawQuery, options);
      const first = fields[0];
      return first ? { field: first.path, value: first.snippet } : null;
    }
    case PUZZLE_MATCH.CITATION:
      return { field: "citation", value: query };
    default:
      return null;
  }
}

/**
 * Search published puzzles for overlap before gap-fill authoring.
 * Prefer category (or catalogue_id) so results stay teachable-neighbor sized.
 */
export function searchAuthoringPuzzles(
  puzzles,
  categories,
  {
    query,
    category = null,
    catalogueId = null,
    catalogues = [],
    fullText = false,
    limit = 10
  } = {}
) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (!trimmed) {
    return { query: "", category: category || null, catalogue_id: catalogueId || null, matches: [] };
  }
  if (category) categorySummary(puzzles, categories, category);

  const options = { allowFullText: !!fullText };
  const members = filterPuzzles(puzzles, { category, catalogueId, catalogues });
  const ranked = members
    .map((puzzle, index) => {
      const rank = puzzleMatchRank(puzzle, trimmed, options);
      return rank === PUZZLE_MATCH.NONE
        ? null
        : {
          puzzle,
          index,
          rank,
          match: MATCH_KIND[rank],
          detail: matchDetail(puzzle, trimmed, rank, options)
        };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, Math.max(1, Math.min(limit, 25)));

  return {
    query: trimmed,
    category: category || null,
    catalogue_id: catalogueId || null,
    full_text: !!fullText,
    matches: ranked.map(({ puzzle, match, detail }) => ({
      id: puzzle.id,
      title: puzzle.title,
      category: puzzle.category,
      ...(puzzle.categories ? { categories: [...puzzle.categories] } : {}),
      match,
      ...(detail ? { detail } : {})
    }))
  };
}
