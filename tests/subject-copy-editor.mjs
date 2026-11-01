import assert from "node:assert/strict";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { DOMAINS_SNAPSHOT, replaceDomainsRegistry } from "../modules/domainRegistry.js";
import { createLocalCatalogueReviewHandler } from "../modules/localCatalogueReview.js";
import { applyCopy, copyDiffers, copyOf, missingCopy } from "../modules/subjectCopy.js";

export const name = "Category editor: subjects terminology-mcp owns take player copy only";

const actor = { subject: "local-author" };
const subscriber = { subject: "terminology-mcp" };
const origin = "http://127.0.0.1:8787";
const host = "127.0.0.1:8787";

function formRequest(url, body) {
  return {
    method: "POST",
    url,
    headers: { origin, host, "content-type": "application/x-www-form-urlencoded" },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(new URLSearchParams(body).toString());
    }
  };
}

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

async function get(handleRequest, url) {
  const response = createResponse();
  assert.equal(await handleRequest({ method: "GET", url, headers: { host } }, response), true);
  return response;
}

async function post(handleRequest, url, body) {
  const response = createResponse();
  assert.equal(await handleRequest(formRequest(url, body), response), true);
  return response;
}

function units() {
  const structure = {
    id: "biology", title: "Biology", domain: "life-sciences",
    subcategories: { genomics: { title: "Genomics" }, glycomics: { title: "Glycomics" } }
  };
  const copy = copyOf({
    id: "biology", title: "Old Biology", info: { text: "Life." },
    subcategories: { genomics: { title: "Genomics", info: { text: "Genomes." } }, retired: { title: "Gone", info: { text: "Gone." } } }
  });
  assert.deepEqual(applyCopy(structure, copy), {
    id: "biology", title: "Biology", domain: "life-sciences", info: { text: "Life." },
    subcategories: { genomics: { title: "Genomics", info: { text: "Genomes." } }, glycomics: { title: "Glycomics" } }
  });
  assert.deepEqual(missingCopy(applyCopy(structure, copy)), [{ id: "biology", sub: "glycomics", title: "Glycomics" }]);
  // A legacy string blurb counts as copy.
  assert.deepEqual(missingCopy({ id: "x", title: "X", info: "A blurb.", subcategories: { y: { title: "Y", info: "Also." } } }), []);
  // Copy for a subcategory the published row dropped is not a change.
  const published = applyCopy(structure, copy);
  assert.equal(copyDiffers({ ...published, subcategories: { ...published.subcategories, gone: { title: "Gone", info: { text: "Old." } } } }, published), false);
  assert.equal(copyDiffers({ ...published, info: { text: "New." } }, published), true);
}

