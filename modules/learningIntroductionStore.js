import { learningIntroductionFingerprint } from "./learningIntroduction.js";

export const LEARNING_INTRODUCTION_SCHEMA_VERSION = 1;
const PREFIX = `ccLearningIntroduction:v${LEARNING_INTRODUCTION_SCHEMA_VERSION}`;
const VALID_STATUSES = new Set(["read", "skipped"]);
const SHOW_FULL_LESSONS_KEY = "ccShowFullLessons";

export function learningIntroductionKey(puzzle) {
  return `${PREFIX}:${puzzle.id}`;
}

function fingerprintFor(puzzle) {
  return learningIntroductionFingerprint(puzzle);
}

export function loadLearningIntroductionStatus(storage, puzzle) {
  try {
    const raw = storage.getItem(learningIntroductionKey(puzzle));
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved?.schemaVersion === LEARNING_INTRODUCTION_SCHEMA_VERSION &&
      saved.puzzleId === puzzle.id &&
      saved.fingerprint === fingerprintFor(puzzle) &&
      VALID_STATUSES.has(saved.status)
      ? saved.status
      : null;
  } catch {
    return null;
  }
}

export function loadShowFullLessons(storage) {
  try {
    return storage.getItem(SHOW_FULL_LESSONS_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveShowFullLessons(storage, enabled) {
  try {
    if (enabled) storage.setItem(SHOW_FULL_LESSONS_KEY, "1");
    else storage.removeItem(SHOW_FULL_LESSONS_KEY);
    return true;
  } catch {
    return false;
  }
}

export function saveLearningIntroductionStatus(storage, puzzle, status) {
  if (!VALID_STATUSES.has(status)) return false;
  try {
    storage.setItem(learningIntroductionKey(puzzle), JSON.stringify({
      schemaVersion: LEARNING_INTRODUCTION_SCHEMA_VERSION,
      puzzleId: puzzle.id,
      fingerprint: fingerprintFor(puzzle),
      status,
      updatedAt: new Date().toISOString()
    }));
    return true;
  } catch {
    return false;
  }
}
