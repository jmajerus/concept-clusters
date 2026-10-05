import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { createPublicPuzzleLoader, loadPublicPlayIndex } from "../modules/publicPlayClient.js";
import { newCatalogues } from "../modules/catalogueRegistry.js";
import worker from "../src/worker.js";
import { publicPuzzleUrl } from "../modules/publicPlayRoutes.js";
import {
  buildPublicPlayIndex,
  handlePublicPlayRequest,
  handleCachedPublicPlayRequest,
  htmlWithPublicPlayMeta
} from "../modules/publicPlayService.js";
import { PUZZLE_MANIFEST } from "../puzzles/manifest.js";

export const name = "public D1 priority with frozen-module reuse";
const actor = { subject: "test-publisher" };
const request = path => new Request(`https://example.test${path}`);
const document = JSON.parse(await readFile(new URL("../content/puzzles/energy-flow.ccpuzzle.json", import.meta.url)));

export async function run() {
  const repository = createMemoryContentDocumentRepository();
  await repository.publish({ kind: "category", id: "science", document: {
    id: "science", title: "Science", domain: "sciences-mathematics"
  }, actor });
  await repository.publish({ kind: "puzzle", id: document.id, document, actor });
  const initial = await buildPublicPlayIndex(repository);
  const frozen = PUZZLE_MANIFEST.find(entry => entry.id === document.id);
  const initialLoader = createPublicPuzzleLoader([frozen], initial);
  assert.equal(initialLoader.entries[0].source, "static");
  assert.equal((await initialLoader.loadPuzzleById(document.id)).id, document.id);
  assert.equal(initial.categories.Science.slug, "science");
  assert.match(htmlWithPublicPlayMeta("<head></head>"), /cc-public-play-index/);
  const firstPublishedAt = (await repository.getPublished({ kind: "puzzle", id: document.id })).firstPublishedAt;
  const cacheRows = new Map();
  const cache = {
    async match(key) { return cacheRows.get(key.url)?.clone(); },
    async put(key, value) { cacheRows.set(key.url, value.clone()); }
  };
  const cachedFirst = await handleCachedPublicPlayRequest(
    request("/api/publications"), {}, null, { cache, repository }
  );
  assert.equal(cachedFirst.status, 200);
  assert.equal(cacheRows.get(request("/api/publications").url).headers.get("Cache-Control"), "public, max-age=30");
  const cachedSecond = await handleCachedPublicPlayRequest(
    request("/api/publications"), {}, null, {
      cache, repository: { listPublished() { throw new Error("cache miss"); } }
    }
  );
  assert.equal(cachedSecond.status, 200);
  assert.match(cachedSecond.headers.get("Cache-Control"), /s-maxage=30/);

  let assetRequest;
  const htmlResponse = await worker.fetch(new Request("https://example.test/index.html", {
    headers: { "If-None-Match": '"old-static-html"' }
  }), { ASSETS: { async fetch(req) {
    assetRequest = req;
    return req.headers.has("If-None-Match")
      ? new Response(null, { status: 304 })
      : new Response("<html><head></head><body></body></html>", {
        status: 200,
        headers: { ETag: '"old-static-html"', "Last-Modified": "Mon, 05 Oct 2026 00:00:00 GMT" }
      });
  } } });
  assert.equal(htmlResponse.status, 200);
  assert.equal(assetRequest.headers.has("If-None-Match"), false);
  assert.match(await htmlResponse.text(), /cc-public-play-index/);
  assert.equal(htmlResponse.headers.has("ETag"), false);
  assert.equal(htmlResponse.headers.has("Last-Modified"), false);

  const corrected = { ...document, title: "Energy flow corrected" };
  await repository.publish({ kind: "puzzle", id: document.id, document: corrected, actor });
  assert.equal((await repository.getPublished({ kind: "puzzle", id: document.id })).firstPublishedAt, firstPublishedAt);
  const changed = await buildPublicPlayIndex(repository);
  const changedLoader = createPublicPuzzleLoader([frozen], changed);
  assert.equal(changedLoader.entries[0].source, "d1");
  assert.equal(changedLoader.browsePuzzles[0].title, "Energy flow corrected");

  const entry = changed.puzzles[0];
  const boardUrl = publicPuzzleUrl(entry.id, entry.contentFingerprint, entry.layoutFingerprint);
  const board = await handlePublicPlayRequest(request(boardUrl), {}, { repository });
  assert.equal(board.status, 200);
  assert.match(board.headers.get("Cache-Control"), /s-maxage=30/);
  assert.equal((await board.json()).puzzle.title, "Energy flow corrected");
  const staleVersion = await handlePublicPlayRequest(request(`/api/puzzles/${entry.id}.json?v=stale`), {}, { repository });
  assert.equal(staleVersion.headers.get("Cache-Control"), "no-store");

  const layout = { schemaVersion: 1, modes: {} };
  await repository.saveLayout({ id: document.id, layout });
  const afterLayout = await buildPublicPlayIndex(repository);
  assert.equal(afterLayout.puzzles[0].contentFingerprint, entry.contentFingerprint);
  assert.notEqual(afterLayout.puzzles[0].layoutFingerprint, entry.layoutFingerprint);
  assert.equal(createPublicPuzzleLoader([frozen], afterLayout).entries[0].source, "d1");

  await repository.publish({ kind: "category", id: "fresh-category", document: {
    id: "fresh-category", title: "Fresh category", domain: "sciences-mathematics"
  }, actor });
  await repository.publish({ kind: "catalogue", id: "fresh-catalogue", document: {
    id: "fresh-catalogue", title: "Fresh catalogue", entries: [{ id: "new-from-d1" }]
  }, actor });
  const newDocument = { ...document, id: "new-from-d1", title: "New from D1", category: "fresh-category" };
  await repository.publish({ kind: "puzzle", id: newDocument.id, document: newDocument, actor });
  const withNew = await buildPublicPlayIndex(repository);
  const withNewLoader = createPublicPuzzleLoader([frozen], withNew);
  assert.deepEqual(withNewLoader.entries.map(item => item.id), [document.id, newDocument.id]);
  assert.equal(withNewLoader.entries[1].source, "d1");
  assert.equal(withNewLoader.browsePuzzles[1].category, "Fresh category");
  assert.equal(withNew.catalogues[0].title, "Fresh catalogue");

  await repository.unpublish({ kind: "puzzle", id: document.id, actor });
  const withdrawn = await buildPublicPlayIndex(repository);
  assert.deepEqual(createPublicPuzzleLoader([frozen], withdrawn).entries.map(item => item.id), [newDocument.id]);
  const withdrawnBoard = await handlePublicPlayRequest(request(boardUrl), {}, { repository });
  assert.equal(withdrawnBoard.status, 404);
  const missingIndex = await loadPublicPlayIndex("/api/publications", {
    fetchImpl: async () => new Response(null, { status: 503 })
  }).catch(error => error);
  assert.match(missingIndex.message, /unavailable/);

  const oldCatalogue = { id: "zebra-old", title: "Zebra", document: {
    id: "zebra-old", title: "Zebra", entries: []
  }, firstPublishedAt: "2026-01-01T00:00:00.000Z" };
  const newCatalogue = { id: "alpha-new", title: "Alpha", document: {
    id: "alpha-new", title: "Alpha", entries: []
  }, firstPublishedAt: "2026-02-01T00:00:00.000Z" };
  const ordered = await buildPublicPlayIndex({ async listPublished({ kind }) {
    if (kind === "catalogue") return [newCatalogue, oldCatalogue];
    if (kind === "category") return [];
    return [
      { id: "zebra-new", document: { ...document, id: "zebra-new" }, firstPublishedAt: "2026-02-01T00:00:00.000Z" },
      { id: "alpha-old", document: { ...document, id: "alpha-old" }, firstPublishedAt: "2026-01-01T00:00:00.000Z" }
    ];
  } });
  assert.deepEqual(createPublicPuzzleLoader([], ordered).entries.map(entry => entry.id), ["alpha-old", "zebra-new"]);
  assert.deepEqual(ordered.catalogues.map(item => item.id), ["zebra-old", "alpha-new"]);
  assert.equal(newCatalogues(ordered.catalogues)[0].id, "alpha-new");
}
