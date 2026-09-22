// Deterministic solved-layout search for Graph mode.
//
// A completed Graph board has a useful structure that the ordinary live
// simulation does not exploit: each cluster's terms form a small
// hub-and-spoke group, while bridge nodes connect specific terms between
// those groups. Seed each candidate from that structure, settle the real
// term-level topology with D3 forces, then score the resulting geometry.
// Evaluating the actual settled nodes avoids the inaccurate
// cluster-centroid proxy that an earlier Star experiment had to abandon.

import {
  centeredRect,
  rectsOverlap,
  segmentFromPoints,
  segmentIntersectsRect,
  segmentsIntersect
} from "./geometry.js";
import { singleClusterTermHome } from "./lensLayout.js";

const PILL_H = 30;
const SEARCH_CLUSTER_CAP = 7;
const rounded = value => Math.round(value * 100) / 100;

function permutationsWithFirstFixed(count) {
  const identity = Array.from({ length: count }, (_, i) => i);
  if (count > SEARCH_CLUSTER_CAP) return [identity];
  const rest = identity.slice(1);
  const out = [];
  const visit = index => {
    if (index === rest.length) {
      out.push([0, ...rest]);
      return;
    }
    for (let i = index; i < rest.length; i++) {
      [rest[index], rest[i]] = [rest[i], rest[index]];
      visit(index + 1);
      [rest[index], rest[i]] = [rest[i], rest[index]];
    }
  };
  visit(0);
  return out;
}

function clusterAnchors(order, rotation, width, height, scale, placement = null) {
  const anchors = new Array(order.length);
  if (placement) {
    anchors[order[0]] = placement;
    return anchors;
  }
  const rx = width * (order.length > 3 ? 0.31 : 0.29) * scale;
  const ry = height * 0.29 * scale;
  order.forEach((clusterIndex, slot) => {
    const angle = rotation + slot * Math.PI * 2 / order.length;
    anchors[clusterIndex] = {
      x: width / 2 + rx * Math.cos(angle),
      y: height / 2 + ry * Math.sin(angle),
      angle
    };
  });
  return anchors;
}

// A lone cluster's home, then the same point eased toward the board
// center. The search keeps the home when it settles cleanly, and only
// steps inward when that home cannot.
function loneClusterPlacements(width, height) {
  const home = singleClusterTermHome(width, height);
  const angle = Math.atan2(height / 2 - home.y, width / 2 - home.x);
  return [0, 0.22, 0.45, 0.7].map(blend => ({
    x: home.x + (width / 2 - home.x) * blend,
    y: home.y + (height / 2 - home.y) * blend,
    angle,
    blend
  }));
}

function placeLoneClusterFan(members, hub, anchor, width, height, positions) {
  const others = members
    .filter(node => node !== hub)
    .sort((a, b) => a.word.localeCompare(b.word));
  const arc = others.reduce((sum, node) => sum + node.w + 22, 0);
  let radius = others.length ? Math.max(96, arc / Math.PI + 6) : 0;
  let hubX = anchor.x;
  let hubY = anchor.y;
  // A rightward semicircle keeps every spoke clear of the other labels.
  // If the lower-left home is too close to the bottom for that radius,
  // lift the hub only as far as the semicircle needs — still left.
  const room = () => Math.min(hubY - 28, height - hubY - 28, width - hubX - 36);
  while (others.length && radius > room() && hubY > height * 0.46) hubY -= 6;
  if (others.length) radius = Math.min(radius, Math.max(72, room()));
  if (hub) positions.set(hub.id, { x: hubX, y: hubY });
  let cursor = 0;
  others.forEach(node => {
    const mid = cursor + (node.w + 22) / 2;
    const angle = -Math.PI / 2 + (mid / arc) * Math.PI;
    cursor += node.w + 22;
    positions.set(node.id, {
      x: hubX + Math.cos(angle) * radius,
      y: hubY + Math.sin(angle) * radius
    });
  });
}

function endpointId(endpoint) {
  return typeof endpoint === "object" ? endpoint.id : endpoint;
}

