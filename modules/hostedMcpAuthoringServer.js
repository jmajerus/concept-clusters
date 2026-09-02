// This file retains its historical name, but createAuthoringMcpServer is the
// runtime-neutral canonical tool/resource registry used by both hosted HTTP
// and local stdio MCP. Keep Node-only checkout behavior in mcpAuthoringServer.
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { DOMAINS } from "../puzzles/categories.js";
import {
  HOSTED_DRAFT_REVIEW_URL,
  authoringGuidanceResult,
  authoringWorkflowGuidanceResult,
  submitAfterDraftReviewInstructions
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
import { documentForDraftStore, draftForAuthoring, withStorageCanonicalizeFlags } from "./authoredPuzzleDocument.js";
import {
  buildMcpClientProbeRecord,
  emitMcpClientProbe
} from "./mcpClientProbe.js";
import { stampDocumentAssistanceFromMcp } from "./mcpClientIdentity.js";
import { createMcpStampContext, persistAuthoringAssistanceStamp } from "./authoringAssistanceLog.js";
import { openPuzzleWorkingCopy, upsertCatalogueDraft, upsertCategoryDraft } from "./contentDocumentSeed.js";
import {
  filterAuthoringPuzzles,
  gitPuzzlesFromService,
  mergeAuthoringSearchPuzzles,
  searchAuthoringPuzzles
} from "./authoringPuzzleSearch.js";
import {
  cataloguesForValidation,
  catalogueInputDocument,
  categoryInputDocument,
  getMergedCategory,
  knownPuzzleIds,
  listCategorySummaries,
  listMergedCatalogues,
  listMergedCategoryRecords,
  listMergedCategoryRegistry,
  loadCatalogueDocument,
  loadTaxonomyRows,
  previewCatalogueWrite,
  previewCategoryWrite,
  catalogueSummaryOf
} from "./authoringMcpTaxonomy.js";

const documentSchema = z.record(z.string(), z.unknown());
const authoringPhaseSchema = z.object({
  phase: z.enum(AUTHORING_PHASES).default("complete")
});
const authoringWorkflowTopicSchema = z.object({
  topic: z.enum(["pull-request-review", "catalogue"])
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
const catalogueEntrySchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1).max(1000).optional()
});

const catalogueDocumentSchema = z.object({
  id: draftIdSchema,
  title: z.string().min(1).max(200),
  info: infoSchema.optional(),
  entries: z.array(catalogueEntrySchema.extend({
    id: z.string().min(1).describe("A puzzle id that already exists in the authoring corpus."),
    reason: z.string().min(1).max(1000).optional()
      .describe("Why this puzzle belongs in this catalogue specifically -- an editorial choice, not a restatement of what the puzzle is about.")
  })).min(1)
}).strict();

const metaCatalogueDocumentSchema = z.object({
  id: draftIdSchema,
  title: z.string().min(1).max(200),
  kind: z.literal("meta"),
  info: infoSchema.optional(),
  showInLibrary: z.boolean().optional(),
  ordered: z.boolean().optional(),
  entries: z.array(catalogueEntrySchema.extend({
    id: z.string().min(1).describe("An existing non-meta catalogue id."),
    reason: z.string().min(1).max(1000).optional()
      .describe("Why this child catalogue belongs in this meta catalogue's primary sequence.")
  })).min(1),
  relatedCatalogues: z.object({
    info: infoSchema.optional(),
    entries: z.array(catalogueEntrySchema.extend({
      id: z.string().min(1).describe("An existing catalogue id to show as a related collection."),
      reason: z.string().min(1).max(1000).optional()
    })).min(1)
  }).strict().nullable().optional()
}).strict();

const categoryDocumentSchema = z.object({
  id: draftIdSchema,
  title: z.string().min(1).max(100),
  domain: z.enum(Object.keys(DOMAINS)).optional(),
  info: infoSchema.optional(),
  subcategories: z.record(draftIdSchema, z.object({
    title: z.string().min(1).max(100),
    info: infoSchema.optional()
  }).strict()).optional()
}).strict();

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
  const output = {
    error: error.message,
    ...(Array.isArray(error?.errors)
      ? { validationErrors: error.errors }
      : {})
  };
  return {
    content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
    isError: true
  };
}

