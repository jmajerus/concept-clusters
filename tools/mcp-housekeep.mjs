#!/usr/bin/env node
// List or prune local stdio MCP server processes for this repository.
//
// Cursor (and other MCP hosts) may spawn a fresh mcp-server.mjs on reload
// without reaping older copies. This helper finds those siblings by script
// path and, optionally, keeps the newest one alive.
//
// Usage:
//   node tools/mcp-housekeep.mjs            # list matches (dry run)
//   node tools/mcp-housekeep.mjs --kill     # SIGTERM extras; keep newest
//   node tools/mcp-housekeep.mjs --kill --keep 0   # stop all matches
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const scriptNeedle = "tools/mcp-server.mjs";

const argv = process.argv.slice(2);
const kill = argv.includes("--kill");
const keepIndex = argv.indexOf("--keep");
const keep = keepIndex >= 0 ? Number.parseInt(argv[keepIndex + 1], 10) : 1;

if (keepIndex >= 0 && (!Number.isFinite(keep) || keep < 0)) {
  console.error("Usage: node tools/mcp-housekeep.mjs [--kill] [--keep N]");
  process.exit(1);
}

function readArgLine(pid) {
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "args="], {
      encoding: "utf8"
    }).trim();
  } catch {
    return "";
  }
}

function listMatches() {
  let raw = "";
  try {
    raw = execFileSync("pgrep", ["-f", scriptNeedle], { encoding: "utf8" });
  } catch (error) {
    if (error.status === 1) return [];
    console.error("Could not list processes (pgrep failed).", error.message);
    process.exit(1);
  }

  const matches = [];
  for (const line of raw.split("\n")) {
    const pid = Number.parseInt(line.trim(), 10);
    if (!Number.isFinite(pid) || pid === process.pid) continue;
    const args = readArgLine(pid);
    if (!args.includes(scriptNeedle)) continue;
    matches.push({ pid, args });
  }
  matches.sort((a, b) => a.pid - b.pid);
  return matches;
}

const matches = listMatches();

if (!matches.length) {
  console.log(`No mcp-server.mjs processes found for ${repoRoot}.`);
  process.exit(0);
}

console.log(`Found ${matches.length} mcp-server.mjs process(es) for this repo:`);
for (const entry of matches) {
  console.log(`  pid ${entry.pid}`);
  console.log(`    ${entry.args}`);
}

if (!kill) {
  console.log("");
  console.log("Dry run. Re-run with --kill to SIGTERM extras (keeps newest by default).");
  process.exit(0);
}

const victims = matches.slice(0, Math.max(0, matches.length - keep));
if (!victims.length) {
  console.log("");
  console.log(`Nothing to stop (--keep ${keep}).`);
  process.exit(0);
}

console.log("");
console.log(`Stopping ${victims.length} process(es); keeping ${Math.min(keep, matches.length)}.`);

for (const entry of victims) {
  try {
    process.kill(entry.pid, "SIGTERM");
    console.log(`  SIGTERM pid ${entry.pid}`);
  } catch (error) {
    console.warn(`  skipped pid ${entry.pid}: ${error.message}`);
  }
}
