import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  handleAuthoringAdminIndex,
  isAuthoringAdminIndexPath,
  renderAdminIndexPage
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
