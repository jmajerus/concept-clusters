// Sets mode: clusters render as circles containing their terms, and
// bridges render as edges between circle boundaries — never crossing
// into the interior — instead of Graph mode's board of per-term
// node-links.
//
// PROTOTYPE: unlike the original static-layout version of this mode,
// clusters and connected bridges now live in their own persistent,
// continuously-running force simulation (state.setSim) — a cluster is
// a composite node with a fixed radius (its content size), a bridge is
// a lightweight node pulled toward whichever cluster(s) it's connected
// to, mirroring how Graph mode already anchors bridges toward their
// clusters. Docked (already-placed) terms and free (not-yet-connected)
// terms are NOT simulated — they stay exactly where they were before,
// positioned deterministically relative to their cluster or the free
// strip. This is what "only the entire clusters and bridge nodes are
// subject to force-directed influence" means in practice.
//
// This directly replaces the old one-shot, 300-tick-then-freeze layout
// solve, and — as a consequence — the old hand-rolled bridge/circle
// obstruction avoidance (safePartialOffset, bridgeLineObstructed) and
// the manual-offset reconciliation hooks (captureManualOffset/
// reconcileManualOffset) are no longer needed: collision forces keep a
// bridge clear of circles it isn't connected to on their own, and a
// manually-dragged cluster or bridge is pinned via D3's own fx/fy
// (permanently, once dragged — the same "sticky note" placement
// convention this mode has always had for drags, just implemented
// natively instead of as a hand-tracked offset), so its screen position
// never needs to be reconciled against a changing formula in the first
// place.
//
// Dependencies are injected (see createGameEngine in gameLogic.js for
// the same convention) since `state`/W/H/`sim` are all reassigned
// elsewhere in game.js.
/* global d3 */
import { rectEdgeDist } from "./geometry.js";
import { pillWidth } from "./puzzleGraph.js";

// Extra vertical room reserved for a term that MIGHT end up wearing an
// ideal-tag caption (see gameLogic.js's markIdealFor) — reserved for any
// term named in ANY bridge's idealTerms, whether or not that potential
// is ever earned, so this mode's packed layout never has to reflow once
// a caption actually appears. Purely a sizing decision, not a leak: the
// space sits empty until a caption is actually earned.
const TAG_H = 14;
const mayCarryIdealTag = (puzzle, term) =>
  puzzle.bridges.some(b => b.idealTerms && b.idealTerms.includes(term));

const PILL_H_CONST = 30, PILL_GAP_CONST = 6, HEAD_CONST = 22, PAD_CONST = 16;

// The gap between a circle's own boundary and the nearest edge of its
// nearest docked pill — exact and constant regardless of the circle's
// radius (the radius term cancels out), since both the pill's distance
// from center and the circle's own radius grow from the same content-
// fitting formula.
const CIRCLE_PILL_CLEARANCE = HEAD_CONST + PAD_CONST - 4;

