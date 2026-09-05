// Compact two-axis authoring provenance (see docs/dev-briefs/authoring-provenance-shape.md).
// Model of record: collaboration mode + contributor names, plus optional
// client settings and author-owned reviewedBy. Kind is derived on read when
// a name matches authoringHosts.js; provider data is never retained. Agents
// therefore
// round-trip a lean document on get_puzzle_draft. Player bylines are L1
// projections; agents are taught L2 only. Dates/roles/scopes stay L3 / unused.
import {
  AUTHORING_SETTINGS,
  fillAuthoringTemplate,
  isKnownGenerativeSystemName,
  knownHostLabelForName,
  preferredCreditTemplateId
} from "./authoringSettings.js";
import { canonicalModelLabel } from "./authoringModelSuggestions.js";
import {
  formatAssistanceCredit,
  formatSystemsList,
  parseLessonCredit
} from "./generativeAssistance.js";

export const AUTHORING_PROVENANCE_COLLABORATION = Object.freeze([
  "human",
  "humanPrimary",
  "aiPrimary",
  "ai"
]);

export const AUTHORING_PROVENANCE_KINDS = Object.freeze(["human", "generative"]);

/** Client reasoning/effort tier used during drafting (L3; optional). */
export const AUTHORING_PROVENANCE_REASONING_LEVELS = Object.freeze([
  "light",
  "medium",
  "high",
  "extraHigh",
  "ultra",
  "noThinking"
]);

/** Client UI toggle used during drafting (L3; optional). Unset = default/off. */
export const AUTHORING_PROVENANCE_SWITCHES = Object.freeze([
  "fast",
  "thinking"
]);

export const AUTHORING_PROVENANCE_SWITCH_LABELS = Object.freeze({
  fast: "Fast",
  thinking: "Thinking"
});

/** Author-owned reviewer name on the lesson byline. Not a contributor. */
export const AUTHORING_PROVENANCE_REVIEWED_BY_MAX = 80;

/** @deprecated Renamed to {@link AUTHORING_PROVENANCE_SWITCHES}. */
export const AUTHORING_PROVENANCE_SPEED_LEVELS = AUTHORING_PROVENANCE_SWITCHES;

/** @deprecated Renamed to {@link AUTHORING_PROVENANCE_SWITCH_LABELS}. */
export const AUTHORING_PROVENANCE_SPEED_LABELS = AUTHORING_PROVENANCE_SWITCH_LABELS;

const LEGACY_SPEED_LEVELS = Object.freeze(["normal", "max", "ultracode"]);
const LEGACY_SPEED_LABELS = Object.freeze({
  normal: "Normal",
  max: "Max",
  ultracode: "Ultracode"
});

export const AUTHORING_PROVENANCE_REASONING_LABELS = Object.freeze({
  light: "Light",
  medium: "Medium",
  high: "High",
  extraHigh: "Extra High",
  ultra: "Ultra",
  noThinking: "No Thinking"
});

const COLLABORATION_SET = new Set(AUTHORING_PROVENANCE_COLLABORATION);
const KIND_SET = new Set(AUTHORING_PROVENANCE_KINDS);
const REASONING_SET = new Set(AUTHORING_PROVENANCE_REASONING_LEVELS);
const SWITCH_SET = new Set(AUTHORING_PROVENANCE_SWITCHES);
const LEGACY_SPEED_SET = new Set(LEGACY_SPEED_LEVELS);

const CLIENT_TIER_LABELS = Object.freeze(
  [
    ...Object.values(AUTHORING_PROVENANCE_REASONING_LABELS),
    ...Object.values(AUTHORING_PROVENANCE_SWITCH_LABELS),
    ...Object.values(LEGACY_SPEED_LABELS)
  ].sort((a, b) => b.length - a.length)
);

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
}

/** Peel trailing reasoning/switch labels off a model string (longest match first). */
export function stripClientTierLabelsFromModel(model) {
  let rest = typeof model === "string" ? model.trim() : "";
  let changed = true;
  while (changed && rest) {
    changed = false;
    for (const label of CLIENT_TIER_LABELS) {
      if (rest === label) return "";
      const suffix = ` ${label}`;
      if (rest.endsWith(suffix)) {
        rest = rest.slice(0, -suffix.length).trim();
        changed = true;
        break;
      }
    }
  }
  return rest;
}

