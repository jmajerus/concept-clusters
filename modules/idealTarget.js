// Shared reveal timing for canonical bridge endpoints across Graph, Star,
// and Circle. `idealTerms` is the author's topology, not a record of which
// node the player happened to tap. An endpoint becomes visible only after
// both its bridge side and the endpoint term itself have been placed, so the
// canonical graph never leaks an unplaced term's cluster.

// Returns the names of all connected bridges for which `node` is the
// canonical endpoint. Bridge nodes are never endpoints themselves.
export function canonicalBridgeNames(node, puzzle, nodes) {
  if (node.gs.length !== 1 || node.connected.length !== 1) return [];
  const ci = node.gs[0];
  return puzzle.bridges.flatMap(bridge => {
    const side = bridge.clusters.indexOf(ci);
    if (side === -1 || bridge.idealTerms?.[side] !== node.word) return [];
    const bridgeNode = nodes.find(candidate => candidate.word === bridge.term);
    return bridgeNode?.connected.includes(ci) ? [bridge.term] : [];
  });
}

export function canonicalNodeAriaLabel(node, puzzle, nodes, baseLabel = node.word) {
  const names = canonicalBridgeNames(node, puzzle, nodes);
  if (!names.length) return baseLabel;
  return `${String(baseLabel).replace(/\.*$/, "")}. Canonical endpoint for ${names.join(", ")}.`;
}
