// Author-facing check of the links a puzzle document carries. Backs the
// check_puzzle_links MCP tool, the draft review page's link flags, and
// (for wiki: titles) the authoring worker's weekly corpus-wide health run.
// Network-dependent by nature, so it is never part of validatePuzzleDraft:
// validation stays offline and fast, and a Wikipedia or host outage must
// not make a draft look invalid.
//
// wiki: titles, and https Wikipedia article URLs, are asked of Wikipedia:
// ok, redirect, missing, or disambiguation. Every other http(s) URL,
// including citation URLs, is checked for reachability only. A live
// response is not a reading of the page. A timeout, refusal, or non-public
// address is inconclusive, not a broken link.
//
// Surfaces collected: puzzle info, relatedPuzzles info, cluster info, term
// info, bridge info, citation URLs on those surfaces, and the lesson's
// further-reading links. Auto-search fallbacks for overview surfaces are
// not collected -- only targets an author actually wrote.
//
// Wikipedia resolutions are remembered in D1 (wikiLinkCheckStore.js) when
// a store is supplied. Reachability is not stored: a refusal depends on
// the client asking.

import { checkUrlReachabilityAll } from "./linkReachability.js";
import { authoredLinks, authoredLearningLinks, parseWikiShorthand } from "./termInfo.js";
import { resolveWikipediaTitles } from "./wikipediaTitles.js";

// How old a stored resolution may be before a draft page or tool call asks
// again. The weekly cron refreshes the whole corpus regardless.
export const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const WIKI_LINK_FLAG_IDS = Object.freeze({
  missing: "wiki-link-missing",
  disambiguation: "wiki-link-disambiguation",
  redirect: "wiki-link-redirect",
  unavailable: "wiki-link-check-unavailable"
});

export const WEB_LINK_FLAG_IDS = Object.freeze({
  missing: "web-link-missing",
  redirect: "web-link-redirect",
  inconclusive: "web-link-inconclusive"
});

/**
 * @typedef {{ where: string, link: string, title: string }} WikiLinkRef
 * @typedef {{
 *   where: string,
 *   link: string,
 *   title: string,
 *   status: "ok" | "redirect" | "missing" | "disambiguation",
 *   resolvedTitle: string | null
 * }} WikiLinkResult
 * @typedef {{
 *   checked: number,
 *   results: WikiLinkResult[],
 *   unavailable: string | null
 * }} WikiLinkReport
 */

/**
 * An en.wikipedia.org article URL an author wrote out in full, or null.
 * Special: pages stay ordinary URLs: a search results page is a destination,
 * not an article title.
 * @param {string} raw
 * @returns {string | null}
 */
export function wikipediaArticleTitle(raw) {
  if (typeof raw !== "string") return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (host !== "en.wikipedia.org" && host !== "en.m.wikipedia.org") return null;
  if (!url.pathname.startsWith("/wiki/")) return null;
  const slug = url.pathname.slice("/wiki/".length);
  if (!slug || slug.startsWith("Special:")) return null;
  let title;
  try {
    title = decodeURIComponent(slug);
  } catch {
    return null;
  }
  title = title.replace(/_/g, " ").trim();
  return title || null;
}

function wikiTitleOf(href) {
  const parsed = parseWikiShorthand(href);
  if (parsed) return parsed.title;
  return wikipediaArticleTitle(href);
}

function citationLabel(entry) {
  return typeof entry?.title === "string" && entry.title.trim() ? entry.title.trim() : "citation";
}

/**
 * Every authored href, in document order, with the surface it sits on.
 * Citation URLs are included; they are not part of `links`.
 * @param {object} document
 * @param {(where: string, href: string) => void} onHref
 */
