import { slugify } from "../puzzles/categories.js";
import {
  CONCEPT_CLUSTERS_CONTEXT,
  CONTENT_SCHEMA_VERSION,
  JSON_LD_TYPES,
  nodeFragmentId,
  puzzleUrn,
  referenceId,
  validatePuzzleJsonLdProfile
} from "./jsonLdProfile.js";

const PUZZLE_KEYS = new Set([
  "@context", "@id", "@type", "schemaVersion", "id", "title", "category",
  "categories", "subcategories", "large", "info", "relatedPuzzles", "lensMode", "lenses",
  "preSolve", "tags", "level",
  "learningIntroduction", "clusters", "bridges", "creator", "license",
  "derivedFrom", "dateCreated", "dateModified", "language", "version",
  "generativeAssistance", "provenance", "layouts"
]);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function copyExtensions(source, target, knownKeys) {
  for (const [key, value] of Object.entries(source || {})) {
    if (!knownKeys.has(key) && key.includes(":")) target[key] = clone(value);
  }
  return target;
}

function stableLocalIds(items, prefix, labelFor) {
  const used = new Set();
  return items.map((item, index) => {
    const preferred = typeof item.id === "string" && item.id.trim()
      ? item.id
      : `${prefix}-${slugify(labelFor(item)) || index + 1}`;
    let id = preferred;
    let suffix = 2;
    while (used.has(id)) id = `${preferred}-${suffix++}`;
    used.add(id);
    return id;
  });
}

function relatedToJsonLd(related) {
  if (!related) return undefined;
  return {
    ...(related.info ? { info: clone(related.info) } : {}),
    entries: (related.entries || []).map(entry => ({
      puzzle: { "@id": puzzleUrn(entry.id) },
      ...(entry.via ? { via: [...entry.via] } : {}),
      reason: entry.reason
    }))
  };
}

function relatedFromJsonLd(related) {
  if (!related) return undefined;
  return {
    ...(related.info ? { info: clone(related.info) } : {}),
    entries: (related.entries || []).map(entry => ({
      id: (referenceId(entry.puzzle) || "").replace("urn:concept-clusters:puzzle:", ""),
      ...(entry.via ? { via: [...entry.via] } : {}),
      reason: entry.reason
    }))
  };
}

export function puzzleToJsonLd(puzzle, { learningContent = null, layouts = null } = {}) {
  const clusterIds = stableLocalIds(puzzle.clusters, "cluster", cluster => cluster.name);
  const bridgeIds = stableLocalIds(puzzle.bridges, "bridge", bridge => bridge.term);
  const clusters = puzzle.clusters.map((cluster, index) => copyExtensions(cluster, {
    "@id": `#${clusterIds[index]}`,
    "@type": JSON_LD_TYPES.cluster,
    id: clusterIds[index],
    name: cluster.name,
    color: cluster.color,
    fact: cluster.fact,
    terms: [...cluster.terms],
    seeds: [...cluster.seeds],
    ...(cluster.termInfo ? { termInfo: clone(cluster.termInfo) } : {}),
    ...(cluster.info ? { info: clone(cluster.info) } : {})
  }, new Set(["id", "name", "color", "fact", "terms", "seeds", "termInfo", "info"])));

  const bridges = puzzle.bridges.map((bridge, index) => {
    const clusterRefs = bridge.clusters.map(clusterIndex => ({
      "@id": `#${clusterIds[clusterIndex]}`
    }));
    const result = {
      "@id": `#${bridgeIds[index]}`,
      "@type": JSON_LD_TYPES.bridge,
      id: bridgeIds[index],
      term: bridge.term,
      clusters: clusterRefs,
      fact: bridge.fact,
      ...(bridge.conceptId ? { conceptId: bridge.conceptId } : {}),
      ...(bridge.termRole ? { termRole: bridge.termRole } : {}),
      ...(bridge.relationKind ? { relationKind: bridge.relationKind } : {}),
      ...(bridge.info ? { info: clone(bridge.info) } : {})
    };
    if (bridge.idealTerms) {
      result.idealTerms = bridge.clusters.map((clusterIndex, termIndex) => ({
        cluster: { "@id": `#${clusterIds[clusterIndex]}` },
        term: bridge.idealTerms[termIndex]
      }));
    }
    if (bridge.direction) {
      result.direction = { kind: bridge.direction.kind };
      if (bridge.direction.kind === "through") {
        result.direction.from = { "@id": `#${clusterIds[bridge.direction.from]}` };
        result.direction.to = { "@id": `#${clusterIds[bridge.direction.to]}` };
      }
    }
    return copyExtensions(bridge, result, new Set([
      "id", "term", "clusters", "fact", "conceptId", "termRole", "relationKind", "info",
      "idealTerms", "direction"
    ]));
  });

  const introduction = puzzle.learningIntroduction
    ? clone(puzzle.learningIntroduction)
    : undefined;
  if (introduction && learningContent !== null) {
    introduction.content = {
      text: learningContent,
      mediaType: "text/markdown"
    };
  }

  const document = {
    "@context": CONCEPT_CLUSTERS_CONTEXT,
    "@id": puzzleUrn(puzzle.id),
    "@type": JSON_LD_TYPES.puzzle,
    schemaVersion: CONTENT_SCHEMA_VERSION,
    id: puzzle.id,
    title: puzzle.title,
    category: puzzle.category,
    ...(puzzle.categories ? { categories: [...puzzle.categories] } : {}),
    ...(puzzle.subcategories ? { subcategories: clone(puzzle.subcategories) } : {}),
    ...(puzzle.large ? { large: true } : {}),
    ...(puzzle.tags ? { tags: [...puzzle.tags] } : {}),
    ...(puzzle.level ? { level: puzzle.level } : {}),
    ...(puzzle.info ? { info: clone(puzzle.info) } : {}),
    ...(puzzle.relatedPuzzles ? { relatedPuzzles: relatedToJsonLd(puzzle.relatedPuzzles) } : {}),
    ...(puzzle.lensMode ? { lensMode: puzzle.lensMode } : {}),
    ...(puzzle.preSolve ? { preSolve: true } : {}),
    ...(puzzle.lenses ? { lenses: puzzle.lenses.map(lens => ({
      "@id": `#lens-${lens.id}`,
      "@type": JSON_LD_TYPES.lens,
      ...clone(lens)
    })) } : {}),
    ...(introduction ? { learningIntroduction: introduction } : {}),
    clusters,
    bridges
  };
  for (const key of [
    "creator", "license", "derivedFrom", "dateCreated", "dateModified",
    "language", "version", "generativeAssistance", "provenance"
  ]) {
    if (puzzle[key] !== undefined) document[key] = clone(puzzle[key]);
  }
  if (layouts) document.layouts = clone(layouts);
  return copyExtensions(puzzle, document, PUZZLE_KEYS);
}

