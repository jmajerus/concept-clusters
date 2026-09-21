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
// cluster/bridge @id to hand-sync with id. Repository-owned timestamps and
// revision metadata are intentionally absent; infrastructure and the explicit
// JSON-LD interchange adapter own those values.
// Legacy JSON-LD bridge termRole is accepted only during import and removed
// before simplified validation.
// Category references are stable ids; the authoring server accepts legacy
// display titles only while reading and canonicalizes them before storage.
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

// Slug helper matching typical slug patterns
const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const CategoryIdSchema = SlugSchema.describe(
  "Stable category id, not the category display title. Legacy titles are read-compatible and converted by the authoring server."
);
export const PuzzleKindSchema = z.enum([
  "topic-based",
  "trivia-quiz",
  "vocabulary-context"
]).describe(
  "Authored puzzle type, independent of category and lensMode. Omit for the default topic-based kind; explicitly use trivia-quiz for a trivia quiz or vocabulary-context for a near-synonym usage puzzle."
);

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
}).strict().describe(
  "Player-facing next-puzzle links only. Split-plan boardOrder is external metadata; do not add order or boardOrder here."
);

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
  category: CategoryIdSchema,
  puzzleKind: PuzzleKindSchema.optional(),
  categories: z.array(CategoryIdSchema).optional(),
  subcategories: z.record(CategoryIdSchema, SlugSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
  large: z.boolean().optional(),
  info: PuzzleInfoValueSchema.optional(),

  // A single-cluster Vocabulary puzzle uses a flat terms list and is
  // automatically pre-solved. Other puzzle kinds (and multi-cluster
  // Vocabulary) use seeds/floatingTerms because grouping is playable.
  clusters: z
    .array(
      z.object({
        id: SlugSchema.optional(), // Derived from name when omitted
        name: z.string().min(1),
        color: ClusterColorEnum.optional(), // Auto-assigned server-side if omitted
        fact: z.string().min(1), // Teaching note
        seeds: z.array(TermSchema).min(1).max(2).optional(),
        floatingTerms: z.array(TermSchema).min(1).max(5).optional(),
        // Complete term list for a one-cluster vocabulary puzzle; for other
        // cluster shapes this can also preserve an explicit display order.
        terms: z.array(TermSchema).min(2).max(7).optional(),
        termInfo: z.record(z.string().min(1), InfoValueSchema).optional(), // string or {text,links}
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
        if (cluster.seeds.length === 1 && cluster.floatingTerms.length !== 1) {
          context.addIssue({
            code: "custom",
            message: "a cluster with one seed must have exactly one floatingTerm"
          });
        }
      })
    )
    .min(1)
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
  provenance: z.object({
    collaboration: z.enum(["human", "humanPrimary", "aiPrimary", "ai"]).optional(),
    contributors: z.array(z.union([
      z.string().min(1),
      z.object({
        kind: z.enum(["human", "generative"]).optional(),
        name: z.string().min(1),
        provider: z.string().min(1).optional(),
        model: z.string().min(1).optional(),
        // Per-contributor client settings (see authoringProvenance.js).
        reasoning: z.enum(["light", "medium", "high", "extra", "extraHigh", "ultra", "noThinking"]).optional(),
        switch: z.enum(["fast", "thinking"]).optional()
      }).strict()
    ])).min(1),
    speed: z.enum(["fast", "normal", "max", "ultracode"]).optional(),
    reviewedBy: z.string().max(80).optional()
  }).strict().optional(),

  // Pass-through publication metadata -- not semantically validated, just
  // carried through unchanged. `layout` (renderer layout curation) isn't
  // offered here: it's positional/visual curation with dedicated renderer
  // schemas, not puzzle content.
  creator: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
  derivedFrom: z.string().min(1).optional(),
  language: z.string().min(1).optional()
}).strict().superRefine((input, context) => {
  // Matches modules/simplifiedPuzzleSchema.js: one cluster is permitted only
  // for vocabulary-context; ordinary topic/trivia puzzles need at least two.
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

export type SimplifiedPuzzleInput = z.infer<typeof SimplifiedPuzzleInputSchema>;
