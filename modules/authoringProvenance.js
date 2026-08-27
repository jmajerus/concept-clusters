// Compact two-axis authoring provenance (see docs/dev-briefs/authoring-provenance-shape.md).
// Model of record: collaboration mode + contributors. Player bylines are L1
// projections; agents are taught L2 only. Dates/roles/scopes stay L3 / unused here.
import {
  AUTHORING_SETTINGS,
  fillAuthoringTemplate,
  preferredCreditTemplateId
} from "./authoringSettings.js";
import { formatSystemsList } from "./generativeAssistance.js";

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

function normalizeContributor(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  if (!KIND_SET.has(entry.kind) || !nonEmptyString(entry.name)) return null;
  const next = {
    kind: entry.kind,
    name: entry.name.trim()
  };
  if (nonEmptyString(entry.provider)) next.provider = entry.provider.trim();
  if (nonEmptyString(entry.model)) next.model = entry.model.trim();
  return next;
}

export function validateAuthoringProvenance(raw, label = "provenance") {
  if (raw === undefined) return [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return [`${label} must be an object when present`];
  }
  const errors = [];
  if (!COLLABORATION_SET.has(raw.collaboration)) {
    errors.push(
      `${label}.collaboration must be one of ${AUTHORING_PROVENANCE_COLLABORATION.join(", ")}`
    );
  }
  if (!Array.isArray(raw.contributors) || raw.contributors.length === 0) {
    errors.push(`${label}.contributors must be a non-empty array when provenance is present`);
    return errors;
  }

  const seen = new Set();
  let humans = 0;
  let generative = 0;
  raw.contributors.forEach((entry, index) => {
    const entryLabel = `${label}.contributors[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${entryLabel} must be an object`);
      return;
    }
    if (!KIND_SET.has(entry.kind)) {
      errors.push(
        `${entryLabel}.kind must be one of ${AUTHORING_PROVENANCE_KINDS.join(", ")}`
      );
    }
    if (!nonEmptyString(entry.name)) {
      errors.push(`${entryLabel}.name must be a non-empty string`);
    }
    for (const key of ["provider", "model"]) {
      if (entry[key] !== undefined && !nonEmptyString(entry[key])) {
        errors.push(`${entryLabel}.${key} must be a non-empty string when present`);
      }
    }
    if (KIND_SET.has(entry.kind) && nonEmptyString(entry.name)) {
      const key = contributorKey(entry.kind, entry.name);
      if (seen.has(key)) {
        errors.push(
          `${entryLabel} duplicates kind+name "${entry.kind}" / "${entry.name.trim()}"; upsert in place`
        );
      }
      seen.add(key);
      if (entry.kind === "human") humans += 1;
      if (entry.kind === "generative") generative += 1;
    }
  });

  if (errors.length || !COLLABORATION_SET.has(raw.collaboration)) return errors;

  const mode = raw.collaboration;
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
  if (humans && generative) return "humanPrimary";
  return null;
}

/**
 * Keep collaboration consistent after adding a contributor. Never invent people.
 * human + new generative → humanPrimary; ai + new human → humanPrimary.
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
    collaboration = inferred === "ai" ? "ai" : "humanPrimary";
  } else if (collaboration === "ai" && inferred !== "ai") {
    collaboration = inferred === "human" ? "human" : "humanPrimary";
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
