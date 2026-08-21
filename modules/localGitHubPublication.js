import { createGitHubPublicationService, GitHubRepositoryClient } from "./githubPublicationService.js";
import { draftContentHash } from "./draftRepository.js";
import { createLocalPublicationRepository } from "./localPublicationRepository.js";
import { resolveLocalGitHubConfig } from "./localGitHubConfig.js";

export const LOCAL_PUBLICATION_ACTOR = Object.freeze({ subject: "local" });

function githubContentFacade(contentService) {
  return {
    validatePuzzleDraft: (...args) => contentService.validatePuzzleDraft(...args),
    get puzzles() { return contentService.state.puzzles; },
    get categories() { return contentService.state.categories; },
    get catalogues() { return contentService.state.catalogues; }
  };
}

export function createLocalDraftRepository(draftStore) {
  return {
    async get({ draftId }) {
      const record = await draftStore.getDraft(draftId);
      return {
        ...record,
        id: record.draftId,
        contentHash: await draftContentHash(record.document)
      };
    }
  };
}

export async function createLocalGitHubPublicationService({
  contentService,
  draftStore,
  publicationDirectory,
  repositoryRoot,
  env = process.env,
  github = null,
  command
} = {}) {
  if (!contentService || !draftStore || !publicationDirectory) {
    throw new Error("Local GitHub publication dependencies are required");
  }
  const client = github || new GitHubRepositoryClient(
    await resolveLocalGitHubConfig({ env, repositoryRoot, command })
  );
  return createGitHubPublicationService({
    contentService: githubContentFacade(contentService),
    draftRepository: createLocalDraftRepository(draftStore),
    publicationRepository: createLocalPublicationRepository({
      directory: publicationDirectory,
      draftStore
    }),
    github: client,
    draftKind: "local draft"
  });
}

export default createLocalGitHubPublicationService;
