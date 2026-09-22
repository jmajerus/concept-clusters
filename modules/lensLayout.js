// Where a lone cluster rests. A single cluster has no neighbors to orbit,
// so the ring used for two or more clusters collapses to one arbitrary
// point (the top of that ring). Lens play then leaves the group on the
// far side of the board from Check selections, which sits at the left of
// the panel under the board.
//
// The renderers ask for this home while they seed and search, and fan
// the group into the open board from there. Translating a finished
// layout afterward is a second motion, and it drags an arrangement that
// was composed for a different spot.

export const SINGLE_CLUSTER_LENS_MARGIN = 24;

function clampRange(value, min, max) {
  if (!(max >= min)) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

// `clearanceX` / `clearanceY` are how far the anchor (a term-cloud hub,
// a Star title, or a circle center) must stay inside the board.
// `minY` is the top of the legal band — the free-term strip in Circle
// mode, otherwise a small margin.
export function lowerLeftAnchor(width, height, clearanceX, clearanceY, minY = SINGLE_CLUSTER_LENS_MARGIN) {
  const margin = SINGLE_CLUSTER_LENS_MARGIN;
  return {
    x: clampRange(clearanceX + margin, clearanceX + margin, width - clearanceX - margin),
    y: clampRange(
      height - clearanceY - margin,
      clearanceY + minY,
      height - clearanceY - margin
    )
  };
}

// Inset far enough that a term cloud can spread around the hub and stay
// on the board, while the hub itself stays in the lower-left region.
export function singleClusterTermHome(width, height) {
  const clearanceX = Math.min(132, Math.max(84, width * 0.2));
  const clearanceY = Math.min(100, Math.max(72, height * 0.2));
  return lowerLeftAnchor(width, height, clearanceX, clearanceY);
}

export function singleClusterCircleHome(radius, width, height, minY = SINGLE_CLUSTER_LENS_MARGIN) {
  return lowerLeftAnchor(width, height, radius, radius, minY);
}
