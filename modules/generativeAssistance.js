// Compact current-attribution for generative-AI help on a puzzle.
// Not an edit log: one entry per system+scope, updated in place when the
// same assistant keeps working that scope. Credit wording comes from
// modules/authoringSettings.js: parse known bylines → { hosts, author },
// then render with the preferred template.
import {
  AUTHORING_SETTINGS,
  fillAuthoringTemplate,
  preferredCreditTemplateId
} from "./authoringSettings.js";

export const GENERATIVE_ASSISTANCE_SCOPES = new Set([
  "learningIntroduction",
  "puzzle",
  "lenses"
]);

export const GENERATIVE_ASSISTANCE_ROLES = new Set([
  "drafted",
  "edited"
]);

export const MAX_LESSON_CREDIT_LENGTH = AUTHORING_SETTINGS.credit.maxLength;

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
}

function creditSettings(settings = AUTHORING_SETTINGS) {
  return settings.credit || AUTHORING_SETTINGS.credit;
}

function applyCreditLength(suggested, settings = AUTHORING_SETTINGS) {
  if (!suggested) return null;
  const max = creditSettings(settings).maxLength || MAX_LESSON_CREDIT_LENGTH;
  if (suggested.length > max) return null;
  return suggested;
}

export function validateGenerativeAssistance(raw, label = "generativeAssistance") {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length === 0) {
    return [`${label} must be a non-empty array when present`];
  }
  const errors = [];
  const seen = new Set();
  raw.forEach((entry, index) => {
    const entryLabel = `${label}[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${entryLabel} must be an object`);
      return;
    }
    if (!nonEmptyString(entry.system)) {
      errors.push(`${entryLabel}.system must be a non-empty string`);
    }
    if (!GENERATIVE_ASSISTANCE_SCOPES.has(entry.scope)) {
      errors.push(
        `${entryLabel}.scope must be one of ${[...GENERATIVE_ASSISTANCE_SCOPES].join(", ")}`
      );
    }
    if (entry.role !== undefined && !GENERATIVE_ASSISTANCE_ROLES.has(entry.role)) {
      errors.push(
        `${entryLabel}.role must be one of ${[...GENERATIVE_ASSISTANCE_ROLES].join(", ")} when present`
      );
    }
    for (const key of ["provider", "date"]) {
      if (entry[key] !== undefined && !nonEmptyString(entry[key])) {
        errors.push(`${entryLabel}.${key} must be a non-empty string when present`);
      }
    }
    if (entry.date !== undefined && nonEmptyString(entry.date) &&
        !/^\d{4}-\d{2}-\d{2}$/.test(entry.date.trim())) {
      errors.push(`${entryLabel}.date must be YYYY-MM-DD when present`);
    }
    if (nonEmptyString(entry.system) && GENERATIVE_ASSISTANCE_SCOPES.has(entry.scope)) {
      const key = `${entry.system.trim().toLowerCase()}::${entry.scope}`;
      if (seen.has(key)) {
        errors.push(
          `${entryLabel} duplicates system+scope "${entry.system.trim()}" / ${entry.scope}; update in place instead of appending`
        );
      }
      seen.add(key);
    }
  });
  return errors;
}

// Replace-or-append by case-insensitive system + scope. Callers use this
// when stamping assistance so minor follow-up edits don't grow the list.
export function upsertGenerativeAssistance(list, entry) {
  const next = {
    system: entry.system.trim(),
    scope: entry.scope,
    ...(entry.provider ? { provider: entry.provider.trim() } : {}),
    ...(entry.role ? { role: entry.role } : { role: "drafted" }),
    ...(entry.date ? { date: entry.date.trim() } : {})
  };
  const key = `${next.system.toLowerCase()}::${next.scope}`;
  const result = Array.isArray(list) ? [...list] : [];
  const index = result.findIndex(existing =>
    existing &&
    typeof existing.system === "string" &&
    `${existing.system.trim().toLowerCase()}::${existing.scope}` === key
  );
  if (index < 0) result.push(next);
  else result[index] = { ...result[index], ...next };
  return result;
}

export function systemsForLessonCredit(entries) {
  const seen = new Set();
  const systems = [];
  for (const entry of entries || []) {
    if (entry?.scope !== "learningIntroduction" && entry?.scope !== "puzzle") {
      continue;
    }
    if (!nonEmptyString(entry.system)) continue;
    const system = entry.system.trim();
    const key = system.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    systems.push(system);
  }
  return systems;
}

