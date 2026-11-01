// Keeps Concept Clusters' named graphs on the shared Oxigraph server in step
// with published_documents. The drain loop calls the syncer each tick; it
// compares Postgres content hashes with the hashes the sync graph recorded
// and replaces only what changed. It reads Postgres directly rather than the
// D1 replica queue, which clears entries once they reach D1.
// `npm run ontology:load -- --full` drops every owned graph and rebuilds.

import { DOMAINS } from "../puzzles/domains.js";
import { draftContentHash } from "./draftRepository.js";
import { listOwnedGraphs, readSyncState } from "./ontologyAuthoringQueries.js";
import {
  ONTOLOGY_GRAPH_VERSION,
  ONTOLOGY_SUBJECTS_GRAPH,
  ONTOLOGY_SYNC_GRAPH,
  ONTOLOGY_TAXONOMY_GRAPH,
  puzzleGraphIri,
  puzzleTriples,
  subjectsTriples,
  syncTriples,
  taxonomyTriples
} from "./ontologyGraph.js";
import { createOntologyStore, ontologyStoreConfig } from "./ontologyStore.js";
import { authoringDatabaseUrl, getAuthoringPool } from "./postgresPool.js";
import { PostgresPublishedRepository } from "./postgresPublishedRepository.js";

function versioned(hash) {
  return `v${ONTOLOGY_GRAPH_VERSION}:${hash}`;
}

// One hash over every live category and catalogue and the domain registry:
// any change rebuilds the taxonomy and subjects graphs. DOMAINS follows
// the published domain rows (modules/domainRegistry.js), refreshed earlier
// in the same tick.
export function taxonomyHashOf(hashRows, domains = DOMAINS) {
  const lines = hashRows
    .filter(row => row.kind === "category" || row.kind === "catalogue")
    .map(row => `${row.kind}:${row.id}:${row.contentHash}`)
    .sort();
  lines.push(`domains:${draftContentHash(JSON.stringify(domains))}`);
  return versioned(draftContentHash(lines.join("\n")));
}

// What a sync would do, given Postgres hashes and the recorded sync state.
export function planOntologySync(hashRows, state, domains = DOMAINS) {
  const recorded = state?.puzzleHashes || new Map();
  const live = new Map(hashRows
    .filter(row => row.kind === "puzzle")
    .map(row => [row.id, versioned(row.contentHash)]));
  const changed = [...live].filter(([id, hash]) => recorded.get(id) !== hash).map(([id]) => id);
  const removed = [...recorded.keys()].filter(id => !live.has(id));
  const taxonomyHash = taxonomyHashOf(hashRows, domains);
  return {
    live,
    changed,
    removed,
    taxonomyHash,
    taxonomyChanged: state?.taxonomyHash !== taxonomyHash
  };
}

// Graph updates, not documents: any number of category or catalogue
// changes is one taxonomy rebuild.
export function pendingCount(plan) {
  return plan.changed.length + plan.removed.length + (plan.taxonomyChanged ? 1 : 0);
}

