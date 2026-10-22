// Ask GitHub Actions to copy the LAN authoring server's tool list into the
// Cloudflare MCP portal. The local checkout is not uploaded. The MCP
// status-bar menu runs this when a restart changed that list.
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { basename } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

export const MCP_PORTAL_SYNC_WORKFLOW = "sync-mcp-portal.yml";

export function portalSyncRunTitle(dispatchId) {
  return `Sync MCP portal ${dispatchId}`;
}

/** The workflow run this dispatch requested, matched by its run title. */
export function selectPortalSyncRun(runs, dispatchId) {
  const title = portalSyncRunTitle(dispatchId);
  const matches = (Array.isArray(runs) ? runs : []).filter(run =>
    run?.event === "workflow_dispatch"
    && run?.headBranch === "main"
    && run?.displayTitle === title
  );
  matches.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  return matches[0] || null;
}

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

async function dispatchedRunId(dispatchId) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const listed = await gh([
      "run", "list",
      "--workflow", MCP_PORTAL_SYNC_WORKFLOW,
      "--limit", "20",
      "--json", "databaseId,createdAt,event,headBranch,displayTitle"
    ]);
    if (listed.status !== 0) {
      process.stderr.write(listed.stderr || listed.stdout);
      throw new Error("Could not list MCP portal sync runs.");
    }
    const run = selectPortalSyncRun(JSON.parse(listed.stdout), dispatchId);
    if (run) return String(run.databaseId);
    await delay(2000);
  }
  throw new Error("MCP portal sync was requested, but the run did not appear.");
}

async function main() {
  const dispatchId = randomUUID();
  console.log("Requesting the MCP portal catalog sync.");
  const dispatched = await gh([
    "workflow", "run", MCP_PORTAL_SYNC_WORKFLOW,
    "--ref", "main",
    "-f", `dispatch_id=${dispatchId}`
  ]);
  process.stdout.write(dispatched.stdout);
  process.stderr.write(dispatched.stderr);
  if (dispatched.status !== 0) process.exit(dispatched.status);
  const runId = await dispatchedRunId(dispatchId);
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
