import { slugify } from "../puzzles/categories.js";
import { validateCatalogueCreation } from "./catalogueValidation.js";
import { validateCategoryRegistration } from "./categoryValidation.js";
import { validateJsonLdProfile } from "./jsonLdProfile.js";
import {
  addCatalogueEntrySource,
  formattedJson,
  generatedCatalogueModule,
  generatedPuzzleModule,
  publicationApprovalToken,
  registerCatalogueSource,
  registerCategorySource
} from "./publicationArtifacts.js";
import { puzzleFromJsonLd } from "./puzzleJsonLd.js";
import { puzzleSourceUrl } from "./puzzleManifest.js";
import { normalizeAuthoredPuzzleDocument } from "./simplifiedPuzzleSchema.js";

const MAX_GITHUB_FILE_BYTES = 2 * 1024 * 1024;
const MAX_GITHUB_JSON_BYTES = 2 * 1024 * 1024;
const API_VERSION = "2026-03-10";

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
// JSON-LD path (present as soon as a hosted puzzle PR merges); fall back to
// puzzles/index.js for older hand-authored puzzles that never got JSON-LD.
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
      `content/puzzles/${id}.ccpuzzle.jsonld`,
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

  // Pushes an amended commit onto a branch that already has an open pull
  // request, instead of opening a new one -- the GitHub-API equivalent of
  // `git commit --amend --no-edit && git push --force` on one's own open
  // PR. baseCommitSha/baseTreeSha are always the caller's current main
  // head (never the branch's own prior tip), so the new commit's file
  // blobs always contain everything currently on main plus this draft's
  // change -- createCommit/updateCommit write whole-file blobs, not
  // patches, so diffing against the branch's own stale tip instead could
  // silently drop unrelated content that landed on main since the PR was
  // opened. force: true is required since the new commit's parent is
  // main's current tip, not the branch's own prior commit -- a genuine
  // non-fast-forward update.
  async updateCommit({ baseCommitSha, baseTreeSha, branch, message, changes }) {
    const commitSha = await this.createTreeAndCommit({ baseTreeSha, baseCommitSha, message, changes });
    await this.request(this.repoPath(`/git/refs/heads/${encodedPath(branch)}`), {
      method: "PATCH",
      body: { sha: commitSha, force: true }
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
      mergeCommitSha: pullRequest.merge_commit_sha || null
    };
  }

  // A pull request and an issue share one comment endpoint in the GitHub
  // API -- this is not a typo for /pulls. Used to make an amend (see
  // updateCommit above) visible in the PR's own Conversation timeline:
  // the force-push itself is already recorded there as a native GitHub
  // event, but as a small, easy-to-miss system line, not the bold
  // commit-count signal a normal multi-commit PR shows. A comment sits
  // at the same visual weight as everything else in that timeline.
  async commentOnPullRequest(number, body) {
    await this.request(this.repoPath(`/issues/${number}/comments`), {
      method: "POST",
      body: { body }
    });
  }

  // Distinct from commentOnPullRequest above: this replies *within* a
  // specific review thread (the inline, file/line-anchored kind), not
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

  // Inline, file/line-anchored review comments (what a human or Copilot
  // leaves on a specific diff line) -- distinct from a review's own
  // summary body (listPullRequestReviews) and from a plain PR/issue
  // comment (commentOnPullRequest posts one of these, but reading them
  // back isn't needed here). 100 per page is GitHub's max and comfortably
  // covers any real review round for a single-puzzle PR; not worth
  // paginating further for this.
  async listPullRequestComments(number) {
    const response = await this.request(this.repoPath(`/pulls/${number}/comments?per_page=100`));
    const comments = await boundedJson(response);
    return comments.map(reviewComment);
  }

  // A review's own summary (e.g. Copilot's per-file overview alongside
  // its inline comments above) -- GitHub models "submit a review" and
  // "comment on a line" as different objects, so both are needed for
  // the full picture of what a reviewer said.
  async listPullRequestReviews(number) {
    const response = await this.request(this.repoPath(`/pulls/${number}/reviews?per_page=100`));
    const reviews = await boundedJson(response);
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
  async listUnresolvedReviewThreadIds(number) {
    const data = await this.graphql(`
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            reviewThreads(first: 100) {
              nodes { id isResolved }
            }
          }
        }
      }
    `, { owner: this.owner, repo: this.repository, number });
    return data.repository.pullRequest.reviewThreads.nodes
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
  github
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
    // Safety net: a draft may have been saved with simplified input that
    // didn't convert (create/save store it as given rather than rejecting --
    // see hostedMcpAuthoringServer.js's create_puzzle_draft/save_puzzle_draft).
    // Re-attempt conversion here so preview/submit called directly against
    // such a draft (skipping validate_puzzle_draft) still gets friendly
    // errors instead of JSON-LD-profile noise. Already-JSON-LD documents
    // pass through unchanged.
    const normalized = normalizeAuthoredPuzzleDocument(document);
    if (!normalized.document) {
      return { valid: false, errors: normalized.errors, preview: null };
    }
    document = normalized.document;
    const profileErrors = validateJsonLdProfile(document);
    if (profileErrors.length) {
      return { valid: false, errors: profileErrors, preview: null };
    }
    const puzzle = puzzleFromJsonLd(document);
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
    const validation = contentService.validatePuzzleJsonLd(document, {
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
    const canonicalPath = `content/puzzles/${puzzle.id}.ccpuzzle.jsonld`;
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
    // the JSON-LD pipeline and so never got a canonical file at all.
    const oldModulePath = existingDocument
      ? `puzzles/${slugify(existingDocument.category)}/${puzzle.id}.js`
      : existingModulePath(published);
    const proposed = new Map([
      [canonicalPath, formattedJson(document)],
      [modulePath, generatedPuzzleModule(puzzle, canonicalPath, modulePath)]
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

    // If this draft already has an open pull request, amend it instead of
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
        if (plan.approvalToken === active.approvalToken) {
          return { ...active, submissionOutcome: "unchanged" };
        }
        // No markFailed on error here: the PR is untouched and still
        // open, so the next submit() finds it again via
        // findActiveRequest and retries cleanly. Marking this row
        // 'failed' would make the *next* resubmission fall through to
        // reserve() with a fresh approval token that can't match this
        // row, silently minting a duplicate PR in exactly the failure
        // path this feature exists to close.
        const commitSha = await github.updateCommit({
          baseCommitSha: plan.base.commitSha,
          baseTreeSha: plan.base.treeSha,
          branch: active.githubBranch,
          message: `${plan.action === "create" ? "Add" : "Update"} ${plan.puzzle.title}`,
          changes: plan.changes
        });
        const amended = await publicationRepository.recordAmendedCommit({
          requestId: active.id,
          contentHash: draft.contentHash,
          approvalToken: plan.approvalToken,
          baseCommitSha: plan.base.commitSha,
          commitSha,
          actor
        });
        // Best-effort: the amend itself (the part that matters) already
        // succeeded above. A comment failing to post shouldn't turn a
        // successful amend into a reported failure -- it's a visibility
        // aid, not the operation itself. See commentOnPullRequest's own
        // comment for why this exists alongside the (much subtler)
        // native force-push timeline event GitHub already records.
        try {
          await github.commentOnPullRequest(
            active.githubPrNumber,
            `Draft resubmitted and amended -- this PR's commit was force-updated with the latest content (commit \`${commitSha.slice(0, 8)}\`).`
          );
        } catch {
          // Non-fatal; the amend already succeeded regardless.
        }
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
          `Publishes D1 draft \`${draftId}\`.\n\n` +
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

  // Surfaces whatever review feedback (Copilot's, or a human's) already
  // exists on a request's pull request -- the same information a caller
  // would otherwise have to open the PR on GitHub and copy by hand back
  // into this conversation. Deliberately generic to "a pull request's
  // review feedback", nothing puzzle-specific: this and the two
  // GitHubRepositoryClient methods it calls would carry over unchanged
  // to any other project wired to the same publish-a-PR-from-an-MCP-tool
  // shape, only the caller (get_review_feedback below) is
  // project-specific about *when* to reach for it.
  //
  // No resolved/unresolved filtering: the REST API this runs on doesn't
  // expose review-thread resolution state (that's GraphQL-only), and
  // nothing in this pipeline currently clicks "Resolve conversation" on
  // GitHub's side when a fix lands anyway, so a resolved/unresolved
  // split would mostly just be wrong. Returns everything currently on
  // the PR and leaves judging what's already been addressed to the
  // caller, same as a human skimming the same page would.
  async function reviewFeedback({ requestId, actor }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, reviews: [], comments: [] };
    }
    const [reviews, comments] = await Promise.all([
      github.listPullRequestReviews(request.githubPrNumber),
      github.listPullRequestComments(request.githubPrNumber)
    ]);
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      pullRequestUrl: request.githubPrUrl,
      reviews,
      comments
    };
  }

  // Applies one exact GitHub suggestion fence as a normal commit on the PR
  // branch. This intentionally does not attempt to synthesize a fix from a
  // prose comment: the only zero-reasoning path is one where GitHub supplied
  // both the replacement and an unambiguous live line range. Requiring the
  // comment's reviewed commit to still be the branch head is conservative but
  // important -- line numbers alone are not a safe patch context after any
  // intervening commit, even if the comment is not yet marked outdated.
  async function applyReviewSuggestion({ requestId, commentId, expectedUpdatedAt, actor }) {
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
    const comment = await github.getPullRequestComment(commentId);
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
    const branchHead = await github.getBranchHead(request.githubBranch);
    if (comment.commitSha !== branchHead.commitSha) {
      throw new PublicationConflictError(
        `Review comment ${commentId} targets commit ${comment.commitSha}, but ` +
        `the pull-request branch is now ${branchHead.commitSha}; request a fresh review`
      );
    }
    const [source, treeEntry] = await Promise.all([
      github.readFile(comment.path, branchHead.commitSha),
      github.getTreeEntry(comment.path, branchHead.treeSha)
    ]);
    if (source === null || !treeEntry) {
      throw new PublicationConflictError(
        `Review suggestion target no longer exists: ${comment.path}`
      );
    }
    if (treeEntry.type !== "blob" || !["100644", "100755"].includes(treeEntry.mode)) {
      throw new PublicationConflictError(
        `Review suggestion target is not a regular text file: ${comment.path}`
      );
    }
    const content = applySuggestionToSource(source, {
      startLine: comment.startLine,
      endLine: comment.line,
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
    let commitSha;
    try {
      commitSha = await github.appendCommit({
        baseCommitSha: branchHead.commitSha,
        baseTreeSha: branchHead.treeSha,
        branch: request.githubBranch,
        message: suggestionCommitMessage(comment),
        changes: [{ relativePath: comment.path, mode: treeEntry.mode, content }]
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
      path: comment.path,
      startLine: comment.startLine,
      endLine: comment.line,
      applied: true,
      unchanged: false,
      githubCommitSha: commitSha
    };
  }

  // Marks every currently-unresolved review thread on a request's pull
  // request as resolved -- the GraphQL equivalent of a human clicking
  // "Resolve conversation" on each one by hand. No per-thread selection:
  // the expected caller already called reviewFeedback above, addressed
  // what it found valid, and is now marking the whole round done in one
  // call, the same way a human who just finished going through a
  // review's comments would work top-to-bottom rather than resolving
  // them one at a time as a separate decision per thread.
  async function resolveReviewFeedback({ requestId, actor }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, resolvedCount: 0 };
    }
    const threadIds = await github.listUnresolvedReviewThreadIds(request.githubPrNumber);
    for (const threadId of threadIds) {
      await github.resolveReviewThread(threadId);
    }
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      resolvedCount: threadIds.length
    };
  }

  // For a review comment being judged incorrect and not acted on, not
  // one being fixed -- the fix itself (an amended commit) already is
  // the visible record for that case. Without this, resolving a
  // dismissed thread (resolveReviewFeedback above still resolves it,
  // deliberately, so it doesn't reappear as unaddressed) would leave no
  // trace of *why* -- a human looking at a resolved-but-unchanged
  // thread later has no way to tell "fixed" from "silently ignored."
  async function replyToReviewComment({ requestId, commentId, body, actor }) {
    const request = await publicationRepository.get({ requestId, actor });
    if (!request.githubPrNumber) {
      return { requestId: request.id, hasPullRequest: false, replied: false };
    }
    await github.replyToPullRequestComment(request.githubPrNumber, commentId, body);
    return {
      requestId: request.id,
      hasPullRequest: true,
      pullRequestNumber: request.githubPrNumber,
      replied: true
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

    const proposed = new Map([
      [cataloguePath, generatedCatalogueModule(catalogue)],
      [indexPath, registerCatalogueSource(indexSource, catalogue.id, cataloguePath)]
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

  return {
    preview,
    status,
    reviewFeedback,
    applyReviewSuggestion,
    replyToReviewComment,
    resolveReviewFeedback,
    submit,
    previewCatalogueCreation,
    createCatalogue
  };
}

export default createGitHubPublicationService;