function visitDocumentHrefs(document, onHref) {
  const addLinks = (where, links) => {
    for (const { href } of links) {
      if (typeof href === "string" && href.trim()) onHref(where, href.trim());
    }
  };
  const addCitations = (where, info) => {
    const citations = info && typeof info === "object" && !Array.isArray(info) && Array.isArray(info.citations)
      ? info.citations
      : [];
    for (const citation of citations) {
      const url = typeof citation?.url === "string" ? citation.url.trim() : "";
      if (!url) continue;
      onHref(`${where} citation "${citationLabel(citation)}"`, url);
    }
  };
  const addInfo = (where, info) => {
    if (typeof info === "string" || !info) return;
    addLinks(where, authoredLinks(info));
    addCitations(where, info);
  };
  if (!document || typeof document !== "object") return;
  addInfo("puzzle", document.info);
  addInfo("relatedPuzzles", document.relatedPuzzles?.info);
  for (const cluster of Array.isArray(document.clusters) ? document.clusters : []) {
    const clusterName = cluster?.name || cluster?.id || "cluster";
    addInfo(`cluster "${clusterName}"`, cluster?.info);
    for (const [term, info] of Object.entries(cluster?.termInfo || {})) {
      addInfo(`term "${term}"`, info);
    }
  }
  for (const bridge of Array.isArray(document.bridges) ? document.bridges : []) {
    addInfo(`bridge "${bridge?.term || bridge?.id || "bridge"}"`, bridge?.info);
  }
  if (document.learningIntroduction) {
    addLinks("learningIntroduction", authoredLearningLinks(document.learningIntroduction));
    addCitations("learningIntroduction", document.learningIntroduction);
  }
}

