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

function clusterAnchors(order, rotation, width, height, scale) {
  const anchors = new Array(order.length);
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
    const hubWord = cluster.seeds[0];
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
  const orders = permutationsWithFirstFixed(puzzle.clusters.length);
  const rotations = Array.from({ length: 12 }, (_, i) =>
    -Math.PI / 2 + i * Math.PI * 2 / 12
  );
  const scales = [0.88, 1];
  let best = null;

  orders.forEach(order => rotations.forEach(rotation => scales.forEach(scale => {
    const anchors = clusterAnchors(order, rotation, width, height, scale);
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
    const anchorOf = node => {
      const points = node.gs.map(ci => anchors[ci]);
      return {
        x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
        y: points.reduce((sum, point) => sum + point.y, 0) / points.length
      };
    };
    const simulation = d3.forceSimulation(clones)
      .randomSource(d3.randomLcg(0.42))
      .force("link", d3.forceLink(cloneLinks).distance(link =>
        link.source.gs.length > 1 ? 92 : 70
      ).strength(0.85))
      .force("charge", d3.forceManyBody().strength(-210))
      .force("collide", d3.forceCollide().radius(node => node.w / 2 + 10).iterations(3))
      .force("x", d3.forceX(node => anchorOf(node).x).strength(node =>
        node.gs.length > 1 ? 0.08 : 0.16
      ))
      .force("y", d3.forceY(node => anchorOf(node).y).strength(node =>
        node.gs.length > 1 ? 0.08 : 0.16
      ))
      .stop();
    for (let tick = 0; tick < 360; tick++) {
      simulation.tick();
      clones.forEach(node => clampNode(node, width, height));
    }
    simulation.stop();
    const metrics = scoreGraphGeometry(clones, cloneLinks, width, height);
    if (!best || metrics.score < best.metrics.score) {
      best = {
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
  })));
  return best;
}
