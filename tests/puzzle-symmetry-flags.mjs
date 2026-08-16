import assert from "node:assert/strict";
import { computeSymmetryFlags } from "../modules/puzzleSymmetryFlags.js";

export const name = "puzzle symmetry flags: intra-puzzle count-matching heuristics";

function cluster(termCount) {
  return { terms: Array.from({ length: termCount }, (_, i) => `term-${i}`) };
}

export async function run() {
  // Nothing to flag: no puzzle, or a puzzle whose counts don't converge.
  assert.deepEqual(computeSymmetryFlags(null), []);
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(3), cluster(4), cluster(5)]
  }), []);

  // Two clusters sharing a count is too common on its own to be a signal --
  // "several" (>= 3) is the trigger, matching authoringDesignGuidance.js's
  // own wording.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(4), cluster(4)]
  }), []);

  // A partial match (3 of 4 clusters share a count, one doesn't) is not
  // the same signal as "every cluster" -- only a set where everything
  // present shares the value fires.
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(5), cluster(5), cluster(5), cluster(6)]
  }), []);

  // Three or more clusters landing on the exact same term count: the
  // original real-world case ("exactly 5 nodes in every cluster"). Every
  // cluster has to match -- a fourth, differing cluster (checked above by
  // the length-4 non-uniform case) means no flag, not a partial one.
  const clusterFlags = computeSymmetryFlags({
    clusters: [cluster(5), cluster(5), cluster(5)]
  });
  assert.equal(clusterFlags.length, 1);
  assert.equal(clusterFlags[0].id, "cluster-term-count");
  assert.match(clusterFlags[0].message, /All 3 clusters have exactly 5 terms/);

  // Lens target counts: the second real-world case ("exactly 4 targets in
  // every lens").
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

  // relationKind: only bridges that actually declared one count toward
  // uniformity -- an undeclared value doesn't count as matching. (These
  // bridges also happen to trigger the separate termRole flag below, since
  // none of them sets termRole either -- irrelevant to what's asserted
  // here, so only the relationKind flag's absence is checked.)
  assert.equal(
    computeSymmetryFlags({
      clusters: [],
      bridges: [
        { relationKind: "dynamic" },
        { relationKind: "dynamic" },
        {}
      ]
    }).find(flag => flag.id === "bridge-relation-kind"),
    undefined
  );
  // termRole varies (reference/connector alternating) so only the
  // relationKind flag is isolated here -- the termRole case gets its own
  // check right below.
  const relationFlags = computeSymmetryFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic", termRole: "reference" },
      { relationKind: "dynamic", termRole: "connector" },
      { relationKind: "dynamic", termRole: "reference" }
    ]
  });
  assert.equal(relationFlags.length, 1);
  assert.equal(relationFlags[0].id, "bridge-relation-kind");
  assert.match(relationFlags[0].message, /All 3 bridges.*"dynamic"/);

  // termRole: an omitted value counts as the "reference" default -- an
  // all-omitted set is exactly the "everyone kept the default" case this
  // is meant to catch.
  const termRoleFlags = computeSymmetryFlags({
    clusters: [],
    bridges: [{}, {}, {}]
  });
  assert.equal(termRoleFlags.length, 1);
  assert.equal(termRoleFlags[0].id, "bridge-term-role");
  assert.match(termRoleFlags[0].message, /All 3 bridges are termRole "reference"/);

  // Bridge-touch count per cluster: zero bridges overall is the trivial,
  // meaningless case (never flagged); a real shared nonzero count is.
  // (Same-size clusters here also trigger the separate cluster-term-count
  // flag, irrelevant to what's asserted -- only bridge-touch-count's
  // absence is checked.)
  assert.equal(
    computeSymmetryFlags({
      clusters: [cluster(2), cluster(2), cluster(2)],
      bridges: []
    }).find(flag => flag.id === "bridge-touch-count"),
    undefined
  );
  const touchFlags = computeSymmetryFlags({
    clusters: [cluster(2), cluster(2), cluster(2)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 0] }
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
