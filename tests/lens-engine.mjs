import assert from "node:assert/strict";
import {
  assignmentConceptWords,
  assignmentComplete,
  assignmentTargetMap,
  lensAssignmentResult,
  lensCompletionMessage,
  lensNodeClass,
  lensQuizResult,
  lensSpansClusters,
  normalizedLensMode,
  quizOptionForNode,
  quizOptionsForDisplay,
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

function quizPuzzle() {
  return {
    id: "quiz-fixture",
    lensMode: "quiz",
    clusters: [
      { color: "teal", terms: ["a1", "a2", "a3"] },
      { color: "blue", terms: ["b1", "b2", "b3"] }
    ],
    bridges: [{ term: "bridge", clusters: [0, 1] }],
    lenses: [
      {
        id: "which-spans-more",
        prompt: "Which spans more clusters?",
        options: [
          { id: "opt-a", label: "Option A", targets: ["a1", "b1"], correct: true },
          { id: "opt-b", label: "Option B", targets: ["a2"] }
        ],
        explanation: "Option A spans both clusters."
      }
    ]
  };
}

function errorsForQuiz(change) {
  const puzzle = quizPuzzle();
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

  // --- quiz lens mode ---
  const quiz = quizPuzzle();
  assert.equal(normalizedLensMode(quiz), "quiz");
  assert.deepEqual(validatePuzzleLenses(quiz), []);

  const quizLens = quiz.lenses[0];
  const authoredOptionIds = quizLens.options.map(option => option.id);
  const displayedOptionIds = quizOptionsForDisplay(quiz, quizLens)
    .map(option => option.id);
  assert.deepEqual(displayedOptionIds, ["opt-b", "opt-a"]);
  assert.deepEqual(
    quizOptionsForDisplay(quiz, quizLens).map(option => option.id),
    displayedOptionIds,
    "quiz display order remains stable across renders"
  );
  assert.deepEqual(
    quizOptionsForDisplay(quiz, {
      ...quizLens,
      options: [...quizLens.options].reverse()
    }).map(option => option.id),
    displayedOptionIds,
    "authored option position does not control display position"
  );
  assert.deepEqual(
    quizLens.options.map(option => option.id),
    authoredOptionIds,
    "computing display order does not mutate authored content"
  );
  assert.equal(quizOptionForNode({ word: "a1" }, quizLens).id, "opt-a");
  assert.equal(quizOptionForNode({ word: "b1" }, quizLens).id, "opt-a");
  assert.equal(quizOptionForNode({ word: "a2" }, quizLens).id, "opt-b");
  assert.equal(quizOptionForNode({ word: "a3" }, quizLens), null);

  assert.deepEqual(lensQuizResult(quizLens, "opt-a"), {
    correct: true,
    selectedOption: quizLens.options[0],
    correctOption: quizLens.options[0]
  });
  assert.equal(lensQuizResult(quizLens, "opt-b").correct, false);
  assert.equal(lensQuizResult(quizLens, "opt-b").correctOption.id, "opt-a");
  assert.equal(lensQuizResult(quizLens, "unknown").selectedOption, null);

  const answeringState = { puzzle: quiz, lensIndex: 0, phase: "lens-quiz-answering" };
  assert.equal(lensNodeClass({ word: "a1" }, answeringState), "");
  const revealedState = { puzzle: quiz, lensIndex: 0, phase: "lens-revealed" };
  assert.equal(lensNodeClass({ word: "a1" }, revealedState), "lens-correct");
  assert.equal(lensNodeClass({ word: "b1" }, revealedState), "lens-correct");
  assert.equal(lensNodeClass({ word: "a2" }, revealedState), "lens-quiz-incorrect");
  assert.equal(lensNodeClass({ word: "a3" }, revealedState), "");

  assert.ok(errorsForQuiz(p => { p.lenses[0].options = []; })
    .some(error => error.includes("at least two entries")));
  assert.ok(errorsForQuiz(p => { p.lenses[0].options[0].correct = false; })
    .some(error => error.includes("exactly one option must be marked correct")));
  assert.ok(errorsForQuiz(p => { p.lenses[0].options[1].correct = true; })
    .some(error => error.includes("exactly one option must be marked correct")));
  assert.ok(errorsForQuiz(p => { p.lenses[0].options[1].id = "opt-a"; })
    .some(error => error.includes('duplicate option id "opt-a"')));
  assert.ok(errorsForQuiz(p => { p.lenses[0].options[1].targets = ["a1"]; })
    .some(error => error.includes('target "a1" is listed in more than one option')));
  assert.ok(errorsForQuiz(p => { p.lenses[0].options[1].targets = ["not a concept"]; })
    .some(error => error.includes('"not a concept" is not a puzzle term')));
  assert.deepEqual(errorsForQuiz(p => {
    p.lenses[0].options[0].targets = ["a1"];
    p.lenses[0].options[1].targets = ["a2"];
  }), [], "same-cluster quiz option targets remain valid");
  assert.ok(errorsForQuiz(p => { delete p.lenses; })
    .some(error => error.includes("quiz lens mode requires at least one lens")));
  assert.ok(errorsForQuiz(p => { p.lensMode = "ranking"; })
    .some(error => error.includes("unknown lensMode")));

  // --- preSolve ---
  assert.deepEqual(validatePuzzleLenses({ ...quizPuzzle(), preSolve: true }), []);
  assert.ok(errorsForQuiz(p => { p.preSolve = "yes"; })
    .some(error => error.includes("preSolve must be a boolean")));
  assert.ok(validatePuzzleLenses({ id: "no-lenses-fixture", preSolve: true, clusters: [], bridges: [] })
    .some(error => error.includes("preSolve requires at least one lens")));
  assert.deepEqual(validatePuzzleLenses({ id: "no-lenses-fixture", preSolve: false, clusters: [], bridges: [] }), []);

  const reinforcing = {
    id: "rhetorical-fixture",
    clusters: [
      { terms: ["credibility", "character"] },
      { terms: ["emotion", "sympathy"] },
      { terms: ["timing", "occasion", "opportune moment"] }
    ],
    bridges: [{ term: "artistic proofs", clusters: [0, 1] }],
    lenses: [
      { id: "occasion", prompt: "When?", explanation: "e", targets: ["timing", "occasion", "opportune moment"] },
      { id: "speaker", prompt: "Who?", explanation: "e", targets: ["credibility", "character"] }
    ]
  };
  assert.equal(lensSpansClusters(reinforcing, reinforcing.lenses[0]), false);
  assert.match(
    lensCompletionMessage(reinforcing),
    /^You completed the map and examined it through 2 lenses\.$/
  );

  const spanning = {
    ...reinforcing,
    lenses: [{
      id: "proofs",
      prompt: "Proofs?",
      explanation: "e",
      targets: ["credibility", "emotion"]
    }]
  };
  assert.equal(lensSpansClusters(spanning, spanning.lenses[0]), true);
  assert.match(
    lensCompletionMessage(spanning),
    /^You completed the map and examined it through 1 cross-cutting lens\.$/
  );

  assert.match(
    lensCompletionMessage(quizPuzzle()),
    /^You completed the map and examined it through 1 lens\.$/
  );
}
