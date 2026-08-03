import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import { D1PublicationRepository } from "../../modules/d1PublicationRepository.js";
import {
  createGitHubPublicationService,
  GitHubRepositoryClient,
  PublicationConflictError
} from "../../modules/githubPublicationService.js";
import { createHostedAuthoringContentService } from "../../modules/hostedAuthoringContentService.js";

class FakeGitHub {
  baseBranch = "main";
  base = { commitSha: "a".repeat(40), treeSha: "b".repeat(40) };
  branches = new Map<string, string>();
  commits: Array<Record<string, unknown>> = [];
  pullRequests: Array<Record<string, unknown>> = [];
  files = new Map<string, string>();

  async getBranchHead() { return { ...this.base }; }
  async readFile(path: string) { return this.files.get(path) ?? null; }
  async getOptionalBranchHead(branch: string) {
    const commitSha = this.branches.get(branch);
    return commitSha ? { commitSha, treeSha: "c".repeat(40) } : null;
  }
  async createCommit(input: Record<string, unknown>) {
    const commitSha = "d".repeat(40);
    this.commits.push(input);
    this.branches.set(String(input.branch), commitSha);
    return commitSha;
  }
  async createPullRequest(input: Record<string, unknown>) {
    this.pullRequests.push(input);
    return {
      number: 42,
      url: "https://github.com/jmajerus/concept-clusters/pull/42",
      state: "open",
      merged: false
    };
  }
  async findPullRequest() { return null; }
  async getPullRequest() {
    return {
      number: 42,
      url: "https://github.com/jmajerus/concept-clusters/pull/42",
      state: "closed",
      merged: true,
      mergeCommitSha: "e".repeat(40)
    };
  }
}

describe("GitHub publication service", () => {
  it("invokes the supplied fetch function without changing its receiver", async () => {
    let receiver: unknown = "not-called";
    const fetchImpl = function(this: unknown) {
      receiver = this;
      return Promise.resolve(Response.json({
        object: { sha: "a".repeat(40) }
      }));
    };
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    await github.request("/fixture");
    expect(receiver).toBeUndefined();
  });

  it("binds approval to exact bytes and base commit, opens one PR, and reconciles merge", async () => {
    const draftRepository = new D1DraftRepository(env.AUTHORING_DB);
    const publicationRepository = new D1PublicationRepository(env.AUTHORING_DB);
    const contentService = createHostedAuthoringContentService();
    const github = new FakeGitHub();
    const service = createGitHubPublicationService({
      contentService,
      draftRepository,
      publicationRepository,
      github
    });
    const actor = { subject: "publication-author" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const document = { ...source, title: "Energy Flow publication fixture" };
    await draftRepository.create({
      draftId: "publication-fixture",
      document,
      actor
    });

    const preview = await service.preview({
      draftId: "publication-fixture",
      revision: 1,
      replace: true,
      actor
    });
    expect(preview.valid).toBe(true);
    expect(preview.preview.approvalToken).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(preview.preview.action).toBe("replace");
    expect(preview.preview.affectedPaths).toHaveLength(2);

    github.base.commitSha = "f".repeat(40);
    await expect(service.submit({
      draftId: "publication-fixture",
      revision: 1,
      approvalToken: preview.preview.approvalToken,
      confirm: true,
      replace: true,
      actor
    })).rejects.toBeInstanceOf(PublicationConflictError);
    expect(github.commits).toHaveLength(0);

    github.base.commitSha = "a".repeat(40);
    const submitted = await service.submit({
      draftId: "publication-fixture",
      revision: 1,
      approvalToken: preview.preview.approvalToken,
      confirm: true,
      replace: true,
      actor
    });
    expect(submitted.status).toBe("pull-request-open");
    expect(submitted.githubPrNumber).toBe(42);
    expect(github.commits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);

    const repeated = await service.submit({
      draftId: "publication-fixture",
      revision: 1,
      approvalToken: preview.preview.approvalToken,
      confirm: true,
      replace: true,
      actor
    });
    expect(repeated.id).toBe(submitted.id);
    expect(github.commits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);

    const merged = await service.status({ requestId: submitted.id, actor });
    expect(merged.status).toBe("merged");
    expect(merged.githubCommitSha).toBe("e".repeat(40));
    const draft = await draftRepository.get({
      draftId: "publication-fixture",
      actor
    });
    expect(draft.status).toBe("published");
  });

  it("publishes the first puzzle and new category metadata as one approved plan", async () => {
    const draftRepository = new D1DraftRepository(env.AUTHORING_DB);
    const publicationRepository = new D1PublicationRepository(env.AUTHORING_DB);
    const contentService = createHostedAuthoringContentService();
    const github = new FakeGitHub();
    github.files.set("puzzles/index.js", `
import energyFlow from "./science/energy-flow.js";

// Cross-disciplinary membership
export const PUZZLES = [
  energyFlow
];
`);
    github.files.set("puzzles/categories.js", `
export const CATEGORIES = {
  "Science": {}
};

export const GENERATED_SUBCATEGORY_IDS = Object.freeze({ all: "all", other: "other" });
`);
    const service = createGitHubPublicationService({
      contentService,
      draftRepository,
      publicationRepository,
      github
    });
    const actor = { subject: "category-author" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const document = {
      ...source,
      "@id": "urn:concept-clusters:puzzle:first-taxonomy-puzzle",
      id: "first-taxonomy-puzzle",
      title: "First taxonomy puzzle",
      category: "Knowledge Studies"
    };
    const newCategory = {
      name: "Knowledge Studies",
      info: { text: "How knowledge is built, tested, and shared." },
      subcategories: {
        "ways-of-knowing": { title: "Ways of Knowing" }
      }
    };
    await draftRepository.create({
      draftId: "first-taxonomy-puzzle",
      document,
      actor
    });

    const preview = await service.preview({
      draftId: "first-taxonomy-puzzle",
      revision: 1,
      newCategory,
      actor
    });
    expect(preview.valid).toBe(true);
    expect(preview.preview.newCategory).toBe("Knowledge Studies");
    expect(preview.preview.affectedPaths).toContain("puzzles/categories.js");
    expect(preview.preview.affectedPaths).toHaveLength(4);

    await expect(service.submit({
      draftId: "first-taxonomy-puzzle",
      revision: 1,
      approvalToken: preview.preview.approvalToken,
      confirm: true,
      actor
    })).rejects.toBeInstanceOf(PublicationConflictError);
    expect(github.commits).toHaveLength(0);

    const submitted = await service.submit({
      draftId: "first-taxonomy-puzzle",
      revision: 1,
      approvalToken: preview.preview.approvalToken,
      confirm: true,
      newCategory,
      actor
    });
    expect(submitted.status).toBe("pull-request-open");
    const changes = github.commits[0].changes as Array<{
      relativePath: string;
      content: string;
    }>;
    const categoryChange = changes.find(change =>
      change.relativePath === "puzzles/categories.js"
    );
    expect(categoryChange?.content).toContain('"Knowledge Studies"');
    expect(categoryChange?.content).toContain('"ways-of-knowing"');
  });
});
