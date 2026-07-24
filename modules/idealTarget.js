// Shared reveal-timing logic for ideal-target highlighting and captions
// across all three display modes (Graph, Star, Circle).
//
// A term earns its ideal-target highlight/caption two ways:
//   1. Dynamically: gameLogic.js's markIdealFor sets node.idealFor at the
//      moment the bridge actually lands on its ideal term.
//   2. Retrospectively: once the cluster is complete (shownClusters) AND the
//      bridge has already been connected to this cluster side (committed
//      choice), static puzzle data reveals which term was ideal — showing
//      this before the bridge connects would be a spoiler; after, it's
//      feedback.
// Both cases return the bridge name(s) in a single array so callers can
// drive both the CSS class and any text caption from one call.

// Returns the names of all bridges for which `node` is (or would have been)
// the ideal landing on this cluster side, under the current reveal conditions.
// Returns [] for bridge nodes (they are never ideal targets themselves).
export function idealBridgeNames(node, puzzle, shownClusters, nodes) {
  if (node.gs.length !== 1) return [];
  const ci = node.gs[0];
  const names = node.idealFor ? [...node.idealFor] : [];
  if (shownClusters.has(ci)) {
    puzzle.bridges.forEach(b => {
      const si = b.clusters.indexOf(ci);
      if (si === -1 || !b.idealTerms || b.idealTerms[si] !== node.word || names.includes(b.term)) return;
      const bridgeNode = nodes.find(n => n.word === b.term);
      if (bridgeNode && bridgeNode.connected.includes(ci)) names.push(b.term);
    });
  }
  return names;
}