function seedCandidate(puzzle, nodes, anchors, width, height) {
  const positions = new Map();
  const bridgeDestinations = new Map();
  puzzle.bridges.forEach(bridge => {
    const destinations = bridge.clusters.map(ci => anchors[ci]);
    bridgeDestinations.set(bridge.term, {
      x: destinations.reduce((sum, point) => sum + point.x, 0) / destinations.length,
      y: destinations.reduce((sum, point) => sum + point.y, 0) / destinations.length
    });
  });

  puzzle.clusters.forEach((cluster, ci) => {
    const anchor = anchors[ci];
    const inward = Math.atan2(height / 2 - anchor.y, width / 2 - anchor.x);
    const hubWord = cluster.seeds?.[0];
    const members = cluster.terms
      .map(word => nodes.find(node => node.word === word))
      .filter(Boolean);
    const hub = members.find(node => node.word === hubWord) || members[0];
    if (hub) positions.set(hub.id, { x: anchor.x, y: anchor.y });

    const bridgeTargets = new Set();
    puzzle.bridges.forEach(bridge => {
      bridge.clusters.forEach((bridgeCi, side) => {
        if (bridgeCi !== ci) return;
        bridgeTargets.add(
          bridge.idealTerms?.[side] || cluster.seeds[0]
        );
      });
    });
    const inwardMembers = members
      .filter(node => node !== hub && bridgeTargets.has(node.word))
      .sort((a, b) => a.word.localeCompare(b.word));
    const outwardMembers = members
      .filter(node => node !== hub && !bridgeTargets.has(node.word))
      .sort((a, b) => a.word.localeCompare(b.word));

    const placeFan = (group, angle, radius, spread) => {
      group.forEach((node, index) => {
        const offset = group.length === 1
          ? 0
          : (index / (group.length - 1) - 0.5) * spread;
        const nodeAngle = angle + offset;
        // Alternating radii prevent adjacent long labels from stacking
        // directly across the same narrow arc.
        const nodeRadius = radius + (index % 2) * 18;
        positions.set(node.id, {
          x: anchor.x + Math.cos(nodeAngle) * nodeRadius,
          y: anchor.y + Math.sin(nodeAngle) * nodeRadius
        });
      });
    };
    // On a ring, bridge terms face the board and the rest face away.
    // A lone cluster opens one fan into the free board, with each spoke
    // clear of the neighboring pills. A shared arc that is tighter than
    // the labels collapses under the solver and the spokes cut through them.
    if (puzzle.clusters.length === 1) {
      placeLoneClusterFan(members, hub, anchor, width, height, positions);
      return;
    }
    placeFan(inwardMembers, inward, 66, Math.min(1.25, inwardMembers.length * 0.48));
    placeFan(outwardMembers, inward + Math.PI, 76, Math.min(1.75, outwardMembers.length * 0.64));
  });

  puzzle.bridges.forEach(bridge => {
    const node = nodes.find(candidate => candidate.word === bridge.term);
    if (!node) return;
    const point = bridgeDestinations.get(bridge.term);
    positions.set(node.id, point);
  });
  return positions;
}

function clampNode(node, width, height) {
  const halfW = node.w / 2;
  node.x = Math.max(halfW + 8, Math.min(width - halfW - 8, node.x));
  node.y = Math.max(PILL_H / 2 + 8, Math.min(height - PILL_H / 2 - 8, node.y));
}

export function scoreGraphGeometry(nodes, links, width, height) {
  let overlaps = 0;
  let lineCrossings = 0;
  let edgeNodeIntersections = 0;
  let boundsViolations = 0;
  let totalLength = 0;

  nodes.forEach(node => {
    const rect = centeredRect(node, node.w, PILL_H);
    if (rect.left < 6 || rect.right > width - 6 ||
        rect.top < 6 || rect.bottom > height - 6) {
      boundsViolations++;
    }
  });
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (rectsOverlap(
        centeredRect(nodes[i], nodes[i].w, PILL_H, 4),
        centeredRect(nodes[j], nodes[j].w, PILL_H, 4)
      )) overlaps++;
    }
  }

  const segments = links.map(link => ({
    source: typeof link.source === "object"
      ? link.source
      : nodes.find(node => node.id === link.source),
    target: typeof link.target === "object"
      ? link.target
      : nodes.find(node => node.id === link.target)
  })).filter(segment => segment.source && segment.target)
    .map(segment => ({
      ...segment,
      geometry: segmentFromPoints(segment.source, segment.target)
    }));

  segments.forEach(segment => {
    totalLength += Math.hypot(
      segment.target.x - segment.source.x,
      segment.target.y - segment.source.y
    );
    nodes.forEach(node => {
      if (node === segment.source || node === segment.target) return;
      if (segmentIntersectsRect(
        segment.geometry,
        centeredRect(node, node.w, PILL_H, 3)
      )) {
        edgeNodeIntersections++;
      }
    });
  });
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i], b = segments[j];
      if (a.source === b.source || a.source === b.target ||
          a.target === b.source || a.target === b.target) continue;
      if (segmentsIntersect(a.geometry, b.geometry)) lineCrossings++;
    }
  }

  const hardOverlaps = overlaps + boundsViolations;
  return {
    hardOverlaps,
    overlaps,
    boundsViolations,
    lineCrossings,
    edgeNodeIntersections,
    totalLength: rounded(totalLength),
    score: hardOverlaps * 1e9 +
      lineCrossings * 1e7 +
      edgeNodeIntersections * 1e6 +
      totalLength
  };
}

