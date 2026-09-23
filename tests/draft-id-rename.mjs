import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createLocalDraftReviewHandler } from "../modules/localDraftReview.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { renamePuzzleDraftId } from "../modules/draftIdRename.js";
import { layoutDocumentForMode } from "../modules/layoutDocument.js";

export const name = "draft id rename: admin-only slug fix before publication";

function createResponse() {
  return {
    status: 0,
    headers: null,
    body: "",
    headersSent: false,
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
      this.headersSent = true;
    },
    end(body = "") {
      this.body = body;
    }
  };
}

function renameRequest(draftId, newId) {
  const body = new URLSearchParams({ confirm: "rename-draft", new_id: newId }).toString();
  return {
    method: "POST",
    url: `/admin/drafts/${encodeURIComponent(draftId)}`,
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(body);
    }
  };
}

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-rename-"));
  try {
    const contentService = createContentInterchangeService();
    const draftStore = createPuzzleDraftStore({ directory });
    const contentDocuments = createMemoryContentDocumentRepository();
    const handleRequest = createLocalDraftReviewHandler({
      draftStore,
      contentService,
      contentDocuments,
      repositoryRoot: contentService.repositoryRoot,
      publicationActor: { subject: "local" }
    });

    const longId = "an-excessively-long-agent-chosen-slug";
    await draftStore.createDraft({
      draftId: longId,
      document: contentService.createPuzzleSkeleton({
        id: longId,
        title: "Teh misspelled title",
        category: contentService.state.puzzles[0].category
      })
    });
    await draftStore.saveLayout({
      draftId: longId,
      layout: layoutDocumentForMode("sets", {
        schemaVersion: 1,
        puzzleId: longId,
        board: { width: 640, height: 460 },
        circles: {}
      })
    });

    // A never-published draft renames, document id and layout follow, and the
    // page redirects to the new id.
    const renamed = createResponse();
    assert.equal(await handleRequest(renameRequest(longId, "short-slug"), renamed), true);
    assert.equal(renamed.status, 303);
    assert.equal(renamed.headers.Location, "/admin/drafts/short-slug");
    const moved = await draftStore.getDraft("short-slug");
    assert.equal(moved.document.id, "short-slug");
    assert.equal(moved.document.title, "Teh misspelled title");
    assert.ok(moved.layout, "layout follows the rename");
    await assert.rejects(() => draftStore.getDraft(longId), /not found|Unknown draft|ENOENT/i);

    // The title is edited on its own; a rename does not touch it.
    assert.equal(moved.document.title, "Teh misspelled title");

    // A slug that is not URL-safe is refused before anything is written.
    const badSlug = createResponse();
    assert.equal(await handleRequest(renameRequest("short-slug", "Not A Slug"), badSlug), true);
    assert.equal(badSlug.status, 400);
    assert.match(badSlug.body, /lowercase URL-safe slug/);
    assert.ok(await draftStore.getDraft("short-slug"));

    // An id already used by a published puzzle is refused.
    const takenId = contentService.state.puzzles[0].id;
    const taken = createResponse();
    assert.equal(await handleRequest(renameRequest("short-slug", takenId), taken), true);
    assert.equal(taken.status, 409);
    assert.match(taken.body, /already a published puzzle/);
    assert.ok(await draftStore.getDraft("short-slug"));

    // A draft whose own id is already published keeps that id: it is an
    // identity other puzzles and catalogues may point at.
    await draftStore.createDraft({
      draftId: takenId,
      document: contentService.createPuzzleSkeleton({
        id: takenId,
        title: "Working copy of a live puzzle",
        category: contentService.state.puzzles[0].category
      })
    });
    const live = createResponse();
    assert.equal(await handleRequest(renameRequest(takenId, "some-new-slug"), live), true);
    assert.equal(live.status, 409);
    assert.match(live.body, /already published/);
    await assert.rejects(() => draftStore.getDraft("some-new-slug"), /not found|Unknown draft|ENOENT/i);

    // Renaming a draft onto an id another draft already holds is refused.
    await draftStore.createDraft({
      draftId: "occupied-slug",
      document: contentService.createPuzzleSkeleton({
        id: "occupied-slug",
        title: "Another draft",
        category: contentService.state.puzzles[0].category
      })
    });
    const collision = createResponse();
    assert.equal(await handleRequest(renameRequest("short-slug", "occupied-slug"), collision), true);
    assert.equal(collision.status, 409);
    assert.match(collision.body, /already exists/);
    assert.equal((await draftStore.getDraft("occupied-slug")).document.title, "Another draft");
    assert.ok(await draftStore.getDraft("short-slug"));
    // A rename copies from a snapshot and then removes the source. If a save
    // lands in between, the copy is stale and an unconditional delete would
    // carry that edit away with the row it was written to. The removal is a
    // compare-and-delete, so the rename refuses instead and moves nothing.
    await draftStore.createDraft({
      draftId: "raced-rename",
      document: contentService.createPuzzleSkeleton({
        id: "raced-rename",
        title: "Before the race",
        category: contentService.state.puzzles[0].category
      })
    });
    const beforeRace = await draftStore.getDraft("raced-rename");
    await draftStore.replaceDraft({
      draftId: "raced-rename",
      document: { ...beforeRace.document, title: "Edited mid-rename" },
      expectedRevision: beforeRace.revision
    });
    await assert.rejects(
      () => renamePuzzleDraftId({
        draftId: "raced-rename",
        newId: "raced-rename-renamed",
        // The stale snapshot a concurrent reader would have been holding.
        getDraft: async id => (id === "raced-rename"
          ? beforeRace
          : draftStore.getDraft(id)),
        createDraft: ({ draftId: id, document }) =>
          draftStore.createDraft({ draftId: id, document }),
        deleteDraft: (id, options) => draftStore.deleteDraft(id, options),
        contentDocuments,
        contentService
      }),
      /edited while the rename was in flight/
    );
    // The edit survives under the original id, and the rename rolled back.
    const afterRace = await draftStore.getDraft("raced-rename");
    assert.equal(afterRace.document.title, "Edited mid-rename");
    await assert.rejects(
      () => draftStore.getDraft("raced-rename-renamed"),
      /not found|Unknown draft|ENOENT/i,
      "a refused rename leaves no half-made copy"
    );

    // The New puzzle form refuses a live id on the same terms create_puzzle_draft
    // does over MCP: a blank skeleton under a published id shadows that board.
    const formBody = new URLSearchParams({
      confirm: "create-draft",
      id: takenId,
      title: "Blank shadow from the form",
      category: contentService.state.puzzles[0].category
    }).toString();
    const shadowForm = createResponse();
    assert.equal(await handleRequest({
      method: "POST",
      url: "/admin/drafts",
      headers: {
        origin: "http://127.0.0.1:8787",
        host: "127.0.0.1:8787",
        "content-type": "application/x-www-form-urlencoded"
      },
      async *[Symbol.asyncIterator]() { yield Buffer.from(formBody); }
    }, shadowForm), true);
    assert.equal(shadowForm.status, 409);
    assert.match(shadowForm.body, /already a published puzzle/);
    assert.match(shadowForm.body, /Open it from the puzzles list/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
