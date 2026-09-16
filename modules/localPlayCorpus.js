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
import { isSameOriginRequest } from "./draftReviewSubmit.js";
import {
  assemblePlayCorpus,
  compilePublishedPuzzle,
  htmlWithPlayCorpusMeta,
  PLAY_CORPUS_PATH
} from "./playCorpus.js";
import { validateStarLayoutDocument } from "./starLayoutSchema.js";

const STAR_LAYOUT_ROUTE = /^\/admin\/puzzles\/([^/]+)\/star-layout(?:\.json)?$/;

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

function requestIsSameOriginIfSpecified(req) {
  const headers = req.headers || {};
  const origin = headers.origin || headers.Origin || "";
  const referer = headers.referer || headers.Referer || "";
  if (!origin && !referer) return true;
  return isSameOriginRequest({
    origin,
    referer,
    host: headers.host || headers.Host || ""
  });
}

async function readJsonBody(req) {
  if (!req || typeof req[Symbol.asyncIterator] !== "function") {
    const body = req?.body ?? {};
    if (typeof body !== "string" && !Buffer.isBuffer(body)) return body;
    try {
      return JSON.parse(Buffer.from(body).toString("utf8"));
    } catch (error) {
      throw new Error(`Request body is not valid JSON: ${error.message}`);
    }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 900_000) throw new Error("Star layout request is too large");
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Request body is not valid JSON: ${error.message}`);
  }
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
    const layoutMatch = urlPath.match(STAR_LAYOUT_ROUTE);
    if (layoutMatch) {
      if (!requestIsSameOriginIfSpecified(req)) {
        json(res, { error: "Layout writes must be same-origin." }, 403);
        return true;
      }
      await ensureSeeded();
      const id = decodeURIComponent(layoutMatch[1]);
      let published;
      try {
        published = await contentDocuments.getPublished({ kind: "puzzle", id });
      } catch (error) {
        if (!(error instanceof ContentDocumentNotFoundError)) throw error;
        json(res, { error: "Unknown puzzle", id }, 404);
        return true;
      }
      if (req.method === "GET" || req.method === "HEAD") {
        json(res, {
          id,
          revision: published.revision,
          layout: published.starLayout || null
        });
        return true;
      }
      if (req.method !== "PUT" && req.method !== "DELETE") return false;
      if (published.withdrawnAt) {
        json(res, { error: "Puzzle withdrawn from authoring play", id }, 409);
        return true;
      }
      try {
        if (req.method === "DELETE") {
          const cleared = await contentDocuments.clearPuzzleLayout({ id });
          json(res, { id, revision: cleared.revision, layout: null });
          return true;
        }
        const body = await readJsonBody(req);
        const layout = body && Object.prototype.hasOwnProperty.call(body, "layout")
          ? body.layout
          : body;
        const { puzzle, errors } = compilePublishedPuzzle(published.document);
        if (!puzzle) {
          json(res, {
            error: "Published puzzle document is not valid simplified content",
            id,
            errors
          }, 400);
          return true;
        }
        const validation = validateStarLayoutDocument(layout, puzzle);
        if (!validation.valid) {
          json(res, { error: "Star layout is invalid", id, errors: validation.errors }, 400);
          return true;
        }
        const saved = await contentDocuments.savePuzzleLayout({ id, layout });
        json(res, {
          id,
          revision: saved.revision,
          layout: saved.starLayout || layout
        });
      } catch (error) {
        json(res, { error: error instanceof Error ? error.message : String(error) }, 400);
      }
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
        puzzle,
        ...(published.starLayout ? { starLayout: published.starLayout } : {})
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
    const isLayout = STAR_LAYOUT_ROUTE.test(urlPath);
    if (!isIndex && !isPlay && !isLayout) return false;
    try {
      workspacePromise ||= resolveLocalAuthoringWorkspace({ env, repositoryRoot });
      const resolved = await workspacePromise;
      if (!resolved.contentDocuments) {
        if (isPlay || isLayout) json(res, { error: "D1 content documents are not configured." }, 503);
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
