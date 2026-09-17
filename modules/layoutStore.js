// Browser-local workspace drafts for any renderer mode.
// These are deliberately separate from the D1 layout document: local drafts
// are revision- and board-specific scratch work, never publication state.

import { layoutRevision } from "./layoutDocument.js";

const PREFIX = "ccLayoutDraft:v1";
const LEGACY_STAR_PREFIX = "ccStarLayoutDraft:v1";

export function layoutDraftKey(puzzle, mode, width, height) {
  return `${PREFIX}:${mode}:${puzzle.id}:${layoutRevision(puzzle)}:${width}x${height}`;
}

function draftKeys(puzzle, mode, width, height) {
  const current = layoutDraftKey(puzzle, mode, width, height);
  return mode === "star"
    ? [current, `${LEGACY_STAR_PREFIX}:${puzzle.id}:${layoutRevision(puzzle)}:${width}x${height}`]
    : [current];
}

function validationFor(validate, layout, options) {
  if (typeof validate !== "function") return { valid: true, errors: [] };
  return validate(layout, options) || { valid: false, errors: ["layout validator returned no result"] };
}

export function loadLayoutDraft(
  storage,
  puzzle,
  mode,
  width,
  height,
  { validate } = {}
) {
  try {
    const raw = draftKeys(puzzle, mode, width, height)
      .map(key => storage.getItem(key))
      .find(value => value);
    if (!raw) return null;
    const layout = JSON.parse(raw);
    return validationFor(validate, layout, {
      purpose: "authoring",
      allowUnsafe: true,
      width,
      height
    }).valid ? layout : null;
  } catch {
    return null;
  }
}

export function saveLayoutDraft(
  storage,
  layout,
  puzzle,
  mode,
  width,
  height,
  { validate } = {}
) {
  const result = validationFor(validate, layout, {
    purpose: "authoring",
    allowUnsafe: true,
    width,
    height
  });
  if (!result.valid) return result;
  try {
    storage.setItem(
      layoutDraftKey(puzzle, mode, width, height),
      JSON.stringify(layout)
    );
    return result;
  } catch {
    return { valid: false, errors: ["local draft could not be saved"] };
  }
}

export function clearLayoutDraft(storage, puzzle, mode, width, height) {
  try {
    draftKeys(puzzle, mode, width, height)
      .forEach(key => storage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}
