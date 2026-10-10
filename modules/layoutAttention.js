// Which saved layouts need a person's attention, judged from the stored
// layout document alone (no board is laid out): defects recorded when the
// layout was saved, and fixed layouts an edit or a board-size change has
// outdated. The puzzle list marks these on its Layouts chips; the automatic
// layout pass (tools/layouts-auto.mjs) counts defects the same way.

import { LAYOUT_MODES, layoutRevision, normalizeLayoutDocument } from "./layoutDocument.js";
import { layoutIsFixed } from "./layoutHints.js";
import { boardCanvas } from "./puzzleBoardSize.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { layoutPointsFitBoard, recentreLayoutDocument } from "./layoutRecentre.js";

// Defects players would notice as severity tiers, most severe first, the
// way each engine's own scoring ranks a finished layout (graphLayout
// scoreGraphGeometry, setRenderer scoreCircleCandidate, starRenderer
// comparePrettyLayouts). Graph's hardOverlaps already includes overlaps,
// and Graph's and Circle's include items near the board's edge, which are
// reported apart in the same tier (withoutEdgeOverlaps);
// Circle weighs lines through headings and through circles the same, so
// they share a tier (a tier listing several metrics compares their sum).
export const DEFECT_TIERS = {
  graph: [["hardOverlaps", "boundsViolations"], "lineCrossings", "edgeNodeIntersections"],
  sets: [["hardOverlaps", "boundsViolations"], "lineCrossings", ["lineHeadingIntersections", "lineCircleIntersections"]],
  star: ["lineCrossings", "edgeTitleIntersections", ["edgeNodeIntersections", "edgeIntersections"], "overlaps"]
};

export const tierKeys = tier => (Array.isArray(tier) ? tier : [tier]);
export const tierCount = (counts, tier) => tierKeys(tier).reduce((sum, key) => sum + (counts?.[key] || 0), 0);

// Star's edgeNodeIntersections counts lines through titles and pills
// together. Split it so each hit is counted once: titles, then pills only.
// A layout saved before the title count was recorded keeps the combined
// count as edgeIntersections (a line through a pill or a title).
function disjointStarCounts(metrics) {
  const combined = Number(metrics.edgeNodeIntersections) || 0;
  if (metrics.edgeTitleIntersections == null) {
    return { ...metrics, edgeNodeIntersections: 0, edgeIntersections: combined };
  }
  const titles = Number(metrics.edgeTitleIntersections) || 0;
  return { ...metrics, edgeTitleIntersections: titles, edgeNodeIntersections: Math.max(0, combined - titles) };
}

// Graph and Circle count items near the board's edge into hardOverlaps.
// Report them as boundsViolations alone, so they are not also overlaps;
// they share the tier, so severity is unchanged.
function withoutEdgeOverlaps(metrics) {
  const edge = Number(metrics.boundsViolations) || 0;
  return { ...metrics, hardOverlaps: Math.max(0, (Number(metrics.hardOverlaps) || 0) - edge), boundsViolations: edge };
}

/** Nonzero defect counts by metric, plus their total (null without metrics). */
export function layoutDefects(mode, metrics) {
  if (!metrics) return { total: null };
  const counts = mode === "star" ? disjointStarCounts(metrics) : withoutEdgeOverlaps(metrics);
  const found = Object.fromEntries(DEFECT_TIERS[mode].flatMap(tierKeys)
    .map(key => [key, Number(counts[key]) || 0])
    .filter(([, count]) => count > 0));
  return { ...found, total: Object.values(found).reduce((sum, count) => sum + count, 0) };
}

/**
 * Per saved mode: `defects` (from the saved metrics), `fixed`, and `stale`
 * -- a fixed layout whose puzzle revision no longer matches, or whose board
 * size differs and which no longer fits once re-centred, so players get it
 * as a hint (Graph, Circle) or adapted (Star) and its saved metrics no
 * longer describe their board. Hints are always searched
 * afresh, so they are never stale. Modes with nothing saved are absent.
 */
export function layoutAttention({ document, layout, categoryRegistry = undefined }) {
  const normalized = normalizeLayoutDocument(layout);
  if (!normalized || !document) return {};
  let puzzle = null;
  try {
    puzzle = puzzleFromAuthoredDocument(document, { categoryRegistry }).puzzle;
  } catch {
    puzzle = null;
  }
  const sized = puzzle ? { ...puzzle, layout: normalized } : null;
  const revision = puzzle ? layoutRevision(puzzle) : null;
  const result = {};
  LAYOUT_MODES.forEach(mode => {
    const saved = normalized.modes?.[mode];
    if (!saved) return;
    const fixed = mode === "star" || layoutIsFixed(saved);
    let stale = false;
    if (fixed && sized) {
      const board = boardCanvas(sized);
      const sameSize = Number(saved.board?.width) === board.width &&
        Number(saved.board?.height) === board.height;
      // A size-only change re-centres the layout (layoutRecentre.js); it is
      // outdated only if it no longer fits.
      stale = saved.puzzleRevision !== revision ||
        (!sameSize && !layoutPointsFitBoard(recentreLayoutDocument(saved, board)));
    }
    result[mode] = { fixed, stale, defects: layoutDefects(mode, saved.metrics) };
  });
  return result;
}
