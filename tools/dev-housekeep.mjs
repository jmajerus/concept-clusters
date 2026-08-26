#!/usr/bin/env node
// List or stop this repo's `tools/dev-server.mjs` processes (draft review on
// 8787). Prefer `npm run dev:stop` or just `npm run dev`, which reclaims the
// port automatically when the listener is ours.
//
// Usage:
//   node tools/dev-housekeep.mjs           # list (dry run)
//   node tools/dev-housekeep.mjs --kill    # SIGTERM all matches
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listLocalDevServers,
  stopLocalDevServers,
  waitForPortFree
} from "../modules/localDevHousekeep.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const kill = process.argv.includes("--kill");
const DEFAULT_PORT = 8787;

const matches = listLocalDevServers({ repositoryRoot: repoRoot });

if (!matches.length) {
  console.log(`No tools/dev-server.mjs processes found for ${repoRoot}.`);
  process.exit(0);
}

console.log(`Found ${matches.length} tools/dev-server.mjs process(es):`);
for (const entry of matches) {
  console.log(`  pid ${entry.pid}`);
  console.log(`    ${entry.args}`);
}

if (!kill) {
  console.log("");
  console.log("Dry run. Re-run with --kill, or use: npm run dev:stop");
  process.exit(0);
}

const { stopped } = stopLocalDevServers({ repositoryRoot: repoRoot });
console.log("");
console.log(`Stopped ${stopped.length} process(es).`);
for (const entry of stopped) {
  console.log(`  SIGTERM pid ${entry.pid}`);
}

const free = await waitForPortFree(DEFAULT_PORT);
if (!free) {
  console.warn(`Port ${DEFAULT_PORT} is still busy after SIGTERM.`);
  process.exitCode = 1;
} else {
  console.log(`Port ${DEFAULT_PORT} is free.`);
}
