// LAN authoring play: serve published D1 documents as the player corpus.
// Production uses separate read-only D1 routes and can reuse matching
// frozen modules; this LAN handler remains authoring-only.

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
import { validatePublishedPuzzleLayout } from "./layoutPublication.js";
import {
  layoutDocumentForMode,
  LayoutConflictError,
  autoBoardConflict,
  autoEnvelopeConflict,
  autoLayoutConflict,
  layoutDocumentWithBoard,
  layoutForMode,
  normalizeLayoutDocument,
  stampLayoutSaved
} from "./layoutDocument.js";

const LAYOUT_ROUTE = /^\/admin\/puzzles\/([^/]+)\/layout(?:\.json)?$/;

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
    if (size > 900_000) throw new Error("Layout request is too large");
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
    const requestUrl = new URL(req.url || "/", "http://local.invalid");
    if (req.method === "GET" && (urlPath === "/" || urlPath === "/index.html")) {
      const markup = indexHtml
        ?? await readFile(join(repositoryRoot, "index.html"), "utf8");
      html(res, htmlWithPlayCorpusMeta(markup));
      return true;
    }
    const layoutMatch = urlPath.match(LAYOUT_ROUTE);
    if (layoutMatch) {
      if (!requestIsSameOriginIfSpecified(req)) {
        json(res, { error: "Layout writes must be same-origin." }, 403);
        return true;
      }
      await ensureSeeded();
      const id = decodeURIComponent(layoutMatch[1]);
      let body = null;
      if (req.method === "PUT") {
        try {
          body = await readJsonBody(req);
        } catch (error) {
          json(res, { error: error instanceof Error ? error.message : String(error) }, 400);
          return true;
        }
      }
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
          layout: published.layout || null
        });
        return true;
      }
      if (req.method !== "PUT" && req.method !== "DELETE") return false;
      if (published.withdrawnAt) {
        json(res, { error: "Puzzle withdrawn from authoring play", id }, 409);
        return true;
      }
      // Each write is conditional on the row this request read. When another
      // save lands in between, re-read and rebuild from the newer layout, so
      // neither save erases the other and author-over-auto is re-checked.
      for (let attempt = 0; ; attempt++) {
        try {
          if (req.method === "DELETE") {
            const mode = requestUrl.searchParams.get("mode");
            if (!mode) {
              // Clearing every mode layout keeps the board settings: they
              // are a separate choice, never removed as a side effect.
              const keptBoard = normalizeLayoutDocument(published.layout)?.board;
              if (keptBoard) {
                const kept = await contentDocuments.saveLayout({
                  id,
                  expectedUpdatedAt: published.updatedAt,
                  layout: layoutDocumentWithBoard({}, { schemaVersion: 1, modes: {}, board: keptBoard })
                });
                json(res, { id, revision: kept.revision, layout: kept.layout || null });
                return true;
              }
              const cleared = await contentDocuments.clearLayout({ id });
              json(res, { id, revision: cleared.revision, layout: null });
              return true;
            }
            const saved = await contentDocuments.saveLayout({
              id,
              expectedUpdatedAt: published.updatedAt,
              layout: layoutDocumentForMode(mode, null, published.layout)
            });
            json(res, {
              id,
              revision: saved.revision,
              layout: saved.layout || null
            });
            return true;
          }
          const layout = body && Object.prototype.hasOwnProperty.call(body, "layout")
            ? body.layout
            : body;
          const mode = body?.mode || requestUrl.searchParams.get("mode") || null;
          // Board settings (size, Star free-term strip) save into the layout
          // document beside the per-mode layouts; see layoutDocumentWithBoard.
          if (body && Object.prototype.hasOwnProperty.call(body, "board") && !mode) {
            const incoming = body.board && typeof body.board === "object" ? body.board : {};
            const changes = stampLayoutSaved({
              ...incoming,
              source: incoming.source === "auto" ? "auto" : "author"
            });
            const boardConflict = autoBoardConflict(changes, published.layout);
            if (boardConflict) {
              json(res, { error: boardConflict, id }, 409);
              return true;
            }
            const boardLayout = layoutDocumentWithBoard(changes, published.layout);
            const boardValidation = validatePublishedPuzzleLayout({
              document: published.document,
              layout: boardLayout,
              categoryRegistry: undefined
            });
            if (!boardValidation.valid) {
              json(res, { error: "Layout is invalid", id, errors: boardValidation.errors }, 400);
              return true;
            }
            const savedBoard = await contentDocuments.saveLayout({ id, layout: boardLayout, expectedUpdatedAt: published.updatedAt });
            json(res, {
              id,
              revision: savedBoard.revision,
              layout: savedBoard.layout || boardLayout,
              warnings: boardValidation.warnings
            });
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
          const modePayload = mode && layout?.modes
            ? layoutForMode(layout, mode)
            : layout;
          const conflict = mode
            ? autoLayoutConflict(mode, modePayload, published.layout)
            : autoEnvelopeConflict(layout, published.layout);
          if (conflict) {
            json(res, { error: conflict, id }, 409);
            return true;
          }
          const layoutDocument = mode
            ? layoutDocumentForMode(mode, stampLayoutSaved(modePayload), published.layout)
            : normalizeLayoutDocument(layout);
          const validation = validatePublishedPuzzleLayout({
            document: published.document,
            layout: layoutDocument,
            savingMode: mode
          });
          if (!validation.valid) {
            json(res, { error: "Layout is invalid", id, errors: validation.errors }, 400);
            return true;
          }
          const saved = await contentDocuments.saveLayout({ id, layout: layoutDocument, expectedUpdatedAt: published.updatedAt });
          json(res, {
            id,
            revision: saved.revision,
            layout: saved.layout || layoutDocument,
            warnings: validation.warnings
          });
          return true;
        } catch (error) {
          if (error instanceof LayoutConflictError && attempt < 2) {
            published = await contentDocuments.getPublished({ kind: "puzzle", id });
            continue;
          }
          json(res, {
            error: error instanceof Error ? error.message : String(error)
          }, error instanceof LayoutConflictError ? 409 : 400);
          return true;
        }
      }
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
        ...(published.layout ? { layout: published.layout } : {}),
        ...(published.layout
          ? { starLayout: layoutForMode(published.layout, "star") }
          : {})
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
    const isLayout = LAYOUT_ROUTE.test(urlPath);
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
