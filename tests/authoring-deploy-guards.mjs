import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  handleAuthoringAdminIndex,
  renderServerRevisionSection,
  SERVER_REVISION_EVENTS_PATH,
  SERVER_REVISION_PATH,
  SERVER_SHUTDOWN_EVENT
} from "../modules/authoringAdminIndex.js";
import { formatAuthoringStatusProbe } from "../modules/authoringStatusProbe.js";
import {
  branchFromPullRequest,
  buildAuthoringDeployScript,
  parseAuthoringDeployArgs
} from "../modules/authoringDeployPlan.js";
import { EventEmitter } from "node:events";
import {
  createServerRevisionMonitor,
  githubPollSeconds,
  loadServerRevisionStatus,
  readGitRevision
} from "../modules/authoringServerRevision.js";
import {
  githubSignature,
  handleGithubPushWebhook,
  verifyGithubSignature
} from "../modules/githubPushWebhook.js";

export const name = "Authoring server deploy guards and running revision";

const gitEnv = {
  ...process.env,
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.com",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1"
};

function git(cwd, args) {
  const result = spawnSync("git", ["-c", "commit.gpgsign=false", "-c", "init.defaultBranch=main", ...args], {
    cwd,
    encoding: "utf8",
    env: gitEnv
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || args.join(" "));
  return result.stdout.trim();
}

function commit(cwd, file, message) {
  writeFileSync(join(cwd, file), `${message}\n`);
  git(cwd, ["add", "-A"]);
  git(cwd, ["commit", "-q", "-m", message]);
  return git(cwd, ["rev-parse", "HEAD"]);
}

function deploy(checkout, branch) {
  const marker = join(checkout, "..", "restarted");
  rmSync(marker, { force: true });
  const result = spawnSync("sh", ["-c", buildAuthoringDeployScript({
    branch,
    checkout,
    restartCommand: `touch '${marker}'`
  })], { encoding: "utf8", env: gitEnv });
  return { ...result, restarted: existsSync(marker) };
}

async function requestJson(handlerOptions, method = "GET") {
  const response = { status: 0, body: "" };
  const res = {
    writeHead(status) { response.status = status; },
    end(body = "") { response.body = body; }
  };
  const handled = await handleAuthoringAdminIndex({ method, url: SERVER_REVISION_PATH }, res, handlerOptions);
  return { handled, ...response };
}

function checkStatusProbe() {
  const running = { branch: "main", commit: "f34040aabcdef", subject: "Merge #265" };
  const adminUrl = "http://authoring.example:8787/admin";
  const stale = formatAuthoringStatusProbe({
    running, checkout: running, checkoutMoved: false,
    baseRef: "origin/main", behindBase: 10, upstreamRef: null, behindUpstream: null, fetchError: null
  }, { adminUrl });
  assert.equal(stale.text, "$(server) main ↓10");
  assert.equal(stale.level, "warn");
  assert.equal(stale.open, adminUrl);
  assert.match(stale.tooltip, /Behind origin\/main \| 10/);

  const pr = { branch: "feature/authoring-deploy-guards", commit: "abc1234def", subject: "Guard" };
  const fresh = formatAuthoringStatusProbe({
    running: pr, checkout: pr, checkoutMoved: false,
    baseRef: "origin/main", behindBase: 0,
    upstreamRef: "origin/feature/authoring-deploy-guards", behindUpstream: 0, fetchError: null
  }, { adminUrl, prNumber: 267 });
  assert.equal(fresh.text, "$(server) #267");
  assert.equal(fresh.level, "ok");

  const drifted = formatAuthoringStatusProbe({
    running: pr, checkout: { ...pr, commit: "9999999" }, checkoutMoved: true,
    baseRef: "origin/main", behindBase: 2,
    upstreamRef: "origin/feature/authoring-deploy-guards", behindUpstream: 1, fetchError: null
  }, { adminUrl });
  assert.equal(drifted.text, "$(server) authoring-deplo… ↓1 ✗main ⟳");
  assert.equal(drifted.level, "warn");
}

function waitFor(predicate, label, timeoutMs = 5000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const value = predicate();
      if (value) return resolve(value);
      if (Date.now() - started > timeoutMs) return reject(new Error(`timed out waiting for ${label}`));
      setTimeout(tick, 25);
    };
    tick();
  });
}