export function createSetRenderer({
  svg, getState, getW, getH, getSim,
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode, updateSolutionHint, countEl
}) {
  // Cluster circle sizing (content-driven, unrelated to physics), a
  // stable "free area" scatter position for every node that can start
  // (or remain) unconnected, and an initial ring arrangement for
  // clusters to start the live simulation from. All computed once per
  // puzzle and cached on state; the live simulation (see
  // createLiveSimulation) takes over refining cluster positions from
  // here, continuously, rather than this doing a one-shot solve.
  function computeSetLayout(puzzle, nodes) {
    const W = getW(), H = getH();
    const PILL_H = 30, PILL_GAP = 6, HEAD_H = 22, PAD = 16;

    // Free (not-yet-connected) nodes are packed into a reserved strip along
    // the top of the board, left-to-right with simple row wrapping — a
    // deterministic layout that can't fail to converge or leave two pills
    // overlapping. Order is shuffled by a stable hash of each word, not
    // authoring order — otherwise a player who plays many puzzles could
    // learn that earlier list positions tend to belong to earlier clusters.
    const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
    const freeNodes = nodes
      .filter(n => !(n.gs.length === 1 && n.connected.length))
      .map(n => ({ id: n.id, w: n.w, word: n.word }))
      .sort((a, b) => hash(a.word) - hash(b.word));

    const STRIP_MARGIN = 16, ROW_GAP = 10;
    const stripInnerWidth = W - STRIP_MARGIN * 2;
    const freePositions = new Map();
    let rowX = 0, rowY = STRIP_MARGIN + PILL_H / 2;
    freeNodes.forEach(n => {
      if (rowX > 0 && rowX + n.w > stripInnerWidth) {
        rowX = 0;
        rowY += PILL_H + ROW_GAP;
      }
      freePositions.set(n.id, { x: STRIP_MARGIN + rowX + n.w / 2, y: rowY });
      rowX += n.w + ROW_GAP;
    });
    const stripHeight = freeNodes.length ? rowY + PILL_H / 2 + STRIP_MARGIN : STRIP_MARGIN;

    // Headings render OUTSIDE the circle (see computeHeadingPositions
    // below), so their text width must NOT count toward the circle's
    // size, or a puzzle with long cluster names gets needlessly
    // oversized circles that then can't help but overlap.
    const clusterBoxes = puzzle.clusters.map(c => {
      const contentW = Math.max(...c.terms.map(pillWidth)) + PAD * 2;
      const termsH = c.terms.reduce((sum, t) =>
        sum + PILL_H + PILL_GAP + (mayCarryIdealTag(puzzle, t) ? TAG_H : 0), 0) - PILL_GAP;
      const contentH = HEAD_H + termsH + PAD * 2;
      return { r: Math.hypot(contentW, contentH) / 2 };
    });

    // A simple ring is enough of a starting point — no overlap solving
    // needed here anymore, since the live simulation (charge + collide)
    // resolves that continuously once it starts ticking, the same way
    // Graph mode's own force simulation settles from a cold start.
    const nClusters = puzzle.clusters.length;
    const boardMidY = stripHeight + (H - stripHeight) / 2;
    const ringR = Math.min(W, H - stripHeight) * 0.3;
    const csNodes = puzzle.clusters.map((c, i) => {
      const angle = (i / nClusters) * 2 * Math.PI - Math.PI / 2;
      return {
        id: i, isClusterNode: true, r: clusterBoxes[i].r,
        x: W / 2 + ringR * Math.cos(angle), y: boardMidY + ringR * Math.sin(angle)
      };
    });

    return { clusterBoxes, csNodes, freePositions, stripHeight };
  }

  // Point each cluster's heading away from its own bridges — a fixed
  // "always north" heading collides with whichever bridge line happens
  // to approach from that side, since a bridge can leave a circle at any
  // angle depending on where its partner cluster currently is. Recomputed
  // fresh on every repaint (not just once) since cluster positions now
  // keep changing as the live simulation settles — cheap enough at this
  // node count to not matter.
  function computeHeadingPositions(puzzle, csNodes, clusterBoxes, stripHeight, W, H) {
    const headingWidth = name => name.length * 8 + 16;
    const bridgeDirs = puzzle.clusters.map(() => []);
    puzzle.bridges.forEach(b => {
      const [i, j] = b.clusters;
      const a = csNodes[i], z = csNodes[j];
      const dx = z.x - a.x, dy = z.y - a.y, len = Math.hypot(dx, dy) || 1;
      bridgeDirs[i].push([dx / len, dy / len]);
      bridgeDirs[j].push([-dx / len, -dy / len]);
    });
    return puzzle.clusters.map((c, ci) => {
      const dirs = bridgeDirs[ci];
      let idealHx = 0, idealHy = -1;
      if (dirs.length) {
        const sx = dirs.reduce((s, d) => s + d[0], 0), sy = dirs.reduce((s, d) => s + d[1], 0);
        const len = Math.hypot(sx, sy);
        if (len > 0.1) { idealHx = -sx / len; idealHy = -sy / len; }
      }
      const { x: cx, y: cy, r } = csNodes[ci];
      const halfW = headingWidth(c.name) / 2;
      const dist = r + 12;

      // Only true cardinal directions are candidates, deliberately excluding
      // diagonals — see the original comment history in git log for why
      // (a diagonal "ideal" direction can clip the content box's corner
      // despite passing a radial-distance check).
      const candidates = [[0, -1], [0, 1], [1, 0], [-1, 0]];
      let best = null, bestScore = -Infinity;
      for (const [hx, hy] of candidates) {
        const x = cx + hx * dist, y = cy + hy * dist;
        const fits = x >= halfW && x <= W - halfW && y >= stripHeight + 14 && y <= H - 10;
        if (!fits) continue;
        const score = hx * idealHx + hy * idealHy; // higher = closer to the ideal direction
        if (score > bestScore) { bestScore = score; best = { x, y }; }
      }
      if (!best) {
        best = {
          x: Math.max(halfW, Math.min(W - halfW, cx + idealHx * dist)),
          y: Math.max(stripHeight + 14, Math.min(H - 10, cy + idealHy * dist))
        };
      }
      return { x: best.x, y: best.y, halfW };
    });
  }

  function pillClass(n, extra) {
    const state = getState();
    if (n === state.selected) return "node selected";
    let cls = "node";
    if (isDone(n)) cls += isBridge(n) ? " done bridge" : ` done c-${state.puzzle.clusters[n.gs[0]].color}`;
    else if (n.connected.length) cls += " partial";
    else cls += " free";
    return extra ? `${cls} ${extra}` : cls;
  }

  // A cluster's live position — physics-computed if it's never been
  // dragged, or wherever it was dragged to (D3's own fx/fy pin, set
  // permanently once dragged — see the clusterDrag "end" handler).
  // Either way `.x`/`.y` on the node itself is always the current,
  // authoritative answer, so this is just a lookup.
  function clusterPos(ci) {
    return getState().setLayout.csNodes[ci];
  }

  // The position a docked term or free (not-yet-connected) node sits
  // at — unchanged from before, still a deterministic formula relative
  // to its cluster (docked) or a fixed strip slot (free). A connected
  // bridge is no longer computed by formula at all: it's a live node in
  // the simulation (or pinned via fx/fy if dragged), so its own `.x`/`.y`
  // already *is* the answer.
  function pillBasePosition(n) {
    const state = getState();
    const { freePositions } = state.setLayout;
    if (n.gs.length === 1) {
      if (!isDone(n)) return freePositions.get(n.id);
      const ci = n.gs[0];
      const c = clusterPos(ci);
      const { r } = state.setLayout.clusterBoxes[ci];
      const terms = state.puzzle.clusters[ci].terms;
      const ti = terms.indexOf(n.word);
      const startY = -r + HEAD_CONST + PAD_CONST - 4;
      let dy = 0;
      for (let i = 0; i < ti; i++) {
        dy += PILL_H_CONST + PILL_GAP_CONST + (mayCarryIdealTag(state.puzzle, terms[i]) ? TAG_H : 0);
      }
      return { x: c.x, y: c.y + startY + dy + PILL_H_CONST / 2 };
    }
    // Bridge, connected: the simulation (or a drag pin) owns its position.
    if (n.connected.length >= 1) return { x: n.x, y: n.y };
    return freePositions.get(n.id);
  }

  // Kept as its own name (rather than inlining pillBasePosition
  // everywhere) since it reads better at each call site, and because an
  // earlier version of this mode distinguished "base" from "dragged
  // offset" here — no longer true (dragging pins a node's own x/y
  // directly now), but every other module still calls this one name.
  function pillTarget(n) {
    return pillBasePosition(n);
  }

  // A dragged bridge is the only pill free to go anywhere — nothing stops
  // it from landing inside a circle mid-drag, since collision forces
  // don't apply to a node while its position is being driven directly by
  // the pointer (fx/fy). Pushes the point out to just past whichever
  // circle(s) it's currently inside, along the line from that circle's
  // own center, so it reads as sliding along the boundary rather than
  // snapping. A second pass catches the case where correcting for one
  // circle pushes the point into a neighboring one.
  function keepOutsideCircles(x, y) {
    const state = getState();
    const MARGIN = 14;
    for (let pass = 0; pass < 2; pass++) {
      state.setLayout.clusterBoxes.forEach((box, ci) => {
        const c = clusterPos(ci);
        const r = box.r + MARGIN;
        const dx = x - c.x, dy = y - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist < r) {
          const ux = dist ? dx / dist : 1, uy = dist ? dy / dist : 0;
          x = c.x + ux * r;
          y = c.y + uy * r;
        }
      });
    }
    return { x, y };
  }

  // One segment per side the bridge is actually connected to (so a bridge
  // connected to only one cluster so far gets a single segment, not two) —
  // each meeting at the bridge pill's own live position, not a straight
  // line between circle boundaries that ignores where the pill actually
  // is. Anchoring each segment on the pill means it always bends to
  // follow, wherever physics (or a drag) puts it, the way a real graph
  // edge would.
  // Each segment's `ideal` flag is looked up independently — a bridge can
  // land on its ideal term on one side and not the other — and gets the
  // same bold treatment Graph mode already uses for the same thing.
  // `partial` mirrors Graph mode's dashed .node.partial treatment, now
  // applied to the line itself too, for a bridge still missing its other
  // connection.
  function bridgeLineSegments(b) {
    const state = getState();
    const n = state.nodes.find(x => x.word === b.term);
    const p = pillTarget(n);
    const partial = n.connected.length < 2;
    return b.clusters.filter(ci => n.connected.includes(ci)).map(ci => {
      const c = clusterPos(ci);
      const r = state.setLayout.clusterBoxes[ci].r;
      const dx = p.x - c.x, dy = p.y - c.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const link = state.links.find(l => l.source === n && l.target.gs[0] === ci);
      // A partial (dashed) segment stops at the pill's own rect boundary
      // instead of continuing to its center — otherwise the pill (drawn
      // on top) covers roughly the near half of the segment.
      let x2 = p.x, y2 = p.y;
      if (partial) {
        const edgeDist = rectEdgeDist(ux, uy, n.w / 2, PILL_H_CONST / 2);
        x2 = p.x - ux * edgeDist;
        y2 = p.y - uy * edgeDist;
      }
      return {
        side: ci, x1: c.x + ux * r, y1: c.y + uy * r, x2, y2,
        ideal: !!(link && link.ideal), partial
      };
    });
  }

  // Shared by both the initial render and repositionAll — keyed by side so
  // a bridge growing from one connection to two adds a line rather than
  // needing the whole group rebuilt.
  function renderBridgeLines(g, b) {
    g.selectAll("line")
      .data(bridgeLineSegments(b), d => d.side)
      .join(enter => enter.append("line"))
      .attr("class", d => `link bridge-link${d.ideal ? " ideal" : ""}${d.partial ? " partial" : ""}`)
      .attr("x1", d => d.x1).attr("y1", d => d.y1).attr("x2", d => d.x2).attr("y2", d => d.y2);
  }

  // Every currently-connected bridge -- the set of extra nodes the live
  // simulation manages alongside the clusters themselves.
  function connectedBridges(state) {
    return state.nodes.filter(n => isBridge(n) && n.connected.length > 0);
  }

  // Cluster-cluster links (general "stay near your bridged neighbor"
  // spacing, from the puzzle's full bridge topology regardless of
  // connection state) plus bridge-to-cluster links (only for bridges'
  // CURRENT connections, rebuilt whenever those change). Direct object
  // references, not `.id()`-based lookup -- cluster ids (0..N-1) and
  // node ids (also 0..M-1) share the same numeric range, so id-based
  // resolution risks resolving a link to the wrong node entirely.
  function buildSimLinks(puzzle, csNodes, bridges) {
    const clusterLinks = puzzle.bridges.map(b => ({
      source: csNodes[b.clusters[0]], target: csNodes[b.clusters[1]], kind: "cluster"
    }));
    const bridgeLinks = [];
    bridges.forEach(n => {
      n.connected.forEach(ci => bridgeLinks.push({ source: n, target: csNodes[ci], kind: "bridge" }));
    });
    return [...clusterLinks, ...bridgeLinks];
  }

  function bridgeCollideRadius(n) {
    return Math.hypot(n.w / 2, PILL_H_CONST / 2) + CIRCLE_PILL_CLEARANCE;
  }

  // Physics (charge + collide) resolves most topologies on its own, but a
  // dense one -- several clusters all mutually bridged, so nothing
  // directly enforces every PAIR's separation, only each individual
  // link's target distance -- can leave the simulation settled with a
  // real residual overlap. The original static-solve version of this
  // file hit this exact case ("Fundamental forces of physics", four
  // mutually-bridged clusters, effectively a complete graph) and needed
  // a deterministic fallback pass for it; live physics has the same
  // limitation. Looping internally (not just once per tick) since fixing
  // one pair can reintroduce overlap in another for a dense topology --
  // same reason the original version looped up to 50 passes rather than
  // doing one. Returns whether it actually had anything to fix, which
  // the tick handler uses to keep the simulation's alpha elevated (see
  // there -- confirmed live that this, not the correction logic itself,
  // was the actual bug: alphaDecay can cross the auto-stop threshold and
  // halt all future ticks while a real overlap still exists, permanently
  // freezing it, since a stopped simulation never calls this again).
  // Skips either side that's pinned by a manual drag (fx/fy set) so a
  // player's own placement is never overridden by this.
  function resolveClusterOverlaps(csNodes) {
    let fixedAny = false;
    for (let pass = 0; pass < 10; pass++) {
      let anyOverlap = false;
      for (let i = 0; i < csNodes.length; i++) {
        for (let j = i + 1; j < csNodes.length; j++) {
          const a = csNodes[i], b = csNodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const minDist = a.r + b.r + 30;
          if (dist >= minDist) continue;
          anyOverlap = true;
          fixedAny = true;
          const push = (minDist - dist) / 2;
          const ux = dx / dist, uy = dy / dist;
          // Zeroing velocity too, not just position: a node's leftover
          // vx/vy from whatever force caused the overlap otherwise just
          // carries it right back on a subsequent tick.
          if (a.fx === undefined) { a.x -= ux * push; a.y -= uy * push; a.vx = 0; a.vy = 0; }
          if (b.fx === undefined) { b.x += ux * push; b.y += uy * push; b.vx = 0; b.vy = 0; }
        }
      }
      if (!anyOverlap) break;
    }
    return fixedAny;
  }

  // The persistent simulation backing this mode's whole layout: created
  // once per puzzle (cached on state.setSim) and never stopped/restarted
  // wholesale afterward -- only its managed node/link arrays grow (see
  // state.onLinkAdded below) and its alpha gets nudged, the same pattern
  // Graph mode's own simulation already uses.
  function createLiveSimulation(csNodes) {
    return d3.forceSimulation(csNodes)
      .force("charge", d3.forceManyBody().strength(d => d.isClusterNode ? -220 : -20))
      .force("collide", d3.forceCollide().radius(d => d.isClusterNode ? d.r + 16 : bridgeCollideRadius(d)).iterations(3))
      .force("link", d3.forceLink([]).distance(l =>
        l.kind === "cluster" ? (l.source.r + l.target.r + 70) : (l.target.r + bridgeCollideRadius(l.source) + 16)
      ).strength(l => l.kind === "cluster" ? 0.25 : 0.85))
      .alphaDecay(0.04);
  }

  function buildSetGraph() {
    const state = getState();
    const { puzzle, nodes } = state;
    // Stop Graph mode's own simulation if it's still running from before
    // a mode switch -- this mode's simulation is a separate thing
    // (state.setSim), stopped instead via state.stopRenderer.
    if (getSim()) getSim().stop();

    // Tied together deliberately: state.setSim manages state.setLayout's
    // own csNodes array by direct reference, so the two must always be
    // (re)created together, never independently -- an old simulation
    // left running against an array that's since been replaced would
    // tick nodes nothing renders from anymore, while the real, current
    // csNodes never gets added to any simulation at all.
    if (!state.setLayout) {
      state.setLayout = computeSetLayout(puzzle, nodes);
      state.setSim = createLiveSimulation(state.setLayout.csNodes);
    }

    // Full clear + persistent layers are set up once per puzzle/mode-entry
    // (loadPuzzle resets state.setLayersReady by creating a fresh `state`;
    // setMode resets it explicitly on a mode switch) — NOT on every repaint,
    // since repaints need to reuse existing elements for both dragging and
    // CSS transform transitions to work.
    if (!state.setLayersReady) {
      svg.selectAll("*").remove();
      state.setLayers = {
        clusterLayer: svg.append("g").attr("class", "set-clusters"),
        lineLayer: svg.append("g").attr("class", "set-lines"),
        pillLayer: svg.append("g").attr("class", "set-pills")
      };
      state.setLayersReady = true;
    }
    const { clusterLayer, lineLayer, pillLayer } = state.setLayers;
    const { clusterBoxes } = state.setLayout;

    // ---- clusters: circle + heading, draggable as one unit ----
    const clusterDrag = d3.drag()
      .subject((e, d) => clusterPos(d.ci))
      .on("start", function (e, d) {
        d3.select(this).raise().classed("dragging", true); svg.classed("dragging", true);
        if (!e.active) state.setSim.alphaTarget(0.3).restart();
        const node = state.setLayout.csNodes[d.ci];
        node.fx = node.x; node.fy = node.y;
      })
      .on("drag", (e, d) => {
        const node = state.setLayout.csNodes[d.ci];
        node.fx = e.x; node.fy = e.y;
      })
      .on("end", function (e, d) {
        d3.select(this).classed("dragging", false); svg.classed("dragging", false);
        if (!e.active) state.setSim.alphaTarget(0);
        // fx/fy deliberately left set -- once a player places a cluster
        // by hand, it stays there permanently (the same "sticky"
        // placement convention this mode has always had for drags),
        // rather than releasing it back to the simulation the way
        // Graph mode's own drag does for individual terms.
      });

    clusterLayer.selectAll("g.set-cluster")
      .data(puzzle.clusters.map((c, ci) => ({ c, ci })), d => d.ci)
      .join(enter => {
        const g = enter.append("g").attr("class", "set-cluster").call(clusterDrag);
        g.append("circle").attr("class", d => `set-circle c-${d.c.color}`).attr("r", d => clusterBoxes[d.ci].r);
        g.append("text").attr("class", "set-heading");
        return g;
      });

    // ---- bridge lines (one per connected side — one for a bridge still
    // missing its other connection, two once complete) ----
    lineLayer.selectAll("g.bridge-lines")
      .data(puzzle.bridges.filter(b => nodes.find(n => n.word === b.term).connected.length >= 1), b => b.term)
      .join(enter => enter.append("g").attr("class", "bridge-lines"))
      .each(function (b) { renderBridgeLines(d3.select(this), b); });

    // ---- every pill (free, docked term, or bridge in any state), one flat,
    // keyed layer so a status change reuses the same element and animates
    // via CSS rather than popping into a different position instantly ----
    // Only bridges get individual drag — a regular term is always placed by
    // a deterministic, already non-overlapping algorithm, so there's
    // little to gain from nudging one by hand. A bridge, sitting adjacent
    // to or between circles rather than absorbed into one, is the piece
    // that actually benefits from it.
    const pillDrag = d3.drag()
      .subject((e, d) => pillTarget(d))
      .on("start", function (e, d) {
        d3.select(this).raise().classed("dragging", true);
        svg.classed("dragging", true);
        d._dragMoved = 0;
        // Remembered so a tap (see "end" below) can restore it rather than
        // clear it outright — a plain click starting a fresh gesture on an
        // already-dragged pill looks identical to a genuine tap here.
        d._dragStartFx = d.fx; d._dragStartFy = d.fy;
        if (!e.active) state.setSim.alphaTarget(0.3).restart();
      })
      .on("drag", function (e, d) {
        d._dragMoved += Math.abs(e.dx) + Math.abs(e.dy);
        const { x, y } = keepOutsideCircles(e.x, e.y);
        d.fx = x; d.fy = y;
        d3.select(this).attr("transform", `translate(${x},${y})`);
      })
      .on("end", function (e, d) {
        d3.select(this).classed("dragging", false);
        svg.classed("dragging", false);
        if (!e.active) state.setSim.alphaTarget(0);
        if (d._dragMoved < 4) {
          // Restore whatever pin was there before this gesture (see
          // "start"), rather than clearing unconditionally -- that
          // discards this gesture's own negligible drift without
          // erasing a real, previously-dragged pin that a plain tap
          // shouldn't touch.
          d.fx = d._dragStartFx; d.fy = d._dragStartFy;
          // A bridge's tap never goes through a native click (a drag
          // behavior's preventDefault on pointerdown suppresses it,
          // confirmed unreliable to layer a separate click listener
          // alongside), and focus is part of that same suppressed
          // default action -- deferring a tick lets d3-drag's own
          // internal pointerup cleanup (which otherwise blurs it right
          // back out) finish first.
          const el = this;
          handleTap(d);
          setTimeout(() => el.focus(), 0);
        }
      });

    pillLayer.selectAll("g.node")
      .data(nodes, n => n.id)
      .join(enter => {
        const g = enter.append("g")
          .attr("class", n => pillClass(n))
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", n => n.word)
          .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTap(d); } });
        // Regular terms: plain click, same as always.
        g.filter(n => !isBridge(n)).on("click", (e, d) => handleTap(d));
        // Bridges: the drag behavior's own "end" handler is the ONLY tap
        // path (see pillDrag above) — deliberately not also a separate
        // click listener (handling both double-invokes handleTap).
        g.filter(n => isBridge(n)).call(pillDrag);
        g.append("rect").attr("rx", 15).attr("height", 30).attr("width", n => n.w).attr("x", n => -n.w / 2).attr("y", -15);
        g.append("text").attr("dy", 4).text(n => n.word);
        g.filter(n => !isBridge(n)).append("text").attr("class", "ideal-tag").attr("dy", 27).attr("text-anchor", "middle");
        // Same info-dot/hover mechanic as Graph mode — see the note there.
        g.filter(n => n.info && n.info.text).append("circle").attr("class", "info-dot")
          .attr("r", 3).attr("cx", n => n.w / 2 - 9).attr("cy", -9);
        g.on("mouseenter", (e, d) => { if (!getFocusedInfoNode()) showTermInfo(d); });
        g.on("mouseleave", () => { if (!getFocusedInfoNode()) clearTermInfo(); });
        g.on("focus", (e, d) => focusTermInfo(d));
        g.on("blur", (e, d) => blurTermInfo(d));
        return g;
      })
      .each(function (n) {
        const isIdeal = n.gs.length === 1 && n.idealFor && n.idealFor.length;
        d3.select(this).attr("class", pillClass(n, isIdeal ? "ideal-target" : ""));
        d3.select(this).select(".ideal-tag").text(isIdeal ? n.idealFor.join(", ") : "");
      });

    // Recomputes every dependent position (cluster transforms + headings,
    // bridge lines, every pill) from wherever the simulation (or a drag
    // pin) currently has things — called on every simulation tick, so it
    // needs to be cheap; with a handful of nodes per puzzle this is
    // negligible. Re-established fresh on every buildSetGraph call so it
    // always closes over this render's DOM selections, never a stale one
    // from before a rebuild.
    function repositionAll() {
      const heading = computeHeadingPositions(puzzle, state.setLayout.csNodes, clusterBoxes, state.setLayout.stripHeight, getW(), getH());
      clusterLayer.selectAll("g.set-cluster").each(function (d) {
        const p = clusterPos(d.ci);
        const g = d3.select(this);
        g.attr("transform", `translate(${p.x},${p.y})`);
        const h = heading[d.ci];
        g.select("text.set-heading").attr("x", h.x - p.x).attr("y", h.y - p.y + 4).text(d.c.name);
      });
      lineLayer.selectAll("g.bridge-lines").each(function (b) { renderBridgeLines(d3.select(this), b); });
      pillLayer.selectAll("g.node").each(function (n) {
        if (d3.select(this).classed("dragging")) return;
        const p = pillTarget(n);
        d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
      });
    }

    // Board-bounds clamp for both clusters and connected bridges, run
    // every tick -- same reasoning as the original static layout's
    // per-tick clamp (a clamp only at the end can shove an
    // already-separated pair back into each other; clamping every tick
    // lets collision keep resolving whatever the clamp itself introduces).
    const W = getW(), H = getH();
    const stripHeight = state.setLayout.stripHeight;
    state.setSim.on("tick", () => {
      // Board-bounds clamp runs BEFORE the overlap correction below, not
      // after -- clamping each node independently toward the board edges
      // has no awareness of separation, and can reintroduce (or newly
      // introduce) an overlap the correction already fixed this same
      // tick if it runs afterward, with nothing left to catch it before
      // this frame draws (confirmed live: this exact ordering bug was
      // why the correction appeared to have no effect at all, not a
      // strength/pass-count problem). Overlap resolution needs to be the
      // last word before repositionAll, always.
      state.setLayout.csNodes.forEach(n => {
        n.x = Math.max(n.r + 24, Math.min(W - n.r - 24, n.x));
        n.y = Math.max(stripHeight + 24 + n.r, Math.min(H - n.r - 24, n.y));
      });
      connectedBridges(state).forEach(n => {
        n.x = Math.max(20, Math.min(W - 20, n.x));
        n.y = Math.max(stripHeight + 20, Math.min(H - 20, n.y));
      });
      // If there was real overlap-fixing work this tick, don't let the
      // simulation cross its own auto-stop alpha threshold and freeze
      // here -- keep it elevated enough to guarantee at least a few more
      // ticks (and therefore a few more correction opportunities) happen.
      if (resolveClusterOverlaps(state.setLayout.csNodes)) {
        state.setSim.alpha(Math.max(state.setSim.alpha(), 0.1));
      }
      repositionAll();
    });
    repositionAll();

    countEl.textContent = `${state.made} of ${state.need} links`;
    updateSolutionHint();
    state.paint = () => buildSetGraph();
    state.drawLinks = () => {};

    // A new connection can change which bridges the simulation needs to
    // manage (a bridge graduates from the free strip the moment it gets
    // its first connection) and always changes the bridge-to-cluster
    // link set -- rebuild both and nudge the simulation awake, the same
    // pattern Graph mode's own onLinkAdded already uses for its force
    // accessors.
    state.onLinkAdded = () => {
      const bridges = connectedBridges(state);
      bridges.forEach(n => {
        if (n.x === undefined) {
          // Seed near its first connected cluster rather than wherever
          // D3's default node-init would place a brand-new node, so it
          // animates in from somewhere sensible instead of a visible jump.
          const c = state.setLayout.csNodes[n.connected[0]];
          n.x = c.x + (Math.random() - 0.5) * 40;
          n.y = c.y + (Math.random() - 0.5) * 40;
        }
      });
      state.setSim.nodes([...state.setLayout.csNodes, ...bridges]);
      state.setSim.force("link").links(buildSimLinks(puzzle, state.setLayout.csNodes, bridges));
      state.setSim.alpha(0.6).restart();
    };

    // Nothing to preserve/reconcile across a connection change anymore --
    // a bridge's position is either physics-driven (which already
    // transitions smoothly as its link set changes) or drag-pinned
    // (which is unaffected by connection changes at all). See the file
    // header for why the old version of these two needed to exist.
    state.captureManualOffset = () => null;
    state.reconcileManualOffset = () => {};

    // Called by setMode() (game.js) before switching to another
    // rendering mode, so this mode's simulation doesn't keep ticking
    // (and repositioning now-detached DOM) in the background forever.
    state.stopRenderer = () => { if (state.setSim) state.setSim.stop(); };
  }

  return { buildSetGraph };
}
