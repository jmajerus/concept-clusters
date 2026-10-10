// A board-size change adds or removes an even margin all round: every
// position keeps its place relative to the board's centre. A saved layout
// whose only difference from the current board is its size therefore stays
// exact wherever it still fits, rather than falling back to a hint (Graph,
// Circle) or being scaled (Star).

import { LAYOUT_MODES, layoutRevision, normalizeLayoutDocument } from "./layoutDocument.js";
import { layoutIsFixed } from "./layoutHints.js";

// Coordinate maps a layout document can carry: Graph and Star `nodes`,
// Circle `circles` and `bridges`.
const POINT_GROUPS = ["nodes", "circles", "bridges"];

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function boardOf(layout) {
  const width = Number(layout?.board?.width);
  const height = Number(layout?.board?.height);
  return width > 0 && height > 0 ? { width, height } : null;
}

/** The layout moved onto `board`, centred as it was; unchanged when the size already matches. */
export function recentreLayoutDocument(layout, board) {
  const saved = boardOf(layout);
  if (!saved || !board || (saved.width === board.width && saved.height === board.height)) return layout;
  const dx = (board.width - saved.width) / 2;
  const dy = (board.height - saved.height) / 2;
  const next = { ...layout, board: { ...layout.board, width: board.width, height: board.height } };
  // A Star player snapshot's free strip sits above the board, down to
  // viewBoxY; that bound moves with the nodes.
  if (Number.isFinite(Number(layout.board.viewBoxY))) next.board.viewBoxY = Number(layout.board.viewBoxY) + dy;
  POINT_GROUPS.forEach(group => {
    if (!isObject(layout[group])) return;
    next[group] = Object.fromEntries(Object.entries(layout[group]).map(([key, point]) => [
      key,
      isObject(point) && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y))
        ? { ...point, x: Number(point.x) + dx, y: Number(point.y) + dy }
        : point
    ]));
  });
  return next;
}

/** Whether every saved position lies on the layout's own board (or its Star strip band above it). */
export function layoutPointsFitBoard(layout) {
  const board = boardOf(layout);
  if (!board) return false;
  const top = Math.min(0, Number(layout.board.viewBoxY) || 0);
  return POINT_GROUPS.every(group => !isObject(layout[group]) || Object.values(layout[group]).every(point =>
    !isObject(point) ||
    (Number(point.x) >= 0 && Number(point.x) <= board.width && Number(point.y) >= top && Number(point.y) <= board.height)
  ));
}

/**
 * The saved layout for `mode` re-centred onto `board` when the puzzle is
 * unchanged and only the size differs, and everything still fits; null
 * when that does not apply (no layout, a hint, an edited puzzle, already
 * the right size, or it would not fit).
 */
export function recentredSavedLayout(layoutDocument, puzzle, mode, board) {
  const saved = normalizeLayoutDocument(layoutDocument)?.modes?.[mode];
  if (!saved || !board) return null;
  if (mode !== "star" && !layoutIsFixed(saved)) return null;
  if (saved.puzzleRevision !== layoutRevision(puzzle)) return null;
  const moved = recentreLayoutDocument(saved, board);
  if (moved === saved) return null;
  return layoutPointsFitBoard(moved) ? moved : null;
}

/**
 * The layout document with each listed mode's saved layout re-centred onto
 * `board` where recentredSavedLayout applies; the same document otherwise.
 * Used in memory on load and on a size change, never written back.
 */
export function recentreSavedModes(layoutDocument, puzzle, board, modes = LAYOUT_MODES) {
  const normalized = normalizeLayoutDocument(layoutDocument);
  if (!normalized) return layoutDocument;
  let changed = false;
  const nextModes = { ...normalized.modes };
  modes.forEach(mode => {
    const moved = recentredSavedLayout(normalized, puzzle, mode, board);
    if (moved) {
      nextModes[mode] = moved;
      changed = true;
    }
  });
  return changed ? { ...normalized, modes: nextModes } : layoutDocument;
}
