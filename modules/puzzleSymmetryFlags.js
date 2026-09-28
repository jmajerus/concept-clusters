// Soft, non-blocking authoring signals. The analysis below describes one
// submitted puzzle only -- it never assumes an inventory, authoring path,
// model, or corpus baseline.
//
// Symmetry-seeking is an even term count across clusters. That prompt goes
// to MCP validation and to the draft-review page. A cluster count that
// repeats the same number is a further sentence on that prompt, not a
// second flag. Attachment — bridges joining clusters — is a normal result
// of concept-gathering and is not flagged. A copied bridge relationKind
// and an even lens-target count stay on the draft-review page only.
//
// Browser-safe (no Node APIs) so it can run in the hosted Worker, the
// local stdio MCP server, and the admin review page's renderer alike, all
// from one place, the way puzzleStats.js already does for the (unrelated)
// content-adoption numbers.

// "Several" means at least three items. All must share the value: one
// deviation removes the signal rather than treating a majority as symmetry.
// Returns null when there's nothing to flag.
function uniformCount(values, { minItems = 3 } = {}) {
  if (values.length < minItems) return null;
  const [first, ...rest] = values;
  if (first === undefined || first === null) return null;
  return rest.every(value => value === first) ? { count: values.length, value: first } : null;
}

function signature(clusterCount, termCounts) {
  return {
    clusters: clusterCount,
    termsPerCluster: [...termCounts].sort((a, b) => a - b)
  };
}

const RECHECK_CONCEPT_SET = "Re-read each cluster for two terms doing one job, and for a fact that names a concept missing from its terms; fix those on the board. That is not a licence to add or drop terms just to break an even count. If this board has no concept-gathering inventory, write that inventory in this review and stop for human approval before fitting it onto the board. Do not leave that inventory as an open issue. Keep even counts when the sourced map supports them, and do not change bridges because of this prompt.";

// Document-only count signals. mcpFlags is the symmetry prompt (even term
// counts). descriptors are draft-review notes that are not that prompt.
export function computeStructuralRegularity(puzzle) {
  if (!puzzle || typeof puzzle !== "object") {
    return { signature: null, descriptors: [], mcpFlags: [] };
  }
  const clusters = Array.isArray(puzzle.clusters) ? puzzle.clusters : [];
  const bridges = Array.isArray(puzzle.bridges) ? puzzle.bridges : [];
  const lenses = Array.isArray(puzzle.lenses) ? puzzle.lenses : [];
  const termCounts = clusters.map(cluster =>
    Array.isArray(cluster?.terms) ? cluster.terms.length : 0
  );
  const uniformTerms = uniformCount(termCounts);
  const result = {
    signature: signature(clusters.length, termCounts),
    descriptors: [],
    mcpFlags: []
  };

  if (uniformTerms) {
    const { count, value } = uniformTerms;
    const countLock = value === clusters.length;
    const lockSentence = countLock
      ? ` The cluster count matches that number (${clusters.length}).`
      : "";
    result.mcpFlags.push({
      id: "uniform-partition",
      nextStep: {
        action: "recheck-concept-set",
        instruction: RECHECK_CONCEPT_SET
      },
      message: `All ${count} clusters have exactly ${value} terms.${lockSentence} ` +
        "Most subjects are less even than this. Re-check each cluster for two terms doing one job, and for a fact that names a concept the term list omitted; fix those on the board. " +
        "That is not a licence to add or drop terms just to break an even count. " +
        "If this board never had a concept-gathering pass, write that inventory in this review and stop for human approval before fitting it onto the board. Do not leave that inventory as an open issue. " +
        "Keep even counts when the sourced map supports them, and do not change bridges because of this prompt.",
      signature: result.signature
    });
  }

  const targetCounts = uniformCount(lenses.map(lens =>
    Array.isArray(lens?.targets) ? lens.targets.length : 0
  ));
  if (targetCounts) {
    result.descriptors.push({
      id: "uniform-lens-target-count",
      message: `All ${targetCounts.count} lenses have exactly ${targetCounts.value} targets. ` +
        "Worth checking whether a term the puzzle's own prose already names alongside the " +
        "included ones was left out of a lens for no better reason than matching the others' count.",
      signature: result.signature
    });
  }

  // relationKind is optional and has no default. A copied label shows up on
  // every bridge, not a subset of them -- so a bridge that left relationKind
  // unset is itself a deviation, not a non-participant to exclude from the
  // comparison. Passing every bridge's raw value (no filtering) gets this
  // for free: uniformCount's own undefined-first guard means "nobody set it"
  // still doesn't flag, and .every() means one unset bridge among
  // otherwise-matching ones breaks the match just like a differing explicit
  // value would. This is a classification note, not a symmetry flag.
  const relationKinds = uniformCount(bridges.map(bridge => bridge?.relationKind));
  if (relationKinds) {
    result.descriptors.push({
      id: "uniform-bridge-relation-kind",
      message: `All ${relationKinds.count} bridges use relationKind "${relationKinds.value}". ` +
        "Worth checking each bridge actually encodes that specific kind of relationship, " +
        "rather than defaulting to whichever kind the first bridge used.",
      signature: result.signature
    });
  }

  return result;
}

