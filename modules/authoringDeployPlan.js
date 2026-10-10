// The remote half of `npm run authoring:deploy` (tools/authoring-deploy.mjs):
// one POSIX sh script that brings the LAN checkout's current branch (or a
// branch it switches to) up to origin, and restarts only when the result
// includes origin/<base>. Every refusal happens before the service restarts,
// and the ancestry checks run against fetched refs before the checkout moves.

export const AUTHORING_CHECKOUT = "/opt/concept-clusters";
export const AUTHORING_RESTART_COMMAND =
  "sudo -S -p '' systemctl restart concept-clusters-authoring.service";

const USAGE = "Usage: npm run authoring:deploy [-- --main | --pr <number>]\n"
  + "  (no option)    redeploy the branch the server is on\n"
  + "  --main         switch to main\n"
  + "  --pr <number>  switch to that open pull request's branch";

/**
 * `[]` redeploys the server's current branch, `["--main"]` switches to main,
 * and `["--pr", "123"]` or `["--pr=123"]` switches to that pull request.
 */
export function parseAuthoringDeployArgs(argv = []) {
  let pr = null;
  let main = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { help: true, usage: USAGE };
    if (arg === "--main") {
      main = true;
      continue;
    }
    let value;
    if (arg === "--pr") value = argv[++index];
    else if (arg.startsWith("--pr=")) value = arg.slice("--pr=".length);
    else throw new Error(`Unknown argument ${JSON.stringify(arg)}. ${USAGE}`);
    if (!/^[1-9]\d*$/.test(value || "")) {
      throw new Error(`--pr needs a pull request number. ${USAGE}`);
    }
    pr = Number(value);
  }
  if (main && pr) throw new Error(`Choose --main or --pr, not both. ${USAGE}`);
  return { pr, main, usage: USAGE };
}

/** Accepts `gh pr view --json state,headRefName,isCrossRepository` output. */
export function branchFromPullRequest(pr, view) {
  if (view?.isCrossRepository) {
    throw new Error(`PR #${pr} comes from a fork; only branches on origin can be deployed.`);
  }
  if (view?.state !== "OPEN") {
    const state = String(view?.state || "unknown").toLowerCase();
    throw new Error(`PR #${pr} is ${state}. Deploy main instead: npm run authoring:deploy -- --main`);
  }
  return assertBranchName(view.headRefName);
}

export function assertBranchName(branch) {
  // Branch names are interpolated into a shell script; allow only the
  // characters this repository's branches use, and nothing git would reject.
  if (typeof branch !== "string"
    || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branch)
    || branch.includes("..")
    || branch.endsWith("/")
    || branch.endsWith(".lock")) {
    throw new Error(`Refusing to deploy unexpected branch name ${JSON.stringify(branch)}.`);
  }
  return branch;
}

/**
 * `branch` null redeploys whatever branch the checkout is on. That name is
 * read on the server, so the script checks its characters itself.
 */
export function buildAuthoringDeployScript({
  branch = null,
  baseBranch = "main",
  checkout = AUTHORING_CHECKOUT,
  restartCommand = AUTHORING_RESTART_COMMAND
} = {}) {
  if (branch !== null) assertBranchName(branch);
  assertBranchName(baseBranch);
  const fail = message => `{ echo "Refusing to restart: ${message}" >&2; exit 1; }`;
  const switchHint = "Deploy main with --main, or an open PR with --pr <number>.";
  const selectBranch = branch === null
    ? [
      "branch=$(git symbolic-ref -q --short HEAD) || "
        + fail(`the server is not on a branch (detached HEAD). ${switchHint}`),
      "case \"$branch\" in ''|-*|*[!A-Za-z0-9._/-]*) "
        + fail(`unexpected branch name $branch. ${switchHint}`)
        + ";; esac"
    ]
    : [`branch='${branch}'`];
  return [
    "set -e",
    `cd '${checkout.replace(/'/g, "'\\''")}'`,
    `base='${baseBranch}'`,
    ...selectBranch,
    "echo \"Deploying $branch\"",
    // A merged PR's deleted branch can linger as a stale origin/<branch>
    // ref; ask GitHub directly so it never passes for current.
    "git ls-remote --exit-code -q --heads origin \"refs/heads/$branch\" >/dev/null || "
      + fail(`origin has no branch $branch (a merged PR whose branch was deleted?). ${switchHint}`),
    "git fetch -q origin \"+refs/heads/$base:refs/remotes/origin/$base\" \"+refs/heads/$branch:refs/remotes/origin/$branch\"",
    "if ! git merge-base --is-ancestor \"origin/$base\" \"origin/$branch\"; then "
      + `missing=$(git rev-list --count "origin/$branch..origin/$base"); `
      + fail("origin/$branch is missing $missing commit(s) from origin/$base. Merge $base into the branch and push, or deploy main with --main.")
      + "; fi",
    "if git show-ref --verify -q \"refs/heads/$branch\" && ! git merge-base --is-ancestor \"refs/heads/$branch\" \"origin/$branch\"; then "
      + fail("the server's local $branch has commits that are not on origin/$branch.")
      + "; fi",
    // Freeze syncs puzzles/, catalogues/, and content/ from origin without
    // moving HEAD (`git checkout origin/<base> -- <dirs>`), which stages
    // those paths against the old commit and blocks a later checkout or
    // fast-forward. They are not a local source of truth -- Freeze
    // publishes through GitHub -- so put them back to HEAD first.
    "git reset -q -- puzzles catalogues content",
    "git checkout -q -- puzzles catalogues content",
    "git clean -fdq -- puzzles catalogues content",
    "if git show-ref --verify -q \"refs/heads/$branch\"; then git checkout -q \"$branch\"; "
      + "else git checkout -q -b \"$branch\" --track \"origin/$branch\"; fi",
    "git merge -q --ff-only \"origin/$branch\"",
    "test \"$(git rev-parse HEAD)\" = \"$(git rev-parse \"origin/$branch\")\" || "
      + fail("HEAD does not match origin/$branch after the fast-forward."),
    "git merge-base --is-ancestor \"origin/$base\" HEAD || "
      + fail("HEAD does not include origin/$base."),
    "echo \"Restarting on $branch @ $(git rev-parse --short HEAD): $(git log -1 --format=%s)\"",
    restartCommand
  ].join("\n");
}
