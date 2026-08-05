import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import { D1PublicationRepository } from "../../modules/d1PublicationRepository.js";
import {
  createGitHubPublicationService,
  GitHubRepositoryClient
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

  it("submits directly without a preview or token, opens one PR, and reconciles merge", async () => {
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
      replace: true,
      actor
    });
    expect(preview.valid).toBe(true);
    expect(preview.preview.approvalToken).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(preview.preview.action).toBe("replace");
    expect(preview.preview.affectedPaths).toHaveLength(2);

    // The base commit moving between preview and submit no longer matters --
    // there's nothing to go stale. submit publishes whatever's current.
    github.base.commitSha = "f".repeat(40);
    const submitted = await service.submit({
      draftId: "publication-fixture",
      replace: true,
      actor
    });
    expect(submitted.status).toBe("pull-request-open");
    expect(submitted.githubPrNumber).toBe(42);
    expect(github.commits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);

    // Repeating an identical call -- same draft content, same base commit --
    // still returns the existing publication request rather than opening a
    // duplicate, since the plan's content hash is computed the same way
    // every time regardless of the caller supplying one back.
    const repeated = await service.submit({
      draftId: "publication-fixture",
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

  it("publishes the first puzzle and new category metadata as one plan", async () => {
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
    // Mirrors the real file's actual shape -- CATEGORIES followed by an
    // unrelated DOMAINS export, then GENERATED_SUBCATEGORY_IDS -- because a
    // fixture that skipped straight from CATEGORIES to
    // GENERATED_SUBCATEGORY_IDS let registerCategorySource's boundary
    // marker silently drift onto DOMAINS's closing brace in production
    // once DOMAINS was inserted between them, splicing new categories into
    // the wrong export undetected. See publicationArtifacts.js.
    github.files.set("puzzles/categories.js", `
export const CATEGORIES = {
  "Science": {}
};

export const DOMAINS = {
  "sciences-mathematics": { title: "Sciences & Mathematics", info: {} }
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
      newCategory,
      actor
    });
    expect(preview.valid).toBe(true);
    expect(preview.preview.newCategory).toBe("Knowledge Studies");
    expect(preview.preview.affectedPaths).toContain("puzzles/categories.js");
    expect(preview.preview.affectedPaths).toHaveLength(4);

    // submit is driven entirely by the options actually passed to it, not
    // by what an earlier preview happened to include: omitting newCategory
    // here publishes the puzzle without registering the category, rather
    // than failing because it disagrees with the preview above.
    const withoutCategory = await service.submit({
      draftId: "first-taxonomy-puzzle",
      actor
    });
    expect(withoutCategory.status).toBe("pull-request-open");
    expect(github.commits).toHaveLength(1);
    const uncategorizedChanges = github.commits[0].changes as Array<{
      relativePath: string;
    }>;
    expect(uncategorizedChanges.some(change =>
      change.relativePath === "puzzles/categories.js"
    )).toBe(false);

    const submitted = await service.submit({
      draftId: "first-taxonomy-puzzle",
      newCategory,
      actor
    });
    expect(submitted.status).toBe("pull-request-open");
    expect(github.commits).toHaveLength(2);
    const changes = github.commits[1].changes as Array<{
      relativePath: string;
      content: string;
    }>;
    const categoryChange = changes.find(change =>
      change.relativePath === "puzzles/categories.js"
    );
    expect(categoryChange?.content).toContain('"Knowledge Studies"');
    expect(categoryChange?.content).toContain('"ways-of-knowing"');
    // Must land inside CATEGORIES, not spliced past it into DOMAINS or any
    // later export -- a substring check alone can't tell those apart.
    const content = categoryChange?.content ?? "";
    const categoriesStart = content.indexOf("export const CATEGORIES");
    const categoriesEnd = content.indexOf("\n};\n", categoriesStart);
    const domainsStart = content.indexOf("export const DOMAINS");
    const entryIndex = content.indexOf('"Knowledge Studies"');
    expect(entryIndex).toBeGreaterThan(categoriesStart);
    expect(entryIndex).toBeLessThan(categoriesEnd);
    expect(entryIndex).toBeLessThan(domainsStart);
  });
});
