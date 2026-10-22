// Ask GitHub Actions to copy the LAN authoring server's tool list into the
// Cloudflare MCP portal. The local checkout is not uploaded. The MCP
// status-bar menu runs this when a restart changed that list.
import { spawn } from "node:child_process";
import { basename } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { selectDispatchedRun } from "./dispatch-play-deploy.mjs";

export const MCP_PORTAL_SYNC_WORKFLOW = "sync-mcp-portal.yml";

function gh(args, { inherit = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("gh", args, {
      stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    if (!inherit) {
      child.stdout.on("data", chunk => { stdout += chunk; });
      child.stderr.on("data", chunk => { stderr += chunk; });
    }
    child.on("error", reject);
    child.on("close", status => resolve({ status: status ?? 1, stdout, stderr }));
  });
}

async function dispatchedRunId(startedAt) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const listed = await gh([
      "run", "list",
      "--workflow", MCP_PORTAL_SYNC_WORKFLOW,
      "--limit", "10",
      "--json", "databaseId,createdAt,event,headBranch"
    ]);
    if (listed.status !== 0) {
      process.stderr.write(listed.stderr || listed.stdout);
      throw new Error("Could not list MCP portal sync runs.");
    }
    const run = selectDispatchedRun(JSON.parse(listed.stdout), { startedAt });
    if (run) return String(run.databaseId);
    await delay(2000);
  }
  throw new Error("MCP portal sync was requested, but the run did not appear.");
}

async function main() {
  const startedAt = new Date();
  console.log("Requesting the MCP portal catalog sync.");
  const dispatched = await gh([
    "workflow", "run", MCP_PORTAL_SYNC_WORKFLOW, "--ref", "main"
  ]);
  process.stdout.write(dispatched.stdout);
  process.stderr.write(dispatched.stderr);
  if (dispatched.status !== 0) process.exit(dispatched.status);
  const runId = await dispatchedRunId(startedAt);
  console.log(`Watching run ${runId}.`);
  const watch = await gh(["run", "watch", runId, "--exit-status"], { inherit: true });
  process.exit(watch.status);
}

const invokedDirectly = process.argv[1]
  && basename(process.argv[1]) === "dispatch-mcp-portal-sync.mjs";

if (invokedDirectly) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
