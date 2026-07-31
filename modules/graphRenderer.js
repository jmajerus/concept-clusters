// Graph mode: the original per-term force-directed board. Dependencies
// are injected (see createGameEngine in gameLogic.js for the same
// convention) since `state`/`sim`/W/H are all reassigned elsewhere in
// game.js, and this module has no DOM elements of its own beyond the
// `svg` selection it's handed.
/* global d3 */
import { idealBridgeNames } from "./idealTarget.js";
import { bridgePoints } from "./puzzleGraph.js";
import { starLayoutRevision } from "./starLayoutSchema.js";
import { computePrettyGraphLayout } from "./graphLayout.js";
import {
  afterNextPaint,
  animatePositionTargets,
  layoutTransitionDuration
} from "./layoutTransition.js";
import { lensPhaseActive, withLensClass } from "./lensEngine.js";
import {
  bridgeArmArrows,
  bridgeArrowPoints,
  bridgeNodeAriaLabel
} from "./bridgeDirection.js";
export function createGraphRenderer({
  svg, getState, getW, getH, getSim, setSim,
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode, updateSolutionHint, countEl, setMessage
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
    const directionLayer = svg.append("g").attr("class", "bridge-directions");
    const nodeLayer = svg.append("g");

    // Give each cluster its own anchor point on the board, arranged in a
    // ring. Nodes only get pulled toward their anchor AFTER the player has
    // connected them there (anchorStrength is 0 for anything still free) —
    // the board tidies up as a reward for correct answers already given,
    // never as a spatial hint toward answers not yet given. A bridge with
    // one confirmed side anchors toward that cluster; with several sides
    // confirmed, it anchors to their centroid. That handles ordinary
    // binary bridges and the ternary pilot with the same rule.
    const nClusters = puzzle.clusters.length;
    const ringR = Math.min(W, H) * 0.33;
    const anchors = Array.from({ length: nClusters }, (_, i) => {
      const angle = (i / nClusters) * 2 * Math.PI - Math.PI / 2;
      return [W / 2 + ringR * Math.cos(angle), H / 2 + ringR * Math.sin(angle)];
    });
    const anchorOf = d => {
      // Free nodes have zero anchor strength, so the fallback only needs
      // to be valid; once a node has confirmed memberships, use exactly
      // those memberships and reveal no unearned destination.
      const memberships = d.connected.length ? d.connected : [d.gs[0]];
      const points = memberships.map(i => anchors[i]);
      return [
        points.reduce((sum, p) => sum + p[0], 0) / points.length,
        points.reduce((sum, p) => sum + p[1], 0) / points.length
      ];
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
      directionLayer.selectAll("polygon.bridge-direction-arrow")
        .data(links.flatMap(link => {
          if (!link.bridge || !isDone(link.source)) return [];
          const clusterIndex = link.target.gs[0];
          return bridgeArmArrows(link.source, clusterIndex).map(arrow => ({
            ...arrow,
            link,
            key: `${link.source.id}:${clusterIndex}:${arrow.direction}`
          }));
        }), arrow => arrow.key)
        .join("polygon")
        .attr("class", "bridge-direction-arrow")
        .attr("aria-hidden", "true");
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
    state.onPuzzleSolved = () => {
      if (!state.completedViaShowSolution) {
        state.onPlayerLayoutChanged?.("player");
      }
    };

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

    const graphDrag = d3.drag()
      .filter(event => !event.ctrlKey && !event.button && !lensPhaseActive(state))
      .on("start", (e, d) => {
        if (!e.active) sim.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (e, d) => {
        d.x = d.fx = e.x;
        d.y = d.fy = e.y;
      })
      .on("end", (e, d) => {
        if (state.made === state.need) {
          // On a solved board, a drag is an explicit layout preference.
          // Keep it pinned so both a later polish pass and session restore
          // respect the player's choice.
          d.fx = d.x;
          d.fy = d.y;
          state.solutionLayout = null;
          updateSolutionHint();
        } else {
          d.fx = null;
          d.fy = null;
        }
        if (!e.active) sim.alphaTarget(0);
        state.onPlayerLayoutChanged?.("player");
      });

    const nodeG = nodeLayer.selectAll("g").data(nodes).join("g")
      .attr("class", "node")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", d => d.word)
      .call(graphDrag);

    nodeG.append("rect").attr("class", "pill-shape")
      .attr("rx", 15).attr("height", 30)
      .attr("width", d => d.w).attr("x", d => -d.w / 2).attr("y", -15);
    // A bridge's second, pointed-ends shape (see bridgePoints/puzzleGraph.js)
    // -- drawn for every bridge from the start but CSS-hidden until the
    // "bridge" class actually appears on the parent .node (state.paint,
    // only once partial or done), so an untouched bridge still looks
    // exactly like a plain pill. A separate element rather than swapping
    // the rect's own shape, since a <rect> can't be a hexagon and the
    // shape has to exist before state.paint knows whether to reveal it.
    nodeG.filter(d => isBridge(d)).append("polygon").attr("class", "bridge-shape")
      .attr("points", d => bridgePoints(d.w));
    nodeG.append("text").attr("dy", 4).text(d => d.word);
    nodeG.append("text").attr("class", "lens-check")
      .attr("x", d => -d.w / 2 + 8).attr("dy", 4)
      .attr("aria-hidden", "true").text("✓");
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
        let cls;
        if (d === state.selected) {
          cls = "node selected";
        } else if (isDone(d)) {
          const base = isBridge(d) ? "node done bridge" : `node done c-${state.puzzle.clusters[d.gs[0]].color}`;
          cls = isBridge(d) ? base : idealBridgeNames(d, puzzle, state.shownClusters, nodes).length
            ? `${base} ideal-target` : base;
        } else if (d.connected.length) {
          cls = isBridge(d) ? "node partial bridge" : "node partial";
        } else {
          cls = "node free";
        }
        return withLensClass(cls, d, state);
      })
        .attr("aria-label", d => bridgeNodeAriaLabel(d, puzzle, isDone(d)))
        .attr("aria-pressed", d =>
        state.phase === "lens-selecting"
          ? String(state.lensSelections.has(d.word))
          : null
      );
      countEl.textContent = state.progressLabel || `${state.made} of ${state.need} links`;
      updateSolutionHint();
    };
    state.paint();

    const renderPositions = () => {
      nodes.forEach(n => {
        n.x = Math.max(n.w / 2 + 6, Math.min(W - n.w / 2 - 6, n.x));
        n.y = Math.max(22, Math.min(H - 22, n.y));
      });
      linkLayer.selectAll("line")
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      directionLayer.selectAll("polygon.bridge-direction-arrow")
        .attr("points", d => bridgeArrowPoints(
          { x: d.link.source.x, y: d.link.source.y },
          { x: d.link.target.x, y: d.link.target.y },
          d.direction,
          d.centerOffset
        ));
      nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
    };
    state.freezeForLenses = () => {
      sim.stop();
      renderPositions();
    };

    const captureGraphLayout = () => {
      const positions = {};
      nodes.forEach(node => {
        positions[`term:${node.word}`] = {
          x: Math.round(node.x * 100) / 100,
          y: Math.round(node.y * 100) / 100,
          pinned: node.fx != null && node.fy != null
        };
      });
      return {
        schemaVersion: 1,
        puzzleId: puzzle.id,
        puzzleRevision: starLayoutRevision(puzzle),
        board: { width: W, height: H },
        nodes: positions,
        solutionLayout: state.solutionLayout === "pretty" ? "pretty" : null
      };
    };

    const validateGraphLayout = layout => {
      const errors = [];
      if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
        return { valid: false, errors: ["Graph layout must be an object"] };
      }
      if (layout.schemaVersion !== 1) errors.push("Graph layout schemaVersion must be 1");
      if (layout.puzzleId !== puzzle.id) errors.push(`Graph layout puzzleId must be "${puzzle.id}"`);
      if (layout.puzzleRevision !== starLayoutRevision(puzzle)) {
        errors.push("Graph layout puzzle revision is stale");
      }
      if (layout.board?.width !== W || layout.board?.height !== H) {
        errors.push("Graph layout board size does not match");
      }
      nodes.forEach(node => {
        const point = layout.nodes?.[`term:${node.word}`];
        if (!point || !Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.y))) {
          errors.push(`term:${node.word} must have finite x/y coordinates`);
        } else if (point.x < 0 || point.x > W || point.y < 0 || point.y > H) {
          errors.push(`term:${node.word} lies outside the board`);
        }
      });
      return { valid: errors.length === 0, errors };
    };

    const applyGraphLayout = layout => {
      const validation = validateGraphLayout(layout);
      if (!validation.valid) return validation;
      sim.stop();
      nodes.forEach(node => {
        const point = layout.nodes[`term:${node.word}`];
        node.x = Number(point.x);
        node.y = Number(point.y);
        node.fx = point.pinned ? node.x : null;
        node.fy = point.pinned ? node.y : null;
        node.vx = 0;
        node.vy = 0;
      });
      state.solutionLayout = state.made === state.need && layout.solutionLayout === "pretty"
        ? "pretty"
        : null;
      renderPositions();
      state.paint();
      return { valid: true, errors: [] };
    };

    const prettyPrintGraphLayout = () => {
      if (state.made !== state.need) return Promise.resolve({ cancelled: true });
      if (state.solutionLayout === "polishing") return state.prettyPrintPromise;
      const run = async () => {
        state.solutionLayout = "polishing";
        updateSolutionHint();
        sim.stop();
        setMessage("Solution shown — arranging term clusters and bridge corridors…", "good");
        // Changing the button to "Polishing…" and disabling it happens in
        // this same click task. Give the browser a complete paint between
        // two animation frames before entering the synchronous candidate
        // search; a single rAF resumes before paint and would still leave
        // the button apparently inert until the search finished.
        await afterNextPaint();
        if (getState() !== state) return { cancelled: true };
        const candidate = computePrettyGraphLayout({
          d3, puzzle, nodes, links: state.links, width: W, height: H
        });
        if (!candidate || getState() !== state) return { cancelled: true };
        const targets = new Map(nodes.map(node => [
          node, candidate.positions.get(node.id)
        ]));
        svg.classed("graph-polishing", true);
        const animated = await animatePositionTargets({
          targets,
          duration: layoutTransitionDuration(750),
          render: renderPositions,
          isCurrent: () => getState() === state,
          resetVelocity: true
        });
        svg.classed("graph-polishing", false);
        if (!animated || getState() !== state) return { cancelled: true };
        sim.stop();
        nodes.forEach(node => {
          const target = candidate.positions.get(node.id);
          node.x = target.x;
          node.y = target.y;
          node.vx = 0;
          node.vy = 0;
        });
        renderPositions();
        state.graphLayoutStats = {
          ...candidate.metrics,
          order: candidate.order,
          rotation: candidate.rotation,
          scale: candidate.scale
        };
        state.solutionLayout = "pretty";
        updateSolutionHint();
        setMessage(
          candidate.metrics.hardOverlaps === 0 &&
            candidate.metrics.lineCrossings === 0
            ? "Solution shown — Graph layout polished."
            : "Solution shown — Graph layout improved within the available space.",
          "good"
        );
        state.onPlayerLayoutChanged?.("automatic");
        return state.graphLayoutStats;
      };
      state.prettyPrintPromise = run();
      return state.prettyPrintPromise;
    };

    state.detangle = prettyPrintGraphLayout;
    state.prettyPrint = prettyPrintGraphLayout;
    state.layoutAdapter = {
      mode: "graph",
      capture: captureGraphLayout,
      apply: applyGraphLayout,
      autoLayout: prettyPrintGraphLayout
    };
    sim.on("tick", renderPositions);
  }

  return { buildGraph };
}
