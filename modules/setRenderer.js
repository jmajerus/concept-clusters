// Sets mode: clusters render as circles containing their terms, and
// bridges render as edges between circle boundaries — never crossing
// into the interior — instead of Graph mode's board of per-term
// node-links. This mode is "tap-only, snap into place": no drag, no
// continuous physics once the puzzle loads, so it only has to compute
// layout once per puzzle rather than keep resettling it.
//
// The one thing the old static-only version never had to solve: WHERE a
// free (not-yet-connected) node sits, and what a half-connected bridge
// looks like. Both matter for fairness, not just looks — a bridge that's
// confirmed on one side must never hint at the other, unconfirmed side,
// the same rule the anchor force in graphRenderer.js already follows.
//
// Dependencies are injected (see createGameEngine in gameLogic.js for
// the same convention) since `state`/W/H/`sim` are all reassigned
// elsewhere in game.js.
/* global d3 */
import { rectEdgeDist, segmentDistToPoint } from "./geometry.js";
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
// fitting formula. bridgeLineObstructed lets a line cut through that
// outer ring freely (it clips no pill there, only empty circle) —
// only getting closer to center than this, into where pills actually
// might be, counts as an obstruction. Kept a few px shy of the true
// clearance as a margin against rounding rather than cutting it exactly
// to the edge.
const CIRCLE_PILL_CLEARANCE = HEAD_CONST + PAD_CONST - 4;
const OBSTRUCTION_SAFETY_MARGIN = 10;

