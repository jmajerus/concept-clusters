import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  createContentInterchangeService,
  DEFAULT_REPOSITORY_ROOT
} from "./contentInterchangeService.js";
import { ContentValidationError, createRepositoryPublicationService } from "./repositoryPublicationService.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import { AUTHORING_DESIGN_GUIDANCE } from "./authoringDesignGuidance.js";

export const LOCAL_AUTHORING_GUIDANCE = `# Concept Clusters authoring workflow

Build \`document\` as the simplified format, not hand-written JSON-LD: no
\`@context\`/\`@id\`/\`@type\`/\`schemaVersion\`, and no cluster/bridge \`@id\`
to keep in sync with \`id\` by hand -- that dual-field pattern is exactly what
kept drifting out of sync in hand-authored JSON-LD, so this format never asks
for it. A minimal example:

\`\`\`json
{
  "id": "cognitive-load-theory",
  "title": "Cognitive Load Theory",
  "category": "Cognitive Science",
  "clusters": [
    {
      "id": "intrinsic-load",
      "name": "Intrinsic Load",
      "fact": "Intrinsic load stems from the inherent complexity of the material itself.",
      "seeds": ["element interactivity", "information complexity"],
      "floatingTerms": ["domain knowledge", "prior schemas"]
    },
    {
      "id": "extraneous-load",
      "name": "Extraneous Load",
      "fact": "Extraneous load is created by poor instructional design or unnecessary distractions.",
      "seeds": ["redundancy effect", "split-attention effect"],
      "floatingTerms": ["seductive details", "format distraction"]
    }
  ],
  "bridges": [
    {
      "term": "germane load",
      "clusters": ["intrinsic-load", "extraneous-load"],
      "fact": "Freeing working memory capacity lets mental effort shift toward schema construction."
    }
  ]
}
\`\`\`

A cluster's \`seeds\` (exactly two) plus \`floatingTerms\` (one to four) become
its full term list, two to six clusters per puzzle. A bridge's \`clusters\`
names exactly two cluster \`id\`s (three for a ternary bridge) -- not
positions, not fragments. Cluster \`id\`, bridge \`id\`, and cluster \`color\`
are all optional and assigned automatically when omitted (cluster \`id\`
derives from \`name\` -- a bridge referencing an id-less cluster should
predict that plain slug). Each cluster's color must be unique within the
puzzle, one of teal, blue, amber, magenta, olive, brown, or cyan -- purple
is reserved for bridges and green/red for lens feedback, so none of those
three are valid cluster colors. Total nodes (all cluster terms plus
bridges) are capped at 16, or 24 with \`large: true\`; only set \`large\` once
validation actually flags the puzzle as over the smaller cap. It only
affects rendering, never difficulty -- don't use it as a difficulty signal.

"Simplified" means no @context/@id/@type/schemaVersion and no cluster/bridge
@id to hand-sync with id -- not a cut-down feature set. Bridge \`direction\`/
\`idealTerms\`/\`conceptId\`/\`relationKind\`, ternary bridges, all three lens
modes, \`relatedPuzzles\`, and \`learningIntroduction\` are all directly
authorable here; see docs/SIMPLIFIED-PUZZLE-FORMAT.md for the full field
reference. Star layout curation (\`layouts\`) is the one thing that stays
JSON-LD-only, since it's positional curation, not puzzle content. A document
that already has \`@context\` is treated as JSON-LD and validated as such --
no separate flag needed to opt in.

${AUTHORING_DESIGN_GUIDANCE}

## Workflow mechanics

Discover existing subjects with list_categories before choosing category names.
Drafts may be temporarily invalid. Save with replace_puzzle_draft, then
validate and address every error. When you draft or materially regenerate
content with generative AI, set puzzle.generativeAssistance (one entry per
system+scope; update in place on later edits to the same scope) before
saving -- see get_authoring_guidance. Preview returns the exact affected paths
and an approval token; install_puzzle requires that unchanged draft
revision, the token, and confirm: true -- unlike the hosted server, this one
writes straight to your local working tree, so this really is the one
explicit go-ahead before anything on disk changes. After install, structural
checks are \`npm run validate\` (and JSON-LD content:check for packaged
sources). The full Playwright suite (\`npm test\`) is optional local
diagnosis when play or taxonomy issues appear -- not required for every
puzzle add. A dedicated MCP diagnostic tool for on-demand checks may be
added later.`;

const documentSchema = z.record(z.string(), z.unknown());
const draftIdSchema = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Use a lowercase URL-safe draft id"
);

