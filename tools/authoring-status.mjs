// Print the LAN authoring server's running revision as JSON lines for the
// vscode-status-probe status-bar extension (see .vscode/settings.json).
//
//   node tools/authoring-status.mjs           # one line, then exit
//   node tools/authoring-status.mjs --watch   # a line on every change
//
// --watch holds /admin/server-revision/events open and prints a line per
// event, reconnecting with backoff; a deploy shows up as a short drop and a
// fresh status from the new process. A missing or rejected key exits
// instead, so the extension's restart picks up an edited .env.
//
// Needs AUTHORING_DRAFT_REVIEW_URL (the server's base) and ADMIN_KEY (the
// server's admin key, for /admin's login cookie) in the ignored .env.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { localDraftReviewUrl } from "../modules/authoringDesignGuidance.js";
import { SERVER_REVISION_EVENTS_PATH, SERVER_REVISION_PATH } from "../modules/authoringAdminIndex.js";
import { formatAuthoringStatusProbe, probeError } from "../modules/authoringStatusProbe.js";
import { baseBranchName } from "../modules/authoringServerRevision.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv({ repositoryRoot });

const watchMode = process.argv.includes("--watch");
const base = localDraftReviewUrl().replace(/\/admin\/drafts$/, "");
const adminUrl = `${base}/admin`;
// Two missed 30 s heartbeats plus slack: the connection is dead.
const STREAM_IDLE_MS = 75000;

function print(probe) {
  process.stdout.write(`${JSON.stringify(probe)}\n`);
}

function openPullRequestFor(branch) {
  if (!branch || branch === baseBranchName()) return null;
  const result = spawnSync(
    "gh",
    ["pr", "list", "--head", branch, "--state", "open", "--json", "number", "--jq", ".[0].number"],
    { cwd: repositoryRoot, encoding: "utf8", timeout: 15000 }
  );
  const number = Number(String(result.stdout || "").trim());
  return result.status === 0 && Number.isInteger(number) && number > 0 ? number : null;
}

function printStatus(status) {
  print(formatAuthoringStatusProbe(status, {
    adminUrl,
    prNumber: openPullRequestFor(status.running?.branch)
  }));
}

function authHeaders(extra = {}) {
  return { Cookie: `cc_admin=${encodeURIComponent(process.env.ADMIN_KEY)}`, ...extra };
}

/** A probe for a response that is not a status, plus whether retrying can help. */
async function responseProblem(response) {
  if (response.status === 401) {
    return { probe: probeError("key?", "The server rejected ADMIN_KEY from .env.", { open: adminUrl }), fatal: true };
  }
  if (response.status === 404) {
    return { probe: probeError("old", "The server predates this status endpoint; redeploy it.", { open: adminUrl }), fatal: false };
  }
  const body = await response.json().catch(() => ({}));
  return { probe: probeError("?", body.error || `HTTP ${response.status} from ${base}`, { open: adminUrl }), fatal: false };
}

async function printOnce() {
  try {
    const response = await fetch(`${base}${SERVER_REVISION_PATH}`, {
      headers: authHeaders(),
      // The server fetches origin (up to 15 s) before answering.
      signal: AbortSignal.timeout(25000)
    });
    if (response.ok) printStatus(await response.json());
    else print((await responseProblem(response)).probe);
  } catch (error) {
    print(probeError("?", `Could not reach ${base}: ${error.message}`, { open: adminUrl }));
  }
}

async function streamEvents() {
  const controller = new AbortController();
  let idle;
  const resetIdle = () => {
    clearTimeout(idle);
    idle = setTimeout(() => controller.abort(new Error("no heartbeat")), STREAM_IDLE_MS);
  };
  try {
    resetIdle();
    const response = await fetch(`${base}${SERVER_REVISION_EVENTS_PATH}`, {
      headers: authHeaders({ Accept: "text/event-stream" }),
      signal: controller.signal
    });
    if (!response.ok) return responseProblem(response);
    const decoder = new TextDecoder();
    let buffer = "";
    let received = false;
    for await (const chunk of response.body) {
      resetIdle();
      buffer += decoder.decode(chunk, { stream: true }).replace(/\r\n/g, "\n");
      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) >= 0) {
        const event = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = event.split("\n")
          .filter(line => line.startsWith("data:"))
          .map(line => line.slice(5).trimStart())
          .join("\n");
        if (!data) continue;
        printStatus(JSON.parse(data));
        received = true;
      }
    }
    return { error: new Error("the server closed the connection"), received };
  } catch (error) {
    return { error: controller.signal.reason || error };
  } finally {
    clearTimeout(idle);
  }
}

async function watch() {
  let delay = 2000;
  let failures = 0;
  for (;;) {
    const result = await streamEvents();
    if (result.probe) {
      print(result.probe);
      if (result.fatal) process.exit(1);
    } else {
      if (result.received) {
        delay = 2000;
        failures = 0;
      }
      failures += 1;
      // A deploy restarts the server: one dropped connection is expected,
      // so stay amber until reconnecting keeps failing.
      const probe = probeError(failures > 2 ? "?" : "…",
        `Lost the connection to ${base} (${result.error.message}); reconnecting.`, { open: adminUrl });
      print(failures > 2 ? probe : { ...probe, level: "warn" });
    }
    await sleep(delay);
    delay = Math.min(delay * 2, 60000);
  }
}

if (!process.env.ADMIN_KEY) {
  print(probeError("key?", "Add the authoring server's ADMIN_KEY to this checkout's .env."));
  process.exit(watchMode ? 1 : 0);
}

if (watchMode) await watch();
else await printOnce();
