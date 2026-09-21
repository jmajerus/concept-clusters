// Author-facing check of every `wiki:` link a puzzle document carries.
// Backs the check_puzzle_links MCP tool and the draft review page's link
// flags. Network-dependent by nature, so it is never part of
// validatePuzzleDraft: validation stays offline and fast, and a Wikipedia
// outage must not make a draft look invalid.
//
// Surfaces collected: puzzle info, relatedPuzzles info, cluster info, term
// info, bridge info, and the lesson's further-reading links. Auto-search
// fallbacks for overview surfaces are not collected -- only titles an
// author actually wrote.

import { authoredLinks, authoredLearningLinks, parseWikiShorthand } from "./termInfo.js";
import { resolveWikipediaTitles } from "./wikipediaTitles.js";

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

// Titles resolved recently are not asked again: the draft page re-renders
// on every save and a document's links rarely change between them.
const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;
const resolutionCache = new Map();

function cached(title, now, ttl) {
  const entry = resolutionCache.get(title);
  return entry && now - entry.at < ttl ? entry.resolution : null;
}

/**
 * @param {object} document
 * @param {{
 *   fetch?: typeof fetch,
 *   timeoutMs?: number,
 *   cacheTtlMs?: number,
 *   now?: () => number
 * }} [options]
 * @returns {Promise<WikiLinkReport>}
 */
export async function checkDocumentWikiLinks(document, {
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
  now = Date.now
} = {}) {
  const refs = collectDocumentWikiLinks(document);
  if (!refs.length) return { checked: 0, results: [], unavailable: null };
  const at = now();
  const resolutions = new Map();
  const pending = [];
  for (const { title } of refs) {
    if (resolutions.has(title)) continue;
    const hit = cached(title, at, cacheTtlMs);
    if (hit) resolutions.set(title, hit);
    else pending.push(title);
  }
  let unavailable = null;
  if (pending.length) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const fresh = await resolveWikipediaTitles(pending, {
        fetch: fetchImpl,
        signal: controller?.signal
      });
      for (const [title, resolution] of fresh) {
        resolutions.set(title, resolution);
        resolutionCache.set(title, { resolution, at });
      }
    } catch (error) {
      unavailable = error?.name === "AbortError"
        ? `Wikipedia did not answer within ${Math.round(timeoutMs / 1000)}s`
        : `Wikipedia could not be reached: ${error?.message || error}`;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
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

/** Test seam. */
export function clearWikiLinkResolutionCache() {
  resolutionCache.clear();
}
