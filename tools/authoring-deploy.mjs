import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadProjectEnv } from "../modules/loadProjectEnv.js";

const toolsDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(toolsDirectory, "..");

loadProjectEnv({ repositoryRoot });

if (!process.env.AUTHORING_DEPLOY_PASSWORD) {
  console.error("AUTHORING_DEPLOY_PASSWORD is required in .env.");
  process.exit(1);
}

const remoteCommand =
  "git -C /opt/concept-clusters pull --ff-only && " +
  "sudo -S -p '' systemctl restart concept-clusters-authoring.service";

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
