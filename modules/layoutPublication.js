// Shared publication-time validation for presentation layout overrides.
// Layouts are stored alongside, but outside, the authored puzzle document.

import { LAYOUT_MODES, boardSettingsErrors, normalizeLayoutDocument } from "./layoutDocument.js";
import { canonicalBoardSizeFactor } from "./puzzleBoardSize.js";
import { validateCircleLayoutDocument } from "./circleLayoutSchema.js";
import { validateGraphLayoutDocument } from "./graphLayoutSchema.js";
import { layoutIsFixed, validateLayoutHintShape } from "./layoutHints.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

// Modes whose layouts can be marked as hints rather than fixed positions.
// Star layouts are always fixed, but like the others are adapted rather
// than dropped once an edit outdates them (layoutHints.js).
const HINT_MODES = new Set(["graph", "sets"]);

/**
 * A layout carried along with a content edit is checked leniently: a fixed
 * layout the edit has outdated is still accepted, because players get it
 * as a hint (Graph, Circle) or adapted (Star); `warnings` say why and
 * `fallbackModes` lists those modes so the author can be told. `savingMode` names the
 * mode an author is saving right now; a fixed layout for that mode must
 * match the puzzle exactly, and a hint only needs a usable shape.
 */
export function validatePublishedPuzzleLayout({
  document,
  layout,
  categoryRegistry = undefined,
  savingMode = null
} = {}) {
  const normalized = normalizeLayoutDocument(layout);
  const unsupportedModes = Object.keys(normalized?.modes || {})
    .filter(mode => !LAYOUT_MODES.includes(mode));
  if (unsupportedModes.length) {
    return {
      valid: false,
      errors: unsupportedModes.map(mode => `Unsupported layout mode "${mode}"`),
      warnings: [],
      fallbackModes: []
    };
  }
  const boardErrors = boardSettingsErrors(normalized?.board, canonicalBoardSizeFactor)
    .map(error => `board: ${error}`);
  if (boardErrors.length) {
    return { valid: false, errors: boardErrors, warnings: [], fallbackModes: [] };
  }
  const layouts = [
    ...LAYOUT_MODES.map(mode => [mode, normalized?.modes?.[mode] || null])
  ].filter(([, value]) => value);
  if (!layouts.length) return { valid: true, errors: [], warnings: [], fallbackModes: [] };

  const { puzzle, errors } = puzzleFromAuthoredDocument(document, {
    categoryRegistry
  });
  if (!puzzle) return { valid: false, errors, warnings: [], fallbackModes: [] };
  const validators = {
    star: value => validateStarLayoutDocument(value, puzzle),
    graph: value => validateGraphLayoutDocument(value, puzzle),
    sets: value => validateCircleLayoutDocument(value, puzzle)
  };
  const validationErrors = [];
  const warnings = [];
  const fallbackModes = [];
  layouts.forEach(([mode, value]) => {
    const prefix = message => `${mode}: ${message}`;
    const shape = validateLayoutHintShape(mode, value, puzzle);
    if (!shape.valid) {
      validationErrors.push(...shape.errors.map(prefix));
      return;
    }
    if (HINT_MODES.has(mode) && !layoutIsFixed(value)) return;
    const exact = validators[mode](value);
    if (exact.valid) return;
    if (mode === savingMode) {
      validationErrors.push(...exact.errors.map(prefix));
    } else {
      const fallback = HINT_MODES.has(mode) ? "players get it as a hint" : "players get it adapted to the edit";
      warnings.push(...exact.errors.map(error => prefix(`${error} (${fallback})`)));
      fallbackModes.push(mode);
    }
  });
  return { valid: validationErrors.length === 0, errors: validationErrors, warnings, fallbackModes };
}