export function formatSystemsList(systems) {
  const list = (systems || []).map(s => String(s).trim()).filter(Boolean);
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list.at(-1)}`;
}

// Split a human-authored "A and B" / "A, B, and C" assistance list without
// treating "and" inside a single product name as a separator when possible.
export function parseSystemsList(text) {
  const raw = typeof text === "string" ? text.trim() : "";
  if (!raw) return [];
  if (raw.includes(",")) {
    return raw
      .split(",")
      .map(part => part.replace(/^\s*and\s+/i, "").trim())
      .filter(Boolean);
  }
  const andParts = raw.split(/\s+and\s+/i).map(part => part.trim()).filter(Boolean);
  return andParts.length ? andParts : [raw];
}

function mergeSystemNames(existing, additions) {
  const merged = [...existing];
  for (const system of additions || []) {
    if (!merged.some(item => item.toLowerCase() === system.toLowerCase())) {
      merged.push(system);
    }
  }
  return merged;
}

function groupText(match, index) {
  if (typeof index !== "number" || index < 1) return "";
  const value = match[index];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Parse a lesson byline via authoringSettings.credit.accept.
 * Returns { hosts, author, acceptId } or null when no pattern matches.
 */
export function parseLessonCredit(text, settings = AUTHORING_SETTINGS) {
  const credit = typeof text === "string" ? text.trim() : "";
  if (!credit) return null;
  const accept = creditSettings(settings).accept || [];
  for (const rule of accept) {
    if (!rule?.pattern) continue;
    const match = credit.match(rule.pattern);
    if (!match) continue;
    const hostsText = groupText(match, rule.hosts);
    const authorText = groupText(match, rule.author);
    return {
      hosts: hostsText ? parseSystemsList(hostsText) : [],
      author: authorText || null,
      acceptId: rule.id || null
    };
  }
  return null;
}

/**
 * Render { hosts, author } with the preferred template (or drafted/human
 * fallbacks when one side is missing).
 */
export function renderLessonCredit(
  { hosts = [], author = null } = {},
  settings = AUTHORING_SETTINGS
) {
  const hostList = formatSystemsList(hosts);
  const authorName = typeof author === "string" ? author.trim() : "";
  const templates = creditSettings(settings).templates || {};
  if (!hostList) {
    return authorName
      ? fillAuthoringTemplate(templates.humanOnly, { author: authorName })
      : null;
  }
  if (!authorName) {
    return fillAuthoringTemplate(templates.draftedOnly, { hosts: hostList });
  }
  const preferredId = preferredCreditTemplateId(settings);
  const template = templates[preferredId] || templates.directed;
  return fillAuthoringTemplate(template, { hosts: hostList, author: authorName });
}

// Player-facing fallback when learningIntroduction.credit is absent.
export function formatAssistanceCredit(entries, settings = AUTHORING_SETTINGS) {
  const systems = systemsForLessonCredit(entries);
  if (!systems.length) return null;
  return renderLessonCredit({ hosts: systems, author: null }, settings);
}

/**
 * Preferred lesson byline when MCP hosts drafted under a named human.
 * Hosts are named as tools that produced draft text; the human remains the
 * accountable editor (aligned with COPE/CASRAI: AI is not a legal author).
 */
export function formatDirectedCredit(systems, authorName, settings = AUTHORING_SETTINGS) {
  return renderLessonCredit({ hosts: systems, author: authorName }, settings);
}

function resolveAuthorName(authorName, parsed, settings = AUTHORING_SETTINGS) {
  if (typeof authorName === "string" && authorName.trim()) return authorName.trim();
  if (parsed?.author) return parsed.author;
  const fallback = creditSettings(settings).defaultAuthorName;
  return typeof fallback === "string" && fallback.trim() ? fallback.trim() : null;
}

/**
 * Normalize a credit line (and optional assistance hosts) to the preferred
 * template. Used by suggestions and the corpus dry-run tool.
 * Returns null when unchanged or when the line cannot be safely rewritten.
 */
export function normalizeLessonCredit(
  currentCredit,
  {
    hosts = [],
    authorName = null,
    settings = AUTHORING_SETTINGS,
    allowOpaqueAppend = true
  } = {}
) {
  const credit = typeof currentCredit === "string" ? currentCredit.trim() : "";
  const assistanceHosts = (hosts || []).map(h => String(h).trim()).filter(Boolean);
  const parsed = credit ? parseLessonCredit(credit, settings) : null;
  const author = resolveAuthorName(authorName, parsed, settings);

  if (!credit) {
    return applyCreditLength(
      renderLessonCredit({ hosts: assistanceHosts, author }, settings),
      settings
    );
  }

  if (parsed) {
    const mergedHosts = mergeSystemNames(parsed.hosts, assistanceHosts);
    const suggested = renderLessonCredit(
      { hosts: mergedHosts, author: author || parsed.author },
      settings
    );
    if (!suggested || suggested === credit) return null;
    return applyCreditLength(suggested, settings);
  }

  // Unknown wording: only append missing assistance hosts; never invent a rewrite.
  const missing = assistanceHosts.filter(system =>
    !credit.toLowerCase().includes(system.toLowerCase())
  );
  if (!missing.length || !allowOpaqueAppend) return null;
  const appended = `${credit}; ${fillAuthoringTemplate(
    creditSettings(settings).templates.draftedOnly,
    { hosts: formatSystemsList(missing) }
  )}`;
  if (appended === credit) return null;
  return applyCreditLength(appended, settings);
}

/**
 * Suggest a lesson credit line from generativeAssistance using
 * authoringSettings credit templates. Appends newly seen hosts and rewrites
 * known variants to the preferred template. Returns null when unchanged.
 */
export function suggestLessonCredit(
  currentCredit,
  entries,
  { authorName = null, settings = AUTHORING_SETTINGS } = {}
) {
  return normalizeLessonCredit(currentCredit, {
    hosts: systemsForLessonCredit(entries),
    authorName,
    settings,
    allowOpaqueAppend: true
  });
}

// Human-owned lesson byline wins when present. Prefer resolveLessonByline()
// when provenance may be available (player lesson UI). generativeAssistance
// remains a fallback for published puzzles that never got credit or provenance.
export function lessonCredit(introduction, entries, settings = AUTHORING_SETTINGS) {
  const authored = typeof introduction?.credit === "string"
    ? introduction.credit.trim()
    : "";
  if (authored) return authored;
  return formatAssistanceCredit(entries, settings);
}
