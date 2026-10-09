import assert from "node:assert/strict";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import {
  autoEnvelopeConflict,
  autoLayoutConflict,
  layoutRevision,
  mergePublishLayout
} from "../modules/layoutDocument.js";
import {
  angleDistance,
  circleLayoutHint,
  graphLayoutHint,
  layoutIsFixed,
  starLayoutTargets,
  validateLayoutHintShape
} from "../modules/layoutHints.js";
import { validatePublishedPuzzleLayout } from "../modules/layoutPublication.js";
import { layoutAttention, layoutDefects } from "../modules/layoutAttention.js";
import { layoutPointsFitBoard, recentreLayoutDocument, recentredSavedLayout } from "../modules/layoutRecentre.js";
import { boardCanvas } from "../modules/puzzleBoardSize.js";
import { validateStarLayoutDocument } from "../modules/starLayoutSchema.js";
import {
  draftEditorPublicationRedirectPath,
  draftPublicationNoticeFromSearch
} from "../modules/draftReviewEdit.js";

export const name = "layout hints: saved arrangements survive puzzle edits and board changes";

const BOARD = { width: 1000, height: 700 };

function documentWith(clusterIds, { rename = null, extra = null } = {}) {
  return {
    id: "hint-lab",
    title: "Hint lab",
    category: "Test",
    clusters: clusterIds.map(id => ({
      id,
      name: id,
      fact: "Fact.",
      seeds: [`${id} one`, rename && rename[0] === `${id} two` ? rename[1] : `${id} two`],
      floatingTerms: [`${id} three`, ...(extra && extra[0] === id ? [extra[1]] : [])]
    })),
    bridges: [
      [["a", "b"], "ab"],
      [["c", "d"], "cd"]
    ].map(([clusters, term]) => ({
      term,
      fact: "Fact.",
      clusters,
      idealTerms: Object.fromEntries(clusters.map(id => [id, `${id} one`]))
    }))
  };
}

function compile(document) {
  const { puzzle, errors } = puzzleFromAuthoredDocument(document);
  assert.deepEqual(errors, []);
  return puzzle;
}

// Cluster centres around the board centre, one per slot, in `order`.
function ring(order, rotation, board = BOARD) {
  const centres = [];
  order.forEach((ci, slot) => {
    const angle = rotation + slot * Math.PI * 2 / order.length;
    centres[ci] = {
      x: board.width / 2 + board.width * 0.3 * Math.cos(angle),
      y: board.height / 2 + board.height * 0.3 * Math.sin(angle)
    };
  });
  return centres;
}

function graphLayout(puzzle, centres, extra = {}) {
  const nodes = {};
  puzzle.clusters.forEach((cluster, ci) => {
    cluster.terms.forEach((term, i) => {
      nodes[`term:${term}`] = { x: centres[ci].x + 40 * Math.cos(i), y: centres[ci].y + 40 * Math.sin(i) };
    });
  });
  puzzle.bridges.forEach(bridge => {
    const [a, b] = bridge.clusters.map(ci => centres[ci]);
    nodes[`term:${bridge.term}`] = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  });
  return {
    schemaVersion: 1,
    puzzleId: puzzle.id,
    puzzleRevision: layoutRevision(puzzle),
    board: BOARD,
    nodes,
    metrics: { lineCrossings: 0, edgeNodeIntersections: 0, overlaps: 0 },
    ...extra
  };
}

function circleLayout(puzzle, centres, extra = {}) {
  return {
    schemaVersion: 1,
    puzzleId: puzzle.id,
    puzzleRevision: layoutRevision(puzzle),
    board: BOARD,
    circles: Object.fromEntries(centres.map((centre, ci) => [`cluster:${ci}`, centre])),
    bridges: Object.fromEntries(puzzle.bridges.map(bridge => {
      const [a, b] = bridge.clusters.map(ci => centres[ci]);
      return [`term:${bridge.term}`, { x: (a.x + b.x) / 2 + 30, y: (a.y + b.y) / 2 }];
    })),
    clusterTerms: Object.fromEntries(
      puzzle.clusters.map((cluster, ci) => [`cluster:${ci}`, [...cluster.terms]])
    ),
    ...extra
  };
}

