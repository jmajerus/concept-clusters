import { starLayoutRevision } from "./starLayoutSchema.js";
import { normalizedLensMode } from "./lensEngine.js";

export const PLAYER_SESSION_SCHEMA_VERSION = 1;
export const PLAYER_SESSION_MODES = ["graph", "star", "sets"];

const PREFIX = `ccPlayerSession:v${PLAYER_SESSION_SCHEMA_VERSION}`;

export function playerSessionKey(puzzle) {
  return `${PREFIX}:${puzzle.id}`;
}

// Coordinate artifacts remain reusable when only teaching copy changes,
// but a saved in-progress lens must never attach to a revised answer set.
// Preserve the historical revision for puzzles without lenses; append a
// small deterministic lens fingerprint only where that state exists.
function playerSessionRevision(puzzle) {
  const layoutRevision = starLayoutRevision(puzzle);
  if (!puzzle.lenses?.length) return layoutRevision;
  let hash = 0x811c9dc5;
  const lensStateRevision = puzzle.lensMode === "assignment"
    ? { lensMode: puzzle.lensMode, lenses: puzzle.lenses }
    : puzzle.lenses;
  for (const char of JSON.stringify(lensStateRevision)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${layoutRevision}:lenses:${hash.toString(16).padStart(8, "0")}`;
}

function validMove(move) {
  return move &&
    typeof move === "object" &&
    typeof move.source === "string" &&
    typeof move.target === "string";
}

const PLAYER_LENS_PHASES = new Set([
  "lens-preparing",
  "lens-selecting",
  "lens-revealed",
  "lens-assigning",
  "complete"
]);

function validLensSession(lens, puzzle) {
  if (lens == null) return true;
  const nodeWords = new Set([
    ...puzzle.clusters.flatMap(cluster => cluster.terms),
    ...puzzle.bridges.map(bridge => bridge.term)
  ]);
  if (!puzzle.lenses?.length || !lens || typeof lens !== "object" || Array.isArray(lens)) {
    return false;
  }
  if (normalizedLensMode(puzzle) === "assignment") {
    const lensIds = new Set(puzzle.lenses.map(item => item.id));
    const assignmentWords = new Set(puzzle.lenses.flatMap(item => item.targets));
    return ["lens-preparing", "lens-assigning", "complete"].includes(lens.phase) &&
      Array.isArray(lens.assignments) &&
      lens.assignments.every(entry =>
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "string" &&
        assignmentWords.has(entry[0]) &&
        typeof entry[1] === "string" &&
        lensIds.has(entry[1])
      ) &&
      new Set(lens.assignments.map(entry => entry[0])).size === lens.assignments.length;
  }
  return (
    lens &&
    Number.isInteger(lens.index) &&
    lens.index >= 0 &&
    lens.index < puzzle.lenses.length &&
    PLAYER_LENS_PHASES.has(lens.phase) &&
    Array.isArray(lens.selections) &&
    new Set(lens.selections).size === lens.selections.length &&
    lens.selections.every(word => typeof word === "string" && nodeWords.has(word))
  );
}

export function loadPlayerSession(storage, puzzle) {
  try {
    const raw = storage.getItem(playerSessionKey(puzzle));
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session?.schemaVersion !== PLAYER_SESSION_SCHEMA_VERSION ||
        session.puzzleId !== puzzle.id ||
        session.puzzleRevision !== playerSessionRevision(puzzle) ||
        !PLAYER_SESSION_MODES.includes(session.currentMode) ||
        !Array.isArray(session.moves) ||
        !session.moves.every(validMove) ||
        !session.layouts ||
        typeof session.layouts !== "object" ||
        Array.isArray(session.layouts) ||
        !validLensSession(session.lens, puzzle)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function savePlayerSession(storage, puzzle, {
  currentMode,
  moves = [],
  layouts = {},
  completed = false,
  lens = null
}) {
  if (!PLAYER_SESSION_MODES.includes(currentMode) ||
      !Array.isArray(moves) ||
      !moves.every(validMove) ||
      !layouts ||
      typeof layouts !== "object" ||
      Array.isArray(layouts) ||
      !validLensSession(lens, puzzle)) {
    return false;
  }
  const session = {
    schemaVersion: PLAYER_SESSION_SCHEMA_VERSION,
    puzzleId: puzzle.id,
    puzzleRevision: playerSessionRevision(puzzle),
    updatedAt: new Date().toISOString(),
    currentMode,
    moves,
    layouts,
    completed: !!completed,
    lens
  };
  try {
    storage.setItem(playerSessionKey(puzzle), JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearPlayerSession(storage, puzzle) {
  try {
    storage.removeItem(playerSessionKey(puzzle));
    return true;
  } catch {
    return false;
  }
}
