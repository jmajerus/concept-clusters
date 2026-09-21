// Author-facing check — NOT part of `npm test` or `validate.mjs`. Both
// of those stay fast and offline-safe on purpose; this one hits the
// network (Wikipedia's API), so it's a manual, occasional run instead
// of a commit gate.
//
// For every authored "wiki:Title" primary, legacy extra, or see-also
// link, this verifies against Wikipedia's API that an article actually
// exists at that exact title (following redirects). Board terms,
// clusters, and bridges no longer synthesize a missing-link Wikipedia
// search chip; those surfaces are collected only when they author a
// wiki: link. Overview surfaces (puzzle, category, catalogue) may still
// fall back to a title search, and those remaining auto-search titles
// are checked too. The tool catches both a typo in a hand-written wiki:
// shorthand (almost always a real mistake worth fixing) and an overview
// title that isn't a real article (informational).
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
// what to paste into that puzzle's own file under puzzles/ for anything
// that needs fixing, and human error messages if Wikipedia can't be
// reached. An author shouldn't need to read this file to understand
// what it's telling them.
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
// Resolutions are remembered in D1's wiki_link_checks table (see
// modules/wikiLinkCheckStore.js) — the same rows the authoring worker's
// weekly cron, the draft page, and check_puzzle_links use — so re-running
// this doesn't re-query titles checked in the last week, and a 429 midway
// loses nothing already written. Without D1 configured (.env, see
// modules/localD1Config.js) it still runs, asking Wikipedia for everything.
// Wikipedia's API accepts up to 50 titles per request, so even a full
// fresh run is a handful of requests, not one per term.
//
// Usage:
//   node tools/check-wiki-links.mjs           # check, trusting recent D1 rows
//   node tools/check-wiki-links.mjs --force   # re-check every title

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PUZZLES } from "../puzzles/index.js";
import { CATEGORIES } from "../puzzles/categories.js";
import { CATALOGUES } from "../catalogues/index.js";
import { authoredLinks, parseWikiShorthand } from "../modules/termInfo.js";
import { resolveWikipediaTitles } from "../modules/wikipediaTitles.js";
import { createD1WikiLinkCheckStore } from "../modules/wikiLinkCheckStore.js";
import { createHttpD1Database } from "../modules/httpD1Database.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { resolveLocalD1Config, LocalD1ConfigError } from "../modules/localD1Config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const force = process.argv.includes("--force");
const STORE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

loadProjectEnv();
let store = null;
try {
  store = createD1WikiLinkCheckStore(createHttpD1Database(
    await resolveLocalD1Config({ repositoryRoot: root })
  ));
} catch (err) {
  if (!(err instanceof LocalD1ConfigError)) throw err;
  console.log("D1 is not configured; checking every title live and remembering nothing.");
}

// ---- collect every title actually referenced, with enough context to
// explain each one in plain language later ----
const checks = []; // { title, kind, puzzleTitle, location, term, field }

function collectWikiLink(raw, field, word, puzzleTitle, location) {
  const parsed = parseWikiShorthand(raw);
  if (!parsed) return;
  // The API checks that the article exists. A `#Section` fragment is a
  // page hash, not a second title -- "Irony#Dramatic irony" is Irony.
  checks.push({
    title: parsed.title,
    kind: "wiki-link",
    puzzleTitle,
    location,
    term: word,
    field
  });
}

// `skipAutoSearch` -- true when this word will not render a raw automatic
// search. Term, cluster, and bridge nodes no longer synthesize a Wikipedia
// search chip for a missing `link` (that fallback is deprecated). Checking
// the bare word as a hypothetical auto-search would report a result the
// player can never see. Explicit wiki: links are still collected below
// regardless. Overview surfaces (puzzle, category, catalogue) may still
// use a title search when they have no authored link.
function collect(word, info, puzzleTitle, location, skipAutoSearch) {
  const links = info && typeof info === "object" && !Array.isArray(info)
    ? authoredLinks(info)
    : [];
  if (!links.length) {
    if (!skipAutoSearch) checks.push({ title: word, kind: "auto-search", puzzleTitle, location, term: word });
    return;
  }

  links.forEach((entry, index) => {
    collectWikiLink(entry.href, `links[${index}]`, word, puzzleTitle, location);
  });
}

// Puzzle-level, category-level, catalogue-level, and relatedPuzzles-set
// `info` are unlike a normal term/cluster/bridge's: when absent,
// renderInfoLine shows nothing at all. Bridge info behaves the same way
// unless explicitly authored. These surfaces are only collected when
// actually present.
for (const p of PUZZLES) {
  if (p.info) collect(p.title, p.info, p.title, "puzzle", false);
  if (p.relatedPuzzles?.info) collect(p.title, p.relatedPuzzles.info, p.title, "relatedPuzzles set", false);
  p.clusters.forEach(c => {
    c.terms.forEach(term => {
      collect(term, c.termInfo && c.termInfo[term], p.title, c.name, true);
    });
    // A cluster's own name, not just its terms -- see the "Cluster info
    // & links" section of AUTHORING.md: a cluster's name is usually a
    // real, citable topic in its own right (often a richer article than
    // any single term inside it), so it goes through the exact same
    // wiki:-link verification as a term or bridge. Missing-link search
    // is no longer synthesized on cluster hover.
    collect(c.name, c.info, p.title, "cluster", true);
  });
  (p.bridges || []).forEach(b => {
    collect(b.term, b.info, p.title, "bridge", true);
  });
}

