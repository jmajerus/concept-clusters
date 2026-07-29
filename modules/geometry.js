// Plain 2D geometry helpers used by all rendering modes -- pure math
// over coordinates, no game-state, D3, or DOM dependency.

export function centeredRect(point, width, height, pad = 0) {
  return {
    left: point.x - width / 2 - pad,
    right: point.x + width / 2 + pad,
    top: point.y - height / 2 - pad,
    bottom: point.y + height / 2 + pad
  };
}

export function rectsOverlap(a, b, pad = 0) {
  return a.left - pad < b.right &&
    a.right + pad > b.left &&
    a.top - pad < b.bottom &&
    a.bottom + pad > b.top;
}

export function segmentFromPoints(source, target) {
  return {
    x1: source.x,
    y1: source.y,
    x2: target.x,
    y2: target.y
  };
}

// Returns the interior crossing point of two finite segments. Endpoint
// meetings are deliberately excluded: graph edges commonly share a node,
// and that is a connection rather than a visual crossing.
export function segmentIntersectionPoint(a, b, epsilon = 0.001) {
  const dx1 = a.x2 - a.x1, dy1 = a.y2 - a.y1;
  const dx2 = b.x2 - b.x1, dy2 = b.y2 - b.y1;
  const denominator = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denominator) < 1e-9) return null;
  const t = ((b.x1 - a.x1) * dy2 - (b.y1 - a.y1) * dx2) / denominator;
  const u = ((b.x1 - a.x1) * dy1 - (b.y1 - a.y1) * dx1) / denominator;
  if (t <= epsilon || t >= 1 - epsilon ||
      u <= epsilon || u >= 1 - epsilon) return null;
  return {
    x: a.x1 + t * dx1,
    y: a.y1 + t * dy1
  };
}

export function segmentsIntersect(a, b, epsilon = 0.001) {
  return segmentIntersectionPoint(a, b, epsilon) !== null;
}

// Liang-Barsky segment/rectangle clipping. Kept private so both the
// boolean scorer and Star's diagnostic crossing-point calculation use
// exactly the same boundary semantics.
function clipSegmentToRect(segment, rect, pad) {
  const left = rect.left - pad, right = rect.right + pad;
  const top = rect.top - pad, bottom = rect.bottom + pad;
  const dx = segment.x2 - segment.x1, dy = segment.y2 - segment.y1;
  const p = [-dx, dx, -dy, dy];
  const q = [
    segment.x1 - left,
    right - segment.x1,
    segment.y1 - top,
    bottom - segment.y1
  ];
  let t0 = 0, t1 = 1;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-9) {
      if (q[i] < 0) return null;
    } else {
      const ratio = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, ratio);
      else t1 = Math.min(t1, ratio);
      if (t0 > t1) return null;
    }
  }
  return { t0, t1 };
}

// Padding treats a line that merely grazes an obstacle as an intersection
// too, matching how the rendered stroke reads to a player.
export function segmentIntersectsRect(segment, rect, pad = 0, epsilon = 0.001) {
  const clipped = clipSegmentToRect(segment, rect, pad);
  return !!clipped && clipped.t1 > epsilon && clipped.t0 < 1 - epsilon;
}

export function segmentRectIntersectionPoint(segment, rect, pad = 0, epsilon = 0.001) {
  const clipped = clipSegmentToRect(segment, rect, pad);
  if (!clipped || clipped.t1 <= epsilon || clipped.t0 >= 1 - epsilon) return null;
  const t = Math.max(0, Math.min(1, (clipped.t0 + clipped.t1) / 2));
  return {
    x: segment.x1 + (segment.x2 - segment.x1) * t,
    y: segment.y1 + (segment.y2 - segment.y1) * t
  };
}

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
