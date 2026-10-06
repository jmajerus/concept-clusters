import assert from "node:assert/strict";
import {
  AWAY_FROM_BRIDGE,
  TOWARD_BRIDGE
} from "../modules/bridgeDirection.js";
import {
  lensFlowTraceEnabled,
  lensFlowTracePlan
} from "../modules/lensFlowTrace.js";

export const name = "lens flow trace: which directed arms pulse, in what order";

const legs = plan => plan.map(leg => `${leg.beat}:${leg.term}:${leg.clusterIndex}:${
  leg.direction === TOWARD_BRIDGE ? "in" : "out"
}`);

export async function run() {
  assert.equal(lensFlowTraceEnabled({ board: { lensFlowTrace: true } }), true);
  assert.equal(lensFlowTraceEnabled({ board: {} }), false);
  assert.equal(lensFlowTraceEnabled({}), false);

  // Clusters 0 -> 1 -> 2 -> 3 through two chained bridges, listed out of
  // order, plus an undirected and a bidirectional bridge that never pulse.
  const puzzle = {
    bridges: [
      { term: "second", clusters: [2, 1], direction: { kind: "through", from: 1, to: 2 } },
      { term: "first", clusters: [0, 1], direction: { kind: "through", from: 0, to: 1 } },
      { term: "third", clusters: [2, 3], direction: { kind: "through", from: 2, to: 3 } },
      { term: "plain", clusters: [0, 3] },
      { term: "both", clusters: [1, 3], direction: { kind: "bidirectional" } },
      { term: "spread", clusters: [0, 2], direction: { kind: "outward" } },
      { term: "gather", clusters: [1, 3], direction: { kind: "inward" } }
    ]
  };

  // A chain reads as one path: each bridge waits for the one feeding it.
  assert.deepEqual(
    legs(lensFlowTracePlan(puzzle, { targets: ["third", "second", "first", "plain", "both"] })),
    ["0:first:0:in", "1:first:1:out", "2:second:1:in", "3:second:2:out", "4:third:2:in", "5:third:3:out"]
  );

  // Only the targeted links of a chain play; an unchained bridge starts at once.
  assert.deepEqual(
    legs(lensFlowTracePlan(puzzle, { targets: ["third"] })),
    ["0:third:2:in", "1:third:3:out"]
  );

  // A lone outward bridge does not idle through an empty inbound beat;
  // inward legs converge together.
  assert.deepEqual(
    legs(lensFlowTracePlan(puzzle, { targets: ["spread"] })),
    ["0:spread:0:out", "0:spread:2:out"]
  );
  assert.deepEqual(
    legs(lensFlowTracePlan(puzzle, { targets: ["gather"] })),
    ["0:gather:1:in", "0:gather:3:in"]
  );

  // An outward bridge feeding a through bridge's source finishes first.
  assert.deepEqual(
    legs(lensFlowTracePlan(puzzle, { targets: ["third", "spread"] })),
    ["0:spread:0:out", "0:spread:2:out", "1:third:2:in", "2:third:3:out"]
  );

  // A quiz answers with its correct option; distractor evidence is not flow.
  const quiz = {
    options: [
      { id: "wrong", targets: ["first"] },
      { id: "right", correct: true, targets: ["spread"] }
    ]
  };
  assert.deepEqual(
    lensFlowTracePlan(puzzle, quiz).map(leg => leg.term),
    ["spread", "spread"]
  );

  // No directed answer, nothing to play; a cycle still terminates.
  assert.deepEqual(lensFlowTracePlan(puzzle, { targets: ["plain", "both"] }), []);
  const cycle = {
    bridges: [
      { term: "a", clusters: [0, 1], direction: { kind: "through", from: 0, to: 1 } },
      { term: "b", clusters: [1, 0], direction: { kind: "through", from: 1, to: 0 } }
    ]
  };
  const cyclic = lensFlowTracePlan(cycle, { targets: ["a", "b"] });
  assert.equal(cyclic.length, 4);
  assert.ok(cyclic.every(leg => [TOWARD_BRIDGE, AWAY_FROM_BRIDGE].includes(leg.direction)));
}
