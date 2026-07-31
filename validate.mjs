import { PUZZLES } from "./puzzles/index.js";
import { CATEGORIES, categorySlugFor, slugify } from "./puzzles/categories.js";
import { CATALOGUES } from "./catalogues/index.js";
import { SHOWCASE_PUZZLE_IDS } from "./puzzles/showcase.js";
import { STAR_LAYOUTS } from "./puzzles/layouts/star/index.js";
import { validateStarLayoutDocument } from "./modules/starLayoutSchema.js";

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

function checkCatalogueInfo(id, raw) {
  if (raw === undefined) return;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    fail(id, "info must use the { text, link, extraLink } shape");
    return;
  }
  if (raw.text !== undefined &&
      (typeof raw.text !== "string" || !raw.text.trim())) {
    fail(id, "info.text must be a non-empty string when present");
  }
  for (const key of ["link", "extraLink"]) {
    if (raw[key] !== undefined &&
        (typeof raw[key] !== "string" || !raw[key].trim())) {
      fail(id, `info.${key} must be a non-empty string when present`);
    } else {
      checkLink(id, `info.${key}`, raw[key]);
    }
  }
}

// Optional. Went through three revisions before a full-catalog pilot
// pass (see docs/Bridge Role Annotation.md) held up: the original
// three-role version covered physiology/hard-science bridges well but
// had no home at all for two recurring humanities shapes (a concept two
// schools of thought take opposing stances on, and a practice one era
// hands down to the next); a five-kind revision added those but left
// "shared" doing two different jobs (a genuine foundational dependency
// vs. a concept that just independently recurs in both clusters without
// causing or depending on anything). This is the version that resolved
// both problems at once: ~92% of the real catalog classified with no
// real hesitation, remaining ambiguity scattered across domains rather
// than concentrated in any one of them. Classifies the *connection the
// bridge's fact describes*, never the term itself in isolation -- e.g.
// "oxygen" isn't inherently "dynamic", but the fact describing it moving
// from one cluster into the other is. A bridge that doesn't clearly fit
// one of these six just leaves the field unset -- that's not a weaker
// bridge, just one this metadata layer doesn't have a confident read on
// yet, same discipline as leaving conceptId or idealTerms unset.
const VALID_RELATION_KINDS = new Set([
  "dynamic", "foundation", "cross-cutting", "contrast", "continuity", "evaluation"
]);
const VALID_BRIDGE_DIRECTIONS = new Set([
  "undirected", "through", "bidirectional", "outward", "inward"
]);
const VALID_CLUSTER_COLORS = new Set([
  "teal", "blue", "amber", "magenta", "olive", "brown"
]);

