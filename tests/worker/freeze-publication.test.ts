import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { D1FreezePublicationRepository } from "../../modules/d1FreezePublicationRepository.js";

describe("D1 freeze publication requests", () => {
  it("keeps one active release request and records a merged reconciliation", async () => {
    const repository = new D1FreezePublicationRepository(env.AUTHORING_DB);
    const plan = {
      puzzles: { add: ["freeze-worker-fixture"], update: [], remove: [] },
      catalogues: { add: [], update: [], remove: [] },
      categories: { add: [], update: [], remove: [] }
    };
    const reserved = await repository.reserve({
      planHash: "sha256:freeze-worker-fixture",
      plan,
      summary: "Freeze: add puzzle freeze-worker-fixture"
    });
    expect(reserved.reserved).toBe(true);
    expect(reserved.status).toBe("requested");
    expect(reserved.plan).toEqual(plan);

    const active = await repository.reserve({
      planHash: "sha256:ignored-while-active",
      plan,
      summary: "Ignored while active"
    });
    expect(active.reserved).toBe(false);
    expect(active.id).toBe(reserved.id);

    const opened = await repository.recordPullRequest({
      id: reserved.id,
      commitSha: "freeze-commit",
      pullRequest: {
        number: 71,
        url: "https://example.test/pull/71"
      }
    });
    expect(opened.status).toBe("pull-request-open");

    await repository.reconcile({
      id: reserved.id,
      pullRequest: { merged: true, state: "closed", headCommitSha: "merged-head" }
    });
    const pending = await repository.findUnreconciledMerges();
    expect(pending.map((request: { id: string }) => request.id)).toEqual([reserved.id]);
    const reconciled = await repository.markReconciled(reserved.id);
    expect(reconciled.reconciledAt).not.toBeNull();
  });
});
