import { starLayoutRevision } from "./starLayoutSchema.js";

export const PLAYER_SESSION_SCHEMA_VERSION = 1;
export const PLAYER_SESSION_MODES = ["graph", "star", "sets"];

const PREFIX = `ccPlayerSession:v${PLAYER_SESSION_SCHEMA_VERSION}`;

export function playerSessionKey(puzzle) {
  return `${PREFIX}:${puzzle.id}`;
}

function validMove(move) {
  return move &&
    typeof move === "object" &&
    typeof move.source === "string" &&
    typeof move.target === "string";
}

export function loadPlayerSession(storage, puzzle) {
  try {
    const raw = storage.getItem(playerSessionKey(puzzle));
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session?.schemaVersion !== PLAYER_SESSION_SCHEMA_VERSION ||
        session.puzzleId !== puzzle.id ||
        session.puzzleRevision !== starLayoutRevision(puzzle) ||
        !PLAYER_SESSION_MODES.includes(session.currentMode) ||
        !Array.isArray(session.moves) ||
        !session.moves.every(validMove) ||
        !session.layouts ||
        typeof session.layouts !== "object" ||
        Array.isArray(session.layouts)) {
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
  completed = false
}) {
  if (!PLAYER_SESSION_MODES.includes(currentMode) ||
      !Array.isArray(moves) ||
      !moves.every(validMove) ||
      !layouts ||
      typeof layouts !== "object" ||
      Array.isArray(layouts)) {
    return false;
  }
  const session = {
    schemaVersion: PLAYER_SESSION_SCHEMA_VERSION,
    puzzleId: puzzle.id,
    puzzleRevision: starLayoutRevision(puzzle),
    updatedAt: new Date().toISOString(),
    currentMode,
    moves,
    layouts,
    completed: !!completed
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
