// Browse/search projection of a puzzle — enough for Library, catalogues,
// and structured search. It is intentionally not a gameplay contract;
// boards always arrive through a puzzle loader.

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

// Simplified documents store seeds/floatingTerms; runtime puzzles store
// `terms`. Browse/search only needs the union so Library can rank without
// compiling the full board.
export function puzzleBrowseFromDocument(document, { includeProse = false } = {}) {
  const clusters = (document?.clusters || []).map(cluster => ({
    ...cluster,
    terms: Array.isArray(cluster.terms) && cluster.terms.length
      ? cluster.terms
      : [...(cluster.seeds || []), ...(cluster.floatingTerms || [])]
  }));
  const withTerms = {
    ...document,
    clusters,
    bridges: document?.bridges || []
  };
  const browse = puzzleBrowseFromFull(withTerms);
  if (!includeProse) return browse;
  return {
    ...browse,
    clusters,
    bridges: withTerms.bridges,
    ...(document?.lenses ? { lenses: document.lenses } : {}),
    ...(document?.learningIntroduction
      ? { learningIntroduction: document.learningIntroduction }
      : {}),
    // Preserve authoring-search and attribution inputs. The lesson component
    // derives its byline from provenance (with generativeAssistance as the
    // legacy fallback); gameplay still loads the compiled puzzle separately.
    ...(document?.provenance ? { provenance: document.provenance } : {}),
    ...(document?.generativeAssistance
      ? { generativeAssistance: document.generativeAssistance }
      : {})
  };
}
