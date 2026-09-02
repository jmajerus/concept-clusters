import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { createLocalCatalogueReviewHandler } from "../modules/localCatalogueReview.js";
import { catalogueAdminPath, catalogueAuthorQuery } from "../modules/catalogueReviewPage.js";
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
  let seededKinds = [];
  const innerSeedMany = contentDocuments.seedPublishedManyIfAbsent.bind(contentDocuments);
  contentDocuments.seedPublishedManyIfAbsent = async items => {
    seededKinds.push(...new Set(items.map(item => item.kind)));
    return innerSeedMany(items);
  };
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
  assert.match(list.body, /holding-it-together/);
  assert.match(list.body, /Create and open editor/);
  assert.match(list.body, /published in D1/);
  assert.match(list.body, /href="\/admin\/catalogues\/holding-it-together"/);
  assert.deepEqual(seededKinds, ["catalogue"]);

  seededKinds = [];
  const listAgain = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin/catalogues" }, listAgain), true);
  assert.equal(listAgain.status, 200);
  assert.deepEqual(seededKinds, []);

  const categories = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin/categories" }, categories), true);
  assert.equal(categories.status, 200);
  assert.match(categories.body, /science/);
  assert.match(categories.body, /Subcategories/);
  assert.match(categories.body, /biology/);

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
  assert.equal(seededPayload.differsFromPublished, false);
  assert.equal(seededPayload.document.id, "getting-started");
  assert.ok(seededPayload.document.entries.length >= 1);

  const unchangedPublish = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues/getting-started", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: { confirm: "publish" }
  }), unchangedPublish), true);
  assert.equal(unchangedPublish.status, 409);
  assert.match(JSON.parse(unchangedPublish.body).error, /already published/);

  const unchangedRevert = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues/getting-started", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: { confirm: "revert-published" }
  }), unchangedRevert), true);
  assert.equal(unchangedRevert.status, 409);
  assert.match(JSON.parse(unchangedRevert.body).error, /already matches/);

  const meta = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/catalogues/holding-it-together/document.json"
  }, meta), true);
  assert.equal(meta.status, 200);
  const metaPayload = JSON.parse(meta.body);
  assert.equal(metaPayload.document.kind, "meta");
  assert.equal(metaPayload.document.id, "holding-it-together");
  assert.ok(metaPayload.document.entries.some(entry => entry.id === "arrangements-that-hold"));

  const metaPage = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/catalogues/holding-it-together"
  }, metaPage), true);
  assert.equal(metaPage.status, 200);
  assert.match(metaPage.body, /name="new_entry_id"/);
  assert.match(metaPage.body, /arrangements-that-hold/);

  const leafRedirect = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/catalogues/getting-started"
  }, leafRedirect), true);
  assert.equal(leafRedirect.status, 302);
  assert.equal(leafRedirect.headers.Location, catalogueAuthorQuery("getting-started"));

  const addedMetaEntry = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues/holding-it-together", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "save-catalogue",
      expected_revision: metaPayload.revision,
      new_entry: { id: "getting-started", reason: "Lab add." }
    }
  }), addedMetaEntry), true);
  assert.equal(addedMetaEntry.status, 200);
  assert.ok(addedMetaEntry.body.includes("getting-started")
    || JSON.parse(addedMetaEntry.body).document.entries.some(entry => entry.id === "getting-started"));

  const createdMeta = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "create-catalogue",
      id: "lab-meta-fixture",
      title: "Lab meta fixture",
      kind: "meta"
    }
  }), createdMeta), true);
  assert.equal(createdMeta.status, 201);
  assert.equal(JSON.parse(createdMeta.body).location, catalogueAdminPath("lab-meta-fixture"));

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

  const legacyExport = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/catalogues/lab-catalogue-fixture", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: { confirm: "open-pull-request" }
  }), legacyExport), true);
  assert.equal(legacyExport.status, 400);
  assert.match(legacyExport.body, /Publish writes D1/);

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
  assert.match(science.body, /No subcategories registered on this category yet/);

  const biology = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/categories/biology"
  }, biology), true);
  assert.equal(biology.status, 200);
  assert.match(biology.body, /name="subcategory.foundations.title"/);
  assert.match(biology.body, /name="subcategory.genomics.title"/);
  assert.match(biology.body, /value="Foundations"/);
  assert.match(biology.body, /name="new_subcategory_id"/);
  assert.match(biology.body, /wiki:Biology/);

  const added = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/categories/science", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "save-category",
      expected_revision: 1,
      title: "Science",
      domain: "sciences-mathematics",
      new_subcategory: {
        id: "lab-partition",
        title: "Lab partition",
        info: "For tests.",
        link: "wiki:Science"
      }
    }
  }), added), true);
  assert.equal(added.status, 303);

  const scienceWithSub = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/categories/science"
  }, scienceWithSub), true);
  assert.match(scienceWithSub.body, /name="subcategory.lab-partition.title"/);
  assert.match(scienceWithSub.body, /value="Lab partition"/);

  const reservedSub = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/categories/science", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "save-category",
      expected_revision: 2,
      title: "Science",
      new_subcategory: { id: "other", title: "Other" }
    }
  }), reservedSub), true);
  assert.equal(reservedSub.status, 400);
  assert.match(reservedSub.body, /reserved/);

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

  const createdCategory = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/categories", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "create-category",
      id: "lab-subject",
      title: "Lab Subject",
      domain: "sciences-mathematics",
      info: "A test subject."
    }
  }), createdCategory), true);
  assert.equal(createdCategory.status, 201);
  assert.equal(JSON.parse(createdCategory.body).location, "/admin/categories/lab-subject");

  const publishLabSubject = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/categories/lab-subject",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=publish");
    }
  }, publishLabSubject), true);
  assert.equal(publishLabSubject.status, 200);

  const labReview = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/categories/lab-subject"
  }, labReview), true);
  assert.match(labReview.body, /held/);
  assert.match(labReview.body, />Cue</);

  const markLabSubject = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/categories/lab-subject",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=cue-for-freeze");
    }
  }, markLabSubject), true);
  assert.equal(markLabSubject.status, 303);

  const labFreeze = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/categories/lab-subject"
  }, labFreeze), true);
  assert.match(labFreeze.body, /new on next freeze/);

  const unpublishLabSubject = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/categories/lab-subject",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=unpublish");
    }
  }, unpublishLabSubject), true);
  assert.equal(unpublishLabSubject.status, 200);
  assert.match(unpublishLabSubject.body, /Withdrew lab-subject/);

  const renamedUnused = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/categories/lab-subject", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "save-category",
      expected_revision: 1,
      title: "Lab Subject Renamed",
      domain: "sciences-mathematics"
    }
  }), renamedUnused), true);
  assert.equal(renamedUnused.status, 303);

  const scienceEdit = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/admin/categories/science"
  }, scienceEdit), true);
  const scienceRevision = /name="expected_revision" value="(\d+)"/.exec(scienceEdit.body);
  assert.ok(scienceRevision);

  const blockedRename = createResponse();
  assert.equal(await handleRequest(jsonRequest("/admin/categories/science", {
    origin: "http://127.0.0.1:8787",
    host: "127.0.0.1:8787",
    body: {
      confirm: "save-category",
      expected_revision: Number(scienceRevision[1]),
      title: "Sciences"
    }
  }), blockedRename), true);
  assert.equal(blockedRename.status, 400);
  assert.match(blockedRename.body, /still cite/);
  assert.match(blockedRename.body, /Cannot rename/);

  const blockedCategory = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/categories/science",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=unpublish");
    }
  }, blockedCategory), true);
  assert.equal(blockedCategory.status, 400);
  assert.match(blockedCategory.body, /still cite/);

  const unchangedLeafPublish = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/catalogues/lab-catalogue-fixture",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=publish");
    }
  }, unchangedLeafPublish), true);
  assert.equal(unchangedLeafPublish.status, 409);
  assert.match(unchangedLeafPublish.body, /already published/);

  const reviewList = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin/catalogues" }, reviewList), true);
  assert.match(reviewList.body, /lab-catalogue-fixture/);
  assert.match(reviewList.body, /held/);

  const markLeaf = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/catalogues/lab-catalogue-fixture",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=cue-for-freeze");
    }
  }, markLeaf), true);
  assert.equal(markLeaf.status, 303);

  const freezeList = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/admin/catalogues" }, freezeList), true);
  assert.match(freezeList.body, /lab-catalogue-fixture/);
  assert.match(freezeList.body, /new on next freeze/);

  const unpublishLeaf = createResponse();
  assert.equal(await handleRequest({
    method: "POST",
    url: "/admin/catalogues/lab-catalogue-fixture",
    headers: {
      origin: "http://127.0.0.1:8787",
      host: "127.0.0.1:8787",
      "content-type": "application/x-www-form-urlencoded"
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("confirm=unpublish");
    }
  }, unpublishLeaf), true);
  assert.equal(unpublishLeaf.status, 200);
  assert.match(unpublishLeaf.body, /Withdrew lab-catalogue-fixture/);

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
    assert.match(list, /holding-it-together/);
    await page.click("a[href=\"/admin/catalogues/holding-it-together\"]");
    await page.waitForSelector("input[name=\"new_entry_id\"]");
    assert.match(await page.content(), /arrangements-that-hold/);

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
    const studioText = await page.locator("#catalogue-studio").innerText();
    assert.doesNotMatch(studioText, /Export to player/);
    assert.match(studioText, /Freeze from/);
    assert.match(studioText, /This working copy has unpublished changes/);
    assert.equal(
      await page.locator('#catalogue-studio button[type="submit"]').first().isDisabled(),
      false
    );
    assert.equal(
      await page.locator('#catalogue-studio input[value="revert-published"]').count(),
      1
    );
    assert.equal(
      await page.locator(
        '#catalogue-studio input[value="cue-for-freeze"], ' +
        '#catalogue-studio input[value="hold-from-freeze"]'
      ).count(),
      1
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
    assert.equal(await page.locator("#catalogue-studio button[type=\"submit\"]").count(), 1);
    assert.doesNotMatch(
      await page.locator("#catalogue-studio").innerText(),
      /Export to player/
    );

    await page.goto(`${baseURL}/admin/categories`);
    await page.click("a[href=\"/admin/categories/biology\"]");
    await page.waitForSelector("input[name=\"subcategory.foundations.title\"]");
    assert.equal(
      await page.locator("input[name=\"subcategory.foundations.title\"]").inputValue(),
      "Foundations"
    );
  } finally {
    server.close();
  }
}
