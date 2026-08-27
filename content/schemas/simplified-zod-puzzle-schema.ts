// Reference copy of the schema actually enforced by
// modules/simplifiedPuzzleSchema.js (plain JS, so the hosted Worker and the
// local stdio server -- which runs under plain `node`, unable to import
// .ts directly -- can both use it). This file documents the same shape for
// TypeScript-aware readers/tooling and is kept in sync BY HAND -- it is not
// imported by any runtime code, the same way content/schemas/puzzle-v1.schema.json
// (the JSON-LD counterpart) already isn't. See docs/SIMPLIFIED-PUZZLE-FORMAT.md
// for the authoring-facing version of this reference.
//
// "Simplified" means no @context/@id/@type/schemaVersion and no
// cluster/bridge @id to hand-sync with id -- not a cut-down feature set.
// Every puzzle-content field JSON-LD can express, this schema can too.
import { z } from "zod";

// Valid cluster colors supported by puzzle-v1.schema.json
export const ClusterColorEnum = z.enum([
  "teal",
  "blue",
  "amber",
  "magenta",
  "olive",
  "brown",
  "cyan"
]);

// Matches VALID_RELATION_KINDS in modules/contentValidation.js.
export const RelationKindEnum = z.enum([
  "dynamic", "foundation", "cross-cutting", "contrast", "continuity", "evaluation"
]);

export const TermRoleEnum = z.enum(["reference", "connector"]);
export const TERM_ROLE_DESCRIPTION =
  "reference (default) when the bridge term itself is an intended object of learning within the puzzle's conceptual territory and central lesson; connector when it only carries a local relationship, evidence, mechanism, plot detail, or biographical thread, even if it is a concrete, unfamiliar, specific, or encyclopedia-worthy noun. Article existence, search quality, familiarity, and grammatical form are not classification tests. Classify the role first, then curate links separately: prefer a verified direct resource for references, retaining automatic search only when its result set is deliberately useful. A connector gets no automatic or authored reference links or citations; use concise info.text, often recommended, to clarify its local function.";

// Slug helper matching typical slug patterns
const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// A displayed term (cluster seed/floating term, bridge term) becomes a
// pill in Star mode sized by pillWidth (modules/puzzleGraph.js) -- width
// grows linearly with length, unbounded, so an unusually long string
// bloats its own pill, pushes neighbors via the force-sim collision
// radius, and can overflow the free-strip row it packs into. 40 is
// double the longest term already in real content (~20 chars, see
// BOARD_SIZE's comment in game.js) -- room for a legitimately long
// compound term while still catching paste/typo mistakes.
const TermSchema = z.string().min(1).max(40);

// Matches validateInfo() in modules/contentValidation.js: any info-shaped
// field accepts either a plain string or this object. Canonical write field
// is `links`. Leftover `link` / `extraLink` / `seeAlso` are a load-time fold.
const LinkEntrySchema = z.union([
  z.string().min(1),
  z.object({
    href: z.string().min(1),
    label: z.string().min(1).optional()
  }).strict()
]);
const CitationSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1).optional(),
  publisher: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
  pages: z.string().min(1).optional(),
  url: z.string().min(1).optional()
}).strict();
const infoObjectShape = {
  text: z.string().min(1).optional(),
  links: z.array(LinkEntrySchema).min(1).optional()
};
const NestedInfoObjectSchema = z.object(infoObjectShape).strict();
const PuzzleInfoObjectSchema = z.object({
  ...infoObjectShape,
  citations: z.array(CitationSchema).min(1).optional()
}).strict();
const InfoValueSchema = z.union([z.string().min(1), NestedInfoObjectSchema]);
const PuzzleInfoValueSchema = z.union([z.string().min(1), PuzzleInfoObjectSchema]);

// Matches VALID_BRIDGE_DIRECTIONS in modules/contentValidation.js. Whether
// `kind` is consistent with the bridge's own cluster count, and whether
// from/to are required/forbidden for a given kind, is left to the
// downstream semantic validator -- see modules/simplifiedPuzzleSchema.js's
// comment on the equivalent definition.
const DirectionSchema = z.object({
  kind: z.enum(["undirected", "through", "bidirectional", "outward", "inward"]),
  from: SlugSchema.optional(),
  to: SlugSchema.optional()
}).strict();

