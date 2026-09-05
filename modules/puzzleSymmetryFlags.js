// Soft, non-blocking authoring signals. The pure structural analysis below
// describes one submitted puzzle only -- it never assumes an inventory,
// authoring path, model, or corpus baseline. A draft-review page can show its
// weak observations; MCP receives only combinations strong enough to prompt
// an author to reconsider the submitted concept set.
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

function validBinaryBridge(bridge, clusterCount) {
  const endpoints = bridge?.clusters;
  return Array.isArray(endpoints)
    && endpoints.length === 2
    && Number.isInteger(endpoints[0])
    && Number.isInteger(endpoints[1])
    && endpoints[0] !== endpoints[1]
    && endpoints.every(index => index >= 0 && index < clusterCount);
}

function binaryTopology(clusters, bridges) {
  const clusterCount = clusters.length;
  if (clusterCount < 3 || !bridges.length || !bridges.every(bridge =>
    validBinaryBridge(bridge, clusterCount)
  )) return null;
  const adjacency = Array.from({ length: clusterCount }, () => new Set());
  for (const bridge of bridges) {
    const [left, right] = bridge.clusters;
    adjacency[left].add(right);
    adjacency[right].add(left);
  }
  const seen = new Set();
  let components = 0;
  for (let start = 0; start < clusterCount; start++) {
    if (seen.has(start)) continue;
    components++;
    const pending = [start];
    seen.add(start);
    while (pending.length) {
      const current = pending.pop();
      for (const next of adjacency[current]) {
        if (seen.has(next)) continue;
        seen.add(next);
        pending.push(next);
      }
    }
  }
  const degrees = adjacency.map(neighbors => neighbors.size).sort((a, b) => a - b);
  const connected = components === 1;
  const tree = connected && bridges.length === clusterCount - 1;
  const path = tree
    && degrees[0] === 1
    && degrees[1] === 1
    && degrees.slice(2).every(degree => degree === 2);
  const cycle = connected
    && bridges.length === clusterCount
    && degrees.every(degree => degree === 2);
  return { components, degrees, connected, tree, path, cycle };
}

function compactColors(values) {
  const unique = [...new Set(values)].sort();
  const ids = new Map(unique.map((value, index) => [value, String(index)]));
  return values.map(value => ids.get(value));
}

function samePartition(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index++) {
    for (let other = index + 1; other < left.length; other++) {
      if ((left[index] === left[other]) !== (right[index] === right[other])) return false;
    }
  }
  return true;
}

// Model clusters and bridges as a colored incidence graph. This covers
// n-ary bridges without pretending they are pairwise links. Cluster colors
// preserve term counts; bridge colors preserve its structural authored role,
// but deliberately omit the bridge word itself (unique words would erase the
// structural question before it can be asked).
function incidenceGraph(clusters, bridges) {
  if (clusters.length < 3 || !bridges.length) return null;
  if (bridges.some(bridge => {
    const endpoints = bridge?.clusters;
    return !Array.isArray(endpoints)
      || endpoints.length < 2
      || new Set(endpoints).size !== endpoints.length
      || endpoints.some(index => !Number.isInteger(index) || index < 0 || index >= clusters.length);
  })) return null;
  const count = clusters.length + bridges.length;
  const adjacency = Array.from({ length: count }, () => Array(count).fill(false));
  const colors = clusters.map(cluster =>
    `cluster:${Array.isArray(cluster?.terms) ? cluster.terms.length : 0}`
  );
  bridges.forEach((bridge, bridgeIndex) => {
    const node = clusters.length + bridgeIndex;
    colors.push([
      "bridge",
      bridge.clusters.length,
      bridge.relationKind || "",
      bridge.termRole || "",
      bridge.direction || ""
    ].join(":"));
    for (const clusterIndex of bridge.clusters) {
      adjacency[node][clusterIndex] = true;
      adjacency[clusterIndex][node] = true;
    }
  });
  return { adjacency, colors, clusterCount: clusters.length };
}

function refinedColors(graph) {
  let colors = compactColors(graph.colors);
  for (let pass = 0; pass < colors.length; pass++) {
    const next = compactColors(colors.map((color, index) => {
      const neighbors = graph.adjacency[index]
        .map((connected, other) => connected ? colors[other] : null)
        .filter(Boolean)
        .sort();
      return `${color}|${neighbors.join(",")}`;
    }));
    if (samePartition(colors, next)) return next;
    colors = next;
  }
  return colors;
}

