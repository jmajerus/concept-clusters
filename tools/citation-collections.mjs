// Sync the generated Domain -> Category -> Subcategory browse collections
// under the Concept Clusters Zotero collection. Prints the changes; writes
// them only with --apply.
import { pathToFileURL } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import {
  applyCollectionSync,
  collectionSyncReport,
  planCollectionSync
} from "../modules/citationCollectionSync.js";
import {
  ZoteroReferenceService,
  CONCEPT_CLUSTERS_COLLECTION_KEY,
  DEFAULT_ZOTERO_MCP_URL
} from "../modules/zoteroReferenceService.js";

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  loadProjectEnv();
  const apply = process.argv.includes("--apply");
  const url = authoringDatabaseUrl();
  if (!url) {
    console.error("AUTHORING_DATABASE_URL is required");
    process.exitCode = 1;
  } else {
    const pool = getAuthoringPool(url);
    const service = new ZoteroReferenceService({
      url: process.env.ZOTERO_MCP_URL || DEFAULT_ZOTERO_MCP_URL,
      collectionKey: process.env.CONCEPT_CLUSTERS_ZOTERO_COLLECTION_KEY
        || CONCEPT_CLUSTERS_COLLECTION_KEY
    });
    try {
      const plan = await planCollectionSync({ pool, service });
      console.log(collectionSyncReport(plan));
      if (apply) {
        await applyCollectionSync({ pool, service, plan });
        console.log("Applied.");
      } else {
        console.log("Dry run; rerun with --apply to write these changes to Zotero.");
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}
