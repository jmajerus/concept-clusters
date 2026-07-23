// Graph mode: the original per-term force-directed board. Dependencies
// are injected (see createGameEngine in gameLogic.js for the same
// convention) since `state`/`sim`/W/H are all reassigned elsewhere in
// game.js, and this module has no DOM elements of its own beyond the
// `svg` selection it's handed.
/* global d3 */
export function createGraphRenderer({
  svg, getState, getW, getH, getSim, setSim,
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode, updateSolutionHint, countEl
}) {
  function buildGraph() {
    const state = getState();
    const W = getW(), H = getH();
    const { nodes, links, puzzle } = state;
    // Self-contained, like buildSetGraph's own layer setup — this used to
    // rely on loadPuzzle having already cleared the SVG, which was true
    // when it was the only caller, but setMode() now calls buildGraph()
    // directly on a mode switch without clearing first, which left sets
    // mode's circles/pills still in the DOM underneath the new board.
    if (getSim()) getSim().stop();
    svg.selectAll("*").remove();
    const linkLayer = svg.append("g");
    const nodeLayer = svg.append("g");

    // Give each cluster its own anchor point on the board, arranged in a
    // ring. Nodes only get pulled toward their anchor AFTER the player has
    // connected them there (anchorStrength is 0 for anything still free) —
    // the board tidies up as a reward for correct answers already given,
    // never as a spatial hint toward answers not yet given. A bridge with
    // one confirmed side anchors toward that cluster; once both sides are
    // confirmed, it anchors to the midpoint between them.
    const nClusters = puzzle.clusters.length;
    const ringR = Math.min(W, H) * 0.33;
    const anchors = Array.from({ length: nClusters }, (_, i) => {
      const angle = (i / nClusters) * 2 * Math.PI - Math.PI / 2;
      return [W / 2 + ringR * Math.cos(angle), H / 2 + ringR * Math.sin(angle)];
    });
    const anchorOf = d => {
      if (d.gs.length === 2 && d.connected.length === 2) {
        const [a, b] = d.gs.map(i => anchors[i]);
        return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      }
      if (d.gs.length === 2 && d.connected.length === 1) return anchors[d.connected[0]];
      return anchors[d.gs[0]];
    };
    const anchorStrength = d => d.connected.length > 0 ? 0.25 : 0;

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(75).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-240))
      .force("collide", d3.forceCollide().radius(d => d.w / 2 + 14))
      .force("x", d3.forceX(d => anchorOf(d)[0]).strength(anchorStrength))
      .force("y", d3.forceY(d => anchorOf(d)[1]).strength(anchorStrength));
    setSim(sim);

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
    // to redraw the line, hand the new link array to the force simulation,
    // recompute anchor targets/strengths (forceX/Y only recompute those when
    // the accessor is re-set, not on every tick), and nudge the simulation
    // awake again.
    state.onLinkAdded = () => {
      state.drawLinks();
      sim.force("link").links(state.links);
      sim.force("x").x(d => anchorOf(d)[0]).strength(anchorStrength);
      sim.force("y").y(d => anchorOf(d)[1]).strength(anchorStrength);
      sim.alpha(0.6).restart();
    };

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
      countEl.textContent = `${state.made} of ${state.need} links`;
      updateSolutionHint();
    };
    state.paint();

    sim.on("tick", () => {
      nodes.forEach(n => {
        n.x = Math.max(n.w / 2 + 6, Math.min(W - n.w / 2 - 6, n.x));
        n.y = Math.max(22, Math.min(H - 22, n.y));
      });
      linkLayer.selectAll("line")
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
    });
  }

  return { buildGraph };
}