function findNonIdentityAutomorphism(graph) {
  if (!graph) return null;
  const colors = refinedColors(graph);
  const groups = new Map();
  colors.forEach((color, index) => {
    const group = groups.get(color) || [];
    group.push(index);
    groups.set(color, group);
  });
  const candidates = [...groups.values()].filter(group => group.length > 1);
  if (!candidates.length) return null;
  const size = colors.length;
  const mapping = Array(size).fill(-1);
  const used = Array(size).fill(false);

  function compatible(source, target) {
    for (let other = 0; other < size; other++) {
      const mapped = mapping[other];
      if (mapped < 0) continue;
      if (graph.adjacency[source][other] !== graph.adjacency[target][mapped]) return false;
    }
    return true;
  }

  function chooseSource() {
    const remaining = [];
    for (let source = 0; source < size; source++) {
      if (mapping[source] >= 0) continue;
      const mappedNeighbors = graph.adjacency[source]
        .filter((connected, other) => connected && mapping[other] >= 0).length;
      remaining.push({
        source,
        mappedNeighbors,
        candidateCount: groups.get(colors[source]).length
      });
    }
    remaining.sort((left, right) =>
      right.mappedNeighbors - left.mappedNeighbors
      || left.candidateCount - right.candidateCount
      || left.source - right.source
    );
    return remaining[0]?.source ?? null;
  }

  function extend() {
    const source = chooseSource();
    if (source == null) return [...mapping];
    for (const target of groups.get(colors[source])) {
      if (used[target] || !compatible(source, target)) continue;
      mapping[source] = target;
      used[target] = true;
      const found = extend();
      if (found) return found;
      mapping[source] = -1;
      used[target] = false;
    }
    return null;
  }

  for (const group of candidates) {
    for (const source of group) {
      for (const target of group) {
        if (source === target) continue;
        mapping[source] = target;
        used[target] = true;
        const found = extend();
        if (found) {
          const movedClusters = found
            .slice(0, graph.clusterCount)
            .map((mapped, index) => ({ index, mapped }))
            .filter(({ index, mapped }) => index !== mapped);
          if (movedClusters.length) return { mapping: found, movedClusters };
        }
        mapping[source] = -1;
        used[target] = false;
      }
    }
  }
  return null;
}

function movedClusterNumbers(movedClusters) {
  const numbers = new Set();
  for (const { index, mapped } of movedClusters) {
    numbers.add(index + 1);
    numbers.add(mapped + 1);
  }
  return [...numbers].sort((left, right) => left - right);
}

function signature({ clusterCount, termCounts, bridgeCount, topology }) {
  return {
    clusters: clusterCount,
    termsPerCluster: [...termCounts].sort((a, b) => a - b),
    bridges: bridgeCount,
    binaryBridgeDegrees: topology?.degrees || null,
    binaryComponents: topology?.components || null
  };
}