// The symmetry prompt. Draft-review-only notes are computeUserOnlyAuthoringFlags.
export function computeSymmetryFlags(puzzle) {
  return computeStructuralRegularity(puzzle).mcpFlags;
}

function sameMembers(left, right) {
  if (left.length !== right.length) return false;
  const seen = new Set(left);
  return right.every(item => seen.has(item));
}

// Cheap lens-shape triggers, not symmetry: a sequential lens whose targets
// are exactly one cluster's full term list (or that list plus every bridge
// already touching it). That is the old 3–6 floor showing up as "select
// this cluster's color." A smaller honest cut is valid; padding sibling
// types to reach a count is the part no flag can catch.
export function computeLensShapeFlags(puzzle) {
  if (!puzzle || typeof puzzle !== "object") return [];
  if (puzzle.lensMode === "quiz" || puzzle.lensMode === "assignment") return [];
  const clusters = Array.isArray(puzzle.clusters) ? puzzle.clusters : [];
  const bridges = Array.isArray(puzzle.bridges) ? puzzle.bridges : [];
  const lenses = Array.isArray(puzzle.lenses) ? puzzle.lenses : [];
  const flags = [];

  lenses.forEach((lens, li) => {
    const targets = Array.isArray(lens?.targets) ? lens.targets : [];
    if (!targets.length) return;
    const label = typeof lens.id === "string" && lens.id.trim()
      ? `"${lens.id}"`
      : `lenses[${li}]`;
    clusters.forEach((cluster, ci) => {
      const terms = Array.isArray(cluster?.terms) ? cluster.terms : [];
      if (!terms.length) return;
      const name = cluster.name || `clusters[${ci}]`;
      if (sameMembers(targets, terms)) {
        flags.push({
          id: "lens-whole-cluster",
          message: `Lens ${label} targets every term of "${name}" and nothing else. ` +
            "Worth checking whether this is just selecting that cluster's color. " +
            "A smaller cut is valid when that is the honest question; do not pad sibling types to reach a count."
        });
        return;
      }
      const touching = bridges
        .filter(bridge => Array.isArray(bridge?.clusters) && bridge.clusters.includes(ci))
        .map(bridge => bridge.term)
        .filter(Boolean);
      if (touching.length && sameMembers(targets, [...terms, ...touching])) {
        flags.push({
          id: "lens-cluster-plus-bridges",
          message: `Lens ${label} targets every term of "${name}" plus every bridge touching that cluster. ` +
            "Worth checking whether this recites the cluster plus its edges rather than a second organizing question."
        });
      }
    });
  });

  return flags;
}

