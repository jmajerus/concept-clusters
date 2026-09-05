// Soft, non-blocking authoring signals -- codifies the self-check
// authoringDesignGuidance.js already asks an author to run by hand: "Size
// each cluster, bridge count, and lens count by genuine conceptual
// distinctness, not by converging toward a prior cluster's count or a
// familiar-looking template... when several [things] do land on the same
// count, treat it as a cheap trigger for one specific check, not a
// verdict." This module is that trigger, computed instead of remembered.
//
// A flag is a prompt to go double-check, never a validation failure and
// never proof of a problem. Its trigger is the structure of this puzzle,
// not the historical frequency of that structure in a corpus authored before
// these checks existed. Scope is deliberately narrow to intra-puzzle
// symmetry only: several structural counts landing on the same number within
// one puzzle. Cross-puzzle/corpus-wide uniformity is not evidence either way.
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

export function computeSymmetryFlags(puzzle) {
  if (!puzzle || typeof puzzle !== "object") return [];
  const clusters = Array.isArray(puzzle.clusters) ? puzzle.clusters : [];
  const bridges = Array.isArray(puzzle.bridges) ? puzzle.bridges : [];
  const lenses = Array.isArray(puzzle.lenses) ? puzzle.lenses : [];
  const flags = [];

  const termCounts = uniformCount(clusters.map(cluster =>
    Array.isArray(cluster?.terms) ? cluster.terms.length : 0
  ));
  const gridSize = clusters.length;
  const squareGrid =
    gridSize >= 3 && termCounts?.count === gridSize && termCounts.value === gridSize && bridges.length === gridSize;
  if (squareGrid) {
    flags.push({
      id: "square-grid-shape",
      message: `This puzzle is ${gridSize} × ${gridSize} × ${gridSize}: ${gridSize} clusters with ` +
        `${gridSize} terms each and ${gridSize} bridges. ` +
        "Re-open the source inventory before retaining that shape: check that every distinct concept " +
        "earned its own term or bridge, and that none was omitted or added merely to preserve the grid."
    });
  } else if (termCounts) {
    flags.push({
      id: "cluster-term-count",
      message: `All ${termCounts.count} clusters have exactly ${termCounts.value} terms. ` +
        "Worth a quick check: does any cluster hold a pair doing the same conceptual job " +
        "(one naming a condition, the other just restating what it amounts to), or does a " +
        "cluster's own fact text name a distinct concept that never made it into terms?"
    });
  }

  const targetCounts = uniformCount(lenses.map(lens =>
    Array.isArray(lens?.targets) ? lens.targets.length : 0
  ));
  if (targetCounts) {
    flags.push({
      id: "lens-target-count",
      message: `All ${targetCounts.count} lenses have exactly ${targetCounts.value} targets. ` +
        "Worth checking whether a term the puzzle's own prose already names alongside the " +
        "included ones was left out of a lens for no better reason than matching the others' count."
    });
  }

  // relationKind is optional and has no default. Real symmetry-chasing
  // shows up on every item, not a subset of them -- so a bridge that left
  // relationKind unset is itself a deviation, not a non-participant to
  // exclude from the comparison. Passing every bridge's raw value (no
  // filtering) gets this for free: uniformCount's own undefined-first
  // guard means "nobody set it" still doesn't flag, and .every() means
  // one unset bridge among otherwise-matching ones breaks the match just
  // like a differing explicit value would.
  const relationKinds = uniformCount(bridges.map(bridge => bridge?.relationKind));
  if (relationKinds) {
    flags.push({
      id: "bridge-relation-kind",
      message: `All ${relationKinds.count} bridges use relationKind "${relationKinds.value}". ` +
        "Worth checking each bridge actually encodes that specific kind of relationship, " +
        "rather than defaulting to whichever kind the first bridge used."
    });
  }

  // Zero bridges touching every cluster is the trivial, meaningless case
  // (a puzzle can legitimately have no bridges at all) -- excluded so this
  // only fires on a real shared nonzero count. The square-grid signal above
  // already covers that exact shape without a redundant second flag.
  if (bridges.length > 0 && !squareGrid) {
    const touchCounts = uniformCount(clusters.map((_, ci) =>
      bridges.filter(bridge => Array.isArray(bridge?.clusters) && bridge.clusters.includes(ci)).length
    ));
    if (touchCounts && touchCounts.value > 0) {
      flags.push({
        id: "bridge-touch-count",
        message: `Every cluster touches exactly ${touchCounts.value} bridge${touchCounts.value === 1 ? "" : "s"}. ` +
          "Worth checking each bridge is a genuine conceptual connection for that specific pair, " +
          "not one added just to keep every cluster's bridge count matching."
      });
    }
  }

  return flags;
}

// termRole does have a default ("reference"), but an omitted value is not an
// authorial choice. Raw values, no default substitution, keep an all-unset
// puzzle from flagging: it means nobody engaged with the field, not that
// everybody deliberately chose the same role. One unset bridge among
// otherwise-matching explicit ones likewise breaks the signal, the same as a
// differing value would.
// This remains user-only because role classification requires human editorial
// judgment; computeUserOnlyAuthoringFlags is where it is surfaced.
export function computeBridgeTermRoleFlags(puzzle) {
  if (!puzzle || typeof puzzle !== "object") return [];
  const bridges = Array.isArray(puzzle.bridges) ? puzzle.bridges : [];
  const flags = [];
  const termRoles = uniformCount(bridges.map(bridge => bridge?.termRole));
  if (termRoles) {
    flags.push({
      id: "bridge-term-role",
      message: `All ${termRoles.count} bridges are termRole "${termRoles.value}". ` +
        "Worth checking whether any of them is really the other role -- a connector carrying " +
        "only a local mechanism/detail the lesson doesn't set out to teach directly, or a " +
        "reference the puzzle actually wants the player to learn more about."
    });
  }
  return flags;
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

// MCP+user flags: surfaced to both an authoring agent (validate_puzzle_draft)
// and the human draft review page. lens-reasons-coverage lives here, not in
// computeUserOnlyAuthoringFlags below -- an incomplete reasons map usually
// wants an agent's judgment about what the missing per-node explanation
// should say, not just a mechanical prompt.
export function computeAuthoringFlags(puzzle) {
  return [
    ...computeSymmetryFlags(puzzle),
    ...computeLensShapeFlags(puzzle),
    ...computeLensReasonCoverageFlags(puzzle)
  ];
}

// User-only flags: surfaced on the draft review page but deliberately left
// out of what an MCP client sees (validate_puzzle_draft's response, and
// anything derived from it that a client could read back, e.g.
// get_puzzle_draft's stored validation). bridge-term-role is common enough
// to be set -- and to legitimately agree across a puzzle's bridges -- that
// it's noisy for an authoring agent; a human skimming the draft review page
// can dismiss it in a glance the way an agent can't.
export function computeUserOnlyAuthoringFlags(puzzle) {
  return [...computeBridgeTermRoleFlags(puzzle)];
}
