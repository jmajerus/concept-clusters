// Which code the LAN authoring server is actually serving, and how far that
// is from GitHub. Node never reloads an already-imported module, so the
// commit checked out on disk is not necessarily the commit running: the
// server records HEAD once at startup and compares later checkouts against
// it. See tools/authoring-deploy.mjs for the deploy side of the same guard.
import { spawnSync } from "node:child_process";

import { fetchOrigin } from "./githubProductionManifest.js";

function git(repositoryRoot, args, { timeout = 15000 } = {}) {
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

function tryGit(repositoryRoot, runGit, args) {
  try {
    return runGit(repositoryRoot, args).trim();
  } catch {
    return null;
  }
}

export function baseBranchName(env = process.env) {
  return typeof env.GITHUB_BASE_BRANCH === "string" && env.GITHUB_BASE_BRANCH.trim()
    ? env.GITHUB_BASE_BRANCH.trim()
    : "main";
}

/** HEAD's branch (null when detached), full commit, and subject; null outside a git checkout. */
export function readGitRevision({ repositoryRoot, runGit = git } = {}) {
  const commit = tryGit(repositoryRoot, runGit, ["rev-parse", "HEAD"]);
  if (!commit) return null;
  const branch = tryGit(repositoryRoot, runGit, ["symbolic-ref", "-q", "--short", "HEAD"]);
  const subject = tryGit(repositoryRoot, runGit, ["log", "-1", "--format=%s", commit]);
  return { branch: branch || null, commit, subject: subject || "" };
}

function countCommits(repositoryRoot, runGit, range) {
  const count = tryGit(repositoryRoot, runGit, ["rev-list", "--count", range]);
  return count == null ? null : Number(count);
}

/**
 * Compare the revision this server started on with the checkout on disk and
 * with origin. `fetchRemote` refreshes origin first; on failure the counts
 * come from the last fetched refs and `fetchError` says why.
 */
export function loadServerRevisionStatus({
  repositoryRoot,
  running,
  env = process.env,
  fetchRemote = true,
  runGit = git
} = {}) {
  if (!running?.commit) return null;
  const baseBranch = baseBranchName(env);
  const fetchError = fetchRemote
    ? fetchOrigin(repositoryRoot, runGit, { timeout: 15000 })
    : null;
  const baseRef = `origin/${baseBranch}`;
  const hasBase = tryGit(repositoryRoot, runGit, ["rev-parse", "--verify", "-q", baseRef]) != null;
  const upstreamRef = running.branch
    ? `origin/${running.branch}`
    : null;
  const hasUpstream = upstreamRef && upstreamRef !== baseRef
    && tryGit(repositoryRoot, runGit, ["rev-parse", "--verify", "-q", upstreamRef]) != null;
  const checkout = readGitRevision({ repositoryRoot, runGit });
  return {
    running,
    checkout,
    checkoutMoved: Boolean(checkout && checkout.commit !== running.commit),
    baseRef,
    behindBase: hasBase ? countCommits(repositoryRoot, runGit, `${running.commit}..${baseRef}`) : null,
    upstreamRef: hasUpstream ? upstreamRef : null,
    behindUpstream: hasUpstream
      ? countCommits(repositoryRoot, runGit, `${running.commit}..${upstreamRef}`)
      : null,
    fetchError
  };
}
