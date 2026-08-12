import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import { D1PublicationRepository } from "../../modules/d1PublicationRepository.js";
import {
  createGitHubPublicationService,
  GitHubRepositoryClient
} from "../../modules/githubPublicationService.js";
import { createHostedAuthoringContentService } from "../../modules/hostedAuthoringContentService.js";

type FakePullRequest = {
  number: number;
  url: string;
  state: string;
  merged: boolean;
  mergeCommitSha: string | null;
};

class FakeGitHub {
  baseBranch = "main";
  base = { commitSha: "a".repeat(40), treeSha: "b".repeat(40) };
  branches = new Map<string, string>();
  commits: Array<Record<string, unknown>> = [];
  // Parallel to commits, but for updateCommit (amend) calls -- kept
  // separate so a test can assert "exactly one create, exactly one
  // amend" without inspecting call shape.
  updateCommits: Array<Record<string, unknown>> = [];
  pullRequests: Array<Record<string, unknown>> = [];
  comments: Array<{ number: number; body: string }> = [];
  files = new Map<string, string>();
  // Keyed by PR number, set directly by a test rather than mutated
  // through the fake's own API -- there's no create_review_comment call
  // in this service to drive it through, so tests seed what a reviewer
  // (e.g. Copilot) would already have left.
  reviewCommentsByPr = new Map<number, Array<Record<string, unknown>>>();
  reviewsByPr = new Map<number, Array<Record<string, unknown>>>();

  commitCounter = 0;
  nextPrNumber = 42;
  pullRequestsByNumber = new Map<number, FakePullRequest>();
  pullRequestNumberByBranch = new Map<string, number>();

  freshSha() {
    this.commitCounter += 1;
    return `d${String(this.commitCounter).padStart(39, "0")}`;
  }

