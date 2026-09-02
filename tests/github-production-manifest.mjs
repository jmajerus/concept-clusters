import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  inGithubProduction,
  loadGithubProductionManifest,
  loadOrHydrateGithubProductionManifest,
  parseGithubProductionSource,
  projectGithubProductionIds,
  puzzleIdsFromManifestSource,
  puzzleIdsFromRegistrySource,
  refreshGithubProductionManifest,
  snapshotGithubProductionManifestFromClient,
  snapshotGithubProductionManifestFromGit,
  withGithubProduction
} from "../modules/githubProductionManifest.js";

export const name = "GitHub production manifest snapshot";

function git(cwd, args) {
  const result = spawnSync("git", ["-c", "commit.gpgsign=false", ...args], {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Test",
      GIT_AUTHOR_EMAIL: "test@example.com",
      GIT_COMMITTER_NAME: "Test",
      GIT_COMMITTER_EMAIL: "test@example.com"
    }
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || args.join(" "));
  return result.stdout;
}

export async function run() {
  const manifestSource = `export const PUZZLE_MANIFEST = [
  {
    "id": "energy-flow",
    "module": "./science/energy-flow.js",
    "browse": {}
  },
  {
    "id": "math-foundations",
    "module": "./math/math-foundations.js",
    "browse": {}
  }
];
`;
  assert.deepEqual(
    puzzleIdsFromManifestSource(manifestSource),
    ["energy-flow", "math-foundations"]
  );
  assert.deepEqual(
    parseGithubProductionSource(manifestSource, { path: "puzzles/manifest.js" }),
    ["energy-flow", "math-foundations"]
  );

  const indexSource = `
import energyFlow from "./science/energy-flow.js";
import mathFoundations from "./math/math-foundations.js";
`;
  assert.deepEqual(
    [...puzzleIdsFromRegistrySource(indexSource)].sort(),
    ["energy-flow", "math-foundations"]
  );
  assert.deepEqual(
    parseGithubProductionSource(indexSource, { path: "puzzles/index.js" }),
    ["energy-flow", "math-foundations"]
  );

  assert.equal(inGithubProduction(null, "energy-flow"), null);
  assert.equal(inGithubProduction({ ids: [] }, "energy-flow"), null);
  assert.equal(inGithubProduction({ ids: ["energy-flow"] }, "energy-flow"), true);
  assert.equal(inGithubProduction({ ids: ["energy-flow"] }, "brand-new"), false);
  assert.equal(inGithubProduction({ ids: ["energy-flow"] }, null), null);
  assert.equal(
    withGithubProduction({ id: "energy-flow" }, { ids: ["energy-flow"] }).inGithubProduction,
    true
  );
  assert.deepEqual(
    projectGithubProductionIds(["energy-flow"], {
      puzzles: { add: ["brand-new"], update: ["energy-flow"], remove: ["math-foundations"] }
    }),
    ["brand-new", "energy-flow"]
  );
  assert.deepEqual(
    projectGithubProductionIds(["energy-flow", "math-foundations"], {
      puzzles: { add: ["brand-new"], update: [], remove: ["math-foundations"] }
    }),
    ["brand-new", "energy-flow"]
  );
  assert.deepEqual(
    projectGithubProductionIds(["energy-flow"], null),
    ["energy-flow"]
  );

  const root = mkdtempSync(join(tmpdir(), "cc-gh-prod-"));
  const dataDir = join(root, "authoring-data");
  const env = { AUTHORING_DATA_DIR: dataDir };
  try {
    assert.equal(await loadGithubProductionManifest({ repositoryRoot: root, env }), null);
    assert.equal(await loadOrHydrateGithubProductionManifest({ repositoryRoot: root, env }), null);

    mkdirSync(join(root, "puzzles", "science"), { recursive: true });
    writeFileSync(join(root, "puzzles", "manifest.js"), manifestSource);
    writeFileSync(join(root, "puzzles", "science", "energy-flow.js"), "export default {};\n");
    git(root, ["init"]);
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "seed"]);
    git(root, ["branch", "-M", "main"]);
    const origin = join(root, "origin.git");
    git(root, ["clone", "--bare", ".", origin]);
    git(root, ["remote", "add", "origin", origin]);
    git(root, ["fetch", "origin"]);

    const fromGit = snapshotGithubProductionManifestFromGit({
      repositoryRoot: root,
      env,
      fetchRemote: false
    });
    assert.equal(fromGit.ref, "origin/main");
    assert.deepEqual(fromGit.ids, ["energy-flow", "math-foundations"]);
    assert.equal(await loadGithubProductionManifest({ repositoryRoot: root, env }), null);

    const written = await refreshGithubProductionManifest({
      repositoryRoot: root,
      env,
      fetchRemote: true
    });
    assert.deepEqual(written.ids, ["energy-flow", "math-foundations"]);
    assert.equal(written.projectedFromFreeze, undefined);

    const projected = await refreshGithubProductionManifest({
      repositoryRoot: root,
      env,
      fetchRemote: false,
      freezePlan: {
        puzzles: { add: ["brand-new"], update: ["energy-flow"], remove: ["math-foundations"] }
      }
    });
    assert.equal(projected.projectedFromFreeze, true);
    assert.deepEqual(projected.originIds, ["energy-flow", "math-foundations"]);
    assert.deepEqual(projected.ids, ["brand-new", "energy-flow"]);
    const loaded = await loadGithubProductionManifest({ repositoryRoot: root, env });
    assert.deepEqual(loaded.ids, projected.ids);
    assert.equal(loaded.projectedFromFreeze, true);
    assert.deepEqual(loaded.originIds, projected.originIds);

    const originOnly = await refreshGithubProductionManifest({
      repositoryRoot: root,
      env,
      fetchRemote: false
    });
    assert.equal(originOnly.projectedFromFreeze, undefined);
    assert.deepEqual(originOnly.ids, ["energy-flow", "math-foundations"]);
    assert.deepEqual(
      (await loadGithubProductionManifest({ repositoryRoot: root, env })).ids,
      ["energy-flow", "math-foundations"]
    );

    const fetchCalls = [];
    const cached = snapshotGithubProductionManifestFromGit({
      repositoryRoot: "/unused",
      env,
      fetchRemote: true,
      runGit(_cwd, args) {
        fetchCalls.push(args.join(" "));
        if (args[0] === "fetch") {
          throw new Error("error: cannot open '.git/FETCH_HEAD': Permission denied");
        }
        if (args[0] === "show") return manifestSource;
        if (args[0] === "rev-parse") return "deadbeef\n";
        throw new Error(args.join(" "));
      }
    });
    assert.equal(cached.fetchedFromCache, true);
    assert.equal(cached.fetchedVia, "git-cache");
    assert.match(cached.originFetchError, /FETCH_HEAD/);
    assert.deepEqual(cached.ids, ["energy-flow", "math-foundations"]);
    assert.match(fetchCalls[0], /--no-write-fetch-head/);
    assert.throws(
      () => snapshotGithubProductionManifestFromGit({
        repositoryRoot: "/unused",
        fetchRemote: true,
        runGit(_cwd, args) {
          if (args[0] === "fetch") {
            throw new Error("error: cannot open '.git/FETCH_HEAD': Permission denied");
          }
          throw new Error("missing ref");
        }
      }),
      /FETCH_HEAD/
    );

    const fromApi = await refreshGithubProductionManifest({
      repositoryRoot: root,
      env,
      github: {
        baseBranch: "main",
        getBranchHead: async () => ({ commitSha: "abc" }),
        readFile: async path => path === "puzzles/manifest.js" ? manifestSource : ""
      }
    });
    assert.equal(fromApi.fetchedVia, "github-api");
    assert.deepEqual(fromApi.ids, ["energy-flow", "math-foundations"]);

    const fromClient = await snapshotGithubProductionManifestFromClient({
      baseBranch: "main",
      getBranchHead: async () => ({ commitSha: "abc" }),
      readFile: async path => path === "puzzles/manifest.js" ? manifestSource : ""
    });
    assert.equal(fromClient.ref, "main");
    assert.deepEqual(fromClient.ids, ["energy-flow", "math-foundations"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
