// Frozen model vocabulary snapshot for local/offline use. D1 is the editable
// source of truth; Freeze refreshes this list from D1 before opening a release
// pull request. Not used for host inference — see authoringHosts.js.
//
// Cursor and Codex expose the same picker formatting; Codex's MCP client reports
// the chosen model as a slug (lowercase, spaces → hyphens). canonicalModelLabel()
// maps that slug back to the picker string via modelToHostSlug().

export const AUTHORING_MODEL_SUGGESTIONS = Object.freeze([
  "auto",
  "Composer 2.5",
  "Claude Opus 5",
  "Claude Sonnet 5",
  "Claude Sonnet 4.6",
  "Claude Opus 4.8",
  "Claude Opus 4.7",
  "Claude Opus 4.6",
  "Claude Opus 4.5",
  "Claude Sonnet 4.5",
  "Claude Sonnet 4",
  "Claude Haiku 4.5",
  "Claude Fable 5",
  "GPT-5.6 Sol",
  "GPT-5.6 Terra",
  "GPT-5.6 Luna",
  "GPT-5.5",
  "GPT-5.4",
  "GPT-5.4 Mini",
  "GPT-5.4 Nano",
  "GPT-5.2",
  "GPT-5.1",
  "GPT-5 Mini",
  "Gemini 3.7 Flash",
  "Gemini 3.6 Flash",
  "Gemini 3.5 Flash",
  "Gemini 3.1 Pro",
  "Gemini 3 Flash",
  "Gemini 2.5 Flash",
  "Cursor Grok 4.6",
  "Cursor Grok 4.5",
  "Codex 5.3",
  "Kimi K3",
  "Kimi K2.7 Code",
  "DeepSeek V4.1 Flash",
  "GLM 4.7",
  "GLM 4.7 Flash",
  "GLM 5 Turbo",
  "GLM 5.2",
  "GLM 5.2 Highspeed",
  "GLM 5.3",
  "GLM 5.3 Highspeed",
  "GLM 5.3 Flash",
  "Spark 2.0",
  "Spark 1.3",
  "Custom Model"
]);

const SKIP_CANONICAL = new Set(["auto", "custom model", "custom-model"]);

function configuredModelLabels(labels = []) {
  const seen = new Set();
  const result = [];
  for (const label of Array.isArray(labels) ? labels : []) {
    const candidate = typeof label === "string" ? label.trim() : "";
    const key = modelToHostSlug(candidate);
    if (!candidate || SKIP_CANONICAL.has(candidate.toLowerCase())
      || SKIP_CANONICAL.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

function compareModelSuggestionLabels(left, right) {
  const leftFolded = left.toLowerCase();
  const rightFolded = right.toLowerCase();
  if (leftFolded < rightFolded) return -1;
  if (leftFolded > rightFolded) return 1;
  return left < right ? -1 : left > right ? 1 : 0;
}

export function sortModelSuggestionLabels(labels = []) {
  return configuredModelLabels(labels).sort(compareModelSuggestionLabels);
}

export function modelSuggestionSnapshotLabels(labels = []) {
  return ["auto", ...sortModelSuggestionLabels(labels), "Custom Model"];
}

/**
 * Host slug for a picker label (Codex MCP reports models this way).
 * Example: "GPT-5.6 Sol" → "gpt-5.6-sol"
 */
export function modelToHostSlug(label) {
  return String(label ?? "").trim().toLowerCase().replace(/\s+/g, "-");
}

const CANONICAL_MODEL_BY_SLUG = new Map(
  AUTHORING_MODEL_SUGGESTIONS
    .filter(label => !SKIP_CANONICAL.has(label.trim().toLowerCase()))
    .map(label => [modelToHostSlug(label), label])
);

/**
 * Map a raw model string (picker label or host slug) to its canonical label
 * when recognized. D1-backed labels are passed as additionalLabels; unknown
 * strings pass through unchanged.
 */
export function canonicalModelLabel(model, additionalLabels = null) {
  if (typeof model !== "string" || !model.trim()) return "";
  const trimmed = model.trim();
  if (trimmed.toLowerCase() === "auto") return "auto";
  const slug = modelToHostSlug(trimmed);
  if (Array.isArray(additionalLabels)) {
    for (const candidate of configuredModelLabels(additionalLabels)) {
      if (modelToHostSlug(candidate) === slug) return candidate;
    }
    return trimmed;
  }
  const builtIn = CANONICAL_MODEL_BY_SLUG.get(slug);
  if (builtIn) return builtIn;
  return trimmed;
}

/**
 * Shared suggestion strings for any generative host's model field. When a
 * D1 list is supplied it is complete and authoritative; otherwise use the
 * frozen snapshot for offline/local fallback.
 */
export function modelSuggestionsForHost(configuredLabels = null, { authoritative = false } = {}) {
  if (!Array.isArray(configuredLabels)) {
    return modelSuggestionSnapshotLabels(AUTHORING_MODEL_SUGGESTIONS);
  }
  if (authoritative) return modelSuggestionSnapshotLabels(configuredLabels);

  // Preserve the historical helper contract for callers that pass only
  // additions. Runtime D1 callers pass the complete-catalog flag.
  const merged = new Map(configuredModelLabels(AUTHORING_MODEL_SUGGESTIONS)
    .map(label => [modelToHostSlug(label), label]));
  for (const label of configuredModelLabels(configuredLabels)) {
    merged.set(modelToHostSlug(label), label);
  }
  return modelSuggestionSnapshotLabels([...merged.values()]);
}

/** Replace only the exported array in this file, preserving the formatter. */
export function replaceAuthoringModelSuggestionsSource(source, labels = []) {
  const marker = "export const AUTHORING_MODEL_SUGGESTIONS = Object.freeze(";
  const markerIndex = source.indexOf(marker);
  const arrayStart = markerIndex < 0 ? -1 : source.indexOf("[", markerIndex + marker.length);
  const arrayEnd = arrayStart < 0 ? -1 : source.indexOf("\n]);", arrayStart);
  if (arrayStart < 0 || arrayEnd < 0) {
    throw new Error("Could not locate the frozen authoring model suggestion list");
  }
  const arraySource = `[\n${modelSuggestionSnapshotLabels(labels)
    .map(label => `  ${JSON.stringify(label)}`)
    .join(",\n")}\n]`;
  return `${source.slice(0, arrayStart)}${arraySource}${source.slice(arrayEnd + 2)}`;
}
