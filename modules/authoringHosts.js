// Master registry of known generative authoring hosts (display labels and
// providers). Add a new agent here when it should count as generative in
// provenance, lesson bylines, and contributor inference.
//
// For MCP auto-stamp on draft create/save, also add a fingerprint rule in
// modules/mcpClientIdentity.js with the same `id` key as the label entry.
//
// Lesson-credit templates and parse patterns live in authoringSettings.js.
// Model picker + canonical labels (drafts UI, bylines): authoringModelSuggestions.js.

export const AUTHORING_HOSTS = Object.freeze({
  // When a call frame exposes a model (Codex today), append it to the
  // system label: "Codex (gpt-5.6-sol)".
  includeModelInLabel: true,
  labels: Object.freeze({
    cursor: Object.freeze({ system: "Cursor", provider: "Cursor" }),
    "claude-code": Object.freeze({ system: "Claude Code", provider: "Anthropic" }),
    claude: Object.freeze({ system: "Claude", provider: "Anthropic" }),
    copilot: Object.freeze({ system: "GitHub Copilot", provider: "Microsoft" }),
    gemini: Object.freeze({ system: "Gemini", provider: "Google" }),
    "gemini-cli": Object.freeze({ system: "Gemini CLI", provider: "Google" }),
    codex: Object.freeze({ system: "Codex", provider: "OpenAI" })
  })
});

function hostConfig(settings) {
  return settings?.hosts ?? AUTHORING_HOSTS;
}

export function authoringHostLabel(hostId, settings) {
  return hostConfig(settings).labels?.[hostId] || null;
}

/**
 * Known-host row for a contributor name (exact or "Label (model…)" prefix).
 * Used to infer generative kind and to drop derivable provider on store.
 */
export function knownHostLabelForName(name, settings) {
  if (typeof name !== "string" || !name.trim()) return null;
  const needle = name.trim().toLowerCase();
  for (const label of Object.values(hostConfig(settings).labels || {})) {
    const system = typeof label?.system === "string" ? label.system.trim().toLowerCase() : "";
    if (!system) continue;
    if (needle === system || needle.startsWith(`${system} (`)) return label;
    // Freeform credits sometimes suffix a host ("by Gemini AI") without the
    // parenthetical model form; only recognize short product tails.
    if (needle.startsWith(`${system} `)) {
      const rest = needle.slice(system.length + 1).trim();
      if (rest === "ai" || rest === "cli") return label;
    }
  }
  return null;
}

/**
 * True when `name` matches a known MCP/host system label (exact or
 * "Label (model…)" prefix). Used to infer generative vs human contributors
 * so agents can send bare names.
 */
export function isKnownGenerativeSystemName(name, settings) {
  return Boolean(knownHostLabelForName(name, settings));
}
