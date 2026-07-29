import { STAR_LAYOUTS } from "../puzzles/layouts/star/index.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

export function repositoryStarLayoutFor(puzzle, width, height) {
  const layout = STAR_LAYOUTS[puzzle.id];
  if (!layout) return null;
  const result = validateStarLayoutDocument(layout, puzzle, { width, height });
  return result.valid ? layout : null;
}

export { STAR_LAYOUTS };
