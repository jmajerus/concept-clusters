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
    // Keep the physical ring slots separate from the authored cluster-to-
    // slot mapping. The detangler uses the same immutable slots to derive
    // candidate destinations without changing the live title-home forces.
    const ringSlots = Array.from({ length: nClusters }, (_, i) => {
      const angle = (i / nClusters) * 2 * Math.PI - Math.PI / 2;
      return [W / 2 + ringR * Math.cos(angle), H / 2 + ringR * Math.sin(angle)];
    });
    const ring = ringSlots.slice();

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
      const DRAG_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 520;
      const MAX_INITIAL_SETTLE_MS = 3200;
      const SETTLED_ALPHA = 0.035;
      const PORT_RADIUS = 90;
      const MAX_BRIDGE_LEG = Math.min(W, H) * 0.32;
      const allLayoutNodes = [...nodes, ...titleNodes];
      const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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

      // The deterministic skeleton/angular layout from the design note is
      // useful as a source of good destinations, but it is guidance rather
      // than a mandatory pass. Nodes at those destinations are still moved
      // only when the move removes a crossing in the board that actually
      // exists on screen.
      const guideTargets = new Map();
      const guideRing = new Array(nClusters);
      computeClusterOrder(puzzle).forEach((ci, position) => {
        guideRing[ci] = ringSlots[position];
        guideTargets.set(titleNodes[ci], { x: ringSlots[position][0], y: ringSlots[position][1] });
      });
      const bridgeTargets = new Map();
      puzzle.bridges.forEach(bridge => {
        const node = nodes.find(n => n.word === bridge.term);
        if (!node) return;
        const target = {
          x: bridge.clusters.reduce((sum, ci) => sum + guideRing[ci][0], 0) / bridge.clusters.length,
          y: bridge.clusters.reduce((sum, ci) => sum + guideRing[ci][1], 0) / bridge.clusters.length
        };
        bridgeTargets.set(node, target);
        guideTargets.set(node, target);
      });
      puzzle.clusters.forEach((cluster, ci) => {
        const [tx, ty] = guideRing[ci];
        const idealDirections = new Map();
        puzzle.bridges.forEach(bridge => {
          const side = bridge.clusters.indexOf(ci);
          const word = side !== -1 && bridge.idealTerms && bridge.idealTerms[side];
          const bridgeNode = nodes.find(n => n.word === bridge.term);
          const bridgeTarget = bridgeNode && bridgeTargets.get(bridgeNode);
          if (!word || !bridgeTarget) return;
          if (!idealDirections.has(word)) idealDirections.set(word, []);
          idealDirections.get(word).push(bridgeTarget);
        });
        const ports = [...idealDirections].map(([word, targets]) => {
          const x = targets.reduce((sum, target) => sum + target.x, 0) / targets.length;
          const y = targets.reduce((sum, target) => sum + target.y, 0) / targets.length;
          return { word, angle: Math.atan2(y - ty, x - tx) };
        }).sort((a, b) => a.angle - b.angle);
        ports.forEach(({ word, angle }) => {
          const node = nodes.find(n => n.word === word);
          if (node) guideTargets.set(node, {
            x: tx + PORT_RADIUS * Math.cos(angle),
            y: ty + PORT_RADIUS * Math.sin(angle)
          });
        });
        let gapStart = 0, gapSpan = 2 * Math.PI;
        if (ports.length) {
          gapSpan = -1;
          ports.forEach((port, i) => {
            const next = i + 1 < ports.length ? ports[i + 1].angle : ports[0].angle + 2 * Math.PI;
            if (next - port.angle > gapSpan) {
              gapStart = port.angle;
              gapSpan = next - port.angle;
            }
          });
        }
        const ordinary = cluster.terms.filter(word => !idealDirections.has(word));
        const margin = ports.length ? 0.35 : 0;
        const usable = Math.max(0, gapSpan - 2 * margin);
        ordinary.forEach((word, i) => {
          const angle = ordinary.length === 1
            ? gapStart + gapSpan / 2
            : gapStart + margin + usable * i / Math.max(1, ordinary.length - 1);
          const node = nodes.find(n => n.word === word);
          if (node) guideTargets.set(node, {
            x: tx + PORT_RADIUS * Math.cos(angle),
            y: ty + PORT_RADIUS * Math.sin(angle)
          });
        });
      });

      const clampTarget = (node, point) => ({
        x: Math.max(node.w / 2 + 6, Math.min(W - node.w / 2 - 6, point.x)),
        y: Math.max(22, Math.min(H - 22, point.y))
      });

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
        add(guideTargets.get(node));

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

      const tryCandidate = (node, target, before, relaxed = false, allowedIncrease = -1) => {
        const startX = node.x, startY = node.y;
        node.x = target.x; node.y = target.y;
        const after = evaluateLayout();
        node.x = startX; node.y = startY;
        if (allowedIncrease < 0 && compareLayouts(after, before) >= 0) return null;
        if (allowedIncrease >= 0 &&
            after.crossingCount > before.crossingCount + allowedIncrease) return null;
        if (!relaxed && after.overlaps > before.overlaps) return null;
        // Never turn a short bridge into a long one. If Show Solution's
        // inherited layout already contains an over-limit leg, allow a
        // modest amount of temporary geometric room; otherwise that one
        // pre-existing outlier can make an unrelated final crossing
        // mathematically impossible to touch.
        if (!relaxed &&
            after.maxBridgeLeg > Math.max(MAX_BRIDGE_LEG, before.maxBridgeLeg * 1.1)) return null;
        return {
          node, target, after,
          startX, startY,
          distance: Math.hypot(target.x - startX, target.y - startY)
        };
      };

      const compareMoves = (a, b) =>
        Number(a.node.isTitleNode) - Number(b.node.isTitleNode) ||
        a.after.crossingCount - b.after.crossingCount ||
        a.after.edgeNodeIntersectionCount - b.after.edgeNodeIntersectionCount ||
        a.after.bridgeCrossings - b.after.bridgeCrossings ||
        a.after.overlaps - b.after.overlaps ||
        a.after.maxBridgeLeg - b.after.maxBridgeLeg ||
        a.distance - b.distance ||
        a.after.totalEdgeLength - b.after.totalEdgeLength;

      const rankedMoves = (before, broad = false, relaxed = false, allowedIncrease = -1) => {
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
        const candidates = [...burden].sort((a, b) => {
          const aPriority = a[0].isTitleNode ? 2 : a[0].gs.length > 1 ? 0 : 1;
          const bPriority = b[0].isTitleNode ? 2 : b[0].gs.length > 1 ? 0 : 1;
          return b[1] - a[1] || aPriority - bPriority;
        });
        const moves = [];
        candidates.forEach(([node]) => {
          const targets = broad
            ? [...localCandidates(node, before), ...broadCandidates(node)]
            : localCandidates(node, before);
          targets.forEach(target => {
            const move = tryCandidate(node, target, before, relaxed, allowedIncrease);
            if (move) moves.push(move);
          });
        });
        moves.sort(compareMoves);

        // Search needs genuine alternatives, not twenty near-identical
        // samples around the same endpoint. Keep a few strong destinations
        // per node, then cap the branch factor so a six-move lookahead stays
        // comfortably bounded even on the largest catalog puzzle.
        const perNode = new Map();
        const perNodeLimit = before.crossingCount === 0 ? 12 : 4;
        const totalLimit = before.crossingCount === 0 ? 60 : 24;
        return moves.filter(move => {
          const count = perNode.get(move.node) || 0;
          if (count >= perNodeLimit) return false;
          perNode.set(move.node, count + 1);
          return true;
        }).slice(0, totalLimit);
      };

      const escapeLocalMinimum = before => {
        const testFirstMoves = (broad, increase) => rankedMoves(before, broad, true, increase)
          .filter(move =>
            move.after.visualIntersectionCount === before.visualIntersectionCount + increase);
        for (const increase of [0, 1]) {
          for (const broad of [false, true]) {
            const firstMoves = testFirstMoves(broad, increase);
            for (const first of firstMoves) {
              const original = allLayoutNodes.map(node => ({ node, x: node.x, y: node.y }));
              first.node.x = first.target.x; first.node.y = first.target.y;
              const continuation = [];
              let layout = first.after;
              for (let step = 0; step < 4 && layout.visualIntersectionCount > 0; step++) {
                let moves = rankedMoves(layout);
                if (!moves.length) moves = rankedMoves(layout, true);
                if (!moves.length) moves = rankedMoves(layout, true, true);
                if (!moves.length) break;
                const move = moves[0];
                move.node.x = move.target.x; move.node.y = move.target.y;
                continuation.push(move);
                layout = move.after;
              }
              original.forEach(({ node, x, y }) => { node.x = x; node.y = y; });
              if (layout.visualIntersectionCount === 0) {
                first.preparatory = true;
                return [first, ...continuation];
              }
            }
          }
        }
        return [];
      };

      const planMoves = initial => {
        const original = allLayoutNodes.map(node => ({ node, x: node.x, y: node.y }));
        let bestPartial = [];
        let bestPartialLayout = initial;
        let visited = 0;
        const SEARCH_BUDGET = 100;
        const BRANCH_LIMIT = 12;

        const search = (before, remaining, path) => {
          if (before.visualIntersectionCount === 0) return path.slice();
          if (!remaining || visited++ >= SEARCH_BUDGET) return null;

          let moves = rankedMoves(before);
          if (!moves.length) moves = rankedMoves(before, true);
          if (!moves.length) moves = rankedMoves(before, true, true);
          if (!moves.length) moves = rankedMoves(before, false, true, 0);
          if (!moves.length) moves = rankedMoves(before, true, true, 0);
          if (!moves.length) moves = rankedMoves(before, false, true, 1);
          if (!moves.length) moves = rankedMoves(before, true, true, 1);
          if (!moves.length) moves = rankedMoves(before, false, true, 2);
          if (!moves.length) moves = rankedMoves(before, true, true, 2);
          for (const move of moves.slice(0, BRANCH_LIMIT)) {
            const startX = move.node.x, startY = move.node.y;
            move.node.x = move.target.x; move.node.y = move.target.y;
            if (compareLayouts(move.after, before) >= 0) {
              move.preparatory = true;
            }
            path.push(move);
            if (compareLayouts(move.after, bestPartialLayout) < 0) {
              bestPartialLayout = move.after;
              bestPartial = path.slice();
            }
            const result = search(move.after, remaining - 1, path);
            path.pop();
            move.node.x = startX; move.node.y = startY;
            if (result) return result;
          }
          return null;
        };

        const maxDepth = Math.min(7, initial.visualIntersectionCount);
        const plan = search(initial, maxDepth, []);
        original.forEach(({ node, x, y }) => { node.x = x; node.y = y; });
        return plan || bestPartial;
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
          solved: initial.visualIntersectionCount === 0
        };
        let current = initial;
        let replans = 0;

        while (current.visualIntersectionCount > 0 && replans++ < 5) {
          let plan = planMoves(current);
          if (!plan.length) plan = escapeLocalMinimum(current);
          if (!plan.length) break;
          let progressed = false;

          for (const move of plan) {
            if (current.visualIntersectionCount === 0 ||
                getState() !== state || getSim() !== sim) break;
            const beforeCount = current.visualIntersectionCount;
            const beforeLayout = current;
            await animateMove(move.node, move.target);
            current = evaluateLayout();
            // Geometry is frozen during a virtual drag, so this should be
            // identical to the private result. Keep the invariant explicit:
            // a future rendering change can never silently add an unverified
            // move (ordinary moves improve immediately; preparatory moves
            // stay within the planner's tightly bounded setup allowance).
            if ((!move.preparatory && compareLayouts(current, beforeLayout) >= 0) ||
                (move.preparatory && current.visualIntersectionCount > beforeCount + 2)) {
              move.node.x = move.startX;
              move.node.y = move.startY;
              move.node.fx = null;
              move.node.fy = null;
              renderPositions();
              break;
            }
            progressed = true;
            stats.moves.push({
              node: move.node.isTitleNode ? `${move.node.word} (title)` : move.node.word,
              before: beforeCount,
              after: current.visualIntersectionCount,
              beforeLineCrossings: beforeLayout.crossingCount,
              afterLineCrossings: current.crossingCount,
              beforeNodeIntersections: beforeLayout.edgeNodeIntersectionCount,
              afterNodeIntersections: current.edgeNodeIntersectionCount,
              preparatory: !!move.preparatory
            });
            stats.after = current.visualIntersectionCount;
          }
          if (!progressed) break;
        }

        stats.after = current.visualIntersectionCount;
        stats.lineCrossings = current.crossingCount;
        stats.edgeNodeIntersections = current.edgeNodeIntersectionCount;
        stats.solved = current.visualIntersectionCount === 0;
        renderPositions();
        if (getState() === state && getSim() === sim) {
          setMessage(
            current.crossingCount === 0
              ? "Solution shown — every bridge connected and line crossings cleared."
              : "Solution shown — drag any remaining crossed endpoint to finish untangling.",
            current.crossingCount === 0 ? "good" : undefined
          );
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
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

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
    sim.on("tick", renderPositions);
  }

  return { buildStarGraph };
}