export async function run() {
  const document = documentWith(["a", "b", "c", "d"]);
  const puzzle = compile(document);
  const order = [0, 2, 1, 3];
  const rotation = -Math.PI / 3;
  const centres = ring(order, rotation);

  // Graph: the saved ring order and rotation come back out.
  const graph = graphLayout(puzzle, centres);
  const graphHint = graphLayoutHint(graph, puzzle, BOARD);
  assert.deepEqual(graphHint.order, order);
  assert.ok(angleDistance(graphHint.rotation, rotation) < 0.05, `rotation ${graphHint.rotation}`);
  assert.equal(graphHint.termOffsets.size, 12);

  // A renamed term and an added term: the arrangement still reads the
  // same; the new term simply has no offset.
  const edited = compile(documentWith(["a", "b", "c", "d"], {
    rename: ["b two", "b second"],
    extra: ["c", "c four"]
  }));
  const editedHint = graphLayoutHint(graph, edited, BOARD);
  assert.deepEqual(editedHint.order, order);
  assert.ok(!editedHint.termOffsets.has("c four"));
  assert.ok(!editedHint.termOffsets.has("b second"));

  // A different board size keeps the arrangement too.
  const wide = graphLayoutHint(graph, puzzle, { width: 1300, height: 700 });
  assert.deepEqual(wide.order, order);

  // Circle: membership finds each circle after clusters are reordered.
  const circle = circleLayout(puzzle, centres);
  assert.deepEqual(circleLayoutHint(circle, puzzle, BOARD).order, order);
  const reordered = compile(documentWith(["b", "a", "c", "d"]));
  // Current index 0 is "b" (saved cluster:1), index 1 is "a" (saved 0).
  const reorderedHint = circleLayoutHint(circle, reordered, BOARD);
  const savedSlot = new Map(order.map((ci, slot) => [ci, slot]));
  const expected = [1, 0, 2, 3]
    .map((savedCi, currentCi) => ({ currentCi, slot: savedSlot.get(savedCi) }))
    .sort((x, y) => x.slot - y.slot)
    .map(entry => entry.currentCi);
  const start = expected.indexOf(0);
  assert.deepEqual(reorderedHint.order, [...expected.slice(start), ...expected.slice(0, start)]);
  assert.equal(circleLayoutHint(circle, puzzle, BOARD).bridgeOffsets.size, 2);

  // Without saved membership (older layouts) circles match by index.
  const legacyCircle = circleLayout(puzzle, centres);
  delete legacyCircle.clusterTerms;
  assert.deepEqual(circleLayoutHint(legacyCircle, puzzle, BOARD).order, order);

  // A lone cluster (vocabulary puzzles) still yields a hint: its terms'
  // offsets for Graph, its saved spot for Circle.
  const solo = compile({
    id: "hint-solo",
    title: "Solo",
    category: "Test",
    puzzleKind: "vocabulary-context",
    clusters: [{ id: "a", name: "a", fact: "Fact.", seeds: ["a one", "a two"], floatingTerms: ["a three"] }],
    bridges: []
  });
  const soloGraph = graphLayoutHint({
    puzzleId: solo.id,
    board: BOARD,
    nodes: { "term:a one": { x: 100, y: 500 }, "term:a two": { x: 150, y: 520 }, "term:a three": { x: 130, y: 470 } }
  }, solo, BOARD);
  assert.deepEqual(soloGraph.order, [0]);
  assert.equal(soloGraph.termOffsets.size, 3);
  const soloCircle = circleLayoutHint({
    puzzleId: solo.id, board: BOARD, circles: { "cluster:0": { x: 200, y: 450 } }
  }, solo, BOARD);
  assert.deepEqual(soloCircle.centres[0], { x: 200, y: 450 });

  // A malformed saved board size falls back to the current board instead
  // of mirroring or collapsing the arrangement.
  const badBoard = circleLayoutHint({ ...circle, board: { width: -1000, height: Infinity } }, puzzle, BOARD);
  assert.deepEqual(badBoard.order, order);
  assert.deepEqual(badBoard.centres[0], centres[0]);

  // Fixed flag: layouts saved before it existed are fixed.
  assert.equal(layoutIsFixed({}), true);
  assert.equal(layoutIsFixed({ fixed: true }), true);
  assert.equal(layoutIsFixed({ fixed: false }), false);

  // Shape: the wrong puzzle or a non-finite coordinate is unusable.
  assert.equal(validateLayoutHintShape("graph", { ...graph, puzzleId: "other" }, puzzle).valid, false);
  const broken = graphLayout(puzzle, centres);
  broken.nodes["term:a one"] = { x: "left", y: 4 };
  assert.equal(validateLayoutHintShape("graph", broken, puzzle).valid, false);

  // Publication: an edit leaves the saved Graph layout stale.
  const envelope = modes => ({ schemaVersion: 1, modes });
  const editedDocument = documentWith(["a", "b", "c", "d"], { rename: ["b two", "b second"] });
  const stale = validatePublishedPuzzleLayout({
    document: editedDocument,
    layout: envelope({ graph })
  });
  assert.equal(stale.valid, true, stale.errors.join("; "));
  assert.ok(stale.warnings.some(warning => warning.includes("players get it as a hint")));
  assert.deepEqual(stale.fallbackModes, ["graph"]);
  // ...and the author is told on the publication notice.
  const redirect = new URL(draftEditorPublicationRedirectPath({
    draftId: "hint-lab-draft",
    puzzleId: puzzle.id,
    revision: 3,
    layoutFallback: stale.fallbackModes
  }), "http://local");
  const notice = draftPublicationNoticeFromSearch(redirect.searchParams, { id: puzzle.id, revision: 3 });
  assert.deepEqual(notice.layoutFallback, ["graph"]);
  // ...but saving it as fixed positions right now must match exactly.
  const savingStale = validatePublishedPuzzleLayout({
    document: editedDocument,
    layout: envelope({ graph }),
    savingMode: "graph"
  });
  assert.equal(savingStale.valid, false);
  // A hint is fine either way, with nothing to warn about.
  const hint = validatePublishedPuzzleLayout({
    document: editedDocument,
    layout: envelope({ graph: { ...graph, fixed: false } }),
    savingMode: "graph"
  });
  assert.equal(hint.valid, true, hint.errors.join("; "));
  assert.deepEqual(hint.warnings, []);
  // A malformed hint is still rejected.
  const malformed = validatePublishedPuzzleLayout({
    document,
    layout: envelope({ graph: { ...broken, fixed: false } })
  });
  assert.equal(malformed.valid, false);
  // Star: a saved layout is never dropped. Build the renderer's node list
  // (terms and bridges, plus one title per cluster) and a saved layout.
  const starNodes = p => [
    ...p.clusters.flatMap((cluster, ci) => cluster.terms.map(word => ({ word, gs: [ci] }))),
    ...p.bridges.map(bridge => ({ word: bridge.term, gs: bridge.clusters })),
    ...p.clusters.map((cluster, ci) => ({ isTitleNode: true, ci, word: cluster.name, x: 1, y: 1 }))
  ];
  const starSaved = {
    schemaVersion: 1,
    puzzleId: puzzle.id,
    puzzleRevision: layoutRevision(puzzle),
    board: BOARD,
    nodes: Object.fromEntries([
      ...puzzle.clusters.map((_, ci) => [`cluster:${ci}`, centres[ci]]),
      ...puzzle.clusters.flatMap((cluster, ci) => cluster.terms.map((term, i) => [
        `term:${term}`, { x: centres[ci].x + 50 * Math.cos(i), y: centres[ci].y + 50 * Math.sin(i) }
      ])),
      ...puzzle.bridges.map(bridge => [`term:${bridge.term}`, { x: 500, y: 350 }])
    ])
  };
  const exactStar = starLayoutTargets(starSaved, puzzle, starNodes(puzzle), BOARD, { exact: true });
  assert.equal(exactStar.exact, true);
  assert.equal(exactStar.placed, 0);
  // A wider board scales positions rather than discarding them.
  const wideStar = starLayoutTargets(starSaved, puzzle, starNodes(puzzle), { width: 1500, height: 700 });
  const wideA = [...wideStar.targets].find(([node]) => node.word === "a one")[1];
  assert.ok(Math.abs(wideA.x - starSaved.nodes["term:a one"].x * 1.5) < 1e-6);
  // Reordered clusters keep their titles beside their own terms, and a
  // new term is the only node placed fresh.
  const starEdited = compile(documentWith(["b", "a", "c", "d"], { extra: ["d", "d four"] }));
  const adapted = starLayoutTargets(starSaved, starEdited, starNodes(starEdited), BOARD);
  assert.equal(adapted.exact, false);
  assert.equal(adapted.placed, 1);
  const titleOf = name => [...adapted.targets].find(([node]) => node.isTitleNode && node.word === name)[1];
  assert.deepEqual(titleOf("a"), centres[0]);
  assert.deepEqual(titleOf("b"), centres[1]);
  assert.equal(starLayoutTargets({ ...starSaved, puzzleId: "other" }, puzzle, starNodes(puzzle), BOARD), null);

  // Publishing a working copy never overwrites a newer published layout.
  const at = iso => ({ savedAt: iso, nodes: {} });
  const older = envelope({ graph: at("2026-10-01T00:00:00Z"), star: at("2026-10-05T00:00:00Z") });
  const newer = envelope({ graph: at("2026-10-03T00:00:00Z"), star: at("2026-10-04T00:00:00Z") });
  const merged = mergePublishLayout(older, newer);
  assert.deepEqual(merged.keptPublished, ["graph"]);
  assert.equal(merged.layout.modes.graph.savedAt, "2026-10-03T00:00:00Z");
  assert.equal(merged.layout.modes.star.savedAt, "2026-10-05T00:00:00Z");
  // Without stamps (older saves) the working copy wins, as before.
  assert.deepEqual(mergePublishLayout(envelope({ graph: { nodes: {} } }), envelope({ graph: { nodes: {} } })).keptPublished, []);
  // An automatic layout never overwrites an author's on publish, even when
  // newer; an author layout replaces an automatic one regardless of age.
  const autoAt = iso => ({ ...at(iso), source: "auto" });
  assert.deepEqual(mergePublishLayout(
    envelope({ graph: autoAt("2026-10-06T00:00:00Z") }),
    envelope({ graph: at("2026-10-01T00:00:00Z") })
  ).keptPublished, ["graph"]);
  assert.deepEqual(mergePublishLayout(
    envelope({ graph: at("2026-10-01T00:00:00Z") }),
    envelope({ graph: autoAt("2026-10-06T00:00:00Z") })
  ).keptPublished, []);
  // Saving: automatic over author is refused, author over anything and
  // automatic over automatic are fine.
  assert.match(autoLayoutConflict("graph", { source: "auto" }, envelope({ graph: at("2026-10-01T00:00:00Z") })), /never replaces/);
  assert.equal(autoLayoutConflict("graph", { source: "auto" }, envelope({ graph: autoAt("2026-10-01T00:00:00Z") })), null);
  assert.equal(autoLayoutConflict("graph", { source: "author" }, envelope({ graph: autoAt("2026-10-01T00:00:00Z") })), null);
  assert.equal(autoLayoutConflict("graph", { source: "auto" }, null), null);
  // A whole-document write is checked mode by mode.
  assert.match(autoEnvelopeConflict(
    envelope({ star: autoAt("2026-10-06T00:00:00Z"), graph: autoAt("2026-10-06T00:00:00Z") }),
    envelope({ graph: at("2026-10-01T00:00:00Z") })
  ), /never replaces/);
  assert.equal(autoEnvelopeConflict(
    envelope({ star: autoAt("2026-10-06T00:00:00Z") }),
    envelope({ graph: at("2026-10-01T00:00:00Z") })
  ), null);
  assert.equal(autoEnvelopeConflict("not a layout", null), null);

  // No working-copy layout: the published one carries over.
  assert.equal(mergePublishLayout(null, newer).layout.modes.graph.savedAt, "2026-10-03T00:00:00Z");

  // Star: a layout with no positions is unusable; a stale one is carried
  // through a content edit with a warning, but saving it must match.
  const emptyStar = validatePublishedPuzzleLayout({
    document,
    layout: envelope({ star: { schemaVersion: 1, puzzleId: puzzle.id, nodes: {} } })
  });
  assert.equal(emptyStar.valid, false);
  const staleStar = validatePublishedPuzzleLayout({
    document: editedDocument,
    layout: envelope({ star: starSaved })
  });
  assert.equal(staleStar.valid, true, staleStar.errors.join("; "));
  assert.ok(staleStar.warnings.some(warning => warning.includes("adapted")));
  assert.equal(validatePublishedPuzzleLayout({
    document: editedDocument,
    layout: envelope({ star: starSaved }),
    savingMode: "star"
  }).valid, false);

  // Star counts lines through titles inside edgeNodeIntersections; defects
  // split them so each hit counts once, and a layout saved before the
  // title count existed keeps a neutral combined count.
  assert.deepEqual(
    layoutDefects("star", { lineCrossings: 0, edgeNodeIntersections: 3, edgeTitleIntersections: 1, overlaps: 0 }),
    { edgeTitleIntersections: 1, edgeNodeIntersections: 2, total: 3 }
  );
  assert.deepEqual(
    layoutDefects("star", { lineCrossings: 0, edgeNodeIntersections: 2, overlaps: 0 }),
    { edgeIntersections: 2, total: 2 }
  );
  assert.deepEqual(layoutDefects("graph", { lineCrossings: 1, hardOverlaps: 0 }), { lineCrossings: 1, total: 1 });
  assert.deepEqual(layoutDefects("graph", null), { total: null });
  // Items near the board's edge are counted into hardOverlaps; they are
  // reported on their own, not as overlaps too.
  assert.deepEqual(
    layoutDefects("sets", { hardOverlaps: 2, boundsViolations: 2, lineCrossings: 0 }),
    { boundsViolations: 2, total: 2 }
  );
  assert.deepEqual(
    layoutDefects("graph", { hardOverlaps: 3, overlaps: 1, boundsViolations: 2 }),
    { hardOverlaps: 1, boundsViolations: 2, total: 3 }
  );
  const starMetrics = metrics => ({ ...starSaved, metrics });
  assert.equal(validateStarLayoutDocument(starMetrics({ lineCrossings: 0, edgeNodeIntersections: 1, overlaps: 0 }), puzzle).errors
    .some(error => error.includes("edgeTitleIntersections")), false, "the title count is optional");
  assert.ok(validateStarLayoutDocument(starMetrics({ lineCrossings: 0, edgeNodeIntersections: 1, edgeTitleIntersections: 2, overlaps: 0 }), puzzle).errors
    .some(error => error.includes("edgeTitleIntersections")), "titles are among the combined count");

  // Attention: a fixed layout is outdated by a puzzle edit or a board-size
  // change; a hint never is.
  const starBoard = boardCanvas(puzzle);
  const freshStar = { ...starSaved, board: starBoard, metrics: { lineCrossings: 0, edgeNodeIntersections: 0, overlaps: 0 } };
  const graphHintLayout = { ...graph, fixed: false };
  const attention = layoutAttention({ document, layout: envelope({ star: freshStar, graph: graphHintLayout }) });
  assert.equal(attention.star.stale, false);
  assert.equal(attention.star.defects.total, 0);
  assert.equal(attention.graph.stale, false, "a hint is never outdated");
  assert.equal(attention.sets, undefined);
  assert.equal(layoutAttention({ document: editedDocument, layout: envelope({ star: freshStar }) }).star.stale, true);
  // A size-only change re-centres the layout; it is outdated only when it
  // no longer fits.
  const roomy = { width: starBoard.width + 200, height: starBoard.height + 200 };
  assert.equal(layoutAttention({ document, layout: envelope({ star: { ...freshStar, board: roomy } }) }).star.stale, false);
  const cramped = { width: 120, height: 90 };
  assert.equal(layoutAttention({ document, layout: envelope({ star: { ...freshStar, board: cramped } }) }).star.stale, true);

  // Re-centring keeps every position's place relative to the board centre.
  const moved = recentreLayoutDocument({ board: { width: 100, height: 80 }, nodes: { a: { x: 10, y: 20 } }, circles: { c: { x: 50, y: 40, pinned: true } } }, { width: 120, height: 100 });
  assert.deepEqual(moved.board, { width: 120, height: 100 });
  assert.deepEqual(moved.nodes.a, { x: 20, y: 30 });
  assert.deepEqual(moved.circles.c, { x: 60, y: 50, pinned: true });
  const same = { board: { width: 100, height: 80 }, nodes: {} };
  assert.equal(recentreLayoutDocument(same, { width: 100, height: 80 }), same);
  assert.equal(layoutPointsFitBoard(recentreLayoutDocument({ board: { width: 100, height: 80 }, nodes: { a: { x: 2, y: 40 } } }, { width: 90, height: 80 })), false,
    "shrinking past a position no longer fits");
  // A saved fixed layout for an unchanged puzzle moves onto a new size; an
  // edited puzzle's or a hint's does not.
  const recentred = recentredSavedLayout(envelope({ star: freshStar }), puzzle, "star", roomy);
  assert.equal(recentred.board.width, roomy.width);
  assert.equal(recentredSavedLayout(envelope({ star: freshStar }), compile(editedDocument), "star", roomy), null);
  assert.equal(recentredSavedLayout(envelope({ graph: graphHintLayout }), puzzle, "graph", roomy), null);
}
