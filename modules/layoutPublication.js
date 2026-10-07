// Shared publication-time validation for presentation layout overrides.
// Layouts are stored alongside, but outside, the authored puzzle document.

import { LAYOUT_MODES, normalizeLayoutDocument } from "./layoutDocument.js";
import { validateCircleLayoutDocument } from "./circleLayoutSchema.js";
import { validateGraphLayoutDocument } from "./graphLayoutSchema.js";
import { layoutIsFixed, validateLayoutHintShape } from "./layoutHints.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

// Modes whose engines can use a saved layout as a hint (layoutHints.js).
const HINT_MODES = new Set(["graph", "sets"]);

/**
 * A layout carried along with a content edit is checked leniently: a fixed
 * Graph or Circle layout the edit has outdated is still accepted, because
 * players get it as a hint, and `warnings` say why. `savingMode` names the
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
      warnings: []
    };
  }
  const layouts = [
    ...LAYOUT_MODES.map(mode => [mode, normalized?.modes?.[mode] || null])
  ].filter(([, value]) => value);
  if (!layouts.length) return { valid: true, errors: [], warnings: [] };

  const { puzzle, errors } = puzzleFromAuthoredDocument(document, {
    categoryRegistry
  });
  if (!puzzle) return { valid: false, errors, warnings: [] };
  const validators = {
    star: value => validateStarLayoutDocument(value, puzzle),
    graph: value => validateGraphLayoutDocument(value, puzzle),
    sets: value => validateCircleLayoutDocument(value, puzzle)
  };
  const validationErrors = [];
  const warnings = [];
  layouts.forEach(([mode, value]) => {
    const prefix = message => `${mode}: ${message}`;
    if (!HINT_MODES.has(mode)) {
      const result = validators[mode](value);
      if (!result.valid) validationErrors.push(...result.errors.map(prefix));
      return;
    }
    const shape = validateLayoutHintShape(mode, value, puzzle);
    if (!shape.valid) {
      validationErrors.push(...shape.errors.map(prefix));
      return;
    }
    if (!layoutIsFixed(value)) return;
    const exact = validators[mode](value);
    if (exact.valid) return;
    if (mode === savingMode) {
      validationErrors.push(...exact.errors.map(prefix));
    } else {
      warnings.push(...exact.errors.map(error => prefix(`${error} (players get it as a hint)`)));
    }
  });
  return { valid: validationErrors.length === 0, errors: validationErrors, warnings };
}
