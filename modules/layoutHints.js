// Saved Graph and Circle layouts as hints rather than coordinates.
//
// A saved layout is exact only when its author marks it `fixed`; anything
// saved before the flag existed counts as fixed, so no published board
// changes on its own. Otherwise -- and whenever a fixed layout no longer
// matches the puzzle or board -- the engines read the layout's
// arrangement instead of its positions: the cyclic order of clusters
// around the board centre, the overall rotation, each term's offset from
// its cluster's centre (Graph), and each bridge's offset from the clusters
// it joins (Circle). Cluster angles are measured around the saved clusters'
// own centroid, which lies inside the shape they form, so the cyclic order
// read back is that shape's order even when the layout sits off-centre;
// the engines then lay that order on their ring around the board centre.
// That arrangement survives renamed or added terms, a
// different board size, and smaller or larger circles, where exact
// coordinates do not.

const TAU = Math.PI * 2;

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function finitePoint(point) {
  return isObject(point) && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y));
}

// Layouts saved before `fixed` existed were curated as exact positions.
export function layoutIsFixed(layout) {
  return layout?.fixed !== false;
}

/**
 * The minimum a layout needs to serve as a hint: the right puzzle and
 * finite coordinates. Revision, board size, key sets, and metrics are
 * deliberately not checked -- surviving their changes is the point.
 */
export function validateLayoutHintShape(mode, layout, puzzle) {
  const errors = [];
  const label = { graph: "Graph", sets: "Circle", star: "Star" }[mode] || mode;
  if (!isObject(layout)) return { valid: false, errors: [`${label} layout must be an object`] };
  if (layout.puzzleId !== puzzle.id) errors.push(`${label} layout puzzleId must be "${puzzle.id}"`);
  if (layout.fixed != null && typeof layout.fixed !== "boolean") {
    errors.push(`${label} layout fixed must be true or false`);
  }
  const groups = mode === "sets" ? [["circles", true], ["bridges", false]] : [["nodes", true]];
  groups.forEach(([key, required]) => {
    const points = layout[key];
    if (points == null && !required) return;
    if (!isObject(points)) {
      errors.push(`${label} layout ${key} must be an object`);
      return;
    }
    Object.entries(points).forEach(([name, point]) => {
      if (!finitePoint(point)) errors.push(`${name} must have finite x/y coordinates`);
    });
    if (required && !Object.keys(points).length) errors.push(`${label} layout ${key} has no positions`);
  });
  if (mode === "sets" && layout.clusterTerms != null && !isObject(layout.clusterTerms)) {
    errors.push("Circle layout clusterTerms must be an object");
  }
  // Optional stacking order per circle; a mismatched one is ignored on load.
  if (mode === "sets" && layout.memberOrders != null && (!isObject(layout.memberOrders) ||
      !Object.values(layout.memberOrders).every(order => Array.isArray(order) && order.every(term => typeof term === "string")))) {
    errors.push("Circle layout memberOrders must map circles to lists of terms");
  }
  return { valid: errors.length === 0, errors };
}

function mean(points) {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length
  };
}

// Board-normalised angle, so a wide board's ellipse and a square one read
// the same arrangement the same way.
function boardAngle(point, centre, board) {
  return Math.atan2((point.y - centre.y) / board.height, (point.x - centre.x) / board.width);
}

function circularMean(angles) {
  const s = angles.reduce((sum, angle) => sum + Math.sin(angle), 0);
  const c = angles.reduce((sum, angle) => sum + Math.cos(angle), 0);
  return Math.atan2(s, c);
}

export function angleDistance(a, b) {
  const d = Math.abs(((a - b) % TAU + TAU) % TAU);
  return Math.min(d, TAU - d);
}

// Cyclic order (starting at cluster 0, as both searches do) and the ring
// rotation that best reproduces the saved angles. Clusters without a saved
// centre take the remaining slots.
function ringHint(centres, board) {
  const known = centres
    .map((centre, ci) => (centre ? { ci, centre } : null))
    .filter(Boolean);
  // A lone cluster has no ring to read, only its own spot.
  if (centres.length === 1 && known.length === 1) {
    return { order: [0], rotation: 0, angles: new Map([[0, 0]]), middle: known[0].centre };
  }
  if (known.length < 2) return null;
  const middle = mean(known.map(entry => entry.centre));
  known.forEach(entry => { entry.angle = boardAngle(entry.centre, middle, board); });
  const cyclic = known.slice().sort((a, b) => a.angle - b.angle).map(entry => entry.ci);
  const unknown = centres.map((_, ci) => ci).filter(ci => !centres[ci]);
  const ring = [...cyclic, ...unknown];
  const start = ring.indexOf(0);
  const order = [...ring.slice(start), ...ring.slice(0, start)];
  const n = order.length;
  const rotation = circularMean(known.map(entry =>
    entry.angle - order.indexOf(entry.ci) * TAU / n
  ));
  const angles = new Map(known.map(entry => [entry.ci, entry.angle]));
  return { order, rotation, angles, middle };
}

