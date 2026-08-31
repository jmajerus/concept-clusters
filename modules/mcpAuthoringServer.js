import { join } from "node:path";
import * as z from "zod/v4";
import {
  createContentInterchangeService,
  DEFAULT_REPOSITORY_ROOT
} from "./contentInterchangeService.js";
import {
  ContentValidationError,
  createRepositoryPublicationService
} from "./repositoryPublicationService.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import {
  LOCAL_PUBLICATION_ACTOR,
  resolveLocalAuthoringWorkspace
} from "./localAuthoringWorkspace.js";
import {
  LOCAL_AUTHORING_GUIDANCE,
  localAuthoringGuidance,
  localDraftReviewHint,
  localDraftReviewUrl
} from "./authoringDesignGuidance.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { documentForDraftStore, documentForEditor } from "./authoredPuzzleDocument.js";
import { createLocalGitHubPublicationService } from "./localGitHubPublication.js";
import { resolveLocalDraftActor } from "./localD1Config.js";
import { stampDocumentAssistanceFromMcp } from "./mcpClientIdentity.js";
import { createMcpStampContext, persistAuthoringAssistanceStamp } from "./authoringAssistanceLog.js";
import {
  MCP_DESTRUCTIVE,
  MCP_READ_ONLY,
  MCP_WRITE,
  createAuthoringMcpServer,
  mcpDocumentSchema,
  mcpDraftIdSchema,
  mcpSafe,
  mcpSuccess
} from "./hostedMcpAuthoringServer.js";

export { LOCAL_AUTHORING_GUIDANCE };

const publicationMethods = Object.freeze([
  "preview",
  "submit",
  "previewCatalogueCreation",
  "createCatalogue",
  "previewUpdateCatalogue",
  "updateCatalogue",
  "status",
  "reviewFeedback",
  "applyReviewSuggestion",
  "replyToReviewComment",
  "resolveReviewFeedback",
  "syncReviewChangesToDraft",
  "prepareHumanReviewHandoff",
  "completeReviewRound",
  "resetReviewCircuit"
]);

const documentSourceSchema = z.object({
  draft_id: mcpDraftIdSchema.optional(),
  document: mcpDocumentSchema.optional()
}).refine(value => !!value.draft_id !== !!value.document, {
  message: "Provide exactly one of draft_id or document"
});