function connectedComponents(p) {
  const n = p.clusters.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  for (const b of p.bridges) {
    if (!Array.isArray(b.clusters)) continue;
    const valid = b.clusters.filter(ci => Number.isInteger(ci) && ci >= 0 && ci < n);
    if (valid.length < 2) continue;
    const [first, ...rest] = valid;
    rest.forEach(ci => union(first, ci));
  }
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
  const usedClusterColors = new Set();
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
    if (!VALID_CLUSTER_COLORS.has(c.color)) {
      fail(p.id, `${c.name}: unknown cluster color "${c.color}"`);
    } else if (usedClusterColors.has(c.color)) {
      fail(p.id, `${c.name}: cluster color "${c.color}" is already used in this puzzle`);
    }
    usedClusterColors.add(c.color);
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
    if (b.relationKind !== undefined && !VALID_RELATION_KINDS.has(b.relationKind)) {
      fail(p.id, `${b.term}: unknown relationKind "${b.relationKind}"`);
    }
    // Ternary bridges are deliberately a constrained pilot, not permission
    // for arbitrary hyperedge sizes. The runtime code is arity-neutral, but
    // authoring is limited to 2 or 3 until the gameplay has been evaluated.
    const clusterIndices = Array.isArray(b.clusters) ? b.clusters : [];
    if (clusterIndices.length < 2 || clusterIndices.length > 3) {
      fail(p.id, `${b.term}: bridges must name 2 or 3 clusters`);
      continue;
    }
    const seenClusterIndices = new Set();
    clusterIndices.forEach(ci => {
      if (!Number.isInteger(ci) || ci < 0 || ci >= p.clusters.length) {
        fail(p.id, `${b.term}: bad bridge cluster index ${JSON.stringify(ci)}`);
      }
      if (seenClusterIndices.has(ci)) {
        fail(p.id, `${b.term}: duplicate bridge cluster index ${ci}`);
      }
      seenClusterIndices.add(ci);
    });

    if (b.direction !== undefined) {
      if (!b.direction || typeof b.direction !== "object" || Array.isArray(b.direction)) {
        fail(p.id, `${b.term}: direction must be an object with a valid kind`);
      } else if (clusterIndices.length !== 2) {
        fail(p.id, `${b.term}: direction is currently supported only for binary bridges`);
      } else {
        const { kind, from, to } = b.direction;
        if (!VALID_BRIDGE_DIRECTIONS.has(kind)) {
          fail(p.id, `${b.term}: unknown direction kind "${kind}"`);
        } else if (kind === "through") {
          if (!Number.isInteger(from) || !Number.isInteger(to)) {
            fail(p.id, `${b.term}: through direction requires integer from and to cluster indices`);
          } else {
            if (from === to) fail(p.id, `${b.term}: direction.from and direction.to must differ`);
            if (!clusterIndices.includes(from)) {
              fail(p.id, `${b.term}: direction.from ${from} is not one of its bridge clusters`);
            }
            if (!clusterIndices.includes(to)) {
              fail(p.id, `${b.term}: direction.to ${to} is not one of its bridge clusters`);
            }
          }
        } else if (from !== undefined || to !== undefined) {
          fail(p.id, `${b.term}: only through direction may specify from or to`);
        }
      }
    }

    if (b.idealTerms) {
      if (!Array.isArray(b.idealTerms) || b.idealTerms.length !== clusterIndices.length) {
        fail(p.id, `${b.term}: idealTerms must have one entry per bridge cluster`);
        continue;
      }
      b.idealTerms.forEach((term, k) => {
        if (term === null) return;
        const cluster = p.clusters[clusterIndices[k]];
        if (!cluster || !cluster.terms.includes(term)) {
          fail(p.id, `${b.term}: idealTerms[${k}] "${term}" is not a term of cluster ${clusterIndices[k]}`);
        }
      });
    }
  }

  // Concept Lenses are an optional post-solve learning activity over the
  // same nodes. Each lens should reveal a meaningful cross-cluster pattern,
  // not merely restate one authored cluster or highlight the whole board.
  if (p.lenses !== undefined) {
    if (!Array.isArray(p.lenses) || p.lenses.length === 0) {
      fail(p.id, "lenses must be a non-empty array when present");
    } else {
      const lensIds = new Set();
      const bridgeByTerm = new Map(p.bridges.map(bridge => [bridge.term, bridge]));
      p.lenses.forEach((lens, li) => {
        const label = `lenses[${li}]`;
        if (!lens || typeof lens !== "object" || Array.isArray(lens)) {
          fail(p.id, `${label}: must be an object`);
          return;
        }
        if (typeof lens.id !== "string" || !lens.id.trim()) {
          fail(p.id, `${label}: id must be a non-empty string`);
        } else if (lensIds.has(lens.id)) {
          fail(p.id, `${label}: duplicate id "${lens.id}"`);
        } else {
          lensIds.add(lens.id);
        }
        if (typeof lens.prompt !== "string" || !lens.prompt.trim()) {
          fail(p.id, `${label}: prompt must be a non-empty string`);
        }
        if (typeof lens.explanation !== "string" || !lens.explanation.trim()) {
          fail(p.id, `${label}: explanation must be a non-empty string`);
        }
        if (!Array.isArray(lens.targets) ||
            lens.targets.length < 3 ||
            lens.targets.length > 6) {
          fail(p.id, `${label}: targets must contain 3 to 6 terms`);
          return;
        }

        const seenTargets = new Set();
        const touchedClusters = new Set();
        lens.targets.forEach((term, ti) => {
          if (typeof term !== "string" || !term.trim()) {
            fail(p.id, `${label}.targets[${ti}]: must be a non-empty string`);
            return;
          }
          if (seenTargets.has(term)) {
            fail(p.id, `${label}: target "${term}" is listed more than once`);
            return;
          }
          seenTargets.add(term);
          const ordinaryCluster = p.clusters.findIndex(cluster => cluster.terms.includes(term));
          const bridge = bridgeByTerm.get(term);
          if (ordinaryCluster < 0 && !bridge) {
            fail(p.id, `${label}: target "${term}" is not a puzzle term`);
          } else if (ordinaryCluster >= 0 && bridge) {
            fail(p.id, `${label}: target "${term}" is ambiguous`);
          } else if (bridge) {
            bridge.clusters.forEach(ci => touchedClusters.add(ci));
          } else {
            touchedClusters.add(ordinaryCluster);
          }
        });
        if (touchedClusters.size < 2) {
          fail(p.id, `${label}: targets must span at least two clusters`);
        }

        if (lens.reasons !== undefined) {
          if (!lens.reasons ||
              typeof lens.reasons !== "object" ||
              Array.isArray(lens.reasons)) {
            fail(p.id, `${label}: reasons must be an object when present`);
          } else {
            Object.entries(lens.reasons).forEach(([term, reason]) => {
              if (!seenTargets.has(term)) {
                fail(p.id, `${label}.reasons: "${term}" is not one of the targets`);
              }
              if (typeof reason !== "string" || !reason.trim()) {
                fail(p.id, `${label}.reasons.${term}: must be a non-empty string`);
              }
            });
          }
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

// Curated catalogues reference canonical puzzle IDs; they never own
// puzzle copies or completion state. "All Puzzles" is derived at runtime
// and therefore deliberately absent from this authored registry.
const catalogueIds = new Set();
const catalogueSlugs = new Map();
for (const [ci, catalogue] of CATALOGUES.entries()) {
  const label = `catalogues[${ci}]`;
  if (!catalogue || typeof catalogue !== "object" || Array.isArray(catalogue)) {
    fail(label, "must be an object");
    continue;
  }
  if (typeof catalogue.id !== "string" || !catalogue.id.trim()) {
    fail(label, "id must be a non-empty string");
  } else {
    if (catalogue.id === "all") fail(label, `id "all" is reserved for the derived All Puzzles catalogue`);
    if (catalogueIds.has(catalogue.id)) fail(label, `duplicate id "${catalogue.id}"`);
    catalogueIds.add(catalogue.id);
    const normalized = slugify(catalogue.id);
    if (normalized !== catalogue.id) {
      fail(label, `id "${catalogue.id}" must already be a URL-safe slug`);
    }
    const owner = catalogueSlugs.get(normalized);
    if (owner) {
      fail(label, `id collides with "${owner}" after normalization ("${normalized}")`);
    } else {
      catalogueSlugs.set(normalized, catalogue.id);
    }
  }
  if (typeof catalogue.title !== "string" || !catalogue.title.trim()) {
    fail(label, "title must be a non-empty string");
  }
  checkCatalogueInfo(label, catalogue.info);
  if (!Array.isArray(catalogue.entries) || catalogue.entries.length === 0) {
    fail(label, "entries must be a non-empty array");
    continue;
  }
  const entryIds = new Set();
  catalogue.entries.forEach((entry, ei) => {
    const entryLabel = `${label}.entries[${ei}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry) ||
        typeof entry.id !== "string" || !entry.id.trim()) {
      fail(entryLabel, "id must be a non-empty string");
      return;
    }
    if (entryIds.has(entry.id)) {
      fail(entryLabel, `puzzle "${entry.id}" is listed more than once`);
    }
    entryIds.add(entry.id);
    const matches = PUZZLES.filter(puzzle => puzzle.id === entry.id);
    if (matches.length !== 1) {
      fail(entryLabel, `"${entry.id}" resolves to ${matches.length} puzzles instead of exactly one`);
    }
    if (entry.reason !== undefined &&
        (typeof entry.reason !== "string" || !entry.reason.trim())) {
      fail(entryLabel, "reason must be a non-empty string when present");
    }
  });
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

for (const [puzzleId, layout] of Object.entries(STAR_LAYOUTS)) {
  const puzzle = PUZZLES.find(candidate => candidate.id === puzzleId);
  if (!puzzle) {
    fail(`star layout:"${puzzleId}"`, "does not match a real puzzle id");
    continue;
  }
  const result = validateStarLayoutDocument(layout, puzzle);
  result.errors.forEach(error => fail(`star layout:"${puzzleId}"`, error));
}

console.log(ok ? `ALL CHECKS PASSED (${PUZZLES.length} puzzles)` : "CHECKS FAILED");
process.exit(ok ? 0 : 1);
