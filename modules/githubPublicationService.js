import { slugify } from "../puzzles/categories.js";
import { validateCategoryRegistration } from "./categoryValidation.js";
import { validateJsonLdProfile } from "./jsonLdProfile.js";
import {
  addCatalogueEntrySource,
  formattedJson,
  generatedPuzzleModule,
  publicationApprovalToken,
  registerCategorySource,
  registerPuzzleSource
} from "./publicationArtifacts.js";
import { puzzleFromJsonLd } from "./puzzleJsonLd.js";
import { puzzleSourceUrl } from "./puzzleManifest.js";

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

function existingModulePath(puzzle) {
  const source = puzzleSourceUrl(puzzle);
  if (!source) return null;
  const marker = "/puzzles/";
  const index = source.pathname.lastIndexOf(marker);
  return index < 0 ? null : source.pathname.slice(index + 1);
}

function publicationOptions({
  replace = false,
  catalogueId = null,
  reason = null,
  newCategory = null
}) {
  if (reason && !catalogueId) throw new Error("reason requires catalogueId");
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

  async createCommit({ baseCommitSha, baseTreeSha, branch, message, changes }) {
    const treeResponse = await this.request(this.repoPath("/git/trees"), {
      method: "POST",
      body: {
        base_tree: baseTreeSha,
        tree: changes.map(change => ({
          path: change.relativePath,
          mode: "100644",
          type: "blob",
          content: change.content
        }))
      }
    });
    const tree = await boundedJson(treeResponse);
    const commitResponse = await this.request(this.repoPath("/git/commits"), {
      method: "POST",
      body: { message, tree: tree.sha, parents: [baseCommitSha] }
    });
    const commit = await boundedJson(commitResponse);
    await this.request(this.repoPath("/git/refs"), {
      method: "POST",
      body: { ref: `refs/heads/${branch}`, sha: commit.sha }
    });
    return commit.sha;
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
    const published = contentService.puzzles.find(item => item.id === puzzle.id) || null;
    const action = published ? "replace" : "create";
    if (published && !normalizedOptions.replace) {
      return {
        valid: false,
        errors: [`Puzzle "${puzzle.id}" already exists; explicit replace approval is required`],
        preview: null
      };
    }
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
    const modulePath = existingModulePath(published) ||
      `puzzles/${slugify(puzzle.category)}/${puzzle.id}.js`;
    const canonicalPath = `content/puzzles/${puzzle.id}.ccpuzzle.jsonld`;
    const proposed = new Map([
      [canonicalPath, formattedJson(document)],
      [modulePath, generatedPuzzleModule(puzzle, canonicalPath, modulePath)]
    ]);
    if (!published) {
      const registryPath = "puzzles/index.js";
      const registry = await github.readFile(registryPath, base.commitSha);
      if (registry === null) throw new Error(`Missing repository file: ${registryPath}`);
      proposed.set(registryPath, registerPuzzleSource(registry, puzzle, modulePath));
    }
    if (categoryResult.registration) {
      const categoriesPath = "puzzles/categories.js";
      const source = await github.readFile(categoriesPath, base.commitSha);
      if (source === null) throw new Error(`Missing repository file: ${categoriesPath}`);
      proposed.set(
        categoriesPath,
        registerCategorySource(source, categoryResult.registration)
      );
    }
    if (catalogue && !catalogue.entries.some(entry => entry.id === puzzle.id)) {
      const cataloguePath = `catalogues/${catalogue.id}.js`;
      const source = await github.readFile(cataloguePath, base.commitSha);
      if (source === null) throw new Error(`Missing repository file: ${cataloguePath}`);
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
        note: "Approval is bound to this exact draft content, base commit, options, and generated file contents."
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

  async function submit({ draftId, actor, approvalToken, confirm, ...options }) {
    if (confirm !== true) throw new Error("confirm must be true after explicit user approval");
    const draft = await draftRepository.get({ draftId, actor });
    const result = await planDocument(draft.document, options, null, {
      draftId,
      contentHash: draft.contentHash
    });
    if (!result.valid) throw new Error(result.errors.join("\n"));
    const plan = result.plan;
    if (approvalToken !== plan.approvalToken) {
      throw new PublicationConflictError("Publication approval does not match the current preview");
    }
    const request = await publicationRepository.reserve({
      draftId,
      contentHash: draft.contentHash,
      approvalToken,
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
          `Generated files:\n${plan.changes.map(change => `- \`${change.relativePath}\``).join("\n")}`
      });
      return publicationRepository.recordPullRequest({
        requestId: request.id,
        commitSha,
        pullRequest,
        actor
      });
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

  return { preview, status, submit };
}

export default createGitHubPublicationService;
