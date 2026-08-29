// Browse/search projection of a puzzle — enough for Library, catalogues,
// and structured search without loading cluster/bridge gameplay bodies.

import { derivedLarge, puzzleNodeCount } from "./puzzleBoardSize.js";

function citationList(info) {
  return Array.isArray(info?.citations) ? info.citations : [];
}

export function puzzleSearchTerms(puzzle) {
  const terms = [];
  for (const cluster of puzzle.clusters || []) {
    if (cluster.name) terms.push(cluster.name);
    for (const term of cluster.terms || []) terms.push(term);
  }
  for (const bridge of puzzle.bridges || []) {
    if (bridge.term) terms.push(bridge.term);
  }
  return terms;
}

export function puzzleBrowseFromFull(puzzle) {
  const intro = puzzle.learningIntroduction;
  return {
    id: puzzle.id,
    title: puzzle.title,
    category: puzzle.category,
    categories: puzzle.categories,
    tags: puzzle.tags,
    subcategories: puzzle.subcategories,
    level: puzzle.level,
    large: derivedLarge(puzzleNodeCount(puzzle)),
    lensMode: puzzle.lensMode,
    preSolve: puzzle.preSolve,
    relatedPuzzles: puzzle.relatedPuzzles,
    info: puzzle.info,
    learningIntroduction: intro
      ? {
        requirement: intro.requirement,
        citations: citationList(intro)
      }
      : undefined,
    _searchTerms: puzzleSearchTerms(puzzle)
  };
}