// The complete document-only regularity result. descriptors are raw shape
// facts; observations are actual symmetries or cross-axis locks. MCP prompts
// require both kinds of significant observation, never a pile-up of facts.
export function computeStructuralRegularity(puzzle) {
  if (!puzzle || typeof puzzle !== "object") {
    return { signature: null, descriptors: [], observations: [], mcpFlags: [] };
  }
  const clusters = Array.isArray(puzzle.clusters) ? puzzle.clusters : [];
  const bridges = Array.isArray(puzzle.bridges) ? puzzle.bridges : [];
  const lenses = Array.isArray(puzzle.lenses) ? puzzle.lenses : [];
  const termCounts = clusters.map(cluster =>
    Array.isArray(cluster?.terms) ? cluster.terms.length : 0
  );
  const uniformTerms = uniformCount(termCounts);
  const topology = binaryTopology(clusters, bridges);
  const graphSymmetry = findNonIdentityAutomorphism(incidenceGraph(clusters, bridges));
  const value = uniformTerms?.value;
  const result = {
    signature: signature({
      clusterCount: clusters.length,
      termCounts,
      bridgeCount: bridges.length,
      topology
    }),
    descriptors: [],
    observations: [],
    mcpFlags: []
  };

  if (uniformTerms) {
    result.descriptors.push({
      id: "uniform-partition",
      message: `All ${uniformTerms.count} clusters have exactly ${value} terms. ` +
        "This is a shape descriptor, not a defect; check that the concept set, rather than a target count, produced the partition.",
      signature: result.signature
    });
  }

  if (topology?.path) {
    result.descriptors.push({
      id: "binary-path-scaffold",
      message: `The ${clusters.length} clusters are connected by a binary path scaffold (${bridges.length} bridges; degrees ${topology.degrees.join(", ")}). ` +
        "This is a shape descriptor, not a defect.",
      signature: result.signature
    });
  } else if (topology?.tree) {
    result.descriptors.push({
      id: "binary-spanning-tree",
      message: `The ${clusters.length} clusters use the minimum connected binary bridge scaffold (${bridges.length} bridges). ` +
        "This is a shape descriptor, not a defect.",
      signature: result.signature
    });
  } else if (topology?.cycle) {
    result.descriptors.push({
      id: "binary-cycle-scaffold",
      message: `The ${clusters.length} clusters form a binary cycle scaffold (${bridges.length} bridges; every cluster has degree 2). ` +
        "This is a shape descriptor, not a defect.",
      signature: result.signature
    });
  }

  const axisLock = uniformTerms && value === clusters.length;
  if (graphSymmetry) {
    result.observations.push({
      id: "incidence-graph-symmetry",
      message: `The attributed cluster–bridge incidence graph has a non-identity symmetry: it can permute ` +
        `clusters ${movedClusterNumbers(graphSymmetry.movedClusters).join(", ")} ` +
        "while preserving the submitted structure. Symmetry is neutral; this is a review observation, not a defect.",
      signature: result.signature
    });
  }
  if (axisLock) {
    result.observations.push({
      id: "cluster-size-count-lock",
      message: `The uniform terms-per-cluster count (${value}) also equals the cluster count (${clusters.length}). ` +
        "This is a cross-axis count lock, not a defect.",
      signature: result.signature
    });
  }

  if (graphSymmetry && axisLock) {
    result.mcpFlags.push({
      id: "structural-regularity-combination",
      nextStep: {
        action: "recheck-concept-set",
        instruction: "Independently enumerate the concepts and bridges the lesson needs. Retain the shape only when that review supports it; never add or remove terms or bridges merely to clear this prompt."
      },
      message: `This submitted puzzle has both a non-identity incidence-graph symmetry and a cross-axis count lock (${clusters.length} clusters with ${value} terms each). ` +
        "Re-check the concept set independently before retaining the shape; symmetry is not itself a defect, and you must not add or remove terms or bridges merely to break it.",
      signature: result.signature,
      observations: result.observations.map(observation => observation.id)
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
    result.descriptors.push({
      id: "uniform-bridge-relation-kind",
      message: `All ${relationKinds.count} bridges use relationKind "${relationKinds.value}". ` +
        "Worth checking each bridge actually encodes that specific kind of relationship, " +
        "rather than defaulting to whichever kind the first bridge used.",
      signature: result.signature
    });
  }

  // Zero bridges touching every cluster is the trivial, meaningless case
  // (a puzzle can legitimately have no bridges at all) -- excluded so this
  // only fires on a real shared nonzero count. A path/cycle descriptor is
  // already clearer than its uniform degree count, so avoid duplicating it.
  if (bridges.length > 0 && !topology?.path && !topology?.cycle) {
    const touchCounts = uniformCount(clusters.map((_, ci) =>
      bridges.filter(bridge => Array.isArray(bridge?.clusters) && bridge.clusters.includes(ci)).length
    ));
    if (touchCounts && touchCounts.value > 0) {
      result.descriptors.push({
        id: "uniform-bridge-touch-count",
        message: `Every cluster touches exactly ${touchCounts.value} bridge${touchCounts.value === 1 ? "" : "s"}. ` +
          "Worth checking each bridge is a genuine conceptual connection for that specific pair, " +
          "not one added just to keep every cluster's bridge count matching.",
        signature: result.signature
      });
    }
  }

  return result;
}

// Full structural observations, retained as a small helper for direct
// consumers and tests. MCP callers should use computeAuthoringFlags below.
export function computeSymmetryFlags(puzzle) {
  const regularity = computeStructuralRegularity(puzzle);
  return [...regularity.descriptors, ...regularity.observations];
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
    ...computeStructuralRegularity(puzzle).mcpFlags,
    ...computeLensShapeFlags(puzzle),
    ...computeLensReasonCoverageFlags(puzzle)
  ];
}

// User-only flags: surfaced on the draft review page but deliberately left
// out of what an MCP client sees (validate_puzzle_draft's response, and
// anything derived from it that a client could read back, e.g.
// get_puzzle_draft's stored validation). Structural observations, like
// bridge-term-role, are intentionally withheld from MCP: a human can skim a
// descriptor without being induced to "fix" an otherwise natural shape.
export function computeUserOnlyAuthoringFlags(puzzle) {
  return [
    ...computeSymmetryFlags(puzzle),
    ...computeBridgeTermRoleFlags(puzzle)
  ];
}