// Reasons are optional. But once an author provides even one node-specific
// reason for a lens, an incomplete set is usually an accidental omission:
// the player will receive per-node feedback for some correct targets and no
// explanation for others. This remains a flag rather than a schema error so
// an author can deliberately remove reasons altogether when a general lens
// explanation is the better teaching choice.
export function computeLensReasonCoverageFlags(puzzle) {
  if (!puzzle || typeof puzzle !== "object") return [];
  const lenses = Array.isArray(puzzle.lenses) ? puzzle.lenses : [];
  const flags = [];
  lenses.forEach((lens, index) => {
    const targets = Array.isArray(lens?.targets) ? lens.targets : [];
    const reasons = lens?.reasons;
    if (!targets.length || !reasons || typeof reasons !== "object" || Array.isArray(reasons)) {
      return;
    }
    const reasonKeys = Object.keys(reasons);
    if (!reasonKeys.length) return;
    const missing = targets.filter(target =>
      typeof target === "string" && !Object.hasOwn(reasons, target)
    );
    if (!missing.length) return;
    const label = typeof lens?.id === "string" && lens.id.trim()
      ? `Lens "${lens.id}"`
      : `lenses[${index}]`;
    flags.push({
      id: "lens-reasons-coverage",
      message: `${label} provides node-specific reasons for ${targets.length - missing.length} of ` +
        `${targets.length} targets. Add reasons for ${missing.map(target => `"${target}"`).join(", ")}, ` +
        "or remove reasons entirely if the general explanation is sufficient."
    });
  });
  return flags;
}

// A related-puzzle entry may name the concepts through which the two boards
// connect. Those `via` terms must be playable nodes on this board; otherwise
// the relationship points at a concept the player cannot locate here.
export function computeRelatedPuzzleViaFlags(puzzle) {
  if (!puzzle || typeof puzzle !== "object") return [];
  const inventory = new Set([
    ...(Array.isArray(puzzle.clusters)
      ? puzzle.clusters.flatMap(cluster => Array.isArray(cluster?.terms) ? cluster.terms : [])
      : []),
    ...(Array.isArray(puzzle.bridges)
      ? puzzle.bridges.map(bridge => bridge?.term)
      : [])
  ].filter(term => typeof term === "string" && term.trim()));
  const entries = puzzle.relatedPuzzles?.entries;
  if (!Array.isArray(entries)) return [];
  const flags = [];
  entries.forEach((entry, index) => {
    const via = Array.isArray(entry?.via) ? entry.via : [];
    const missing = [...new Set(via.filter(term =>
      typeof term === "string" && term.trim() && !inventory.has(term)
    ))];
    if (!missing.length) return;
    const label = typeof entry?.id === "string" && entry.id.trim()
      ? `Related puzzle "${entry.id}"`
      : `relatedPuzzles.entries[${index}]`;
    flags.push({
      id: "related-puzzle-via-missing",
      message: `${label} names ${missing.map(term => `"${term}"`).join(", ")} in via, ` +
        "but it is not a term or bridge in this puzzle. Use a playable local concept, or add the missing concept where it belongs."
    });
  });
  return flags;
}

// MCP+user flags: surfaced to both an authoring agent (validate_puzzle_draft)
// and the human draft review page. lens-reasons-coverage lives here, not in
// computeUserOnlyAuthoringFlags below -- an incomplete reasons map usually
// wants an agent's judgment about what the missing per-node explanation
// should say, not just a mechanical prompt.
export function computeAuthoringFlags(puzzle) {
  return [
    ...computeStructuralRegularity(puzzle).mcpFlags,
    ...computeLensShapeFlags(puzzle),
    ...computeLensReasonCoverageFlags(puzzle),
    ...computeRelatedPuzzleViaFlags(puzzle)
  ];
}

// Draft-review notes withheld from MCP validation: an even lens-target count,
// and a relationKind copied onto every bridge. The symmetry prompt itself is
// an MCP flag, so it is not repeated here.
export function computeUserOnlyAuthoringFlags(puzzle) {
  return computeStructuralRegularity(puzzle).descriptors;
}
