import assert from "node:assert/strict";
import {
  NODE_CAP_LARGE,
  NODE_CAP_STANDARD,
  derivedLarge,
  largeField,
  puzzleNodeCount
} from "../modules/puzzleBoardSize.js";

export const name = "puzzleBoardSize: derive large from node count";

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

export async function run() {
  assert.equal(NODE_CAP_STANDARD, 16);
  assert.equal(NODE_CAP_LARGE, 24);

  assert.equal(puzzleNodeCount(puzzleWithTerms(15)), 15);
  assert.equal(puzzleNodeCount(puzzleWithTerms(14, 1)), 15);
  assert.equal(derivedLarge(15), false);
  assert.equal(derivedLarge(16), false);
  assert.equal(derivedLarge(17), true);
  assert.equal(derivedLarge(24), true);
  assert.equal(derivedLarge(25), true);

  assert.deepEqual(largeField(16), {});
  assert.deepEqual(largeField(17), { large: true });
  assert.deepEqual(largeField(24), { large: true });
  assert.deepEqual(largeField(25), { large: true });
}
