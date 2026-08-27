// Compact two-axis authoring provenance (see docs/dev-briefs/authoring-provenance-shape.md).
// Model of record: collaboration mode + contributors. Player bylines are L1
// projections; agents are taught L2 only. Dates/roles/scopes stay L3 / unused here.
import {
  AUTHORING_SETTINGS,
  fillAuthoringTemplate,
  isKnownGenerativeSystemName,
  preferredCreditTemplateId
} from "./authoringSettings.js";
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

const COLLABORATION_SET = new Set(AUTHORING_PROVENANCE_COLLABORATION);
const KIND_SET = new Set(AUTHORING_PROVENANCE_KINDS);

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
}

function contributorKey(kind, name) {
  return `${String(kind).trim().toLowerCase()}::${String(name).trim().toLowerCase()}`;
}

/** Infer kind from the known-host allowlist; unknown names default to human. */
export function inferContributorKind(name, settings = AUTHORING_SETTINGS) {
  return isKnownGenerativeSystemName(name, settings) ? "generative" : "human";
}

/**
 * Coerce a loose agent-friendly contributor (string or partial object) into
 * `{ kind, name, provider?, model? }`. Kind is inferred when omitted.
 */
export function coerceProvenanceContributor(entry, settings = AUTHORING_SETTINGS) {
  if (typeof entry === "string" && entry.trim()) {
    const name = entry.trim();
    return { kind: inferContributorKind(name, settings), name };
  }
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  if (!nonEmptyString(entry.name)) return null;
  const name = entry.name.trim();
  const kind = KIND_SET.has(entry.kind)
    ? entry.kind
    : inferContributorKind(name, settings);
  const next = { kind, name };
  if (nonEmptyString(entry.provider)) next.provider = entry.provider.trim();
  if (nonEmptyString(entry.model)) next.model = entry.model.trim();
  return next;
}

function normalizeContributor(entry, settings = AUTHORING_SETTINGS) {
  return coerceProvenanceContributor(entry, settings);
}

/**
 * Normalize loose provenance (optional collaboration; string contributors)
 * into the stored strict shape. Returns undefined when empty/invalid input.
 * Mixed human+AI defaults to aiPrimary (honest for agent-authored drafts);
 * set collaboration to humanPrimary when a human has taken editorial lead.
 */
