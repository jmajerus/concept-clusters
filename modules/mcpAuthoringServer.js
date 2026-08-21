import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { DOMAINS } from "../puzzles/categories.js";
import {
  createContentInterchangeService,
  DEFAULT_REPOSITORY_ROOT
} from "./contentInterchangeService.js";
import { ContentValidationError, createRepositoryPublicationService } from "./repositoryPublicationService.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import {
  LOCAL_AUTHORING_GUIDANCE,
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
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { documentForDraftStore } from "./authoredPuzzleDocument.js";
import { createLocalGitHubPublicationService } from "./localGitHubPublication.js";

export { LOCAL_AUTHORING_GUIDANCE };

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

const EXTERNAL_READ = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true
});

const CREATE_EXTERNAL = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true
});

const infoSchema = z.object({
  text: z.string().min(1),
  link: z.string().min(1).optional(),
  extraLink: z.string().min(1).optional()
}).strict();
const categoryRegistrationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: draftIdSchema.optional(),
  domain: z.enum(Object.keys(DOMAINS)).optional(),
  info: infoSchema,
  subcategories: z.record(draftIdSchema, z.object({
    title: z.string().min(1).max(100),
    info: infoSchema.optional()
  }).strict()).optional()
}).strict();
const catalogueFields = {
  catalogue_id: draftIdSchema
    .optional()
    .describe("Add the puzzle to this catalogue's entries."),
  reason: z.string().min(1).max(1000).optional()
    .describe("This catalogue entry's editorial-choice text -- why the puzzle belongs in catalogue_id, not a general submission note. Requires catalogue_id.")
};
function requireCatalogueForReason(value, ctx) {
  if (value.reason && !value.catalogue_id) ctx.addIssue({
    code: "custom",
    path: ["reason"],
    message: "reason requires catalogue_id: it's that catalogue entry's editorial-choice text, not a general submission note. Pass catalogue_id, or omit reason if this puzzle isn't joining a catalogue."
  });
}

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

