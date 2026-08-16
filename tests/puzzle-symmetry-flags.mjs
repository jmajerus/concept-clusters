import assert from "node:assert/strict";
import { computeSymmetryFlags } from "../modules/puzzleSymmetryFlags.js";

export const name = "puzzle symmetry flags: intra-puzzle count-matching heuristics";

// Per-check thresholds were tuned against this project's actual puzzle
// corpus (151 puzzles as of writing), not picked in the abstract -- a
// uniform "3+ items all match" rule fired on 135/151 puzzles (89%), which
// is a description of the norm, not a signal. Two things drove that:
// clusters only ever hold 3-6 terms (2 seeds + 1-4 floatingTerms), so
// several clusters landing on *some* shared count is near-guaranteed by
// pigeonhole once a puzzle has 3+ clusters, regardless of authorial
// intent; and bridge termRole's default ("reference") was being treated
// as a real value, so "nobody set it" (the common case -- it's an
// optional pedagogical classification most authors never reach for) read
// as "everyone agreed". Fixing both, plus raising bridge-count checks'
// threshold (3 bridges is this corpus's single most common bridge count,
// so 3 agreeing is mostly coincidence), brought the flagged rate to a much
// more plausible 34/151 (22%).
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

  // --- lens-target-count: unchanged, minItems 3, any value ------------
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

  // --- bridge-term-role: minItems 3, EVERY bridge must agree -----------
  // An omitted termRole no longer counts as its "reference" default --
  // three bridges that all simply never set it gets no flag (an
  // all-unset puzzle isn't "everyone agreed", it's "nobody engaged with
  // the field").
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    bridges: [{}, {}, {}]
  }), []);
  // Same "every item, not a subset" rule as relationKind above: 3
  // bridges explicitly agreeing plus 1 that never set termRole at all
  // does NOT flag.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    bridges: [
      { termRole: "reference" },
      { termRole: "reference" },
      { termRole: "reference" },
      {}
    ]
  }), []);
  const termRoleFlags = computeSymmetryFlags({
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
}
