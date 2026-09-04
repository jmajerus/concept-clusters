import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";
import { LOCAL_PUBLICATION_ACTOR } from "../modules/localAuthoringWorkspace.js";
import {
  LocalGitHubConfigError,
  parseGitHubRemote,
  resolveLocalGitHubConfig
} from "../modules/localGitHubConfig.js";
import { createLocalGitHubPublicationService } from "../modules/localGitHubPublication.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { puzzleToSimplified } from "../modules/puzzleSimplified.js";

export const name = "Local GitHub publication: config, PR submit, no checkout write";

class FakeGitHub {
  baseBranch = "main";
  base = { commitSha: "a".repeat(40), treeSha: "b".repeat(40) };
  branches = new Map();
  commits = [];
  appendedCommits = [];
  pullRequests = [];
  files = new Map();
  commitCounter = 0;
  nextPrNumber = 42;
  pullRequestsByNumber = new Map();
  pullRequestNumberByBranch = new Map();

  freshSha() {
    this.commitCounter += 1;
    return `d${String(this.commitCounter).padStart(39, "0")}`;
  }

  async getBranchHead(branch = this.baseBranch) {
    if (branch === this.baseBranch) return { ...this.base };
    const commitSha = this.branches.get(branch);
    if (!commitSha) throw new Error(`FakeGitHub: no branch ${branch}`);
    return { commitSha, treeSha: "c".repeat(40) };
  }

  async getOptionalBranchHead(branch) {
    const commitSha = this.branches.get(branch);
    return commitSha ? { commitSha, treeSha: "c".repeat(40) } : null;
  }

  async readFile(path) {
    return this.files.get(path) ?? null;
  }

  async createCommit(input) {
    const commitSha = this.freshSha();
    this.commits.push(input);
    this.branches.set(String(input.branch), commitSha);
    return commitSha;
  }

  async appendCommit(input) {
    const commitSha = this.freshSha();
    this.appendedCommits.push(input);
    this.branches.set(String(input.branch), commitSha);
    return commitSha;
  }

  async createPullRequest(input) {
    const number = this.nextPrNumber;
    this.nextPrNumber += 1;
    const record = {
      number,
      url: `https://github.com/jmajerus/concept-clusters/pull/${number}`,
      state: "open",
      merged: false,
      mergeCommitSha: null,
      branch: String(input.branch)
    };
    this.pullRequestsByNumber.set(number, record);
    this.pullRequestNumberByBranch.set(String(input.branch), number);
    this.pullRequests.push(input);
    return { number: record.number, url: record.url, state: record.state, merged: record.merged };
  }

  async findPullRequest(branch) {
    const number = this.pullRequestNumberByBranch.get(branch);
    if (number === undefined) return null;
    const record = this.pullRequestsByNumber.get(number);
    return record
      ? { number: record.number, url: record.url, state: record.state, merged: record.merged }
      : null;
  }

  async getPullRequest(number) {
    const record = this.pullRequestsByNumber.get(number);
    if (!record) throw new Error(`FakeGitHub: no tracked pull request #${number}`);
    return {
      number: record.number,
      url: record.url,
      state: record.state,
      merged: record.merged,
      mergeCommitSha: record.mergeCommitSha,
      headCommitSha: this.branches.get(record.branch) ?? null
    };
  }
}

