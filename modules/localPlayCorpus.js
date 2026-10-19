// LAN authoring play: serve published D1 documents as the player corpus.
// Production uses separate read-only D1 routes and can reuse matching
// frozen modules; this LAN handler remains authoring-only.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ContentDocumentNotFoundError } from "./contentDocumentRepository.js";
import { canonicalBoardSizeFactor } from "./puzzleBoardSize.js";
import { LAYOUT_PASS_MODES } from "./layoutPassSizePlan.js";
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
import { layoutForMode } from "./layoutDocument.js";
import { createServerTiming } from "./serverTiming.js";
import { createLayoutPassJobs, spawnLayoutPass } from "./layoutPassJobs.js";
import {
  readSiteSettingsOrDefaults,
  siteSettingsPatchErrors,
  SITE_SETTINGS_PATH
} from "./siteSettings.js";

const LAYOUT_ROUTE = /^\/admin\/puzzles\/([^/]+)\/layout(?:\.json)?$/;
const LAYOUT_PASS_ROUTE = /^\/admin\/puzzles\/([^/]+)\/layouts-auto$/;

const DRAFT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The job key a working copy's layout passes run under. */
export function draftLayoutPassKey(draftId) {
  return `draft:${draftId}`;
}

// One registry for the server: the default handler is rebuilt per request,
// and a running pass must stay findable across requests, including by the
// automatic pass's watcher.
const sharedLayoutPassJobs = new Map();
export function layoutPassJobsFor(repositoryRoot) {
  if (!sharedLayoutPassJobs.has(repositoryRoot)) {
    sharedLayoutPassJobs.set(repositoryRoot, createLayoutPassJobs({
      run: options => spawnLayoutPass({ ...options, repositoryRoot })
    }));
  }
  return sharedLayoutPassJobs.get(repositoryRoot);
}

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
  indexHtml = null,
  layoutPassJobs = null,
  siteSettings = null,
  actor = null,
  // Whether git content has been seeded into D1. A caller that builds this
  // handler per request passes one long-lived state, or every request seeds.
  seedState = { seeded: false }
}) {
  if (!contentDocuments) throw new Error("contentDocuments is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");

  async function ensureSeeded() {
    if (seedState.seeded) return;
    await buildPlayCorpusPayload({ contentDocuments, contentService });
    seedState.seeded = true;
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
    // The authoring panel's Run layout pass: POST starts the automatic
    // layout pass for one published puzzle ({ write: true } saves its
    // results), GET reports the running or last finished run. With
    // ?draft=<id> (the layout view is showing a working copy) both act on
    // that working copy instead, under the job key draft:<id>, which the
    // automatic pass on new working copies shares (autoLayoutWatcher.js).
    const passMatch = urlPath.match(LAYOUT_PASS_ROUTE);
    if (passMatch) {
      if (!requestIsSameOriginIfSpecified(req)) {
        json(res, { error: "Layout passes must be same-origin." }, 403);
        return true;
      }
      const id = decodeURIComponent(passMatch[1]);
      const jobs = layoutPassJobs || layoutPassJobsFor(repositoryRoot);
      const reading = req.method === "GET" || req.method === "HEAD";
      if (!reading && req.method !== "POST") return false;
      const draftId = requestUrl.searchParams.get("draft");
      if (draftId !== null && !DRAFT_ID_RE.test(draftId)) {
        json(res, { error: "Invalid working copy id.", id }, 400);
        return true;
      }
      const jobKey = draftId ? draftLayoutPassKey(draftId) : id;
      if (!draftId) {
        await ensureSeeded();
        let published;
        try {
          published = await contentDocuments.getPublished({ kind: "puzzle", id });
        } catch (error) {
          if (!(error instanceof ContentDocumentNotFoundError)) throw error;
          json(res, { error: "The layout pass runs on published puzzles; this one is not published.", id }, 404);
          return true;
        }
        if (published.withdrawnAt) {
          json(res, { error: "Puzzle withdrawn from authoring play", id }, 409);
          return true;
        }
      }
      if (reading) {
        json(res, jobs.get(jobKey));
        return true;
      }
      let body;
      try {
        body = await readJsonBody(req) || {};
      } catch (error) {
        // Never guess the operation from a broken request: a malformed save
        // must not quietly become a dry run.
        json(res, { error: error instanceof Error ? error.message : String(error), id }, 400);
        return true;
      }
      // A run can be narrowed to some modes and started from a board size;
      // anything else in either is refused rather than widened to a full run.
      const modes = body.modes ?? null;
      if (modes !== null && (!Array.isArray(modes) || !modes.length ||
          modes.some(mode => !LAYOUT_PASS_MODES.includes(mode)))) {
        json(res, { error: `modes must list some of ${LAYOUT_PASS_MODES.join(", ")}.`, id }, 400);
        return true;
      }
      const minSize = body.minSize == null ? null : canonicalBoardSizeFactor(body.minSize);
      if (body.minSize != null && minSize == null) {
        json(res, { error: "minSize must be a board size factor such as 1.1.", id }, 400);
        return true;
      }
      const base = `http://${req.headers.host || "127.0.0.1:8787"}`;
      json(res, jobs.start(jobKey, { write: body.write === true, base, modes, minSize, draft: draftId }), 202);
      return true;
    }
    // The layout view's Site settings card: GET reads every setting, PUT
    // takes { settings } naming only the ones it changes (null restores a
    // default) and answers with the result.
    if (urlPath === SITE_SETTINGS_PATH) {
      if (!requestIsSameOriginIfSpecified(req)) {
        json(res, { error: "Site settings writes must be same-origin." }, 403);
        return true;
      }
      if (!siteSettings) {
        json(res, { error: "Site settings are not configured." }, 503);
        return true;
      }
      if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "PUT") return false;
      try {
        if (req.method !== "PUT") {
          json(res, { settings: await siteSettings.read() });
          return true;
        }
        let body;
        try {
          body = await readJsonBody(req);
        } catch (error) {
          json(res, { error: error instanceof Error ? error.message : String(error) }, 400);
          return true;
        }
        const errors = siteSettingsPatchErrors(body?.settings);
        if (errors.length) {
          json(res, { error: "Site settings are invalid", errors }, 400);
          return true;
        }
        json(res, { settings: await siteSettings.update(body.settings, { actor }) });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        json(res, {
          error: /no such table/i.test(message)
            ? "Site settings need D1 migration 0034 (site_settings)."
            : message
        }, 500);
      }
      return true;
    }
    const layoutMatch = urlPath.match(LAYOUT_ROUTE);
    if (layoutMatch) {
      // Layout writes go to the puzzle's working copy (localDraftReview.js);
      // this route only reads the published layout.
      if (req.method !== "GET" && req.method !== "HEAD") return false;
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
      json(res, {
        id,
        revision: published.revision,
        layout: published.layout || null
      });
      return true;
    }
    if (req.method !== "GET" && req.method !== "HEAD") return false;
    const puzzleMatch = urlPath.match(/^\/play\/puzzles\/([^/]+)\.json$/);
    if (urlPath === PLAY_CORPUS_PATH) {
      const timing = createServerTiming();
      await ensureSeeded();
      timing.phase("seed");
      const [puzzleRows, catalogueRows, categoryRows, draftRows, settings] = await Promise.all([
        timing.timed("published-puzzles", contentDocuments.listPublished({ kind: "puzzle" })),
        timing.timed("published-catalogues", contentDocuments.listPublished({ kind: "catalogue" })),
        timing.timed("published-categories", contentDocuments.listPublished({ kind: "category" })),
        timing.timed("working-copies", typeof listDrafts === "function" ? listDrafts() : []),
        timing.timed("site-settings", readSiteSettingsOrDefaults(siteSettings))
      ]);
      timing.phase("fetch");
      const corpus = assemblePlayCorpus({
        puzzleRows,
        catalogueRows,
        categoryRows,
        draftRows: Array.isArray(draftRows) ? draftRows : [],
        puzzleOrder: puzzleIdsFromService(contentService),
        settings
      });
      timing.phase("assemble");
      timing.apply(res);
      json(res, corpus);
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
  // The handler is built per request; seeding git content into D1 happens
  // once per process, as ensureSeeded intends.
  const seedState = { seeded: false };
  return async function handleDefaultLocalPlayCorpus(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    const isIndex = urlPath === "/" || urlPath === "/index.html";
    const isPlay = urlPath === PLAY_CORPUS_PATH
      || /^\/play\/puzzles\/[^/]+\.json$/.test(urlPath);
    const isLayout = LAYOUT_ROUTE.test(urlPath) || LAYOUT_PASS_ROUTE.test(urlPath) ||
      urlPath === SITE_SETTINGS_PATH;
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
        repositoryRoot,
        siteSettings: resolved.siteSettings || null,
        actor: resolved.actor || null,
        seedState
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
