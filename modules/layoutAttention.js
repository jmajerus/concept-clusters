// Which saved layouts need a person's attention, judged from the stored
// layout document alone (no board is laid out): defects recorded when the
// layout was saved, and fixed layouts an edit or a board-size change has
// outdated. The puzzle list marks these on its Layouts chips; the automatic
// layout pass (tools/layouts-auto.mjs) counts defects the same way.

import { LAYOUT_MODES, layoutRevision, normalizeLayoutDocument } from "./layoutDocument.js";
import { layoutIsFixed } from "./layoutHints.js";
import { boardCanvas } from "./puzzleBoardSize.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";

// Defects players would notice as severity tiers, most severe first, the
// way each engine's own scoring ranks a finished layout (graphLayout
// scoreGraphGeometry, setRenderer scoreCircleCandidate, starRenderer
// comparePrettyLayouts). Graph's hardOverlaps already includes overlaps;
// Circle weighs lines through headings and through circles the same, so
// they share a tier (a tier listing several metrics compares their sum).
export const DEFECT_TIERS = {
  graph: ["hardOverlaps", "lineCrossings", "edgeNodeIntersections"],
  sets: ["hardOverlaps", "lineCrossings", ["lineHeadingIntersections", "lineCircleIntersections"]],
  star: ["lineCrossings", "edgeTitleIntersections", "edgeNodeIntersections", "overlaps"]
};

export const tierKeys = tier => (Array.isArray(tier) ? tier : [tier]);
export const tierCount = (counts, tier) => tierKeys(tier).reduce((sum, key) => sum + (counts?.[key] || 0), 0);

/** Nonzero defect counts by metric, plus their total (null without metrics). */
export function layoutDefects(mode, metrics) {
  if (!metrics) return { total: null };
  const found = Object.fromEntries(DEFECT_TIERS[mode].flatMap(tierKeys)
    .map(key => [key, Number(metrics[key]) || 0])
    .filter(([, count]) => count > 0));
  return { ...found, total: Object.values(found).reduce((sum, count) => sum + count, 0) };
}

/**
 * Per saved mode: `defects` (from the saved metrics), `fixed`, and `stale`
 * -- a fixed layout whose puzzle revision or board size no longer matches,
 * so players get it as a hint (Graph, Circle) or adapted (Star) and its
 * saved metrics no longer describe their board. Hints are always searched
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
      const board = boardCanvas(sized, mode);
      stale = saved.puzzleRevision !== revision ||
        Number(saved.board?.width) !== board.width ||
        Number(saved.board?.height) !== board.height;
    }
    result[mode] = { fixed, stale, defects: layoutDefects(mode, saved.metrics) };
  });
  return result;
}
