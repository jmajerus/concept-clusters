// A flatter, LLM-friendly authoring input for puzzle drafts, offered as an
// alternative to hand-written JSON-LD (modules/jsonLdProfile.js). Authors
// never write @context/@id/@type/schemaVersion, and never keep a cluster or
// bridge's own id/@id pair in sync by hand -- @id is always mechanically
// "#" + id (see nodeFragmentId's comment in jsonLdProfile.js), so this
// format simply never asks for it.
//
// "Simplified" means the identity ceremony is gone, not that features are
// gone: every puzzle-content field JSON-LD can express, this format can
// too (ternary bridges, direction, idealTerms, conceptId, termRole,
// relationKind,
// assignment/quiz lenses, relatedPuzzles, learningIntroduction) -- all
// optional, add them only when the puzzle actually needs them. JSON-LD
// stays fully supported as the portable interchange/storage format
// underneath, and remains available for the rare cases outside puzzle
// content proper (layouts, provenance beyond the common fields below) --
// see docs/SIMPLIFIED-PUZZLE-FORMAT.md.
//
// normalizeAuthoredPuzzleDocument() is the single entry point: it detects
// which shape it was given and, for simplified input, converts through the
// existing runtime puzzle shape and the existing, already-tested
// puzzleToJsonLd() exporter -- so everything downstream of that call
// (validation, publication, storage) sees exactly the same canonical JSON-LD
// it already knew how to handle, regardless of which format the author used.
import * as z from "zod/v4";
import { IDENTITY_COLOR_KEYS } from "./colorPalette.js";
import {
  GENERATIVE_ASSISTANCE_ROLES,
  GENERATIVE_ASSISTANCE_SCOPES
} from "./generativeAssistance.js";
import { LEARNING_MEDIA_TYPE, LEARNING_REQUIREMENTS } from "./learningIntroduction.js";
import { puzzleFromJsonLd, puzzleToJsonLd } from "./puzzleJsonLd.js";
import { validatePuzzleJsonLdProfile } from "./jsonLdProfile.js";
import { PUZZLE_LEVELS, slugify } from "../puzzles/categories.js";

const SlugSchema = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "must be a lowercase slug (letters, digits, single hyphens)"
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
const InfoObjectSchema = z.object({
  text: z.string().min(1).optional(),
  link: z.string().min(1).optional(),
  extraLink: z.string().min(1).optional(),
  seeAlso: z.union([
    z.string().min(1),
    z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1)
    }).strict()).min(1)
  ]).optional(),
  citations: z.array(CitationSchema).min(1).optional()
}).passthrough();
const InfoValueSchema = z.union([z.string().min(1), InfoObjectSchema]);

const ClusterColorEnum = z.enum(IDENTITY_COLOR_KEYS);

// Matches VALID_RELATION_KINDS in modules/contentValidation.js.
const RelationKindEnum = z.enum([
  "dynamic", "foundation", "cross-cutting", "contrast", "continuity", "evaluation"
]);

// Whether the displayed bridge term is itself intended lesson content,
// independently of relationKind's classification of the relationship in the
// bridge fact. Automatic search behavior follows this pedagogical decision;
// searchability, familiarity, and grammatical form do not determine it.
const TermRoleEnum = z.enum(["reference", "connector"]);
export const TERM_ROLE_DESCRIPTION =
  "reference (default) when the bridge term itself is an intended object of learning within the puzzle's conceptual territory and central lesson, or whenever the term is a proper noun (a specific named person, place, organization, or work) -- a name carries no self-descriptive content and always reads as a specific, findable thing worth looking up, however incidental its role feels. connector when it carries a local relationship, evidence, mechanism, plot detail, or biographical thread phrased as the generic thing itself rather than as a named entity; among non-proper-noun candidates, article existence, search quality, familiarity, and grammatical form still are not classification tests. Want connector treatment for something that's really a specific named thing? Keep the name out of the displayed term and put it in the surrounding fact/info prose instead, where it isn't the term being classified at all. Classify the role first, then curate links separately: prefer a verified direct resource for references, retaining automatic search only when its result set is deliberately useful. A connector gets no automatic or authored reference links or citations; use concise info.text, often recommended, to clarify its local function.";

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

// Matches modules/generativeAssistance.js. Both authoring-guidance blocks
// instruct the author to set this before saving, so it has to be
// representable here -- a .strict() schema that omitted it would reject
// every AI-authored draft that follows the tool's own instructions.
const GenerativeAssistanceEntrySchema = z.object({
  system: z.string().min(1),
  scope: z.enum([...GENERATIVE_ASSISTANCE_SCOPES]),
  role: z.enum([...GENERATIVE_ASSISTANCE_ROLES]).optional(),
  provider: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD").optional()
}).strict();

const RelatedPuzzlesSchema = z.object({
  info: InfoValueSchema.optional(),
  entries: z.array(z.object({
    id: z.string().min(1),
    reason: z.string().min(1),
    via: z.array(z.string().min(1)).optional()
  }).strict()).min(1)
}).strict();

