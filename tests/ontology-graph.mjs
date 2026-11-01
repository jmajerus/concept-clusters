import assert from "node:assert/strict";
import {
  ONTOLOGY_SYNC_GRAPH,
  ONTOLOGY_TAXONOMY_GRAPH,
  assertOwnedGraph,
  isOwnedGraph,
  labelKey,
  ONTOLOGY_SUBJECTS_GRAPH,
  SUBJECTS_SCHEME,
  puzzleGraphIri,
  puzzleTriples,
  subjectsTriples,
  taxonomyTriples
} from "../modules/ontologyGraph.js";
import { createOntologyStore, ontologyStoreConfig } from "../modules/ontologyStore.js";
import { ownedDataset, runReadQuery } from "../modules/ontologyAuthoringQueries.js";

export const name = "Ontology graph: published content as RDF in Concept Clusters' own named graphs";

const CC = "https://concept-clusters.org/vocab#";
const P = "<urn:concept-clusters:puzzle:cell-energy>";

const puzzle = {
  id: "cell-energy",
  title: "Cell energy",
  category: "biology",
  categories: ["biology", "chemistry"],
  subcategories: { biology: "cell-biology" },
  clusters: [
    {
      id: "inputs",
      name: "Inputs",
      fact: "What the cell takes in.",
      seeds: ["Glucose"],
      floatingTerms: ["oxygen"],
      terms: ["Glucose", "oxygen", "GLUCOSE"],
      termInfo: { oxygen: { text: "O₂, \"the\" oxidant" } }
    },
    { id: "outputs", name: "Outputs", fact: "What it gives off.", terms: ["ATP", "carbon dioxide"] }
  ],
  bridges: [{ id: "respiration", term: "Respiration", clusters: ["inputs", "outputs"], fact: "Links them.", relationKind: "dynamic" }],
  lenses: [{ id: "spent", prompt: "Which are spent?", targets: ["Glucose", "Respiration", "missing"] }],
  relatedPuzzles: { entries: [{ id: "energy-flow", reason: "Same currency." }] }
};

