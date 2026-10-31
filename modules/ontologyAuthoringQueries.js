// The curated SPARQL behind the ontology MCP tools, plus the sync graph
// reads the sync itself uses. Every query names Concept Clusters graphs, so
// terminology-mcp's data on the same server never leaks into a result.

import { puzzleUrn } from "./jsonLdProfile.js";
import {
  CC,
  ONTOLOGY_GRAPH_PREFIX,
  ONTOLOGY_PUZZLE_GRAPH_PREFIX,
  ONTOLOGY_SYNC_GRAPH,
  ONTOLOGY_SYNC_SUBJECT,
  ONTOLOGY_TAXONOMY_GRAPH,
  SCHEMA,
  SKOS,
  puzzleGraphIri
} from "./ontologyGraph.js";
import { ONTOLOGY_ROW_CAP } from "./ontologyStore.js";

const PREFIXES = `PREFIX cc: <${CC}>\nPREFIX skos: <${SKOS}>\nPREFIX schema: <${SCHEMA}>\n`;
const PUZZLE_URN_PREFIX = puzzleUrn("");
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

function assertSlug(value, field) {
  if (!SLUG.test(String(value))) throw new Error(`${field} must be a lowercase slug id, got ${JSON.stringify(value)}.`);
  return value;
}

function puzzleIdOf(iri) {
  return String(iri).startsWith(PUZZLE_URN_PREFIX) ? String(iri).slice(PUZZLE_URN_PREFIX.length) : String(iri);
}

function split(value) {
  return value ? String(value).split("|").filter(Boolean) : [];
}

// What the last sync recorded: when it ran and the versioned hash of each
// puzzle and of the taxonomy. Null when nothing has been loaded.
export async function readSyncState(store) {
  const { rows } = await store.select(`${PREFIXES}
SELECT ?s ?p ?o WHERE { GRAPH <${ONTOLOGY_SYNC_GRAPH}> { ?s ?p ?o } }`, { cap: Infinity });
  if (!rows.length) return null;
  const state = { syncedAt: null, graphVersion: null, taxonomyHash: null, puzzleHashes: new Map() };
  for (const { s, p, o } of rows) {
    if (s === ONTOLOGY_SYNC_SUBJECT) {
      if (p === `${CC}syncedAt`) state.syncedAt = o;
      else if (p === `${CC}graphVersion`) state.graphVersion = o;
      else if (p === `${CC}taxonomyHash`) state.taxonomyHash = o;
    } else if (p === `${CC}syncedHash`) {
      state.puzzleHashes.set(puzzleIdOf(s), o);
    }
  }
  return state;
}

export async function listOwnedGraphs(store) {
  const { rows } = await store.select(`
SELECT DISTINCT ?g WHERE { GRAPH ?g { ?s ?p ?o } FILTER(STRSTARTS(STR(?g), "${ONTOLOGY_GRAPH_PREFIX}")) }`, { cap: Infinity });
  return rows.map(row => row.g);
}

export async function ontologyCounts(store) {
  const { rows } = await store.select(`${PREFIXES}
SELECT (COUNT(*) AS ?triples) WHERE {
  GRAPH ?g { ?s ?p ?o } FILTER(STRSTARTS(STR(?g), "${ONTOLOGY_GRAPH_PREFIX}"))
}`);
  const terms = await store.select(`${PREFIXES}
SELECT (COUNT(DISTINCT ?t) AS ?terms) (COUNT(DISTINCT ?key) AS ?labels) WHERE {
  GRAPH ?g { ?t cc:labelKey ?key } FILTER(STRSTARTS(STR(?g), "${ONTOLOGY_PUZZLE_GRAPH_PREFIX}"))
}`);
  return {
    triples: rows[0]?.triples ?? 0,
    terms: terms.rows[0]?.terms ?? 0,
    distinctLabels: terms.rows[0]?.labels ?? 0
  };
}

function categoryClause(category, domain) {
  if (category) {
    return `GRAPH ?g { ?p cc:inCategory <urn:concept-clusters:category:${assertSlug(category, "category")}> }`;
  }
  if (domain) {
    return `GRAPH ?g { ?p cc:inCategory ?c }
  GRAPH <${ONTOLOGY_TAXONOMY_GRAPH}> { ?c cc:inDomain <urn:concept-clusters:domain:${assertSlug(domain, "domain")}> }`;
  }
  return "";
}

export async function sharedTerms(store, { minPuzzles = 2, category = null, domain = null, limit = 50 } = {}) {
  const { rows, truncated } = await store.select(`${PREFIXES}
SELECT ?key (SAMPLE(?label) AS ?anyLabel) (COUNT(DISTINCT ?p) AS ?puzzleCount)
       (GROUP_CONCAT(DISTINCT STR(?p); separator="|") AS ?puzzles)
WHERE {
  GRAPH ?g { ?t cc:labelKey ?key ; skos:prefLabel ?label ; cc:inPuzzle ?p }
  FILTER(STRSTARTS(STR(?g), "${ONTOLOGY_PUZZLE_GRAPH_PREFIX}"))
  ${categoryClause(category, domain)}
}
GROUP BY ?key
HAVING (COUNT(DISTINCT ?p) >= ${Math.max(2, Math.trunc(minPuzzles))})
ORDER BY DESC(?puzzleCount) ?key
LIMIT ${Math.min(Math.trunc(limit), ONTOLOGY_ROW_CAP)}`);
  return {
    terms: rows.map(row => ({
      label: row.anyLabel,
      labelKey: row.key,
      puzzleCount: row.puzzleCount,
      puzzles: split(row.puzzles).map(puzzleIdOf).sort()
    })),
    truncated
  };
}

