// Pure computation behind the content statistics report -- optional-
// field adoption, tag frequency, bridge structure, and cluster/puzzle
// size, to see which schema features are actually used and which
// aren't. Browser-safe (no Node APIs), so both tools/puzzle-stats.mjs
// (CLI, console.table) and the in-app admin Stats panel (game.js/
// modules/overviewRenderer.js, &admin-gated) render the exact same
// numbers from this one place instead of two computations drifting
// apart.
//
// Returns { total, sections }, sections being a title + rows (already
// display-ready -- percentages and averages pre-formatted as strings)
// plus an optional emptyMessage for a section whose rows can be empty
// (only "Tag frequency" today). A generic renderer can iterate
// `sections` without knowing what any particular one means.
//
// "nodes" (per-puzzle count) matches modules/puzzleGraph.js's
// buildNodesAndLinks: every cluster term plus every bridge is one node,
// a bridge counting as exactly one node even when it spans multiple
// clusters -- this is literally what a player sees on the board. The
// per-cluster averages are narrower on purpose: "nodes/cluster" counts
// only that cluster's own terms (a bridge doesn't belong to a single
// cluster, so it can't be one cluster's node), and "bridges/cluster"
// attributes an n-ary bridge to every cluster it connects, not just one.

import { derivedLarge, puzzleNodeCount } from "./puzzleBoardSize.js";

const OPTIONAL_FIELDS = [
  "tags", "subcategories", "relatedPuzzles", "lensMode", "lenses",
  "learningIntroduction", "large", "preSolve", "creator", "license",
  "derivedFrom", "dateCreated", "dateModified", "language", "version", "layouts"
];

function isPresent(value) {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return Boolean(value);
}

function pct(count, of) {
  return of === 0 ? "0%" : `${Math.round((count / of) * 100)}%`;
}

function clusterStats(puzzles) {
  const clusters = puzzles.flatMap(puzzle =>
    puzzle.clusters.map((cluster, ci) => ({ puzzle, ci, cluster }))
  );
  if (clusters.length === 0) {
    return {
      clusterCount: 0,
      avgNodes: 0, minNodes: 0, maxNodes: 0,
      avgBridges: 0, minBridges: 0, maxBridges: 0
    };
  }
  const nodeCounts = clusters.map(({ cluster }) => cluster.terms.length);
  const bridgeCounts = clusters.map(({ puzzle, ci }) =>
    puzzle.bridges.filter(bridge => bridge.clusters.includes(ci)).length
  );
  const sum = counts => counts.reduce((a, b) => a + b, 0);
  return {
    clusterCount: clusters.length,
    avgNodes: sum(nodeCounts) / clusters.length,
    minNodes: Math.min(...nodeCounts),
    maxNodes: Math.max(...nodeCounts),
    avgBridges: sum(bridgeCounts) / clusters.length,
    minBridges: Math.min(...bridgeCounts),
    maxBridges: Math.max(...bridgeCounts)
  };
}

export function computePuzzleStats(puzzles) {
  const total = puzzles.length;

  const fieldAdoption = OPTIONAL_FIELDS.map(field => {
    const count = puzzles.filter(puzzle => isPresent(puzzle[field])).length;
    return { field, count, of: total, pct: pct(count, total) };
  });

  const tagCounts = new Map();
  for (const puzzle of puzzles) {
    for (const tag of puzzle.tags || []) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  const tagFrequency = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  const allBridges = puzzles.flatMap(puzzle => puzzle.bridges);
  const directedCount = allBridges.filter(bridge => bridge.direction?.kind).length;
  const naryCount = allBridges.filter(bridge => bridge.clusters.length > 2).length;
  const bridgeStructure = [
    {
      feature: "directed (direction.kind set)",
      count: directedCount, of: allBridges.length, pct: pct(directedCount, allBridges.length)
    },
    {
      feature: "n-ary (>2 clusters)",
      count: naryCount, of: allBridges.length, pct: pct(naryCount, allBridges.length)
    }
  ];

  const structuralAverages = [
    { group: "large", puzzles: puzzles.filter(puzzle => derivedLarge(puzzleNodeCount(puzzle))) },
    { group: "regular", puzzles: puzzles.filter(puzzle => !derivedLarge(puzzleNodeCount(puzzle))) }
  ].map(({ group, puzzles: groupPuzzles }) => {
    const stats = clusterStats(groupPuzzles);
    return {
      group,
      puzzles: groupPuzzles.length,
      clusters: stats.clusterCount,
      "avg nodes/cluster": stats.avgNodes.toFixed(2),
      "min nodes": stats.minNodes,
      "max nodes": stats.maxNodes,
      "avg bridges/cluster": stats.avgBridges.toFixed(2),
      "min bridges": stats.minBridges,
      "max bridges": stats.maxBridges
    };
  });

  const perPuzzleSize = puzzles.map(puzzle => ({
    id: puzzle.id,
    large: derivedLarge(puzzleNodeCount(puzzle)) ? "yes" : "",
    clusters: puzzle.clusters.length,
    bridges: puzzle.bridges.length,
    nodes: puzzleNodeCount(puzzle)
  }));

  return {
    total,
    sections: [
      { title: "Optional field adoption", rows: fieldAdoption },
      { title: "Tag frequency", rows: tagFrequency, emptyMessage: "(no puzzle has tags yet)" },
      { title: "Bridge structure", rows: bridgeStructure },
      { title: "Structural averages (per cluster)", rows: structuralAverages },
      { title: "Per-puzzle size", rows: perPuzzleSize }
    ]
  };
}
