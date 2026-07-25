import { PUZZLES } from "./puzzles/index.js";
import { CATEGORIES, categorySlugFor } from "./puzzles/categories.js";
import { SHOWCASE_PUZZLE_IDS } from "./puzzles/showcase.js";

let ok = true;
const fail = (id, msg) => { console.log(`${id}: ${msg}`); ok = false; };

// A link/extraLink value must be either the "wiki:Title" shorthand or a
// full http(s) URL — anything else is almost certainly a missing
// "wiki:" prefix (the shorthand silently rendering as a broken
// relative link) rather than an intentional value.
function checkLink(id, label, value) {
  if (!value) return;
  if (value.startsWith("wiki:") || /^https?:\/\//.test(value)) return;
  fail(id, `${label}: "${value}" is neither "wiki:Title" nor a full http(s) URL (missing the "wiki:" prefix?)`);
}

function checkInfo(id, label, raw) {
  if (!raw || typeof raw === "string") return;
  checkLink(id, `${label}.link`, raw.link);
  checkLink(id, `${label}.extraLink`, raw.extraLink);
}

function connectedComponents(p) {
  const n = p.clusters.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  for (const b of p.bridges) union(b.clusters[0], b.clusters[1]);
  const groups = {};
  for (let i = 0; i < n; i++) (groups[find(i)] ??= []).push(p.clusters[i].name);
  return Object.values(groups);
}

const allPuzzleIds = new Set(PUZZLES.map(p => p.id));

for (const p of PUZZLES) {
  if (!p.category) fail(p.id, "missing category");
  // Cluster count on its own used to be hard-capped at 4, but two
  // independent ceilings (this one, and the per-cluster term count
  // below) can't tell a puzzle with 4 dense 6-term clusters from one
  // with 4 light 3-term clusters -- same cluster count, very different
  // actual size. What actually matters for rendering is the combined
  // total below; this is now just a sanity floor/ceiling against typos
  // (a 1-cluster "puzzle" or a 10-cluster one is almost certainly a
  // mistake, not a real design), not a real design constraint.
  if (p.clusters.length < 2 || p.clusters.length > 6) fail(p.id, `bad cluster count (${p.clusters.length})`);
  // The real size constraint: total nodes (every cluster's terms, plus
  // every bridge) that actually have to render on one board at once.
  // Calibrated against every existing puzzle's own actual totals at the
  // time this was added -- normal puzzles topped out at 14, `large`
  // ones were all exactly 19 (4 clusters x 4 terms + 3 bridges, the one
  // shape every large puzzle happened to use) -- so both ceilings carry
  // real headroom above anything already authored, not just barely
  // covering the status quo. `large` already controls board size
  // (game.js's applyBoardSize), so reusing it here instead of adding a
  // separate flag keeps "how big a board this puzzle gets" and "how
  // much this puzzle is allowed to contain" the same decision, made once.
  const totalNodes = p.clusters.reduce((sum, c) => sum + c.terms.length, 0) + p.bridges.length;
  const nodeCap = p.large ? 24 : 16;
  if (totalNodes > nodeCap) {
    fail(p.id, `too many total nodes (${totalNodes}, cap is ${nodeCap}${p.large ? "" : " -- consider `large: true` for more room, or splitting into relatedPuzzles"})`);
  }
  checkInfo(p.id, "info", p.info);

  // relatedPuzzles is { info, entries } -- info describes the set as a
  // whole (optional, shown as this puzzle's own "Related puzzles"
  // subtitle and reused as a &puzzles= overview's subtitle when this
  // puzzle is the shared set's anchor -- see showOverview in game.js),
  // entries is the actual edge list, shown directly to the player, so a
  // bad id or a missing reason there isn't just a data-modeling slip --
  // it's either a dead link or a bare, unexplained one. `via` is NOT
  // checked against bridge `conceptId`s below: as authored today it's a
  // loose, human-written list of shared themes, only sometimes matching
  // an actual conceptId (see the `provenance` bridges) -- enforcing a
  // strict match would fail most of the current entries, not catch a bug.
  if (p.relatedPuzzles) {
    checkInfo(p.id, "relatedPuzzles.info", p.relatedPuzzles.info);
    const seenIds = new Set();
    (p.relatedPuzzles.entries || []).forEach((r, i) => {
      const label = `relatedPuzzles.entries[${i}]`;
      if (!r.id) { fail(p.id, `${label}: missing id`); return; }
      if (r.id === p.id) fail(p.id, `${label}: lists itself ("${r.id}")`);
      if (seenIds.has(r.id)) fail(p.id, `relatedPuzzles: "${r.id}" listed more than once`);
      seenIds.add(r.id);
      if (!allPuzzleIds.has(r.id)) fail(p.id, `${label}: "${r.id}" is not a real puzzle id`);
      if (!r.reason || !r.reason.trim()) fail(p.id, `${label} ("${r.id}"): missing reason`);
      if (r.via !== undefined && (!Array.isArray(r.via) || r.via.length === 0)) {
        fail(p.id, `${label} ("${r.id}"): via must be a non-empty array when present`);
      }
    });
  }

  const allTerms = new Set();
  p.clusters.forEach((c, ci) => {
    // Upper bound raised from 5 to 6 -- not a rendering ceiling (nothing
    // in any renderer actually breaks above 5; a bigger cluster just
    // draws taller/bigger, gracefully) but a pedagogical one, so this
    // stays a real, if reconsiderable, judgment call rather than
    // something to remove outright. 6 is close to the edge of "one
    // coherent group held in mind at once" without being unreasonable
    // (still within Miller's classic 7±2), and real term-width sampling
    // showed multi-column circle packing only starts earning its keep
    // (vs. actively hurting, as it does at 3-5) somewhere in this range
    // -- so this is a deliberate, incremental step to see how a puzzle
    // actually plays at the new ceiling before considering another one,
    // not a jump straight to some larger number "just because nothing
    // technically breaks."
    if (c.terms.length < 3 || c.terms.length > 6) fail(p.id, `${c.name}: bad terms count (${c.terms.length})`);
    if (c.seeds.length !== 2) fail(p.id, `${c.name}: bad seeds count (${c.seeds.length})`);
    for (const s of c.seeds) {
      if (!c.terms.includes(s)) fail(p.id, `${c.name}: seed "${s}" not in terms`);
    }
    for (const t of c.terms) {
      if (allTerms.has(t)) fail(p.id, `duplicate term across clusters: "${t}"`);
      allTerms.add(t);
    }
    if (c.termInfo) {
      for (const [term, info] of Object.entries(c.termInfo)) {
        if (!c.terms.includes(term)) fail(p.id, `${c.name}: termInfo key "${term}" is not one of its terms`);
        checkInfo(p.id, `${c.name}.termInfo.${term}`, info);
      }
    }
    checkInfo(p.id, `${c.name}.info`, c.info);
  });

  for (const b of p.bridges) {
    if (allTerms.has(b.term)) fail(p.id, `bridge term duplicates a cluster term: "${b.term}"`);
    checkInfo(p.id, `${b.term}.info`, b.info);
    if (b.conceptId !== undefined && (typeof b.conceptId !== "string" || !b.conceptId.trim())) {
      fail(p.id, `${b.term}: conceptId must be a non-empty string`);
    }
    const [i, j] = b.clusters;
    if (i === j || i < 0 || j < 0 || i >= p.clusters.length || j >= p.clusters.length) {
      fail(p.id, `bad bridge cluster indices: ${JSON.stringify(b.clusters)}`);
    }
    if (b.idealTerms) {
      if (b.idealTerms.length !== 2) fail(p.id, `${b.term}: idealTerms must have exactly 2 entries`);
      b.idealTerms.forEach((term, k) => {
        if (term === null) return;
        const cluster = p.clusters[b.clusters[k]];
        if (!cluster || !cluster.terms.includes(term)) {
          fail(p.id, `${b.term}: idealTerms[${k}] "${term}" is not a term of cluster ${b.clusters[k]}`);
        }
      });
    }
  }

  // The design brief wants bridges to pull the finished graph into one
  // integrated whole, not separate islands — so all clusters should end
  // up in a single connected component once every bridge is counted.
  const comps = connectedComponents(p);
  if (comps.length > 1) {
    fail(p.id, `disconnected clusters (add a bridge to link them): ${JSON.stringify(comps)}`);
  }
}

// puzzles/categories.js is purely additive metadata (see its own file
// comment) -- a category doesn't need an entry here to be valid, so the
// only things worth catching are a bad info shape, and a registered
// name that doesn't match any puzzle's actual `category` string (almost
// always a typo on one side or the other, since there's no other way
// for that to happen).
const usedCategories = new Set(PUZZLES.map(p => p.category));
for (const [name, entry] of Object.entries(CATEGORIES)) {
  checkInfo(`categories.js:"${name}"`, "info", entry.info);
  if (!usedCategories.has(name)) {
    fail(`categories.js:"${name}"`, "registered but no puzzle uses this exact category string (typo?)");
  }
}

// Every category actually in use gets a ?category= slug, explicit
// (CATEGORIES[name].slug) or auto-derived (categorySlugFor falls back
// to slugify(name) -- see puzzles/categories.js). Two different
// category names resolving to the same slug would make that slug
// ambiguous -- resolveCategoryParam in game.js would silently pick
// whichever comes first, quietly misrouting the other's share links --
// so this catches any collision at authoring time instead.
const slugOwners = new Map();
for (const name of usedCategories) {
  const slug = categorySlugFor(name);
  const owner = slugOwners.get(slug);
  if (owner) {
    fail(`categories.js`, `"${name}" and "${owner}" both resolve to the same ?category= slug ("${slug}")`);
  } else {
    slugOwners.set(slug, name);
  }
}

// puzzles/showcase.js's SHOWCASE_PUZZLE_IDS isn't validated against the
// live registry at runtime (see its own file comment -- a stale id
// there just silently has no effect), but a typo'd or renamed id here
// is still worth catching at authoring time rather than leaving it
// quietly inert.
for (const id of SHOWCASE_PUZZLE_IDS) {
  if (!allPuzzleIds.has(id)) fail(`showcase.js`, `"${id}" is not a real puzzle id`);
}

console.log(ok ? `ALL CHECKS PASSED (${PUZZLES.length} puzzles)` : "CHECKS FAILED");
process.exit(ok ? 0 : 1);