function remnantPath(env, name) {
  const value = env?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function localContentService(contentService) {
  return {
    ...contentService,
    guidance: localAuthoringGuidance(),
    get categories() {
      return contentService.categories || contentService.state?.categories || {};
    },
    get catalogues() {
      return contentService.catalogues || contentService.state?.catalogues || [];
    },
    get puzzles() {
      return contentService.puzzles || contentService.state?.puzzles || [];
    }
  };
}

function lazyRepository(resolveRepository) {
  return Object.fromEntries([
    "create",
    "get",
    "save",
    "list",
    "delete",
    "recordValidation",
    "recordAssistanceStamp"
  ].map(method => [method, async (...args) => {
    const repository = await resolveRepository();
    return repository[method](...args);
  }]));
}

function lazyPublicationService(resolveService) {
  return Object.fromEntries(publicationMethods.map(method => [
    method,
    async (...args) => {
      const service = await resolveService();
      if (typeof service[method] !== "function") {
        throw new Error(`GitHub publication service does not support ${method}`);
      }
      return service[method](...args);
    }
  ]));
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
  const remnantDraftDirectory = draftDirectory ||
    remnantPath(env, "CONCEPT_CLUSTERS_DRAFT_DIR");
  const remnantPublicationDirectory = publicationDirectory ||
    remnantPath(env, "CONCEPT_CLUSTERS_PUBLICATION_DIR") ||
    (remnantDraftDirectory
      ? join(remnantDraftDirectory, "publications")
      : null);
  const remnantDraftStore = draftStore ||
    (remnantDraftDirectory
      ? createPuzzleDraftStore({ directory: remnantDraftDirectory })
      : null);
  const actor = draftActor || (remnantDraftStore
    ? LOCAL_PUBLICATION_ACTOR
    : resolveLocalDraftActor({ env }));
  const checkoutPublisher = publicationService ||
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
        actor
      });
    }
    return workspacePromise;
  }

  async function drafts() {
    return (await workspace()).draftStore;
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

  const sharedDraftRepository = lazyRepository(async () =>
    (await workspace()).draftRepository
  );
  const sharedPublicationService = lazyPublicationService(githubService);
  const server = createAuthoringMcpServer({
    draftRepository: sharedDraftRepository,
    contentService: localContentService(contentService),
    publicationService: sharedPublicationService,
    actor,
    serverName: "concept-clusters-authoring",
    reviewUrl: localDraftReviewUrl(),
    reviewHint: localDraftReviewHint(),
    checkoutInstall: true,
    clientProbeLogRoot: repositoryRoot,
    clientProbeTransport: "stdio"
  });

  // Backward-compatible stdio alias. New clients should use the canonical
  // save_puzzle_draft name shared with hosted MCP.
  server.registerTool("replace_puzzle_draft", {
    title: "Replace puzzle draft (deprecated alias)",
    description:
      "Deprecated local alias for save_puzzle_draft. Replace the accumulating draft document using optimistic revision matching.",
    inputSchema: z.object({
      draft_id: mcpDraftIdSchema,
      expected_revision: z.number().int().positive(),
      document: mcpDocumentSchema
    }),
    annotations: MCP_WRITE
  }, mcpSafe(async ({ draft_id, expected_revision, document }, ctx) => {
    const { document: stored, normalization } = documentForDraftStore(document);
    if (!stored) {
      throw new ContentValidationError(
        "JSON-LD is not accepted for drafts",
        normalization.errors
      );
    }
    const { document: stamped, stampRecord } = stampDocumentAssistanceFromMcp(stored, {
      ctx,
      server,
      role: "edited",
      log: createMcpStampContext({ transport: "stdio", actor })(
        "replace_puzzle_draft",
        draft_id,
        stored
      )
    });
    const draft = await sharedDraftRepository.save({
      draftId: draft_id,
      expectedRevision: expected_revision,
      document: stamped,
      actor
    });
    persistAuthoringAssistanceStamp(
      stampRecord && { ...stampRecord, draftId: draft_id },
      {
        recordStamp: record => sharedDraftRepository.recordAssistanceStamp({
          record,
          actor
        })
      }
    );
    return mcpSuccess(
      `Saved draft ${draft_id}; current revision is ${draft.revision}.`,
      {
        draft,
        ...(!normalization.document
          ? { normalization: { applied: false, errors: normalization.errors } }
          : {})
      }
    );
  }));

  async function sourceDocument({ draft_id, document }) {
    return documentForEditor(
      draft_id
        ? (await sharedDraftRepository.get({ draftId: draft_id, actor })).document
        : document
    );
  }

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

  const previewInput = documentSourceSchema.extend({
    replace: z.boolean().default(false),
    catalogue_id: z.string().min(1).optional(),
    reason: z.string().min(1).optional()
  });

  server.registerTool("preview_import", {
    title: "Preview puzzle installation",
    description:
      "Local checkout extension: validate a draft or document and return exact repository paths plus an approval token without changing files.",
    inputSchema: previewInput,
    annotations: MCP_READ_ONLY
  }, mcpSafe(async args => {
    const puzzle = puzzleFromDraftDocument(await sourceDocument(args));
    const plan = await checkoutPublisher.planPuzzleFromModel(puzzle, {
      replace: args.replace,
      catalogueId: args.catalogue_id || null,
      reason: args.reason || null
    });
    return mcpSuccess(
      `Previewed ${plan.action} for ${plan.puzzle.id}; no files were changed.`,
      {
        puzzleId: plan.puzzle.id,
        action: plan.action,
        affectedPaths: plan.affectedPaths,
        approvalToken: plan.approvalToken
      }
    );
  }));

  server.registerTool("install_puzzle", {
    title: "Install approved puzzle",
    description:
      "Local checkout extension: transactionally install one validated draft after an exact preview. Requires the unchanged revision, preview token, confirm=true, and explicit user approval.",
    inputSchema: z.object({
      draft_id: mcpDraftIdSchema,
      expected_revision: z.number().int().positive(),
      preview_token: z.string().startsWith("sha256:"),
      replace: z.boolean().default(false),
      catalogue_id: z.string().min(1).optional(),
      reason: z.string().min(1).optional(),
      confirm: z.literal(true)
    }),
    annotations: MCP_DESTRUCTIVE
  }, mcpSafe(async args => {
    const store = await drafts();
    const draft = await store.getDraft(args.draft_id);
    if (draft.revision !== args.expected_revision) {
      throw new Error(
        `Draft revision conflict: expected ${args.expected_revision}, current revision is ${draft.revision}`
      );
    }
    const puzzle = puzzleFromDraftDocument(documentForEditor(draft.document));
    const plan = await checkoutPublisher.planPuzzleFromModel(puzzle, {
      replace: args.replace,
      catalogueId: args.catalogue_id || null,
      reason: args.reason || null
    });
    const result = await checkoutPublisher.applyPuzzleImport(plan, {
      approvalToken: args.preview_token
    });
    await store.markInstalled(args.draft_id);
    return mcpSuccess(
      `Installed puzzle ${result.puzzleId} transactionally.`,
      result
    );
  }));

  return server;
}

export default createConceptClustersMcpServer;
