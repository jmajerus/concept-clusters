// Backfill the Concept Clusters Zotero collection from published citations.
//   plan             read-only; writes a JSON plan and a Markdown report
//   apply <plan>     files and creates the plan's reviewed entries in Zotero
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { applyBackfill, backfillReport, planBackfill } from "../modules/citationBackfill.js";
import {
  ZoteroReferenceService,
  CONCEPT_CLUSTERS_COLLECTION_KEY,
  DEFAULT_ZOTERO_MCP_URL
} from "../modules/zoteroReferenceService.js";

const REPORT_DIRECTORY = ".concept-clusters/authoring/reports/citation-backfill";

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

function progress(done, total, workKey) {
  process.stderr.write(`\r${done}/${total} ${workKey.slice(0, 60).padEnd(60)}`);
  if (done === total) process.stderr.write("\n");
}

if (isMain) {
  loadProjectEnv();
  const [command, planPath] = process.argv.slice(2);
  const url = authoringDatabaseUrl();
  if (!url || !["plan", "apply"].includes(command) || (command === "apply" && !planPath)) {
    console.error("Usage: npm run authoring:citations:backfill -- plan | apply <plan.json>"
      + (url ? "" : "\nAUTHORING_DATABASE_URL is required"));
    process.exitCode = 1;
  } else {
    const pool = getAuthoringPool(url);
    const service = new ZoteroReferenceService({
      url: process.env.ZOTERO_MCP_URL || DEFAULT_ZOTERO_MCP_URL,
      collectionKey: process.env.CONCEPT_CLUSTERS_ZOTERO_COLLECTION_KEY
        || CONCEPT_CLUSTERS_COLLECTION_KEY
    });
    try {
      if (command === "plan") {
        const plan = await planBackfill({ pool, service, onProgress: progress });
        await mkdir(REPORT_DIRECTORY, { recursive: true });
        const stamp = plan.generatedAt.replace(/[:.]/g, "-");
        const jsonPath = join(REPORT_DIRECTORY, `plan-${stamp}.json`);
        const reportPath = join(REPORT_DIRECTORY, `plan-${stamp}.md`);
        await writeFile(jsonPath, `${JSON.stringify(plan, null, 2)}\n`);
        await writeFile(reportPath, backfillReport(plan, jsonPath));
        console.log(JSON.stringify({ ...plan.summary, plan: jsonPath, report: reportPath }));
      } else {
        const plan = JSON.parse(await readFile(planPath, "utf8"));
        console.log(JSON.stringify(await applyBackfill({ pool, service, plan, onProgress: progress }), null, 2));
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}
