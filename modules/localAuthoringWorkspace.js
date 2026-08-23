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
    async create({ draftId, document }) {
      return draftStore.createDraft({ draftId, document });
    },
    async get({ draftId }) {
      const record = await draftStore.getDraft(draftId);
      return {
        ...record,
        id: record.draftId,
        contentHash: await draftContentHash(record.document)
      };
    },
    async save({ draftId, document, expectedRevision }) {
      return draftStore.replaceDraft({
        draftId,
        document,
        expectedRevision
      });
    },
    async list({ status = null, limit = 100, includeDocument = false } = {}) {
      const records = await draftStore.listDrafts({ includeDocument });
      return records
        .filter(record => !status || record.status === status)
        .slice(0, Math.max(1, Math.min(Number(limit) || 100, 200)));
    },
    async delete({ draftId }) {
      return draftStore.deleteDraft(draftId);
    },
    async recordValidation({ draftId, validation }) {
      return draftStore.recordValidation(draftId, validation);
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
