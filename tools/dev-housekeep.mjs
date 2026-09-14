#!/usr/bin/env node
// List or stop this repo's verified local dev-server processes. The server
// writes a per-repository/per-port lease after binding; command/cwd matching
// is retained for processes started before leases existed.
//
// Usage:
//   node tools/dev-housekeep.mjs                 # list (dry run)
//   node tools/dev-housekeep.mjs --kill          # SIGTERM, then bounded SIGKILL
//   node tools/dev-housekeep.mjs --kill --port 8788
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import {
  DEFAULT_DEV_PORT,
  listLocalDevServers,
  portInUse,
  pruneLocalDevLeases,
  stopLocalDevServersGracefully,
  waitForPortFree
} from "../modules/localDevHousekeep.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const kill = argv.includes("--kill");
let port;

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error("Usage: node tools/dev-housekeep.mjs [--kill] [--port <port>]");
  process.exit(1);
}

function parsePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    usage(`Invalid port: ${value}`);
  }
  return port;
}

for (let index = 0; index < argv.length; index += 1) {
  const arg = argv[index];
  if (arg === "--kill") continue;
  if (arg.startsWith("--port=")) {
    port = parsePort(arg.slice("--port=".length));
    continue;
  }
  if (arg === "--port" || arg === "-p") {
    const value = argv[++index];
    if (value === undefined) usage(`${arg} requires a port.`);
    port = parsePort(value);
    continue;
  }
  if (/^\d+$/.test(arg)) {
    port = parsePort(arg);
    continue;
  }
  usage(`Unknown option: ${arg}`);
}

loadProjectEnv({ repositoryRoot: repoRoot });
const env = process.env;
const removedLeases = pruneLocalDevLeases({ repositoryRoot: repoRoot, env });
const matches = listLocalDevServers({ repositoryRoot: repoRoot, port, env });

if (!matches.length) {
  const targetPort = port === undefined ? DEFAULT_DEV_PORT : port;
  const busy = await portInUse(targetPort);
  if (busy) {
    console.log(`No verified tools/dev-server.mjs process found for ${repoRoot}.`);
    console.error(
      `Port ${targetPort} is busy, but its listener is not owned by this repository; ` +
      "no process was stopped."
    );
    process.exitCode = kill ? 1 : 0;
  } else {
    console.log(`No tools/dev-server.mjs processes found for ${repoRoot}.`);
  }
  if (removedLeases.length) {
    console.log(`Removed ${removedLeases.length} stale dev-server lease(s).`);
  }
  process.exit();
}

console.log(`Found ${matches.length} verified tools/dev-server.mjs process(es):`);
for (const entry of matches) {
  const details = [
    `pid ${entry.pid}`,
    `port ${entry.port ?? "unknown"}`,
    entry.source
  ];
  console.log(`  ${details.join(", ")}`);
  console.log(`    ${entry.args}`);
  if (entry.leasePath) console.log(`    lease ${entry.leasePath}`);
}
if (removedLeases.length) {
  console.log(`Removed ${removedLeases.length} stale dev-server lease(s).`);
}

if (!kill) {
  console.log("");
  console.log("Dry run. Re-run with --kill, or use: npm run dev:stop");
  process.exit(0);
}

const result = await stopLocalDevServersGracefully({
  repositoryRoot: repoRoot,
  port,
  env
});
console.log("");
console.log(`Sent SIGTERM to ${result.stopped.length} process(es).`);
for (const entry of result.stopped) {
  console.log(`  SIGTERM pid ${entry.pid}`);
}
if (result.forced.length) {
  console.log(`Sent SIGKILL to ${result.forced.length} unresponsive process(es).`);
  for (const entry of result.forced) {
    console.log(`  SIGKILL pid ${entry.pid}`);
  }
}
if (result.forcedChildren?.length) {
  console.log(
    `Sent SIGKILL to ${result.forcedChildren.length} verified worker child process(es).`
  );
  for (const child of result.forcedChildren) {
    console.log(`  SIGKILL child pid ${child.pid}`);
  }
}
if (result.remaining.length) {
  console.error(`Could not stop ${result.remaining.length} verified process(es).`);
  process.exitCode = 1;
}
if (result.remainingChildren?.length) {
  console.error(
    `Could not stop ${result.remainingChildren.length} verified worker child process(es).`
  );
  process.exitCode = 1;
}

const ports = port === undefined
  ? [...new Set(matches.map(entry => entry.port).filter(Number.isInteger))]
  : [port];
for (const targetPort of ports) {
  const free = await waitForPortFree(targetPort);
  if (free) {
    console.log(`Port ${targetPort} is free.`);
  } else {
    console.error(`Port ${targetPort} is still busy after verified shutdown.`);
    process.exitCode = 1;
  }
}
