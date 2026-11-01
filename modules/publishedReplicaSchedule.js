// Drains the published replica queue while the authoring server is up.
// A missing D1 client leaves the queue pending; the next tick tries again.
// Each tick also applies terminology-mcp's cc-subjects changes when
// SUBJECTS_SYNC=on, pushes the taxonomy to corpus-mcp when it has changed,
// and syncs the ontology graphs on the LAN Oxigraph server, whether or not
// D1 is reachable.

import { createHttpD1Database } from "./httpD1Database.js";
import { LocalD1ConfigError, resolveLocalD1Config } from "./localD1Config.js";
import { authoringDatabaseUrl, getAuthoringPool } from "./postgresPool.js";
import { createOntologySyncer } from "./ontologySync.js";
import { drainPublishedReplica } from "./publishedReplica.js";
import { createSubjectsSyncer } from "./subjectsSubscriber.js";
import { createTaxonomyPusher } from "./taxonomyPush.js";

const DRAIN_INTERVAL_MS = 15_000;

const drainStatus = {
  phase: "idle",
  waiting: null,
  error: null,
  at: null
};

export function publishedReplicaDrainStatus() {
  return { ...drainStatus };
}

// Null until the drain starts; the drain does not run without a database URL.
let taxonomyPusher = null;

export function taxonomyPushStatus() {
  return taxonomyPusher ? taxonomyPusher.status() : null;
}

let ontologySyncer = null;

export function ontologySyncStatus() {
  return ontologySyncer ? ontologySyncer.status() : null;
}

let subjectsSyncer = null;

export function subjectsSyncStatus() {
  return subjectsSyncer ? subjectsSyncer.status() : null;
}

function noteDrainStatus({ phase, waiting = null, error = null }) {
  drainStatus.phase = phase;
  drainStatus.waiting = waiting;
  drainStatus.error = error;
  drainStatus.at = new Date().toISOString();
}

export async function openPublishedReplicaDatabase({
  env = process.env,
  repositoryRoot
} = {}) {
  const config = await resolveLocalD1Config({ env, repositoryRoot });
  return createHttpD1Database(config);
}

export function startPublishedReplicaDrain({
  repositoryRoot,
  env = process.env,
  intervalMs = DRAIN_INTERVAL_MS
} = {}) {
  const databaseUrl = authoringDatabaseUrl(env);
  if (!databaseUrl) return () => {};
  const pool = getAuthoringPool(databaseUrl);
  let timer = null;
  let running = false;
  let reportedWaiting = false;
  const pushTaxonomy = createTaxonomyPusher({ pool, env });
  taxonomyPusher = pushTaxonomy;
  const syncOntology = createOntologySyncer({ pool, env });
  ontologySyncer = syncOntology;
  const syncSubjects = createSubjectsSyncer({ pool, env });
  subjectsSyncer = syncSubjects;

  async function drain() {
    try {
      let d1;
      try {
        d1 = await openPublishedReplicaDatabase({ env, repositoryRoot });
      } catch (error) {
        if (!(error instanceof LocalD1ConfigError)) throw error;
        if (!reportedWaiting) {
          console.error(`Public replica drain waiting: ${error.message}`);
          reportedWaiting = true;
        }
        noteDrainStatus({ phase: "waiting", waiting: error.message });
        return;
      }
      reportedWaiting = false;
      const result = await drainPublishedReplica({ pool, d1 });
      noteDrainStatus({ phase: "ok" });
      if (result.shipped) {
        console.log(`Public replica drain shipped ${result.shipped}.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      noteDrainStatus({ phase: "error", error: message });
      console.error("Public replica drain failed", message);
    }
  }

  async function tick() {
    if (running) return;
    running = true;
    try {
      await drain();
      // Before the push and the ontology sync, so both see its changes.
      await syncSubjects();
      await pushTaxonomy();
      await syncOntology();
    } finally {
      running = false;
    }
  }

  timer = setInterval(() => {
    tick().catch(error => console.error("Public replica drain failed", error));
  }, intervalMs);
  timer.unref?.();
  tick().catch(error => console.error("Public replica drain failed", error));
  return () => {
    if (timer) clearInterval(timer);
  };
}
