// Cold start for every mode: each bridge begins connected to every cluster
// it joins. The stored line ends at a cluster member (ideal: false); Star
// draws that side at the title, and Graph and Circle draw it at the member.
// An authored ideal term, when the puzzle has one, stays a later promotion
// once that term is placed. Seeds are not endpoints here.

export function applyStarBridgePreconnect(puzzle, nodes, links) {
  let added = 0;
  (puzzle.bridges || []).forEach(bridge => {
    const node = nodes.find(candidate =>
      candidate.word === bridge.term && candidate.gs.length > 1
    );
    if (!node) return;
    bridge.clusters.forEach((ci, side) => {
      if (node.connected.includes(ci)) return;
      const cluster = puzzle.clusters?.[ci];
      if (!cluster) return;
      const seedWord = cluster.seeds?.[0];
      const target = nodes.find(candidate =>
        candidate.gs.length === 1 &&
        candidate.gs[0] === ci &&
        candidate.word === seedWord
      ) || nodes.find(candidate =>
        candidate.gs.length === 1 && candidate.gs[0] === ci
      );
      if (!target) return;
      const idealWord = bridge.idealTerms && bridge.idealTerms[side];
      const canonicalTarget = idealWord
        ? nodes.find(candidate => candidate.word === idealWord) || null
        : null;
      node.connected.push(ci);
      links.push({
        source: node,
        target,
        clusterIndex: ci,
        bridge: true,
        ideal: false,
        canonicalTarget
      });
      added++;
    });
  });
  return added;
}

export function remainingLinkCount(nodes) {
  return nodes.reduce((sum, node) => sum + (node.gs.length - node.connected.length), 0);
}
