// Lazy puzzle loading for the player: manifest metadata at boot, full modules
// on demand. One broken module must not take down the corpus.

export class PuzzleLoadError extends Error {
  constructor(id, modulePath, cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Could not load puzzle "${id}" from ${modulePath}: ${detail}`);
    this.name = "PuzzleLoadError";
    this.puzzleId = id;
    this.modulePath = modulePath;
    this.cause = cause;
  }
}

function moduleUrl(modulePath) {
  const normalized = String(modulePath).replace(/^\.\//, "");
  return new URL(`../puzzles/${normalized}`, import.meta.url);
}

export function createPuzzleLoader(manifest, { loadPuzzle = null } = {}) {
  const entries = Array.isArray(manifest) ? manifest : [];
  const cache = new Map();
  const browsePuzzles = entries.map(entry => entry.browse);
  const idToEntry = new Map(entries.map(entry => [entry.id, entry]));
  const idToIndex = new Map(entries.map((entry, index) => [entry.id, index]));

  async function loadPuzzleFromModule(entry) {
    const mod = await import(moduleUrl(entry.module));
    let puzzle = mod.default;
    if (!puzzle || typeof puzzle !== "object") {
      throw new Error("module default export is not a puzzle object");
    }
    if (entry.patch && typeof entry.patch === "object") {
      puzzle = { ...puzzle, ...entry.patch };
    }
    return puzzle;
  }

  async function loadPuzzleById(id) {
    if (cache.has(id)) return cache.get(id);
    const entry = idToEntry.get(id);
    if (!entry) {
      throw new PuzzleLoadError(id, "(unknown)", new Error("Puzzle is not in the manifest"));
    }
    try {
      const puzzle = loadPuzzle
        ? await loadPuzzle(entry)
        : await loadPuzzleFromModule(entry);
      if (!puzzle || typeof puzzle !== "object") {
        throw new Error("loader did not return a puzzle object");
      }
      cache.set(id, puzzle);
      return puzzle;
    } catch (error) {
      throw new PuzzleLoadError(id, entry.module, error);
    }
  }

  async function loadPuzzleAtIndex(index) {
    const entry = entries[index];
    if (!entry) {
      throw new Error(`Invalid puzzle index: ${index}`);
    }
    return loadPuzzleById(entry.id);
  }

  function getLoadedPuzzle(id) {
    return cache.get(id) || null;
  }

  function puzzleIndexForId(id) {
    const index = idToIndex.get(id);
    return index === undefined ? -1 : index;
  }

  return {
    entries,
    browsePuzzles,
    loadPuzzleById,
    loadPuzzleAtIndex,
    getLoadedPuzzle,
    puzzleIndexForId
  };
}
