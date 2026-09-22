import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { seedPublishedPuzzles } from "../modules/contentDocumentSeed.js";
import { createLocalDraftReviewHandler } from "../modules/localDraftReview.js";
import {
  assemblePlayCorpus,
  catalogueFromDocument,
  categoriesRegistryFromDocuments,
  compilePublishedPuzzle,
  htmlWithPlayCorpusMeta,
  PLAY_CORPUS_META_NAME
} from "../modules/playCorpus.js";
import { createLocalPlayCorpusHandler } from "../modules/localPlayCorpus.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { createPuzzleLoader } from "../modules/puzzleLoader.js";
import {
  expectedStarLayoutNodeKeys,
  starLayoutRevision
} from "../modules/starLayoutSchema.js";
import {
  expectedCircleLayoutBridgeKeys,
  expectedCircleLayoutClusterKeys
} from "../modules/circleLayoutSchema.js";
import { expectedGraphLayoutNodeKeys } from "../modules/graphLayoutSchema.js";
import {
  emptyLayoutDocument,
  layoutDocumentForMode,
  parseLayoutDocument
} from "../modules/layoutDocument.js";
import { startServer, serverURL } from "./lib/server.mjs";

export const heavy = true; // among the longest browser tests; the runner starts it first
export const name = "authoring play corpus: D1 Library navigation without git modules";

const actor = { subject: "local-author" };

