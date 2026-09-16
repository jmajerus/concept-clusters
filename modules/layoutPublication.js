// Shared publication-time validation for presentation layout overrides.
// Layouts are stored alongside, but outside, the authored puzzle document.

import { layoutForMode } from "./layoutDocument.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

export function validatePublishedPuzzleLayout({
  document,
  layout,
  categoryRegistry = undefined
} = {}) {
  const starLayout = layoutForMode(layout, "star");
  if (!starLayout) return { valid: true, errors: [] };

  const { puzzle, errors } = puzzleFromAuthoredDocument(document, {
    categoryRegistry
  });
  if (!puzzle) return { valid: false, errors };
  return validateStarLayoutDocument(starLayout, puzzle);
}
