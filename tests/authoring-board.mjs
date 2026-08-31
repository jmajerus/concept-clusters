import assert from "node:assert/strict";
import { authoringBoardFromDocument } from "../modules/authoringBoard.js";
import { createPuzzleSkeleton } from "../modules/puzzleSkeleton.js";

export const name = "authoring board: lenient compile of partial drafts";

export async function run() {
  const empty = authoringBoardFromDocument(createPuzzleSkeleton({
    id: "blank",
    title: "Blank",
    category: "Science"
  }));
  assert.equal(empty.nodes.length, 0);
  assert.equal(empty.links.length, 0);
  assert.equal(empty.puzzle.clusters.length, 0);

  const oneTerm = authoringBoardFromDocument({
    id: "one",
    title: "One",
    category: "Science",
    clusters: [{
      id: "cluster-1",
      name: "Light",
      color: "teal",
      fact: "",
      seeds: ["photon"],
      floatingTerms: []
    }],
    bridges: []
  });
  assert.equal(oneTerm.nodes.length, 1);
  assert.equal(oneTerm.nodes[0].word, "photon");
  assert.deepEqual(oneTerm.nodes[0].connected, [0]);
  assert.equal(oneTerm.clusterTermCount, 1);

  const withUnplaced = authoringBoardFromDocument({
    id: "unplaced",
    title: "Unplaced",
    category: "Science",
    clusters: [{
      id: "cluster-1",
      name: "Light",
      color: "teal",
      seeds: ["photon"],
      floatingTerms: []
    }],
    bridges: [],
    unplacedTerms: ["electron", "proton"]
  });
  assert.equal(withUnplaced.nodes.length, 3);
  assert.equal(withUnplaced.unplacedCount, 2);
  assert.equal(withUnplaced.nodes.filter(node => node.unplaced).length, 2);

  const bridged = authoringBoardFromDocument({
    id: "bridged",
    title: "Bridged",
    category: "Science",
    clusters: [
      { id: "a", name: "A", color: "teal", seeds: ["alpha"], floatingTerms: [] },
      { id: "b", name: "B", color: "blue", seeds: ["beta"], floatingTerms: [] }
    ],
    bridges: [{ term: "link", clusters: ["a", "b"], fact: "" }]
  });
  const pill = bridged.nodes.find(node => node.word === "link");
  assert.ok(pill);
  assert.deepEqual(pill.gs, [0, 1]);
  assert.deepEqual(pill.connected, [0, 1]);
}
