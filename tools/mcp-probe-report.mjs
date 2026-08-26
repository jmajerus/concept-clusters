#!/usr/bin/env node
// Summarize captured MCP client call frames from .mcp-client-probes.jsonl
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MCP_CLIENT_PROBE_LOG } from "../modules/mcpClientProbe.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const logPath = join(repoRoot, MCP_CLIENT_PROBE_LOG);

let probes = [];
try {
  probes = readFileSync(logPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (!probes.length) {
  console.log(`No probes in ${logPath}.`);
  console.log("Ask each MCP client to call probe_mcp_client with a label.");
  process.exit(0);
}

function clientKey(probe) {
  const version = probe.clientVersion;
  const name = version?.title || version?.name || "(unknown client)";
  const versionText = version?.version ? `@${version.version}` : "";
  return `${probe.label || "?"} :: ${name}${versionText} :: ${probe.transport}`;
}

const latestByKey = new Map();
for (const probe of probes) {
  latestByKey.set(clientKey(probe), probe);
}

console.log(`Captured ${probes.length} probe(s); ${latestByKey.size} distinct key(s).\n`);
for (const probe of latestByKey.values()) {
  console.log(`--- ${clientKey(probe)} ---`);
  console.log(`capturedAt: ${probe.capturedAt}`);
  if (probe.actor) console.log(`actor: ${JSON.stringify(probe.actor)}`);
  if (probe.clientVersion) {
    console.log(`clientVersion: ${JSON.stringify(probe.clientVersion)}`);
  }
  if (probe.mcpReq?.envelope) {
    console.log(`envelope: ${JSON.stringify(probe.mcpReq.envelope)}`);
  }
  if (probe.mcpReq?.meta && Object.keys(probe.mcpReq.meta).length) {
    console.log(`meta: ${JSON.stringify(probe.mcpReq.meta)}`);
  }
  if (probe.http) console.log(`http: ${JSON.stringify(probe.http)}`);
  console.log("");
}

console.log(`Full log: ${logPath}`);
