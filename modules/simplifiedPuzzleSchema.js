// A flatter, LLM-friendly authoring input for puzzle drafts. Authors
// never write @context/@id/@type/schemaVersion, and never keep a cluster or
// bridge's own id/@id pair in sync by hand.
//
// "Simplified" means the identity ceremony is gone while authored puzzle
// content remains available. Repository-owned lifecycle metadata is excluded:
// the infrastructure supplies dates, revisions, hashes, and status outside
// this document. Legacy bridge termRole is migration-only and is removed before
// this schema is parsed. JSON-LD is interchange-only (content:export/import),
// never a stored draft. Live authoring uses puzzleFromAuthoredDocument() to
// reach the runtime puzzle model.
import * as z from "zod/v4";
import { IDENTITY_COLOR_KEYS } from "./colorPalette.js";
import { lessonCreditFieldDescription } from "./authoringSettings.js";
import {
  AUTHORING_PROVENANCE_COLLABORATION,
  AUTHORING_PROVENANCE_KINDS,
  AUTHORING_PROVENANCE_REASONING_LEVELS,
  AUTHORING_PROVENANCE_REVIEWED_BY_MAX,
  AUTHORING_PROVENANCE_SWITCHES,
  normalizeAuthoringProvenance
} from "./authoringProvenance.js";
import {
  MAX_LESSON_CREDIT_LENGTH
} from "./generativeAssistance.js";
import { stripSystemAuthoredMetadata } from "./authoringDomains.js";
import {
  decodeAuthoredEscapedNewlines,
  LEARNING_MEDIA_TYPE,
  LEARNING_REQUIREMENTS
} from "./learningIntroduction.js";
import { puzzleToJsonLd } from "./puzzleJsonLd.js";
import { largeField, puzzleNodeCount } from "./puzzleBoardSize.js";
import {
  CATEGORIES,
  PUZZLE_LEVELS,
  canonicalizePuzzleCategoryReferences,
  slugify
} from "../puzzles/categories.js";
import { PUZZLE_KINDS } from "./authoringProfiles.js";
import { canonicalizeDocumentInfoLinks, hoistDocumentCitations } from "./termInfo.js";
import { canonicalizeDocumentProvenance } from "./authoringProvenance.js";

const SlugSchema = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "must be a lowercase slug (letters, digits, single hyphens)"
);

const CategoryReferenceSchema = z.string().min(1).describe(
  "Stable category id (for example computer-science), not the category display title. Legacy titles are accepted on read and converted before storage."
);

// A displayed term (cluster seed/floating term, bridge term) becomes a
// pill in Star mode sized by pillWidth (modules/puzzleGraph.js) -- width
// grows linearly with length, unbounded, so an unusually long string
// bloats its own pill, pushes neighbors via the force-sim collision
// radius, and can overflow the free-strip row it packs into. 40 is
// double the longest term already in real content (~20 chars, see
// BOARD_SIZE's comment in game.js) -- room for a legitimately long
// compound term while still catching paste/typo mistakes.
const TermSchema = z.string().min(1).max(40, "must be 40 characters or fewer");

const CitationSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1).optional(),
  publisher: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
  pages: z.string().min(1).optional(),
  url: z.string().min(1).optional()
}).strict();

// Matches validateInfo() in modules/contentValidation.js: any info-shaped
// field accepts either a plain string or this object -- both are valid
// everywhere puzzle/cluster/bridge/termInfo info is used.
const LinkEntrySchema = z.union([
  z.string().min(1),
  z.object({
    href: z.string().min(1),
    label: z.string().min(1).optional()
  }).strict()
]);

// Canonical authoring field is `links` (ordered by pertinence). Leftover
// `link` / `linkLabel` / `extraLink` / `seeAlso` are a load-time fold, not
// part of this write contract.
const infoObjectShape = {
  text: z.string().min(1).optional(),
  links: z.array(LinkEntrySchema).min(1).optional()
};

// Nested info (cluster, term, bridge, related-puzzle) is help text plus
// links. Bibliographic citations belong on puzzle info only.
const NestedInfoObjectSchema = z.object(infoObjectShape).strict();
const PuzzleInfoObjectSchema = z.object({
  ...infoObjectShape,
  citations: z.array(CitationSchema).min(1).optional()
}).strict();
const InfoValueSchema = z.union([z.string().min(1), NestedInfoObjectSchema]);
const PuzzleInfoValueSchema = z.union([z.string().min(1), PuzzleInfoObjectSchema]);

