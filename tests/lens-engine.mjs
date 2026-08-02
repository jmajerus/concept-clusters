import assert from "node:assert/strict";
import {
  assignmentConceptWords,
  assignmentComplete,
  assignmentTargetMap,
  lensAssignmentResult,
  normalizedLensMode,
  selectableConceptWords
} from "../modules/lensEngine.js";
import { lensColorMap } from "../modules/colorPalette.js";
import { validatePuzzleLenses } from "../modules/lensValidation.js";

export const name = "lens engine: partial assignment sets, completion, and results";

function assignmentPuzzle() {
  return {
    id: "assignment-fixture",
    lensMode: "assignment",
    clusters: [
      { color: "teal", terms: ["a1", "a2", "a3"] },
      { color: "blue", terms: ["b1", "b2", "b3"] }
    ],
    bridges: [{ term: "bridge", clusters: [0, 1] }],
    lenses: [
      {
        id: "first",
        label: "First lens",
        definition: "A brief explanation of the first terse label.",
        prompt: "First?",
        targets: ["a1", "a2", "b1", "bridge"],
        explanation: "First explanation.",
        reasons: { bridge: "The bridge belongs here." }
      },
      {
        id: "second",
        label: "Second lens",
        prompt: "Second?",
        targets: ["a3", "b2"],
        explanation: "Second explanation."
      }
    ]
  };
}

function errorsFor(change) {
  const puzzle = assignmentPuzzle();
  change(puzzle);
  return validatePuzzleLenses(puzzle);
}

export async function run() {
  const puzzle = assignmentPuzzle();
  assert.equal(normalizedLensMode({}), "sequential");
  assert.equal(normalizedLensMode({ lensMode: "sequential" }), "sequential");
  assert.equal(normalizedLensMode(puzzle), "assignment");
  assert.deepEqual(selectableConceptWords(puzzle), [
    "a1", "a2", "a3", "b1", "b2", "b3", "bridge"
  ]);
  assert.deepEqual(assignmentConceptWords(puzzle), [
    "a1", "a2", "b1", "bridge", "a3", "b2"
  ]);
  assert.equal(assignmentTargetMap(puzzle).get("bridge"), "first");
  assert.deepEqual([...lensColorMap(puzzle)], [
    ["first", "amber"],
    ["second", "magenta"]
  ]);

  const sevenColorFixture = {
    clusters: ["teal", "blue", "amber", "magenta"].map(color => ({ color })),
    lenses: [{ id: "one" }, { id: "two" }, { id: "three" }]
  };
  assert.deepEqual([...lensColorMap(sevenColorFixture)], [
    ["one", "olive"],
    ["two", "brown"],
    ["three", "cyan"]
  ]);
  sevenColorFixture.lenses[0].color = "cyan";
  assert.deepEqual([...lensColorMap(sevenColorFixture)], [
    ["one", "cyan"],
    ["two", "olive"],
    ["three", "brown"]
  ]);

  const assignments = new Map([
    ["a1", "first"], ["a2", "first"], ["a3", "second"],
    ["b1", "first"], ["b2", "second"],
    ["bridge", "first"]
  ]);
  assert.equal(assignmentComplete(puzzle, assignments), true);
  assignments.delete("bridge");
  assert.equal(assignmentComplete(puzzle, assignments), false);
  assignments.set("bridge", "not-a-lens");
  assert.equal(assignmentComplete(puzzle, assignments), false);
  assignments.set("bridge", "first");

  assignments.set("a3", "first");
  const result = lensAssignmentResult(puzzle, assignments);
  assert.equal(result.correctCount, 5);
  assert.equal(result.totalCount, 6);
  assert.deepEqual(result.incorrect, [{
    word: "a3",
    selectedLensId: "first",
    correctLensId: "second"
  }]);
  assert.deepEqual(result.unassigned, []);
  const partial = new Map(assignments);
  partial.delete("b2");
  assert.deepEqual(lensAssignmentResult(puzzle, partial).unassigned, [{
    word: "b2",
    correctLensId: "second"
  }]);
  assert.deepEqual(validatePuzzleLenses(puzzle), []);

  assert.ok(errorsFor(p => p.lenses[1].targets.push("a1"))
    .some(error => error.includes('appears in lenses "first" and "second"')));
  assert.ok(errorsFor(p => { p.lensMode = "ranking"; })
    .some(error => error.includes("unknown lensMode")));
  assert.ok(errorsFor(p => { p.lenses[1].id = "first"; })
    .some(error => error.includes("duplicate id")));
  assert.ok(errorsFor(p => { p.lenses = p.lenses.slice(0, 1); })
    .some(error => error.includes("at least two lenses")));
  assert.ok(errorsFor(p => { p.lenses[0].targets = []; })
    .some(error => error.includes("non-empty array")));
  assert.ok(errorsFor(p => { p.lenses[0].reasons.outside = "No."; })
    .some(error => error.includes('"outside" is not one of the targets')));
  assert.ok(errorsFor(p => { p.lenses[0].definition = ""; })
    .some(error => error.includes("definition must be a non-empty string")));
  assert.ok(errorsFor(p => { p.lenses[0].color = "bridge"; })
    .some(error => error.includes('unknown lens color "bridge"')));
  assert.ok(errorsFor(p => {
    p.lenses[0].color = "cyan";
    p.lenses[1].color = "cyan";
  }).some(error => error.includes('lens color "cyan" is already used')));
  assert.ok(errorsFor(p => { p.lenses[1].targets.push("not a concept"); })
    .some(error => error.includes('"not a concept" is not a puzzle term')));

  const sequential = assignmentPuzzle();
  sequential.lensMode = "sequential";
  sequential.lenses[0].targets = ["a1", "a2", "b1"];
  sequential.lenses[1].targets = ["a1", "a3", "b2"];
  sequential.lenses[0].reasons = {};
  assert.deepEqual(validatePuzzleLenses(sequential), []);
}
