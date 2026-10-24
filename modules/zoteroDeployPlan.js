// Deploying the LAN Zotero MCP server (zotero-mcp.localdomain): it runs the
// fork's lan branch -- an upstream release plus pending fix branches -- that
// the fork's LAN build workflow rebuilds and tests. The deploy installs one
// tested lan commit into the server's venv and restarts the service; the
// tool health-checks it and reinstalls the previous commit on failure.

export const ZOTERO_FORK = "jmajerus/zotero-mcp";
export const ZOTERO_LAN_BRANCH = "lan";
export const ZOTERO_LAN_WORKFLOW = "lan.yml";
export const ZOTERO_LAN_STATUS = "lan/tests";
export const ZOTERO_HOST = "authoring@zotero-mcp.localdomain";
export const ZOTERO_VENV = "/opt/zotero-mcp/venv";
export const ZOTERO_SERVICE = "zotero-mcp.service";
// A key the citekey fix (upstream #740) must find in web mode, and the item
// that holds it in the Concept Clusters collection.
export const ZOTERO_HEALTH_CITEKEY = { citekey: "nye2011future", itemKey: "6ZTKCEUQ" };

const USAGE = `Usage: npm run zotero:deploy -- [--no-build] [--sha <commit>]

Runs the fork's LAN build, installs the tested lan commit on the Zotero MCP
server, restarts it, and health-checks it, reinstalling the previous commit
if the check fails.

  --no-build      deploy the current lan commit without rebuilding it first
  --sha <commit>  deploy this commit instead (it must carry a ${ZOTERO_LAN_STATUS} success)`;

export function parseZoteroDeployArgs(argv) {
  const args = { help: false, build: true, sha: null, usage: USAGE };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--no-build") args.build = false;
    else if (arg === "--sha") {
      args.sha = assertCommit(argv[++index] || "");
      args.build = false;
    } else throw new Error(`Unknown argument ${arg}.\n\n${USAGE}`);
  }
  return args;
}

function assertCommit(sha) {
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`Expected a full 40-character commit, got "${sha}".`);
  return sha;
}

// Runs as root on the server. Prints previous=<commit> before installing
// and installed=<commit> once the service is active again.
export function buildZoteroInstallScript({
  sha,
  fork = ZOTERO_FORK,
  venv = ZOTERO_VENV,
  service = ZOTERO_SERVICE
}) {
  assertCommit(sha);
  return [
    "set -euo pipefail",
    `venv='${venv}'`,
    `sha='${sha}'`,
    `source="git+https://github.com/${fork}.git@$sha"`,
    // pip records the installed commit for a git install.
    "current() { \"$venv/bin/python\" -c 'import json, importlib.metadata as m; "
      + "d = m.distribution(\"zotero-mcp-server\").read_text(\"direct_url.json\"); "
      + "print(json.loads(d).get(\"vcs_info\", {}).get(\"commit_id\", \"\") if d else \"\")'; }",
    "echo \"previous=$(current)\"",
    "if [ \"$(current)\" != \"$sha\" ]; then",
    // Reinstall the package from the commit, then add any dependency the
    // new commit needs without reinstalling the ones already present.
    "  \"$venv/bin/pip\" install -q --force-reinstall --no-deps \"$source\"",
    "  \"$venv/bin/pip\" install -q \"$source\"",
    "fi",
    "[ \"$(current)\" = \"$sha\" ] || { echo \"The venv does not report $sha after installing.\" >&2; exit 1; }",
    `systemctl restart '${service}'`,
    `for _ in $(seq 1 30); do systemctl is-active -q '${service}' && break; sleep 1; done`,
    `systemctl is-active -q '${service}' || { echo "${service} did not become active." >&2; exit 1; }`,
    "echo \"installed=$sha\""
  ].join("\n");
}

// The SSH command: one sudo call, so its password (piped on stdin) is read
// once, running the install script passed base64-encoded as an argument.
export function buildZoteroRemoteCommand(script) {
  const encoded = Buffer.from(script, "utf8").toString("base64");
  return `sudo -S -p '' bash -c "$(printf %s '${encoded}' | base64 -d)"`;
}

export function parseInstallOutput(output) {
  const value = key => String(output).match(new RegExp(`^${key}=([0-9a-f]*)$`, "m"))?.[1] ?? null;
  return { previous: value("previous") || null, installed: value("installed") };
}
