// Read-only local /admin/drafts handler: the same HTML as the hosted
// authoring Worker, backed by the JSON files the stdio MCP server already
// writes under .concept-clusters/drafts/. Corrections still go through
// the authoring conversation (install_puzzle or the hosted PR tools);
// this surface never writes.

import { join } from "node:path";
import {
  createContentInterchangeService,
  DEFAULT_REPOSITORY_ROOT
} from "./contentInterchangeService.js";
import { renderDraftListPage, renderDraftPage } from "./draftReviewPage.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function knownPuzzleIdSet(contentService) {
  return new Set(contentService.listPuzzles().map(puzzle => puzzle.id));
}

function installedStatus(puzzleId, knownPuzzleIds) {
  const installed = typeof puzzleId === "string" && knownPuzzleIds.has(puzzleId);
  return {
    status: installed ? "installed" : "draft",
    inCurrentBundle: installed ? true : null
  };
}

export function mapDraftListItem(metadata, knownPuzzleIds) {
  return {
    ...metadata,
    ...installedStatus(metadata.puzzleId, knownPuzzleIds)
  };
}

export async function mapDraftDetail(record, { contentService, knownPuzzleIds }) {
  const ids = knownPuzzleIds || knownPuzzleIdSet(contentService);
  const puzzleId = typeof record.document?.id === "string"
    ? record.document.id
    : record.puzzleId || null;
  return {
    draftId: record.draftId,
    puzzleId,
    title: record.document?.title || record.title || null,
    updatedAt: record.updatedAt,
    document: record.document,
    validation: await contentService.validateJsonLdDocument(record.document),
    ...installedStatus(puzzleId, ids)
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

export function createLocalDraftReviewHandler({ draftStore, contentService }) {
  if (!draftStore) throw new Error("draftStore is required");
  if (!contentService) throw new Error("contentService is required");

  return async function handleLocalDraftReview(req, res) {
    if (req.method !== "GET") return false;
    const urlPath = (req.url || "").split("?")[0];
    if (urlPath === "/admin/drafts") {
      const knownPuzzleIds = knownPuzzleIdSet(contentService);
      const drafts = (await draftStore.listDrafts())
        .map(metadata => mapDraftListItem(metadata, knownPuzzleIds));
      html(res, renderDraftListPage(drafts, { variant: "local" }));
      return true;
    }
    const match = urlPath.match(/^\/admin\/drafts\/([^/]+)$/);
    if (!match) return false;
    const draftId = decodeURIComponent(match[1]);
    try {
      const record = await draftStore.getDraft(draftId);
      const draft = await mapDraftDetail(record, { contentService });
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
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  draftDirectory = process.env.CONCEPT_CLUSTERS_DRAFT_DIR ||
    join(repositoryRoot, ".concept-clusters", "drafts"),
  contentService = createContentInterchangeService({ repositoryRoot }),
  draftStore = createPuzzleDraftStore({ directory: draftDirectory })
} = {}) {
  return createLocalDraftReviewHandler({ draftStore, contentService });
}

export default createLocalDraftReviewHandler;
