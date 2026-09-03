import assert from "node:assert/strict";
import {
  computeAuthoringFlags,
  computeBridgeTermRoleFlags,
  computeLensReasonCoverageFlags,
  computeLensShapeFlags,
  computeSymmetryFlags,
  computeUserOnlyAuthoringFlags
} from "../modules/puzzleSymmetryFlags.js";

export const name = "puzzle symmetry flags: intra-puzzle count-matching heuristics";

// Per-check thresholds were tuned against this project's actual puzzle
// corpus (151 puzzles as of writing), not picked in the abstract -- a
// uniform "3+ items all match" rule fired on 135/151 puzzles (89%), which
// is a description of the norm, not a signal. Two things drove that:
// clusters only ever hold 3-6 terms (2 seeds + 1-4 floatingTerms), so
// several clusters landing on *some* shared count is near-guaranteed by
// pigeonhole once a puzzle has 3+ clusters, regardless of authorial
// intent. Raising bridge-count checks' threshold (3 bridges is this
// corpus's single most common bridge count, so 3 agreeing is mostly
// coincidence) brought the flagged rate to a much more plausible 34/151
// (22%).
//
// Lens-target-count later got the same high-end exception as
// cluster-term-count: two lenses matching at 3–4 is the two-lens norm,
// but two matching at >= 5 is rare and is the cap-packing tell.
//
// One more rule applies everywhere: a real symmetry-chaser converges on
// every item, not most of them, so every check requires *all* items in
// the set to share the value -- a single deviation (one differing count,
// or for the optional bridge fields, one bridge that simply never set the
// field at all) removes the flag entirely, the same as a differing value
// would. See uniformCount() itself for the mechanism.

function cluster(termCount) {
  return { terms: Array.from({ length: termCount }, (_, i) => `term-${i}`) };
}

