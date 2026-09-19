// Field-ownership map for write-domain scoping.
//
// Canonical schema (simplifiedPuzzleSchema) answers "what is valid?"
// This map answers "who owns it, may another domain see it, and is it
// authored / protected / derived?" Domain projections and phase schemas
// both consume it so a focused schema cannot advertise a field its
// matching domain save would reject or that must never be agent-written.

export const AUTHORING_DOMAINS = Object.freeze([
  "content",
  "pedagogy",
  "provenance",
  "system"
]);

export const AUTHORING_READ_DOMAINS = Object.freeze([
  "complete",
  "content",
  "pedagogy"
]);

export const AUTHORING_WRITE_DOMAINS = Object.freeze(["content", "pedagogy"]);

export const AUTHORING_PHASES = Object.freeze([
  "complete",
  "core",
  "review",
  "pedagogy",
  "publication"
]);

/** @typedef {"authored" | "protected" | "derived" | "retired"} FieldKind */

/**
 * @typedef {object} FieldOwnership
 * @property {"content" | "pedagogy" | "provenance" | "system"} domain
 * @property {FieldKind} kind
 * @property {boolean} [identity] stable cross-domain identity for this field
 * @property {ReadonlyArray<"content" | "pedagogy">} [contextFor]
 *   domains that may receive this field as read-only sibling context
 */

/** @type {Readonly<Record<string, FieldOwnership>>} */
export const ROOT_FIELD_OWNERSHIP = Object.freeze({
  id: { domain: "content", kind: "authored", identity: true, contextFor: ["pedagogy"] },
  title: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  category: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  info: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  clusters: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  // Root `bridges` is split: content owns the core shape; pedagogy owns
  // annotation fields layered onto the same array (see BRIDGE_FIELD_OWNERSHIP).
  bridges: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },

  categories: { domain: "pedagogy", kind: "authored" },
  subcategories: { domain: "pedagogy", kind: "authored" },
  tags: { domain: "pedagogy", kind: "authored" },
  level: { domain: "pedagogy", kind: "authored" },
  lenses: { domain: "pedagogy", kind: "authored" },
  lensMode: { domain: "pedagogy", kind: "authored" },
  preSolve: { domain: "pedagogy", kind: "authored" },
  relatedPuzzles: { domain: "pedagogy", kind: "authored" },
  learningIntroduction: { domain: "pedagogy", kind: "authored" },
  creator: { domain: "pedagogy", kind: "authored" },
  license: { domain: "pedagogy", kind: "authored" },
  derivedFrom: { domain: "pedagogy", kind: "authored" },
  language: { domain: "pedagogy", kind: "authored" },

  provenance: { domain: "provenance", kind: "protected" },

  large: { domain: "system", kind: "derived" },

  schemaVersion: { domain: "system", kind: "protected" },
  publicationState: { domain: "system", kind: "protected" },
  validatedAt: { domain: "system", kind: "protected" },
  createdAt: { domain: "system", kind: "protected" },
  updatedAt: { domain: "system", kind: "protected" },
  owner: { domain: "system", kind: "protected" },
  ownerSubject: { domain: "system", kind: "protected" },
  owner_subject: { domain: "system", kind: "protected" },
  revision: { domain: "system", kind: "protected" },
  contentHash: { domain: "system", kind: "protected" },
  content_hash: { domain: "system", kind: "protected" },
  system: { domain: "system", kind: "protected" },
  context: { domain: "system", kind: "protected" },
  domains: { domain: "system", kind: "protected" },
  domain: { domain: "system", kind: "protected" },
  draftId: { domain: "system", kind: "protected" },
  draft_id: { domain: "system", kind: "protected" },
  status: { domain: "system", kind: "protected" },
  validation: { domain: "system", kind: "protected" },
  workingCopyHistoryCount: { domain: "system", kind: "protected" },
  installedContentHash: { domain: "system", kind: "protected" },
  baseCommitSha: { domain: "system", kind: "protected" },
  publishedAt: { domain: "system", kind: "protected" },
  publishedBy: { domain: "system", kind: "protected" },
  withdrawnAt: { domain: "system", kind: "protected" },
  cuedForFreezeAt: { domain: "system", kind: "protected" },
  cuedForFreezeBy: { domain: "system", kind: "protected" },
  lastAgentReviewedAt: { domain: "system", kind: "protected" },
  lastHumanReviewedAt: { domain: "system", kind: "protected" },
  dateCreated: { domain: "system", kind: "protected" },
  dateModified: { domain: "system", kind: "protected" },
  version: { domain: "system", kind: "protected" },

  generativeAssistance: { domain: "provenance", kind: "retired" }
});