export async function run() {
  // Ownership: only urn:concept-clusters:graph:* is writable.
  assert.equal(isOwnedGraph(puzzleGraphIri("cell-energy")), true);
  assert.equal(isOwnedGraph(ONTOLOGY_TAXONOMY_GRAPH), true);
  assert.equal(isOwnedGraph(ONTOLOGY_SYNC_GRAPH), true);
  for (const foreign of ["", null, "urn:concept-clusters:graph:", "urn:terminology-mcp:vocab:x", "urn:concept-clusters:puzzle:x", "default"]) {
    assert.equal(isOwnedGraph(foreign), false, String(foreign));
    assert.throws(() => assertOwnedGraph(foreign), /owns only urn:concept-clusters:graph:/);
  }

  assert.equal(labelKey("  Café\tAu  Lait "), "cafe au lait");

  const { ntriples, triples } = puzzleTriples(puzzle);
  const lines = ntriples.trim().split("\n");
  assert.equal(lines.length, triples);
  assert.ok(lines.every(line => line.endsWith(" .")));
  const has = line => assert.ok(lines.includes(line), `missing: ${line}`);
  has(`${P} <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${CC}Puzzle> .`);
  has(`${P} <${CC}primaryCategory> <urn:concept-clusters:category:biology> .`);
  has(`${P} <${CC}inCategory> <urn:concept-clusters:category:chemistry> .`);
  has(`${P} <${CC}inSubcategory> <urn:concept-clusters:subcategory:biology--cell-biology> .`);
  has(`${P} <${CC}relatedPuzzle> <urn:concept-clusters:puzzle:energy-flow> .`);
  has(`<urn:concept-clusters:puzzle:cell-energy#term/glucose> <${CC}role> "seed" .`);
  has(`<urn:concept-clusters:puzzle:cell-energy#term/oxygen> <${CC}role> "floating" .`);
  has(`<urn:concept-clusters:puzzle:cell-energy#term/oxygen> <${CC}note> "O₂, \\"the\\" oxidant" .`);
  // Labels that slug alike stay distinct terms with the same join key.
  has(`<urn:concept-clusters:puzzle:cell-energy#term/glucose-2> <http://www.w3.org/2004/02/skos/core#prefLabel> "GLUCOSE" .`);
  has(`<urn:concept-clusters:puzzle:cell-energy#term/glucose-2> <${CC}labelKey> "glucose" .`);
  // Bridges carry a label and join key like terms; lenses reach both.
  has(`<urn:concept-clusters:puzzle:cell-energy#respiration> <${CC}labelKey> "respiration" .`);
  has(`<urn:concept-clusters:puzzle:cell-energy#respiration> <${CC}connectsCluster> <urn:concept-clusters:puzzle:cell-energy#outputs> .`);
  has(`<urn:concept-clusters:puzzle:cell-energy#spent> <${CC}targetsTerm> <urn:concept-clusters:puzzle:cell-energy#respiration> .`);
  assert.equal(lines.filter(line => line.includes(`#spent> <${CC}targetsTerm>`)).length, 2);
  // Nothing in a puzzle graph points into another puzzle's terms.
  assert.ok(!lines.some(line => /sharesLabelWith|sameAs/.test(line)));

  const taxonomy = taxonomyTriples({
    domains: { "life-sciences": { title: "Life Sciences" } },
    categories: [{ id: "biology", title: "Biology", domain: "life-sciences", subcategories: { "cell-biology": { title: "Cell Biology" } } }],
    catalogues: [
      { id: "energy", title: "Energy", entries: [{ id: "cell-energy" }] },
      { id: "series", title: "Series", kind: "meta", entries: [{ id: "energy" }] }
    ]
  }).ntriples;
  assert.match(taxonomy, /<urn:concept-clusters:category:biology> <https:\/\/concept-clusters\.org\/vocab#inDomain> <urn:concept-clusters:domain:life-sciences> \./);
  assert.match(taxonomy, /<urn:concept-clusters:subcategory:biology--cell-biology> <https:\/\/concept-clusters\.org\/vocab#inCategory> <urn:concept-clusters:category:biology> \./);
  assert.match(taxonomy, /<urn:concept-clusters:catalogue:energy> <https:\/\/concept-clusters\.org\/vocab#hasEntry> <urn:concept-clusters:puzzle:cell-energy> \./);
  assert.match(taxonomy, /<urn:concept-clusters:catalogue:series> <https:\/\/concept-clusters\.org\/vocab#hasChildCatalogue> <urn:concept-clusters:catalogue:energy> \./);

  // The subjects graph is a plain SKOS tree for terminology-mcp's import:
  // domains on top, puzzle kinds left out, Concept Clusters IRIs kept.
  assert.equal(isOwnedGraph(ONTOLOGY_SUBJECTS_GRAPH), true);
  const SK = "http://www.w3.org/2004/02/skos/core#";
  const subjects = subjectsTriples({
    domains: { "life-sciences": { title: "Life Sciences" } },
    categories: [
      { id: "biology", title: "Biology", domain: "life-sciences", info: { text: "Player copy." }, subcategories: { "cell-biology": { title: "Cell Biology" } } },
      { id: "trivia", title: "Trivia" },
      { id: "orphan", title: "Orphan", domain: "retired-domain" }
    ]
  }).ntriples.trim().split("\n");
  const hasSubject = line => assert.ok(subjects.includes(line), `missing: ${line}`);
  hasSubject(`<${SUBJECTS_SCHEME}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${SK}ConceptScheme> .`);
  hasSubject(`<${SUBJECTS_SCHEME}> <urn:terminology-mcp:vocab:hierarchy> "tree" .`);
  hasSubject(`<${SUBJECTS_SCHEME}> <urn:terminology-mcp:vocab:slugUniqueDepth> "0"^^<http://www.w3.org/2001/XMLSchema#integer> .`);
  hasSubject(`<${SUBJECTS_SCHEME}> <urn:terminology-mcp:vocab:slugUniqueDepth> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .`);
  // Slugs are the stored ids, not re-derived from labels. A subcategory's
  // slug is its own part ("cell-biology"), not the composed
  // "biology--cell-biology" key.
  hasSubject(`<urn:concept-clusters:domain:life-sciences> <urn:terminology-mcp:vocab:slug> "life-sciences" .`);
  hasSubject(`<urn:concept-clusters:category:biology> <urn:terminology-mcp:vocab:slug> "biology" .`);
  hasSubject(`<urn:concept-clusters:subcategory:biology--cell-biology> <urn:terminology-mcp:vocab:slug> "cell-biology" .`);
  hasSubject(`<${SUBJECTS_SCHEME}> <${SK}hasTopConcept> <urn:concept-clusters:domain:life-sciences> .`);
  hasSubject(`<urn:concept-clusters:domain:life-sciences> <${SK}topConceptOf> <${SUBJECTS_SCHEME}> .`);
  hasSubject(`<urn:concept-clusters:category:biology> <${SK}broader> <urn:concept-clusters:domain:life-sciences> .`);
  hasSubject(`<urn:concept-clusters:category:biology> <urn:terminology-mcp:vocab:alias> "cc-category:biology" .`);
  hasSubject(`<urn:concept-clusters:subcategory:biology--cell-biology> <${SK}broader> <urn:concept-clusters:category:biology> .`);
  hasSubject(`<urn:concept-clusters:subcategory:biology--cell-biology> <${SK}inScheme> <${SUBJECTS_SCHEME}> .`);
  hasSubject(`<urn:concept-clusters:subcategory:biology--cell-biology> <urn:terminology-mcp:vocab:alias> "cc-subcategory:biology--cell-biology" .`);
  assert.ok(!subjects.some(line => /category:trivia|category:orphan|Player copy|scopeNote/.test(line)));
  // Only SKOS and terminology-mcp's own predicates, so the import omits nothing.
  const allowed = new Set([`${SK}prefLabel`, `${SK}inScheme`, `${SK}broader`, `${SK}topConceptOf`, `${SK}hasTopConcept`,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "urn:terminology-mcp:vocab:alias", "urn:terminology-mcp:vocab:hierarchy",
    "urn:terminology-mcp:vocab:slug", "urn:terminology-mcp:vocab:slugUniqueDepth"]);
  for (const line of subjects) assert.ok(allowed.has(line.match(/^<[^>]+> <([^>]+)>/)[1]), line);

  // Config: unset is the LAN server, "off" is off.
  assert.equal(ontologyStoreConfig({}).baseUrl, "http://oxigraph.localdomain:7878");
  assert.equal(ontologyStoreConfig({ ONTOLOGY_SPARQL_BASE: "OFF" }), null);
  assert.equal(ontologyStoreConfig({ ONTOLOGY_SPARQL_BASE: "http://x:1/" }).baseUrl, "http://x:1");

  // The store refuses to write a graph it does not own, before any request.
  const requests = [];
  const store = createOntologyStore({
    baseUrl: "http://store",
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return { status: 204, text: async () => "" };
    }
  });
  await assert.rejects(store.putGraph("urn:terminology-mcp:vocab:x", ""), /owns only/);
  await assert.rejects(store.deleteGraph(""), /owns only/);
  assert.equal(requests.length, 0);
  await store.putGraph(puzzleGraphIri("cell-energy"), ntriples);
  assert.equal(requests[0].url, `http://store/store?graph=${encodeURIComponent("urn:concept-clusters:graph:puzzle:cell-energy")}`);
  assert.equal(requests[0].init.method, "PUT");

  // A dataset goes out as protocol parameters, which override FROM in the
  // query text.
  const dataset = ownedDataset({ puzzleHashes: new Map([["cell-energy", "v1:h"]]) });
  assert.deepEqual(dataset.namedGraphs, [puzzleGraphIri("cell-energy"), ONTOLOGY_TAXONOMY_GRAPH, ONTOLOGY_SUBJECTS_GRAPH, ONTOLOGY_SYNC_GRAPH]);
  const queried = [];
  const querying = createOntologyStore({
    baseUrl: "http://store",
    fetchImpl: async (url, init) => {
      queried.push({ url, init });
      return { status: 200, text: async () => JSON.stringify({ head: { vars: ["n"] }, results: { bindings: [{ n: { type: "literal", value: "3", datatype: "http://www.w3.org/2001/XMLSchema#integer" } }] } }) };
    }
  });
  assert.deepEqual((await querying.select("SELECT ?n WHERE {}", { dataset })).rows, [{ n: 3 }]);
  const form = new URLSearchParams(queried[0].init.body);
  assert.equal(queried[0].url, "http://store/query");
  assert.equal(form.get("query"), "SELECT ?n WHERE {}");
  assert.deepEqual(form.getAll("default-graph-uri"), dataset.defaultGraphs);
  assert.deepEqual(form.getAll("named-graph-uri"), dataset.namedGraphs);

  // The passthrough: always scoped, SELECT/ASK only, no SERVICE, and a #
  // inside an IRI is not a comment.
  const seen = [];
  const answering = {
    select: async (query, options) => {
      seen.push(options);
      return { vars: ["n"], rows: [{ n: 1 }], truncated: false };
    }
  };
  const ok = await runReadQuery(answering, { query: `PREFIX cc: <${CC}>\n# note\nSELECT ?n WHERE { ?s cc:x ?n }`, dataset });
  assert.equal(ok.form, "SELECT");
  assert.equal(seen[0].dataset, dataset);
  await assert.rejects(runReadQuery(answering, { query: "SELECT * WHERE { ?s ?p ?o }" }), /scope the query/);
  await assert.rejects(runReadQuery(answering, { query: "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }", dataset }), /SELECT or ASK/);
  await assert.rejects(runReadQuery(answering, { query: "DROP ALL", dataset }), /SELECT or ASK/);
  await assert.rejects(runReadQuery(answering, { query: "SELECT * WHERE { service <http://x> { ?s ?p ?o } }", dataset }), /SERVICE/);
}
