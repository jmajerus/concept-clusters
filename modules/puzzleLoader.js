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

import { puzzleBrowseFromFull } from "./puzzleBrowse.js";

export function createPuzzleLoader(manifest, { loadPuzzle = null } = {}) {
  const entries = Array.isArray(manifest) ? [...manifest] : [];
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

  // Add a fully-formed puzzle after boot, as if the manifest had listed it:
  // an entry with the same browse projection the manifest builder writes,
  // pre-cached so opening it never touches a module. The seam browser tests
  // use to exercise a fixture board without shipping it as a file. Returns
  // the new index (or the existing one for a repeated id).
  function registerPuzzle(puzzle) {
    if (!puzzle || typeof puzzle.id !== "string" || !puzzle.id) {
      throw new Error("registerPuzzle needs a puzzle with an id");
    }
    const existing = idToIndex.get(puzzle.id);
    if (existing !== undefined) {
      cache.set(puzzle.id, puzzle);
      return existing;
    }
    const entry = { id: puzzle.id, module: "(registered at runtime)", browse: puzzleBrowseFromFull(puzzle) };
    const index = entries.push(entry) - 1;
    browsePuzzles.push(entry.browse);
    idToEntry.set(puzzle.id, entry);
    idToIndex.set(puzzle.id, index);
    cache.set(puzzle.id, puzzle);
    return index;
  }

  return {
    entries,
    browsePuzzles,
    loadPuzzleById,
    loadPuzzleAtIndex,
    getLoadedPuzzle,
    puzzleIndexForId,
    registerPuzzle
  };
}