const labPuzzle = {
  id: "lab-d1-play",
  title: "Lab D1 play",
  category: "Science",
  provenance: {
    collaboration: "ai",
    contributors: [{ name: "Claude", model: "Claude Opus 4.7", reasoning: "high" }]
  },
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
  const layout = {
    schemaVersion: 1,
    puzzleId: puzzle.id,
    puzzleRevision: starLayoutRevision(puzzle),
    board: { width: 1000, height: 500 },
    nodes: Object.fromEntries(expectedStarLayoutNodeKeys(puzzle).map((key, index) => [
      key,
      { x: 40 + index * 20, y: 40 }
    ])),
    metrics: { lineCrossings: 0, edgeNodeIntersections: 0, overlaps: 0 }
  };
  const graphLayout = {
    schemaVersion: 1,
    puzzleId: puzzle.id,
    puzzleRevision: starLayoutRevision(puzzle),
    board: { width: 1000, height: 500 },
    nodes: Object.fromEntries(expectedGraphLayoutNodeKeys(puzzle).map((key, index) => [
      key,
      { x: 80 + index * 24, y: 180, pinned: true }
    ])),
    metrics: { lineCrossings: 0, edgeNodeIntersections: 0, overlaps: 0 }
  };
  const circleLayout = {
    schemaVersion: 1,
    puzzleId: puzzle.id,
    puzzleRevision: starLayoutRevision(puzzle),
    board: { width: 1000, height: 500 },
    stripHeight: 54,
    circles: Object.fromEntries(expectedCircleLayoutClusterKeys(puzzle).map((key, index) => [
      key,
      { x: index ? 720 : 280, y: 280, pinned: true }
    ])),
    bridges: Object.fromEntries(expectedCircleLayoutBridgeKeys(puzzle).map(key => [
      key,
      { x: 500, y: 280, pinned: true }
    ])),
    metrics: {
      hardOverlaps: 0,
      circleOverlaps: 0,
      headingOverlaps: 0,
      bridgeCircleOverlaps: 0,
      bridgeHeadingOverlaps: 0,
      bridgeBridgeOverlaps: 0,
      boundsViolations: 0,
      lineCrossings: 0,
      lineHeadingIntersections: 0,
      lineCircleIntersections: 0
    }
  };
  assert.throws(
    () => parseLayoutDocument("{"),
    /contains invalid JSON/
  );
  assert.throws(
    () => parseLayoutDocument(JSON.stringify({ schemaVersion: 1 })),
    /has an unsupported shape/
  );

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
  assert.equal(assembled.puzzles[0].clusters[0].fact, "Alpha fact.");
  assert.deepEqual(assembled.puzzles[0].provenance, labPuzzle.provenance);
  assert.deepEqual(assembled.drafts, []);
  const withDrafts = assemblePlayCorpus({
    puzzleRows: [{ id: "lab-d1-play", document: labPuzzle }],
    draftRows: [{
      draftId: "lab-d1-play",
      document: { ...labPuzzle, title: "Draft lab" }
    }]
  });
  assert.equal(withDrafts.drafts[0]._draftId, "lab-d1-play");
  assert.equal(withDrafts.drafts[0].title, "Draft lab");

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
    },
    getPuzzleLayoutForPublication() {
      return layoutDocumentForMode("star", layout);
    }
  }, ["lab-d1-play", "lab-d1-play", "missing-ignored"]);
  assert.equal((await repo.getPublished({ kind: "puzzle", id: "lab-d1-play" })).document.title, "Lab D1 play");
  assert.deepEqual(
    (await repo.getPublished({ kind: "puzzle", id: "lab-d1-play" })).layout,
    layoutDocumentForMode("star", layout)
  );
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
  const minimumClusters = compiled.puzzle.puzzleKind === "vocabulary-context" ? 1 : 2;
  assert.ok(compiled.puzzle.clusters.length >= minimumClusters);
  assert.deepEqual(compiled.puzzle.bridges[0].clusters, [0, 1]);
  assert.deepEqual(compiled.puzzle.provenance, labPuzzle.provenance);

  const saveLayoutResponse = createResponse();
  assert.equal(await handleRequest({
    method: "PUT",
    url: "/admin/puzzles/lab-d1-play/layout.json",
    headers: { host: "127.0.0.1:8787", origin: "http://127.0.0.1:8787" },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify({ layout }));
    }
  }, saveLayoutResponse), true);
  assert.equal(saveLayoutResponse.status, 200, saveLayoutResponse.body);
  assert.deepEqual(
    JSON.parse(saveLayoutResponse.body).layout,
    layoutDocumentForMode("star", layout)
  );
  assert.deepEqual(
    (await repo.getPublished({ kind: "puzzle", id: "lab-d1-play" })).layout,
    layoutDocumentForMode("star", layout)
  );
  const boardWithLayout = createResponse();
  assert.equal(await handleRequest({
    method: "GET",
    url: "/play/puzzles/lab-d1-play.json"
  }, boardWithLayout), true);
  assert.deepEqual(JSON.parse(boardWithLayout.body).layout, layoutDocumentForMode("star", layout));
  assert.deepEqual(JSON.parse(boardWithLayout.body).starLayout, layout);

  // The browser sends one renderer payload at a time. The route must merge
  // it into the existing envelope so adding Graph and Circle overrides never
  // erases the already-confirmed Star layout.
  for (const [mode, modeLayout] of [["graph", graphLayout], ["sets", circleLayout]]) {
    const response = createResponse();
    assert.equal(await handleRequest({
      method: "PUT",
      url: `/admin/puzzles/lab-d1-play/layout.json?mode=${mode}`,
      headers: { host: "127.0.0.1:8787", origin: "http://127.0.0.1:8787" },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from(JSON.stringify({ mode, layout: modeLayout }));
      }
    }, response), true);
    assert.equal(response.status, 200, response.body);
  }
  const mergedPublishedLayout = (await repo.getPublished({
    kind: "puzzle",
    id: "lab-d1-play"
  })).layout;
  assert.deepEqual(mergedPublishedLayout.modes.star, layout);
  assert.deepEqual(mergedPublishedLayout.modes.graph, graphLayout);
  assert.deepEqual(mergedPublishedLayout.modes.sets, circleLayout);

  for (const [mode, modeLayout] of [
    ["graph", { ...graphLayout, metrics: { ...graphLayout.metrics, lineCrossings: 1 } }],
    ["sets", { ...circleLayout, metrics: { ...circleLayout.metrics, lineCrossings: 1 } }]
  ]) {
    const rejected = createResponse();
    assert.equal(await handleRequest({
      method: "PUT",
      url: `/admin/puzzles/lab-d1-play/layout.json?mode=${mode}`,
      headers: { host: "127.0.0.1:8787", origin: "http://127.0.0.1:8787" },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from(JSON.stringify({ mode, layout: modeLayout }));
      }
    }, rejected), true);
    assert.equal(rejected.status, 400, rejected.body);
    assert.match(rejected.body, /zero line crossings/);
  }

  const unsupportedMode = createResponse();
  assert.equal(await handleRequest({
    method: "PUT",
    url: "/admin/puzzles/lab-d1-play/layout.json?mode=bogus",
    headers: { host: "127.0.0.1:8787", origin: "http://127.0.0.1:8787" },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify({ mode: "bogus", layout: graphLayout }));
    }
  }, unsupportedMode), true);
  assert.equal(unsupportedMode.status, 400, unsupportedMode.body);
  assert.match(unsupportedMode.body, /Unsupported layout mode/);

  const clearGraph = createResponse();
  assert.equal(await handleRequest({
    method: "DELETE",
    url: "/admin/puzzles/lab-d1-play/layout.json?mode=graph",
    headers: { host: "127.0.0.1:8787", origin: "http://127.0.0.1:8787" }
  }, clearGraph), true);
  assert.equal(clearGraph.status, 200, clearGraph.body);
  const afterGraphClear = (await repo.getPublished({
    kind: "puzzle",
    id: "lab-d1-play"
  })).layout;
  assert.equal(afterGraphClear.modes.graph, undefined);
  assert.deepEqual(afterGraphClear.modes.star, layout);
  assert.deepEqual(afterGraphClear.modes.sets, circleLayout);

  // A working copy starts without its own layout column. Its first selected
  // mode save must inherit the published envelope, or publishing that draft
  // would accidentally drop the other already-confirmed modes.
  const existingDraftDirectory = await mkdtemp(
    join(tmpdir(), "cc-play-corpus-existing-layout-")
  );
  try {
    const draftStore = createPuzzleDraftStore({ directory: existingDraftDirectory });
    await draftStore.createDraft({
      draftId: "lab-d1-play-draft",
      document: labPuzzle
    });
    const handleExistingDraft = createLocalDraftReviewHandler({
      draftStore,
      contentDocuments: repo,
      publicationActor: actor,
      repositoryRoot: root
    });
    const saveExistingGraph = createResponse();
    assert.equal(await handleExistingDraft({
      method: "PUT",
      url: "/admin/drafts/lab-d1-play-draft/layout.json?mode=graph",
      headers: {
        host: "127.0.0.1:8787",
        origin: "http://127.0.0.1:8787",
        "content-type": "application/json"
      },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from(JSON.stringify({ mode: "graph", layout: graphLayout }));
      }
    }, saveExistingGraph), true);
    assert.equal(saveExistingGraph.status, 200, saveExistingGraph.body);
    const existingDraftLayout = (await draftStore.getDraft("lab-d1-play-draft")).layout;
    assert.deepEqual(existingDraftLayout.modes.star, layout);
    assert.deepEqual(existingDraftLayout.modes.graph, graphLayout);
    assert.deepEqual(existingDraftLayout.modes.sets, circleLayout);

    for (const mode of ["star", "sets", "graph"]) {
      const clearDraftMode = createResponse();
      assert.equal(await handleExistingDraft({
        method: "DELETE",
        url: `/admin/drafts/lab-d1-play-draft/layout.json?mode=${mode}`,
        headers: { host: "127.0.0.1:8787", origin: "http://127.0.0.1:8787" }
      }, clearDraftMode), true);
      assert.equal(clearDraftMode.status, 200, clearDraftMode.body);
    }
    assert.deepEqual(
      (await draftStore.getDraft("lab-d1-play-draft")).layout,
      emptyLayoutDocument()
    );
    const clearedDraftLayout = createResponse();
    assert.equal(await handleExistingDraft({
      method: "GET",
      url: "/admin/drafts/lab-d1-play-draft/layout.json",
      headers: { host: "127.0.0.1:8787", origin: "http://127.0.0.1:8787" }
    }, clearedDraftLayout), true);
    assert.deepEqual(JSON.parse(clearedDraftLayout.body).layout, emptyLayoutDocument());
  } finally {
    await rm(existingDraftDirectory, { recursive: true, force: true });
  }

  const unpublishedDraftDirectory = await mkdtemp(
    join(tmpdir(), "cc-play-corpus-unpublished-layout-")
  );
  try {
    const draftStore = createPuzzleDraftStore({ directory: unpublishedDraftDirectory });
    const unpublishedDocument = {
      ...labPuzzle,
      id: "lab-unpublished-layout",
      title: "Lab unpublished layout"
    };
    await draftStore.createDraft({
      draftId: "lab-unpublished-layout-draft",
      document: unpublishedDocument
    });
    const { puzzle: unpublishedPuzzle } = compilePublishedPuzzle(unpublishedDocument);
    const unpublishedLayout = {
      ...layout,
      puzzleId: unpublishedPuzzle.id,
      puzzleRevision: starLayoutRevision(unpublishedPuzzle),
      nodes: Object.fromEntries(
        expectedStarLayoutNodeKeys(unpublishedPuzzle).map((key, index) => [
          key,
          { x: 40 + index * 20, y: 40 }
        ])
      )
    };
    const unpublishedGraphLayout = {
      ...graphLayout,
      puzzleId: unpublishedPuzzle.id,
      puzzleRevision: starLayoutRevision(unpublishedPuzzle),
      nodes: Object.fromEntries(expectedGraphLayoutNodeKeys(unpublishedPuzzle).map((key, index) => [
        key,
        { x: 80 + index * 24, y: 180, pinned: true }
      ]))
    };
    const handleUnpublishedDraft = createLocalDraftReviewHandler({
      draftStore,
      contentDocuments: repo,
      publicationActor: actor,
      repositoryRoot: root
    });
    const saveUnpublishedLayout = createResponse();
    assert.equal(await handleUnpublishedDraft({
      method: "PUT",
      url: "/admin/drafts/lab-unpublished-layout-draft/layout.json",
      headers: {
        host: "127.0.0.1:8787",
        origin: "http://127.0.0.1:8787",
        "content-type": "application/json"
      },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from(JSON.stringify({
          layout: layoutDocumentForMode("star", unpublishedLayout)
        }));
      }
    }, saveUnpublishedLayout), true);
    assert.equal(saveUnpublishedLayout.status, 200, saveUnpublishedLayout.body);
    assert.deepEqual(
      (await draftStore.getDraft("lab-unpublished-layout-draft")).layout,
      layoutDocumentForMode("star", unpublishedLayout)
    );
    const saveUnpublishedGraph = createResponse();
    assert.equal(await handleUnpublishedDraft({
      method: "PUT",
      url: "/admin/drafts/lab-unpublished-layout-draft/layout.json?mode=graph",
      headers: {
        host: "127.0.0.1:8787",
        origin: "http://127.0.0.1:8787",
        "content-type": "application/json"
      },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from(JSON.stringify({ mode: "graph", layout: unpublishedGraphLayout }));
      }
    }, saveUnpublishedGraph), true);
    assert.equal(saveUnpublishedGraph.status, 200, saveUnpublishedGraph.body);
    const unpublishedMergedLayout = (await draftStore.getDraft(
      "lab-unpublished-layout-draft"
    )).layout;
    assert.deepEqual(unpublishedMergedLayout.modes.star, unpublishedLayout);
    assert.deepEqual(unpublishedMergedLayout.modes.graph, unpublishedGraphLayout);
    await assert.rejects(
      repo.getPublished({ kind: "puzzle", id: "lab-unpublished-layout" }),
      /Unknown puzzle/
    );

    const unpublishedPlay = createResponse();
    assert.equal(await handleUnpublishedDraft({
      method: "GET",
      url: "/admin/drafts/lab-unpublished-layout-draft/play.json"
    }, unpublishedPlay), true);
    assert.deepEqual(JSON.parse(unpublishedPlay.body).puzzle.layout, unpublishedMergedLayout);
    assert.deepEqual(JSON.parse(unpublishedPlay.body).puzzle.starLayout, unpublishedLayout);

    const publishUnpublished = createResponse();
    assert.equal(await handleUnpublishedDraft({
      method: "POST",
      url: "/admin/drafts/lab-unpublished-layout-draft",
      headers: {
        host: "127.0.0.1:8787",
        origin: "http://127.0.0.1:8787",
        "content-type": "application/x-www-form-urlencoded"
      },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from("confirm=publish");
      }
    }, publishUnpublished), true);
    assert.equal(publishUnpublished.status, 303, publishUnpublished.body);
    assert.deepEqual(
      (await repo.getPublished({ kind: "puzzle", id: "lab-unpublished-layout" })).layout,
      unpublishedMergedLayout
    );
    await repo.unpublish({ kind: "puzzle", id: "lab-unpublished-layout", actor });
  } finally {
    await rm(unpublishedDraftDirectory, { recursive: true, force: true });
  }

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
  const draftDir = await mkdtemp(join(tmpdir(), "cc-play-corpus-drafts-"));
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") pageErrors.push(message.text());
  });
  try {
    const draftStore = createPuzzleDraftStore({ directory: draftDir });
    await draftStore.createDraft({
      draftId: "lab-browser-unpublished-draft",
      document: {
        ...labPuzzle,
        id: "lab-browser-unpublished",
        title: "Lab browser unpublished"
      }
    });
    await draftStore.createDraft({
      draftId: "vocabulary-single-cluster-draft",
      document: {
        id: "vocabulary-single-cluster",
        title: "Single-cluster Vocabulary",
        category: "science",
        puzzleKind: "vocabulary-context",
        clusters: [{
          id: "near-synonyms",
          name: "Near Synonyms",
          fact: "These words overlap in meaning but differ in usage.",
          terms: ["innate", "intrinsic", "inherent"]
        }],
        lenses: [{
          id: "innate-context",
          prompt: "The response was ___ rather than learned.",
          targets: ["innate"],
          explanation: "Innate describes a quality or response present from birth or arising naturally."
        }],
        lensMode: "sequential"
      }
    });
    const handleBrowserPlay = createLocalPlayCorpusHandler({
      contentDocuments: repo,
      contentService: { puzzles: [{ id: "lab-d1-play" }], catalogues: [], categories: {} },
      listDrafts: () => draftStore.listDrafts({ includeDocument: true }),
      repositoryRoot: root
    });
    const handleDrafts = createLocalDraftReviewHandler({
      draftStore,
      repositoryRoot: root
    });
    const handleBrowserRequest = async (req, res) =>
      (await handleBrowserPlay(req, res)) || (await handleDrafts(req, res));
    const server = await startServer(root, { handleRequest: handleBrowserRequest });
    const baseURL = serverURL(server);
    try {
      await page.goto(`${baseURL}/index.html`, { waitUntil: "networkidle" });
      await page.evaluate(() => localStorage.clear());
      await page.goto(
        `${baseURL}/?puzzle=vocabulary-single-cluster-draft&play&mode=graph`,
        { waitUntil: "networkidle" }
      );
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "vocabulary-single-cluster" &&
        CC.state.phase === "lens-selecting",
      null, { timeout: 15000 });
      assert.equal(await page.evaluate(() => CC.state.puzzle.preSolve), true);
      assert.deepEqual(
        await page.evaluate(() => [CC.state.made, CC.state.need]),
        [1, 1],
        "single-cluster Vocabulary should be solved automatically before its lens"
      );

      await page.goto(
        `${baseURL}/?puzzle=lab-browser-unpublished-draft&play&author=layout`,
        { waitUntil: "networkidle" }
      );
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-browser-unpublished"
        && !document.getElementById("layout-authoring")?.hidden,
      null, { timeout: 15000 });
      await page.click("#layout-authoring-prepare");
      await page.waitForFunction(() => window.CC?.state?.solutionLayout === "pretty", null, {
        timeout: 15000
      });
      await page.click("#layout-authoring-save-layout");
      await page.waitForFunction(() =>
        document.getElementById("layout-authoring-status")?.textContent === "Layout saved to D1.",
      null, { timeout: 15000 });
      assert.ok(
        (await draftStore.getDraft("lab-browser-unpublished-draft")).layout,
        "Save Layout did not persist the unpublished draft override"
      );

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
      assert.deepEqual(
        await page.evaluate(() => CC.state.puzzle.bridges[0].clusters),
        [0, 1],
        "D1 play must use the compiled board rather than the corpus browse record"
      );
      assert.notEqual(await page.getAttribute("#admin-layout-actions", "hidden"), null);

      await page.goto(`${baseURL}/?puzzle=lab-d1-play&author=layout`, {
        waitUntil: "networkidle"
      });
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && document.getElementById("layout-authoring")
        && !document.getElementById("layout-authoring").hidden,
      null, { timeout: 15000 });
      assert.equal(await page.textContent("#layout-authoring-save-layout"), "Save Layout");
      await page.click("#layout-authoring-prepare");
      await page.waitForFunction(() => window.CC?.state?.solutionLayout === "pretty", null, {
        timeout: 15000
      });
      await page.click("#layout-authoring-save-layout");
      await page.waitForFunction(() =>
        document.getElementById("layout-authoring-status")?.textContent === "Layout saved to D1.",
      null, { timeout: 15000 });
      assert.ok(
        (await repo.getPublished({ kind: "puzzle", id: "lab-d1-play" })).layout,
        "Save Layout did not persist the D1 override"
      );

      await page.goto(`${baseURL}/?puzzle=lab-d1-play`, { waitUntil: "networkidle" });
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && !document.getElementById("show-solution")?.disabled,
      null, { timeout: 15000 });

      await page.click("#show-solution");
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && CC.state.made === CC.state.need
        && CC.state.need > 0,
      null, { timeout: 15000 });
      await page.click("#reset");
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && CC.state.made === 0
        && CC.state.need > 0,
      null, { timeout: 15000 });
      const adminPlayUrl = new URL(page.url());
      adminPlayUrl.searchParams.set("admin", "");
      await page.goto(adminPlayUrl.toString(), { waitUntil: "networkidle" });
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && document.getElementById("admin-layout-actions")
        && !document.getElementById("admin-layout-actions").hidden,
      null, { timeout: 15000 });
      assert.equal(await page.isVisible("#puzzle-edit-link"), true);
      assert.equal(
        await page.getAttribute("#puzzle-edit-link", "href"),
        "/admin/drafts/lab-d1-play"
      );

      // D1 always wins on the authoring surface, including over the
      // published row with the same puzzle id. The unified `?puzzle=` URL
      // must still enter Construct rather than the normal player loader.
      await draftStore.createDraft({
        draftId: "lab-d1-play-draft",
        document: { ...labPuzzle, title: "Draft Lab D1 play" }
      });
      await page.goto(`${baseURL}/?puzzle=lab-d1-play`, { waitUntil: "networkidle" });
      await page.waitForSelector('#authoring-studio button[data-mode="play"]:not([disabled])', {
        timeout: 15000
      });
      assert.equal(await page.evaluate(() => CC.state.puzzle.title), "Draft Lab D1 play");
      assert.equal(await page.isVisible("#show-solution"), false);
      assert.notEqual(await page.getAttribute("#admin-layout-actions", "hidden"), null);

      await page.click('#authoring-studio button[data-mode="play"]');
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && CC.state.need > 0
        && !document.body.classList.contains("authoring-construct")
        && new URL(location.href).searchParams.get("puzzle") === "lab-d1-play"
        && new URL(location.href).searchParams.has("play")
        && document.getElementById("authoring-studio")?.hidden,
      null, { timeout: 15000 });
      await page.goBack();
      await page.waitForFunction(() =>
        document.body.classList.contains("authoring-construct")
        && document.getElementById("authoring-studio")
        && !document.getElementById("authoring-studio").hidden
        && !new URL(location.href).searchParams.has("play"),
      null, { timeout: 15000 });

      await page.goto(`${baseURL}/?puzzle=lab-d1-play&play`, { waitUntil: "networkidle" });
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && CC.state.need > 0
        && !document.body.classList.contains("authoring-construct"),
      null, { timeout: 15000 });
      assert.deepEqual(
        await page.evaluate(() => CC.state.puzzle.bridges[0].clusters),
        [0, 1],
        "an unpublished D1 draft preview must compile bridge references"
      );
      assert.equal(await page.isVisible("#show-solution"), true);
      assert.equal(await page.isVisible("#authoring-studio"), false);
      assert.notEqual(await page.getAttribute("#admin-layout-actions", "hidden"), null);
      await page.click("#show-solution");
      await page.waitForFunction(() =>
        window.CC?.state?.made === CC.state.need && CC.state.need > 0,
      null, { timeout: 15000 });
      await page.click("#reset");
      await page.waitForFunction(() =>
        window.CC?.state?.puzzle?.id === "lab-d1-play"
        && CC.state.made === 0
        && CC.state.need > 0
        && new URL(location.href).searchParams.get("puzzle") === "lab-d1-play"
        && document.getElementById("authoring-studio")?.hidden,
      null, { timeout: 15000 });

      // Existing explicit-draft bookmarks retain their exact behavior.
      await page.goto(`${baseURL}/?draft=lab-d1-play-draft`, { waitUntil: "networkidle" });
      await page.waitForSelector('#authoring-studio button[data-mode="play"]:not([disabled])', {
        timeout: 15000
      });
    } finally {
      server.close();
    }
  } finally {
    await rm(draftDir, { recursive: true, force: true });
  }
  assert.equal(pageErrors.length, 0, `console errors:\n${pageErrors.join("\n")}`);
}
