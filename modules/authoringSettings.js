// Strictly authoring/editorial settings — credit wording, host display
// labels, and related attribution knobs. Not deployment, ports, or MCP URLs.
//
// Credit model: parse known bylines into { hosts, author }, then render with
// the preferred template. `accept` patterns are the only rewrite vocabulary;
// grow them when a real puzzle line fails to parse — do not invent ahead.
// Templates use {hosts} and {author}.

export const AUTHORING_SETTINGS = Object.freeze({
  credit: Object.freeze({
    maxLength: 160,
    // When Access/JWT has no display name, suggestions can use this.
    // null = fall back to email local-part when available.
    defaultAuthorName: "John Majerus",
    // Template id used when both hosts and author are known.
    // Switch to "compact" for shorter bylines across suggestions + corpus.
    preferred: "directed",
    templates: Object.freeze({
      directed: "By {hosts}, with editorial direction by {author}",
      compact: "{hosts}; editor: {author}",
      draftedOnly: "Drafted with {hosts}",
      humanOnly: "By {author}"
    }),
    // Ordered; first match wins. hosts/author are 1-based capture groups.
    accept: Object.freeze([
      Object.freeze({
        id: "directed",
        pattern: /^By\s+(.+?),\s*with editorial direction by\s+(.+)$/i,
        hosts: 1,
        author: 2
      }),
      Object.freeze({
        id: "legacyAssist",
        pattern: /^By\s+(.+?),\s*with assistance from\s+(.+)$/i,
        author: 1,
        hosts: 2
      }),
      Object.freeze({
        id: "compact",
        pattern: /^(.+?);\s*editor:\s*(.+)$/i,
        hosts: 1,
        author: 2
      }),
      Object.freeze({
        id: "draftedOnly",
        pattern: /^Drafted with\s+(.+)$/i,
        hosts: 1
      }),
      Object.freeze({
        id: "assistedBy",
        pattern: /^Assisted by\s+(.+)$/i,
        hosts: 1
      }),
      Object.freeze({
        id: "humanOnly",
        pattern: /^By\s+([^,;]+)$/i,
        author: 1
      })
    ]),
    // Examples shown in schema/guidance/drafts UI (not live identity).
    exampleHost: "Cursor",
    exampleAuthor: "Jane Doe"
  }),
  hosts: Object.freeze({
    // When a call frame exposes a model (Codex today), append it to the
    // system label: "Codex (gpt-5.6-sol)".
    includeModelInLabel: true,
    labels: Object.freeze({
      cursor: Object.freeze({ system: "Cursor", provider: "Cursor" }),
      "claude-code": Object.freeze({ system: "Claude Code", provider: "Anthropic" }),
      claude: Object.freeze({ system: "Claude", provider: "Anthropic" }),
      copilot: Object.freeze({ system: "GitHub Copilot", provider: "Microsoft" }),
      "gemini-cli": Object.freeze({ system: "Gemini CLI", provider: "Google" }),
      codex: Object.freeze({ system: "Codex", provider: "OpenAI" })
    })
  })
});

export function fillAuthoringTemplate(template, vars = {}) {
  return String(template ?? "").replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars[key];
    return value == null ? "" : String(value);
  });
}

export function authoringHostLabel(hostId, settings = AUTHORING_SETTINGS) {
  return settings.hosts?.labels?.[hostId] || null;
}

/**
 * Known-host row for a contributor name (exact or "Label (model…)" prefix).
 * Used to infer generative kind and to drop derivable provider on store.
 */
export function knownHostLabelForName(name, settings = AUTHORING_SETTINGS) {
  if (typeof name !== "string" || !name.trim()) return null;
  const needle = name.trim().toLowerCase();
  for (const label of Object.values(settings.hosts?.labels || {})) {
    const system = typeof label?.system === "string" ? label.system.trim().toLowerCase() : "";
    if (!system) continue;
    if (needle === system || needle.startsWith(`${system} (`)) return label;
  }
  return null;
}

/**
 * True when `name` matches a known MCP/host system label (exact or
 * "Label (model…)" prefix). Used to infer generative vs human contributors
 * so agents can send bare names.
 */
export function isKnownGenerativeSystemName(name, settings = AUTHORING_SETTINGS) {
  return Boolean(knownHostLabelForName(name, settings));
}

export function preferredCreditTemplateId(settings = AUTHORING_SETTINGS) {
  const preferred = settings.credit?.preferred;
  const templates = settings.credit?.templates || {};
  if (preferred && templates[preferred]) return preferred;
  return templates.directed ? "directed" : Object.keys(templates)[0] || "directed";
}

export function preferredLessonCreditExample(settings = AUTHORING_SETTINGS) {
  const credit = settings.credit || {};
  const id = preferredCreditTemplateId(settings);
  return fillAuthoringTemplate(credit.templates?.[id], {
    hosts: credit.exampleHost || "Cursor",
    author: credit.exampleAuthor || "Jane Doe"
  });
}

export function lessonCreditFieldDescription(settings = AUTHORING_SETTINGS) {
  const credit = settings.credit || {};
  const preferred = preferredLessonCreditExample(settings);
  const human = fillAuthoringTemplate(credit.templates?.humanOnly, {
    author: credit.exampleAuthor || "Jane Doe"
  });
  return (
    "Optional lesson byline the human sets on the drafts page. Preferred " +
    `shape when an MCP host drafted under human direction: "${preferred}". ` +
    `Human-only: "${human}". Omit for no footnote. Do not put this in ` +
    "content.text. Authoring agents must not write this field."
  );
}

export function lessonCreditSuggestionHint(settings = AUTHORING_SETTINGS) {
  const example = preferredLessonCreditExample(settings);
  return (
    `Preferred shape names the drafting host(s) and your editorial role, e.g. “${example}”. ` +
    "Applying appends another host when one is missing, or rewrites a known variant to the preferred wording. You remain accountable for the published text."
  );
}

export default AUTHORING_SETTINGS;
