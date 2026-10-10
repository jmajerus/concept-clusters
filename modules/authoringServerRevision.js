// Which code the LAN authoring server is actually serving, and how far that
// is from GitHub. Node never reloads an already-imported module, so the
// commit checked out on disk is not necessarily the commit running: the
// server records HEAD once at startup and compares later checkouts against
// it. See tools/authoring-deploy.mjs for the deploy side of the same guard.
//
// createServerRevisionMonitor turns that comparison into events for
// /admin/server-revision/events: a checkout move (watched under .git), a
// GitHub push webhook, or the fallback poller seeing origin move.
import { execFile, spawnSync } from "node:child_process";
import { watch } from "node:fs";
import { join } from "node:path";

function gitAsync(repositoryRoot, args, { timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd: repositoryRoot, encoding: "utf8", timeout }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error((stderr || stdout || error.message || `git ${args.join(" ")} failed`).trim()));
        return;
      }
      resolve(String(stdout || ""));
    });
  });
}

function gitSync(repositoryRoot, args) {
  const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8", timeout: 15000 });
  if (result.status !== 0) throw new Error((result.stderr || `git ${args.join(" ")} failed`).trim());
  return String(result.stdout || "");
}

async function tryGit(repositoryRoot, runGit, args) {
  try {
    return String(await runGit(repositoryRoot, args)).trim();
  } catch {
    return null;
  }
}

export function baseBranchName(env = process.env) {
  return typeof env.GITHUB_BASE_BRANCH === "string" && env.GITHUB_BASE_BRANCH.trim()
    ? env.GITHUB_BASE_BRANCH.trim()
    : "main";
}

/**
 * HEAD's branch (null when detached), full commit, and subject; null outside
 * a git checkout. Synchronous: the server calls it once, at startup.
 */
export function readGitRevision({ repositoryRoot, runGit = gitSync } = {}) {
  const run = args => {
    try {
      return String(runGit(repositoryRoot, args)).trim();
    } catch {
      return null;
    }
  };
  const commit = run(["rev-parse", "HEAD"]);
  if (!commit) return null;
  const branch = run(["symbolic-ref", "-q", "--short", "HEAD"]);
  const subject = run(["log", "-1", "--format=%s", commit]);
  return { branch: branch || null, commit, subject: subject || "" };
}

async function readGitRevisionAsync(repositoryRoot, runGit) {
  const commit = await tryGit(repositoryRoot, runGit, ["rev-parse", "HEAD"]);
  if (!commit) return null;
  const branch = await tryGit(repositoryRoot, runGit, ["symbolic-ref", "-q", "--short", "HEAD"]);
  const subject = await tryGit(repositoryRoot, runGit, ["log", "-1", "--format=%s", commit]);
  return { branch: branch || null, commit, subject: subject || "" };
}

/** Returns null on success, or the fetch error message. */
async function fetchOrigin(repositoryRoot, runGit) {
  try {
    await runGit(repositoryRoot, ["fetch", "origin", "--no-write-fetch-head"]);
    return null;
  } catch (error) {
    if (!/unknown option|no-write-fetch-head/i.test(error.message)) return error.message;
    try {
      await runGit(repositoryRoot, ["fetch", "origin"]);
      return null;
    } catch (retry) {
      return retry.message;
    }
  }
}

async function countCommits(repositoryRoot, runGit, range) {
  const count = await tryGit(repositoryRoot, runGit, ["rev-list", "--count", range]);
  return count == null ? null : Number(count);
}

/**
 * Compare the revision this server started on with the checkout on disk and
 * with origin. `fetchRemote` refreshes origin first; on failure the counts
 * come from the last fetched refs and `fetchError` says why.
 */
export async function loadServerRevisionStatus({
  repositoryRoot,
  running,
  env = process.env,
  fetchRemote = true,
  runGit = gitAsync
} = {}) {
  if (!running?.commit) return null;
  const baseBranch = baseBranchName(env);
  const fetchError = fetchRemote ? await fetchOrigin(repositoryRoot, runGit) : null;
  const baseRef = `origin/${baseBranch}`;
  const hasBase = await tryGit(repositoryRoot, runGit, ["rev-parse", "--verify", "-q", baseRef]) != null;
  const upstreamRef = running.branch ? `origin/${running.branch}` : null;
  const hasUpstream = Boolean(upstreamRef && upstreamRef !== baseRef
    && await tryGit(repositoryRoot, runGit, ["rev-parse", "--verify", "-q", upstreamRef]) != null);
  const checkout = await readGitRevisionAsync(repositoryRoot, runGit);
  return {
    running,
    checkout,
    checkoutMoved: Boolean(checkout && checkout.commit !== running.commit),
    baseRef,
    behindBase: hasBase ? await countCommits(repositoryRoot, runGit, `${running.commit}..${baseRef}`) : null,
    upstreamRef: hasUpstream ? upstreamRef : null,
    behindUpstream: hasUpstream
      ? await countCommits(repositoryRoot, runGit, `${running.commit}..${upstreamRef}`)
      : null,
    fetchError
  };
}

