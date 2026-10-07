import assert from "node:assert/strict";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import { layoutRevision } from "../modules/layoutDocument.js";
import {
  angleDistance,
  circleLayoutHint,
  graphLayoutHint,
  layoutIsFixed,
  validateLayoutHintShape
} from "../modules/layoutHints.js";
import { validatePublishedPuzzleLayout } from "../modules/layoutPublication.js";

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
  // Star keeps exact-only rules for now.
  const star = validatePublishedPuzzleLayout({
    document,
    layout: envelope({ star: { schemaVersion: 1, puzzleId: puzzle.id, nodes: {} } })
  });
  assert.equal(star.valid, false);
}
