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

import {
  centeredRect,
  rectsOverlap,
  segmentFromPoints,
  segmentRectIntersectionPoint
} from "./geometry.js";
import { compareWordOrder } from "./puzzleGraph.js";

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

// A lone Star has no neighboring titles to push against, and a strong
// force solve drives its terms into the board edge, where the clamp
// holds them still. This fan is the arrangement to show instead: one
// arc into the open board, sized from the label widths, then shifted
// as a whole until every pill sits inside the canvas.
function starFanAttempt(title, ordered, width, height, span, startBias) {
  const gap = 18;
  const total = Math.max(1, ordered.reduce((sum, node) => sum + node.w + gap, 0));
  const start = -Math.PI / 2 - span * startBias;
  const radius = ordered.length ? Math.max(110, total / span) : 0;
  const home = singleClusterTermHome(width, height);
  let hubX = home.x;
  let hubY = home.y;

  const place = () => {
    const targets = new Map([[title, { x: hubX, y: hubY }]]);
    let cursor = 0;
    ordered.forEach(node => {
      const mid = cursor + (node.w + gap) / 2;
      const angle = start + (mid / total) * span;
      cursor += node.w + gap;
      targets.set(node, {
        x: hubX + Math.cos(angle) * radius,
        y: hubY + Math.sin(angle) * radius
      });
    });
    return targets;
  };

  for (let step = 0; step < 8; step++) {
    const placed = place();
    let minDx = -Infinity;
    let maxDx = Infinity;
    let minDy = -Infinity;
    let maxDy = Infinity;
    for (const [node, point] of placed) {
      const minX = node.w / 2 + 8;
      const maxX = width - node.w / 2 - 8;
      minDx = Math.max(minDx, minX - point.x);
      maxDx = Math.min(maxDx, maxX - point.x);
      minDy = Math.max(minDy, 24 - point.y);
      maxDy = Math.min(maxDy, height - 24 - point.y);
    }
    if (minDx <= 0 && maxDx >= 0 && minDy <= 0 && maxDy >= 0) break;
    if (minDx > maxDx || minDy > maxDy) break;
    hubX += minDx > 0 ? minDx : maxDx < 0 ? maxDx : 0;
    hubY += minDy > 0 ? minDy : maxDy < 0 ? maxDy : 0;
  }
  return place();
}

function starFanContained(targets, width, height) {
  const placed = [...targets].map(([node, point]) => ({ node, ...point }));
  for (const item of placed) {
    if (item.x - item.node.w / 2 < 8 || item.x + item.node.w / 2 > width - 8) return false;
    if (item.y < 24 || item.y > height - 24) return false;
  }
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      if (rectsOverlap(
        centeredRect(placed[i], placed[i].node.w, 30, 4),
        centeredRect(placed[j], placed[j].node.w, 30, 4)
      )) return false;
    }
  }
  return true;
}

function starFanFits(targets, width, height) {
  if (!starFanContained(targets, width, height)) return false;
  const placed = [...targets].map(([node, point]) => ({ node, ...point }));
  const title = placed.find(item => item.node.isTitleNode || item.node.isTitle);
  if (!title) return true;
  for (const term of placed) {
    if (term === title) continue;
    for (const other of placed) {
      if (other === term || other === title) continue;
      if (segmentRectIntersectionPoint(
        segmentFromPoints(term, title),
        centeredRect(other, other.node.w, 30),
        4
      )) return false;
    }
  }
  return true;
}

function placeDoubleRing(title, inner, outer, hubX, hubY, innerRadius, outerRadius, aim) {
  const gap = 14;
  const targets = new Map([[title, { x: hubX, y: hubY }]]);
  [inner, outer].forEach((group, index) => {
    if (!group.length) return;
    const radius = index === 0 ? innerRadius : outerRadius;
    const total = group.reduce((sum, node) => sum + node.w + gap, 0);
    const span = total / radius;
    const start = aim - span / 2;
    let cursor = 0;
    group.forEach(node => {
      const mid = cursor + (node.w + gap) / 2;
      const angle = start + (mid / total) * span;
      cursor += node.w + gap;
      targets.set(node, {
        x: hubX + Math.cos(angle) * radius,
        y: hubY + Math.sin(angle) * radius
      });
    });
  });
  return targets;
}

function fanReach(targets, height) {
  const terms = [...targets].filter(([node]) => !(node.isTitleNode || node.isTitle));
  if (!terms.length) return 0;
  return terms.reduce((sum, [, point]) =>
    sum + Math.hypot(point.x - 28, point.y - (height - 32)), 0) / terms.length;
}

function fanHits(targets) {
  const placed = [...targets].map(([node, point]) => ({ node, ...point }));
  const title = placed.find(item => item.node.isTitleNode || item.node.isTitle);
  if (!title) return 0;
  let hits = 0;
  for (const term of placed) {
    if (term === title) continue;
    for (const other of placed) {
      if (other === term || other === title) continue;
      if (segmentRectIntersectionPoint(
        segmentFromPoints(term, title),
        centeredRect(other, other.node.w, 30),
        2
      )) hits++;
    }
  }
  return hits;
}

// Two short arcs above a lower-left title. One arc long enough for every
// label runs across the board; splitting the labels keeps the selectable
// pills next to Check selections.
function tightDoubleRing(title, ordered, width, height) {
  const home = singleClusterTermHome(width, height);
  const inner = ordered.filter((_, index) => index % 2 === 0);
  const outer = ordered.filter((_, index) => index % 2 === 1);
  let best = null;
  let bestKey = Infinity;
  for (let hubX = home.x; hubX <= home.x + 40; hubX += 10) {
    for (let hubY = home.y; hubY <= height - 50; hubY += 10) {
      for (let innerRadius = 112; innerRadius <= 160; innerRadius += 8) {
        for (const extra of [56, 68]) {
          for (let aim = -1.8; aim <= -1.2; aim += 0.1) {
            const targets = placeDoubleRing(
              title, inner, outer, hubX, hubY, innerRadius, innerRadius + extra, aim
            );
            if (!starFanContained(targets, width, height)) continue;
            const key = fanHits(targets) * 80 + fanReach(targets, height);
            if (key < bestKey) {
              best = targets;
              bestKey = key;
            }
          }
        }
      }
    }
  }
  return best;
}

function termCentroidLowerLeft(targets, width, height) {
  const terms = [...targets].filter(([node]) => !(node.isTitleNode || node.isTitle));
  if (!terms.length) return true;
  const x = terms.reduce((sum, [, point]) => sum + point.x, 0) / terms.length;
  const y = terms.reduce((sum, [, point]) => sum + point.y, 0) / terms.length;
  return x < width / 2 && y > height / 2;
}

export function loneClusterStarFan(title, terms, width, height) {
  const ordered = [...terms].sort((a, b) => compareWordOrder(a.word, b.word));
  const wide = ordered.length <= 1
    ? 0.8
    : Math.min(2.6, Math.max(1.15, ordered.length * 0.37));
  // A rightward semicircle keeps a small group beside the lower-left
  // title. A larger label set uses two short arcs there; a single arc
  // sized to those labels would park the selectable terms across the board.
  const semicircle = starFanAttempt(title, ordered, width, height, Math.PI, 0);
  if (starFanFits(semicircle, width, height) &&
      termCentroidLowerLeft(semicircle, width, height)) {
    return semicircle;
  }
  return tightDoubleRing(title, ordered, width, height) ||
    starFanAttempt(title, ordered, width, height, wide, 0.28);
}
