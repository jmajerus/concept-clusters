import { createGitHubPublicationService, GitHubRepositoryClient } from "./githubPublicationService.js";
import { resolveLocalGitHubConfig } from "./localGitHubConfig.js";
import {
  LOCAL_PUBLICATION_ACTOR,
  createLocalDraftRepository,
  resolveLocalAuthoringWorkspace
} from "./localAuthoringWorkspace.js";

export { LOCAL_PUBLICATION_ACTOR, createLocalDraftRepository };

function githubContentFacade(contentService) {
  return {
    validatePuzzleDraft: (...args) => contentService.validatePuzzleDraft(...args),
    get puzzles() { return contentService.state.puzzles; },
    get categories() { return contentService.state.categories; },
    get catalogues() { return contentService.state.catalogues; }
  };
}

export async function createLocalGitHubPublicationService({
  contentService,
  draftStore,
  publicationDirectory,
  draftRepository,
  publicationRepository,
  actor,
  database,
  draftKind,
  repositoryRoot,
  env = process.env,
  github = null,
  command
} = {}) {
  if (!contentService) {
    throw new Error("Local GitHub publication dependencies are required");
  }
  const resolved = (draftRepository && publicationRepository)
    ? {
        actor,
        draftRepository,
        publicationRepository,
        draftKind: draftKind || "D1 draft"
      }
    : await resolveLocalAuthoringWorkspace({
        env,
        repositoryRoot,
        draftStore,
        publicationDirectory,
        database,
        actor
      });
  if (!resolved.draftRepository || !resolved.publicationRepository) {
    throw new Error(
      "Local GitHub publication is not configured. File-backed remnant mode " +
      "needs a publication directory (CONCEPT_CLUSTERS_PUBLICATION_DIR or a " +
      "publications/ folder next to the remnant draft directory). The default " +
      "stdio path uses D1 publication_requests instead."
    );
  }
  const client = github || new GitHubRepositoryClient(
    await resolveLocalGitHubConfig({ env, repositoryRoot, command })
  );
  return createGitHubPublicationService({
    contentService: githubContentFacade(contentService),
    draftRepository: resolved.draftRepository,
    publicationRepository: resolved.publicationRepository,
    github: client,
    draftKind: resolved.draftKind || "D1 draft"
  });
}

export default createLocalGitHubPublicationService;