async function mcpSession(server) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  let nextId = 1;
  const pending = new Map();
  clientTransport.onmessage = message => {
    if (message.id !== undefined && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const request = (method, params = undefined) => new Promise(resolve => {
    const id = nextId++;
    pending.set(id, resolve);
    clientTransport.send({
      jsonrpc: "2.0",
      id,
      method,
      ...(params === undefined ? {} : { params })
    });
  });
  await server.connect(serverTransport);
  await clientTransport.start();
  await request("initialize", {
    protocolVersion: LATEST_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "local-github-publication-tests", version: "1.0.0" }
  });
  await clientTransport.send({
    jsonrpc: "2.0",
    method: "notifications/initialized"
  });
  return {
    request,
    async close() {
      await clientTransport.close();
      await server.close();
    }
  };
}

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

  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-local-github-"));
  const content = createContentInterchangeService();
  const draftStore = createPuzzleDraftStore({ directory });
  const github = new FakeGitHub();
  const githubPublicationService = await createLocalGitHubPublicationService({
    contentService: content,
    draftStore,
    publicationDirectory: join(directory, "publications"),
    repositoryRoot: content.repositoryRoot,
    github
  });
  const server = createConceptClustersMcpServer({
    contentService: content,
    draftDirectory: directory,
    publicationDirectory: join(directory, "publications"),
    draftStore,
    githubPublicationService
  });
  const session = await mcpSession(server);
  try {
    // Opening a pull request for a draft is a human action on
    // /admin/drafts/<id> (submitDraftFromReview / githubPublicationService),
    // not an MCP tool -- submit_puzzle_for_publication and
    // preview_repository_import were removed once D1 Publish + Cue + Freeze
    // covered a single puzzle's path to production too. Exercise the same
    // service the admin UI's Open pull request button calls, directly.
    const listed = await session.request("tools/list", {});
    const toolNames = listed.result.tools.map(tool => tool.name);
    assert.ok(!toolNames.includes("submit_puzzle_for_publication"));
    assert.ok(!toolNames.includes("preview_repository_import"));

    const energy = content.state.puzzles.find(puzzle => puzzle.id === "energy-flow");
    await session.request("tools/call", {
      name: "create_puzzle_draft",
      arguments: {
        draft_id: "local-submit-fixture",
        document: {
          ...puzzleToSimplified(energy),
          id: "local-submit-fixture",
          title: "Local submit fixture"
        }
      }
    });

    const preview = await githubPublicationService.preview({
      draftId: "local-submit-fixture",
      actor: LOCAL_PUBLICATION_ACTOR
    });
    assert.equal(preview.valid, true);
    assert.equal(preview.preview.action, "create");
    assert.deepEqual(preview.preview.affectedPaths, [
      "content/puzzles/local-submit-fixture.ccpuzzle.json",
      "puzzles/science/local-submit-fixture.js"
    ]);
    assert.ok(!preview.preview.affectedPaths.includes("puzzles/index.js"));

    const submitted = await githubPublicationService.submit({
      draftId: "local-submit-fixture",
      actor: LOCAL_PUBLICATION_ACTOR
    });
    assert.equal(submitted.submissionOutcome, "opened");
    assert.equal(submitted.githubPrNumber, 42);
    assert.equal(github.commits.length, 1);
    assert.equal(github.pullRequests.length, 1);
    assert.match(github.pullRequests[0].body, /Publishes local draft `local-submit-fixture`/);
    assert.deepEqual(
      github.commits[0].changes.map(change => change.relativePath),
      [
        "content/puzzles/local-submit-fixture.ccpuzzle.json",
        "puzzles/science/local-submit-fixture.js"
      ]
    );

    const afterSubmit = await session.request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "local-submit-fixture" }
    });
    assert.equal(afterSubmit.result.structuredContent.draft.status, "submitted");
    assert.equal(afterSubmit.result.structuredContent.draft.revision, 1);

    const unchanged = await githubPublicationService.submit({
      draftId: "local-submit-fixture",
      actor: LOCAL_PUBLICATION_ACTOR
    });
    assert.equal(unchanged.submissionOutcome, "unchanged");
    assert.equal(unchanged.githubPrNumber, 42);
    assert.equal(github.commits.length, 1);
    assert.equal(github.pullRequests.length, 1);

    await session.request("tools/call", {
      name: "save_puzzle_draft",
      arguments: {
        draft_id: "local-submit-fixture",
        expected_revision: 1,
        document: {
          ...puzzleToSimplified(energy),
          id: "local-submit-fixture",
          title: "Local submit fixture (edited)"
        }
      }
    });
    const amended = await githubPublicationService.submit({
      draftId: "local-submit-fixture",
      actor: LOCAL_PUBLICATION_ACTOR
    });
    assert.equal(amended.submissionOutcome, "amended");
    assert.equal(amended.githubPrNumber, 42);
    assert.equal(github.appendedCommits.length, 1);
    assert.equal(github.pullRequests.length, 1);
  } finally {
    await session.close();
    await rm(directory, { recursive: true, force: true });
  }
}
