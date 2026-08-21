// Read-only local /admin/drafts handler: the same HTML as the hosted
// authoring Worker, backed by the shared D1 drafts stdio MCP uses.
// Corrections still go through the authoring conversation
// (install_puzzle or submit_puzzle_for_publication); this surface never writes.
//
// Status is whatever D1 recorded (or install_puzzle on a remnant file store).
// The Checkout badge is a live look at content/puzzles/<id>.ccpuzzle.json --
// the same canonical file install_puzzle writes -- so a successful install
// shows up without restarting the static server.

import { access } from "node:fs/promises";
import { join } from "node:path";
import { slugify } from "../puzzles/categories.js";
import { DraftNotFoundError } from "./draftRepository.js";
import { renderDraftListPage, renderDraftPage } from "./draftReviewPage.js";
import { LocalD1ConfigError } from "./localD1Config.js";
import { HttpD1Error } from "./httpD1Database.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";

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

export async function mapDraftDetail(record, { contentService = null, inCheckout = false }) {
  const puzzleId = typeof record.document?.id === "string"
    ? record.document.id
    : record.puzzleId || null;
  return {
    ...mapDraftListItem({ ...record, puzzleId }, { inCheckout }),
    puzzleId,
    title: record.document?.title || record.title || null,
    document: record.document,
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
  return error instanceof LocalD1ConfigError || error instanceof HttpD1Error;
}

export function createLocalDraftReviewHandler({
  draftStore,
  contentService = null,
  repositoryRoot
}) {
  if (!draftStore) throw new Error("draftStore is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");

  return async function handleLocalDraftReview(req, res) {
    if (req.method !== "GET") return false;
    const urlPath = (req.url || "").split("?")[0];
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
      const draft = await mapDraftDetail(record, {
        contentService,
        inCheckout: await puzzleInCheckout(repositoryRoot, puzzleId)
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
      repositoryRoot
    });
  }
  let workspacePromise;
  return async function handleDefaultLocalDraftReview(req, res) {
    if (req.method !== "GET") return false;
    const urlPath = (req.url || "").split("?")[0];
    if (urlPath !== "/admin/drafts" && !urlPath.startsWith("/admin/drafts/")) {
      return false;
    }
    try {
      workspacePromise ||= resolveLocalAuthoringWorkspace({ env, repositoryRoot });
      const resolved = await workspacePromise;
      const handleRequest = createLocalDraftReviewHandler({
        draftStore: resolved.draftStore,
        contentService,
        repositoryRoot
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
  if (request.method !== "GET") return null;
  const urlPath = new URL(request.url).pathname;
  const handleRequest = options.handleRequest ||
    createDefaultLocalDraftReviewHandler(options);
  let status = 200;
  let headers = {};
  let body = "";
  const handled = await handleRequest(
    { method: "GET", url: urlPath },
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