async function checkWebhook() {
  const secret = "s3cret";
  const body = Buffer.from(JSON.stringify({ ref: "refs/heads/main" }));
  assert.equal(verifyGithubSignature(secret, body, githubSignature(secret, body)), true);
  assert.equal(verifyGithubSignature(secret, body, githubSignature("other", body)), false);
  assert.equal(verifyGithubSignature(secret, body, undefined), false);

  async function deliver({ signature, event = "push", configured = secret }) {
    const req = {
      method: "POST",
      url: "/hooks/github",
      headers: { "x-hub-signature-256": signature, "x-github-event": event },
      async *[Symbol.asyncIterator]() { yield body; }
    };
    const response = { status: 0, pushes: 0 };
    const res = { writeHead(status) { response.status = status; }, end() {} };
    response.handled = await handleGithubPushWebhook(req, res, {
      secret: configured,
      onPush: () => { response.pushes += 1; }
    });
    await new Promise(resolve => setImmediate(resolve));
    return response;
  }
  const accepted = await deliver({ signature: githubSignature(secret, body) });
  assert.equal(accepted.status, 202);
  assert.equal(accepted.pushes, 1);
  const forged = await deliver({ signature: githubSignature("guess", body) });
  assert.equal(forged.status, 401);
  assert.equal(forged.pushes, 0);
  assert.equal((await deliver({ signature: githubSignature(secret, body), event: "ping" })).status, 200);
  assert.equal((await deliver({ signature: "x", configured: "" })).handled, false, "no secret, no route");

  assert.equal(githubPollSeconds({}), 60);
  assert.equal(githubPollSeconds({ AUTHORING_GITHUB_WEBHOOK_SECRET: "x" }), 300);
  assert.equal(githubPollSeconds({ AUTHORING_GITHUB_POLL_SECONDS: "0" }), 0);
}

async function checkEventStream() {
  const listeners = new Set();
  const server = new EventEmitter();
  const req = Object.assign(new EventEmitter(), {
    method: "GET",
    url: SERVER_REVISION_EVENTS_PATH,
    socket: { server }
  });
  const res = {
    chunks: [],
    writableEnded: false,
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    write(chunk) { this.chunks.push(chunk); },
    end() { this.writableEnded = true; }
  };
  await handleAuthoringAdminIndex(req, res, {
    loadServerRevision: async () => ({ running: { commit: "a" } }),
    subscribeServerRevision: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  });
  assert.equal(res.status, 200);
  assert.match(res.headers["Content-Type"], /text\/event-stream/);
  await waitFor(() => res.chunks.length === 1, "initial event");
  for (const listener of listeners) listener({ running: { commit: "a" } });
  for (const listener of listeners) listener({ running: { commit: "b" } });
  assert.deepEqual(res.chunks, [
    `data: ${JSON.stringify({ running: { commit: "a" } })}\n\n`,
    `data: ${JSON.stringify({ running: { commit: "b" } })}\n\n`
  ], "unchanged status is not resent");
  server.emit(SERVER_SHUTDOWN_EVENT);
  assert.equal(res.writableEnded, true, "shutdown ends the stream");
  req.emit("close");
  assert.equal(listeners.size, 0, "closing unsubscribes");
}

