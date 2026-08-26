// Compact current-attribution for generative-AI help on a puzzle.
// Not an edit log: one entry per system+scope, updated in place when the
// same assistant keeps working that scope. The lesson byline is the
// human-owned learningIntroduction.credit field; this module still formats
// a fallback "Assisted by …" line from older generativeAssistance entries.

export const GENERATIVE_ASSISTANCE_SCOPES = new Set([
  "learningIntroduction",
  "puzzle",
  "lenses"
]);

export const GENERATIVE_ASSISTANCE_ROLES = new Set([
  "drafted",
  "edited"
]);

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
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

export function formatAssistanceCredit(entries) {
  const systems = systemsForLessonCredit(entries);
  if (!systems.length) return null;
  if (systems.length === 1) return `Assisted by ${systems[0]}`;
  if (systems.length === 2) return `Assisted by ${systems[0]} and ${systems[1]}`;
  return `Assisted by ${systems.slice(0, -1).join(", ")}, and ${systems.at(-1)}`;
}

export const MAX_LESSON_CREDIT_LENGTH = 160;

// Human-owned lesson byline wins. generativeAssistance remains a fallback
// for published puzzles that never got a one-line credit field.
export function lessonCredit(introduction, entries) {
  const authored = typeof introduction?.credit === "string"
    ? introduction.credit.trim()
    : "";
  if (authored) return authored;
  return formatAssistanceCredit(entries);
}
