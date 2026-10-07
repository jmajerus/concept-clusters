// Renderer-neutral persistence envelope for authored layout overrides.
// Individual renderers own the shape and validation of their mode payload;
// this module only owns the common container and legacy Star normalization.

import { derivedLarge, puzzleNodeCount } from "./puzzleBoardSize.js";

export const LAYOUT_DOCUMENT_SCHEMA_VERSION = 1;
export const LAYOUT_MODES = Object.freeze(["star", "graph", "sets"]);
const MAX_LAYOUT_JSON_BYTES = 900_000;

function revisionSignature(puzzle) {
  return JSON.stringify({
    id: puzzle.id,
    large: derivedLarge(puzzleNodeCount(puzzle)),
    clusters: puzzle.clusters.map(cluster => ({
      name: cluster.name,
      terms: cluster.terms
    })),
    bridges: puzzle.bridges.map(bridge => ({
      term: bridge.term,
      clusters: bridge.clusters,
      idealTerms: bridge.idealTerms || null
    }))
  });
}

// Shared invalidation token for every renderer's authored layout. It is a
// content fingerprint, not a security primitive: changing labels, cluster
// order, bridge topology, or ideal endpoints makes old coordinates stale.
export function layoutRevision(puzzle) {
  let hash = 0x811c9dc5;
  for (const char of revisionSignature(puzzle)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function emptyLayoutDocument() {
  return { schemaVersion: LAYOUT_DOCUMENT_SCHEMA_VERSION, modes: {} };
}

/**
 * Normalize the persisted layout envelope. Older development rows contain a
 * bare Star layout; reading those rows as a one-mode envelope keeps the
 * column rename and the mode expansion backward-compatible.
 */
export function normalizeLayoutDocument(layout) {
  if (layout == null) return null;
  if (!isObject(layout)) throw new Error("Layout must be a JSON object");
  if (isObject(layout.modes)) {
    if (layout.schemaVersion !== LAYOUT_DOCUMENT_SCHEMA_VERSION) {
      throw new Error(
        `Layout schemaVersion must be ${LAYOUT_DOCUMENT_SCHEMA_VERSION}`
      );
    }
    return clone(layout);
  }
  if (isObject(layout.nodes) && typeof layout.puzzleRevision === "string") {
    return {
      schemaVersion: LAYOUT_DOCUMENT_SCHEMA_VERSION,
      modes: { star: clone(layout) }
    };
  }
  throw new Error("Layout must contain a versioned modes object");
}

export function layoutForMode(layout, mode) {
  return normalizeLayoutDocument(layout)?.modes?.[mode] || null;
}

export function layoutDocumentForMode(mode, value, existing = null) {
  if (typeof mode !== "string" || !mode.trim()) {
    throw new Error("Layout mode is required");
  }
  if (!LAYOUT_MODES.includes(mode)) {
    throw new Error(`Unsupported layout mode "${mode}"`);
  }
  const current = normalizeLayoutDocument(existing);
  const modes = { ...(current?.modes || {}) };
  if (value == null) delete modes[mode];
  else modes[mode] = clone(value);
  if (Object.keys(modes).length || current?.board) {
    return {
      schemaVersion: LAYOUT_DOCUMENT_SCHEMA_VERSION,
      modes,
      ...(current?.board ? { board: clone(current.board) } : {})
    };
  }
  // An explicit empty envelope distinguishes "all layout modes were
  // cleared" from "this draft has never had a layout". That distinction is
  // needed when a draft starts from a published layout snapshot.
  return current ? emptyLayoutDocument() : null;
}

export function parseLayoutDocument(text, label = "Stored layout") {
  if (text == null || text === "") return null;
  let parsed = text;
  if (typeof text === "string") {
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error(`${label} contains invalid JSON: ${error.message}`);
    }
  }
  try {
    return normalizeLayoutDocument(parsed);
  } catch (error) {
    throw new Error(`${label} has an unsupported shape: ${error.message}`);
  }
}

export function serializeLayoutDocument(layout) {
  const normalized = normalizeLayoutDocument(layout);
  if (normalized == null) return null;
  let json;
  try {
    json = JSON.stringify(normalized);
  } catch (error) {
    throw new Error(`Layout could not be serialized: ${error.message}`);
  }
  if (typeof json !== "string") throw new Error("Layout must serialize to JSON");
  if (new TextEncoder().encode(json).byteLength > MAX_LAYOUT_JSON_BYTES) {
    throw new Error("Layout is too large to store");
  }
  return json;
}

// A layout write found the row changed since the caller read it. Save
// endpoints re-read, re-check, and retry, so a concurrent save is never
// erased by one built on the older layout.
export class LayoutConflictError extends Error {
  constructor(id) {
    super(`The layout for "${id}" changed while it was being saved.`);
    this.name = "LayoutConflictError";
    this.status = 409;
  }
}

// Who made a saved layout: an author in layout authoring, or the automatic
// layout pass (tools/layouts-auto.mjs). Layouts saved before the tag
// existed were all made by authors.
export function layoutSource(value) {
  return value?.source === "auto" ? "auto" : "author";
}

// An automatic layout never replaces an author's. Returns the reason to
// refuse a save, or null when it may proceed.
export function autoLayoutConflict(mode, incoming, existing) {
  if (layoutSource(incoming) !== "auto") return null;
  const current = normalizeLayoutDocument(existing)?.modes?.[mode];
  return current && layoutSource(current) === "author"
    ? `An author's ${mode} layout is saved for this puzzle; the automatic layout pass never replaces it.`
    : null;
}

// The same check for a write that sends a whole layout document rather
// than one mode: every mode it carries is checked.
export function autoEnvelopeConflict(incoming, existing) {
  let document;
  try {
    document = normalizeLayoutDocument(incoming);
  } catch {
    return null; // malformed; validation rejects it
  }
  for (const [mode, value] of Object.entries(document?.modes || {})) {
    const conflict = autoLayoutConflict(mode, value, existing);
    if (conflict) return conflict;
  }
  return document?.board ? autoBoardConflict(document.board, existing) : null;
}

// Save endpoints stamp each mode's layout when it is saved, so publishing
// a working copy can tell which of two layouts for a mode is newer.
export function stampLayoutSaved(value, savedAt = new Date().toISOString()) {
  return value && typeof value === "object" ? { ...value, savedAt } : value;
}

// Whether a publish should keep the published puzzle's entry (a mode's
// layout, or the board settings) over the working copy's: an author's
// beats an automatic one, and between the same kind of maker the later
// save wins. Unstamped entries (saved before stamps existed) are oldest.
function keepPublishedEntry(mine, theirs) {
  const theirsAt = Date.parse(theirs?.savedAt || "");
  const oursAt = Date.parse(mine?.savedAt || "");
  const sameMaker = layoutSource(mine) === layoutSource(theirs);
  const authorOverAuto = layoutSource(theirs) === "author" && layoutSource(mine) === "auto";
  const newer = Number.isFinite(theirsAt) && (!Number.isFinite(oursAt) || theirsAt > oursAt);
  return authorOverAuto || (sameMaker && newer);
}

/**
 * The layout a publish should write. The working copy's layout normally
 * wins, but the published puzzle's entry for a mode -- or its board
 * settings -- is kept when it is an author's and the working copy's is
 * automatic, or when both are by the same kind of maker and the published
 * one was saved later. Publishing an older working copy so never
 * overwrites newer layout work, and an automatic layout never overwrites
 * an author's. `keptPublished` lists what was kept ("board" for the board
 * settings) so the author can be told.
 */
export function mergePublishLayout(draftLayout, publishedLayout) {
  const draft = normalizeLayoutDocument(draftLayout);
  const published = normalizeLayoutDocument(publishedLayout);
  if (!draft) return { layout: published ?? undefined, keptPublished: [] };
  if (!published) return { layout: draft, keptPublished: [] };
  const modes = { ...draft.modes };
  const keptPublished = [];
  Object.entries(published.modes).forEach(([mode, value]) => {
    const mine = draft.modes[mode];
    if (mine && keepPublishedEntry(mine, value)) {
      modes[mode] = clone(value);
      keptPublished.push(mode);
    }
  });
  // Board settings are only ever set, never cleared, so a working copy
  // without them simply has not touched them.
  let board = draft.board || published.board || null;
  if (draft.board && published.board && keepPublishedEntry(draft.board, published.board)) {
    board = published.board;
    keptPublished.push("board");
  }
  return {
    layout: {
      schemaVersion: LAYOUT_DOCUMENT_SCHEMA_VERSION,
      modes,
      ...(board ? { board: clone(board) } : {})
    },
    keptPublished
  };
}

// Board settings that belong to layout rather than to puzzle content. They
// live at the top of the layout document, beside the per-mode layouts, and
// save and publish the same way. `null` is an explicit "use the default",
// which overrides a value an older puzzle document still carries.
export const LAYOUT_BOARD_KEYS = Object.freeze(["sizeFactor", "starFreeStrip"]);

/**
 * A board setting for a runtime puzzle: the layout document's value when it
 * has the key (null meaning the default), else the value older puzzle
 * documents carried in `board`. Returns undefined for "not set".
 */
export function layoutBoardSetting(puzzle, key) {
  const board = puzzle?.layout?.board;
  if (board && Object.prototype.hasOwnProperty.call(board, key)) {
    return board[key] ?? undefined;
  }
  return puzzle?.board?.[key];
}

// The layout document after changing board settings: `changes` keys are
// merged into the existing settings (undefined removes a key).
export function layoutDocumentWithBoard(changes, existing = null) {
  const current = normalizeLayoutDocument(existing);
  const board = { ...(current?.board || {}) };
  Object.entries(changes || {}).forEach(([key, value]) => {
    if (value === undefined) delete board[key];
    else board[key] = value;
  });
  const settings = Object.keys(board).filter(key => LAYOUT_BOARD_KEYS.includes(key));
  return {
    schemaVersion: LAYOUT_DOCUMENT_SCHEMA_VERSION,
    modes: { ...(current?.modes || {}) },
    ...(settings.length ? { board } : {})
  };
}

// An automatic board size never replaces one an author chose.
export function autoBoardConflict(incoming, existing) {
  if (layoutSource(incoming) !== "auto") return null;
  const current = normalizeLayoutDocument(existing)?.board;
  return current && layoutSource(current) === "author"
    ? "An author's board settings are saved for this puzzle; the automatic layout pass never replaces them."
    : null;
}

/** Shape problems in a layout document's board settings. */
export function boardSettingsErrors(board, canonicalSizeFactor) {
  if (board == null) return [];
  if (typeof board !== "object" || Array.isArray(board)) return ["board settings must be an object"];
  const errors = [];
  Object.keys(board).forEach(key => {
    if (![...LAYOUT_BOARD_KEYS, "source", "savedAt"].includes(key)) {
      errors.push(`unknown board setting "${key}"`);
    }
  });
  if (board.sizeFactor != null && canonicalSizeFactor(board.sizeFactor) == null) {
    errors.push("board sizeFactor must be a 5% step from 0.75 to 1.25");
  }
  if (board.starFreeStrip != null && typeof board.starFreeStrip !== "boolean") {
    errors.push("board starFreeStrip must be true, false, or null");
  }
  if (board.source != null && !["author", "auto"].includes(board.source)) {
    errors.push('board source must be "author" or "auto"');
  }
  return errors;
}