export async function syncOntology({
  repository,
  store,
  full = false,
  domains = DOMAINS,
  now = () => new Date().toISOString()
}) {
  let dropped = 0;
  if (full) {
    for (const graph of await listOwnedGraphs(store)) {
      await store.deleteGraph(graph);
      dropped++;
    }
  }
  const state = full ? null : await readSyncState(store);
  const hashRows = await repository.listPublishedHashes({ kinds: ["puzzle", "category", "catalogue"] });
  const plan = planOntologySync(hashRows, state, domains);
  if (state && !pendingCount(plan)) {
    return { outcome: "current", replaced: 0, removed: 0, taxonomy: false, dropped, puzzles: plan.live.size };
  }
  const loaded = new Map(state?.puzzleHashes || []);
  let triples = 0;
  for (const id of plan.changed) {
    const record = await repository.getPublished({ kind: "puzzle", id });
    const graph = puzzleTriples({ ...record.document, id });
    await store.putGraph(puzzleGraphIri(id), graph.ntriples);
    loaded.set(id, versioned(record.contentHash));
    triples += graph.triples;
  }
  for (const id of plan.removed) {
    await store.deleteGraph(puzzleGraphIri(id));
    loaded.delete(id);
  }
  if (plan.taxonomyChanged) {
    const [categories, catalogues] = await Promise.all([
      repository.listPublished({ kind: "category" }),
      repository.listPublished({ kind: "catalogue" })
    ]);
    const categoryDocuments = categories.map(row => ({ ...row.document, id: row.id }));
    const graph = taxonomyTriples({
      categories: categoryDocuments,
      catalogues: catalogues.map(row => ({ ...row.document, id: row.id })),
      domains
    });
    await store.putGraph(ONTOLOGY_TAXONOMY_GRAPH, graph.ntriples);
    const subjects = subjectsTriples({ categories: categoryDocuments, domains });
    await store.putGraph(ONTOLOGY_SUBJECTS_GRAPH, subjects.ntriples);
    triples += graph.triples + subjects.triples;
  }
  await store.putGraph(ONTOLOGY_SYNC_GRAPH, syncTriples({
    syncedAt: now(),
    puzzleHashes: loaded,
    taxonomyHash: plan.taxonomyHash
  }).ntriples);
  return {
    outcome: "synced",
    replaced: plan.changed.length,
    removed: plan.removed.length,
    taxonomy: plan.taxonomyChanged,
    dropped,
    triples,
    puzzles: loaded.size
  };
}

// The drain loop's step. Never throws; each distinct message is logged
// once, so a 15 s tick does not repeat the same error.
export function createOntologySyncer({
  pool,
  env = process.env,
  store = null,
  log = console
} = {}) {
  const config = store ? null : ontologyStoreConfig(env);
  const target = store || (config ? createOntologyStore(config) : null);
  const repository = pool ? new PostgresPublishedRepository(pool) : null;
  let lastMessage = null;
  let status = { state: target ? "pending" : "off" };
  const note = (level, message) => {
    if (message === lastMessage) return;
    lastMessage = message;
    log[level](message);
  };
  async function syncIfChanged() {
    if (!target || !repository) {
      note("log", "Ontology sync off: ONTOLOGY_SPARQL_BASE is off or there is no authoring database.");
      return { outcome: "skipped" };
    }
    try {
      const result = await syncOntology({ repository, store: target });
      status = { state: result.outcome, at: new Date().toISOString(), puzzles: result.puzzles };
      if (result.outcome === "synced") {
        lastMessage = null;
        log.log(`Ontology sync: replaced ${result.replaced}, removed ${result.removed}${result.taxonomy ? ", rebuilt taxonomy" : ""}.`);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      status = { state: "failed", at: new Date().toISOString(), error: message };
      note("error", `Ontology sync failed (retrying): ${message}`);
      return { outcome: "failed", error: message };
    }
  }
  syncIfChanged.status = () => ({ ...status });
  return syncIfChanged;
}

// What the MCP servers receive: the store, plus the number of graph
// updates (one per changed or withdrawn puzzle, one for the taxonomy) the
// sync has not made yet, when this process can reach Postgres.
// Null when the store is off.
export function createOntologyService({ env = process.env, fetchImpl } = {}) {
  const config = ontologyStoreConfig(env);
  if (!config) return null;
  const store = createOntologyStore({ ...config, ...(fetchImpl ? { fetchImpl } : {}) });
  const databaseUrl = authoringDatabaseUrl(env);
  return {
    store,
    async pending() {
      if (!databaseUrl) return null;
      const repository = new PostgresPublishedRepository(getAuthoringPool(databaseUrl));
      const hashRows = await repository.listPublishedHashes({ kinds: ["puzzle", "category", "catalogue"] });
      return pendingCount(planOntologySync(hashRows, await readSyncState(store)));
    }
  };
}
