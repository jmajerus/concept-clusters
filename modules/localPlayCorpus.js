// LAN authoring play: serve published D1 documents as the player corpus.
// Production static hosting never mounts this handler, so game.js keeps
// loading git modules there.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ContentDocumentNotFoundError } from "./contentDocumentRepository.js";
import {
  seedPublishedCatalogues,
  seedPublishedCategories,
  seedPublishedPuzzles
} from "./contentDocumentSeed.js";
import { HttpD1Error } from "./httpD1Database.js";
import { LocalD1ConfigError } from "./localD1Config.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import {
  assemblePlayCorpus,
  compilePublishedPuzzle,
  htmlWithPlayCorpusMeta,
  PLAY_CORPUS_PATH
} from "./playCorpus.js";

function json(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function html(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function puzzleIdsFromService(contentService) {
  const list = contentService?.puzzles || contentService?.state?.puzzles || [];
  return list.map(puzzle => puzzle?.id).filter(Boolean);
}

export async function buildPlayCorpusPayload({
  contentDocuments,
  contentService
}) {
  await seedPublishedCatalogues(
    contentDocuments,
    contentService?.catalogues || contentService?.state?.catalogues || []
  );
  await seedPublishedCategories(
    contentDocuments,
    contentService?.categories || contentService?.state?.categories || {}
  );
  await seedPublishedPuzzles(
    contentDocuments,
    contentService,
    puzzleIdsFromService(contentService)
  );
  const [puzzleRows, catalogueRows, categoryRows] = await Promise.all([
    contentDocuments.listPublished({ kind: "puzzle" }),
    contentDocuments.listPublished({ kind: "catalogue" }),
    contentDocuments.listPublished({ kind: "category" })
  ]);
  return assemblePlayCorpus({
    puzzleRows,
    catalogueRows,
    categoryRows,
    puzzleOrder: puzzleIdsFromService(contentService)
  });
}

export function createLocalPlayCorpusHandler({
  contentDocuments,
  contentService = null,
  listDrafts = null,
  repositoryRoot,
  indexHtml = null
}) {
  if (!contentDocuments) throw new Error("contentDocuments is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");
  let seeded = false;

  async function ensureSeeded() {
    if (seeded) return;
    await buildPlayCorpusPayload({ contentDocuments, contentService });
    seeded = true;
  }

  return async function handleLocalPlayCorpus(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    if (req.method === "GET" && (urlPath === "/" || urlPath === "/index.html")) {
      const markup = indexHtml
        ?? await readFile(join(repositoryRoot, "index.html"), "utf8");
      html(res, htmlWithPlayCorpusMeta(markup));
      return true;
    }
    if (req.method !== "GET" && req.method !== "HEAD") return false;
    const puzzleMatch = urlPath.match(/^\/play\/puzzles\/([^/]+)\.json$/);
    if (urlPath === PLAY_CORPUS_PATH) {
      await ensureSeeded();
      const [puzzleRows, catalogueRows, categoryRows, draftRows] = await Promise.all([
        contentDocuments.listPublished({ kind: "puzzle" }),
        contentDocuments.listPublished({ kind: "catalogue" }),
        contentDocuments.listPublished({ kind: "category" }),
        typeof listDrafts === "function" ? listDrafts() : []
      ]);
      json(res, assemblePlayCorpus({
        puzzleRows,
        catalogueRows,
        categoryRows,
        draftRows: Array.isArray(draftRows) ? draftRows : [],
        puzzleOrder: puzzleIdsFromService(contentService)
      }));
      return true;
    }
    if (puzzleMatch) {
      await ensureSeeded();
      const id = decodeURIComponent(puzzleMatch[1]);
      let published;
      try {
        published = await contentDocuments.getPublished({ kind: "puzzle", id });
      } catch (error) {
        if (!(error instanceof ContentDocumentNotFoundError)) throw error;
        json(res, { error: "Unknown puzzle", id }, 404);
        return true;
      }
      if (published.withdrawnAt) {
        json(res, { error: "Puzzle withdrawn from authoring play", id }, 404);
        return true;
      }
      const { puzzle, errors } = compilePublishedPuzzle(published.document);
      if (!puzzle) {
        json(res, {
          error: "Published puzzle document is not valid simplified content",
          id,
          errors
        }, 400);
        return true;
      }
      json(res, {
        id,
        revision: published.revision,
        puzzle
      });
      return true;
    }
    return false;
  };
}

export function createDefaultLocalPlayCorpusHandler({
  repositoryRoot = process.cwd(),
  contentService = null,
  contentDocuments = null,
  env = process.env
} = {}) {
  if (contentDocuments) {
    return createLocalPlayCorpusHandler({
      contentDocuments,
      contentService,
      repositoryRoot
    });
  }
  let workspacePromise;
  return async function handleDefaultLocalPlayCorpus(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    const isIndex = urlPath === "/" || urlPath === "/index.html";
    const isPlay = urlPath === PLAY_CORPUS_PATH
      || /^\/play\/puzzles\/[^/]+\.json$/.test(urlPath);
    if (!isIndex && !isPlay) return false;
    try {
      workspacePromise ||= resolveLocalAuthoringWorkspace({ env, repositoryRoot });
      const resolved = await workspacePromise;
      if (!resolved.contentDocuments) {
        if (isPlay) json(res, { error: "D1 content documents are not configured." }, 503);
        else html(res, "<p>D1 content documents are not configured.</p>", 503);
        return true;
      }
      const handleRequest = createLocalPlayCorpusHandler({
        contentDocuments: resolved.contentDocuments,
        contentService,
        listDrafts: resolved.draftStore
          ? () => resolved.draftStore.listDrafts({ includeDocument: true })
          : null,
        repositoryRoot
      });
      return handleRequest(req, res);
    } catch (error) {
      if (error instanceof LocalD1ConfigError || error instanceof HttpD1Error) {
        if (isPlay) json(res, { error: error.message }, 503);
        else html(res, `<p>${escapeHtml(error.message)}</p>`, 503);
        return true;
      }
      throw error;
    }
  };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}
