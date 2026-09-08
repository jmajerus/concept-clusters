import assert from "node:assert/strict";
import { validatePuzzleContent } from "../modules/contentValidation.js";

export const name = "contentValidation: relatedPuzzles sibling ids";

function minimalPuzzle(overrides = {}) {
  return {
    id: "board-a",
    title: "Board A",
    category: "Biology",
    clusters: [
      {
        name: "One",
        terms: ["a", "b", "c"],
        seeds: ["a", "b"],
        color: "teal"
      },
      {
        name: "Two",
        terms: ["d", "e", "f"],
        seeds: ["d", "e"],
        color: "blue"
      }
    ],
    bridges: [],
    ...overrides
  };
}

export async function run() {
  const registered = new Set(["board-a"]);
  const forwardLink = minimalPuzzle({
    relatedPuzzles: {
      info: { text: "Continue the sequence." },
      entries: [{
        id: "board-b",
        reason: "Pick up where this board leaves off."
      }]
    }
  });
  const knownForForward = new Set(registered);
  for (const entry of forwardLink.relatedPuzzles.entries) {
    knownForForward.add(entry.id);
  }
  assert.deepEqual(
    validatePuzzleContent(forwardLink, { knownPuzzleIds: knownForForward }),
    [],
    "unregistered sibling id in own relatedPuzzles.entries should validate"
  );

  const reciprocal = minimalPuzzle({
    id: "board-b",
    title: "Board B",
    relatedPuzzles: {
      entries: [{
        id: "board-a",
        reason: "Start with the measurement board."
      }]
    }
  });
  const bothRegistered = new Set(["board-a", "board-b"]);
  assert.deepEqual(
    validatePuzzleContent(reciprocal, { knownPuzzleIds: bothRegistered }),
    []
  );

  const typo = minimalPuzzle({
    relatedPuzzles: {
      entries: [{
        id: "not-a-real-board",
        reason: "This should still fail when the id is not self-referenced."
      }]
    }
  });
  assert.ok(
    validatePuzzleContent(typo, { knownPuzzleIds: registered })
      .some(error => error.includes("not a real puzzle id")),
    "unrelated typo ids should still fail"
  );

  const escapedTermInfoKey = minimalPuzzle({
    clusters: [{
      name: "One",
      terms: ["a", "b", "c"],
      seeds: ["a", "b"],
      color: "teal",
      termInfo: { '"a"': { text: "Escaped-quote mistake." } }
    }, {
      name: "Two",
      terms: ["d", "e", "f"],
      seeds: ["d", "e"],
      color: "blue"
    }]
  });
  const termInfoErrors = validatePuzzleContent(escapedTermInfoKey, { knownPuzzleIds: registered });
  assert.ok(
    termInfoErrors.some(error =>
      error.includes("is not one of its terms") &&
      error.includes("stray/escaped quote characters") &&
      error.includes('did you mean "a"?')
    ),
    `termInfo key wrapped in literal quotes should name the escaping mistake, got: ${JSON.stringify(termInfoErrors)}`
  );

  const escapedSeed = minimalPuzzle({
    clusters: [{
      name: "One",
      terms: ["a", "b", "c"],
      seeds: ['"a"', "b"],
      color: "teal"
    }, {
      name: "Two",
      terms: ["d", "e", "f"],
      seeds: ["d", "e"],
      color: "blue"
    }]
  });
  const seedErrors = validatePuzzleContent(escapedSeed, { knownPuzzleIds: registered });
  assert.ok(
    seedErrors.some(error =>
      error.includes("not in terms") &&
      error.includes("stray/escaped quote characters")
    ),
    `seed wrapped in literal quotes should name the escaping mistake, got: ${JSON.stringify(seedErrors)}`
  );
}
