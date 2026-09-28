import assert from "node:assert/strict";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import {
  computeAuthoringFlags,
  computeLensReasonCoverageFlags,
  computeLensShapeFlags,
  computeStructuralRegularity,
  computeUserOnlyAuthoringFlags
} from "../modules/puzzleSymmetryFlags.js";

export const name = "puzzle symmetry flags: even term counts and audience filtering";

// The symmetry prompt is an even term count across three or more clusters.
// One differing count removes it. Bridges, attachment, and cluster swaps
// are not part of the prompt. A cluster count that repeats the term count
// is a sentence on the same flag.

function cluster(termCount) {
  return { terms: Array.from({ length: termCount }, (_, i) => `term-${i}`) };
}

export async function run() {
  // Nothing to flag: no puzzle, or a puzzle whose counts don't converge.
  assert.deepEqual(computeAuthoringFlags(null), []);
  assert.deepEqual(computeAuthoringFlags({
    clusters: [cluster(3), cluster(4), cluster(5)]
  }), []);

  // --- even term counts: the MCP symmetry prompt -----------------------
  const threeOfThree = computeAuthoringFlags({
    clusters: [cluster(3), cluster(3), cluster(3)]
  });
  assert.equal(threeOfThree.filter(flag => flag.id === "uniform-partition").length, 1);
  assert.match(threeOfThree[0].message, /cluster count matches that number \(3\)/);
  const fourOfThree = computeAuthoringFlags({
    clusters: [cluster(3), cluster(3), cluster(3), cluster(3)]
  });
  assert.ok(fourOfThree.some(flag => flag.id === "uniform-partition"));
  assert.doesNotMatch(
    fourOfThree.find(flag => flag.id === "uniform-partition").message,
    /cluster count matches/
  );
  const clusterFlags = computeAuthoringFlags({
    clusters: [cluster(5), cluster(5), cluster(5)]
  });
  assert.equal(clusterFlags.length, 1);
  assert.equal(clusterFlags[0].id, "uniform-partition");
  assert.match(clusterFlags[0].message, /All 3 clusters have exactly 5 terms/);
  assert.doesNotMatch(clusterFlags[0].message, /cluster count matches/);
  assert.match(clusterFlags[0].message, /concept-gathering pass/);
  assert.match(clusterFlags[0].message, /do not change bridges/i);
  // A partial match (3 of 4 clusters share a count, one doesn't) still
  // isn't the same signal as "every cluster".
  assert.deepEqual(computeAuthoringFlags({
    clusters: [cluster(5), cluster(5), cluster(5), cluster(6)]
  }), []);
  // Two matching clusters are too small to call symmetry-seeking.
  assert.deepEqual(computeAuthoringFlags({
    clusters: [cluster(4), cluster(4)]
  }), []);

  // Bridges do not create, remove, or intensify the prompt. A connected
  // board and an unbridged board with the same term counts say the same thing.
  const threeRegularity = computeStructuralRegularity({
    clusters: [cluster(3), cluster(3), cluster(3)],
    bridges: [{ clusters: [0, 1] }, { clusters: [1, 2] }, { clusters: [2, 0] }]
  });
  assert.deepEqual(threeRegularity.signature, {
    clusters: 3,
    termsPerCluster: [3, 3, 3]
  });
  assert.equal(threeRegularity.mcpFlags.length, 1);
  assert.equal(threeRegularity.mcpFlags[0].id, "uniform-partition");
  assert.equal(threeRegularity.mcpFlags[0].nextStep.action, "recheck-concept-set");
  assert.match(threeRegularity.mcpFlags[0].nextStep.instruction, /human approval/);
  assert.match(threeRegularity.mcpFlags[0].nextStep.instruction, /do not change bridges/i);
  assert.deepEqual(threeRegularity.descriptors, []);
  const unbridged = computeStructuralRegularity({
    clusters: [cluster(3), cluster(3), cluster(3)]
  });
  assert.equal(unbridged.mcpFlags[0].message, threeRegularity.mcpFlags[0].message);

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
    .some(flag => flag.id === "uniform-partition"));

  // --- uniform lens target count: draft-review-only observation ----------
  const lensFlags = computeUserOnlyAuthoringFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c", "d"] },
      { targets: ["e", "f", "g", "h"] },
      { targets: ["i", "j", "k", "l"] }
    ]
  });
  assert.equal(lensFlags.length, 1);
  assert.equal(lensFlags[0].id, "uniform-lens-target-count");
  assert.match(lensFlags[0].message, /All 3 lenses have exactly 4 targets/);
  // Two matching lenses are not enough to establish a repeated pattern.
  assert.deepEqual(computeUserOnlyAuthoringFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c"] },
      { targets: ["d", "e", "f"] }
    ]
  }), []);
  assert.deepEqual(computeUserOnlyAuthoringFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c", "d"] },
      { targets: ["e", "f", "g", "h"] }
    ]
  }), []);
  // A single maxed-out lens is not intra-puzzle symmetry.
  assert.deepEqual(computeUserOnlyAuthoringFlags({
    clusters: [],
    lenses: [{ targets: ["a", "b", "c", "d", "e", "f"] }]
  }), []);
  assert.deepEqual(computeUserOnlyAuthoringFlags({
    clusters: [],
    lenses: [
      { targets: ["a", "b", "c", "d", "e"] },
      { targets: ["f", "g", "h", "i", "j"] }
    ]
  }), []);

  // --- bridge relation-kind: review-page note, not a symmetry flag ------
  // A copied label shows up on every bridge, not a subset -- so an unset
  // bridge is itself a deviation. 4 bridges that agree plus 1 that never
  // set relationKind at all does NOT flag.
  assert.deepEqual(computeUserOnlyAuthoringFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      {}
    ]
  }), []);
  const threeRelations = computeUserOnlyAuthoringFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" }
    ]
  });
  assert.equal(threeRelations.length, 1);
  assert.equal(threeRelations[0].id, "uniform-bridge-relation-kind");
  assert.deepEqual(computeAuthoringFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" }
    ]
  }), []);
  const relationFlags = computeUserOnlyAuthoringFlags({
    clusters: [],
    bridges: [
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" },
      { relationKind: "dynamic" }
    ]
  });
  assert.equal(relationFlags.length, 1);
  assert.equal(relationFlags[0].id, "uniform-bridge-relation-kind");
  assert.match(relationFlags[0].message, /All 4 bridges.*"dynamic"/);

  // Attachment is not flagged. A path, a cycle, and equal bridge degrees
  // leave the symmetry channel quiet unless the term counts are even.
  assert.deepEqual(computeAuthoringFlags({
    clusters: [cluster(2), cluster(3), cluster(4)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 0] }
    ]
  }), []);
  assert.deepEqual(computeUserOnlyAuthoringFlags({
    clusters: [cluster(2), cluster(3), cluster(4)],
    bridges: [
      { clusters: [0, 1] },
      { clusters: [1, 2] },
      { clusters: [2, 0] }
    ]
  }), []);

  const variedPath = {
    clusters: [cluster(3), cluster(4), cluster(5)],
    lenses: [{ targets: ["a"] }, { targets: ["a", "b"] }],
    bridges: [
      { relationKind: "dynamic", clusters: [0, 1] },
      { relationKind: "contrast", clusters: [1, 2] }
    ]
  };
  assert.deepEqual(computeAuthoringFlags(variedPath), []);
  assert.deepEqual(computeUserOnlyAuthoringFlags(variedPath), []);

  // Four clusters of three terms is the symmetry prompt. The three bridges
  // that join them do not change it, and the cluster count does not match.
  const fourUniformPath = {
    clusters: [cluster(3), cluster(3), cluster(3), cluster(3)],
    bridges: [{ clusters: [0, 1] }, { clusters: [1, 2] }, { clusters: [2, 3] }]
  };
  const fourUniformFlag = computeAuthoringFlags(fourUniformPath)
    .find(flag => flag.id === "uniform-partition");
  assert.ok(fourUniformFlag);
  assert.match(fourUniformFlag.message, /All 4 clusters have exactly 3 terms/);
  assert.doesNotMatch(fourUniformFlag.message, /cluster count matches/);
  assert.deepEqual(computeUserOnlyAuthoringFlags(fourUniformPath), []);
  const fourCountLockedPath = {
    clusters: [cluster(4), cluster(4), cluster(4), cluster(4)],
    bridges: [{ clusters: [0, 1] }, { clusters: [1, 2] }, { clusters: [2, 3] }]
  };
  const fourLockedFlag = computeAuthoringFlags(fourCountLockedPath)
    .find(flag => flag.id === "uniform-partition");
  assert.match(fourLockedFlag.message, /All 4 clusters have exactly 4 terms/);
  assert.match(fourLockedFlag.message, /cluster count matches that number \(4\)/);
  // Seven clusters of seven terms is the same prompt. The bridge pattern
  // is irrelevant, including a tree with no cluster that can swap places.
  const sevenOfSeven = {
    clusters: Array.from({ length: 7 }, () => cluster(7)),
    bridges: [
      { clusters: [0, 1] },
      { clusters: [0, 2] }, { clusters: [2, 3] },
      { clusters: [0, 4] }, { clusters: [4, 5] }, { clusters: [5, 6] }
    ]
  };
  const sevenFlag = computeAuthoringFlags(sevenOfSeven)
    .find(flag => flag.id === "uniform-partition");
  assert.match(sevenFlag.message, /All 7 clusters have exactly 7 terms/);
  assert.match(sevenFlag.message, /cluster count matches that number \(7\)/);
  const threeOrdinaryPath = {
    clusters: [cluster(4), cluster(4), cluster(4)],
    bridges: [{ clusters: [0, 1] }, { clusters: [1, 2] }]
  };
  const threeOrdinaryFlag = computeAuthoringFlags(threeOrdinaryPath)
    .find(flag => flag.id === "uniform-partition");
  assert.match(threeOrdinaryFlag.message, /All 3 clusters have exactly 4 terms/);
  assert.doesNotMatch(threeOrdinaryFlag.message, /cluster count matches/);
  assert.deepEqual(computeUserOnlyAuthoringFlags(threeOrdinaryPath), []);

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
}
