// Compact two-axis authoring provenance (see docs/dev-briefs/authoring-provenance-shape.md).
// Model of record: collaboration mode + contributor names. Kind/provider are
// derived on read when they match authoringHosts.js; agents therefore
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

/** Client speed tier used during drafting (L3; optional). */
export const AUTHORING_PROVENANCE_SPEED_LEVELS = Object.freeze([
  "normal",
  "fast",
  "max",
  "ultracode"
]);

export const AUTHORING_PROVENANCE_REASONING_LABELS = Object.freeze({
  light: "Light",
  medium: "Medium",
  high: "High",
  extraHigh: "Extra High",
  ultra: "Ultra",
  noThinking: "No Thinking"
});

export const AUTHORING_PROVENANCE_SPEED_LABELS = Object.freeze({
  normal: "Normal",
  fast: "Fast",
  max: "Max",
  ultracode: "Ultracode"
});

const COLLABORATION_SET = new Set(AUTHORING_PROVENANCE_COLLABORATION);
const KIND_SET = new Set(AUTHORING_PROVENANCE_KINDS);
const REASONING_SET = new Set(AUTHORING_PROVENANCE_REASONING_LEVELS);
const SPEED_SET = new Set(AUTHORING_PROVENANCE_SPEED_LEVELS);

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
}