export async function run() {
  units();
  const contentService = createContentInterchangeService();
  const contentDocuments = createMemoryContentDocumentRepository();
  let terms = null;
  const handleRequest = createLocalCatalogueReviewHandler({
    contentDocuments,
    actor,
    contentService,
    repositoryRoot: contentService.repositoryRoot,
    env: { TERMINOLOGY_BASE: "http://terminology.test" },
    subjectTerms: async () => terms
  });

  // Without a subjects mirror every category keeps the full editor.
  assert.match((await get(handleRequest, "/admin/categories/biology")).body, /name="new_subcategory_id"/);

  const biology = await contentDocuments.getPublished({ kind: "category", id: "biology" });
  const subs = Object.keys(biology.document.subcategories);
  terms = {
    d1: { slug: "life-sciences", label: "Life Sciences", status: "active", broader: [], replacedBy: [] },
    c1: { slug: "biology", label: "Biology", status: "active", broader: ["d1"], replacedBy: [] },
    ...Object.fromEntries(subs.map((sub, index) => [`s${index}`, {
      slug: sub, label: sub, status: "active", broader: ["c1"], replacedBy: []
    }]))
  };

  // Managed: structure is shown, not edited, with links to terminology-mcp.
  const page = await get(handleRequest, "/admin/categories/biology");
  assert.doesNotMatch(page.body, /name="title"/);
  assert.doesNotMatch(page.body, /name="new_subcategory_id"/);
  assert.doesNotMatch(page.body, /remove_subcategory/);
  assert.doesNotMatch(page.body, /value="unpublish"/);
  assert.match(page.body, /name="subcategory\.genomics\.info"/);
  assert.match(page.body, /href="http:\/\/terminology\.test\/\?scheme=cc-subjects#c1"/);
  assert.match(page.body, /href="http:\/\/terminology\.test\/\?scheme=cc-subjects#d1"/);

  // The subscriber renames the category and adds a subcategory while the
  // working copy (opened above) still has the old structure.
  await contentDocuments.publish({
    kind: "category",
    id: "biology",
    document: {
      ...biology.document,
      title: "Life Science",
      subcategories: { ...biology.document.subcategories, glycomics: { title: "Glycomics" } }
    },
    actor: subscriber
  });
  terms.s99 = { slug: "glycomics", label: "Glycomics", status: "active", broader: ["c1"], replacedBy: [] };
  const synced = await get(handleRequest, "/admin/categories/biology");
  assert.match(synced.body, /<h1>Life Science<\/h1>/);
  assert.match(synced.body, /name="subcategory\.glycomics\.info"/);
  assert.match(synced.body, /href="http:\/\/terminology\.test\/\?scheme=cc-subjects#s99"/);

  // The list page asks for the new subcategory's copy.
  const list = await get(handleRequest, "/admin/categories");
  assert.match(list.body, /Needs player copy/);
  assert.match(list.body, /href="\/admin\/categories\/biology#sub-glycomics">Glycomics<\/a>/);
  assert.match(list.body, /terminology-mcp's <a href="http:\/\/terminology\.test\/\?scheme=cc-subjects">/);

  // Saving and publishing copy keeps the synced structure.
  const draft = await contentDocuments.getDraft({ kind: "category", id: "biology", actor });
  const saved = await post(handleRequest, "/admin/categories/biology", {
    confirm: "save-category",
    expected_revision: String(draft.revision),
    info: "Living things.",
    "subcategory.glycomics.info": "Sugars at scale.",
    "subcategory.glycomics.link": "wiki:Glycomics",
    // Structure fields from an old form are ignored.
    title: "Biology"
  });
  assert.equal(saved.status, 303, saved.body);
  const published = await post(handleRequest, "/admin/categories/biology", { confirm: "publish" });
  assert.equal(published.status, 303, published.body);
  const after = (await contentDocuments.getPublished({ kind: "category", id: "biology" })).document;
  assert.equal(after.title, "Life Science");
  assert.equal(after.info.text, "Living things.");
  assert.deepEqual(after.subcategories.glycomics, { title: "Glycomics", info: { text: "Sugars at scale.", link: "wiki:Glycomics" } });
  assert.deepEqual(Object.keys(after.subcategories).sort(), [...subs, "glycomics"].sort());

  // Another synced rename after the copy was saved: publishing the working
  // copy again does not bring the old title back.
  await contentDocuments.publish({ kind: "category", id: "biology", document: { ...after, title: "Biology & Life" }, actor: subscriber });
  await post(handleRequest, "/admin/categories/biology", { confirm: "publish" });
  assert.equal((await contentDocuments.getPublished({ kind: "category", id: "biology" })).document.title, "Biology & Life");

  const refused = await post(handleRequest, "/admin/categories/biology", { confirm: "unpublish" });
  assert.equal(refused.status, 400);
  assert.match(refused.body, /Retire or merge it there/);

  // Retired in terminology-mcp and withdrawn here: no full editor, and no
  // republishing from this page.
  const live = await contentDocuments.getPublished({ kind: "category", id: "biology" });
  await contentDocuments.unpublish({ kind: "category", id: "biology", actor: subscriber });
  terms.c1 = { ...terms.c1, status: "retired" };
  const retiredPage = await get(handleRequest, "/admin/categories/biology");
  assert.doesNotMatch(retiredPage.body, /name="new_subcategory_id"/);
  assert.match(retiredPage.body, /retired it or not synced it yet/);
  const republish = await post(handleRequest, "/admin/categories/biology", { confirm: "publish" });
  assert.equal(republish.status, 400);
  assert.ok((await contentDocuments.getPublished({ kind: "category", id: "biology" })).withdrawnAt);
  terms.c1 = { ...terms.c1, status: "active" };
  await contentDocuments.publish({ kind: "category", id: "biology", document: live.document, actor: subscriber });

  // A mirror that cannot be read fails closed rather than unlocking the
  // full editor.
  const savedTerms = terms;
  terms = undefined;
  const failing = createLocalCatalogueReviewHandler({
    contentDocuments,
    actor,
    contentService,
    repositoryRoot: contentService.repositoryRoot,
    subjectTerms: async () => { throw new Error("relation does not exist"); }
  });
  const failed = await get(failing, "/admin/categories/biology");
  assert.doesNotMatch(failed.body, /name="new_subcategory_id"/);
  assert.match(failed.body, /relation does not exist/);
  terms = savedTerms;

  // Domain copy is published onto the current row; its title is kept.
  try {
    await contentDocuments.publish({ kind: "domain", id: "life-sciences", document: { id: "life-sciences", title: "Life Sciences" }, actor: subscriber });
    const domainPage = await get(handleRequest, "/admin/domains/life-sciences");
    assert.match(domainPage.body, /name="info"/);
    assert.match(domainPage.body, /#d1/);
    assert.match((await get(handleRequest, "/admin/categories")).body, /href="\/admin\/domains\/life-sciences">Life Sciences<\/a>/);
    const domainSaved = await post(handleRequest, "/admin/domains/life-sciences", {
      confirm: "publish-domain-copy",
      info: "Living systems.",
      link: "wiki:Biology"
    });
    assert.equal(domainSaved.status, 303, domainSaved.body);
    assert.deepEqual((await contentDocuments.getPublished({ kind: "domain", id: "life-sciences" })).document, {
      id: "life-sciences", title: "Life Sciences", info: { text: "Living systems.", link: "wiki:Biology" }
    });
    assert.equal((await get(handleRequest, "/admin/domains/nowhere")).status, 404);
  } finally {
    replaceDomainsRegistry(JSON.parse(JSON.stringify(DOMAINS_SNAPSHOT)));
  }
}
