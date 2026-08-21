// Builds the node/link graph a puzzle starts from -- pure function of
// puzzle data (from puzzles/), no game-state, D3, or DOM dependency.
// Rendering (game.js's buildGraph/buildSetGraph) and gameplay
// (handleTap) both operate on the { nodes, links } this returns, but
// neither is this module's concern.
import { normalizeInfo } from "./termInfo.js";

// A pill/rect's width is text width plus padding -- both terms matter.
// The per-character coefficient (measured against Karla 700 12.5px, the
// actual `.node text` style, across every real term and bridge in the
// catalog -- see the regression this is calibrated from) approximates
// that font's real average glyph width; using something looser like the
// font's em-size would systematically overestimate, and since the error
// is per-character, it compounds with word length -- short words barely
// noticed it, but a long term ballooned into tens of extra px of dead
// space on each side, the exact "margin that grows like a percentage"
// this was reported against. `+ 28` is the one deliberately fixed part:
// side padding that stays the same regardless of word length, verified
// against the same catalog to never undercut a real word's measured
// width (worst case leaves ~6px a side, not negative).
export const pillWidth = word => word.length * 6.3 + 28;

// A bridge node's <polygon> outline once it's revealing itself as a
// bridge (partial or done -- see the "bridge" class each renderer only
// adds in those states, never free/untouched, so a bridge's shape
// doesn't give away that it's a bridge before the player has started
// connecting it). A flat-topped hexagon, pointed left/right ends only
// -- same overall w/h as the plain pill (pillWidth/PILL_H) so it slots
// into the exact same layout math (collision radius, Circle mode's
// row-packing, etc.) without any of that needing to know shapes differ.
// The point's reach is a fixed px amount, not proportional to width, so
// it reads the same size on a 2-letter bridge as a 20-letter one;
// clamped to at most half the width so a very narrow pill can't produce
// a self-intersecting hexagon (never triggers in practice -- pillWidth's
// own minimum is well above this -- but costs nothing to guard).
const BRIDGE_POINT = 10;
export function bridgePoints(w, h = 30) {
  const hw = w / 2, hh = h / 2, p = Math.min(BRIDGE_POINT, hw);
  return [
    [-hw + p, -hh], [hw - p, -hh], [hw, 0],
    [hw - p, hh], [-hw + p, hh], [-hw, 0]
  ].map(pt => pt.join(",")).join(" ");
}

// A completed bridge's optional relationKind (see AUTHORING.md and
// docs/Bridge Role Annotation.md for the full taxonomy history) resolves
// to one of these, never authored per-bridge -- keeping the wording
// centralized here is what lets it change in one place if the taxonomy
// itself ever does, and what keeps every bridge of the same kind reading
// identically instead of drifting into slightly different phrasings.
// Deliberately just label + description for now, no icon -- text only
// until the classification itself has proven stable in practice; a
// visual glyph is a later, separate step, not assumed here.
export const RELATION_KINDS = {
  dynamic: {
    label: "Dynamic connection",
    description: "One or more participating clusters affect, move into, regulate, or change another."
  },
  foundation: {
    label: "Shared foundation",
    description: "The participating clusters depend on, or are partly built from, the same thing."
  },
  "cross-cutting": {
    label: "Cross-cutting concept",
    description: "The same idea shows up meaningfully across the participating clusters."
  },
  contrast: {
    label: "Contrast",
    description: "The participating clusters understand or treat this concept differently."
  },
  continuity: {
    label: "Continuity",
    description: "An idea or practice is carried forward, adapted, or echoed across the participating clusters."
  },
  evaluation: {
    label: "Evaluation",
    description: "Connects evidence or claims with ways of testing or interpreting them."
  }
};