export function puzzleFromJsonLd(document) {
  const profileErrors = validatePuzzleJsonLdProfile(document);
  if (profileErrors.length) {
    throw new Error(`Invalid Concept Clusters puzzle JSON-LD:\n- ${profileErrors.join("\n- ")}`);
  }
  // @id may have been omitted on input and derived by the profile check
  // above (see nodeFragmentId's comment in jsonLdProfile.js) -- key this
  // map the same way so bridge references resolve regardless.
  const clusterIndexById = new Map(
    document.clusters.map((cluster, index) => [nodeFragmentId(cluster), index])
  );
  const clusters = document.clusters.map(cluster => copyExtensions(cluster, {
    id: cluster.id,
    name: cluster.name,
    color: cluster.color,
    fact: cluster.fact,
    terms: [...cluster.terms],
    seeds: [...cluster.seeds],
    ...(cluster.termInfo ? { termInfo: clone(cluster.termInfo) } : {}),
    ...(cluster.info ? { info: clone(cluster.info) } : {})
  }, new Set(["@id", "@type", "id", "name", "color", "fact", "terms", "seeds", "termInfo", "info"])));

  const bridges = document.bridges.map(bridge => {
    const indices = bridge.clusters.map(reference => clusterIndexById.get(referenceId(reference)));
    const result = {
      id: bridge.id,
      term: bridge.term,
      clusters: indices,
      fact: bridge.fact,
      ...(bridge.conceptId ? { conceptId: bridge.conceptId } : {}),
      ...(bridge.termRole ? { termRole: bridge.termRole } : {}),
      ...(bridge.relationKind ? { relationKind: bridge.relationKind } : {}),
      ...(bridge.info ? { info: clone(bridge.info) } : {})
    };
    if (bridge.idealTerms) {
      const byCluster = new Map(bridge.idealTerms.map(entry => [
        clusterIndexById.get(referenceId(entry.cluster)), entry.term
      ]));
      result.idealTerms = indices.map(clusterIndex => byCluster.get(clusterIndex) ?? null);
    }
    if (bridge.direction) {
      result.direction = { kind: bridge.direction.kind };
      if (bridge.direction.kind === "through") {
        result.direction.from = clusterIndexById.get(referenceId(bridge.direction.from));
        result.direction.to = clusterIndexById.get(referenceId(bridge.direction.to));
      }
    }
    return copyExtensions(bridge, result, new Set([
      "@id", "@type", "id", "term", "clusters", "fact", "conceptId",
      "termRole", "relationKind", "info", "idealTerms", "direction"
    ]));
  });

  const puzzle = {
    id: document.id,
    title: document.title,
    category: document.category,
    ...(document.categories ? { categories: [...document.categories] } : {}),
    ...(document.subcategories ? { subcategories: clone(document.subcategories) } : {}),
    ...(document.large ? { large: true } : {}),
    ...(document.tags ? { tags: [...document.tags] } : {}),
    ...(document.level ? { level: document.level } : {}),
    ...(document.info ? { info: clone(document.info) } : {}),
    ...(document.relatedPuzzles ? { relatedPuzzles: relatedFromJsonLd(document.relatedPuzzles) } : {}),
    ...(document.lensMode ? { lensMode: document.lensMode } : {}),
    ...(document.preSolve ? { preSolve: true } : {}),
    ...(document.lenses ? { lenses: document.lenses.map(({ "@id": _id, "@type": _type, ...lens }) => clone(lens)) } : {}),
    ...(document.learningIntroduction ? { learningIntroduction: clone(document.learningIntroduction) } : {}),
    clusters,
    bridges
  };
  for (const key of [
    "creator", "license", "derivedFrom", "dateCreated", "dateModified",
    "language", "version", "generativeAssistance", "provenance"
  ]) {
    if (document[key] !== undefined) puzzle[key] = clone(document[key]);
  }
  return copyExtensions(document, puzzle, PUZZLE_KEYS);
}