/** @type {Readonly<Record<string, FieldOwnership>>} */
export const CLUSTER_FIELD_OWNERSHIP = Object.freeze({
  id: { domain: "content", kind: "authored", identity: true, contextFor: ["pedagogy"] },
  name: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  color: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  fact: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  seeds: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  floatingTerms: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  terms: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  termInfo: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  info: { domain: "content", kind: "authored", contextFor: ["pedagogy"] }
});

/** @type {Readonly<Record<string, FieldOwnership>>} */
export const BRIDGE_FIELD_OWNERSHIP = Object.freeze({
  id: { domain: "content", kind: "authored", identity: true, contextFor: ["pedagogy"] },
  term: { domain: "content", kind: "authored", identity: true, contextFor: ["pedagogy"] },
  clusters: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  fact: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  info: { domain: "content", kind: "authored", contextFor: ["pedagogy"] },
  conceptId: { domain: "pedagogy", kind: "authored" },
  relationKind: { domain: "pedagogy", kind: "authored" },
  direction: { domain: "pedagogy", kind: "authored" },
  idealTerms: { domain: "pedagogy", kind: "authored" }
});

/**
 * Pass definitions: which owned fields appear in each progressive phase.
 * A phase is a task view over one accumulating draft, not a standalone
 * document. When `writeDomain` is set, every listed field must belong to
 * that domain (bridge identity fields may appear on a pedagogy pass).
 * `review` is intentionally cross-domain for inspection; it has no
 * writeDomain and must not be saved as a domain replacement.
 *
 * @type {Readonly<Record<string, {
 *   writeDomain: "content" | "pedagogy" | null,
 *   root: ReadonlyArray<string>,
 *   clusters?: ReadonlyArray<string>,
 *   bridges?: ReadonlyArray<string>
 * }>>}
 */
export const AUTHORING_PHASE_PASSES = Object.freeze({
  core: Object.freeze({
    writeDomain: "content",
    root: Object.freeze(["id", "title", "category", "info", "clusters", "bridges"]),
    clusters: Object.freeze([
      "id", "name", "fact", "seeds", "floatingTerms", "terms", "termInfo", "info"
    ]),
    bridges: Object.freeze(["id", "term", "clusters", "fact", "info"])
  }),
  review: Object.freeze({
    writeDomain: null,
    root: Object.freeze(["clusters", "bridges"]),
    clusters: Object.freeze([
      "id", "name", "fact", "seeds", "floatingTerms", "terms", "termInfo", "info"
    ]),
    // Content core for inspection plus pedagogy annotations for the
    // relationship check. Annotation writes go through domain=pedagogy;
    // do not save this phase shape as a content or pedagogy replacement.
    bridges: Object.freeze([
      "id", "term", "clusters", "fact", "info",
      "conceptId", "relationKind", "direction", "idealTerms"
    ])
  }),
  pedagogy: Object.freeze({
    writeDomain: "pedagogy",
    root: Object.freeze(["lenses", "lensMode", "preSolve", "learningIntroduction"])
  }),
  publication: Object.freeze({
    writeDomain: "pedagogy",
    // Provenance is protected; agents do not author it through this pass.
    root: Object.freeze([
      "categories", "subcategories", "tags", "level", "relatedPuzzles",
      "creator", "license", "derivedFrom", "language"
    ])
  })
});

function fieldsMatching(ownership, predicate) {
  return new Set(
    Object.entries(ownership)
      .filter(([, meta]) => predicate(meta))
      .map(([name]) => name)
  );
}

export const SYSTEM_ROOT_FIELDS = fieldsMatching(
  ROOT_FIELD_OWNERSHIP,
  meta => meta.domain === "system" && meta.kind === "protected"
);

export const PEDAGOGY_ROOT_FIELDS = fieldsMatching(
  ROOT_FIELD_OWNERSHIP,
  meta => meta.domain === "pedagogy" && meta.kind === "authored"
);

export const PEDAGOGY_BRIDGE_FIELDS = fieldsMatching(
  BRIDGE_FIELD_OWNERSHIP,
  meta => meta.domain === "pedagogy" && meta.kind === "authored"
);