export function createSetRenderer({
  svg, getState, getW, getH, getSim,
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode, updateSolutionHint, countEl
}) {
  // Cluster circle sizing + positions, and a stable "free area" scatter
  // position for every node that can start (or remain) unconnected. Both
  // are computed once per puzzle and cached on state, so repeated repaints
  // during play don't reshuffle anything that's already on screen.
  function computeSetLayout(puzzle, nodes) {
    const W = getW(), H = getH();
    const PILL_H = 30, PILL_GAP = 6, HEAD_H = 22, PAD = 16;

    // Free (not-yet-connected) nodes are packed into a reserved strip along
    // the top of the board, left-to-right with simple row wrapping — a
    // deterministic layout that can't fail to converge or leave two pills
    // overlapping, unlike trying to force-simulate an unbounded number of
    // free items into whatever gaps happen to remain around the cluster
    // circles (which measurably failed to fully resolve on busier puzzles).
    // Order is shuffled by a stable hash of each word, not authoring order —
    // otherwise a player who plays many puzzles could learn that earlier
    // list positions tend to belong to earlier clusters.
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

    // Headings render OUTSIDE the circle (see below), so — unlike an
    // earlier version of this — their text width must NOT count toward the
    // circle's size, or a puzzle with long cluster names gets needlessly
    // oversized circles that then can't help but overlap.
    const clusterBoxes = puzzle.clusters.map(c => {
      const contentW = Math.max(...c.terms.map(pillWidth)) + PAD * 2;
      const termsH = c.terms.reduce((sum, t) =>
        sum + PILL_H + PILL_GAP + (mayCarryIdealTag(puzzle, t) ? TAG_H : 0), 0) - PILL_GAP;
      const contentH = HEAD_H + termsH + PAD * 2;
      return { r: Math.hypot(contentW, contentH) / 2 };
    });

    const csNodes = puzzle.clusters.map((c, i) => ({ id: i, r: clusterBoxes[i].r }));
    const csLinks = puzzle.bridges.map(b => ({ source: b.clusters[0], target: b.clusters[1] }));
    const csSim = d3.forceSimulation(csNodes)
      .force("link", d3.forceLink(csLinks).id(d => d.id).distance(d => d.source.r + d.target.r + 70))
      .force("charge", d3.forceManyBody().strength(-200))
      // Multiple relaxation passes per tick (not the default 1) resolve
      // tight packing — like one oversized circle bridged to three others
      // at once — much more reliably than just running more ticks.
      .force("collide", d3.forceCollide().radius(d => d.r + 16).iterations(4))
      .force("center", d3.forceCenter(W / 2, (H + stripHeight) / 2))
      .stop();
    // Clamping inside the tick loop (not once at the end) matters: applied
    // only after the simulation settles, a clamp can shove an already-
    // separated circle straight into a neighbor with no chance to react.
    // Clamping every tick lets the collide force keep resolving overlaps
    // the clamp itself introduces near the board's edges — including the
    // reserved free-node strip along the top, which circles must clear.
    for (let i = 0; i < 300; i++) {
      csSim.tick();
      csNodes.forEach(n => {
        // Extra margin on the sides/bottom for the heading, which can land
        // anywhere around the circle (see headingPositions below).
        n.x = Math.max(n.r + 24, Math.min(W - n.r - 24, n.x));
        n.y = Math.max(stripHeight + 24 + n.r, Math.min(H - n.r - 24, n.y));
      });
    }

    // Final safety net: an awkward topology — e.g. one oversized circle
    // bridging three others at once, so nothing directly enforces *their*
    // mutual separation — can leave the simulation stuck in a configuration
    // with a real residual overlap, no matter how many ticks it gets or how
    // good the collision parameters are (confirmed by testing: doubling
    // ticks and adding collision sub-iterations left it unchanged). This
    // directly and deterministically resolves any pair still overlapping by
    // pushing both circles apart along their connecting line. Deliberately
    // NOT re-clamping to board bounds between passes here — clamping while
    // still resolving overlaps is what limited the previous version to a
    // partial fix, since a clamp can shove a just-separated circle right
    // back into a neighbor. Overlap gets priority; a final single clamp
    // afterward only nudges things back on-board, and a short second
    // resolve pass (still unclamped) cleans up anything that reopens.
    const resolveOverlaps = passes => {
      for (let pass = 0; pass < passes; pass++) {
        let anyOverlap = false;
        for (let i = 0; i < csNodes.length; i++) {
          for (let j = i + 1; j < csNodes.length; j++) {
            const a = csNodes[i], b = csNodes[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 0.01;
            const minDist = a.r + b.r + 30;
            if (dist < minDist) {
              anyOverlap = true;
              const push = (minDist - dist) / 2;
              const ux = dx / dist, uy = dy / dist;
              a.x -= ux * push; a.y -= uy * push;
              b.x += ux * push; b.y += uy * push;
            }
          }
        }
        if (!anyOverlap) return true;
      }
      return false;
    };
    resolveOverlaps(50);
    csNodes.forEach(n => {
      n.x = Math.max(n.r + 24, Math.min(W - n.r - 24, n.x));
      n.y = Math.max(stripHeight + 24 + n.r, Math.min(H - n.r - 24, n.y));
    });
    resolveOverlaps(20);

    // Point each cluster's heading away from its own bridges — a fixed
    // "always north" heading collides with whichever bridge line happens
    // to approach from that side, since a bridge can leave a circle at
    // any angle depending on where its partner cluster landed. Computed
    // here (not per-render) so buildSetGraph reuses these exact positions
    // instead of recomputing (and risking drift from) its own.
    const headingWidth = name => name.length * 8 + 16;
    const bridgeDirs = puzzle.clusters.map(() => []);
    puzzle.bridges.forEach(b => {
      const [i, j] = b.clusters;
      const a = csNodes[i], z = csNodes[j];
      const dx = z.x - a.x, dy = z.y - a.y, len = Math.hypot(dx, dy) || 1;
      bridgeDirs[i].push([dx / len, dy / len]);
      bridgeDirs[j].push([-dx / len, -dy / len]);
    });
    const headingPositions = puzzle.clusters.map((c, ci) => {
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
      // diagonals. `r` is sized to the content box's half-*diagonal*, so an
      // offset of r+12 along a pure axis is guaranteed to clear the box's
      // near edge — but the same offset along a diagonal only guarantees
      // Euclidean distance from the center, which can still clip the box's
      // corner (confirmed: a diagonal "ideal" direction visually overlapped
      // a cluster's own top term despite passing the radial-distance check).
      // A board-edge clamp on the ideal direction can also pull the heading
      // back toward its own circle, so pick whichever cardinal direction
      // both fits the board and stays closest to the bridge-avoiding ideal,
      // rather than force-fitting a single direction that has no valid spot.
      const candidates = [[0, -1], [0, 1], [1, 0], [-1, 0]];
      let best = null, bestScore = -Infinity;
      for (const [hx, hy] of candidates) {
        const x = cx + hx * dist, y = cy + hy * dist;
        const fits = x >= halfW && x <= W - halfW && y >= stripHeight + 14 && y <= H - 10;
        if (!fits) continue;
        const score = hx * idealHx + hy * idealHy; // higher = closer to the ideal direction
        if (score > bestScore) { bestScore = score; best = { x, y }; }
      }
      // If truly nothing fits (only possible if the board is smaller than
      // the circle itself, which shouldn't happen), fall back to the
      // clamped ideal position rather than leaving it undefined.
      if (!best) {
        best = {
          x: Math.max(halfW, Math.min(W - halfW, cx + idealHx * dist)),
          y: Math.max(stripHeight + 14, Math.min(H - 10, cy + idealHy * dist))
        };
      }
      return { x: best.x, y: best.y, halfW };
    });

    return { clusterBoxes, csNodes, freePositions, headingPositions };
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

  // A cluster's circle (and its own docked terms) can be dragged as one
  // unit, and any individual pill can also be dragged out on its own —
  // "put what they want where." Both need real DOM elements that persist
  // across repaints (not destroyed and recreated every time a connection
  // changes something) so that (a) CSS can animate a position change
  // smoothly via `transition: transform`, and (b) a drag isn't immediately
  // wiped out by the next repaint. A dragged pill is stored as an offset
  // from its cluster (see pillTarget/pillBasePosition below) rather than
  // an absolute point — "sticky note on a poster," not "pulled off the
  // poster entirely" — so nudging a term still lets it travel along if its
  // cluster is dragged later, instead of leaving it stranded behind.
  function clusterPos(ci) {
    const state = getState();
    return state.dragPos.clusters[ci] || state.setLayout.csNodes[ci];
  }

  // How far past the circle's own edge a partial bridge's pill sits, in
  // three tiers, each checked against every OTHER cluster before falling
  // to the next:
  //   1. edgeDist + a visible-dash bonus — the nice case, showing enough
  //      of the dashed line to read as "draggable."
  //   2. edgeDist alone — no dash bonus, but still guaranteed clear of
  //      the pill's OWN circle by construction.
  //   3. the flat +20px this whole thing replaces — for a pill wide
  //      enough that even tier 2 still reaches another circle (a long
  //      bridge phrase spanning most of the gap between two circles),
  //      there is no distance along this fixed direction that's safe
  //      against everything, so this falls back to whatever shipped
  //      before today rather than searching for one. Known not to be
  //      perfectly free of every possible overlap itself (a sufficiently
  //      wide pill even here can graze its own circle) — pre-existing,
  //      out of scope here, and rare enough to accept.
  function safePartialOffset(ownCi, r, a, ux, uy, edgeDist, halfW, halfH) {
    const state = getState();
    const edgeX = a.x + ux * r, edgeY = a.y + uy * r;
    const clearsOthers = dist => {
      const cand = { x: edgeX + ux * dist, y: edgeY + uy * dist };
      return !state.puzzle.clusters.some((c, ci) => {
        if (ci === ownCi) return false;
        const center = state.setLayout.csNodes[ci];
        const fullR = state.setLayout.clusterBoxes[ci].r;
        // The pill itself must never sit inside another circle at all,
        // even in the outer ring a mere line is allowed to cross — a
        // whole pill sitting there reads as if it belongs to that other
        // cluster, not just a line grazing past it. Checked against the
        // pill's actual rectangle, not just its center point — a wide
        // pill's own edge can reach a circle its center clears by a
        // comfortable margin (confirmed: exactly this let a real overlap
        // through when only the center was checked).
        const nearestX = Math.max(cand.x - halfW, Math.min(center.x, cand.x + halfW));
        const nearestY = Math.max(cand.y - halfH, Math.min(center.y, cand.y + halfH));
        if (Math.hypot(center.x - nearestX, center.y - nearestY) < fullR) return true;
        const dangerR = fullR - CIRCLE_PILL_CLEARANCE + OBSTRUCTION_SAFETY_MARGIN;
        return segmentDistToPoint(edgeX, edgeY, cand.x, cand.y, center.x, center.y) < dangerR;
      });
    };
    if (clearsOthers(edgeDist + 20)) return edgeDist + 20;
    if (clearsOthers(edgeDist)) return edgeDist;
    return 20;
  }

  // The position a pill would sit at from the automatic layout alone —
  // exactly today's default computation, with no manual dragging involved.
  // This doubles as the "attachment point" a manual drag offset (see
  // pillTarget) is measured from, which is what makes a dragged term
  // still travel with its cluster if the cluster moves later, instead of
  // detaching into a fixed absolute position.
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
    // Bridge
    if (n.connected.length === 2) {
      const a = clusterPos(n.gs[0]), z = clusterPos(n.gs[1]);
      const ra = state.setLayout.clusterBoxes[n.gs[0]].r, rz = state.setLayout.clusterBoxes[n.gs[1]].r;
      const dx = z.x - a.x, dy = z.y - a.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const x1 = a.x + ux * ra, y1 = a.y + uy * ra, x2 = z.x - ux * rz, y2 = z.y - uy * rz;
      const bi = state.puzzle.bridges.findIndex(b => b.term === n.word);
      const t = 0.5 + (bi % 2 === 0 ? -0.12 : 0.12);
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
    }
    if (n.connected.length === 1) {
      const a = clusterPos(n.connected[0]);
      const r = state.setLayout.clusterBoxes[n.connected[0]].r;
      const free = freePositions.get(n.id) || { x: a.x, y: a.y - r - 40 };
      const dx = free.x - a.x, dy = free.y - a.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      // Deliberately the pill's half-diagonal, not rectEdgeDist's
      // direction-dependent ray-exit distance — that formula answers "how
      // far along this exact ray to the rect's edge," which is the right
      // question for where the line should visually stop (see
      // bridgeLineSegments) but the wrong one for how close the pill's
      // own circle can safely be. Confirmed: when the circle sits in a
      // "corner" direction from the pill (needing both axes clamped), the
      // rect's true nearest point is that corner, closer than the ray-exit
      // point — using the ray distance here understated it and let the
      // pill's own rect overlap its own circle. The half-diagonal is the
      // rect center's distance to that worst-case corner, safe regardless
      // of direction.
      const edgeDist = Math.hypot(n.w / 2, PILL_H_CONST / 2);
      const offset = safePartialOffset(n.connected[0], r, a, ux, uy, edgeDist, n.w / 2, PILL_H_CONST / 2);
      return { x: a.x + ux * (r + offset), y: a.y + uy * (r + offset) };
    }
    return freePositions.get(n.id);
  }

  // A manual drag is stored as an OFFSET from the base position, not an
  // absolute point — "sticky note on a poster," not "pulled off the
  // poster entirely." A term you nudged still travels with its cluster
  // (or a bridge with its circle(s)) if that moves later; only its
  // position *within* that frame of reference is manually adjusted.
  // Unconnected/free pills have no cluster to be relative to, so their
  // offset is effectively an absolute placement, same as before.
  function pillTarget(n) {
    const state = getState();
    const base = pillBasePosition(n);
    const offset = state.dragPos.pills[n.id];
    return offset ? { x: base.x + offset.dx, y: base.y + offset.dy } : base;
  }

  // A dragged bridge is the only pill free to go anywhere — nothing stopped
  // it from landing inside a circle, on top of the very terms it's meant
  // to sit between. Pushes the point out to just past whichever circle(s)
  // it's currently inside, along the line from that circle's own center,
  // so it reads as sliding along the boundary rather than snapping. A
  // second pass catches the case where correcting for one circle pushes
  // the point into a neighboring one.
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
  // is. That was the earlier behavior, and it meant dragging a bridge
  // pulled it visibly off its own connecting line, since the line never
  // knew the pill had moved. Anchoring each segment on the pill instead
  // means it always bends to follow, wherever it's dragged, the way a
  // real graph edge would.
  // Each segment's `ideal` flag is looked up independently — a bridge can
  // land on its ideal term on one side and not the other — and gets the
  // same bold treatment Graph mode already uses for the same thing.
  // `partial` mirrors Graph mode's dashed .node.partial treatment, now
  // applied to the line itself too, for a bridge still missing its other
  // connection — dashed and ideal can combine (a correctly-chosen side on
  // a bridge that isn't done yet is still worth showing as correct).
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
      // on top) covers roughly the near half of the segment regardless of
      // how much room pillBasePosition left, which is what made the dash
      // pattern barely visible in the first place.
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

  // A bridge line only ever needs to clear its OWN two clusters' circles
  // (guaranteed by keepOutsideCircles) — a third, unrelated cluster
  // elsewhere on the board isn't guarded against at all, and a straight
  // line can genuinely cut through one, disappearing behind whatever
  // terms are docked inside it (confirmed: dragging a bridge to the far
  // side of an unrelated circle sends its line straight through the
  // docked terms there, well inside the circle's own radius). Used only
  // at the moment a connection completes (see handleTap) — not during a
  // live drag — to decide whether a preserved position is safe to keep.
  function bridgeLineObstructed(n) {
    const state = getState();
    const b = state.puzzle.bridges.find(x => x.term === n.word);
    const segs = bridgeLineSegments(b);
    return state.puzzle.clusters.some((c, ci) => {
      if (n.gs.includes(ci)) return false; // one of this bridge's own two clusters, not a third party
      const center = state.setLayout.csNodes[ci];
      const r = state.setLayout.clusterBoxes[ci].r - CIRCLE_PILL_CLEARANCE + OBSTRUCTION_SAFETY_MARGIN;
      return segs.some(seg => segmentDistToPoint(seg.x1, seg.y1, seg.x2, seg.y2, center.x, center.y) < r);
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

  function buildSetGraph() {
    const state = getState();
    const { puzzle, nodes } = state;
    if (getSim()) getSim().stop();

    if (!state.setLayout) state.setLayout = computeSetLayout(puzzle, nodes);
    if (!state.dragPos) state.dragPos = { clusters: {}, pills: {} };

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
    const { clusterBoxes, headingPositions } = state.setLayout;

    // ---- clusters: circle + heading, draggable as one unit ----
    const clusterDrag = d3.drag()
      .subject((e, d) => clusterPos(d.ci))
      .on("start", function () { d3.select(this).raise().classed("dragging", true); svg.classed("dragging", true); })
      .on("drag", (e, d) => {
        state.dragPos.clusters[d.ci] = { x: e.x, y: e.y };
        repositionAll();
      })
      .on("end", function () { d3.select(this).classed("dragging", false); svg.classed("dragging", false); });

    clusterLayer.selectAll("g.set-cluster")
      .data(puzzle.clusters.map((c, ci) => ({ c, ci })), d => d.ci)
      .join(enter => {
        const g = enter.append("g").attr("class", "set-cluster").call(clusterDrag);
        g.append("circle").attr("class", d => `set-circle c-${d.c.color}`).attr("r", d => clusterBoxes[d.ci].r);
        const head = g.append("text").attr("class", "set-heading");
        head.each(function (d) {
          const h = headingPositions[d.ci], c0 = state.setLayout.csNodes[d.ci];
          d3.select(this).attr("data-hx", h.x - c0.x).attr("data-hy", h.y - c0.y + 4);
        });
        return g;
      })
      .each(function (d) {
        const p = clusterPos(d.ci);
        d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
        const head = d3.select(this).select("text.set-heading");
        head.attr("x", head.attr("data-hx")).attr("y", head.attr("data-hy")).text(d.c.name);
      });

    // ---- bridge lines (one per connected side — one for a bridge still
    // missing its other connection, two once complete) ----
    // Each is a segment from circle to pill, not pill to circle center, so
    // the pill is a real graph vertex the line always passes through
    // instead of a decoration placed near it.
    lineLayer.selectAll("g.bridge-lines")
      .data(puzzle.bridges.filter(b => nodes.find(n => n.word === b.term).connected.length >= 1), b => b.term)
      .join(enter => enter.append("g").attr("class", "bridge-lines"))
      .each(function (b) { renderBridgeLines(d3.select(this), b); });

    // ---- every pill (free, docked term, or bridge in any state), one flat,
    // keyed layer so a status change reuses the same element and animates
    // via CSS rather than popping into a different position instantly ----
    // Only bridges get individual drag — a regular term is always placed by
    // a deterministic, already non-overlapping algorithm (row-packed in the
    // free strip, or a fixed slot inside its circle, which drags along with
    // that circle as a whole), so there's little to gain from nudging one
    // by hand. A bridge, sitting adjacent to or between circles rather than
    // absorbed into one, is the piece that actually benefits from it.
    // A drag behavior calls preventDefault() on pointerdown (it has to, to
    // suppress the browser's native drag/text-selection) — which, as a side
    // effect, suppresses the browser's own click event afterward entirely,
    // even when there was no actual movement (confirmed: a plain click on a
    // draggable bridge fired pointerdown/mousedown/pointerup but never
    // mouseup or click). So a bridge still needs to be tap-selectable, and
    // that can't rely on the separate .on("click") listener below — instead,
    // track total movement through the gesture and treat anything under a
    // few px as a tap, calling handleTap directly from "end".
    const pillDrag = d3.drag()
      .subject((e, d) => pillTarget(d))
      .on("start", function (e, d) {
        d3.select(this).raise().classed("dragging", true);
        svg.classed("dragging", true);
        d._dragMoved = 0;
        // Remembered so a tap (see "end" below) can restore it rather than
        // delete it outright — a plain click starting a fresh gesture on
        // an already-dragged pill looks identical to a genuine tap here
        // (this gesture's own movement is 0 either way), so deleting
        // unconditionally was wiping out a real offset from an earlier
        // drag, not just a negligible one this gesture introduced.
        d._dragStartOffset = state.dragPos.pills[d.id];
      })
      .on("drag", function (e, d) {
        d._dragMoved += Math.abs(e.dx) + Math.abs(e.dy);
        // Recompute the base fresh each tick (not just at drag start) — if
        // this pill's cluster is itself being carried by an earlier drag,
        // the offset needs to be measured against where the base actually
        // is right now, not a stale value from before.
        const base = pillBasePosition(d);
        const { x, y } = keepOutsideCircles(e.x, e.y);
        state.dragPos.pills[d.id] = { dx: x - base.x, dy: y - base.y };
        d3.select(this).attr("transform", `translate(${x},${y})`);
        if (isBridge(d) && d.connected.length >= 1) repositionAll();
      })
      .on("end", function (e, d) {
        d3.select(this).classed("dragging", false);
        svg.classed("dragging", false);
        if (d._dragMoved < 4) {
          // Restore whatever was there before this gesture (see "start"),
          // rather than deleting unconditionally — that discards this
          // gesture's own negligible drift without erasing a real,
          // previously-dragged position that a plain tap shouldn't touch.
          if (d._dragStartOffset) state.dragPos.pills[d.id] = d._dragStartOffset;
          else delete state.dragPos.pills[d.id];
          // A bridge's tap never goes through a native click (see the note
          // above pillDrag), and focus is part of that same suppressed
          // default action — without this, a tapped bridge would never
          // draw its focus ring or engage the hover lock at all. Calling
          // it inline here isn't enough, though (confirmed by tracing
          // focus/blur events): d3-drag's own internal pointerup cleanup
          // runs synchronously right after this handler returns and blurs
          // it straight back out. Deferring a tick lets that finish first.
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
        // Regular terms: plain click, same as always — nothing else is
        // attached to interfere with it.
        g.filter(n => !isBridge(n)).on("click", (e, d) => handleTap(d));
        // Bridges: the drag behavior's own "end" handler is the ONLY tap
        // path (see pillDrag above) — deliberately not also a separate
        // click listener. Whether the browser's click event still fires
        // once a drag behavior has prevented pointerdown's default turns
        // out to be unreliable (confirmed: it fired in some cases and not
        // others), and handling both double-invokes handleTap — select,
        // then immediately deselect on the same physical click.
        g.filter(n => isBridge(n)).call(pillDrag);
        g.append("rect").attr("rx", 15).attr("height", 30).attr("width", n => n.w).attr("x", n => -n.w / 2).attr("y", -15);
        g.append("text").attr("dy", 4).text(n => n.word);
        g.filter(n => !isBridge(n)).append("text").attr("class", "ideal-tag").attr("dy", 27).attr("text-anchor", "middle");
        // Same info-dot/hover mechanic as Graph mode — see the note
        // there. Safe to layer onto bridges alongside pillDrag: hover
        // events are independent of the click-suppression issue that
        // ruled out a separate click listener for them.
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
        if (!d3.select(this).classed("dragging")) {
          const p = pillTarget(n);
          d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
        }
      });

    // Recomputes every dependent position (docked pills, bridge lines/pills
    // touching a cluster) after a cluster drag moves it — called on every
    // drag tick, so it needs to be cheap; with a handful of nodes per
    // puzzle this is negligible.
    function repositionAll() {
      clusterLayer.selectAll("g.set-cluster").attr("transform", d => {
        const p = clusterPos(d.ci);
        return `translate(${p.x},${p.y})`;
      });
      lineLayer.selectAll("g.bridge-lines").each(function (b) { renderBridgeLines(d3.select(this), b); });
      pillLayer.selectAll("g.node").each(function (n) {
        if (d3.select(this).classed("dragging")) return;
        const p = pillTarget(n);
        d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
      });
    }

    countEl.textContent = `${state.made} of ${state.need} links`;
    updateSolutionHint();
    state.paint = () => buildSetGraph();
    state.drawLinks = () => {};
    state.onLinkAdded = () => {};

    // pillBasePosition uses a different formula per connection count
    // (free-strip position -> float near one circle -> a point along
    // the line between both), so a manual drag offset measured against
    // the *old* formula lands somewhere arbitrary once the count changes
    // and the *new* formula takes over — not because the new position is
    // wrong, but because the old {dx,dy} was never meaningful there.
    // Rendering itself has no actual need for the bridge to sit in any
    // particular spot (each connecting line is just "pill to that
    // circle's boundary," computed live from wherever the pill currently
    // is), so there's no reason to move it at all: capture the true
    // on-screen position before a connection changes things, and
    // reconcile the offset afterward to reproduce that same point under
    // the new formula, so the player's placement survives untouched.
    // Called from handleTap (modules/gameLogic.js) via these two hooks
    // rather than directly, so gameplay logic never has to know which
    // rendering mode is currently active — Graph mode's own versions
    // (see graphRenderer.js) are both no-ops, since it has no manual
    // offsets to preserve at all.
    state.captureManualOffset = s => (isBridge(s) && state.dragPos && state.dragPos.pills[s.id]) ? pillTarget(s) : null;
    state.reconcileManualOffset = (s, prevPos) => {
      if (!prevPos) return;
      const newBase = pillBasePosition(s);
      state.dragPos.pills[s.id] = { dx: prevPos.x - newBase.x, dy: prevPos.y - newBase.y };
      // Reproducing the exact spot the player chose is the default, but
      // not at the cost of a line that now cuts through some other,
      // unrelated circle and disappears behind its terms — that's worse
      // than the small surprise of falling back to the natural position
      // instead.
      if (bridgeLineObstructed(s)) delete state.dragPos.pills[s.id];
    };
  }

  return { buildSetGraph };
}
