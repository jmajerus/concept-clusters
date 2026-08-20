import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  createContentInterchangeService,
  DEFAULT_REPOSITORY_ROOT
} from "./contentInterchangeService.js";
import { ContentValidationError, createRepositoryPublicationService } from "./repositoryPublicationService.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import {
  AUTHORING_DESIGN_GUIDANCE,
  authoringGuidanceResult
} from "./authoringDesignGuidance.js";
import {
  AUTHORING_PHASES,
  AUTHORING_MCP_SERVER_VERSION,
  SIMPLIFIED_PUZZLE_SCHEMA_MIME_TYPE,
  SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
  SIMPLIFIED_PUZZLE_SCHEMA_TEXT,
  SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
  simplifiedPuzzleSchemaResult
} from "./authoringSchemaResource.js";

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
\`idealTerms\`/\`conceptId\`/\`termRole\`/\`relationKind\`, ternary bridges, all three lens
modes, \`relatedPuzzles\`, and \`learningIntroduction\` are all directly
authorable here; call \`get_authoring_schema\` for the complete machine-readable
field contract, and see docs/SIMPLIFIED-PUZZLE-FORMAT.md for the prose reference.
Star layout curation is authored separately from puzzle content, through a
dedicated repository maintainer workflow, not through this document. A
document that already has \`@context\` is treated as hand-written JSON-LD and
validated as such -- no separate flag needed to opt in, though the simplified
format above is what get_authoring_schema documents and what new puzzles
should be authored as.

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
checks are \`npm run validate\` (and \`npm run content:check\` for packaged
sources). The full Playwright suite (\`npm test\`) is optional local
diagnosis when play or taxonomy issues appear -- not required for every
puzzle add. A dedicated MCP diagnostic tool for on-demand checks may be
added later.`;

const documentSchema = z.record(z.string(), z.unknown());
const authoringPhaseSchema = z.object({
  phase: z.enum(AUTHORING_PHASES).default("complete")
});
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
    { name: "concept-clusters-authoring", version: AUTHORING_MCP_SERVER_VERSION },
    {
      instructions:
        "Use one accumulating simplified-puzzle draft. Start with get_authoring_guidance and " +
        "get_authoring_schema at phase=core, then use review, pedagogy, and publication as needed. " +
        "Retrieve the latest draft before every later pass, preserve earlier fields, and capture exact " +
        "links and citation details during the research that found them rather than rediscovering them. " +
        "A phase is a focused projection, not a replacement format; omit phase (or use complete) whenever " +
        "the whole contract or guidance is needed. Phases are reusable concern areas, not one-way gates; " +
        "revisit pedagogy later to add a learning introduction without replacing existing lenses. " +
        "Draft write inputs stay deliberately " +
        "permissive so incomplete drafts and full JSON-LD remain writable. " +
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

  server.registerResource(
    "simplified-puzzle-schema-v1",
    SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
    {
      title: "Simplified puzzle authoring schema v1",
      description:
        "Complete JSON Schema for simplified Concept Clusters puzzle documents, including bridge termRole and relationKind.",
      mimeType: SIMPLIFIED_PUZZLE_SCHEMA_MIME_TYPE
    },
    async uri => ({
      contents: [{
        uri: uri.href,
        mimeType: SIMPLIFIED_PUZZLE_SCHEMA_MIME_TYPE,
        text: SIMPLIFIED_PUZZLE_SCHEMA_TEXT
      }]
    })
  );

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
    description: "Return complete guidance when phase is omitted, or focused guidance for the core, review, pedagogy, or publication pass over one accumulating draft.",
    inputSchema: authoringPhaseSchema,
    annotations: READ_ONLY
  }, safe(async ({ phase }) => success(
    `Loaded ${phase} authoring guidance.`,
    authoringGuidanceResult(phase, LOCAL_AUTHORING_GUIDANCE)
  )));

  server.registerTool("get_authoring_schema", {
    title: "Get authoring schema",
    description:
      "Return the complete versioned JSON Schema when phase is omitted, or a focused field projection for the core, review, pedagogy, or publication pass. Phase projections preserve omitted fields and are not standalone replacement schemas.",
    inputSchema: authoringPhaseSchema,
    annotations: READ_ONLY
  }, safe(async ({ phase }) => success(
    `Loaded ${phase} simplified puzzle authoring schema v${SIMPLIFIED_PUZZLE_SCHEMA_VERSION}.`,
    simplifiedPuzzleSchemaResult(phase)
  )));

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
      "Create a durable draft from a supplied document or a minimal puzzle skeleton. Start simplified content with get_authoring_schema phase=core; retrieve and preserve that accumulating draft in later phases. This input is deliberately permissive because drafts may be incomplete and full JSON-LD is also accepted.",
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
      "Replace the accumulating draft document using optimistic revision matching. Retrieve the latest revision and preserve fields from earlier authoring phases; this input remains permissive so invalid intermediate documents and full JSON-LD can be saved. Keep generativeAssistance current when AI drafts or regenerates a scope.",
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

  return server;
}

export default createConceptClustersMcpServer;
