// Author-facing check of every `wiki:` link a puzzle document carries.
// Backs the check_puzzle_links MCP tool, the draft review page's link
// flags, and the authoring worker's weekly corpus-wide health run.
// Network-dependent by nature, so it is never part of validatePuzzleDraft:
// validation stays offline and fast, and a Wikipedia outage must not make
// a draft look invalid.
//
// Surfaces collected: puzzle info, relatedPuzzles info, cluster info, term
// info, bridge info, and the lesson's further-reading links. Auto-search
// fallbacks for overview surfaces are not collected -- only titles an
// author actually wrote.
//
// Resolutions are remembered in D1 (wikiLinkCheckStore.js) when a store is
// supplied: fresh rows are trusted, the rest are asked of Wikipedia and
// written back. Without a store every call asks Wikipedia.

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
 * Every wiki: link in the document with a human-readable location.
 * @param {object} document
 * @returns {WikiLinkRef[]}
 */
export function collectDocumentWikiLinks(document) {
  const refs = [];
  const seen = new Set();
  const addLinks = (where, links) => {
    for (const { href } of links) {
      const parsed = parseWikiShorthand(href);
      if (!parsed) continue;
      const key = `${where}\u0000${href}`;
      if (seen.has(key)) continue;
      seen.add(key);
      refs.push({ where, link: href, title: parsed.title });
    }
  };
  const addInfo = (where, info) => {
    if (typeof info === "string" || !info) return;
    addLinks(where, authoredLinks(info));
  };
  if (!document || typeof document !== "object") return refs;
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
  }
  return refs;
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
