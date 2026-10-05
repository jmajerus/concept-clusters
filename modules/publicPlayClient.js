// Production player: D1 publication metadata chooses the current board, while
// unchanged frozen boards still arrive through their lazy static modules.
import { createPuzzleLoader } from "./puzzleLoader.js";
import { loadPublishedPuzzle } from "./playCorpusClient.js";
import { PUBLIC_PLAY_META_NAME, publicPuzzleUrl } from "./publicPlayRoutes.js";

export function publicPlayIndexUrlFromDocument(doc = globalThis.document) {
  return doc?.querySelector?.(`meta[name="${PUBLIC_PLAY_META_NAME}"]`)
    ?.getAttribute("content") || null;
}

export async function loadPublicPlayIndex(url, { fetchImpl = fetch } = {}) {
  const result = await fetchImpl(url, { cache: "default" });
  if (!result.ok) throw new Error(`Publication index unavailable (HTTP ${result.status})`);
  const index = await result.json();
  if (!Array.isArray(index?.puzzles) || !Array.isArray(index?.catalogues) ||
      !index?.categories || typeof index.categories !== "object") {
    throw new Error("Publication index is incomplete");
  }
  return index;
}

export function createPublicPuzzleLoader(staticManifest, index) {
  const staticById = new Map(staticManifest.map(entry => [entry.id, entry]));
  const staticLoader = createPuzzleLoader(staticManifest);
  const rows = new Map(index.puzzles.map(entry => [entry.id, entry]));
  const orderedIds = [
    ...staticManifest.map(entry => entry.id).filter(id => rows.has(id)),
    ...index.puzzles.map(entry => entry.id).filter(id => !staticById.has(id))
  ];
  const entries = orderedIds.map(id => {
    const published = rows.get(id);
    const frozen = staticById.get(id);
    if (!published.browse && !frozen?.browse) {
      throw new Error(`Publication index has no browse record for ${id}`);
    }
    const useStatic = frozen?.contentFingerprint &&
      frozen.contentFingerprint === published.contentFingerprint &&
      frozen.layoutFingerprint === published.layoutFingerprint;
    return {
      id,
      source: useStatic ? "static" : "d1",
      module: useStatic
        ? frozen.module
        : publicPuzzleUrl(id, published.contentFingerprint, published.layoutFingerprint),
      dateCreated: published.dateCreated,
      dateModified: published.dateModified,
      browse: published.browse || frozen?.browse
    };
  });
  return createPuzzleLoader(entries, {
    loadPuzzle: async entry => {
      if (entry.source !== "static") return loadPublishedPuzzle(entry, { cache: "default" });
      const puzzle = await staticLoader.loadPuzzleById(entry.id);
      // Preserve definePuzzle's non-enumerable module origin for lesson assets.
      if (entry.dateCreated) puzzle.dateCreated = entry.dateCreated;
      if (entry.dateModified) puzzle.dateModified = entry.dateModified;
      return puzzle;
    }
  });
}
