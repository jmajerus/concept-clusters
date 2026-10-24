import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  buildZoteroInstallScript,
  buildZoteroRemoteCommand,
  parseInstallOutput,
  parseZoteroDeployArgs
} from "../modules/zoteroDeployPlan.js";

export const name = "Zotero deploy: tested commits only, one sudo call, previous commit reported";

const SHA = "044d2678d87f4ab3d4296c94d50302dc7dd26da1";

export async function run() {
  assert.deepEqual(
    (({ build, sha }) => ({ build, sha }))(parseZoteroDeployArgs([])),
    { build: true, sha: null }
  );
  assert.equal(parseZoteroDeployArgs(["--no-build"]).build, false);
  assert.deepEqual((({ build, sha }) => ({ build, sha }))(parseZoteroDeployArgs(["--sha", SHA])),
    { build: false, sha: SHA });
  assert.throws(() => parseZoteroDeployArgs(["--sha", "044d267"]), /40-character/);
  assert.throws(() => parseZoteroDeployArgs(["--pr", "3"]), /Unknown argument/);

  const script = buildZoteroInstallScript({ sha: SHA });
  assert.throws(() => buildZoteroInstallScript({ sha: "main; rm -rf /" }), /40-character/);
  assert.match(script, /git\+https:\/\/github\.com\/jmajerus\/zotero-mcp\.git@\$sha/);
  assert.equal(spawnSync("bash", ["-n", "-c", script]).status, 0);

  // The command decodes back to the script and calls sudo once.
  const command = buildZoteroRemoteCommand(script);
  assert.equal(command.match(/sudo/g).length, 1);
  const encoded = command.match(/printf %s '([^']+)'/)[1];
  assert.equal(Buffer.from(encoded, "base64").toString("utf8"), script);

  assert.deepEqual(parseInstallOutput(`previous=b767fe1eff8735b79b4a10240f838f2a8fbe5a0f\nDeploying\ninstalled=${SHA}\n`),
    { previous: "b767fe1eff8735b79b4a10240f838f2a8fbe5a0f", installed: SHA });
  assert.deepEqual(parseInstallOutput("previous=\n"), { previous: null, installed: null });
}
