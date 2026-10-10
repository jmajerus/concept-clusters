// Print the LAN authoring server's running revision as one line of JSON for
// the vscode-status-probe status-bar extension (see .vscode/settings.json).
// Always exits 0: a failure is itself a status to show.
//
// Needs AUTHORING_DRAFT_REVIEW_URL (the server's base) and ADMIN_KEY (the
// server's admin key, for /admin's login cookie) in the ignored .env.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { localDraftReviewUrl } from "../modules/authoringDesignGuidance.js";
import { SERVER_REVISION_PATH } from "../modules/authoringAdminIndex.js";
import { formatAuthoringStatusProbe, probeError } from "../modules/authoringStatusProbe.js";
import { baseBranchName } from "../modules/authoringServerRevision.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv({ repositoryRoot });

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

const base = localDraftReviewUrl().replace(/\/admin\/drafts$/, "");
const adminUrl = `${base}/admin`;

if (!process.env.ADMIN_KEY) {
  print(probeError("key?", "Add the authoring server's ADMIN_KEY to this checkout's .env."));
  process.exit(0);
}

try {
  const response = await fetch(`${base}${SERVER_REVISION_PATH}`, {
    headers: { Cookie: `cc_admin=${encodeURIComponent(process.env.ADMIN_KEY)}` },
    // The server fetches origin (up to 15 s) before answering.
    signal: AbortSignal.timeout(25000)
  });
  if (response.status === 401) {
    print(probeError("key?", "The server rejected ADMIN_KEY from .env.", { open: adminUrl }));
  } else if (response.status === 404) {
    print(probeError("old", "The server predates /admin/server-revision.json; redeploy it.", { open: adminUrl }));
  } else if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    print(probeError("?", body.error || `HTTP ${response.status} from ${base}`, { open: adminUrl }));
  } else {
    const status = await response.json();
    print(formatAuthoringStatusProbe(status, {
      adminUrl,
      prNumber: openPullRequestFor(status.running?.branch)
    }));
  }
} catch (error) {
  print(probeError("?", `Could not reach ${base}: ${error.message}`, { open: adminUrl }));
}
