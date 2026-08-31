// Lenient compile of a simplified draft into a Graph-mode board.
// Unlike puzzleFromAuthoredDocument, empty or one-term documents paint.
// Unknown / extra fields (including unplacedTerms) are ignored except
// where this module reads them. Strict Zod remains for Play / PR / Install.

import { IDENTITY_COLOR_KEYS } from "./colorPalette.js";
import { slugify } from "../puzzles/categories.js";
import { buildNodesAndLinks, pillWidth } from "./puzzleGraph.js";
import { normalizeInfo } from "./termInfo.js";

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => typeof item === "string" && item.trim())
    .map(item => item.trim());
}

function uniqueStrings(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export function clusterTerms(cluster) {
  if (!cluster || typeof cluster !== "object") return [];
  if (Array.isArray(cluster.terms) && cluster.terms.length) {
    return uniqueStrings(asStringArray(cluster.terms));
  }
  return uniqueStrings([
    ...asStringArray(cluster.seeds),
    ...asStringArray(cluster.floatingTerms)
  ]);
}

export function nextClusterId(clusters) {
  const used = new Set(
    (Array.isArray(clusters) ? clusters : [])
      .map(cluster => cluster?.id)
      .filter(id => typeof id === "string" && id)
  );
  let n = 1;
  while (used.has(`cluster-${n}`)) n += 1;
  return `cluster-${n}`;
}

export function nextBridgeTerm(bridges, base = "bridge") {
  const used = new Set(
    (Array.isArray(bridges) ? bridges : [])
      .map(bridge => bridge?.term)
      .filter(term => typeof term === "string")
  );
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
}

function normalizeCluster(cluster, index, usedIds, explicitColors, availableColors, nextAutoColor) {
  const name = typeof cluster?.name === "string" && cluster.name.trim()
    ? cluster.name.trim()
    : `Cluster ${index + 1}`;
  let id = typeof cluster?.id === "string" && slugify(cluster.id) === cluster.id
    ? cluster.id
    : slugify(name) || `cluster-${index + 1}`;
  let suffix = 2;
  while (usedIds.has(id)) id = `${slugify(name) || "cluster"}-${suffix++}`;
  usedIds.add(id);
  const seeds = uniqueStrings(asStringArray(cluster?.seeds));
  const floatingTerms = uniqueStrings(asStringArray(cluster?.floatingTerms))
    .filter(term => !seeds.includes(term));
  const terms = clusterTerms({ ...cluster, seeds, floatingTerms });
  const color = IDENTITY_COLOR_KEYS.includes(cluster?.color)
    ? cluster.color
    : availableColors[nextAutoColor.value++ % Math.max(availableColors.length, 1)]
      || IDENTITY_COLOR_KEYS[index % IDENTITY_COLOR_KEYS.length];
  return {
    id,
    name,
    color,
    fact: typeof cluster?.fact === "string" ? cluster.fact : "",
    seeds,
    floatingTerms,
    terms: terms.length ? terms : seeds,
    ...(cluster?.termInfo && typeof cluster.termInfo === "object"
      ? { termInfo: cluster.termInfo }
      : {}),
    ...(cluster?.info ? { info: cluster.info } : {})
  };
}

function unplacedNodes(document, startId) {
  const words = uniqueStrings(asStringArray(document?.unplacedTerms));
  return words.map((word, offset) => ({
    id: startId + offset,
    word,
    gs: [],
    connected: [],
    w: pillWidth(word),
    unplaced: true,
    info: normalizeInfo(null)
  }));
}

export function authoringBoardFromDocument(document) {
  const rawClusters = Array.isArray(document?.clusters) ? document.clusters : [];
  const rawBridges = Array.isArray(document?.bridges) ? document.bridges : [];
  const usedIds = new Set();
  const explicitColors = new Set(
    rawClusters.map(cluster => cluster?.color).filter(color => IDENTITY_COLOR_KEYS.includes(color))
  );
  const availableColors = IDENTITY_COLOR_KEYS.filter(color => !explicitColors.has(color));
  const nextAutoColor = { value: 0 };
  const clusters = rawClusters.map((cluster, index) =>
    normalizeCluster(cluster, index, usedIds, explicitColors, availableColors, nextAutoColor)
  );
  const clusterIndexById = new Map(clusters.map((cluster, index) => [cluster.id, index]));
  const bridges = rawBridges
    .filter(bridge => bridge && typeof bridge.term === "string" && bridge.term.trim())
    .map(bridge => {
      const clusterIndexes = [];
      for (const ref of asStringArray(bridge.clusters)) {
        if (!clusterIndexById.has(ref)) continue;
        const index = clusterIndexById.get(ref);
        if (!clusterIndexes.includes(index)) clusterIndexes.push(index);
      }
      return {
        term: bridge.term.trim(),
        clusters: clusterIndexes,
        fact: typeof bridge.fact === "string" ? bridge.fact : "",
        termRole: bridge.termRole === "connector" ? "connector" : "reference",
        ...(bridge.relationKind ? { relationKind: bridge.relationKind } : {}),
        ...(bridge.direction ? { direction: bridge.direction } : {}),
        ...(bridge.idealTerms ? { idealTerms: bridge.idealTerms } : {}),
        ...(bridge.info ? { info: bridge.info } : {})
      };
    })
    .filter(bridge => bridge.clusters.length >= 1);

  const puzzle = {
    id: typeof document?.id === "string" && document.id.trim() ? document.id.trim() : "draft",
    title: typeof document?.title === "string" && document.title.trim()
      ? document.title.trim()
      : "Untitled",
    category: typeof document?.category === "string" ? document.category : "",
    clusters,
    bridges: bridges.map(bridge => ({
      ...bridge,
      clusters: bridge.clusters
    })),
    ...(Array.isArray(document?.lenses) ? { lenses: document.lenses } : {}),
    ...(document?.lensMode ? { lensMode: document.lensMode } : {}),
    ...(document?.learningIntroduction
      ? { learningIntroduction: document.learningIntroduction }
      : {}),
    ...(document?.info ? { info: document.info } : {}),
    ...(document?.relatedPuzzles ? { relatedPuzzles: document.relatedPuzzles } : {})
  };

  const graphPuzzle = {
    ...puzzle,
    clusters: clusters.map(cluster => ({
      ...cluster,
      seeds: cluster.terms.slice(0, Math.max(1, Math.min(2, cluster.terms.length))),
      terms: cluster.terms
    }))
  };
  const built = clusters.length || bridges.length
    ? buildNodesAndLinks(graphPuzzle)
    : { nodes: [], links: [], need: 0 };

  // buildNodesAndLinks only marks seeds as connected. Force all cluster
  // terms placed, and all bridge sides attached, for the construction view.
  const clusterTermCount = clusters.reduce((sum, cluster) => sum + cluster.terms.length, 0);
  built.nodes.forEach(node => {
    if (node.gs.length === 1) {
      node.connected = [node.gs[0]];
    } else if (node.gs.length > 1) {
      node.connected = [...node.gs];
    }
  });

  const extras = unplacedNodes(document, built.nodes.length);
  const nodes = [...built.nodes, ...extras];
  const links = built.links;
  if (clusters.length) {
    clusters.forEach((cluster, ci) => {
      const members = nodes.filter(node => node.gs.length === 1 && node.gs[0] === ci);
      if (members.length < 2) return;
      const hub = members[0];
      for (let i = 1; i < members.length; i += 1) {
        if (!links.some(link =>
          (link.source === hub && link.target === members[i]) ||
          (link.source === members[i] && link.target === hub)
        )) {
          links.push({ source: hub, target: members[i], bridge: false });
        }
      }
    });
  }

  return {
    puzzle,
    nodes,
    links,
    need: 0,
    clusterTermCount,
    unplacedCount: extras.length
  };
}