export function normalizeReasoningLevel(value) {
  if (!nonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  if (REASONING_SET.has(trimmed)) return trimmed;
  const match = Object.entries(AUTHORING_PROVENANCE_REASONING_LABELS)
    .find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
  return match ? match[0] : undefined;
}

export function normalizeSpeedLevel(value) {
  if (!nonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  if (SPEED_SET.has(trimmed)) return trimmed;
  const match = Object.entries(AUTHORING_PROVENANCE_SPEED_LABELS)
    .find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
  return match ? match[0] : undefined;
}

function pickProvenanceClientSettings(raw) {
  const out = {};
  const reasoning = normalizeReasoningLevel(raw?.reasoning);
  const speed = normalizeSpeedLevel(raw?.speed);
  if (reasoning) out.reasoning = reasoning;
  if (speed) out.speed = speed;
  return out;
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
 * Always yields `{ kind, name, provider?, model? }` with kind filled in.
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
  const known = knownHostLabelForName(name, settings);
  const next = { kind, name };
  if (nonEmptyString(entry.provider)) next.provider = entry.provider.trim();
  else if (known?.provider) next.provider = known.provider;
  if (nonEmptyString(entry.model)) next.model = entry.model.trim();
  else {
    const parsedModel = splitGenerativeContributorLabel(name, settings).model;
    if (parsedModel) next.model = parsedModel;
  }
  return next;
}

/**
 * Persist only non-derivable fields. Kind is omitted when it matches host
 * inference; provider is omitted when it matches the known-host table.
 * Explicit kind overrides (e.g. treating a host name as human) are kept.
 */
export function compactProvenanceContributor(entry, settings = AUTHORING_SETTINGS) {
  const expanded = expandProvenanceContributor(entry, settings);
  if (!expanded) return null;
  const inferred = inferContributorKind(expanded.name, settings);
  const known = knownHostLabelForName(expanded.name, settings);
  const next = { name: expanded.name };
  if (KIND_SET.has(expanded.kind) && expanded.kind !== inferred) {
    next.kind = expanded.kind;
  }
  if (
    nonEmptyString(expanded.provider) &&
    (!known || known.provider !== expanded.provider)
  ) {
    next.provider = expanded.provider;
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
        ...(knownHost?.provider ? { provider: knownHost.provider } : {}),
        ...(expanded.model ? { model: canonicalModelLabel(expanded.model) } : {})
      }, settings);
    }
  }

  if (isKnownGenerativeSystemName(expanded.name, settings)) {
    const known = knownHostLabelForName(expanded.name, settings);
    return compactProvenanceContributor({
      kind: "generative",
      name: known?.system || expanded.name,
      ...(known?.provider ? { provider: known.provider } : {}),
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
    const next = compactProvenanceContributor(entry, settings);
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
  if (raw.speed !== undefined && raw.speed !== null && raw.speed !== "") {
    if (!normalizeSpeedLevel(raw.speed)) {
      errors.push(
        `${label}.speed must be one of ${AUTHORING_PROVENANCE_SPEED_LEVELS.join(", ")}`
      );
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
  { system, provider, model } = {},
  settings = AUTHORING_SETTINGS
) {
  if (!nonEmptyString(system)) return provenance;

  const trimmedSystem = system.trim();
  const { host, model: parsedModel } = splitGenerativeContributorLabel(trimmedSystem, settings);
  const hostLabel = knownHostLabelForName(trimmedSystem, settings)?.system || host;
  const resolvedModel = model !== undefined
    ? (typeof model === "string" ? model.trim() : "")
    : (parsedModel || "");
  const name = formatGenerativeContributorLabel(hostLabel, resolvedModel, settings);

  const nextContributor = compactProvenanceContributor({
    kind: "generative",
    name,
    ...(nonEmptyString(provider) ? { provider: provider.trim() } : {}),
    ...(resolvedModel ? { model: resolvedModel } : {})
  }, settings);
  if (!nextContributor) return provenance;

  const base = provenance && typeof provenance === "object" && !Array.isArray(provenance)
    ? provenance
    : null;
  const contributors = Array.isArray(base?.contributors) ? [...base.contributors] : [];
  const targetKey = generativeHostKey(name, settings);
  const index = contributors.findIndex(existing => {
    if (!existing || !nonEmptyString(existing.name)) return false;
    const expanded = expandProvenanceContributor(existing, settings);
    if (expanded?.kind !== "generative") return false;
    return generativeHostKey(expanded.name, settings) === targetKey;
  });

  if (index < 0) contributors.push(nextContributor);
  else {
    contributors[index] = compactProvenanceContributor({
      ...expandProvenanceContributor(contributors[index], settings),
      kind: "generative",
      name,
      ...(nonEmptyString(provider) ? { provider: provider.trim() } : {}),
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
  return `${provenance.collaboration}: ${parts.join("; ")}`;
}

/**
 * L1 player byline from mode + names. Product-side; not the agent contract.
 * Uses AUTHORING_SETTINGS.credit templates where they fit.
 */
export function renderProvenanceL1(provenance, settings = AUTHORING_SETTINGS) {
  if (!provenance || !COLLABORATION_SET.has(provenance.collaboration)) return null;
  const humans = contributorsByKind(provenance, "human", settings);
  const generative = contributorsByKind(provenance, "generative", settings)
    .map(name => normalizeGenerativeContributorDisplayName(name, settings));
  const templates = settings.credit?.templates || {};
  const humanList = formatSystemsList(humans);
  const genList = formatSystemsList(generative);

  switch (provenance.collaboration) {
    case "human":
      return humanList
        ? fillAuthoringTemplate(templates.humanOnly || "By {author}", { author: humanList })
        : null;
    case "ai":
      return genList
        ? fillAuthoringTemplate(templates.draftedOnly || "Drafted with {hosts}", { hosts: genList })
        : null;
    case "humanPrimary": {
      if (!genList && !humanList) return null;
      if (!genList) {
        return fillAuthoringTemplate(templates.humanOnly || "By {author}", { author: humanList });
      }
      if (!humanList) {
        return fillAuthoringTemplate(templates.draftedOnly || "Drafted with {hosts}", { hosts: genList });
      }
      const preferredId = preferredCreditTemplateId(settings);
      const template = templates[preferredId] || templates.directed;
      return fillAuthoringTemplate(template, { hosts: genList, author: humanList });
    }
    case "aiPrimary": {
      if (!genList && !humanList) return null;
      if (!humanList) {
        return fillAuthoringTemplate(templates.draftedOnly || "Drafted with {hosts}", { hosts: genList });
      }
      if (!genList) {
        return fillAuthoringTemplate(templates.humanOnly || "By {author}", { author: humanList });
      }
      return `Drafted with ${genList}; edited by ${humanList}`;
    }
    default:
      return null;
  }
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
      name,
      ...(nonEmptyString(entry.provider) ? { provider: entry.provider.trim() } : {})
    }, settings);
    if (compacted) contributors.push(compacted);
  }
  if (!contributors.length) return undefined;
  return { collaboration: "ai", contributors };
}

function applyCreditMax(line, settings = AUTHORING_SETTINGS) {
  if (!line) return null;
  const max = settings.credit?.maxLength || 160;
  if (line.length > max) return null;
  return line;
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
      provider: entry.provider,
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
          system: known?.system || parsed.author,
          ...(known?.provider ? { provider: known.provider } : {})
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
      model: canonicalModelLabel(entry.model || split.model || "")
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
      model: canonicalModelLabel(
        (typeof entry.model === "string" ? entry.model.trim() : "") || split.model || ""
      )
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
  const modelValue = typeof model === "string" ? model.trim() : "";
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
      provider: entry.provider,
      model: entry.model
    }, settings);
  }

  provenance = upsertGenerativeProvenance(provenance, {
    system: composedName,
    ...(known?.provider ? { provider: known.provider } : {}),
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
      provider: entry.provider,
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
 * Set or clear optional client reasoning / speed tiers on provenance (drafts page).
 */
export function applyProvenanceClientSetting(document, {
  field,
  value = "",
  settings = AUTHORING_SETTINGS
} = {}) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("document must be an object");
  }
  if (field !== "reasoning" && field !== "speed") {
    throw new Error('field must be "reasoning" or "speed"');
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
      provider: entry.provider,
      model: entry.model
    }, settings);
  }

  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    delete provenance[field];
  } else {
    const normalized = field === "reasoning"
      ? normalizeReasoningLevel(trimmed)
      : normalizeSpeedLevel(trimmed);
    if (!normalized) {
      throw new Error(`invalid ${field} value`);
    }
    provenance[field] = normalized;
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
