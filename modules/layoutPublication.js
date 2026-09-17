// Shared publication-time validation for presentation layout overrides.
// Layouts are stored alongside, but outside, the authored puzzle document.

import { layoutForMode } from "./layoutDocument.js";
import { validateCircleLayoutDocument } from "./circleLayoutSchema.js";
import { validateGraphLayoutDocument } from "./graphLayoutSchema.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

export function validatePublishedPuzzleLayout({
  document,
  layout,
  categoryRegistry = undefined
} = {}) {
  const layouts = [
    ["star", layoutForMode(layout, "star")],
    ["graph", layoutForMode(layout, "graph")],
    ["sets", layoutForMode(layout, "sets")]
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
