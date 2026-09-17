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
  if (Object.keys(modes).length) {
    return {
      schemaVersion: LAYOUT_DOCUMENT_SCHEMA_VERSION,
      modes
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
