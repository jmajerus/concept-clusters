// Public, read-only projections of the D1 publication ledger. The routes using
// this module never expose drafts, review history, or publication actors.
import { ContentDocumentNotFoundError, D1ContentDocumentRepository } from "./contentDocumentRepository.js";
import { categoriesRegistryFromDocuments, catalogueFromDocument, compilePublishedPuzzle } from "./playCorpus.js";
import { puzzleBrowseFromDocument } from "./puzzleBrowse.js";
import { puzzleContentFingerprint, puzzleLayoutFingerprint } from "./publicPlayVersion.js";
import { PUBLIC_PLAY_INDEX_PATH, PUBLIC_PLAY_META_NAME } from "./publicPlayRoutes.js";
import { PUZZLE_MANIFEST } from "../puzzles/manifest.js";

const CACHE_CONTROL = "public, max-age=0, s-maxage=30";
const NO_STORE = "no-store";
const PUZZLE_PATH = /^\/api\/puzzles\/([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;

export function htmlWithPublicPlayMeta(markup) {
  const html = String(markup);
  if (html.includes(`name="${PUBLIC_PLAY_META_NAME}"`)) return html;
  return html.replace("<head>", `<head>\n  <meta name="${PUBLIC_PLAY_META_NAME}" content="${PUBLIC_PLAY_INDEX_PATH}">`);
}

function response(body, status = 200, cacheControl = CACHE_CONTROL) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cacheControl }
  });
}

function sortedJson(value) {
  if (Array.isArray(value)) return value.map(sortedJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort()
      .filter(key => value[key] !== undefined)
      .map(key => [key, sortedJson(value[key])]));
  }
  return value;
}

function byFirstPublication(left, right) {
  return String(left.firstPublishedAt || left.publishedAt || "")
    .localeCompare(String(right.firstPublishedAt || right.publishedAt || ""))
    || String(left.id).localeCompare(String(right.id));
}

export async function buildPublicPlayIndex(repository, { staticManifest = [] } = {}) {
  const [puzzles, categories, catalogues] = await Promise.all([
    repository.listPublished({ kind: "puzzle" }),
    repository.listPublished({ kind: "category" }),
    repository.listPublished({ kind: "catalogue" })
  ]);
  const categoryRegistry = categoriesRegistryFromDocuments(categories.map(row => row.document));
  const staticById = new Map(staticManifest.map(entry => [entry.id, entry]));
  const entries = [...puzzles].sort(byFirstPublication).map(row => {
    const { puzzle, errors } = compilePublishedPuzzle(row.document);
    if (!puzzle) {
      // An invalid published document remains visible as a load failure;
      // the static snapshot must never silently override it.
      console.error(`Published puzzle ${row.id} cannot compile: ${errors.join("; ")}`);
    }
    const contentFingerprint = puzzle ? puzzleContentFingerprint(puzzle) : null;
    const layoutFingerprint = puzzleLayoutFingerprint(row.layout);
    const browse = puzzleBrowseFromDocument(row.document, { categoryRegistry });
    const staticBrowse = staticById.get(row.id)?.browse;
    return {
      id: row.id,
      firstPublishedAt: row.firstPublishedAt || row.publishedAt || null,
      contentFingerprint,
      layoutFingerprint,
      dateCreated: puzzle?.dateCreated || null,
      dateModified: puzzle?.dateModified || null,
      ...(JSON.stringify(sortedJson(browse)) === JSON.stringify(sortedJson(staticBrowse)) ? {} : { browse })
    };
  });
  return {
    puzzles: entries,
    categories: categoryRegistry,
    catalogues: [...catalogues].sort(byFirstPublication)
      .map(row => catalogueFromDocument(row.document)).filter(Boolean)
  };
}

export async function handlePublicPlayRequest(request, env, { repository: suppliedRepository = null } = {}) {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return response({ error: "Method not allowed" }, 405, NO_STORE);
  }
  if (!suppliedRepository && !env.AUTHORING_DB) {
    return response({ error: "Publication database unavailable" }, 503, NO_STORE);
  }
  const repository = suppliedRepository || new D1ContentDocumentRepository(env.AUTHORING_DB);
  try {
    if (url.pathname === PUBLIC_PLAY_INDEX_PATH) {
      const result = response(await buildPublicPlayIndex(repository, { staticManifest: PUZZLE_MANIFEST }));
      return request.method === "HEAD" ? new Response(null, result) : result;
    }
    const match = url.pathname.match(PUZZLE_PATH);
    if (!match) return response({ error: "Not found" }, 404, NO_STORE);
    const id = match[1];
    let published;
    try {
      published = await repository.getPublished({ kind: "puzzle", id });
    } catch (error) {
      if (error instanceof ContentDocumentNotFoundError) {
        return response({ error: "Puzzle not found" }, 404, NO_STORE);
      }
      throw error;
    }
    if (published.withdrawnAt) return response({ error: "Puzzle not found" }, 404, NO_STORE);
    const { puzzle, errors } = compilePublishedPuzzle(published.document);
    if (!puzzle) {
      console.error(`Published puzzle ${id} cannot compile: ${errors.join("; ")}`);
      return response({ error: "Published puzzle cannot load" }, 500, NO_STORE);
    }
    const contentFingerprint = puzzleContentFingerprint(puzzle);
    const layoutFingerprint = puzzleLayoutFingerprint(published.layout);
    const version = `${contentFingerprint}.${layoutFingerprint}`;
    const cache = url.searchParams.get("v") === version ? CACHE_CONTROL : NO_STORE;
    const result = response({
      id,
      contentFingerprint,
      layoutFingerprint,
      puzzle,
      ...(published.layout ? { layout: published.layout } : {})
    }, 200, cache);
    return request.method === "HEAD" ? new Response(null, result) : result;
  } catch (error) {
    console.error("Public play read failed", error);
    return response({ error: "Publication database unavailable" }, 503, NO_STORE);
  }
}

// Only the public GET routes use the Cache API. Keeping cache access here
// avoids putting the authenticated /admin handler or transformed HTML behind
// a Worker-wide cache. Stored copies have an edge TTL; returned copies tell
// browsers to revalidate, so a second browser visit can see a fresh index.
export async function handleCachedPublicPlayRequest(
  request,
  env,
  ctx,
  { cache = globalThis.caches?.default, repository = null } = {}
) {
  if (request.method !== "GET" || !cache) {
    return handlePublicPlayRequest(request, env, { repository });
  }
  try {
    const hit = await cache.match(request);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set("Cache-Control", CACHE_CONTROL);
      return new Response(hit.body, { status: hit.status, headers });
    }
  } catch (error) {
    console.error("Public play cache read failed", error);
  }
  const result = await handlePublicPlayRequest(request, env, { repository });
  if (result.ok && result.headers.get("Cache-Control") === CACHE_CONTROL) {
    const copy = result.clone();
    copy.headers.set("Cache-Control", "public, max-age=30");
    const write = cache.put(request, copy).catch(error => {
      console.error("Public play cache write failed", error);
    });
    if (ctx?.waitUntil) ctx.waitUntil(write);
    else await write;
  }
  return result;
}
