// Local snapshot of which puzzle ids are in GitHub production
// (`puzzles/manifest.js` on the base branch — what the player boots).
// Freeze fetches origin, then joins that set with the freeze patch
// (add/update minus remove) assuming the freeze PR merges. Refresh from
// GitHub writes origin membership only. List pages read the file so they
// do not hit GitHub. `submitted` on puzzle_drafts is the old PR ledger
// and is not this question.
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import {
  inGithubProduction,
  parseGithubProductionSource,
  projectGithubProductionIds,
  puzzleIdsFromManifestSource,
  puzzleIdsFromRegistrySource,
  snapshotGithubProductionManifestFromClient,
  withGithubProduction
} from "./githubProductionManifestCore.js";
import {
  authoringWorkspacePaths,
  ensureAuthoringWorkspace
} from "./authoringWorkspacePaths.js";
export {
  inGithubProduction,
  parseGithubProductionSource,
  projectGithubProductionIds,
  puzzleIdsFromManifestSource,
  puzzleIdsFromRegistrySource,
  snapshotGithubProductionManifestFromClient,
  withGithubProduction
};

export function githubProductionManifestPath({
  repositoryRoot,
  env = process.env
} = {}) {
  return authoringWorkspacePaths({ repositoryRoot, env }).githubProductionManifest;
}

export async function loadGithubProductionManifest({
  repositoryRoot,
  env = process.env
} = {}) {
  const path = githubProductionManifestPath({ repositoryRoot, env });
  try {
    const raw = JSON.parse(await readFile(path, "utf8"));
    if (!raw || !Array.isArray(raw.ids)) return null;
    return {
      fetchedAt: raw.fetchedAt || "",
      ref: raw.ref || "",
      sha: raw.sha || "",
      source: raw.source || "puzzles/manifest.js",
      ids: raw.ids.filter(id => typeof id === "string"),
      originIds: Array.isArray(raw.originIds)
        ? raw.originIds.filter(id => typeof id === "string")
        : undefined,
      projectedFromFreeze: raw.projectedFromFreeze === true,
      fetchedVia: raw.fetchedVia || undefined,
      fetchedFromCache: raw.fetchedFromCache === true,
      originFetchError: typeof raw.originFetchError === "string"
        ? raw.originFetchError
        : undefined
    };
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function writeSnapshot(repositoryRoot, env, snapshot) {
  ensureAuthoringWorkspace({ repositoryRoot, env });
  const path = githubProductionManifestPath({ repositoryRoot, env });
  await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

function git(repositoryRoot, args, { timeout = 60000 } = {}) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    timeout
  });
  if (result.status !== 0) {
    throw new Error(
      (result.stderr || result.stdout || `git ${args.join(" ")} failed`).trim()
    );
  }
  return String(result.stdout || "");
}

function productionRef(env = process.env) {
  const branch = typeof env.GITHUB_BASE_BRANCH === "string" && env.GITHUB_BASE_BRANCH.trim()
    ? env.GITHUB_BASE_BRANCH.trim()
    : "main";
  return `origin/${branch}`;
}

function fetchOrigin(repositoryRoot, runGit) {
  try {
    runGit(repositoryRoot, ["fetch", "origin", "--no-write-fetch-head"], {
      timeout: 120000
    });
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/unknown option|no-write-fetch-head/i.test(message)) return message;
    try {
      runGit(repositoryRoot, ["fetch", "origin"], { timeout: 120000 });
      return null;
    } catch (retry) {
      return retry instanceof Error ? retry.message : String(retry);
    }
  }
}

/**
 * Read GitHub production puzzle ids from origin (optionally `git fetch`
 * first). Does not write the authoring-data file. Fetch uses
 * `--no-write-fetch-head` so a sandbox that cannot create FETCH_HEAD
 * still updates remote-tracking refs. If fetch still fails, this reads
 * the last fetched origin ref instead of failing the refresh.
 */
export function snapshotGithubProductionManifestFromGit({
  repositoryRoot,
  env = process.env,
  fetchRemote = false,
  runGit = git
} = {}) {
  if (!repositoryRoot) throw new Error("repositoryRoot is required");
  const ref = productionRef(env);
  let originFetchError = null;
  if (fetchRemote) originFetchError = fetchOrigin(repositoryRoot, runGit);
  let sourcePath = "puzzles/manifest.js";
  let source;
  try {
    source = runGit(repositoryRoot, ["show", `${ref}:${sourcePath}`]);
  } catch (showError) {
    try {
      sourcePath = "puzzles/index.js";
      source = runGit(repositoryRoot, ["show", `${ref}:${sourcePath}`]);
    } catch {
      throw new Error(
        originFetchError
        || (showError instanceof Error ? showError.message : String(showError))
      );
    }
  }
  const ids = parseGithubProductionSource(source, { path: sourcePath }).sort();
  let sha = "";
  try {
    sha = runGit(repositoryRoot, ["rev-parse", ref]).trim();
  } catch {
    sha = "";
  }
  return {
    fetchedAt: new Date().toISOString(),
    ref,
    sha,
    source: sourcePath,
    ids,
    fetchedVia: originFetchError ? "git-cache" : fetchRemote ? "git-fetch" : "git-cache",
    ...(originFetchError
      ? { fetchedFromCache: true, originFetchError }
      : {})
  };
}

/**
 * Fetch origin (or the GitHub API) and write the authoring-data snapshot.
 * `/admin/drafts` and Freeze both use this file. When `freezePlan` is
 * passed, ids are origin ∪ this freeze's puzzle add/update, minus remove
 * — assuming that freeze merges. Omit `freezePlan` for origin membership
 * only (the Refresh from GitHub control). Pass `github` to read the
 * production branch over the API and skip writing `.git`. Callers should
 * not fail Freeze if this throws.
 */
export async function refreshGithubProductionManifest({
  repositoryRoot,
  env = process.env,
  fetchRemote = true,
  freezePlan = null,
  github = null,
  runGit = git
} = {}) {
  let snapshot;
  if (github?.getBranchHead && github?.readFile) {
    try {
      snapshot = {
        ...await snapshotGithubProductionManifestFromClient(github),
        fetchedVia: "github-api"
      };
    } catch {
      snapshot = snapshotGithubProductionManifestFromGit({
        repositoryRoot,
        env,
        fetchRemote,
        runGit
      });
    }
  } else {
    snapshot = snapshotGithubProductionManifestFromGit({
      repositoryRoot,
      env,
      fetchRemote,
      runGit
    });
  }
  if (!freezePlan) return writeSnapshot(repositoryRoot, env, snapshot);
  const originIds = snapshot.ids;
  return writeSnapshot(repositoryRoot, env, {
    ...snapshot,
    originIds,
    projectedFromFreeze: true,
    ids: projectGithubProductionIds(originIds, freezePlan)
  });
}

/**
 * List pages read the snapshot file only. Missing or unreadable
 * snapshot means omit the GitHub-production badge, not "not in GitHub".
 * Refresh from GitHub or Freeze writes the file; this loader does not
 * fetch origin.
 */
export async function loadOrHydrateGithubProductionManifest({
  repositoryRoot,
  env = process.env
} = {}) {
  try {
    return await loadGithubProductionManifest({ repositoryRoot, env });
  } catch {
    return null;
  }
}
