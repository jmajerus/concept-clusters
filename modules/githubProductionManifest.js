// Local snapshot of which puzzle ids are in GitHub production
// (`puzzles/manifest.js` on the base branch — what the player boots).
// Freeze fetches origin, then joins that set with the freeze patch
// (add/update minus remove) assuming the freeze PR merges. List pages
// read the file so they do not hit GitHub. `submitted` on puzzle_drafts
// is the old PR ledger and is not this question.
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import {
  authoringWorkspacePaths,
  ensureAuthoringWorkspace
} from "./authoringWorkspacePaths.js";

export function puzzleIdsFromRegistrySource(source) {
  const ids = new Set();
  if (typeof source !== "string" || !source) return ids;
  for (const match of source.matchAll(/from\s+["']\.\/[^"']+\/([^/"']+)\.js["']/g)) {
    ids.add(match[1]);
  }
  for (const match of source.matchAll(/from\s+["']\.\/([^/"']+)\.js["']/g)) {
    ids.add(match[1]);
  }
  return ids;
}

export function puzzleIdsFromManifestSource(source) {
  if (typeof source !== "string" || !source) return [];
  const ids = [];
  const seen = new Set();
  for (const match of source.matchAll(/"id": "([^"]+)",\s*\n\s+"module":/g)) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function parseGithubProductionSource(source, { path = "puzzles/manifest.js" } = {}) {
  if (typeof source !== "string" || !source.trim()) return [];
  if (path.endsWith("manifest.js")) {
    const fromManifest = puzzleIdsFromManifestSource(source);
    if (fromManifest.length) return fromManifest;
  }
  return [...puzzleIdsFromRegistrySource(source)].sort();
}

export function githubProductionManifestPath({
  repositoryRoot,
  env = process.env
} = {}) {
  return authoringWorkspacePaths({ repositoryRoot, env }).githubProductionManifest;
}

export function inGithubProduction(snapshot, puzzleId) {
  if (!snapshot || !Array.isArray(snapshot.ids) || !snapshot.ids.length) {
    return null;
  }
  if (typeof puzzleId !== "string" || !puzzleId) return null;
  return snapshot.ids.includes(puzzleId);
}

export function withGithubProduction(row, snapshot) {
  const puzzleId = row?.id || row?.puzzleId || null;
  return {
    ...row,
    inGithubProduction: inGithubProduction(snapshot, puzzleId)
  };
}

/**
 * Post-merge membership: origin production ids plus this freeze's puzzle
 * adds and updates, minus removes. Updates that are already on origin are
 * a no-op; adds are the usual reason to project.
 */
export function projectGithubProductionIds(originIds, freezePlan = null) {
  const ids = new Set(
    (Array.isArray(originIds) ? originIds : []).filter(
      id => typeof id === "string" && id
    )
  );
  const puzzles = freezePlan?.puzzles || {};
  for (const id of [...(puzzles.add || []), ...(puzzles.update || [])]) {
    if (typeof id === "string" && id) ids.add(id);
  }
  for (const id of puzzles.remove || []) {
    if (typeof id === "string" && id) ids.delete(id);
  }
  return [...ids].sort();
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
      projectedFromFreeze: raw.projectedFromFreeze === true
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

/**
 * Read GitHub production puzzle ids from origin (optionally `git fetch`
 * first). Does not write the authoring-data file.
 */
export function snapshotGithubProductionManifestFromGit({
  repositoryRoot,
  env = process.env,
  fetchRemote = false
} = {}) {
  if (!repositoryRoot) throw new Error("repositoryRoot is required");
  const ref = productionRef(env);
  if (fetchRemote) {
    git(repositoryRoot, ["fetch", "origin"], { timeout: 120000 });
  }
  let sourcePath = "puzzles/manifest.js";
  let source;
  try {
    source = git(repositoryRoot, ["show", `${ref}:${sourcePath}`]);
  } catch {
    sourcePath = "puzzles/index.js";
    source = git(repositoryRoot, ["show", `${ref}:${sourcePath}`]);
  }
  const ids = parseGithubProductionSource(source, { path: sourcePath }).sort();
  let sha = "";
  try {
    sha = git(repositoryRoot, ["rev-parse", ref]).trim();
  } catch {
    sha = "";
  }
  return {
    fetchedAt: new Date().toISOString(),
    ref,
    sha,
    source: sourcePath,
    ids
  };
}

/**
 * Fetch origin and write the authoring-data snapshot Freeze and
 * `/admin/drafts` use. When `freezePlan` is passed, ids are origin ∪
 * this freeze's puzzle add/update, minus remove — assuming that freeze
 * merges. Callers should not fail Freeze if this throws.
 */
export async function refreshGithubProductionManifest({
  repositoryRoot,
  env = process.env,
  fetchRemote = true,
  freezePlan = null
} = {}) {
  const snapshot = snapshotGithubProductionManifestFromGit({
    repositoryRoot,
    env,
    fetchRemote
  });
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
 * Same snapshot shape from the GitHub API (hosted Worker has no origin fetch).
 */
export async function snapshotGithubProductionManifestFromClient(github) {
  if (!github?.getBranchHead || !github?.readFile) {
    throw new Error("github client is required");
  }
  const branch = github.baseBranch || "main";
  const { commitSha } = await github.getBranchHead(branch);
  let sourcePath = "puzzles/manifest.js";
  let source = await github.readFile(sourcePath, commitSha);
  let ids = parseGithubProductionSource(source || "", { path: sourcePath });
  if (!ids.length) {
    sourcePath = "puzzles/index.js";
    source = await github.readFile(sourcePath, commitSha);
    ids = parseGithubProductionSource(source || "", { path: sourcePath });
  }
  return {
    fetchedAt: new Date().toISOString(),
    ref: branch,
    sha: commitSha || "",
    source: sourcePath,
    ids: [...ids].sort()
  };
}

/**
 * List pages read the Freeze-written file only. Missing or unreadable
 * snapshot means omit the GitHub-production badge, not "not in GitHub".
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