export async function run() {
  // Nothing to flag: no puzzle, or a puzzle whose counts don't converge.
  assert.deepEqual(computeSymmetryFlags(null), []);
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(3), cluster(4), cluster(5)]
  }), []);

  // --- cluster-term-count: only the high end (>= 5) counts -----------
  // Every cluster landing on a *low* shared count (3-4) is common enough
  // on its own (pigeonhole, given the 3-6 range) to carry no signal.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(3), cluster(3), cluster(3)]
  }), []);
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(4), cluster(4), cluster(4)]
  }), []);
  // Three or more clusters landing on the exact same *high* term count --
  // the original real-world case ("exactly 5 nodes in every cluster").
  const clusterFlags = computeSymmetryFlags({
    clusters: [cluster(5), cluster(5), cluster(5)]
  });
  assert.equal(clusterFlags.length, 1);
  assert.equal(clusterFlags[0].id, "cluster-term-count");
  assert.match(clusterFlags[0].message, /All 3 clusters have exactly 5 terms/);
  // A partial match (3 of 4 clusters share a count, one doesn't) still
  // isn't the same signal as "every cluster".
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(5), cluster(5), cluster(5), cluster(6)]
  }), []);

  // --- lens-target-count: 3+ at any value, or 2+ at the high end (>= 5)
  const lensFlags = computeSymmetryFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c", "d"] },
      { targets: ["e", "f", "g", "h"] },
      { targets: ["i", "j", "k", "l"] }
    ]
  });
  assert.equal(lensFlags.length, 1);
  assert.equal(lensFlags[0].id, "lens-target-count");
  assert.match(lensFlags[0].message, /All 3 lenses have exactly 4 targets/);
  // Two lenses matching on 3–4 is the common case; no flag.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c"] },
      { targets: ["d", "e", "f"] }
    ]
  }), []);
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c", "d"] },
      { targets: ["e", "f", "g", "h"] }
    ]
  }), []);
  // A single maxed-out lens is not intra-puzzle symmetry.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    lenses: [{ targets: ["a", "b", "c", "d", "e", "f"] }]
  }), []);
  // Two lenses at the high end (>= 5) is the cap-packing signal.
  const twoHigh = computeSymmetryFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c", "d", "e"] },
      { targets: ["f", "g", "h", "i", "j"] }
    ]
  });
  assert.equal(twoHigh.length, 1);
  assert.equal(twoHigh[0].id, "lens-target-count");
  assert.match(twoHigh[0].message, /All 2 lenses have exactly 5 targets/);
  assert.match(twoHigh[0].message, /ceiling/);

  // --- bridge-relation-kind: minItems 4, EVERY bridge must agree -------
  // Real symmetry-chasing shows up on every item, not a subset -- so an
  // unset bridge is itself a deviation, not a non-participant excluded
  // from the comparison. 4 bridges that agree plus 1 that never set
  // relationKind at all does NOT flag, even though "4 of 5 agree" would
  // read as strong symmetry under a looser rule.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      {}
    ]
  }), []);
  // 3 bridges agreeing isn't enough anymore -- needs 4.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic", termRole: "reference" },
      { relationKind: "dynamic", termRole: "connector" },
      { relationKind: "dynamic", termRole: "reference" }
    ]
  }), []);
  const relationFlags = computeSymmetryFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic", termRole: "reference" },
      { relationKind: "dynamic", termRole: "connector" },
      { relationKind: "dynamic", termRole: "reference" },
      { relationKind: "dynamic", termRole: "connector" }
    ]
  });
  assert.equal(relationFlags.length, 1);
  assert.equal(relationFlags[0].id, "bridge-relation-kind");
  assert.match(relationFlags[0].message, /All 4 bridges.*"dynamic"/);

  // --- bridge-term-role: minItems 3, EVERY bridge must agree (user-only,
  // computed separately from computeSymmetryFlags -- see
  // puzzleSymmetryFlags.js) -----------------------------------------------
  // An omitted termRole no longer counts as its "reference" default --
  // three bridges that all simply never set it gets no flag (an
  // all-unset puzzle isn't "everyone agreed", it's "nobody engaged with
  // the field").
  assert.deepEqual(computeBridgeTermRoleFlags({
    clusters: [],
    bridges: [{}, {}, {}]
  }), []);
  // Same "every item, not a subset" rule as relationKind above: 3
  // bridges explicitly agreeing plus 1 that never set termRole at all
  // does NOT flag.
  assert.deepEqual(computeBridgeTermRoleFlags({
    clusters: [],
    bridges: [
      { termRole: "reference" },
      { termRole: "reference" },
      { termRole: "reference" },
      {}
    ]
  }), []);
  const termRoleFlags = computeBridgeTermRoleFlags({
    clusters: [],
    bridges: [
      { termRole: "reference" },
      { termRole: "reference" },
      { termRole: "reference" }
    ]
  });
  assert.equal(termRoleFlags.length, 1);
  assert.equal(termRoleFlags[0].id, "bridge-term-role");
  assert.match(termRoleFlags[0].message, /All 3 bridges are termRole "reference"/);

  // --- bridge-touch-count: minItems 4 ----------------------------------
  // Zero bridges overall is the trivial, meaningless case (never
  // flagged); a real shared nonzero count needs 4+ clusters agreeing now.
  assert.equal(
    computeSymmetryFlags({
      clusters: [cluster(2), cluster(2), cluster(2)],
      bridges: []
    }).find(flag => flag.id === "bridge-touch-count"),
    undefined
  );
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(1), cluster(1), cluster(1)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 0] }
    ]
  }).filter(flag => flag.id === "bridge-touch-count"), []);
  const touchFlags = computeSymmetryFlags({
    clusters: [cluster(1), cluster(1), cluster(1), cluster(1)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 3] },
      { clusters: [3, 0] }
    ]
  });
  const touchFlag = touchFlags.find(flag => flag.id === "bridge-touch-count");
  assert.ok(touchFlag, "expected a bridge-touch-count flag");
  assert.match(touchFlag.message, /Every cluster touches exactly 2 bridges/);

  // A puzzle with genuinely varied counts throughout gets no flags at all.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(3), cluster(4), cluster(5)],
    lenses: [{ targets: ["a"] }, { targets: ["a", "b"] }],
    bridges: [
      { relationKind: "dynamic", clusters: [0, 1] },
      { relationKind: "contrast", clusters: [1, 2] }
    ]
  }), []);

  // --- lens-whole-cluster: sequential recitation of one cluster --------
  const wholeCluster = computeLensShapeFlags({
    clusters: [
      { name: "Internal", terms: ["internal focalization", "free indirect discourse", "stream of consciousness"] },
      { name: "External", terms: ["zero focalization", "external focalization", "camera-eye"] }
    ],
    lenses: [{
      id: "inside-one-mind",
      targets: ["internal focalization", "free indirect discourse", "stream of consciousness"]
    }]
  });
  assert.equal(wholeCluster.length, 1);
  assert.equal(wholeCluster[0].id, "lens-whole-cluster");
  assert.match(wholeCluster[0].message, /inside-one-mind/);
  assert.match(wholeCluster[0].message, /Internal/);
  // A two-term cut inside the cluster is the desired shape, not a recitation.
  assert.deepEqual(computeLensShapeFlags({
    clusters: [
      { name: "Internal", terms: ["internal focalization", "free indirect discourse", "stream of consciousness"] }
    ],
    lenses: [{ targets: ["internal focalization", "free indirect discourse"] }]
  }), []);
  // Quiz and assignment modes do not use this sequential recitation check.
  assert.deepEqual(computeLensShapeFlags({
    lensMode: "quiz",
    clusters: [{ name: "Internal", terms: ["a", "b", "c"] }],
    lenses: [{ targets: ["a", "b", "c"] }]
  }), []);

  const clusterPlusBridges = computeLensShapeFlags({
    clusters: [
      { name: "Amber", terms: ["one", "two", "three"] },
      { name: "Blue", terms: ["four", "five", "six"] }
    ],
    bridges: [{ term: "span", clusters: [0, 1] }],
    lenses: [{ id: "amber-and-span", targets: ["one", "two", "three", "span"] }]
  });
  assert.equal(clusterPlusBridges.length, 1);
  assert.equal(clusterPlusBridges[0].id, "lens-cluster-plus-bridges");

  // --- lens-reasons-coverage: reasons are all-or-none ------------------
  const partialReasons = computeLensReasonCoverageFlags({
    lenses: [{
      id: "why-it-belongs",
      targets: ["one", "two", "three"],
      reasons: { one: "It fits." }
    }]
  });
  assert.equal(partialReasons.length, 1);
  assert.equal(partialReasons[0].id, "lens-reasons-coverage");
  assert.match(partialReasons[0].message, /1 of 3 targets/);
  assert.match(partialReasons[0].message, /"two", "three"/);
  assert.deepEqual(computeLensReasonCoverageFlags({
    lenses: [{ targets: ["one", "two"], reasons: {} }]
  }), []);
  assert.deepEqual(computeLensReasonCoverageFlags({
    lenses: [{ targets: ["one", "two"], reasons: { one: "One.", two: "Two." } }]
  }), []);

  assert.equal(
    computeAuthoringFlags({
      clusters: [{ name: "Internal", terms: ["a", "b", "c"] }],
      lenses: [{ id: "all-amber", targets: ["a", "b", "c"] }]
    }).some(flag => flag.id === "lens-whole-cluster"),
    true
  );
  // lens-reasons-coverage is MCP+user -- computeAuthoringFlags surfaces it
  // directly (an incomplete reasons map usually wants an agent's judgment
  // about what the missing explanation should say). See
  // puzzleSymmetryFlags.js.
  assert.equal(
    computeAuthoringFlags({
      lenses: [{ targets: ["one", "two"], reasons: { one: "One." } }]
    }).some(flag => flag.id === "lens-reasons-coverage"),
    true
  );
  // bridge-term-role is user-only -- computeAuthoringFlags (MCP+user) must
  // not surface it; computeUserOnlyAuthoringFlags does.
  const uniformTermRolePuzzle = {
    bridges: [
      { termRole: "reference" },
      { termRole: "reference" },
      { termRole: "reference" }
    ]
  };
  assert.equal(
    computeAuthoringFlags(uniformTermRolePuzzle).some(flag => flag.id === "bridge-term-role"),
    false
  );
  assert.equal(
    computeUserOnlyAuthoringFlags(uniformTermRolePuzzle).some(flag => flag.id === "bridge-term-role"),
    true
  );
}