function collectHrefs(document, accept) {
  const refs = [];
  const seen = new Set();
  visitDocumentHrefs(document, (where, href) => {
    const extra = accept(href);
    if (!extra) return;
    const key = `${where}\u0000${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ where, link: href, ...extra });
  });
  return refs;
}

/**
 * Every wiki: link, and every full English Wikipedia article URL, with a
 * human-readable location.
 * @param {object} document
 * @returns {WikiLinkRef[]}
 */
export function collectDocumentWikiLinks(document) {
  return collectHrefs(document, href => {
    const title = wikiTitleOf(href);
    return title ? { title } : null;
  });
}

/**
 * Every other authored link. Wikipedia articles are left to the title check.
 * @param {object} document
 * @returns {Array<{ where: string, link: string }>}
 */
export function collectDocumentWebLinks(document) {
  return collectHrefs(document, href => (wikiTitleOf(href) ? null : { }));
}

function statusOf(resolution) {
  if (!resolution || !resolution.exists) return "missing";
  if (resolution.disambiguation) return "disambiguation";
  if (resolution.resolvedTitle) return "redirect";
  return "ok";
}

/**
 * Resolve titles, trusting the store for anything fresh and asking Wikipedia
 * for the rest (written back on success). Returns what could be resolved
 * and, when Wikipedia was needed but unreachable, why.
 *
 * @param {string[]} titles
 * @param {{
 *   store?: import("./wikiLinkCheckStore.js").WikiLinkCheckStore | null,
 *   maxAgeMs?: number,
 *   fetch?: typeof fetch,
 *   timeoutMs?: number,
 *   now?: () => number
 * }} [options]
 * @returns {Promise<{ resolutions: Map<string, object>, unavailable: string | null }>}
 */
export async function resolveTitlesThroughStore(titles, {
  store = null,
  maxAgeMs = DEFAULT_MAX_AGE_MS,
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
  now = Date.now
} = {}) {
  const unique = [...new Set(titles)];
  const at = now();
  // maxAgeMs <= 0 means refresh: never consult the store, only write to it.
  // (A row stamped in the future -- clock skew between the cron and a
  // laptop -- would otherwise pass a ">= now - 0" freshness test forever.)
  const resolutions = store && maxAgeMs > 0
    ? await store.readFresh(unique, { maxAgeMs, now: at })
    : new Map();
  const pending = unique.filter(title => !resolutions.has(title));
  let unavailable = null;
  if (pending.length) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const fresh = await resolveWikipediaTitles(pending, {
        fetch: fetchImpl,
        signal: controller?.signal
      });
      for (const [title, resolution] of fresh) resolutions.set(title, resolution);
      if (store) await store.write(fresh, { now: at });
    } catch (error) {
      unavailable = error?.name === "AbortError"
        ? `Wikipedia did not answer within ${Math.round(timeoutMs / 1000)}s`
        : `Wikipedia could not be reached: ${error?.message || error}`;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  return { resolutions, unavailable };
}

/**
 * @param {object} document
 * @param {Parameters<typeof resolveTitlesThroughStore>[1]} [options]
 * @returns {Promise<WikiLinkReport>}
 */
export async function checkDocumentWikiLinks(document, options = {}) {
  const refs = collectDocumentWikiLinks(document);
  if (!refs.length) return { checked: 0, results: [], unavailable: null };
  const { resolutions, unavailable } = await resolveTitlesThroughStore(
    refs.map(ref => ref.title),
    options
  );
  const results = [];
  for (const ref of refs) {
    const resolution = resolutions.get(ref.title);
    if (!resolution) continue;
    results.push({
      ...ref,
      status: statusOf(resolution),
      resolvedTitle: resolution.resolvedTitle
    });
  }
  return { checked: results.length, results, unavailable };
}

/**
 * Reachability of every non-Wikipedia link. Nothing is written to the
 * Wikipedia store. Each URL is probed once and copied onto every surface
 * that carries it.
 * @param {object} document
 * @param {{ fetch?: typeof fetch, timeoutMs?: number, signal?: AbortSignal }} [options]
 */
export async function checkDocumentWebLinks(document, {
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
  signal
} = {}) {
  const refs = collectDocumentWebLinks(document);
  if (!refs.length) return { checked: 0, results: [], unavailable: null };
  // One budget for the whole batch, shared with the draft page's short
  // timeout. URLs still waiting when it runs out are inconclusive.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onParent = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onParent, { once: true });
  }
  let resolutions;
  try {
    resolutions = await checkUrlReachabilityAll(refs.map(ref => ref.link), {
      fetch: fetchImpl,
      timeoutMs,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onParent);
  }
  const results = refs.map(ref => {
    const resolution = resolutions.get(ref.link);
    return {
      kind: "web",
      where: ref.where,
      link: ref.link,
      status: resolution?.status || "inconclusive",
      finalUrl: resolution?.finalUrl || null,
      reason: resolution?.reason || null
    };
  });
  return { checked: results.length, results, unavailable: null };
}

/**
 * Wikipedia titles and other links, for the MCP tool and the draft page.
 * The weekly corpus run stays on checkDocumentWikiLinks.
 * @param {object} document
 * @param {Parameters<typeof resolveTitlesThroughStore>[1]} [options]
 */
export async function checkDocumentLinks(document, options = {}) {
  const [wiki, web] = await Promise.all([
    checkDocumentWikiLinks(document, options),
    checkDocumentWebLinks(document, options)
  ]);
  return {
    checked: wiki.checked + web.checked,
    results: [
      ...wiki.results.map(result => ({ kind: "wiki", ...result })),
      ...web.results
    ],
    unavailable: wiki.unavailable,
    wiki,
    web
  };
}

/**
 * Weekly corpus-wide run: every wiki: title in every live published puzzle,
 * refreshed regardless of age and written to the store, with the problems
 * grouped by title so a report can say which puzzles each one affects.
 *
 * @param {{
 *   contentDocuments: { listPublished: (args: any) => Promise<any[]> },
 *   store: import("./wikiLinkCheckStore.js").WikiLinkCheckStore,
 *   fetch?: typeof fetch,
 *   timeoutMs?: number,
 *   now?: () => number
 * }} options
 * @returns {Promise<{
 *   puzzles: number,
 *   checked: number,
 *   counts: { ok: number, redirect: number, missing: number, disambiguation: number },
 *   unavailable: string | null,
 *   issues: Array<{ title: string, status: string, resolvedTitle: string | null, puzzles: string[] }>
 * }>}
 */
export async function runWikiLinkHealth({ contentDocuments, store, fetch: fetchImpl, timeoutMs = 30000, now = Date.now }) {
  const rows = (await contentDocuments.listPublished({ kind: "puzzle" }))
    .filter(row => row && !row.withdrawnAt && row.document);
  const puzzlesByTitle = new Map();
  for (const row of rows) {
    for (const ref of collectDocumentWikiLinks(row.document)) {
      if (!puzzlesByTitle.has(ref.title)) puzzlesByTitle.set(ref.title, new Set());
      puzzlesByTitle.get(ref.title).add(row.id);
    }
  }
  const { resolutions, unavailable } = await resolveTitlesThroughStore([...puzzlesByTitle.keys()], {
    store,
    maxAgeMs: 0,
    fetch: fetchImpl,
    timeoutMs,
    now
  });
  const issues = [];
  const counts = { ok: 0, redirect: 0, missing: 0, disambiguation: 0 };
  for (const [title, resolution] of resolutions) {
    const status = statusOf(resolution);
    counts[status] += 1;
    if (status === "ok") continue;
    issues.push({
      title,
      status,
      resolvedTitle: resolution.resolvedTitle,
      puzzles: [...puzzlesByTitle.get(title)].sort()
    });
  }
  issues.sort((left, right) => left.status.localeCompare(right.status) || left.title.localeCompare(right.title));
  return { puzzles: rows.length, checked: resolutions.size, counts, unavailable, issues };
}

/** Human-facing flags for the draft review page, one per problem link. */
export function wikiLinkFlags(report) {
  const flags = [];
  if (!report) return flags;
  if (report.unavailable) {
    flags.push({
      id: WIKI_LINK_FLAG_IDS.unavailable,
      message: `Wikipedia links were not checked: ${report.unavailable}.`
    });
  }
  for (const result of report.results || []) {
    if (result.status === "ok") continue;
    const at = `${result.where}: ${result.link}`;
    if (result.kind === "web") {
      if (result.status === "missing") {
        flags.push({
          id: WEB_LINK_FLAG_IDS.missing,
          message: `${at} — ${result.reason || "the link does not resolve"}.`
        });
      } else if (result.status === "redirect") {
        flags.push({
          id: WEB_LINK_FLAG_IDS.redirect,
          message: `${at} — redirects to ${result.finalUrl}. Consider linking that URL directly.`
        });
      } else if (result.status === "inconclusive") {
        flags.push({
          id: WEB_LINK_FLAG_IDS.inconclusive,
          message: `${at} — could not be checked (${result.reason || "no answer"}). This does not mean the link is wrong.`
        });
      }
      continue;
    }
    if (result.status === "missing") {
      flags.push({
        id: WIKI_LINK_FLAG_IDS.missing,
        message: `${at} — no Wikipedia article at that title. Fix the title, zoom out to the containing topic, or drop the link.`
      });
    } else if (result.status === "disambiguation") {
      flags.push({
        id: WIKI_LINK_FLAG_IDS.disambiguation,
        message: `${at} — that title is a disambiguation page, not an article about the term. Point it at the specific article.`
      });
    } else if (result.status === "redirect") {
      flags.push({
        id: WIKI_LINK_FLAG_IDS.redirect,
        message: `${at} — redirects to "${result.resolvedTitle}". Consider linking that title directly.`
      });
    }
  }
  return flags;
}

/**
 * Current link health from what is already known -- no network. Joins every
 * wiki: link in the live published corpus against the store, so the admin
 * index can summarise it and /admin/link-health can list each problem title
 * with the puzzles and surfaces that carry it. Titles the store has never
 * seen are counted as unchecked (the cron or the next draft-page render
 * will fill them in).
 *
 * @param {{
 *   contentDocuments: { listPublished: (args: any) => Promise<any[]> },
 *   store: import("./wikiLinkCheckStore.js").WikiLinkCheckStore
 * }} options
 */
export async function loadWikiLinkHealth({ contentDocuments, store }) {
  const rows = (await contentDocuments.listPublished({ kind: "puzzle" }))
    .filter(row => row && !row.withdrawnAt && row.document);
  const referencesByTitle = new Map();
  for (const row of rows) {
    const puzzleTitle = row.document.title || row.id;
    for (const ref of collectDocumentWikiLinks(row.document)) {
      if (!referencesByTitle.has(ref.title)) referencesByTitle.set(ref.title, []);
      referencesByTitle.get(ref.title).push({ puzzleId: row.id, puzzleTitle, where: ref.where, link: ref.link });
    }
  }
  const known = await store.readAll();
  const counts = { ok: 0, redirect: 0, missing: 0, disambiguation: 0 };
  const issues = [];
  let checked = 0;
  let latestCheckedAt = null;
  for (const [title, references] of referencesByTitle) {
    const row = known.get(title);
    if (!row) continue;
    checked += 1;
    if (!latestCheckedAt || row.checkedAt > latestCheckedAt) latestCheckedAt = row.checkedAt;
    const status = statusOf(row);
    counts[status] += 1;
    if (status === "ok") continue;
    issues.push({
      title,
      status,
      resolvedTitle: row.resolvedTitle,
      checkedAt: row.checkedAt,
      references: [...references].sort((left, right) =>
        left.puzzleId.localeCompare(right.puzzleId) || left.where.localeCompare(right.where))
    });
  }
  const order = { missing: 0, disambiguation: 1, redirect: 2 };
  issues.sort((left, right) => order[left.status] - order[right.status] || left.title.localeCompare(right.title));
  return {
    puzzles: rows.length,
    titles: referencesByTitle.size,
    checked,
    unchecked: referencesByTitle.size - checked,
    latestCheckedAt,
    counts,
    affectedPuzzles: new Set(issues.flatMap(issue => issue.references.map(ref => ref.puzzleId))).size,
    issues
  };
}
