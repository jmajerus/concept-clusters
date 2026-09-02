import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  handleAuthoringAdminIndex,
  isAuthoringAdminIndexPath,
  renderAdminIndexPage,
  renderFreezeResultPage,
  renderGithubRefreshResultPage
} from "../modules/authoringAdminIndex.js";
import { createLocalDevDraftHandler } from "../modules/localDevHttp.js";
import { startServer, serverURL } from "./lib/server.mjs";

export const name = "authoring admin index: directory of drafts, catalogues, categories";

function createResponse() {
  return {
    status: 0,
    headers: null,
    body: "",
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body = "") {
      this.body = body;
    }
  };
}

export async function run(page) {
  assert.equal(isAuthoringAdminIndexPath("/admin"), true);
  assert.equal(isAuthoringAdminIndexPath("/admin/"), true);
  assert.equal(isAuthoringAdminIndexPath("/admin/drafts"), false);

  const pageHtml = renderAdminIndexPage();
  assert.match(pageHtml, /<h1>Admin<\/h1>/);
  assert.match(pageHtml, /href="\/admin\/drafts"/);
  assert.match(pageHtml, /href="\/admin\/catalogues"/);
  assert.match(pageHtml, /href="\/admin\/categories"/);
  assert.match(pageHtml, /Play this server/);
  assert.match(pageHtml, /Publish writes the shared live/);
  assert.match(pageHtml, /<h2>Freeze<\/h2>/);
  assert.match(pageHtml, />Freeze</);
  assert.match(pageHtml, /No changes cued/);
  assert.match(pageHtml, /Git-seeded snapshots already in this checkout/);
  assert.match(pageHtml, /<h2>GitHub production<\/h2>/);
  assert.doesNotMatch(pageHtml, /value="refresh-github-production"/);
  assert.match(pageHtml, /LAN authoring checkout/);
  assert.doesNotMatch(pageHtml, /No GitHub snapshot yet/);
  assert.doesNotMatch(pageHtml, /id="freeze-dialog"/);
  assert.doesNotMatch(pageHtml, /Yes, freeze/);
  assert.doesNotMatch(pageHtml, />Confirm</);

  const pending = renderAdminIndexPage({
    canApplyFreeze: true,
    freezePlan: {
      puzzles: { add: ["brand-new"], update: ["keep-me"], remove: ["retired"] },
      catalogues: { add: [], update: [], remove: [] },
      categories: { add: [], update: [], remove: [] },
      held: { puzzles: ["still-in-review", "held-update"], catalogues: [], categories: [] }
    }
  });
  assert.match(pending, /3 changes cued; 2 locally published but not cued/);
  assert.match(pending, />Confirm</);
  assert.match(pending, />Cancel</);
  assert.match(pending, /brand-new/);
  assert.match(pending, /Puzzles add/);
  assert.match(pending, /Puzzles published, not cued/);
  assert.match(pending, /still-in-review/);
  assert.match(pending, /value="freeze"/);
  assert.doesNotMatch(pending, /Freeze this checkout\?/);
  assert.doesNotMatch(pending, /Yes, freeze/);

  const automatic = renderAdminIndexPage({
    canApplyFreeze: true,
    freezePlan: {
      puzzles: { add: ["new-science-puzzle"], update: [], remove: [] },
      catalogues: { add: ["science-basics"], update: ["learning-path"], remove: [] },
      categories: { add: ["science"], update: [], remove: [] },
      held: { puzzles: [], catalogues: [], categories: [] },
      dependencies: {
        automatic: [{
          kind: "puzzle",
          id: "new-science-puzzle",
          requiredBy: [
            { kind: "catalogue", id: "science-basics" },
            { kind: "catalogue", id: "science-followup" }
          ]
        }],
        missing: []
      }
    }
  });
  assert.match(automatic, /4 changes cued \(1 automatic\)/);
  assert.match(automatic, /Automatically cued supporting documents/);
  assert.match(automatic, /required by catalogue <code>science-basics<\/code>/);
  assert.match(automatic, /catalogue <code>science-followup<\/code>/);
  assert.match(automatic, />Confirm</);

  const blockedFreeze = renderAdminIndexPage({
    canApplyFreeze: true,
    freezePlan: {
      puzzles: { add: [], update: [], remove: [] },
      catalogues: { add: ["needs-a-puzzle"], update: [], remove: [] },
      categories: { add: [], update: [], remove: [] },
      held: { puzzles: [], catalogues: [], categories: [] },
      dependencies: {
        automatic: [],
        missing: [{
          kind: "puzzle",
          id: "not-published-anywhere",
          requiredBy: [{ kind: "catalogue", id: "needs-a-puzzle" }]
        }]
      }
    }
  });
  assert.match(blockedFreeze, /Missing supporting documents — freeze is blocked/);
  assert.match(blockedFreeze, /not-published-anywhere/);
  assert.match(blockedFreeze, /disabled>Freeze</);
  assert.doesNotMatch(blockedFreeze, />Confirm</);

  const lanEmpty = renderAdminIndexPage({ canApplyFreeze: true });
  assert.match(lanEmpty, /disabled>Freeze</);
  assert.match(lanEmpty, /value="refresh-github-production"/);
  assert.match(lanEmpty, />Refresh from GitHub</);
  assert.match(lanEmpty, /No GitHub snapshot yet/);
  const lanSnapshot = renderAdminIndexPage({
    canApplyFreeze: true,
    githubProduction: {
      ref: "origin/main",
      fetchedAt: "2026-09-01T16:00:00.000Z",
      ids: ["energy-flow"]
    }
  });
  assert.match(lanSnapshot, /1 id from origin\/main, fetched 2026-09-01T16:00:00.000Z/);
  assert.doesNotMatch(lanSnapshot, /No GitHub snapshot yet/);
  assert.match(pending, /value="refresh-github-production"/);

  const trailing = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin/" }, trailing), true);
  assert.equal(trailing.status, 302);
  assert.equal(trailing.headers.Location, "/admin");

  const denied = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "POST", url: "/admin" }, denied), true);
  assert.equal(denied.status, 405);

  const freezeBody = {
    method: "POST",
    url: "/admin",
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=freeze");
    }
  };
  let applied = 0;
  const frozen = createResponse();
  assert.equal(await handleAuthoringAdminIndex(freezeBody, frozen, {
    applyFreeze: async () => {
      applied += 1;
      return { affectedPaths: ["puzzles/science/brand-new.js"] };
    }
  }), true);
  assert.equal(applied, 1);
  assert.equal(frozen.status, 200);
  assert.match(frozen.body, /Frozen/);
  assert.match(frozen.body, /puzzles\/science\/brand-new\.js/);

  const freezeSnapshot = renderFreezeResultPage({
    result: {
      affectedPaths: ["puzzles/science/brand-new.js"],
      githubProduction: {
        ref: "origin/main",
        ids: ["brand-new", "energy-flow"],
        originIds: ["energy-flow"],
        projectedFromFreeze: true
      }
    }
  });
  assert.match(freezeSnapshot, /Projected GitHub production/);
  assert.match(freezeSnapshot, /joined with this freeze/);
  assert.match(freezeSnapshot, /2 ids, 1 already on origin/);
  const freezeSnapshotError = renderFreezeResultPage({
    result: {
      affectedPaths: [],
      githubProductionError: "git fetch origin failed"
    }
  });
  assert.match(freezeSnapshotError, /could not refresh the GitHub/);
  assert.match(freezeSnapshotError, /git fetch origin failed/);

  const refreshed = renderGithubRefreshResultPage({
    result: {
      githubProduction: {
        ref: "origin/main",
        fetchedAt: "2026-09-01T16:00:00.000Z",
        ids: ["energy-flow", "math-foundations"]
      }
    }
  });
  assert.match(refreshed, /GitHub production snapshot/);
  assert.match(refreshed, /2 ids from origin\/main/);
  assert.match(refreshed, /href="\/admin\/drafts"/);
  const refreshFailed = renderGithubRefreshResultPage({
    error: "git fetch origin failed"
  });
  assert.match(refreshFailed, /Could not refresh GitHub production/);
  assert.match(refreshFailed, /git fetch origin failed/);
  const refreshCached = renderGithubRefreshResultPage({
    result: {
      githubProduction: {
        ref: "origin/main",
        ids: ["energy-flow"],
        fetchedFromCache: true,
        originFetchError: "error: cannot open '.git/FETCH_HEAD': Permission denied"
      }
    }
  });
  assert.match(refreshCached, /last origin ref this checkout already had/);
  assert.match(refreshCached, /FETCH_HEAD/);

  let refreshedCount = 0;
  let frozenCount = 0;
  const refreshBody = {
    method: "POST",
    url: "/admin",
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=refresh-github-production");
    }
  };
  const refreshRes = createResponse();
  assert.equal(await handleAuthoringAdminIndex(refreshBody, refreshRes, {
    applyFreeze: async () => {
      frozenCount += 1;
      return { affectedPaths: [] };
    },
    refreshGithubProduction: async () => {
      refreshedCount += 1;
      return {
        ref: "origin/main",
        ids: ["energy-flow"]
      };
    }
  }), true);
  assert.equal(refreshedCount, 1);
  assert.equal(frozenCount, 0);
  assert.equal(refreshRes.status, 200);
  assert.match(refreshRes.body, /GitHub production snapshot/);
  assert.match(refreshRes.body, /1 id from origin\/main/);

  const refreshDenied = createResponse();
  assert.equal(await handleAuthoringAdminIndex({
    method: "POST",
    url: "/admin",
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=refresh-github-production");
    }
  }, refreshDenied, {
    applyFreeze: async () => ({})
  }), true);
  assert.equal(refreshDenied.status, 405);

  const missing = createResponse();
  assert.equal(await handleAuthoringAdminIndex({
    method: "POST",
    url: "/admin",
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=nope");
    }
  }, missing, { applyFreeze: async () => ({}) }), true);
  assert.equal(missing.status, 400);

  const skipped = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin/drafts" }, skipped), false);

  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const handleRequest = createLocalDevDraftHandler(root);
  const served = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin" }, served), true);
  assert.equal(served.status, 200);
  assert.match(served.body, /Puzzles/);
  assert.match(served.body, /value="refresh-github-production"/);

  if (!page?.goto) return;
  async function handleBrowser(req, res) {
    if (await handleAuthoringAdminIndex(req, res, {
      canApplyFreeze: true,
      freezePlan: {
        puzzles: { add: ["brand-new"], update: [], remove: [] },
        catalogues: { add: [], update: [], remove: [] },
        categories: { add: [], update: [], remove: [] },
        held: { puzzles: ["still-in-review", "held-update"], catalogues: [], categories: [] }
      }
    })) return true;
    const path = (req.url || "").split("?")[0];
    if (path === "/admin/drafts" || path === "/admin/catalogues") {
      const title = path.endsWith("drafts") ? "Puzzles" : "Catalogues";
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<h1>${title}</h1>`);
      return true;
    }
    return false;
  }
  const server = await startServer(root, { handleRequest: handleBrowser });
  const baseURL = serverURL(server);
  try {
    await page.goto(`${baseURL}/admin`);
    assert.match(await page.content(), />Puzzles</);
    await page.locator("#freeze-prepare").waitFor({ state: "visible" });
    await page.click("#freeze-prepare");
    assert.equal(await page.locator("#freeze-confirm").evaluate(el => !el.hidden), true);
    assert.match(await page.locator("#freeze-confirm").innerHTML(), />Confirm</);
    assert.match(await page.content(), /1 change cued; 2 locally published but not cued/);
    await page.click("#freeze-cancel");
    assert.equal(await page.locator("#freeze-confirm").evaluate(el => el.hidden), true);
    await page.click("a[href=\"/admin/drafts\"]");
    await page.waitForURL(/\/admin\/drafts$/);
    assert.match(await page.content(), /Puzzles/);
    await page.goto(`${baseURL}/admin`);
    await page.click("a[href=\"/admin/catalogues\"]");
    await page.waitForURL(/\/admin\/catalogues$/);
    assert.match(await page.content(), /Catalogues/);
  } finally {
    server.close();
  }
}
