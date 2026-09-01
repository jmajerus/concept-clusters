import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { seedPublishedPuzzles } from "../modules/contentDocumentSeed.js";
import {
  assemblePlayCorpus,
  catalogueFromDocument,
  categoriesRegistryFromDocuments,
  compilePublishedPuzzle,
  htmlWithPlayCorpusMeta,
  PLAY_CORPUS_META_NAME
} from "../modules/playCorpus.js";
import { createLocalPlayCorpusHandler } from "../modules/localPlayCorpus.js";
import { createPuzzleLoader } from "../modules/puzzleLoader.js";
import { startServer, serverURL } from "./lib/server.mjs";

export const name = "authoring play corpus: D1 Library navigation without git modules";

const actor = { subject: "local-author" };

const labPuzzle = {
  id: "lab-d1-play",
  title: "Lab D1 play",
  category: "Science",
  clusters: [
    { name: "Alpha", fact: "Alpha fact.", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
    { name: "Beta", fact: "Beta fact.", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
  ],
  bridges: [
    { term: "lab-bridge", clusters: ["alpha", "beta"], fact: "Connects the two." }
  ]
};

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
  const { puzzle, errors } = compilePublishedPuzzle(labPuzzle);
  assert.equal(errors.length, 0, errors.join("; "));
  assert.equal(puzzle.id, "lab-d1-play");
  assert.equal(puzzle.bridges[0].term, "lab-bridge");

  assert.equal(catalogueFromDocument({ id: "all", title: "All", entries: [] }), null);
  assert.equal(catalogueFromDocument({ id: "level-introductory", title: "Intro", entries: [] }), null);
  const meta = catalogueFromDocument({
    id: "holding-lab",
    title: "Holding lab",
    kind: "meta",
    ordered: false,
    entries: [{ id: "lab-set", reason: "nested" }],
    relatedCatalogues: { entries: [{ id: "other-meta" }] }
  });
  assert.equal(meta.kind, "meta");
  assert.equal(meta.ordered, false);
  assert.equal(meta.entries[0].id, "lab-set");

  const categories = categoriesRegistryFromDocuments([
    {
      id: "science",
      title: "Science",
      domain: "sciences-mathematics",
      info: { text: "From D1." }
    }
  ]);
  assert.equal(categories.Science.slug, "science");
  assert.equal(categories.Science.info.text, "From D1.");

  const assembled = assemblePlayCorpus({
    puzzleRows: [
      { id: "zebra-puzzle", publishedAt: "2026-01-01", document: { ...labPuzzle, id: "zebra-puzzle", title: "Zebra" } },
      { id: "lab-d1-play", publishedAt: "2026-01-02", document: labPuzzle }
    ],
    catalogueRows: [
      { document: { id: "all", title: "All", entries: [] } },
      { document: { id: "lab-set", title: "Lab set", entries: [{ id: "lab-d1-play" }] } }
    ],
    categoryRows: [{ document: { id: "science", title: "Science" } }],
    puzzleOrder: ["lab-d1-play", "zebra-puzzle"]
  });
  assert.deepEqual(assembled.puzzles.map(item => item.id), ["lab-d1-play", "zebra-puzzle"]);
  assert.equal(assembled.catalogues.length, 1);
  assert.equal(assembled.catalogues[0].id, "lab-set");
  assert.ok(assembled.puzzles[0]._searchTerms.includes("lab-bridge"));

  const injected = htmlWithPlayCorpusMeta("<html><head></head><body></body></html>");
  assert.match(injected, new RegExp(`name="${PLAY_CORPUS_META_NAME}"`));
  assert.equal(htmlWithPlayCorpusMeta(injected), injected);

  const fetched = [];
  const jsonLoader = createPuzzleLoader(
    [{ id: "lab-d1-play", module: "/play/puzzles/lab-d1-play.json", browse: { id: "lab-d1-play", title: "Lab D1 play" } }],
    {
      async loadPuzzle(entry) {
        fetched.push(entry.module);
        return puzzle;
      }
    }
  );
  const loaded = await jsonLoader.loadPuzzleById("lab-d1-play");
  assert.equal(loaded.id, "lab-d1-play");
  assert.deepEqual(fetched, ["/play/puzzles/lab-d1-play.json"]);

  const repo = createMemoryContentDocumentRepository();
  await seedPublishedPuzzles(repo, {
    async getPuzzleDocumentForPublication(id) {
      if (id !== "lab-d1-play") throw new Error(`unknown ${id}`);
      return labPuzzle;
    }
  }, ["lab-d1-play", "lab-d1-play", "missing-ignored"]);
  assert.equal((await repo.getPublished({ kind: "puzzle", id: "lab-d1-play" })).document.title, "Lab D1 play");
  await repo.publish({
    kind: "catalogue",
    id: "lab-set",
    document: { id: "lab-set", title: "Lab set", entries: [{ id: "lab-d1-play", reason: "Proof" }] },
    actor
  });
  await repo.publish({
    kind: "category",
    id: "science",
    document: { id: "science", title: "Science", domain: "sciences-mathematics", info: { text: "From D1." } },
    actor
  });

  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const handleRequest = createLocalPlayCorpusHandler({
    contentDocuments: repo,
    contentService: { puzzles: [{ id: "lab-d1-play" }], catalogues: [], categories: {} },
    repositoryRoot: root
  });

  const index = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/" }, index), true);
  assert.equal(index.status, 200);
  assert.match(index.body, new RegExp(`name="${PLAY_CORPUS_META_NAME}"`));

  const corpus = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/play/corpus.json" }, corpus), true);
  assert.equal(corpus.status, 200);
  const payload = JSON.parse(corpus.body);
  assert.equal(payload.source, "d1");
  assert.equal(payload.puzzles[0].id, "lab-d1-play");
  assert.equal(payload.catalogues[0].title, "Lab set");
  assert.equal(payload.categories.Science.slug, "science");

  const board = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/play/puzzles/lab-d1-play.json"
  }, board), true);
  assert.equal(board.status, 200);
  const compiled = JSON.parse(board.body);
  assert.equal(compiled.puzzle.id, "lab-d1-play");
  assert.ok(compiled.puzzle.clusters.length >= 2);

  const missing = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/play/puzzles/does-not-exist.json"
  }, missing), true);
  assert.equal(missing.status, 404);

  await repo.publish({
    kind: "puzzle",
    id: "lab-gone",
    document: { ...labPuzzle, id: "lab-gone", title: "Gone" },
    actor
  });
  await repo.unpublish({ kind: "puzzle", id: "lab-gone", actor });
  const withdrawnCorpus = createResponse();
  assert.equal(await handleRequest({ method: "GET", url: "/play/corpus.json" }, withdrawnCorpus), true);
  assert.ok(!JSON.parse(withdrawnCorpus.body).puzzles.some(item => item.id === "lab-gone"));
  const withdrawnBoard = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/play/puzzles/lab-gone.json"
  }, withdrawnBoard), true);
  assert.equal(withdrawnBoard.status, 404);

  if (!page?.goto) return;
  const server = await startServer(root, { handleRequest });
  const baseURL = serverURL(server);
  try {
    await page.goto(`${baseURL}/index.html?library`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.CC?.playSource === "d1", null, { timeout: 60000 });
    assert.equal(await page.evaluate(() => CC.playSource), "d1");
    assert.equal(await page.evaluate(() => document.body.classList.contains("authoring-play")), true);
    assert.equal(await page.evaluate(() => CC.PUZZLES.map(item => item.id).join(",")), "lab-d1-play");
    await page.waitForSelector('[data-catalogue-id="lab-set"]', { timeout: 15000 });
    await page.click('[data-catalogue-id="lab-set"]');
    await page.waitForSelector('[data-puzzle-id="lab-d1-play"]', { timeout: 15000 });
    await page.click('[data-puzzle-id="lab-d1-play"]');
    await page.waitForFunction(() =>
      window.CC?.state?.puzzle?.id === "lab-d1-play"
      && !document.querySelector("#puzzle-view")?.classList.contains("hidden"),
    null, { timeout: 15000 });
    assert.equal(await page.evaluate(() => CC.state.puzzle.bridges[0].term), "lab-bridge");
  } finally {
    server.close();
  }
}
