// Local /admin/drafts handler: the same HTML as the hosted authoring
// Worker, backed by the shared D1 drafts stdio MCP uses.
// Copy can be saved from the drafts page. Structure is authored on
// `/?draft=` (construct canvas) or via optional MCP on the same D1 row.
// Opening a GitHub pull request, installing into this checkout, or
// uninstalling an uncommitted local install is a POST from the draft page.
// New puzzle, document GET/PUT, and play.json are LAN-only.
//
// Status on this local page is derived from whether THIS draft revision is
// the canonical checkout file, then git HEAD / upstream. D1 status stays the
// pull-request ledger. npm run dev must be restarted to pick up this mapping.

import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { slugify } from "../puzzles/categories.js";
import { DraftNotFoundError } from "./draftRepository.js";
import { renderDraftListPage, renderDraftPage } from "./draftReviewPage.js";
import { LocalD1ConfigError } from "./localD1Config.js";
import { HttpD1Error } from "./httpD1Database.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import { createLocalGitHubPublicationService } from "./localGitHubPublication.js";
import { LocalGitHubConfigError } from "./localGitHubConfig.js";
import {
  committedFileAtHead,
  createRepositoryPublicationService,
  ContentValidationError
} from "./repositoryPublicationService.js";
import { documentForEditor, withStorageCanonicalizeFlags } from "./authoredPuzzleDocument.js";
import { createPuzzleSkeleton } from "./puzzleSkeleton.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { puzzleToSimplified } from "./puzzleSimplified.js";
import {
  diffPublishedDraft,
  publishedDocumentFromService,
  valuesEqual
} from "./draftReviewDiff.js";
import {
  DraftFieldError,
  draftFieldRedirectPath,
  isDraftConflictError,
  parseFieldEditForm,
  persistDraftFieldEdit,
  persistDraftCanonicalForm,
  renderDraftFieldConflictPage
} from "./draftReviewEdit.js";
import {
  isSameOriginRequest,
  installDraftFromReview,
  parseSubmitForm,
  readNodeUrlEncoded,
  renderDraftInstallResultPage,
  renderDraftSubmitResultPage,
  renderDraftUninstallResultPage,
  submitDraftFromReview,
  uninstallDraftFromReview
} from "./draftReviewSubmit.js";
import { renderContentLifecycleResultPage, renderContentPublishResultPage } from "./catalogueReviewPage.js";
import { seedPublishedPuzzleIfAbsent } from "./contentDocumentSeed.js";
import { ContentDocumentNotFoundError } from "./contentDocumentRepository.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

export async function puzzleInCheckout(repositoryRoot, puzzleId) {
  if (typeof puzzleId !== "string" || slugify(puzzleId) !== puzzleId) return false;
  try {
    await access(join(repositoryRoot, "content", "puzzles", `${puzzleId}.ccpuzzle.json`));
    return true;
  } catch {
    return false;
  }
}

export async function puzzleHasLocalCheckoutChanges(repositoryRoot, puzzleId, {
  readCommittedFile = committedFileAtHead
} = {}) {
  if (typeof puzzleId !== "string" || slugify(puzzleId) !== puzzleId) return false;
  const relativePath = `content/puzzles/${puzzleId}.ccpuzzle.json`;
  let current;
  try {
    current = await readFile(join(repositoryRoot, relativePath), "utf8");
  } catch {
    return false;
  }
  const committed = readCommittedFile(repositoryRoot, relativePath);
  return current !== committed;
}

function formatActionError(error) {
  if (!(error instanceof Error)) return String(error);
  if (Array.isArray(error.errors) && error.errors.length) {
    return `${error.message}\n${error.errors.join("\n")}`;
  }
  return error.message;
}

export function createCheckoutInstallDraft({ draftStore, contentService }) {
  if (!draftStore || !contentService) return null;
  const publisher = createRepositoryPublicationService({ contentService });
  return async ({ draftId, replace }) => {
    const draft = await draftStore.getDraft(draftId);
    const { puzzle, errors } = puzzleFromAuthoredDocument(draft.document);
    if (!puzzle) {
      throw new ContentValidationError(
        "Puzzle document is not valid simplified content",
        errors
      );
    }
    const plan = await publisher.planPuzzleFromModel(puzzle, { replace });
    const result = await publisher.applyPuzzleImport(plan, {
      approvalToken: plan.approvalToken
    });
    await draftStore.markInstalled(draftId);
    return result;
  };
}

