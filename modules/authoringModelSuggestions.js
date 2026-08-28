// Shared model vocabulary for authoring attribution: picker suggestions and
// canonical display labels. Not used for host inference — see authoringHosts.js.
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
  "GLM 5.2",
  "Custom Model"
]);

const SKIP_CANONICAL = new Set(["auto", "custom model"]);

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
 * Map a raw model string (picker label or host slug) to the canonical picker
 * label when recognized. Unknown strings pass through unchanged.
 */
export function canonicalModelLabel(model) {
  if (typeof model !== "string" || !model.trim()) return "";
  const trimmed = model.trim();
  if (trimmed.toLowerCase() === "auto") return "auto";
  return CANONICAL_MODEL_BY_SLUG.get(modelToHostSlug(trimmed)) || trimmed;
}

/** Shared suggestion strings for any generative host's model field. */
export function modelSuggestionsForHost() {
  return AUTHORING_MODEL_SUGGESTIONS;
}