export function normalizeReasoningLevel(value) {
  if (!nonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  if (REASONING_SET.has(trimmed)) return trimmed;
  const match = Object.entries(AUTHORING_PROVENANCE_REASONING_LABELS)
    .find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
  return match ? match[0] : undefined;
}

export function normalizeClientSwitch(value) {
  if (!nonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  if (SWITCH_SET.has(trimmed)) return trimmed;
  const match = Object.entries(AUTHORING_PROVENANCE_SWITCH_LABELS)
    .find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
  return match ? match[0] : undefined;
}

function migrateLegacySpeedField(value) {
  if (!nonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  if (trimmed === "fast" || trimmed.toLowerCase() === "fast") return "fast";
  if (LEGACY_SPEED_SET.has(trimmed)) return undefined;
  const legacy = Object.entries(LEGACY_SPEED_LABELS)
    .find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
  if (legacy) return undefined;
  return undefined;
}

/** @deprecated Use {@link normalizeClientSwitch}. */
export function normalizeSpeedLevel(value) {
  return normalizeClientSwitch(value) || migrateLegacySpeedField(value);
}

function pickProvenanceClientSettings(raw) {
  const out = {};
  const reasoning = normalizeReasoningLevel(raw?.reasoning);
  const switchId = normalizeClientSwitch(raw?.switch) ||
    migrateLegacySpeedField(raw?.speed);
  const reviewedBy = normalizeReviewedBy(raw?.reviewedBy);
  if (reasoning) out.reasoning = reasoning;
  if (switchId) out.switch = switchId;
  if (reviewedBy) out.reviewedBy = reviewedBy;
  return out;
}

/**
 * Optional reviewer display name. Blank/invalid values omit the field.
 * Not a contributor — it does not change collaboration inference.
 */
export function normalizeReviewedBy(value) {
  if (typeof value !== "string") return "";
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || name.length > AUTHORING_PROVENANCE_REVIEWED_BY_MAX) return "";
  return name;
}

function appendReviewedBy(line, provenance) {
  if (!line) return null;
  const name = normalizeReviewedBy(provenance?.reviewedBy);
  if (!name) return line;
  return `${line}; reviewed by ${name}`;
}

function contributorNameKey(name) {
  return String(name).trim().toLowerCase();
}

/**
 * Split a generative contributor label into stable host + optional model.
 * Known hosts use the settings table; unknown names fall back to a trailing
 * parenthetical when present.
 */
export function splitGenerativeContributorLabel(name, settings = AUTHORING_SETTINGS) {
  if (!nonEmptyString(name)) return { host: "", model: "" };
  const trimmed = name.trim();
  const known = knownHostLabelForName(trimmed, settings);
  if (known) {
    const system = known.system;
    if (trimmed === system) return { host: system, model: "" };
    const prefix = `${system} (`;
    if (trimmed.startsWith(prefix) && trimmed.endsWith(")")) {
      return { host: system, model: trimmed.slice(prefix.length, -1).trim() };
    }
    return { host: system, model: "" };
  }
  const match = trimmed.match(/^(.+?)\s+\(([^)]+)\)\s*$/);
  if (match) {
    return { host: match[1].trim(), model: match[2].trim() };
  }
  return { host: trimmed, model: "" };
}

/** Drop a model string's leading host token when it repeats the host label. */
export function stripRedundantHostModelPrefix(host, model) {
  const hostTrim = typeof host === "string" ? host.trim() : "";
  const modelTrim = typeof model === "string" ? model.trim() : "";
  if (!hostTrim || !modelTrim) return modelTrim;
  if (modelTrim.toLowerCase() === hostTrim.toLowerCase()) return "";
  const prefix = `${hostTrim} `;
  if (modelTrim.toLowerCase().startsWith(prefix.toLowerCase())) {
    const rest = modelTrim.slice(prefix.length).trim();
    return rest || modelTrim;
  }
  return modelTrim;
}

function normalizeModelForContributor(host, model) {
  return canonicalModelLabel(stripRedundantHostModelPrefix(host, model));
}

/** Compose a generative contributor display/storage name from host + model. */
export function formatGenerativeContributorLabel(host, model, settings = AUTHORING_SETTINGS) {
  const hostLabel = typeof host === "string" ? host.trim() : "";
  if (!hostLabel) return "";
  const modelLabel = normalizeModelForContributor(hostLabel, model);
  if (!modelLabel) return hostLabel;
  if (settings.hosts?.includeModelInLabel === false) return hostLabel;
  return `${hostLabel} (${modelLabel})`;
}

/** Display labels for stored client reasoning/switch, in byline order. */
export function formatProvenanceClientTierSuffix(provenance) {
  const parts = [];
  const reasoning = normalizeReasoningLevel(provenance?.reasoning);
  const switchId = normalizeClientSwitch(provenance?.switch) ||
    migrateLegacySpeedField(provenance?.speed);
  if (reasoning) parts.push(AUTHORING_PROVENANCE_REASONING_LABELS[reasoning]);
  if (switchId) parts.push(AUTHORING_PROVENANCE_SWITCH_LABELS[switchId]);
  return parts.join(" ");
}

/**
 * L1 generative name: host (model) plus any client reasoning/switch labels.
 * Both concatenate when present: "Cursor (Grok 4.6 High Fast)".
 */
export function formatGenerativeBylineName(name, provenance, settings = AUTHORING_SETTINGS) {
  const display = normalizeGenerativeContributorDisplayName(name, settings);
  if (!nonEmptyString(display)) return display;
  const suffix = formatProvenanceClientTierSuffix(provenance);
  const match = display.match(/^(.*)\s+\(([^)]+)\)\s*$/);
  if (match) {
    const host = match[1];
    const modelCore = stripClientTierLabelsFromModel(match[2].trim());
    const inner = [modelCore, suffix].filter(Boolean).join(" ");
    return inner ? `${host} (${inner})` : host;
  }
  return suffix ? `${display} (${suffix})` : display;
}

/**
 * Normalize a stored generative contributor name for display (bylines, admin).
 * Collapses repeats like "Cursor (Cursor Grok 4.6)" → "Cursor (Grok 4.6)".
 */
export function normalizeGenerativeContributorDisplayName(name, settings = AUTHORING_SETTINGS) {
  if (!nonEmptyString(name)) return name;
  const trimmed = name.trim();
  const { host, model } = splitGenerativeContributorLabel(trimmed, settings);
  if (!model) return trimmed;
  return formatGenerativeContributorLabel(host, model, settings) || trimmed;
}