// The construct canvas uses this transient field while an author is moving a
// term between clusters. It is never playable content: a submitted puzzle
// must assign every term to a cluster or bridge. Keep the field in the input
// shape solely to produce a direct validation error instead of silently
// stripping it during conversion.
const UnplacedTermsSchema = z.array(TermSchema).superRefine((terms, ctx) => {
  if (!terms.length) return;
  const listed = terms.map(term => `"${term}"`).join(", ");
  ctx.addIssue({
    code: "custom",
    message:
      `contains unplaced term${terms.length === 1 ? "" : "s"} ${listed}; ` +
      "assign every listed term to a cluster or bridge before validation"
  });
});

const ClusterColorEnum = z.enum(IDENTITY_COLOR_KEYS);

// Matches VALID_RELATION_KINDS in modules/contentValidation.js.
const RelationKindEnum = z.enum([
  "dynamic", "foundation", "cross-cutting", "contrast", "continuity", "evaluation"
]);

// The old bridge-role field had exactly these two values. Keep the legacy
// vocabulary narrow at the compatibility boundary: a malformed old value is
// left in place so the current strict schema reports it instead of silently
// discarding authored data.
const LEGACY_TERM_ROLES = new Set(["reference", "connector"]);

export const LARGE_DESCRIPTION =
  "Derived automatically from node count on save; omit this field. Keep total nodes (cluster terms plus bridges) at or below 25; split into relatedPuzzles above 25.";
export const LEARNING_MARKDOWN_DESCRIPTION =
  "Markdown lesson body whose string value contains real line breaks: blank lines between paragraphs, headings on their own lines. The dialog already shows title, so do not repeat it as the first line. Do not write the two-character sequence backslash-n; the tool serializer encodes newlines.";
export const LESSON_CREDIT_DESCRIPTION = lessonCreditFieldDescription();

// Matches VALID_BRIDGE_DIRECTIONS in modules/contentValidation.js. Whether
// `kind` is consistent with the bridge's own cluster count, and whether
// from/to are required/forbidden for a given kind, is a semantic rule this
// schema doesn't re-implement -- validatePuzzleContent() (run downstream,
// after conversion) already checks it identically for every input format.
const DirectionSchema = z.object({
  kind: z.enum(["undirected", "through", "bidirectional", "outward", "inward"]),
  from: SlugSchema.optional(),
  to: SlugSchema.optional()
}).strict();

// Every lens requires `explanation` regardless of mode (modules/lensValidation.js).
// `targets` is required for sequential/assignment mode and unused for quiz
// mode (which uses `options[].targets` instead); `reasons` is assignment-
// mode-specific (per-target rationale); `options` is quiz-mode-specific.
// Which combination is actually required for the puzzle's `lensMode` is a
// semantic rule left to the downstream validator, same as DirectionSchema
// above.
const LensOptionSchema = z.object({
  id: SlugSchema,
  label: z.string().min(1),
  correct: z.boolean().optional(),
  targets: z.array(z.string().min(1)).optional()
}).strict();
const LensSchema = z.object({
  id: SlugSchema,
  prompt: z.string().min(1),
  explanation: z.string().min(1),
  label: z.string().min(1).optional(),
  definition: z.string().min(1).optional(),
  color: ClusterColorEnum.optional(),
  targets: z.array(z.string().min(1)).optional(),
  reasons: z.record(z.string().min(1), z.string().min(1)).optional(),
  options: z.array(LensOptionSchema).optional()
}).strict();

// Two-axis stored-document provenance (docs/dev-briefs/authoring-provenance-shape.md).
// The MCP authoring schema filters this field out; infrastructure stamps a
// recognized client and human/editorial paths maintain attribution. Normalize
// persists a lean shape (name + non-derivable overrides only).
const ProvenanceContributorInputSchema = z.union([
  z.string().min(1),
  z.object({
    kind: z.enum([...AUTHORING_PROVENANCE_KINDS]).optional(),
    name: z.string().min(1),
    provider: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    // Per-contributor now (see authoringProvenance.js); the top-level
    // fields below remain only for legacy documents predating that move,
    // folded onto the sole generative contributor on normalize.
    reasoning: z.enum([...AUTHORING_PROVENANCE_REASONING_LEVELS]).optional(),
    switch: z.enum([...AUTHORING_PROVENANCE_SWITCHES]).optional()
  }).strict()
]);

