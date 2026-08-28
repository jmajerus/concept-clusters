// UI-only model name suggestions for the drafts-page provenance editor.
// Not used for host inference or MCP stamping — see authoringHosts.js for that.
// One shared list: picker models are not unique to a single MCP host (Cursor,
// Codex, Claude Code, etc. may all run overlapping model families).

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

/** Shared suggestion strings for any generative host's model field. */
export function modelSuggestionsForHost() {
  return AUTHORING_MODEL_SUGGESTIONS;
}
