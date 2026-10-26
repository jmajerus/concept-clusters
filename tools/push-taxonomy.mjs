// Push the published taxonomy to corpus-mcp's vocabulary intake now. The
// authoring server already does this whenever the taxonomy changes; this is
// for catch-up and debugging. Needs CF_ACCESS_CLIENT_ID/SECRET.
import { pathToFileURL } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { loadPublishedTaxonomy, pushVocabulary, vocabularyPushConfig } from "../modules/taxonomyPush.js";

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  loadProjectEnv();
  const url = authoringDatabaseUrl();
  const config = vocabularyPushConfig();
  if (!url || !config) {
    console.error("AUTHORING_DATABASE_URL, CF_ACCESS_CLIENT_ID, and CF_ACCESS_CLIENT_SECRET are required");
    process.exitCode = 1;
  } else {
    const pool = getAuthoringPool(url);
    try {
      const vocabulary = await loadPublishedTaxonomy(pool);
      const result = await pushVocabulary(vocabulary, config);
      if (result.outcome === "installed" || result.outcome === "unchanged") {
        console.log(`corpus-mcp ${result.outcome} vocabulary ${vocabulary.version} (${vocabulary.terms.length} terms).`);
      } else {
        console.error(result.outcome === "rejected"
          ? `corpus-mcp rejected vocabulary ${vocabulary.version}:\n${result.problems.join("\n")}`
          : `Push failed: ${result.error}`);
        process.exitCode = 1;
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}
