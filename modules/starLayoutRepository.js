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
// strip. Absent / false keeps classic unless the cold-start capacity
// heuristic says free terms fit neither a top row nor a left column.
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

function freeTermsFitTopRow(widths, width, gap, margin) {
  if (!(width > 0) || widths.length === 0) return true;
  const inner = width - margin * 2;
  let rowX = 0;
  let rows = 0;
  widths.forEach(termWidth => {
    if (rowX > 0 && rowX + termWidth > inner) rowX = 0;
    if (rowX === 0) rows++;
    rowX += termWidth + gap;
  });
  return rows <= 1;
}

// Classic force openings often park free terms down the left edge.
function freeTermsFitLeftColumn(count, height, gap, margin, pillH) {
  if (!(height > 0) || count <= 1) return true;
  const slots = Math.floor((height - margin * 2 + gap) / (pillH + gap));
  return count <= Math.max(1, slots);
}

// True only when free terms fit neither one top strip row nor one left
// vertical column — denser than either classic parking lane alone.
export function starFreeStripCapacityNeeded(
  puzzle,
  width,
  height,
  {
    gap = STAR_FREE_STRIP_GAP,
    margin = STAR_FREE_STRIP_MARGIN,
    pillH = STAR_FREE_STRIP_PILL_H
  } = {}
) {
  const widths = starColdStartFreeTermWidths(puzzle);
  if (widths.length <= 1) return false;
  const fitsTop = freeTermsFitTopRow(widths, width, gap, margin);
  const fitsLeft = freeTermsFitLeftColumn(widths.length, height, gap, margin, pillH);
  return !fitsTop && !fitsLeft;
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
