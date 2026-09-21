// One definition of "does this Wikipedia title resolve", shared by the
// weekly link-health cron (src/worker.js), the manual CLI report
// (tools/check-wiki-links.mjs), and the MCP / draft-page link check
// (wikiLinkCheck.js). Deliberately import-free so the Worker bundle can
// take it without dragging puzzle content along.
//
// Wikipedia's query API answers for up to 50 titles per call and reports
// normalization (capitalisation, underscores) and redirects separately from
// page existence, so a title that lands on an article through a redirect is
// distinguishable from one that is the article's own title. Disambiguation
// pages are reported through pageprops: a list of unrelated things sharing a
// name is not an article about the term, and is always worth an author's
// attention.

export const WIKIPEDIA_USER_AGENT =
  "concept-clusters-link-check/1.0 (https://github.com/jmajerus/concept-clusters)";

const BATCH_SIZE = 50;

/**
 * @typedef {{
 *   exists: boolean,
 *   disambiguation: boolean,
 *   resolvedTitle: string | null
 * }} TitleResolution
 *   resolvedTitle is the article title actually reached, when it differs from
 *   the queried title (a redirect or a normalisation); null when the queried
 *   title is the article's own, or when it does not exist.
 */

function queryUrl(titles) {
  const params = new URLSearchParams({
    action: "query",
    titles: titles.join("|"),
    redirects: "1",
    prop: "pageprops",
    format: "json",
    formatversion: "2"
  });
  return `https://en.wikipedia.org/w/api.php?${params}`;
}

async function queryBatch(titles, { fetch: fetchImpl, signal }) {
  const res = await fetchImpl(queryUrl(titles), {
    headers: { "User-Agent": WIKIPEDIA_USER_AGENT },
    signal
  });
  if (!res.ok) throw new Error(`Wikipedia API returned HTTP ${res.status}`);
  const data = await res.json();
  const q = data.query || {};
  const normalizedTo = new Map((q.normalized || []).map(n => [n.from, n.to]));
  const redirectTo = new Map((q.redirects || []).map(r => [r.from, r.to]));
  const pageByTitle = new Map(Object.values(q.pages || {}).map(p => [p.title, p]));

  const results = new Map();
  for (const title of titles) {
    const afterNormalize = normalizedTo.get(title) ?? title;
    const finalTitle = redirectTo.get(afterNormalize) ?? afterNormalize;
    const page = pageByTitle.get(finalTitle);
    const exists = Boolean(page && !page.missing);
    results.set(title, {
      exists,
      disambiguation: Boolean(exists && page.pageprops && "disambiguation" in page.pageprops),
      resolvedTitle: exists && finalTitle !== title ? finalTitle : null
    });
  }
  return results;
}

/**
 * Resolve each title against Wikipedia. Titles are deduplicated and batched;
 * the returned Map is keyed by the titles as given.
 *
 * @param {string[]} titles
 * @param {{ fetch?: typeof fetch, signal?: AbortSignal }} [options]
 * @returns {Promise<Map<string, TitleResolution>>}
 */
export async function resolveWikipediaTitles(titles, { fetch: fetchImpl = globalThis.fetch, signal } = {}) {
  if (typeof fetchImpl !== "function") throw new Error("fetch is not available");
  const unique = [...new Set(titles.filter(title => typeof title === "string" && title.trim()))];
  const results = new Map();
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = await queryBatch(unique.slice(i, i + BATCH_SIZE), { fetch: fetchImpl, signal });
    for (const [title, resolution] of batch) results.set(title, resolution);
  }
  return results;
}