  async getBranchHead() { return { ...this.base }; }
  async readFile(path: string) { return this.files.get(path) ?? null; }
  async getOptionalBranchHead(branch: string) {
    const commitSha = this.branches.get(branch);
    return commitSha ? { commitSha, treeSha: "c".repeat(40) } : null;
  }
  async createCommit(input: Record<string, unknown>) {
    const commitSha = this.freshSha();
    this.commits.push(input);
    this.branches.set(String(input.branch), commitSha);
    return commitSha;
  }
  async updateCommit(input: Record<string, unknown>) {
    const commitSha = this.freshSha();
    this.updateCommits.push(input);
    this.branches.set(String(input.branch), commitSha);
    return commitSha;
  }
  async createPullRequest(input: Record<string, unknown>) {
    const number = this.nextPrNumber;
    this.nextPrNumber += 1;
    const record: FakePullRequest = {
      number,
      url: `https://github.com/jmajerus/concept-clusters/pull/${number}`,
      state: "open",
      merged: false,
      mergeCommitSha: null
    };
    this.pullRequestsByNumber.set(number, record);
    this.pullRequestNumberByBranch.set(String(input.branch), number);
    this.pullRequests.push(input);
    return { number: record.number, url: record.url, state: record.state, merged: record.merged };
  }
  async findPullRequest(branch: string) {
    const number = this.pullRequestNumberByBranch.get(branch);
    if (number === undefined) return null;
    const record = this.pullRequestsByNumber.get(number);
    if (!record) return null;
    return { number: record.number, url: record.url, state: record.state, merged: record.merged };
  }
  async getPullRequest(number: number) {
    const record = this.pullRequestsByNumber.get(number);
    if (!record) throw new Error(`FakeGitHub: no tracked pull request #${number}`);
    return {
      number: record.number,
      url: record.url,
      state: record.state,
      merged: record.merged,
      mergeCommitSha: record.mergeCommitSha
    };
  }
  async commentOnPullRequest(number: number, body: string) {
    this.comments.push({ number, body });
  }
  async listPullRequestComments(number: number) {
    return this.reviewCommentsByPr.get(number) ?? [];
  }
  async listPullRequestReviews(number: number) {
    return this.reviewsByPr.get(number) ?? [];
  }
  // Simulates something happening to the pull request on GitHub's side
  // that nobody has polled get_publication_status for yet -- a human
  // merging or closing it directly.
  setPullRequestState(
    number: number,
    { state, merged, mergeCommitSha = null }: { state: string; merged: boolean; mergeCommitSha?: string | null }
  ) {
    const record = this.pullRequestsByNumber.get(number);
    if (!record) throw new Error(`FakeGitHub: no tracked pull request #${number}`);
    record.state = state;
    record.merged = merged;
    record.mergeCommitSha = mergeCommitSha;
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

    // FakeGitHub tracks real per-PR state now (needed for the amend
    // feature below), so a merge has to be simulated explicitly rather
    // than relying on an old hardcoded always-merged default.
    github.setPullRequestState(submitted.githubPrNumber, {
      state: "closed",
      merged: true,
      mergeCommitSha: "e".repeat(40)
    });
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
    expect(preview.preview.affectedPaths).not.toContain("puzzles/index.js");
    expect(preview.preview.affectedPaths).toHaveLength(3);

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

    // The first submission's pull request is still open, so this second
    // call -- different options, same draftId -- amends that same PR
    // rather than opening a second one: still the puzzle to review, not
    // two competing pull requests for it.
    const submitted = await service.submit({
      draftId: "first-taxonomy-puzzle",
      newCategory,
      actor
    });
    expect(submitted.status).toBe("pull-request-open");
    expect(submitted.githubPrNumber).toBe(withoutCategory.githubPrNumber);
    expect(github.commits).toHaveLength(1);
    expect(github.updateCommits).toHaveLength(1);
    const changes = github.updateCommits[0].changes as Array<{
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

  it("amends an open pull request on resubmission instead of opening a new one", async () => {
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
    const actor = { subject: "amend-author" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const draftId = "amend-fixture";
    await draftRepository.create({
      draftId,
      document: { ...source, title: "Amend fixture, first draft" },
      actor
    });

    const opened = await service.submit({ draftId, replace: true, actor });
    expect(opened.status).toBe("pull-request-open");
    expect(opened.submissionOutcome).toBe("opened");
    expect(github.commits).toHaveLength(1);
    expect(github.updateCommits).toHaveLength(0);
    expect(github.pullRequests).toHaveLength(1);

    // Edit the draft, then resubmit -- the PR from `opened` is still
    // open, so this should amend it: same request id, same PR number,
    // one commit pushed onto the existing branch, no second PR opened.
    await draftRepository.save({
      draftId,
      document: { ...source, title: "Amend fixture, revised" },
      actor
    });
    const amended = await service.submit({ draftId, replace: true, actor });
    expect(amended.id).toBe(opened.id);
    expect(amended.githubPrNumber).toBe(opened.githubPrNumber);
    expect(amended.submissionOutcome).toBe("amended");
    expect(github.commits).toHaveLength(1);
    expect(github.updateCommits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);
    const amendedChanges = github.updateCommits[0].changes as Array<{
      relativePath: string;
      content: string;
    }>;
    expect(amendedChanges.some(change =>
      change.content.includes("Amend fixture, revised")
    )).toBe(true);
    // An amend also posts a PR comment -- the force-push itself is
    // already a native GitHub timeline event, but subtle enough that a
    // comment is what actually makes a resubmission easy to notice.
    expect(github.comments).toHaveLength(1);
    expect(github.comments[0].number).toBe(opened.githubPrNumber);
    expect(github.comments[0].body).toMatch(/amended/i);

    // Resubmitting again with no further edit is a true no-op: nothing
    // new pushed to GitHub at all, and no comment either.
    const unchanged = await service.submit({ draftId, replace: true, actor });
    expect(unchanged.id).toBe(opened.id);
    expect(unchanged.submissionOutcome).toBe("unchanged");
    expect(github.commits).toHaveLength(1);
    expect(github.updateCommits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);
    expect(github.comments).toHaveLength(1);

    // Simulate a human merging the PR directly on GitHub without anyone
    // calling get_publication_status since -- D1 still thinks it's open.
    github.setPullRequestState(opened.githubPrNumber, {
      state: "closed",
      merged: true,
      mergeCommitSha: "e".repeat(40)
    });
    await draftRepository.save({
      draftId,
      document: { ...source, title: "Amend fixture, after merge" },
      actor
    });
    const reopened = await service.submit({ draftId, replace: true, actor });
    expect(reopened.id).not.toBe(opened.id);
    expect(reopened.githubPrNumber).not.toBe(opened.githubPrNumber);
    expect(reopened.submissionOutcome).toBe("opened");
    expect(github.commits).toHaveLength(2);
    expect(github.updateCommits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(2);
    // A brand-new PR isn't an amend, so no second comment -- still just
    // the one from the earlier amend.
    expect(github.comments).toHaveLength(1);
  });

  it("fetches a pull request's review comments and review summaries, or reports there's no PR yet", async () => {
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
    const actor = { subject: "review-feedback-author" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const draftId = "review-feedback-fixture";
    await draftRepository.create({
      draftId,
      document: { ...source, title: "Review feedback fixture" },
      actor
    });

    // Before a pull request exists at all: no GitHub calls, no error --
    // just a plain "nothing to fetch" result the caller can branch on.
    // reserve() directly, not submit(), so this row stays PR-less;
    // matches submit()'s own call shape (see its reserve() call above
    // the pull-request-open early-return it feeds into).
    const draft = await draftRepository.get({ draftId, actor });
    const reserved = await publicationRepository.reserve({
      draftId,
      contentHash: draft.contentHash,
      approvalToken: "reserve-only-fixture-token",
      baseCommitSha: github.base.commitSha,
      puzzleId: "energy-flow",
      actor
    });
    const beforePr = await service.reviewFeedback({ requestId: reserved.id, actor });
    expect(beforePr.hasPullRequest).toBe(false);
    expect(beforePr.reviews).toEqual([]);
    expect(beforePr.comments).toEqual([]);

    const opened = await service.submit({ draftId, replace: true, actor });
    expect(opened.submissionOutcome).toBe("opened");

    // Seed what a reviewer (e.g. Copilot) would have already left on
    // the real pull request -- this fake has no create-comment call of
    // its own to drive it through, since reviewFeedback only ever reads.
    github.reviewsByPr.set(opened.githubPrNumber, [
      { id: 1, author: "copilot-pull-request-reviewer", state: "COMMENTED", body: "Overall looks fine.", submittedAt: "2026-08-12T00:00:00Z" }
    ]);
    github.reviewCommentsByPr.set(opened.githubPrNumber, [
      {
        id: 2,
        author: "copilot-pull-request-reviewer",
        path: "puzzles/science/energy-flow.js",
        line: 12,
        body: "Consider a more specific fact here.",
        createdAt: "2026-08-12T00:00:05Z"
      }
    ]);

    const feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.hasPullRequest).toBe(true);
    expect(feedback.pullRequestNumber).toBe(opened.githubPrNumber);
    expect(feedback.reviews).toHaveLength(1);
    expect(feedback.reviews[0].body).toBe("Overall looks fine.");
    expect(feedback.comments).toHaveLength(1);
    expect(feedback.comments[0].path).toBe("puzzles/science/energy-flow.js");
  });

  it("creates a brand-new catalogue as its own pull request, with no draft or D1 involved", async () => {
    const draftRepository = new D1DraftRepository(env.AUTHORING_DB);
    const publicationRepository = new D1PublicationRepository(env.AUTHORING_DB);
    const contentService = createHostedAuthoringContentService();
    const github = new FakeGitHub();
    github.files.set("catalogues/index.js", `import gettingStarted from "./getting-started.js";

export const CATALOGUES = [
  gettingStarted
];

export default CATALOGUES;
`);
    // Membership is resolved from the GitHub base branch, not the Worker
    // bundle -- hand-authored puzzles may exist only in puzzles/index.js.
    github.files.set("puzzles/index.js", `import energyFlow from "./science/energy-flow.js";

export const PUZZLES = [
  energyFlow
];
`);
    const service = createGitHubPublicationService({
      contentService,
      draftRepository,
      publicationRepository,
      github
    });
    const actor = { subject: "catalogue-author" };
    const raw = {
      id: "test-fixture-catalogue",
      title: "Test Fixture Catalogue",
      info: { text: "A catalogue built entirely from test fixture puzzles." },
      entries: [
        { id: "energy-flow", reason: "Familiar clusters and bridges make a clean opener." }
      ]
    };

    const preview = await service.previewCatalogueCreation(raw);
    expect(preview.valid).toBe(true);
    expect(preview.preview.catalogueId).toBe("test-fixture-catalogue");
    expect(preview.preview.affectedPaths).toEqual([
      "catalogues/test-fixture-catalogue.js",
      "catalogues/index.js"
    ]);
    expect(github.commits).toHaveLength(0);

    const created = await service.createCatalogue(raw, { actor });
    expect(created.catalogueId).toBe("test-fixture-catalogue");
    expect(created.githubPrNumber).toBe(42);
    expect(github.commits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);

    const changes = github.commits[0].changes as Array<{
      relativePath: string;
      content: string;
    }>;
    const catalogueFile = changes.find(change =>
      change.relativePath === "catalogues/test-fixture-catalogue.js"
    );
    expect(catalogueFile?.content).toContain('id: "test-fixture-catalogue"');
    expect(catalogueFile?.content).toContain('"energy-flow"');
    const indexFile = changes.find(change => change.relativePath === "catalogues/index.js");
    expect(indexFile?.content).toContain(
      'import testFixtureCatalogue from "./test-fixture-catalogue.js";'
    );
    expect(indexFile?.content).toContain("testFixtureCatalogue\n];");
  });

  it("accepts catalogue entries present on GitHub even when the Worker bundle lags", async () => {
    const draftRepository = new D1DraftRepository(env.AUTHORING_DB);
    const publicationRepository = new D1PublicationRepository(env.AUTHORING_DB);
    const contentService = createHostedAuthoringContentService();
    const githubOnlyId = "github-only-fixture-puzzle";
    expect(contentService.puzzles.some(puzzle => puzzle.id === githubOnlyId)).toBe(false);

    const github = new FakeGitHub();
    github.files.set("catalogues/index.js", `import gettingStarted from "./getting-started.js";

export const CATALOGUES = [
  gettingStarted
];

export default CATALOGUES;
`);
    github.files.set(`content/puzzles/${githubOnlyId}.ccpuzzle.jsonld`, `${JSON.stringify({
      "@context": "https://concept-clusters.org/context/v1",
      "@type": "Puzzle",
      id: githubOnlyId,
      title: "GitHub Only Fixture"
    }, null, 2)}\n`);
    const service = createGitHubPublicationService({
      contentService,
      draftRepository,
      publicationRepository,
      github
    });

    const preview = await service.previewCatalogueCreation({
      id: "lagging-bundle-catalogue",
      title: "Lagging Bundle Catalogue",
      entries: [
        { id: githubOnlyId, reason: "Merged on main before the authoring Worker redeployed." }
      ]
    });
    expect(preview.valid).toBe(true);
    expect(preview.preview.catalogueId).toBe("lagging-bundle-catalogue");
  });

  it("deletes a puzzle's old category path on move, even when the Worker bundle doesn't know it already exists", async () => {
    // Reproduces the actual production failure: a puzzle created moments
    // earlier, then recategorized before any unrelated push happened to
    // redeploy the Worker (the registry-sync commit that registers a new
    // puzzle can't trigger that redeploy itself -- see
    // sync-puzzle-registry.yml). contentService.puzzles genuinely doesn't
    // know this puzzle exists, but GitHub does.
    const draftRepository = new D1DraftRepository(env.AUTHORING_DB);
    const publicationRepository = new D1PublicationRepository(env.AUTHORING_DB);
    const contentService = createHostedAuthoringContentService();
    const staleId = "stale-bundle-fixture-puzzle";
    expect(contentService.puzzles.some(puzzle => puzzle.id === staleId)).toBe(false);

    const github = new FakeGitHub();
    const oldDocument = {
      "@context": "https://concept-clusters.org/context/v1",
      "@id": `urn:concept-clusters:puzzle:${staleId}`,
      "@type": "Puzzle",
      schemaVersion: "1.0",
      id: staleId,
      title: "Stale Bundle Fixture",
      category: "Psychology",
      clusters: [],
      bridges: []
    };
    github.files.set(
      `content/puzzles/${staleId}.ccpuzzle.jsonld`,
      `${JSON.stringify(oldDocument, null, 2)}\n`
    );
    github.files.set(
      `puzzles/psychology/${staleId}.js`,
      "// stands in for a real generated module\n"
    );
    const service = createGitHubPublicationService({
      contentService,
      draftRepository,
      publicationRepository,
      github
    });
    const actor = { subject: "category-editor" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const newDocument = {
      ...source,
      "@id": `urn:concept-clusters:puzzle:${staleId}`,
      id: staleId,
      title: "Stale Bundle Fixture",
      category: "Anthropology"
    };
    await draftRepository.create({ draftId: staleId, document: newDocument, actor });

    // Without explicit replace approval, this must still be rejected as an
    // existing puzzle -- the in-memory snapshot alone previously made this
    // check silently pass, treating a real edit as a brand-new puzzle.
    const withoutReplace = await service.preview({ draftId: staleId, actor });
    expect(withoutReplace.valid).toBe(false);
    expect(withoutReplace.errors.some((error: string) => error.includes("already exists"))).toBe(true);

    const preview = await service.preview({ draftId: staleId, replace: true, actor });
    expect(preview.valid).toBe(true);
    expect(preview.preview.action).toBe("replace");
    expect(preview.preview.affectedPaths).toContain(`puzzles/anthropology/${staleId}.js`);
    expect(preview.preview.affectedPaths).toContain(`puzzles/psychology/${staleId}.js`);

    const submitted = await service.submit({ draftId: staleId, replace: true, actor });
    expect(submitted.status).toBe("pull-request-open");
    const changes = github.commits[0].changes as Array<{
      relativePath: string;
      content: string | null;
    }>;
    const deletion = changes.find(change => change.relativePath === `puzzles/psychology/${staleId}.js`);
    expect(deletion?.content).toBeNull();
    const addition = changes.find(change => change.relativePath === `puzzles/anthropology/${staleId}.js`);
    expect(addition?.content).toBeTruthy();
  });

  it("rejects catalogue creation without writing: reserved id, duplicate id, unknown puzzle", async () => {
    const draftRepository = new D1DraftRepository(env.AUTHORING_DB);
    const publicationRepository = new D1PublicationRepository(env.AUTHORING_DB);
    const contentService = createHostedAuthoringContentService();
    const github = new FakeGitHub();
    github.files.set("catalogues/index.js", `import gettingStarted from "./getting-started.js";

export const CATALOGUES = [
  gettingStarted
];

export default CATALOGUES;
`);
    github.files.set("puzzles/index.js", `import energyFlow from "./science/energy-flow.js";

export const PUZZLES = [
  energyFlow
];
`);
    const service = createGitHubPublicationService({
      contentService,
      draftRepository,
      publicationRepository,
      github
    });

    const reserved = await service.previewCatalogueCreation({
      id: "all",
      title: "All",
      entries: [{ id: "energy-flow" }]
    });
    expect(reserved.valid).toBe(false);
    expect(reserved.errors.some(error => error.includes("reserved"))).toBe(true);

    const duplicate = await service.previewCatalogueCreation({
      id: "getting-started",
      title: "Getting Started Again",
      entries: [{ id: "energy-flow" }]
    });
    expect(duplicate.valid).toBe(false);
    expect(duplicate.errors.some(error => error.includes("already exists"))).toBe(true);

    const unknownPuzzle = await service.previewCatalogueCreation({
      id: "unknown-puzzle-catalogue",
      title: "Unknown Puzzle Catalogue",
      entries: [{ id: "not-a-real-puzzle" }]
    });
    expect(unknownPuzzle.valid).toBe(false);
    expect(unknownPuzzle.errors.some(error => error.includes("not-a-real-puzzle"))).toBe(true);

    expect(github.commits).toHaveLength(0);
    expect(github.pullRequests).toHaveLength(0);
  });
});
