// Author-facing check — NOT part of `npm test` or `validate.mjs`. Both
// of those stay fast and offline-safe on purpose; this one hits the
// network (Wikipedia's API), so it's a manual, occasional run instead
// of a commit gate.
//
// For every term whose info would show the auto-generated Wikipedia
// search link (no `link` override set), and for every curated
// "wiki:Title" link/extraLink, this verifies against Wikipedia's API
// that an article actually exists at that exact title (following
// redirects) — catching both "this concept phrase isn't a real article
// title, the auto-search will land on results instead of jumping
// straight there" (informational — search results are often still
// useful) and a typo in a hand-written wiki: shorthand (almost always
// a real mistake worth fixing).
//
// Results are cached in wiki-link-cache.json (committed) so re-running
// this doesn't re-query titles already verified — only new titles, or
// everything under --force, hit the network. Wikipedia's API accepts
// up to 50 titles per request, so a full fresh run is a handful of
// requests, not one per term.
//
// Usage:
//   node tools/check-wiki-links.mjs           # check, using the cache
//   node tools/check-wiki-links.mjs --force   # re-check every title

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cachePath = join(__dirname, "wiki-link-cache.json");
const force = process.argv.includes("--force");

let src = readFileSync(join(root, "puzzles.js"), "utf8");
src = src.replace("const PUZZLES", "globalThis.PUZZLES");
eval(src);

// ---- collect every title actually referenced ----
// kind "auto-search": no `link` override, so this term/bridge's own
// word is what the auto-generated search would look for.
// kind "wiki-link": a curated "wiki:Title" value — checked for typos,
// same as the auto-search case but naming a different title than the
// term itself.
const checks = []; // { title, kind, where }

function addIfWiki(raw, kind, where) {
  if (typeof raw === "string" && raw.startsWith("wiki:")) {
    checks.push({ title: raw.slice(5).trim(), kind, where });
  }
}

function collect(word, info, where) {
  if (!info || typeof info === "string" || !info.link) {
    checks.push({ title: word, kind: "auto-search", where });
  }
  if (info && typeof info !== "string") {
    addIfWiki(info.link, "wiki-link", where);
    addIfWiki(info.extraLink, "wiki-link", where);
  }
}

for (const p of PUZZLES) {
  p.clusters.forEach(c => {
    c.terms.forEach(term => {
      collect(term, c.termInfo && c.termInfo[term], `${p.id} / ${c.name} / "${term}"`);
    });
  });
  (p.bridges || []).forEach(b => {
    collect(b.term, b.info, `${p.id} / bridge / "${b.term}"`);
  });
}

const uniqueTitles = [...new Set(checks.map(c => c.title))];

// ---- load cache, figure out what actually needs a network round-trip ----
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
const toQuery = force ? uniqueTitles : uniqueTitles.filter(t => !(t in cache));

console.log(
  `${uniqueTitles.length} unique title(s) referenced, ${toQuery.length} need checking${force ? " (--force)" : ""}.`
);

// A batch response's pages are keyed by page ID, not by the title we
// asked for — MediaWiki normalizes (case) and follows redirects first,
// so mapping a result back to the ORIGINAL input title means walking
// both of those chains in reverse.
async function queryBatch(titles) {
  // formatversion=2 matters, not just style: the legacy default format
  // represents `missing` as an empty string, not a JSON boolean — which
  // is falsy in JS, meaning `!page.missing` reads a genuinely-missing
  // page as "exists" (confirmed: a deliberately nonsense title came
  // back marked as existing until this was added).
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.join("|"))}&redirects=1&format=json&formatversion=2`;
  const res = await fetch(url, {
    headers: { "User-Agent": "concept-clusters-link-check/1.0 (local puzzle-authoring tool)" }
  });
  if (!res.ok) throw new Error(`Wikipedia API returned HTTP ${res.status}`);
  const data = await res.json();
  const q = data.query || {};
  const normalizedFrom = new Map((q.normalized || []).map(n => [n.to, n.from]));
  const redirectFrom = new Map((q.redirects || []).map(r => [r.to, r.from]));
  function resolveOriginal(title) {
    const preRedirect = redirectFrom.has(title) ? redirectFrom.get(title) : title;
    return normalizedFrom.has(preRedirect) ? normalizedFrom.get(preRedirect) : preRedirect;
  }

  const results = {};
  for (const page of Object.values(q.pages || {})) {
    results[resolveOriginal(page.title)] = !page.missing;
  }
  // Anything not accounted for above (shouldn't normally happen) is
  // conservatively marked unresolved rather than silently dropped.
  for (const t of titles) if (!(t in results)) results[t] = false;
  return results;
}

const BATCH_SIZE = 50;
const results = { ...cache };
let hadNetworkError = false;

for (let i = 0; i < toQuery.length; i += BATCH_SIZE) {
  const batch = toQuery.slice(i, i + BATCH_SIZE);
  try {
    const batchResults = await queryBatch(batch);
    for (const [title, exists] of Object.entries(batchResults)) {
      results[title] = { exists, checkedAt: new Date().toISOString() };
    }
  } catch (err) {
    console.error(`Failed to check batch starting with "${batch[0]}": ${err.message}`);
    hadNetworkError = true;
  }
}

writeFileSync(cachePath, JSON.stringify(results, null, 2) + "\n");

// ---- report ----
const missing = checks.filter(c => results[c.title] && results[c.title].exists === false);
if (missing.length === 0) {
  console.log("\nEvery referenced title resolves to a real Wikipedia article.");
} else {
  console.log(`\n${missing.length} reference(s) to a title with no matching article:\n`);
  for (const m of missing) {
    console.log(`  [${m.kind}] "${m.title}" — ${m.where}`);
  }
  console.log(
    "\nauto-search entries just mean the Search link lands on results instead of\n" +
    "jumping straight to an article — often still fine, worth a glance. wiki-link\n" +
    "entries are very likely a typo in the wiki: shorthand and worth fixing."
  );
}

process.exit(hadNetworkError ? 1 : 0);
