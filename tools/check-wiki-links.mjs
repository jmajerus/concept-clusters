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
// It also flags titles that resolve to a Wikipedia disambiguation page
// — a list of unrelated things sharing a name, not an article about the
// term itself. That's always worth fixing regardless of which kind
// flagged it: for a curated wiki: link it's simply the wrong title, and
// for an auto search it's exactly the "lands on the wrong or an
// ambiguous page" case AUTHORING.md already says `link` exists for —
// worth calling out explicitly instead of leaving it to look like a
// plain "no exact page" miss. ("ATP" is a real example: Wikipedia's
// "ATP" page is a disambiguation page, not the molecule.)
//
// The report is written for a puzzle author, not a developer: plain
// puzzle titles (not internal ids), plain-English explanations instead
// of implementation labels, a copy-pasteable snippet showing exactly
// what to paste into puzzles.js for anything that needs fixing, and
// human error messages if Wikipedia can't be reached. An author
// shouldn't need to read this file to understand what it's telling them.
//
// (An earlier version of this tool tried to also suggest the likely
// correct title via Wikipedia's search API — "did you mean...?" — but
// that was dropped: for descriptive phrases that were never meant to be
// article titles, like "fixed shape" or "natural cadence", full-text
// search often returns something unrelated with matching keywords
// rather than nothing, e.g. "Cricket field" and "Autostereogram". A
// confidently wrong suggestion is worse than no suggestion for someone
// who isn't expected to double-check it.)
//
// Results are cached in wiki-link-cache.json (committed) so re-running
// this doesn't re-query titles already checked. Wikipedia's API accepts
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
const USER_AGENT = "concept-clusters-link-check/1.0 (local puzzle-authoring tool)";

let src = readFileSync(join(root, "puzzles.js"), "utf8");
src = src.replace("const PUZZLES", "globalThis.PUZZLES");
eval(src);

// ---- collect every title actually referenced, with enough context to
// explain each one in plain language later ----
const checks = []; // { title, kind, puzzleTitle, location, term, field }

function collect(word, info, puzzleTitle, location) {
  if (!info || typeof info === "string" || !info.link) {
    checks.push({ title: word, kind: "auto-search", puzzleTitle, location, term: word });
  }
  if (info && typeof info !== "string") {
    for (const field of ["link", "extraLink"]) {
      const raw = info[field];
      if (typeof raw === "string" && raw.startsWith("wiki:")) {
        checks.push({ title: raw.slice(5).trim(), kind: "wiki-link", puzzleTitle, location, term: word, field });
      }
    }
  }
}

for (const p of PUZZLES) {
  p.clusters.forEach(c => {
    c.terms.forEach(term => {
      collect(term, c.termInfo && c.termInfo[term], p.title, c.name);
    });
  });
  (p.bridges || []).forEach(b => {
    collect(b.term, b.info, p.title, "bridge");
  });
}

const uniqueTitles = [...new Set(checks.map(c => c.title))];

// ---- load cache, figure out what actually needs a network round-trip ----
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
const toQuery = force ? uniqueTitles : uniqueTitles.filter(t => !(t in cache));

console.log(
  `Checking ${uniqueTitles.length} title(s) referenced in puzzles.js against Wikipedia` +
  (toQuery.length ? ` — ${toQuery.length} of them for the first time.` : ", all previously checked (nothing new).")
);

async function wikiFetch(url) {
  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  } catch {
    const err = new Error("Couldn't reach Wikipedia — check your internet connection and try again.");
    err.friendly = true;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(
      res.status === 429
        ? "Wikipedia asked us to slow down (too many checks at once). Wait a minute and run this again — anything already checked is saved, so it won't start over."
        : `Wikipedia's site returned an error (HTTP ${res.status}). This is usually temporary — try again in a bit.`
    );
    err.friendly = true;
    throw err;
  }
  return res.json();
}