/** Stable upsert key for generative contributors (host label, not full name). */
export function generativeHostKey(name, settings = AUTHORING_SETTINGS) {
  if (!nonEmptyString(name)) return "";
  const known = knownHostLabelForName(name.trim(), settings);
  if (known) return known.system.trim().toLowerCase();
  return contributorNameKey(splitGenerativeContributorLabel(name.trim(), settings).host);
}

/** Infer kind from the known-host allowlist; unknown names default to human. */
export function inferContributorKind(name, settings = AUTHORING_SETTINGS) {
  return isKnownGenerativeSystemName(name, settings) ? "generative" : "human";
}

/**
 * Expand a stored or loose contributor for mode inference / L1 / L2.
 * Always yields `{ kind, name, model? }` with kind filled in.
 */
export function expandProvenanceContributor(entry, settings = AUTHORING_SETTINGS) {
  if (typeof entry === "string" && entry.trim()) {
    const name = entry.trim();
    return { kind: inferContributorKind(name, settings), name };
  }
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  if (!nonEmptyString(entry.name)) return null;
  const name = entry.name.trim();
  const inferred = inferContributorKind(name, settings);
  const kind = KIND_SET.has(entry.kind) ? entry.kind : inferred;
  const next = { kind, name };
  if (nonEmptyString(entry.model)) next.model = entry.model.trim();
  else {
    const parsedModel = splitGenerativeContributorLabel(name, settings).model;
    if (parsedModel) next.model = parsedModel;
  }
  return next;
}

/**
 * Persist only non-derivable fields. Kind is omitted when it matches host
 * inference; provider is never persisted.
 * Explicit kind overrides (e.g. treating a host name as human) are kept.
 */
export function compactProvenanceContributor(entry, settings = AUTHORING_SETTINGS) {
  const expanded = expandProvenanceContributor(entry, settings);
  if (!expanded) return null;
  const inferred = inferContributorKind(expanded.name, settings);
  const next = { name: expanded.name };
  if (KIND_SET.has(expanded.kind) && expanded.kind !== inferred) {
    next.kind = expanded.kind;
  }
  if (nonEmptyString(expanded.model)) {
    const embedded = expanded.name.toLowerCase().includes(
      `(${expanded.model.trim().toLowerCase()})`
    );
    if (!embedded) next.model = expanded.model;
  }
  return next;
}

/**
 * Coerce a loose agent-friendly contributor into the expanded runtime shape.
 * Prefer compactProvenanceContributor when writing storage.
 */
export function coerceProvenanceContributor(entry, settings = AUTHORING_SETTINGS) {
  return expandProvenanceContributor(entry, settings);
}

function normalizeContributor(entry, settings = AUTHORING_SETTINGS) {
  const expanded = expandProvenanceContributor(entry, settings);
  if (!expanded) return null;
  const explicitKind = entry && typeof entry === "object" && !Array.isArray(entry) &&
    KIND_SET.has(entry.kind) ? entry.kind : null;
  // A caller may deliberately classify a known host name as human (or an
  // unknown name as generative). Keep that non-derivable override intact.
  if (explicitKind && explicitKind !== inferContributorKind(expanded.name, settings)) {
    return compactProvenanceContributor(entry, settings);
  }

  const split = splitGenerativeContributorLabel(expanded.name, settings);
  if (split.model) {
    const knownHost = knownHostLabelForName(split.host, settings);
    if (knownHost || expanded.kind === "generative") {
      const model = expanded.model || split.model;
      const name = formatGenerativeContributorLabel(
        knownHost?.system || split.host,
        model,
        settings
      );
      return compactProvenanceContributor({
        kind: "generative",
        name,
        ...(expanded.model ? { model: canonicalModelLabel(expanded.model) } : {})
      }, settings);
    }
  }

  if (isKnownGenerativeSystemName(expanded.name, settings)) {
    const known = knownHostLabelForName(expanded.name, settings);
    return compactProvenanceContributor({
      kind: "generative",
      name: known?.system || expanded.name,
      ...(expanded.model ? { model: canonicalModelLabel(expanded.model) } : {})
    }, settings);
  }
  return compactProvenanceContributor(entry, settings);
}

function expandContributors(list, settings = AUTHORING_SETTINGS) {
  return (list || [])
    .map(entry => expandProvenanceContributor(entry, settings))
    .filter(Boolean);
}

/**
 * Normalize loose provenance (optional collaboration; string contributors)
 * into the lean stored shape. Returns undefined when empty/invalid input.
 * Mixed human+AI defaults to aiPrimary (honest for agent-authored drafts);
 * set collaboration to humanPrimary when a human has taken editorial lead.
 */
export function normalizeAuthoringProvenance(raw, settings = AUTHORING_SETTINGS) {
  if (raw === undefined) return undefined;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;

  const contributors = [];
  const seen = new Set();
  for (const entry of raw.contributors || []) {
    const next = normalizeContributor(entry, settings);
    if (!next) continue;
    const key = contributorNameKey(next.name);
    if (seen.has(key)) {
      const index = contributors.findIndex(c => contributorNameKey(c.name) === key);
      if (index >= 0) {
        contributors[index] = compactProvenanceContributor({
          ...expandProvenanceContributor(contributors[index], settings),
          ...expandProvenanceContributor(entry, settings),
          name: next.name
        }, settings);
      }
      continue;
    }
    seen.add(key);
    contributors.push(next);
  }
  if (!contributors.length) return undefined;

  const expanded = expandContributors(contributors, settings);
  let collaboration = COLLABORATION_SET.has(raw.collaboration)
    ? raw.collaboration
    : inferCollaboration(expanded);
  if (!collaboration) return undefined;

  return reconcileCollaboration({
    collaboration,
    contributors,
    ...pickProvenanceClientSettings(raw)
  }, settings);
}

