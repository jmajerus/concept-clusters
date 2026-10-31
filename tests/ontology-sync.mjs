import assert from "node:assert/strict";
import { ONTOLOGY_GRAPH_PREFIX, ONTOLOGY_SUBJECTS_GRAPH, ONTOLOGY_SYNC_GRAPH, ONTOLOGY_TAXONOMY_GRAPH, assertOwnedGraph, puzzleGraphIri } from "../modules/ontologyGraph.js";
import { createOntologySyncer, syncOntology } from "../modules/ontologySync.js";

export const name = "Ontology sync: only changed puzzles are replaced, withdrawn ones dropped";

// An in-memory Graph Store that answers the two queries the sync makes:
// the sync graph's triples and the list of owned graphs.
function memoryStore({ foreign = {} } = {}) {
  const graphs = new Map(Object.entries(foreign));
  const writes = [];
  const parse = text => text.trim().split("\n").filter(Boolean).map(line => {
    const match = line.match(/^<([^>]*)> <([^>]*)> (?:<([^>]*)>|("(?:[^"\\]|\\.)*")(?:\^\^<[^>]*>)?) \.$/);
    return { s: match[1], p: match[2], o: match[3] ?? JSON.parse(match[4]) };
  });
  return {
    graphs,
    writes,
    async select(query) {
      if (query.includes(`GRAPH <${ONTOLOGY_SYNC_GRAPH}>`)) {
        return { vars: ["s", "p", "o"], rows: graphs.has(ONTOLOGY_SYNC_GRAPH) ? parse(graphs.get(ONTOLOGY_SYNC_GRAPH)) : [], truncated: false };
      }
      if (query.includes("SELECT DISTINCT ?g")) {
        return { vars: ["g"], rows: [...graphs.keys()].filter(g => g.startsWith(ONTOLOGY_GRAPH_PREFIX)).map(g => ({ g })), truncated: false };
      }
      throw new Error(`unexpected query: ${query}`);
    },
    async putGraph(graph, ntriples) {
      assertOwnedGraph(graph);
      writes.push(["put", graph]);
      graphs.set(graph, ntriples);
    },
    async deleteGraph(graph) {
      assertOwnedGraph(graph);
      writes.push(["delete", graph]);
      graphs.delete(graph);
    }
  };
}

function memoryRepository(documents) {
  return {
    async listPublishedHashes() {
      return documents.map(({ kind, id, contentHash }) => ({ kind, id, contentHash }));
    },
    async getPublished({ kind, id }) {
      return documents.find(row => row.kind === kind && row.id === id);
    },
    async listPublished({ kind }) {
      return documents.filter(row => row.kind === kind);
    }
  };
}

const puzzle = (id, hash, term = "oxygen") => ({
  kind: "puzzle",
  id,
  contentHash: hash,
  document: { id, title: id, category: "biology", clusters: [{ id: "c", name: "C", terms: [term] }] }
});

export async function run() {
  const documents = [
    puzzle("alpha", "h1"),
    puzzle("beta", "h1"),
    { kind: "category", id: "biology", contentHash: "c1", document: { id: "biology", title: "Biology" } }
  ];
  const repository = memoryRepository(documents);
  // terminology-mcp's data shares the server and must survive every sync.
  const store = memoryStore({ foreign: { "urn:terminology-mcp:vocab:lcc": "<a> <b> <c> ." } });
  let tick = 0;
  const now = () => `2026-10-31T00:00:0${tick++}Z`;

  const first = await syncOntology({ repository, store, now, domains: {} });
  assert.equal(first.outcome, "synced");
  assert.equal(first.replaced, 2);
  assert.equal(first.taxonomy, true);
  assert.ok(store.graphs.has(puzzleGraphIri("alpha")));
  assert.ok(store.graphs.has(ONTOLOGY_TAXONOMY_GRAPH));
  assert.ok(store.graphs.has(ONTOLOGY_SUBJECTS_GRAPH));

  // Nothing changed: no writes at all.
  store.writes.length = 0;
  const second = await syncOntology({ repository, store, now, domains: {} });
  assert.equal(second.outcome, "current");
  assert.deepEqual(store.writes, []);

  // One puzzle edited, one withdrawn: only those graphs move.
  documents[0] = puzzle("alpha", "h2", "carbon dioxide");
  documents.splice(1, 1);
  const third = await syncOntology({ repository, store, now, domains: {} });
  assert.deepEqual(
    store.writes.map(([op, graph]) => `${op} ${graph}`),
    [
      `put ${puzzleGraphIri("alpha")}`,
      `delete ${puzzleGraphIri("beta")}`,
      `put ${ONTOLOGY_SYNC_GRAPH}`
    ]
  );
  assert.equal(third.taxonomy, false);
  assert.match(store.graphs.get(puzzleGraphIri("alpha")), /"carbon dioxide"/);

  // A full rebuild drops owned graphs only.
  const full = await syncOntology({ repository, store, now, domains: {}, full: true });
  assert.equal(full.dropped, 4);
  assert.equal(full.replaced, 1);
  assert.equal(store.graphs.get("urn:terminology-mcp:vocab:lcc"), "<a> <b> <c> .");

  // The drain loop's syncer never throws and reports its state.
  const logs = [];
  const log = { log: message => logs.push(message), error: message => logs.push(message) };
  const broken = createOntologySyncer({
    pool: {},
    store: { ...store, select: async () => { throw new Error("connect ECONNREFUSED"); } },
    log
  });
  assert.equal((await broken()).outcome, "failed");
  assert.equal((await broken()).outcome, "failed");
  assert.equal(broken.status().state, "failed");
  assert.equal(logs.filter(message => /ECONNREFUSED/.test(message)).length, 1);
  const off = createOntologySyncer({ pool: {}, env: { ONTOLOGY_SPARQL_BASE: "off" }, log });
  assert.equal((await off()).outcome, "skipped");
  assert.equal(off.status().state, "off");
}
