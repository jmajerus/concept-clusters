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
import { rectEdgeDist, segmentDistToPoint } from "./geometry.js";
import { pillWidth, bridgePoints } from "./puzzleGraph.js";
import { normalizeInfo } from "./termInfo.js";
import { idealBridgeNames } from "./idealTarget.js";
import { starLayoutRevision } from "./starLayoutSchema.js";

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
// Shared with the free strip's own layout (computeSetLayout) and with
// reclaimStripOnSolve, which collapses the strip down to just this
// margin once nothing's left in it to reserve room for.
const STRIP_MARGIN = 16;

// The gap between a circle's own boundary and the nearest edge of its
// nearest docked pill — exact and constant regardless of the circle's
// radius (the radius term cancels out), since both the pill's distance
// from center and the circle's own radius grow from the same content-
// fitting formula.
const CIRCLE_PILL_CLEARANCE = HEAD_CONST + PAD_CONST - 4;

export function createSetRenderer({
  svg, getState, getW, getH, getSim,
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode, updateSolutionHint, countEl, setMessage
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

    const ROW_GAP = 10;
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

  // computeSetLayout's stripHeight is sized once, for the puzzle's
  // *starting* count of free terms, and never shrinks as they're
  // connected -- even once every term is docked and the strip is
  // guaranteed completely empty, every cluster stays confined exactly
  // as tightly as when the puzzle began. Called once the puzzle is
  // fully solved (state.onPuzzleSolved, wired into the single made ===
  // need choke point in gameLogic.js, so this fires from live play,
  // Show Solution, and &solved/&moves replay alike) to collapse the
  // strip down to its bare margin and give clusters a final reflow into
  // the reclaimed room -- a more comfortable finished layout, not just a
  // wider boundary nothing would otherwise actually move to fill.
  // Skips any cluster the player has manually dragged (fx/fy set) --
  // same "a player's own placement is never overridden" principle
  // resolveClusterOverlaps already follows, since forcing a moved
  // cluster back onto a ring the moment the puzzle ends would undo a
  // deliberate choice right when there's no more play left to redo it.
  function reclaimStripOnSolve() {
    const state = getState();
    const { csNodes } = state.setLayout;
    const W = getW(), H = getH();
    state.setLayout.stripHeight = STRIP_MARGIN;
    const boardMidY = STRIP_MARGIN + (H - STRIP_MARGIN) / 2;
    const ringR = Math.min(W, H - STRIP_MARGIN) * 0.3;
    const n = csNodes.length;
    csNodes.forEach((node, i) => {
      if (node.fx != null) return;
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      node.x = W / 2 + ringR * Math.cos(angle);
      node.y = boardMidY + ringR * Math.sin(angle);
      node.vx = 0;
      node.vy = 0;
    });
    state.setSim.alpha(0.7).restart();
  }

  // Point each cluster's heading away from its own bridges — a fixed
  // "always north" heading collides with whichever bridge line happens
  // to approach from that side, since a bridge can leave a circle at any
  // angle depending on where its partner cluster currently is. Recomputed
  // fresh on every repaint (not just once) since cluster positions now
  // keep changing as the live simulation settles — cheap enough at this
  // node count to not matter.
  // Calibrated against every real cluster name's actual rendered width
  // (Fraunces 600 15px, the real `.set-heading` style) rather than a
  // guessed per-character rate -- the same class of fix pillWidth
  // itself needed earlier: the old `len*8+16` overestimated for the
  // same reason, compounding with name length (up to ~36px of slack for
  // a 26-27 character cluster name, vs. as little as 8px for a short
  // one). Still just an estimate, not exact metrics, so it's checked
  // (never negative slack across the whole catalog) rather than trusted
  // blindly, the same discipline pillWidth's own calibration used.
  const headingWidth = name => name.length * 7.6 + 26;

  // Rough vertical footprint of one line of heading text (Fraunces 600
  // 15px, ascender to descender) -- an estimate, not exact glyph metrics,
  // used only to size the clearance band in `place` below. Generous
  // rather than tight, same discipline as headingWidth: an estimate that
  // costs a few unclaimed px of savings is fine, one that risks a
  // hairline clip is not.
  const HEADING_TEXT_H = 30;

  function computeHeadingPositions(puzzle, csNodes, clusterBoxes, stripHeight, W, H) {
    const bridgeDirs = puzzle.clusters.map(() => []);
    puzzle.bridges.forEach(b => {
      // Point each participant toward the centroid of the other
      // participants. For a binary bridge this reduces to the original
      // opposite-endpoint direction; for a ternary bridge it points toward
      // the shared hub rather than inventing one privileged pair.
      b.clusters.forEach(ci => {
        const a = csNodes[ci];
        const others = b.clusters.filter(cj => cj !== ci).map(cj => csNodes[cj]);
        const zx = others.reduce((sum, n) => sum + n.x, 0) / others.length;
        const zy = others.reduce((sum, n) => sum + n.y, 0) / others.length;
        const dx = zx - a.x, dy = zy - a.y, len = Math.hypot(dx, dy) || 1;
        bridgeDirs[ci].push([dx / len, dy / len]);
      });
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
      const pad = 12;

      // A heading never rotates to match its placement -- it always stays
      // horizontal -- so "closer to the circle" isn't a matter of angle at
      // all, it's a choice of which *pole* to sit near (top/bottom, or
      // neither) and which way to *lean* off it (left/right, or dead
      // center). Once those two picks are made there's nothing left to
      // tune: the tightest legal spot is fully determined by geometry, not
      // a free parameter to sample.
      //
      // A leaning heading's far (outer) edge sits exactly where a plain
      // centered heading's edge already would -- costing no more vertical
      // room than that simplest case ever did -- while its near edge,
      // being HEADING_TEXT_H closer to the equator than the pole itself,
      // meets a real (non-zero) width of circle there instead of the
      // pole's single point. That's what makes leaning cheaper than a
      // centered heading in the first place: the near edge, not the far
      // one, is what the lean direction has to clear, and it's already
      // narrower than the circle's full radius by construction. Sitting
      // any further round toward the equator than this only trades that
      // saving away again -- moving the whole band toward the widest part
      // of the circle raises the near edge's own clearance requirement
      // back up, and costs more vertical room to boot -- so hugging the
      // pole this tightly isn't one option among many, it's the one
      // point that's simultaneously cheapest in both directions at once.
      function place(pole, lean) {
        if (lean === 0) {
          // Centered above/below (or, if pole is also 0, this isn't
          // called) -- the plain case, unchanged: the circle narrows to
          // one point at the exact apex, so a centered heading clears at
          // a flat radial distance regardless of width or name length.
          return { x: cx, y: cy + pole * (r + pad), anchor: "middle" };
        }
        if (pole === 0) {
          // Dead left/right, no vertical bias -- the worst case for
          // clearance (the full radius, at the circle's widest row) but
          // kept as a fallback for boards too short to hug a pole at all.
          return { x: cx + lean * (r + pad), y: cy, anchor: lean > 0 ? "start" : "end" };
        }
        const yFar = cy + pole * (r + pad);
        const yNear = yFar - pole * HEADING_TEXT_H;
        const distFromEquator = Math.min(r, Math.max(0, Math.abs(yNear - cy)));
        const reach = Math.sqrt(Math.max(0, r * r - distFromEquator * distFromEquator));
        return {
          x: cx + lean * (reach + pad),
          y: yFar - pole * HEADING_TEXT_H / 2,
          anchor: lean > 0 ? "start" : "end"
        };
      }
      // The board-bounds span a given placement's heading actually
      // occupies, matching whichever way text-anchor grows it from the
      // anchor point -- "start" only extends rightward from x, "end"
      // only leftward, "middle" both ways evenly.
      const spanOf = (x, anchor) =>
        anchor === "start" ? [x, x + halfW * 2]
          : anchor === "end" ? [x - halfW * 2, x]
            : [x - halfW, x + halfW];

      // Every (pole, lean) combination -- hugging each pole from either
      // side, centered above/below, and dead left/right as a fallback for
      // when hugging a pole doesn't fit the board vertically at all.
      const candidates = [
        [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1], [0, -1], [0, 1]
      ];
      let best = null, bestScore = -Infinity;
      for (const [pole, lean] of candidates) {
        const { x, y, anchor } = place(pole, lean);
        const [spanMin, spanMax] = spanOf(x, anchor);
        const fits = spanMin >= 0 && spanMax <= W && y >= stripHeight + 14 && y <= H - 10;
        if (!fits) continue;
        // Scored against the direction actually achieved, not the input
        // pole/lean labels -- pole and lean no longer scale linearly with
        // distance the way a unit (hx,hy) vector used to, so only the
        // real resulting offset means anything here.
        const dx = x - cx, dy = y - cy, len = Math.hypot(dx, dy) || 1;
        const score = (dx / len) * idealHx + (dy / len) * idealHy;
        if (score > bestScore) { bestScore = score; best = { x, y, anchor }; }
      }
      if (!best) {
        const pole = Math.abs(idealHy) < 0.05 ? 0 : Math.sign(idealHy);
        const lean = Math.abs(idealHx) < 0.05 ? 0 : Math.sign(idealHx);
        let { x, y, anchor } = place(pole, lean);
        const [spanMin, spanMax] = spanOf(x, anchor);
        x += Math.max(0, -spanMin) - Math.max(0, spanMax - W);
        y = Math.max(stripHeight + 14, Math.min(H - 10, y));
        best = { x, y, anchor };
      }
      return { x: best.x, y: best.y, halfW, anchor: best.anchor };
    });
  }

  const permutations = values => {
    if (values.length < 2) return [values];
    return values.flatMap((value, i) =>
      permutations(values.filter((_, j) => j !== i))
        .map(rest => [value, ...rest])
    );
  };

  const rectsOverlap = (a, b, pad = 0) =>
    a.left - pad < b.right &&
    a.right + pad > b.left &&
    a.top - pad < b.bottom &&
    a.bottom + pad > b.top;

  const pointRect = (point, width, height = PILL_H_CONST) => ({
    left: point.x - width / 2,
    right: point.x + width / 2,
    top: point.y - height / 2,
    bottom: point.y + height / 2
  });

  const headingRect = heading => {
    const left = heading.anchor === "start"
      ? heading.x
      : heading.anchor === "end"
        ? heading.x - heading.halfW * 2
        : heading.x - heading.halfW;
    return {
      left,
      right: left + heading.halfW * 2,
      top: heading.y - HEADING_TEXT_H / 2,
      bottom: heading.y + HEADING_TEXT_H / 2
    };
  };

  function segmentIntersection(a, b) {
    const dx1 = a.x2 - a.x1, dy1 = a.y2 - a.y1;
    const dx2 = b.x2 - b.x1, dy2 = b.y2 - b.y1;
    const denominator = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denominator) < 1e-9) return false;
    const t = ((b.x1 - a.x1) * dy2 - (b.y1 - a.y1) * dx2) / denominator;
    const u = ((b.x1 - a.x1) * dy1 - (b.y1 - a.y1) * dx1) / denominator;
    return t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999;
  }

  function segmentIntersectsRect(segment, rect, pad = 0) {
    const left = rect.left - pad, right = rect.right + pad;
    const top = rect.top - pad, bottom = rect.bottom + pad;
    const dx = segment.x2 - segment.x1, dy = segment.y2 - segment.y1;
    const p = [-dx, dx, -dy, dy];
    const q = [
      segment.x1 - left,
      right - segment.x1,
      segment.y1 - top,
      bottom - segment.y1
    ];
    let t0 = 0, t1 = 1;
    for (let i = 0; i < 4; i++) {
      if (Math.abs(p[i]) < 1e-9) {
        if (q[i] < 0) return false;
      } else {
        const ratio = q[i] / p[i];
        if (p[i] < 0) t0 = Math.max(t0, ratio);
        else t1 = Math.min(t1, ratio);
        if (t0 > t1) return false;
      }
    }
    return t1 > 0.001 && t0 < 0.999;
  }

  function bridgeSegmentsForPoint(bridge, point, circles, clusterBoxes) {
    return bridge.clusters.map(ci => {
      const circle = circles[ci];
      const dx = point.x - circle.x, dy = point.y - circle.y;
      const length = Math.hypot(dx, dy) || 1;
      const ux = dx / length, uy = dy / length;
      return {
        bridge: bridge.term,
        side: ci,
        x1: circle.x + ux * clusterBoxes[ci].r,
        y1: circle.y + uy * clusterBoxes[ci].r,
        x2: point.x,
        y2: point.y
      };
    });
  }

  function scoreCircleCandidate(puzzle, circles, bridgePointsByWord, clusterBoxes, stripHeight, W, H) {
    const headings = computeHeadingPositions(puzzle, circles, clusterBoxes, stripHeight, W, H);
    const headingRects = headings.map(headingRect);
    const bridges = puzzle.bridges.map(bridge => ({
      bridge,
      point: bridgePointsByWord.get(bridge.term),
      node: getState().nodes.find(node => node.word === bridge.term)
    })).filter(item => item.point && item.node);
    const bridgeRects = bridges.map(item => pointRect(item.point, item.node.w));
    const segments = bridges.flatMap(item =>
      bridgeSegmentsForPoint(item.bridge, item.point, circles, clusterBoxes)
    );
    const metrics = {
      hardOverlaps: 0,
      circleOverlaps: 0,
      headingOverlaps: 0,
      bridgeCircleOverlaps: 0,
      bridgeHeadingOverlaps: 0,
      bridgeBridgeOverlaps: 0,
      boundsViolations: 0,
      lineCrossings: 0,
      lineHeadingIntersections: 0,
      lineCircleIntersections: 0,
      totalLength: 0
    };

    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      if (circle.x - circle.r < 8 || circle.x + circle.r > W - 8 ||
          circle.y - circle.r < stripHeight + 8 || circle.y + circle.r > H - 8) {
        metrics.hardOverlaps++;
        metrics.boundsViolations++;
      }
      for (let j = i + 1; j < circles.length; j++) {
        if (Math.hypot(circle.x - circles[j].x, circle.y - circles[j].y) <
            circle.r + circles[j].r + 24) {
          metrics.hardOverlaps++;
          metrics.circleOverlaps++;
        }
      }
      for (let j = 0; j < headingRects.length; j++) {
        if (j === i) continue;
        const rect = headingRects[j];
        const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
        const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
        if (Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.r + 6) {
          metrics.hardOverlaps++;
          metrics.headingOverlaps++;
        }
      }
    }
    for (let i = 0; i < headingRects.length; i++) {
      for (let j = i + 1; j < headingRects.length; j++) {
        if (rectsOverlap(headingRects[i], headingRects[j], 6)) {
          metrics.hardOverlaps++;
          metrics.headingOverlaps++;
        }
      }
    }
    bridgeRects.forEach((rect, i) => {
      const item = bridges[i];
      if (rect.left < 10 || rect.right > W - 10 ||
          rect.top < stripHeight + 10 || rect.bottom > H - 10) {
        metrics.hardOverlaps++;
        metrics.boundsViolations++;
      }
      circles.forEach(circle => {
        const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
        const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
        if (Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.r + 8) {
          metrics.hardOverlaps++;
          metrics.bridgeCircleOverlaps++;
        }
      });
      headingRects.forEach(heading => {
        if (rectsOverlap(rect, heading, 8)) {
          metrics.hardOverlaps++;
          metrics.bridgeHeadingOverlaps++;
        }
      });
      for (let j = i + 1; j < bridgeRects.length; j++) {
        if (rectsOverlap(rect, bridgeRects[j], 12)) {
          metrics.hardOverlaps++;
          metrics.bridgeBridgeOverlaps++;
        }
      }
      void item;
    });
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      metrics.totalLength += Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1);
      headingRects.forEach(rect => {
        if (segmentIntersectsRect(segment, rect, 5)) metrics.lineHeadingIntersections++;
      });
      circles.forEach((circle, ci) => {
        if (ci === segment.side) return;
        if (segmentDistToPoint(
          segment.x1, segment.y1, segment.x2, segment.y2,
          circle.x, circle.y
        ) < circle.r + 6) {
          metrics.lineCircleIntersections++;
        }
      });
      for (let j = i + 1; j < segments.length; j++) {
        if (segment.bridge === segments[j].bridge) continue;
        if (segmentIntersection(segment, segments[j])) metrics.lineCrossings++;
      }
    }
    return {
      metrics,
      headings,
      score:
        metrics.hardOverlaps * 1e9 +
        metrics.lineCrossings * 1e7 +
        metrics.lineHeadingIntersections * 1e6 +
        metrics.lineCircleIntersections * 1e6 +
        metrics.totalLength
    };
  }

  function computePrettyCircleLayout() {
    const state = getState();
    const { puzzle } = state;
    const { csNodes, clusterBoxes } = state.setLayout;
    const W = getW(), H = getH();
    const stripHeight = STRIP_MARGIN;
    const n = csNodes.length;
    const centerY = stripHeight + (H - stripHeight) / 2;
    const maxR = Math.max(...clusterBoxes.map(box => box.r));
    const baseRx = Math.max(80, W / 2 - maxR - 48);
    const baseRy = Math.max(70, (H - stripHeight) / 2 - maxR - 32);
    const pinnedCircles = new Set(csNodes.filter(node => node.fx != null).map(node => node.id));
    const completedBridges = connectedBridges(state).filter(isDone);
    const pinnedBridges = new Set(completedBridges.filter(node => node.fx != null).map(node => node.word));
    const orders = permutations(Array.from({ length: n - 1 }, (_, i) => i + 1))
      .map(rest => [0, ...rest]);
    const rotations = Array.from({ length: Math.max(8, n * 4) }, (_, i) =>
      -Math.PI / 2 + i * 2 * Math.PI / Math.max(8, n * 4)
    );
    // Dense Circle puzzles need more than the compact live-simulation
    // radius: four large containers may only fit when the angular slots
    // approach the board bounds. Bounds and label geometry are scored
    // explicitly below, so safely search those larger radii too.
    const scales = [0.82, 0.92, 1, 1.15, 1.3, 1.45];
    let best = null;

    const bridgeCandidatePoints = (bridge, circles, laneIndex) => {
      const participants = bridge.clusters.map(ci => circles[ci]);
      const centroid = {
        x: participants.reduce((sum, circle) => sum + circle.x, 0) / participants.length,
        y: participants.reduce((sum, circle) => sum + circle.y, 0) / participants.length
      };
      const points = [centroid];
      if (participants.length === 2) {
        const [a, b] = participants;
        const dx = b.x - a.x, dy = b.y - a.y;
        const length = Math.hypot(dx, dy) || 1;
        const nx = -dy / length, ny = dx / length;
        const lane = (laneIndex - 1.5) * 34;
        points.push({ x: centroid.x + nx * lane, y: centroid.y + ny * lane });
      }
      for (const radius of [28, 52, 78, 104, 136, 168, 200]) {
        for (let i = 0; i < 16; i++) {
          const angle = i * Math.PI / 8;
          points.push({
            x: centroid.x + radius * Math.cos(angle),
            y: centroid.y + radius * Math.sin(angle)
          });
        }
      }
      return points;
    };

    for (const order of orders) {
      for (const rotation of rotations) {
        for (const scale of scales) {
          const circles = csNodes.map(node => ({
            id: node.id,
            r: node.r,
            x: node.x,
            y: node.y
          }));
          order.forEach((ci, slot) => {
            if (pinnedCircles.has(ci)) return;
            const angle = rotation + slot * 2 * Math.PI / n;
            circles[ci].x = W / 2 + baseRx * scale * Math.cos(angle);
            circles[ci].y = centerY + baseRy * scale * Math.sin(angle);
          });
          const preliminaryHeadings = computeHeadingPositions(
            puzzle, circles, clusterBoxes, stripHeight, W, H
          ).map(headingRect);
          const bridgePointsByWord = new Map();
          completedBridges
            .slice()
            .sort((a, b) => b.gs.length - a.gs.length || b.w - a.w)
            .forEach((node, bridgeIndex) => {
              if (pinnedBridges.has(node.word)) {
                bridgePointsByWord.set(node.word, { x: node.x, y: node.y });
                return;
              }
              const bridge = puzzle.bridges.find(candidate => candidate.term === node.word);
              let bestPoint = null;
              for (const point of bridgeCandidatePoints(bridge, circles, bridgeIndex)) {
                const rect = pointRect(point, node.w);
                let hard = 0;
                circles.forEach(circle => {
                  const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
                  const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
                  if (Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.r + 8) hard++;
                });
                preliminaryHeadings.forEach(heading => {
                  if (rectsOverlap(rect, heading, 8)) hard++;
                });
                for (const [word, placed] of bridgePointsByWord) {
                  const placedNode = state.nodes.find(candidate => candidate.word === word);
                  if (rectsOverlap(rect, pointRect(placed, placedNode.w), 12)) hard++;
                }
                const segments = bridgeSegmentsForPoint(bridge, point, circles, clusterBoxes);
                let obstruction = 0, crossings = 0, length = 0;
                segments.forEach(segment => {
                  length += Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1);
                  preliminaryHeadings.forEach(heading => {
                    if (segmentIntersectsRect(segment, heading, 5)) obstruction++;
                  });
                  circles.forEach((circle, ci) => {
                    if (ci !== segment.side &&
                        segmentDistToPoint(
                          segment.x1, segment.y1, segment.x2, segment.y2,
                          circle.x, circle.y
                        ) < circle.r + 6) {
                      obstruction++;
                    }
                  });
                  for (const [word, placed] of bridgePointsByWord) {
                    const placedBridge = puzzle.bridges.find(candidate => candidate.term === word);
                    bridgeSegmentsForPoint(placedBridge, placed, circles, clusterBoxes)
                      .forEach(other => { if (segmentIntersection(segment, other)) crossings++; });
                  }
                });
                const score = hard * 1e9 + crossings * 1e7 + obstruction * 1e6 + length;
                if (!bestPoint || score < bestPoint.score) bestPoint = { ...point, score };
              }
              bridgePointsByWord.set(node.word, bestPoint);
            });
          const evaluated = scoreCircleCandidate(
            puzzle, circles, bridgePointsByWord, clusterBoxes, stripHeight, W, H
          );
          if (!best || evaluated.score < best.score) {
            best = {
              score: evaluated.score,
              metrics: evaluated.metrics,
              circles,
              bridges: bridgePointsByWord,
              order,
              rotation
            };
          }
        }
      }
    }
    return best;
  }

  // Two independent pieces, mirroring exactly how a bridge already
  // separates them: an optional author-curated `info` (a cluster's name
  // is usually a real, citable topic -- e.g. "Photosynthesis" is a far
  // richer Wikipedia article than any single term inside it -- so this
  // is where that link lives, same wiki:/link/extraLink shape and rules
  // as termInfo/bridge info) and the cluster's `fact`, which is a
  // completion *reward* (see addFactCard in game.js). Both are always
  // available on hover independent of completion state --
  // `info.text`/`info.link`/`info.extraLink` aren't spoiler-shaped by
  // authoring convention (a plain, dictionary-style definition that
  // deliberately never names any of the cluster's own terms), so
  // there's nothing to gate. `fact` deliberately stays OUT of this
  // hover panel entirely rather than swapping in once earned: it's
  // already shown permanently as its own fact-card the moment it's
  // earned, and repeating the same words in a second place the instant
  // that happens would just be noise -- worse, a hover panel's text
  // silently changing mid-play reads as a bug ("didn't this say
  // something else a minute ago?"), not a feature. No authored
  // `info.text` just means `text` is null, and showTermInfo's own
  // fallback (see its comment in game.js) shows just the cluster's name
  // plus whatever link is available -- harmless, since the name is
  // already the visible label, not hidden information.
  function clusterInfoOf(ci) {
    const state = getState();
    const c = state.puzzle.clusters[ci];
    const authored = normalizeInfo(c.info) || {};
    return {
      text: authored.text || null,
      link: authored.link,
      extraLink: authored.extraLink
    };
  }

  function pillClass(n, extra) {
    const state = getState();
    if (n === state.selected) return "node selected";
    let cls = "node";
    if (isDone(n)) cls += isBridge(n) ? " done bridge" : ` done c-${state.puzzle.clusters[n.gs[0]].color}`;
    else if (n.connected.length) cls += isBridge(n) ? " partial bridge" : " partial";
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

  // Mirrors keepOutsideCircles for bridge pills — prevents the dragged
  // cluster circle from overlapping any other circle during drag. The
  // dragged cluster's own radius is included in the minimum distance
  // (bridge pills are small enough to omit, circles aren't). Two passes
  // for the same chain-correction reason as keepOutsideCircles.
  function keepClusterOutside(x, y, ci) {
    const state = getState();
    const { csNodes, clusterBoxes } = state.setLayout;
    const r1 = clusterBoxes[ci].r;
    const MARGIN = 30;
    for (let pass = 0; pass < 2; pass++) {
      csNodes.forEach((c, cj) => {
        if (cj === ci) return;
        const minDist = r1 + c.r + MARGIN;
        const dx = x - c.x, dy = y - c.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist < minDist) {
          x = c.x + (dx / dist) * minDist;
          y = c.y + (dy / dist) * minDist;
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
    const partial = n.connected.length < n.gs.length;
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
    // These cluster-to-cluster springs are layout-only and never render as
    // semantic edges. Use every pair within a bridge so all participants in
    // a ternary relation stay near enough for the visible bridge pill to act
    // as their common hub. Binary bridges still produce exactly one spring.
    const clusterLinks = puzzle.bridges.flatMap(b => {
      const pairs = [];
      for (let i = 0; i < b.clusters.length; i++) {
        for (let j = i + 1; j < b.clusters.length; j++) {
          pairs.push({
            source: csNodes[b.clusters[i]],
            target: csNodes[b.clusters[j]],
            kind: "cluster"
          });
        }
      }
      return pairs;
    });
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
          const push = (minDist - dist) / 2;
          const ux = dx / dist, uy = dy / dist;
          // Zeroing velocity too, not just position: a node's leftover
          // vx/vy from whatever force caused the overlap otherwise just
          // carries it right back on a subsequent tick.
          // fx == null (not === undefined): D3 stores unpinned as null,
          // pinned as a number — === undefined never matched either case.
          // fixedAny only rises when we actually move something: two
          // pinned clusters that overlap can't be resolved here, and
          // setting fixedAny=true for them would keep the simulation
          // spinning forever on an irresolvable overlap.
          const aMoved = a.fx == null, bMoved = b.fx == null;
          if (aMoved) { a.x -= ux * push; a.y -= uy * push; a.vx = 0; a.vy = 0; }
          if (bMoved) { b.x += ux * push; b.y += uy * push; b.vx = 0; b.vy = 0; }
          if (aMoved || bMoved) fixedAny = true;
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
      // Seed any bridges already connected before entering this mode
      // (e.g. switching in from Star or Graph mode with partial progress) —
      // onLinkAdded only fires for NEW connections, so a bridge connected
      // while another mode was active would never be added to state.setSim,
      // leaving it un-simulated: its x/y would stay at its previous-mode
      // position while fx/fy (set by a drag) are ignored by pillTarget,
      // causing the pill to snap back on the next tick after a drag ends.
      const initialBridges = connectedBridges(state);
      if (initialBridges.length > 0) {
        initialBridges.forEach(n => {
          if (n.x === undefined) {
            const c = state.setLayout.csNodes[n.connected[0]];
            n.x = c.x + (Math.random() - 0.5) * 40;
            n.y = c.y + (Math.random() - 0.5) * 40;
          }
        });
        state.setSim.nodes([...state.setLayout.csNodes, ...initialBridges]);
        state.setSim.force("link").links(buildSimLinks(puzzle, state.setLayout.csNodes, initialBridges));
      }
    }

    // A stable object per cluster to hand showTermInfo/focusTermInfo (see
    // the hover handlers below) -- state.paint here is buildSetGraph
    // itself (a full rebuild, unlike Star mode's lightweight re-classer),
    // so the `{c, ci}` datum bound to each cluster's <g> is a *new*
    // object every repaint. Using that directly as the focus-lock
    // identity (see focusedInfoNode in game.js) would silently break the
    // lock the moment a repaint happens while a cluster's info panel is
    // focus-locked open. Cached on state and reused instead, the same
    // pattern setLayout itself already uses to persist across repeats.
    if (!state.clusterInfoNodes) {
      state.clusterInfoNodes = puzzle.clusters.map(c => ({ word: c.name, info: null }));
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
        const { x, y } = keepClusterOutside(e.x, e.y, d.ci);
        const node = state.setLayout.csNodes[d.ci];
        node.fx = x; node.fy = y;
      })
      .on("end", function (e, d) {
        d3.select(this).classed("dragging", false); svg.classed("dragging", false);
        if (!e.active) state.setSim.alphaTarget(0);
        // fx/fy deliberately left set -- once a player places a cluster
        // by hand, it stays there permanently (the same "sticky"
        // placement convention this mode has always had for drags),
        // rather than releasing it back to the simulation the way
        // Graph mode's own drag does for individual terms.
        state.onPlayerLayoutChanged?.("player");
      });

    clusterLayer.selectAll("g.set-cluster")
      .data(puzzle.clusters.map((c, ci) => ({ c, ci })), d => d.ci)
      .join(enter => {
        const g = enter.append("g").attr("class", "set-cluster")
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", d => `${d.c.name} cluster`)
          .call(clusterDrag);
        g.append("circle").attr("class", d => `set-circle c-${d.c.color}`).attr("r", d => clusterBoxes[d.ci].r);
        g.append("text").attr("class", "set-heading");
        // Same rule as a term's own info-dot (pillLayer, above): only a
        // real authored blurb earns one, not just the link every cluster
        // gets automatically -- a dot promising more than "the name you
        // can already see, plus a link" is worse than no dot at all. Set
        // once here rather than re-tested every reposition, since (like a
        // term's) this never changes after puzzle load -- unlike its
        // position below, which tracks the heading every tick.
        g.filter(d => clusterInfoOf(d.ci).text).append("circle").attr("class", "info-dot").attr("r", 3);
        // Hover/focus only -- no click/keydown handler, unlike Star
        // mode's title: Circle mode's connect mechanic has always gone
        // through pills, never the circle itself, and this is purely
        // about surfacing the cluster's fact once earned, not adding a
        // second way to connect. mouseenter/mouseleave alone already
        // covers the mouse "read, then click a link in the panel" trip
        // (via #term-info's own mouseenter/mouseleave, see game.js) even
        // if the drag behavior's pointerdown handling suppresses a
        // genuine click-to-focus here; focus/blur exist so keyboard
        // Tab-navigation (unaffected by that, since it's not pointer-
        // based) can reach the same panel.
        const infoNode = ci => { const n = state.clusterInfoNodes[ci]; n.info = clusterInfoOf(ci); return n; };
        g.on("mouseenter", (e, d) => { if (!getFocusedInfoNode()) showTermInfo(infoNode(d.ci)); });
        g.on("mouseleave", () => { if (!getFocusedInfoNode()) clearTermInfo(); });
        g.on("focus", (e, d) => focusTermInfo(infoNode(d.ci)));
        g.on("blur", (e, d) => blurTermInfo(state.clusterInfoNodes[d.ci]));
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
        } else {
          state.onPlayerLayoutChanged?.("player");
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
        g.append("rect").attr("class", "pill-shape")
          .attr("rx", 15).attr("height", 30).attr("width", n => n.w).attr("x", n => -n.w / 2).attr("y", -15);
        // A bridge's second, pointed-ends shape -- see the matching
        // comment in graphRenderer.js.
        g.filter(n => isBridge(n)).append("polygon").attr("class", "bridge-shape")
          .attr("points", n => bridgePoints(n.w));
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
        const names = idealBridgeNames(n, puzzle, state.shownClusters, nodes);
        d3.select(this).attr("class", pillClass(n, names.length ? "ideal-target" : ""));
        d3.select(this).select(".ideal-tag").text(names.length ? names.join(", ") : "");
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
        const headingEl = g.select("text.set-heading")
          .attr("x", h.x - p.x).attr("y", h.y - p.y + 4)
          .attr("text-anchor", h.anchor)
          .text(d.c.name);
        // Whether the dot exists at all was already decided once, at
        // creation (see the enter block above) -- this just tracks its
        // position, which genuinely does change every tick as the
        // heading moves. Anchored off the heading's *actual* rendered
        // right edge (getBBox, only paid for the rare cluster that has a
        // dot at all) rather than h.halfW's estimated width -- that
        // estimate is deliberately biased to never undershoot (see
        // headingWidth above), so real slack against it varies by name in
        // a way that isn't worth re-deriving here a second time when the
        // real number is one query away.
        const dot = g.select(".info-dot");
        if (!dot.empty()) {
          const bbox = headingEl.node().getBBox();
          dot.attr("cx", bbox.x + bbox.width + 8).attr("cy", h.y - p.y - 8);
        }
      });
      lineLayer.selectAll("g.bridge-lines").each(function (b) { renderBridgeLines(d3.select(this), b); });
      pillLayer.selectAll("g.node").each(function (n) {
        if (d3.select(this).classed("dragging")) return;
        const p = pillTarget(n);
        d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
      });
    }

    function captureCircleLayout() {
      const circles = {};
      state.setLayout.csNodes.forEach(node => {
        circles[`cluster:${node.id}`] = {
          x: Math.round(node.x * 100) / 100,
          y: Math.round(node.y * 100) / 100,
          pinned: node.fx != null
        };
      });
      const bridges = {};
      connectedBridges(state).forEach(node => {
        bridges[`term:${node.word}`] = {
          x: Math.round(node.x * 100) / 100,
          y: Math.round(node.y * 100) / 100,
          pinned: node.fx != null
        };
      });
      return {
        schemaVersion: 1,
        puzzleId: puzzle.id,
        puzzleRevision: starLayoutRevision(puzzle),
        board: { width: getW(), height: getH() },
        stripHeight: state.setLayout.stripHeight,
        circles,
        bridges,
        solutionLayout: state.solutionLayout === "pretty" ? "pretty" : null
      };
    }

    function validateCircleLayout(layout) {
      const errors = [];
      if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
        return { valid: false, errors: ["Circle layout must be an object"] };
      }
      if (layout.schemaVersion !== 1) errors.push("Circle layout schemaVersion must be 1");
      if (layout.puzzleId !== puzzle.id) errors.push(`Circle layout puzzleId must be "${puzzle.id}"`);
      if (layout.puzzleRevision !== starLayoutRevision(puzzle)) errors.push("Circle layout puzzle revision is stale");
      if (layout.board?.width !== getW() || layout.board?.height !== getH()) {
        errors.push("Circle layout board size does not match");
      }
      const validPoint = (point, key) => {
        if (!point || !Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.y))) {
          errors.push(`${key} must have finite x/y coordinates`);
          return;
        }
        if (point.x < 0 || point.x > getW() || point.y < 0 || point.y > getH()) {
          errors.push(`${key} lies outside the board`);
        }
      };
      state.setLayout.csNodes.forEach(node => {
        validPoint(layout.circles?.[`cluster:${node.id}`], `cluster:${node.id}`);
      });
      connectedBridges(state).forEach(node => {
        validPoint(layout.bridges?.[`term:${node.word}`], `term:${node.word}`);
      });
      return { valid: errors.length === 0, errors };
    }

    function applyCircleLayout(layout) {
      const validation = validateCircleLayout(layout);
      if (!validation.valid) return validation;
      state.setSim.stop();
      state.setLayout.stripHeight = Number(layout.stripHeight) || STRIP_MARGIN;
      state.setLayout.csNodes.forEach(node => {
        const point = layout.circles[`cluster:${node.id}`];
        node.x = Number(point.x);
        node.y = Number(point.y);
        node.fx = point.pinned ? node.x : null;
        node.fy = point.pinned ? node.y : null;
        node.vx = 0;
        node.vy = 0;
      });
      connectedBridges(state).forEach(node => {
        const point = layout.bridges[`term:${node.word}`];
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
      repositionAll();
      updateSolutionHint();
      return { valid: true, errors: [] };
    }

    function prettyPrintCircleLayout() {
      if (state.made !== state.need) return Promise.resolve({ cancelled: true });
      if (state.solutionLayout === "polishing") return state.prettyPrintPromise;
      const run = async () => {
        state.solutionLayout = "polishing";
        updateSolutionHint();
        state.setSim.stop();
        setMessage("Solution shown — arranging circles and bridge corridors…", "good");
        const candidate = computePrettyCircleLayout();
        if (!candidate || getState() !== state) return { cancelled: true };
        const circleStarts = new Map(state.setLayout.csNodes.map(node => [
          node.id, { x: node.x, y: node.y }
        ]));
        const bridgeStarts = new Map(connectedBridges(state).map(node => [
          node.word, { x: node.x, y: node.y }
        ]));
        const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 750;
        const started = performance.now();
        svg.classed("circle-polishing", true);
        await new Promise(resolve => {
          const frame = now => {
            if (getState() !== state) {
              resolve();
              return;
            }
            const raw = Math.min(1, (now - started) / duration);
            const progress = raw < 0.5
              ? 4 * raw * raw * raw
              : 1 - Math.pow(-2 * raw + 2, 3) / 2;
            state.setLayout.csNodes.forEach(node => {
              const start = circleStarts.get(node.id);
              const target = candidate.circles[node.id];
              node.x = start.x + (target.x - start.x) * progress;
              node.y = start.y + (target.y - start.y) * progress;
              node.vx = 0;
              node.vy = 0;
            });
            connectedBridges(state).forEach(node => {
              const start = bridgeStarts.get(node.word);
              const target = candidate.bridges.get(node.word);
              if (!target) return;
              node.x = start.x + (target.x - start.x) * progress;
              node.y = start.y + (target.y - start.y) * progress;
              node.vx = 0;
              node.vy = 0;
            });
            repositionAll();
            if (raw < 1) requestAnimationFrame(frame);
            else resolve();
          };
          requestAnimationFrame(frame);
        });
        svg.classed("circle-polishing", false);
        if (getState() !== state) return { cancelled: true };
        // showSolution() performs one final onLinkAdded() after the last
        // simulated tap. That can briefly restart the live simulation while
        // this animation is in flight, so stop it again and write the exact
        // winning coordinates as the final authority.
        state.setSim.stop();
        state.setLayout.csNodes.forEach(node => {
          const target = candidate.circles[node.id];
          node.x = target.x;
          node.y = target.y;
          node.vx = 0;
          node.vy = 0;
        });
        connectedBridges(state).forEach(node => {
          const target = candidate.bridges.get(node.word);
          if (!target) return;
          node.x = target.x;
          node.y = target.y;
          node.vx = 0;
          node.vy = 0;
        });
        state.setLayout.stripHeight = STRIP_MARGIN;
        repositionAll();
        state.circleLayoutStats = {
          ...candidate.metrics,
          order: candidate.order,
          rotation: candidate.rotation
        };
        state.solutionLayout = "pretty";
        updateSolutionHint();
        setMessage(
          candidate.metrics.hardOverlaps === 0 &&
            candidate.metrics.lineCrossings === 0 &&
            candidate.metrics.lineHeadingIntersections === 0
            ? "Solution shown — Circle layout polished."
            : "Solution shown — Circle layout improved within the available space.",
          "good"
        );
        state.onPlayerLayoutChanged?.("automatic");
        return state.circleLayoutStats;
      };
      state.prettyPrintPromise = run();
      return state.prettyPrintPromise;
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
    state.onPuzzleSolved = () => {
      reclaimStripOnSolve();
      if (!state.completedViaShowSolution) state.onPlayerLayoutChanged?.("player");
    };
    state.detangle = prettyPrintCircleLayout;
    state.prettyPrint = prettyPrintCircleLayout;
    state.layoutAdapter = {
      mode: "sets",
      capture: captureCircleLayout,
      apply: applyCircleLayout,
      autoLayout: prettyPrintCircleLayout
    };

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
