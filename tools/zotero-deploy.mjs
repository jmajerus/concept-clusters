import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import {
  ZOTERO_FORK,
  ZOTERO_HEALTH_CITEKEY,
  ZOTERO_HOST,
  ZOTERO_LAN_BRANCH,
  ZOTERO_LAN_STATUS,
  ZOTERO_LAN_WORKFLOW,
  buildZoteroInstallScript,
  buildZoteroRemoteCommand,
  parseInstallOutput,
  parseZoteroDeployArgs
} from "../modules/zoteroDeployPlan.js";
import { DEFAULT_ZOTERO_MCP_URL, ZoteroReferenceService } from "../modules/zoteroReferenceService.js";

const toolsDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(toolsDirectory, "..");
loadProjectEnv({ repositoryRoot });

function gh(args) {
  const result = spawnSync("gh", args, { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed: ${(result.stderr || result.error?.message || "").trim()}`);
  }
  return result.stdout.trim();
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runLanBuild() {
  const dispatchedAt = Date.now();
  gh(["workflow", "run", ZOTERO_LAN_WORKFLOW, "-R", ZOTERO_FORK, "--ref", "main"]);
  let runId = null;
  for (let attempt = 0; attempt < 20 && !runId; attempt++) {
    await sleep(3000);
    const runs = JSON.parse(gh(["run", "list", "-R", ZOTERO_FORK, "--workflow", ZOTERO_LAN_WORKFLOW,
      "--limit", "5", "--json", "databaseId,createdAt,event"]));
    runId = runs.find(run => run.event === "workflow_dispatch"
      && Date.parse(run.createdAt) >= dispatchedAt - 5000)?.databaseId ?? null;
  }
  if (!runId) throw new Error("The LAN build was dispatched but its run did not appear.");
  console.log(`LAN build: https://github.com/${ZOTERO_FORK}/actions/runs/${runId}`);
  const watch = spawnSync("gh", ["run", "watch", String(runId), "-R", ZOTERO_FORK, "--exit-status",
    "--interval", "15"], { cwd: repositoryRoot, stdio: ["ignore", "ignore", "inherit"] });
  if (watch.status !== 0) throw new Error("The LAN build failed; the server was not touched.");
}

function testedLanCommit(sha) {
  const commit = sha || gh(["api", `repos/${ZOTERO_FORK}/branches/${ZOTERO_LAN_BRANCH}`, "--jq", ".commit.sha"]);
  const state = gh(["api", `repos/${ZOTERO_FORK}/commits/${commit}/statuses`, "--jq",
    `[.[] | select(.context == "${ZOTERO_LAN_STATUS}")][0].state // ""`]);
  if (state !== "success") {
    throw new Error(`${commit} has no ${ZOTERO_LAN_STATUS} success (got "${state || "none"}"); refusing to deploy it.`);
  }
  return commit;
}

function install(sha) {
  const command = buildZoteroRemoteCommand(buildZoteroInstallScript({ sha }));
  return new Promise((resolve, reject) => {
    const ssh = spawn("ssh", ["-o", "StrictHostKeyChecking=yes", ZOTERO_HOST, command], {
      env: {
        ...process.env,
        SSH_ASKPASS: join(toolsDirectory, "authoring-ssh-askpass.mjs"),
        SSH_ASKPASS_REQUIRE: "force",
        DISPLAY: process.env.DISPLAY || "zotero-deploy"
      },
      stdio: ["pipe", "pipe", "inherit"]
    });
    let output = "";
    ssh.stdout.on("data", chunk => {
      output += chunk;
      process.stdout.write(chunk);
    });
    ssh.stdin.end(`${process.env.AUTHORING_DEPLOY_PASSWORD}\n`);
    ssh.on("error", reject);
    ssh.on("exit", code => (code === 0
      ? resolve(parseInstallOutput(output))
      : reject(Object.assign(new Error(`The install on the server exited with ${code}.`),
        { previous: parseInstallOutput(output).previous }))));
  });
}

// The server answers MCP, can write, and finds a citekey in web mode -- the
// last needs the fork's citekey fix, so it also confirms which code runs.
async function healthy() {
  const service = new ZoteroReferenceService({ url: process.env.ZOTERO_MCP_URL || DEFAULT_ZOTERO_MCP_URL });
  let lastError = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    await sleep(5000);
    try {
      return await service.withClient(async call => {
        const capabilities = await call("zotero_write_capabilities", {});
        if (!/credentials:\s*set/i.test(capabilities)) throw new Error("the server reports no write credentials");
        const owner = await service.citationKeyOwner(ZOTERO_HEALTH_CITEKEY.citekey, call);
        if (owner !== ZOTERO_HEALTH_CITEKEY.itemKey) {
          throw new Error(`citekey ${ZOTERO_HEALTH_CITEKEY.citekey} resolved to ${owner || "nothing"}`);
        }
        return true;
      });
    } catch (error) {
      lastError = error;
    }
  }
  console.error(`Health check failed: ${lastError?.message}`);
  return false;
}

async function main() {
  const args = parseZoteroDeployArgs(process.argv.slice(2));
  if (args.help) return console.log(args.usage);
  if (!process.env.AUTHORING_DEPLOY_PASSWORD) throw new Error("AUTHORING_DEPLOY_PASSWORD is required in .env.");

  if (args.build) await runLanBuild();
  const sha = testedLanCommit(args.sha);
  console.log(`Deploying ${ZOTERO_FORK}@${sha.slice(0, 12)} to ${ZOTERO_HOST.split("@")[1]}.`);

  let previous = null;
  try {
    ({ previous } = await install(sha));
  } catch (error) {
    previous = error.previous;
    console.error(error.message);
  }
  if (await healthy()) {
    console.log(`Zotero MCP is healthy on ${sha.slice(0, 12)}${previous && previous !== sha ? ` (was ${previous.slice(0, 12)})` : ""}.`);
    return;
  }
  if (!previous || previous === sha) {
    throw new Error("The server is unhealthy and there is no different previous commit to roll back to.");
  }
  console.error(`Rolling back to ${previous.slice(0, 12)}.`);
  await install(previous);
  throw new Error(await healthy()
    ? `Rolled back to ${previous.slice(0, 12)}; it is healthy. ${sha.slice(0, 12)} is not deployed.`
    : `Rolled back to ${previous.slice(0, 12)}, but the server is still unhealthy.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
