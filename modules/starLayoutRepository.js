import { pillWidth } from "./puzzleGraph.js";
import { layoutForMode } from "./layoutDocument.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

export function publishedStarLayoutFor(puzzle, width, height) {
  const layout = layoutForMode(puzzle?.layout, "star") || puzzle?.starLayout;
  if (!layout) return null;
  const result = validateStarLayoutDocument(layout, puzzle, { width, height });
  if (result.valid) return layout;
  return null;
}

// Editorial boolean on puzzle.board. true forces the strip, false keeps the
// classic Star board, and an omitted field keeps the capacity heuristic.
export function starFreeStripEnabled(puzzle, { width, height } = {}) {
  const flag = puzzle?.board?.starFreeStrip;
  if (flag === true) return true;
  if (flag === false) return false;
  return starFreeStripCapacityNeeded(puzzle, width, height);
}

// Editorial boolean on puzzle.board. true starts every bridge connected.
// Omitted or false leaves bridges for the player.
export function starBridgePreconnectEnabled(puzzle) {
  return puzzle?.board?.bridgePreconnect === true;
}

// The strip owns the top of the board, so connected seeds start beside
// their titles. Classic Star leaves seeds to the force simulation.
export function starSeedBesideTitleEnabled(puzzle, options = {}) {
  return starFreeStripEnabled(puzzle, options);
}

// Next administration object after one flag changes. `undefined` omits the
// flag. An empty result means the document should drop `board`.
export function boardWithFlag(puzzle, key, value) {
  const board = { ...(puzzle?.board && typeof puzzle.board === "object" ? puzzle.board : {}) };
  if (value === true || value === false) board[key] = value;
  else delete board[key];
  return Object.keys(board).length ? board : undefined;
}

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
// Pre-connected bridges are already on the board, so they are not free.
export function starColdStartFreeTermWidths(puzzle) {
  const terms = [];
  puzzle.clusters.forEach(cluster => {
    cluster.terms.forEach(term => {
      if (!cluster.seeds.includes(term)) terms.push(term);
    });
  });
  if (!starBridgePreconnectEnabled(puzzle)) {
    puzzle.bridges.forEach(bridge => terms.push(bridge.term));
  }
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
