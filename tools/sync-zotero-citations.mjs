import { pathToFileURL } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { PostgresCitationSourceRepository } from "../modules/postgresCitationSourceRepository.js";
import {
  ZoteroReferenceService,
  CONCEPT_CLUSTERS_COLLECTION_KEY,
  DEFAULT_ZOTERO_MCP_URL
} from "../modules/zoteroReferenceService.js";

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  loadProjectEnv();
  const url = authoringDatabaseUrl();
  if (!url) {
    console.error("AUTHORING_DATABASE_URL is required");
    process.exitCode = 1;
  } else {
    const pool = getAuthoringPool(url);
    const service = new ZoteroReferenceService({
      url: process.env.ZOTERO_MCP_URL || DEFAULT_ZOTERO_MCP_URL,
      collectionKey: process.env.CONCEPT_CLUSTERS_ZOTERO_COLLECTION_KEY
        || CONCEPT_CLUSTERS_COLLECTION_KEY,
      sourceRepository: new PostgresCitationSourceRepository(pool)
    });
    try {
      console.log(JSON.stringify(await service.syncCollection()));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}
