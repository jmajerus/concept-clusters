import { STAR_LAYOUTS } from "../puzzles/layouts/star/index.js";
import { STAR_FREE_STRIP } from "../puzzles/layouts/star/free-strip.js";
import { pillWidth } from "./puzzleGraph.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

export function repositoryStarLayoutFor(puzzle, width, height) {
  const layout = STAR_LAYOUTS[puzzle.id];
  if (!layout) return null;
  const result = validateStarLayoutDocument(layout, puzzle, { width, height });
  return result.valid ? layout : null;
}

// Editorial boolean: when true, Star opens with a Circle-style free-term
// strip. Absent / false keeps classic unless cold-start free terms would
// need a deep multi-row strip (see starFreeStripCapacityNeeded).
// localStorage overrides (set from &admin) win for local experimentation.
export function repositoryStarFreeStrip(puzzle) {
  return STAR_FREE_STRIP[puzzle.id] === true;
}

export const STAR_FREE_STRIP_STORAGE_KEY = "ccStarFreeStripOverrides";

// Match starRenderer strip packing constants so the heuristic and the
// live strip agree on pill spacing.
export const STAR_FREE_STRIP_GAP = 10;
export const STAR_FREE_STRIP_MARGIN = 12;
export const STAR_FREE_STRIP_PILL_H = 30;
// Auto-on only when packing would need at least this many top-strip rows.
// Kept as a dial: 3 is a small step past the old "neither top nor left"
// gate (~2 puzzles); lowering to 2 later would widen further without a
// hand-curated id list.
export const STAR_FREE_STRIP_MIN_AUTO_ROWS = 3;

function wordHash(word) {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) | 0;
  return h;
}

// Cold-start free terms: non-seed cluster members plus every bridge.
export function starColdStartFreeTermWidths(puzzle) {
  const terms = [];
  puzzle.clusters.forEach(cluster => {
    cluster.terms.forEach(term => {
      if (!cluster.seeds.includes(term)) terms.push(term);
    });
  });
  puzzle.bridges.forEach(bridge => terms.push(bridge.term));
  terms.sort((a, b) => wordHash(a) - wordHash(b) || a.localeCompare(b));
  return terms.map(pillWidth);
}

function freeTermTopRowCount(widths, width, gap, margin) {
  if (!(width > 0) || widths.length === 0) return 0;
  const inner = width - margin * 2;
  let rowX = 0;
  let rows = 0;
  widths.forEach(termWidth => {
    if (rowX > 0 && rowX + termWidth > inner) rowX = 0;
    if (rowX === 0) rows++;
    rowX += termWidth + gap;
  });
  return rows;
}

// True when free terms would pack into a deep multi-row strip at this
// width — denser openings where classic left-edge parking is already
// cramped and strip reflow/abandon pays for itself.
export function starFreeStripCapacityNeeded(
  puzzle,
  width,
  _height,
  {
    gap = STAR_FREE_STRIP_GAP,
    margin = STAR_FREE_STRIP_MARGIN,
    minRows = STAR_FREE_STRIP_MIN_AUTO_ROWS
  } = {}
) {
  const widths = starColdStartFreeTermWidths(puzzle);
  if (widths.length <= 1) return false;
  return freeTermTopRowCount(widths, width, gap, margin) >= minRows;
}

export function starFreeStripEnabled(puzzle, { width, height } = {}) {
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
  if (repositoryStarFreeStrip(puzzle)) return true;
  return starFreeStripCapacityNeeded(puzzle, width, height);
}

// Local admin try only (no sparse registry yet): place already-connected
// seeds beside their titles on Star cold start. Free-strip mode implies
// this, because the strip owns the top of the board and seeds need a
// sensible play-area start. Default classic Star leaves seeds to force.
export const STAR_SEED_BESIDE_TITLE_STORAGE_KEY = "ccStarSeedBesideTitleOverrides";

export function starSeedBesideTitleEnabled(puzzle, options = {}) {
  if (starFreeStripEnabled(puzzle, options)) return true;
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
