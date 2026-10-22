// Ask GitHub Actions to deploy the public play Worker from main.
// The local checkout is not uploaded.
import { spawn } from "node:child_process";
import { basename } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

export const PLAY_DEPLOY_WORKFLOW = "deploy-play-worker.yml";

export function selectDispatchedRun(runs, { startedAt, now = Date.now() } = {}) {
  const cutoff = startedAt.getTime() - 15_000;
  const matches = (Array.isArray(runs) ? runs : []).filter(run =>
    run?.event === "workflow_dispatch"
    && run?.headBranch === "main"
    && Number.isFinite(Date.parse(run?.createdAt))
    && Date.parse(run.createdAt) >= cutoff
    && Date.parse(run.createdAt) <= now + 60_000
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

async function dispatchedRunId(startedAt) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const listed = await gh([
      "run", "list",
      "--workflow", PLAY_DEPLOY_WORKFLOW,
      "--limit", "10",
      "--json", "databaseId,createdAt,event,headBranch"
    ]);
    if (listed.status !== 0) {
      process.stderr.write(listed.stderr || listed.stdout);
      throw new Error("Could not list Deploy game runs.");
    }
    const run = selectDispatchedRun(JSON.parse(listed.stdout), { startedAt });
    if (run) return String(run.databaseId);
    await delay(2000);
  }
  throw new Error("Deploy game was requested, but the run did not appear.");
}

async function main() {
  const startedAt = new Date();
  console.log("Requesting the play Worker deploy of main.");
  const dispatched = await gh([
    "workflow", "run", PLAY_DEPLOY_WORKFLOW, "--ref", "main"
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
  && basename(process.argv[1]) === "dispatch-play-deploy.mjs";

if (invokedDirectly) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