async function checkMonitor(root) {
  const work = join(root, "monitor-work");
  const origin = join(root, "monitor-origin.git");
  const server = join(root, "monitor-server");
  mkdirSync(work);
  git(work, ["init", "-q"]);
  commit(work, "a.txt", "first");
  git(root, ["clone", "-q", "--bare", work, origin]);
  git(work, ["remote", "add", "origin", origin]);
  git(root, ["clone", "-q", origin, server]);
  const running = readGitRevision({ repositoryRoot: server });
  const monitor = createServerRevisionMonitor({
    repositoryRoot: server,
    running,
    env: {},
    pollSeconds: 0,
    debounceMs: 20
  });
  const seen = [];
  const unsubscribe = monitor.subscribe(status => seen.push(status));
  try {
    await monitor.refresh();
    assert.equal(seen.length, 1);
    assert.equal(seen[0].behindBase, 0);

    // GitHub moves; the poller notices through ls-remote and fetches.
    commit(work, "b.txt", "second");
    git(work, ["push", "-q", "origin", "main"]);
    await monitor.pollOrigin();
    assert.equal(monitor.latest().behindBase, 1);

    // A checkout move on disk arrives through the .git watcher alone.
    git(server, ["merge", "-q", "--ff-only", "origin/main"]);
    const moved = await waitFor(() => monitor.latest()?.checkoutMoved, "checkout-move event");
    assert.equal(moved, true);
  } finally {
    unsubscribe();
    monitor.close();
  }
}

