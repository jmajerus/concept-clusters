// Nightly backup of the authoring database. Write the dump somewhere that
// is not the database machine (AUTHORING_DUMP_DIR on another host, or a
// path you copy off afterwards). WAL archiving waits.
//
//   AUTHORING_DATABASE_URL=postgres://... AUTHORING_DUMP_DIR=/backups \
//     node tools/postgres-dump.mjs
//
// Cron, on a machine other than the database host:
//   0 3 * * * AUTHORING_DATABASE_URL=... AUTHORING_DUMP_DIR=/backups \
//     node /path/to/tools/postgres-dump.mjs

import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl } from "../modules/postgresPool.js";

loadProjectEnv();
const url = authoringDatabaseUrl();
const directory = process.env.AUTHORING_DUMP_DIR?.trim();
if (!url || !directory) {
  console.error("AUTHORING_DATABASE_URL and AUTHORING_DUMP_DIR are required");
  process.exit(1);
}
await mkdir(directory, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = join(directory, `authoring-${stamp}.dump`);
const child = spawn("pg_dump", ["--format=custom", "--file", file, "--dbname", url], {
  stdio: "inherit"
});
const code = await new Promise(resolve => child.once("exit", resolve));
if (code !== 0) process.exit(code || 1);
console.log(file);
