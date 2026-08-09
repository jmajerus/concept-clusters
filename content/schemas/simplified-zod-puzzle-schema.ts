// Reference copy of the schema actually enforced by
// modules/simplifiedPuzzleSchema.js (plain JS, so the hosted Worker and the
// local stdio server -- which runs under plain `node`, unable to import
// .ts directly -- can both use it). This file documents the same shape for
// TypeScript-aware readers/tooling and is kept in sync BY HAND -- it is not
// imported by any runtime code, the same way content/schemas/puzzle-v1.schema.json
// (the JSON-LD counterpart) already isn't. See docs/SIMPLIFIED-PUZZLE-FORMAT.md
// for the authoring-facing version of this reference.
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

// Slug helper matching typical slug patterns
const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// Matches validateInfo() in modules/contentValidation.js: any info-shaped
// field accepts either a plain string or this object.
const InfoObjectSchema = z.object({
  text: z.string().min(1).optional(),
  link: z.string().min(1).optional(),
  extraLink: z.string().min(1).optional(),
  citations: z.array(z.object({
    title: z.string().min(1),
    author: z.string().min(1).optional(),
    publisher: z.string().min(1).optional(),
    year: z.string().min(1).optional(),
    pages: z.string().min(1).optional(),
    url: z.string().min(1).optional()
  }).strict()).min(1).optional()
}).strict();
const InfoValueSchema = z.union([z.string().min(1), InfoObjectSchema]);

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

// Sequential-mode lenses only for v1: every lens requires `explanation`
// regardless of mode (modules/lensValidation.js), but assignment mode's
// per-target `reasons` and quiz mode's `options[]` are meaningfully more
// complex shapes of their own. A puzzle needing those authors via JSON-LD.
const LensSchema = z.object({
  id: SlugSchema,
  prompt: z.string().min(1),
  explanation: z.string().min(1),
  targets: z.array(z.string().min(1)).min(1)
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

  // Clusters definition
  clusters: z
    .array(
      z.object({
        id: SlugSchema,
        name: z.string().min(1),
        color: ClusterColorEnum.optional(), // Auto-assigned server-side if omitted
        fact: z.string().min(1), // Teaching note
        seeds: z.tuple([z.string().min(1), z.string().min(1)]), // Exactly 2 seed terms
        floatingTerms: z.array(z.string().min(1)).min(1).max(4), // Floating terms (3-6 total with seeds)
        termInfo: z.record(z.string().min(1), InfoValueSchema).optional(), // string or {text,link,extraLink,citations}
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
        term: z.string().min(1),
        // Exactly 2 connected cluster IDs from this document (not fragments,
        // not positions). Ternary bridges, direction, idealTerms, conceptId,
        // and relationKind are real runtime features but out of scope here
        // -- author via JSON-LD for those.
        clusters: z.array(SlugSchema).length(2),
        fact: z.string().min(1), // Bridge explanation / fact
        info: InfoValueSchema.optional()
      }).strict()
    )
    .default([]),

  // Optional cross-cutting Lenses (sequential mode only, see LensSchema)
  lenses: z.array(LensSchema).optional(),

  generativeAssistance: z.array(GenerativeAssistanceEntrySchema).min(1).optional()
}).strict();

export type SimplifiedPuzzleInput = z.infer<typeof SimplifiedPuzzleInputSchema>;
