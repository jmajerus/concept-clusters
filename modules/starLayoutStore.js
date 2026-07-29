import {
  starLayoutRevision,
  validateStarLayoutDocument
} from "./starLayoutSchema.js";

const PREFIX = "ccStarLayoutDraft:v1";

export function starLayoutDraftKey(puzzle, width, height) {
  return `${PREFIX}:${puzzle.id}:${starLayoutRevision(puzzle)}:${width}x${height}`;
}

export function loadStarLayoutDraft(storage, puzzle, width, height) {
  try {
    const raw = storage.getItem(starLayoutDraftKey(puzzle, width, height));
    if (!raw) return null;
    const layout = JSON.parse(raw);
    const result = validateStarLayoutDocument(
      layout,
      puzzle,
      { width, height },
      { allowUnsafe: true }
    );
    return result.valid ? layout : null;
  } catch {
    return null;
  }
}

export function saveStarLayoutDraft(storage, layout, puzzle, width, height) {
  const result = validateStarLayoutDocument(
    layout,
    puzzle,
    { width, height },
    { allowUnsafe: true }
  );
  if (!result.valid) return result;
  try {
    storage.setItem(starLayoutDraftKey(puzzle, width, height), JSON.stringify(layout));
    return result;
  } catch {
    return { valid: false, errors: ["local draft could not be saved"] };
  }
}

export function clearStarLayoutDraft(storage, puzzle, width, height) {
  try {
    storage.removeItem(starLayoutDraftKey(puzzle, width, height));
    return true;
  } catch {
    return false;
  }
}