const ProvenanceSchema = z.object({
  collaboration: z.enum([...AUTHORING_PROVENANCE_COLLABORATION]).optional(),
  contributors: z.array(ProvenanceContributorInputSchema).min(1),
  // Document-wide reasoning/switch predated per-contributor reasoning/switch
  // and have been eliminated: put them on the contributor entry in
  // `contributors` instead. Not declared here, so this strict object rejects
  // them if they ever reach it directly -- but canonicalizeDocumentProvenance
  // (authoredDocumentForSchema, ahead of every parse of this schema) already
  // folds any surviving top-level value onto the sole generative contributor
  // and strips it before this schema ever sees it, so a legacy or previously
  // stored document still round-trips without failing validation.
  speed: z.enum(["fast", "normal", "max", "ultracode"]).optional(),
  reviewedBy: z.string().max(AUTHORING_PROVENANCE_REVIEWED_BY_MAX).optional()
    .describe("Author-owned reviewer name for the lesson byline. Leave unset; the human fills this on the drafts page. Do not invent a reviewer.")
}).strict().transform((value, ctx) => {
  const normalized = normalizeAuthoringProvenance(value);
  if (!normalized) {
    ctx.addIssue({
      code: "custom",
      message: "provenance must normalize to collaboration + contributors"
    });
    return z.NEVER;
  }
  return normalized;
});

const RelatedPuzzlesSchema = z.object({
  info: InfoValueSchema.optional(),
  entries: z.array(z.object({
    id: z.string().min(1),
    reason: z.string().min(1),
    via: z.array(z.string().min(1)).optional()
  }).strict()).min(1)
}).strict().describe(
  "Player-facing next-puzzle links only. Split-plan boardOrder is external metadata; do not add order or boardOrder here."
);

// Matches modules/learningIntroductionValidationCore.js. Only `content.text`
// is offered here (not `content.src`) -- hosted drafts must embed Markdown
// directly regardless (requireEmbedded: true), and a chatbot has no
// filesystem to point `src` at in the first place.
const LearningIntroductionSchema = z.object({
  requirement: z.enum([...LEARNING_REQUIREMENTS]),
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  estimatedMinutes: z.number().int().min(1).max(60).optional(),
  credit: z.string().min(1).max(MAX_LESSON_CREDIT_LENGTH)
    .optional()
    .describe(LESSON_CREDIT_DESCRIPTION),
  content: z.object({
    text: z.string().min(1).describe(LEARNING_MARKDOWN_DESCRIPTION)
  }).strict(),
  links: z.array(LinkEntrySchema).min(1).optional(),
  // Bibliographic references live on puzzle info.citations only. Leftover
  // learningIntroduction.citations still fold up via hoistDocumentCitations.
}).strict();

