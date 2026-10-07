// A player's own work on a solved board's layout.
//
// Players arrange boards for their own reasons: fewer crossings, but also
// lines spread wider, room to watch a direction animate, or just taste.
// None of that shows up as fewer defects, so effort is counted by
// deliberate drags, not by score: a drag that moves a pill a real
// distance counts unless it makes the board worse. Once a player has
// crafted a board this way, polishing keeps their positions and only
// repairs actual defects; a board nobody arranged polishes straight to the
// saved layout.

// Defects in each mode, most severe first, as the engines rank them.
export const LAYOUT_DEFECTS = Object.freeze({
  graph: ["hardOverlaps", "lineCrossings", "edgeNodeIntersections"],
  sets: ["hardOverlaps", "lineCrossings", "lineHeadingIntersections", "lineCircleIntersections"],
  star: ["lineCrossings", "edgeTitleIntersections", "edgeNodeIntersections", "overlaps"]
});

// Board units a pill must travel for a drag to count as deliberate rather
// than a nudge or a tap that wandered.
export const DELIBERATE_DRAG = 30;

// Net counted drags (deliberate and not worsening, less worsening ones)
// at which a board is the player's own.
export const CRAFTED_DRAGS = 2;

/** True when `after` has more defects than `before`, most severe first. */
export function defectsWorse(mode, before, after) {
  for (const key of LAYOUT_DEFECTS[mode] || []) {
    const was = Number(before?.[key]) || 0, now = Number(after?.[key]) || 0;
    if (was !== now) return now > was;
  }
  return false;
}

/** True when the metrics show any defect at all. */
export function hasDefects(mode, metrics) {
  return (LAYOUT_DEFECTS[mode] || []).some(key => (Number(metrics?.[key]) || 0) > 0);
}

/**
 * One post-solve drag: null for a fidget, "worsened" when it made the
 * board worse, otherwise "kept" -- whether it fixed something or simply
 * moved a pill where the player prefers it.
 */
export function classifyDrag({ mode, before, after, displacement }) {
  if (!(displacement >= DELIBERATE_DRAG)) return null;
  return defectsWorse(mode, before, after) ? "worsened" : "kept";
}

function count(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

/** Effort as stored in a player session; anything malformed reads as none. */
export function normalizeEffort(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const effort = {};
  Object.keys(LAYOUT_DEFECTS).forEach(mode => {
    const entry = value[mode];
    if (!entry || typeof entry !== "object") return;
    const kept = count(entry.kept), worsened = count(entry.worsened);
    if (kept || worsened) effort[mode] = { kept, worsened };
  });
  return effort;
}

export function recordDrag(effort, mode, kind) {
  if (!kind || !LAYOUT_DEFECTS[mode]) return normalizeEffort(effort);
  const next = normalizeEffort(effort);
  const entry = next[mode] || { kept: 0, worsened: 0 };
  next[mode] = { ...entry, [kind]: entry[kind] + 1 };
  return next;
}

/** Whether the player has made this mode's board their own. */
export function isCrafted(effort, mode) {
  const entry = normalizeEffort(effort)[mode];
  return !!entry && entry.kept - entry.worsened >= CRAFTED_DRAGS;
}
