// Shared publication-time validation for presentation layout overrides.
// Layouts are stored alongside, but outside, the authored puzzle document.

import { LAYOUT_MODES, normalizeLayoutDocument } from "./layoutDocument.js";
import { validateCircleLayoutDocument } from "./circleLayoutSchema.js";
import { validateGraphLayoutDocument } from "./graphLayoutSchema.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

export function validatePublishedPuzzleLayout({
  document,
  layout,
  categoryRegistry = undefined
} = {}) {
  const normalized = normalizeLayoutDocument(layout);
  const unsupportedModes = Object.keys(normalized?.modes || {})
    .filter(mode => !LAYOUT_MODES.includes(mode));
  if (unsupportedModes.length) {
    return {
      valid: false,
      errors: unsupportedModes.map(mode => `Unsupported layout mode "${mode}"`)
    };
  }
  const layouts = [
    ...LAYOUT_MODES.map(mode => [mode, normalized?.modes?.[mode] || null])
  ].filter(([, value]) => value);
  if (!layouts.length) return { valid: true, errors: [] };

  const { puzzle, errors } = puzzleFromAuthoredDocument(document, {
    categoryRegistry
  });
  if (!puzzle) return { valid: false, errors };
  const validators = {
    star: value => validateStarLayoutDocument(value, puzzle),
    graph: value => validateGraphLayoutDocument(value, puzzle),
    sets: value => validateCircleLayoutDocument(value, puzzle)
  };
  const validationErrors = layouts.flatMap(([mode, value]) => {
    const result = validators[mode](value);
    return result.valid ? [] : result.errors.map(error => `${mode}: ${error}`);
  });
  return { valid: validationErrors.length === 0, errors: validationErrors };
}
