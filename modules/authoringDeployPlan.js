// The remote half of `npm run authoring:deploy` (tools/authoring-deploy.mjs):
// one POSIX sh script that switches the LAN checkout to a branch, brings it
// to origin, and restarts only when the result includes origin/<base>. Every
// refusal happens before the service restarts, and the ancestry checks run
// against fetched refs before the checkout moves.

export const AUTHORING_CHECKOUT = "/opt/concept-clusters";
export const AUTHORING_RESTART_COMMAND =
  "sudo -S -p '' systemctl restart concept-clusters-authoring.service";

const USAGE = "Usage: npm run authoring:deploy [-- --pr <number>]";

/** `[]` deploys main; `["--pr", "123"]` or `["--pr=123"]` deploys that pull request. */
export function parseAuthoringDeployArgs(argv = []) {
  let pr = null;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    let value;
    if (arg === "--pr") value = argv[++index];
    else if (arg.startsWith("--pr=")) value = arg.slice("--pr=".length);
    else if (arg === "--help" || arg === "-h") return { help: true, usage: USAGE };
    else throw new Error(`Unknown argument ${JSON.stringify(arg)}. ${USAGE}`);
    if (!/^[1-9]\d*$/.test(value || "")) {
      throw new Error(`--pr needs a pull request number. ${USAGE}`);
    }
    pr = Number(value);
  }
  return { pr, usage: USAGE };
}

/** Accepts `gh pr view --json state,headRefName,isCrossRepository` output. */
export function branchFromPullRequest(pr, view) {
  if (view?.isCrossRepository) {
    throw new Error(`PR #${pr} comes from a fork; only branches on origin can be deployed.`);
  }
  if (view?.state !== "OPEN") {
    const state = String(view?.state || "unknown").toLowerCase();
    throw new Error(`PR #${pr} is ${state}. Deploy main instead: npm run authoring:deploy`);
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

export function buildAuthoringDeployScript({
  branch,
  baseBranch = "main",
  checkout = AUTHORING_CHECKOUT,
  restartCommand = AUTHORING_RESTART_COMMAND
} = {}) {
  assertBranchName(branch);
  assertBranchName(baseBranch);
  const fail = message => `{ echo "Refusing to restart: ${message}" >&2; exit 1; }`;
  return [
    "set -e",
    `cd '${checkout.replace(/'/g, "'\\''")}'`,
    `branch='${branch}'`,
    `base='${baseBranch}'`,
    // Explicit refspecs so a deleted PR branch fails here, not as a silent no-op.
    "git fetch -q origin \"+refs/heads/$base:refs/remotes/origin/$base\""
      + (branch === baseBranch ? "" : " \"+refs/heads/$branch:refs/remotes/origin/$branch\""),
    "if ! git merge-base --is-ancestor \"origin/$base\" \"origin/$branch\"; then "
      + `missing=$(git rev-list --count "origin/$branch..origin/$base"); `
      + fail("origin/$branch is missing $missing commit(s) from origin/$base. Merge $base into the branch and push first.")
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