export async function relatedPuzzles(store, { puzzleId, limit = 10 } = {}) {
  assertSlug(puzzleId, "puzzle_id");
  const graph = puzzleGraphIri(puzzleId);
  const self = puzzleUrn(puzzleId);
  const found = await store.select(`${PREFIXES}
SELECT ?title WHERE { GRAPH <${graph}> { <${self}> a cc:Puzzle . OPTIONAL { <${self}> schema:name ?title } } }`);
  if (!found.rows.length) {
    throw new Error(`Puzzle ${puzzleId} is not in the ontology graph. It may be unpublished, or published since the last sync; ontology_status shows when that ran.`);
  }
  const authored = await store.select(`${PREFIXES}
SELECT ?other ?title WHERE {
  GRAPH <${graph}> { <${self}> cc:relatedPuzzle ?other }
  OPTIONAL { GRAPH ?og { ?other schema:name ?title } FILTER(STRSTARTS(STR(?og), "${ONTOLOGY_PUZZLE_GRAPH_PREFIX}")) }
}`);
  const neighbors = await store.select(`${PREFIXES}
SELECT ?other (SAMPLE(?otherTitle) AS ?title) (COUNT(DISTINCT ?key) AS ?shared)
       (GROUP_CONCAT(DISTINCT ?label; separator="|") AS ?labels)
WHERE {
  GRAPH <${graph}> { ?t cc:labelKey ?key ; skos:prefLabel ?label }
  GRAPH ?g { ?t2 cc:labelKey ?key ; cc:inPuzzle ?other . ?other schema:name ?otherTitle }
  FILTER(STRSTARTS(STR(?g), "${ONTOLOGY_PUZZLE_GRAPH_PREFIX}") && ?g != <${graph}>)
}
GROUP BY ?other
ORDER BY DESC(?shared) ?other
LIMIT ${ONTOLOGY_ROW_CAP}`);
  const evidence = new Map(neighbors.rows.map(row => [puzzleIdOf(row.other), row]));
  const authoredIds = new Set();
  const authoredEntries = authored.rows.map(row => {
    const id = puzzleIdOf(row.other);
    authoredIds.add(id);
    const shared = evidence.get(id);
    return {
      id,
      title: row.title ?? shared?.title ?? null,
      published: row.title != null || shared != null,
      sharedLabelCount: shared?.shared ?? 0,
      sharedLabels: split(shared?.labels).sort()
    };
  });
  const candidates = neighbors.rows
    .filter(row => !authoredIds.has(puzzleIdOf(row.other)))
    .slice(0, Math.min(Math.trunc(limit), 50))
    .map(row => ({
      id: puzzleIdOf(row.other),
      title: row.title,
      sharedLabelCount: row.shared,
      sharedLabels: split(row.labels).sort()
    }));
  return { puzzleId, title: found.rows[0].title ?? null, authored: authoredEntries, candidates };
}

function queryForm(query) {
  // IRIs go first: the # in <…vocab#> is not a comment.
  const body = String(query)
    .replace(/<[^<>\s]*>/g, "<>")
    .replace(/#[^\n]*/g, " ")
    .replace(/^\s*((PREFIX\s+[\w-]*:\s*<[^>]*>|BASE\s+<[^>]*>)\s*)*/i, "");
  return (body.match(/^\s*([A-Za-z]+)/)?.[1] || "").toUpperCase();
}

// The Concept Clusters graphs the last sync recorded: what the passthrough
// is allowed to see.
export function ownedDataset(state) {
  const graphs = [
    ...[...(state?.puzzleHashes?.keys() || [])].sort().map(puzzleGraphIri),
    ONTOLOGY_TAXONOMY_GRAPH,
    ONTOLOGY_SYNC_GRAPH
  ];
  return { defaultGraphs: graphs, namedGraphs: graphs };
}

// The passthrough. Its dataset is pinned to Concept Clusters graphs, so the
// default graph is their union and GRAPH ranges only over them; the shared
// server's default graph and other tools' graphs stay out of reach. /query
// already refuses updates. The text guards are the result form (JSON
// results need SELECT or ASK) and SERVICE, which would make the shared
// server fetch remote endpoints.
export async function runReadQuery(store, { query, limit = ONTOLOGY_ROW_CAP, dataset } = {}) {
  if (!dataset?.namedGraphs?.length) throw new Error("ontology_query needs the Concept Clusters graph list to scope the query.");
  const form = queryForm(query);
  if (form !== "SELECT" && form !== "ASK") {
    throw new Error(`ontology_query runs SELECT or ASK queries only; this query starts with ${form || "nothing recognizable"}.`);
  }
  if (/\bSERVICE\b/i.test(query)) {
    throw new Error("ontology_query does not run SERVICE (federated) clauses.");
  }
  const result = await store.select(query, { cap: Math.min(Math.trunc(limit), ONTOLOGY_ROW_CAP), dataset });
  return form === "ASK"
    ? { form, boolean: result.boolean }
    : { form, vars: result.vars, rows: result.rows, truncated: result.truncated };
}