export function validateAuthoringProvenance(raw, label = "provenance") {
  if (raw === undefined) return [];
  const normalized = normalizeAuthoringProvenance(raw);
  if (!normalized) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return [`${label} must be an object when present`];
    }
    if (!Array.isArray(raw.contributors) || raw.contributors.length === 0) {
      return [`${label}.contributors must be a non-empty array when provenance is present`];
    }
    return [`${label} could not be normalized to a valid collaboration + contributors shape`];
  }

  const errors = [];
  if (!COLLABORATION_SET.has(normalized.collaboration)) {
    errors.push(
      `${label}.collaboration must be one of ${AUTHORING_PROVENANCE_COLLABORATION.join(", ")}`
    );
  }
  const expanded = expandContributors(normalized.contributors);
  const seen = new Set();
  let humans = 0;
  let generative = 0;
  expanded.forEach((entry, index) => {
    const entryLabel = `${label}.contributors[${index}]`;
    if (!KIND_SET.has(entry.kind)) {
      errors.push(
        `${entryLabel}.kind must be one of ${AUTHORING_PROVENANCE_KINDS.join(", ")}`
      );
    }
    if (!nonEmptyString(entry.name)) {
      errors.push(`${entryLabel}.name must be a non-empty string`);
    }
    const key = contributorNameKey(entry.name);
    if (seen.has(key)) {
      errors.push(
        `${entryLabel} duplicates name "${entry.name}"; upsert in place`
      );
    }
    seen.add(key);
    if (entry.kind === "human") humans += 1;
    if (entry.kind === "generative") generative += 1;
  });

  const mode = normalized.collaboration;
  if (mode === "human" && generative > 0) {
    errors.push(`${label}: collaboration "human" cannot include generative contributors`);
  }
  if (mode === "ai" && humans > 0) {
    errors.push(`${label}: collaboration "ai" cannot include human contributors`);
  }
  if ((mode === "humanPrimary" || mode === "aiPrimary") && (humans < 1 || generative < 1)) {
    errors.push(
      `${label}: collaboration "${mode}" requires at least one human and one generative contributor`
    );
  }

  // Explicit mode that fights inferred kinds (e.g. agent forced "ai" with a person).
  if (
    COLLABORATION_SET.has(raw.collaboration) &&
    raw.collaboration !== normalized.collaboration &&
    (raw.collaboration === "human" || raw.collaboration === "ai")
  ) {
    errors.push(
      `${label}: collaboration "${raw.collaboration}" is inconsistent with contributor kinds`
    );
  }
  if (raw.reasoning !== undefined && raw.reasoning !== null && raw.reasoning !== "") {
    if (!normalizeReasoningLevel(raw.reasoning)) {
      errors.push(
        `${label}.reasoning must be one of ${AUTHORING_PROVENANCE_REASONING_LEVELS.join(", ")}`
      );
    }
  }
  if (raw.switch !== undefined && raw.switch !== null && raw.switch !== "") {
    if (!normalizeClientSwitch(raw.switch)) {
      errors.push(
        `${label}.switch must be one of ${AUTHORING_PROVENANCE_SWITCHES.join(", ")}`
      );
    }
  }
  if (raw.reviewedBy !== undefined && raw.reviewedBy !== null && raw.reviewedBy !== "") {
    if (typeof raw.reviewedBy !== "string") {
      errors.push(`${label}.reviewedBy must be a string`);
    } else {
      const name = raw.reviewedBy.trim().replace(/\s+/g, " ");
      if (!name) {
        errors.push(`${label}.reviewedBy must be a non-empty string when present`);
      } else if (name.length > AUTHORING_PROVENANCE_REVIEWED_BY_MAX) {
        errors.push(
          `${label}.reviewedBy must be at most ${AUTHORING_PROVENANCE_REVIEWED_BY_MAX} characters`
        );
      }
    }
  }
  return errors;
}

/** Replace-or-append by name. Does not invent or change collaboration. */
export function upsertProvenanceContributor(provenance, contributor) {
  const nextContributor = normalizeContributor(contributor);
  if (!nextContributor) return provenance;

  const base = provenance && typeof provenance === "object" && !Array.isArray(provenance)
    ? provenance
    : null;
  const contributors = Array.isArray(base?.contributors) ? [...base.contributors] : [];
  const key = contributorNameKey(nextContributor.name);
  const index = contributors.findIndex(existing =>
    existing &&
    nonEmptyString(existing.name) &&
    contributorNameKey(existing.name) === key
  );
  if (index < 0) contributors.push(nextContributor);
  else {
    contributors[index] = compactProvenanceContributor({
      ...expandProvenanceContributor(contributors[index]),
      ...expandProvenanceContributor(nextContributor),
      name: nextContributor.name
    });
  }

  return {
    ...(base || {}),
    ...(base?.collaboration ? { collaboration: base.collaboration } : {}),
    contributors
  };
}