// Saved board size, falling back to the current board for each dimension
// that is not a finite positive number (a malformed one would mirror or
// collapse the arrangement).
function boardOf(layout, fallback) {
  const usable = value => Number.isFinite(value) && value > 0;
  const width = Number(layout.board?.width);
  const height = Number(layout.board?.height);
  return {
    width: usable(width) ? width : fallback.width,
    height: usable(height) ? height : fallback.height
  };
}

/**
 * Graph hint. Terms are keyed by word, so clusters match by membership
 * automatically: a cluster's saved centre is the mean of its current
 * terms' saved positions.
 */
export function graphLayoutHint(layout, puzzle, board) {
  if (!validateLayoutHintShape("graph", layout, puzzle).valid) return null;
  const saved = word => {
    const point = layout.nodes[`term:${word}`];
    return point ? { x: Number(point.x), y: Number(point.y) } : null;
  };
  const centres = puzzle.clusters.map(cluster => {
    const points = cluster.terms.map(saved).filter(Boolean);
    return points.length ? mean(points) : null;
  });
  const ring = ringHint(centres, boardOf(layout, board));
  if (!ring) return null;
  // Each term's offset from its cluster centre, in the saved board's
  // proportions, plus the saved cluster angle so the engine can turn the
  // whole group with its new slot on the ring.
  const scaleX = board.width / boardOf(layout, board).width;
  const scaleY = board.height / boardOf(layout, board).height;
  const termOffsets = new Map();
  puzzle.clusters.forEach((cluster, ci) => {
    const centre = centres[ci];
    if (!centre) return;
    cluster.terms.forEach(word => {
      const point = saved(word);
      if (point) {
        termOffsets.set(word, {
          ci,
          dx: (point.x - centre.x) * scaleX,
          dy: (point.y - centre.y) * scaleY
        });
      }
    });
  });
  return { order: ring.order, rotation: ring.rotation, clusterAngles: ring.angles, termOffsets };
}

// Index of the current cluster each saved circle belongs to: the one
// sharing the most terms with its saved membership, else the same index.
function matchCircles(layout, puzzle) {
  const saved = Object.keys(layout.circles)
    .map(key => ({ key, index: Number(key.slice("cluster:".length)) }))
    .filter(entry => Number.isInteger(entry.index));
  const membership = isObject(layout.clusterTerms) ? layout.clusterTerms : null;
  const claimed = new Map();
  saved.forEach(entry => {
    let ci = null;
    const terms = membership && Array.isArray(membership[entry.key]) ? membership[entry.key] : null;
    if (terms) {
      let best = 0;
      puzzle.clusters.forEach((cluster, index) => {
        const shared = cluster.terms.filter(term => terms.includes(term)).length;
        if (shared > best) { best = shared; ci = index; }
      });
    } else if (entry.index < puzzle.clusters.length) {
      ci = entry.index;
    }
    if (ci != null && !claimed.has(ci)) claimed.set(ci, entry.key);
  });
  return claimed;
}

/**
 * Circle hint. Saved circles map to current clusters by shared terms when
 * the layout recorded membership, else by index. Bridge offsets are
 * relative to the centroid of the circles each bridge joins.
 */
export function circleLayoutHint(layout, puzzle, board) {
  if (!validateLayoutHintShape("sets", layout, puzzle).valid) return null;
  const matched = matchCircles(layout, puzzle);
  const centres = puzzle.clusters.map((_, ci) => {
    const key = matched.get(ci);
    const point = key ? layout.circles[key] : null;
    return point ? { x: Number(point.x), y: Number(point.y) } : null;
  });
  const savedBoard = boardOf(layout, board);
  const ring = ringHint(centres, savedBoard);
  if (!ring) return null;
  const scaleX = board.width / savedBoard.width;
  const scaleY = board.height / savedBoard.height;
  const bridgeOffsets = new Map();
  puzzle.bridges.forEach(bridge => {
    const point = layout.bridges?.[`term:${bridge.term}`];
    const joined = bridge.clusters.map(ci => centres[ci]);
    if (!finitePoint(point) || joined.some(centre => !centre)) return;
    const centroid = mean(joined);
    bridgeOffsets.set(bridge.term, {
      dx: (Number(point.x) - centroid.x) * scaleX,
      dy: (Number(point.y) - centroid.y) * scaleY
    });
  });
  return {
    order: ring.order,
    rotation: ring.rotation,
    bridgeOffsets,
    centres: centres.map(centre => (centre ? { x: centre.x * scaleX, y: centre.y * scaleY } : null))
  };
}

