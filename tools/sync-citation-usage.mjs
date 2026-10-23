import { pathToFileURL } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { PostgresCitationSourceRepository } from "../modules/postgresCitationSourceRepository.js";
import { refreshPublishedCitationUsage } from "../modules/postgresCitationUsagePilot.js";

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
    try {
      const result = await refreshPublishedCitationUsage(
        pool, new PostgresCitationSourceRepository(pool)
      );
      console.log(JSON.stringify(result));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}
