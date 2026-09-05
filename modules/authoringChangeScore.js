// Mechanical "how much changed" signal for one save_puzzle_draft write,
// diffing the incoming document against what was previously stored. Used
// only to decide whether an MCP save is substantial enough to auto-credit
// the calling client as a provenance contributor (see mcpClientIdentity.js).
// Deliberately structural/quantitative, not editorial: it counts fields and
// characters, it never judges what the words say. It is not stored anywhere
// and is not an edit log -- see docs/dev-briefs/authoring-provenance-shape.md
// ("Non-goals: not an edit log or changelog").

// provenance/generativeAssistance are attribution metadata, not puzzle
// content -- diffing them would make the trigger circular (the previous
// stamp decision would influence the next one).
const DEFAULT_EXCLUDE_KEYS = Object.freeze(["provenance", "generativeAssistance"]);

/** Stable key for one array item: its own id when present, else its index. */
function arrayItemKey(item, index) {
  if (item && typeof item === "object" && !Array.isArray(item) && typeof item.id === "string" && item.id) {
    return item.id;
  }
  return String(index);
}

function flattenLeaves(value, path, out) {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenLeaves(item, `${path}[${arrayItemKey(item, index)}]`, out));
    return;
  }
  if (typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      flattenLeaves(entry, path ? `${path}.${key}` : key, out);
    }
    return;
  }
  out.set(path, value);
}

function flattenDocument(document, excludeKeys) {
  const out = new Map();
  if (!document || typeof document !== "object" || Array.isArray(document)) return out;
  for (const [key, value] of Object.entries(document)) {
    if (excludeKeys.includes(key)) continue;
    flattenLeaves(value, key, out);
  }
  return out;
}

/**
 * Diff two documents into a mechanical change score:
 * - fieldsChanged: leaf paths added, removed, or changed in value.
 * - charsAdded: net new characters across string leaves (shrinking a string,
 *   or leaving it alone, adds nothing -- this counts new prose, not churn).
 * - charsChanged: text volume affected by changed string leaves. This catches
 *   a substantial same-length rewrite that net-growth alone cannot see.
 */
export function computeChangeScore(beforeDocument, afterDocument, {
  excludeKeys = DEFAULT_EXCLUDE_KEYS
} = {}) {
  const before = flattenDocument(beforeDocument, excludeKeys);
  const after = flattenDocument(afterDocument, excludeKeys);

  let fieldsChanged = 0;
  let charsAdded = 0;
  let charsChanged = 0;
  for (const [path, afterValue] of after) {
    const hadBefore = before.has(path);
    const beforeValue = hadBefore ? before.get(path) : undefined;
    if (hadBefore && beforeValue === afterValue) continue;
    fieldsChanged += 1;
    if (typeof afterValue === "string") {
      const beforeLength = typeof beforeValue === "string" ? beforeValue.length : 0;
      charsAdded += Math.max(0, afterValue.length - beforeLength);
      charsChanged += Math.max(beforeLength, afterValue.length);
    }
  }
  for (const [path, beforeValue] of before) {
    if (!after.has(path)) {
      fieldsChanged += 1;
      if (typeof beforeValue === "string") charsChanged += beforeValue.length;
    }
  }
  return { fieldsChanged, charsAdded, charsChanged };
}

// Tunable defaults. Either threshold alone is enough to count as substantial:
// a small number of large edits (e.g. one long rewritten fact) and a large
// number of small edits (e.g. touching every lens) should both qualify.
export const CHANGE_SCORE_FIELD_THRESHOLD = 3;
export const CHANGE_SCORE_CHAR_THRESHOLD = 200;

export function isSubstantialChange(score, {
  fieldThreshold = CHANGE_SCORE_FIELD_THRESHOLD,
  charThreshold = CHANGE_SCORE_CHAR_THRESHOLD
} = {}) {
  if (!score) return false;
  const charsChanged = Number.isFinite(score.charsChanged)
    ? score.charsChanged
    : score.charsAdded;
  return score.fieldsChanged >= fieldThreshold || charsChanged >= charThreshold;
}
