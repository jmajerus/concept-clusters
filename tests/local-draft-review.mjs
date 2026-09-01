import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import {
  createLocalDraftReviewHandler,
  draftMatchesCheckout,
  fetchLocalDraftReview,
  mapDraftDetail,
  mapDraftListItem,
  puzzleInCheckout,
  readCheckoutDocument
} from "../modules/localDraftReview.js";
import { puzzleToSimplified } from "../modules/puzzleSimplified.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { storedDocumentNeedsCanonicalSave } from "../modules/authoredPuzzleDocument.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";

export const name = "local draft review: file-store mapping, live validation, and GET /admin/drafts";

function jsonRequest(url, { method = "POST", origin, host, body }) {
  return {
    method,
    url,
    headers: {
      origin,
      host,
      "content-type": "application/json"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(body));
    }
  };
}

function postRequest(url, { origin, host, body }) {
  return {
    method: "POST",
    url,
    headers: {
      origin,
      host,
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(body);
    }
  };
}

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
    const repositoryRoot = contentService.repositoryRoot;
    const draftStore = createPuzzleDraftStore({ directory });

    const incomplete = contentService.createPuzzleSkeleton({
      id: "incomplete-review-fixture",
      title: "Incomplete review fixture",
      category: "Science"
    });
    await draftStore.createDraft({
      draftId: "incomplete-review-fixture",
      document: incomplete
    });

    const energyPuzzle = contentService.state.puzzles.find(puzzle => puzzle.id === "energy-flow");
    await draftStore.createDraft({
      draftId: "energy-flow-review",
      document: puzzleToSimplified(energyPuzzle)
    });
    await draftStore.createDraft({
      draftId: "submitted-review-fixture",
      document: {
        ...puzzleToSimplified(energyPuzzle),
        id: "submitted-review-fixture",
        title: "Submitted review fixture"
      }
    });

    assert.equal(await puzzleInCheckout(repositoryRoot, "energy-flow"), true);
    assert.equal(await puzzleInCheckout(repositoryRoot, "incomplete-review-fixture"), false);
    const energyCheckout = await readCheckoutDocument(repositoryRoot, "energy-flow");
    assert.equal(draftMatchesCheckout(puzzleToSimplified(energyPuzzle), energyCheckout), true);
    assert.equal(draftMatchesCheckout(incomplete, energyCheckout), false);

    const listed = await draftStore.listDrafts();
    const incompleteMeta = listed.find(item => item.draftId === "incomplete-review-fixture");
    const existingMeta = listed.find(item => item.draftId === "energy-flow-review");
    // Existing puzzle ids stay "draft" until install_puzzle records it --
    // same lifecycle as a hosted draft that is not yet submitted.
    assert.equal(mapDraftListItem(incompleteMeta, { inCheckout: false }).status, "draft");
    assert.equal(mapDraftListItem(incompleteMeta, { inCheckout: false }).inCurrentBundle, null);
    assert.equal(mapDraftListItem(existingMeta, { inCheckout: true }).status, "draft");
    assert.equal(mapDraftListItem(existingMeta, { inCheckout: true }).inCurrentBundle, null);
    assert.equal(mapDraftListItem(existingMeta, { inCheckout: true }).publicationStatus, "draft");

    await draftStore.markInstalled("energy-flow-review");
    const installedMeta = (await draftStore.listDrafts())
      .find(item => item.draftId === "energy-flow-review");
    assert.equal(installedMeta.installedContentHash, installedMeta.contentHash);
    assert.equal(mapDraftListItem(installedMeta, {
      inCheckout: true,
      hasLocalChanges: true
    }).status, "installed");
    assert.equal(mapDraftListItem(installedMeta, {
      inCheckout: true,
      hasLocalChanges: false,
      aheadOfUpstream: true
    }).status, "committed");
    assert.equal(mapDraftListItem(installedMeta, {
      inCheckout: true,
      hasLocalChanges: false,
      aheadOfUpstream: false
    }).status, "published");
    assert.equal(mapDraftListItem(installedMeta, { inCheckout: true }).status, "installed");
    assert.equal(mapDraftListItem(installedMeta, { inCheckout: true }).inCurrentBundle, true);
    assert.equal(mapDraftListItem(installedMeta, { inCheckout: true }).publicationStatus, "installed");

    const d1Style = {
      draftId: "d1-style",
      status: "draft",
      contentHash: "sha256:aaa",
      installedContentHash: "sha256:aaa"
    };
    assert.equal(mapDraftListItem(d1Style, {
      inCheckout: true,
      hasLocalChanges: false,
      aheadOfUpstream: false
    }).status, "published");
    assert.equal(mapDraftListItem(d1Style, {
      inCheckout: true,
      hasLocalChanges: false,
      aheadOfUpstream: false
    }).publicationStatus, "draft");
    assert.equal(mapDraftListItem({
      draftId: "matches-checkout",
      status: "draft"
    }, {
      inCheckout: true,
      hasLocalChanges: false,
      aheadOfUpstream: false,
      matchesCheckout: true
    }).status, "published");
    assert.equal(mapDraftListItem({
      ...d1Style,
      contentHash: "sha256:bbb"
    }, { inCheckout: true }).status, "draft");
    assert.equal(mapDraftListItem({
      ...d1Style,
      contentHash: "sha256:aaa",
      installedContentHash: "sha256:aaa"
    }, {
      inCheckout: true,
      hasLocalChanges: false,
      aheadOfUpstream: false,
      matchesCheckout: false
    }).status, "published");
    assert.equal(mapDraftListItem({
      ...d1Style,
      contentHash: "sha256:aaa",
      installedContentHash: "sha256:aaa"
    }, {
      inCheckout: true,
      hasLocalChanges: false,
      aheadOfUpstream: false,
      matchesCheckout: false
    }).inCurrentBundle, true);

    await draftStore.markSubmitted("submitted-review-fixture");
    const submittedMeta = (await draftStore.listDrafts())
      .find(item => item.draftId === "submitted-review-fixture");
    assert.equal(mapDraftListItem(submittedMeta, { inCheckout: false }).status, "draft");
    assert.equal(mapDraftListItem(submittedMeta, { inCheckout: false }).publicationStatus, "submitted");
    assert.equal(mapDraftListItem(submittedMeta, { inCheckout: false }).inCurrentBundle, null);

    await draftStore.markInstalled("incomplete-review-fixture");
    const markedIncomplete = (await draftStore.listDrafts())
      .find(item => item.draftId === "incomplete-review-fixture");
    assert.equal(mapDraftListItem(markedIncomplete, { inCheckout: false }).status, "draft");
    assert.equal(mapDraftListItem(markedIncomplete, { inCheckout: false }).inCurrentBundle, null);
    assert.equal(mapDraftListItem(markedIncomplete, { inCheckout: false }).publicationStatus, "installed");

    const incompleteDetail = await mapDraftDetail(
      await draftStore.getDraft("incomplete-review-fixture"),
      { contentService, inCheckout: false }
    );
    assert.equal(incompleteDetail.validation.valid, false);
    assert.deepEqual(incompleteDetail.validation.flags, []);
    assert.equal(incompleteDetail.status, "draft");
    assert.equal(incompleteDetail.inCurrentBundle, null);
    assert.equal(incompleteDetail.alreadyPublished, false);

    const installedDetail = await mapDraftDetail(
      await draftStore.getDraft("energy-flow-review"),
      { contentService, inCheckout: true }
    );
    assert.equal(installedDetail.validation.valid, true);
    assert.ok(Array.isArray(installedDetail.validation.flags));
    assert.ok(
      installedDetail.validation.flags.some(flag => flag.id === "save-to-canonicalize")
    );
    assert.equal(installedDetail.status, "installed");
    assert.equal(installedDetail.alreadyPublished, true);
    const vsPublishedSnapshot = await mapDraftDetail(
      await draftStore.getDraft("energy-flow-review"),
      {
        contentService,
        inCheckout: true,
        publishedDocument: (await draftStore.getDraft("energy-flow-review")).document
      }
    );
    assert.equal(vsPublishedSnapshot.publishedDiff.total, 0);

    const afterUninstall = await draftStore.markUninstalled("energy-flow-review");
    assert.equal(afterUninstall.status, "draft");
    assert.equal(afterUninstall.installedAt, null);
    await draftStore.markInstalled("energy-flow-review");

    const handleRequest = createLocalDraftReviewHandler({
      draftStore,
      contentService,
      repositoryRoot,
      workingTreeAheadOfUpstream: () => null
    });

    const skipped = createResponse();
    assert.equal(await handleRequest({ method: "GET", url: "/index.html" }, skipped), false);
    assert.equal(skipped.headersSent, false);
    const createDenied = createResponse();
    assert.equal(await handleRequest({ method: "POST", url: "/admin/drafts" }, createDenied), true);
    assert.equal(createDenied.status, 403);

    const list = createResponse();
    assert.equal(await handleRequest({ method: "GET", url: "/admin/drafts" }, list), true);
    assert.equal(list.status, 200);
    assert.match(list.body, /incomplete-review-fixture/);
    assert.match(list.body, /energy-flow-review/);
    assert.match(list.body, /One path/);
    assert.match(list.body, /value="refresh-github-production"/);
    assert.doesNotMatch(list.body, /this draft is in this checkout/);
    assert.doesNotMatch(list.body, />Checkout</);
    assert.match(list.body, />GitHub</);
    assert.doesNotMatch(list.body, /class="badge">submitted</);
    assert.match(list.body, /New puzzle opens a blank board/);
    assert.doesNotMatch(list.body, /Open existing puzzle/);
    assert.doesNotMatch(list.body, /confirm" value="open-existing-draft"/);
    assert.match(list.body, /<h1>Puzzles<\/h1>/);
    assert.match(list.body, /Working copies/);
    assert.match(list.body, /By category/);
    assert.match(list.body, /value="recent"/);
    assert.match(list.body, /data-puzzle-id="energy-flow"/);
    assert.match(list.body, /href="\/admin\/drafts\/energy-flow-review"/);
    assert.match(list.body, /data-working-copy="0"/);
    assert.match(list.body, /→ Freeze/);
    assert.doesNotMatch(list.body, /open a GitHub pull request/);
    assert.match(list.body, /href="\/\?draft=energy-flow-review&amp;view=play"/);
    assert.match(list.body, /href="\/\?draft=incomplete-review-fixture&amp;view=play"/);

    const incompletePage = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/incomplete-review-fixture"
    }, incompletePage), true);
    assert.equal(incompletePage.status, 200);
    assert.match(incompletePage.body, /Validation failed/);
    assert.doesNotMatch(incompletePage.body, /authoring flag/);
    assert.match(incompletePage.body, /badge-warn">working copy</);
    assert.doesNotMatch(incompletePage.body, /badge-ok">authoring play</);
    assert.doesNotMatch(incompletePage.body, />draft</);
    assert.match(incompletePage.body, /<copy-field>/);
    assert.match(incompletePage.body, /confirm" value="save-field"/);
    assert.doesNotMatch(incompletePage.body, /this draft is not in this checkout/);
    assert.doesNotMatch(incompletePage.body, />installed</);
    assert.match(incompletePage.body, /class="play-button" disabled/);
    assert.match(incompletePage.body, /Open board/);
    assert.match(incompletePage.body, /href="\/\?draft=incomplete-review-fixture"/);

    const installedPage = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, installedPage), true);
    assert.equal(installedPage.status, 200);
    assert.match(installedPage.body, /Validation passed/);
    assert.match(installedPage.body, /badge-warn">working copy</);
    assert.doesNotMatch(installedPage.body, /this draft is in this checkout/);
    assert.doesNotMatch(installedPage.body, />installed</);
    assert.doesNotMatch(installedPage.body, /already published/);
    assert.doesNotMatch(installedPage.body, /name="replace"/);
    assert.doesNotMatch(installedPage.body, /Export to player/);
    assert.match(installedPage.body, /No changes from the published puzzle/);
    assert.doesNotMatch(installedPage.body, /Use published wording/);
    assert.match(installedPage.body, /Save it to persist the current schema/);
    assert.match(installedPage.body, /Save canonical form/);
    assert.doesNotMatch(installedPage.body, /Replace the published puzzle/);
    assert.match(installedPage.body, /href="\/\?draft=energy-flow-review"/);
    assert.match(installedPage.body, /href="\/\?draft=energy-flow-review&amp;view=play"/);
    assert.doesNotMatch(installedPage.body, /install-and-play/);

    const playJson = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow-review/play.json"
    }, playJson), true);
    assert.equal(playJson.status, 200);
    assert.match(playJson.headers["Content-Type"], /application\/json/);
    const playPayload = JSON.parse(playJson.body);
    assert.equal(playPayload.draftId, "energy-flow-review");
    assert.equal(playPayload.puzzle.id, "energy-flow");
    assert.ok(Array.isArray(playPayload.puzzle.clusters));
    assert.equal(typeof playPayload.revision, "number");

    const incompletePlay = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/incomplete-review-fixture/play.json"
    }, incompletePlay), true);
    assert.equal(incompletePlay.status, 400);
    const incompletePayload = JSON.parse(incompletePlay.body);
    assert.equal(incompletePayload.draftId, "incomplete-review-fixture");
    assert.ok(Array.isArray(incompletePayload.errors));
    assert.ok(incompletePayload.errors.length > 0);

    const missingPlay = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/does-not-exist/play.json"
    }, missingPlay), true);
    assert.equal(missingPlay.status, 404);

    const energyBeforeCanonical = await draftStore.getDraft("energy-flow-review");
    assert.ok(storedDocumentNeedsCanonicalSave(energyBeforeCanonical.document));
    const canonicalSave = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1",
      host: "127.0.0.1",
      body: `confirm=save-canonical-form&expected_revision=${energyBeforeCanonical.revision}`
    }), canonicalSave), true);
    assert.equal(canonicalSave.status, 303);
    assert.equal(canonicalSave.headers.Location, "/admin/drafts/energy-flow-review");

    const energyAfterCanonical = await draftStore.getDraft("energy-flow-review");
    assert.equal(energyAfterCanonical.revision, energyBeforeCanonical.revision + 1);
    assert.equal(storedDocumentNeedsCanonicalSave(energyAfterCanonical.document), false);

    const canonicalizedPage = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, canonicalizedPage), true);
    assert.doesNotMatch(canonicalizedPage.body, /Save it to persist the current schema/);
    assert.doesNotMatch(canonicalizedPage.body, /Save canonical form/);

    const missing = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/does-not-exist"
    }, missing), true);
    assert.equal(missing.status, 404);
    assert.match(missing.body, /Draft not found/);

    const seedId = contentService.state.puzzles.find(puzzle =>
      puzzle.id !== "energy-flow"
      && puzzle.id !== "incomplete-review-fixture"
      && puzzle.id !== "submitted-review-fixture"
    )?.id;
    assert.ok(seedId);
    const seeded = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: `/admin/drafts/${seedId}`
    }, seeded), true);
    assert.equal(seeded.status, 200);
    assert.match(seeded.body, new RegExp(seedId));

    const fetched = await fetchLocalDraftReview(
      new Request("http://127.0.0.1/admin/drafts"),
      { handleRequest }
    );
    assert.equal(fetched.status, 200);
    assert.match(await fetched.text(), /energy-flow-review/);

    const contentDocuments = createMemoryContentDocumentRepository();
    const handlePublish = createLocalDraftReviewHandler({
      draftStore,
      contentService,
      contentDocuments,
      repositoryRoot,
      workingTreeAheadOfUpstream: () => null,
      publicationActor: { subject: "local" }
    });
    const published = createResponse();
    assert.equal(await handlePublish(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=publish"
    }), published), true);
    assert.equal(published.status, 200);
    assert.match(published.body, /Published/);
    const afterPublishGet = createResponse();
    assert.equal(await handlePublish({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, afterPublishGet), true);
    assert.equal(afterPublishGet.status, 200);
    assert.match(afterPublishGet.body, /value="publish" disabled/);
    assert.doesNotMatch(afterPublishGet.body, /value="revert-published"/);
    assert.match(afterPublishGet.body, /value="unpublish"/);
    const live = await contentDocuments.getPublished({ kind: "puzzle", id: "energy-flow" });
    assert.equal(live.document.id, "energy-flow");
    assert.equal(live.cuedForFreezeAt, null);

    const markedReady = createResponse();
    assert.equal(await handlePublish(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=cue-for-freeze"
    }), markedReady), true);
    assert.equal(markedReady.status, 303);
    const ready = await contentDocuments.getPublished({ kind: "puzzle", id: "energy-flow" });
    assert.ok(ready.cuedForFreezeAt);

    const invalidPublish = createResponse();
    assert.equal(await handlePublish(postRequest("/admin/drafts/incomplete-review-fixture", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=publish"
    }), invalidPublish), true);
    assert.equal(invalidPublish.status, 400);

    const submitted = [];
    const handleSubmit = createLocalDraftReviewHandler({
      draftStore,
      contentService,
      repositoryRoot,
      workingTreeAheadOfUpstream: () => null,
      publicationActor: { subject: "local" },
      submitDraft: async args => {
        submitted.push(args);
        return {
          githubPrNumber: 7,
          githubPrUrl: "https://github.com/example/concept-clusters/pull/7",
          submissionOutcome: "opened"
        };
      }
    });
    const crossOrigin = createResponse();
    assert.equal(await handleSubmit(postRequest("/admin/drafts/energy-flow-review", {
      origin: "https://evil.example",
      host: "127.0.0.1:8787",
      body: "confirm=open-pull-request"
    }), crossOrigin), true);
    assert.equal(crossOrigin.status, 403);
    assert.equal(submitted.length, 0);

    const missingConfirm = createResponse();
    assert.equal(await handleSubmit(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "foo=bar"
    }), missingConfirm), true);
    assert.equal(missingConfirm.status, 400);
    assert.equal(submitted.length, 0);

    const incompleteRecord = await draftStore.getDraft("incomplete-review-fixture");
    const savedCopy = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/incomplete-review-fixture", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: new URLSearchParams({
        confirm: "save-field",
        expected_revision: String(incompleteRecord.revision),
        section: "puzzle",
        field: "title",
        value: "Edited incomplete title"
      }).toString()
    }), savedCopy), true);
    assert.equal(savedCopy.status, 303);
    assert.equal(savedCopy.headers.Location, "/admin/drafts/incomplete-review-fixture");
    const afterSave = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/incomplete-review-fixture"
    }, afterSave), true);
    assert.match(afterSave.body, /Edited incomplete title/);
    const savedRecord = await draftStore.getDraft("incomplete-review-fixture");
    assert.deepEqual(savedRecord.document.generativeAssistance, incompleteRecord.document.generativeAssistance);

    const conflict = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/incomplete-review-fixture", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: new URLSearchParams({
        confirm: "save-field",
        expected_revision: String(incompleteRecord.revision),
        section: "puzzle",
        field: "title",
        value: "Stale title"
      }).toString()
    }), conflict), true);
    assert.equal(conflict.status, 409);
    assert.match(conflict.body, /updated elsewhere|revision conflict/i);

    const unknownField = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/incomplete-review-fixture", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: new URLSearchParams({
        confirm: "save-field",
        expected_revision: String(savedRecord.revision),
        section: "puzzle",
        field: "not-a-field",
        value: "nope"
      }).toString()
    }), unknownField), true);
    assert.equal(unknownField.status, 400);

    const energyRecord = await draftStore.getDraft("energy-flow-review");
    const cluster = energyRecord.document.clusters[0];
    const originalFact = cluster.fact;
    const editedFact = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: new URLSearchParams({
        confirm: "save-field",
        expected_revision: String(energyRecord.revision),
        section: "cluster",
        id: cluster.id,
        field: "fact",
        value: "Edited energy fact."
      }).toString()
    }), editedFact), true);
    assert.equal(editedFact.status, 303);
    const afterFactEdit = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, afterFactEdit), true);
    assert.match(afterFactEdit.body, /Edited energy fact\./);
    assert.match(afterFactEdit.body, /Use published wording/);
    const afterEditRecord = await draftStore.getDraft("energy-flow-review");
    const reverted = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: new URLSearchParams({
        confirm: "revert-field",
        expected_revision: String(afterEditRecord.revision),
        section: "cluster",
        id: cluster.id,
        field: "fact"
      }).toString()
    }), reverted), true);
    assert.equal(reverted.status, 303);
    const afterRevert = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, afterRevert), true);
    assert.match(afterRevert.body, new RegExp(originalFact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(afterRevert.body, /Edited energy fact\./);

    const opened = createResponse();
    assert.equal(await handleSubmit(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=open-pull-request"
    }), opened), true);
    assert.equal(opened.status, 200);
    assert.match(opened.body, /Opened pull request/);
    assert.match(opened.body, /pull\/7/);
    assert.equal(submitted[0].draftId, "energy-flow-review");
    assert.equal(submitted[0].replace, false);

    const replace = createResponse();
    assert.equal(await handleSubmit(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=open-pull-request&replace=1"
    }), replace), true);
    assert.equal(submitted[1].replace, true);

    const installed = [];
    const handleInstall = createLocalDraftReviewHandler({
      draftStore,
      contentService,
      repositoryRoot,
      workingTreeAheadOfUpstream: () => null,
      publicationActor: { subject: "local" },
      submitDraft: async () => {
        throw new Error("submit must not run for checkout install");
      },
      installDraft: async args => {
        installed.push(args);
        return {
          puzzleId: "energy-flow",
          action: "replace",
          affectedPaths: ["content/puzzles/energy-flow.ccpuzzle.json"]
        };
      }
    });
    const crossOriginInstall = createResponse();
    assert.equal(await handleInstall(postRequest("/admin/drafts/energy-flow-review", {
      origin: "https://evil.example",
      host: "127.0.0.1:8787",
      body: "confirm=install-checkout"
    }), crossOriginInstall), true);
    assert.equal(crossOriginInstall.status, 403);
    assert.equal(installed.length, 0);

    const checkout = createResponse();
    assert.equal(await handleInstall(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=install-checkout&replace=1"
    }), checkout), true);
    assert.equal(checkout.status, 200);
    assert.match(checkout.body, /Installed in this checkout/);
    assert.match(checkout.body, /energy-flow\.ccpuzzle\.json/);
    assert.match(checkout.body, /href="\/\?puzzle=energy-flow"/);
    assert.match(checkout.body, /LAN staging/);
    assert.equal(installed[0].draftId, "energy-flow-review");
    assert.equal(installed[0].replace, true);

    const unavailableInstall = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=install-checkout"
    }), unavailableInstall), true);
    assert.equal(unavailableInstall.status, 503);

    const uninstalled = [];
    const handleUninstall = createLocalDraftReviewHandler({
      draftStore,
      contentService,
      repositoryRoot,
      workingTreeAheadOfUpstream: () => null,
      readCommittedFile: () => null,
      submitDraft: async () => {
        throw new Error("submit must not run for checkout uninstall");
      },
      installDraft: async () => {
        throw new Error("install must not run for checkout uninstall");
      },
      uninstallDraft: async args => {
        uninstalled.push(args);
        return {
          puzzleId: "energy-flow",
          action: "restore",
          affectedPaths: ["content/puzzles/energy-flow.ccpuzzle.json"]
        };
      }
    });
    const uninstallPage = createResponse();
    assert.equal(await handleUninstall({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, uninstallPage), true);
    assert.match(uninstallPage.body, /value="uninstall-checkout"/);

    const crossOriginUninstall = createResponse();
    assert.equal(await handleUninstall(postRequest("/admin/drafts/energy-flow-review", {
      origin: "https://evil.example",
      host: "127.0.0.1:8787",
      body: "confirm=uninstall-checkout"
    }), crossOriginUninstall), true);
    assert.equal(crossOriginUninstall.status, 403);
    assert.equal(uninstalled.length, 0);

    const removed = createResponse();
    assert.equal(await handleUninstall(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=uninstall-checkout"
    }), removed), true);
    assert.equal(removed.status, 200);
    assert.match(removed.body, /Uninstalled from this checkout/);
    assert.equal(uninstalled[0].draftId, "energy-flow-review");

    const unavailableUninstall = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=uninstall-checkout"
    }), unavailableUninstall), true);
    assert.equal(unavailableUninstall.status, 503);

    const unavailable = createResponse();
    assert.equal(await handleRequest(postRequest("/admin/drafts/energy-flow-review", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: "confirm=open-pull-request"
    }), unavailable), true);
    assert.equal(unavailable.status, 503);

    const created = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        confirm: "create-draft",
        id: "blank-board-fixture",
        title: "Blank board fixture",
        category: "Science"
      }
    }), created), true);
    assert.equal(created.status, 201);
    const createdPayload = JSON.parse(created.body);
    assert.equal(createdPayload.draftId, "blank-board-fixture");
    assert.equal(createdPayload.location, "/?draft=blank-board-fixture");

    const documentGet = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/blank-board-fixture/document.json"
    }, documentGet), true);
    assert.equal(documentGet.status, 200);
    const documentPayload = JSON.parse(documentGet.body);
    assert.equal(documentPayload.document.id, "blank-board-fixture");
    assert.deepEqual(documentPayload.document.clusters, []);
    assert.equal(documentPayload.revision, 1);

    const saved = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts/blank-board-fixture/document", {
      method: "PUT",
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        expected_revision: 1,
        document: {
          ...documentPayload.document,
          unplacedTerms: ["photon"]
        }
      }
    }), saved), true);
    assert.equal(saved.status, 200);
    const savedPayload = JSON.parse(saved.body);
    assert.equal(savedPayload.revision, 2);
    assert.deepEqual(savedPayload.document.unplacedTerms, ["photon"]);

    const staleDocument = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts/blank-board-fixture/document", {
      method: "PUT",
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        expected_revision: 1,
        document: documentPayload.document
      }
    }), staleDocument), true);
    assert.equal(staleDocument.status, 409);

    const badId = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        confirm: "create-draft",
        id: "Not A Slug",
        title: "Bad id",
        category: "Science"
      }
    }), badId), true);
    assert.equal(badId.status, 400);
    assert.match(badId.headers["Content-Type"], /application\/json/);
    assert.equal(JSON.parse(badId.body).error, "Puzzle id must be a lowercase URL-safe slug.");

    const duplicate = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        confirm: "create-draft",
        id: "blank-board-fixture",
        title: "Blank board fixture",
        category: "Science"
      }
    }), duplicate), true);
    assert.equal(duplicate.status, 409);
    assert.match(duplicate.headers["Content-Type"], /application\/json/);
    assert.match(JSON.parse(duplicate.body).error, /already exists/i);

    const openedExisting = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        confirm: "open-existing-draft",
        id: "energy-flow"
      }
    }), openedExisting), true);
    assert.equal(openedExisting.status, 201);
    const openedExistingPayload = JSON.parse(openedExisting.body);
    assert.equal(openedExistingPayload.draftId, "energy-flow");
    assert.equal(openedExistingPayload.created, true);
    assert.equal(openedExistingPayload.location, "/?draft=energy-flow");
    assert.ok(openedExistingPayload.revision === 1);

    const openedExistingDocument = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow/document.json"
    }, openedExistingDocument), true);
    assert.equal(JSON.parse(openedExistingDocument.body).document.id, "energy-flow");
    assert.ok(JSON.parse(openedExistingDocument.body).document.clusters.length > 0);

    const openedExistingAgain = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        confirm: "open-existing-draft",
        id: "energy-flow"
      }
    }), openedExistingAgain), true);
    assert.equal(openedExistingAgain.status, 200);
    assert.equal(JSON.parse(openedExistingAgain.body).created, false);
    assert.equal(JSON.parse(openedExistingAgain.body).revision, 1);

    const unknownExisting = createResponse();
    assert.equal(await handleRequest(jsonRequest("/admin/drafts", {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      body: {
        confirm: "open-existing-draft",
        id: "does-not-exist"
      }
    }), unknownExisting), true);
    assert.equal(unknownExisting.status, 404);
    assert.match(JSON.parse(unknownExisting.body).error, /Unknown puzzle/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