// Turn an offset by the change in its group's angle on the ring.
export function rotateOffset(offset, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return { x: offset.dx * cos - offset.dy * sin, y: offset.dx * sin + offset.dy * cos };
}


/**
 * Star targets from a saved Star layout, never discarding it. A layout
 * that still matches exactly is used as is. Otherwise it is adapted:
 * positions scale to the current board, each cluster title is matched to
 * the saved title nearest its saved terms (so reordered clusters keep
 * their places), and only nodes the layout never saw are placed here --
 * terms around their cluster's title, bridges between their titles.
 * Returns null only when the layout belongs to another puzzle or has no
 * usable positions.
 */
export function starLayoutTargets(layout, puzzle, layoutNodes, board, { exact = false } = {}) {
  if (!isObject(layout) || layout.puzzleId !== puzzle.id || !isObject(layout.nodes)) return null;
  const saved = key => (finitePoint(layout.nodes[key])
    ? { x: Number(layout.nodes[key].x), y: Number(layout.nodes[key].y) }
    : null);
  if (exact) {
    return {
      exact: true,
      placed: 0,
      targets: new Map(layoutNodes.map(node => [node, saved(node.isTitleNode ? `cluster:${node.ci}` : `term:${node.word}`)]))
    };
  }
  const savedBoard = boardOf(layout, board);
  const sx = board.width / savedBoard.width, sy = board.height / savedBoard.height;
  const scaled = point => (point ? { x: point.x * sx, y: point.y * sy } : null);
  const targets = new Map();
  let placed = 0;

  const terms = layoutNodes.filter(node => !node.isTitleNode);
  terms.forEach(node => {
    const point = scaled(saved(`term:${node.word}`));
    if (point) targets.set(node, point);
  });

  // Titles: the saved title nearest the centroid of the cluster's saved
  // member terms, else the same index.
  const savedTitles = Object.keys(layout.nodes)
    .filter(key => key.startsWith("cluster:"))
    .map(key => ({ key, point: scaled(saved(key)) }))
    .filter(entry => entry.point);
  const claimed = new Set();
  const titles = layoutNodes.filter(node => node.isTitleNode);
  titles.forEach(node => {
    const members = puzzle.clusters[node.ci].terms
      .map(word => scaled(saved(`term:${word}`)))
      .filter(Boolean);
    let pick = null;
    if (members.length) {
      const centre = mean(members);
      savedTitles.forEach(entry => {
        if (claimed.has(entry.key)) return;
        const distance = Math.hypot(entry.point.x - centre.x, entry.point.y - centre.y);
        if (!pick || distance < pick.distance) pick = { ...entry, distance };
      });
    } else {
      const same = savedTitles.find(entry => entry.key === `cluster:${node.ci}` && !claimed.has(entry.key));
      if (same) pick = same;
    }
    if (pick) {
      claimed.add(pick.key);
      targets.set(node, pick.point);
    } else if (members.length) {
      targets.set(node, mean(members));
      placed++;
    } else {
      targets.set(node, { x: node.x, y: node.y });
      placed++;
    }
  });

  // Nodes the layout never saw: a term on a ring around its title, a
  // bridge between the titles it joins.
  const titleTarget = ci => targets.get(titles.find(node => node.ci === ci));
  const perCluster = new Map();
  terms.forEach(node => {
    if (targets.has(node)) return;
    placed++;
    const anchors = (node.gs || []).map(titleTarget).filter(Boolean);
    if (anchors.length > 1) {
      targets.set(node, mean(anchors));
      return;
    }
    const anchor = anchors[0] || { x: board.width / 2, y: board.height / 2 };
    const ci = node.gs?.[0] ?? -1;
    const slot = perCluster.get(ci) || 0;
    perCluster.set(ci, slot + 1);
    const angle = Math.PI / 2 + slot * 0.9;
    targets.set(node, { x: anchor.x + 95 * Math.cos(angle), y: anchor.y + 95 * Math.sin(angle) });
  });
  return { exact: false, placed, targets };
}
