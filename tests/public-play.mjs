import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { createPublicPuzzleLoader, loadPublicPlayIndex } from "../modules/publicPlayClient.js";
import { publicPuzzleUrl } from "../modules/publicPlayRoutes.js";
import {
  buildPublicPlayIndex,
  handlePublicPlayRequest,
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

  const corrected = { ...document, title: "Energy flow corrected" };
  await repository.publish({ kind: "puzzle", id: document.id, document: corrected, actor });
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
}
