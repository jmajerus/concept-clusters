// Browser boot helper: when the authoring server injects the play-corpus
// meta tag, load Library navigation from `/play/corpus.json` instead of
// git puzzle/catalogue modules.

import { createPuzzleLoader } from "./puzzleLoader.js";

export const PLAY_CORPUS_META_NAME = "cc-play-corpus";

export function playCorpusUrlFromDocument(doc = globalThis.document) {
  const content = doc?.querySelector?.(`meta[name="${PLAY_CORPUS_META_NAME}"]`)
    ?.getAttribute("content");
  return content && content.trim() ? content.trim() : null;
}

export async function loadPublishedPuzzle(entry) {
  const response = await fetch(entry.module, { cache: "no-store" });
  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  if (!response.ok || !body.puzzle) {
    throw new Error(body.error || `HTTP ${response.status}`);
  }
  return body.puzzle;
}

export async function loadPlayCorpus(corpusUrl, { fetchImpl = fetch } = {}) {
  const response = await fetchImpl(corpusUrl, { cache: "no-store" });
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) detail = body.error;
    } catch {
      // Keep the status text when the error page is HTML.
    }
    throw new Error(`Could not load authoring play corpus: ${detail}`);
  }
  const corpus = await response.json();
  if (!Array.isArray(corpus?.puzzles) || !Array.isArray(corpus?.catalogues)) {
    throw new Error("Authoring play corpus is missing puzzles or catalogues");
  }
  return corpus;
}

export function createCorpusPuzzleLoader(corpus) {
  const entries = (corpus.puzzles || []).map(browse => ({
    id: browse.id,
    module: `/play/puzzles/${encodeURIComponent(browse.id)}.json`,
    browse
  }));
  return createPuzzleLoader(entries, { loadPuzzle: loadPublishedPuzzle });
}
