import assert from "node:assert/strict";
import {
  LocalGitHubConfigError,
  parseGitHubRemote,
  resolveLocalGitHubConfig
} from "../modules/localGitHubConfig.js";

// localGitHubConfig.js's only remaining consumer is Freeze's own GitHub
// interaction (modules/localDevHttp.js's "Refresh from GitHub" and freeze
// plan loading, via GitHubRepositoryClient) -- the per-puzzle GitHub PR
// publication path this file used to also cover was removed once D1
// Publish + Cue + Freeze covered a single puzzle's path to production too
// (see tests/freeze-publication.mjs for Freeze's own PR-opening coverage).

export const name = "Local GitHub config: env, gh remote, and error cases";

export async function run() {
  assert.deepEqual(
    parseGitHubRemote("git@github.com:jmajerus/concept-clusters.git"),
    { owner: "jmajerus", repository: "concept-clusters" }
  );
  assert.deepEqual(
    parseGitHubRemote("https://github.com/jmajerus/concept-clusters"),
    { owner: "jmajerus", repository: "concept-clusters" }
  );
  assert.deepEqual(
    parseGitHubRemote("ssh://git@github.com/jmajerus/concept-clusters.git"),
    { owner: "jmajerus", repository: "concept-clusters" }
  );

  const fromEnv = await resolveLocalGitHubConfig({
    env: {
      GITHUB_OWNER: "jmajerus",
      GITHUB_REPOSITORY: "concept-clusters",
      GITHUB_TOKEN: "env-token",
      GITHUB_BASE_BRANCH: "main"
    },
    repositoryRoot: process.cwd(),
    command: async () => {
      throw new Error("should not call git or gh when env is complete");
    }
  });
  assert.deepEqual(fromEnv, {
    owner: "jmajerus",
    repository: "concept-clusters",
    token: "env-token",
    baseBranch: "main"
  });

  const fromCombined = await resolveLocalGitHubConfig({
    env: { GITHUB_REPOSITORY: "jmajerus/concept-clusters", GH_TOKEN: "gh-token" },
    repositoryRoot: process.cwd(),
    command: async () => ({ stdout: "" })
  });
  assert.equal(fromCombined.owner, "jmajerus");
  assert.equal(fromCombined.repository, "concept-clusters");
  assert.equal(fromCombined.token, "gh-token");

  await assert.rejects(
    () => resolveLocalGitHubConfig({
      env: {},
      repositoryRoot: process.cwd(),
      command: async () => ({ stdout: "" })
    }),
    LocalGitHubConfigError
  );
  await assert.rejects(
    () => resolveLocalGitHubConfig({
      env: {
        GITHUB_REPOSITORY: "jmajerus/concept-clusters/extra",
        GITHUB_TOKEN: "env-token"
      },
      repositoryRoot: process.cwd(),
      command: async () => ({ stdout: "" })
    }),
    LocalGitHubConfigError
  );
}
