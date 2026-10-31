// Published content as RDF for the shared LAN Oxigraph server. Concept
// Clusters owns every graph under ONTOLOGY_GRAPH_PREFIX and nothing else:
// the server's default graph and terminology-mcp's urn:terminology-mcp:
// graphs belong to other tools. See docs/ONTOLOGY.md.
//
// One named graph per puzzle, so a publish replaces only that puzzle. No
// triple links one puzzle's graph to another's terms; queries join puzzles
// on cc:labelKey instead, which keeps a single-graph replace consistent.

import { categoryUrn, catalogueUrn, puzzleUrn } from "./jsonLdProfile.js";

export const ONTOLOGY_GRAPH_PREFIX = "urn:concept-clusters:graph:";
export const ONTOLOGY_PUZZLE_GRAPH_PREFIX = `${ONTOLOGY_GRAPH_PREFIX}puzzle:`;
export const ONTOLOGY_TAXONOMY_GRAPH = `${ONTOLOGY_GRAPH_PREFIX}taxonomy`;
export const ONTOLOGY_SYNC_GRAPH = `${ONTOLOGY_GRAPH_PREFIX}sync`;
export const ONTOLOGY_SYNC_SUBJECT = "urn:concept-clusters:ontology-sync";

// Bump when the triples a document produces change, so the sync reloads
// every graph instead of trusting hashes recorded by the older converter.
export const ONTOLOGY_GRAPH_VERSION = "1";

export const CC = "https://concept-clusters.org/vocab#";
export const SKOS = "http://www.w3.org/2004/02/skos/core#";
export const SCHEMA = "https://schema.org/";
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const XSD = "http://www.w3.org/2001/XMLSchema#";

export function puzzleGraphIri(id) {
  return `${ONTOLOGY_PUZZLE_GRAPH_PREFIX}${id}`;
}

export function domainUrn(id) {
  return `urn:concept-clusters:domain:${id}`;
}

export function subcategoryUrn(categoryId, subcategoryId) {
  return `urn:concept-clusters:subcategory:${categoryId}--${subcategoryId}`;
}

export function isOwnedGraph(iri) {
  return typeof iri === "string" &&
    iri.startsWith(ONTOLOGY_GRAPH_PREFIX) &&
    iri.length > ONTOLOGY_GRAPH_PREFIX.length;
}

// Every write to the shared server passes through here.
export function assertOwnedGraph(iri) {
  if (!isOwnedGraph(iri)) {
    throw new Error(`Refusing to write graph ${JSON.stringify(iri)}: Concept Clusters owns only ${ONTOLOGY_GRAPH_PREFIX}* graphs.`);
  }
  return iri;
}

// The join key for "same label in two puzzles": case, accents, and spacing
// do not count. This is a label match, never an identity claim.
export function labelKey(label) {
  return String(label)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value) {
  return labelKey(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "x";
}

function iri(value) {
  return `<${String(value).replace(/[\u0000- <>"{}|^`\\]/g, c => encodeURIComponent(c))}>`;
}

function literal(value, datatype = null) {
  const text = JSON.stringify(String(value));
  return datatype ? `${text}^^<${XSD}${datatype}>` : text;
}

function fragment(base, part) {
  return `${base}#${encodeURIComponent(String(part))}`;
}

function tripleWriter() {
  const lines = [];
  const add = (subject, predicate, object) => {
    lines.push(`${subject} <${predicate}> ${object} .`);
  };
  add.text = () => (lines.length ? `${lines.join("\n")}\n` : "");
  add.count = () => lines.length;
  return add;
}

function textOf(info) {
  return typeof info === "string" ? info : info?.text;
}

