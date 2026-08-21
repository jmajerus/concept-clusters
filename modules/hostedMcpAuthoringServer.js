import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { DOMAINS } from "../puzzles/categories.js";
import { authoringGuidanceResult } from "./authoringDesignGuidance.js";
import {
  AUTHORING_PHASES,
  AUTHORING_MCP_SERVER_VERSION,
  SIMPLIFIED_PUZZLE_SCHEMA_MIME_TYPE,
  SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
  SIMPLIFIED_PUZZLE_SCHEMA_TEXT,
  SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
  simplifiedPuzzleSchemaResult
} from "./authoringSchemaResource.js";
import { documentForDraftStore } from "./authoredPuzzleDocument.js";

const documentSchema = z.record(z.string(), z.unknown());
const authoringPhaseSchema = z.object({
  phase: z.enum(AUTHORING_PHASES).default("complete")
});
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
// Shared by create_catalogue (id must be new) and update_catalogue (id
// must already exist) -- both submit the same complete document; only
// the registry-level rule on `id` differs between them
// (validateCatalogueCreation vs validateCatalogueUpdate). Editing an
// existing catalogue means resending its whole entries list with
// whatever's added, removed, or reordered already reflected in it --
// the same way replacing a puzzle document replaces the whole canonical
// file rather than patching one field, not a smaller privileged
// operation of its own.
const catalogueDocumentSchema = z.object({
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

// One data point per tool call: tool in blob2, optional authoring phase in
// blob3, target kind in blob4, and the stable target id in index1. Omitted
// phase means complete for schema/guidance retrieval. This measures retrieval,
// not whether the returned guidance was followed. Deliberately no per-author
// breakdown, outcome, or latency. At this project's actual
// scale (one owner alternating AI/human edits) those would measure a funnel
// and audience that don't exist; see docs/MCP-REMOTE.md. Uniform and cheap
// to add per-tool since it wraps the already-`safe()`-wrapped handler from
// the outside rather than threading through each handler body. Telemetry
// must never break an authoring call, so a missing binding or a write failure
// is a silent no-op, matching the fire-and-forget convention in
// analyticsClient.js and src/worker.js.
const PHASED_AUTHORING_TOOLS = new Set([
  "get_authoring_guidance",
  "get_authoring_schema"
]);
const CATALOGUE_DOCUMENT_TOOLS = new Set([
  "preview_catalogue_creation",
  "create_catalogue",
  "preview_update_catalogue",
  "update_catalogue"
]);

function analyticsTarget(toolName, args) {
  // Draft ids are the durable authoring identity for puzzles, including
  // publication calls that also happen to mention a destination catalogue.
  const puzzleId = args?.draft_id || args?.puzzle_id ||
    (toolName === "create_puzzle_draft" ? args?.document?.id : null);
  if (puzzleId) return { type: "puzzle", id: puzzleId };

  if (CATALOGUE_DOCUMENT_TOOLS.has(toolName) && args?.id) {
    return { type: "catalogue", id: args.id };
  }
  if (args?.catalogue_id) return { type: "catalogue", id: args.catalogue_id };

  // Review tools intentionally accept the publication request id alone. Keep
  // that correlation key rather than adding a redundant draft id to every MCP
  // call solely for telemetry.
  if (args?.publication_request_id) {
    return { type: "publication", id: args.publication_request_id };
  }

  if (toolName === "get_category" && args?.name) {
    return { type: "category", id: args.name };
  }
  if (toolName === "list_puzzles" && args?.category) {
    return { type: "category", id: args.category };
  }
  return { type: "global", id: "global" };
}

function track(analytics, toolName, handler) {
  return async args => {
    const result = await handler(args);
    try {
      const phase = PHASED_AUTHORING_TOOLS.has(toolName)
        ? args?.phase || "complete"
        : "";
      const target = analyticsTarget(toolName, args);
      analytics?.writeDataPoint({
        blobs: ["mcp_tool_call", toolName, phase, target.type],
        doubles: [1],
        indexes: [target.id]
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
        "Use one accumulating simplified-puzzle draft. Start with get_authoring_guidance and " +
        "get_authoring_schema at phase=core, then use review, pedagogy, and publication as needed. " +
        "Retrieve the latest draft before every later pass, preserve earlier fields, and capture exact " +
        "links and citation details during the research that found them rather than rediscovering them. " +
        "A phase is a focused projection, not a replacement format; omit phase (or use complete) whenever " +
        "the whole contract or guidance is needed. Phases are reusable concern areas, not one-way gates; " +
        "revisit pedagogy later to add a learning introduction without replacing existing lenses. " +
        "Draft write inputs stay deliberately " +
        "permissive so incomplete or invalid intermediate drafts remain writable. " +
        "Drafts are private to the authenticated owner and hold one current document. " +
        "Retrieve the latest draft and pass its revision as expected_revision when saving. " +
        "Always validate before publishing. " +
        "submit_puzzle_for_publication creates a dedicated GitHub branch and pull request directly -- it never writes main directly, and merging stays a separate human action in GitHub. If the draft already has an open pull request, calling it again after an edit appends to that same pull request instead of opening a new one. " +
        "Once validate_puzzle_draft passes, call submit_puzzle_for_publication directly -- do not pause to ask the human whether to review the draft first or whether to go ahead. Nothing is published by that call; the pull request it opens is the actual review surface (a real diff of the generated files, not a chat-pasted document dump), and it stays open for exactly that until a human merges it. Asking first only adds a round trip with no matching safety benefit. Only pause before calling it for a genuine content judgment call the draft itself doesn't resolve. " +
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
    description: "Return one published catalogue's id, title, info, and entries. The returned document is exactly update_catalogue's input shape -- edit it and send it back to change the catalogue.",
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
    description: "Return complete guidance when phase is omitted, or focused guidance for the core, review, pedagogy, or publication pass over one accumulating draft.",
    inputSchema: authoringPhaseSchema,
    annotations: READ_ONLY
  }, tracked("get_authoring_guidance", safe(async ({ phase }) => success(
    `Loaded ${phase} authoring guidance.`,
    authoringGuidanceResult(phase, contentService.guidance)
  ))));

  server.registerTool("get_authoring_schema", {
    title: "Get authoring schema",
    description:
      "Return the complete versioned JSON Schema when phase is omitted, or a focused field projection for the core, review, pedagogy, or publication pass. Phase projections preserve omitted fields and are not standalone replacement schemas.",
    inputSchema: authoringPhaseSchema,
    annotations: READ_ONLY
  }, tracked("get_authoring_schema", safe(async ({ phase }) => success(
    `Loaded ${phase} simplified puzzle authoring schema v${SIMPLIFIED_PUZZLE_SCHEMA_VERSION}.`,
    simplifiedPuzzleSchemaResult(phase)
  ))));

  server.registerTool("create_puzzle_draft", {
    title: "Create puzzle draft",
    description:
      "Create a private durable draft from a supplied document or a minimal skeleton. Start simplified content with get_authoring_schema phase=core; retrieve and preserve that accumulating draft in later phases. This input is deliberately permissive because drafts may be incomplete.",
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
    const { document, normalization } = documentForDraftStore(
      args.document,
      () => contentService.createPuzzleSkeleton({
        id: args.puzzle_id,
        title: args.title,
        category: args.category
      })
    );
    if (!document) {
      throw new Error(
        "JSON-LD is not accepted for drafts. Use the simplified format. JSON-LD is interchange-only."
      );
    }
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
    return success(`Loaded draft ${draft_id} revision ${draft.revision}.`, { draft });
  })));

  server.registerTool("save_puzzle_draft", {
    title: "Save puzzle draft",
    description:
      "Replace the accumulating draft document using optimistic revision matching. Retrieve the latest revision and preserve fields from earlier authoring phases. This input remains permissive so invalid intermediate documents can be saved. Keep generativeAssistance current when AI drafts or regenerates a scope.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      expected_revision: z.number().int().positive(),
      document: documentSchema
    }),
    annotations: WRITE
  }, tracked("save_puzzle_draft", safe(async ({ draft_id, expected_revision, document }) => {
    const { document: stored, normalization } = documentForDraftStore(document);
    if (!stored) {
      throw new Error(
        "JSON-LD is not accepted for drafts. Use the simplified format. JSON-LD is interchange-only."
      );
    }
    const draft = await draftRepository.save({
      draftId: draft_id,
      expectedRevision: expected_revision,
      document: stored,
      actor
    });
    return success(`Saved draft ${draft_id}; current revision is ${draft.revision}.`, {
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
    inputSchema: catalogueDocumentSchema,
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
    inputSchema: catalogueDocumentSchema,
    annotations: CREATE_EXTERNAL
  }, tracked("create_catalogue", safe(async args => {
    const result = await publicationService.createCatalogue(args, { actor });
    return success(
      `Opened pull request #${result.githubPrNumber} for catalogue ${result.catalogueId}.`,
      { catalogue: result }
    );
  })));

  server.registerTool("preview_update_catalogue", {
    title: "Preview catalogue update",
    description: "Optional: validate a complete replacement document for an EXISTING catalogue and show exact GitHub pull-request file effects against the current base commit, without writing anything. Send the catalogue's whole entries list, not just what changed -- add, remove, and reorder are just differences you make in that list before calling, the same way replacing a puzzle document replaces its whole canonical file. Entry puzzle ids are resolved from the GitHub base branch, not the Worker-bundled list_puzzles snapshot, so a puzzle that just merged is usable immediately -- this is the tool for adding a puzzle to a catalogue that was authored anticipating it before it existed. Meta catalogues aren't supported yet. update_catalogue computes the same plan itself, so this isn't a required precondition.",
    inputSchema: catalogueDocumentSchema,
    annotations: EXTERNAL_READ
  }, tracked("preview_update_catalogue", safe(async args => {
    const result = await publicationService.previewUpdateCatalogue(args);
    return success(
      result.valid
        ? `Previewed catalogue ${result.preview.catalogueId}; nothing was changed.`
        : `Cannot preview catalogue update because it has ${result.errors.length} errors.`,
      {
        valid: result.valid,
        errors: result.errors,
        preview: result.preview
      }
    );
  })));

  server.registerTool("update_catalogue", {
    title: "Update catalogue",
    description: "Validate and create a dedicated GitHub branch and pull request replacing an EXISTING catalogue's entries with a complete new document. Never writes directly to the base branch, and merging stays a separate human action in GitHub. Call get_catalogue first to load the current document, then send it back with your changes -- this replaces the whole entries list, so omitting an existing entry removes it. Entry puzzle ids must already exist on the GitHub base branch; do not wait for list_puzzles to catch up after merges. Meta catalogues aren't supported yet.",
    inputSchema: catalogueDocumentSchema,
    annotations: CREATE_EXTERNAL
  }, tracked("update_catalogue", safe(async args => {
    const result = await publicationService.updateCatalogue(args, { actor });
    return success(
      `Opened pull request #${result.githubPrNumber} updating catalogue ${result.catalogueId}.`,
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
