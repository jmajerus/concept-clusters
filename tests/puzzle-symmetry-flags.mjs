import assert from "node:assert/strict";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import {
  computeAuthoringFlags,
  computeBridgeTermRoleFlags,
  computeLensReasonCoverageFlags,
  computeLensShapeFlags,
  computeSymmetryFlags,
  computeUserOnlyAuthoringFlags
} from "../modules/puzzleSymmetryFlags.js";

export const name = "puzzle symmetry flags: intra-puzzle count-matching heuristics";

// The flags are structural review prompts, not corpus-rate predictions. A
// genuine pattern has to cover every relevant item; one differing count (or
// one unset optional bridge field) removes the signal.

function cluster(termCount) {
  return { terms: Array.from({ length: termCount }, (_, i) => `term-${i}`) };
}

export async function run() {
  // Nothing to flag: no puzzle, or a puzzle whose counts don't converge.
  assert.deepEqual(computeSymmetryFlags(null), []);
  assert.deepEqual(computeSymmetryFlags({
    clusters: [cluster(3), cluster(4), cluster(5)]
  }), []);

  // --- cluster-term-count: every uniform three-or-more cluster shape ---
  const lowClusterFlags = computeSymmetryFlags({
    clusters: [cluster(3), cluster(3), cluster(3)]
  });
  assert.equal(lowClusterFlags.length, 1);
  assert.equal(lowClusterFlags[0].id, "cluster-term-count");
  const fourClusterFlags = computeSymmetryFlags({
    clusters: [cluster(4), cluster(4), cluster(4)]
  });
  assert.equal(fourClusterFlags.length, 1);
  assert.equal(fourClusterFlags[0].id, "cluster-term-count");
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

  // A clean n × n × n shape is a distinct inventory-first warning. It
  // should ask about independently discovered terms and bridges, rather than
  // relying on the historical frequency of similar puzzles.
  const threeByThreeByThree = computeSymmetryFlags({
    clusters: [cluster(3), cluster(3), cluster(3)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 0] }
    ]
  });
  assert.equal(threeByThreeByThree.length, 1);
  assert.equal(threeByThreeByThree[0].id, "square-grid-shape");
  assert.match(threeByThreeByThree[0].message, /Re-open the source inventory/);
  const fourByFourByFour = computeSymmetryFlags({
    clusters: [cluster(4), cluster(4), cluster(4), cluster(4)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 3] },
      { clusters: [3, 0] }
    ]
  });
  assert.equal(fourByFourByFour.length, 1);
  assert.equal(fourByFourByFour[0].id, "square-grid-shape");
  assert.match(fourByFourByFour[0].message, /4 × 4 × 4/);

  // Drafts arrive in simplified form (seeds + floatingTerms), then validate
  // through puzzleFromAuthoredDocument before flags run. Exercise that exact
  // path so the n × n × n guard cannot silently miss a D1 working copy.
  const simplifiedThreeByThreeByThree = {
    id: "three-grid",
    title: "Three grid",
    category: "Test",
    clusters: ["a", "b", "c"].map(id => ({
      id,
      name: id,
      fact: "Fact.",
      seeds: [`${id} one`, `${id} two`],
      floatingTerms: [`${id} three`]
    })),
    bridges: [
      [["a", "b"], "ab"],
      [["b", "c"], "bc"],
      [["c", "a"], "ca"]
    ].map(([clusters, term]) => ({
      term,
      fact: "Fact.",
      clusters,
      idealTerms: Object.fromEntries(clusters.map(id => [id, `${id} one`]))
    }))
  };
  const { puzzle: convertedThreeByThreeByThree, errors } = puzzleFromAuthoredDocument(
    simplifiedThreeByThreeByThree
  );
  assert.deepEqual(errors, []);
  assert.ok(computeAuthoringFlags(convertedThreeByThreeByThree)
    .some(flag => flag.id === "square-grid-shape"));

  // --- lens-target-count: three-or-more lenses with the same count -----
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
  // Two matching lenses are not enough to establish a repeated pattern.
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
  assert.deepEqual(computeSymmetryFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c", "d", "e"] },
      { targets: ["f", "g", "h", "i", "j"] }
    ]
  }), []);

  // --- bridge-relation-kind: minItems 3, EVERY bridge must agree -------
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
  const threeRelations = computeSymmetryFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic", termRole: "reference" },
      { relationKind: "dynamic", termRole: "connector" },
      { relationKind: "dynamic", termRole: "reference" }
    ]
  });
  assert.equal(threeRelations.length, 1);
  assert.equal(threeRelations[0].id, "bridge-relation-kind");
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

  // --- bridge-touch-count: minItems 3 ----------------------------------
  // Zero bridges overall is the trivial, meaningless case (never
  // flagged); a real shared nonzero count needs three-or-more clusters agreeing.
  assert.equal(
    computeSymmetryFlags({
      clusters: [cluster(2), cluster(2), cluster(2)],
      bridges: []
    }).find(flag => flag.id === "bridge-touch-count"),
    undefined
  );
  const threeClusterTouch = computeSymmetryFlags({
    clusters: [cluster(1), cluster(1), cluster(1)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 0] }
    ]
  });
  assert.ok(threeClusterTouch.some(flag => flag.id === "bridge-touch-count"));
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
