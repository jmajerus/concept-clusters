// Circle mode stacks a solved cluster's terms in one column. When a
// bridge's ideal line ends on one of those terms, the stacking order
// decides how much of that line runs under the circle's other pills. This
// picks the order that hides the least of those lines.
// Pure geometry: setRenderer supplies row offsets and pill sizes.

import { centeredRect, clipSegmentToRect } from "./geometry.js";

export const MEMBER_ORDER_MAX_CANDIDATES = 5000;
// A new order must hide at least this much less line than the shown one,
// so two near-equal orders do not trade places as bridges drift.
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

// Where an ideal line leaves its target pill (centre `target`): the end
// facing the bridge at `point`, or the top or bottom centre when the bridge
// is more above or below than beside and the target is in that end row of
// its stack, so nothing sits in the way. `below` is the caption row under
// the pill, which a bottom anchor clears. A side end is always clear: the
// stack is one column.
export function pillAnchor(target, point, { halfW, halfH, top = false, bottom = false, below = 0 }) {
  const dx = point.x - target.x, dy = point.y - target.y;
  if (Math.abs(dy) > Math.abs(dx)) {
    if (dy < 0 && top) return { x: target.x, y: target.y - halfH, side: "top" };
    if (dy > 0 && bottom) return { x: target.x, y: target.y + halfH + below, side: "bottom" };
  }
  const sign = dx < 0 ? -1 : 1;
  return { x: target.x + sign * halfW, y: target.y, side: sign < 0 ? "left" : "right" };
}

// Base stacking order: widest term in the middle row, then alternately the
// next widest above and below, so the column tapers towards the circle's
// top and bottom where a circle is narrowest. Ties fall back to `compare`
// (the word-order hash), so the order still owes nothing to how the terms
// were authored -- pill width is already visible to the player.
export function compactMemberOrder(terms, width, compare) {
  const widest = [...terms].sort((a, b) => width(b) - width(a) || compare(a, b));
  const order = [];
  widest.forEach((term, i) => (i % 2 ? order.push(term) : order.unshift(term)));
  return order;
}

// Rows of a column centred on the circle's centre. A row is the pill plus
// any caption below it; the pill sits at the top of its row.
export function stackRows(order, { width, height, gap, pillHeight = 30 }) {
  const heights = order.map(height);
  const total = heights.reduce((sum, h) => sum + h, 0) + gap * Math.max(0, order.length - 1);
  let top = -total / 2;
  return order.map((term, i) => {
    const row = { term, w: width(term), top, bottom: top + heights[i], centre: top + pillHeight / 2 };
    top += heights[i] + gap;
    return row;
  });
}

// Smallest circle radius that keeps every row's corners `pad` inside it.
export function stackFitRadius(order, { pad, ...metrics }) {
  return stackRows(order, metrics).reduce((r, row) => Math.max(
    r,
    Math.hypot(row.w / 2 + pad, Math.max(Math.abs(row.top), Math.abs(row.bottom)) + pad)
  ), 0);
}

function countPlacements(n, k) {
  let count = 1;
  for (let i = 0; i < k; i++) count *= n - i;
  return count;
}

// The remaining terms fill the free rows compactly: widest nearest the
// middle of the column, so seating a target at an end does not also push
// a wide term to the other end where the circle is narrow.
function fillCompactly(slots, rest, width) {
  const middle = (slots.length - 1) / 2;
  const free = slots
    .map((slot, index) => (slot === null ? index : -1))
    .filter(index => index >= 0)
    .sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle) || a - b);
  const widest = rest
    .map((term, index) => ({ term, index }))
    .sort((a, b) => width(b.term) - width(a.term) || a.index - b.index);
  const filled = [...slots];
  free.forEach((slot, i) => { filled[slot] = widest[i].term; });
  return filled;
}

// Every distinct-row placement of `targets`, with the remaining terms
// filling the free rows compactly.
function* targetPlacements(terms, targets, width) {
  const rest = terms.filter(term => !targets.includes(term));
  const slots = new Array(terms.length).fill(null);
  function* place(i) {
    if (i === targets.length) {
      yield fillCompactly(slots, rest, width);
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
 * @param {(order: string[]) => boolean} [options.fits] whether an order
 *   stays inside the circle; orders that do not are never chosen
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
  captionDepth = 0,
  fits = () => true,
  hysteresis = MEMBER_ORDER_HYSTERESIS,
  maxCandidates = MEMBER_ORDER_MAX_CANDIDATES
}) {
  if (!arms.length) return null;
  // How much of each line runs under the circle's other pills, measured
  // from where it is drawn: its target's anchor (pillAnchor), which depends
  // on whether the target holds an end row.
  const cost = order => {
    const offsets = rowOffsets(order);
    const pills = order.map(term => ({
      term,
      rect: centeredRect({ x: center.x, y: center.y + offsets.get(term) }, pillWidth(term), pillHeight)
    }));
    return arms.reduce((sum, arm) => {
      const anchor = pillAnchor({ x: center.x, y: center.y + offsets.get(arm.term) }, arm.point, {
        halfW: pillWidth(arm.term) / 2,
        halfH: pillHeight / 2,
        top: order[0] === arm.term,
        bottom: order[order.length - 1] === arm.term,
        below: captionDepth
      });
      const segment = { x1: anchor.x, y1: anchor.y, x2: arm.point.x, y2: arm.point.y };
      const length = Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1);
      return sum + pills.reduce((hidden, pill) => {
        if (pill.term === arm.term) return hidden;
        const clipped = clipSegmentToRect(segment, pill.rect);
        return clipped && clipped.t1 > clipped.t0 ? hidden + (clipped.t1 - clipped.t0) * length : hidden;
      }, 0);
    }, 0);
  };
  const targets = [...new Set(arms.map(arm => arm.term))];
  let best = terms, bestCost = Infinity;
  if (countPlacements(terms.length, targets.length) <= maxCandidates) {
    for (const candidate of targetPlacements(terms, targets, pillWidth)) {
      if (!fits(candidate)) continue;
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
        if (!fits(trial)) continue;
        const value = cost(trial);
        if (value < pickCost) { pick = trial; pickCost = value; }
      }
      if (pickCost < Infinity) { best = pick; bestCost = pickCost; }
    });
  }
  return bestCost < cost(current || terms) - hysteresis ? best : current;
}
