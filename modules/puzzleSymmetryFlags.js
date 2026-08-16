// Soft, non-blocking authoring signals -- codifies the self-check
// authoringDesignGuidance.js already asks an author to run by hand: "Size
// each cluster, bridge count, and lens count by genuine conceptual
// distinctness, not by converging toward a prior cluster's count or a
// familiar-looking template... when several [things] do land on the same
// count, treat it as a cheap trigger for one specific check, not a
// verdict." This module is that trigger, computed instead of remembered.
//
// A flag is a prompt to go double-check, never a validation failure and
// never proof of a problem -- equal counts are frequently legitimate on
// their own (most clusters in this project land on 4 terms regardless of
// author, and that alone proves nothing). Scope is deliberately narrow to
// intra-puzzle symmetry only: several structural counts landing on the
// same number *within one puzzle*, which is what would suggest template
// convergence rather than deliberate parity. Cross-puzzle/corpus-wide
// uniformity is a different, much noisier question this doesn't attempt.
//
// Browser-safe (no Node APIs) so it can run in the hosted Worker, the
// local stdio MCP server, and the admin review page's renderer alike, all
// from one place, the way puzzleStats.js already does for the (unrelated)
// content-adoption numbers.

// "Several" landing on the same count is the trigger, not "a couple did" --
// two items matching is common enough on its own to carry no signal, so
// this only fires once there are at least 3 items and every one of them
// shares the same value. Returns null when there's nothing to flag.
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
  if (termCounts) {
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

  // relationKind is optional and has no default -- only count bridges that
  // actually declared one, so an otherwise-mixed puzzle where most bridges
  // just haven't set it yet doesn't read as false uniformity.
  const explicitRelationKinds = bridges.map(bridge => bridge?.relationKind).filter(Boolean);
  const relationKinds = uniformCount(explicitRelationKinds);
  if (relationKinds) {
    flags.push({
      id: "bridge-relation-kind",
      message: `All ${relationKinds.count} bridges that declare a relationKind use "${relationKinds.value}". ` +
        "Worth checking each bridge actually encodes that specific kind of relationship, " +
        "rather than defaulting to whichever kind the first bridge used."
    });
  }

  // termRole does have a default ("reference"), so treat an omitted value
  // as that default -- an all-omitted set is exactly the "everyone kept
  // the default" case this is meant to catch, not an exemption from it.
  const termRoles = uniformCount(bridges.map(bridge => bridge?.termRole || "reference"));
  if (termRoles) {
    flags.push({
      id: "bridge-term-role",
      message: `All ${termRoles.count} bridges are termRole "${termRoles.value}". ` +
        "Worth checking whether any of them is really the other role -- a connector carrying " +
        "only a local mechanism/detail the lesson doesn't set out to teach directly, or a " +
        "reference the puzzle actually wants the player to learn more about."
    });
  }

  // Zero bridges touching every cluster is the trivial, meaningless case
  // (a puzzle can legitimately have no bridges at all) -- excluded so this
  // only fires on a real shared nonzero count.
  if (bridges.length > 0) {
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