// Matches modules/learningIntroductionValidationCore.js. Only `content.text`
// is offered here (not `content.src`) -- hosted drafts must embed Markdown
// directly regardless (requireEmbedded: true), and a chatbot has no
// filesystem to point `src` at in the first place.
const LearningIntroductionSchema = z.object({
  requirement: z.enum([...LEARNING_REQUIREMENTS]),
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  estimatedMinutes: z.number().int().min(1).max(60).optional(),
  content: z.object({
    text: z.string().min(1)
  }).strict(),
  sources: z.array(z.object({
    label: z.string().min(1),
    href: z.string().min(1)
  }).strict()).optional(),
  citations: z.array(CitationSchema).min(1).optional(),
  // Cache-invalidation key for locally-stored reading progress
  // (modules/learningIntroductionStore.js); bump it when content changes
  // enough that stale local progress should be discarded. Defaults to 1.
  revision: z.union([z.string().min(1), z.number()]).optional()
}).strict();

const ClusterSchema = z.object({
  id: SlugSchema.optional(), // Derived from name when omitted -- see puzzleFromSimplified.
  name: z.string().min(1),
  color: ClusterColorEnum.optional(), // Auto-assigned server-side if omitted.
  fact: z.string().min(1),
  seeds: z.tuple([TermSchema, TermSchema]),
  floatingTerms: z.array(TermSchema).min(1).max(4),
  // Explicit display order override. Authors never set this -- it exists
  // solely so canonical storage can preserve a cluster's exact term order
  // when that order doesn't happen to be seeds-then-floatingTerms (true for
  // puzzles migrated from hand-authored JSON-LD, where seed position within
  // the visible term list was a deliberate editorial choice). Must be a
  // reordering of exactly seeds+floatingTerms, checked by puzzleFromSimplified.
  terms: z.array(TermSchema).min(3).max(6).optional(),
  termInfo: z.record(z.string().min(1), InfoValueSchema).optional(),
  info: InfoValueSchema.optional()
}).strict().refine(
  cluster => new Set([...cluster.seeds, ...cluster.floatingTerms]).size ===
    cluster.seeds.length + cluster.floatingTerms.length,
  { message: "seeds and floatingTerms must not repeat a term" }
);

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
  termRole: TermRoleEnum.optional().describe(TERM_ROLE_DESCRIPTION),
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
  category: z.string().min(1),
  categories: z.array(z.string().min(1)).optional(),
  subcategories: z.record(z.string().min(1), SlugSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
  // Opt-in, small fixed vocabulary -- see puzzles/categories.js's
  // PUZZLE_LEVELS for why this isn't freeform like tags.
  level: z.enum(PUZZLE_LEVELS).optional(),
  large: z.boolean().optional(),
  info: InfoValueSchema.optional(),
  clusters: z.array(ClusterSchema).min(2).max(6),
  bridges: z.array(BridgeSchema).default([]),
  lenses: z.array(LensSchema).optional(),
  lensMode: z.enum(["sequential", "assignment", "quiz"]).optional(),
  preSolve: z.boolean().optional(),
  relatedPuzzles: RelatedPuzzlesSchema.optional(),
  learningIntroduction: LearningIntroductionSchema.optional(),
  generativeAssistance: z.array(GenerativeAssistanceEntrySchema).min(1).optional(),
  // Pass-through publication metadata -- not semantically validated by
  // contentValidation.js, just carried through unchanged. `layouts` (Star
  // layout curation) deliberately isn't offered here: it's a positional/
  // visual concern with its own dedicated schema (modules/starLayoutSchema.js),
  // not puzzle content, and not something a content author typically sets.
  creator: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
  derivedFrom: z.string().min(1).optional(),
  dateCreated: z.string().min(1).optional(),
  dateModified: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  version: z.union([z.string().min(1), z.number()]).optional()
}).strict();

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
    ...(bridge.termRole ? { termRole: bridge.termRole } : {}),
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

