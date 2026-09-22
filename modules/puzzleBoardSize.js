// Layout is derived from node count and play mode. Authors and agents omit
// renderer flags; conversion/save may retain the legacy `large` field for
// runtime compatibility, and play derives the same choice from the count.
// The one-board ceiling is 25 nodes (experimentally raised from 24).

export const NODE_CAP_STANDARD = 16;
export const NODE_CAP_LARGE = 25;

export function puzzleNodeCount(puzzle) {
  if (!Array.isArray(puzzle?.clusters) || !Array.isArray(puzzle?.bridges)) {
    return 0;
  }
  return puzzle.clusters.reduce(
    (sum, cluster) => sum + (Array.isArray(cluster?.terms) ? cluster.terms.length : 0),
    0
  ) + puzzle.bridges.length;
}

export function derivedLarge(nodeCount) {
  return nodeCount > NODE_CAP_STANDARD;
}

export function largeField(nodeCount) {
  return derivedLarge(nodeCount) ? { large: true } : {};
}

// ViewBox units, not CSS pixels. The board is width:100% of its container,
// so a taller viewBox is a taller page and a longer reach to the lens
// controls under it. Compact puzzles stay on the short canvas. Crowded
// ones — many nodes, or several clusters whose links can cross — take a
// wider canvas, and Circle's densest boards take the extra-tall one.
export const BOARD_CANVAS = {
  compact: { width: 640, height: 420 },
  standard: { width: 640, height: 460 },
  wide: { width: 960, height: 620 },
  circleWide: { width: 1050, height: 780 }
};

const COMPACT_NODE_CAP = 8;

export function boardCanvas(puzzle, mode) {
  const nodes = puzzleNodeCount(puzzle);
  const clusters = Array.isArray(puzzle?.clusters) ? puzzle.clusters.length : 0;
  if (nodes > 0 && nodes <= COMPACT_NODE_CAP) return BOARD_CANVAS.compact;
  if (derivedLarge(nodes)) {
    return mode === "sets" ? BOARD_CANVAS.circleWide : BOARD_CANVAS.wide;
  }
  // Two or more clusters can cross. Star and Circle need the margin for
  // that; Graph's pills still fit the standard canvas until the large tier.
  if (mode !== "graph" && clusters >= 2) return BOARD_CANVAS.wide;
  return BOARD_CANVAS.standard;
}
