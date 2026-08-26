#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";

loadProjectEnv();

const here = dirname(fileURLToPath(import.meta.url));

// Cursor reloads MCP by spawning a new stdio server; older copies can linger
// if the host does not reap them. Opt in with MCP_PRUNE_SIBLINGS=1.
if (process.env.MCP_PRUNE_SIBLINGS === "1") {
  spawnSync(process.execPath, [join(here, "mcp-housekeep.mjs"), "--kill", "--keep", "1"], {
    stdio: "ignore"
  });
}

const handle = serveStdio(
  () => createConceptClustersMcpServer(),
  {
    legacy: "serve",
    onerror: error => console.error(`[concept-clusters-mcp] ${error.stack || error.message}`)
  }
);

console.error("Concept Clusters authoring MCP server is ready on stdio.");

async function shutdown(signal) {
  console.error(`[concept-clusters-mcp] received ${signal}, closing`);
  try {
    await handle.close();
  } catch (error) {
    console.error(`[concept-clusters-mcp] close failed: ${error?.message || error}`);
  }
  process.exit(0);
}

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