for (const [name, entry] of Object.entries(CATEGORIES)) {
  if (entry.info) collect(name, entry.info, name, "category", false);
}
for (const catalogue of CATALOGUES) {
  if (catalogue.info) {
    collect(catalogue.title, catalogue.info, catalogue.title, "catalogue", false);
  }
}

const uniqueTitles = [...new Set(checks.map(c => c.title))];

// ---- trust recent D1 rows, figure out what actually needs a round-trip ----
const now = Date.now();
const remembered = store && !force
  ? await store.readFresh(uniqueTitles, { maxAgeMs: STORE_MAX_AGE_MS, now })
  : new Map();
const toQuery = uniqueTitles.filter(t => !remembered.has(t));

console.log(
  `Checking ${uniqueTitles.length} title(s) referenced in puzzles/ against Wikipedia` +
  (toQuery.length ? ` — ${toQuery.length} of them for the first time.` : ", all previously checked (nothing new).")
);

// Resolution itself lives in modules/wikipediaTitles.js (shared with the
// weekly Worker cron and the MCP / draft-page check, so there is one
// definition of "does this title resolve"). This wrapper keeps the
// author-facing error messages: the shared resolver throws plain errors.
async function friendlyFetch(url, init) {
  let res;
  try {
    res = await fetch(url, init);
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
  return res;
}

async function queryExistence(titles) {
  const resolved = await resolveWikipediaTitles(titles, { fetch: friendlyFetch });
  const results = {};
  for (const title of titles) {
    const r = resolved.get(title) || { exists: false, disambiguation: false, resolvedTitle: null };
    results[title] = {
      exists: r.exists,
      disambiguation: r.disambiguation,
      // The exact title after normalization/redirects — what an explicit
      // `link:` override should actually name. The shared resolver reports
      // it only when it differs; the cache file keeps the older "always
      // present when the page exists" shape.
      resolvedTitle: r.exists ? (r.resolvedTitle ?? title) : null
    };
  }
  return results;
}

const BATCH_SIZE = 50;
const results = {};
for (const [title, r] of remembered) results[title] = r;
let unreachable = null;

for (let i = 0; i < toQuery.length && !unreachable; i += BATCH_SIZE) {
  const batch = toQuery.slice(i, i + BATCH_SIZE);
  try {
    const batchResults = await queryExistence(batch);
    const written = new Map();
    for (const [title, r] of Object.entries(batchResults)) {
      results[title] = r;
      written.set(title, {
        exists: r.exists,
        disambiguation: r.disambiguation,
        resolvedTitle: r.resolvedTitle && r.resolvedTitle !== title ? r.resolvedTitle : null
      });
    }
    // Written per batch, so a 429 on batch four keeps batches one to three.
    if (store) await store.write(written, { now });
  } catch (err) {
    unreachable = err;
  }
}

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

function infoSnippet(m, link) {
  if (m.field?.startsWith("links[")) {
    return `links: ["${link}"]`;
  }
  return `${m.field || "links"}: ["${link}"]`;
}

function snippetFor(m, suggestion) {
  const link = `wiki:${suggestion || "PUT THE RIGHT WIKIPEDIA PAGE TITLE HERE"}`;
  const field = infoSnippet(m, link);
  if (m.location === "bridge") return `info: { text: "...", ${field} }`;
  // No `text:` placeholder for cluster/puzzle/relatedPuzzles-set/category
  // -- each already has (or, for a puzzle, plausibly doesn't need) its
  // own separate reveal mechanism, so a link-only `info` is the normal
  // shape here, not a shortcut (see AUTHORING.md's "Link-only overrides").
  if (["cluster", "puzzle", "category", "catalogue"].includes(m.location)) {
    return `info: { ${field} }`;
  }
  if (m.location === "relatedPuzzles set") return `relatedPuzzles: { info: { ${field} }, entries: [...] }`;
  return `termInfo: { "${m.term}": { text: "...", ${field} } }`;
}

function where(m) {
  if (m.location === "bridge") return `"${m.term}" in "${m.puzzleTitle}"`;
  if (m.location === "cluster") return `the "${m.term}" cluster in "${m.puzzleTitle}"`;
  if (m.location === "puzzle") return `the puzzle "${m.puzzleTitle}" itself`;
  if (m.location === "relatedPuzzles set") return `the relatedPuzzles set on "${m.puzzleTitle}"`;
  if (m.location === "category") return `the "${m.term}" category (puzzles/categories.js)`;
  if (m.location === "catalogue") return `the "${m.term}" catalogue`;
  return `"${m.term}" in "${m.puzzleTitle}" (${m.location})`;
}

function describeMissing(m) {
  const lines = [`  ${where(m)}`];
  if (m.kind === "wiki-link") {
    lines.push(`    The link you added ("wiki:${m.title}") doesn't seem to go anywhere on Wikipedia — likely a typo in the title.`);
    lines.push(`    Search Wikipedia for the right title, then fix it in that puzzle's file under puzzles/:`);
  } else {
    lines.push(`    No exact Wikipedia page titled "${m.title}" — it's currently using an automatic search instead, which still works, just won't jump straight to a page.`);
    lines.push(`    If you find the right Wikipedia page title, you can point straight to it by adding this in that puzzle's file under puzzles/:`);
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
