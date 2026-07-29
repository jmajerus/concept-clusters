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
import { repositoryStarLayoutFor } from "./starLayoutRepository.js";
import {
  createStarLayoutDocument,
  createStarPlayerLayoutDocument,
  starLayoutTargetMap,
  validateStarLayoutDocument,
  validateStarPlayerLayoutDocument
} from "./starLayoutSchema.js";
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

    // Ring layout, seeding each title's starting position (see
    // titleNodes below) and also its permanent "home" (titleHomeX/Y
    // below) -- what actually holds a *connected* node near its cluster
    // is buildClusterLinks, not this ring. A title with nothing
    // connected to it yet (the common case on a fresh puzzle) has no
    // clusterPull spring at all, so with nothing else to restrain it,
    // pure charge repulsion from a whole board of free-floating terms
    // could shove it wherever, with only the hard edge clamp below to
    // eventually stop it -- confirmed happening in practice, a title
    // drifting all the way to the board's edge on first load, well
    // before the player had made a single connection (and confirmed
    // needing a real pull, not a token one: 0.05 wasn't enough to
    // overcome that repulsion, 0.15 still left one puzzle's title
    // parked at the edge; 0.3 is what actually held across a spread of
    // puzzles tried). Still meaningfully weaker than clusterPull (0.6)
    // once real connections exist, so a cluster's title visibly
    // migrates toward wherever its actual members settle rather than
    // staying rigidly pinned to this ring -- just no longer defenseless
    // against repulsion alone before that happens.
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
    const allLayoutNodes = [...nodes, ...titleNodes];

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
      .force("collide", d3.forceCollide().radius(d => d.w / 2 + 14))
      .force("titleHomeX", d3.forceX(d => d.isTitleNode ? ring[d.ci][0] : d.x).strength(d => d.isTitleNode ? 0.3 : 0))
      .force("titleHomeY", d3.forceY(d => d.isTitleNode ? ring[d.ci][1] : d.y).strength(d => d.isTitleNode ? 0.3 : 0));
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
    state.onPuzzleSolved = () => {
      if (!state.completedViaShowSolution) {
        state.onPlayerLayoutChanged?.("player");
      }
    };

    // handleTap calls this right after pushing a new link — this mode needs
    // to redraw the line, hand the freshly-grown cluster-link set to the
    // force simulation, and nudge it awake again.
    state.onLinkAdded = () => {
      state.drawLinks();
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

      const intersection = (a, b) => {
        if (a.source === b.source || a.source === b.target ||
            a.target === b.source || a.target === b.target) return null;
        const p1 = a.source, p2 = a.target, p3 = b.source, p4 = b.target;
        const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y;
        const dx2 = p4.x - p3.x, dy2 = p4.y - p3.y;
        const denominator = dx1 * dy2 - dy1 * dx2;
        if (Math.abs(denominator) < 1e-9) return null;
        const t = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / denominator;
        const u = ((p3.x - p1.x) * dy1 - (p3.y - p1.y) * dx1) / denominator;
        if (t <= 0.001 || t >= 0.999 || u <= 0.001 || u >= 0.999) return null;
        return { x: p1.x + t * dx1, y: p1.y + t * dy1 };
      };

      const crossingDetails = () => {
        const edges = displayedEdges();
        const crossings = [];
        for (let i = 0; i < edges.length; i++) {
          for (let j = i + 1; j < edges.length; j++) {
            const point = intersection(edges[i], edges[j]);
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

            // Liang-Barsky segment/rectangle clipping. A small pad keeps a
            // line from merely grazing a pill's outline, which reads as a
            // collision just as clearly as running through its text.
            const xMin = node.x - node.w / 2 - 4;
            const xMax = node.x + node.w / 2 + 4;
            const yMin = node.y - 19;
            const yMax = node.y + 19;
            const dx = edge.target.x - edge.source.x;
            const dy = edge.target.y - edge.source.y;
            const p = [-dx, dx, -dy, dy];
            const q = [
              edge.source.x - xMin,
              xMax - edge.source.x,
              edge.source.y - yMin,
              yMax - edge.source.y
            ];
            let tMin = 0, tMax = 1;
            for (let i = 0; i < 4 && tMin <= tMax; i++) {
              if (Math.abs(p[i]) < 1e-9) {
                if (q[i] < 0) {
                  tMin = 1;
                  tMax = 0;
                }
              } else {
                const ratio = q[i] / p[i];
                if (p[i] < 0) tMin = Math.max(tMin, ratio);
                else tMax = Math.min(tMax, ratio);
              }
            }
            if (tMin <= tMax && tMax > 0.001 && tMin < 0.999) {
              const t = Math.max(0, Math.min(1, (tMin + tMax) / 2));
              intersections.push({
                edge,
                node,
                point: {
                  x: edge.source.x + dx * t,
                  y: edge.source.y + dy * t
                }
              });
            }
          });
        });
        return intersections;
      };

      const overlapCount = () => {
        let count = 0;
        for (let i = 0; i < allLayoutNodes.length; i++) {
          for (let j = i + 1; j < allLayoutNodes.length; j++) {
            const a = allLayoutNodes[i], b = allLayoutNodes[j];
            // Pills are wide rectangles, not circles. The force simulation
            // intentionally gives them a generous circular comfort zone,
            // but using that same circle as a hard search rejection rules
            // out many perfectly legible human drags (especially one pill
            // passing above another long pill).
            if (Math.abs(a.x - b.x) < a.w / 2 + b.w / 2 + 8 &&
                Math.abs(a.y - b.y) < 38) count++;
          }
        }
        return count;
      };

      const evaluateLayout = () => {
        const crossings = crossingDetails();
        const edgeNodeIntersections = edgeNodeIntersectionDetails();
        const edges = displayedEdges();
        const bridgeEdges = edges.filter(edge => edge.link.bridge);
        return {
          crossings,
          crossingCount: crossings.length,
          edgeNodeIntersections,
          edgeNodeIntersectionCount: edgeNodeIntersections.length,
          visualIntersectionCount: crossings.length + edgeNodeIntersections.length,
          bridgeCrossings: crossings.filter(c => c.edgeA.link.bridge || c.edgeB.link.bridge).length,
          overlaps: overlapCount(),
          maxBridgeLeg: bridgeEdges.length
            ? Math.max(...bridgeEdges.map(edge =>
              Math.hypot(edge.source.x - edge.target.x, edge.source.y - edge.target.y)))
            : 0,
          totalEdgeLength: edges.reduce((sum, edge) =>
            sum + Math.hypot(edge.source.x - edge.target.x, edge.source.y - edge.target.y), 0)
        };
      };
      const compareLayouts = (a, b) =>
        a.crossingCount - b.crossingCount ||
        a.edgeNodeIntersectionCount - b.edgeNodeIntersectionCount;

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
        const comparison = compareLayouts(after, before);
        if (!preparatory && comparison >= 0) return null;
        if (preparatory && (
          comparison < 0 ||
          after.crossingCount > before.crossingCount + 1 ||
          after.visualIntersectionCount > before.visualIntersectionCount + 2
        )) return null;
        if (after.overlaps > before.overlaps + Number(preparatory)) return null;
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
        Number(a.node.isTitleNode) - Number(b.node.isTitleNode) ||
        a.after.bridgeCrossings - b.after.bridgeCrossings ||
        a.after.overlaps - b.after.overlaps ||
        a.after.maxBridgeLeg - b.after.maxBridgeLeg ||
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
          if (!second || compareLayouts(second.after, before) >= 0) return;

          const candidate = [first, second];
          if (!best ||
              compareLayouts(second.after, best[1].after) < 0 ||
              (compareLayouts(second.after, best[1].after) === 0 &&
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
          const progress = raw < 0.5
            ? 4 * raw * raw * raw
            : 1 - Math.pow(-2 * raw + 2, 3) / 2;
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

      const buildPrettyTargets = (order, rotation, fixedTitles = null) => {
        const targets = new Map();
        const titleTargets = new Array(nClusters);
        const ringRadius = Math.min(W, H) * 0.33;
        (fixedTitles ? puzzle.clusters.map((_, ci) => ci) : order).forEach((ci, position) => {
          const angle = rotation + position * 2 * Math.PI / nClusters;
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
        a.layout.overlaps - b.layout.overlaps ||
        a.layout.bridgeCrossings - b.layout.bridgeCrossings ||
        (a.layout.edgeNodeIntersectionCount * 220 + a.deviation) -
          (b.layout.edgeNodeIntersectionCount * 220 + b.deviation) ||
        a.layout.maxBridgeLeg - b.layout.maxBridgeLeg ||
        a.layout.totalEdgeLength - b.layout.totalEdgeLength;

      const animateLayout = targets => new Promise(resolve => {
        const starts = capturePositions();
        const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 850;
        const started = performance.now();
        const step = now => {
          if (getState() !== state || getSim() !== sim) {
            resolve(false);
            return;
          }
          const raw = Math.min(1, (now - started) / duration);
          const progress = raw < 0.5
            ? 4 * raw * raw * raw
            : 1 - Math.pow(-2 * raw + 2, 3) / 2;
          starts.forEach(({ node, x, y }) => {
            const target = targets.get(node);
            node.x = x + (target.x - x) * progress;
            node.y = y + (target.y - y) * progress;
          });
          renderPositions();
          if (raw < 1) requestAnimationFrame(step);
          else resolve(true);
        };
        requestAnimationFrame(step);
      });

      const layoutMetrics = layout => ({
        lineCrossings: layout.crossingCount,
        edgeNodeIntersections: layout.edgeNodeIntersectionCount,
        overlaps: layout.overlaps
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
            // Repository validation catches stale/malformed data; this live
            // geometry check catches a layout whose saved metrics no longer
            // agree with current label dimensions or edge rendering.
            if (curatedGeometry.crossingCount === 0 && curatedGeometry.overlaps === 0) {
              if (!await animateLayout(curatedTargets)) return { cancelled: true };
              allLayoutNodes.forEach(node => { node.vx = 0; node.vy = 0; });
              state.prettyPrintStats = {
                ...layoutMetrics(evaluateLayout()),
                source: "curated"
              };
              state.solutionLayout = "pretty";
              updateSolutionHint();
              setMessage("Solution shown — curated layout applied.", "good");
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
          const orders = [
            baseOrder,
            [baseOrder[0], ...baseOrder.slice(1).reverse()]
          ].filter((order, i, list) =>
            list.findIndex(other => other.join(",") === order.join(",")) === i);

          orders.forEach(order => {
            for (let rotation = 0; rotation < nClusters; rotation++) {
              evaluateTargets(buildPrettyTargets(
                order,
                -Math.PI / 2 + rotation * 2 * Math.PI / nClusters
              ));
            }
          });

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
          setMessage("Solution shown — layout polished.", "good");
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
          moves: [],
          fanMoves: 0,
          relaxationTicks: 0,
          solved: initial.visualIntersectionCount === 0
        };
        const MAX_MOVES = 8;
        let current = initial;
        let bestLayout = initial;
        let bestPositions = capturePositions();
        let setupUsed = false;

        while (current.visualIntersectionCount > 0 && stats.moves.length < MAX_MOVES) {
          const improvingMove = bestImprovingMove(current);
          const remainingMoves = MAX_MOVES - stats.moves.length;
          const plan = improvingMove
            ? [improvingMove]
            : !setupUsed && remainingMoves >= 2
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
              : compareLayouts(current, beforeLayout) < 0;
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
              preparatory: !!move.preparatory
            });
          }

          // A setup drag is only shown as part of a pair whose second drag
          // leaves the board better than it was before the pair.
          if (!valid || compareLayouts(current, planStart) >= 0) {
            restorePositions(planStartPositions);
            current = planStart;
            break;
          }
          stats.moves.push(...planStats);
          setupUsed ||= plan[0].preparatory;
          stats.after = current.visualIntersectionCount;
          if (compareLayouts(current, bestLayout) < 0) {
            bestLayout = current;
            bestPositions = capturePositions();
          }
        }

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
        stats.solved = current.visualIntersectionCount === 0;
        renderPositions();
        if (getState() === state && getSim() === sim) {
          state.solutionLayout = "animated";
          updateSolutionHint();
          setMessage(
            current.crossingCount === 0
              ? "Solution shown — every bridge connected and line crossings cleared."
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
    nodeG.filter(d => !isBridge(d)).append("text").attr("class", "ideal-tag").attr("dy", 27).attr("text-anchor", "middle");

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
          if (isBridge(d)) return base;
          return idealBridgeNames(d, puzzle, state.shownClusters, nodes).length
            ? `${base} ideal-target` : base;
        }
        if (d.connected.length) return isBridge(d) ? "node partial bridge" : "node partial";
        return "node free";
      });
      nodeG.each(function (d) {
        const names = idealBridgeNames(d, puzzle, state.shownClusters, nodes);
        d3.select(this).select(".ideal-tag").text(names.length ? names.join(", ") : "");
      });
      countEl.textContent = `${state.made} of ${state.need} links`;
      updateSolutionHint();
    };
    state.paint();

    const renderPositions = () => {
      [...nodes, ...titleNodes].forEach(n => {
        n.x = Math.max(n.w / 2 + 6, Math.min(W - n.w / 2 - 6, n.x));
        n.y = Math.max(22, Math.min(H - 22, n.y));
      });
      linkLayer.selectAll("line")
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        // Ideal links point to the specific ideal term node — the bold line
        // should visually connect the bridge to the term that earned it, not
        // to the cluster title, which is where all other lines terminate.
        .attr("x2", d => d.ideal ? d.target.x : titleNodes[d.target.gs[0]].x)
        .attr("y2", d => d.ideal ? d.target.y : titleNodes[d.target.gs[0]].y);
      nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
      titleG.attr("transform", d => `translate(${d.x},${d.y})`);
    };

    // Every renderer publishes the same adapter shape. Star is the first
    // mode with a complete position representation; Graph and Circle
    // deliberately publish null capture/apply methods until their own
    // automatic layout work is finished.
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
