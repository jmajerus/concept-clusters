export const TOWARD_BRIDGE = "toward-bridge";
export const AWAY_FROM_BRIDGE = "away-from-bridge";

// Gameplay records every bridge link as bridge-node -> tapped cluster
// term, regardless of the authored meaning. Resolve meaning from the
// bridge's metadata and the cluster represented by this arm instead of
// trusting that incidental source/target order.
export function bridgeArmDirections(bridge, clusterIndex) {
  const direction = bridge?.direction;
  const clusters = bridge?.gs || bridge?.clusters || [];
  if (!direction || !clusters.includes(clusterIndex)) {
    return [];
  }
  if (direction.kind === "through") {
    if (clusterIndex === direction.from) return [TOWARD_BRIDGE];
    if (clusterIndex === direction.to) return [AWAY_FROM_BRIDGE];
    return [];
  }
  if (direction.kind === "bidirectional") return [TOWARD_BRIDGE, AWAY_FROM_BRIDGE];
  if (direction.kind === "outward") return [AWAY_FROM_BRIDGE];
  if (direction.kind === "inward") return [TOWARD_BRIDGE];
  return [];
}

// Two opposing arrows need distinct centers or they collapse into one
// ambiguous diamond. Put their tips toward the outside of the arm:
// cluster-bound flow slightly nearer the bridge, bridge-bound flow
// slightly nearer the cluster.
export function bridgeArmArrows(bridge, clusterIndex) {
  const directions = bridgeArmDirections(bridge, clusterIndex);
  return directions.map(direction => ({
    direction,
    centerOffset: directions.length === 2
      ? direction === AWAY_FROM_BRIDGE ? -7 : 7
      : 0
  }));
}

// A compact, human-readable form shared by the earned fact card and
// accessible node labels. Absence of direction deliberately returns
// null: an ordinary bridge is undirected, not implicitly bidirectional.
export function bridgeDirectionText(bridge, puzzle) {
  const direction = bridge?.direction;
  if (!direction || direction.kind === "undirected") return null;
  const word = bridge.word || bridge.term;
  if (direction.kind === "through") {
    const from = puzzle?.clusters?.[direction.from]?.name;
    const to = puzzle?.clusters?.[direction.to]?.name;
    return from && to ? `${from} → ${word} → ${to}` : null;
  }

  const clusterIndices = bridge.gs || bridge.clusters;
  const first = puzzle?.clusters?.[clusterIndices?.[0]]?.name;
  const second = puzzle?.clusters?.[clusterIndices?.[1]]?.name;
  if (!first || !second) return null;
  if (direction.kind === "bidirectional") return `${first} ↔ ${word} ↔ ${second}`;
  if (direction.kind === "outward") return `${first} ← ${word} → ${second}`;
  if (direction.kind === "inward") return `${first} → ${word} ← ${second}`;
  return null;
}

export function bridgeNodeAriaLabel(bridge, puzzle, complete) {
  const direction = complete && bridgeDirectionText(bridge, puzzle);
  return direction ? `${bridge.word}. Directed bridge: ${direction}.` : bridge.word;
}

// Return a small filled triangle centered on an arm. Callers supply the
// actual rendered bridge and cluster endpoints, which differ by mode:
// Graph uses the tapped term, Star may use a cluster title, and Circle
// uses the boundary of the cluster circle.
export function bridgeArrowPoints(bridgePoint, clusterPoint, armDirection, centerOffset = 0) {
  if (!armDirection) return "";
  const toward = armDirection === TOWARD_BRIDGE;
  const start = toward ? clusterPoint : bridgePoint;
  const end = toward ? bridgePoint : clusterPoint;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (!Number.isFinite(length) || length < 12) return "";

  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const bridgeToClusterX = (clusterPoint.x - bridgePoint.x) / length;
  const bridgeToClusterY = (clusterPoint.y - bridgePoint.y) / length;
  const mx = (bridgePoint.x + clusterPoint.x) / 2 + bridgeToClusterX * centerOffset;
  const my = (bridgePoint.y + clusterPoint.y) / 2 + bridgeToClusterY * centerOffset;
  const tip = { x: mx + ux * 5, y: my + uy * 5 };
  const base = { x: mx - ux * 5, y: my - uy * 5 };
  const halfWidth = 4;
  const points = [
    tip,
    { x: base.x + nx * halfWidth, y: base.y + ny * halfWidth },
    { x: base.x - nx * halfWidth, y: base.y - ny * halfWidth }
  ];
  return points.map(point => `${point.x},${point.y}`).join(" ");
}