export function computePrettyGraphLayout({
  d3, puzzle, nodes, links, width, height
}) {
  const pinned = new Map(nodes
    .filter(node => Number.isFinite(node.fx) && Number.isFinite(node.fy))
    .map(node => [node.id, { x: node.fx, y: node.fy }]));
  const loneCluster = puzzle.clusters.length === 1;
  const orders = permutationsWithFirstFixed(puzzle.clusters.length);
  const rotations = loneCluster
    ? [0]
    : Array.from({ length: 12 }, (_, i) => -Math.PI / 2 + i * Math.PI * 2 / 12);
  const scales = loneCluster ? [1] : [0.88, 1];
  const placements = loneCluster ? loneClusterPlacements(width, height) : [null];
  let best = null;

  orders.forEach(order => rotations.forEach(rotation => scales.forEach(scale => {
    placements.forEach(placement => {
    const anchors = clusterAnchors(order, rotation, width, height, scale, placement);
    const seeded = seedCandidate(puzzle, nodes, anchors, width, height);
    const clones = nodes.map(node => {
      const point = pinned.get(node.id) || seeded.get(node.id) || {
        x: width / 2,
        y: height / 2
      };
      return {
        id: node.id,
        word: node.word,
        w: node.w,
        gs: node.gs,
        x: point.x,
        y: point.y,
        fx: pinned.has(node.id) ? point.x : null,
        fy: pinned.has(node.id) ? point.y : null
      };
    });
    const byId = new Map(clones.map(node => [node.id, node]));
    const cloneLinks = links.map(link => ({
      source: byId.get(endpointId(link.source)),
      target: byId.get(endpointId(link.target))
    }));
    const sharedAnchor = node => {
      const points = node.gs.map(ci => anchors[ci]);
      return {
        x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
        y: points.reduce((sum, point) => sum + point.y, 0) / points.length
      };
    };
    // A lone cluster's seed is already the layout. Hold each term on
    // that spot; pulling everyone to one shared point erases the fan
    // and the spokes start cutting through pills.
    const anchorOf = node => loneCluster
      ? (seeded.get(node.id) || { x: width / 2, y: height / 2 })
      : sharedAnchor(node);
    const simulation = d3.forceSimulation(clones)
      .randomSource(d3.randomLcg(0.42))
      .force("link", d3.forceLink(cloneLinks).distance(link =>
        link.source.gs.length > 1 ? 92 : loneCluster ? 110 : 70
      ).strength(loneCluster ? 0.2 : 0.85))
      .force("charge", d3.forceManyBody().strength(loneCluster ? -24 : -210))
      .force("collide", d3.forceCollide().radius(node => node.w / 2 + 10).iterations(3))
      .force("x", d3.forceX(node => anchorOf(node).x).strength(node =>
        loneCluster ? 0.85 : node.gs.length > 1 ? 0.08 : 0.16
      ))
      .force("y", d3.forceY(node => anchorOf(node).y).strength(node =>
        loneCluster ? 0.85 : node.gs.length > 1 ? 0.08 : 0.16
      ))
      .stop();
    let metrics = scoreGraphGeometry(clones, cloneLinks, width, height);
    const seedIsClean = loneCluster &&
      metrics.hardOverlaps === 0 &&
      metrics.lineCrossings === 0 &&
      metrics.edgeNodeIntersections === 0 &&
      metrics.boundsViolations === 0;
    if (!seedIsClean) {
      for (let tick = 0; tick < (loneCluster ? 120 : 360); tick++) {
        simulation.tick();
        clones.forEach(node => clampNode(node, width, height));
      }
      metrics = scoreGraphGeometry(clones, cloneLinks, width, height);
    }
    simulation.stop();
    // A clean lower-left home beats an equally clean step toward center.
    // One real overlap or spoke collision still outweighs that preference.
    const placed = metrics.score + (placement?.blend || 0) * 4000;
    if (!best || placed < best.placed) {
      best = {
        placed,
        metrics,
        order: order.slice(),
        rotation: rounded(rotation),
        scale,
        positions: new Map(clones.map(node => [
          node.id,
          { x: rounded(node.x), y: rounded(node.y) }
        ]))
      };
    }
    });
  })));
  return best;
}
