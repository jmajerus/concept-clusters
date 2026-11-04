// Print the published taxonomy as a corpus-vocabulary/1 file, or write it to
// --out <file>. corpus-mcp follows terminology-mcp for its tag vocabulary; this
// file is its fallback (CORPUS_TERMINOLOGY_URL=off, then
// `npm run deploy -- --vocabulary=<file>` in corpus-mcp).
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { listMergedCategoryRegistry } from "../modules/authoringMcpTaxonomy.js";
import { refreshDomainsRegistry } from "../modules/domainRegistry.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { PostgresPublishedRepository } from "../modules/postgresPublishedRepository.js";
import { taxonomyVocabulary } from "../modules/taxonomySnapshot.js";

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
      const repository = new PostgresPublishedRepository(pool);
      // taxonomyVocabulary reads DOMAINS, and this process has only the git snapshot.
      await refreshDomainsRegistry(repository);
      const vocabulary = taxonomyVocabulary(listMergedCategoryRegistry({
        contentService: null,
        publishedCategories: await repository.listPublished({ kind: "category" }),
        includeGit: false
      }));
      const json = `${JSON.stringify(vocabulary, null, 2)}\n`;
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
