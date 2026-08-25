import { slugify } from "../puzzles/categories.js";
import { validateCatalogueCreation, validateCatalogueUpdate } from "./catalogueValidation.js";
import { validateCategoryRegistration } from "./categoryValidation.js";
import {
  addCatalogueEntrySource,
  formattedJson,
  generatedCatalogueModule,
  generatedPuzzleModule,
  publicationApprovalToken,
  registerCategorySource
} from "./publicationArtifacts.js";
import { puzzleSourceUrl } from "./puzzleManifest.js";
import { puzzleForCanonicalPublication, puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";

const MAX_GITHUB_FILE_BYTES = 2 * 1024 * 1024;
const MAX_GITHUB_JSON_BYTES = 2 * 1024 * 1024;
const API_VERSION = "2026-03-10";
const MAX_AUTOMATED_REVIEW_ROUNDS = 4;
const MAX_AUTOMATED_REVIEW_WRITES = 12;
const MAX_STAGNANT_REVIEW_ROUNDS = 2;
const REVIEW_FINGERPRINT_HISTORY = 6;

export class PublicationConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "PublicationConflictError";
  }
}

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

function reviewComment(comment) {
  const suggestions = extractSuggestions(comment.body);
  const startLine = comment.start_line ?? comment.line ?? null;
  const endLine = comment.line ?? null;
  const startSide = comment.start_side ?? comment.side ?? null;
  const subjectType = comment.subject_type ?? "line";
  const updatedAt = comment.updated_at ?? comment.created_at ?? null;
  return {
    id: comment.id,
    author: comment.user?.login || null,
    authorId: comment.user?.id ?? null,
    url: comment.html_url || null,
    pullRequestNumber: pullRequestNumberFromApiUrl(comment.pull_request_url),
    path: comment.path,
    line: endLine ?? comment.original_line ?? null,
    startLine,
    side: comment.side ?? null,
    startSide,
    subjectType,
    commitSha: comment.commit_id || null,
    body: comment.body,
    suggestion: suggestions.length === 1 ? suggestions[0] : null,
    suggestionCount: suggestions.length,
    canApplySuggestion:
      suggestions.length === 1 &&
      subjectType === "line" &&
      typeof comment.path === "string" &&
      Number.isInteger(startLine) && startLine > 0 &&
      Number.isInteger(endLine) && endLine >= startLine &&
      comment.side === "RIGHT" &&
      startSide === "RIGHT" &&
      typeof comment.commit_id === "string" &&
      typeof updatedAt === "string",
    createdAt: comment.created_at,
    updatedAt
  };
}

function reviewThreadVersion(thread) {
  return (thread.comments || [])
    .map(comment => `${comment.id}:${comment.updatedAt}`)
    .join("|");
}

function reviewThread(thread) {
  const comments = (thread.comments?.nodes || []).map(comment => ({
    nodeId: comment.id,
    id: comment.fullDatabaseId == null ? null : Number(comment.fullDatabaseId),
    author: comment.author?.login || null,
    body: comment.body,
    url: comment.url || null,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replyToId: comment.replyTo?.fullDatabaseId == null
      ? null
      : Number(comment.replyTo.fullDatabaseId),
    isMinimized: !!comment.isMinimized,
    outdated: !!comment.outdated,
    state: comment.state || null
  }));
  const normalized = {
    id: thread.id,
    isResolved: !!thread.isResolved,
    isOutdated: !!thread.isOutdated,
    resolvedBy: thread.resolvedBy?.login || null,
    path: thread.path || null,
    line: thread.line ?? null,
    startLine: thread.startLine ?? thread.line ?? null,
    side: thread.diffSide || null,
    startSide: thread.startDiffSide || thread.diffSide || null,
    subjectType: thread.subjectType || "LINE",
    comments
  };
  return { ...normalized, version: reviewThreadVersion(normalized) };
}

function suggestionCommitMessage(comment) {
  const author = typeof comment.author === "string" &&
      /^[A-Za-z0-9-]+(?:\[bot\])?$/.test(comment.author)
    ? comment.author
    : null;
  const authorId = Number.isInteger(comment.authorId) && comment.authorId > 0
    ? comment.authorId
    : null;
  const lines = [
    author
      ? `Apply review suggestion from @${author}`
      : `Apply review suggestion from comment ${comment.id}`
  ];
  if (typeof comment.url === "string" && /^https:\/\/github\.com\//.test(comment.url)) {
    lines.push("", `Review-comment: ${comment.url}`);
  }
  if (author && authorId) {
    lines.push("", `Co-authored-by: ${author} <${authorId}+${author}@users.noreply.github.com>`);
  }
  return lines.join("\n");
}

function applySuggestionToSource(source, { startLine, endLine, suggestion }) {
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  if (
    !Number.isInteger(startLine) ||
    !Number.isInteger(endLine) ||
    startLine < 1 ||
    endLine < startLine ||
    endLine > lines.length
  ) {
    throw new PublicationConflictError(
      `Review suggestion targets invalid line range ${startLine}-${endLine}`
    );
  }
  const replacement = suggestion === "" ? [] : suggestion.split("\n");
  lines.splice(startLine - 1, endLine - startLine + 1, ...replacement);
  return lines.join(eol);
}

