// Canvas size is derived from node count. Authors and agents omit `large`;
// convert/save persist it, and play uses the same count rather than the
// authored flag. 16 is the standard canvas, 25 is the one-board ceiling
// (experimentally raised from 24).

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
