import assert from "node:assert/strict";
import {
  createFreezePublicationService,
  freezeCommitSummary,
  freezePullRequestBody
} from "../modules/freezePublicationService.js";

export const name = "freeze publication: one tracked release pull request";

function freeze({ id = "one", title = "first" } = {}) {
  return {
    plan: {
      puzzles: { add: [id], update: [], remove: [] },
      catalogues: { add: [], update: [], remove: [] },
      categories: { add: [], update: [], remove: [] }
    },
    changes: [{ relativePath: `content/puzzles/${id}.ccpuzzle.json`, content: `{ "title": "${title}" }` }],
    affectedPaths: [`content/puzzles/${id}.ccpuzzle.json`]
  };
}

function memoryRepository() {
  const records = [];
  let serial = 0;
  return {
    records,
    async findActive() {
      return records.find(record => ["requested", "pull-request-open"].includes(record.status)) || null;
    },
    async reserve(input) {
      const active = await this.findActive();
      if (active) return { ...active, reserved: false };
      serial += 1;
      const record = {
        id: `freeze-${serial}`,
        status: "requested",
        planHash: input.planHash,
        plan: input.plan,
        githubBranch: `authoring/freeze-${serial}`,
        githubCommitSha: null,
        githubPrNumber: null,
        githubPrUrl: null,
        summary: input.summary,
        additionalContext: input.additionalContext
      };
      records.push(record);
      return { ...record, reserved: true };
    },
    async recordPullRequest({ id, commitSha, pullRequest }) {
      const record = records.find(item => item.id === id);
      Object.assign(record, {
        status: "pull-request-open",
        githubCommitSha: commitSha,
        githubPrNumber: pullRequest.number,
        githubPrUrl: pullRequest.url
      });
      return record;
    },
    async recordAmendedCommit({ id, planHash, plan, summary, additionalContext, commitSha }) {
      const record = records.find(item => item.id === id);
      Object.assign(record, { planHash, plan, summary, additionalContext, githubCommitSha: commitSha });
      return record;
    },
    async reconcile({ id, pullRequest }) {
      const record = records.find(item => item.id === id);
      record.status = pullRequest.merged ? "merged" : "closed";
      return record;
    },
    async markFailed({ id, message }) {
      const record = records.find(item => item.id === id);
      record.status = "failed";
      record.error = message;
      return record;
    },
    async findUnreconciledMerges() {
      return records.filter(record => record.status === "merged" && !record.reconciledAt);
    },
    async markReconciled(id) {
      const record = records.find(item => item.id === id);
      record.reconciledAt = "now";
      return record;
    }
  };
}

function pendingContentDocuments() {
  const document = {
    cuedForFreezeAt: "2026-09-03T00:00:00.000Z",
    cuedForFreezeBy: "author@example.test"
  };
  const cues = [];
  return {
    cues,
    async getPublished({ kind, id }) {
      assert.equal(kind, "puzzle");
      assert.equal(id, "one");
      return document;
    },
    async setFreezeCue(input) {
      cues.push(input);
      document.cuedForFreezeBy = input.actor.subject;
      return document;
    }
  };
}

function fakeGitHub() {
  const commits = [];
  const appended = [];
  const pullRequests = [];
  let merged = false;
  return {
    commits,
    appended,
    pullRequests,
    set merged(value) { merged = value; },
    async getBranchHead(branch = "main") {
      return { commitSha: `${branch}-head`, treeSha: `${branch}-tree` };
    },
    async createCommit(input) {
      commits.push(input);
      return "created-commit";
    },
    async appendCommit(input) {
      appended.push(input);
      return `append-${appended.length}`;
    },
    async createPullRequest(input) {
      pullRequests.push(input);
      return { number: pullRequests.length, url: `https://example.test/pull/${pullRequests.length}`, state: "open", merged: false };
    },
    async getPullRequest(number) {
      return { number, state: merged ? "closed" : "open", merged, headCommitSha: "remote-head" };
    }
  };
}

export async function run() {
  assert.equal(freezeCommitSummary(freeze().plan), "Freeze: add puzzle one");
  assert.match(freezePullRequestBody({ plan: freeze().plan, additionalContext: "Ship after review." }), /Ship after review/);

  const repository = memoryRepository();
  const github = fakeGitHub();
  const service = createFreezePublicationService({ github, repository });

  const opened = await service.submit({ freeze: freeze(), additionalContext: "Ship after review." });
  assert.equal(opened.outcome, "opened");
  assert.equal(github.commits.length, 1);
  assert.equal(github.pullRequests.length, 1);
  assert.equal(github.pullRequests[0].title, "Freeze: add puzzle one");
  assert.match(github.pullRequests[0].body, /## Additional context/);
  assert.match(github.commits[0].message, /Ship after review/);

  const updated = await service.submit({ freeze: freeze({ title: "revised" }), additionalContext: "Corrected source wording." });
  assert.equal(updated.outcome, "updated");
  assert.equal(github.appended.length, 1);
  assert.equal(repository.records.length, 1);

  const unchanged = await service.submit({ freeze: freeze({ title: "revised" }) });
  assert.equal(unchanged.outcome, "unchanged");
  assert.equal(github.appended.length, 1);

  github.merged = true;
  const contentDocuments = pendingContentDocuments();
  await service.reconcile({ contentDocuments });
  assert.equal(contentDocuments.cues.length, 1);
  assert.deepEqual(contentDocuments.cues[0], {
    kind: "puzzle",
    id: "one",
    actor: { subject: "git-seed" },
    cued: true
  });
  assert.equal(repository.records[0].status, "merged");
  assert.equal(repository.records[0].reconciledAt, "now");

  const reopened = await service.submit({ freeze: freeze({ id: "two" }) });
  assert.equal(reopened.outcome, "opened");
  assert.equal(repository.records.length, 2);
  assert.equal(github.pullRequests.length, 2);
}
