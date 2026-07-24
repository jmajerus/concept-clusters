// Star mode: a variant of Graph mode's force-directed board where every
// connection is drawn (and physically pulled) toward its cluster's own
// title node instead of toward whichever specific already-placed term
// the player happened to tap to make the connection. That specific
// pairing was never a meaningful relationship in its own right -- every
// term belongs unambiguously to its declared cluster(s) (see README's
// "No trap words" design brief), and which particular existing member
// you tapped to confirm that membership is incidental, not a claim the
// puzzle is making. Graph mode (graphRenderer.js) keeps the original
// sibling-chain rendering instead, for players who prefer that longer,
// more tangled read, or the added challenge of not having cluster names
// visible on the board at all. Dependencies are injected (see
// createGameEngine in gameLogic.js for the same convention) since
// `state`/`sim`/W/H are all reassigned elsewhere in game.js, and this
// module has no DOM elements of its own beyond the `svg` selection it's
// handed.
/* global d3 */
import { pillWidth } from "./puzzleGraph.js";
import { normalizeInfo } from "./termInfo.js";
export function createStarRenderer({
  svg, getState, getW, getH, getSim, setSim,
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode, updateSolutionHint, countEl, setMessage
}) {
  function buildStarGraph() {
    const state = getState();
    const W = getW(), H = getH();
    const { nodes, links, puzzle } = state;
    // Self-contained, like buildSetGraph's own layer setup — this used to
    // rely on loadPuzzle having already cleared the SVG, which was true
    // when it was the only caller, but setMode() now calls the active
    // renderer directly on a mode switch without clearing first, which
    // left another mode's elements still in the DOM underneath.
    if (getSim()) getSim().stop();
    svg.selectAll("*").remove();
    const linkLayer = svg.append("g");
    const titleLayer = svg.append("g");
    const nodeLayer = svg.append("g");

    // Ring layout, used only to seed each title's starting position (see
    // titleNodes below) -- not an ongoing force. What actually holds a
    // connected node near its cluster now is buildClusterLinks, not a
    // fixed point on this ring.
    const nClusters = puzzle.clusters.length;
    const ringR = Math.min(W, H) * 0.33;
    const ring = Array.from({ length: nClusters }, (_, i) => {
      const angle = (i / nClusters) * 2 * Math.PI - Math.PI / 2;
      return [W / 2 + ringR * Math.cos(angle), H / 2 + ringR * Math.sin(angle)];
    });

    // One label per cluster, square-cornered (see the CSS: no `rx`, plain
    // fill:none outline) so it reads as "not a term" at a glance -- kept
    // out of `nodes`/`links` entirely, since gameLogic.js treats every
    // entry there as a real, tappable term (scoring, hasBetterSolution,
    // etc.).
    const titleNodes = puzzle.clusters.map((c, ci) => ({
      isTitleNode: true, ci, word: c.name, w: pillWidth(c.name),
      x: ring[ci][0], y: ring[ci][1]
    }));

    // What actually pulls a connected node into place: a spring straight
    // to its own cluster's title, not to whichever specific already-done
    // node the player happened to tap to make the connection (see
    // state.links below for why that specific pairing isn't a
    // relationship worth anchoring on). A term belongs to exactly one
    // cluster, so one link; a bridge with only one side confirmed gets
    // one link (pulled toward that side only); a bridge with both sides
    // confirmed gets two, settling toward both at once the way two real
    // springs naturally would -- no separate midpoint calculation needed,
    // the way Graph mode's own anchor-point version needs. Direct object
    // references, not `.id()`-based lookup, since title nodes carry no
    // `id` at all. Rebuilt (not just re-linked) on every call since a
    // node's `connected` array only grows -- see state.onLinkAdded.
    const buildClusterLinks = () => {
      const out = [];
      nodes.forEach(n => n.connected.forEach(ci => out.push({ source: n, target: titleNodes[ci] })));
      return out;
    };

    const sim = d3.forceSimulation([...nodes, ...titleNodes])
      .force("clusterPull", d3.forceLink(buildClusterLinks()).distance(70).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-240))
      .force("collide", d3.forceCollide().radius(d => d.w / 2 + 14));
    setSim(sim);

    // Every connection the player actually made is still recorded here
    // in full (source/target are the exact tapped pair -- gameLogic.js
    // needs that for scoring, hasBetterSolution, and share-link replay),
    // but the LINE drawn for it goes from the connecting node to its
    // cluster's title, not to that specific tapped sibling: which
    // existing done node you happened to tap was never meaningful in its
    // own right (see the file-level comment) -- only "this term belongs
    // to this cluster" is, and a title-node endpoint says exactly that.
    // A bridge is the one case where the specific target CAN carry real
    // meaning (idealTerms) -- that's preserved entirely by the term's
    // own .ideal-target highlight (state.paint below) and this line's
    // own .ideal class, neither of which depends on where the line ends.
    state.drawLinks = () => {
      linkLayer.selectAll("line").data(links).join("line")
        .attr("class", d => {
          if (!d.bridge) return "link";
          // Re-evaluated for every link on every call, not just the newest
          // one — so both of a bridge's segments flip from dashed to solid
          // together the moment its second connection completes it,
          // matching Sets mode's own partial/complete line treatment.
          const cls = isDone(d.source) ? "link bridge-link" : "link bridge-link partial";
          return d.ideal ? `${cls} ideal` : cls;
        });
    };
    state.drawLinks();

    // No manual drag offsets exist in this mode's model at all (the force
    // simulation owns every node's position) -- see buildSetGraph's own
    // versions of these two for what they're standing in for here, and
    // handleTap (modules/gameLogic.js) for where they're called.
    state.captureManualOffset = () => null;
    state.reconcileManualOffset = () => {};

    // Sets mode keeps its own persistent simulation running (state.setSim)
    // across a mode switch unless told to stop -- this mode has nothing
    // of its own that needs stopping beyond `sim` itself, which the
    // `if (getSim()) getSim().stop()` at the top of this function
    // already handles on the way back in.
    state.stopRenderer = () => {};

    // handleTap calls this right after pushing a new link — this mode needs
    // to redraw the line, hand the freshly-grown cluster-link set to the
    // force simulation, and nudge it awake again.
    state.onLinkAdded = () => {
      state.drawLinks();
      sim.force("clusterPull").links(buildClusterLinks());
      sim.alpha(0.6).restart();
    };

    // A title is draggable the same way a term is -- a temporary pin
    // while dragging, released back to the simulation on drop (not a
    // permanent "sticky" pin the way Circle mode's cluster drag works),
    // since physics always owns the final position in this mode.
    //
    // It's also a valid tap TARGET (never a tap SOURCE -- there's
    // nothing to select about a cluster itself): tapping it while a
    // free/partial term is selected connects that term to this cluster,
    // exactly as if the player had tapped one of the cluster's own
    // already-placed members, because that's genuinely all tapping any
    // specific member ever meant in the first place (see the file
    // header) -- so rather than teaching gameLogic.js and the
    // moveHistory-based share-link system about a second kind of node
    // id, this just forwards to handleTap on a real member (the
    // cluster's first seed, always already placed from the moment the
    // puzzle loads) and lets the existing mechanism do exactly what it
    // already does for that member. The recorded link/share-link entry
    // ends up pointing at that seed either way -- invisible to the
    // player, since every such line is drawn to the title regardless of
    // which specific member it's recorded against.
    const titleG = titleLayer.selectAll("g").data(titleNodes).join("g")
      .attr("class", d => `title-node c-${puzzle.clusters[d.ci].color}`)
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", d => `${puzzle.clusters[d.ci].name} cluster`)
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
    titleG.append("rect")
      .attr("height", 30).attr("width", d => d.w).attr("x", d => -d.w / 2).attr("y", -15);
    titleG.append("text").attr("dy", 4).text(d => d.word);

    function tapTitle(d) {
      const s = state.selected;
      if (!s) {
        setMessage(`"${puzzle.clusters[d.ci].name}" — tap a gray term, then tap here to connect it to this cluster.`);
        return;
      }
      const representative = nodes.find(n => n.word === puzzle.clusters[d.ci].seeds[0]);
      handleTap(representative);
    }
    titleG.on("click", (e, d) => tapTitle(d));
    titleG.on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tapTitle(d); } });

    // Two independent pieces, mirroring exactly how a bridge already
    // separates them: an optional author-curated `info` (a cluster's
    // name is usually a real, citable topic -- e.g. "Photosynthesis" is
    // a far richer Wikipedia article than any single term inside it --
    // so this is where that link lives, same wiki:/link/extraLink shape
    // and rules as termInfo/bridge info, always available since a link
    // to the topic isn't spoiler-shaped), and the cluster's `fact`,
    // which is a completion *reward* (see addFactCard in game.js) --
    // showing it here before that moment would let hovering the title
    // spoil it, undermining both the "reveal fact on completion" payoff
    // and (since a fact often explains what the cluster is about) the
    // "no trap words" challenge itself. Gating the text half on
    // state.shownClusters -- the exact same flag checkClusterCompletion
    // already uses to fire the fact card once -- makes that impossible
    // by construction: this can only ever show a fact the player has
    // already been shown once. Until then, hovering still shows the
    // cluster's name plus whatever link is available (curated, or the
    // auto search fallback showTermInfo already gives an unauthored
    // term -- see its own comment) -- harmless, since the name itself
    // is already the visible label, not hidden information.
    // titleNodes persists for this whole buildStarGraph() call (state.paint
    // here is the lightweight re-classer below, not a rebuild), so mutating
    // `d.info` in place and reusing `d` itself as the focus-lock identity
    // (see focusedInfoNode in game.js) is safe -- no separate stable cache
    // needed the way Circle mode's cluster hover does.
    function titleInfoOf(d) {
      const c = puzzle.clusters[d.ci];
      const authored = normalizeInfo(c.info) || {};
      return {
        text: state.shownClusters.has(d.ci) ? c.fact : null,
        link: authored.link,
        extraLink: authored.extraLink
      };
    }
    titleG.on("mouseenter", (e, d) => {
      if (getFocusedInfoNode()) return;
      d.info = titleInfoOf(d);
      showTermInfo(d);
    });
    titleG.on("mouseleave", () => { if (!getFocusedInfoNode()) clearTermInfo(); });
    titleG.on("focus", (e, d) => { d.info = titleInfoOf(d); focusTermInfo(d); });
    titleG.on("blur", (e, d) => blurTermInfo(d));

    const nodeG = nodeLayer.selectAll("g").data(nodes).join("g")
      .attr("class", "node")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", d => d.word)
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    nodeG.append("rect")
      .attr("rx", 15).attr("height", 30)
      .attr("width", d => d.w).attr("x", d => -d.w / 2).attr("y", -15);
    nodeG.append("text").attr("dy", 4).text(d => d.word);
    // The dot is the only cue a node has hand-written info at all — hover
    // alone has no discoverability (nothing to try hovering over), and tap
    // already does double duty for the connect mechanic, so it can't imply
    // "info here" on its own either. Gated on `text` specifically, not just
    // `info` existing, now that a link-only override (no note, just a
    // verified destination replacing the implicit auto search) is common —
    // otherwise every node would show a dot and it would stop meaning
    // anything.
    nodeG.filter(d => d.info && d.info.text).append("circle").attr("class", "info-dot")
      .attr("r", 3).attr("cx", d => d.w / 2 - 9).attr("cy", -9);

    nodeG.on("click", (e, d) => handleTap(d));
    nodeG.on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTap(d); } });
    nodeG.on("mouseenter", (e, d) => { if (!getFocusedInfoNode()) showTermInfo(d); });
    nodeG.on("mouseleave", () => { if (!getFocusedInfoNode()) clearTermInfo(); });
    nodeG.on("focus", (e, d) => focusTermInfo(d));
    nodeG.on("blur", (e, d) => blurTermInfo(d));

    state.paint = () => {
      nodeG.attr("class", d => {
        if (d === state.selected) return "node selected";
        if (isDone(d)) {
          const base = isBridge(d) ? "node done bridge" : `node done c-${state.puzzle.clusters[d.gs[0]].color}`;
          return d.gs.length === 1 && d.idealFor && d.idealFor.length ? `${base} ideal-target` : base;
        }
        if (d.connected.length) return "node partial";
        return "node free";
      });
      // Re-evaluated every paint (not set once at creation) since
      // shownClusters only grows as the puzzle is played -- unlike a
      // term's info-dot, which never changes after puzzle load.
      titleG.each(function (d) {
        d3.select(this).selectAll(".info-dot")
          .data(state.shownClusters.has(d.ci) ? [d] : [])
          .join("circle")
          .attr("class", "info-dot")
          .attr("r", 3).attr("cx", d.w / 2 - 9).attr("cy", -9);
      });
      countEl.textContent = `${state.made} of ${state.need} links`;
      updateSolutionHint();
    };
    state.paint();

    sim.on("tick", () => {
      [...nodes, ...titleNodes].forEach(n => {
        n.x = Math.max(n.w / 2 + 6, Math.min(W - n.w / 2 - 6, n.x));
        n.y = Math.max(22, Math.min(H - 22, n.y));
      });
      linkLayer.selectAll("line")
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => titleNodes[d.target.gs[0]].x).attr("y2", d => titleNodes[d.target.gs[0]].y);
      nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
      titleG.attr("transform", d => `translate(${d.x},${d.y})`);
    });
  }

  return { buildStarGraph };
}
