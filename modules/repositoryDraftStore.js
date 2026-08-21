import { draftContentHash } from "./draftRepository.js";

function record(draft) {
  return {
    draftId: draft.draftId,
    puzzleId: draft.puzzleId ?? null,
    title: draft.title ?? null,
    status: draft.status,
    revision: draft.revision,
    contentHash: draft.contentHash,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    validation: draft.validation ?? null,
    document: draft.document
  };
}

// Adapts DraftRepository (D1DraftRepository) to the local MCP /admin/drafts
// draftStore shape. Checkout install does not change shared D1 status;
// D1PublicationRepository already marks submitted on pull-request writes.
export function createRepositoryDraftStore({ repository, actor }) {
  if (!repository) throw new Error("draft repository is required");
  if (!actor) throw new Error("draft actor is required");

  async function getDraft(draftId) {
    return record(await repository.get({ draftId, actor }));
  }

  return {
    async createDraft({ draftId, document }) {
      return record(await repository.create({ draftId, document, actor }));
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
    async listDrafts() {
      return repository.list({ actor });
    },
    async markInstalled(draftId) {
      return getDraft(draftId);
    },
    async markUninstalled(draftId) {
      return getDraft(draftId);
    },
    async markSubmitted(draftId) {
      return getDraft(draftId);
    },
    contentHash: draftContentHash
  };
}

export default createRepositoryDraftStore;
