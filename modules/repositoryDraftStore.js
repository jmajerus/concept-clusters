import { draftContentHash } from "./draftRepository.js";

function record(draft) {
  return {
    draftId: draft.draftId,
    puzzleId: draft.puzzleId ?? null,
    title: draft.title ?? null,
    status: draft.status,
    revision: draft.revision,
    contentHash: draft.contentHash,
    installedContentHash: draft.installedContentHash ?? null,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    workingCopyHistoryCount: Number(draft.workingCopyHistoryCount || 0),
    validation: draft.validation ?? null,
    layout: draft.layout ?? null,
    document: draft.document
  };
}

function unknownCheckoutColumn(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /installed_content_hash|no such column/i.test(message);
}

// Adapts DraftRepository (D1DraftRepository) to the local MCP /admin/drafts
// draftStore shape. D1 status stays the pull-request ledger. Checkout install
// records installed_content_hash so the local drafts page can tell that this
// revision was written to a working tree.
export function createRepositoryDraftStore({ repository, actor }) {
  if (!repository) throw new Error("draft repository is required");
  if (!actor) throw new Error("draft actor is required");

  async function getDraft(draftId) {
    return record(await repository.get({ draftId, actor }));
  }

  return {
    async createDraft({ draftId, document, seededFromPublished = false }) {
      return record(await repository.create({
        draftId,
        document,
        actor,
        seededFromPublished
      }));
    },
    getDraft,
    async replaceDraft({ draftId, document, expectedRevision }) {
      return record(await repository.save({
        draftId,
        document,
        actor,
        expectedRevision
      }));
    },
    async replaceDomain({ draftId, domain, projection, expectedRevision, provenance }) {
      if (typeof repository.saveDomain !== "function") {
        throw new Error("Draft repository does not support saveDomain");
      }
      return record(await repository.saveDomain({
        draftId,
        domain,
        projection,
        actor,
        expectedRevision,
        provenance
      }));
    },
    async materializeDraft(draftId) {
      if (typeof repository.materialize !== "function") {
        return getDraft(draftId);
      }
      return record(await repository.materialize({ draftId, actor }));
    },
    async popWorkingCopy({ draftId, expectedRevision }) {
      if (typeof repository.popWorkingCopy !== "function") {
        throw new Error("Working-copy history is not available.");
      }
      return record(await repository.popWorkingCopy({
        draftId,
        actor,
        expectedRevision
      }));
    },
    async listDrafts(options = {}) {
      return repository.list({ actor, ...options });
    },
    async deleteDraft(draftId) {
      return repository.delete({ draftId, actor });
    },
    async recordValidation(draftId, validation) {
      return repository.recordValidation({ draftId, validation, actor });
    },
    async saveLayout({ draftId, layout }) {
      if (typeof repository.saveLayout !== "function") {
        throw new Error("Draft layout storage is not available.");
      }
      return record(await repository.saveLayout({ draftId, layout, actor }));
    },
    async clearLayout(draftId) {
      if (typeof repository.clearLayout !== "function") {
        throw new Error("Draft layout storage is not available.");
      }
      return record(await repository.clearLayout({ draftId, actor }));
    },
    async markInstalled(draftId) {
      if (typeof repository.recordCheckoutInstall !== "function") {
        return getDraft(draftId);
      }
      try {
        return record(await repository.recordCheckoutInstall({ draftId, actor }));
      } catch (error) {
        if (!unknownCheckoutColumn(error)) throw error;
        return getDraft(draftId);
      }
    },
    async markUninstalled(draftId) {
      if (typeof repository.clearCheckoutInstall !== "function") {
        return getDraft(draftId);
      }
      try {
        return record(await repository.clearCheckoutInstall({ draftId, actor }));
      } catch (error) {
        if (!unknownCheckoutColumn(error)) throw error;
        return getDraft(draftId);
      }
    },
    async markSubmitted(draftId) {
      return getDraft(draftId);
    },
    contentHash: draftContentHash
  };
}

export default createRepositoryDraftStore;
