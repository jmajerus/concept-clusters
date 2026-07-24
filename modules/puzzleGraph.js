// Builds the node/link graph a puzzle starts from -- pure function of
// puzzle data (from puzzles.js), no game-state, D3, or DOM dependency.
// Rendering (game.js's buildGraph/buildSetGraph) and gameplay
// (handleTap) both operate on the { nodes, links } this returns, but
// neither is this module's concern.
import { normalizeInfo } from "./termInfo.js";

export const pillWidth = word => word.length * 7.5 + 26;

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
