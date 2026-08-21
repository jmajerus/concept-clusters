#!/usr/bin/env node

import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";

loadProjectEnv();

const handle = serveStdio(
  () => createConceptClustersMcpServer(),
  {
    legacy: "serve",
    onerror: error => console.error(`[concept-clusters-mcp] ${error.stack || error.message}`)
  }
);

console.error("Concept Clusters authoring MCP server is ready on stdio.");

process.on("SIGINT", async () => {
  await handle.close();
  process.exit(0);
});