// Star mode's optional pretty-print re-layout (see starRenderer.js:
// state.prettyPrint) starts here: a cyclic order of cluster indices,
// one full lap around the ring, chosen to minimize crossings among bridge
// "chords" at the cluster level. The biggest, ugliest crossings Show
// Solution produces are whole clusters landing on the wrong side of
// the ring from what their bridges want, not fine local placement
// within one cluster's own arc -- so reordering clusters alone
// captures most of the value, cheaply. Pure and puzzle-data-only on
// purpose, so it's usable (and testable) without any D3/DOM
// dependency.
//
// A richer version of this once tried to jointly search cluster order
// AND per-term facing choices against an analytically-estimated
// crossing count, aiming for genuine optimality after a manually-
// arranged board proved zero crossings was achievable where this
// simpler version wasn't finding it. It regressed a real case instead:
// the estimate approximates an unpinned bridge's position as the
// centroid of its connected titles, which is a fine stand-in in
// isolation but doesn't capture that bridge getting shoved off that
// centroid by collision with newly-repositioned *pinned* ideal-target
// terms nearby -- an effect only the live simulation actually produces.
// Reverted rather than shipped half-validated; closing that gap for
// real means evaluating actual settled positions per candidate, not a
// closed-form proxy for them, which is a bigger, separate piece of
// work.
//
// The search space stays tiny at real puzzle sizes: fixing cluster 0
// at ring position 0 removes rotational duplicates, leaving (n-1)!
// candidates to brute-force rather than needing a heuristic -- at
// most 120 for the largest puzzle allowed today (validate.mjs caps
// cluster count at 6). CLUSTER_ORDER_SEARCH_CAP guards against this
// ever being handed a puzzle so large the factorial search would matter.
const CLUSTER_ORDER_SEARCH_CAP = 7;
export function computeClusterOrder(puzzle) {
  const n = puzzle.clusters.length;
  const identity = Array.from({ length: n }, (_, i) => i);
  if (n > CLUSTER_ORDER_SEARCH_CAP) return identity;

  // Every bridge contributes one "chord" per pair of clusters it
  // touches -- a binary bridge is one pair, a ternary bridge (see the
  // n-ary bridge pilot) is three, its three sides taken two at a time.
  const pairs = [];
  puzzle.bridges.forEach(b => {
    const cs = b.clusters;
    for (let i = 0; i < cs.length; i++) {
      for (let j = i + 1; j < cs.length; j++) pairs.push([cs[i], cs[j]]);
    }
  });
  // Fewer than 3 clusters can't have a crossing at all; with exactly 3,
  // every cyclic order is the same triangle. Fewer than two chords
  // can't cross each other either way. Nothing to search in either case.
  if (n < 4 || pairs.length < 2) return identity;

  const crossingCount = order => {
    const pos = new Array(n);
    order.forEach((ci, i) => { pos[ci] = i; });
    let count = 0;
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        const [a, b] = pairs[i], [c, d] = pairs[j];
        // Chords sharing an endpoint cluster meet there, not "cross" in
        // the sense that produces a visually tangled line.
        if (a === c || a === d || b === c || b === d) continue;
        const span = (pos[b] - pos[a] + n) % n;
        const inArc = x => { const r = (pos[x] - pos[a] + n) % n; return r > 0 && r < span; };
        if (inArc(c) !== inArc(d)) count++;
      }
    }
    return count;
  };

  let best = identity, bestScore = Infinity;
  const rest = identity.slice(1);
  const permute = (arr, k) => {
    if (k === arr.length) {
      const order = [0, ...arr];
      const score = crossingCount(order);
      if (score < bestScore) { bestScore = score; best = order; }
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute(rest, 0);
  return best;
}

// Node ids are assigned in this exact order -- all of one cluster's
// terms, then the next cluster's, then every bridge -- and that
// ordering is load-bearing elsewhere: it's what &moves=<encoded> share
// links (see modules/shareLink.js) encode a connection's source/target
// as, so changing this order would break existing shared links.
export function buildNodesAndLinks(puzzle) {
  const nodes = [];
  puzzle.clusters.forEach((c, ci) => {
    // A cluster's topic page stays on the cluster. Copying it onto every
    // term made three local definitions look like three destinations.
    // Help at the grain of this node. Missing-link search is not synthesized.
    c.terms.forEach(term => {
      const info = normalizeInfo(c.termInfo && c.termInfo[term]);
      const seeAlso = info?.seeAlso || [];
      const ownLink = info?.link || null;
      nodes.push({
        id: nodes.length, word: term, gs: [ci],
        connected: c.seeds.includes(term) ? [ci] : [],
        w: pillWidth(term),
        info: {
          text: info?.text || null,
          link: ownLink,
          linkLabel: ownLink ? (info?.linkLabel || null) : null,
          extraLink: seeAlso[0]?.href || null,
          seeAlso,
          citations: info?.citations || []
        }
      });
    });
  });
  puzzle.bridges.forEach(b => {
    nodes.push({
      id: nodes.length, word: b.term, gs: b.clusters.slice(),
      connected: [], w: pillWidth(b.term), fact: b.fact, idealTerms: b.idealTerms,
      termRole: b.termRole ?? "reference",
      relationKind: b.relationKind, direction: b.direction,
      info: normalizeInfo(b.info)
    });
  });

  // Seed links (the visible partial clusters)
  const links = [];
  puzzle.clusters.forEach((c, ci) => {
    const seeds = nodes.filter(n => n.gs.length === 1 && n.gs[0] === ci && n.connected.length);
    // One entry per seed, not one shared entry for the pair -- Graph mode
    // draws one line per `links` entry, from its `source` to its
    // cluster's title (see graphRenderer.js), so both seeds need their
    // own entry to both get a visible spoke rather than only one of them.
    if (seeds.length === 2) {
      links.push({ source: seeds[0], target: seeds[1], bridge: false });
      links.push({ source: seeds[1], target: seeds[0], bridge: false });
    }
  });

  const need = nodes.reduce((sum, n) => sum + (n.gs.length - n.connected.length), 0);
  return { nodes, links, need };
}
