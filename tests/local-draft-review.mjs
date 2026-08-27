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

export const name = "local draft review: file-store mapping, live validation, and GET /admin/drafts";

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
    assert.equal(mapDraftListItem(submittedMeta, { inCheckout: false }).status, "submitted");
    assert.equal(mapDraftListItem(submittedMeta, { inCheckout: false }).inCurrentBundle, false);

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
    assert.equal(await handleRequest({ method: "POST", url: "/admin/drafts" }, skipped), false);

    const list = createResponse();
    assert.equal(await handleRequest({ method: "GET", url: "/admin/drafts" }, list), true);
    assert.equal(list.status, 200);
    assert.match(list.body, /incomplete-review-fixture/);
    assert.match(list.body, /energy-flow-review/);
    assert.match(list.body, /same D1 drafts hosted MCP uses/);
    assert.match(list.body, /this draft is in this checkout/);
    assert.match(list.body, /this draft is not in this checkout/);
    assert.match(list.body, /install into this checkout/);
    assert.match(list.body, /open a GitHub pull request/);

    const listStatuses = [...list.body.matchAll(
      /<code>([^<]+)<\/code><\/td>\s*<td>([^<]+)<\/td>/g
    )].map(([, draftId, status]) => [draftId, status.trim()]);
    for (const draftId of ["incomplete-review-fixture", "energy-flow-review"]) {
      const detail = createResponse();
      assert.equal(await handleRequest({
        method: "GET",
        url: `/admin/drafts/${draftId}`
      }, detail), true);
      const listStatus = listStatuses.find(([id]) => id === draftId)?.[1];
      const detailStatus = detail.body.match(
        /class="meta">\s*<code>[^<]+<\/code>\s*<span class="badge badge-neutral">([^<]+)</
      )?.[1];
      assert.equal(
        listStatus,
        detailStatus,
        `list/detail status mismatch for ${draftId}`
      );
    }

    const incompletePage = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/incomplete-review-fixture"
    }, incompletePage), true);
    assert.equal(incompletePage.status, 200);
    assert.match(incompletePage.body, /Validation failed/);
    assert.doesNotMatch(incompletePage.body, /authoring flag/);
    assert.match(incompletePage.body, />draft</);
    assert.match(incompletePage.body, /<copy-field>/);
    assert.match(incompletePage.body, /confirm" value="save-field"/);
    assert.doesNotMatch(incompletePage.body, /this draft is not in this checkout/);
    assert.doesNotMatch(incompletePage.body, />installed</);

    const installedPage = createResponse();
    assert.equal(await handleRequest({
      method: "GET",
      url: "/admin/drafts/energy-flow-review"
    }, installedPage), true);
    assert.equal(installedPage.status, 200);
    assert.match(installedPage.body, /Validation passed/);
    assert.match(installedPage.body, /this draft is in this checkout/);
    assert.match(installedPage.body, />installed</);
    assert.match(installedPage.body, /already published/);
    assert.match(installedPage.body, /type="hidden" name="replace" value="1"/);
    assert.match(installedPage.body, /No changes from the published puzzle/);
    assert.doesNotMatch(installedPage.body, /Use published wording/);
    assert.match(installedPage.body, /Save it to persist the current schema/);
    assert.match(installedPage.body, /Save canonical form/);
    assert.doesNotMatch(installedPage.body, /Replace the published puzzle/);

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

    const fetched = await fetchLocalDraftReview(
      new Request("http://127.0.0.1/admin/drafts"),
      { handleRequest }
    );
    assert.equal(fetched.status, 200);
    assert.match(await fetched.text(), /energy-flow-review/);

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
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