const ClusterSchema = z.object({
  id: SlugSchema.optional(), // Derived from name when omitted -- see puzzleFromSimplified.
  name: z.string().min(1),
  color: ClusterColorEnum.optional(), // Auto-assigned server-side if omitted.
  fact: z.string().min(1),
  // Multi-cluster puzzles can ask the player to build groups from seeds and
  // floating terms. A one-cluster Vocabulary puzzle instead authors its
  // complete term list directly; the root refinement below selects exactly
  // one of those shapes based on puzzleKind and cluster count.
  seeds: z.array(TermSchema).min(1).max(2).optional(),
  floatingTerms: z.array(TermSchema).min(1).max(5).optional(),
  // In a one-cluster Vocabulary puzzle this is its complete term list. For
  // seed/floating shapes it can preserve the display order when it differs
  // from seeds-then-floatingTerms (notably in migrated JSON-LD); that form
  // must contain exactly the seed and floating terms, checked by
  // puzzleFromSimplified.
  terms: z.array(TermSchema).min(2).max(7).optional(),
  termInfo: z.record(z.string().min(1), InfoValueSchema).optional(),
  info: InfoValueSchema.optional()
}).strict().superRefine((cluster, context) => {
  const hasSeeds = cluster.seeds !== undefined;
  const hasFloatingTerms = cluster.floatingTerms !== undefined;
  if (hasSeeds !== hasFloatingTerms) {
    context.addIssue({
      code: "custom",
      path: [hasSeeds ? "floatingTerms" : "seeds"],
      message: "seeds and floatingTerms must be supplied together"
    });
    return;
  }
  if (!hasSeeds) {
    if (!cluster.terms) {
      context.addIssue({
        code: "custom",
        path: ["terms"],
        message: "provide a terms list when seeds and floatingTerms are omitted"
      });
    } else if (new Set(cluster.terms).size !== cluster.terms.length) {
      context.addIssue({
        code: "custom",
        path: ["terms"],
        message: "terms must not repeat a term"
      });
    }
    return;
  }

  if (new Set([...cluster.seeds, ...cluster.floatingTerms]).size !==
      cluster.seeds.length + cluster.floatingTerms.length) {
    context.addIssue({
      code: "custom",
      message: "seeds and floatingTerms must not repeat a term"
    });
  }
  // A single seed is the minimum-size exception: it only makes sense
  // alongside exactly one floatingTerm (2 terms total).
  if (cluster.seeds.length === 1 && cluster.floatingTerms.length !== 1) {
    context.addIssue({
      code: "custom",
      message: "a cluster with one seed must have exactly one floatingTerm"
    });
  }
});

// clusters here are the OTHER clusters' string ids (2, or 3 for a ternary
// bridge), resolved to positional indices by puzzleFromSimplified() below --
// runtime bridges reference clusters by index, but authors should never
// have to think in positions. direction/idealTerms below reference cluster
// ids the same way.
const BridgeSchema = z.object({
  id: SlugSchema.optional(), // Derived from term when omitted -- see puzzleFromSimplified.
  term: TermSchema,
  clusters: z.array(SlugSchema).min(2).max(3),
  fact: z.string().min(1),
  info: InfoValueSchema.optional(),
  conceptId: z.string().min(1).optional(),
  relationKind: RelationKindEnum.optional(),
  direction: DirectionSchema.optional(),
  // {clusterId: idealTerm} -- only list the clusters worth specifying;
  // omitted clusters get null. Keys must be among this bridge's own
  // `clusters`, checked by puzzleFromSimplified (a converter-level check,
  // like unknown cluster references, rather than a second schema for it).
  idealTerms: z.record(z.string().min(1), z.string().min(1)).optional()
}).strict();

