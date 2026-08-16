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
// this requires a minimum of matching items (3 by default) all sharing the
// same value. The default was tuned against this project's own corpus (see
// tests/puzzle-symmetry-flags.mjs's corpus-rate comments): a few checks
// below override it, because 3 is this corpus's single most common count
// for that particular thing (bridges especially), which makes "3 items
// agree" mostly coincidence rather than signal for those specific checks.
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

  // A cluster's terms are always 2 seeds plus 1-4 floatingTerms (see
  // AUTHORING.md), so every cluster's term count already lives in a
  // narrow 3-6 range -- against the run of the actual corpus, that alone
  // makes several clusters landing on the same count near-guaranteed by
  // pigeonhole for any puzzle with 3+ clusters (100 of 151 puzzles here
  // trip on it, regardless of value), not a real signal. Restricting to
  // the high end (>= 5) targets the genuinely rare case instead -- 5-6
  // terms is a cluster that maxed out floatingTerms, which is where
  // template convergence (vs. incidental range-clash) actually shows up;
  // 13 of 151 puzzles trip on that narrower version.
  const termCounts = uniformCount(clusters.map(cluster =>
    Array.isArray(cluster?.terms) ? cluster.terms.length : 0
  ));
  if (termCounts && termCounts.value >= 5) {
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
  // just haven't set it yet doesn't read as false uniformity. 3 bridges is
  // this corpus's single most common bridge count (97 of ~148 puzzles with
  // any bridges at all), so requiring only 3 to agree is mostly coincidence
  // rather than signal -- minItems 4 here, unlike the other checks.
  const explicitRelationKinds = bridges.map(bridge => bridge?.relationKind).filter(Boolean);
  const relationKinds = uniformCount(explicitRelationKinds, { minItems: 4 });
  if (relationKinds) {
    flags.push({
      id: "bridge-relation-kind",
      message: `All ${relationKinds.count} bridges that declare a relationKind use "${relationKinds.value}". ` +
        "Worth checking each bridge actually encodes that specific kind of relationship, " +
        "rather than defaulting to whichever kind the first bridge used."
    });
  }

  // termRole does have a default ("reference"), but treating an omitted
  // value as that default backfired in practice: most bridges in this
  // corpus never set termRole at all (it's an optional pedagogical
  // classification, not something every author reaches for), so "everyone
  // left it unset" was tripping this on 106 of 151 puzzles -- describing
  // the norm, not flagging anything. Same treatment as relationKind now:
  // only bridges that explicitly declared a role count toward uniformity.
  const explicitTermRoles = bridges.map(bridge => bridge?.termRole).filter(Boolean);
  const termRoles = uniformCount(explicitTermRoles);
  if (termRoles) {
    flags.push({
      id: "bridge-term-role",
      message: `All ${termRoles.count} bridges that declare a termRole use "${termRoles.value}". ` +
        "Worth checking whether any of them is really the other role -- a connector carrying " +
        "only a local mechanism/detail the lesson doesn't set out to teach directly, or a " +
        "reference the puzzle actually wants the player to learn more about."
    });
  }

  // Zero bridges touching every cluster is the trivial, meaningless case
  // (a puzzle can legitimately have no bridges at all) -- excluded so this
  // only fires on a real shared nonzero count. minItems 4, same reasoning
  // as bridge-relation-kind above (3 bridges is this corpus's dominant
  // count, so 3 clusters agreeing is mostly coincidence).
  if (bridges.length > 0) {
    const touchCounts = uniformCount(clusters.map((_, ci) =>
      bridges.filter(bridge => Array.isArray(bridge?.clusters) && bridge.clusters.includes(ci)).length
    ), { minItems: 4 });
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
