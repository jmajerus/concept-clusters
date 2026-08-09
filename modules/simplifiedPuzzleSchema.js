// A flatter, LLM-friendly authoring input for puzzle drafts, offered as an
// alternative to hand-written JSON-LD (modules/jsonLdProfile.js). Authors
// never write @context/@id/@type/schemaVersion, and never keep a cluster or
// bridge's own id/@id pair in sync by hand -- @id is always mechanically
// "#" + id (see nodeFragmentId's comment in jsonLdProfile.js), so this
// format simply never asks for it. JSON-LD stays fully supported as the
// portable interchange format and as the escape hatch for the advanced
// features this schema deliberately omits (see the comments on LensSchema
// and BridgeSchema below).
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
import { puzzleToJsonLd } from "./puzzleJsonLd.js";

const SlugSchema = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "must be a lowercase slug (letters, digits, single hyphens)"
);

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
  citations: z.array(CitationSchema).min(1).optional()
}).strict();
const InfoValueSchema = z.union([z.string().min(1), InfoObjectSchema]);

const ClusterColorEnum = z.enum(IDENTITY_COLOR_KEYS);

// Sequential-mode lenses only for v1: a lens always requires `explanation`
// regardless of mode (modules/lensValidation.js), but assignment mode's
// per-target `reasons` and quiz mode's `options[]` are meaningfully more
// complex shapes of their own. `lensMode`/`preSolve` are omitted here along
// with them -- a puzzle needing assignment or quiz lenses still authors via
// JSON-LD.
const LensSchema = z.object({
  id: SlugSchema,
  prompt: z.string().min(1),
  explanation: z.string().min(1),
  targets: z.array(z.string().min(1)).min(1)
}).strict();

// Matches modules/generativeAssistance.js's validateGenerativeAssistance().
// Both authoring-guidance blocks instruct the author to set this before
// saving, so it has to be representable here -- a .strict() schema that
// omitted it would reject every AI-authored draft that follows the tool's
// own instructions.
const GenerativeAssistanceEntrySchema = z.object({
  system: z.string().min(1),
  scope: z.enum([...GENERATIVE_ASSISTANCE_SCOPES]),
  role: z.enum([...GENERATIVE_ASSISTANCE_ROLES]).optional(),
  provider: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD").optional()
}).strict();

const ClusterSchema = z.object({
  id: SlugSchema,
  name: z.string().min(1),
  color: ClusterColorEnum.optional(), // Auto-assigned server-side if omitted.
  fact: z.string().min(1),
  seeds: z.tuple([z.string().min(1), z.string().min(1)]),
  floatingTerms: z.array(z.string().min(1)).min(1).max(4),
  termInfo: z.record(z.string().min(1), InfoValueSchema).optional(),
  info: InfoValueSchema.optional()
}).strict().refine(
  cluster => new Set([...cluster.seeds, ...cluster.floatingTerms]).size ===
    cluster.seeds.length + cluster.floatingTerms.length,
  { message: "seeds and floatingTerms must not repeat a term" }
);

// clusters here are the OTHER clusters' string ids, resolved to positional
// indices by puzzleFromSimplified() below -- runtime bridges reference
// clusters by index, not id, but authors should never have to think in
// positions. Ternary (3-cluster) bridges, direction, idealTerms, conceptId,
// and relationKind are real runtime features (see modules/contentValidation.js)
// but are out of v1 scope here; author via JSON-LD for those.
const BridgeSchema = z.object({
  id: SlugSchema.optional(), // Derived from term when omitted -- see puzzleFromSimplified.
  term: z.string().min(1),
  clusters: z.array(SlugSchema).length(2),
  fact: z.string().min(1),
  info: InfoValueSchema.optional()
}).strict();