async function sha256Json(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${[...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function existingModulePath(puzzle) {
  const source = puzzleSourceUrl(puzzle);
  if (!source) return null;
  const marker = "/puzzles/";
  const index = source.pathname.lastIndexOf(marker);
  return index < 0 ? null : source.pathname.slice(index + 1);
}

// Catalogues skip the D1 publication_requests table entirely (see
// createCatalogue below), so there's no stored requestId to derive a
// branch name from the way puzzle publication's branchName() does. id is
// already a validated slug by the time this runs, so no sanitizing needed.
function catalogueBranchName(catalogueId) {
  return `authoring/catalogue-${catalogueId}-${crypto.randomUUID().slice(0, 8)}`;
}

// catalogues/index.js imports are flat "./<id>.js" paths today; accept a
// nested relative path and use the filename stem as the catalogue id.
function cataloguesFromRegistrySource(source) {
  const catalogues = [];
  const seen = new Set();
  for (const match of source.matchAll(/from\s+["']\.\/([^"']+)\.js["']/g)) {
    const relativePath = match[1];
    const id = relativePath.includes("/")
      ? relativePath.slice(relativePath.lastIndexOf("/") + 1)
      : relativePath;
    if (seen.has(id)) continue;
    seen.add(id);
    catalogues.push({ id });
  }
  return catalogues;
}

function puzzleIdsFromRegistrySource(source) {
  const ids = new Set();
  for (const match of source.matchAll(/from\s+["']\.\/[^"']+\/([^/"']+)\.js["']/g)) {
    ids.add(match[1]);
  }
  // Flat imports (rare) still count.
  for (const match of source.matchAll(/from\s+["']\.\/([^/"']+)\.js["']/g)) {
    ids.add(match[1]);
  }
  return ids;
}

// Membership for create_catalogue is GitHub-base-branch authority, not the
// Worker-bundled contentService snapshot -- otherwise agents must wait for
// an authoring Worker redeploy after puzzle PRs merge. Prefer the canonical
// simplified-format path (present as soon as a hosted puzzle PR merges);
// fall back to puzzles/index.js for older hand-authored puzzles that never
// got a canonical content/puzzles/ file.
async function publishedPuzzleIdsOnBranch(github, commitSha, entryIds) {
  const uniqueIds = [...new Set(
    entryIds.filter(id => typeof id === "string" && id.trim())
  )];
  const found = new Set();
  let registryIds = null;

  async function loadRegistryIds() {
    if (registryIds) return registryIds;
    const source = await github.readFile("puzzles/index.js", commitSha);
    registryIds = source ? puzzleIdsFromRegistrySource(source) : new Set();
    return registryIds;
  }

  await Promise.all(uniqueIds.map(async id => {
    const canonical = await github.readFile(
      `content/puzzles/${id}.ccpuzzle.json`,
      commitSha
    );
    if (canonical !== null) {
      found.add(id);
      return;
    }
    if ((await loadRegistryIds()).has(id)) found.add(id);
  }));
  return found;
}

function publicationOptions({
  replace = false,
  catalogueId = null,
  reason = null,
  newCategory = null
}) {
  if (reason && !catalogueId) {
    throw new Error(
      "reason requires catalogueId: it's that catalogue entry's " +
      "editorial-choice text, not a general submission note. Pass " +
      "catalogueId, or omit reason if this puzzle isn't joining a catalogue."
    );
  }
  return {
    replace: !!replace,
    catalogueId: catalogueId || null,
    reason: reason || null,
    newCategory: newCategory
      ? JSON.parse(JSON.stringify(newCategory))
      : null
  };
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

export function createGitHubPublicationService({
  contentService,
  draftRepository,
  publicationRepository,
  github,
  draftKind = "D1 draft"
}) {
  if (!contentService || !draftRepository || !publicationRepository || !github) {
    throw new Error("Publication service dependencies are required");
  }

  async function planDocument(
    document,
    options,
    expectedBaseCommitSha = null,
    approvalContext = {}
  ) {
    const normalizedOptions = publicationOptions(options);
    // Safety net: a draft may have been saved with input that didn't
    // convert (create/save store it as given rather than rejecting -- see
    // hostedMcpAuthoringServer.js's create_puzzle_draft/save_puzzle_draft).
    // Re-attempt conversion here so preview/submit called directly against
    // such a draft (skipping validate_puzzle_draft) still gets friendly,
    // formatted errors. `document` stays the author's own simplified
    // document -- it is never replaced by a converted document; only
    // `puzzle`, the runtime model, is derived from it.
    const { puzzle, errors: conversionErrors } = puzzleFromAuthoredDocument(document);
    if (!puzzle) {
      return { valid: false, errors: conversionErrors, preview: null };
    }
    const categoryResult = normalizedOptions.newCategory
      ? validateCategoryRegistration(normalizedOptions.newCategory, {
          puzzle,
          puzzles: contentService.puzzles,
          categories: contentService.categories
        })
      : { valid: true, errors: [], registration: null };
    if (!categoryResult.valid) {
      return { valid: false, errors: categoryResult.errors, preview: null };
    }
    const categoryRegistry = categoryResult.registration
      ? {
          ...contentService.categories,
          [categoryResult.registration.name]: categoryResult.registration.metadata
        }
      : contentService.categories;
    const validation = await contentService.validatePuzzleDraft(document, {
      categoryRegistry
    });
    if (!validation.valid) return { ...validation, preview: null };
    const catalogue = normalizedOptions.catalogueId
      ? contentService.catalogues.find(item => item.id === normalizedOptions.catalogueId)
      : null;
    if (normalizedOptions.catalogueId && !catalogue) {
      return { valid: false, errors: [`Unknown catalogue: ${normalizedOptions.catalogueId}`], preview: null };
    }

    const base = await github.getBranchHead();
    if (expectedBaseCommitSha && base.commitSha !== expectedBaseCommitSha) {
      throw new PublicationConflictError(
        `The ${github.baseBranch} branch changed after preview; preview again`
      );
    }

    // Git is the published authority, not the Worker-bundled contentService
    // snapshot (same principle as publishedPuzzleIdsOnBranch, above, for
    // catalogue membership) -- the snapshot can lag a merge indefinitely,
    // not just briefly: hosted puzzle PRs omit puzzles/index.js, so a
    // separate post-merge workflow registers the module there, and that
    // workflow commits with the default GITHUB_TOKEN, which GitHub Actions
    // deliberately never lets trigger other on:push workflows -- including
    // the one that redeploys this Worker. So the snapshot only refreshes
    // when some *unrelated* push happens to redeploy it, which may be much
    // later or never before the next edit. Trusting the snapshot alone for
    // "does this puzzle already exist" produced exactly the failure this
    // guards against: a same-puzzle edit landing minutes after creation was
    // treated as brand new, computed a fresh path from the new category,
    // and never touched the old one -- two registrations of one puzzle,
    // which broke the very next deploy (duplicate declared symbol).
    const canonicalPath = `content/puzzles/${puzzle.id}.ccpuzzle.json`;
    const existingCanonicalSource = await github.readFile(canonicalPath, base.commitSha);
    const existingDocument = existingCanonicalSource ? JSON.parse(existingCanonicalSource) : null;
    const published = contentService.puzzles.find(item => item.id === puzzle.id) || null;
    const action = (existingDocument || published) ? "replace" : "create";
    if ((existingDocument || published) && !normalizedOptions.replace) {
      return {
        valid: false,
        errors: [`Puzzle "${puzzle.id}" already exists; explicit replace approval is required`],
        preview: null
      };
    }
    const modulePath = `puzzles/${slugify(puzzle.category)}/${puzzle.id}.js`;
    // Prefer the path derived from the canonical document actually on
    // GitHub when one exists; existingModulePath() (the puzzle's loaded
    // import.meta.url) only remains a fallback for puzzles that predate
    // the canonical-file pipeline and so never got one at all.
    const oldModulePath = existingDocument
      ? `puzzles/${slugify(existingDocument.category)}/${puzzle.id}.js`
      : existingModulePath(published);
    const canonical = puzzleForCanonicalPublication(puzzle);
    const proposed = new Map([
      [canonicalPath, formattedJson(canonical.simplified)],
      [modulePath, generatedPuzzleModule(canonical.puzzle, canonicalPath, modulePath)]
    ]);
    if (oldModulePath && oldModulePath !== modulePath) {
      // null marks a deletion -- see createTreeAndCommit.
      proposed.set(oldModulePath, null);
    }
    if (!published) {
      // Hosted PRs deliberately omit puzzles/index.js. GitHub does not honor
      // merge=union, so concurrent puzzle submissions that all splice the same
      // registry file conflict on whichever PR merges second. CI runs
      // tools/ensure-puzzle-registry.mjs before validate, and a post-merge
      // workflow registers any on-disk modules still missing from main.
    }
    if (categoryResult.registration) {
      const categoriesPath = "puzzles/categories.js";
      const source = await github.readFile(categoriesPath, base.commitSha);
      if (source === null) {
        throw new Error(
          `Missing repository file: ${categoriesPath}. This is a repository ` +
          "configuration problem, not something the draft can fix -- check " +
          "that the configured repo/branch still has this file."
        );
      }
      proposed.set(
        categoriesPath,
        registerCategorySource(source, categoryResult.registration)
      );
    }
    if (catalogue && !catalogue.entries.some(entry => entry.id === puzzle.id)) {
      const cataloguePath = `catalogues/${catalogue.id}.js`;
      const source = await github.readFile(cataloguePath, base.commitSha);
      if (source === null) {
        throw new Error(
          `Missing repository file: ${cataloguePath}. This is a repository ` +
          "configuration problem, not something the draft can fix -- check " +
          "that the configured repo/branch still has this file."
        );
      }
      proposed.set(cataloguePath, addCatalogueEntrySource(source, {
        id: puzzle.id,
        ...(normalizedOptions.reason ? { reason: normalizedOptions.reason } : {})
      }));
    }
    const changes = await Promise.all([...proposed].map(async ([relativePath, content]) => ({
      relativePath,
      original: await github.readFile(relativePath, base.commitSha),
      content
    })));
    const approvalToken = await publicationApprovalToken({
      baseCommitSha: base.commitSha,
      changes,
      options: { ...normalizedOptions, ...approvalContext }
    });
    return {
      valid: true,
      errors: [],
      plan: {
        action,
        puzzle,
        document,
        changes,
        options: normalizedOptions,
        categoryRegistration: categoryResult.registration,
        base,
        approvalToken
      },
      preview: {
        action,
        puzzleId: puzzle.id,
        title: puzzle.title,
        baseBranch: github.baseBranch,
        baseCommitSha: base.commitSha,
        affectedPaths: changes.map(change => change.relativePath),
        ...(categoryResult.registration
          ? { newCategory: categoryResult.registration.name }
          : {}),
        approvalToken,
        publicationMode: "github-pull-request",
        repositoryChanged: false,
        note: "submit_puzzle_for_publication computes this same plan itself and doesn't require this token back -- calling it directly, without previewing first, is fine."
      }
    };
  }

  async function preview({ draftId, actor, ...options }) {
    const draft = await draftRepository.get({ draftId, actor });
    const result = await planDocument(draft.document, options, null, {
      draftId,
      contentHash: draft.contentHash
    });
    return { draft, ...result };
  }

  // No human-approval gate here: the judgment that matters (is this puzzle
  // any good) already happened in the authoring conversation that produced
  // the draft. What used to sit here -- a client-supplied approval_token
  // compared against a fresh plan -- was integrity checking (did the draft
  // silently drift since it was last looked at), not review, and the human
  // couldn't meaningfully read the token anyway. The plan is still computed
  // fresh and its hash is still used below as reserve()'s idempotency key,
  // so a resubmission of unchanged content still can't double-create a PR;
  // it just no longer requires the caller to have fetched that hash first.
  async function submit({ draftId, actor, ...options }) {
    const draft = await draftRepository.get({ draftId, actor });
    const result = await planDocument(draft.document, options, null, {
      draftId,
      contentHash: draft.contentHash
    });
    if (!result.valid) throw new Error(result.errors.join("\n"));
    const plan = result.plan;

    // If this draft already has an open pull request, append to it instead of
    // opening a new one -- resubmitting is otherwise indistinguishable
    // from a brand-new publication, since every edit changes the
    // approval token reserve() keys off. D1's cached status can be stale
    // (reconcile() only runs when something calls get_publication_status),
    // so confirm against GitHub's real state before deciding to write.
    const active = await publicationRepository.findActiveRequest({ draftId, actor });
    if (active) {
      const livePullRequest = await github.getPullRequest(active.githubPrNumber);
      const stillOpen = !livePullRequest.merged && livePullRequest.state === "open";
      if (stillOpen) {
        const branchHead = await github.getBranchHead(active.githubBranch);
        if (plan.approvalToken === active.approvalToken) {
          const observed = branchHead.commitSha === active.githubCommitSha
            ? active
            : await publicationRepository.recordObservedHead({
                requestId: active.id,
                commitSha: branchHead.commitSha,
                actor
              });
          return { ...observed, submissionOutcome: "unchanged" };
        }
        const draftCommitSha = active.draftCommitSha || active.githubCommitSha;
        if (
          branchHead.commitSha !== draftCommitSha &&
          active.reviewSyncHeadSha !== branchHead.commitSha
        ) {
          throw new PublicationConflictError(
            "The pull-request branch contains manual or review-suggestion commits " +
            "that are not represented by the authoring draft. Call " +
            "sync_review_changes_to_draft before resubmitting so those changes are preserved."
          );
        }
        // No markFailed on error here: the PR is untouched and still
        // open, so the next submit() finds it again via
        // findActiveRequest and retries cleanly. Marking this row
        // 'failed' would make the *next* resubmission fall through to
        // reserve() with a fresh approval token that can't match this
        // row, silently minting a duplicate PR in exactly the failure
        // path this feature exists to close.
        await reserveReviewWrites({
          requestId: active.id,
          count: 1,
          action: "resubmit-draft",
          actor
        });
        let commitSha;
        try {
          commitSha = await github.appendCommit({
            baseCommitSha: branchHead.commitSha,
            baseTreeSha: branchHead.treeSha,
            branch: active.githubBranch,
            message: `${plan.action === "create" ? "Add" : "Update"} ${plan.puzzle.title}`,
            changes: plan.changes
          });
        } catch (error) {
          if (error instanceof GitHubApiError && error.status === 422) {
            throw new PublicationConflictError(
              "The pull-request branch changed while resubmitting; fetch feedback and synchronize again"
            );
          }
          throw error;
        }
        const amended = await publicationRepository.recordAmendedCommit({
          requestId: active.id,
          contentHash: draft.contentHash,
          approvalToken: plan.approvalToken,
          baseCommitSha: plan.base.commitSha,
          commitSha,
          publicationOptions: plan.options,
          actor
        });
        return { ...amended, submissionOutcome: "amended" };
      }
      // D1 said pull-request-open but GitHub disagrees (merged, or closed
      // without merging) -- correct D1 before falling through to open a
      // genuinely new request below.
      await publicationRepository.reconcile({ requestId: active.id, pullRequest: livePullRequest, actor });
    }

    const request = await publicationRepository.reserve({
      draftId,
      contentHash: draft.contentHash,
      approvalToken: plan.approvalToken,
      baseCommitSha: plan.base.commitSha,
      puzzleId: plan.puzzle.id,
      publicationOptions: plan.options,
      actor
    });
    if (["pull-request-open", "merged", "rejected"].includes(request.status)) {
      return request;
    }
    try {
      let commitSha = request.githubCommitSha;
      const existingBranch = await github.getOptionalBranchHead(request.githubBranch);
      if (existingBranch) {
        if (commitSha && existingBranch.commitSha !== commitSha) {
          throw new PublicationConflictError(
            `Publication branch ${request.githubBranch} no longer points to its recorded commit`
          );
        }
        commitSha = existingBranch.commitSha;
      } else {
        commitSha = await github.createCommit({
          baseCommitSha: plan.base.commitSha,
          baseTreeSha: plan.base.treeSha,
          branch: request.githubBranch,
          message: `${plan.action === "create" ? "Add" : "Update"} ${plan.puzzle.title}`,
          changes: plan.changes
        });
        await publicationRepository.recordCommit({ requestId: request.id, commitSha, actor });
      }
      const pullRequest = await github.findPullRequest(request.githubBranch) ||
        await github.createPullRequest({
        branch: request.githubBranch,
        title: `${plan.action === "create" ? "Add" : "Update"} puzzle: ${plan.puzzle.title}`,
        body:
          `Publishes ${draftKind} \`${draftId}\`.\n\n` +
          `Content hash: \`${draft.contentHash}\`\n\n` +
          (plan.categoryRegistration
            ? `Registers category: **${plan.categoryRegistration.name}**\n\n`
            : "") +
          `Generated files:\n${plan.changes.map(change =>
            `- \`${change.relativePath}\`${change.content === null ? " (removed)" : ""}`
          ).join("\n")}`
      });
      const opened = await publicationRepository.recordPullRequest({
        requestId: request.id,
        commitSha,
        pullRequest,
        actor
      });
      return { ...opened, submissionOutcome: "opened" };
    } catch (error) {
      await publicationRepository.markFailed({
        requestId: request.id,
        message: error instanceof Error ? error.message : String(error),
        actor
      });
      throw error;
    }
  }

  async function status({ requestId, actor }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) return request;
    const pullRequest = await github.getPullRequest(request.githubPrNumber);
    return publicationRepository.reconcile({ requestId, pullRequest, actor });
  }

  function mergeReviewFeedback(comments, threads) {
    const commentsById = new Map(comments.map(comment => [String(comment.id), comment]));
    const threadByCommentId = new Map();
    const enrichedThreads = threads.map(thread => {
      const enrichedComments = thread.comments.map(graphqlComment => {
        const rest = commentsById.get(String(graphqlComment.id));
        const merged = {
          ...graphqlComment,
          ...(rest || {}),
          threadId: thread.id,
          threadVersion: thread.version,
          threadResolved: thread.isResolved,
          threadOutdated: thread.isOutdated
        };
        if (merged.id != null) threadByCommentId.set(String(merged.id), thread);
        return merged;
      });
      return { ...thread, comments: enrichedComments };
    });
    return {
      threads: enrichedThreads,
      comments: comments.map(comment => {
        const thread = threadByCommentId.get(String(comment.id));
        return {
          ...comment,
          threadId: thread?.id || null,
          threadVersion: thread?.version || null,
          threadResolved: thread?.isResolved ?? null,
          threadOutdated: thread?.isOutdated ?? null
        };
      })
    };
  }

  function threadSnapshot(threads) {
    return threads.map(thread => ({
      id: thread.id,
      version: thread.version,
      isResolved: thread.isResolved,
      isOutdated: thread.isOutdated
    }));
  }

  function snapshotsMatch(left, right) {
    return JSON.stringify(left || []) === JSON.stringify(right || []);
  }

  function qualitySnapshot(quality) {
    return {
      state: quality.state,
      checkRuns: quality.checkRuns.map(check => ({
        id: check.id,
        name: check.name,
        status: check.status,
        conclusion: check.conclusion
      })),
      statuses: quality.statuses.map(status => ({
        id: status.id,
        context: status.context,
        state: status.state
      }))
    };
  }

  function reviewSnapshot(reviews) {
    return reviews.map(review => ({
      id: review.id,
      author: review.author,
      state: review.state,
      body: review.body,
      submittedAt: review.submittedAt
    }));
  }

  function blockingReviews(reviews) {
    const decisiveByAuthor = new Map();
    for (const review of reviews) {
      if (!["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(review.state)) continue;
      decisiveByAuthor.set(review.author || `review-${review.id}`, review);
    }
    return [...decisiveByAuthor.values()].filter(review =>
      review.state === "CHANGES_REQUESTED"
    );
  }

  function qualityBlockers(quality) {
    return [
      ...quality.checkRuns
        .filter(check => check.status !== "completed" || ![
          "success", "neutral", "skipped"
        ].includes(check.conclusion))
        .map(check => ({
          type: "check",
          name: check.name,
          status: check.status,
          conclusion: check.conclusion
        })),
      ...quality.statuses
        .filter(status => status.state !== "success")
        .map(status => ({
          type: "status",
          name: status.context,
          status: status.state,
          conclusion: null
        }))
    ];
  }

  function reviewBurden({ remainingThreads, outstandingReviewRequests, quality }) {
    return remainingThreads.length +
      outstandingReviewRequests.length +
      qualityBlockers(quality).length;
  }

  async function reviewProgressFingerprint(feedback) {
    return sha256Json({
      treeSha: feedback.branchTreeSha,
      openConcerns: feedback.remainingThreads.map(thread => ({
        path: thread.path,
        line: thread.line,
        subjectType: thread.subjectType,
        comments: thread.comments.map(comment => ({
          author: comment.author,
          body: comment.body,
          outdated: comment.outdated
        }))
      })).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
      requestedChanges: feedback.outstandingReviewRequests.map(review => ({
        author: review.author,
        body: review.body,
        state: review.state
      })).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
      qualityBlockers: qualityBlockers(feedback.quality)
        .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
    });
  }

  async function reserveReviewWrites({ requestId, count, action, actor }) {
    const reservation = await publicationRepository.reserveReviewWrites({
      requestId,
      count,
      maximum: MAX_AUTOMATED_REVIEW_WRITES,
      action,
      actor
    });
    if (!reservation.allowed) {
      if (reservation.reason === "maximum-write-actions") {
        const feedback = await reviewFeedback({ requestId, actor });
        const report = {
          reason: reservation.reason,
          attemptedAction: reservation.attemptedAction,
          attemptedCount: reservation.attemptedCount,
          openedAt: new Date().toISOString(),
          reviewRoundCount: reservation.publication.reviewRoundCount,
          reviewWriteCount: reservation.publication.reviewWriteCount,
          roundHistory: reservation.publication.reviewRoundHistory,
          maximumReviewRounds: MAX_AUTOMATED_REVIEW_ROUNDS,
          maximumReviewWrites: MAX_AUTOMATED_REVIEW_WRITES,
          maximumStagnantRounds: MAX_STAGNANT_REVIEW_ROUNDS,
          remainingThreads: feedback.remainingThreads.map(thread => ({
            id: thread.id,
            version: thread.version,
            path: thread.path,
            latestComment: thread.comments.at(-1)?.body || null
          })),
          outstandingReviewRequests: feedback.outstandingReviewRequests,
          quality: feedback.quality,
          recommendation:
            "Stop automated mutations. Present this report to the human and request a decision, " +
            "scope adjustment, or explicit authorization to reset the circuit."
        };
        await publicationRepository.tripReviewCircuit({
          requestId,
          reason: reservation.reason,
          report,
          actor
        });
      }
      throw new PublicationConflictError(
        `The automated review circuit breaker is open (${reservation.reason}). ` +
        "Stop the agent loop and present its report to the human. Only call " +
        "reset_review_circuit after explicit human authorization."
      );
    }
    return reservation.publication;
  }

  // GitHub thread state is authoritative. A human can accept/reject and
  // resolve comments in the web UI before the authoring assistant runs; the
  // assistant sees that disposition and works only on the remaining open
  // snapshot. Thread versions include every comment/reply timestamp so stale
  // actions fail closed if either a reviewer or a human intervenes later.
  async function reviewFeedback({ requestId, actor }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return {
        requestId: request.id,
        hasPullRequest: false,
        pullRequestNumber: null,
        pullRequestUrl: null,
        branchHeadSha: null,
        branchTreeSha: null,
        draftCommitSha: request.draftCommitSha || request.githubCommitSha,
        draftSyncRequired: false,
        quality: { state: "none", checkRuns: [], statuses: [] },
        outstandingReviewRequests: [],
        reviews: [],
        threads: [],
        remainingThreads: [],
        comments: [],
        reviewHandoff: request.reviewHandoff,
        reviewHandoffCurrent: false,
        circuitBreaker: {
          open: !!request.reviewCircuitOpenAt,
          reason: request.reviewCircuitReason,
          report: request.reviewCircuitReport,
          roundHistory: request.reviewRoundHistory,
          reviewRoundCount: request.reviewRoundCount,
          reviewWriteCount: request.reviewWriteCount,
          stagnantRounds: request.reviewStagnantRounds,
          maximumReviewRounds: MAX_AUTOMATED_REVIEW_ROUNDS,
          maximumReviewWrites: MAX_AUTOMATED_REVIEW_WRITES,
          maximumStagnantRounds: MAX_STAGNANT_REVIEW_ROUNDS
        },
        automationState: "not-submitted"
      };
    }
    const [reviews, comments, threads, branchHead] = await Promise.all([
      github.listPullRequestReviews(request.githubPrNumber),
      github.listPullRequestComments(request.githubPrNumber),
      github.listPullRequestReviewThreads(request.githubPrNumber),
      github.getBranchHead(request.githubBranch)
    ]);
    const quality = await github.getCommitQualityState(branchHead.commitSha);
    const merged = mergeReviewFeedback(comments, threads);
    const draftCommitSha = request.draftCommitSha || request.githubCommitSha;
    const currentThreadSnapshot = threadSnapshot(merged.threads);
    const currentQualitySnapshot = qualitySnapshot(quality);
    const currentReviewSnapshot = reviewSnapshot(reviews);
    const reviewHandoffCurrent = !!request.reviewHandoff &&
      request.reviewHandoffHeadSha === branchHead.commitSha &&
      snapshotsMatch(request.reviewHandoff.threadSnapshot, currentThreadSnapshot) &&
      snapshotsMatch(request.reviewHandoff.reviewSnapshot, currentReviewSnapshot) &&
      JSON.stringify(request.reviewHandoff.qualitySnapshot) ===
        JSON.stringify(currentQualitySnapshot);
    const remainingThreads = merged.threads.filter(thread => !thread.isResolved);
    const outstandingReviewRequests = blockingReviews(reviews);
    const draftSynchronized = branchHead.commitSha === draftCommitSha || (
      request.reviewSyncHeadSha === branchHead.commitSha &&
      request.reviewSyncContentHash === request.contentHash
    );
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      pullRequestUrl: request.githubPrUrl,
      branchHeadSha: branchHead.commitSha,
      branchTreeSha: branchHead.treeSha,
      draftCommitSha,
      draftSyncRequired: !draftSynchronized,
      quality,
      outstandingReviewRequests,
      reviews,
      ...merged,
      remainingThreads,
      reviewHandoff: request.reviewHandoff,
      reviewHandoffCurrent,
      circuitBreaker: {
        open: !!request.reviewCircuitOpenAt,
        reason: request.reviewCircuitReason,
        report: request.reviewCircuitReport,
        roundHistory: request.reviewRoundHistory,
        reviewRoundCount: request.reviewRoundCount,
        reviewWriteCount: request.reviewWriteCount,
        stagnantRounds: request.reviewStagnantRounds,
        maximumReviewRounds: MAX_AUTOMATED_REVIEW_ROUNDS,
        maximumReviewWrites: MAX_AUTOMATED_REVIEW_WRITES,
        maximumStagnantRounds: MAX_STAGNANT_REVIEW_ROUNDS
      },
      automationState: request.reviewCircuitOpenAt
        ? "circuit-breaker-open"
        : reviewHandoffCurrent
        ? request.reviewHandoff.status
        : !draftSynchronized
          ? "sync-required"
          : remainingThreads.length
            ? "ai-reviewing"
            : outstandingReviewRequests.length
              ? "review-changes-requested"
              : quality.state === "pending" || quality.state === "failure"
                ? "checks-incomplete"
                : "ready-to-prepare-handoff"
    };
  }

  // Applies one exact GitHub suggestion fence as a normal commit on the PR
  // branch. This intentionally does not attempt to synthesize a fix from a
  // prose comment: the only zero-reasoning path is one where GitHub supplied
  // both the replacement and an unambiguous live line range. The live thread
  // anchors are used rather than assuming the original
  // reviewed commit must still be the branch tip. That permits a human to
  // accept one suggestion first while leaving independent, still-current
  // suggestions for the assistant. Resolved/outdated/changed threads are
  // never applied.
  async function applyReviewSuggestion({
    requestId,
    commentId,
    threadId,
    expectedThreadVersion,
    expectedUpdatedAt,
    actor
  }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, applied: false };
    }
    const pullRequest = await github.getPullRequest(request.githubPrNumber);
    if (pullRequest.merged || pullRequest.state !== "open") {
      throw new PublicationConflictError(
        `Pull request #${request.githubPrNumber} is no longer open`
      );
    }
    const [comment, threads] = await Promise.all([
      github.getPullRequestComment(commentId),
      github.listPullRequestReviewThreads(request.githubPrNumber)
    ]);
    if (comment.pullRequestNumber !== request.githubPrNumber) {
      throw new PublicationConflictError(
        `Review comment ${commentId} does not belong to pull request #${request.githubPrNumber}`
      );
    }
    if (comment.updatedAt !== expectedUpdatedAt) {
      throw new PublicationConflictError(
        `Review comment ${commentId} changed after it was fetched; call get_review_feedback again`
      );
    }
    const thread = threads.find(candidate => candidate.id === threadId);
    if (!thread || !thread.comments.some(candidate => String(candidate.id) === String(commentId))) {
      throw new PublicationConflictError(
        `Review comment ${commentId} is not in thread ${threadId} on pull request #${request.githubPrNumber}`
      );
    }
    if (thread.version !== expectedThreadVersion) {
      throw new PublicationConflictError(
        `Review thread ${threadId} changed after it was fetched; call get_review_feedback again`
      );
    }
    if (thread.isResolved) {
      throw new PublicationConflictError(
        `Review thread ${threadId} was already resolved, possibly by a human; no suggestion was applied`
      );
    }
    if (thread.isOutdated) {
      throw new PublicationConflictError(
        `Review thread ${threadId} is outdated; inspect the current code instead of applying its old line range`
      );
    }
    if (comment.suggestionCount !== 1 || comment.suggestion === null) {
      throw new PublicationConflictError(
        comment.suggestionCount > 1
          ? `Review comment ${commentId} contains multiple suggestions and is ambiguous`
          : `Review comment ${commentId} has no exact GitHub suggestion to apply`
      );
    }
    if (!comment.canApplySuggestion) {
      throw new PublicationConflictError(
        `Review comment ${commentId} is not an applyable live right-side line suggestion`
      );
    }
    const startLine = thread.startLine ?? thread.line;
    const endLine = thread.line;
    if (
      thread.subjectType !== "LINE" ||
      thread.side !== "RIGHT" ||
      thread.startSide !== "RIGHT" ||
      !Number.isInteger(startLine) ||
      !Number.isInteger(endLine) ||
      endLine < startLine
    ) {
      throw new PublicationConflictError(
        `Review thread ${threadId} no longer has an applyable live right-side line range`
      );
    }
    const branchHead = await github.getBranchHead(request.githubBranch);
    const [source, treeEntry] = await Promise.all([
      github.readFile(thread.path, branchHead.commitSha),
      github.getTreeEntry(thread.path, branchHead.treeSha)
    ]);
    if (source === null || !treeEntry) {
      throw new PublicationConflictError(
        `Review suggestion target no longer exists: ${thread.path}`
      );
    }
    if (treeEntry.type !== "blob" || !["100644", "100755"].includes(treeEntry.mode)) {
      throw new PublicationConflictError(
        `Review suggestion target is not a regular text file: ${thread.path}`
      );
    }
    const content = applySuggestionToSource(source, {
      startLine,
      endLine,
      suggestion: comment.suggestion
    });
    if (content === source) {
      return {
        requestId: request.id,
        hasPullRequest: true,
        pullRequestNumber: request.githubPrNumber,
        commentId,
        applied: false,
        unchanged: true,
        githubCommitSha: branchHead.commitSha
      };
    }
    await reserveReviewWrites({
      requestId: request.id,
      count: 1,
      action: "apply-review-suggestion",
      actor
    });
    let commitSha;
    try {
      commitSha = await github.appendCommit({
        baseCommitSha: branchHead.commitSha,
        baseTreeSha: branchHead.treeSha,
        branch: request.githubBranch,
        message: suggestionCommitMessage(comment),
        changes: [{ relativePath: thread.path, mode: treeEntry.mode, content }]
      });
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 422) {
        throw new PublicationConflictError(
          `The pull-request branch changed while applying review comment ${commentId}; retry from fresh feedback`
        );
      }
      throw error;
    }
    await publicationRepository.recordReviewSuggestionCommit({
      requestId: request.id,
      commitSha,
      actor
    });
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      commentId,
      threadId,
      path: thread.path,
      startLine,
      endLine,
      applied: true,
      unchanged: false,
      githubCommitSha: commitSha
    };
  }

  // Resolve only the exact thread snapshots the assistant explicitly
  // dispositioned. A new review arriving between fetch and resolve is left
  // open, and a human-resolved target is counted as such rather than undone.
  async function resolveReviewFeedback({ requestId, threads: targets, actor }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, resolvedCount: 0 };
    }
    const liveThreads = await github.listPullRequestReviewThreads(request.githubPrNumber);
    const liveById = new Map(liveThreads.map(thread => [thread.id, thread]));
    const seen = new Set();
    const selected = targets.map(target => {
      if (seen.has(target.threadId)) {
        throw new PublicationConflictError(`Review thread ${target.threadId} was selected twice`);
      }
      seen.add(target.threadId);
      const thread = liveById.get(target.threadId);
      if (!thread) {
        throw new PublicationConflictError(
          `Review thread ${target.threadId} no longer exists on pull request #${request.githubPrNumber}`
        );
      }
      if (thread.version !== target.threadVersion) {
        throw new PublicationConflictError(
          `Review thread ${target.threadId} changed after it was fetched; call get_review_feedback again`
        );
      }
      return thread;
    });
    const unresolved = selected.filter(thread => !thread.isResolved);
    await reserveReviewWrites({
      requestId: request.id,
      count: unresolved.length,
      action: "resolve-review-threads",
      actor
    });
    for (const thread of unresolved) {
      await github.resolveReviewThread(thread.id);
    }
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      requestedCount: selected.length,
      resolvedCount: unresolved.length,
      alreadyResolvedCount: selected.length - unresolved.length
    };
  }

  // For a review comment being judged incorrect and not acted on, not
  // one being fixed -- the fix itself (a generated commit) already is
  // the visible record for that case. Without this, resolving a
  // dismissed thread (resolveReviewFeedback above still resolves it,
  // deliberately, so it doesn't reappear as unaddressed) would leave no
  // trace of *why* -- a human looking at a resolved-but-unchanged
  // thread later has no way to tell "fixed" from "silently ignored."
  async function replyToReviewComment({
    requestId,
    commentId,
    threadId,
    expectedThreadVersion,
    body,
    actor
  }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, replied: false };
    }
    const threads = await github.listPullRequestReviewThreads(request.githubPrNumber);
    const thread = threads.find(candidate => candidate.id === threadId);
    if (!thread || !thread.comments.some(candidate => String(candidate.id) === String(commentId))) {
      throw new PublicationConflictError(
        `Review comment ${commentId} is not in thread ${threadId} on pull request #${request.githubPrNumber}`
      );
    }
    if (thread.version !== expectedThreadVersion) {
      throw new PublicationConflictError(
        `Review thread ${threadId} changed after it was fetched; call get_review_feedback again`
      );
    }
    if (thread.isResolved) {
      throw new PublicationConflictError(
        `Review thread ${threadId} was already resolved, possibly by a human; no reply was posted`
      );
    }
    await reserveReviewWrites({
      requestId: request.id,
      count: 1,
      action: "reply-to-review-comment",
      actor
    });
    await github.replyToPullRequestComment(request.githubPrNumber, commentId, body);
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      replied: true
    };
  }

  // Reconcile human-authored commits on the PR branch with the D1 source of
  // truth before the assistant edits or resubmits it. Only changes that the
  // publication generator can reproduce are accepted. This deliberately
  // fails closed for unrelated/manual repository edits, preventing a later
  // generated commit from silently overwriting or pretending to own them.
  async function syncReviewChangesToDraft({ requestId, actor }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, synced: false };
    }
    const pullRequest = await github.getPullRequest(request.githubPrNumber);
    if (pullRequest.merged || pullRequest.state !== "open") {
      throw new PublicationConflictError(
        `Pull request #${request.githubPrNumber} is no longer open`
      );
    }
    const draft = await draftRepository.get({ draftId: request.draftId, actor });
    const branchHead = await github.getBranchHead(request.githubBranch);
    const draftCommitSha = request.draftCommitSha || request.githubCommitSha;
    if (!draftCommitSha) {
      throw new PublicationConflictError(
        "This publication request has no recorded draft commit to compare"
      );
    }
    if (branchHead.commitSha === draftCommitSha) {
      const publication = await publicationRepository.recordReviewSync({
        requestId: request.id,
        commitSha: branchHead.commitSha,
        contentHash: draft.contentHash,
        actor
      });
      return {
        requestId: request.id,
        hasPullRequest: true,
        pullRequestNumber: request.githubPrNumber,
        synced: true,
        changedPaths: [],
        importedCanonicalDocument: false,
        draft,
        publication
      };
    }
    if (!request.publicationOptions) {
      throw new PublicationConflictError(
        "This older publication request does not record the options needed to " +
        "safely regenerate its files; open a fresh publication request"
      );
    }
    const comparison = await github.compareCommits(draftCommitSha, branchHead.commitSha);
    if (comparison.status !== "ahead") {
      throw new PublicationConflictError(
        `The pull-request branch no longer descends from the recorded draft commit (${comparison.status})`
      );
    }
    if (comparison.filesTruncated) {
      throw new PublicationConflictError(
        "The manual review change set is too large to verify completely through GitHub's compare API"
      );
    }
    const changedPaths = [...new Set(comparison.files.flatMap(file =>
      file.previousPath ? [file.previousPath, file.path] : [file.path]
    ))];
    const canonicalPath = `content/puzzles/${draft.document.id}.ccpuzzle.json`;
    const canonicalChanged = changedPaths.includes(canonicalPath);
    const lastSyncedContentHash = request.reviewSyncContentHash || request.contentHash;
    if (canonicalChanged && draft.contentHash !== lastSyncedContentHash) {
      throw new PublicationConflictError(
        "The authoring draft was edited after its last PR synchronization. " +
        "Importing the human canonical-file change would overwrite those edits; " +
        "reconcile the draft and GitHub versions explicitly."
      );
    }
    let candidate = draft.document;
    if (canonicalChanged) {
      const source = await github.readFile(canonicalPath, branchHead.commitSha);
      if (source === null) {
        throw new PublicationConflictError(
          `The canonical draft file was removed by review changes: ${canonicalPath}`
        );
      }
      try {
        candidate = JSON.parse(source);
      } catch {
        throw new PublicationConflictError(
          `The reviewed canonical draft file is not valid JSON: ${canonicalPath}`
        );
      }
    }
    const planned = await planDocument(candidate, request.publicationOptions, null, {
      draftId: request.draftId
    });
    if (!planned.valid) {
      throw new PublicationConflictError(
        `Review changes cannot be imported into a valid draft:\n${planned.errors.join("\n")}`
      );
    }
    const plannedByPath = new Map(
      planned.plan.changes.map(change => [change.relativePath, change.content])
    );
    const liveSources = await Promise.all(changedPaths.map(path =>
      github.readFile(path, branchHead.commitSha)
    ));
    // The canonical document is imported as the draft, not regenerated as
    // an artifact. Publication rewrites leftover link/citation fields, so
    // a byte match against formattedJson(canonical.simplified) would reject
    // any human edit to a file that still uses `link` (or differs only in
    // formatting) even though that file is about to become the draft.
    // Generated files still have to round-trip, or a later submit would
    // silently overwrite unrelated review edits.
    const unrepresented = changedPaths.filter((path, index) => {
      if (path === canonicalPath) return false;
      return !plannedByPath.has(path) || plannedByPath.get(path) !== liveSources[index];
    });
    if (unrepresented.length) {
      throw new PublicationConflictError(
        "The draft does not yet reproduce these manually changed PR files: " +
        unrepresented.join(", ") +
        ". Update the draft to represent the accepted changes, then sync again."
      );
    }
    await reserveReviewWrites({
      requestId: request.id,
      count: 1,
      action: "sync-review-changes-to-draft",
      actor
    });
    const syncedDraft = canonicalChanged
      ? await draftRepository.save({
        draftId: request.draftId,
        document: candidate,
        actor,
        expectedRevision: draft.revision
      })
      : draft;
    const publication = await publicationRepository.recordReviewSync({
      requestId: request.id,
      commitSha: branchHead.commitSha,
      contentHash: syncedDraft.contentHash,
      actor
    });
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      synced: true,
      changedPaths,
      importedCanonicalDocument: canonicalChanged,
      draft: syncedDraft,
      publication
    };
  }

  // A round is a semantic checkpoint after agents have acted and fresh
  // feedback/check results have arrived. Merely polling get_review_feedback
  // never calls this and therefore never consumes the round budget. Repeating
  // this exact checkpoint without any write or external-state change is also
  // idempotent rather than counting as another round.
  async function completeReviewRound({ requestId, summary, actor }) {
    let request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, counted: false };
    }
    if (request.reviewCircuitOpenAt) {
      return {
        requestId: request.id,
        hasPullRequest: true,
        pullRequestNumber: request.githubPrNumber,
        counted: false,
        automationState: "circuit-breaker-open",
        circuitBreaker: request.reviewCircuitReport
      };
    }
    const feedback = await reviewFeedback({ requestId, actor });
    request = await publicationRepository.get({ requestId, actor });
    if (request.reviewCircuitOpenAt) {
      return {
        requestId: request.id,
        hasPullRequest: true,
        pullRequestNumber: request.githubPrNumber,
        counted: false,
        automationState: "circuit-breaker-open",
        circuitBreaker: request.reviewCircuitReport
      };
    }
    const fingerprint = await reviewProgressFingerprint(feedback);
    if (
      request.reviewLastFingerprint === fingerprint &&
      request.reviewLastRoundWriteCount === request.reviewWriteCount
    ) {
      return {
        requestId: request.id,
        hasPullRequest: true,
        pullRequestNumber: request.githubPrNumber,
        counted: false,
        duplicateCheckpoint: true,
        automationState: feedback.automationState,
        reviewRoundCount: request.reviewRoundCount,
        reviewWriteCount: request.reviewWriteCount
      };
    }

    const burden = reviewBurden(feedback);
    const history = request.reviewFingerprintHistory.slice(-REVIEW_FINGERPRINT_HISTORY);
    const repeatedState = history.includes(fingerprint);
    const firstRound = request.reviewLastFingerprint === null;
    const reducedBurden = request.reviewLastBurden !== null &&
      burden < request.reviewLastBurden;
    const novelEquivalentState = request.reviewLastBurden !== null &&
      burden === request.reviewLastBurden && !repeatedState;
    const madeProgress = burden === 0 || firstRound || reducedBurden || novelEquivalentState;
    const stagnantRounds = burden === 0 || madeProgress
      ? 0
      : request.reviewStagnantRounds + 1;
    const roundCount = request.reviewRoundCount + 1;
    const fingerprintHistory = [...history, fingerprint]
      .slice(-REVIEW_FINGERPRINT_HISTORY);
    const roundHistory = [...request.reviewRoundHistory, {
      round: roundCount,
      summary,
      fingerprint,
      burden,
      madeProgress,
      repeatedState,
      writeCount: request.reviewWriteCount,
      headCommitSha: feedback.branchHeadSha,
      recordedAt: new Date().toISOString()
    }].slice(-MAX_AUTOMATED_REVIEW_ROUNDS);
    const circuitReason = burden > 0 && stagnantRounds >= MAX_STAGNANT_REVIEW_ROUNDS
      ? "no-semantic-progress"
      : burden > 0 && roundCount >= MAX_AUTOMATED_REVIEW_ROUNDS
        ? "maximum-review-rounds"
        : null;
    const circuitReport = circuitReason ? {
      reason: circuitReason,
      summary,
      openedAt: new Date().toISOString(),
      reviewRoundCount: roundCount,
      reviewWriteCount: request.reviewWriteCount,
      stagnantRounds,
      burden,
      maximumReviewRounds: MAX_AUTOMATED_REVIEW_ROUNDS,
      maximumReviewWrites: MAX_AUTOMATED_REVIEW_WRITES,
      maximumStagnantRounds: MAX_STAGNANT_REVIEW_ROUNDS,
      roundHistory,
      remainingThreads: feedback.remainingThreads.map(thread => ({
        id: thread.id,
        version: thread.version,
        path: thread.path,
        latestComment: thread.comments.at(-1)?.body || null
      })),
      outstandingReviewRequests: feedback.outstandingReviewRequests,
      quality: feedback.quality,
      recommendation:
        "Stop automated mutations. Present this report to the human and request a decision, " +
        "scope adjustment, or explicit authorization to reset the circuit."
    } : null;
    const publication = await publicationRepository.recordReviewRound({
      requestId: request.id,
      roundCount,
      stagnantRounds,
      fingerprint,
      burden,
      fingerprintHistory,
      roundHistory,
      writeCount: request.reviewWriteCount,
      circuitReason,
      circuitReport,
      actor
    });
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      counted: true,
      madeProgress,
      repeatedState,
      burden,
      reviewRoundCount: publication.reviewRoundCount,
      reviewWriteCount: publication.reviewWriteCount,
      stagnantRounds: publication.reviewStagnantRounds,
      automationState: publication.reviewCircuitOpenAt
        ? "circuit-breaker-open"
        : feedback.automationState,
      circuitBreaker: publication.reviewCircuitReport
    };
  }

  async function resetReviewCircuit({ requestId, reason, humanConfirmed, actor }) {
    if (humanConfirmed !== true) {
      throw new PublicationConflictError(
        "Resetting the review circuit requires explicit human authorization"
      );
    }
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.reviewCircuitOpenAt) {
      throw new PublicationConflictError("The automated review circuit breaker is not open");
    }
    const publication = await publicationRepository.resetReviewCircuit({
      requestId: request.id,
      reason,
      actor
    });
    return {
      requestId: request.id,
      hasPullRequest: !!request.githubPrNumber,
      pullRequestNumber: request.githubPrNumber,
      reset: true,
      automationState: "ai-reviewing",
      resetAt: publication.reviewCircuitResetAt,
      resetReason: publication.reviewCircuitResetReason,
      publication
    };
  }

  // Close the autonomous review loop with a snapshot-bound report for the
  // human who retains merge authority. Routine feedback must already be
  // dispositioned by agents; only genuine decisions may remain open and every
  // one must be explicitly escalated. The second live read prevents a handoff
  // from being recorded over a concurrent review, push, or check transition.
  async function prepareHumanReviewHandoff({
    requestId,
    summary,
    collaborators,
    dispositions,
    escalations,
    actor
  }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, prepared: false };
    }
    if (request.reviewCircuitOpenAt) {
      throw new PublicationConflictError(
        `The automated review circuit breaker is open (${request.reviewCircuitReason}); ` +
        "handoff the circuit report or obtain explicit human authorization to reset it"
      );
    }
    const pullRequest = await github.getPullRequest(request.githubPrNumber);
    if (pullRequest.merged || pullRequest.state !== "open") {
      throw new PublicationConflictError(
        `Pull request #${request.githubPrNumber} is no longer open`
      );
    }
    const draft = await draftRepository.get({ draftId: request.draftId, actor });
    const branchHead = await github.getBranchHead(request.githubBranch);
    const [threads, reviews, quality] = await Promise.all([
      github.listPullRequestReviewThreads(request.githubPrNumber),
      github.listPullRequestReviews(request.githubPrNumber),
      github.getCommitQualityState(branchHead.commitSha)
    ]);
    const draftCommitSha = request.draftCommitSha || request.githubCommitSha;
    const draftSynchronized = branchHead.commitSha === draftCommitSha || (
      request.reviewSyncHeadSha === branchHead.commitSha &&
      request.reviewSyncContentHash === draft.contentHash
    );
    if (!draftSynchronized) {
      throw new PublicationConflictError(
        "The PR head is not represented by the current authoring draft; call " +
        "sync_review_changes_to_draft before preparing the human handoff"
      );
    }
    if (quality.state === "pending" || quality.state === "failure") {
      throw new PublicationConflictError(
        `Pull-request checks are ${quality.state}; agents must finish the CI loop before handoff`
      );
    }
    const outstandingReviewRequests = blockingReviews(reviews);
    if (outstandingReviewRequests.length) {
      throw new PublicationConflictError(
        "Reviewers still request changes: " +
        outstandingReviewRequests.map(review => review.author || review.id).join(", ")
      );
    }

    const liveById = new Map(threads.map(thread => [thread.id, thread]));
    const accounted = new Set();
    const normalizedDispositions = dispositions.map(disposition => {
      if (accounted.has(disposition.threadId)) {
        throw new PublicationConflictError(
          `Review thread ${disposition.threadId} appears more than once in the handoff`
        );
      }
      accounted.add(disposition.threadId);
      const thread = liveById.get(disposition.threadId);
      if (!thread || thread.version !== disposition.threadVersion) {
        throw new PublicationConflictError(
          `Review thread ${disposition.threadId} changed after it was summarized; fetch feedback again`
        );
      }
      if (!thread.isResolved) {
        throw new PublicationConflictError(
          `Review thread ${disposition.threadId} is still open and cannot be reported as dispositioned`
        );
      }
      return disposition;
    });
    const normalizedEscalations = escalations.map(escalation => {
      if (accounted.has(escalation.threadId)) {
        throw new PublicationConflictError(
          `Review thread ${escalation.threadId} appears more than once in the handoff`
        );
      }
      accounted.add(escalation.threadId);
      const thread = liveById.get(escalation.threadId);
      if (!thread || thread.version !== escalation.threadVersion) {
        throw new PublicationConflictError(
          `Review thread ${escalation.threadId} changed after it was escalated; fetch feedback again`
        );
      }
      if (thread.isResolved) {
        throw new PublicationConflictError(
          `Review thread ${escalation.threadId} is resolved and no longer needs a human decision`
        );
      }
      return escalation;
    });
    const unaccounted = threads.filter(thread => !accounted.has(thread.id));
    if (unaccounted.length) {
      throw new PublicationConflictError(
        "Every review thread needs an explicit disposition or escalation before handoff; missing: " +
        unaccounted.map(thread => thread.id).join(", ")
      );
    }

    const firstThreadSnapshot = threadSnapshot(threads);
    const firstQualitySnapshot = qualitySnapshot(quality);
    const firstReviewSnapshot = reviewSnapshot(reviews);
    const [finalHead, finalThreads, finalReviews, finalQuality] = await Promise.all([
      github.getBranchHead(request.githubBranch),
      github.listPullRequestReviewThreads(request.githubPrNumber),
      github.listPullRequestReviews(request.githubPrNumber),
      github.getCommitQualityState(branchHead.commitSha)
    ]);
    if (
      finalHead.commitSha !== branchHead.commitSha ||
      !snapshotsMatch(firstThreadSnapshot, threadSnapshot(finalThreads)) ||
      !snapshotsMatch(firstReviewSnapshot, reviewSnapshot(finalReviews)) ||
      JSON.stringify(firstQualitySnapshot) !== JSON.stringify(qualitySnapshot(finalQuality))
    ) {
      throw new PublicationConflictError(
        "The pull request changed while preparing its human handoff; fetch feedback and retry"
      );
    }

    const handoff = {
      status: normalizedEscalations.length
        ? "human-decision-needed"
        : "ready-for-human-review",
      summary,
      headCommitSha: branchHead.commitSha,
      collaborators,
      dispositions: normalizedDispositions,
      remainingDecisions: normalizedEscalations,
      reviewSummaries: reviews,
      reviewSnapshot: firstReviewSnapshot,
      quality,
      qualitySnapshot: firstQualitySnapshot,
      threadSnapshot: firstThreadSnapshot,
      preparedAt: new Date().toISOString()
    };
    const publication = await publicationRepository.recordReviewHandoff({
      requestId: request.id,
      commitSha: branchHead.commitSha,
      handoff,
      actor
    });
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      pullRequestUrl: request.githubPrUrl,
      prepared: true,
      handoff,
      publication
    };
  }

  async function planCatalogue(raw, expectedBaseCommitSha = null) {
    // Shape/reserved-id failures can return before any GitHub write, but
    // membership and duplicate-catalogue checks need the base branch: Git is
    // the published authority, and the Worker bundle may lag merges.
    const base = await github.getBranchHead();
    if (expectedBaseCommitSha && base.commitSha !== expectedBaseCommitSha) {
      throw new PublicationConflictError(
        `The ${github.baseBranch} branch changed after preview; preview again`
      );
    }

    const indexPath = "catalogues/index.js";
    const indexSource = await github.readFile(indexPath, base.commitSha);
    if (indexSource === null) {
      throw new Error(
        `Missing repository file: ${indexPath}. This is a repository ` +
        "configuration problem, not something this request can fix -- " +
        "check that the configured repo/branch still has this file."
      );
    }

    const entryIds = Array.isArray(raw?.entries)
      ? raw.entries.map(entry => entry?.id)
      : [];
    const validation = validateCatalogueCreation(raw, {
      puzzleIds: await publishedPuzzleIdsOnBranch(github, base.commitSha, entryIds),
      catalogues: cataloguesFromRegistrySource(indexSource)
    });
    if (!validation.valid) {
      return { valid: false, errors: validation.errors, preview: null };
    }
    const catalogue = validation.catalogue;
    const cataloguePath = `catalogues/${catalogue.id}.js`;

    // Hosted PRs deliberately omit catalogues/index.js -- the same fix
    // applied to puzzles/index.js (see the comment on planDocument's
    // `published` branch, above). GitHub does not honor merge=union, so two
    // concurrent create_catalogue PRs -- even for unrelated new catalogues
    // -- both splice this one shared file and the second to merge conflicts.
    // tools/ensure-catalogue-registry.mjs registers any on-disk catalogue
    // module still missing from the index, run by CI before validate and by
    // a post-merge workflow (sync-catalogue-registry.yml) after merge.
    const proposed = new Map([
      [cataloguePath, generatedCatalogueModule(catalogue)]
    ]);
    const changes = await Promise.all([...proposed].map(async ([relativePath, content]) => ({
      relativePath,
      original: await github.readFile(relativePath, base.commitSha),
      content
    })));

    const approvalToken = await publicationApprovalToken({
      baseCommitSha: base.commitSha,
      changes,
      options: catalogue
    });

    return {
      valid: true,
      errors: [],
      plan: { catalogue, changes, base, approvalToken },
      preview: {
        catalogueId: catalogue.id,
        title: catalogue.title,
        baseBranch: github.baseBranch,
        baseCommitSha: base.commitSha,
        affectedPaths: changes.map(change => change.relativePath),
        approvalToken,
        publicationMode: "github-pull-request",
        repositoryChanged: false,
        note: "create_catalogue computes this same plan itself and doesn't require this token back -- calling it directly, without previewing first, is fine. Entry ids are resolved against the GitHub base branch, not the Worker-bundled list_puzzles snapshot."
      }
    };
  }

  async function previewCatalogueCreation(raw) {
    return planCatalogue(raw);
  }

  // No D1 tracking here, unlike puzzle submit() -- a catalogue has no
  // draft/content-hash lifecycle to reconcile against (see
  // catalogueBranchName's comment above), so this is a single synchronous
  // attempt: plan, commit, open the PR, return. A failed call has nothing
  // to resume from; retrying just tries again with a fresh branch name.
  async function createCatalogue(raw, { actor } = {}) {
    const result = await planCatalogue(raw);
    if (!result.valid) throw new Error(result.errors.join("\n"));
    const plan = result.plan;
    const branch = catalogueBranchName(plan.catalogue.id);
    const commitSha = await github.createCommit({
      baseCommitSha: plan.base.commitSha,
      baseTreeSha: plan.base.treeSha,
      branch,
      message: `Add catalogue: ${plan.catalogue.title}`,
      changes: plan.changes
    });
    const pullRequest = await github.createPullRequest({
      branch,
      title: `Add catalogue: ${plan.catalogue.title}`,
      body:
        `Adds a new curated catalogue: **${plan.catalogue.title}** (\`${plan.catalogue.id}\`).\n\n` +
        (actor?.subject ? `Requested by: \`${actor.subject}\`\n\n` : "") +
        `Generated files:\n${plan.changes.map(change =>
            `- \`${change.relativePath}\`${change.content === null ? " (removed)" : ""}`
          ).join("\n")}`
    });
    return {
      catalogueId: plan.catalogue.id,
      githubBranch: branch,
      githubCommitSha: commitSha,
      githubPrNumber: pullRequest.number,
      githubPrUrl: pullRequest.url
    };
  }

  // update_catalogue's counterpart to planCatalogue: the caller resubmits
  // the catalogue's complete {id, title, info, entries} document, and the
  // whole catalogues/<id>.js file is regenerated from it -- add, remove,
  // and reorder are all just differences the caller made in that entries
  // list before calling, not separate operations this layer has to
  // support. `id` must already exist (validateCatalogueUpdate enforces
  // that; planCatalogue's sibling enforces the opposite for creation).
  // Entry puzzle ids resolve against the GitHub base branch, same reason
  // as planCatalogue: a puzzle that just merged shouldn't have to wait
  // for a Worker redeploy before a catalogue can list it.
  async function planCatalogueUpdate(raw, expectedBaseCommitSha = null) {
    const base = await github.getBranchHead();
    if (expectedBaseCommitSha && base.commitSha !== expectedBaseCommitSha) {
      throw new PublicationConflictError(
        `The ${github.baseBranch} branch changed after preview; preview again`
      );
    }

    const entryIds = Array.isArray(raw?.entries)
      ? raw.entries.map(entry => entry?.id)
      : [];
    const validation = validateCatalogueUpdate(raw, {
      puzzleIds: await publishedPuzzleIdsOnBranch(github, base.commitSha, entryIds),
      catalogues: contentService.catalogues
    });
    if (!validation.valid) {
      return { valid: false, errors: validation.errors, preview: null };
    }
    const catalogue = validation.catalogue;
    const cataloguePath = `catalogues/${catalogue.id}.js`;
    const original = await github.readFile(cataloguePath, base.commitSha);
    if (original === null) {
      throw new Error(
        `Missing repository file: ${cataloguePath}. This is a repository ` +
        "configuration problem, not something this request can fix -- " +
        "check that the configured repo/branch still has this file."
      );
    }

    const changes = [{
      relativePath: cataloguePath,
      original,
      content: generatedCatalogueModule(catalogue)
    }];

    const approvalToken = await publicationApprovalToken({
      baseCommitSha: base.commitSha,
      changes,
      options: catalogue
    });

    return {
      valid: true,
      errors: [],
      plan: { catalogue, changes, base, approvalToken },
      preview: {
        catalogueId: catalogue.id,
        title: catalogue.title,
        baseBranch: github.baseBranch,
        baseCommitSha: base.commitSha,
        affectedPaths: changes.map(change => change.relativePath),
        approvalToken,
        publicationMode: "github-pull-request",
        repositoryChanged: false,
        note: "update_catalogue computes this same plan itself and doesn't require this token back -- calling it directly, without previewing first, is fine. The entries you send replace the catalogue's current entries wholesale, so include every entry you want kept, not only the ones you're changing. Entry puzzle ids are resolved against the GitHub base branch, not the Worker-bundled list_puzzles snapshot."
      }
    };
  }

  async function previewUpdateCatalogue(raw) {
    return planCatalogueUpdate(raw);
  }

  // No D1 tracking here either, for the same reason createCatalogue has
  // none: a single synchronous attempt, plan then commit then open the
  // PR. A failed call has nothing to resume from; retrying just tries
  // again with a fresh branch name and a fresh base-branch read.
  async function updateCatalogue(raw, { actor } = {}) {
    const result = await planCatalogueUpdate(raw);
    if (!result.valid) throw new Error(result.errors.join("\n"));
    const plan = result.plan;
    const branch = catalogueBranchName(`${plan.catalogue.id}-update`);
    const commitSha = await github.createCommit({
      baseCommitSha: plan.base.commitSha,
      baseTreeSha: plan.base.treeSha,
      branch,
      message: `Update catalogue: ${plan.catalogue.title}`,
      changes: plan.changes
    });
    const pullRequest = await github.createPullRequest({
      branch,
      title: `Update catalogue: ${plan.catalogue.title}`,
      body:
        `Updates the entries of **${plan.catalogue.title}** (\`${plan.catalogue.id}\`).\n\n` +
        (actor?.subject ? `Requested by: \`${actor.subject}\`\n\n` : "") +
        `Changed files:\n${plan.changes.map(change => `- \`${change.relativePath}\``).join("\n")}`
    });
    return {
      catalogueId: plan.catalogue.id,
      githubBranch: branch,
      githubCommitSha: commitSha,
      githubPrNumber: pullRequest.number,
      githubPrUrl: pullRequest.url
    };
  }

  return {
    preview,
    status,
    reviewFeedback,
    applyReviewSuggestion,
    replyToReviewComment,
    resolveReviewFeedback,
    syncReviewChangesToDraft,
    completeReviewRound,
    resetReviewCircuit,
    prepareHumanReviewHandoff,
    submit,
    previewCatalogueCreation,
    createCatalogue,
    previewUpdateCatalogue,
    updateCatalogue
  };
}

export default createGitHubPublicationService;
