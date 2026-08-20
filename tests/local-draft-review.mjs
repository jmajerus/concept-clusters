import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import {
  createLocalDraftReviewHandler,
  mapDraftDetail,
  mapDraftListItem
} from "../modules/localDraftReview.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";

export const name = "local draft review: file-store mapping, live validation, and GET /admin/drafts";

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

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-local-review-"));
  try {
    const contentService = createContentInterchangeService();
    const draftStore = createPuzzleDraftStore({ directory });
    const knownPuzzleIds = new Set(contentService.listPuzzles().map(puzzle => puzzle.id));

    const incomplete = contentService.createPuzzleSkeleton({
      id: "incomplete-review-fixture",
      title: "Incomplete review fixture",
      category: "Science"
    });
    await draftStore.createDraft({
      draftId: "incomplete-review-fixture",
      document: incomplete
    });

    const energy = await contentService.getPuzzleJsonLd("energy-flow");
    await draftStore.createDraft({
      draftId: "energy-flow-review",
      document: energy
    });

    const listed = await draftStore.listDrafts();
    const incompleteMeta = listed.find(item => item.draftId === "incomplete-review-fixture");
    const installedMeta = listed.find(item => item.draftId === "energy-flow-review");
    assert.equal(mapDraftListItem(incompleteMeta, knownPuzzleIds).status, "draft");
    assert.equal(mapDraftListItem(incompleteMeta, knownPuzzleIds).inCurrentBundle, null);
    assert.equal(mapDraftListItem(installedMeta, knownPuzzleIds).status, "installed");
    assert.equal(mapDraftListItem(installedMeta, knownPuzzleIds).inCurrentBundle, true);

    const incompleteDetail = await mapDraftDetail(
      await draftStore.getDraft("incomplete-review-fixture"),
      { contentService, knownPuzzleIds }
    );
    assert.equal(incompleteDetail.validation.valid, false);
    assert.deepEqual(incompleteDetail.validation.flags, []);
    assert.equal(incompleteDetail.status, "draft");

    const installedDetail = await mapDraftDetail(
      await draftStore.getDraft("energy-flow-review"),
      { contentService, knownPuzzleIds }
    );
    assert.equal(installedDetail.validation.valid, true);
    assert.ok(Array.isArray(installedDetail.validation.flags));
    assert.equal(installedDetail.status, "installed");

    const handleRequest = createLocalDraftReviewHandler({ draftStore, contentService });

    const skipped = createResponse();
    assert.equal(await handleRequest({ method: "GET", url: "/index.html" }, skipped), false);
    assert.equal(skipped.headersSent, false);
    assert.equal(await handleRequest({ method: "POST", url: "/admin/drafts" }, skipped), false);

    const list = createResponse();
    assert.equal(await handleRequest({ method: "GET", url: "/admin/drafts" }, list), true);
    assert.equal(list.status, 200);
    assert.match(list.body, /incomplete-review-fixture/);
    assert.match(list.body, /energy-flow-review/);
    assert.match(list.body, /local MCP JSON drafts/);
    assert.match(list.body, /installed in this checkout/);

    const incompletePage = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/incomplete-review-fixture"
    }, incompletePage), true);
    assert.equal(incompletePage.status, 200);
    assert.match(incompletePage.body, /Validation failed/);
    assert.doesNotMatch(incompletePage.body, /symmetry flag/);
    assert.doesNotMatch(incompletePage.body, /installed in this checkout/);
    assert.match(incompletePage.body, />draft</);

    const installedPage = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, installedPage), true);
    assert.equal(installedPage.status, 200);
    assert.match(installedPage.body, /Validation passed/);
    assert.match(installedPage.body, /installed in this checkout/);
    assert.match(installedPage.body, />installed</);

    const missing = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/does-not-exist"
    }, missing), true);
    assert.equal(missing.status, 404);
    assert.match(missing.body, /Draft not found/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