export function normalizeAuthoringProvenance(raw, settings = AUTHORING_SETTINGS) {
  if (raw === undefined) return undefined;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;

  const contributors = [];
  const seen = new Set();
  for (const entry of raw.contributors || []) {
    const next = coerceProvenanceContributor(entry, settings);
    if (!next) continue;
    const key = contributorKey(next.kind, next.name);
    if (seen.has(key)) {
      const index = contributors.findIndex(c => contributorKey(c.kind, c.name) === key);
      if (index >= 0) contributors[index] = { ...contributors[index], ...next };
      continue;
    }
    seen.add(key);
    contributors.push(next);
  }
  if (!contributors.length) return undefined;

  let collaboration = COLLABORATION_SET.has(raw.collaboration)
    ? raw.collaboration
    : inferCollaboration(contributors);
  if (!collaboration) return undefined;

  return reconcileCollaboration({ collaboration, contributors });
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

  // Re-validate the strict shape (mode consistency already applied by reconcile).
  const errors = [];
  if (!COLLABORATION_SET.has(normalized.collaboration)) {
    errors.push(
      `${label}.collaboration must be one of ${AUTHORING_PROVENANCE_COLLABORATION.join(", ")}`
    );
  }
  const seen = new Set();
  let humans = 0;
  let generative = 0;
  normalized.contributors.forEach((entry, index) => {
    const entryLabel = `${label}.contributors[${index}]`;
    if (!KIND_SET.has(entry.kind)) {
      errors.push(
        `${entryLabel}.kind must be one of ${AUTHORING_PROVENANCE_KINDS.join(", ")}`
      );
    }
    if (!nonEmptyString(entry.name)) {
      errors.push(`${entryLabel}.name must be a non-empty string`);
    }
    const key = contributorKey(entry.kind, entry.name);
    if (seen.has(key)) {
      errors.push(
        `${entryLabel} duplicates kind+name "${entry.kind}" / "${entry.name}"; upsert in place`
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
  return errors;
}

/** Replace-or-append by kind+name. Does not invent or change collaboration. */
export function upsertProvenanceContributor(provenance, contributor) {
  const nextContributor = normalizeContributor(contributor);
  if (!nextContributor) return provenance;

  const base = provenance && typeof provenance === "object" && !Array.isArray(provenance)
    ? provenance
    : null;
  const contributors = Array.isArray(base?.contributors) ? [...base.contributors] : [];
  const key = contributorKey(nextContributor.kind, nextContributor.name);
  const index = contributors.findIndex(existing =>
    existing &&
    KIND_SET.has(existing.kind) &&
    nonEmptyString(existing.name) &&
    contributorKey(existing.kind, existing.name) === key
  );
  if (index < 0) contributors.push(nextContributor);
  else contributors[index] = { ...contributors[index], ...nextContributor };

  return {
    ...(base || {}),
    ...(base?.collaboration ? { collaboration: base.collaboration } : {}),
    contributors
  };
}

/**
 * Infer a consistent collaboration mode from contributor kinds when seeding.
 */
export function inferCollaboration(contributors) {
  const list = Array.isArray(contributors) ? contributors : [];
  let humans = 0;
  let generative = 0;
  for (const entry of list) {
    if (entry?.kind === "human") humans += 1;
    if (entry?.kind === "generative") generative += 1;
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
export function reconcileCollaboration(provenance) {
  if (!provenance || typeof provenance !== "object") return provenance;
  const contributors = Array.isArray(provenance.contributors) ? provenance.contributors : [];
  const inferred = inferCollaboration(contributors);
  if (!inferred) return provenance;

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

  return { ...provenance, collaboration, contributors };
}

/** Upsert a generative system into provenance and reconcile mode. */
export function upsertGenerativeProvenance(provenance, { system, provider, model } = {}) {
  if (!nonEmptyString(system)) return provenance;
  const next = upsertProvenanceContributor(provenance, {
    kind: "generative",
    name: system.trim(),
    ...(nonEmptyString(provider) ? { provider: provider.trim() } : {}),
    ...(nonEmptyString(model) ? { model: model.trim() } : {})
  });
  return reconcileCollaboration(next);
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

export function contributorsByKind(provenance, kind) {
  return (provenance?.contributors || [])
    .filter(entry => entry?.kind === kind && nonEmptyString(entry.name))
    .map(entry => entry.name.trim());
}

/** L2 agent/admin summary — mode + names; no dates/roles/scopes. */
export function renderProvenanceL2(provenance) {
  if (!provenance || !COLLABORATION_SET.has(provenance.collaboration)) return null;
  const contributors = Array.isArray(provenance.contributors) ? provenance.contributors : [];
  if (!contributors.length) return null;
  const parts = contributors
    .filter(entry => KIND_SET.has(entry?.kind) && nonEmptyString(entry?.name))
    .map(entry => `${entry.name.trim()} (${entry.kind})`);
  if (!parts.length) return null;
  return `${provenance.collaboration}: ${parts.join("; ")}`;
}

/**
 * L1 player byline from mode + names. Product-side; not the agent contract.
 * Uses AUTHORING_SETTINGS.credit templates where they fit.
 */
export function renderProvenanceL1(provenance, settings = AUTHORING_SETTINGS) {
  if (!provenance || !COLLABORATION_SET.has(provenance.collaboration)) return null;
  const humans = contributorsByKind(provenance, "human");
  const generative = contributorsByKind(provenance, "generative");
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
export function provenanceFromGenerativeAssistance(entries) {
  const seen = new Set();
  const contributors = [];
  for (const entry of entries || []) {
    if (!nonEmptyString(entry?.system)) continue;
    const name = entry.system.trim();
    const key = contributorKey("generative", name);
    if (seen.has(key)) continue;
    seen.add(key);
    contributors.push({
      kind: "generative",
      name,
      ...(nonEmptyString(entry.provider) ? { provider: entry.provider.trim() } : {})
    });
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
 * provenance. When L1 can render, drop stored learningIntroduction.credit
 * so the byline stays a derived read-only field. Opaque legacy credits are
 * kept only when provenance cannot produce L1.
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
      provenance = upsertHumanProvenance(provenance, { name: parsed.author });
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
      });
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

  // Honor explicit humanPrimary / aiPrimary when both kinds are present.
  if (
    (collaboration === "humanPrimary" || collaboration === "aiPrimary") &&
    provenance.contributors.some(c => c.kind === "human") &&
    provenance.contributors.some(c => c.kind === "generative")
  ) {
    provenance = { ...provenance, collaboration };
  }

  if (collaboration === "human" || collaboration === "ai") {
    provenance = reconcileCollaboration({ ...provenance, collaboration });
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
