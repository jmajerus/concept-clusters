// Sync Concept Clusters' named graphs on the LAN Oxigraph server from the
// Postgres published corpus. The authoring server's drain loop does this on
// every tick; run this for the first load or to recover.
//
//   npm run ontology:load             # replace what changed since the last sync
//   npm run ontology:load -- --full   # drop every urn:concept-clusters:graph:* graph, rebuild
//
// Needs AUTHORING_DATABASE_URL; ONTOLOGY_SPARQL_BASE overrides the default
// server. Never touches the default graph or another tool's graphs.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { ontologyCounts } from "../modules/ontologyAuthoringQueries.js";
import { createOntologyStore, ontologyStoreConfig } from "../modules/ontologyStore.js";
import { syncOntology } from "../modules/ontologySync.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { PostgresPublishedRepository } from "../modules/postgresPublishedRepository.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv({ repositoryRoot });

const config = ontologyStoreConfig(process.env);
if (!config) {
  console.error("ONTOLOGY_SPARQL_BASE is off; nothing to load.");
  process.exit(1);
}
if (!authoringDatabaseUrl()) {
  console.error("AUTHORING_DATABASE_URL is required.");
  process.exit(1);
}

const pool = getAuthoringPool();
const store = createOntologyStore(config);
try {
  const result = await syncOntology({
    repository: new PostgresPublishedRepository(pool),
    store,
    full: process.argv.includes("--full")
  });
  const counts = await ontologyCounts(store);
  console.log(`Ontology ${result.outcome} at ${config.baseUrl}`);
  if (result.dropped) console.log(`  dropped ${result.dropped} graphs`);
  console.log(`  puzzles replaced ${result.replaced}, removed ${result.removed}${result.taxonomy ? ", taxonomy rebuilt" : ""}`);
  console.log(`  ${result.puzzles} puzzle graphs, ${counts.triples} triples, ${counts.terms} terms, ${counts.distinctLabels} distinct labels`);
} finally {
  await pool.end();
}
