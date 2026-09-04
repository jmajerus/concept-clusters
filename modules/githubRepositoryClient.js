// GitHub REST/GraphQL client, extracted from the retired per-puzzle
// publication service (see docs/dev-briefs -- the per-puzzle GitHub PR
// path was removed once D1 Publish + Cue + Freeze fully covered
// production for a single puzzle draft too). Freeze
// (modules/freezePublicationService.js) is this class's only remaining
// consumer: it opens/amends its own batch pull request the same way the
// old per-puzzle path opened/amended one for a single puzzle.

const MAX_GITHUB_FILE_BYTES = 2 * 1024 * 1024;
const MAX_GITHUB_JSON_BYTES = 2 * 1024 * 1024;
const API_VERSION = "2026-03-10";

export class GitHubApiError extends Error {
  constructor(message, { status = null } = {}) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

function encodedPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function boundedBody(response, limit) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) {
    throw new Error(`GitHub response exceeds ${limit} bytes`);
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel("response too large");
      throw new Error(`GitHub response exceeds ${limit} bytes`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function boundedJson(response) {
  const text = new TextDecoder().decode(
    await boundedBody(response, MAX_GITHUB_JSON_BYTES)
  );
  return JSON.parse(text);
}

// GitHub's exact-replacement review format. A line-oriented parser keeps
// empty suggestions meaningful (they delete the selected lines), supports
// longer Markdown fences when the replacement itself contains backticks,
// and lets the apply path reject ambiguous comments containing more than
// one suggestion instead of silently choosing the first.
function extractSuggestions(body) {
  if (typeof body !== "string") return [];
  const lines = body.split(/\r?\n/);
  const suggestions = [];
  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^ {0,3}(`{3,})suggestion[\t ]*$/);
    if (!opening) continue;
    const closing = new RegExp(`^ {0,3}${opening[1]}[\\t ]*$`);
    let end = index + 1;
    while (end < lines.length && !closing.test(lines[end])) end += 1;
    if (end === lines.length) continue;
    suggestions.push(lines.slice(index + 1, end).join("\n"));
    index = end;
  }
  return suggestions;
}

function pullRequestNumberFromApiUrl(url) {
  if (typeof url !== "string") return null;
  try {
    const match = new URL(url).pathname.match(/\/pulls\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

export class GitHubRepositoryClient {
  constructor({ owner, repository, token, baseBranch = "main", fetchImpl = fetch }) {
    this.owner = owner;
    this.repository = repository;
    // PATs never contain surrounding whitespace; normalize dashboard/CLI
    // paste artifacts without ever exposing the secret value.
    this.token = typeof token === "string" ? token.trim() : token;
    this.baseBranch = baseBranch;
    // Native Workerd functions require their original receiver. Keep fetch in
    // a closure so calling through this client does not bind `this` to it.
    this.fetchImpl = (...args) => fetchImpl(...args);
  }

  assertConfigured() {
    if (!this.owner || !this.repository || !this.token || !this.baseBranch) {
      throw new Error("GitHub publication is not configured");
    }
  }

  async request(path, { method = "GET", body, accept = "application/vnd.github+json" } = {}) {
    this.assertConfigured();
    const response = await this.fetchImpl(`https://api.github.com${path}`, {
      method,
      headers: {
        "Accept": accept,
        "Authorization": `Bearer ${this.token}`,
        "User-Agent": "concept-clusters-authoring-worker",
        "X-GitHub-Api-Version": API_VERSION,
        ...(body === undefined ? {} : { "Content-Type": "application/json" })
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new GitHubApiError(`GitHub API request failed (${response.status})`, {
        status: response.status
      });
    }
    return response;
  }

  repoPath(suffix) {
    return `/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repository)}${suffix}`;
  }

  // A handful of things (review-thread resolution state, and resolving a
  // thread at all) exist only in GitHub's GraphQL API, not REST -- kept
  // as one general-purpose escape hatch here rather than growing a new
  // bespoke method per GraphQL-only feature. A GraphQL error is still a
  // 200 response with an `errors` array in the body, not a non-2xx
  // status, so this checks that explicitly rather than trusting
  // request()'s ok check (which only guards transport-level failures).
  async graphql(query, variables = {}) {
    const response = await this.request("/graphql", {
      method: "POST",
      body: { query, variables }
    });
    const payload = await boundedJson(response);
    if (payload.errors?.length) {
      throw new GitHubApiError(
        `GitHub GraphQL request failed: ${payload.errors.map(error => error.message).join("; ")}`,
        { status: 200 }
      );
    }
    return payload.data;
  }

  async getBranchHead(branch = this.baseBranch) {
    const response = await this.request(this.repoPath(
      `/git/ref/heads/${encodedPath(branch)}`
    ));
    const ref = await boundedJson(response);
    const commitResponse = await this.request(this.repoPath(
      `/git/commits/${encodeURIComponent(ref.object.sha)}`
    ));
    const commit = await boundedJson(commitResponse);
    return { commitSha: ref.object.sha, treeSha: commit.tree.sha };
  }

  async getOptionalBranchHead(branch) {
    try {
      return await this.getBranchHead(branch);
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) return null;
      throw error;
    }
  }

  async readFile(path, commitSha) {
    let response;
    try {
      response = await this.request(this.repoPath(
        `/contents/${encodedPath(path)}?ref=${encodeURIComponent(commitSha)}`
      ), { accept: "application/vnd.github.raw+json" });
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) return null;
      throw error;
    }
    const bytes = await boundedBody(response, MAX_GITHUB_FILE_BYTES);
    return new TextDecoder().decode(bytes);
  }

  // Walk one tree level at a time so suggestion commits preserve the target
  // blob's mode (notably 100755 executables) without downloading a recursive
  // repository-wide tree. Review comments supply the path; each segment still
  // has to resolve to the expected Git object type.
  async getTreeEntry(path, rootTreeSha) {
    const segments = typeof path === "string" ? path.split("/") : [];
    if (!segments.length || segments.some(segment => !segment || segment === "." || segment === "..")) {
      return null;
    }
    let treeSha = rootTreeSha;
    for (let index = 0; index < segments.length; index += 1) {
      const response = await this.request(this.repoPath(
        `/git/trees/${encodeURIComponent(treeSha)}`
      ));
      const tree = await boundedJson(response);
      const entry = tree.tree?.find(candidate => candidate.path === segments[index]);
      if (!entry) return null;
      if (index === segments.length - 1) return entry;
      if (entry.type !== "tree") return null;
      treeSha = entry.sha;
    }
    return null;
  }

  async createTreeAndCommit({ baseTreeSha, baseCommitSha, message, changes }) {
    const treeResponse = await this.request(this.repoPath("/git/trees"), {
      method: "POST",
      body: {
        base_tree: baseTreeSha,
        // content: null marks a deletion (a puzzle moving to a new category
        // path -- see planDocument). GitHub's tree API removes a path from
        // the resulting tree when given sha: null instead of content.
        tree: changes.map(change => change.content === null
          ? { path: change.relativePath, mode: change.mode || "100644", type: "blob", sha: null }
          : { path: change.relativePath, mode: change.mode || "100644", type: "blob", content: change.content }
        )
      }
    });
    const tree = await boundedJson(treeResponse);
    const commitResponse = await this.request(this.repoPath("/git/commits"), {
      method: "POST",
      body: { message, tree: tree.sha, parents: [baseCommitSha] }
    });
    const commit = await boundedJson(commitResponse);
    return commit.sha;
  }

  async createCommit({ baseCommitSha, baseTreeSha, branch, message, changes }) {
    const commitSha = await this.createTreeAndCommit({ baseTreeSha, baseCommitSha, message, changes });
    await this.request(this.repoPath("/git/refs"), {
      method: "POST",
      body: { ref: `refs/heads/${branch}`, sha: commitSha }
    });
    return commitSha;
  }

  // A review suggestion should appear as its own ordinary commit, just as
  // GitHub's "Commit suggestion" UI does. The new commit is parented to the
  // observed PR head and the ref update is explicitly non-forced: if another
  // writer advances the branch between the read and this write, GitHub rejects
  // the non-fast-forward update rather than discarding that writer's work.
  async appendCommit({ baseCommitSha, baseTreeSha, branch, message, changes }) {
    const commitSha = await this.createTreeAndCommit({ baseTreeSha, baseCommitSha, message, changes });
    await this.request(this.repoPath(`/git/refs/heads/${encodedPath(branch)}`), {
      method: "PATCH",
      body: { sha: commitSha, force: false }
    });
    return commitSha;
  }

  async createPullRequest({ branch, title, body }) {
    const response = await this.request(this.repoPath("/pulls"), {
      method: "POST",
      body: {
        title,
        body,
        head: branch,
        base: this.baseBranch,
        maintainer_can_modify: true,
        draft: false
      }
    });
    const pullRequest = await boundedJson(response);
    return {
      number: pullRequest.number,
      url: pullRequest.html_url,
      state: pullRequest.state,
      merged: !!pullRequest.merged
    };
  }

  async findPullRequest(branch) {
    const response = await this.request(this.repoPath(
      `/pulls?head=${encodeURIComponent(`${this.owner}:${branch}`)}&state=all&per_page=1`
    ));
    const matches = await boundedJson(response);
    if (!matches.length) return null;
    return {
      number: matches[0].number,
      url: matches[0].html_url,
      state: matches[0].state,
      merged: !!matches[0].merged
    };
  }

  async getPullRequest(number) {
    const response = await this.request(this.repoPath(`/pulls/${number}`));
    const pullRequest = await boundedJson(response);
    return {
      number: pullRequest.number,
      url: pullRequest.html_url,
      state: pullRequest.state,
      merged: !!pullRequest.merged,
      mergeCommitSha: pullRequest.merge_commit_sha || null,
      headCommitSha: pullRequest.head?.sha || null
    };
  }

  async compareCommits(baseCommitSha, headCommitSha) {
    const response = await this.request(this.repoPath(
      `/compare/${encodeURIComponent(baseCommitSha)}...${encodeURIComponent(headCommitSha)}?per_page=100`
    ));
    const comparison = await boundedJson(response);
    const files = comparison.files || [];
    return {
      status: comparison.status,
      aheadBy: comparison.ahead_by,
      behindBy: comparison.behind_by,
      // GitHub caps compare results at 300 changed files. Treat a full page
      // as potentially truncated so synchronization never approves a partial
      // view of a large manual change set.
      filesTruncated: files.length >= 300,
      files: files.map(file => ({
        path: file.filename,
        status: file.status,
        previousPath: file.previous_filename || null
      }))
    };
  }

  async getCommitQualityState(commitSha) {
    const [checksResponse, statusResponse] = await Promise.all([
      this.request(this.repoPath(
        `/commits/${encodeURIComponent(commitSha)}/check-runs?per_page=100`
      )),
      this.request(this.repoPath(
        `/commits/${encodeURIComponent(commitSha)}/status?per_page=100`
      ))
    ]);
    const checksPayload = await boundedJson(checksResponse);
    const statusPayload = await boundedJson(statusResponse);
    const checkRuns = (checksPayload.check_runs || []).map(check => ({
      id: check.id,
      name: check.name,
      app: check.app?.name || null,
      status: check.status,
      conclusion: check.conclusion || null,
      url: check.html_url || check.details_url || null
    }));
    const statuses = (statusPayload.statuses || []).map(status => ({
      id: status.id,
      context: status.context,
      state: status.state,
      description: status.description || null,
      url: status.target_url || null
    }));
    if (
      Number(checksPayload.total_count || 0) > checkRuns.length ||
      statuses.length >= 100
    ) {
      throw new GitHubApiError(
        "Commit checks exceed the supported snapshot size; refusing a partial handoff"
      );
    }
    const failingConclusions = new Set([
      "action_required", "cancelled", "failure", "stale", "timed_out"
    ]);
    const failed = checkRuns.some(check =>
      check.status === "completed" && failingConclusions.has(check.conclusion)
    ) || statuses.some(status => ["error", "failure"].includes(status.state));
    const pending = checkRuns.some(check => check.status !== "completed") ||
      statuses.some(status => status.state === "pending");
    return {
      state: failed ? "failure" : pending ? "pending" :
        (checkRuns.length || statuses.length) ? "success" : "none",
      checkRuns,
      statuses
    };
  }

  // Replies *within* a specific review thread (the inline,
  // file/line-anchored kind), not
  // as a standalone top-level PR comment. Used to record why a review
  // comment is being dismissed rather than acted on, right in the
  // thread a human would look at to understand its resolution -- not
  // buried in the PR's general conversation.
  async replyToPullRequestComment(number, commentId, body) {
    await this.request(this.repoPath(`/pulls/${number}/comments/${commentId}/replies`), {
      method: "POST",
      body: { body }
    });
  }

  async getPullRequestComment(commentId) {
    const response = await this.request(this.repoPath(
      `/pulls/comments/${encodeURIComponent(commentId)}`
    ));
    return reviewComment(await boundedJson(response));
  }

  async listPages(path) {
    const items = [];
    for (let page = 1; page <= 10; page += 1) {
      const separator = path.includes("?") ? "&" : "?";
      const response = await this.request(this.repoPath(
        `${path}${separator}per_page=100&page=${page}`
      ));
      const batch = await boundedJson(response);
      items.push(...batch);
      if (batch.length < 100) return items;
    }
    throw new GitHubApiError(
      "GitHub review feedback exceeds the supported 1,000-item snapshot; refusing a partial view"
    );
  }

  // Inline, file/line-anchored review comments (what a human or Copilot
  // leaves on a specific diff line) -- distinct from a review's own
  // summary body (listPullRequestReviews) and from a plain PR/issue
  // comment. 100 per page is GitHub's max and comfortably
  // covers any real review round for a single-puzzle PR; not worth
  // paginating further for this.
  async listPullRequestComments(number) {
    const comments = await this.listPages(`/pulls/${number}/comments`);
    return comments.map(reviewComment);
  }

  // A review's own summary (e.g. Copilot's per-file overview alongside
  // its inline comments above) -- GitHub models "submit a review" and
  // "comment on a line" as different objects, so both are needed for
  // the full picture of what a reviewer said.
  async listPullRequestReviews(number) {
    const reviews = await this.listPages(`/pulls/${number}/reviews`);
    // Not filtered to only reviews with summary text -- an APPROVED or
    // CHANGES_REQUESTED review is often submitted with no body at all,
    // and that state is exactly the kind of feedback a caller needs to
    // see, not just prose comments.
    return reviews.map(review => ({
      id: review.id,
      author: review.user?.login || null,
      state: review.state,
      body: review.body || null,
      submittedAt: review.submitted_at
    }));
  }

  // "Resolve conversation" state exists only for a review *thread* (the
  // inline-comment kind, not a review's own summary), and only via
  // GraphQL -- REST's /pulls/{n}/comments has no isResolved field at
  // all. 100 threads is comfortably more than any real single-puzzle
  // review round produces; not worth paginating further for this.
  async listPullRequestReviewThreads(number) {
    const data = await this.graphql(`
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            reviewThreads(first: 100) {
              pageInfo { hasNextPage }
              nodes {
                id
                isResolved
                isOutdated
                path
                line
                startLine
                diffSide
                startDiffSide
                subjectType
                resolvedBy { login }
                comments(first: 100) {
                  pageInfo { hasNextPage }
                  nodes {
                    id
                    fullDatabaseId
                    body
                    createdAt
                    updatedAt
                    url
                    author { login }
                    replyTo { fullDatabaseId }
                    isMinimized
                    outdated
                    state
                  }
                }
              }
            }
          }
        }
      }
    `, { owner: this.owner, repo: this.repository, number });
    const connection = data.repository.pullRequest.reviewThreads;
    if (
      connection.pageInfo?.hasNextPage ||
      connection.nodes.some(thread => thread.comments?.pageInfo?.hasNextPage)
    ) {
      throw new GitHubApiError(
        "Pull request review feedback exceeds the supported 100-thread/comment snapshot; refusing a partial view"
      );
    }
    return connection.nodes.map(reviewThread);
  }

  async listUnresolvedReviewThreadIds(number) {
    return (await this.listPullRequestReviewThreads(number))
      .filter(thread => !thread.isResolved)
      .map(thread => thread.id);
  }

  // The GraphQL equivalent of clicking "Resolve conversation" on a
  // review thread. threadId is a GraphQL node id (e.g. from
  // listUnresolvedReviewThreadIds above), not a REST comment number --
  // the two id spaces are unrelated.
  async resolveReviewThread(threadId) {
    await this.graphql(`
      mutation($id: ID!) {
        resolveReviewThread(input: { threadId: $id }) {
          thread { id isResolved }
        }
      }
    `, { id: threadId });
  }
}
