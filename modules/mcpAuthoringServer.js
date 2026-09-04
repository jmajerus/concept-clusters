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
  localAuthoringGuidance,
  localDraftReviewHint,
  localDraftReviewUrl
} from "./authoringDesignGuidance.js";
import { createLocalGitHubPublicationService } from "./localGitHubPublication.js";
import { resolveLocalDraftActor } from "./localD1Config.js";
import { createAuthoringMcpServer } from "./hostedMcpAuthoringServer.js";

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
    "revertDraft"
  ].map(method => [method, async (...args) => {
    const repository = await resolveRepository();
    if (!repository || typeof repository[method] !== "function") return null;
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
  const sharedContentDocuments = lazyContentDocuments(async () =>
    (await workspace()).contentDocuments
  );
  const sharedPublicationService = lazyPublicationService(githubService);
  const server = createAuthoringMcpServer({
    draftRepository: sharedDraftRepository,
    contentDocuments: sharedContentDocuments,
    contentService: localContentService(contentService),
    publicationService: sharedPublicationService,
    actor,
    serverName: "concept-clusters-authoring",
    reviewUrl: localDraftReviewUrl(),
    reviewHint: localDraftReviewHint(),
    clientProbeLogRoot: repositoryRoot,
    clientProbeTransport: "stdio"
  });

  return server;
}

export default createConceptClustersMcpServer;
