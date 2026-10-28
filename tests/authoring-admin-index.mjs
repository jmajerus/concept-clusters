import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  handleAuthoringAdminIndex,
  renderLinkHealthPage,
  isAuthoringAdminIndexPath,
  renderAdminIndexPage,
  renderTaxonomyPushSection,
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
  assert.doesNotMatch(pageHtml, /href="\/\?admin"/);
  assert.match(pageHtml, /Play this server/);
  assert.match(pageHtml, /Publish writes the shared live/);
  assert.match(pageHtml, /<h2>Freeze<\/h2>/);
  assert.doesNotMatch(pageHtml, /<h2>Public site<\/h2>/);
  assert.doesNotMatch(pageHtml, /<h2>Remote MCP<\/h2>/);
  assert.match(pageHtml, />Freeze</);
  assert.match(pageHtml, /No changes cued/);
  assert.match(pageHtml, /Git-seeded snapshots already in this checkout/);
  assert.match(pageHtml, /<h2>GitHub snapshot<\/h2>/);
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
      held: { puzzles: ["still-in-review", "held-update"], catalogues: [], categories: [] },
      puzzleDetails: {
        "brand-new": {
          title: "Brand New Puzzle",
          category: "Biology",
          subcategories: ["Biology: Foundations"]
        },
        "keep-me": {
          title: "Keep Me",
          category: "Science",
          subcategories: []
        }
      }
    }
  });
  assert.match(pending, /3 changes cued; 2 locally published but not cued/);
  assert.match(pending, />Confirm</);
  assert.match(pending, />Cancel</);
  assert.match(pending, /brand-new/);
  assert.match(pending, /Puzzles add/);
  assert.match(pending, /Puzzles published, not cued/);
  assert.match(pending, /still-in-review/);
  assert.match(pending, /Brand New Puzzle/);
  assert.match(pending, /category: Biology · subcategories: Biology: Foundations/);
  assert.match(pending, /category: Science · subcategories: \(none\)/);
  assert.match(pending, /value="freeze"/);
  assert.match(pending, /name="additional_context"/);
  assert.doesNotMatch(pending, /Freeze this checkout\?/);
  assert.doesNotMatch(pending, /Yes, freeze/);

  const automatic = renderAdminIndexPage({
    canApplyFreeze: true,
    freezePlan: {
      puzzles: { add: ["new-science-puzzle"], update: [], remove: [] },
      catalogues: { add: ["science-basics"], update: ["learning-path"], remove: [] },
      categories: { add: ["science", "zoology"], update: [], remove: [] },
      emptyCategories: ["zoology"],
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
  assert.match(automatic, /5 changes cued \(1 automatic\)/);
  assert.match(automatic, /Automatically cued supporting documents/);
  assert.match(automatic, /Categories shipping empty[^<]*<\/h3>\s*<ul><li><code>zoology<\/code><\/li>/,
    "empty category named on the plan, informational");
  assert.doesNotMatch(automatic, /freeze is blocked/);
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

  // Wikipedia link health: one line on the index, the detail on its own page.
  const linkHealth = {
    puzzles: 232, titles: 1810, checked: 1800, unchecked: 10, latestCheckedAt: "2026-09-21T21:41:17.266Z",
    counts: { ok: 1644, redirect: 123, missing: 31, disambiguation: 2 },
    affectedPuzzles: 61,
    issues: [
      { title: "Lacanian Real", status: "missing", resolvedTitle: null, checkedAt: "2026-09-21T21:41:17.266Z",
        references: [{ puzzleId: "solidarity-in-brokenness", puzzleTitle: "Solidarity in Brokenness", where: 'term "lacanian real void"', link: "wiki:Lacanian Real" }] },
      { title: "ATP", status: "disambiguation", resolvedTitle: null, checkedAt: "2026-09-21T21:41:17.266Z",
        references: [{ puzzleId: "energy-flow", puzzleTitle: "Energy flow", where: 'term "ATP"', link: "wiki:ATP" }] },
      { title: "Heart chamber", status: "redirect", resolvedTitle: "Heart", checkedAt: "2026-09-21T21:41:17.266Z",
        references: [{ puzzleId: "how-the-heart-pumps", puzzleTitle: "How the heart pumps", where: 'cluster "Chambers"', link: "wiki:Heart chamber" }] }
    ]
  };
  const withHealth = renderAdminIndexPage({ linkHealth });
  assert.match(withHealth, /<h2>Wikipedia links<\/h2>/);
  assert.match(withHealth, /1800 of 1810 titles checked across 232 published puzzles/);
  assert.match(withHealth, /latest 2026-09-21 \(10 not yet checked\)/);
  assert.match(withHealth, /<strong>31 missing · 2 disambiguation<\/strong> · 123 redirect · 1644 ok/);
  assert.match(withHealth, /<a href="\/admin\/link-health">review 3 titles across 61 puzzles<\/a>/);
  assert.doesNotMatch(withHealth, /Lacanian Real/, "the index summarises; it never lists titles");
  assert.match(withHealth, /link-health-warn/);
  assert.match(renderAdminIndexPage({ linkHealth: { ...linkHealth, counts: { ...linkHealth.counts, missing: 0, disambiguation: 0 } } }), /link-health-ok/,
    "redirects alone do not colour the line as a warning");
  const nothingYet = renderAdminIndexPage({ linkHealth: { ...linkHealth, checked: 0, issues: [] } });
  assert.match(nothingYet, /none checked yet/);
  assert.doesNotMatch(renderAdminIndexPage(), /Wikipedia links/, "no loader, no section");

  const caughtUp = renderAdminIndexPage({
    replicaStatus: {
      pending: [],
      held: [],
      drain: { phase: "ok", at: "2026-10-21T14:40:00.000Z" }
    }
  });
  assert.match(caughtUp, /<h2>Public site<\/h2>/);
  assert.match(caughtUp, /Published rows live on the LAN/);
  assert.doesNotMatch(caughtUp, /Publish writes the shared live/);
  assert.match(caughtUp, /The public site matches the LAN/);
  assert.match(caughtUp, /Last checked 2026-10-21 14:40 UTC/);
  assert.match(caughtUp, /<section class="replica-sync">/);
  assert.doesNotMatch(caughtUp, /<section class="replica-sync replica-sync-behind">/);
  assert.ok(
    caughtUp.indexOf("<h2>Public site</h2>") < caughtUp.indexOf("<h2>Freeze</h2>"),
    "the replica card sits with the server status, ahead of Freeze"
  );

  const behind = renderAdminIndexPage({
    replicaStatus: {
      pending: [
        { kind: "puzzle", id: "cell", title: "Cell", enqueuedAt: "2026-10-21T14:36:00.000Z" },
        { kind: "site_settings", id: "public", title: "Site settings", enqueuedAt: "2026-10-21T14:37:00.000Z" }
      ],
      held: [{ id: "cell", title: "Cell", missing: ["biology"] }],
      drain: {
        phase: "waiting",
        waiting: "CLOUDFLARE_API_TOKEN is not set",
        at: "2026-10-21T14:40:00.000Z"
      }
    }
  });
  assert.match(behind, /<section class="replica-sync replica-sync-behind">/);
  assert.match(behind, /2 changes are on the LAN and not yet on the public site/);
  assert.match(behind, /href="\/admin\/drafts\/cell"/);
  assert.match(behind, /waiting for category <code>biology<\/code>/);
  assert.match(behind, /Site settings/);
  assert.doesNotMatch(behind, /href="\/admin\/[^"]*public"/);
  assert.match(behind, /Cannot reach the public site/);
  assert.match(behind, /CLOUDFLARE_API_TOKEN is not set/);
  assert.doesNotMatch(behind, /The public site matches the LAN/);

  const many = Array.from({ length: 13 }, (_, index) => ({
    kind: "puzzle",
    id: `puzzle-${index}`,
    title: `Puzzle ${index}`,
    enqueuedAt: "2026-10-21T14:36:00.000Z"
  }));
  const truncated = renderAdminIndexPage({
    replicaStatus: { pending: many, held: [], drain: { phase: "ok", at: "2026-10-21T14:40:00.000Z" } }
  });
  assert.match(truncated, /13 changes are on the LAN/);
  assert.match(truncated, /puzzle-11/);
  assert.doesNotMatch(truncated, /puzzle-12/);
  assert.match(truncated, /and 1 more/);

  const unread = renderAdminIndexPage({
    replicaStatus: { error: "relation \"published_replica_queue\" does not exist" }
  });
  assert.match(unread, /Could not read the replica queue/);

  // The taxonomy push card: absent without a drain, quiet when accepted,
  // and a failure still names the last version corpus-mcp accepted.
  assert.equal(renderTaxonomyPushSection(null), "");
  assert.doesNotMatch(renderAdminIndexPage(), /Corpus vocabulary/);
  const accepted = renderAdminIndexPage({
    taxonomyPush: { state: "unchanged", version: "abc123", at: "2026-10-28T09:00:00.000Z", accepted: { version: "abc123", at: "2026-10-28T09:00:00.000Z" } }
  });
  assert.match(accepted, /<section class="taxonomy-push">/);
  assert.match(accepted, /corpus-mcp already had vocabulary <code>abc123<\/code>/);
  assert.match(accepted, /href="https:\/\/corpus-mcp\.majerus\.us\/admin\/taxonomy"/);
  const failed = renderTaxonomyPushSection({
    state: "failed", version: "def456", error: "HTTP 403", at: "2026-10-28T09:01:00.000Z",
    accepted: { version: "abc123", at: "2026-10-28T09:00:00.000Z" }
  });
  assert.match(failed, /taxonomy-push-warn/);
  assert.match(failed, /HTTP 403/);
  assert.match(failed, /Last accepted: vocabulary <code>abc123<\/code>/);
  const rejected = renderTaxonomyPushSection({ state: "rejected", version: "def456", problems: ["a.b: <bad>"], accepted: null });
  assert.match(rejected, /<li>a\.b: &lt;bad&gt;<\/li>/);
  assert.match(renderTaxonomyPushSection({ state: "off", accepted: null }), /push is off/);
  assert.match(unread, /relation &quot;published_replica_queue&quot; does not exist/);
  assert.match(unread, /<section class="replica-sync replica-sync-behind">/);

  const replicaRoute = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin" }, replicaRoute, {
    loadReplicaStatus: async () => ({
      pending: [],
      held: [],
      drain: { phase: "error", error: "d1 down", at: "2026-10-21T14:41:00.000Z" }
    })
  }), true);
  assert.match(replicaRoute.body, /The last copy failed/);
  assert.match(replicaRoute.body, /d1 down/);
  assert.doesNotMatch(replicaRoute.body, /The public site matches the LAN/);
  const replicaFails = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin" }, replicaFails, {
    loadReplicaStatus: async () => { throw new Error("postgres down"); }
  }), true);
  assert.equal(replicaFails.status, 200, "a failing replica loader never takes the index down");
  assert.match(replicaFails.body, /Could not read the replica queue/);
  assert.match(replicaFails.body, /postgres down/);

  const mcpIdle = renderAdminIndexPage({
    mcpHealth: { accessConfigured: true, accepted: 0, rejected: 0, lastAccepted: null, lastRejected: null }
  });
  assert.match(mcpIdle, /<h2>Remote MCP<\/h2>/);
  assert.match(mcpIdle, /No client has connected since this process started/);
  assert.match(mcpIdle, /stdio server is separate/);
  assert.match(mcpIdle, /<section class="mcp-health">/);
  assert.doesNotMatch(mcpIdle, /<section class="mcp-health mcp-health-warn">/);
  assert.ok(
    mcpIdle.indexOf("<h2>Remote MCP</h2>") < mcpIdle.indexOf("<h2>Freeze</h2>"),
    "the MCP card sits with the server status, ahead of Freeze"
  );

  const mcpSeen = renderAdminIndexPage({
    mcpHealth: {
      accessConfigured: true,
      accepted: 2,
      rejected: 1,
      lastAccepted: {
        at: "2026-10-21T23:50:00.000Z",
        method: "tools/call list_puzzles",
        client: "Cursor"
      },
      lastRejected: { at: "2026-10-21T23:40:00.000Z", reason: "no token" }
    }
  });
  assert.match(mcpSeen, /2 requests accepted, 1 request rejected/);
  assert.match(mcpSeen, /tools\/call list_puzzles/);
  assert.match(mcpSeen, /from Cursor/);
  assert.match(mcpSeen, /Last rejected at 2026-10-21 23:40 UTC: no token/);
  assert.doesNotMatch(mcpSeen, /<section class="mcp-health mcp-health-warn">/);

  const mcpDown = renderAdminIndexPage({
    mcpHealth: {
      accessConfigured: false,
      accepted: 0,
      rejected: 1,
      lastAccepted: null,
      lastRejected: { at: "2026-10-21T23:51:00.000Z", reason: "invalid token" }
    }
  });
  assert.match(mcpDown, /<section class="mcp-health mcp-health-warn">/);
  assert.match(mcpDown, /Remote clients cannot sign in/);
  assert.match(mcpDown, /invalid token/);
  assert.doesNotMatch(mcpDown, /cf-access-jwt-assertion/);
  const hostile = renderAdminIndexPage({
    mcpHealth: {
      accessConfigured: true,
      accepted: 1,
      rejected: 0,
      lastAccepted: { at: "2026-10-21T23:50:00.000Z", method: "initialize", client: "Cursor<script>" },
      lastRejected: null
    }
  });
  assert.match(hostile, /1 request accepted since this process started/);
  assert.doesNotMatch(hostile, /0 requests rejected/);
  assert.match(hostile, /Cursor&lt;script&gt;/);
  assert.doesNotMatch(hostile, /Cursor<script>/);

  const mcpRoute = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin" }, mcpRoute, {
    loadMcpHealth: async () => { throw new Error("health reader failed"); }
  }), true);
  assert.equal(mcpRoute.status, 200);
  assert.match(mcpRoute.body, /Could not read MCP health/);
  assert.match(mcpRoute.body, /health reader failed/);

  const healthPage = renderLinkHealthPage(linkHealth);
  assert.match(healthPage, /<h1>Wikipedia link health<\/h1>/);
  assert.match(healthPage, /<h2>no article at that title \(1\)<\/h2>/);
  assert.match(healthPage, /<h2>disambiguation page \(1\)<\/h2>/);
  assert.match(healthPage, /<h2>redirects \(1\)<\/h2>/);
  assert.match(healthPage, /href="https:\/\/en\.wikipedia\.org\/wiki\/Heart_chamber">Heart chamber<\/a> → <a href="https:\/\/en\.wikipedia\.org\/wiki\/Heart">Heart<\/a>/);
  assert.match(healthPage, /<a href="\/admin\/drafts\/solidarity-in-brokenness">Solidarity in Brokenness<\/a>/);
  assert.match(healthPage, /term &quot;lacanian real void&quot; · <code>wiki:Lacanian Real<\/code>/);
  assert.match(renderLinkHealthPage({ ...linkHealth, issues: [] }), /Every checked link resolves to its own article/);

  const healthRoute = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin/link-health" }, healthRoute, {
    loadLinkHealth: async () => linkHealth
  }), true);
  assert.equal(healthRoute.status, 200);
  assert.match(healthRoute.body, /<h1>Wikipedia link health<\/h1>/);
  const healthPost = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "POST", url: "/admin/link-health" }, healthPost), true);
  assert.equal(healthPost.status, 405);
  const indexWithLoader = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin" }, indexWithLoader, {
    loadLinkHealth: async () => linkHealth
  }), true);
  assert.match(indexWithLoader.body, /review 3 titles across 61 puzzles/);
  const loaderFails = createResponse();
  assert.equal(await handleAuthoringAdminIndex({ method: "GET", url: "/admin" }, loaderFails, {
    loadLinkHealth: async () => { throw new Error("D1 down"); }
  }), true);
  assert.equal(loaderFails.status, 200, "a failing health loader never takes the index down");
  assert.doesNotMatch(loaderFails.body, /Wikipedia links/);

  const freezeBody = {
    method: "POST",
    url: "/admin",
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=freeze&additional_context=Release+note");
    }
  };
  let applied = 0;
  const frozen = createResponse();
  assert.equal(await handleAuthoringAdminIndex(freezeBody, frozen, {
    applyFreeze: async ({ additionalContext } = {}) => {
      applied += 1;
      assert.equal(additionalContext, "Release note");
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
  assert.match(freezeSnapshot, /Projected GitHub snapshot/);
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
  assert.match(refreshed, /GitHub snapshot/);
  assert.match(refreshed, /2 ids from origin\/main/);
  assert.match(refreshed, /href="\/admin\/drafts"/);
  const refreshFailed = renderGithubRefreshResultPage({
    error: "git fetch origin failed"
  });
  assert.match(refreshFailed, /Could not refresh GitHub snapshot/);
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
  assert.match(refreshRes.body, /GitHub snapshot/);
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
