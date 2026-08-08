import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { DOMAINS } from "../puzzles/categories.js";

const documentSchema = z.record(z.string(), z.unknown());
const draftIdSchema = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Use a lowercase URL-safe draft id"
);
const infoSchema = z.object({
  text: z.string().min(1),
  link: z.string().min(1).optional(),
  extraLink: z.string().min(1).optional()
}).strict();
const categoryRegistrationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: draftIdSchema.optional(),
  // Fixed vocabulary, not user-extensible -- see docs/TAXONOMY-ROADMAP.md.
  domain: z.enum(Object.keys(DOMAINS)).optional(),
  info: infoSchema,
  subcategories: z.record(draftIdSchema, z.object({
    title: z.string().min(1).max(100),
    info: infoSchema.optional()
  }).strict()).optional()
}).strict();

// A catalogue is a curated, themed selection communicated through which
// puzzles it selects and why (see docs/CATALOGUES.md's "Editorial
// guidance") -- not a draft, and not owned by any one author the way a
// puzzle draft is, so it has no revision/expected_revision lifecycle.
const catalogueCreationSchema = z.object({
  id: draftIdSchema,
  title: z.string().min(1).max(200),
  info: infoSchema.optional(),
  entries: z.array(z.object({
    id: z.string().min(1).describe("An existing published puzzle id."),
    reason: z.string().min(1).max(1000).optional()
      .describe("Why this puzzle belongs in this catalogue specifically -- an editorial choice, not a restatement of what the puzzle is about.")
  })).min(1)
}).strict();

// reason is scoped to catalogue_id -- it becomes that catalogue entry's
// editorial-choice text (see docs/CATALOGUES.md), not a general note about
// the submission. Shared between preview_repository_import and
// submit_puzzle_for_publication so the two never drift out of sync.
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