export function puzzleFromSimplified(input) {
  const clusterIds = deriveClusterIds(input.clusters);
  const clusterIndexById = new Map(clusterIds.map((id, index) => [id, index]));

  // Collect every explicitly-given color up front so an early cluster never
  // steals a color a later cluster asked for explicitly -- assigning
  // incrementally (looking only at colors seen so far) can produce an
  // avoidable duplicate-color error downstream. Mirrors the candidate
  // filtering already established in colorPalette.js's lensColorMap().
  const explicitColors = new Set(input.clusters.map(cluster => cluster.color).filter(Boolean));
  const availableColors = IDENTITY_COLOR_KEYS.filter(color => !explicitColors.has(color));
  let nextAutoColor = 0;

  const clusters = input.clusters.map((cluster, index) => {
    const defaultTerms = [...cluster.seeds, ...cluster.floatingTerms];
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
      seeds: [...cluster.seeds],
      ...(cluster.termInfo ? { termInfo: clone(cluster.termInfo) } : {}),
      ...(cluster.info ? { info: clone(cluster.info) } : {})
    };
  });

  const bridges = input.bridges.map(bridge => convertBridge(bridge, clusterIndexById));

  const learningIntroduction = input.learningIntroduction ? {
    requirement: input.learningIntroduction.requirement,
    ...(input.learningIntroduction.title ? { title: input.learningIntroduction.title } : {}),
    ...(input.learningIntroduction.summary ? { summary: input.learningIntroduction.summary } : {}),
    ...(input.learningIntroduction.estimatedMinutes !== undefined
      ? { estimatedMinutes: input.learningIntroduction.estimatedMinutes } : {}),
    content: {
      mediaType: LEARNING_MEDIA_TYPE,
      text: input.learningIntroduction.content.text
    },
    ...(input.learningIntroduction.sources ? { sources: clone(input.learningIntroduction.sources) } : {}),
    ...(input.learningIntroduction.citations ? { citations: clone(input.learningIntroduction.citations) } : {}),
    ...(input.learningIntroduction.revision !== undefined
      ? { revision: input.learningIntroduction.revision } : {})
  } : undefined;

  return {
    id: input.id,
    title: input.title,
    category: input.category,
    ...(input.categories ? { categories: [...input.categories] } : {}),
    ...(input.subcategories ? { subcategories: clone(input.subcategories) } : {}),
    ...(input.large !== undefined ? { large: input.large } : {}),
    ...(input.tags ? { tags: [...input.tags] } : {}),
    ...(input.level ? { level: input.level } : {}),
    ...(input.info ? { info: clone(input.info) } : {}),
    clusters,
    bridges,
    ...(input.lenses ? { lenses: clone(input.lenses) } : {}),
    ...(input.lensMode ? { lensMode: input.lensMode } : {}),
    ...(input.preSolve !== undefined ? { preSolve: input.preSolve } : {}),
    ...(input.relatedPuzzles ? { relatedPuzzles: clone(input.relatedPuzzles) } : {}),
    ...(learningIntroduction ? { learningIntroduction } : {}),
    ...(input.generativeAssistance ? { generativeAssistance: clone(input.generativeAssistance) } : {}),
    ...(input.creator ? { creator: input.creator } : {}),
    ...(input.license ? { license: input.license } : {}),
    ...(input.derivedFrom ? { derivedFrom: input.derivedFrom } : {}),
    ...(input.dateCreated ? { dateCreated: input.dateCreated } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.language ? { language: input.language } : {}),
    ...(input.version ? { version: input.version } : {})
  };
}

// Re-exported from modules/puzzleSimplified.js -- factored out to a
// zod-free module so repositoryPublicationService.js (shared with
// tools/content-jsonld.mjs's node_modules-free CLI, see that module's
// comment) can depend on the conversion directly. Every other caller keeps
// importing it from here.
export { puzzleToSimplified } from "./puzzleSimplified.js";

// Detects which format `input` is and returns canonical JSON-LD either way.
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
export function normalizeAuthoredPuzzleDocument(input) {
  if (isJsonLdShaped(input)) return { document: input, errors: [] };
  const parsed = SimplifiedPuzzleInputSchema.safeParse(input);
  if (!parsed.success) return { document: null, errors: formatZodIssues(parsed.error) };
  try {
    return { document: puzzleToJsonLd(puzzleFromSimplified(parsed.data)), errors: [] };
  } catch (error) {
    return { document: null, errors: [error.message] };
  }
}

// The hosted authoring/publication path's equivalent of
// normalizeAuthoredPuzzleDocument, but returning the runtime puzzle model
// directly instead of routing through JSON-LD -- simplified input is the
// only supported authoring shape there now (see docs/JSON-LD.md). JSON-LD
// input is still accepted and converted here, but only as a read
// compatibility path for drafts saved before that change; nothing writes
// JSON-LD as a result of calling this. Never throws; `puzzle: null` means
// invalid input, with formatted `errors` a caller can surface directly.
export function puzzleFromAuthoredDocument(input) {
  if (isJsonLdShaped(input)) {
    const profileErrors = validatePuzzleJsonLdProfile(input);
    if (profileErrors.length) return { puzzle: null, errors: profileErrors };
    try {
      return { puzzle: puzzleFromJsonLd(input), errors: [] };
    } catch (error) {
      return { puzzle: null, errors: [error.message] };
    }
  }
  const parsed = SimplifiedPuzzleInputSchema.safeParse(input);
  if (!parsed.success) return { puzzle: null, errors: formatZodIssues(parsed.error) };
  try {
    return { puzzle: puzzleFromSimplified(parsed.data), errors: [] };
  } catch (error) {
    return { puzzle: null, errors: [error.message] };
  }
}
