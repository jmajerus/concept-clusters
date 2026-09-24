import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import {
  BOARD_CANVAS,
  NODE_CAP_STANDARD,
  NODE_CAP_XLARGE,
  boardCanvas,
  boardFrameMaxWidth,
  boardLoad,
  derivedLarge,
  largeField,
  puzzleEdgeCount,
  puzzleNodeCount,
  puzzleTermCharacters
} from "../modules/puzzleBoardSize.js";

export const name = "puzzleBoardSize: derive canvas from nodes, edges, and term length";

function puzzleWithTerms(termCount, bridgeCount = 0) {
  const clusters = [
    { terms: Array.from({ length: Math.ceil(termCount / 2) }, (_, i) => `a${i}`) },
    { terms: Array.from({ length: Math.floor(termCount / 2) }, (_, i) => `b${i}`) }
  ];
  return {
    clusters,
    bridges: Array.from({ length: bridgeCount }, (_, i) => ({ term: `bridge-${i}` }))
  };
}

function sizedPuzzle({ clusterSizes, bridgeCount, bridgeSpan, termLength }) {
  const clusters = clusterSizes.map(count => {
    const terms = Array.from({ length: count }, (_, index) => "t".repeat(termLength) + index);
    return { terms, seeds: terms.slice(0, Math.min(2, terms.length)) };
  });
  const bridges = Array.from({ length: bridgeCount }, () => ({
    term: "b".repeat(termLength),
    clusters: Array.from({ length: bridgeSpan }, (_, index) => index)
  }));
  return { clusters, bridges };
}

function legacyCanvas(puzzle, mode) {
  const nodes = puzzleNodeCount(puzzle);
  const clusters = puzzle.clusters.length;
  if (nodes > 0 && nodes <= 8) return BOARD_CANVAS.compact;
  if (derivedLarge(nodes)) return mode === "sets" ? BOARD_CANVAS.circleWide : BOARD_CANVAS.wide;
  if (mode !== "graph" && clusters >= 2) return BOARD_CANVAS.wide;
  return BOARD_CANVAS.standard;
}

export async function run() {
  assert.equal(NODE_CAP_STANDARD, 16);
  assert.equal(NODE_CAP_XLARGE, 32);

  assert.equal(puzzleNodeCount(puzzleWithTerms(15)), 15);
  assert.equal(puzzleNodeCount(puzzleWithTerms(14, 1)), 15);
  assert.equal(derivedLarge(15), false);
  assert.equal(derivedLarge(16), false);
  assert.equal(derivedLarge(17), true);
  assert.equal(derivedLarge(25), true);
  assert.equal(derivedLarge(40), true);

  assert.deepEqual(largeField(16), {});
  assert.deepEqual(largeField(17), { large: true });
  assert.deepEqual(largeField(40), { large: true });

  const lone = puzzleWithTerms(5);
  lone.clusters = [lone.clusters[0]];
  assert.equal(boardCanvas(lone, "sets"), BOARD_CANVAS.compact);
  assert.equal(boardCanvas(lone, "star"), BOARD_CANVAS.compact);
  assert.equal(boardCanvas(lone, "graph"), BOARD_CANVAS.compact);

  const ordinary = puzzleWithTerms(12);
  assert.equal(boardCanvas(ordinary, "graph"), BOARD_CANVAS.standard);
  assert.equal(boardCanvas(ordinary, "star"), BOARD_CANVAS.wide);
  assert.equal(boardCanvas(ordinary, "sets"), BOARD_CANVAS.wide);

  const crowded = puzzleWithTerms(18);
  assert.equal(boardCanvas(crowded, "graph"), BOARD_CANVAS.wide);
  assert.equal(boardCanvas(crowded, "star"), BOARD_CANVAS.wide);
  assert.equal(boardCanvas(crowded, "sets"), BOARD_CANVAS.circleWide);
  assert.equal(boardFrameMaxWidth(BOARD_CANVAS.wide), null);
  assert.equal(boardFrameMaxWidth(BOARD_CANVAS.circleWide), null);

  const short = sizedPuzzle({
    clusterSizes: [7, 7, 7, 7],
    bridgeCount: 2,
    bridgeSpan: 2,
    termLength: 4
  });
  const wordy = sizedPuzzle({
    clusterSizes: [7, 7, 7, 7],
    bridgeCount: 2,
    bridgeSpan: 2,
    termLength: 28
  });
  const bridged = sizedPuzzle({
    clusterSizes: [6, 6, 6, 6],
    bridgeCount: 6,
    bridgeSpan: 3,
    termLength: 4
  });
  assert.equal(puzzleNodeCount(short), 30);
  assert.equal(puzzleNodeCount(wordy), 30);
  assert.equal(puzzleNodeCount(bridged), 30);
  assert.ok(puzzleTermCharacters(wordy) > puzzleTermCharacters(short));
  assert.ok(puzzleEdgeCount(bridged) > puzzleEdgeCount(short));
  assert.ok(boardLoad(wordy) > boardLoad(short));
  assert.ok(boardLoad(bridged) > boardLoad(short));

  assert.equal(boardCanvas(short, "graph"), BOARD_CANVAS.wide);
  const wordyGraph = boardCanvas(wordy, "graph");
  const bridgedGraph = boardCanvas(bridged, "graph");
  assert.deepEqual(wordyGraph, { width: 1150, height: 740 });
  assert.deepEqual(bridgedGraph, { width: 970, height: 630 });
  assert.ok(wordyGraph.width > bridgedGraph.width);
  assert.equal(boardFrameMaxWidth(wordyGraph), 1198);

  const heavy = sizedPuzzle({
    clusterSizes: [7, 7, 7, 7],
    bridgeCount: 4,
    bridgeSpan: 2,
    termLength: 16
  });
  assert.equal(puzzleNodeCount(heavy), NODE_CAP_XLARGE);
  assert.deepEqual(boardCanvas(heavy, "graph"), { width: 1090, height: 700 });
  assert.deepEqual(boardCanvas(heavy, "sets"), { width: 1190, height: 880 });
  assert.equal(boardFrameMaxWidth(boardCanvas(heavy, "graph")), 1135);

  for (const puzzle of PUZZLES) {
    for (const mode of ["graph", "star", "sets"]) {
      assert.equal(
        boardCanvas(puzzle, mode),
        legacyCanvas(puzzle, mode),
        `${puzzle.id} ${mode} should stay on its current canvas`
      );
    }
  }
}