const READ_ONLY = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
});

const LOCAL_WRITE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false
});

const DESTRUCTIVE_LOCAL_WRITE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false
});

function success(summary, output) {
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: JSON.stringify(output, null, 2) }
    ],
    structuredContent: output
  };
}

function failure(error) {
  const output = {
    error: error.message,
    ...(error instanceof ContentValidationError
      ? { validationErrors: error.errors }
      : {})
  };
  return {
    content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    isError: true
  };
}

function safe(handler) {
  return async args => {
    try {
      return await handler(args);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  };
}

const documentSourceSchema = z.object({
  draft_id: draftIdSchema.optional(),
  document: documentSchema.optional()
}).refine(value => !!value.draft_id !== !!value.document, {
  message: "Provide exactly one of draft_id or document"
});

export function createConceptClustersMcpServer({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  draftDirectory = process.env.CONCEPT_CLUSTERS_DRAFT_DIR ||
    join(repositoryRoot, ".concept-clusters", "drafts"),
  contentService = createContentInterchangeService({ repositoryRoot }),
  publicationService = null,
  draftStore = createPuzzleDraftStore({ directory: draftDirectory })
} = {}) {
  const publisher = publicationService ||
    createRepositoryPublicationService({ contentService });
  const server = new McpServer(
    { name: "concept-clusters-authoring", version: "1.0.0" },
    {
      instructions:
        "Call get_authoring_guidance before drafting a new puzzle -- it carries design " +
        "judgment (what makes a puzzle good, not just schema-valid) that nothing else here provides. " +
        "Use drafts for iterative authoring. Validate before previewing. " +
        "Preview returns the exact affected paths and approval token. " +
        "Call install_puzzle only after the user explicitly approves that preview; " +
        "the tool requires the unchanged draft revision, token, and confirm=true."
    }
  );

  async function sourceDocument({ draft_id, document }) {
    return draft_id
      ? (await draftStore.getDraft(draft_id)).document
      : document;
  }

  // publisher.planPuzzleImport() deliberately has no dependency on the
  // simplified-schema converter (see repositoryPublicationService.js's
  // comment) so it stays usable by tools/content-jsonld.mjs's isolated,
  // node_modules-free CLI test copy. Callers that can receive simplified
  // input -- preview_import, install_puzzle -- normalize here instead,
  // right before handing a document to the publisher.
  async function normalizeDocumentForPublication(document) {
    const normalized = await contentService.normalizeAuthoredDocument(document);
    if (!normalized.document) {
      throw new ContentValidationError(
        "Puzzle document is not valid simplified or JSON-LD content",
        normalized.errors
      );
    }
    return normalized.document;
  }

  server.registerTool("list_puzzles", {
    title: "List puzzles",
    description:
      "List installed puzzles, optionally filtered by exact category or catalogue id.",
    inputSchema: z.object({
      category: z.string().min(1).optional(),
      catalogue_id: z.string().min(1).optional()
    }),
    annotations: READ_ONLY
  }, safe(async ({ category, catalogue_id }) => {
    const puzzles = contentService.listPuzzles({
      category: category || null,
      catalogueId: catalogue_id || null
    });
    return success(`Found ${puzzles.length} installed puzzles.`, { puzzles });
  }));

  server.registerTool("list_catalogues", {
    title: "List catalogues",
    description: "List curated catalogue ids available for export or installation.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, safe(async () => {
    const catalogues = contentService.listCatalogues();
    return success(`Found ${catalogues.length} curated catalogues.`, { catalogues });
  }));

  server.registerTool("list_categories", {
    title: "List categories",
    description: "List subject categories with slugs, metadata-registration state, subcategories, and puzzle counts.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, safe(async () => {
    const categories = contentService.listCategories();
    return success(`Found ${categories.length} categories.`, { categories });
  }));

  server.registerTool("get_category", {
    title: "Get category",
    description: "Return one category's navigation metadata, subcategories, and puzzle counts.",
    inputSchema: z.object({ name: z.string().min(1) }),
    annotations: READ_ONLY
  }, safe(async ({ name }) => success(`Loaded category ${name}.`, {
    category: contentService.getCategory(name)
  })));

  server.registerTool("get_authoring_guidance", {
    title: "Get authoring guidance",
    description: "Return concise Concept Clusters puzzle-authoring considerations, including the design judgment that separates a schema-valid puzzle from a good one.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, safe(async () => success("Loaded authoring guidance.", {
    markdown: LOCAL_AUTHORING_GUIDANCE
  })));

  server.registerTool("get_puzzle_jsonld", {
    title: "Get puzzle JSON-LD",
    description:
      "Return the complete portable JSON-LD document for an installed puzzle.",
    inputSchema: z.object({ puzzle_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, safe(async ({ puzzle_id }) => {
    const document = await contentService.getPuzzleJsonLd(puzzle_id);
    return success(`Loaded JSON-LD for ${puzzle_id}.`, {
      puzzleId: puzzle_id,
      document
    });
  }));

  server.registerTool("list_puzzle_drafts", {
    title: "List puzzle drafts",
    description: "List durable local draft metadata without returning full documents.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, safe(async () => {
    const drafts = await draftStore.listDrafts();
    return success(`Found ${drafts.length} local drafts.`, { drafts });
  }));

  server.registerTool("get_puzzle_draft", {
    title: "Get puzzle draft",
    description: "Return one durable local draft and its current revision.",
    inputSchema: z.object({ draft_id: draftIdSchema }),
    annotations: READ_ONLY
  }, safe(async ({ draft_id }) => {
    const draft = await draftStore.getDraft(draft_id);
    return success(`Loaded draft ${draft_id} revision ${draft.revision}.`, { draft });
  }));

  server.registerTool("create_puzzle_draft", {
    title: "Create puzzle draft",
    description:
      "Create a durable draft from a complete JSON-LD object or a minimal puzzle skeleton. Drafts may be incomplete until validated. If the document includes AI-drafted content, include generativeAssistance on the puzzle (system, scope, optional provider/role/date) before relying on validation/preview.",
    inputSchema: z.object({
      draft_id: draftIdSchema.optional(),
      document: documentSchema.optional(),
      puzzle_id: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      category: z.string().min(1).optional()
    }).superRefine((value, ctx) => {
      if (value.document) return;
      for (const key of ["puzzle_id", "title", "category"]) {
        if (!value[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `${key} is required when document is omitted`
          });
        }
      }
    }),
    annotations: LOCAL_WRITE
  }, safe(async ({ draft_id, document, puzzle_id, title, category }) => {
    // A freshly-built skeleton (no document) is always the simplified shape
    // and always temporarily invalid (empty clusters/bridges) -- no point
    // normalizing it, it stores unchanged either way.
    const normalization = document ? await contentService.normalizeAuthoredDocument(document) : null;
    const content = normalization?.document ?? document ??
      contentService.createPuzzleSkeleton({ id: puzzle_id, title, category });
    const id = draft_id || content.id;
    const draft = await draftStore.createDraft({ draftId: id, document: content });
    return success(`Created draft ${id} at revision 1.`, {
      draft,
      ...(normalization && !normalization.document
        ? { normalization: { applied: false, errors: normalization.errors } }
        : {})
    });
  }));

  server.registerTool("replace_puzzle_draft", {
    title: "Replace puzzle draft",
    description:
      "Replace a draft document using optimistic revision matching. Invalid intermediate documents are allowed and can be checked separately. Keep generativeAssistance current when AI drafts or regenerates a scope (one entry per system+scope; update in place, do not append a row per minor edit).",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      expected_revision: z.number().int().positive(),
      document: documentSchema
    }),
    annotations: DESTRUCTIVE_LOCAL_WRITE
  }, safe(async ({ draft_id, expected_revision, document }) => {
    const normalization = await contentService.normalizeAuthoredDocument(document);
    const draft = await draftStore.replaceDraft({
      draftId: draft_id,
      expectedRevision: expected_revision,
      document: normalization.document ?? document
    });
    return success(
      `Replaced draft ${draft_id}; current revision is ${draft.revision}.`,
      {
        draft,
        ...(!normalization.document
          ? { normalization: { applied: false, errors: normalization.errors } }
          : {})
      }
    );
  }));

  server.registerTool("validate_puzzle_draft", {
    title: "Validate puzzle draft",
    description:
      "Validate a stored draft or supplied JSON-LD document against the profile, puzzle semantics, learning content, related ids, and local category taxonomy.",
    inputSchema: documentSourceSchema,
    annotations: READ_ONLY
  }, safe(async args => {
    const document = await sourceDocument(args);
    const validation = await contentService.validateJsonLdDocument(document);
    return success(
      validation.valid
        ? "The puzzle document is valid."
        : `The puzzle document has ${validation.errors.length} validation errors.`,
      validation
    );
  }));

  server.registerTool("export_puzzle_jsonld", {
    title: "Export puzzle JSON-LD",
    description:
      "Return formatted portable JSON-LD for either an installed puzzle or a durable draft without writing a file.",
    inputSchema: z.object({
      puzzle_id: z.string().min(1).optional(),
      draft_id: draftIdSchema.optional()
    }).refine(value => !!value.puzzle_id !== !!value.draft_id, {
      message: "Provide exactly one of puzzle_id or draft_id"
    }),
    annotations: READ_ONLY
  }, safe(async ({ puzzle_id, draft_id }) => {
    const document = draft_id
      ? (await draftStore.getDraft(draft_id)).document
      : await contentService.getPuzzleJsonLd(puzzle_id);
    const id = document.id || draft_id || puzzle_id;
    const output = {
      filename: `${id}.ccpuzzle.jsonld`,
      mediaType: "application/ld+json",
      text: `${JSON.stringify(document, null, 2)}\n`
    };
    return success(`Prepared ${output.filename}.`, output);
  }));

  const previewInput = documentSourceSchema.extend({
    replace: z.boolean().default(false),
    catalogue_id: z.string().min(1).optional(),
    reason: z.string().min(1).optional()
  });

  server.registerTool("preview_import", {
    title: "Preview puzzle installation",
    description:
      "Validate a draft or document and return the exact repository paths plus an approval token. Makes no repository changes.",
    inputSchema: previewInput,
    annotations: READ_ONLY
  }, safe(async args => {
    // sourceDocument() can return a stored draft (already write-time-
    // normalized by create/replace) or a fresh, bring-your-own args.document
    // (never normalized) -- normalize here either way. planPuzzleImport()
    // itself deliberately has no dependency on this, so it stays usable by
    // tools/content-jsonld.mjs's node_modules-free isolated test copy.
    const document = await normalizeDocumentForPublication(await sourceDocument(args));
    const plan = await publisher.planPuzzleImport(document, {
      replace: args.replace,
      catalogueId: args.catalogue_id || null,
      reason: args.reason || null
    });
    const output = {
      puzzleId: plan.puzzle.id,
      action: plan.action,
      affectedPaths: plan.affectedPaths,
      approvalToken: plan.approvalToken
    };
    return success(
      `Previewed ${plan.action} for ${plan.puzzle.id}; no files were changed.`,
      output
    );
  }));

  server.registerTool("install_puzzle", {
    title: "Install approved puzzle",
    description:
      "Install one validated durable draft transactionally. Requires the exact unchanged preview token, draft revision, and confirm=true after explicit user approval.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      expected_revision: z.number().int().positive(),
      preview_token: z.string().startsWith("sha256:"),
      replace: z.boolean().default(false),
      catalogue_id: z.string().min(1).optional(),
      reason: z.string().min(1).optional(),
      confirm: z.literal(true)
    }),
    annotations: DESTRUCTIVE_LOCAL_WRITE
  }, safe(async args => {
    const draft = await draftStore.getDraft(args.draft_id);
    if (draft.revision !== args.expected_revision) {
      throw new Error(
        `Draft revision conflict: expected ${args.expected_revision}, current revision is ${draft.revision}`
      );
    }
    // Normally already JSON-LD (write-time-normalized at create/replace) --
    // this only does real work in the edge case of a draft still holding
    // simplified input that never successfully converted.
    const document = await normalizeDocumentForPublication(draft.document);
    const plan = await publisher.planPuzzleImport(document, {
      replace: args.replace,
      catalogueId: args.catalogue_id || null,
      reason: args.reason || null
    });
    const result = await publisher.applyPuzzleImport(plan, {
      approvalToken: args.preview_token
    });
    return success(`Installed puzzle ${result.puzzleId} transactionally.`, result);
  }));

  server.registerTool("export_catalogue_bundle", {
    title: "Export catalogue JSON-LD",
    description:
      "Return a portable catalogue bundle, or a compact manifest when manifest=true, without writing a file.",
    inputSchema: z.object({
      catalogue_id: z.string().min(1),
      manifest: z.boolean().default(false)
    }),
    annotations: READ_ONLY
  }, safe(async ({ catalogue_id, manifest }) => {
    const document = await contentService.exportCatalogueJsonLd(
      catalogue_id,
      { manifest }
    );
    const suffix = manifest ? "cccatalogue.jsonld" : "ccbundle.jsonld";
    const output = {
      filename: `${catalogue_id}.${suffix}`,
      mediaType: "application/ld+json",
      document
    };
    return success(`Prepared ${output.filename}.`, output);
  }));

  return server;
}

export default createConceptClustersMcpServer;