export const CONTENT_BRIDGE_FIELDS = fieldsMatching(
  BRIDGE_FIELD_OWNERSHIP,
  meta => meta.domain === "content" && meta.kind === "authored"
);

export const BRIDGE_IDENTITY_FIELDS = fieldsMatching(
  BRIDGE_FIELD_OWNERSHIP,
  meta => meta.identity === true
);

export const PROTECTED_ROOT_FIELDS = fieldsMatching(
  ROOT_FIELD_OWNERSHIP,
  meta => meta.kind === "protected"
);

export const DERIVED_ROOT_FIELDS = fieldsMatching(
  ROOT_FIELD_OWNERSHIP,
  meta => meta.kind === "derived"
);

export const RETIRED_ROOT_FIELDS = fieldsMatching(
  ROOT_FIELD_OWNERSHIP,
  meta => meta.kind === "retired"
);

function assertOwnedField(ownership, path, name, { writeDomain = null } = {}) {
  const meta = ownership[name];
  if (!meta) {
    throw new Error(`Unknown owned field ${path}.${name}`);
  }
  if (meta.kind === "retired") {
    throw new Error(`Retired field ${path}.${name} cannot appear in a phase pass`);
  }
  if (meta.kind === "protected" || meta.kind === "derived") {
    throw new Error(
      `${meta.kind} field ${path}.${name} cannot appear in an agent-facing phase pass`
    );
  }
  if (writeDomain && meta.domain !== writeDomain && !meta.identity) {
    throw new Error(
      `Phase field ${path}.${name} belongs to ${meta.domain}, not writeDomain ${writeDomain}`
    );
  }
  return meta;
}

/**
 * Validate that every phase pass only lists fields consistent with the
 * ownership map and its writeDomain binding. Called when building schemas
 * so drift fails closed.
 */
export function assertPhasePassesConsistent(
  passes = AUTHORING_PHASE_PASSES
) {
  for (const [phase, pass] of Object.entries(passes)) {
    const writeDomain = pass.writeDomain;
    if (writeDomain != null && !AUTHORING_WRITE_DOMAINS.includes(writeDomain)) {
      throw new Error(`Phase ${phase} writeDomain must be content or pedagogy`);
    }
    for (const name of pass.root) {
      const meta = assertOwnedField(ROOT_FIELD_OWNERSHIP, phase, name, {
        // Root `bridges` is content-owned but pedagogy passes may reference
        // the array when they only write annotation fields on items.
        writeDomain: name === "bridges" && writeDomain === "pedagogy"
          ? null
          : writeDomain
      });
      if (writeDomain === "pedagogy" && name === "bridges") {
        if (meta.domain !== "content") {
          throw new Error(`Phase ${phase} bridges root must stay content-owned`);
        }
      }
    }
    for (const name of pass.clusters || []) {
      assertOwnedField(CLUSTER_FIELD_OWNERSHIP, `${phase}.clusters`, name, {
        writeDomain
      });
    }
    for (const name of pass.bridges || []) {
      const meta = assertOwnedField(
        BRIDGE_FIELD_OWNERSHIP,
        `${phase}.bridges`,
        name,
        {
          // Review lists both domains; other passes must match writeDomain
          // except pedagogy may include content identity fields.
          writeDomain: writeDomain === null
            ? null
            : (BRIDGE_FIELD_OWNERSHIP[name]?.identity ? null : writeDomain)
        }
      );
      if (writeDomain === "content" && meta.domain === "pedagogy") {
        throw new Error(
          `Phase ${phase} content pass cannot include pedagogy bridge field ${name}`
        );
      }
    }
  }
  return true;
}

assertPhasePassesConsistent();

export default {
  AUTHORING_DOMAINS,
  AUTHORING_READ_DOMAINS,
  AUTHORING_WRITE_DOMAINS,
  AUTHORING_PHASES,
  ROOT_FIELD_OWNERSHIP,
  CLUSTER_FIELD_OWNERSHIP,
  BRIDGE_FIELD_OWNERSHIP,
  AUTHORING_PHASE_PASSES,
  SYSTEM_ROOT_FIELDS,
  PEDAGOGY_ROOT_FIELDS,
  PEDAGOGY_BRIDGE_FIELDS,
  CONTENT_BRIDGE_FIELDS,
  BRIDGE_IDENTITY_FIELDS,
  PROTECTED_ROOT_FIELDS,
  DERIVED_ROOT_FIELDS,
  RETIRED_ROOT_FIELDS,
  assertPhasePassesConsistent
};
