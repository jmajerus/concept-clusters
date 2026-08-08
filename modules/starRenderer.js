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
import { pillWidth, bridgePoints, computeClusterOrder } from "./puzzleGraph.js";
import { normalizeInfo } from "./termInfo.js";
import { idealBridgeNames } from "./idealTarget.js";
import { repositoryStarLayoutFor, starFreeStripEnabled } from "./starLayoutRepository.js";
import {
  centeredRect,
  rectsOverlap,
  segmentFromPoints,
  segmentIntersectionPoint,
  segmentRectIntersectionPoint,
  visibleSegmentLengthOutsidePills
} from "./geometry.js";
import {
  afterNextPaint,
  animatePositionTargets,
  easeInOutCubic,
  layoutTransitionDuration
} from "./layoutTransition.js";
import {
  lensAssignmentBadge,
  lensNodeAriaLabel,
  lensPhaseActive,
  withLensClass
} from "./lensEngine.js";
import {
  createStarLayoutDocument,
  createStarPlayerLayoutDocument,
  starLayoutTargetMap,
  validateStarLayoutDocument,
  validateStarPlayerLayoutDocument
} from "./starLayoutSchema.js";
import {
  bridgeArmArrows,
  bridgeArrowPoints,
  bridgeNodeAriaLabel
} from "./bridgeDirection.js";
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
    const directionLayer = svg.append("g").attr("class", "bridge-directions");
    const titleLayer = svg.append("g");
    const nodeLayer = svg.append("g");

    // Titles home to an inner ring. Default cold start is the classic force
    // board (free terms in the live sim) — most puzzles open fine that way.
    // A sparse admin-locked boolean opts a cluttered puzzle into Circle-style
    // free-term strip packing instead (single flag, not a curated initial
    // layout). CCW title-past-neighbor pretty/detangle moves stay below
    // either way.
    //
    // Parked for later (branch wip/star-dense-strip-and-detangle): per-tick
    // AABB resolve, dense Show Solution batch placement, heavier multi-phase
    // detangle. Curated *final* layouts remain the escape hatch for residual
    // through-pills after Show Solution.
    //
    // What holds a *connected* node near its cluster is buildClusterLinks,
    // not the ring. titleHomeX/Y restrain empty titles against charge from
    // live play pieces (0.3 held across puzzles tried; weaker than
    // clusterPull 0.6 so titles still migrate toward members).
    const nClusters = puzzle.clusters.length;
    // Component identity is semantic layout information only for genuinely
    // disconnected cluster graphs. A title connected indirectly through a
    // different bridge is not an isolated component and must not perturb the
    // established pretty-print ordering of fully connected puzzles.
    const componentParents = Array.from({ length: nClusters }, (_, ci) => ci);
    const findComponent = ci => componentParents[ci] === ci
      ? ci
      : (componentParents[ci] = findComponent(componentParents[ci]));
    const unionComponents = (left, right) => {
      const a = findComponent(left), b = findComponent(right);
      if (a !== b) componentParents[a] = b;
    };
    puzzle.bridges.forEach(bridge => {
      bridge.clusters.slice(1).forEach(ci => unionComponents(bridge.clusters[0], ci));
    });

    const useFreeStrip = starFreeStripEnabled(puzzle);
    const boardCx = W / 2;
    const PILL_H = 30;
    const FREE_GAP = 10;
    const STRIP_MARGIN = 12;
    const wordHash = word => {
      let h = 0;
      for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) | 0;
      return h;
    };
    const clampPoint = (node, point, minY = 22) => ({
      x: Math.max(node.w / 2 + 6, Math.min(W - node.w / 2 - 6, point.x)),
      y: Math.max(minY, Math.min(H - 22, point.y))
    });

    let liveStripHeight = STRIP_MARGIN;
    let freeStripActive = false;
    if (useFreeStrip) {
      const freeNodes = nodes
        .filter(node => !node.connected.length)
        .sort((a, b) => wordHash(a.word) - wordHash(b.word) || a.word.localeCompare(b.word));
      freeStripActive = freeNodes.length > 0;
      const freeInnerWidth = W - STRIP_MARGIN * 2;
      let freeRowX = 0;
      let freeRowY = STRIP_MARGIN + PILL_H / 2;
      freeNodes.forEach(node => {
        if (freeRowX > 0 && freeRowX + node.w > freeInnerWidth) {
          freeRowX = 0;
          freeRowY += PILL_H + FREE_GAP;
        }
        node.x = STRIP_MARGIN + freeRowX + node.w / 2;
        node.y = freeRowY;
        node.vx = 0;
        node.vy = 0;
        freeRowX += node.w + FREE_GAP;
      });
      liveStripHeight = freeNodes.length
        ? freeRowY + PILL_H / 2 + STRIP_MARGIN
        : STRIP_MARGIN;
    }

    const playHeight = Math.max(160, H - liveStripHeight);
    const boardMidY = useFreeStrip
      ? liveStripHeight + playHeight / 2
      : H / 2;
    const ringR = Math.min(W, useFreeStrip ? playHeight : H) * 0.33;
    const ring = Array.from({ length: nClusters }, (_, i) => {
      const angle = (i / nClusters) * 2 * Math.PI - Math.PI / 2;
      return [boardCx + ringR * Math.cos(angle), boardMidY + ringR * Math.sin(angle)];
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
    const allLayoutNodes = [...nodes, ...titleNodes];
    const displayedLinkTarget = link =>
      link.ideal ? link.target : titleNodes[link.target.gs[0]];

    // Seeds (and any other already-connected terms) sit beside their title
    // so clusterPull starts from a sensible spot — especially important
    // when the free strip owns the top of the board.
    const seedsByCluster = new Map();
    nodes.forEach(node => {
      if (!node.connected.length) return;
      const ci = node.connected[0];
      if (!seedsByCluster.has(ci)) seedsByCluster.set(ci, []);
      seedsByCluster.get(ci).push(node);
    });
    seedsByCluster.forEach((seeds, ci) => {
      const title = titleNodes[ci];
      const towardPlay = Math.atan2(boardMidY - title.y, boardCx - title.x);
      seeds
        .sort((a, b) => wordHash(a.word) - wordHash(b.word) || a.word.localeCompare(b.word))
        .forEach((node, index) => {
          const flank = seeds.length === 1 ? 0 : (index % 2 === 0 ? -1 : 1);
          const tier = Math.floor(index / 2);
          const angle = towardPlay + flank * (0.7 + tier * 0.35);
          const minY = useFreeStrip ? liveStripHeight + 16 : 22;
          const point = clampPoint(node, {
            x: title.x + Math.cos(angle) * (88 + tier * 26),
            y: title.y + Math.sin(angle) * (88 + tier * 26)
          }, minY);
          node.x = point.x;
          node.y = point.y;
          node.vx = 0;
          node.vy = 0;
        });
    });

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
    // Strip mode keeps free terms out of the simulation (Circle does the
    // same). Classic mode includes everyone so charge can settle the pile.
    const liveSimNodes = () => useFreeStrip
      ? [...titleNodes, ...nodes.filter(node => node.connected.length > 0)]
      : [...nodes, ...titleNodes];

    const sim = d3.forceSimulation(liveSimNodes())
      .force("clusterPull", d3.forceLink(buildClusterLinks()).distance(70).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-240))
      .force("collide", d3.forceCollide().radius(d => d.w / 2 + 14))
      .force("titleHomeX", d3.forceX(d => d.isTitleNode ? ring[d.ci][0] : d.x).strength(d => d.isTitleNode ? 0.3 : 0))
      .force("titleHomeY", d3.forceY(d => d.isTitleNode ? ring[d.ci][1] : d.y).strength(d => d.isTitleNode ? 0.3 : 0));
    setSim(sim);

    state.getStarFreeStripReport = () => ({
      useFreeStrip,
      freeStripActive,
      freeCount: nodes.filter(node => !node.connected.length).length,
      stripHeight: liveStripHeight
    });

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
      if (useFreeStrip) {
        liveStripHeight = STRIP_MARGIN;
        freeStripActive = false;
      }
      sim.nodes(liveSimNodes());
      sim.force("clusterPull").links(buildClusterLinks());
      if (!state.completedViaShowSolution) {
        state.onPlayerLayoutChanged?.("player");
      }
      sim.alpha(0.45).restart();
    };

    // handleTap calls this right after pushing a new link — this mode needs
    // to redraw the line, hand the freshly-grown cluster-link set to the
    // force simulation, and nudge it awake again.
    state.onLinkAdded = () => {
      state.drawLinks();
      if (useFreeStrip) {
        // Lift newly connected terms out of the free strip beside their title.
        nodes.forEach(node => {
          if (!node.connected.length) return;
          if (node.y > liveStripHeight + 8) return;
          const ci = node.connected[0];
          const title = titleNodes[ci];
          const towardPlay = Math.atan2(boardMidY - title.y, boardCx - title.x);
          const alreadyPlaced = nodes.filter(other =>
            other !== node &&
            other.connected.includes(ci) &&
            other.y > liveStripHeight + 8
          ).length;
          const fanIndex = alreadyPlaced + (node.gs.length > 1 ? 3 : 0);
          const flank = fanIndex % 2 === 0 ? -1 : 1;
          const tier = Math.floor(fanIndex / 2);
          const angle = towardPlay + flank * (0.55 + tier * 0.35);
          const point = clampPoint(node, {
            x: title.x + Math.cos(angle) * (82 + tier * 28),
            y: title.y + Math.sin(angle) * (82 + tier * 28)
          }, liveStripHeight + 16);
          node.x = point.x;
          node.y = point.y;
          node.vx = 0;
          node.vy = 0;
        });
        freeStripActive = nodes.some(node => !node.connected.length);
      }
      sim.nodes(liveSimNodes());
      sim.force("clusterPull").links(buildClusterLinks());
      sim.alpha(0.6).restart();
    };

    // Show Solution starts the same complete force-directed board a human
    // would see. The detangler waits for that board to settle, freezes it,
    // and then performs a short series of literal endpoint drags. A move
    // is allowed on screen only after a private geometry check proves it
    // improves the lexicographic layout (segment crossings first, then
    // lines through unrelated pills), or proves it is the bounded setup
    // for a complete improving continuation. This is deliberately stricter
    // than a general "pretty print": an already untangled board makes zero
    // moves, and no cosmetic follow-up drag runs after reaching zero.
    state.detangle = () => {
      state.solutionLayout = "animating";
      updateSolutionHint();
      const DRAG_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 520;
      const MAX_INITIAL_SETTLE_MS = 3200;
      const SETTLED_ALPHA = 0.035;
      const FINAL_RELAX_ALPHA = 0.03;
      const FINAL_SETTLED_ALPHA = 0.005;
      const MAX_FINAL_SETTLE_MS = 1600;
      const MAX_BRIDGE_LEG = Math.min(W, H) * 0.32;
      // bridgeArrowPoints already drops arrows when center distance < 12;
      // visible edge-to-edge clearance needs more than that so a player can
      // actually see the stroke and the arrow between two wide pills.
      const MIN_VISIBLE_BRIDGE_LEG = 36;
      const OUTWARD_FAN_RADIUS = Math.min(140, Math.min(W, H) * 0.23);
      const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
      const capturePositions = () => allLayoutNodes.map(node => ({
        node, x: node.x, y: node.y
      }));
      const restorePositions = snapshot => {
        snapshot.forEach(({ node, x, y }) => {
          node.x = x; node.y = y;
          node.fx = null; node.fy = null;
          node.vx = 0; node.vy = 0;
        });
        renderPositions();
      };
      const clampTarget = (node, point) => ({
        x: Math.max(node.w / 2 + 6, Math.min(W - node.w / 2 - 6, point.x)),
        y: Math.max(22, Math.min(H - 22, point.y))
      });

      // Keep purely local terms together on the outside of each cluster,
      // leaving the board-facing side open for bridge terms and their
      // ideal endpoints. This is a soft candidate preference, not a
      // second layout planner.
      const bridgeFacingTerms = puzzle.clusters.map(() => new Set());
      puzzle.bridges.forEach(bridge => bridge.clusters.forEach((ci, side) => {
        const word = bridge.idealTerms && bridge.idealTerms[side];
        if (word) bridgeFacingTerms[ci].add(word);
      }));
      const outwardSlots = new Map();
      puzzle.clusters.forEach((cluster, ci) => {
        if (bridgeFacingTerms[ci].size < 2) return;
        const members = cluster.terms
          .filter(word => !bridgeFacingTerms[ci].has(word))
          .map(word => nodes.find(node => node.word === word))
          .filter(Boolean);
        const step = Math.min(Math.PI / 4, Math.PI / (members.length + 1));
        members.forEach((node, i) => {
          outwardSlots.set(node, { ci, offset: (i - (members.length - 1) / 2) * step });
        });
      });
      const outwardTarget = node => {
        const slot = outwardSlots.get(node);
        if (!slot) return null;
        const hub = titleNodes[slot.ci];
        const angle = Math.atan2(hub.y - H / 2, hub.x - W / 2) + slot.offset;
        return clampTarget(node, {
          x: hub.x + OUTWARD_FAN_RADIUS * Math.cos(angle),
          y: hub.y + OUTWARD_FAN_RADIUS * Math.sin(angle)
        });
      };
      const displayedEdges = () => links.map(link => ({
        link,
        source: link.source,
        target: link.ideal ? link.target : titleNodes[link.target.gs[0]]
      }));

      const crossingDetails = () => {
        const edges = displayedEdges();
        const crossings = [];
        for (let i = 0; i < edges.length; i++) {
          for (let j = i + 1; j < edges.length; j++) {
            if (edges[i].source === edges[j].source ||
                edges[i].source === edges[j].target ||
                edges[i].target === edges[j].source ||
                edges[i].target === edges[j].target) continue;
            const point = segmentIntersectionPoint(
              segmentFromPoints(edges[i].source, edges[i].target),
              segmentFromPoints(edges[j].source, edges[j].target)
            );
            if (point) crossings.push({ edgeA: edges[i], edgeB: edges[j], point });
          }
        }
        return crossings;
      };

      const edgeNodeIntersectionDetails = () => {
        const intersections = [];
        displayedEdges().forEach(edge => {
          allLayoutNodes.forEach(node => {
            if (node === edge.source || node === edge.target) return;

            const point = segmentRectIntersectionPoint(
              segmentFromPoints(edge.source, edge.target),
              centeredRect(node, node.w, 30),
              4
            );
            if (point) {
              intersections.push({
                edge,
                node,
                point
              });
            }
          });
        });
        return intersections;
      };

      const overlappingPairs = () => {
        const pairs = [];
        for (let i = 0; i < allLayoutNodes.length; i++) {
          for (let j = i + 1; j < allLayoutNodes.length; j++) {
            const a = allLayoutNodes[i], b = allLayoutNodes[j];
            // Pills are wide rectangles, not circles. The force simulation
            // intentionally gives them a generous circular comfort zone,
            // but using that same circle as a hard search rejection rules
            // out many perfectly legible human drags (especially one pill
            // passing above another long pill).
            if (rectsOverlap(
              centeredRect(a, a.w, 30, 4),
              centeredRect(b, b.w, 30, 4)
            )) pairs.push({ a, b });
          }
        }
        return pairs;
      };

      // A bridge positioned beside a title from a different connected
      // component can read as a relationship even when no line joins them.
      // The isolated component must remain visibly isolated, not merely absent
      // from the bridge's edge list. Titles in the bridge's wider component
      // are deliberately excluded: applying this direct-bridge test to a
      // fully connected puzzle changed otherwise good established layouts.
      const BRIDGE_UNRELATED_TITLE_CLEARANCE = 24;
      const bridgeUnrelatedTitleIntrusions = () => puzzle.bridges.reduce(
        (count, bridge) => {
          const bridgeNode = nodes.find(node => node.word === bridge.term);
          if (!bridgeNode) return count;
          const connectedDistances = bridge.clusters.map(ci =>
            Math.hypot(
              bridgeNode.x - titleNodes[ci].x,
              bridgeNode.y - titleNodes[ci].y
            )
          );
          const farthestConnected = Math.max(...connectedDistances);
          const bridgeComponent = findComponent(bridge.clusters[0]);
          return count + titleNodes.filter(title =>
            findComponent(title.ci) !== bridgeComponent &&
            Math.hypot(
              bridgeNode.x - title.x,
              bridgeNode.y - title.y
            ) < farthestConnected + BRIDGE_UNRELATED_TITLE_CLEARANCE
          ).length;
        },
        0
      );

      const evaluateLayout = () => {
        const crossings = crossingDetails();
        const edgeNodeIntersections = edgeNodeIntersectionDetails();
        const edges = displayedEdges();
        const bridgeEdges = edges.filter(edge => edge.link.bridge);
        const shortVisibleBridgeLegs = bridgeEdges
          .map(edge => ({
            edge,
            source: edge.source,
            target: edge.target,
            visible: visibleSegmentLengthOutsidePills(edge.source, edge.target)
          }))
          .filter(leg => leg.visible < MIN_VISIBLE_BRIDGE_LEG);
        const overlaps = overlappingPairs();
        return {
          crossings,
          crossingCount: crossings.length,
          edgeNodeIntersections,
          edgeNodeIntersectionCount: edgeNodeIntersections.length,
          edgeTitleIntersectionCount: edgeNodeIntersections
            .filter(intersection => intersection.node.isTitleNode).length,
          visualIntersectionCount: crossings.length + edgeNodeIntersections.length,
          bridgeCrossings: crossings.filter(c => c.edgeA.link.bridge || c.edgeB.link.bridge).length,
          overlappingPairs: overlaps,
          overlaps: overlaps.length,
          bridgeUnrelatedTitleIntrusions: bridgeUnrelatedTitleIntrusions(),
          shortVisibleBridgeLegs,
          shortVisibleBridgeLegCount: shortVisibleBridgeLegs.length,
          minVisibleBridgeLeg: bridgeEdges.length
            ? Math.min(...bridgeEdges.map(edge =>
              visibleSegmentLengthOutsidePills(edge.source, edge.target)))
            : Infinity,
          maxBridgeLeg: bridgeEdges.length
            ? Math.max(...bridgeEdges.map(edge =>
              Math.hypot(edge.source.x - edge.target.x, edge.source.y - edge.target.y)))
            : 0,
          totalEdgeLength: edges.reduce((sum, edge) =>
            sum + Math.hypot(edge.source.x - edge.target.x, edge.source.y - edge.target.y), 0)
        };
      };
      const compareIntersectionLayouts = (a, b) =>
        a.crossingCount - b.crossingCount ||
        a.edgeNodeIntersectionCount - b.edgeNodeIntersectionCount;
      const compareLayouts = (a, b) =>
        compareIntersectionLayouts(a, b) ||
        a.overlaps - b.overlaps ||
        a.shortVisibleBridgeLegCount - b.shortVisibleBridgeLegCount;
      // Which detangle phase is active controls what counts as progress, so a
      // residual through-pill contact cannot block later overlap/short cleanup.
      let activePhase = "crossings";
      const improvesLayout = (after, before) => {
        if (activePhase === "crossings") {
          return after.crossingCount < before.crossingCount;
        }
        if (activePhase === "edges") {
          return after.crossingCount === 0 &&
            compareIntersectionLayouts(after, before) < 0;
        }
        if (activePhase === "overlaps") {
          return after.crossingCount === 0 &&
            after.edgeNodeIntersectionCount <= before.edgeNodeIntersectionCount &&
            after.overlaps < before.overlaps;
        }
        if (activePhase === "short") {
          return after.crossingCount === 0 &&
            after.overlaps <= before.overlaps &&
            after.shortVisibleBridgeLegCount < before.shortVisibleBridgeLegCount;
        }
      };

      const reflectAcrossLine = (node, edge) => {
        const a = edge.source, b = edge.target;
        const dx = b.x - a.x, dy = b.y - a.y;
        const length2 = dx * dx + dy * dy || 1;
        const t = ((node.x - a.x) * dx + (node.y - a.y) * dy) / length2;
        const projection = { x: a.x + t * dx, y: a.y + t * dy };
        return { x: 2 * projection.x - node.x, y: 2 * projection.y - node.y };
      };

      const localCandidates = (node, layout) => {
        const out = [];
        const add = point => { if (point) out.push(clampTarget(node, point)); };
        const addAround = (center, firstRadius) => {
          [firstRadius, firstRadius + 35].forEach(radius => {
            for (let i = 0; i < 12; i++) {
              const angle = i * Math.PI / 6;
              add({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
            }
          });
        };
        layout.crossings.forEach(crossing => {
          const ownsA = crossing.edgeA.source === node || crossing.edgeA.target === node;
          const ownsB = crossing.edgeB.source === node || crossing.edgeB.target === node;
          if (!ownsA && !ownsB) return;
          const ownEdge = ownsA ? crossing.edgeA : crossing.edgeB;
          const opposing = ownsA ? crossing.edgeB : crossing.edgeA;
          const reflected = reflectAcrossLine(node, opposing);
          add(reflected);
          const dx = opposing.target.x - opposing.source.x;
          const dy = opposing.target.y - opposing.source.y;
          const length = Math.hypot(dx, dy) || 1;
          const nx = -dy / length, ny = dx / length;
          [45, 75, 110].forEach(clearance => {
            add({ x: crossing.point.x + nx * clearance, y: crossing.point.y + ny * clearance });
            add({ x: crossing.point.x - nx * clearance, y: crossing.point.y - ny * clearance });
          });
          // A particularly common human move is to shorten the crossed
          // edge: place its loose endpoint beside its own mate. Sampling a
          // small ring there closes local minima that reflection alone
          // cannot, while the overlap check still keeps the pills apart.
          const mate = ownEdge.source === node ? ownEdge.target : ownEdge.source;
          const mateRadius = node.w / 2 + mate.w / 2 + 24;
          addAround(mate, mateRadius);
        });

        layout.edgeNodeIntersections.forEach(problem => {
          const { edge, node: obstacle, point } = problem;
          const ownsEdge = edge.source === node || edge.target === node;
          if (!ownsEdge && obstacle !== node) return;
          const dx = edge.target.x - edge.source.x;
          const dy = edge.target.y - edge.source.y;
          const length = Math.hypot(dx, dy) || 1;
          const nx = -dy / length, ny = dx / length;

          if (obstacle === node) {
            add(reflectAcrossLine(node, edge));
            [45, 75, 110].forEach(clearance => {
              add({ x: point.x + nx * clearance, y: point.y + ny * clearance });
              add({ x: point.x - nx * clearance, y: point.y - ny * clearance });
            });
          } else {
            addAround(obstacle, node.w / 2 + obstacle.w / 2 + 24);
            const mate = edge.source === node ? edge.target : edge.source;
            addAround(mate, node.w / 2 + mate.w / 2 + 24);
          }
        });

        // Pill overlaps and short ideal arms are phase-gated via activePhase.
        if (activePhase === "overlaps" || activePhase === "short") {
          if (activePhase === "overlaps") {
            layout.overlappingPairs.forEach(pair => {
              if (pair.a !== node && pair.b !== node) return;
              const other = pair.a === node ? pair.b : pair.a;
              const dx = node.x - other.x, dy = node.y - other.y;
              const length = Math.hypot(dx, dy) || 1;
              const ux = dx / length, uy = dy / length;
              const need = node.w / 2 + other.w / 2 + 36;
              [need, need + 40, need + 80].forEach(radius => {
                add({ x: other.x + ux * radius, y: other.y + uy * radius });
              });
              addAround(other, need);
            });
          } else {
            layout.shortVisibleBridgeLegs.forEach(leg => {
              if (leg.source !== node && leg.target !== node) return;
              const mate = leg.source === node ? leg.target : leg.source;
              const dx = node.x - mate.x, dy = node.y - mate.y;
              const length = Math.hypot(dx, dy) || 1;
              const ux = dx / length, uy = dy / length;
              // Visible gap grows 1:1 with center distance along this ray.
              const targetLength = length + Math.max(0, MIN_VISIBLE_BRIDGE_LEG - leg.visible);
              [targetLength + 8, targetLength + 36, targetLength + 72, targetLength + 110].forEach(radius => {
                add({ x: mate.x + ux * radius, y: mate.y + uy * radius });
              });
              const nx = -uy, ny = ux;
              [40, 70, 100].forEach(side => {
                add({
                  x: mate.x + ux * (targetLength + 36) + nx * side,
                  y: mate.y + uy * (targetLength + 36) + ny * side
                });
                add({
                  x: mate.x + ux * (targetLength + 36) - nx * side,
                  y: mate.y + uy * (targetLength + 36) - ny * side
                });
              });
            });
          }
        }

        if (!node.isTitleNode && node.gs.length === 1) {
          const hub = titleNodes[node.gs[0]];
          const radius = Math.max(65, Math.min(145, Math.hypot(node.x - hub.x, node.y - hub.y)));
          const current = Math.atan2(node.y - hub.y, node.x - hub.x);
          [70, radius, 110, 140].forEach(r => {
            for (let i = 0; i < 12; i++) {
              const angle = current + i * Math.PI / 6;
              add({ x: hub.x + r * Math.cos(angle), y: hub.y + r * Math.sin(angle) });
            }
          });
        } else {
          const center = node.isTitleNode
            ? { x: node.x, y: node.y }
            : {
                x: node.gs.reduce((sum, ci) => sum + titleNodes[ci].x, 0) / node.gs.length,
                y: node.gs.reduce((sum, ci) => sum + titleNodes[ci].y, 0) / node.gs.length
              };
          [0, 35, 70, 110].forEach(radius => {
            const steps = radius ? 12 : 1;
            for (let i = 0; i < steps; i++) {
              const angle = i * 2 * Math.PI / steps;
              add({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
            }
          });
        }

        // Stuck crossings often clear when a whole cluster title slides
        // counterclockwise just past its nearest angular neighbor on the
        // ring — the human move that equal-slot jitter only approximates.
        if (node.isTitleNode && layout.crossingCount > 0 && titleNodes.length > 1) {
          const myAngle = Math.atan2(node.y - boardMidY, node.x - boardCx);
          const myRadius = Math.hypot(node.x - boardCx, node.y - boardMidY) || ringR;
          let nearestCcwDelta = Infinity;
          let nearestCcwAngle = null;
          titleNodes.forEach(other => {
            if (other === node) return;
            const otherAngle = Math.atan2(other.y - boardMidY, other.x - boardCx);
            let delta = otherAngle - myAngle;
            while (delta <= 0) delta += 2 * Math.PI;
            while (delta >= 2 * Math.PI) delta -= 2 * Math.PI;
            if (delta < nearestCcwDelta) {
              nearestCcwDelta = delta;
              nearestCcwAngle = otherAngle;
            }
          });
          if (nearestCcwAngle != null) {
            [0.12, 0.28, 0.48].forEach(past => {
              const angle = nearestCcwAngle + past;
              add({
                x: boardCx + myRadius * Math.cos(angle),
                y: boardMidY + myRadius * Math.sin(angle)
              });
            });
          }
        }

        [55, 105, 165].forEach(radius => {
          for (let i = 0; i < 16; i++) {
            const angle = i * Math.PI / 8;
            add({ x: node.x + radius * Math.cos(angle), y: node.y + radius * Math.sin(angle) });
          }
        });

        const unique = new Map();
        out.forEach(point => {
          const key = `${Math.round(point.x / 3)},${Math.round(point.y / 3)}`;
          if (Math.hypot(point.x - node.x, point.y - node.y) >= 8) unique.set(key, point);
        });
        return [...unique.values()];
      };

      const broadCandidates = node => {
        const out = [];
        const xStep = 90, yStep = 75;
        for (let y = 45; y <= H - 45; y += yStep) {
          for (let x = 55; x <= W - 55; x += xStep) out.push(clampTarget(node, { x, y }));
        }
        return out;
      };

      const previewMove = (node, target, before, preparatory = false) => {
        const startX = node.x, startY = node.y;
        node.x = target.x; node.y = target.y;
        const after = evaluateLayout();
        node.x = startX; node.y = startY;
        // Later phases are selected by activePhase so residual through-pill
        // contacts cannot starve overlap/short cleanup, and crossing-only
        // progress cannot be burned on edge-only moves (Birth of the Drive).
        const comparison = activePhase === "crossings"
          ? after.crossingCount - before.crossingCount
          : activePhase === "edges"
            ? compareIntersectionLayouts(after, before)
            : activePhase === "overlaps"
              ? (after.overlaps - before.overlaps ||
                compareIntersectionLayouts(after, before))
              : compareLayouts(after, before);
        if (!preparatory && comparison >= 0) return null;
        if (preparatory && (
          comparison < 0 ||
          after.crossingCount > before.crossingCount + 1 ||
          after.visualIntersectionCount > before.visualIntersectionCount + 2
        )) return null;
        // Dense boards often have to slide through a temporary pill overlap
        // to untangle a crossing. Cap overlaps only once that is the phase
        // goal (or nearly so, for short-arm cleanup).
        if (activePhase === "overlaps" || activePhase === "short") {
          if (after.overlaps > before.overlaps + Number(preparatory)) return null;
        } else if (activePhase === "edges" &&
                   after.overlaps > before.overlaps + 2 + Number(preparatory)) {
          return null;
        }
        if (!preparatory &&
            activePhase === "short" &&
            after.shortVisibleBridgeLegCount > before.shortVisibleBridgeLegCount) {
          return null;
        }
        const bridgeAllowance = preparatory ? 1.25 : 1.1;
        if (after.maxBridgeLeg >
            Math.max(MAX_BRIDGE_LEG, before.maxBridgeLeg * bridgeAllowance)) return null;
        return {
          node, target, after,
          startX, startY,
          distance: Math.hypot(target.x - startX, target.y - startY),
          preparatory
        };
      };

      const compareMoves = (a, b) =>
        a.after.crossingCount - b.after.crossingCount ||
        a.after.edgeNodeIntersectionCount - b.after.edgeNodeIntersectionCount ||
        a.after.overlaps - b.after.overlaps ||
        a.after.shortVisibleBridgeLegCount - b.after.shortVisibleBridgeLegCount ||
        Number(a.node.isTitleNode) - Number(b.node.isTitleNode) ||
        a.after.bridgeCrossings - b.after.bridgeCrossings ||
        a.after.maxBridgeLeg - b.after.maxBridgeLeg ||
        -(a.after.minVisibleBridgeLeg - b.after.minVisibleBridgeLeg) ||
        a.distance - b.distance ||
        a.after.totalEdgeLength - b.after.totalEdgeLength;

      const problemNodes = before => {
        const burden = new Map();
        before.crossings.forEach(crossing => {
          [crossing.edgeA.source, crossing.edgeA.target,
            crossing.edgeB.source, crossing.edgeB.target].forEach(node => {
            burden.set(node, (burden.get(node) || 0) + 1);
          });
        });
        before.edgeNodeIntersections.forEach(problem => {
          [problem.edge.source, problem.edge.target, problem.node].forEach(node => {
            burden.set(node, (burden.get(node) || 0) + 1);
          });
        });
        // Phase-gated problem endpoints so each pass searches the defects it
        // is responsible for clearing.
        if (activePhase === "overlaps") {
          before.overlappingPairs.forEach(pair => {
            [pair.a, pair.b].forEach(node => {
              burden.set(node, (burden.get(node) || 0) + 2);
            });
          });
        } else if (activePhase === "short") {
          before.shortVisibleBridgeLegs.forEach(leg => {
            [leg.source, leg.target].forEach(node => {
              burden.set(node, (burden.get(node) || 0) + 2);
            });
          });
        }
        return [...burden].sort((a, b) => {
          const aPriority = a[0].isTitleNode ? 2 : a[0].gs.length > 1 ? 0 : 1;
          const bPriority = b[0].isTitleNode ? 2 : b[0].gs.length > 1 ? 0 : 1;
          return b[1] - a[1] || aPriority - bPriority;
        });
      };

      const rankedMoves = (before, broad = false, preparatory = false) => {
        const moves = [];
        problemNodes(before).forEach(([node]) => {
          const targets = broad
            ? [...localCandidates(node, before), ...broadCandidates(node)]
            : localCandidates(node, before);
          targets.forEach(target => {
            const move = previewMove(node, target, before, preparatory);
            if (move) moves.push(move);
          });
        });
        moves.sort(compareMoves);

        // Nearby samples often describe effectively the same human drag.
        // Keep just a few destinations per endpoint.
        const perNode = new Map();
        const perNodeLimit = preparatory ? 10 : 3;
        return moves.filter(move => {
          const count = perNode.get(move.node) || 0;
          if (count >= perNodeLimit) return false;
          perNode.set(move.node, count + 1);
          return true;
        }).slice(0, preparatory ? 60 : 18);
      };

      const bestImprovingMove = before => {
        const local = rankedMoves(before);
        return local[0] || rankedMoves(before, true)[0] || null;
      };

      const findSetupPair = before => {
        const firstMoves = rankedMoves(before, true, true);
        let best = null;

        firstMoves.forEach(first => {
          first.node.x = first.target.x;
          first.node.y = first.target.y;
          const second = bestImprovingMove(first.after);
          first.node.x = first.startX;
          first.node.y = first.startY;
          if (!second || !improvesLayout(second.after, before)) return;

          const candidate = [first, second];
          if (!best ||
              (activePhase === "crossings" || activePhase === "edges"
                ? compareIntersectionLayouts(second.after, best[1].after)
                : compareLayouts(second.after, best[1].after)) < 0 ||
              ((activePhase === "crossings" || activePhase === "edges"
                ? compareIntersectionLayouts(second.after, best[1].after)
                : compareLayouts(second.after, best[1].after)) === 0 &&
               first.distance + second.distance < best[0].distance + best[1].distance)) {
            best = candidate;
          }
        });
        return best || [];
      };

      const animateMove = (node, target) => new Promise(resolve => {
        const startX = node.x, startY = node.y;
        const startTime = performance.now();
        node.vx = 0; node.vy = 0;
        node.fx = startX; node.fy = startY;
        const step = now => {
          const raw = Math.min(1, (now - startTime) / DRAG_MS);
          const progress = easeInOutCubic(raw);
          node.x = node.fx = startX + (target.x - startX) * progress;
          node.y = node.fy = startY + (target.y - startY) * progress;
          renderPositions();
          if (raw < 1) requestAnimationFrame(step);
          else {
            node.fx = null; node.fy = null;
            resolve();
          }
        };
        requestAnimationFrame(step);
      });

      const buildPrettyTargets = (
        order,
        rotation,
        fixedTitles = null,
        angleOffsets = null
      ) => {
        const targets = new Map();
        const titleTargets = new Array(nClusters);
        const ringRadius = Math.min(W, H) * 0.33;
        (fixedTitles ? puzzle.clusters.map((_, ci) => ci) : order).forEach((ci, position) => {
          const angle = rotation +
            position * 2 * Math.PI / nClusters +
            (angleOffsets?.get(ci) || 0);
          titleTargets[ci] = fixedTitles
            ? fixedTitles[ci]
            : {
                x: W / 2 + ringRadius * Math.cos(angle),
                y: H / 2 + ringRadius * Math.sin(angle)
              };
          targets.set(titleNodes[ci], clampTarget(titleNodes[ci], titleTargets[ci]));
        });

        const bridgeTargets = new Map();
        puzzle.bridges.forEach(bridge => {
          const node = nodes.find(candidate => candidate.word === bridge.term);
          if (!node) return;
          const target = {
            x: bridge.clusters.reduce((sum, ci) => sum + titleTargets[ci].x, 0) / bridge.clusters.length,
            y: bridge.clusters.reduce((sum, ci) => sum + titleTargets[ci].y, 0) / bridge.clusters.length
          };
          bridgeTargets.set(bridge, target);
          targets.set(node, clampTarget(node, target));
        });

        const portDirections = puzzle.clusters.map(() => new Map());
        puzzle.bridges.forEach(bridge => bridge.clusters.forEach((ci, side) => {
          const word = bridge.idealTerms && bridge.idealTerms[side];
          if (!word) return;
          if (!portDirections[ci].has(word)) portDirections[ci].set(word, []);
          portDirections[ci].get(word).push(bridgeTargets.get(bridge));
        }));

        puzzle.clusters.forEach((cluster, ci) => {
          const hub = titleTargets[ci];
          portDirections[ci].forEach((destinations, word) => {
            const node = nodes.find(candidate => candidate.word === word);
            if (!node) return;
            const destination = {
              x: destinations.reduce((sum, point) => sum + point.x, 0) / destinations.length,
              y: destinations.reduce((sum, point) => sum + point.y, 0) / destinations.length
            };
            const angle = Math.atan2(destination.y - hub.y, destination.x - hub.x);
            targets.set(node, clampTarget(node, {
              x: hub.x + 115 * Math.cos(angle),
              y: hub.y + 115 * Math.sin(angle)
            }));
          });

          const ordinary = cluster.terms
            .filter(word => !portDirections[ci].has(word))
            .map(word => nodes.find(node => node.word === word))
            .filter(Boolean);
          const outward = Math.atan2(hub.y - H / 2, hub.x - W / 2);
          const step = Math.min(Math.PI / 4, Math.PI / (ordinary.length + 1));
          ordinary.forEach((node, i) => {
            const angle = outward + (i - (ordinary.length - 1) / 2) * step;
            targets.set(node, clampTarget(node, {
              x: hub.x + OUTWARD_FAN_RADIUS * Math.cos(angle),
              y: hub.y + OUTWARD_FAN_RADIUS * Math.sin(angle)
            }));
          });
        });
        return targets;
      };

      const comparePrettyLayouts = (a, b) =>
        a.layout.crossingCount - b.layout.crossingCount ||
        a.layout.edgeTitleIntersectionCount - b.layout.edgeTitleIntersectionCount ||
        a.layout.edgeNodeIntersectionCount - b.layout.edgeNodeIntersectionCount ||
        a.layout.overlaps - b.layout.overlaps ||
        a.layout.shortVisibleBridgeLegCount - b.layout.shortVisibleBridgeLegCount ||
        a.layout.bridgeUnrelatedTitleIntrusions - b.layout.bridgeUnrelatedTitleIntrusions ||
        a.layout.bridgeCrossings - b.layout.bridgeCrossings ||
        a.deviation - b.deviation ||
        a.layout.maxBridgeLeg - b.layout.maxBridgeLeg ||
        -(a.layout.minVisibleBridgeLeg - b.layout.minVisibleBridgeLeg) ||
        a.layout.totalEdgeLength - b.layout.totalEdgeLength;

      const animateLayout = targets => animatePositionTargets({
        targets,
        duration: layoutTransitionDuration(850),
        render: renderPositions,
        isCurrent: () => getState() === state && getSim() === sim
      });

      const layoutMetrics = layout => ({
        lineCrossings: layout.crossingCount,
        edgeNodeIntersections: layout.edgeNodeIntersectionCount,
        edgeTitleIntersections: layout.edgeTitleIntersectionCount,
        overlaps: layout.overlaps,
        overlappingPairs: layout.overlappingPairs.map(({ a, b }) =>
          `${a.word} / ${b.word}`
        ),
        bridgeUnrelatedTitleIntrusions: layout.bridgeUnrelatedTitleIntrusions,
        shortVisibleBridgeLegs: layout.shortVisibleBridgeLegCount,
        minVisibleBridgeLeg: Number.isFinite(layout.minVisibleBridgeLeg)
          ? layout.minVisibleBridgeLeg
          : null
      });
      const targetMapForLayout = layout => new Map(
        [...starLayoutTargetMap(layout, allLayoutNodes)]
          .map(([node, target]) => [node, clampTarget(node, target)])
      );

      // Authoring hooks stay renderer-owned because this closure is the one
      // place that knows about title nodes as well as terms. game.js only
      // coordinates the panel/storage; it never reconstructs Star geometry.
      state.getStarLayoutMetrics = () => layoutMetrics(evaluateLayout());
      state.captureStarLayout = () => createStarLayoutDocument({
        puzzle,
        width: W,
        height: H,
        layoutNodes: allLayoutNodes,
        metrics: state.getStarLayoutMetrics()
      });
      state.applyStarLayout = async layout => {
        const validation = validateStarLayoutDocument(
          layout,
          puzzle,
          { width: W, height: H },
          { allowUnsafe: true }
        );
        if (!validation.valid) return validation;
        sim.stop();
        allLayoutNodes.forEach(node => {
          node.fx = null; node.fy = null;
          node.vx = 0; node.vy = 0;
        });
        const applied = await animateLayout(targetMapForLayout(layout));
        if (!applied) return { valid: false, errors: ["layout application was cancelled"] };
        const metrics = state.getStarLayoutMetrics();
        state.onAuthorLayoutChanged?.("apply");
        return { valid: true, errors: [], metrics };
      };

      state.prettyPrint = () => {
        if (state.solutionLayout === "polishing") return state.prettyPrintPromise;
        const runPrettyPrint = async () => {
          if (getState() !== state || getSim() !== sim) return { cancelled: true };
          state.solutionLayout = "polishing";
          updateSolutionHint();
          setMessage("Solution shown — computing the polished layout…", "good");
          sim.stop();
          allLayoutNodes.forEach(node => { node.fx = null; node.fy = null; node.vx = 0; node.vy = 0; });
          await afterNextPaint();
          if (getState() !== state || getSim() !== sim) return { cancelled: true };

          const original = capturePositions();
          const originalLayout = evaluateLayout();
          const curatedLayout = repositoryStarLayoutFor(puzzle, W, H);
          if (curatedLayout) {
            const curatedTargets = targetMapForLayout(curatedLayout);
            allLayoutNodes.forEach(node => {
              const target = curatedTargets.get(node);
              node.x = target.x; node.y = target.y;
            });
            const curatedGeometry = evaluateLayout();
            restorePositions(original);
            // Repository validation catches stale/malformed data. Live
            // geometry only rejects real line crossings — residual through-
            // pills / padded overlaps / unrelated-title clearance were the
            // author's call when they exported the override.
            if (curatedGeometry.crossingCount === 0) {
              if (!await animateLayout(curatedTargets)) return { cancelled: true };
              allLayoutNodes.forEach(node => { node.vx = 0; node.vy = 0; });
              state.prettyPrintStats = {
                ...layoutMetrics(evaluateLayout()),
                source: "curated"
              };
              state.solutionLayout = "pretty";
              updateSolutionHint();
              setMessage("Solution shown — Star layout polished.", "good");
              state.onAuthorLayoutChanged?.("placement");
              state.onPlayerLayoutChanged?.("automatic");
              return state.prettyPrintStats;
            }
          }

          let best = { positions: original, layout: originalLayout, deviation: Infinity };
          const evaluateTargets = targets => {
            allLayoutNodes.forEach(node => {
              const target = targets.get(node);
              node.x = target.x; node.y = target.y;
              node.vx = 0; node.vy = 0;
            });
            const layoutSim = d3.forceSimulation(allLayoutNodes).stop();
            if (d3.randomLcg) layoutSim.randomSource(d3.randomLcg(0.42));
            layoutSim
              .force("targetX", d3.forceX(node => targets.get(node).x)
                .strength(node => node.isTitleNode ? 0.9 : node.gs.length > 1 ? 0.5 : 0.6))
              .force("targetY", d3.forceY(node => targets.get(node).y)
                .strength(node => node.isTitleNode ? 0.9 : node.gs.length > 1 ? 0.5 : 0.6))
              .force("charge", d3.forceManyBody().strength(-18))
              .force("collide", d3.forceCollide().radius(node => node.w / 2 + 12).iterations(2))
              .alpha(1)
              .alphaDecay(0.035)
              .velocityDecay(0.45);
            for (let tick = 0; tick < 160; tick++) {
              layoutSim.tick();
              allLayoutNodes.forEach(node => {
                const clamped = clampTarget(node, node);
                node.x = clamped.x; node.y = clamped.y;
              });
            }
            layoutSim.stop();
            const layout = evaluateLayout();
            const deviation = allLayoutNodes.reduce((sum, node) => {
              const target = targets.get(node);
              return sum + Math.hypot(node.x - target.x, node.y - target.y);
            }, 0);
            const candidate = { positions: capturePositions(), layout, deviation };
            if (comparePrettyLayouts(candidate, best) < 0) best = candidate;
          };

          const fixedTitles = titleNodes.map(title => ({ x: title.x, y: title.y }));
          evaluateTargets(buildPrettyTargets(null, 0, fixedTitles));
          const baseOrder = computeClusterOrder(puzzle);
          const permute = values => values.length <= 1
            ? [values]
            : values.flatMap((value, index) =>
                permute(values.filter((_, candidate) => candidate !== index))
                  .map(rest => [value, ...rest])
              );
          // Rotation handles the first cluster's absolute ring position,
          // so fixing it here removes circular duplicates while still
          // exploring every relative order. Exhaustive order search stays
          // inexpensive through five clusters; larger puzzles retain the
          // previous derived/reversed pair to avoid factorial growth.
          const orders = nClusters <= 5
            ? permute(baseOrder.slice(1)).map(rest => [baseOrder[0], ...rest])
            : [
                baseOrder,
                [baseOrder[0], ...baseOrder.slice(1).reverse()]
              ];

          orders.forEach(order => {
            for (let rotation = 0; rotation < nClusters; rotation++) {
              evaluateTargets(buildPrettyTargets(
                order,
                -Math.PI / 2 + rotation * 2 * Math.PI / nClusters
              ));
            }
          });
          // Equal angular slots are a strong default, not a complete
          // search. A human can often clear a stubborn obstruction by
          // rotating one cluster center past or away from its neighbor,
          // which also reorients that cluster's ideal endpoints and
          // ordinary fan. Sample those uneven arrangements explicitly.
          const slotAngle = 2 * Math.PI / nClusters;
          const angleDelta = (from, to) => {
            let delta = to - from;
            while (delta <= -Math.PI) delta += 2 * Math.PI;
            while (delta > Math.PI) delta -= 2 * Math.PI;
            return delta;
          };
          for (let rotation = 0; rotation < nClusters; rotation++) {
            const baseRotation =
              -Math.PI / 2 + rotation * 2 * Math.PI / nClusters;
            baseOrder.forEach(ci => {
              for (const fraction of [-0.7, -0.35, 0.35, 0.7]) {
                evaluateTargets(buildPrettyTargets(
                  baseOrder,
                  baseRotation,
                  null,
                  new Map([[ci, slotAngle * fraction]])
                ));
              }
            });
          }
          // Targeted CCW-past-neighbor placements (try CCW first; one CW
          // mirror as a lower-priority fallback). Position i's CCW neighbor
          // on an equal ring is (i+1) because angles increase counterclockwise.
          // Exhaustive order×rotation search stays cheap through four
          // clusters; larger puzzles reuse baseOrder like the jitter loop.
          const neighborOrders = nClusters <= 4 ? orders : [baseOrder];
          neighborOrders.forEach(order => {
            for (let rotation = 0; rotation < nClusters; rotation++) {
              const baseRotation =
                -Math.PI / 2 + rotation * 2 * Math.PI / nClusters;
              order.forEach((ci, position) => {
                const myAngle = baseRotation + position * slotAngle;
                const ccwNeighborAngle =
                  baseRotation + ((position + 1) % nClusters) * slotAngle;
                for (const past of [0.12, 0.28]) {
                  evaluateTargets(buildPrettyTargets(
                    order,
                    baseRotation,
                    null,
                    new Map([[ci, angleDelta(myAngle, ccwNeighborAngle + past)]])
                  ));
                }
                const cwNeighborAngle =
                  baseRotation + ((position - 1 + nClusters) % nClusters) * slotAngle;
                evaluateTargets(buildPrettyTargets(
                  order,
                  baseRotation,
                  null,
                  new Map([[ci, angleDelta(myAngle, cwNeighborAngle - 0.12)]])
                ));
              });
            }
          });

          // Force relaxation can nudge an otherwise good ring candidate
          // into a simple local obstruction. Before presenting anything,
          // apply the same geometry-verified corrective moves available
          // to the animated detangler. This captures the obvious human
          // fix—rotating a cluster endpoint or moving the obstructed
          // node—without accepting a line through a pill merely because
          // the global candidate had attractive aggregate spacing.
          restorePositions(best.positions);
          let repairedLayout = best.layout;
          let repairMoves = 0;
          while (repairedLayout.visualIntersectionCount > 0 && repairMoves < 8) {
            const direct = bestImprovingMove(repairedLayout);
            const plan = direct
              ? [direct]
              : repairMoves <= 6
                ? findSetupPair(repairedLayout)
                : [];
            if (!plan.length) break;
            const beforePlan = repairedLayout;
            const beforePositions = capturePositions();
            plan.forEach(move => {
              move.node.x = move.target.x;
              move.node.y = move.target.y;
              repairedLayout = evaluateLayout();
            });
            if (compareLayouts(repairedLayout, beforePlan) >= 0) {
              restorePositions(beforePositions);
              repairedLayout = beforePlan;
              break;
            }
            repairMoves += plan.length;
          }
          if (compareLayouts(repairedLayout, best.layout) < 0) {
            best = {
              positions: capturePositions(),
              layout: repairedLayout,
              deviation: best.deviation
            };
          }

          restorePositions(original);
          const targetMap = new Map(best.positions.map(({ node, x, y }) => [node, { x, y }]));
          if (!await animateLayout(targetMap)) return { cancelled: true };
          allLayoutNodes.forEach(node => { node.vx = 0; node.vy = 0; });
          const finalLayout = evaluateLayout();
          state.prettyPrintStats = {
            ...layoutMetrics(finalLayout),
            source: "generated"
          };
          state.solutionLayout = "pretty";
          updateSolutionHint();
          setMessage("Solution shown — Star layout polished.", "good");
          state.onAuthorLayoutChanged?.("placement");
          state.onPlayerLayoutChanged?.("automatic");
          return state.prettyPrintStats;
        };
        state.prettyPrintPromise = runPrettyPrint();
        return state.prettyPrintPromise;
      };

      const run = async () => {
        // Yield once so showSolution() can finish its own synchronous
        // completion message, then make it clear that crossings visible
        // during the next few seconds are part of an active animation.
        await wait(0);
        if (getState() !== state || getSim() !== sim) return { cancelled: true };

        // Curated final layouts are the escape hatch for boards the
        // detangler cannot finish quickly/cleanly. When one exists and its
        // live geometry is not crossed, skip the multi-second settle +
        // drag search and animate straight to the override (the polish
        // pass players like, without the long pre-show).
        const curatedLayout = repositoryStarLayoutFor(puzzle, W, H);
        if (curatedLayout) {
          const preview = capturePositions();
          const curatedTargets = targetMapForLayout(curatedLayout);
          allLayoutNodes.forEach(node => {
            const target = curatedTargets.get(node);
            node.x = target.x;
            node.y = target.y;
          });
          const curatedGeometry = evaluateLayout();
          restorePositions(preview);
          if (curatedGeometry.crossingCount === 0) {
            state.solutionLayout = "animated";
            updateSolutionHint();
            return state.prettyPrint();
          }
        }

        setMessage("Solution shown — untangling the final layout…", "good");
        const settleStarted = performance.now();
        while (sim.alpha() > SETTLED_ALPHA &&
               performance.now() - settleStarted < MAX_INITIAL_SETTLE_MS) {
          await wait(50);
        }
        if (getState() !== state || getSim() !== sim) return { cancelled: true };
        sim.alphaTarget(0).stop();
        allLayoutNodes.forEach(node => { node.vx = 0; node.vy = 0; });

        const initial = evaluateLayout();
        const stats = state.detangleStats = {
          before: initial.visualIntersectionCount,
          after: initial.visualIntersectionCount,
          lineCrossings: initial.crossingCount,
          edgeNodeIntersections: initial.edgeNodeIntersectionCount,
          shortVisibleBridgeLegsBefore: initial.shortVisibleBridgeLegCount,
          shortVisibleBridgeLegsAfter: initial.shortVisibleBridgeLegCount,
          overlapsBefore: initial.overlaps,
          overlapsAfter: initial.overlaps,
          moves: [],
          fanMoves: 0,
          relaxationTicks: 0,
          solved: initial.visualIntersectionCount === 0
        };
        const MAX_CROSSING_MOVES = 12;
        const MAX_EDGE_MOVES = 12;
        const MAX_OVERLAP_MOVES = 10;
        const MAX_SHORT_LEG_MOVES = 8;
        const MAX_SETUP_PAIRS = 2;
        let current = initial;
        let bestLayout = initial;
        let bestPositions = capturePositions();
        let setupPairsUsed = 0;

        const runDetanglePhase = async (shouldContinue, moveLimit) => {
          while (shouldContinue(current) && stats.moves.length < moveLimit) {
            const improvingMove = bestImprovingMove(current);
            const remainingMoves = moveLimit - stats.moves.length;
            const plan = improvingMove
              ? [improvingMove]
              : setupPairsUsed < MAX_SETUP_PAIRS && remainingMoves >= 2
                ? findSetupPair(current)
                : [];
            if (!plan.length) break;

            const planStart = current;
            const planStartPositions = capturePositions();
            const planStats = [];
            let valid = true;
            for (const move of plan) {
              if (getState() !== state || getSim() !== sim) return { cancelled: true };
              const beforeCount = current.visualIntersectionCount;
              const beforeLayout = current;
              await animateMove(move.node, move.target);
              current = evaluateLayout();
              const moveIsValid = move.preparatory
                ? current.crossingCount <= beforeLayout.crossingCount + 1 &&
                  current.visualIntersectionCount <= beforeCount + 2
                : improvesLayout(current, beforeLayout);
              if (!moveIsValid) {
                valid = false;
                break;
              }
              planStats.push({
                node: move.node.isTitleNode ? `${move.node.word} (title)` : move.node.word,
                before: beforeCount,
                after: current.visualIntersectionCount,
                beforeLineCrossings: beforeLayout.crossingCount,
                afterLineCrossings: current.crossingCount,
                beforeNodeIntersections: beforeLayout.edgeNodeIntersectionCount,
                afterNodeIntersections: current.edgeNodeIntersectionCount,
                beforeOverlaps: beforeLayout.overlaps,
                afterOverlaps: current.overlaps,
                beforeShortVisibleBridgeLegs: beforeLayout.shortVisibleBridgeLegCount,
                afterShortVisibleBridgeLegs: current.shortVisibleBridgeLegCount,
                preparatory: !!move.preparatory
              });
            }

            if (!valid || !improvesLayout(current, planStart)) {
              restorePositions(planStartPositions);
              current = planStart;
              // A failed setup still consumes the attempt so we do not loop
              // forever on the same preparatory pair; keep searching for a
              // direct improving drag afterward.
              if (plan[0].preparatory) {
                setupPairsUsed++;
                continue;
              }
              break;
            }
            stats.moves.push(...planStats);
            if (plan[0].preparatory) setupPairsUsed++;
            stats.after = current.visualIntersectionCount;
            if (improvesLayout(current, bestLayout)) {
              bestLayout = current;
              bestPositions = capturePositions();
            }
          }
          return null;
        };

        const finishPhase = () => {
          if (compareLayouts(current, bestLayout) > 0) {
            restorePositions(bestPositions);
            current = evaluateLayout();
          }
          bestLayout = current;
          bestPositions = capturePositions();
          setupPairsUsed = 0;
        };

        activePhase = "crossings";
        let cancelled = await runDetanglePhase(
          layout => layout.crossingCount > 0,
          MAX_CROSSING_MOVES
        );
        if (cancelled?.cancelled) return cancelled;
        finishPhase();

        activePhase = "edges";
        cancelled = await runDetanglePhase(
          layout => layout.crossingCount === 0 && layout.edgeNodeIntersectionCount > 0,
          stats.moves.length + MAX_EDGE_MOVES
        );
        if (cancelled?.cancelled) return cancelled;
        finishPhase();

        activePhase = "overlaps";
        cancelled = await runDetanglePhase(
          layout => layout.crossingCount === 0 && layout.overlaps > 0,
          stats.moves.length + MAX_OVERLAP_MOVES
        );
        if (cancelled?.cancelled) return cancelled;
        finishPhase();

        activePhase = "short";
        cancelled = await runDetanglePhase(
          layout => layout.crossingCount === 0 &&
            layout.shortVisibleBridgeLegCount > 0,
          stats.moves.length + MAX_SHORT_LEG_MOVES
        );
        if (cancelled?.cancelled) return cancelled;

        if (compareLayouts(current, bestLayout) > 0) {
          restorePositions(bestPositions);
          current = evaluateLayout();
        }

        // Once the hard geometry is solved, make a small number of safe
        // local adjustments that place multi-port clusters' ordinary terms
        // in their outward fan. These are evaluated against the title's
        // final position, so a title drag cannot invalidate the target.
        if (stats.moves.length && current.crossingCount === 0) {
          for (const [node] of outwardSlots) {
            const target = outwardTarget(node);
            const beforeDistance = Math.hypot(node.x - target.x, node.y - target.y);
            if (beforeDistance < 24) continue;
            const startX = node.x, startY = node.y;
            node.x = target.x; node.y = target.y;
            const after = evaluateLayout();
            node.x = startX; node.y = startY;
            if (compareLayouts(after, current) > 0 || after.overlaps > current.overlaps) continue;
            await animateMove(node, target);
            current = evaluateLayout();
            stats.fanMoves++;
          }
        }

        // Match the cooling tail of a human drag release: unpin every node
        // and give the existing collision/link forces just enough energy
        // to polish spacing without reorganizing the solved graph. An
        // already-clean board has had no virtual release and remains
        // untouched.
        if (stats.moves.length && getState() === state && getSim() === sim) {
          setMessage("Solution shown — settling the final spacing…", "good");
          const relaxStartLayout = current;
          let safePositions = capturePositions();
          let relaxationActive = true;
          sim.on("tick", null);
          sim.on("tick.detangleRelax", () => {
            stats.relaxationTicks++;
            const layout = evaluateLayout();
            if (compareLayouts(layout, relaxStartLayout) > 0) {
              relaxationActive = false;
              sim.stop();
              restorePositions(safePositions);
              return;
            }
            safePositions = capturePositions();
            current = layout;
            renderPositions();
          });
          sim.alpha(FINAL_RELAX_ALPHA).alphaTarget(0).restart();
          const finalSettleStarted = performance.now();
          while (relaxationActive && sim.alpha() > FINAL_SETTLED_ALPHA &&
                 performance.now() - finalSettleStarted < MAX_FINAL_SETTLE_MS) {
            await wait(50);
          }
          if (getState() !== state || getSim() !== sim) return { cancelled: true };
          sim.stop();
          sim.on("tick.detangleRelax", null).on("tick", renderPositions);
          restorePositions(safePositions);
          allLayoutNodes.forEach(node => { node.vx = 0; node.vy = 0; });
          current = evaluateLayout();
        }

        stats.after = current.visualIntersectionCount;
        stats.lineCrossings = current.crossingCount;
        stats.edgeNodeIntersections = current.edgeNodeIntersectionCount;
        stats.shortVisibleBridgeLegsAfter = current.shortVisibleBridgeLegCount;
        stats.overlapsAfter = current.overlaps;
        stats.solved = current.visualIntersectionCount === 0 &&
          current.overlaps === 0 &&
          current.shortVisibleBridgeLegCount === 0;
        renderPositions();
        if (getState() === state && getSim() === sim) {
          state.solutionLayout = "animated";
          updateSolutionHint();
          setMessage(
            current.crossingCount === 0
              ? puzzle.bridges.length
                ? "Solution shown — every bridge connected and line crossings cleared."
                : "Solution shown — Star layout polished."
              : "Solution shown — drag any remaining crossed endpoint to finish untangling.",
            current.crossingCount === 0 ? "good" : undefined
          );
          state.onPlayerLayoutChanged?.("automatic");
        }
        return stats;
      };
      state.detanglePromise = run();
      return state.detanglePromise;
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
    // Once a solved board is being edited in authoring mode, dragging is
    // literal placement: the simulation stays stopped after release so it
    // cannot "helpfully" undo the author's decision. Before solve (and in
    // ordinary play) the existing force-release behavior remains unchanged.
    const starDrag = () => d3.drag()
      .filter(event =>
        !event.ctrlKey && !event.button &&
        (!lensPhaseActive(state) || state.layoutAuthoring)
      )
      .on("start", (e, d) => {
        const authoring = state.layoutAuthoring &&
          state.made === state.need &&
          state.captureStarLayout;
        if (authoring) {
          sim.stop();
        } else if (!e.active) {
          sim.alphaTarget(0.2).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (e, d) => {
        d.x = d.fx = e.x;
        d.y = d.fy = e.y;
        if (state.layoutAuthoring && state.made === state.need) renderPositions();
      })
      .on("end", (e, d) => {
        const authoring = state.layoutAuthoring &&
          state.made === state.need &&
          state.captureStarLayout;
        d.fx = null;
        d.fy = null;
        if (authoring) {
          d.vx = 0;
          d.vy = 0;
          sim.stop();
          renderPositions();
          state.onAuthorLayoutChanged?.("drag");
        } else if (!e.active) {
          sim.alphaTarget(0);
          state.onPlayerLayoutChanged?.("player");
        }
      });

    const titleG = titleLayer.selectAll("g").data(titleNodes).join("g")
      .attr("class", d => `title-node c-${puzzle.clusters[d.ci].color}`)
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", d => `${puzzle.clusters[d.ci].name} cluster`)
      .call(starDrag());
    titleG.append("rect")
      .attr("height", 30).attr("width", d => d.w).attr("x", d => -d.w / 2).attr("y", -15);
    titleG.append("text").attr("dy", 4).text(d => d.word);
    // Same rule as a term's own info-dot (below): only a real authored
    // blurb earns one, not just the link every cluster gets automatically
    // -- a dot promising more than "the name you can already see, plus a
    // link" is worse than no dot at all. Set once here (titleInfoOf's
    // result never changes after puzzle load), same as a term's.
    titleG.filter(d => titleInfoOf(d).text).append("circle").attr("class", "info-dot")
      .attr("r", 3).attr("cx", d => d.w / 2 - 9).attr("cy", -9);

    function tapTitle(d) {
      if (lensPhaseActive(state)) return;
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
    // and rules as termInfo/bridge info) and the cluster's `fact`, which
    // is a completion *reward* (see addFactCard in game.js). Both are
    // always available on hover independent of completion state --
    // `info.text`/`info.link`/`info.extraLink` aren't spoiler-shaped by
    // authoring convention (a plain, dictionary-style definition that
    // deliberately never names any of the cluster's own terms), so
    // there's nothing to gate. `fact` deliberately stays OUT of this
    // hover panel entirely rather than swapping in once earned: it's
    // already shown permanently as its own fact-card the moment it's
    // earned, and repeating the same words in a second place the
    // instant that happens would just be noise -- worse, a hover
    // panel's text silently changing mid-play reads as a bug ("didn't
    // this say something else a minute ago?"), not a feature. No
    // authored `info.text` just means silence here, as before -- the
    // name (already the visible label) and whatever link is available
    // (curated, or showTermInfo's own auto search fallback) either way.
    // titleNodes persists for this whole buildStarGraph() call (state.paint
    // here is the lightweight re-classer below, not a rebuild), so mutating
    // `d.info` in place and reusing `d` itself as the focus-lock identity
    // (see focusedInfoNode in game.js) is safe -- no separate stable cache
    // needed the way Circle mode's cluster hover does.
    function titleInfoOf(d) {
      const c = puzzle.clusters[d.ci];
      const authored = normalizeInfo(c.info) || {};
      return {
        text: authored.text || null,
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
      .call(starDrag());

    nodeG.append("rect").attr("class", "pill-shape")
      .attr("rx", 15).attr("height", 30)
      .attr("width", d => d.w).attr("x", d => -d.w / 2).attr("y", -15);
    // A bridge's second, pointed-ends shape -- see the matching comment
    // in graphRenderer.js.
    nodeG.filter(d => isBridge(d)).append("polygon").attr("class", "bridge-shape")
      .attr("points", d => bridgePoints(d.w));
    nodeG.append("text").attr("dy", 4).text(d => d.word);
    nodeG.append("text").attr("class", "lens-check")
      .attr("x", d => -d.w / 2 + 8).attr("dy", 4)
      .attr("aria-hidden", "true").text("✓");
    const assignmentBadge = nodeG.append("g")
      .attr("class", "lens-assignment-badge")
      .attr("transform", d => `translate(${d.w / 2 - 2},-14)`)
      .attr("aria-hidden", "true");
    assignmentBadge.append("circle").attr("r", 10);
    assignmentBadge.append("text").attr("dy", 4);
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
    // Caption naming which bridge(s) consider this term ideal — needed
    // because star mode routes all link lines to the cluster title rather
    // than to the specific tapped sibling, losing the per-line visual
    // disambiguation that Graph mode gets for free. Matches the same
    // ideal-tag caption Sets mode already uses for the same reason.
    nodeG.filter(d => !isBridge(d)).append("text").attr("class", "ideal-tag").attr("text-anchor", "middle");

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
        .attr("aria-label", d => lensNodeAriaLabel(
          d,
          state,
          bridgeNodeAriaLabel(d, puzzle, isDone(d))
        ))
        .attr("aria-pressed", d =>
        state.phase === "lens-selecting"
          ? String(state.lensSelections.has(d.word))
          : null
      );
      nodeG.each(function (d) {
        const names = idealBridgeNames(d, puzzle, state.shownClusters, nodes);
        const group = d3.select(this);
        group.select(".ideal-tag").text(names.length ? names.join(", ") : "");
        const metadata = lensAssignmentBadge(d, state);
        const badge = group.select(".lens-assignment-badge");
        badge.attr("class", metadata
          ? `lens-assignment-badge visible${metadata.tone == null ? "" : ` lens-tone-${metadata.tone}`}`
          : "lens-assignment-badge");
        badge.select("text").text(metadata?.text || "");
        group.select(".lens-check").text(
          metadata && state.phase === "complete" && metadata.unanswered
            ? "?"
            : metadata && state.phase === "complete" && !metadata.correct ? "→" : "✓"
        );
      });
      countEl.textContent = state.progressLabel || `${state.made} of ${state.need} links`;
      updateSolutionHint();
    };
    state.paint();

    const renderPositions = () => {
      [...nodes, ...titleNodes].forEach(n => {
        n.x = Math.max(n.w / 2 + 6, Math.min(W - n.w / 2 - 6, n.x));
        const live = !useFreeStrip || n.isTitleNode || (n.connected && n.connected.length > 0);
        const minY = live && useFreeStrip ? Math.max(22, liveStripHeight + 16) : 22;
        n.y = Math.max(minY, Math.min(H - 22, n.y));
      });
      linkLayer.selectAll("line")
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        // Ideal links point to the specific ideal term node — the bold line
        // should visually connect the bridge to the term that earned it, not
        // to the cluster title, which is where all other lines terminate.
        .attr("x2", d => displayedLinkTarget(d).x)
        .attr("y2", d => displayedLinkTarget(d).y);
      directionLayer.selectAll("polygon.bridge-direction-arrow")
        .attr("points", d => {
          const target = displayedLinkTarget(d.link);
          return bridgeArrowPoints(
            { x: d.link.source.x, y: d.link.source.y },
            { x: target.x, y: target.y },
            d.direction,
            d.centerOffset
          );
        });
      // Ideal-target captions normally hug the lower edge of their pills.
      // Flip them above only when the node is close enough to the bottom
      // edge that the caption would extend outside the SVG viewBox. Both
      // offsets keep the glyph box adjacent to its owner; the previous
      // 27/-21 values left a larger owner-side gap and could make a caption
      // read as belonging to a tightly packed unrelated pill below it.
      nodeG.select(".ideal-tag")
        .attr("dy", d => d.y > H - 42 ? -18 : 24);
      nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
      titleG.attr("transform", d => `translate(${d.x},${d.y})`);
    };
    state.freezeForLenses = () => {
      sim.stop();
      renderPositions();
    };

    // Every renderer publishes the same adapter shape. Star includes its
    // additional title nodes; Graph and Circle capture their own distinct
    // term-only and container/bridge representations.
    state.layoutAdapter = {
      mode: "star",
      capture() {
        return createStarPlayerLayoutDocument({
          puzzle,
          width: W,
          height: H,
          layoutNodes: allLayoutNodes,
          solutionLayout: state.solutionLayout
        });
      },
      apply(layout) {
        const validation = validateStarPlayerLayoutDocument(
          layout,
          puzzle,
          { width: W, height: H }
        );
        if (!validation.valid) return validation;
        sim.stop();
        for (const [node, target] of starLayoutTargetMap(layout, allLayoutNodes)) {
          node.x = target.x;
          node.y = target.y;
          node.fx = null;
          node.fy = null;
          node.vx = 0;
          node.vy = 0;
        }
        state.solutionLayout = state.made === state.need
          ? layout.solutionLayout
          : null;
        renderPositions();
        state.paint();
        return { valid: true, errors: [] };
      },
      autoLayout: state.detangle
    };
    sim.on("tick", renderPositions);
  }

  return { buildStarGraph };
}