/**
 * Infer a consistent collaboration mode from contributor kinds when seeding.
 * Accepts lean or expanded contributor entries.
 */
export function inferCollaboration(contributors, settings = AUTHORING_SETTINGS) {
  const list = expandContributors(contributors, settings);
  let humans = 0;
  let generative = 0;
  for (const entry of list) {
    if (entry.kind === "human") humans += 1;
    if (entry.kind === "generative") generative += 1;
  }
  if (humans && !generative) return "human";
  if (generative && !humans) return "ai";
  if (humans && generative) return "aiPrimary";
  return null;
}

/**
 * Keep collaboration consistent after adding a contributor. Never invent people.
 * Sole-kind modes upgrade to aiPrimary when the other kind appears; explicit
 * humanPrimary / aiPrimary is preserved while both kinds remain.
 */
export function reconcileCollaboration(provenance, settings = AUTHORING_SETTINGS) {
  if (!provenance || typeof provenance !== "object") return provenance;
  const contributors = Array.isArray(provenance.contributors)
    ? provenance.contributors.map(entry =>
      compactProvenanceContributor(entry, settings)
    ).filter(Boolean)
    : [];
  const inferred = inferCollaboration(contributors, settings);
  const clientSettings = pickProvenanceClientSettings(provenance);
  if (!inferred) {
    const collaboration = COLLABORATION_SET.has(provenance.collaboration)
      ? provenance.collaboration
      : undefined;
    if (collaboration) return { collaboration, contributors, ...clientSettings };
    if (contributors.length) return { contributors, ...clientSettings };
    return provenance;
  }

  let collaboration = provenance.collaboration;
  if (!COLLABORATION_SET.has(collaboration)) {
    collaboration = inferred;
  } else if (collaboration === "human" && inferred !== "human") {
    collaboration = inferred;
  } else if (collaboration === "ai" && inferred !== "ai") {
    collaboration = inferred;
  } else if (
    (collaboration === "humanPrimary" || collaboration === "aiPrimary") &&
    inferred !== "humanPrimary" &&
    inferred !== "aiPrimary"
  ) {
    collaboration = inferred;
  }

  const next = { collaboration, contributors, ...pickProvenanceClientSettings(provenance) };
  return next;
}

/** Upsert a generative system into provenance and reconcile mode. */
export function upsertGenerativeProvenance(
  provenance,
  { system, model } = {},
  settings = AUTHORING_SETTINGS
) {
  if (!nonEmptyString(system)) return provenance;

  const trimmedSystem = system.trim();
  const { host, model: parsedModel } = splitGenerativeContributorLabel(trimmedSystem, settings);
  const hostLabel = knownHostLabelForName(trimmedSystem, settings)?.system || host;
  const modelProvided = model !== undefined;
  let resolvedModel = modelProvided
    ? (typeof model === "string" ? model.trim() : "")
    : (parsedModel || "");

  const base = provenance && typeof provenance === "object" && !Array.isArray(provenance)
    ? provenance
    : null;
  const contributors = Array.isArray(base?.contributors) ? [...base.contributors] : [];
  const targetKey = generativeHostKey(hostLabel, settings);
  const index = contributors.findIndex(existing => {
    if (!existing || !nonEmptyString(existing.name)) return false;
    const expanded = expandProvenanceContributor(existing, settings);
    if (expanded?.kind !== "generative") return false;
    return generativeHostKey(expanded.name, settings) === targetKey;
  });

  // A host-only stamp (typical Cursor MCP) must not wipe a stored model.
  // Explicit model: "" still clears.
  if (index >= 0 && !modelProvided && !parsedModel) {
    const existing = expandProvenanceContributor(contributors[index], settings);
    const existingSplit = splitGenerativeContributorLabel(existing.name, settings);
    resolvedModel = existing.model || existingSplit.model || "";
  }

  const name = formatGenerativeContributorLabel(hostLabel, resolvedModel, settings);

  const nextContributor = compactProvenanceContributor({
    kind: "generative",
    name,
    ...(resolvedModel ? { model: resolvedModel } : {})
  }, settings);
  if (!nextContributor) return provenance;

  if (index < 0) contributors.push(nextContributor);
  else {
    contributors[index] = compactProvenanceContributor({
      ...expandProvenanceContributor(contributors[index], settings),
      kind: "generative",
      name,
      ...(resolvedModel ? { model: resolvedModel } : { model: "" })
    }, settings);
  }

  const next = {
    ...(base || {}),
    ...(base?.collaboration ? { collaboration: base.collaboration } : {}),
    contributors
  };
  return reconcileCollaboration(next, settings);
}

/** Upsert a human into provenance and reconcile mode. */
export function upsertHumanProvenance(provenance, { name } = {}) {
  if (!nonEmptyString(name)) return provenance;
  const next = upsertProvenanceContributor(provenance, {
    kind: "human",
    name: name.trim()
  });
  return reconcileCollaboration(next);
}

export function contributorsByKind(provenance, kind, settings = AUTHORING_SETTINGS) {
  return expandContributors(provenance?.contributors, settings)
    .filter(entry => entry.kind === kind)
    .map(entry => entry.name);
}