export function puzzleTriples(document) {
  const t = tripleWriter();
  const id = document.id;
  const base = puzzleUrn(id);
  const P = iri(base);
  t(P, RDF_TYPE, iri(`${CC}Puzzle`));
  if (document.title) t(P, `${SCHEMA}name`, literal(document.title));
  if (textOf(document.info)) t(P, `${SCHEMA}description`, literal(textOf(document.info)));
  if (document.category) t(P, `${CC}primaryCategory`, iri(categoryUrn(document.category)));
  const categories = new Set([document.category, ...(document.categories || [])].filter(Boolean));
  for (const category of categories) t(P, `${CC}inCategory`, iri(categoryUrn(category)));
  for (const [category, subcategory] of Object.entries(document.subcategories || {})) {
    t(P, `${CC}inSubcategory`, iri(subcategoryUrn(category, subcategory)));
  }
  if (document.puzzleKind) t(P, `${CC}puzzleKind`, literal(document.puzzleKind));
  if (document.level) t(P, `${CC}level`, literal(document.level));
  if (document.language) t(P, `${SCHEMA}inLanguage`, literal(document.language));
  for (const tag of document.tags || []) t(P, `${CC}tag`, literal(tag));

  // Terms are scoped to their puzzle. Two labels that slug alike get
  // distinct IRIs rather than silently merging.
  const termsByLabel = new Map();
  const usedSlugs = new Set();
  const labelled = (node, label) => {
    t(node, `${SKOS}prefLabel`, literal(label));
    t(node, `${CC}labelKey`, literal(labelKey(label)));
    t(node, `${CC}inPuzzle`, P);
  };
  const termNode = label => {
    let node = termsByLabel.get(label);
    if (node) return node;
    let name = slug(label);
    for (let n = 2; usedSlugs.has(name); n++) name = `${slug(label)}-${n}`;
    usedSlugs.add(name);
    node = iri(`${base}#term/${name}`);
    termsByLabel.set(label, node);
    t(node, RDF_TYPE, iri(`${CC}Term`));
    labelled(node, label);
    return node;
  };

  for (const cluster of document.clusters || []) {
    const C = iri(fragment(base, cluster.id));
    t(C, RDF_TYPE, iri(`${CC}Cluster`));
    if (cluster.name) t(C, `${SCHEMA}name`, literal(cluster.name));
    if (cluster.fact) t(C, `${CC}fact`, literal(cluster.fact));
    t(P, `${CC}hasCluster`, C);
    const seeds = new Set(cluster.seeds || []);
    const floating = new Set(cluster.floatingTerms || []);
    for (const label of cluster.terms || []) {
      const T = termNode(label);
      t(C, `${CC}term`, T);
      t(T, `${CC}inCluster`, C);
      if (seeds.has(label)) t(T, `${CC}role`, literal("seed"));
      else if (floating.has(label)) t(T, `${CC}role`, literal("floating"));
      const note = textOf(cluster.termInfo?.[label]);
      if (note) t(T, `${CC}note`, literal(note));
    }
  }

  for (const bridge of document.bridges || []) {
    const B = iri(fragment(base, bridge.id));
    t(B, RDF_TYPE, iri(`${CC}Bridge`));
    if (bridge.term) {
      labelled(B, bridge.term);
      if (!termsByLabel.has(bridge.term)) termsByLabel.set(bridge.term, B);
    }
    if (bridge.fact) t(B, `${CC}fact`, literal(bridge.fact));
    if (bridge.relationKind) t(B, `${CC}relationKind`, literal(bridge.relationKind));
    t(P, `${CC}hasBridge`, B);
    for (const clusterId of bridge.clusters || []) {
      t(B, `${CC}connectsCluster`, iri(fragment(base, clusterId)));
    }
  }

  for (const lens of document.lenses || []) {
    const L = iri(fragment(base, lens.id));
    t(L, RDF_TYPE, iri(`${CC}Lens`));
    if (lens.prompt) t(L, `${CC}prompt`, literal(lens.prompt));
    t(P, `${CC}hasLens`, L);
    for (const target of lens.targets || []) {
      const T = termsByLabel.get(target);
      if (T) t(L, `${CC}targetsTerm`, T);
    }
  }

  for (const entry of document.relatedPuzzles?.entries || []) {
    if (entry?.id) t(P, `${CC}relatedPuzzle`, iri(puzzleUrn(entry.id)));
  }
  return { ntriples: t.text(), triples: t.count() };
}

// Categories, subcategories, domains, and catalogues: one graph, rebuilt
// whenever any of them changes.
export function taxonomyTriples({ categories = [], catalogues = [], domains = {} } = {}) {
  const t = tripleWriter();
  for (const [id, domain] of Object.entries(domains)) {
    const D = iri(domainUrn(id));
    t(D, RDF_TYPE, iri(`${CC}Domain`));
    t(D, `${SCHEMA}name`, literal(domain?.title || id));
  }
  for (const category of categories) {
    const C = iri(categoryUrn(category.id));
    t(C, RDF_TYPE, iri(`${CC}Category`));
    t(C, `${SCHEMA}name`, literal(category.title || category.id));
    if (category.domain) t(C, `${CC}inDomain`, iri(domainUrn(category.domain)));
    for (const [subId, sub] of Object.entries(category.subcategories || {})) {
      const S = iri(subcategoryUrn(category.id, subId));
      t(S, RDF_TYPE, iri(`${CC}Subcategory`));
      t(S, `${SCHEMA}name`, literal(sub?.title || subId));
      t(S, `${CC}inCategory`, C);
      t(C, `${CC}hasSubcategory`, S);
    }
  }
  for (const catalogue of catalogues) {
    const K = iri(catalogueUrn(catalogue.id));
    const meta = catalogue.kind === "meta";
    t(K, RDF_TYPE, iri(`${CC}${meta ? "MetaCatalogue" : "Catalogue"}`));
    t(K, `${SCHEMA}name`, literal(catalogue.title || catalogue.id));
    for (const entry of catalogue.entries || []) {
      if (!entry?.id) continue;
      t(K, meta ? `${CC}hasChildCatalogue` : `${CC}hasEntry`,
        iri(meta ? catalogueUrn(entry.id) : puzzleUrn(entry.id)));
    }
  }
  return { ntriples: t.text(), triples: t.count() };
}

// What the sync graph records: the versioned hash it loaded for each
// document, so a restart compares instead of reloading.
export function syncTriples({ syncedAt, puzzleHashes, taxonomyHash }) {
  const t = tripleWriter();
  const S = iri(ONTOLOGY_SYNC_SUBJECT);
  t(S, `${CC}syncedAt`, literal(syncedAt, "dateTime"));
  t(S, `${CC}graphVersion`, literal(ONTOLOGY_GRAPH_VERSION));
  t(S, `${CC}puzzleCount`, literal(puzzleHashes.size, "integer"));
  if (taxonomyHash) t(S, `${CC}taxonomyHash`, literal(taxonomyHash));
  for (const [id, hash] of [...puzzleHashes].sort(([a], [b]) => a.localeCompare(b))) {
    t(iri(puzzleUrn(id)), `${CC}syncedHash`, literal(hash));
  }
  return { ntriples: t.text(), triples: t.count() };
}
