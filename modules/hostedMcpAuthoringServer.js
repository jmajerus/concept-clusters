import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { DOMAINS } from "../puzzles/categories.js";
import {
  AUTHORING_MCP_SERVER_VERSION,
  SIMPLIFIED_PUZZLE_SCHEMA_MIME_TYPE,
  SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
  SIMPLIFIED_PUZZLE_SCHEMA_TEXT,
  SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
  simplifiedPuzzleSchemaResult
} from "./authoringSchemaResource.js";

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

// Unlike CREATE_EXTERNAL, resolving review threads converges: a second
// call after the first finds nothing left unresolved and is a no-op,
// not a duplicate creation -- idempotentHint true reflects that.
const RESOLVE_EXTERNAL = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true
});

const SYNC_EXTERNAL = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
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
    {
      name: "concept-clusters-hosted-authoring",
      version: AUTHORING_MCP_SERVER_VERSION
    },
    {
      instructions:
        "Call get_authoring_guidance before drafting a new puzzle -- it carries design " +
        "judgment (what makes a puzzle good, not just schema-valid) that nothing else here provides. " +
        "Call get_authoring_schema before constructing or saving a simplified puzzle document; " +
        "it returns the complete versioned field contract. Draft write inputs stay deliberately " +
        "permissive so incomplete or invalid intermediate drafts remain writable. " +
        "Drafts are private to the authenticated owner and hold one current document; saving overwrites it. " +
        "Always validate before publishing. " +
        "submit_puzzle_for_publication creates a dedicated GitHub branch and pull request directly -- it never writes main directly, and merging stays a separate human action in GitHub. If the draft already has an open pull request, calling it again after an edit appends to that same pull request instead of opening a new one. " +
        "Run review as an autonomous agent loop before asking the human to merge: collect CI and automated/independent-agent feedback with get_review_feedback, address routine comments, request or await follow-up review, and repeat until stable. GitHub's resolved threads are authoritative, including concurrent human actions; work only on remainingThreads and use thread id/version snapshots so stale writes fail closed. Apply correct exact suggestions, handle valid prose by editing and resubmitting, and reply with a reason when rejecting feedback. Resolve only explicitly dispositioned thread snapshots. If draftSyncRequired is true, synchronize branch changes before editing or resubmitting. After acting and receiving fresh feedback, call complete_review_round once; passive polling never counts. The circuit opens after four unfinished rounds, twelve automated writes, or two stagnant/repeated semantic states. If it opens, stop all automated writes and show its report to the human. Never call reset_review_circuit without explicit human authorization. Pause for a human on that breaker, genuine product/editorial/risk decisions, or materially conflicting reviews. When the loop is otherwise complete, call prepare_human_review_handoff with every thread accounted for; it verifies checks and emits either ready-for-human-review or human-decision-needed. The human retains final merge authority. " +
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

  for (const puzzle of contentService.puzzles) {
    server.registerResource(
      `puzzle-${puzzle.id}`,
      `concept-clusters://puzzles/${puzzle.id}`,
      {
        title: puzzle.title,
        description: `Published puzzle document for ${puzzle.title}, in the simplified authoring format.`,
        mimeType: "application/json"
      },
      async uri => ({
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(contentService.getPuzzleDocument(puzzle.id), null, 2)
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
    description: "Return one published puzzle as a complete document, in the same simplified format used for authoring.",
    inputSchema: z.object({ puzzle_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_puzzle", safe(async ({ puzzle_id }) => success(`Loaded ${puzzle_id}.`, {
    puzzleId: puzzle_id,
    document: contentService.getPuzzleDocument(puzzle_id)
  }))));

  server.registerTool("get_catalogue", {
    title: "Get catalogue",
    description: "Return one published catalogue's id, title, info, and entries.",
    inputSchema: z.object({ catalogue_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_catalogue", safe(async ({ catalogue_id }) => success(`Loaded catalogue ${catalogue_id}.`, {
    catalogueId: catalogue_id,
    document: contentService.getCatalogueDocument(catalogue_id)
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

  server.registerTool("get_authoring_schema", {
    title: "Get authoring schema",
    description:
      "Return the complete versioned JSON Schema for simplified puzzle documents. Call this before constructing or editing document fields; unlike the permissive draft-write input schema, it enumerates bridges[].termRole, relationKind, direction, lenses, learning content, and every other supported field.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, tracked("get_authoring_schema", safe(async () => success(
    `Loaded simplified puzzle authoring schema v${SIMPLIFIED_PUZZLE_SCHEMA_VERSION}.`,
    simplifiedPuzzleSchemaResult()
  ))));

  server.registerTool("create_puzzle_draft", {
    title: "Create puzzle draft",
    description:
      "Create a private durable draft from a supplied document or a minimal skeleton. Call get_authoring_schema for its complete versioned field contract; this tool's document input is deliberately permissive because drafts may be incomplete. If the document includes AI-drafted content, include generativeAssistance on the puzzle (system, scope, optional provider/role/date).",
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
    // A freshly-built skeleton (no args.document) is always the simplified
    // shape and always temporarily invalid (empty clusters/bridges) -- no
    // point normalizing it, it stores unchanged either way.
    const normalization = args.document
      ? contentService.normalizeAuthoredDocument(args.document)
      : null;
    const document = normalization?.document ?? args.document ??
      contentService.createPuzzleSkeleton({
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
    return success(`Created draft ${draftId}.`, {
      draft,
      ...(normalization && !normalization.document
        ? { normalization: { applied: false, errors: normalization.errors } }
        : {})
    });
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
      "Overwrite a draft's document. Last write wins. Call get_authoring_schema for the complete simplified-document field contract; this input remains permissive so invalid intermediate documents can be saved. Keep generativeAssistance current when AI drafts or regenerates a scope (one entry per system+scope; update in place).",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      document: documentSchema
    }),
    annotations: WRITE
  }, tracked("save_puzzle_draft", safe(async ({ draft_id, document }) => {
    const normalization = contentService.normalizeAuthoredDocument(document);
    const draft = await draftRepository.save({
      draftId: draft_id,
      document: normalization.document ?? document,
      actor
    });
    return success(`Saved draft ${draft_id}.`, {
      draft,
      ...(!normalization.document
        ? { normalization: { applied: false, errors: normalization.errors } }
        : {})
    });
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
    description: "Validate a draft's current document against the puzzle-content rules.",
    inputSchema: z.object({
      draft_id: draftIdSchema
    }),
    annotations: WRITE
  }, tracked("validate_puzzle_draft", safe(async ({ draft_id }) => {
    const draft = await draftRepository.get({ draftId: draft_id, actor });
    const validation = contentService.validatePuzzleDraft(draft.document);
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
    description: "Validate the draft and create a dedicated GitHub branch and pull request from it. Never writes directly to the base branch, and merging the pull request stays a separate human action in GitHub -- calling this does not publish anything by itself. If this draft already has an open, unmerged pull request, resubmitting appends a generated commit to that same pull request instead of opening another one. When a human or GitHub has committed review suggestions first, call sync_review_changes_to_draft before editing/resubmitting; this preserves those commits and refuses changes the draft generator cannot reproduce. Only a resubmission after the prior pull request was merged or closed opens a genuinely new one.",
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
    description: "Optional: validate a new catalogue's fields and show exact GitHub pull-request file effects (a new catalogues/<id>.js file plus its catalogues/index.js registration) against the current base commit, without writing anything. Entry puzzle ids and existing catalogue ids are resolved from that GitHub base branch (canonical content/puzzles/<id>.ccpuzzle.json or puzzles/index.js), not from the Worker-bundled list_puzzles snapshot -- so recently merged puzzles are usable before an authoring Worker redeploy. create_catalogue computes the same plan itself, so this isn't a required precondition -- it's for a client that wants to see affected paths before deciding to create it.",
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
    description: "Validate and create a dedicated GitHub branch and pull request for a brand-new curated catalogue. Never writes directly to the base branch, and merging stays a separate human action in GitHub, so calling this doesn't publish anything by itself. Entry puzzle ids must already exist on the configured GitHub base branch (canonical content/puzzles/ document or a puzzles/index.js registration) -- do not wait for list_puzzles to catch up after merges; Git is the published authority. A catalogue means the selection itself communicates a real audience, theme, or learning purpose (see docs/CATALOGUES.md) -- not another name for an academic category, a prerequisite sequence, or routine polish. Call list_catalogues first to check whether an existing catalogue already fits before creating a new one.",
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

  server.registerTool("get_review_feedback", {
    title: "Get review feedback",
    description: "Drive the bounded autonomous PR review loop. Returns live checks, review summaries, thread-aware inline feedback, draft synchronization state, automationState, and circuitBreaker counters/report. Agents should keep working on remainingThreads, then call complete_review_round once after fresh feedback arrives. Repeated reads and waiting for CI do not consume a round. Concurrent human actions remain authoritative and invalidate stale writes. Stop immediately at circuit-breaker-open. When automationState reaches ready-to-prepare-handoff, call prepare_human_review_handoff; synchronize first when required.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid()
    }),
    annotations: EXTERNAL_READ
  }, tracked("get_review_feedback", safe(async ({ publication_request_id }) => {
    const feedback = await publicationService.reviewFeedback({
      requestId: publication_request_id,
      actor
    });
    if (!feedback.hasPullRequest) {
      return success(
        "This publication request has no pull request yet, so there's no review feedback to fetch.",
        { feedback }
      );
    }
    const total = feedback.reviews.length + feedback.comments.length;
    const summary = total === 0
      ? `No review feedback yet on pull request #${feedback.pullRequestNumber}; automation state is ${feedback.automationState}.`
      : `${feedback.comments.length} inline comment(s) and ${feedback.reviews.length} review summary(ies) on pull request #${feedback.pullRequestNumber}; automation state is ${feedback.automationState} (${feedback.pullRequestUrl}).`;
    return success(summary, { feedback });
  })));

  server.registerTool("apply_review_suggestion", {
    title: "Apply review suggestion",
    description: "Apply one exact GitHub suggested change from a remaining review thread as a normal, reviewer-attributed new commit on the existing pull-request branch -- the MCP equivalent of GitHub's Commit suggestion button. Use the comment id/updatedAt and thread id/version from the same get_review_feedback snapshot, only after judging it correct. A human resolution, reply, newer review, outdated anchor, or branch race makes the call fail closed. It does not resolve the thread; resolve_review_feedback remains a separate explicit step.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid(),
      comment_id: z.number().int().positive(),
      comment_updated_at: z.string().min(1),
      thread_id: z.string().min(1),
      thread_version: z.string().min(1)
    }),
    annotations: CREATE_EXTERNAL
  }, tracked("apply_review_suggestion", safe(async ({
    publication_request_id,
    comment_id,
    comment_updated_at,
    thread_id,
    thread_version
  }) => {
    const result = await publicationService.applyReviewSuggestion({
      requestId: publication_request_id,
      commentId: comment_id,
      expectedUpdatedAt: comment_updated_at,
      threadId: thread_id,
      expectedThreadVersion: thread_version,
      actor
    });
    if (!result.hasPullRequest) {
      return success(
        "This publication request has no pull request yet, so there's no review suggestion to apply.",
        { result }
      );
    }
    return success(
      result.applied
        ? `Applied review comment ${comment_id} to pull request #${result.pullRequestNumber} as commit ${result.githubCommitSha.slice(0, 8)}.`
        : `Review comment ${comment_id} already matches the pull-request branch; no commit was needed.`,
      { result }
    );
  })));

  server.registerTool("reply_to_review_comment", {
    title: "Reply to review comment",
    description: "Post a reply within a specific remaining review thread, primarily to record why feedback is rejected. Use the comment id and thread id/version from the same get_review_feedback snapshot. If a human already replied or resolved it, the stale call fails without posting. Fetch feedback again after replying to obtain the new thread version before resolving it.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid(),
      comment_id: z.number().int(),
      thread_id: z.string().min(1),
      thread_version: z.string().min(1),
      body: z.string().min(1)
    }),
    annotations: CREATE_EXTERNAL
  }, tracked("reply_to_review_comment", safe(async ({
    publication_request_id,
    comment_id,
    thread_id,
    thread_version,
    body
  }) => {
    const result = await publicationService.replyToReviewComment({
      requestId: publication_request_id,
      commentId: comment_id,
      threadId: thread_id,
      expectedThreadVersion: thread_version,
      body,
      actor
    });
    if (!result.hasPullRequest) {
      return success(
        "This publication request has no pull request yet, so there's no review comment to reply to.",
        { result }
      );
    }
    return success(
      `Replied to comment ${comment_id} on pull request #${result.pullRequestNumber}.`,
      { result }
    );
  })));

  server.registerTool("resolve_review_feedback", {
    title: "Resolve review feedback",
    description: "Resolve only the explicitly listed review-thread snapshots that have a clear disposition: applied/fixed, or rejected with a visible reply. Supply each thread's id/version from a fresh get_review_feedback call. New feedback is never swept up, changed snapshots fail closed, and threads a human already resolved are left resolved and reported separately.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid(),
      threads: z.array(z.object({
        thread_id: z.string().min(1),
        thread_version: z.string().min(1)
      })).min(1)
    }),
    annotations: RESOLVE_EXTERNAL
  }, tracked("resolve_review_feedback", safe(async ({ publication_request_id, threads }) => {
    const result = await publicationService.resolveReviewFeedback({
      requestId: publication_request_id,
      threads: threads.map(thread => ({
        threadId: thread.thread_id,
        threadVersion: thread.thread_version
      })),
      actor
    });
    if (!result.hasPullRequest) {
      return success(
        "This publication request has no pull request yet, so there's no review feedback to resolve.",
        { result }
      );
    }
    return success(
      result.resolvedCount === 0
        ? `Nothing to resolve on pull request #${result.pullRequestNumber}; already all resolved.`
        : `Resolved ${result.resolvedCount} review thread(s) on pull request #${result.pullRequestNumber}.`,
      { result }
    );
  })));

  server.registerTool("sync_review_changes_to_draft", {
    title: "Sync review changes to draft",
    description: "Reconcile manual or suggestion commits already made on an open publication PR with its authoring draft before further assistant edits or resubmission. Canonical document changes are imported into D1; generated-file changes must be exactly reproducible from the draft. Unrelated or unrepresentable branch edits fail closed instead of being overwritten. Call this whenever get_review_feedback reports draftSyncRequired true.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid()
    }),
    annotations: SYNC_EXTERNAL
  }, tracked("sync_review_changes_to_draft", safe(async ({ publication_request_id }) => {
    const result = await publicationService.syncReviewChangesToDraft({
      requestId: publication_request_id,
      actor
    });
    if (!result.hasPullRequest) {
      return success(
        "This publication request has no pull request yet, so there are no review commits to sync.",
        { result }
      );
    }
    return success(
      result.changedPaths.length
        ? `Synchronized ${result.changedPaths.length} reviewed path(s) from pull request #${result.pullRequestNumber} into the authoring workflow.`
        : `The draft and pull request #${result.pullRequestNumber} were already synchronized.`,
      { result }
    );
  })));

  server.registerTool("prepare_human_review_handoff", {
    title: "Prepare human review handoff",
    description: "Finish the autonomous agent review loop and create a snapshot-bound merge handoff. This verifies that the PR is open, its checks are not pending/failing, its head is represented by the current draft, every resolved thread has an explicit disposition, every remaining open thread is an explicit human decision, and nothing changes during preparation. With no escalations the state is ready-for-human-review; otherwise it is human-decision-needed. The human still decides whether to merge.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid(),
      summary: z.string().min(1),
      collaborators: z.array(z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        outcome: z.string().min(1)
      })).min(1),
      dispositions: z.array(z.object({
        thread_id: z.string().min(1),
        thread_version: z.string().min(1),
        outcome: z.enum(["applied", "fixed", "rejected", "handled-by-human"]),
        summary: z.string().min(1)
      })),
      escalations: z.array(z.object({
        thread_id: z.string().min(1),
        thread_version: z.string().min(1),
        question: z.string().min(1),
        recommendation: z.string().min(1)
      })).default([])
    }),
    annotations: SYNC_EXTERNAL
  }, tracked("prepare_human_review_handoff", safe(async args => {
    const result = await publicationService.prepareHumanReviewHandoff({
      requestId: args.publication_request_id,
      summary: args.summary,
      collaborators: args.collaborators,
      dispositions: args.dispositions.map(disposition => ({
        threadId: disposition.thread_id,
        threadVersion: disposition.thread_version,
        outcome: disposition.outcome,
        summary: disposition.summary
      })),
      escalations: args.escalations.map(escalation => ({
        threadId: escalation.thread_id,
        threadVersion: escalation.thread_version,
        question: escalation.question,
        recommendation: escalation.recommendation
      })),
      actor
    });
    if (!result.hasPullRequest) {
      return success(
        "This publication request has no pull request yet, so no human handoff can be prepared.",
        { result }
      );
    }
    return success(
      result.handoff.status === "ready-for-human-review"
        ? `Pull request #${result.pullRequestNumber} is ready for final human review and merge consideration.`
        : `Pull request #${result.pullRequestNumber} needs ${result.handoff.remainingDecisions.length} human decision(s); routine agent review is otherwise complete.`,
      { result }
    );
  })));

  server.registerTool("complete_review_round", {
    title: "Complete automated review round",
    description: "Record one semantic review checkpoint after agents have acted and fresh review/check state has arrived. This is idempotent for an unchanged checkpoint with no intervening writes, so passive polling is never counted. It measures unresolved feedback, requested-change reviews, checks, and the branch tree; opens the circuit after four unfinished rounds or two stagnant/repeated states; and returns the report when automation must stop.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid(),
      summary: z.string().min(1)
    }),
    annotations: SYNC_EXTERNAL
  }, tracked("complete_review_round", safe(async ({ publication_request_id, summary }) => {
    const result = await publicationService.completeReviewRound({
      requestId: publication_request_id,
      summary,
      actor
    });
    if (!result.hasPullRequest) {
      return success(
        "This publication request has no pull request, so no review round was counted.",
        { result }
      );
    }
    return success(
      result.automationState === "circuit-breaker-open"
        ? `Automated review stopped on pull request #${result.pullRequestNumber}; the circuit breaker is open.`
        : result.duplicateCheckpoint
          ? `Pull request #${result.pullRequestNumber} has not changed since the last checkpoint; no round was counted.`
          : `Completed automated review round ${result.reviewRoundCount} on pull request #${result.pullRequestNumber}.`,
      { result }
    );
  })));

  server.registerTool("reset_review_circuit", {
    title: "Reset automated review circuit",
    description: "Reset an open review circuit and its round/write/stagnation budgets only after the human explicitly authorizes another autonomous attempt. This is not an agent recovery shortcut. human_authorized must be true and authorization_note records the human's direction for auditability.",
    inputSchema: z.object({
      publication_request_id: z.string().uuid(),
      human_authorized: z.literal(true),
      authorization_note: z.string().min(1)
    }),
    annotations: SYNC_EXTERNAL
  }, tracked("reset_review_circuit", safe(async ({
    publication_request_id,
    human_authorized,
    authorization_note
  }) => {
    const result = await publicationService.resetReviewCircuit({
      requestId: publication_request_id,
      reason: authorization_note,
      humanConfirmed: human_authorized,
      actor
    });
    return success(
      `Reset the automated review circuit for pull request #${result.pullRequestNumber}; a new bounded attempt may begin.`,
      { result }
    );
  })));

  return server;
}

export default createHostedMcpAuthoringServer;
