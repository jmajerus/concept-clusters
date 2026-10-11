import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  branchFromPullRequest,
  buildAuthoringDeployScript,
  parseAuthoringDeployArgs
} from "../modules/authoringDeployPlan.js";
import { baseBranchName } from "../modules/authoringServerRevision.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";

const toolsDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(toolsDirectory, "..");

loadProjectEnv({ repositoryRoot });

let args;
try {
  args = parseAuthoringDeployArgs(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
if (args.help) {
  console.log(args.usage);
  process.exit(0);
}

if (!process.env.AUTHORING_DEPLOY_PASSWORD) {
  console.error("AUTHORING_DEPLOY_PASSWORD is required in .env.");
  process.exit(1);
}

const baseBranch = baseBranchName();
// null: the remote script redeploys whatever branch the server is on.
let branch = args.main ? baseBranch : null;
if (args.pr) {
  const view = spawnSync(
    "gh",
    ["pr", "view", String(args.pr), "--json", "state,headRefName,isCrossRepository"],
    { cwd: repositoryRoot, encoding: "utf8" }
  );
  if (view.status !== 0) {
    console.error(`Could not look up PR #${args.pr} with gh: ${(view.stderr || view.error?.message || "").trim()}`);
    process.exit(1);
  }
  try {
    branch = branchFromPullRequest(args.pr, JSON.parse(view.stdout));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

console.log(branch
  ? `Switching the authoring server to ${branch}${args.pr ? ` (PR #${args.pr})` : ""}.`
  : "Redeploying the authoring server's current branch.");

const remoteCommand = buildAuthoringDeployScript({ branch, baseBranch });

const ssh = spawn(
  "ssh",
  [
    "-o",
    "StrictHostKeyChecking=yes",
    "authoring@authoring.localdomain",
    remoteCommand
  ],
  {
    env: {
      ...process.env,
      SSH_ASKPASS: join(toolsDirectory, "authoring-ssh-askpass.mjs"),
      SSH_ASKPASS_REQUIRE: "force",
      DISPLAY: process.env.DISPLAY || "authoring-deploy"
    },
    stdio: ["pipe", "inherit", "inherit"]
  }
);

ssh.stdin.end(`${process.env.AUTHORING_DEPLOY_PASSWORD}\n`);

ssh.on("error", (error) => {
  console.error(`Unable to start ssh: ${error.message}`);
  process.exitCode = 1;
});

ssh.on("exit", (code, signal) => {
  if (signal) {
    console.error(`SSH terminated by ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
