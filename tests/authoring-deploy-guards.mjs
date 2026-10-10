import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { renderServerRevisionSection } from "../modules/authoringAdminIndex.js";
import {
  branchFromPullRequest,
  buildAuthoringDeployScript,
  parseAuthoringDeployArgs
} from "../modules/authoringDeployPlan.js";
import { loadServerRevisionStatus, readGitRevision } from "../modules/authoringServerRevision.js";

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

export async function run() {
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

    const stale = loadServerRevisionStatus({ repositoryRoot: server, running: started });
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

    const moved = loadServerRevisionStatus({ repositoryRoot: server, running: started, fetchRemote: false });
    assert.equal(moved.checkoutMoved, true);
    assert.match(renderServerRevisionSection(moved), /checkout has moved/);

    const toPr = deploy(server, "feature/fresh");
    assert.equal(toPr.status, 0, toPr.stderr);
    assert.equal(toPr.restarted, true);
    assert.equal(git(server, ["rev-parse", "--abbrev-ref", "HEAD"]), "feature/fresh");
    assert.equal(git(server, ["rev-parse", "HEAD"]), freshHead);

    const current = loadServerRevisionStatus({
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