export const SimplifiedPuzzleInputSchema = z.object({
  id: SlugSchema,
  title: z.string().min(1),
  category: CategoryReferenceSchema,
  puzzleKind: z.enum([...PUZZLE_KINDS]).optional().describe(
    "Authored puzzle type, independent of category and lensMode. Omit for the default topic-based kind; explicitly use trivia-quiz for a trivia quiz or vocabulary-context for a near-synonym usage puzzle."
  ),
  categories: z.array(CategoryReferenceSchema).optional(),
  subcategories: z.record(CategoryReferenceSchema, SlugSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
  // Opt-in, small fixed vocabulary -- see puzzles/categories.js's
  // PUZZLE_LEVELS for why this isn't freeform like tags.
  level: z.enum(PUZZLE_LEVELS).optional(),
  large: z.boolean().optional().describe(LARGE_DESCRIPTION),
  info: PuzzleInfoValueSchema.optional(),
  unplacedTerms: UnplacedTermsSchema.optional(),
  // Ordinary topic/trivia sorting needs at least two groups. Vocabulary
  // contexts may use one tight synonym neighborhood when the lenses carry
  // the contextual-disambiguation work.
  clusters: z.array(ClusterSchema).min(1).max(6).describe(
    "One cluster is allowed only when puzzleKind is vocabulary-context; all other kinds require two to six clusters."
  ),
  bridges: z.array(BridgeSchema).default([]),
  lenses: z.array(LensSchema).optional(),
  lensMode: z.enum(["sequential", "assignment", "quiz"]).optional(),
  preSolve: z.boolean().optional(),
  relatedPuzzles: RelatedPuzzlesSchema.optional(),
  learningIntroduction: LearningIntroductionSchema.optional(),
  provenance: ProvenanceSchema.optional(),
  // Pass-through publication metadata -- not semantically validated by
  // contentValidation.js, just carried through unchanged. `layout` (renderer
  // layout curation) deliberately isn't offered here: it's a positional/
  // visual concern with dedicated renderer schemas, not puzzle content and
  // not something a content author typically sets.
  creator: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
  derivedFrom: z.string().min(1).optional(),
  language: z.string().min(1).optional()
}).strict().superRefine((input, context) => {
  if (input.puzzleKind !== "vocabulary-context" && input.clusters.length < 2) {
    context.addIssue({
      code: "custom",
      path: ["clusters"],
      message: "must contain at least two clusters unless puzzleKind is vocabulary-context"
    });
  }

  const singleVocabularyCluster = input.puzzleKind === "vocabulary-context" &&
    input.clusters.length === 1;
  input.clusters.forEach((cluster, index) => {
    const hasSeedSplit = cluster.seeds !== undefined || cluster.floatingTerms !== undefined;
    if (singleVocabularyCluster && hasSeedSplit) {
      context.addIssue({
        code: "custom",
        path: ["clusters", index],
        message: "a single-cluster vocabulary puzzle uses terms only; omit seeds and floatingTerms"
      });
    } else if (!singleVocabularyCluster && !hasSeedSplit) {
      context.addIssue({
        code: "custom",
        path: ["clusters", index],
        message: "clusters require seeds and floatingTerms except for a single-cluster vocabulary puzzle"
      });
    }
  });

  if (singleVocabularyCluster) {
    if (input.preSolve !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["preSolve"],
        message: "preSolve is automatic for a single-cluster vocabulary puzzle; omit it"
      });
    }
    if (input.bridges.length) {
      context.addIssue({
        code: "custom",
        path: ["bridges"],
        message: "a single-cluster vocabulary puzzle cannot contain bridges"
      });
    }
  }
});

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// The sole format discriminator between this schema and hand-written
// JSON-LD -- no new tool parameter needed. A simplified document never has
// @context; a JSON-LD document always does (validateEnvelope in
// jsonLdProfile.js requires it).
export function isJsonLdShaped(input) {
  return isObject(input) && "@context" in input;
}

// Older one-cluster Vocabulary documents used the general seeds/floatingTerms
// shape and could store an explicit preSolve choice. Fold valid instances to
// the current flat list at compatibility boundaries; the strict input schema
// itself still requires authors to use `terms` and omit preSolve.
export function canonicalizeSingleClusterVocabularyShape(document) {
  if (!isObject(document) || document.puzzleKind !== "vocabulary-context" ||
      !Array.isArray(document.clusters) || document.clusters.length !== 1) {
    return document;
  }
  const cluster = document.clusters[0];
  if (!isObject(cluster)) return document;
  if (Object.hasOwn(document, "preSolve") && typeof document.preSolve !== "boolean") {
    return document;
  }

  const hasSeeds = Object.hasOwn(cluster, "seeds");
  const hasFloatingTerms = Object.hasOwn(cluster, "floatingTerms");
  let nextCluster = cluster;
  if (hasSeeds || hasFloatingTerms) {
    if (!hasSeeds || !hasFloatingTerms || !Array.isArray(cluster.seeds) ||
        !Array.isArray(cluster.floatingTerms) ||
        (Object.hasOwn(cluster, "terms") && !Array.isArray(cluster.terms))) {
      return document;
    }
    const members = [...cluster.seeds, ...cluster.floatingTerms];
    const terms = Object.hasOwn(cluster, "terms") ? cluster.terms : members;
    const sameMembers = new Set(members).size === members.length &&
      new Set(terms).size === terms.length &&
      terms.length === members.length &&
      members.every(term => terms.includes(term)) &&
      terms.every(term => members.includes(term));
    if (!sameMembers) return document;
    nextCluster = { ...cluster, terms: [...terms] };
    delete nextCluster.seeds;
    delete nextCluster.floatingTerms;
  }

  if (nextCluster === cluster && !Object.hasOwn(document, "preSolve")) return document;
  const next = {
    ...document,
    clusters: nextCluster === cluster ? document.clusters : [nextCluster]
  };
  delete next.preSolve;
  return next;
}

