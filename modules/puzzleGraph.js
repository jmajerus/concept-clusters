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

// Node ids are assigned in this exact order -- all of one cluster's
// terms, then the next cluster's, then every bridge -- and that
// ordering is load-bearing elsewhere: it's what &moves=<encoded> share
// links (see modules/shareLink.js) encode a connection's source/target
// as, so changing this order would break existing shared links.
export function buildNodesAndLinks(puzzle) {
  const nodes = [];
  puzzle.clusters.forEach((c, ci) => {
    // A term with no curated `link` of its own falls back to its
    // cluster's -- the same "zoom out to the containing topic" pattern
    // AUTHORING.md already documents doing by hand for a term with no
    // good standalone article (`wiki:Solid` for "fixed shape", etc.),
    // just applied automatically wherever a term hasn't been
    // individually curated yet, now that every cluster has a verified
    // link of its own. Only `link` inherits, not `extraLink` (a curated
    // bonus resource specific to whichever term it was actually written
    // for) or `text` (a cluster's own blurb, if it ever has one, describes
    // the whole cluster, not this specific term). Bridges don't get this
    // -- see their own construction below -- since a bridge belongs to
    // two clusters, and picking one as "the" fallback would be arbitrary.
    const clusterInfo = normalizeInfo(c.info);
    c.terms.forEach(term => {
      const info = normalizeInfo(c.termInfo && c.termInfo[term]);
      nodes.push({
        id: nodes.length, word: term, gs: [ci],
        connected: c.seeds.includes(term) ? [ci] : [],
        w: pillWidth(term),
        info: {
          text: (info && info.text) || null,
          link: (info && info.link) || (clusterInfo && clusterInfo.link) || null,
          extraLink: (info && info.extraLink) || null
        }
      });
    });
  });
  puzzle.bridges.forEach(b => {
    nodes.push({
      id: nodes.length, word: b.term, gs: b.clusters.slice(),
      connected: [], w: pillWidth(b.term), fact: b.fact, idealTerms: b.idealTerms,
      relationKind: b.relationKind,
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