/**
 * Poll interval for the GitHub fallback poller: AUTHORING_GITHUB_POLL_SECONDS
 * when set (0 turns it off), else 60 s, or 300 s when a push webhook is
 * configured and the poller only covers missed deliveries.
 */
export function githubPollSeconds(env = process.env) {
  const configured = Number(env.AUTHORING_GITHUB_POLL_SECONDS);
  if (String(env.AUTHORING_GITHUB_POLL_SECONDS ?? "").trim() !== "" && Number.isFinite(configured)) {
    return Math.max(0, configured);
  }
  return env.AUTHORING_GITHUB_WEBHOOK_SECRET ? 300 : 60;
}

/**
 * Keeps the latest status and tells subscribers when it changes. Watching
 * .git and polling GitHub run only while someone is subscribed.
 */
export function createServerRevisionMonitor({
  repositoryRoot,
  running,
  env = process.env,
  runGit = gitAsync,
  pollSeconds = githubPollSeconds(env),
  watchGit = true,
  debounceMs = 300
} = {}) {
  const listeners = new Set();
  let latest = null;
  let latestKey = "";
  let queue = Promise.resolve();
  let watchers = [];
  let pollTimer = null;
  let debounceTimer = null;

  function emit(status) {
    const key = JSON.stringify(status);
    if (key === latestKey) return;
    latest = status;
    latestKey = key;
    for (const listener of listeners) {
      try {
        listener(status);
      } catch {
        // One broken stream must not stop the others.
      }
    }
  }

  // Serialized so a webhook, a watcher, and a page load never run git
  // fetch side by side.
  function refresh({ fetchRemote = false } = {}) {
    const run = queue.then(async () => {
      const status = await loadServerRevisionStatus({ repositoryRoot, running, env, fetchRemote, runGit });
      if (status) emit(status);
      return status;
    });
    queue = run.catch(() => {});
    return run;
  }

  function scheduleLocalRefresh() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => refresh().catch(() => {}), debounceMs);
  }

  // Ask origin for the two branch tips that matter; fetch only when one
  // differs from the local origin/* ref.
  async function pollOrigin() {
    const base = baseBranchName(env);
    const branches = [...new Set([base, running?.branch].filter(Boolean))];
    const remote = await tryGit(repositoryRoot, runGit, [
      "ls-remote", "origin", ...branches.map(branch => `refs/heads/${branch}`)
    ]);
    if (remote == null) return;
    const tips = new Map(remote.split("\n").filter(Boolean).map(line => {
      const [sha, ref] = line.split(/\s+/);
      return [ref.replace(/^refs\/heads\//, ""), sha];
    }));
    for (const branch of branches) {
      const local = await tryGit(repositoryRoot, runGit, ["rev-parse", "-q", "--verify", `refs/remotes/origin/${branch}`]);
      if ((tips.get(branch) || null) !== (local || null)) {
        await refresh({ fetchRemote: true });
        return;
      }
    }
  }

  function start() {
    if (watchGit) {
      // git replaces refs through lock-file renames, so watch directories.
      const gitDir = join(repositoryRoot, ".git");
      for (const [path, options] of [
        [gitDir, {}],
        [join(gitDir, "refs", "heads"), { recursive: true }],
        [join(gitDir, "refs", "remotes"), { recursive: true }]
      ]) {
        try {
          const watcher = watch(path, options, (_event, file) => {
            if (path !== gitDir || ["HEAD", "packed-refs"].includes(String(file))) scheduleLocalRefresh();
          });
          watcher.on("error", () => {});
          watchers.push(watcher);
        } catch {
          // A missing refs/remotes, or a platform without recursive watch.
        }
      }
    }
    if (pollSeconds > 0) {
      pollTimer = setInterval(() => pollOrigin().catch(() => {}), pollSeconds * 1000);
      pollTimer.unref?.();
    }
  }

  function stop() {
    for (const watcher of watchers) watcher.close();
    watchers = [];
    clearInterval(pollTimer);
    pollTimer = null;
    clearTimeout(debounceTimer);
  }

  return {
    refresh,
    pollOrigin,
    latest: () => latest,
    /** A push webhook arrived: fetch and re-evaluate. */
    notifyPush: () => refresh({ fetchRemote: true }),
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) start();
      return () => {
        if (!listeners.delete(listener)) return;
        if (listeners.size === 0) stop();
      };
    },
    close() {
      listeners.clear();
      stop();
    }
  };
}
