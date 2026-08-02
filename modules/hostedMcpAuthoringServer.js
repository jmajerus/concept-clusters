import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { DraftConflictError } from "./draftRepository.js";

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

const CREATE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false
});

const WRITE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false
});

function success(summary, output) {
  return {
    content: [{ type: "text", text: summary }],
    structuredContent: output
  };
}

function failure(error) {
  const output = {
    error: error.message,
    ...(error instanceof DraftConflictError
      ? { currentRevision: error.currentRevision }
      : {})
  };
  return {
    content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
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

export function createHostedMcpAuthoringServer({
  draftRepository,
  contentService,
  actor
}) {
  if (!draftRepository) throw new Error("draftRepository is required");
  if (!contentService) throw new Error("contentService is required");
  if (!actor?.subject) throw new Error("authenticated actor is required");

  const server = new McpServer(
    { name: "concept-clusters-hosted-authoring", version: "1.0.0" },
    {
      instructions:
        "Drafts are private to the authenticated owner and keep immutable revisions. " +
        "Always save with expected_revision, validate, and preview before proposing publication. " +
        "This server does not publish directly to Git or the deployed game."
    }
  );

  server.registerResource(
    "authoring-guidance",
    "concept-clusters://authoring/guidance",
    {
      title: "Concept Clusters authoring guidance",
      description: "Concise structural and workflow guidance for puzzle authors.",
      mimeType: "text/markdown"
    },
    async uri => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: contentService.guidance }]
    })
  );

  for (const puzzle of contentService.puzzles) {
    server.registerResource(
      `puzzle-${puzzle.id}`,
      `concept-clusters://puzzles/${puzzle.id}`,
      {
        title: puzzle.title,
        description: `Published puzzle JSON-LD for ${puzzle.title}.`,
        mimeType: "application/ld+json"
      },
      async uri => ({
        contents: [{
          uri: uri.href,
          mimeType: "application/ld+json",
          text: JSON.stringify(contentService.getPuzzleJsonLd(puzzle.id), null, 2)
        }]
      })
    );
  }

  server.registerTool("list_puzzles", {
    title: "List published puzzles",
    description: "List published puzzles, optionally filtered by category.",
    inputSchema: z.object({ category: z.string().min(1).optional() }),
    annotations: READ_ONLY
  }, safe(async ({ category }) => {
    const puzzles = contentService.listPuzzles({ category: category || null });
    return success(`Found ${puzzles.length} published puzzles.`, { puzzles });
  }));

  server.registerTool("get_puzzle", {
    title: "Get published puzzle",
    description: "Return one published puzzle as complete JSON-LD.",
    inputSchema: z.object({ puzzle_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, safe(async ({ puzzle_id }) => success(`Loaded ${puzzle_id}.`, {
    puzzleId: puzzle_id,
    document: contentService.getPuzzleJsonLd(puzzle_id)
  })));

  server.registerTool("get_catalogue", {
    title: "Get catalogue",
    description: "Return one published catalogue manifest as JSON-LD.",
    inputSchema: z.object({ catalogue_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, safe(async ({ catalogue_id }) => success(`Loaded catalogue ${catalogue_id}.`, {
    catalogueId: catalogue_id,
    document: contentService.getCatalogueJsonLd(catalogue_id)
  })));

  server.registerTool("get_authoring_guidance", {
    title: "Get authoring guidance",
    description: "Return concise Concept Clusters puzzle-authoring considerations.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, safe(async () => success("Loaded authoring guidance.", {
    markdown: contentService.guidance
  })));

  server.registerTool("create_puzzle_draft", {
    title: "Create puzzle draft",
    description: "Create a private durable draft from JSON-LD or a minimal skeleton.",
    inputSchema: z.object({
      draft_id: draftIdSchema.optional(),
      document: documentSchema.optional(),
      puzzle_id: draftIdSchema.optional(),
      title: z.string().min(1).optional(),
      category: z.string().min(1).optional(),
      base_commit_sha: z.string().min(7).optional()
    }).superRefine((value, ctx) => {
      if (value.document) return;
      for (const key of ["puzzle_id", "title", "category"]) {
        if (!value[key]) ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required when document is omitted`
        });
      }
    }),
    annotations: CREATE
  }, safe(async args => {
    const document = args.document || contentService.createPuzzleSkeleton({
      id: args.puzzle_id,
      title: args.title,
      category: args.category
    });
    const draftId = args.draft_id || document.id;
    const draft = await draftRepository.create({
      draftId,
      document,
      actor,
      baseCommitSha: args.base_commit_sha || null
    });
    return success(`Created draft ${draftId} revision 1.`, { draft });
  }));

  server.registerTool("get_puzzle_draft", {
    title: "Get puzzle draft",
    description: "Return a private draft head or one immutable revision.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      revision: z.number().int().positive().optional()
    }),
    annotations: READ_ONLY
  }, safe(async ({ draft_id, revision }) => {
    const draft = await draftRepository.get({
      draftId: draft_id,
      actor,
      revision: revision || null
    });
    return success(`Loaded draft ${draft_id} revision ${draft.revision}.`, { draft });
  }));

  server.registerTool("save_puzzle_draft", {
    title: "Save puzzle draft",
    description: "Append an immutable revision using optimistic concurrency.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      expected_revision: z.number().int().positive(),
      document: documentSchema
    }),
    annotations: WRITE
  }, safe(async ({ draft_id, expected_revision, document }) => {
    const draft = await draftRepository.save({
      draftId: draft_id,
      expectedRevision: expected_revision,
      document,
      actor
    });
    return success(`Saved draft ${draft_id} revision ${draft.revision}.`, { draft });
  }));

  server.registerTool("list_puzzle_drafts", {
    title: "List puzzle drafts",
    description: "List private draft metadata for the authenticated owner.",
    inputSchema: z.object({
      status: z.enum(["draft", "review", "submitted", "published", "archived"]).optional(),
      limit: z.number().int().min(1).max(200).default(100)
    }),
    annotations: READ_ONLY
  }, safe(async ({ status, limit }) => {
    const drafts = await draftRepository.list({ actor, status: status || null, limit });
    return success(`Found ${drafts.length} drafts.`, { drafts });
  }));

  server.registerTool("compare_draft_revisions", {
    title: "Compare draft revisions",
    description: "Return two immutable revisions for semantic comparison.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      left_revision: z.number().int().positive(),
      right_revision: z.number().int().positive()
    }),
    annotations: READ_ONLY
  }, safe(async ({ draft_id, left_revision, right_revision }) => {
    const comparison = await draftRepository.compare({
      draftId: draft_id,
      leftRevision: left_revision,
      rightRevision: right_revision,
      actor
    });
    return success(
      `Loaded revisions ${left_revision} and ${right_revision} of ${draft_id}.`,
      { comparison }
    );
  }));

  server.registerTool("validate_puzzle_draft", {
    title: "Validate puzzle draft",
    description: "Validate one stored revision against the JSON-LD and puzzle rules.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      revision: z.number().int().positive().optional()
    }),
    annotations: WRITE
  }, safe(async ({ draft_id, revision }) => {
    const draft = await draftRepository.get({
      draftId: draft_id,
      actor,
      revision: revision || null
    });
    const validation = contentService.validatePuzzleJsonLd(draft.document);
    await draftRepository.recordValidation({
      draftId: draft_id,
      revision: draft.revision,
      validation,
      actor
    });
    return success(
      validation.valid
        ? `Draft ${draft_id} revision ${draft.revision} is valid.`
        : `Draft ${draft_id} revision ${draft.revision} has ${validation.errors.length} errors.`,
      { draftId: draft_id, revision: draft.revision, ...validation }
    );
  }));

  server.registerTool("preview_repository_import", {
    title: "Preview repository import",
    description: "Validate a stored revision and describe its future Git pull-request effects without writing or publishing anything.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      revision: z.number().int().positive().optional()
    }),
    annotations: READ_ONLY
  }, safe(async ({ draft_id, revision }) => {
    const draft = await draftRepository.get({
      draftId: draft_id,
      actor,
      revision: revision || null
    });
    const result = contentService.previewRepositoryImport(draft.document);
    return success(
      result.valid
        ? `Previewed ${result.preview.action} for ${result.preview.puzzleId}; nothing was published.`
        : `Cannot preview publication because the draft has ${result.errors.length} errors.`,
      { draftId: draft_id, revision: draft.revision, ...result }
    );
  }));

  return server;
}

export default createHostedMcpAuthoringServer;
