// Canvas size is derived from node count. Authors and agents omit `large`;
// convert/save persist it, and play uses the same count rather than the
// authored flag. 16 is the standard canvas, 24 is the one-board ceiling.

export const NODE_CAP_STANDARD = 16;
export const NODE_CAP_LARGE = 24;

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