// A batch response's pages aren't keyed by the title we asked for —
// MediaWiki normalizes (case) and follows redirects first, so mapping
// a result back to the ORIGINAL input title means walking both of
// those chains in reverse.
async function queryExistence(titles) {
  // formatversion=2 matters, not just style: the legacy default format
  // represents `missing` as an empty string, not a JSON boolean — which
  // is falsy in JS, meaning `!page.missing` reads a genuinely-missing
  // page as "exists" (confirmed: a deliberately nonsense title came
  // back marked as existing until this was added).
  //
  // prop=pageprops is in the same request (not a separate one) — a
  // disambiguation page carries a `disambiguation` pageprop, which is
  // how "exists" is distinguished from "exists and is actually useful".
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.join("|"))}&redirects=1&prop=pageprops&format=json&formatversion=2`;
  const data = await wikiFetch(url);
  const q = data.query || {};
  const normalizedFrom = new Map((q.normalized || []).map(n => [n.to, n.from]));
  const redirectFrom = new Map((q.redirects || []).map(r => [r.to, r.from]));
  function resolveOriginal(title) {
    const preRedirect = redirectFrom.has(title) ? redirectFrom.get(title) : title;
    return normalizedFrom.has(preRedirect) ? normalizedFrom.get(preRedirect) : preRedirect;
  }
  const results = {};
  for (const page of Object.values(q.pages || {})) {
    results[resolveOriginal(page.title)] = {
      exists: !page.missing,
      disambiguation: !!(page.pageprops && "disambiguation" in page.pageprops)
    };
  }
  // Anything not accounted for above (shouldn't normally happen) is
  // conservatively marked unresolved rather than silently dropped.
  for (const t of titles) if (!(t in results)) results[t] = { exists: false, disambiguation: false };
  return results;
}

const BATCH_SIZE = 50;
const results = { ...cache };
let unreachable = null;

for (let i = 0; i < toQuery.length && !unreachable; i += BATCH_SIZE) {
  const batch = toQuery.slice(i, i + BATCH_SIZE);
  try {
    const batchResults = await queryExistence(batch);
    for (const [title, r] of Object.entries(batchResults)) {
      results[title] = { ...r, checkedAt: new Date().toISOString() };
    }
  } catch (err) {
    unreachable = err;
  }
}

writeFileSync(cachePath, JSON.stringify(results, null, 2) + "\n");

if (unreachable) {
  console.log(`\n${unreachable.friendly ? unreachable.message : `Something went wrong: ${unreachable.message}`}`);
  console.log("(Anything already checked before this was still saved.)");
  process.exit(1);
}

// ---- report ----
// wiki-link first (a curated title not resolving is almost always a
// real typo, worth seeing before anything else), then alphabetically
// by title within each group.
const byKindThenTitle = (a, b) => (a.kind === b.kind ? a.title.localeCompare(b.title) : a.kind === "wiki-link" ? -1 : 1);

const missing = checks.filter(c => results[c.title]?.exists === false).sort(byKindThenTitle);
const disambiguated = checks.filter(c => results[c.title]?.exists && results[c.title]?.disambiguation).sort(byKindThenTitle);

function snippetFor(m, suggestion) {
  const link = `wiki:${suggestion || "PUT THE RIGHT WIKIPEDIA PAGE TITLE HERE"}`;
  return m.location === "bridge"
    ? `info: { text: "...", ${m.field || "link"}: "${link}" }`
    : `termInfo: { "${m.term}": { text: "...", ${m.field || "link"}: "${link}" } }`;
}

function where(m) {
  return `"${m.term}" in "${m.puzzleTitle}"${m.location === "bridge" ? "" : ` (${m.location})`}`;
}

function describeMissing(m) {
  const lines = [`  ${where(m)}`];
  if (m.kind === "wiki-link") {
    lines.push(`    The link you added ("wiki:${m.title}") doesn't seem to go anywhere on Wikipedia — likely a typo in the title.`);
    lines.push(`    Search Wikipedia for the right title, then fix it in puzzles.js:`);
  } else {
    lines.push(`    No exact Wikipedia page titled "${m.title}" — it's currently using an automatic search instead, which still works, just won't jump straight to a page.`);
    lines.push(`    If you find the right Wikipedia page title, you can point straight to it by adding this in puzzles.js:`);
  }
  lines.push(`      ${snippetFor(m)}`);
  return lines.join("\n");
}

function describeDisambiguation(m) {
  const lines = [`  ${where(m)}`];
  if (m.kind === "wiki-link") {
    lines.push(`    The link you added ("wiki:${m.title}") goes to a Wikipedia disambiguation page — a list of unrelated things with that name, not an article about this term.`);
    lines.push(`    Find the specific article title on Wikipedia and use that instead:`);
  } else {
    lines.push(`    The automatic search for "${m.title}" lands on a Wikipedia disambiguation page instead of a specific article — the same "wrong page" case a curated link is meant to fix.`);
    lines.push(`    Find the specific article title on Wikipedia and point straight to it:`);
  }
  lines.push(`      ${snippetFor(m)}`);
  return lines.join("\n");
}

if (missing.length === 0 && disambiguated.length === 0) {
  console.log("\nEverything checks out — every referenced title resolves to a real Wikipedia article.");
} else {
  const wikiLinkIssues = missing.filter(m => m.kind === "wiki-link");
  const autoSearchIssues = missing.filter(m => m.kind === "auto-search");

  if (wikiLinkIssues.length) {
    console.log(
      `\n${wikiLinkIssues.length} link${wikiLinkIssues.length === 1 ? "" : "s"} that probably need${wikiLinkIssues.length === 1 ? "s" : ""} fixing:\n`
    );
    wikiLinkIssues.forEach(m => console.log(describeMissing(m) + "\n"));
  }
  if (autoSearchIssues.length) {
    console.log(
      `${autoSearchIssues.length} term${autoSearchIssues.length === 1 ? "" : "s"} with no exact Wikipedia page ` +
      "(informational only — nothing is broken, the player's Search link still works fine):\n"
    );
    autoSearchIssues.forEach(m => console.log(describeMissing(m) + "\n"));
  }
  if (disambiguated.length) {
    console.log(
      `${disambiguated.length} link${disambiguated.length === 1 ? "" : "s"} that land${disambiguated.length === 1 ? "s" : ""} on a Wikipedia disambiguation page instead of a real article:\n`
    );
    disambiguated.forEach(m => console.log(describeDisambiguation(m) + "\n"));
  }
}

process.exit(0);
