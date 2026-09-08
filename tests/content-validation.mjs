import assert from "node:assert/strict";
import {
  validatePuzzleContent,
  repairEscapedQuotes,
  ESCAPED_QUOTE_ERRORS_SHOWN
} from "../modules/contentValidation.js";

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
      error.includes("is not one of its terms") && error.endsWith("[escaped-quote]")
    ),
    `termInfo key wrapped in literal quotes should be tagged [escaped-quote], got: ${JSON.stringify(termInfoErrors)}`
  );
  assert.ok(
    termInfoErrors.some(error =>
      error.includes("1 error above marked [escaped-quote]") &&
      error.includes('e.g. "a"')
    ),
    `a single hit should get one summary line naming the mistake, got: ${JSON.stringify(termInfoErrors)}`
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
    seedErrors.some(error => error.includes("not in terms") && error.endsWith("[escaped-quote]")),
    `seed wrapped in literal quotes should be tagged [escaped-quote], got: ${JSON.stringify(seedErrors)}`
  );

  // A draft with several of the same mistake should collapse to one
  // summary line, not restate the explanation on every affected error.
  const manyEscapedKeys = minimalPuzzle({
    clusters: [{
      name: "One",
      terms: ["a", "b", "c"],
      seeds: ["a", "b"],
      color: "teal",
      termInfo: {
        '"a"': { text: "One." },
        '"b"': { text: "Two." },
        '"c"': { text: "Three." }
      }
    }, {
      name: "Two",
      terms: ["d", "e", "f"],
      seeds: ["d", "e"],
      color: "blue"
    }]
  });
  const manyErrors = validatePuzzleContent(manyEscapedKeys, { knownPuzzleIds: registered });
  assert.equal(
    manyErrors.filter(error => error.includes("stray/escaped quote characters")).length,
    1,
    `several escaped-quote mistakes should still yield exactly one summary line, got: ${JSON.stringify(manyErrors)}`
  );
  assert.ok(
    manyErrors.some(error => error.includes("3 errors above marked [escaped-quote]")),
    `summary should report the actual hit count, got: ${JSON.stringify(manyErrors)}`
  );

  // Past the cap, individual [escaped-quote] lines stop being listed one
  // per hit -- a truncation note and the summary still carry the real
  // total, but the client isn't handed hundreds of near-identical lines.
  const overCap = ESCAPED_QUOTE_ERRORS_SHOWN + 5;
  const terms = Array.from({ length: overCap }, (_, i) => `t${i}`);
  const termInfo = {};
  for (const term of terms) termInfo[`"${term}"`] = { text: "Escaped." };
  const manyMoreEscapedKeys = {
    id: "board-a",
    title: "Board A",
    category: "Biology",
    clusters: [{
      name: "One",
      terms: [...terms, "seed1", "seed2"],
      seeds: ["seed1", "seed2"],
      color: "teal",
      termInfo
    }],
    bridges: []
  };
  const overCapErrors = validatePuzzleContent(manyMoreEscapedKeys, { knownPuzzleIds: registered });
  const taggedLines = overCapErrors.filter(error => error.endsWith("[escaped-quote]"));
  assert.equal(
    taggedLines.length,
    ESCAPED_QUOTE_ERRORS_SHOWN,
    `individual [escaped-quote] lines should be capped at ${ESCAPED_QUOTE_ERRORS_SHOWN}, got ${taggedLines.length}: ${JSON.stringify(overCapErrors)}`
  );
  assert.ok(
    overCapErrors.some(error => error.includes(`...and ${overCap - ESCAPED_QUOTE_ERRORS_SHOWN} more [escaped-quote] errors`)),
    `a truncation note should account for the hidden hits, got: ${JSON.stringify(overCapErrors)}`
  );
  assert.ok(
    overCapErrors.some(error => error.includes(`${overCap} errors above marked [escaped-quote]`)),
    `the summary should still report the true total, not just the shown count, got: ${JSON.stringify(overCapErrors)}`
  );

  // repairEscapedQuotes: mechanically fixes what escapedQuoteFix flags,
  // instead of a client having to script its own stripper (see the
  // Gemini incident this was built for).
  const repaired = repairEscapedQuotes(escapedTermInfoKey);
  assert.deepEqual(repaired.changes, [{
    path: "One.termInfo",
    from: '"a"',
    to: "a"
  }]);
  assert.deepEqual(Object.keys(repaired.document.clusters[0].termInfo), ["a"]);
  assert.deepEqual(
    validatePuzzleContent(repaired.document, { knownPuzzleIds: registered }),
    [],
    "the repaired document should validate cleanly"
  );
  // The input document itself is never mutated.
  assert.deepEqual(Object.keys(escapedTermInfoKey.clusters[0].termInfo), ['"a"']);

  const repairedSeed = repairEscapedQuotes(escapedSeed);
  assert.deepEqual(repairedSeed.changes, [{
    path: "One.seeds[0]",
    from: '"a"',
    to: "a"
  }]);
  assert.deepEqual(repairedSeed.document.clusters[0].seeds, ["a", "b"]);

  // A termInfo key whose fix would collide with an existing real key is
  // left alone rather than silently discarding the real entry's content.
  const collision = minimalPuzzle({
    clusters: [{
      name: "One",
      terms: ["a", "b", "c"],
      seeds: ["a", "b"],
      color: "teal",
      termInfo: {
        a: { text: "Real entry for a." },
        '"a"': { text: "Escaped-quote duplicate." }
      }
    }, {
      name: "Two",
      terms: ["d", "e", "f"],
      seeds: ["d", "e"],
      color: "blue"
    }]
  });
  const repairedCollision = repairEscapedQuotes(collision);
  assert.deepEqual(repairedCollision.changes, []);
  assert.equal(repairedCollision.document, collision);

  // Nothing to fix: same object back, no changes reported.
  const noopInput = minimalPuzzle();
  const noop = repairEscapedQuotes(noopInput);
  assert.deepEqual(noop.changes, []);
  assert.equal(noop.document, noopInput);
}
