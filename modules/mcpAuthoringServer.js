import { join } from "node:path";
import {
  createContentInterchangeService,
  DEFAULT_REPOSITORY_ROOT
} from "./contentInterchangeService.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import {
  LOCAL_PUBLICATION_ACTOR,
  resolveLocalAuthoringWorkspace
} from "./localAuthoringWorkspace.js";
import {
  LOCAL_AUTHORING_GUIDANCE,
  localAuthoringGuidance
} from "./authoringDesignGuidance.js";
import { resolveLocalDraftActor } from "./localD1Config.js";
import { createAuthoringMcpServer } from "./hostedMcpAuthoringServer.js";

export { LOCAL_AUTHORING_GUIDANCE };

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
  let resolved;
  const resolve = async () => {
    if (!resolved) resolved = await resolveRepository();
    return resolved;
  };
  const required = [
    "create",
    "get",
    "save",
    "list",
    "delete",
    "recordValidation",
    "recordAssistanceStamp"
  ];
  const optional = ["saveDomain", "materialize", "popWorkingCopy"];
  const facade = Object.fromEntries(required.map(method => [method, async (...args) => {
    const repository = await resolve();
    return repository[method](...args);
  }]));
  // Optional methods stay absent from typeof checks unless the resolved
  // repository implements them. Callers that need a capability probe use
  // supports() instead of typeof on the facade itself.
  for (const method of optional) {
    facade[method] = async (...args) => {
      const repository = await resolve();
      if (typeof repository[method] !== "function") {
        const error = new Error(`DraftRepository.${method} is not implemented`);
        error.code = "DRAFT_METHOD_UNSUPPORTED";
        throw error;
      }
      return repository[method](...args);
    };
  }
  facade.supports = async method => {
    const repository = await resolve();
    return typeof repository[method] === "function";
  };
  return facade;
}

function lazyContentDocuments(resolveRepository) {
  return Object.fromEntries([
    "createDraft",
    "saveDraft",
    "getDraft",
    "listDrafts",
    "getPublished",
    "listPublished",
    "publish",
    "seedPublishedIfAbsent",
    "revertDraft",
    "recordPuzzleAgentReview",
    "recordPuzzleHumanReview",
    "listPuzzleReviewEvents",
    "listPuzzleReviewIssues",
    "getPuzzleReviewIssue"
  ].map(method => [method, async (...args) => {
    const repository = await resolveRepository();
    if (!repository || typeof repository[method] !== "function") return null;
    return repository[method](...args);
  }]));
}

export function createConceptClustersMcpServer({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  draftDirectory = null,
  publicationDirectory = null,
  contentService = createContentInterchangeService({ repositoryRoot }),
  draftStore = null,
  contentDocuments = null,
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

  const sharedDraftRepository = lazyRepository(async () =>
    (await workspace()).draftRepository
  );
  const sharedContentDocuments = contentDocuments || lazyContentDocuments(async () =>
    (await workspace()).contentDocuments
  );
  const server = createAuthoringMcpServer({
    draftRepository: sharedDraftRepository,
    contentDocuments: sharedContentDocuments,
    contentService: localContentService(contentService),
    actor,
    serverName: "concept-clusters-authoring",
    clientProbeLogRoot: repositoryRoot,
    clientProbeTransport: "stdio",
    // A normal stdio server resolves its D1 adapter lazily from env, so
    // d1Database is usually null here even though content documents are
    // available. A file-backed draft remnant without an explicit D1 content
    // repository is intentionally unavailable for live MCP content reads.
    contentDocumentsConfigured: Boolean(contentDocuments) || !remnantDraftStore
  });

  return server;
}

export default createConceptClustersMcpServer;
