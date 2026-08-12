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
  branch: string;
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
  appendedCommits: Array<Record<string, unknown>> = [];
  pullRequests: Array<Record<string, unknown>> = [];
  comments: Array<{ number: number; body: string }> = [];
  files = new Map<string, string>();
  filesByCommit = new Map<string, Map<string, string | null>>();
  comparisons = new Map<string, Record<string, any>>();
  qualityByCommit = new Map<string, Record<string, any>>();
  fileModes = new Map<string, string>();
  // Keyed by PR number, set directly by a test rather than mutated
  // through the fake's own API -- there's no create_review_comment call
  // in this service to drive it through, so tests seed what a reviewer
  // (e.g. Copilot) would already have left.
  reviewCommentsByPr = new Map<number, Array<Record<string, unknown>>>();
  reviewCommentsById = new Map<number, Record<string, unknown>>();
  reviewsByPr = new Map<number, Array<Record<string, unknown>>>();
  reviewThreadsByPr = new Map<number, Array<Record<string, any>>>();

  commitCounter = 0;
  nextPrNumber = 42;
  pullRequestsByNumber = new Map<number, FakePullRequest>();
  pullRequestNumberByBranch = new Map<string, number>();

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
  async readFile(path: string, commitSha?: string) {
    const committed = commitSha ? this.filesByCommit.get(commitSha) : null;
    if (committed?.has(path)) return committed.get(path) ?? null;
    return this.files.get(path) ?? null;
  }
  async compareCommits(baseCommitSha: string, headCommitSha: string) {
    return this.comparisons.get(`${baseCommitSha}...${headCommitSha}`) ?? {
      status: baseCommitSha === headCommitSha ? "identical" : "ahead",
      aheadBy: baseCommitSha === headCommitSha ? 0 : 1,
      behindBy: 0,
      files: []
    };
  }
  async getCommitQualityState(commitSha: string) {
    return this.qualityByCommit.get(commitSha) ?? {
      state: "success",
      checkRuns: [{
        id: 1,
        name: "test",
        app: "GitHub Actions",
        status: "completed",
        conclusion: "success",
        url: null
      }],
      statuses: []
    };
  }
  async getTreeEntry(path: string) {
    return this.files.has(path)
      ? { path: path.split("/").at(-1), type: "blob", mode: this.fileModes.get(path) ?? "100644" }
      : null;
  }
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
  async appendCommit(input: Record<string, unknown>) {
    const commitSha = this.freshSha();
    this.appendedCommits.push(input);
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
      mergeCommitSha: null,
      branch: String(input.branch)
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
      mergeCommitSha: record.mergeCommitSha,
      headCommitSha: this.branches.get(record.branch) ?? null
    };
  }
  async commentOnPullRequest(number: number, body: string) {
    this.comments.push({ number, body });
  }
  commentReplies: Array<{ number: number; commentId: number; body: string }> = [];
  async replyToPullRequestComment(number: number, commentId: number, body: string) {
    this.commentReplies.push({ number, commentId, body });
  }
  // Tracks calls, not just results, so a test can assert reviewFeedback's
  // no-pull-request-yet branch genuinely short-circuits before ever
  // reaching GitHub, not just that its return value happens to be empty.
  reviewFetchCalls: Array<{ method: string; number: number }> = [];
  async listPullRequestComments(number: number) {
    this.reviewFetchCalls.push({ method: "listPullRequestComments", number });
    return this.reviewCommentsByPr.get(number) ?? [];
  }
  async getPullRequestComment(commentId: number) {
    const comment = this.reviewCommentsById.get(commentId);
    if (!comment) throw new Error(`FakeGitHub: no review comment ${commentId}`);
    return comment;
  }
  async listPullRequestReviews(number: number) {
    this.reviewFetchCalls.push({ method: "listPullRequestReviews", number });
    return this.reviewsByPr.get(number) ?? [];
  }
  async listPullRequestReviewThreads(number: number) {
    this.reviewFetchCalls.push({ method: "listPullRequestReviewThreads", number });
    return this.reviewThreadsByPr.get(number) ?? [];
  }
  // Keyed by PR number, seeded directly by a test -- same reasoning as
  // reviewCommentsByPr/reviewsByPr above: nothing in this service
  // creates a review thread, only reads and resolves ones a real
  // reviewer already left.
  unresolvedThreadIdsByPr = new Map<number, string[]>();
  resolvedThreadIds: string[] = [];
  async listUnresolvedReviewThreadIds(number: number) {
    return this.unresolvedThreadIdsByPr.get(number) ?? [];
  }
  async resolveReviewThread(threadId: string) {
    this.resolvedThreadIds.push(threadId);
    for (const threads of this.reviewThreadsByPr.values()) {
      const thread = threads.find(candidate => candidate.id === threadId);
      if (thread) thread.isResolved = true;
    }
    for (const [prNumber, ids] of this.unresolvedThreadIdsByPr) {
      this.unresolvedThreadIdsByPr.set(prNumber, ids.filter(id => id !== threadId));
    }
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

  it("keeps a body-less review (e.g. a bare APPROVED) rather than dropping it", async () => {
    // Exercises GitHubRepositoryClient.listPullRequestReviews directly,
    // not through FakeGitHub -- the fake just returns whatever a test
    // seeds it with, so a filtering bug in the real mapping logic
    // wouldn't show up there. GitHub itself returns "" (not null) for
    // a review with no summary text, e.g. a bare approval.
    const fetchImpl = () => Promise.resolve(Response.json([
      { id: 1, user: { login: "a-reviewer" }, state: "APPROVED", body: "", submitted_at: "2026-08-12T00:00:00Z" },
      { id: 2, user: { login: "a-reviewer" }, state: "COMMENTED", body: "Looks good overall.", submitted_at: "2026-08-12T00:01:00Z" }
    ]));
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    const reviews = await github.listPullRequestReviews(93);
    expect(reviews).toHaveLength(2);
    expect(reviews[0]).toMatchObject({ state: "APPROVED", body: null });
    expect(reviews[1]).toMatchObject({ state: "COMMENTED", body: "Looks good overall." });
  });

  it("lists only unresolved review thread ids via GraphQL, and resolves one via mutation", async () => {
    // Exercises GitHubRepositoryClient.graphql and the two methods built
    // on it directly -- FakeGitHub's own versions just read/write plain
    // maps a test seeds, so a real query/mutation shape mistake (field
    // name, request body shape) wouldn't show up there.
    let lastRequest: { query: string; variables: Record<string, unknown> } | null = null;
    const fetchImpl: typeof fetch = (_input, init) => {
      const body = JSON.parse(String(init?.body));
      lastRequest = body;
      if (body.query.includes("resolveReviewThread")) {
        return Promise.resolve(Response.json({
          data: { resolveReviewThread: { thread: { id: body.variables.id, isResolved: true } } }
        }));
      }
      return Promise.resolve(Response.json({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage: false },
                nodes: [
                  {
                    id: "thread-open",
                    isResolved: false,
                    isOutdated: false,
                    path: "modules/example.js",
                    line: 12,
                    startLine: 11,
                    diffSide: "RIGHT",
                    startDiffSide: "RIGHT",
                    subjectType: "LINE",
                    comments: {
                      pageInfo: { hasNextPage: false },
                      nodes: [{
                        id: "PRRC_node",
                        fullDatabaseId: 101,
                        body: "Please tighten this.",
                        createdAt: "2026-08-12T00:00:00Z",
                        updatedAt: "2026-08-12T00:00:01Z",
                        author: { login: "reviewer" }
                      }]
                    }
                  },
                  {
                    id: "thread-done",
                    isResolved: true,
                    comments: { pageInfo: { hasNextPage: false }, nodes: [] }
                  }
                ]
              }
            }
          }
        }
      }));
    };
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    const threads = await github.listPullRequestReviewThreads(93);
    expect(threads[0]).toMatchObject({
      id: "thread-open",
      path: "modules/example.js",
      startLine: 11,
      line: 12,
      version: "101:2026-08-12T00:00:01Z"
    });
    const unresolved = await github.listUnresolvedReviewThreadIds(93);
    expect(unresolved).toEqual(["thread-open"]);
    expect(lastRequest!.variables).toMatchObject({
      owner: "jmajerus",
      repo: "concept-clusters",
      number: 93
    });

    await github.resolveReviewThread("thread-open");
    expect(lastRequest!.variables).toEqual({ id: "thread-open" });
  });

  it("surfaces a GraphQL-level error even on an HTTP 200 response", async () => {
    // A GraphQL error is a 200 with an `errors` array in the body, not a
    // non-2xx status -- request()'s own ok check alone would silently
    // treat this as success.
    const fetchImpl = () => Promise.resolve(Response.json({
      errors: [{ message: "Could not resolve to a PullRequest" }]
    }));
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    await expect(github.listUnresolvedReviewThreadIds(999)).rejects.toThrow(
      /Could not resolve to a PullRequest/
    );
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
    expect(github.appendedCommits).toHaveLength(1);
    const changes = github.appendedCommits[0].changes as Array<{
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
    expect(github.appendedCommits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);
    const amendedChanges = github.appendedCommits[0].changes as Array<{
      relativePath: string;
      content: string;
    }>;
    expect(amendedChanges.some(change =>
      change.content.includes("Amend fixture, revised")
    )).toBe(true);
    // The generated update is a normal follow-up commit, visible in the PR
    // timeline without a force-push explanation comment.
    expect(github.comments).toHaveLength(0);

    // Resubmitting again with no further edit is a true no-op: nothing
    // new pushed to GitHub at all, and no comment either.
    const unchanged = await service.submit({ draftId, replace: true, actor });
    expect(unchanged.id).toBe(opened.id);
    expect(unchanged.submissionOutcome).toBe("unchanged");
    expect(github.commits).toHaveLength(1);
    expect(github.appendedCommits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(1);
    expect(github.comments).toHaveLength(0);

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
    expect(github.appendedCommits).toHaveLength(1);
    expect(github.pullRequests).toHaveLength(2);
    expect(github.comments).toHaveLength(0);
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
    expect(github.reviewFetchCalls).toHaveLength(0);

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
        createdAt: "2026-08-12T00:00:05Z",
        updatedAt: "2026-08-12T00:00:05Z"
      }
    ]);
    github.reviewThreadsByPr.set(opened.githubPrNumber, [{
      id: "thread-2",
      isResolved: false,
      isOutdated: false,
      path: "puzzles/science/energy-flow.js",
      line: 12,
      startLine: 12,
      side: "RIGHT",
      startSide: "RIGHT",
      subjectType: "LINE",
      version: "2:2026-08-12T00:00:05Z",
      comments: [{ id: 2, updatedAt: "2026-08-12T00:00:05Z" }]
    }]);

    const feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.hasPullRequest).toBe(true);
    expect(feedback.pullRequestNumber).toBe(opened.githubPrNumber);
    expect(feedback.reviews).toHaveLength(1);
    expect(feedback.reviews[0].body).toBe("Overall looks fine.");
    expect(feedback.comments).toHaveLength(1);
    expect(feedback.comments[0].path).toBe("puzzles/science/energy-flow.js");
    expect(feedback.remainingThreads).toHaveLength(1);
    expect(feedback.comments[0].threadId).toBe("thread-2");
  });

  it("resolves only explicit unchanged thread snapshots and leaves new feedback open", async () => {
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
    const actor = { subject: "resolve-feedback-author" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const draftId = "resolve-feedback-fixture";
    await draftRepository.create({
      draftId,
      document: { ...source, title: "Resolve feedback fixture" },
      actor
    });

    // No pull request yet is a no-op, not an error -- same reserve()
    // -directly, before submit(), pattern as reviewFeedback's own
    // no-PR case above.
    const draft = await draftRepository.get({ draftId, actor });
    const reserved = await publicationRepository.reserve({
      draftId,
      contentHash: draft.contentHash,
      approvalToken: "resolve-reserve-only-fixture-token",
      baseCommitSha: github.base.commitSha,
      puzzleId: "energy-flow",
      actor
    });
    const beforePr = await service.resolveReviewFeedback({
      requestId: reserved.id,
      threads: [],
      actor
    });
    expect(beforePr.hasPullRequest).toBe(false);
    expect(beforePr.resolvedCount).toBe(0);

    const opened = await service.submit({ draftId, replace: true, actor });
    expect(opened.submissionOutcome).toBe("opened");

    github.reviewThreadsByPr.set(opened.githubPrNumber, [
      { id: "thread-1", version: "1:v1", isResolved: false, comments: [] },
      { id: "thread-2", version: "2:v1", isResolved: true, comments: [] },
      { id: "new-thread", version: "3:v1", isResolved: false, comments: [] }
    ]);
    const resolved = await service.resolveReviewFeedback({
      requestId: opened.id,
      threads: [
        { threadId: "thread-1", threadVersion: "1:v1" },
        { threadId: "thread-2", threadVersion: "2:v1" }
      ],
      actor
    });
    expect(resolved.hasPullRequest).toBe(true);
    expect(resolved.pullRequestNumber).toBe(opened.githubPrNumber);
    expect(resolved.resolvedCount).toBe(1);
    expect(resolved.alreadyResolvedCount).toBe(1);
    expect(github.resolvedThreadIds).toEqual(["thread-1"]);
    expect(github.reviewThreadsByPr.get(opened.githubPrNumber)?.find(
      thread => thread.id === "new-thread"
    )?.isResolved).toBe(false);

    const again = await service.resolveReviewFeedback({
      requestId: opened.id,
      threads: [{ threadId: "thread-1", threadVersion: "1:v1" }],
      actor
    });
    expect(again.resolvedCount).toBe(0);
    expect(github.resolvedThreadIds).toHaveLength(1);

    await expect(service.resolveReviewFeedback({
      requestId: opened.id,
      threads: [{ threadId: "new-thread", threadVersion: "stale" }],
      actor
    })).rejects.toThrow(/changed after it was fetched/);
    expect(github.resolvedThreadIds).toHaveLength(1);
  });

  it("replies within a review comment's own thread, to record why it was dismissed", async () => {
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
    const actor = { subject: "reply-feedback-author" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const draftId = "reply-feedback-fixture";
    await draftRepository.create({
      draftId,
      document: { ...source, title: "Reply feedback fixture" },
      actor
    });

    // No pull request yet is a no-op, not an error -- same reserve()
    // -directly pattern as the other no-PR-yet cases above.
    const draft = await draftRepository.get({ draftId, actor });
    const reserved = await publicationRepository.reserve({
      draftId,
      contentHash: draft.contentHash,
      approvalToken: "reply-reserve-only-fixture-token",
      baseCommitSha: github.base.commitSha,
      puzzleId: "energy-flow",
      actor
    });
    const beforePr = await service.replyToReviewComment({
      requestId: reserved.id,
      commentId: 1,
      threadId: "thread-1",
      expectedThreadVersion: "1:v1",
      body: "Not applicable here.",
      actor
    });
    expect(beforePr.hasPullRequest).toBe(false);
    expect(beforePr.replied).toBe(false);
    expect(github.commentReplies).toHaveLength(0);

    const opened = await service.submit({ draftId, replace: true, actor });
    expect(opened.submissionOutcome).toBe("opened");
    github.reviewThreadsByPr.set(opened.githubPrNumber, [{
      id: "thread-42",
      version: "42:v1",
      isResolved: false,
      comments: [{ id: 42 }]
    }]);

    const replied = await service.replyToReviewComment({
      requestId: opened.id,
      commentId: 42,
      threadId: "thread-42",
      expectedThreadVersion: "42:v1",
      body: "This doesn't apply -- the puzzle intentionally omits a subcategory here.",
      actor
    });
    expect(replied.hasPullRequest).toBe(true);
    expect(replied.pullRequestNumber).toBe(opened.githubPrNumber);
    expect(replied.replied).toBe(true);
    expect(github.commentReplies).toEqual([{
      number: opened.githubPrNumber,
      commentId: 42,
      body: "This doesn't apply -- the puzzle intentionally omits a subcategory here."
    }]);
  });

  it("applies one live exact review suggestion as a new commit and fails closed otherwise", async () => {
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
    const actor = { subject: "apply-suggestion-author" };
    const source = contentService.getPuzzleJsonLd("energy-flow");
    const draftId = "apply-suggestion-fixture";
    await draftRepository.create({
      draftId,
      document: { ...source, title: "Apply suggestion fixture" },
      actor
    });

    const draft = await draftRepository.get({ draftId, actor });
    const reserved = await publicationRepository.reserve({
      draftId,
      contentHash: draft.contentHash,
      approvalToken: "apply-suggestion-reserve-only-token",
      baseCommitSha: github.base.commitSha,
      puzzleId: "energy-flow",
      actor
    });
    const beforePr = await service.applyReviewSuggestion({
      requestId: reserved.id,
      commentId: 42,
      threadId: "thread-42",
      expectedThreadVersion: "42:v1",
      expectedUpdatedAt: "2026-08-12T00:00:00Z",
      actor
    });
    expect(beforePr).toMatchObject({ hasPullRequest: false, applied: false });

    const opened = await service.submit({ draftId, replace: true, actor });
    const reviewedCommitSha = opened.githubCommitSha;
    const path = "content/review-suggestion-fixture.txt";
    github.files.set(path, "alpha\r\nold one\r\nold two\r\nomega\r\n");
    github.fileModes.set(path, "100755");
    const comment = {
      id: 42,
      author: "Copilot",
      authorId: 198982749,
      url: "https://github.com/jmajerus/concept-clusters/pull/42#discussion_r42",
      pullRequestNumber: opened.githubPrNumber + 1,
      path,
      line: 3,
      startLine: 2,
      side: "RIGHT",
      startSide: "RIGHT",
      subjectType: "line",
      commitSha: reviewedCommitSha,
      suggestion: "new one\nnew two",
      suggestionCount: 1,
      canApplySuggestion: true,
      updatedAt: "2026-08-12T00:00:00Z"
    };
    github.reviewCommentsById.set(42, comment);
    const thread = {
      id: "thread-42",
      version: "42:2026-08-12T00:00:00Z",
      isResolved: false,
      isOutdated: false,
      path,
      line: 3,
      startLine: 2,
      side: "RIGHT",
      startSide: "RIGHT",
      subjectType: "LINE",
      comments: [{ id: 42, updatedAt: "2026-08-12T00:00:00Z" }]
    };
    github.reviewThreadsByPr.set(opened.githubPrNumber, [thread]);

    await expect(service.applyReviewSuggestion({
      requestId: opened.id,
      commentId: 42,
      expectedUpdatedAt: comment.updatedAt,
      threadId: thread.id,
      expectedThreadVersion: thread.version,
      actor
    })).rejects.toThrow(/does not belong/);
    expect(github.appendedCommits).toHaveLength(0);

    comment.pullRequestNumber = opened.githubPrNumber;
    await expect(service.applyReviewSuggestion({
      requestId: opened.id,
      commentId: 42,
      expectedUpdatedAt: "2026-08-12T00:00:01Z",
      threadId: thread.id,
      expectedThreadVersion: thread.version,
      actor
    })).rejects.toThrow(/changed after it was fetched/);
    expect(github.appendedCommits).toHaveLength(0);

    thread.version = "42:2026-08-12T00:00:01Z";
    await expect(service.applyReviewSuggestion({
      requestId: opened.id,
      commentId: 42,
      expectedUpdatedAt: comment.updatedAt,
      threadId: thread.id,
      expectedThreadVersion: "42:2026-08-12T00:00:00Z",
      actor
    })).rejects.toThrow(/changed after it was fetched/);
    expect(github.appendedCommits).toHaveLength(0);

    thread.version = "42:2026-08-12T00:00:00Z";
    thread.isResolved = true;
    await expect(service.applyReviewSuggestion({
      requestId: opened.id,
      commentId: 42,
      expectedUpdatedAt: comment.updatedAt,
      threadId: thread.id,
      expectedThreadVersion: thread.version,
      actor
    })).rejects.toThrow(/already resolved/);
    thread.isResolved = false;

    // Another accepted suggestion may have advanced the branch. A still-live
    // thread uses GitHub's current anchor and is appended to that newer head.
    const manualCommitSha = "f".repeat(40);
    github.branches.set(opened.githubBranch, manualCommitSha);
    const applied = await service.applyReviewSuggestion({
      requestId: opened.id,
      commentId: 42,
      expectedUpdatedAt: comment.updatedAt,
      threadId: thread.id,
      expectedThreadVersion: thread.version,
      actor
    });
    expect(applied).toMatchObject({
      hasPullRequest: true,
      pullRequestNumber: opened.githubPrNumber,
      commentId: 42,
      path,
      startLine: 2,
      endLine: 3,
      applied: true,
      unchanged: false
    });
    expect(applied.githubCommitSha).not.toBe(reviewedCommitSha);
    expect(github.appendedCommits).toHaveLength(1);
    expect(github.appendedCommits[0]).toMatchObject({
      baseCommitSha: manualCommitSha,
      branch: opened.githubBranch,
      message:
        "Apply review suggestion from @Copilot\n\n" +
        "Review-comment: https://github.com/jmajerus/concept-clusters/pull/42#discussion_r42\n\n" +
        "Co-authored-by: Copilot <198982749+Copilot@users.noreply.github.com>"
    });
    const changes = github.appendedCommits[0].changes as Array<{
      relativePath: string;
      content: string;
    }>;
    expect(changes).toEqual([{
      relativePath: path,
      mode: "100755",
      content: "alpha\r\nnew one\r\nnew two\r\nomega\r\n"
    }]);
    const recorded = await publicationRepository.get({ requestId: opened.id, actor });
    expect(recorded.githubCommitSha).toBe(applied.githubCommitSha);

    // The exact review commit does not mutate the D1 draft hash. Therefore
    // resubmitting that still-unchanged draft remains a no-op and does not
    // force-push away the accepted suggestion.
    const unchanged = await service.submit({ draftId, replace: true, actor });
    expect(unchanged.submissionOutcome).toBe("unchanged");
    expect(unchanged.githubCommitSha).toBe(applied.githubCommitSha);
    expect(github.updateCommits).toHaveLength(0);
  });

  it("imports a human canonical-file commit before appending later draft edits", async () => {
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
    const actor = { subject: "review-sync-author" };
    const draftId = "review-sync-fixture";
    const source = contentService.getPuzzleJsonLd("energy-flow");
    await draftRepository.create({ draftId, document: source, actor });
    const opened = await service.submit({ draftId, replace: true, actor });

    const canonicalPath = "content/puzzles/energy-flow.ccpuzzle.jsonld";
    const humanDocument = { ...source, title: "Title accepted in GitHub" };
    const humanSource = `${JSON.stringify(humanDocument, null, 2)}\n`;
    const humanCommitSha = "7".repeat(40);
    github.branches.set(opened.githubBranch, humanCommitSha);
    github.filesByCommit.set(humanCommitSha, new Map([[canonicalPath, humanSource]]));
    github.comparisons.set(`${opened.githubCommitSha}...${humanCommitSha}`, {
      status: "ahead",
      aheadBy: 1,
      behindBy: 0,
      files: [{ path: canonicalPath, status: "modified", previousPath: null }]
    });

    const feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.draftSyncRequired).toBe(true);
    const synced = await service.syncReviewChangesToDraft({ requestId: opened.id, actor });
    expect(synced.importedCanonicalDocument).toBe(true);
    expect(synced.changedPaths).toEqual([canonicalPath]);
    expect(synced.draft.document.title).toBe("Title accepted in GitHub");

    await draftRepository.save({
      draftId,
      document: { ...humanDocument, description: "A later assistant edit" },
      actor
    });
    const amended = await service.submit({ draftId, replace: true, actor });
    expect(amended.submissionOutcome).toBe("amended");
    expect(github.appendedCommits.at(-1)).toMatchObject({
      baseCommitSha: humanCommitSha,
      branch: opened.githubBranch
    });
  });

  it("blocks resubmission and sync when manual PR changes are not represented by the draft", async () => {
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
    const actor = { subject: "review-sync-conflict-author" };
    const draftId = "review-sync-conflict-fixture";
    const source = contentService.getPuzzleJsonLd("energy-flow");
    await draftRepository.create({ draftId, document: source, actor });
    const opened = await service.submit({ draftId, replace: true, actor });

    const generatedPath = "puzzles/science/energy-flow.js";
    const humanCommitSha = "8".repeat(40);
    github.branches.set(opened.githubBranch, humanCommitSha);
    github.filesByCommit.set(humanCommitSha, new Map([[generatedPath, "unrelated manual rewrite\n"]]));
    github.comparisons.set(`${opened.githubCommitSha}...${humanCommitSha}`, {
      status: "ahead",
      aheadBy: 1,
      behindBy: 0,
      files: [{ path: generatedPath, status: "modified", previousPath: null }]
    });
    await expect(service.syncReviewChangesToDraft({
      requestId: opened.id,
      actor
    })).rejects.toThrow(/does not yet reproduce/);

    await draftRepository.save({
      draftId,
      document: { ...source, title: "Assistant edit after an unsynced human commit" },
      actor
    });
    await expect(service.submit({ draftId, replace: true, actor })).rejects.toThrow(
      /sync_review_changes_to_draft/
    );
    expect(github.appendedCommits).toHaveLength(0);
  });

  it("prepares a snapshot-bound human handoff only after agents account for every thread", async () => {
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
    const actor = { subject: "handoff-author" };
    const draftId = "handoff-fixture";
    await draftRepository.create({
      draftId,
      document: contentService.getPuzzleJsonLd("energy-flow"),
      actor
    });
    const opened = await service.submit({ draftId, replace: true, actor });
    const resolvedThread = {
      id: "thread-resolved",
      version: "10:v1",
      isResolved: true,
      isOutdated: false,
      comments: [{ id: 10 }]
    };
    const decisionThread = {
      id: "thread-decision",
      version: "11:v1",
      isResolved: false,
      isOutdated: false,
      comments: [{ id: 11 }]
    };
    github.reviewThreadsByPr.set(opened.githubPrNumber, [resolvedThread, decisionThread]);
    const common = {
      requestId: opened.id,
      summary: "Automated review is complete; one editorial choice remains.",
      collaborators: [{
        name: "Copilot",
        role: "independent reviewer",
        outcome: "One mechanical fix and one editorial question"
      }],
      dispositions: [{
        threadId: resolvedThread.id,
        threadVersion: resolvedThread.version,
        outcome: "fixed",
        summary: "The mechanical issue was corrected and re-reviewed."
      }],
      actor
    };

    await expect(service.prepareHumanReviewHandoff({
      ...common,
      escalations: []
    })).rejects.toThrow(/Every review thread needs an explicit disposition or escalation/);

    const needsDecision = await service.prepareHumanReviewHandoff({
      ...common,
      escalations: [{
        threadId: decisionThread.id,
        threadVersion: decisionThread.version,
        question: "Which pedagogical framing should the final puzzle use?",
        recommendation: "Keep the narrower framing used in the draft."
      }]
    });
    expect(needsDecision.hasPullRequest).toBe(true);
    const decisionHandoff = needsDecision.handoff!;
    expect(decisionHandoff.status).toBe("human-decision-needed");
    expect(decisionHandoff.remainingDecisions).toHaveLength(1);

    let feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.reviewHandoffCurrent).toBe(true);
    expect(feedback.automationState).toBe("human-decision-needed");

    decisionThread.isResolved = true;
    feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.reviewHandoffCurrent).toBe(false);
    expect(feedback.automationState).toBe("ready-to-prepare-handoff");

    const ready = await service.prepareHumanReviewHandoff({
      ...common,
      dispositions: [
        ...common.dispositions,
        {
          threadId: decisionThread.id,
          threadVersion: decisionThread.version,
          outcome: "handled-by-human",
          summary: "The human selected the recommended framing."
        }
      ],
      escalations: []
    });
    expect(ready.hasPullRequest).toBe(true);
    const readyHandoff = ready.handoff!;
    expect(readyHandoff.status).toBe("ready-for-human-review");
    const recorded = await publicationRepository.get({ requestId: opened.id, actor });
    expect(recorded.reviewHandoff.status).toBe("ready-for-human-review");
    expect(recorded.reviewHandoffHeadSha).toBe(opened.githubCommitSha);

    github.qualityByCommit.set(opened.githubCommitSha, {
      state: "pending",
      checkRuns: [{ id: 2, name: "rerun", status: "in_progress", conclusion: null }],
      statuses: []
    });
    feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.reviewHandoffCurrent).toBe(false);
    expect(feedback.automationState).toBe("checks-incomplete");
    await expect(service.prepareHumanReviewHandoff({
      ...common,
      dispositions: readyHandoff.dispositions,
      escalations: []
    })).rejects.toThrow(/checks are pending/);

    github.qualityByCommit.delete(opened.githubCommitSha);
    github.reviewsByPr.set(opened.githubPrNumber, [{
      id: 99,
      author: "independent-agent",
      state: "CHANGES_REQUESTED",
      body: "One concern remains.",
      submittedAt: "2026-08-12T01:00:00Z"
    }]);
    feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.automationState).toBe("review-changes-requested");
    await expect(service.prepareHumanReviewHandoff({
      ...common,
      dispositions: readyHandoff.dispositions,
      escalations: []
    })).rejects.toThrow(/still request changes/);
  });

  it("opens the review circuit on repeated semantic states and resets only with human authorization", async () => {
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
    const actor = { subject: "circuit-round-author" };
    const draftId = "circuit-round-fixture";
    await draftRepository.create({
      draftId,
      document: contentService.getPuzzleJsonLd("energy-flow"),
      actor
    });
    const opened = await service.submit({ draftId, replace: true, actor });
    const thread = {
      id: "thread-loop",
      version: "20:a",
      isResolved: false,
      isOutdated: false,
      path: "puzzles/science/energy-flow.js",
      line: 10,
      startLine: 10,
      side: "RIGHT",
      startSide: "RIGHT",
      subjectType: "LINE",
      comments: [{ id: 20, author: "review-agent", body: "Concern A", outdated: false }]
    };
    github.reviewThreadsByPr.set(opened.githubPrNumber, [thread]);

    const first = await service.completeReviewRound({
      requestId: opened.id,
      summary: "Reviewed concern A.",
      actor
    });
    expect(first).toMatchObject({ counted: true, madeProgress: true, reviewRoundCount: 1 });

    // Repeating the same observation without a write or external change is
    // passive polling, not another review round.
    const duplicate = await service.completeReviewRound({
      requestId: opened.id,
      summary: "Still waiting.",
      actor
    });
    expect(duplicate).toMatchObject({
      counted: false,
      duplicateCheckpoint: true,
      reviewRoundCount: 1
    });

    thread.version = "20:b";
    thread.comments[0].body = "Concern B";
    const second = await service.completeReviewRound({
      requestId: opened.id,
      summary: "Reviewer raised a distinct concern B.",
      actor
    });
    expect(second).toMatchObject({ counted: true, madeProgress: true, reviewRoundCount: 2 });

    // Returning to A then B repeats recent semantic states. Two consecutive
    // repeats open the stagnation breaker (also bounded by round four).
    thread.version = "20:c";
    thread.comments[0].body = "Concern A";
    const third = await service.completeReviewRound({
      requestId: opened.id,
      summary: "The loop returned to concern A.",
      actor
    });
    expect(third).toMatchObject({
      counted: true,
      repeatedState: true,
      stagnantRounds: 1,
      reviewRoundCount: 3
    });

    thread.version = "20:d";
    thread.comments[0].body = "Concern B";
    const fourth = await service.completeReviewRound({
      requestId: opened.id,
      summary: "The loop returned to concern B.",
      actor
    });
    expect(fourth).toMatchObject({
      counted: true,
      automationState: "circuit-breaker-open",
      stagnantRounds: 2,
      reviewRoundCount: 4
    });
    expect(fourth.circuitBreaker.reason).toBe("no-semantic-progress");
    expect(fourth.circuitBreaker.roundHistory.map((round: { summary: string }) =>
      round.summary
    )).toEqual([
      "Reviewed concern A.",
      "Reviewer raised a distinct concern B.",
      "The loop returned to concern A.",
      "The loop returned to concern B."
    ]);

    const feedback = await service.reviewFeedback({ requestId: opened.id, actor });
    expect(feedback.automationState).toBe("circuit-breaker-open");
    expect(feedback.circuitBreaker.open).toBe(true);
    await expect(service.prepareHumanReviewHandoff({
      requestId: opened.id,
      summary: "Should not bypass the circuit.",
      collaborators: [{ name: "agent", role: "reviewer", outcome: "looped" }],
      dispositions: [],
      escalations: [{
        threadId: thread.id,
        threadVersion: thread.version,
        question: "How should this be resolved?",
        recommendation: "Human should choose."
      }],
      actor
    })).rejects.toThrow(/circuit breaker is open/);
    await expect(service.resetReviewCircuit({
      requestId: opened.id,
      reason: "Agent attempted an automatic reset.",
      humanConfirmed: false,
      actor
    })).rejects.toThrow(/explicit human authorization/);

    const reset = await service.resetReviewCircuit({
      requestId: opened.id,
      reason: "Human approved one more bounded attempt with the narrower scope.",
      humanConfirmed: true,
      actor
    });
    expect(reset).toMatchObject({ reset: true, automationState: "ai-reviewing" });
    expect(reset.publication).toMatchObject({
      reviewRoundCount: 0,
      reviewWriteCount: 0,
      reviewStagnantRounds: 0,
      reviewCircuitOpenAt: null,
      reviewCircuitResetReason:
        "Human approved one more bounded attempt with the narrower scope."
    });
  });

  it("opens the review circuit before a thirteenth automated write", async () => {
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
    const actor = { subject: "circuit-write-author" };
    const draftId = "circuit-write-fixture";
    await draftRepository.create({
      draftId,
      document: contentService.getPuzzleJsonLd("energy-flow"),
      actor
    });
    const opened = await service.submit({ draftId, replace: true, actor });
    const thread = {
      id: "thread-write-cap",
      version: "30:v1",
      isResolved: false,
      isOutdated: false,
      path: "puzzles/science/energy-flow.js",
      comments: [{ id: 30, body: "Still open" }]
    };
    github.reviewThreadsByPr.set(opened.githubPrNumber, [thread]);
    const seeded = await publicationRepository.reserveReviewWrites({
      requestId: opened.id,
      count: 12,
      maximum: 12,
      action: "test-seed",
      actor
    });
    expect(seeded.allowed).toBe(true);

    await expect(service.replyToReviewComment({
      requestId: opened.id,
      commentId: 30,
      threadId: thread.id,
      expectedThreadVersion: thread.version,
      body: "This would be write thirteen.",
      actor
    })).rejects.toThrow(/circuit breaker is open/);
    expect(github.commentReplies).toHaveLength(0);
    const publication = await publicationRepository.get({ requestId: opened.id, actor });
    expect(publication.reviewWriteCount).toBe(12);
    expect(publication.reviewCircuitReason).toBe("maximum-write-actions");
    expect(publication.reviewCircuitReport).toMatchObject({
      attemptedAction: "reply-to-review-comment",
      attemptedCount: 1,
      maximumReviewWrites: 12
    });
  });

  it("extracts only one unambiguous GitHub suggestion and exposes its safe apply metadata", async () => {
    // Exercises GitHubRepositoryClient.listPullRequestComments directly,
    // not through FakeGitHub -- the fake just returns whatever a test
    // seeds it with, so a parsing bug in the real extraction logic
    // wouldn't show up there.
    const suggestionBody =
      "Consider tightening this.\n\n````suggestion\n" +
      "      body: `review.body` || null,\n" +
      "      marker: \"```\"\n" +
      "````\n\nStill needed either way.";
    const fetchImpl = () => Promise.resolve(Response.json([
      {
        id: 7,
        user: { login: "copilot-pull-request-reviewer" },
        pull_request_url: "https://api.github.com/repos/jmajerus/concept-clusters/pulls/93",
        path: "modules/githubPublicationService.js",
        start_line: 427,
        line: 428,
        start_side: "RIGHT",
        side: "RIGHT",
        subject_type: "line",
        commit_id: "a".repeat(40),
        body: suggestionBody,
        created_at: "2026-08-12T00:00:00Z",
        updated_at: "2026-08-12T00:00:01Z"
      },
      {
        id: 8,
        user: { login: "a-human-reviewer" },
        pull_request_url: "https://api.github.com/repos/jmajerus/concept-clusters/pulls/93",
        path: "modules/githubPublicationService.js",
        line: 500,
        side: "RIGHT",
        commit_id: "a".repeat(40),
        body: "Just a plain comment, no suggestion here.",
        created_at: "2026-08-12T00:00:05Z"
      },
      {
        id: 9,
        user: { login: "a-human-reviewer" },
        pull_request_url: "https://api.github.com/repos/jmajerus/concept-clusters/pulls/93",
        path: "modules/githubPublicationService.js",
        line: 501,
        side: "RIGHT",
        commit_id: "a".repeat(40),
        body: "```suggestion\none\n```\n```suggestion\ntwo\n```",
        created_at: "2026-08-12T00:00:10Z"
      }
    ]));
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    const comments = await github.listPullRequestComments(93);
    expect(comments).toHaveLength(3);
    expect(comments[0]).toMatchObject({
      pullRequestNumber: 93,
      startLine: 427,
      line: 428,
      suggestion: "      body: `review.body` || null,\n      marker: \"```\"",
      suggestionCount: 1,
      canApplySuggestion: true,
      updatedAt: "2026-08-12T00:00:01Z"
    });
    expect(comments[1].suggestion).toBeNull();
    expect(comments[1].canApplySuggestion).toBe(false);
    expect(comments[2]).toMatchObject({
      suggestion: null,
      suggestionCount: 2,
      canApplySuggestion: false
    });
  });

  it("appends a review commit with a non-forced ref update", async () => {
    const requests: Array<{ url: string; method: string; body: Record<string, unknown> }> = [];
    const fetchImpl: typeof fetch = (input, init) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body));
      requests.push({ url, method: String(init?.method), body });
      if (url.endsWith("/git/trees")) return Promise.resolve(Response.json({ sha: "new-tree" }));
      if (url.endsWith("/git/commits")) return Promise.resolve(Response.json({ sha: "new-commit" }));
      return Promise.resolve(Response.json({ object: { sha: "new-commit" } }));
    };
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    const commitSha = await github.appendCommit({
      baseCommitSha: "old-head",
      baseTreeSha: "old-tree",
      branch: "authoring/example",
      message: "Apply review suggestion from comment 7",
      changes: [{ relativePath: "example.js", mode: "100755", content: "const value = 2;\n" }]
    });
    expect(commitSha).toBe("new-commit");
    expect(requests).toHaveLength(3);
    expect(requests[0].body).toMatchObject({
      tree: [{ path: "example.js", mode: "100755", type: "blob", content: "const value = 2;\n" }]
    });
    expect(requests[1].body).toMatchObject({ parents: ["old-head"] });
    expect(requests[2]).toMatchObject({
      method: "PATCH",
      body: { sha: "new-commit", force: false }
    });
    expect(requests[2].url).toContain("/git/refs/heads/authoring/example");
  });

  it("walks a nested Git tree to preserve a suggestion target's file mode", async () => {
    const urls: string[] = [];
    const fetchImpl: typeof fetch = input => {
      const url = String(input);
      urls.push(url);
      if (url.endsWith("/git/trees/root-tree")) {
        return Promise.resolve(Response.json({
          tree: [{ path: "scripts", type: "tree", mode: "040000", sha: "scripts-tree" }]
        }));
      }
      return Promise.resolve(Response.json({
        tree: [{ path: "fix.mjs", type: "blob", mode: "100755", sha: "file-blob" }]
      }));
    };
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    const entry = await github.getTreeEntry("scripts/fix.mjs", "root-tree");
    expect(entry).toMatchObject({ path: "fix.mjs", type: "blob", mode: "100755" });
    expect(urls).toHaveLength(2);
    expect(urls[1]).toContain("/git/trees/scripts-tree");
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
    if (!preview.preview) throw new Error("Expected a valid catalogue preview");
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
    if (!preview.preview) throw new Error("Expected a valid catalogue preview");
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