// `termRole` belonged to an earlier bridge schema. Keep old drafts and
// interchange documents readable, but remove known legacy values before the
// current strict authoring schema sees them. Unknown values remain so the
// schema can report them instead of silently losing authored data. Returning
// the original object when there is nothing to repair keeps the load-time fold
// cheap and lets callers detect whether a canonical save is needed.
export function canonicalizeBridgeTermRoles(document) {
  if (!isObject(document) || !Array.isArray(document.bridges)) return document;
  let next = document;
  document.bridges.forEach((bridge, index) => {
    if (!isObject(bridge) || !Object.hasOwn(bridge, "termRole")
      || !LEGACY_TERM_ROLES.has(bridge.termRole)) return;
    if (next === document) next = { ...document, bridges: [...document.bridges] };
    const cleaned = { ...bridge };
    delete cleaned.termRole;
    next.bridges[index] = cleaned;
  });
  return next;
}

function formatZodIssues(error) {
  return error.issues.map(issue => {
    const path = issue.path.reduce((acc, segment) =>
      typeof segment === "number" ? `${acc}[${segment}]` : acc ? `${acc}.${segment}` : String(segment),
    "");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function convertBridge(bridge, clusterIndexById) {
  const resolve = (ref, context) => {
    const index = clusterIndexById.get(ref);
    if (index === undefined) {
      throw new Error(`bridges: ${context} references unknown cluster "${ref}"`);
    }
    return index;
  };
  const clusters = bridge.clusters.map(ref => resolve(ref, `bridge "${bridge.term}"`));
  const result = {
    ...(bridge.id ? { id: bridge.id } : {}),
    term: bridge.term,
    clusters,
    fact: bridge.fact,
    ...(bridge.info ? { info: clone(bridge.info) } : {}),
    ...(bridge.conceptId ? { conceptId: bridge.conceptId } : {}),
    ...(bridge.relationKind ? { relationKind: bridge.relationKind } : {})
  };
  if (bridge.idealTerms) {
    for (const ref of Object.keys(bridge.idealTerms)) {
      if (!bridge.clusters.includes(ref)) {
        throw new Error(
          `bridges: idealTerms references "${ref}", which is not one of bridge "${bridge.term}"'s own clusters`
        );
      }
    }
    result.idealTerms = bridge.clusters.map(ref => bridge.idealTerms[ref] ?? null);
  }
  if (bridge.direction) {
    result.direction = { kind: bridge.direction.kind };
    if (bridge.direction.kind === "through") {
      const context = `bridge "${bridge.term}" direction`;
      if (bridge.direction.from !== undefined) {
        if (!bridge.clusters.includes(bridge.direction.from)) {
          throw new Error(`${context}.from "${bridge.direction.from}" is not one of this bridge's own clusters`);
        }
        result.direction.from = resolve(bridge.direction.from, `${context}.from`);
      }
      if (bridge.direction.to !== undefined) {
        if (!bridge.clusters.includes(bridge.direction.to)) {
          throw new Error(`${context}.to "${bridge.direction.to}" is not one of this bridge's own clusters`);
        }
        result.direction.to = resolve(bridge.direction.to, `${context}.to`);
      }
    }
  }
  return result;
}

// Pure converter from zod-validated simplified input to the same runtime
// puzzle shape every puzzles/*.js module already exports. Assumes `input`
// already passed SimplifiedPuzzleInputSchema.parse() -- does not re-validate.
// Unlike bridge id (never referenced by anything else, so puzzleToJsonLd's
// own cluster--prefixed stableLocalIds() is fine to leave the derivation
// to), a cluster's id is exactly what a bridge has to name to reference it
// -- so an author who omits it needs to be able to predict the derived
// value. Plain slugify(name), no prefix, with the same collision-suffix
// convention as stableLocalIds() in puzzleJsonLd.js.
function deriveClusterIds(clusters) {
  const used = new Set();
  return clusters.map(cluster => {
    const preferred = cluster.id || slugify(cluster.name) || "cluster";
    let id = preferred;
    let suffix = 2;
    while (used.has(id)) id = `${preferred}-${suffix++}`;
    used.add(id);
    return id;
  });
}

export function puzzleFromSimplified(input, { categoryRegistry = CATEGORIES } = {}) {
  const categoryFields = canonicalizePuzzleCategoryReferences(input, categoryRegistry);
  const clusterIds = deriveClusterIds(input.clusters);
  const clusterIndexById = new Map(clusterIds.map((id, index) => [id, index]));
  const singleVocabularyCluster = input.puzzleKind === "vocabulary-context" &&
    input.clusters.length === 1;

  // Collect every explicitly-given color up front so an early cluster never
  // steals a color a later cluster asked for explicitly -- assigning
  // incrementally (looking only at colors seen so far) can produce an
  // avoidable duplicate-color error downstream. Mirrors the candidate
  // filtering already established in colorPalette.js's lensColorMap().
  const explicitColors = new Set(input.clusters.map(cluster => cluster.color).filter(Boolean));
  const availableColors = IDENTITY_COLOR_KEYS.filter(color => !explicitColors.has(color));
  let nextAutoColor = 0;

  const clusters = input.clusters.map((cluster, index) => {
    const isFlatVocabularyCluster = singleVocabularyCluster &&
      cluster.seeds === undefined && cluster.floatingTerms === undefined;
    const defaultTerms = isFlatVocabularyCluster
      ? [...cluster.terms]
      : [...cluster.seeds, ...cluster.floatingTerms];
    if (cluster.terms) {
      const sameMembers = new Set(cluster.terms).size === defaultTerms.length &&
        defaultTerms.every(term => cluster.terms.includes(term)) &&
        cluster.terms.every(term => defaultTerms.includes(term));
      if (!sameMembers) {
        throw new Error(
          `clusters: "${cluster.name}"'s terms override must contain exactly its seeds and floatingTerms, reordered`
        );
      }
    }
    return {
      id: clusterIds[index],
      name: cluster.name,
      color: cluster.color || availableColors[nextAutoColor++ % availableColors.length],
      fact: cluster.fact,
      terms: cluster.terms ? [...cluster.terms] : defaultTerms,
      // The player runtime's graph representation uses seed nodes as initial
      // anchors. Single-cluster Vocabulary does not ask the author to choose
      // those anchors: derive them here, then auto-solve the board before its
      // contextual lenses begin. puzzleToSimplified collapses this runtime
      // detail back to the authored `terms` list.
      seeds: isFlatVocabularyCluster
        ? defaultTerms.slice(0, defaultTerms.length === 2 ? 1 : 2)
        : [...cluster.seeds],
      ...(cluster.termInfo ? { termInfo: clone(cluster.termInfo) } : {}),
      ...(cluster.info ? { info: clone(cluster.info) } : {})
    };
  });

  const bridges = input.bridges.map(bridge => convertBridge(bridge, clusterIndexById));
  const automaticallyPreSolved = singleVocabularyCluster && input.lenses?.length > 0;

  const learningIntroduction = input.learningIntroduction ? {
    requirement: input.learningIntroduction.requirement,
    ...(input.learningIntroduction.title ? { title: input.learningIntroduction.title } : {}),
    ...(input.learningIntroduction.summary ? { summary: input.learningIntroduction.summary } : {}),
    ...(input.learningIntroduction.estimatedMinutes !== undefined
      ? { estimatedMinutes: input.learningIntroduction.estimatedMinutes } : {}),
    ...(input.learningIntroduction.credit
      ? { credit: input.learningIntroduction.credit.trim() } : {}),
    content: {
      mediaType: LEARNING_MEDIA_TYPE,
      text: decodeAuthoredEscapedNewlines(input.learningIntroduction.content.text)
    },
    ...(input.learningIntroduction.links ? { links: clone(input.learningIntroduction.links) } : {})
  } : undefined;

  return {
    id: input.id,
    title: input.title,
    category: categoryFields.category,
    ...(input.puzzleKind ? { puzzleKind: input.puzzleKind } : {}),
    ...(categoryFields.categories ? { categories: [...categoryFields.categories] } : {}),
    ...(categoryFields.subcategories ? { subcategories: clone(categoryFields.subcategories) } : {}),
    ...largeField(puzzleNodeCount({ clusters, bridges })),
    ...(input.tags ? { tags: [...input.tags] } : {}),
    ...(input.level ? { level: input.level } : {}),
    ...(input.info ? { info: clone(input.info) } : {}),
    clusters,
    bridges,
    ...(input.lenses ? { lenses: clone(input.lenses) } : {}),
    ...(input.lensMode ? { lensMode: input.lensMode } : {}),
    ...(automaticallyPreSolved
      ? { preSolve: true }
      : input.preSolve !== undefined ? { preSolve: input.preSolve } : {}),
    ...(input.relatedPuzzles ? { relatedPuzzles: clone(input.relatedPuzzles) } : {}),
    ...(learningIntroduction ? { learningIntroduction } : {}),
    ...(input.provenance ? { provenance: clone(input.provenance) } : {}),
    ...(input.creator ? { creator: input.creator } : {}),
    ...(input.license ? { license: input.license } : {}),
    ...(input.derivedFrom ? { derivedFrom: input.derivedFrom } : {}),
    ...(input.language ? { language: input.language } : {})
  };
}

// Re-exported from modules/puzzleSimplified.js -- factored out to a
// zod-free module so repositoryPublicationService.js (shared with
// tools/content-jsonld.mjs's node_modules-free CLI, see that module's
// comment) can depend on the conversion directly. Every other caller keeps
// importing it from here.
export { puzzleForCanonicalPublication, puzzleToSimplified } from "./puzzleSimplified.js";

// Detects which format `input` is and returns canonical JSON-LD either way.
// Interchange-only (content:export of simplified input). Live authoring
// never calls this -- drafts store the simplified document unchanged.
// Never throws. `document: null` means input was neither valid JSON-LD
// (that's not checked here -- see the profile validator) nor valid
// simplified input; `errors` then holds formatted, actionable messages a
// caller can surface directly rather than falling through to confusing
// JSON-LD-profile errors ("@context must be...") for an author who never
// wrote JSON-LD. This is a pure shape/cardinality gate -- it deliberately
// does not re-implement validatePuzzleContent/validatePuzzleLenses's
// semantic rules (duplicate terms, node-count cap, lens target existence,
// direction/lensMode consistency, etc.); those already run, unchanged, on
// whatever JSON-LD document comes out of here, regardless of which format
// the author used.
export function authoredDocumentForSchema(input, { categoryRegistry = CATEGORIES } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  return hoistDocumentCitations(
    canonicalizeDocumentInfoLinks(
      canonicalizeBridgeTermRoles(
        canonicalizePuzzleCategoryReferences(
          canonicalizeDocumentProvenance(
            stripSystemAuthoredMetadata(input)
          ),
          categoryRegistry
        )
      )
    )
  );
}

// Already-JSON-LD input is interchange, not a draft. Simplified input is
// folded to the current write contract (leftover link/sources names) before
// the schema parse so MCP can advertise `links` only.
export function normalizeAuthoredPuzzleDocument(input, options = {}) {
  if (isJsonLdShaped(input)) return { document: input, errors: [] };
  const compatibleInput = canonicalizeSingleClusterVocabularyShape(input);
  const parsed = SimplifiedPuzzleInputSchema.safeParse(
    authoredDocumentForSchema(compatibleInput, options)
  );
  if (!parsed.success) return { document: null, errors: formatZodIssues(parsed.error) };
  try {
    return {
      document: puzzleToJsonLd(puzzleFromSimplified(parsed.data, options), options),
      errors: []
    };
  } catch (error) {
    return { document: null, errors: [error.message] };
  }
}

// The hosted and local authoring path's converter to the runtime puzzle
// model. Simplified input is the only supported authoring shape (see
// docs/JSON-LD.md). JSON-LD is interchange-only and is not accepted here.
// Never throws; `puzzle: null` means invalid input, with formatted `errors`
// a caller can surface directly.
export function puzzleFromAuthoredDocument(input, options = {}) {
  if (isJsonLdShaped(input)) {
    return {
      puzzle: null,
      errors: [
        "Drafts use the simplified format. JSON-LD is interchange-only (content:export/import)."
      ]
    };
  }
  const compatibleInput = canonicalizeSingleClusterVocabularyShape(input);
  const parsed = SimplifiedPuzzleInputSchema.safeParse(
    authoredDocumentForSchema(compatibleInput, options)
  );
  if (!parsed.success) return { puzzle: null, errors: formatZodIssues(parsed.error) };
  try {
    return { puzzle: puzzleFromSimplified(parsed.data, options), errors: [] };
  } catch (error) {
    return { puzzle: null, errors: [error.message] };
  }
}
