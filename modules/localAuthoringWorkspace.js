import { D1DraftRepository } from "./d1DraftRepository.js";
import { D1PublicationRepository } from "./d1PublicationRepository.js";
import { draftContentHash } from "./draftRepository.js";
import { createHttpD1Database } from "./httpD1Database.js";
import { resolveLocalD1Config, resolveLocalDraftActor } from "./localD1Config.js";
import { createLocalPublicationRepository } from "./localPublicationRepository.js";
import { createRepositoryDraftStore } from "./repositoryDraftStore.js";

export const LOCAL_PUBLICATION_ACTOR = Object.freeze({ subject: "local" });

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

export async function resolveLocalAuthoringWorkspace({
  env = process.env,
  repositoryRoot,
  draftStore = null,
  publicationDirectory = null,
  database = null,
  actor = null
} = {}) {
  if (draftStore) {
    const remnantActor = actor || LOCAL_PUBLICATION_ACTOR;
    return {
      actor: remnantActor,
      draftStore,
      draftRepository: createLocalDraftRepository(draftStore),
      publicationRepository: publicationDirectory
        ? createLocalPublicationRepository({ directory: publicationDirectory, draftStore })
        : null,
      draftKind: "local draft"
    };
  }
  const resolvedActor = actor || resolveLocalDraftActor({ env });
  const d1 = database || createHttpD1Database(
    await resolveLocalD1Config({ env, repositoryRoot })
  );
  const repository = new D1DraftRepository(d1);
  return {
    actor: resolvedActor,
    draftStore: createRepositoryDraftStore({ repository, actor: resolvedActor }),
    draftRepository: repository,
    publicationRepository: new D1PublicationRepository(d1),
    draftKind: "D1 draft"
  };
}

export default resolveLocalAuthoringWorkspace;