function safe(handler) {
  // Forward the SDK ServerContext (second arg). Dropping it used to make
  // probe_mcp_client see null mcpReq/http even on hosted HTTP.
  return async (args, ctx) => {
    try {
      return await handler(args, ctx);
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
  const puzzleId = args?.draft_id || args?.puzzle_id ||
    (toolName === "create_puzzle_draft" ? args?.document?.id : null);
  if (puzzleId) return { type: "puzzle", id: puzzleId };

  if (CATALOGUE_DOCUMENT_TOOLS.has(toolName) && args?.id) {
    return { type: "catalogue", id: args.id };
  }
  if (args?.catalogue_id) return { type: "catalogue", id: args.catalogue_id };
  if ((toolName === "create_category" || toolName === "update_category") && args?.id) {
    return { type: "category", id: args.id };
  }

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
  if (toolName === "search_puzzles" && args?.category) {
    return { type: "category", id: args.category };
  }
  return { type: "global", id: "global" };
}

function track(analytics, toolName, handler) {
  return async (args, ctx) => {
    const result = await handler(args, ctx);
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

function serverInstructions({
  reviewUrl,
  reviewHint = "",
  checkoutInstall = false
}) {
  return "Use one accumulating simplified-puzzle draft. Start with get_authoring_guidance then " +
    "get_authoring_schema at phase=core — one call at a time, not in parallel (some stdio hosts, " +
    "including Codex, close the transport on concurrent tool calls). Then use review, pedagogy, " +
    "and publication as needed. " +
    "Retrieve the latest draft before every later pass, preserve earlier fields, and capture exact " +
    "links and citation details during the research that found them rather than rediscovering them. " +
    "Before create_puzzle_draft for a gap-fill or densify subject, call search_puzzles with 2-3 " +
    "planned anchor terms scoped to that category; if a hit already covers the distinction, extend " +
    "or relate instead of opening a parallel puzzle. search_puzzles covers the authoring corpus " +
    "and your drafts (a draft overlays the same id). Set full_text=true to search facts, lessons, " +
    "and other prose without a text: prefix. " +
    "To edit an existing published puzzle, open it from /admin/drafts or call " +
    "create_puzzle_draft with seed_from_published=true and that puzzle_id; do not open a " +
    "blank skeleton for a live id. " +
    "A phase is a focused projection, not a replacement format; omit phase (or use complete) whenever " +
    "the whole contract or guidance is needed. Phases are reusable concern areas, not one-way gates; " +
    "revisit pedagogy later to add a learning introduction without replacing existing lenses. " +
    "Draft write inputs stay deliberately permissive so incomplete or invalid intermediate drafts remain writable. " +
    "Drafts are private to the authenticated owner and hold one current document. " +
    "Retrieve the latest draft and pass its revision as expected_revision when saving. " +
    "Always validate_puzzle_draft before the human Publishes. MCP has no Publish tool — they Publish on `/admin/drafts/<id>`. " +
    submitAfterDraftReviewInstructions({
      reviewUrl,
      reviewHint,
      checkoutInstall
    }) +
    "submit_puzzle_for_publication is leftover GitHub-PR export, not D1 Publish: it creates a dedicated branch and pull request, never writes main, and merging stays a separate human GitHub action. Do not call it unless they ask. If the draft already has an open pull request, calling it again after an edit appends to that same pull request. " +
    "Associate a puzzle with categories on the draft (category / categories / subcategories) and with catalogues via get_catalogue then update_catalogue. Register new category metadata with create_category. Those writes are D1 working copies; the human Publishes on `/admin/categories` and `/admin/catalogues`. After a pull request opens, call get_workflow_guidance with topic=pull-request-review before using the review-loop tools. Call it with topic=catalogue before creating or replacing a catalogue or category. " +
    "preview_repository_import is optional GitHub-path preview, not a precondition." +
    (checkoutInstall
      ? " preview_import and install_puzzle are local checkout extensions. install_puzzle requires the exact unchanged preview token, draft revision, and confirm=true after explicit user approval."
      : "");
}

export function createAuthoringMcpServer({
  draftRepository,
  contentService,
  publicationService,
  actor,
  contentDocuments = null,
  analytics,
  serverName = "concept-clusters-hosted-authoring",
  reviewUrl = HOSTED_DRAFT_REVIEW_URL,
  reviewHint = "",
  checkoutInstall = false,
  clientProbeLogRoot = null,
  clientProbeTransport = checkoutInstall ? "stdio" : "hosted"
}) {
  if (!draftRepository) throw new Error("draftRepository is required");
  if (!contentService) throw new Error("contentService is required");
  if (!publicationService) throw new Error("publicationService is required");
  if (!actor?.subject) throw new Error("authenticated actor is required");

  async function persistContentDocument(kind, document) {
    if (typeof contentDocuments?.createDraft !== "function") {
      throw new Error("Category and catalogue working copies require D1 content documents.");
    }
    const record = kind === "category"
      ? await upsertCategoryDraft(contentDocuments, { document, actor })
      : await upsertCatalogueDraft(contentDocuments, { document, actor });
    if (!record?.revision) {
      throw new Error("Category and catalogue working copies require D1 content documents.");
    }
    return record;
  }

  async function persistCatalogueDocument(document) {
    return persistContentDocument("catalogue", document);
  }

  async function persistCategoryDocument(document) {
    return persistContentDocument("category", document);
  }

  async function taxonomyContext() {
    const rows = await loadTaxonomyRows(contentDocuments, actor);
    const gitPuzzles = gitPuzzlesFromService(contentService);
    return {
      ...rows,
      gitPuzzles,
      puzzleIds: knownPuzzleIds({
        gitPuzzles,
        publishedPuzzles: rows.publishedPuzzles
      }),
      catalogues: cataloguesForValidation(listMergedCatalogues({
        contentService,
        publishedCatalogues: rows.publishedCatalogues,
        catalogueDrafts: rows.catalogueDrafts
      })),
      categoryRegistry: listMergedCategoryRegistry({
        contentService,
        publishedCategories: rows.publishedCategories,
        categoryDrafts: rows.categoryDrafts
      }),
      existingCategories: listMergedCategoryRecords({
        contentService,
        publishedCategories: rows.publishedCategories,
        categoryDrafts: rows.categoryDrafts
      })
    };
  }

  async function authoringPuzzles() {
    return mergeAuthoringSearchPuzzles({
      gitPuzzles: gitPuzzlesFromService(contentService),
      publishedRows: await publishedPuzzleRows(),
      drafts: await ownerDrafts()
    });
  }

  async function publishedAuthoringPuzzles() {
    return mergeAuthoringSearchPuzzles({
      gitPuzzles: gitPuzzlesFromService(contentService),
      publishedRows: await publishedPuzzleRows()
    });
  }

  async function publishedPuzzleDocument(puzzleId) {
    const published = (await publishedPuzzleRows())
      .find(row => row.id === puzzleId && row.document);
    return published?.document || contentService.getPuzzleDocument(puzzleId);
  }

  function puzzleListSummary(puzzle) {
    return {
      id: puzzle.id,
      title: puzzle.title,
      category: puzzle.category,
      ...(puzzle.categories ? { categories: [...puzzle.categories] } : {}),
      ...(puzzle.subcategories ? { subcategories: { ...puzzle.subcategories } } : {}),
      large: puzzle.large === true,
      hasLenses: Boolean(puzzle.lenses?.length),
      hasLearningIntroduction: Boolean(puzzle.learningIntroduction)
    };
  }

  const recordStamp = typeof draftRepository.recordAssistanceStamp === "function"
    ? record => draftRepository.recordAssistanceStamp({ record, actor })
    : null;
  const stampLog = createMcpStampContext({
    analytics,
    transport: clientProbeTransport,
    actor
  });

  const tracked = (toolName, handler) => track(analytics, toolName, handler);

  async function publishedPuzzleRows() {
    if (typeof contentDocuments?.listPublished !== "function") return [];
    const rows = await contentDocuments.listPublished({ kind: "puzzle" });
    return Array.isArray(rows) ? rows : [];
  }

  async function ownerDrafts() {
    if (typeof draftRepository.list !== "function") return [];
    const rows = await draftRepository.list({
      actor,
      includeDocument: true,
      limit: 200
    });
    return Array.isArray(rows) ? rows : [];
  }

  const server = new McpServer(
    {
      name: serverName,
      version: AUTHORING_MCP_SERVER_VERSION
    },
    {
      instructions: serverInstructions({
        reviewUrl,
        reviewHint,
        checkoutInstall
      })
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

  for (const puzzle of contentService.puzzles || []) {
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
          text: JSON.stringify(await contentService.getPuzzleDocument(puzzle.id), null, 2)
        }]
      })
    );
  }

  server.registerTool("probe_mcp_client", {
    title: "Probe MCP client identity",
    description:
      "Return and log the calling MCP host identity from the request call frame (clientInfo / _meta). Call once per client when calibrating authorship attribution; pass label=cursor, codex, claude-code, gemini-cli, or claude-web.",
    inputSchema: z.object({
      label: z.string().min(1).max(100).optional()
    }),
    annotations: READ_ONLY
  }, tracked("probe_mcp_client", async (args, ctx) => {
    try {
      const record = buildMcpClientProbeRecord({
        transport: clientProbeTransport,
        ctx,
        server,
        actor,
        label: args?.label?.trim() || null
      });
      emitMcpClientProbe(record, { logRoot: clientProbeLogRoot });
      return success("Captured MCP client call frame.", { probe: record });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }));

  server.registerTool("list_puzzles", {
    title: "List puzzles",
    description: "List the current authoring puzzle corpus. Optionally filter by category or catalogue id.",
    inputSchema: z.object({
      category: z.string().min(1).optional(),
      catalogue_id: z.string().min(1).optional()
    }),
    annotations: READ_ONLY
  }, tracked("list_puzzles", safe(async ({ category, catalogue_id }) => {
    const taxonomy = await taxonomyContext();
    const puzzles = filterAuthoringPuzzles(
      await publishedAuthoringPuzzles(),
      {
        category: category || null,
        catalogueId: catalogue_id || null,
        catalogues: taxonomy.catalogues
      }
    ).map(puzzleListSummary);
    return success(`Found ${puzzles.length} authoring puzzles.`, { puzzles });
  })));

  server.registerTool("search_puzzles", {
    title: "Search puzzles and drafts",
    description:
      "Find puzzles whose title, board terms, tags, or (with full_text) prose match a query. " +
      "Searches the authoring corpus and your working copies; a draft overlays the same id. " +
      "Prefer category (or catalogue_id) when checking gap-fill overlap so results stay neighbor-sized. " +
      "Call this with 2-3 planned anchor terms before create_puzzle_draft when filling a category gap. " +
      "Set full_text=true to search facts, lessons, and other copy without a text: prefix.",
    inputSchema: z.object({
      query: z.string().min(1),
      category: z.string().min(1).optional(),
      catalogue_id: z.string().min(1).optional(),
      full_text: z.boolean().optional(),
      limit: z.number().int().min(1).max(25).optional()
    }),
    annotations: READ_ONLY
  }, tracked("search_puzzles", safe(async ({
    query,
    category,
    catalogue_id,
    full_text = false,
    limit = 10
  }) => {
    const taxonomy = await taxonomyContext();
    const puzzles = mergeAuthoringSearchPuzzles({
      gitPuzzles: taxonomy.gitPuzzles,
      publishedRows: taxonomy.publishedPuzzles,
      drafts: await ownerDrafts()
    });
    const result = searchAuthoringPuzzles(
      puzzles,
      taxonomy.categoryRegistry,
      {
        query,
        category: category || null,
        catalogueId: catalogue_id || null,
        catalogues: taxonomy.catalogues,
        fullText: full_text,
        limit
      }
    );
    const scope = category
      ? ` in ${category}`
      : catalogue_id
        ? ` in catalogue ${catalogue_id}`
        : "";
    const authoringResult = {
      ...result,
      matches: result.matches.map(({ source, ...match }) => match)
    };
    return success(
      `Found ${result.matches.length} puzzle match${result.matches.length === 1 ? "" : "es"}${scope}.`,
      authoringResult
    );
  })));

  server.registerTool("list_categories", {
    title: "List categories",
    description: "List the subject taxonomy with slugs, metadata-registration state, subcategories, and puzzle counts. Includes live D1 working copies and published rows, not only git.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, tracked("list_categories", safe(async () => {
    const taxonomy = await taxonomyContext();
    const categories = listCategorySummaries({
      contentService,
      puzzles: await authoringPuzzles(),
      publishedCategories: taxonomy.publishedCategories,
      categoryDrafts: taxonomy.categoryDrafts
    });
    return success(`Found ${categories.length} categories.`, { categories });
  })));

  server.registerTool("get_category", {
    title: "Get category",
    description: "Return one category's navigation metadata, subcategories, and puzzle counts, plus the D1/git document in update_category's input shape. Name may be the title puzzles store or the category slug.",
    inputSchema: z.object({ name: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_category", safe(async ({ name }) => {
    const taxonomy = await taxonomyContext();
    const category = getMergedCategory({
      contentService,
      puzzles: await authoringPuzzles(),
      name,
      publishedCategories: taxonomy.publishedCategories,
      categoryDrafts: taxonomy.categoryDrafts
    });
    const document = categoryInputDocument({
      name,
      contentService,
      publishedCategories: taxonomy.publishedCategories,
      categoryDrafts: taxonomy.categoryDrafts
    });
    return success(`Loaded category ${name}.`, {
      category,
      ...(document ? { document } : {})
    });
  })));

  server.registerTool("get_puzzle", {
    title: "Get puzzle",
    description: "Return one puzzle's current published authoring document.",
    inputSchema: z.object({ puzzle_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_puzzle", safe(async ({ puzzle_id }) => success(`Loaded ${puzzle_id}.`, {
    puzzleId: puzzle_id,
    document: await publishedPuzzleDocument(puzzle_id)
  }))));

  server.registerTool("get_catalogue", {
    title: "Get catalogue",
    description: "Return one catalogue document. Prefers your D1 working copy, then the D1 published row, then git. Ordinary catalogues return update_catalogue's input shape; meta catalogues return update_meta_catalogue's input shape.",
    inputSchema: z.object({ catalogue_id: z.string().min(1) }),
    annotations: READ_ONLY
  }, tracked("get_catalogue", safe(async ({ catalogue_id }) => {
    const loaded = await loadCatalogueDocument({
      contentDocuments,
      contentService,
      actor,
      catalogueId: catalogue_id
    });
    return success(`Loaded catalogue ${catalogue_id}.`, {
      catalogueId: catalogue_id,
      source: loaded.source,
      ...(loaded.revision != null ? { revision: loaded.revision } : {}),
      document: catalogueInputDocument(loaded.document)
    });
  })));

  server.registerTool("list_catalogues", {
    title: "List catalogues",
    description: "List curated catalogues with titles and entry counts, including D1 working copies and published rows. Call this before create_catalogue to check whether a suitable catalogue already exists, and before get_catalogue if the exact id isn't already known.",
    inputSchema: z.object({}),
    annotations: READ_ONLY
  }, tracked("list_catalogues", safe(async () => {
    const taxonomy = await taxonomyContext();
    const catalogues = listMergedCatalogues({
      contentService,
      publishedCatalogues: taxonomy.publishedCatalogues,
      catalogueDrafts: taxonomy.catalogueDrafts
    }).map(catalogueSummaryOf);
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

  server.registerTool("get_workflow_guidance", {
    title: "Get workflow guidance",
    description:
      "Return focused operational guidance for pull-request review or catalogue and category authoring. Request it only when entering that workflow.",
    inputSchema: authoringWorkflowTopicSchema,
    annotations: READ_ONLY
  }, tracked("get_workflow_guidance", safe(async ({ topic }) => success(
    `Loaded ${topic} workflow guidance.`,
    authoringWorkflowGuidanceResult(topic)
  ))));

  server.registerTool("create_puzzle_draft", {
    title: "Create puzzle draft",
    description:
      "Create a private durable draft from a supplied document or a minimal skeleton. Start simplified content with get_authoring_schema phase=core; retrieve and preserve that accumulating draft in later phases. This input is deliberately permissive because drafts may be incomplete. Set seed_from_published=true with puzzle_id to copy a published (or git-seeded) snapshot into a working copy without overwriting an existing draft.",
    inputSchema: z.object({
      draft_id: draftIdSchema.optional(),
      document: documentSchema.optional(),
      puzzle_id: draftIdSchema.optional(),
      title: z.string().min(1).optional(),
      category: z.string().min(1).optional(),
      seed_from_published: z.boolean().optional(),
      base_commit_sha: z.string().min(7).optional()
    }).superRefine((value, ctx) => {
      if (value.seed_from_published) {
        if (value.document) {
          ctx.addIssue({
            code: "custom",
            path: ["document"],
            message: "omit document when seed_from_published is true"
          });
        }
        if (!value.draft_id && !value.puzzle_id) {
          ctx.addIssue({
            code: "custom",
            path: ["puzzle_id"],
            message: "puzzle_id or draft_id is required when seed_from_published is true"
          });
        }
        return;
      }
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
  }, tracked("create_puzzle_draft", safe(async (args, ctx) => {
    if (args.seed_from_published) {
      const puzzleId = args.draft_id || args.puzzle_id;
      const { draft, created } = await openPuzzleWorkingCopy({
        getDraft: id => draftRepository.get({ draftId: id, actor }),
        createDraft: ({ draftId, document }) => draftRepository.create({
          draftId,
          document,
          actor,
          baseCommitSha: args.base_commit_sha || null
        }),
        contentDocuments,
        contentService,
        puzzleId
      });
      const draftId = draft.draftId || puzzleId;
      return success(
        created
          ? `Opened working copy ${draftId} from the published snapshot.`
          : `Working copy ${draftId} already exists.`,
        {
          draft: draftForAuthoring(draft),
          created
        }
      );
    }
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
    const { document: stamped, stampRecord } = stampDocumentAssistanceFromMcp(document, {
      ctx,
      server,
      role: "drafted",
      log: stampLog("create_puzzle_draft", args.draft_id || document?.id, document)
    });
    const draftId = args.draft_id || stamped.id;
    const draft = await draftRepository.create({
      draftId,
      document: stamped,
      actor,
      baseCommitSha: args.base_commit_sha || null
    });
    persistAuthoringAssistanceStamp(
      stampRecord && { ...stampRecord, draftId },
      { analytics, recordStamp }
    );
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
    const draft = draftForAuthoring(
      await draftRepository.get({ draftId: draft_id, actor })
    );
    return success(`Loaded draft ${draft_id} revision ${draft.revision}.`, { draft });
  })));

  server.registerTool("save_puzzle_draft", {
    title: "Save puzzle draft",
    description:
      "Replace the accumulating draft document using optimistic revision matching. Retrieve the latest revision and preserve fields from earlier authoring phases. This input remains permissive so invalid intermediate documents can be saved.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      expected_revision: z.number().int().positive(),
      document: documentSchema
    }),
    annotations: WRITE
  }, tracked("save_puzzle_draft", safe(async ({ draft_id, expected_revision, document }, ctx) => {
    const { document: stored, normalization } = documentForDraftStore(document);
    if (!stored) {
      throw new Error(
        "JSON-LD is not accepted for drafts. Use the simplified format. JSON-LD is interchange-only."
      );
    }
    const { document: stamped, stampRecord } = stampDocumentAssistanceFromMcp(stored, {
      ctx,
      server,
      role: "edited",
      log: stampLog("save_puzzle_draft", draft_id, stored)
    });
    const draft = await draftRepository.save({
      draftId: draft_id,
      expectedRevision: expected_revision,
      document: stamped,
      actor
    });
    persistAuthoringAssistanceStamp(
      stampRecord && { ...stampRecord, draftId: draft_id },
      { analytics, recordStamp }
    );
    return success(`Saved draft ${draft_id}; current revision is ${draft.revision}.`, {
      draft,
      ...(!normalization.document
        ? { normalization: { applied: false, errors: normalization.errors } }
        : {})
    });
  })));

  server.registerTool("list_puzzle_drafts", {
    title: "List puzzle drafts",
    description: "List private working-copy metadata for the authenticated owner. Optional status is leftover PR-ledger state (draft/submitted/…), not the publish-path badges on /admin/drafts.",
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
    description: "Delete this owner's working copy. Does not withdraw the D1 authoring-play row. Refuses if this draft has GitHub publication_requests history (get_publication_status still needs the row).",
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
    const stored = await draftRepository.get({ draftId: draft_id, actor });
    const taxonomy = await taxonomyContext();
    const validation = withStorageCanonicalizeFlags(
      stored.document,
      await contentService.validatePuzzleDraft(stored.document, {
        categoryRegistry: taxonomy.categoryRegistry
      })
    );
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
    description: "Optional: validate a draft's current document and show exact GitHub pull-request file effects against the current base commit, without writing anything. This is not D1 Publish. submit_puzzle_for_publication computes the same plan itself, so this isn't a required precondition — it's for a client that wants to see affected paths before opening a GitHub pull request.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      replace: z.boolean().default(false)
    }),
    annotations: EXTERNAL_READ
  }, tracked("preview_repository_import", safe(async ({
    draft_id,
    replace
  }) => {
    const result = await publicationService.preview({
      draftId: draft_id,
      replace,
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
    description: "Leftover GitHub-PR export, not D1 Publish. The human Publishes on /admin/drafts. Call this only if they ask: it validates the draft and creates a dedicated GitHub branch and pull request. Never writes the base branch; merging stays a separate human action. If this draft already has an open, unmerged pull request, resubmitting appends a generated commit to that same pull request. When a human or GitHub has committed review suggestions first, call sync_review_changes_to_draft before editing/resubmitting. Only a resubmission after the prior pull request was merged or closed opens a genuinely new one.",
    inputSchema: z.object({
      draft_id: draftIdSchema,
      replace: z.boolean().default(false)
    }),
    annotations: CREATE_EXTERNAL
  }, tracked("submit_puzzle_for_publication", safe(async args => {
    const publication = await publicationService.submit({
      draftId: args.draft_id,
      replace: args.replace,
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
    description: "Optional: validate a new catalogue document against authoring play and git puzzle ids without writing. create_catalogue runs the same checks, so this isn't a required precondition.",
    inputSchema: catalogueDocumentSchema,
    annotations: READ_ONLY
  }, tracked("preview_catalogue_creation", safe(async args => {
    const taxonomy = await taxonomyContext();
    const result = previewCatalogueWrite(args, {
      mode: "create",
      puzzleIds: taxonomy.puzzleIds,
      catalogues: taxonomy.catalogues
    });
    return success(
      result.valid
        ? `Previewed catalogue ${result.preview.catalogueId}; nothing was created.`
        : `Cannot preview catalogue creation because it has ${result.errors.length} errors.`,
      result
    );
  })));

  server.registerTool("create_catalogue", {
    title: "Create catalogue",
    description: "Save a new catalogue working copy to D1 (same rows /admin/catalogues uses). Does not open a GitHub pull request. Entry puzzle ids must already exist in authoring play or git. Call list_catalogues first. The human Publishes on /admin/catalogues.",
    inputSchema: catalogueDocumentSchema,
    annotations: CREATE
  }, tracked("create_catalogue", safe(async args => {
    const taxonomy = await taxonomyContext();
    const result = previewCatalogueWrite(args, {
      mode: "create",
      puzzleIds: taxonomy.puzzleIds,
      catalogues: taxonomy.catalogues
    });
    if (!result.valid) {
      return success(
        `Cannot create catalogue because it has ${result.errors.length} errors.`,
        { valid: false, errors: result.errors, catalogue: null }
      );
    }
    const record = await persistCatalogueDocument(result.preview.document);
    return success(
      `Saved catalogue working copy ${record.id}. Publish it on /admin/catalogues.`,
      { valid: true, errors: [], catalogue: record }
    );
  })));

  server.registerTool("preview_update_catalogue", {
    title: "Preview catalogue update",
    description: "Optional: validate a complete replacement document for an EXISTING catalogue without writing. Send the whole entries list, not just what changed. Entry puzzle ids must exist in authoring play or git. Meta catalogues aren't supported yet.",
    inputSchema: catalogueDocumentSchema,
    annotations: READ_ONLY
  }, tracked("preview_update_catalogue", safe(async args => {
    const taxonomy = await taxonomyContext();
    const result = previewCatalogueWrite(args, {
      mode: "update",
      puzzleIds: taxonomy.puzzleIds,
      catalogues: taxonomy.catalogues
    });
    return success(
      result.valid
        ? `Previewed catalogue ${result.preview.catalogueId}; nothing was changed.`
        : `Cannot preview catalogue update because it has ${result.errors.length} errors.`,
      result
    );
  })));

  server.registerTool("update_catalogue", {
    title: "Update catalogue",
    description: "Save the complete catalogue document to the D1 working copy (same rows /admin/catalogues uses). Does not open a GitHub pull request. Call get_catalogue first, then send it back with membership, title, or info changes. The human Publishes on /admin/catalogues.",
    inputSchema: catalogueDocumentSchema,
    annotations: WRITE
  }, tracked("update_catalogue", safe(async args => {
    const taxonomy = await taxonomyContext();
    const result = previewCatalogueWrite(args, {
      mode: "update",
      puzzleIds: taxonomy.puzzleIds,
      catalogues: taxonomy.catalogues
    });
    if (!result.valid) {
      return success(
        `Cannot update catalogue because it has ${result.errors.length} errors.`,
        { valid: false, errors: result.errors, catalogue: null }
      );
    }
    const record = await persistCatalogueDocument(result.preview.document);
    return success(
      `Saved catalogue working copy ${record.id}. Publish it on /admin/catalogues.`,
      { valid: true, errors: [], catalogue: record }
    );
  })));

  server.registerTool("update_meta_catalogue", {
    title: "Update meta catalogue",
    description: "Save a complete EXISTING meta-catalogue document to the D1 working copy (same rows /admin/catalogues uses). Its entries are existing non-meta catalogue ids, not puzzle ids. Call get_catalogue first and send the returned document back with changes; set relatedCatalogues to null to clear it. This tool cannot create or delete meta catalogues, and does not open a GitHub pull request.",
    inputSchema: metaCatalogueDocumentSchema,
    annotations: WRITE
  }, tracked("update_meta_catalogue", safe(async args => {
    const taxonomy = await taxonomyContext();
    const result = previewCatalogueWrite(args, {
      mode: "meta-update",
      puzzleIds: taxonomy.puzzleIds,
      catalogues: taxonomy.catalogues
    });
    if (!result.valid) {
      return success(
        `Cannot update meta catalogue because it has ${result.errors.length} errors.`,
        { valid: false, errors: result.errors, catalogue: null }
      );
    }
    const record = await persistCatalogueDocument(result.preview.document);
    return success(
      `Saved meta catalogue working copy ${record.id}. Publish it on /admin/catalogues.`,
      { valid: true, errors: [], catalogue: record }
    );
  })));

  server.registerTool("create_category", {
    title: "Create category",
    description: "Save a new category working copy to D1 (same rows /admin/categories uses). Title is the join string puzzles store on category / categories. Does not open a GitHub pull request. The human Publishes on /admin/categories.",
    inputSchema: categoryDocumentSchema,
    annotations: CREATE
  }, tracked("create_category", safe(async args => {
    const taxonomy = await taxonomyContext();
    const result = previewCategoryWrite(args, {
      mode: "create",
      existing: taxonomy.existingCategories
    });
    if (!result.valid) {
      return success(
        `Cannot create category because it has ${result.errors.length} errors.`,
        { valid: false, errors: result.errors, category: null }
      );
    }
    const record = await persistCategoryDocument(result.preview.document);
    return success(
      `Saved category working copy ${record.id}. Set puzzle.category to "${record.document.title}" if this puzzle belongs here, then Publish on /admin/categories.`,
      { valid: true, errors: [], category: record }
    );
  })));

  server.registerTool("update_category", {
    title: "Update category",
    description: "Save the complete category document to the D1 working copy (same rows /admin/categories uses). Does not open a GitHub pull request. Title remains the join string live puzzles store; renaming while puzzles still cite the old title is refused at Publish. The human Publishes on /admin/categories.",
    inputSchema: categoryDocumentSchema,
    annotations: WRITE
  }, tracked("update_category", safe(async args => {
    const taxonomy = await taxonomyContext();
    const result = previewCategoryWrite(args, {
      mode: "update",
      existing: taxonomy.existingCategories
    });
    if (!result.valid) {
      return success(
        `Cannot update category because it has ${result.errors.length} errors.`,
        { valid: false, errors: result.errors, category: null }
      );
    }
    const record = await persistCategoryDocument(result.preview.document);
    return success(
      `Saved category working copy ${record.id}. Publish it on /admin/categories.`,
      { valid: true, errors: [], category: record }
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

export function createHostedMcpAuthoringServer(options) {
  return createAuthoringMcpServer(options);
}

export {
  DESTRUCTIVE as MCP_DESTRUCTIVE,
  READ_ONLY as MCP_READ_ONLY,
  WRITE as MCP_WRITE,
  documentSchema as mcpDocumentSchema,
  draftIdSchema as mcpDraftIdSchema,
  safe as mcpSafe,
  success as mcpSuccess
};

export default createHostedMcpAuthoringServer;
