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
  assert.match(pageHtml, /Publish writes the shared live/);

  const trailing = createResponse();
  assert.equal(handleAuthoringAdminIndex({ method: "GET", url: "/admin/" }, trailing), true);
  assert.equal(trailing.status, 302);
  assert.equal(trailing.headers.Location, "/admin");

  const denied = createResponse();
  assert.equal(handleAuthoringAdminIndex({ method: "POST", url: "/admin" }, denied), true);
  assert.equal(denied.status, 405);

  const skipped = createResponse();
  assert.equal(handleAuthoringAdminIndex({ method: "GET", url: "/admin/drafts" }, skipped), false);

  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const handleRequest = createLocalDevDraftHandler(root);
  const served = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin" }, served), true);
  assert.equal(served.status, 200);
  assert.match(served.body, /Puzzle drafts/);

  if (!page?.goto) return;
  async function handleBrowser(req, res) {
    if (handleAuthoringAdminIndex(req, res)) return true;
    const path = (req.url || "").split("?")[0];
    if (path === "/admin/drafts" || path === "/admin/catalogues") {
      const title = path.endsWith("drafts") ? "Your drafts" : "Catalogues";
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
    assert.match(await page.content(), /Puzzle drafts/);
    await page.click("a[href=\"/admin/drafts\"]");
    await page.waitForURL(/\/admin\/drafts$/);
    assert.match(await page.content(), /Your drafts|No drafts yet/);
    await page.goto(`${baseURL}/admin`);
    await page.click("a[href=\"/admin/catalogues\"]");
    await page.waitForURL(/\/admin\/catalogues$/);
    assert.match(await page.content(), /Catalogues/);
  } finally {
    server.close();
  }
}