function remnantPath(env, name) {
  const value = env?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function createConceptClustersMcpServer({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  draftDirectory = null,
  publicationDirectory = null,
  contentService = createContentInterchangeService({ repositoryRoot }),
  publicationService = null,
  githubPublicationService = null,
  draftStore = null,
  draftActor = null,
  d1Database = null,
  env = process.env
} = {}) {
  const remnantDraftDirectory = draftDirectory || remnantPath(env, "CONCEPT_CLUSTERS_DRAFT_DIR");
  const remnantPublicationDirectory = publicationDirectory
    || remnantPath(env, "CONCEPT_CLUSTERS_PUBLICATION_DIR");
  const remnantDraftStore = draftStore
    || (remnantDraftDirectory
      ? createPuzzleDraftStore({ directory: remnantDraftDirectory })
      : null);
  const publisher = publicationService ||
    createRepositoryPublicationService({ contentService });
  let workspacePromise;
  async function workspace() {
    if (!workspacePromise) {
      workspacePromise = resolveLocalAuthoringWorkspace({
        env,
        repositoryRoot,
        draftStore: remnantDraftStore,
        publicationDirectory: remnantPublicationDirectory,
        database: d1Database,
        actor: draftActor
      });
    }
    return workspacePromise;
  }
  async function drafts() {
    return (await workspace()).draftStore;
  }
  async function publicationActor() {
    return (await workspace()).actor;
  }
  let githubPublisher = githubPublicationService;
  async function githubService() {
    if (!githubPublisher) {
      const resolved = await workspace();
      githubPublisher = await createLocalGitHubPublicationService({
        contentService,
        repositoryRoot,
        env,
        actor: resolved.actor,
        draftRepository: resolved.draftRepository,
        publicationRepository: resolved.publicationRepository,
        draftKind: resolved.draftKind,
        draftStore: remnantDraftStore,
        publicationDirectory: remnantPublicationDirectory,
        database: d1Database
      });
    }
    return githubPublisher;
  }
  const server = new McpServer(
    { name: "concept-clusters-authoring", version: AUTHORING_MCP_SERVER_VERSION },
    {
      instructions:
        "Use one accumulating simplified-puzzle draft stored in the shared authoring D1 database. Start with get_authoring_guidance and " +
        "get_authoring_schema at phase=core, then use review, pedagogy, and publication as needed. " +
        "Retrieve the latest draft before every later pass, preserve earlier fields, and capture exact " +
        "links and citation details during the research that found them rather than rediscovering them. " +
        "A phase is a focused projection, not a replacement format; omit phase (or use complete) whenever " +
        "the whole contract or guidance is needed. Phases are reusable concern areas, not one-way gates; " +
        "revisit pedagogy later to add a learning introduction without replacing existing lenses. " +
        "Draft write inputs stay deliberately " +
        "permissive so incomplete drafts remain writable. " +
        "Use drafts for iterative authoring. Always validate before publishing. " +
        "stdio MCP and hosted MCP share puzzle_drafts and publication_requests under the configured Access owner. " +
        "submit_puzzle_for_publication creates a dedicated GitHub branch and pull request directly -- it never writes this checkout or main, and merging stays a separate human action in GitHub. If the draft already has an open pull request, calling it again after an edit appends to that same pull request instead of opening a new one. " +
        "Once validate_puzzle_draft passes, call submit_puzzle_for_publication directly -- do not pause to ask the human whether to review the draft first or whether to go ahead. Nothing is published by that call; the pull request it opens is the actual review surface. Asking first only adds a round trip with no matching safety benefit. Only pause before calling it for a genuine content judgment call the draft itself doesn't resolve. " +
        "preview_repository_import remains available if a client wants to see the GitHub-affected paths first, but it's optional, not a precondition. " +
        "install_puzzle is a different local-checkout path: preview_import returns an approval token, and install_puzzle requires that unchanged draft revision, token, and confirm=true after explicit user approval because it writes the working tree."
    }
  );

  async function sourceDocument({ draft_id, document }) {
    return draft_id
      ? (await (await drafts()).getDraft(draft_id)).document
      : document;
  }

  // publisher.planPuzzleFromModel() takes the runtime puzzle so this
  // server never converts drafts through JSON-LD. The interchange CLI
  // still calls planPuzzleImport() with a .ccpuzzle.jsonld file.
  function puzzleFromDraftDocument(document) {
    const { puzzle, errors } = puzzleFromAuthoredDocument(document);
    if (!puzzle) {
      throw new ContentValidationError(
        "Puzzle document is not valid simplified content",
        errors
      );
    }
    return puzzle;
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
    description: "List durable draft metadata for the configured D1 owner without returning full documents.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, safe(async () => {
    const listed = await (await drafts()).listDrafts();
    return success(`Found ${listed.length} drafts.`, { drafts: listed });
  }));

  server.registerTool("get_puzzle_draft", {
    title: "Get puzzle draft",
    description: "Return one durable draft and its current revision.",
    inputSchema: z.object({ draft_id: draftIdSchema }),
    annotations: READ_ONLY
  }, safe(async ({ draft_id }) => {
    const draft = await (await drafts()).getDraft(draft_id);
    return success(`Loaded draft ${draft_id} revision ${draft.revision}.`, { draft });
  }));

  server.registerTool("create_puzzle_draft", {
    title: "Create puzzle draft",
    description:
      "Create a durable draft from a supplied document or a minimal puzzle skeleton. Start simplified content with get_authoring_schema phase=core; retrieve and preserve that accumulating draft in later phases. This input is deliberately permissive because drafts may be incomplete.",
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
    const { document: content, normalization } = documentForDraftStore(
      document,
      () => contentService.createPuzzleSkeleton({ id: puzzle_id, title, category })
    );
    if (!content) {
      throw new ContentValidationError(
        "JSON-LD is not accepted for drafts",
        normalization.errors
      );
    }
    const id = draft_id || content.id;
    const draft = await (await drafts()).createDraft({ draftId: id, document: content });
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
      "Replace the accumulating draft document using optimistic revision matching. Retrieve the latest revision and preserve fields from earlier authoring phases. This input remains permissive so invalid intermediate documents can be saved. Keep generativeAssistance current when AI drafts or regenerates a scope.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      expected_revision: z.number().int().positive(),
      document: documentSchema
    }),
    annotations: DESTRUCTIVE_LOCAL_WRITE
  }, safe(async ({ draft_id, expected_revision, document }) => {
    const { document: content, normalization } = documentForDraftStore(document);
    if (!content) {
      throw new ContentValidationError(
        "JSON-LD is not accepted for drafts",
        normalization.errors
      );
    }
    const draft = await (await drafts()).replaceDraft({
      draftId: draft_id,
      expectedRevision: expected_revision,
      document: content
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
      "Validate a stored draft or supplied simplified document against the puzzle semantics, learning content, related ids, and local category taxonomy.",
    inputSchema: documentSourceSchema,
    annotations: READ_ONLY
  }, safe(async args => {
    const document = await sourceDocument(args);
    const validation = await contentService.validatePuzzleDraft(document);
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
    const puzzle = puzzleFromDraftDocument(await sourceDocument(args));
    const plan = await publisher.planPuzzleFromModel(puzzle, {
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
    const store = await drafts();
    const draft = await store.getDraft(args.draft_id);
    if (draft.revision !== args.expected_revision) {
      throw new Error(
        `Draft revision conflict: expected ${args.expected_revision}, current revision is ${draft.revision}`
      );
    }
    const puzzle = puzzleFromDraftDocument(draft.document);
    const plan = await publisher.planPuzzleFromModel(puzzle, {
      replace: args.replace,
      catalogueId: args.catalogue_id || null,
      reason: args.reason || null
    });
    const result = await publisher.applyPuzzleImport(plan, {
      approvalToken: args.preview_token
    });
    await store.markInstalled(args.draft_id);
    return success(`Installed puzzle ${result.puzzleId} transactionally.`, result);
  }));

  const githubPublishInput = z.object({
    draft_id: draftIdSchema,
    replace: z.boolean().default(false),
    ...catalogueFields,
    new_category: categoryRegistrationSchema.optional()
  }).superRefine(requireCatalogueForReason);

  server.registerTool("preview_repository_import", {
    title: "Preview GitHub pull request",
    description:
      "Optional: validate a draft's current document and show exact GitHub pull-request file effects against the current base commit, without writing anything. submit_puzzle_for_publication computes the same plan itself, so this isn't a required precondition -- it's for a client that wants to see affected paths before deciding to publish. Does not write this checkout.",
    inputSchema: githubPublishInput,
    annotations: EXTERNAL_READ
  }, safe(async ({
    draft_id,
    replace,
    catalogue_id,
    reason,
    new_category
  }) => {
    const result = await (await githubService()).preview({
      draftId: draft_id,
      replace,
      catalogueId: catalogue_id || null,
      reason: reason || null,
      newCategory: new_category || null,
      actor: await publicationActor()
    });
    return success(
      result.valid
        ? `Previewed ${result.preview.action} for ${result.preview.puzzleId}; nothing was published.`
        : `Cannot preview publication because the draft has ${result.errors.length} errors.`,
      {
        draftId: draft_id,
        valid: result.valid,
        errors: result.errors,
        preview: result.preview
      }
    );
  }));

  server.registerTool("submit_puzzle_for_publication", {
    title: "Submit puzzle for publication",
    description:
      "Validate the draft and create a dedicated GitHub branch and pull request from it. Never writes this checkout or the base branch, and merging the pull request stays a separate human action in GitHub -- calling this does not publish anything by itself. If this draft already has an open, unmerged pull request, resubmitting appends a generated commit to that same pull request instead of opening another one. Hosted and local puzzle PRs omit puzzles/index.js so concurrent submissions do not conflict.",
    inputSchema: githubPublishInput,
    annotations: CREATE_EXTERNAL
  }, safe(async args => {
    const publication = await (await githubService()).submit({
      draftId: args.draft_id,
      replace: args.replace,
      catalogueId: args.catalogue_id || null,
      reason: args.reason || null,
      newCategory: args.new_category || null,
      actor: await publicationActor()
    });
    const outcomeText = {
      opened: `Opened pull request #${publication.githubPrNumber} for ${args.draft_id}.`,
      amended: `Updated pull request #${publication.githubPrNumber} for ${args.draft_id} with a new commit.`,
      unchanged: `Pull request #${publication.githubPrNumber} for ${args.draft_id} already reflects this draft; nothing to push.`
    }[publication.submissionOutcome];
    return success(
      outcomeText ?? (publication.githubPrUrl
        ? `Opened pull request #${publication.githubPrNumber} for ${args.draft_id}.`
        : `Publication request ${publication.id} is ${publication.status}.`),
      { publication }
    );
  }));

  return server;
}

export default createConceptClustersMcpServer;
