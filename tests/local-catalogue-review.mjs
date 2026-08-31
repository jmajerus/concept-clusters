import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { createLocalCatalogueReviewHandler } from "../modules/localCatalogueReview.js";
import { catalogueAuthorQuery } from "../modules/catalogueReviewPage.js";
import { startServer, serverURL } from "./lib/server.mjs";

export const name = "local catalogue review: D1 documents, list, publish, and editor";

const actor = { subject: "local-author" };

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

export async function run(page) {
  const contentService = createContentInterchangeService();
  const contentDocuments = createMemoryContentDocumentRepository();
  const handleRequest = createLocalCatalogueReviewHandler({
    contentDocuments,
    actor,
    contentService,
    repositoryRoot: contentService.repositoryRoot
  });

  const list = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin/catalogues" }, list), true);
  assert.equal(list.status, 200);
  assert.match(list.body, /getting-started/);
  assert.doesNotMatch(list.body, /holding-it-together/);
  assert.match(list.body, /Create and open editor/);
  assert.match(list.body, /published in D1/);

  const categories = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin/categories" }, categories), true);
  assert.equal(categories.status, 200);
  assert.match(categories.body, /science/);

  const skipped = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin/drafts" }, skipped), false);

  const seeded = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/catalogues/getting-started/document.json"
  }, seeded), true);
  assert.equal(seeded.status, 200);
  const seededPayload = JSON.parse(seeded.body);
  assert.equal(seededPayload.published, true);
  assert.equal(seededPayload.document.id, "getting-started");
  assert.ok(seededPayload.document.entries.length >= 1);

  const meta = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/catalogues/holding-it-together/document.json"
  }, meta), true);
  assert.equal(meta.status, 400);

  const created = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "create-catalogue",
      id: "lab-catalogue-fixture",
      title: "Lab catalogue fixture"
    }
  }), created), true);
  assert.equal(created.status, 201);
  const createdPayload = JSON.parse(created.body);
  assert.equal(createdPayload.catalogueId, "lab-catalogue-fixture");
  assert.equal(createdPayload.location, catalogueAuthorQuery("lab-catalogue-fixture"));

  const reserved = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: { confirm: "create-catalogue", id: "all", title: "Nope" }
  }), reserved), true);
  assert.equal(reserved.status, 400);

  const saved = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues/lab-catalogue-fixture/document", {
    method: "PUT",
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      expected_revision: 1,
      document: {
        id: "lab-catalogue-fixture",
        title: "Lab catalogue fixture",
        ordered: true,
        entries: [{ id: "energy-flow", reason: "Start here." }]
      }
    }
  }), saved), true);
  assert.equal(saved.status, 200);
  const savedPayload = JSON.parse(saved.body);
  assert.equal(savedPayload.revision, 2);
  assert.equal(savedPayload.document.entries[0].id, "energy-flow");

  const published = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues/lab-catalogue-fixture", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: { confirm: "publish" }
  }), published), true);
  assert.equal(published.status, 200);
  const publishedPayload = JSON.parse(published.body);
  assert.equal(publishedPayload.revision, 1);
  assert.equal(publishedPayload.document.entries[0].id, "energy-flow");

  const science = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/categories/science"
  }, science), true);
  assert.equal(science.status, 200);
  assert.match(science.body, /Science/);
  assert.match(science.body, /value="publish"/);

  const categoryPublished = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/categories/science",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=publish");
    }
  }, categoryPublished), true);
  assert.equal(categoryPublished.status, 200);
  assert.match(categoryPublished.body, /Published/);
  assert.match(categoryPublished.body, /git-bundled production player is unchanged/);

  if (page?.goto) {
    await exerciseCatalogueEditor(page, handleRequest);
  }
}

async function exerciseCatalogueEditor(page, handleRequest) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const server = await startServer(root, { handleRequest });
  const baseURL = serverURL(server);
  try {
    await page.goto(`${baseURL}/admin/catalogues`);
    const list = await page.content();
    assert.match(list, /getting-started/);
    assert.match(list, /Create and open editor/);
    assert.doesNotMatch(list, /holding-it-together/);

    await page.goto(`${baseURL}${catalogueAuthorQuery("getting-started")}`);
    await page.waitForSelector("#catalogue-studio:not([hidden])", { timeout: 60000 });
    assert.ok(
      await page.locator(".catalogue-authoring-list [data-puzzle-id]").count() >= 1
    );
    await page.locator(".catalogue-authoring-list [data-puzzle-id]").first().click();
    await page.locator("#catalogue-studio textarea[data-field=\"reason\"]").waitFor();

    const title = page.locator("#catalogue-studio input[data-field=\"title\"]");
    await title.fill("Getting Started lab");
    await title.blur();
    await page.waitForFunction(() =>
      document.querySelector("#catalogue-studio .authoring-status")?.textContent === "Saved."
    );

    await page.goto(`${baseURL}${catalogueAuthorQuery("lab-catalogue-fixture")}`);
    await page.waitForSelector("#catalogue-studio:not([hidden])");
    await page.fill("#catalogue-add-puzzle", "finite-and-infinite-games");
    await page.click("#catalogue-studio [data-action=\"add-entry\"]");
    await page.waitForSelector(
      ".catalogue-authoring-list [data-puzzle-id=\"finite-and-infinite-games\"]"
    );

    await page.goto(`${baseURL}/admin/catalogues`);
    await page.fill("input[name=\"id\"]", "lab-browser-empty");
    await page.fill("input[name=\"title\"]", "Browser empty");
    await page.click("form.new-catalogue button[type=\"submit\"]");
    await page.waitForSelector("#catalogue-studio:not([hidden])");
    assert.match(await page.locator("#overview-list").innerText(), /No puzzles yet/);
    assert.equal(
      await page.locator("#catalogue-studio button[type=\"submit\"]").last().isDisabled(),
      true
    );
  } finally {
    server.close();
  }
}