/** L2 agent/admin summary — mode + names; no dates/roles/scopes. */
export function renderProvenanceL2(provenance, settings = AUTHORING_SETTINGS) {
  if (!provenance || !COLLABORATION_SET.has(provenance.collaboration)) return null;
  const contributors = expandContributors(provenance.contributors, settings);
  if (!contributors.length) return null;
  const parts = contributors.map(entry => {
    const name = entry.kind === "generative"
      ? normalizeGenerativeContributorDisplayName(entry.name, settings)
      : entry.name;
    return `${name} (${entry.kind})`;
  });
  return appendReviewedBy(`${provenance.collaboration}: ${parts.join("; ")}`, provenance);
}

/**
 * L1 player byline from mode + names. Product-side; not the agent contract.
 * Uses AUTHORING_SETTINGS.credit templates where they fit.
 */
export function renderProvenanceL1(provenance, settings = AUTHORING_SETTINGS) {
  if (!provenance || !COLLABORATION_SET.has(provenance.collaboration)) return null;
  const humans = contributorsByKind(provenance, "human", settings);
  const generative = contributorsByKind(provenance, "generative", settings)
    .map(name => formatGenerativeBylineName(name, provenance, settings));
  const templates = settings.credit?.templates || {};
  const humanList = formatSystemsList(humans);
  const genList = formatSystemsList(generative);

  let line = null;
  switch (provenance.collaboration) {
    case "human":
      line = humanList
        ? fillAuthoringTemplate(templates.humanOnly || "By {author}", { author: humanList })
        : null;
      break;
    case "ai":
      line = genList
        ? fillAuthoringTemplate(templates.draftedOnly || "Drafted with {hosts}", { hosts: genList })
        : null;
      break;
    case "humanPrimary": {
      if (!genList && !humanList) break;
      if (!genList) {
        line = fillAuthoringTemplate(templates.humanOnly || "By {author}", { author: humanList });
        break;
      }
      if (!humanList) {
        line = fillAuthoringTemplate(templates.draftedOnly || "Drafted with {hosts}", { hosts: genList });
        break;
      }
      const preferredId = preferredCreditTemplateId(settings);
      const template = templates[preferredId] || templates.directed;
      line = fillAuthoringTemplate(template, { hosts: genList, author: humanList });
      break;
    }
    case "aiPrimary": {
      if (!genList && !humanList) break;
      if (!humanList) {
        line = fillAuthoringTemplate(templates.draftedOnly || "Drafted with {hosts}", { hosts: genList });
        break;
      }
      if (!genList) {
        line = fillAuthoringTemplate(templates.humanOnly || "By {author}", { author: humanList });
        break;
      }
      line = `Drafted with ${genList}; edited by ${humanList}`;
      break;
    }
    default:
      break;
  }
  return appendReviewedBy(line, provenance);
}

/**
 * Build provenance from generativeAssistance systems (distinct names).
 * Mode is ai when only systems are known — humans are not invented.
 */
export function provenanceFromGenerativeAssistance(entries, settings = AUTHORING_SETTINGS) {
  const seen = new Set();
  const contributors = [];
  for (const entry of entries || []) {
    if (!nonEmptyString(entry?.system)) continue;
    const name = entry.system.trim();
    const key = contributorNameKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    const compacted = compactProvenanceContributor({
      kind: "generative",
      name
    }, settings);
    if (compacted) contributors.push(compacted);
  }
  if (!contributors.length) return undefined;
  return { collaboration: "ai", contributors };
}

function applyCreditMax(line, settings = AUTHORING_SETTINGS) {
  if (!line) return null;
  const max = settings.credit?.maxLength || 160;
  if (line.length <= max) return line;
  const withoutReviewer = line.replace(/; reviewed by [^;]+$/, "");
  if (withoutReviewer !== line && withoutReviewer.length <= max) return withoutReviewer;
  return null;
}

/**
 * Fold generativeAssistance (+ parseable lesson credit) into two-axis
 * provenance. When provenance is present, drop generativeAssistance so
 * attribution has one model of record. When L1 can render, drop stored
 * learningIntroduction.credit so the byline stays a derived read-only field.
 * Opaque legacy credits are kept only when provenance cannot produce L1.
 */
export function canonicalizeDocumentProvenance(document, {
  settings = AUTHORING_SETTINGS
} = {}) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return document;
  }
  const next = structuredClone(document);
  let provenance = next.provenance && typeof next.provenance === "object"
    ? next.provenance
    : undefined;

  for (const entry of next.generativeAssistance || []) {
    if (!nonEmptyString(entry?.system)) continue;
    provenance = upsertGenerativeProvenance(provenance, {
      system: entry.system,
      model: entry.model
    });
  }

  const intro = next.learningIntroduction;
  if (intro && typeof intro === "object" && !Array.isArray(intro)) {
    const credit = typeof intro.credit === "string" ? intro.credit.trim() : "";
    const parsed = credit ? parseLessonCredit(credit, settings) : null;

    if (parsed?.author) {
      if (isKnownGenerativeSystemName(parsed.author, settings)) {
        const known = knownHostLabelForName(parsed.author, settings);
        provenance = upsertGenerativeProvenance(provenance, {
          system: known?.system || parsed.author
        }, settings);
      } else {
        provenance = upsertHumanProvenance(provenance, { name: parsed.author });
      }
    }
    for (const host of parsed?.hosts || []) {
      provenance = upsertGenerativeProvenance(provenance, { system: host });
    }
    // Bylines that name editorial direction imply humanPrimary, not the
    // agent-from-scratch default (aiPrimary).
    const editorialByline = parsed &&
      ["directed", "compact", "legacyAssist"].includes(parsed.acceptId);
    if (editorialByline && provenance) {
      provenance = reconcileCollaboration({
        ...provenance,
        collaboration: "humanPrimary"
      }, settings);
    }

    if (provenance) {
      provenance = normalizeAuthoringProvenance(provenance, settings) || provenance;
      next.provenance = provenance;
      const l1 = applyCreditMax(renderProvenanceL1(provenance, settings), settings);
      // Drop stored credit when absent or parseable — byline becomes derived.
      // Keep opaque freeform credits as a legacy escape hatch.
      if (l1 && (!credit || parsed)) delete intro.credit;
    }
  } else if (provenance) {
    next.provenance = normalizeAuthoringProvenance(provenance, settings) || provenance;
  }

  if (!next.provenance) delete next.provenance;
  else delete next.generativeAssistance;
  return next;
}