export function createCheckoutUninstallDraft({ draftStore, contentService }) {
  if (!draftStore || !contentService) return null;
  const publisher = createRepositoryPublicationService({ contentService });
  return async ({ draftId }) => {
    const draft = await draftStore.getDraft(draftId);
    const puzzleId = typeof draft.document?.id === "string"
      ? draft.document.id
      : draftId;
    const result = await publisher.applyPuzzleUninstall(puzzleId, {
      category: draft.document?.category || null
    });
    if (typeof draftStore.markUninstalled === "function") {
      await draftStore.markUninstalled(draftId);
    }
    return result;
  };
}

const RECORDED_STATUSES = new Set([
  "installed",
  "submitted",
  "published",
  "review",
  "archived"
]);

const PULL_REQUEST_STATUSES = new Set([
  "submitted",
  "review",
  "published",
  "archived"
]);

export async function readCheckoutDocument(repositoryRoot, puzzleId) {
  if (typeof puzzleId !== "string" || slugify(puzzleId) !== puzzleId) return null;
  try {
    const text = await readFile(
      join(repositoryRoot, "content", "puzzles", `${puzzleId}.ccpuzzle.json`),
      "utf8"
    );
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function draftMatchesCheckout(draftDocument, checkoutDocument) {
  if (!draftDocument || !checkoutDocument) return false;
  const { puzzle } = puzzleFromAuthoredDocument(draftDocument);
  if (!puzzle) return false;
  return valuesEqual(
    documentForEditor(puzzleToSimplified(puzzle)),
    documentForEditor(checkoutDocument)
  );
}

export function thisDraftRevisionInCheckout(metadata, inCheckout, matchesCheckout) {
  if (!inCheckout) return false;
  if (matchesCheckout === true) return true;
  if (metadata.installedContentHash && metadata.contentHash) {
    return metadata.installedContentHash === metadata.contentHash;
  }
  if (matchesCheckout === false) return false;
  return metadata.status === "installed";
}

export function workingTreeAheadOfUpstream(repositoryRoot) {
  const result = spawnSync("git", ["rev-list", "--count", "@{upstream}..HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
  if (result.status !== 0) return null;
  const count = Number.parseInt(String(result.stdout).trim(), 10);
  if (!Number.isFinite(count)) return null;
  return count > 0;
}

function checkoutLifecycleStatus({ hasLocalChanges, aheadOfUpstream }) {
  if (hasLocalChanges) return "installed";
  if (aheadOfUpstream === true) return "committed";
  if (aheadOfUpstream === false) return "published";
  return "installed";
}

export function mapDraftListItem(metadata, {
  inCheckout = false,
  hasLocalChanges = false,
  aheadOfUpstream = null,
  matchesCheckout = null
} = {}) {
  const publicationStatus = RECORDED_STATUSES.has(metadata.status)
    ? metadata.status
    : "draft";
  const thisDraftInCheckout = thisDraftRevisionInCheckout(
    { ...metadata, status: publicationStatus },
    inCheckout,
    matchesCheckout
  );
  let status = publicationStatus;
  if (!PULL_REQUEST_STATUSES.has(publicationStatus)) {
    status = thisDraftInCheckout
      ? checkoutLifecycleStatus({ hasLocalChanges, aheadOfUpstream })
      : "draft";
  }
  let inCurrentBundle = null;
  if (thisDraftInCheckout) inCurrentBundle = true;
  else if (PULL_REQUEST_STATUSES.has(publicationStatus)) inCurrentBundle = inCheckout;
  return {
    ...metadata,
    publicationStatus,
    status,
    inCurrentBundle
  };
}

function publishedInContentService(contentService, puzzleId) {
  if (typeof puzzleId !== "string") return false;
  if (contentService?.knownPuzzleIds?.has(puzzleId)) return true;
  return Boolean(contentService?.state?.puzzles?.some(item => item.id === puzzleId));
}

export async function mapDraftDetail(record, {
  contentService = null,
  inCheckout = false,
  hasLocalChanges = false,
  aheadOfUpstream = null,
  matchesCheckout = null,
  canUninstall = false
}) {
  const puzzleId = typeof record.document?.id === "string"
    ? record.document.id
    : record.puzzleId || null;
  const published = publishedDocumentFromService(contentService, puzzleId);
  const document = documentForEditor(record.document);
  return {
    ...mapDraftListItem({ ...record, puzzleId }, {
      inCheckout,
      hasLocalChanges,
      aheadOfUpstream,
      matchesCheckout
    }),
    puzzleId,
    title: record.document?.title || record.title || null,
    document,
    alreadyPublished: inCheckout || publishedInContentService(contentService, puzzleId),
    publishedDiff: published ? diffPublishedDraft(published, document) : null,
    canUninstall: Boolean(inCheckout && canUninstall),
    validation: contentService
      ? withStorageCanonicalizeFlags(
        record.document,
        await contentService.validatePuzzleDraft(record.document)
      )
      : null
  };
}

function html(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function json(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

const CREATE_DRAFT_CONFIRM = "create-draft";

async function readRequestPayload(req) {
  const type = String(req.headers?.["content-type"] || req.headers?.["Content-Type"] || "")
    .toLowerCase();
  const chunks = [];
  if (req && typeof req[Symbol.asyncIterator] === "function") {
    for await (const chunk of req) chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (type.includes("application/json")) {
    if (!raw.trim()) return { json: {}, params: new URLSearchParams() };
    try {
      return { json: JSON.parse(raw), params: new URLSearchParams() };
    } catch {
      const error = new Error("Request body must be JSON");
      error.status = 400;
      throw error;
    }
  }
  return { json: null, params: new URLSearchParams(raw) };
}

function wantsJson(req, jsonBody) {
  const accept = String(req.headers?.accept || req.headers?.Accept || "").toLowerCase();
  const type = String(req.headers?.["content-type"] || req.headers?.["Content-Type"] || "")
    .toLowerCase();
  return Boolean(jsonBody)
    || accept.includes("application/json")
    || type.includes("application/json");
}

function replyCreateDraft(req, res, jsonBody, status, { message, payload } = {}) {
  if (wantsJson(req, jsonBody)) {
    json(res, payload || { error: message }, status);
    return;
  }
  html(res, `<p>${escapeHtml(message)}</p>`, status);
}

function isMissingDraft(error) {
  if (error instanceof DraftNotFoundError) return true;
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith("Unknown draft:") ||
    message.includes("draftId must");
}

function isWorkspaceConfigError(error) {
  return error instanceof LocalD1ConfigError
    || error instanceof HttpD1Error
    || error instanceof LocalGitHubConfigError;
}

export function createLocalDraftReviewHandler({
  draftStore,
  contentService = null,
  contentDocuments = null,
  publicationActor = null,
  repositoryRoot,
  submitDraft = null,
  installDraft = null,
  uninstallDraft = null,
  readCommittedFile = committedFileAtHead,
  workingTreeAheadOfUpstream: aheadOfUpstreamCheck = workingTreeAheadOfUpstream
}) {
  if (!draftStore) throw new Error("draftStore is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");

  return async function handleLocalDraftReview(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    const sameOrigin = () => isSameOriginRequest({
      origin: req.headers?.origin || req.headers?.Origin,
      referer: req.headers?.referer || req.headers?.Referer,
      host: req.headers?.host || req.headers?.Host
    });

    const documentMatch = urlPath.match(/^\/admin\/drafts\/([^/]+)\/document(?:\.json)?$/);
    if (documentMatch && (req.method === "GET")) {
      const draftId = decodeURIComponent(documentMatch[1]);
      try {
        const record = await draftStore.getDraft(draftId);
        json(res, {
          draftId,
          revision: record.revision,
          document: record.document
        });
      } catch (error) {
        if (!isMissingDraft(error)) throw error;
        const message = error instanceof Error ? error.message : String(error);
        json(res, { error: "Draft not found", detail: message }, 404);
      }
      return true;
    }
    if (documentMatch && (req.method === "PUT" || req.method === "POST")) {
      if (!sameOrigin()) {
        json(res, { error: "Cross-origin submit is not allowed." }, 403);
        return true;
      }
      try {
        const { json: body } = await readRequestPayload(req);
        const expectedRevision = Number(body?.expected_revision ?? body?.expectedRevision);
        if (!Number.isInteger(expectedRevision)) {
          json(res, { error: "expected_revision is required" }, 400);
          return true;
        }
        if (!body?.document || typeof body.document !== "object" || Array.isArray(body.document)) {
          json(res, { error: "document must be an object" }, 400);
          return true;
        }
        const draftId = decodeURIComponent(documentMatch[1]);
        const record = await draftStore.replaceDraft({
          draftId,
          document: body.document,
          expectedRevision
        });
        json(res, {
          draftId,
          revision: record.revision,
          document: record.document
        });
      } catch (error) {
        if (error.status === 400) {
          json(res, { error: error.message }, 400);
          return true;
        }
        if (isMissingDraft(error)) {
          const message = error instanceof Error ? error.message : String(error);
          json(res, { error: "Draft not found", detail: message }, 404);
          return true;
        }
        if (isDraftConflictError(error)) {
          json(res, { error: error.message }, 409);
          return true;
        }
        throw error;
      }
      return true;
    }

    if (req.method === "POST" && urlPath === "/admin/drafts") {
      if (!sameOrigin()) {
        replyCreateDraft(req, res, null, 403, {
          message: "Cross-origin submit is not allowed."
        });
        return true;
      }
      let jsonBody = null;
      try {
        const { json: body, params } = await readRequestPayload(req);
        jsonBody = body;
        const confirm = body?.confirm || params.get("confirm");
        if (confirm !== CREATE_DRAFT_CONFIRM) {
          replyCreateDraft(req, res, body, 400, {
            message: "Missing create-draft confirmation."
          });
          return true;
        }
        const id = String(body?.id ?? params.get("id") ?? "").trim();
        const title = String(body?.title ?? params.get("title") ?? "").trim();
        const category = String(body?.category ?? params.get("category") ?? "").trim();
        if (!id || slugify(id) !== id) {
          replyCreateDraft(req, res, body, 400, {
            message: "Puzzle id must be a lowercase URL-safe slug."
          });
          return true;
        }
        let skeleton;
        try {
          skeleton = createPuzzleSkeleton({ id, title, category });
        } catch (error) {
          replyCreateDraft(req, res, body, 400, { message: error.message });
          return true;
        }
        const record = await draftStore.createDraft({ draftId: id, document: skeleton });
        if (wantsJson(req, body)) {
          json(res, {
            draftId: record.draftId,
            revision: record.revision,
            location: `/?draft=${encodeURIComponent(record.draftId)}`
          }, 201);
          return true;
        }
        res.writeHead(303, {
          Location: `/?draft=${encodeURIComponent(record.draftId)}`,
          "Cache-Control": "no-store"
        });
        res.end();
      } catch (error) {
        if (error.status === 400) {
          replyCreateDraft(req, res, jsonBody, 400, { message: error.message });
          return true;
        }
        const message = error instanceof Error ? error.message : String(error);
        if (/already exists/i.test(message)) {
          replyCreateDraft(req, res, jsonBody, 409, { message });
          return true;
        }
        throw error;
      }
      return true;
    }

    if (req.method === "POST") {
      const match = urlPath.match(/^\/admin\/drafts\/([^/]+)$/);
      if (!match) return false;
      if (!sameOrigin()) {
        html(res, "<p>Cross-origin submit is not allowed.</p>", 403);
        return true;
      }
      const params = await readNodeUrlEncoded(req);
      const form = parseSubmitForm(params);
      const draftId = decodeURIComponent(match[1]);
      if (form.isSaveField || form.isRevertField) {
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId || null;
          await persistDraftFieldEdit({
            draft: record,
            publishedDocument: publishedDocumentFromService(contentService, puzzleId),
            form: parseFieldEditForm(params),
            saveDraft: ({ document, expectedRevision }) =>
              draftStore.replaceDraft({ draftId, document, expectedRevision })
          });
          res.writeHead(303, {
            Location: draftFieldRedirectPath(draftId),
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          if (error instanceof DraftFieldError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 400);
            return true;
          }
          throw error;
        }
        return true;
      }
      if (form.isSaveCanonical) {
        try {
          const record = await draftStore.getDraft(draftId);
          const expectedRevision = Number.parseInt(params.get("expected_revision"), 10);
          await persistDraftCanonicalForm({
            draft: record,
            expectedRevision,
            saveDraft: ({ document, expectedRevision: revision }) =>
              draftStore.replaceDraft({ draftId, document, expectedRevision: revision })
          });
          res.writeHead(303, {
            Location: draftFieldRedirectPath(draftId),
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          if (error instanceof DraftFieldError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 400);
            return true;
          }
          throw error;
        }
        return true;
      }
      if (form.isPublish || form.isRevertPublished) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId;
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to publish.</p>", 400);
            return true;
          }
          if (form.isRevertPublished) {
            await seedPublishedPuzzleIfAbsent(contentDocuments, contentService, puzzleId);
            const published = await contentDocuments.getPublished({
              kind: "puzzle",
              id: puzzleId
            });
            await draftStore.replaceDraft({
              draftId,
              document: published.document,
              expectedRevision: record.revision
            });
            res.writeHead(303, {
              Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
              "Cache-Control": "no-store"
            });
            res.end();
            return true;
          }
          if (typeof contentService?.validatePuzzleDraft === "function") {
            const validation = await contentService.validatePuzzleDraft(record.document);
            if (validation && validation.valid === false) {
              html(res, renderContentPublishResultPage({
                kind: "puzzle",
                id: puzzleId,
                error: (validation.errors || []).join("\n") || "Draft is not valid.",
                backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
              }), 400);
              return true;
            }
          }
          const published = await contentDocuments.publish({
            kind: "puzzle",
            id: puzzleId,
            document: record.document,
            actor: publicationActor
          });
          html(res, renderContentPublishResultPage({
            kind: "puzzle",
            id: puzzleId,
            published,
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }));
        } catch (error) {
          if (isMissingDraft(error) || error instanceof ContentDocumentNotFoundError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, 404);
            return true;
          }
          html(res, renderContentPublishResultPage({
            kind: "puzzle",
            id: draftId,
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        return true;
      }
      if (form.isUnpublish) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId;
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to unpublish.</p>", 400);
            return true;
          }
          await contentDocuments.unpublish({
            kind: "puzzle",
            id: puzzleId,
            actor: publicationActor
          });
          html(res, renderContentLifecycleResultPage({
            title: "Removed from authoring play",
            message: `Withdrew ${puzzleId}. Publish again to restore it.`,
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }));
        } catch (error) {
          if (isMissingDraft(error) || error instanceof ContentDocumentNotFoundError) {
            html(res, `<p>${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          html(res, renderContentLifecycleResultPage({
            title: "Could not unpublish",
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        return true;
      }
      if (form.isDeleteDraft) {
        try {
          await draftStore.deleteDraft(draftId);
          html(res, renderContentLifecycleResultPage({
            title: "Working copy deleted",
            message: `Deleted draft ${draftId}.`,
            backHref: "/admin/drafts"
          }));
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          html(res, renderContentLifecycleResultPage({
            title: "Could not delete draft",
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        return true;
      }
      if (!form.isSubmit && !form.isInstall && !form.isUninstall) {
        html(res, "<p>Missing submit confirmation.</p>", 400);
        return true;
      }
      if (form.isUninstall) {
        try {
          const result = await uninstallDraftFromReview({
            uninstallDraft,
            draftId
          });
          html(res, renderDraftUninstallResultPage({ draftId, result }));
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          const status = error?.code === "ERR_UNINSTALL_UNAVAILABLE" ? 503 : 400;
          html(res, renderDraftUninstallResultPage({
            draftId,
            error: formatActionError(error)
          }), status);
        }
        return true;
      }
      if (form.isInstall) {
        try {
          const result = await installDraftFromReview({
            installDraft,
            draftId,
            replace: form.replace
          });
          html(res, renderDraftInstallResultPage({ draftId, result }));
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          const status = error?.code === "ERR_INSTALL_UNAVAILABLE" ? 503 : 400;
          html(res, renderDraftInstallResultPage({
            draftId,
            error: formatActionError(error)
          }), status);
        }
        return true;
      }
      try {
        const publication = await submitDraftFromReview({
          submitDraft,
          draftId,
          actor: publicationActor,
          replace: form.replace
        });
        html(res, renderDraftSubmitResultPage({ draftId, publication }));
      } catch (error) {
        if (isMissingDraft(error)) {
          html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
          return true;
        }
        const status = error?.code === "ERR_SUBMIT_UNAVAILABLE" ? 503 : 400;
        html(res, renderDraftSubmitResultPage({
          draftId,
          error: formatActionError(error)
        }), status);
      }
      return true;
    }
    if (req.method !== "GET") return false;
    const playMatch = urlPath.match(/^\/admin\/drafts\/([^/]+)\/play\.json$/);
    if (playMatch) {
      const draftId = decodeURIComponent(playMatch[1]);
      try {
        const record = await draftStore.getDraft(draftId);
        const { puzzle, errors } = puzzleFromAuthoredDocument(record.document);
        if (!puzzle) {
          json(res, {
            draftId,
            error: "Puzzle document is not valid simplified content",
            errors
          }, 400);
          return true;
        }
        json(res, {
          draftId,
          revision: record.revision,
          puzzle
        });
      } catch (error) {
        if (!isMissingDraft(error)) throw error;
        const message = error instanceof Error ? error.message : String(error);
        json(res, { error: "Draft not found", detail: message }, 404);
      }
      return true;
    }
    if (urlPath === "/admin/drafts") {
      const listed = await draftStore.listDrafts({ includeDocument: true });
      const aheadOfUpstream = aheadOfUpstreamCheck(repositoryRoot);
      const drafts = await Promise.all(listed.map(async metadata => {
        const puzzleId = typeof metadata.document?.id === "string"
          ? metadata.document.id
          : metadata.puzzleId;
        const inCheckout = await puzzleInCheckout(repositoryRoot, puzzleId);
        const checkoutDocument = inCheckout
          ? await readCheckoutDocument(repositoryRoot, puzzleId)
          : null;
        const matchesCheckout = inCheckout
          ? draftMatchesCheckout(metadata.document, checkoutDocument)
          : false;
        const hasLocalChanges = inCheckout && await puzzleHasLocalCheckoutChanges(
          repositoryRoot,
          puzzleId,
          { readCommittedFile }
        );
        return mapDraftListItem(metadata, {
          inCheckout,
          hasLocalChanges,
          aheadOfUpstream,
          matchesCheckout
        });
      }));
      html(res, renderDraftListPage(drafts, { variant: "local" }));
      return true;
    }
    const match = urlPath.match(/^\/admin\/drafts\/([^/]+)$/);
    if (!match) return false;
    const draftId = decodeURIComponent(match[1]);
    try {
      const record = await draftStore.getDraft(draftId);
      const puzzleId = typeof record.document?.id === "string"
        ? record.document.id
        : record.puzzleId || null;
      const inCheckout = await puzzleInCheckout(repositoryRoot, puzzleId);
      const checkoutDocument = inCheckout
        ? await readCheckoutDocument(repositoryRoot, puzzleId)
        : null;
      const matchesCheckout = inCheckout
        ? draftMatchesCheckout(record.document, checkoutDocument)
        : false;
      const hasLocalChanges = inCheckout && await puzzleHasLocalCheckoutChanges(
        repositoryRoot,
        puzzleId,
        { readCommittedFile }
      );
      const draft = await mapDraftDetail(record, {
        contentService,
        inCheckout,
        hasLocalChanges,
        aheadOfUpstream: aheadOfUpstreamCheck(repositoryRoot),
        matchesCheckout,
        canUninstall: inCheckout && hasLocalChanges
      });
      html(res, renderDraftPage(draft, {
        variant: "local",
        actor: publicationActor || null
      }));
    } catch (error) {
      if (!isMissingDraft(error)) throw error;
      const message = error instanceof Error ? error.message : String(error);
      html(res, `<p>Draft not found: ${escapeHtml(message)}</p>`, 404);
    }
    return true;
  };
}

export function createDefaultLocalDraftReviewHandler({
  repositoryRoot = process.cwd(),
  draftDirectory = null,
  contentService = null,
  draftStore = null,
  env = process.env
} = {}) {
  const remnantDirectory = draftDirectory
    || (typeof env.CONCEPT_CLUSTERS_DRAFT_DIR === "string"
      && env.CONCEPT_CLUSTERS_DRAFT_DIR.trim()
      ? env.CONCEPT_CLUSTERS_DRAFT_DIR.trim()
      : null);
  const remnantStore = draftStore
    || (remnantDirectory
      ? createPuzzleDraftStore({ directory: remnantDirectory })
      : null);
  if (remnantStore) {
    return createLocalDraftReviewHandler({
      draftStore: remnantStore,
      contentService,
      repositoryRoot,
      installDraft: createCheckoutInstallDraft({
        draftStore: remnantStore,
        contentService
      }),
      uninstallDraft: createCheckoutUninstallDraft({
        draftStore: remnantStore,
        contentService
      })
    });
  }
  let workspacePromise;
  return async function handleDefaultLocalDraftReview(req, res) {
    if (req.method !== "GET" && req.method !== "POST" && req.method !== "PUT") return false;
    const urlPath = (req.url || "").split("?")[0];
    if (urlPath !== "/admin/drafts" && !urlPath.startsWith("/admin/drafts/")) {
      return false;
    }
    try {
      workspacePromise ||= resolveLocalAuthoringWorkspace({ env, repositoryRoot });
      const resolved = await workspacePromise;
      let submitDraft = null;
      if (resolved.draftRepository && resolved.publicationRepository) {
        submitDraft = async args => {
          const service = await createLocalGitHubPublicationService({
            contentService,
            draftRepository: resolved.draftRepository,
            publicationRepository: resolved.publicationRepository,
            actor: resolved.actor,
            repositoryRoot,
            env
          });
          return service.submit(args);
        };
      }
      const handleRequest = createLocalDraftReviewHandler({
        draftStore: resolved.draftStore,
        contentService,
        contentDocuments: resolved.contentDocuments,
        repositoryRoot,
        submitDraft,
        installDraft: createCheckoutInstallDraft({
          draftStore: resolved.draftStore,
          contentService
        }),
        uninstallDraft: createCheckoutUninstallDraft({
          draftStore: resolved.draftStore,
          contentService
        }),
        publicationActor: resolved.actor
      });
      return handleRequest(req, res);
    } catch (error) {
      workspacePromise = null;
      if (!isWorkspaceConfigError(error)) throw error;
      html(res, `<p>${escapeHtml(error.message)}</p>`, 503);
      return true;
    }
  };
}

export async function fetchLocalDraftReview(request, options = {}) {
  const urlPath = new URL(request.url).pathname;
  const handleRequest = options.handleRequest ||
    createDefaultLocalDraftReviewHandler(options);
  let status = 200;
  let headers = {};
  let body = "";
  const nodeHeaders = Object.fromEntries(request.headers.entries());
  const handled = await handleRequest(
    {
      method: request.method,
      url: urlPath,
      headers: nodeHeaders,
      async *[Symbol.asyncIterator]() {
        if (request.method === "GET" || request.method === "HEAD") return;
        const bytes = Buffer.from(await request.arrayBuffer());
        if (bytes.length) yield bytes;
      }
    },
    {
      writeHead(code, nextHeaders) {
        status = code;
        headers = nextHeaders || {};
      },
      end(text = "") {
        body = text;
      }
    }
  );
  if (!handled) return null;
  return new Response(body, { status, headers });
}

export default createLocalDraftReviewHandler;
