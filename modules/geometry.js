// Plain 2D geometry helpers used by both rendering modes -- pure math
// over coordinates, no game-state, D3, or DOM dependency.

// Distance from a rectangle's own center to its boundary, walking along
// a given (not necessarily unit) direction — standard slab method.
// Used to find where a pill's own edge is in whatever direction a line
// approaches it from, since that varies with both the pill's width
// (word length) and the angle of approach, not just a fixed offset.
export function rectEdgeDist(dx, dy, halfW, halfH) {
  const tx = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
  const ty = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
  return Math.min(tx, ty);
}

// Shortest distance from point (px, py) to the segment (x1,y1)-(x2,y2).
// Used (see Sets mode's bridgeLineObstructed) to decide whether a bridge
// line, not just its endpoints, passes too close to an unrelated third
// circle -- a straight line can cut through one even when neither end
// does.
export function segmentDistToPoint(x1, y1, x2, y2, px, py) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq ? ((px - x1) * dx + (py - y1) * dy) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