/**
 * Generative hosts on a draft for the model editor — from provenance and/or
 * legacy generativeAssistance before fold.
 */
export function listGenerativeContributorsForEdit(document, settings = AUTHORING_SETTINGS) {
  const seen = new Map();

  for (const entry of expandContributors(document?.provenance?.contributors, settings)) {
    if (entry.kind !== "generative") continue;
    const key = generativeHostKey(entry.name, settings);
    if (!key || seen.has(key)) continue;
    const known = knownHostLabelForName(entry.name, settings);
    const split = splitGenerativeContributorLabel(entry.name, settings);
    seen.set(key, {
      host: known?.system || split.host,
      model: canonicalModelLabel(stripClientTierLabelsFromModel(entry.model || split.model || ""))
    });
  }

  for (const entry of document?.generativeAssistance || []) {
    if (!nonEmptyString(entry?.system)) continue;
    const key = generativeHostKey(entry.system, settings);
    if (!key || seen.has(key)) continue;
    const known = knownHostLabelForName(entry.system, settings);
    const split = splitGenerativeContributorLabel(entry.system.trim(), settings);
    seen.set(key, {
      host: known?.system || split.host,
      model: canonicalModelLabel(stripClientTierLabelsFromModel(
        (typeof entry.model === "string" ? entry.model.trim() : "") || split.model || ""
      ))
    });
  }

  return [...seen.values()];
}

/**
 * Set or clear the model suffix for one generative host (drafts page).
 * Parentheses are composed server-side; values like "auto" are stored as-is.
 */
export function applyGenerativeContributorModel(document, {
  host,
  model = "",
  settings = AUTHORING_SETTINGS
} = {}) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("document must be an object");
  }
  if (!nonEmptyString(host)) throw new Error("host is required");

  const hostLabel = host.trim();
  const modelValue = stripClientTierLabelsFromModel(
    typeof model === "string" ? model.trim() : ""
  );
  const known = knownHostLabelForName(hostLabel, settings);
  const canonicalHost = known?.system || hostLabel;
  const composedName = formatGenerativeContributorLabel(canonicalHost, modelValue, settings);

  let provenance = document.provenance && typeof document.provenance === "object"
    ? {
      ...document.provenance,
      contributors: [...(document.provenance.contributors || [])]
    }
    : { contributors: [] };

  for (const entry of document.generativeAssistance || []) {
    if (!nonEmptyString(entry?.system)) continue;
    provenance = upsertGenerativeProvenance(provenance, {
      system: entry.system,
      model: entry.model
    }, settings);
  }

  provenance = upsertGenerativeProvenance(provenance, {
    system: composedName,
    ...(modelValue ? { model: modelValue } : {})
  }, settings);
  provenance = normalizeAuthoringProvenance(provenance, settings);
  if (!provenance) {
    throw new Error("provenance needs at least one generative contributor before setting model");
  }

  const next = structuredClone(document);
  next.provenance = provenance;
  delete next.generativeAssistance;

  if (next.learningIntroduction && typeof next.learningIntroduction === "object") {
    const credit = typeof next.learningIntroduction.credit === "string"
      ? next.learningIntroduction.credit.trim()
      : "";
    const parsed = credit ? parseLessonCredit(credit, settings) : null;
    const l1 = applyCreditMax(renderProvenanceL1(provenance, settings), settings);
    if (l1 && (!credit || parsed)) delete next.learningIntroduction.credit;
  }

  return next;
}

/**
 * Human override of collaboration mode (drafts page). Upserts an optional
 * human name for mixed/human modes, persists the mode, and refreshes the
 * lesson byline from L1 when a learning introduction exists.
 */
