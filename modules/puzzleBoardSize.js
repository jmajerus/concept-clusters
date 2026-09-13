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
