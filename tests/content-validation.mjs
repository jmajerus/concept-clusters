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
        color: "#336699"
      },
      {
        name: "Two",
        terms: ["d", "e", "f"],
        seeds: ["d", "e"],
        color: "#993366"
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
}
