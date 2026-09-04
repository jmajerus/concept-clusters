#!/usr/bin/env node
// Applies a freeze end to end, in its own short-lived process.
//
// Two kinds of staleness would otherwise leak into a freeze:
//   1. the on-disk checkout drifting behind origin/main -- a human
//      forgetting to `git pull` after some other PR merges, and
//   2. the long-running admin server's own module cache: Node caches an
//      ES module by URL for the life of the process, so even a `git pull`
//      run by hand would not change what an already-imported
//      puzzles/index.js looks like to that server without a restart.
//
// Running as a fresh process for every freeze fixes both. The git sync
// below runs first, using only core modules imported at the top of this
// file. Everything that reads puzzle/catalogue content -- directly or
// transitively, e.g. contentFreezeApply.js statically imports
// puzzles/categories.js -- is imported dynamically afterward, so it can
// only ever see what is on disk right now. The admin server just spawns
// this script (see applyFreeze in modules/localDevHttp.js) and relays its
// JSON result.
import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";

const CONTENT_DIRS = ["puzzles", "catalogues", "content"];

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function git(args) {
  const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${result.stdout}${result.stderr}`);
  }
  return result.stdout;
}

async function main() {
  const additionalContext = process.argv[2] || "";
  loadProjectEnv({ repositoryRoot });

  const { resolveLocalGitHubConfig, LocalGitHubConfigError } =
    await import("../modules/localGitHubConfig.js");
  let githubConfig;
  try {
    githubConfig = await resolveLocalGitHubConfig({ repositoryRoot });
  } catch (error) {
    if (error instanceof LocalGitHubConfigError) {
      throw new Error("Freeze requires GitHub PR configuration. " + error.message);
    }
    throw error;
  }

  // Nothing but this script should be writing puzzles/, catalogues/, or
  // content/ in this checkout -- but tools/content-jsonld.mjs's
  // content:import CLI still uses repositoryPublicationService.js to write
  // there directly, deliberately left uncommitted for a human to push or
  // discard by hand. A hard reset must never eat that. Refuse instead of
  // silently deciding for them.
  const dirty = git(["status", "--porcelain", "--", ...CONTENT_DIRS]).trim();
  if (dirty) {
    throw new Error(
      "Freeze needs puzzles/, catalogues/, and content/ to match " +
      `origin/${githubConfig.baseBranch} before it can reset this checkout, ` +
      "but they have uncommitted changes (from content:import or a manual " +
      `edit):\n${dirty}\nCommit and push, or discard them, then freeze again.`
    );
  }

  // Reconstruct just these three directories from origin before anything
  // below reads a single puzzle/catalogue file, tracked or not. This is
  // deliberately not `git reset --hard` -- that moves HEAD and the
  // currently checked-out branch's ref for the *whole* repository, which
  // both risks discarding unrelated uncommitted work outside these paths
  // and (when this checkout has a branch other than the base checked
  // out, e.g. testing a PR before merge) tries to rewrite that branch's
  // own history out from under it. Removing and re-extracting only these
  // paths from the fetched ref touches nothing else and never moves HEAD.
  git(["fetch", "origin", githubConfig.baseBranch]);
  for (const dir of CONTENT_DIRS) {
    await rm(join(repositoryRoot, dir), { recursive: true, force: true });
  }
  git(["checkout", `origin/${githubConfig.baseBranch}`, "--", ...CONTENT_DIRS]);

  const [
    { resolveLocalAuthoringWorkspace },
    { GitHubRepositoryClient },
    { D1FreezePublicationRepository },
    { createFreezePublicationService },
    { loadContentFreezePlan, gitIdsFromContentService },
    { applyContentFreeze },
    { createContentInterchangeService },
    { refreshGithubProductionManifest }
  ] = await Promise.all([
    import("../modules/localAuthoringWorkspace.js"),
    import("../modules/githubRepositoryClient.js"),
    import("../modules/d1FreezePublicationRepository.js"),
    import("../modules/freezePublicationService.js"),
    import("../modules/contentFreezePlan.js"),
    import("../modules/contentFreezeApply.js"),
    import("../modules/contentInterchangeService.js"),
    import("../modules/githubProductionManifest.js")
  ]);

  const contentService = createContentInterchangeService({ repositoryRoot });
  const resolved = await resolveLocalAuthoringWorkspace({ repositoryRoot });
  if (!resolved.contentDocuments) {
    throw new Error("D1 published documents are not configured.");
  }

  const github = new GitHubRepositoryClient(githubConfig);
  const publicationService = createFreezePublicationService({
    github,
    repository: new D1FreezePublicationRepository(resolved.contentDocuments.database)
  });
  await publicationService.reconcile({ contentDocuments: resolved.contentDocuments });

  const plan = await loadContentFreezePlan({
    contentDocuments: resolved.contentDocuments,
    gitIds: gitIdsFromContentService(contentService)
  });

  const result = await applyContentFreeze({
    plan,
    contentDocuments: resolved.contentDocuments,
    repositoryRoot,
    keepChanges: false
  });

  const publication = await publicationService.submit({
    freeze: result,
    additionalContext,
    contentDocuments: resolved.contentDocuments
  });

  try {
    const githubProduction = await refreshGithubProductionManifest({
      repositoryRoot,
      fetchRemote: true,
      freezePlan: result.plan || plan
    });
    return { ...result, publication, githubProduction };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ...result, publication, githubProductionError: message };
  }
}

main()
  .then(result => {
    process.stdout.write(JSON.stringify(result));
  })
  .catch(error => {
    process.stdout.write(JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      code: error && error.code
    }));
    process.exitCode = 1;
  });
