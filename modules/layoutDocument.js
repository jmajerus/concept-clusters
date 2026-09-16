// Renderer-neutral persistence envelope for authored layout overrides.
// Individual renderers own the shape and validation of their mode payload;
// this module only owns the common container and legacy Star normalization.

export const LAYOUT_DOCUMENT_SCHEMA_VERSION = 1;
const MAX_LAYOUT_JSON_BYTES = 900_000;

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
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
  const current = normalizeLayoutDocument(existing);
  const modes = { ...(current?.modes || {}) };
  if (value == null) delete modes[mode];
  else modes[mode] = clone(value);
  return Object.keys(modes).length
    ? {
        schemaVersion: LAYOUT_DOCUMENT_SCHEMA_VERSION,
        modes
      }
    : null;
}

export function parseLayoutDocument(text, label = "Stored layout") {
  if (text == null || text === "") return null;
  try {
    return normalizeLayoutDocument(typeof text === "string" ? JSON.parse(text) : text);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON: ${error.message}`);
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