export async function run() {
  checkStatusProbe();
  await checkWebhook();
  await checkEventStream();
  const ok = await requestJson({ loadServerRevision: async () => ({ running: { commit: "abc" } }) });
  assert.equal(ok.handled, true);
  assert.equal(ok.status, 200);
  assert.equal(JSON.parse(ok.body).running.commit, "abc");
  const missing = await requestJson({ loadServerRevision: async () => null });
  assert.equal(missing.status, 503);
  assert.equal((await requestJson({ loadServerRevision: async () => null }, "POST")).status, 405);

  assert.deepEqual(parseAuthoringDeployArgs([]).pr, null);
  assert.equal(parseAuthoringDeployArgs([]).main, false);
  assert.equal(parseAuthoringDeployArgs(["--main"]).main, true);
  assert.throws(() => parseAuthoringDeployArgs(["--main", "--pr", "3"]), /not both/);
  assert.equal(parseAuthoringDeployArgs(["--pr", "42"]).pr, 42);
  assert.equal(parseAuthoringDeployArgs(["--pr=7"]).pr, 7);
  assert.throws(() => parseAuthoringDeployArgs(["--pr"]), /pull request number/);
  assert.throws(() => parseAuthoringDeployArgs(["main"]), /Unknown argument/);
  assert.equal(
    branchFromPullRequest(5, { state: "OPEN", headRefName: "feature/x", isCrossRepository: false }),
    "feature/x"
  );
  assert.throws(() => branchFromPullRequest(5, { state: "MERGED", headRefName: "feature/x" }), /merged.*Deploy main/);
  assert.throws(() => branchFromPullRequest(5, { state: "OPEN", headRefName: "x'; rm -rf ~" }), /unexpected branch/);

  const root = mkdtempSync(join(tmpdir(), "authoring-deploy-"));
  try {
    await checkMonitor(root);
    const work = join(root, "work");
    const origin = join(root, "origin.git");
    const server = join(root, "server");
    mkdirSync(work);
    git(work, ["init", "-q"]);
    mkdirSync(join(work, "puzzles"));
    mkdirSync(join(work, "catalogues"));
    mkdirSync(join(work, "content"));
    writeFileSync(join(work, "catalogues", "c.txt"), "c\n");
    writeFileSync(join(work, "content", "d.txt"), "d\n");
    commit(work, "puzzles/a.txt", "first");
    git(root, ["clone", "-q", "--bare", work, origin]);
    git(work, ["remote", "add", "origin", origin]);
    git(root, ["clone", "-q", origin, server]);
    const started = readGitRevision({ repositoryRoot: server });
    assert.equal(started.branch, "main");

    // main moves ahead on GitHub; a stale branch is cut before that.
    git(work, ["checkout", "-q", "-b", "feature/stale"]);
    commit(work, "stale.txt", "stale feature");
    git(work, ["checkout", "-q", "main"]);
    const mainHead = commit(work, "b.txt", "second");
    git(work, ["checkout", "-q", "-b", "feature/fresh"]);
    const freshHead = commit(work, "fresh.txt", "fresh feature");
    git(work, ["push", "-q", "origin", "main", "feature/stale", "feature/fresh"]);

    const stale = await loadServerRevisionStatus({ repositoryRoot: server, running: started });
    assert.equal(stale.behindBase, 1);
    assert.equal(stale.checkoutMoved, false);
    assert.match(renderServerRevisionSection(stale), /server-revision-stale[\s\S]*1 commit behind <code>origin\/main/);

    // A Freeze-style staged sync of puzzles/ must not block the switch.
    writeFileSync(join(server, "puzzles", "a.txt"), "frozen\n");
    git(server, ["add", "puzzles"]);

    const refused = deploy(server, "feature/stale");
    assert.notEqual(refused.status, 0);
    assert.equal(refused.restarted, false);
    assert.match(refused.stderr, /missing 1 commit\(s\) from origin\/main/);
    assert.equal(git(server, ["rev-parse", "HEAD"]), started.commit, "refusal leaves the checkout alone");

    const toMain = deploy(server, "main");
    assert.equal(toMain.status, 0, toMain.stderr);
    assert.equal(toMain.restarted, true);
    assert.equal(git(server, ["rev-parse", "HEAD"]), mainHead);

    const moved = await loadServerRevisionStatus({ repositoryRoot: server, running: started, fetchRemote: false });
    assert.equal(moved.checkoutMoved, true);
    assert.match(renderServerRevisionSection(moved), /checkout has moved/);

    const toPr = deploy(server, "feature/fresh");
    assert.equal(toPr.status, 0, toPr.stderr);
    assert.equal(toPr.restarted, true);
    assert.equal(git(server, ["rev-parse", "--abbrev-ref", "HEAD"]), "feature/fresh");
    assert.equal(git(server, ["rev-parse", "HEAD"]), freshHead);

    const current = await loadServerRevisionStatus({
      repositoryRoot: server,
      running: readGitRevision({ repositoryRoot: server })
    });
    assert.equal(current.behindBase, 0);
    assert.equal(current.behindUpstream, 0);
    const html = renderServerRevisionSection(current);
    assert.doesNotMatch(html, /server-revision-stale/);
    assert.match(html, /Up to date with <code>origin\/feature\/fresh<\/code> and includes <code>origin\/main/);

    // No branch: bring the current branch up to date with its origin ref.
    git(work, ["checkout", "-q", "feature/fresh"]);
    const freshNext = commit(work, "fresh2.txt", "fresh follow-up");
    git(work, ["push", "-q", "origin", "feature/fresh"]);
    const redeploy = deploy(server, null);
    assert.equal(redeploy.status, 0, redeploy.stderr);
    assert.equal(redeploy.restarted, true);
    assert.equal(git(server, ["rev-parse", "HEAD"]), freshNext);

    // The current branch going stale against main (a merged PR left behind) is refused.
    git(work, ["checkout", "-q", "main"]);
    commit(work, "c.txt", "third");
    git(work, ["push", "-q", "origin", "main"]);
    const behindMain = deploy(server, null);
    assert.notEqual(behindMain.status, 0);
    assert.equal(behindMain.restarted, false);
    assert.match(behindMain.stderr, /missing 1 commit\(s\) from origin\/main[\s\S]*--main/);

    // A deleted branch is refused even though a stale origin/<branch> ref remains.
    git(work, ["push", "-q", "origin", "--delete", "feature/fresh"]);
    const deleted = deploy(server, null);
    assert.notEqual(deleted.status, 0);
    assert.equal(deleted.restarted, false);
    assert.match(deleted.stderr, /origin has no branch feature\/fresh/);

    const backToMain = deploy(server, "main");
    assert.equal(backToMain.status, 0, backToMain.stderr);
    assert.equal(git(server, ["rev-parse", "--abbrev-ref", "HEAD"]), "main");

    // A detached checkout has no branch to redeploy.
    git(server, ["checkout", "-q", "--detach"]);
    const detached = deploy(server, null);
    assert.notEqual(detached.status, 0);
    assert.match(detached.stderr, /not on a branch/);
    git(server, ["checkout", "-q", "main"]);

    // A local commit on the server's branch is never silently discarded.
    commit(server, "local.txt", "local only");
    const diverged = deploy(server, null);
    assert.notEqual(diverged.status, 0);
    assert.equal(diverged.restarted, false);
    assert.match(diverged.stderr, /local main has commits/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
