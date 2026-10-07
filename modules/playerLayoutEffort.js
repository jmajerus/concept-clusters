// A player's own work on a solved board's layout.
//
// Players arrange boards for their own reasons: fewer crossings, but also
// lines spread wider, room to watch a direction animate, or just taste.
// None of that shows up as fewer defects, so effort is counted by
// deliberate drags, not by score: a drag that moves a pill a real
// distance counts unless it makes the board worse. Drags while the board
// is still being built count too, at half weight: they place clusters and
// untangle as the player goes, but the force simulation keeps adjusting
// that arrangement, so it is coarser intent than tidying a solved board.
// Once a player has crafted a board this way, polishing keeps their
// positions and only repairs actual defects; a board nobody arranged
// polishes straight to the saved layout.

// Defects in each mode as severity tiers, most severe first, the way each
// engine ranks them: Graph's scoreGraphGeometry, Circle's
// scoreCircleCandidate (lines through headings and through circles weigh
// the same, so they share a tier), and Star's detangle compareLayouts
// (whose edgeNodeIntersections already counts lines through titles). A
// tier listing several metrics compares their sum.
export const LAYOUT_DEFECTS = Object.freeze({
  graph: ["hardOverlaps", "lineCrossings", "edgeNodeIntersections"],
  sets: ["hardOverlaps", "lineCrossings", ["lineHeadingIntersections", "lineCircleIntersections"]],
  star: ["lineCrossings", "edgeNodeIntersections", "overlaps"]
});

function tierCount(metrics, tier) {
  const keys = Array.isArray(tier) ? tier : [tier];
  return keys.reduce((sum, key) => sum + (Number(metrics?.[key]) || 0), 0);
}

// Board units a pill must travel for a drag to count as deliberate rather
// than a nudge or a tap that wandered.
export const DELIBERATE_DRAG = 30;

// Net counted drags (deliberate and not worsening, less worsening ones)
// at which a board is the player's own.
export const CRAFTED_DRAGS = 2;

// What a drag made while the board was still being built counts for,
// against 1 for a drag on the solved board.
export const BUILD_DRAG_WEIGHT = 0.5;

const COUNT_KEYS = ["kept", "worsened", "buildKept", "buildWorsened"];

/** True when `after` has more defects than `before`, most severe first. */
export function defectsWorse(mode, before, after) {
  for (const tier of LAYOUT_DEFECTS[mode] || []) {
    const was = tierCount(before, tier), now = tierCount(after, tier);
    if (was !== now) return now > was;
  }
  return false;
}

/** True when the metrics show any defect at all. */
export function hasDefects(mode, metrics) {
  return (LAYOUT_DEFECTS[mode] || []).some(tier => tierCount(metrics, tier) > 0);
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

const validCount = value => Number.isInteger(value) && value >= 0;

/**
 * Effort as stored in a player session. A mode whose record has any
 * invalid counter reads as no effort for that mode -- a partly corrupt
 * record must never be what makes a board count as the player's.
 * Omitted counters are zero.
 */
export function normalizeEffort(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const effort = {};
  Object.keys(LAYOUT_DEFECTS).forEach(mode => {
    const entry = value[mode];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
    if (COUNT_KEYS.some(key => entry[key] !== undefined && !validCount(entry[key]))) return;
    const counts = Object.fromEntries(COUNT_KEYS.map(key => [key, entry[key] ?? 0]));
    if (COUNT_KEYS.some(key => counts[key])) effort[mode] = counts;
  });
  return effort;
}

/** Add one classified drag; `building` when the board was not yet solved. */
export function recordDrag(effort, mode, kind, { building = false } = {}) {
  if (!kind || !LAYOUT_DEFECTS[mode]) return normalizeEffort(effort);
  const next = normalizeEffort(effort);
  const entry = next[mode] || Object.fromEntries(COUNT_KEYS.map(key => [key, 0]));
  const key = building ? (kind === "kept" ? "buildKept" : "buildWorsened") : kind;
  next[mode] = { ...entry, [key]: entry[key] + 1 };
  return next;
}

/** Net weighted effort for a mode: solved-board drags count 1, build drags ½. */
export function effortScore(effort, mode) {
  const entry = normalizeEffort(effort)[mode];
  if (!entry) return 0;
  return entry.kept - entry.worsened +
    BUILD_DRAG_WEIGHT * (entry.buildKept - entry.buildWorsened);
}

/** Whether the player has made this mode's board their own. */
export function isCrafted(effort, mode) {
  return effortScore(effort, mode) >= CRAFTED_DRAGS;
}
