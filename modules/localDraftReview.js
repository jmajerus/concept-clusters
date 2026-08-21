// Read-only local /admin/drafts handler: the same HTML as the hosted
// authoring Worker, backed by the JSON files the stdio MCP server already
// writes under .concept-clusters/drafts/. Corrections still go through
// the authoring conversation (install_puzzle or the hosted PR tools);
// this surface never writes.
//
// Status is whatever install_puzzle recorded on the draft ("draft" until
// then), not whether puzzles/index.js happened to already list this id
// when npm run dev started. The Checkout badge is a live look at
// content/puzzles/<id>.ccpuzzle.json -- the same canonical file
// install_puzzle writes -- so a successful install shows up without
// restarting the static server.

import { access } from "node:fs/promises";
import { join } from "node:path";
import { slugify } from "../puzzles/categories.js";
import { renderDraftListPage, renderDraftPage } from "./draftReviewPage.js";
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

export function mapDraftListItem(metadata, { inCheckout = false } = {}) {
  const status = metadata.status === "installed" ? "installed" : "draft";
  return {
    ...metadata,
    status,
    inCurrentBundle: status === "installed" ? inCheckout : null
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
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith("Unknown draft:") ||
    message.includes("draftId must");
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
  draftDirectory = process.env.CONCEPT_CLUSTERS_DRAFT_DIR ||
    join(repositoryRoot, ".concept-clusters", "drafts"),
  contentService = null,
  draftStore = createPuzzleDraftStore({ directory: draftDirectory })
} = {}) {
  return createLocalDraftReviewHandler({ draftStore, contentService, repositoryRoot });
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