// Matches modules/generativeAssistance.js. Both authoring-guidance blocks
// instruct the author to set this before saving -- omitting it from a
// .strict() schema would reject every AI-authored draft that follows the
// tool's own instructions.
const GenerativeAssistanceEntrySchema = z.object({
  system: z.string().min(1),
  scope: z.enum(["learningIntroduction", "puzzle", "lenses"]),
  role: z.enum(["drafted", "edited"]).optional(),
  provider: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).strict();

// Every lens requires `explanation` regardless of mode
// (modules/lensValidation.js). `targets` is for sequential/assignment mode;
// `reasons` is assignment-mode-specific (per-target rationale); `options`
// is quiz-mode-specific. Which combination a given lens actually needs
// depends on the puzzle's `lensMode` -- left to the downstream validator.
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

const RelatedPuzzlesSchema = z.object({
  info: InfoValueSchema.optional(),
  entries: z.array(z.object({
    id: z.string().min(1),
    reason: z.string().min(1),
    via: z.array(z.string().min(1)).optional()
  }).strict()).min(1)
}).strict();

// Matches modules/learningIntroductionValidationCore.js. Only
// `content.text` is offered here (not `content.src`) -- hosted drafts must
// embed Markdown directly regardless, and a chatbot has no filesystem to
// point `src` at.
const LearningIntroductionSchema = z.object({
  requirement: z.enum(["optional", "recommended", "required"]),
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  estimatedMinutes: z.number().int().min(1).max(60).optional(),
  content: z.object({
    text: z.string().min(1)
  }).strict(),
  links: z.array(LinkEntrySchema).min(1).optional(),
  citations: z.array(CitationSchema).min(1).optional()
}).strict();

export const SimplifiedPuzzleInputSchema = z.object({
  id: SlugSchema,
  title: z.string().min(1),
  category: z.string().min(1),
  categories: z.array(z.string().min(1)).optional(),
  subcategories: z.record(z.string().min(1), SlugSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
  large: z.boolean().optional(),
  info: PuzzleInfoValueSchema.optional(),

  // Clusters definition
  clusters: z
    .array(
      z.object({
        id: SlugSchema.optional(), // Derived from name when omitted
        name: z.string().min(1),
        color: ClusterColorEnum.optional(), // Auto-assigned server-side if omitted
        fact: z.string().min(1), // Teaching note
        seeds: z.tuple([TermSchema, TermSchema]), // Exactly 2 seed terms
        floatingTerms: z.array(TermSchema).min(1).max(4), // Floating terms (3-6 total with seeds)
        termInfo: z.record(z.string().min(1), InfoValueSchema).optional(), // string or {text,links}
        info: InfoValueSchema.optional()
      }).strict().refine(
        cluster => new Set([...cluster.seeds, ...cluster.floatingTerms]).size ===
          cluster.seeds.length + cluster.floatingTerms.length,
        { message: "seeds and floatingTerms must not repeat a term" }
      )
    )
    .min(2)
    .max(6), // Runtime cap -- modules/contentValidation.js

  // Bridges definition -- no minimum; bridges are optional and need not
  // make the cluster graph connected.
  bridges: z
    .array(
      z.object({
        id: SlugSchema.optional(), // Derived from term when omitted
        term: TermSchema,
        // 2 connected cluster IDs, or 3 for a ternary bridge -- not
        // fragments, not positions.
        clusters: z.array(SlugSchema).min(2).max(3),
        fact: z.string().min(1), // Bridge explanation / fact
        info: InfoValueSchema.optional(),
        conceptId: z.string().min(1).optional(),
        termRole: TermRoleEnum.optional().describe(TERM_ROLE_DESCRIPTION),
        relationKind: RelationKindEnum.optional(),
        direction: DirectionSchema.optional(),
        // {clusterId: idealTerm} -- only list the clusters worth
        // specifying; keys must be among this bridge's own `clusters`.
        idealTerms: z.record(z.string().min(1), z.string().min(1)).optional()
      }).strict()
    )
    .default([]),

  // Cross-cutting lenses -- all three modes (sequential/assignment/quiz)
  lenses: z.array(LensSchema).optional(),
  lensMode: z.enum(["sequential", "assignment", "quiz"]).optional(),
  preSolve: z.boolean().optional(),

  relatedPuzzles: RelatedPuzzlesSchema.optional(),
  learningIntroduction: LearningIntroductionSchema.optional(),
  generativeAssistance: z.array(GenerativeAssistanceEntrySchema).min(1).optional(),
  provenance: z.object({
    collaboration: z.enum(["human", "humanPrimary", "aiPrimary", "ai"]).optional(),
    contributors: z.array(z.union([
      z.string().min(1),
      z.object({
        kind: z.enum(["human", "generative"]).optional(),
        name: z.string().min(1),
        provider: z.string().min(1).optional(),
        model: z.string().min(1).optional()
      }).strict()
    ])).min(1)
  }).strict().optional(),

  // Pass-through publication metadata -- not semantically validated, just
  // carried through unchanged. `layouts` (Star layout curation) isn't
  // offered here: it's positional/visual curation with its own dedicated
  // schema (modules/starLayoutSchema.js), not puzzle content.
  creator: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
  derivedFrom: z.string().min(1).optional(),
  dateCreated: z.string().min(1).optional(),
  dateModified: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  version: z.string().min(1).optional()
}).strict();

export type SimplifiedPuzzleInput = z.infer<typeof SimplifiedPuzzleInputSchema>;
