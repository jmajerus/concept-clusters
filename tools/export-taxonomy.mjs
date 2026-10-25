// Print the published taxonomy (domains, categories, subcategories) as JSON,
// or write it to --out <file>.
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { loadPublishedCorpus } from "../modules/citationBackfill.js";
import { taxonomySnapshot, taxonomyWarnings } from "../modules/taxonomySnapshot.js";

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  loadProjectEnv();
  const outIndex = process.argv.indexOf("--out");
  const out = outIndex > 0 ? process.argv[outIndex + 1] : null;
  const url = authoringDatabaseUrl();
  if (!url) {
    console.error("AUTHORING_DATABASE_URL is required");
    process.exitCode = 1;
  } else {
    const pool = getAuthoringPool(url);
    try {
      const { registry } = await loadPublishedCorpus(pool);
      const snapshot = taxonomySnapshot(registry);
      for (const warning of taxonomyWarnings(snapshot)) console.warn(`Warning: ${warning}`);
      const json = `${JSON.stringify(snapshot, null, 2)}\n`;
      if (out) await writeFile(out, json);
      else process.stdout.write(json);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}