export function applyProvenanceCollaboration(document, {
  collaboration,
  authorName = null,
  settings = AUTHORING_SETTINGS
} = {}) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("document must be an object");
  }
  if (!COLLABORATION_SET.has(collaboration)) {
    throw new Error(
      `collaboration must be one of ${AUTHORING_PROVENANCE_COLLABORATION.join(", ")}`
    );
  }

  let provenance = document.provenance && typeof document.provenance === "object"
    ? {
      ...document.provenance,
      contributors: [...(document.provenance.contributors || [])]
    }
    : { contributors: [] };

  const needsHuman = collaboration === "human" ||
    collaboration === "humanPrimary" ||
    collaboration === "aiPrimary";
  if (needsHuman && nonEmptyString(authorName)) {
    provenance = upsertHumanProvenance(provenance, { name: authorName });
  }

  for (const entry of document.generativeAssistance || []) {
    if (!nonEmptyString(entry?.system)) continue;
    provenance = upsertGenerativeProvenance(provenance, {
      system: entry.system,
      model: entry.model
    });
  }

  provenance = normalizeAuthoringProvenance({
    ...provenance,
    collaboration
  }, settings);

  if (!provenance) {
    throw new Error("provenance needs at least one contributor before setting collaboration");
  }

  const expanded = expandContributors(provenance.contributors, settings);
  // Honor explicit humanPrimary / aiPrimary when both kinds are present.
  if (
    (collaboration === "humanPrimary" || collaboration === "aiPrimary") &&
    expanded.some(c => c.kind === "human") &&
    expanded.some(c => c.kind === "generative")
  ) {
    provenance = { ...provenance, collaboration };
  }

  if (collaboration === "human" || collaboration === "ai") {
    provenance = reconcileCollaboration({ ...provenance, collaboration }, settings);
    if (provenance.collaboration !== collaboration) {
      throw new Error(
        `collaboration "${collaboration}" is inconsistent with current contributors`
      );
    }
  }

  const next = structuredClone(document);
  next.provenance = provenance;
  if (next.learningIntroduction && typeof next.learningIntroduction === "object") {
    const credit = typeof next.learningIntroduction.credit === "string"
      ? next.learningIntroduction.credit.trim()
      : "";
    const parsed = credit ? parseLessonCredit(credit, settings) : null;
    const l1 = applyCreditMax(renderProvenanceL1(provenance, settings), settings);
    if (l1 && (!credit || parsed)) delete next.learningIntroduction.credit;
  }
  delete next.generativeAssistance;
  return next;
}

/**
 * Set or clear optional client reasoning / switch on provenance (drafts page).
 */
export function applyProvenanceClientSetting(document, {
  field,
  value = "",
  settings = AUTHORING_SETTINGS
} = {}) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("document must be an object");
  }
  if (field !== "reasoning" && field !== "switch") {
    throw new Error('field must be "reasoning" or "switch"');
  }

  let provenance = document.provenance && typeof document.provenance === "object"
    ? {
      ...document.provenance,
      contributors: [...(document.provenance.contributors || [])]
    }
    : { contributors: [] };

  for (const entry of document.generativeAssistance || []) {
    if (!nonEmptyString(entry?.system)) continue;
    provenance = upsertGenerativeProvenance(provenance, {
      system: entry.system,
      model: entry.model
    }, settings);
  }

  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    delete provenance[field];
    if (field === "switch") delete provenance.speed;
  } else {
    const normalized = field === "reasoning"
      ? normalizeReasoningLevel(trimmed)
      : normalizeClientSwitch(trimmed);
    if (!normalized) {
      throw new Error(`invalid ${field} value`);
    }
    provenance[field] = normalized;
    if (field === "switch") delete provenance.speed;
  }

  provenance = normalizeAuthoringProvenance(provenance, settings);
  if (!provenance) {
    throw new Error("provenance needs at least one contributor before setting client options");
  }

  const next = structuredClone(document);
  next.provenance = provenance;
  delete next.generativeAssistance;
  return next;
}

/**
 * Set or clear the optional reviewer name (drafts page). Not a contributor.
 */
export function applyReviewedBy(document, {
  reviewedBy = "",
  settings = AUTHORING_SETTINGS
} = {}) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("document must be an object");
  }

  let provenance = document.provenance && typeof document.provenance === "object"
    ? {
      ...document.provenance,
      contributors: [...(document.provenance.contributors || [])]
    }
    : { contributors: [] };

  for (const entry of document.generativeAssistance || []) {
    if (!nonEmptyString(entry?.system)) continue;
    provenance = upsertGenerativeProvenance(provenance, {
      system: entry.system,
      model: entry.model
    }, settings);
  }

  const name = typeof reviewedBy === "string" ? reviewedBy.trim().replace(/\s+/g, " ") : "";
  if (!name) {
    delete provenance.reviewedBy;
  } else if (name.length > AUTHORING_PROVENANCE_REVIEWED_BY_MAX) {
    throw new Error(
      `reviewedBy must be at most ${AUTHORING_PROVENANCE_REVIEWED_BY_MAX} characters`
    );
  } else {
    provenance.reviewedBy = name;
  }

  provenance = normalizeAuthoringProvenance(provenance, settings);
  if (!provenance) {
    throw new Error("provenance needs at least one contributor before naming a reviewer");
  }

  const next = structuredClone(document);
  next.provenance = provenance;
  delete next.generativeAssistance;
  return next;
}

/**
 * Player/admin byline: opaque legacy credit wins; otherwise prefer L1 from
 * provenance, then parseable/any remaining credit, then generativeAssistance.
 */
export function resolveLessonByline({
  introduction = null,
  provenance = null,
  generativeAssistance = null,
  settings = AUTHORING_SETTINGS
} = {}) {
  const authored = typeof introduction?.credit === "string"
    ? introduction.credit.trim()
    : "";
  const parsed = authored ? parseLessonCredit(authored, settings) : null;
  if (authored && !parsed) return authored;

  const fromProvenance = applyCreditMax(renderProvenanceL1(provenance, settings), settings);
  if (fromProvenance) return fromProvenance;
  if (authored) return authored;
  return formatAssistanceCredit(generativeAssistance, settings);
}
