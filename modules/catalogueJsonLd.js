import { categoriesForPuzzle, slugify } from "../puzzles/categories.js";
import {
  catalogueUrn,
  categoryUrn,
  CONCEPT_CLUSTERS_CONTEXT,
  CONTENT_SCHEMA_VERSION,
  JSON_LD_TYPES,
  puzzleUrn,
  referenceId,
  validateBundleJsonLdProfile,
  validateCatalogueJsonLdProfile
} from "./jsonLdProfile.js";
import { puzzleFromJsonLd, puzzleToJsonLd } from "./puzzleJsonLd.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function catalogueNode(catalogue) {
  return {
    "@id": catalogueUrn(catalogue.id),
    "@type": JSON_LD_TYPES.catalogue,
    id: catalogue.id,
    title: catalogue.title,
    ...(catalogue.info ? { info: clone(catalogue.info) } : {}),
    entries: catalogue.entries.map((entry, index) => ({
      "@id": `${catalogueUrn(catalogue.id)}#entry-${index + 1}`,
      "@type": JSON_LD_TYPES.catalogueEntry,
      puzzle: { "@id": puzzleUrn(entry.id) },
      ...(entry.reason ? { reason: entry.reason } : {})
    }))
  };
}

function catalogueFromNode(node) {
  return {
    id: node.id,
    title: node.title,
    ...(node.info ? { info: clone(node.info) } : {}),
    entries: (node.entries || []).map(entry => ({
      id: (referenceId(entry.puzzle) || "").replace("urn:concept-clusters:puzzle:", ""),
      ...(entry.reason ? { reason: entry.reason } : {})
    }))
  };
}

export function catalogueToJsonLd(catalogue) {
  return {
    "@context": CONCEPT_CLUSTERS_CONTEXT,
    schemaVersion: CONTENT_SCHEMA_VERSION,
    ...catalogueNode(catalogue)
  };
}

export function catalogueBundleToJsonLd(
  catalogue,
  puzzles,
  { categories = {}, puzzleOptions = new Map() } = {}
) {
  const byId = new Map(puzzles.map(puzzle => [puzzle.id, puzzle]));
  const members = catalogue.entries.map(entry => byId.get(entry.id)).filter(Boolean);
  const categoryNames = [...new Set(members.flatMap(categoriesForPuzzle))];
  const puzzleNodes = members.map(puzzle => {
    const { "@context": _context, ...node } = puzzleToJsonLd(
      puzzle,
      puzzleOptions.get(puzzle.id) || {}
    );
    return node;
  });
  const categoryNodes = categoryNames.map(name => ({
    "@id": categoryUrn(slugify(name)),
    "@type": JSON_LD_TYPES.category,
    id: slugify(name),
    name,
    ...(categories[name]?.info ? { info: clone(categories[name].info) } : {}),
    ...(categories[name]?.subcategories
      ? { subcategories: clone(categories[name].subcategories) }
      : {})
  }));
  return {
    "@context": CONCEPT_CLUSTERS_CONTEXT,
    "@id": `${catalogueUrn(catalogue.id)}:bundle`,
    "@type": JSON_LD_TYPES.catalogueBundle,
    schemaVersion: CONTENT_SCHEMA_VERSION,
    "@graph": [catalogueNode(catalogue), ...puzzleNodes, ...categoryNodes]
  };
}

export function catalogueFromJsonLd(document) {
  if (document?.["@type"] === JSON_LD_TYPES.catalogue) {
    const errors = validateCatalogueJsonLdProfile(document);
    if (errors.length) throw new Error(`Invalid catalogue JSON-LD:\n- ${errors.join("\n- ")}`);
    return { catalogue: catalogueFromNode(document), puzzles: [], categories: {} };
  }
  const errors = validateBundleJsonLdProfile(document);
  if (errors.length) throw new Error(`Invalid catalogue bundle JSON-LD:\n- ${errors.join("\n- ")}`);
  const graph = document["@graph"];
  const catalogue = catalogueFromNode(
    graph.find(node => node?.["@type"] === JSON_LD_TYPES.catalogue)
  );
  const puzzles = graph
    .filter(node => node?.["@type"] === JSON_LD_TYPES.puzzle)
    .map(node => puzzleFromJsonLd({ "@context": document["@context"], ...node }));
  const categories = Object.fromEntries(graph
    .filter(node => node?.["@type"] === JSON_LD_TYPES.category)
    .map(node => [node.name, {
      ...(node.id ? { slug: node.id } : {}),
      ...(node.info ? { info: clone(node.info) } : {}),
      ...(node.subcategories ? { subcategories: clone(node.subcategories) } : {})
    }]));
  return { catalogue, puzzles, categories };
}
