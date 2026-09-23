// Renaming a draft's puzzle id is a human admin fix on /admin/drafts, not an
// authoring action: an agent picked an over-long slug, or the title it was
// given was misspelled and the slug inherited the typo. There is deliberately
// no MCP tool for it. The rename is a copy to the new id followed by deletion
// of the old row, which needs no new repository primitive; the draft's
// working-copy history and assistance stamps stay behind with the old id.
//
// The guard that makes that safe is "never published": an id that has never
// been published cannot be the target of another puzzle's relatedPuzzles,
// because that reference would have failed validation. So a rename here has
// no inbound references to chase. Once a puzzle is in authoring play or in
// git, its id is an identity other rows may point at -- remove it from
// authoring play first, or treat the change as a migration.

import { publishedRowOrNull } from "./contentDocumentRepository.js";

export const RENAME_DRAFT_CONFIRM = "rename-draft";

const DRAFT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class DraftRenameError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DraftRenameError";
    this.status = status;
  }
}

export function parseRenameForm(params) {
  const value = params.get("new_id");
  return { newId: typeof value === "string" ? value.trim() : "" };
}

function isMissingDraft(error) {
  return error?.name === "DraftNotFoundError"
    || /not found|Unknown draft/i.test(String(error?.message || error));
}

async function draftExists(getDraft, draftId) {
  try {
    await getDraft(draftId);
    return true;
  } catch (error) {
    if (isMissingDraft(error)) return false;
    throw error;
  }
}

/**
 * True when this id already names a real puzzle -- a published D1 row
 * (including a withdrawn one, whose id is still spoken for until Freeze) or a
 * puzzle in the git corpus.
 *
 * The one definition of "this id is taken", shared by every path that can
 * bind a draft to an id: rename here, create_puzzle_draft over MCP, and the
 * New puzzle form on the drafts page. They refuse in the same terms because
 * they are refusing the same thing.
 */
export async function puzzleIdIsLive({ contentDocuments, contentService, puzzleId }) {
  if (typeof puzzleId !== "string" || !puzzleId) return false;
  if (contentService?.knownPuzzleIds?.has(puzzleId)) return true;
  if (contentService?.state?.puzzles?.some(item => item?.id === puzzleId)) return true;
  if (typeof contentDocuments?.getPublished !== "function") return false;
  return Boolean(await publishedRowOrNull(contentDocuments, "puzzle", puzzleId));
}

/**
 * Why a fresh draft may not be opened under a live id, in the words every
 * surface uses. `seeded` names the route that does work, which differs by
 * surface: an MCP caller passes a flag, a human clicks a link.
 */
export function shadowCreateRefusal(puzzleId, { seeded }) {
  return `"${puzzleId}" is already a published puzzle, so a fresh draft under `
    + `that id would shadow it rather than edit it. ${seeded}`;
}

export const SEEDED_ROUTE_MCP = "Call create_puzzle_draft with "
  + "seed_from_published=true and that puzzle_id to open a working copy from "
  + "the published snapshot, then save your document over it.";

export const SEEDED_ROUTE_ADMIN = "Open it from the puzzles list instead, "
  + "which starts a working copy from the published board; edit that.";

/**
 * Copy a never-published draft to a new puzzle id and delete the old row.
 *
 * @param {object} options
 * @param {string} options.draftId current draft id
 * @param {string} options.newId requested id
 * @param {(draftId: string) => Promise<object>} options.getDraft
 * @param {(input: { draftId: string, document: object }) => Promise<{ draftId: string }>} options.createDraft
 * @param {(draftId: string) => Promise<unknown>} options.deleteDraft
 * @param {((input: { draftId: string, layout: object }) => Promise<unknown>)=} options.saveLayout
 * @param {object=} options.contentDocuments
 * @param {object=} options.contentService
 * @returns {Promise<{ draftId: string }>} the created draft record
 */
export async function renamePuzzleDraftId({
  draftId,
  newId,
  getDraft,
  createDraft,
  deleteDraft,
  saveLayout = null,
  contentDocuments = null,
  contentService = null
}) {
  if (!DRAFT_ID_PATTERN.test(String(newId || ""))) {
    throw new DraftRenameError(
      "A puzzle id must be a lowercase URL-safe slug, like short-puzzle-name."
    );
  }
  const draft = await getDraft(draftId);
  const currentId = typeof draft.document?.id === "string"
    ? draft.document.id
    : draft.puzzleId || draftId;
  if (newId === draftId && newId === currentId) {
    throw new DraftRenameError(`This draft is already called ${newId}.`);
  }
  for (const existing of new Set([draftId, currentId])) {
    if (await puzzleIdIsLive({ contentDocuments, contentService, puzzleId: existing })) {
      throw new DraftRenameError(
        `${existing} is already published, so its id is an identity other puzzles `
        + "and catalogues may point at. Remove it from authoring play first, or "
        + "keep the id.",
        409
      );
    }
  }
  if (await puzzleIdIsLive({ contentDocuments, contentService, puzzleId: newId })) {
    throw new DraftRenameError(`${newId} is already a published puzzle.`, 409);
  }
  if (await draftExists(getDraft, newId)) {
    throw new DraftRenameError(`A draft called ${newId} already exists.`, 409);
  }
  if (!draft.document || typeof draft.document !== "object") {
    throw new DraftRenameError(`Draft ${draftId} has no document to rename.`);
  }
  // Create before deleting: a failure here leaves the original draft intact.
  const created = await createDraft({
    draftId: newId,
    document: { ...draft.document, id: newId }
  });
  if (draft.layout && typeof saveLayout === "function") {
    await saveLayout({ draftId: newId, layout: draft.layout });
  }
  await deleteDraft(draftId);
  return created;
}
