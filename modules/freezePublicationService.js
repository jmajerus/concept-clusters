import { GIT_SEED_ACTOR, isPendingFreezeCue } from "./contentFreezePlan.js";

function stablePlan(plan = {}) {
  const kinds = ["puzzles", "catalogues", "categories"];
  return Object.fromEntries(kinds.map(kind => [kind, {
    add: [...(plan[kind]?.add || [])].sort(),
    update: [...(plan[kind]?.update || [])].sort(),
    remove: [...(plan[kind]?.remove || [])].sort()
  }]));
}

async function hash(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${[...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

function changesFor(plan = {}) {
  const verbs = [["add", "Add"], ["update", "Update"], ["remove", "Remove"]];
  const parts = [];
  for (const [kind, label] of [["puzzles", "puzzle"], ["catalogues", "catalogue"], ["categories", "category"]]) {
    for (const [action, verb] of verbs) {
      const ids = plan[kind]?.[action] || [];
      for (const id of ids) parts.push(`${verb} ${label} ${id}`);
    }
  }
  return parts;
}

export function freezeCommitSummary(plan) {
  const changes = changesFor(plan);
  if (changes.length === 1) return `Freeze: ${changes[0].toLowerCase()}`;
  return `Freeze: ${changes.length} authoring changes`;
}

export function freezePullRequestBody({ plan, affectedPaths = [], additionalContext = "" }) {
  const lines = ["## Frozen authoring changes", ""];
  for (const change of changesFor(plan)) lines.push(`- ${change}`);
  if (affectedPaths.length) {
    lines.push("", "## Generated files", "");
    for (const path of affectedPaths) lines.push(`- \`${path}\``);
  }
  if (additionalContext.trim()) {
    lines.push("", "## Additional context", "", additionalContext.trim());
  }
  return lines.join("\n");
}

function commitMessage(summary, additionalContext) {
  return additionalContext.trim() ? `${summary}\n\n${additionalContext.trim()}` : summary;
}

const CONTENT_KINDS = [
  ["puzzles", "puzzle"],
  ["catalogues", "catalogue"],
  ["categories", "category"]
];

async function reconcileMergedCues({ repository, contentDocuments }) {
  if (!contentDocuments) return [];
  const reconciled = [];
  for (const request of await repository.findUnreconciledMerges()) {
    for (const [planKind, contentKind] of CONTENT_KINDS) {
      const change = request.plan?.[planKind] || {};
      for (const id of [...(change.add || []), ...(change.update || [])]) {
        const current = await contentDocuments.getPublished({ kind: contentKind, id });
        // Re-publishing or withdrawing clears the cue.  Only the exact
        // snapshot still awaiting this merged PR becomes production-seeded.
        if (isPendingFreezeCue(current)) {
          await contentDocuments.setFreezeCue({
            kind: contentKind,
            id,
            actor: { subject: GIT_SEED_ACTOR },
            cued: true
          });
        }
      }
    }
    await repository.markReconciled(request.id);
    reconciled.push(request.id);
  }
  return reconciled;
}

export function createFreezePublicationService({ github, repository }) {
  if (!github || !repository) throw new Error("Freeze publication dependencies are required");

  return {
    async reconcile({ contentDocuments } = {}) {
      const active = await repository.findActive();
      if (active?.status === "pull-request-open") {
        const live = await github.getPullRequest(active.githubPrNumber);
        if (live.merged || live.state !== "open") {
          await repository.reconcile({ id: active.id, pullRequest: live });
        }
      }
      return reconcileMergedCues({ repository, contentDocuments });
    },

    async submit({ freeze, additionalContext = "", contentDocuments } = {}) {
      await this.reconcile({ contentDocuments });
      const plan = stablePlan(freeze.plan);
      const changes = Array.isArray(freeze.changes) ? freeze.changes : [];
      if (!changes.length) throw new Error("Freeze did not produce any Git changes");
      const planHash = await hash({ plan, changes });
      const summary = freezeCommitSummary(plan);
      const context = String(additionalContext || "").trim();
      let active = await repository.findActive();
      if (active) {
        if (active.status === "requested") {
          const pullRequest = await github.findPullRequest(active.githubBranch);
          if (!pullRequest) return { request: active, outcome: "pending" };
          await repository.recordPullRequest({
            id: active.id,
            commitSha: (await github.getBranchHead(active.githubBranch)).commitSha,
            pullRequest
          });
          return this.submit({ freeze, additionalContext: context, contentDocuments });
        }
        const live = await github.getPullRequest(active.githubPrNumber);
        if (!live.merged && live.state === "open") {
          if (active.planHash === planHash) return { request: active, outcome: "unchanged" };
          const head = await github.getBranchHead(active.githubBranch);
          const commitSha = await github.appendCommit({
            baseCommitSha: head.commitSha,
            baseTreeSha: head.treeSha,
            branch: active.githubBranch,
            message: commitMessage(summary, context),
            changes
          });
          const request = await repository.recordAmendedCommit({
            id: active.id, planHash, plan, summary, additionalContext: context, commitSha
          });
          return { request, outcome: "updated" };
        }
        await repository.reconcile({ id: active.id, pullRequest: live });
      }

      const request = await repository.reserve({
        planHash,
        plan,
        summary,
        additionalContext: context
      });
      // A concurrent Freeze may have opened the one allowed PR while this
      // request was being prepared. Re-enter through its normal update path.
      if (!request.reserved) {
        if (request.status === "pull-request-open") {
          return this.submit({ freeze, additionalContext: context, contentDocuments });
        }
        return { request, outcome: "pending" };
      }
      try {
        const base = await github.getBranchHead();
        const commitSha = await github.createCommit({
          baseCommitSha: base.commitSha,
          baseTreeSha: base.treeSha,
          branch: request.githubBranch,
          message: commitMessage(summary, context),
          changes
        });
        const pullRequest = await github.createPullRequest({
          branch: request.githubBranch,
          title: summary,
          body: freezePullRequestBody({
            plan,
            affectedPaths: freeze.affectedPaths || [],
            additionalContext: context
          })
        });
        return {
          request: await repository.recordPullRequest({
            id: request.id, commitSha, pullRequest
          }),
          outcome: "opened"
        };
      } catch (error) {
        await repository.markFailed({
          id: request.id,
          message: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    }
  };
}

export default createFreezePublicationService;
