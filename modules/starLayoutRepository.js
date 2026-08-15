import { STAR_LAYOUTS } from "../puzzles/layouts/star/index.js";
import { STAR_FREE_STRIP } from "../puzzles/layouts/star/free-strip.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

export function repositoryStarLayoutFor(puzzle, width, height) {
  const layout = STAR_LAYOUTS[puzzle.id];
  if (!layout) return null;
  const result = validateStarLayoutDocument(layout, puzzle, { width, height });
  return result.valid ? layout : null;
}

// Editorial boolean: when true, Star opens with a Circle-style free-term
// strip. Absent / false keeps classic cold start.
// localStorage overrides (set from &admin) win for local experimentation.
export function repositoryStarFreeStrip(puzzle) {
  return STAR_FREE_STRIP[puzzle.id] === true;
}

export const STAR_FREE_STRIP_STORAGE_KEY = "ccStarFreeStripOverrides";

export function starFreeStripEnabled(puzzle) {
  if (typeof localStorage !== "undefined") {
    try {
      const overrides = JSON.parse(localStorage.getItem(STAR_FREE_STRIP_STORAGE_KEY) || "{}");
      if (Object.prototype.hasOwnProperty.call(overrides, puzzle.id)) {
        return overrides[puzzle.id] === true;
      }
    } catch {
      // Fall through.
    }
  }
  return repositoryStarFreeStrip(puzzle);
}

// Local admin try only (no sparse registry yet): place already-connected
// seeds beside their titles on Star cold start. Free-strip mode implies
// this, because the strip owns the top of the board and seeds need a
// sensible play-area start. Default classic Star leaves seeds to force.
export const STAR_SEED_BESIDE_TITLE_STORAGE_KEY = "ccStarSeedBesideTitleOverrides";

export function starSeedBesideTitleEnabled(puzzle) {
  if (starFreeStripEnabled(puzzle)) return true;
  if (typeof localStorage !== "undefined") {
    try {
      const overrides = JSON.parse(
        localStorage.getItem(STAR_SEED_BESIDE_TITLE_STORAGE_KEY) || "{}"
      );
      if (Object.prototype.hasOwnProperty.call(overrides, puzzle.id)) {
        return overrides[puzzle.id] === true;
      }
    } catch {
      // Default off.
    }
  }
  return false;
}

export { STAR_LAYOUTS, STAR_FREE_STRIP };
