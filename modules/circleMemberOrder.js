// Circle mode stacks a solved cluster's terms in one column. When a
// bridge's ideal line ends on one of those terms, the stacking order
// decides how much of that line runs under the circle's other pills. This
// picks the order that keeps those lines shortest inside the circle.
// Pure geometry: setRenderer supplies row offsets and pill sizes.

import { rectEdgeDist } from "./geometry.js";

export const MEMBER_ORDER_MAX_CANDIDATES = 5000;
// A new order must shorten the total visible interior line by at least
// this much, so two near-equal orders do not trade places as bridges drift.
export const MEMBER_ORDER_HYSTERESIS = 12;

// Length of the segment from `from` towards `to` that lies inside the
// circle (centre c, radius r).
export function interiorLength(from, to, c, r) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const fx = from.x - c.x, fy = from.y - c.y;
  const a = dx * dx + dy * dy;
  if (a === 0) return 0;
  const b = 2 * (fx * dx + fy * dy);
  const k = fx * fx + fy * fy - r * r;
  const t = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * k))) / (2 * a);
  return Math.min(1, Math.max(0, t)) * Math.sqrt(a);
}

// The drawn ideal line starts at the target pill's edge, not its centre
// (see setRenderer bridgeLineSegments), so the stretch under the target
// itself is not part of what other pills can hide. Wide pills approached
// from the side would otherwise be penalised by their whole half-width.
export function visibleInteriorLength(target, point, c, r, halfW, halfH) {
  const dx = point.x - target.x, dy = point.y - target.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return 0;
  const hidden = rectEdgeDist(dx / length, dy / length, halfW, halfH);
  return Math.max(0, interiorLength(target, point, c, r) - hidden);
}

function countPlacements(n, k) {
  let count = 1;
  for (let i = 0; i < k; i++) count *= n - i;
  return count;
}

// Every distinct-row placement of `targets`, with the remaining terms
// keeping their given order in the free rows.
function* targetPlacements(terms, targets) {
  const rest = terms.filter(term => !targets.includes(term));
  const slots = new Array(terms.length).fill(null);
  function* place(i) {
    if (i === targets.length) {
      let next = 0;
      yield slots.map(slot => slot ?? rest[next++]);
      return;
    }
    for (let s = 0; s < slots.length; s++) {
      if (slots[s] !== null) continue;
      slots[s] = targets[i];
      yield* place(i + 1);
      slots[s] = null;
    }
  }
  yield* place(0);
}

/**
 * @param {object} options
 * @param {string[]} options.terms display order (the order with no arms)
 * @param {string[]|null} options.current order currently shown, or null
 * @param {{term: string, point: {x: number, y: number}}[]} options.arms
 *   connected ideal lines ending in this circle, with their bridge points
 * @param {{x: number, y: number}} options.center
 * @param {number} options.r
 * @param {(order: string[]) => Map<string, number>} options.rowOffsets
 *   each term's vertical centre relative to the circle centre
 * @param {(term: string) => number} options.pillWidth
 * @param {number} [options.pillHeight]
 * @returns {string[]|null} the order to show; null keeps display order
 */
export function chooseMemberOrder({
  terms,
  current = null,
  arms,
  center,
  r,
  rowOffsets,
  pillWidth,
  pillHeight = 30,
  hysteresis = MEMBER_ORDER_HYSTERESIS,
  maxCandidates = MEMBER_ORDER_MAX_CANDIDATES
}) {
  if (!arms.length) return null;
  const cost = order => {
    const offsets = rowOffsets(order);
    return arms.reduce((sum, arm) => sum + visibleInteriorLength(
      { x: center.x, y: center.y + offsets.get(arm.term) },
      arm.point,
      center,
      r,
      pillWidth(arm.term) / 2,
      pillHeight / 2
    ), 0);
  };
  const targets = [...new Set(arms.map(arm => arm.term))];
  let best = terms, bestCost = Infinity;
  if (countPlacements(terms.length, targets.length) <= maxCandidates) {
    for (const candidate of targetPlacements(terms, targets)) {
      const value = cost(candidate);
      if (value < bestCost) { best = candidate; bestCost = value; }
    }
  } else {
    // Too many targets to try every placement: seat them one at a time,
    // each in its best row given the ones already seated.
    targets.forEach(target => {
      let pick = best, pickCost = Infinity;
      for (let s = 0; s < best.length; s++) {
        const trial = best.filter(term => term !== target);
        trial.splice(s, 0, target);
        const value = cost(trial);
        if (value < pickCost) { pick = trial; pickCost = value; }
      }
      best = pick;
      bestCost = pickCost;
    });
  }
  return bestCost < cost(current || terms) - hysteresis ? best : current;
}
