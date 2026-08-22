// Local /admin/drafts handler: the same HTML as the hosted authoring
// Worker, backed by the shared D1 drafts stdio MCP uses.
// Corrections still go through the authoring conversation.
// Opening a GitHub pull request, installing into this checkout, or
// uninstalling an uncommitted local install is a POST from the draft page.
//
// Status is whatever D1 recorded (or install_puzzle on a remnant file store).
// The Checkout badge is a live look at content/puzzles/<id>.ccpuzzle.json --
// the same canonical file install_puzzle writes -- so a successful install
// shows up without restarting the static server.

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
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import {
  diffPublishedDraft,
  publishedDocumentFromService
} from "./draftReviewDiff.js";
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

export function mapDraftListItem(metadata, { inCheckout = false } = {}) {
  const status = RECORDED_STATUSES.has(metadata.status) ? metadata.status : "draft";
  return {
    ...metadata,
    status,
    inCurrentBundle: status === "draft" ? null : inCheckout
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
  canUninstall = false
}) {
  const puzzleId = typeof record.document?.id === "string"
    ? record.document.id
    : record.puzzleId || null;
  const published = publishedDocumentFromService(contentService, puzzleId);
  return {
    ...mapDraftListItem({ ...record, puzzleId }, { inCheckout }),
    puzzleId,
    title: record.document?.title || record.title || null,
    document: record.document,
    alreadyPublished: inCheckout || publishedInContentService(contentService, puzzleId),
    publishedDiff: published ? diffPublishedDraft(published, record.document) : null,
    canUninstall: Boolean(inCheckout && canUninstall),
    validation: contentService
      ? await contentService.validatePuzzleDraft(record.document)
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
  repositoryRoot,
  submitDraft = null,
  installDraft = null,
  uninstallDraft = null,
  readCommittedFile = committedFileAtHead,
  publicationActor = null
}) {
  if (!draftStore) throw new Error("draftStore is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");

  return async function handleLocalDraftReview(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    if (req.method === "POST") {
      const match = urlPath.match(/^\/admin\/drafts\/([^/]+)$/);
      if (!match) return false;
      if (!isSameOriginRequest({
        origin: req.headers?.origin || req.headers?.Origin,
        referer: req.headers?.referer || req.headers?.Referer,
        host: req.headers?.host || req.headers?.Host
      })) {
        html(res, "<p>Cross-origin submit is not allowed.</p>", 403);
        return true;
      }
      const form = parseSubmitForm(await readNodeUrlEncoded(req));
      if (!form.isSubmit && !form.isInstall && !form.isUninstall) {
        html(res, "<p>Missing submit confirmation.</p>", 400);
        return true;
      }
      const draftId = decodeURIComponent(match[1]);
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
    if (urlPath === "/admin/drafts") {
      const listed = await draftStore.listDrafts();
      const drafts = await Promise.all(listed.map(async metadata => mapDraftListItem(metadata, {
        inCheckout: await puzzleInCheckout(repositoryRoot, metadata.puzzleId)
      })));
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
        : null;
      const inCheckout = await puzzleInCheckout(repositoryRoot, puzzleId);
      const draft = await mapDraftDetail(record, {
        contentService,
        inCheckout,
        canUninstall: inCheckout && await puzzleHasLocalCheckoutChanges(
          repositoryRoot,
          puzzleId,
          { readCommittedFile }
        )
      });
      html(res, renderDraftPage(draft, { variant: "local" }));
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
    if (req.method !== "GET" && req.method !== "POST") return false;
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
