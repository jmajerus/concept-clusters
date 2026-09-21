import { D1DraftRepository } from "./d1DraftRepository.js";
import { D1ContentDocumentRepository } from "./contentDocumentRepository.js";
import { draftContentHash } from "./draftRepository.js";
import { createHttpD1Database } from "./httpD1Database.js";
import { resolveLocalD1Config, resolveLocalDraftActor } from "./localD1Config.js";
import { createRepositoryDraftStore } from "./repositoryDraftStore.js";
import { createD1WikiLinkCheckStore } from "./wikiLinkCheckStore.js";
import { applyAuthoredDomain } from "./authoringDomains.js";

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
        // Keep an installed legacy SHA-256 marker stable until the draft is
        // edited. New or hashless records use the synchronous fingerprint.
        contentHash: record.contentHash || draftContentHash(record.document)
      };
    },
    async save({ draftId, document, expectedRevision }) {
      return draftStore.replaceDraft({
        draftId,
        document,
        expectedRevision
      });
    },
    async saveDomain({ draftId, domain, projection, expectedRevision, provenance }) {
      if (typeof draftStore.replaceDomain === "function") {
        return draftStore.replaceDomain({
          draftId,
          domain,
          projection,
          expectedRevision,
          provenance
        });
      }
      // Remnant stores without column-level updates: merge then full replace.
      const current = await draftStore.getDraft(draftId);
      let nextDocument = applyAuthoredDomain(current.document, domain, projection);
      if (provenance !== undefined) {
        nextDocument = { ...nextDocument, provenance };
      } else if (Object.prototype.hasOwnProperty.call(current.document, "provenance")) {
        nextDocument = {
          ...nextDocument,
          provenance: current.document.provenance
        };
      }
      return draftStore.replaceDraft({
        draftId,
        document: nextDocument,
        expectedRevision
      });
    },
    async materialize({ draftId }) {
      if (typeof draftStore.materializeDraft !== "function") {
        return this.get({ draftId });
      }
      return draftStore.materializeDraft(draftId);
    },
    async supports(method) {
      if (method === "saveDomain" || method === "materialize") return true;
      if (method === "popWorkingCopy") {
        return typeof draftStore.popWorkingCopy === "function";
      }
      return typeof this[method] === "function";
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
    },
    async recordAssistanceStamp({ record, actor: stampActor }) {
      if (typeof draftStore.recordAssistanceStamp !== "function") return null;
      return draftStore.recordAssistanceStamp({ record, actor: stampActor || actor });
    }
  };
}

export async function resolveLocalAuthoringWorkspace({
  env = process.env,
  repositoryRoot,
  draftStore = null,
  database = null,
  actor = null
} = {}) {
  if (draftStore) {
    const remnantActor = actor || LOCAL_PUBLICATION_ACTOR;
    return {
      actor: remnantActor,
      draftStore,
      draftRepository: createLocalDraftRepository(draftStore),
      contentDocuments: null,
      wikiLinkStore: null
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
    contentDocuments: new D1ContentDocumentRepository(d1),
    wikiLinkStore: createD1WikiLinkCheckStore(d1)
  };
}

export default resolveLocalAuthoringWorkspace;