export const SimplifiedPuzzleInputSchema = z.object({
  id: SlugSchema,
  title: z.string().min(1),
  category: z.string().min(1),
  categories: z.array(z.string().min(1)).optional(),
  subcategories: z.record(z.string().min(1), SlugSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
  large: z.boolean().optional(),
  info: InfoValueSchema.optional(),
  clusters: z.array(ClusterSchema).min(2).max(6),
  bridges: z.array(BridgeSchema).default([]),
  lenses: z.array(LensSchema).optional(),
  generativeAssistance: z.array(GenerativeAssistanceEntrySchema).min(1).optional()
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

// Pure converter from zod-validated simplified input to the same runtime
// puzzle shape every puzzles/*.js module already exports. Assumes `input`
// already passed SimplifiedPuzzleInputSchema.parse() -- does not re-validate.
export function puzzleFromSimplified(input) {
  const clusterIndexById = new Map(input.clusters.map((cluster, index) => [cluster.id, index]));

  // Collect every explicitly-given color up front so an early cluster never
  // steals a color a later cluster asked for explicitly -- assigning
  // incrementally (looking only at colors seen so far) can produce an
  // avoidable duplicate-color error downstream. Mirrors the candidate
  // filtering already established in colorPalette.js's lensColorMap().
  const explicitColors = new Set(input.clusters.map(cluster => cluster.color).filter(Boolean));
  const availableColors = IDENTITY_COLOR_KEYS.filter(color => !explicitColors.has(color));
  let nextAutoColor = 0;

  const clusters = input.clusters.map(cluster => ({
    id: cluster.id,
    name: cluster.name,
    color: cluster.color || availableColors[nextAutoColor++ % availableColors.length],
    fact: cluster.fact,
    terms: [...cluster.seeds, ...cluster.floatingTerms],
    seeds: [...cluster.seeds],
    ...(cluster.termInfo ? { termInfo: clone(cluster.termInfo) } : {}),
    ...(cluster.info ? { info: clone(cluster.info) } : {})
  }));

  const bridges = input.bridges.map(bridge => {
    const indices = bridge.clusters.map(reference => {
      const index = clusterIndexById.get(reference);
      if (index === undefined) {
        throw new Error(`bridges: cluster reference "${reference}" does not match any cluster id`);
      }
      return index;
    });
    return {
      // Omitted entirely when the author didn't supply one -- puzzleToJsonLd()'s
      // existing stableLocalIds() derives and de-duplicates a missing bridge id
      // from `term` on export, identically to every bridge-id-less puzzle
      // already in the repository. Don't reimplement that here.
      ...(bridge.id ? { id: bridge.id } : {}),
      term: bridge.term,
      clusters: indices,
      fact: bridge.fact,
      ...(bridge.info ? { info: clone(bridge.info) } : {})
    };
  });

  return {
    id: input.id,
    title: input.title,
    category: input.category,
    ...(input.categories ? { categories: [...input.categories] } : {}),
    ...(input.subcategories ? { subcategories: clone(input.subcategories) } : {}),
    ...(input.large !== undefined ? { large: input.large } : {}),
    ...(input.tags ? { tags: [...input.tags] } : {}),
    ...(input.info ? { info: clone(input.info) } : {}),
    clusters,
    bridges,
    ...(input.lenses ? { lenses: clone(input.lenses) } : {}),
    ...(input.generativeAssistance ? { generativeAssistance: clone(input.generativeAssistance) } : {})
  };
}

// Detects which format `input` is and returns canonical JSON-LD either way.
// Never throws. `document: null` means input was neither valid JSON-LD
// (that's not checked here -- see the profile validator) nor valid
// simplified input; `errors` then holds formatted, actionable messages a
// caller can surface directly rather than falling through to confusing
// JSON-LD-profile errors ("@context must be...") for an author who never
// wrote JSON-LD. This is a pure shape/cardinality gate -- it deliberately
// does not re-implement validatePuzzleContent/validatePuzzleLenses's
// semantic rules (duplicate terms, node-count cap, lens target existence,
// etc.); those already run, unchanged, on whatever JSON-LD document comes
// out of here, regardless of which format the author used.
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