const DESTRUCTIVE = Object.freeze({
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
  const output = { error: error.message };
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

// One data point per tool call: which tool, so relative call frequency
// across endpoints is visible. Deliberately not richer than that — no
// per-author breakdown, outcome, or latency. At this project's actual
// scale (one owner alternating AI/human edits) those would measure a
// funnel and audience that don't exist; see docs/MCP-REMOTE.md. Uniform
// and cheap to add per-tool since it wraps the already-`safe()`-wrapped
// handler from the outside rather than threading through each handler
// body. Telemetry must never break an authoring call, so a missing
// binding or a write failure is a silent no-op, matching the
// fire-and-forget convention in analyticsClient.js and src/worker.js.
function track(analytics, toolName, handler) {
  return async args => {
    const result = await handler(args);
    try {
      analytics?.writeDataPoint({
        blobs: ["mcp_tool_call", toolName],
        doubles: [1],
        indexes: [toolName]
      });
    } catch {
      // Ignore — see comment above.
    }
    return result;
  };
}

export function createHostedMcpAuthoringServer({
  draftRepository,
  contentService,
  publicationService,
  actor,
  analytics
}) {
  if (!draftRepository) throw new Error("draftRepository is required");
  if (!contentService) throw new Error("contentService is required");
  if (!publicationService) throw new Error("publicationService is required");
  if (!actor?.subject) throw new Error("authenticated actor is required");

  const tracked = (toolName, handler) => track(analytics, toolName, handler);

  const server = new McpServer(
    { name: "concept-clusters-hosted-authoring", version: "1.0.0" },
    {
      instructions:
        "Call get_authoring_guidance before drafting a new puzzle -- it carries design " +
        "judgment (what makes a puzzle good, not just schema-valid) that nothing else here provides. " +
        "Drafts are private to the authenticated owner and hold one current document; saving overwrites it. " +
        "Always validate before publishing. " +
        "submit_puzzle_for_publication creates a dedicated GitHub branch and pull request directly -- it never writes main directly, and merging stays a separate human action in GitHub, so there's no separate approval step before it. If the draft already has an open pull request, calling it again after an edit amends that same pull request instead of opening a new one -- don't try to work around a missing related-puzzle target or similar by waiting for a fresh PR; just resubmit once the target is real. " +
        "preview_repository_import remains available if a client wants to see the affected paths first, but it's optional, not a precondition."
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
  }, tracked("list_puzzles", safe(async ({ category }) => {
    const puzzles = contentService.listPuzzles({ category: category || null });
    return success(`Found ${puzzles.length} published puzzles.`, { puzzles });
  })));

  server.registerTool("list_categories", {
    title: "List categories",
    description: "List the complete published subject taxonomy with slugs, metadata-registration state, subcategories, and puzzle counts.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, tracked("list_categories", safe(async () => {
    const categories = contentService.listCategories();
    return success(`Found ${categories.length} categories.`, { categories });
  })));

  server.registerTool("get_category", {
    title: "Get category",
    description: "Return one category's navigation metadata, subcategories, and puzzle counts.",
    inputSchema: z.object({ name: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_category", safe(async ({ name }) => success(`Loaded category ${name}.`, {
    category: contentService.getCategory(name)
  }))));

  server.registerTool("get_puzzle", {
    title: "Get published puzzle",
    description: "Return one published puzzle as complete JSON-LD.",
    inputSchema: z.object({ puzzle_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_puzzle", safe(async ({ puzzle_id }) => success(`Loaded ${puzzle_id}.`, {
    puzzleId: puzzle_id,
    document: contentService.getPuzzleJsonLd(puzzle_id)
  }))));

  server.registerTool("get_catalogue", {
    title: "Get catalogue",
    description: "Return one published catalogue manifest as JSON-LD.",
    inputSchema: z.object({ catalogue_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_catalogue", safe(async ({ catalogue_id }) => success(`Loaded catalogue ${catalogue_id}.`, {
    catalogueId: catalogue_id,
    document: contentService.getCatalogueJsonLd(catalogue_id)
  }))));

  server.registerTool("list_catalogues", {
    title: "List catalogues",
    description: "List the complete set of curated catalogues with titles and entry counts. Call this before create_catalogue to check whether a suitable catalogue already exists, and before get_catalogue if the exact id isn't already known.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, tracked("list_catalogues", safe(async () => {
    const catalogues = contentService.listCatalogues();
    return success(`Found ${catalogues.length} catalogues.`, { catalogues });
  })));

  server.registerTool("get_authoring_guidance", {
    title: "Get authoring guidance",
    description: "Return concise Concept Clusters puzzle-authoring considerations.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, tracked("get_authoring_guidance", safe(async () => success("Loaded authoring guidance.", {
    markdown: contentService.guidance
  }))));

  server.registerTool("create_puzzle_draft", {
    title: "Create puzzle draft",
    description:
      "Create a private durable draft from JSON-LD or a minimal skeleton. If the document includes AI-drafted content, include generativeAssistance on the puzzle (system, scope, optional provider/role/date).",
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
  }, tracked("create_puzzle_draft", safe(async args => {
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
    return success(`Created draft ${draftId}.`, { draft });
  })));

  server.registerTool("get_puzzle_draft", {
    title: "Get puzzle draft",
    description: "Return a private draft's current state.",
    inputSchema: z.object({
      draft_id: draftIdSchema
    }),
    annotations: READ_ONLY
  }, tracked("get_puzzle_draft", safe(async ({ draft_id }) => {
    const draft = await draftRepository.get({ draftId: draft_id, actor });
    return success(`Loaded draft ${draft_id}.`, { draft });
  })));

  server.registerTool("save_puzzle_draft", {
    title: "Save puzzle draft",
    description:
      "Overwrite a draft's document. Last write wins. Keep generativeAssistance current when AI drafts or regenerates a scope (one entry per system+scope; update in place).",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      document: documentSchema
    }),
    annotations: WRITE
  }, tracked("save_puzzle_draft", safe(async ({ draft_id, document }) => {
    const draft = await draftRepository.save({
      draftId: draft_id,
      document,
      actor
    });
    return success(`Saved draft ${draft_id}.`, { draft });
  })));

  server.registerTool("list_puzzle_drafts", {
    title: "List puzzle drafts",
    description: "List private draft metadata for the authenticated owner.",
    inputSchema: z.object({
      status: z.enum(["draft", "review", "submitted", "published", "archived"]).optional(),
      limit: z.number().int().min(1).max(200).default(100)
    }),
    annotations: READ_ONLY
  }, tracked("list_puzzle_drafts", safe(async ({ status, limit }) => {
    const drafts = await draftRepository.list({ actor, status: status || null, limit });
    return success(`Found ${drafts.length} drafts.`, { drafts });
  })));

  server.registerTool("delete_puzzle_draft", {
    title: "Delete puzzle draft",
    description: "Permanently delete a private draft that was never submitted for publication.",
    inputSchema: z.object({
      draft_id: draftIdSchema
    }),
    annotations: DESTRUCTIVE
  }, tracked("delete_puzzle_draft", safe(async ({ draft_id }) => {
    await draftRepository.delete({ draftId: draft_id, actor });
    return success(`Deleted draft ${draft_id}.`, { draftId: draft_id, deleted: true });
  })));

  server.registerTool("validate_puzzle_draft", {
    title: "Validate puzzle draft",
    description: "Validate a draft's current document against the JSON-LD and puzzle rules.",
    inputSchema: z.object({
      draft_id: draftIdSchema
    }),
    annotations: WRITE
  }, tracked("validate_puzzle_draft", safe(async ({ draft_id }) => {
    const draft = await draftRepository.get({ draftId: draft_id, actor });
    const validation = contentService.validatePuzzleJsonLd(draft.document);
    await draftRepository.recordValidation({
      draftId: draft_id,
      validation,
      actor
    });
    return success(
      validation.valid
        ? `Draft ${draft_id} is valid.`
        : `Draft ${draft_id} has ${validation.errors.length} errors.`,
      { draftId: draft_id, ...validation }
    );
  })));

  server.registerTool("preview_repository_import", {
    title: "Preview repository import",
    description: "Optional: validate a draft's current document and show exact GitHub pull-request file effects against the current base commit, without writing anything. submit_puzzle_for_publication computes the same plan itself, so this isn't a required precondition -- it's for a client that wants to see affected paths before deciding to publish.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      replace: z.boolean().default(false),
      ...catalogueFields,
      new_category: categoryRegistrationSchema.optional()
    }).superRefine(requireCatalogueForReason),
    annotations: EXTERNAL_READ
  }, tracked("preview_repository_import", safe(async ({
    draft_id,
    replace,
    catalogue_id,
    reason,
    new_category
  }) => {
    const result = await publicationService.preview({
      draftId: draft_id,
      replace,
      catalogueId: catalogue_id || null,
      reason: reason || null,
      newCategory: new_category || null,
      actor
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
  })));

  server.registerTool("submit_puzzle_for_publication", {
    title: "Submit puzzle for publication",
    description: "Validate the draft and create a dedicated GitHub branch and pull request from it. Never writes directly to the base branch, and merging the pull request stays a separate human action in GitHub -- calling this does not publish anything by itself. If this draft already has an open, unmerged pull request, resubmitting amends that same pull request with a new commit instead of opening another one -- no separate tool or step needed, just call this again after editing the draft. Only a resubmission after the prior pull request was merged or closed opens a genuinely new one.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      replace: z.boolean().default(false),
      ...catalogueFields,
      new_category: categoryRegistrationSchema.optional()
    }).superRefine(requireCatalogueForReason),
    annotations: CREATE_EXTERNAL
  }, tracked("submit_puzzle_for_publication", safe(async args => {
    const publication = await publicationService.submit({
      draftId: args.draft_id,
      replace: args.replace,
      catalogueId: args.catalogue_id || null,
      reason: args.reason || null,
      newCategory: args.new_category || null,
      actor
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
  })));

  server.registerTool("preview_catalogue_creation", {
    title: "Preview catalogue creation",
    description: "Optional: validate a new catalogue's fields and show exact GitHub pull-request file effects (a new catalogues/<id>.js file plus its catalogues/index.js registration) against the current base commit, without writing anything. Entry puzzle ids and existing catalogue ids are resolved from that GitHub base branch (canonical content/puzzles/<id>.ccpuzzle.jsonld or puzzles/index.js), not from the Worker-bundled list_puzzles snapshot -- so recently merged puzzles are usable before an authoring Worker redeploy. create_catalogue computes the same plan itself, so this isn't a required precondition -- it's for a client that wants to see affected paths before deciding to create it.",
    inputSchema: catalogueCreationSchema,
    annotations: EXTERNAL_READ
  }, tracked("preview_catalogue_creation", safe(async args => {
    const result = await publicationService.previewCatalogueCreation(args);
    return success(
      result.valid
        ? `Previewed catalogue ${result.preview.catalogueId}; nothing was created.`
        : `Cannot preview catalogue creation because it has ${result.errors.length} errors.`,
      {
        valid: result.valid,
        errors: result.errors,
        preview: result.preview
      }
    );
  })));

  server.registerTool("create_catalogue", {
    title: "Create catalogue",
    description: "Validate and create a dedicated GitHub branch and pull request for a brand-new curated catalogue. Never writes directly to the base branch, and merging stays a separate human action in GitHub, so calling this doesn't publish anything by itself. Entry puzzle ids must already exist on the configured GitHub base branch (canonical JSON-LD under content/puzzles/ or a puzzles/index.js registration) -- do not wait for list_puzzles to catch up after merges; Git is the published authority. A catalogue means the selection itself communicates a real audience, theme, or learning purpose (see docs/CATALOGUES.md) -- not another name for an academic category, a prerequisite sequence, or routine polish. Call list_catalogues first to check whether an existing catalogue already fits before creating a new one.",
    inputSchema: catalogueCreationSchema,
    annotations: CREATE_EXTERNAL
  }, tracked("create_catalogue", safe(async args => {
    const result = await publicationService.createCatalogue(args, { actor });
    return success(
      `Opened pull request #${result.githubPrNumber} for catalogue ${result.catalogueId}.`,
      { catalogue: result }
    );
  })));

  server.registerTool("get_publication_status", {
    title: "Get publication status",
    description: "Reconcile a publication request with its GitHub pull request and return the current status.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid()
    }),
    annotations: EXTERNAL_READ
  }, tracked("get_publication_status", safe(async ({ publication_request_id }) => {
    const publication = await publicationService.status({
      requestId: publication_request_id,
      actor
    });
    return success(
      `Publication request ${publication.id} is ${publication.status}.`,
      { publication }
    );
  })));

  return server;
}

export default createHostedMcpAuthoringServer;
