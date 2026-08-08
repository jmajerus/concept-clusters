// Shared schema for optional hand-authored Star-mode layouts.
//
// Layouts deliberately live outside puzzle definitions: most puzzles use
// the runtime pretty-printer, while the few that benefit from editorial
// placement can add one sparse repository artifact. The same document
// shape is used for browser-local drafts and committed overrides, so a
// future online authoring/KV store can replace the storage adapter without
// changing either the renderer or exported files.

export const STAR_LAYOUT_SCHEMA_VERSION = 1;

function revisionSignature(puzzle) {
  return JSON.stringify({
    id: puzzle.id,
    large: !!puzzle.large,
    clusters: puzzle.clusters.map(cluster => ({
      name: cluster.name,
      terms: cluster.terms
    })),
    bridges: puzzle.bridges.map(bridge => ({
      term: bridge.term,
      clusters: bridge.clusters,
      idealTerms: bridge.idealTerms || null
    }))
  });
}

// Small deterministic content fingerprint. This is an invalidation token,
// not a security primitive: changing a label, cluster order, bridge topology,
// or ideal endpoint makes an old layout inapplicable instead of quietly
// attaching its coordinates to the wrong board.
export function starLayoutRevision(puzzle) {
  let hash = 0x811c9dc5;
  for (const char of revisionSignature(puzzle)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

export function starLayoutNodeKey(node) {
  return node.isTitleNode ? `cluster:${node.ci}` : `term:${node.word}`;
}

export function expectedStarLayoutNodeKeys(puzzle) {
  return [
    ...puzzle.clusters.map((_, ci) => `cluster:${ci}`),
    ...puzzle.clusters.flatMap(cluster => cluster.terms.map(term => `term:${term}`)),
    ...puzzle.bridges.map(bridge => `term:${bridge.term}`)
  ];
}

const rounded = value => Math.round(value * 100) / 100;

export function createStarLayoutDocument({ puzzle, width, height, layoutNodes, metrics }) {
  const positions = starLayoutPositions(layoutNodes);
  return {
    schemaVersion: STAR_LAYOUT_SCHEMA_VERSION,
    puzzleId: puzzle.id,
    puzzleRevision: starLayoutRevision(puzzle),
    board: { width, height },
    nodes: positions,
    metrics: {
      lineCrossings: Number(metrics.lineCrossings) || 0,
      edgeNodeIntersections: Number(metrics.edgeNodeIntersections) || 0,
      overlaps: Number(metrics.overlaps) || 0
    }
  };
}

function starLayoutPositions(layoutNodes) {
  const positions = {};
  layoutNodes.forEach(node => {
    positions[starLayoutNodeKey(node)] = {
      x: rounded(node.x),
      y: rounded(node.y)
    };
  });
  return positions;
}

// Player sessions need a position snapshot throughout play, including
// before the solved-only detangler has geometry metrics to report. Keep
// that document distinct from repository/authoring layouts, whose metrics
// remain required and validated by validateStarLayoutDocument().
export function createStarPlayerLayoutDocument({ puzzle, width, height, layoutNodes, solutionLayout = null }) {
  return {
    schemaVersion: STAR_LAYOUT_SCHEMA_VERSION,
    puzzleId: puzzle.id,
    puzzleRevision: starLayoutRevision(puzzle),
    board: { width, height },
    nodes: starLayoutPositions(layoutNodes),
    solutionLayout: ["animated", "pretty"].includes(solutionLayout) ? solutionLayout : null
  };
}

export function validateStarPlayerLayoutDocument(layout, puzzle, expectedBoard = null) {
  const withoutMetrics = {
    ...layout,
    metrics: {
      lineCrossings: 0,
      edgeNodeIntersections: 0,
      overlaps: 0
    }
  };
  return validateStarLayoutDocument(
    withoutMetrics,
    puzzle,
    expectedBoard,
    { allowUnsafe: true }
  );
}

export function validateStarLayoutDocument(
  layout,
  puzzle,
  expectedBoard = null,
  { allowUnsafe = false } = {}
) {
  const errors = [];
  if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
    return { valid: false, errors: ["layout must be a JSON object"] };
  }
  if (layout.schemaVersion !== STAR_LAYOUT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${STAR_LAYOUT_SCHEMA_VERSION}`);
  }
  if (layout.puzzleId !== puzzle.id) {
    errors.push(`puzzleId must be "${puzzle.id}"`);
  }
  const revision = starLayoutRevision(puzzle);
  if (layout.puzzleRevision !== revision) {
    errors.push(`puzzleRevision is stale (expected "${revision}")`);
  }

  const width = Number(layout.board?.width);
  const height = Number(layout.board?.height);
  if (!(width > 0) || !(height > 0)) {
    errors.push("board.width and board.height must be positive numbers");
  }
  if (expectedBoard &&
      (width !== expectedBoard.width || height !== expectedBoard.height)) {
    errors.push(
      `layout board ${width}x${height} does not match current board ` +
      `${expectedBoard.width}x${expectedBoard.height}`
    );
  }

  const positions = layout.nodes;
  if (!positions || typeof positions !== "object" || Array.isArray(positions)) {
    errors.push("nodes must be an object keyed by cluster/term identity");
  } else {
    const expected = new Set(expectedStarLayoutNodeKeys(puzzle));
    Object.keys(positions).forEach(key => {
      if (!expected.has(key)) errors.push(`unknown node key "${key}"`);
    });
    expected.forEach(key => {
      const point = positions[key];
      if (!point) {
        errors.push(`missing node key "${key}"`);
        return;
      }
      const x = Number(point.x), y = Number(point.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        errors.push(`${key} must have finite x/y coordinates`);
      } else if (width > 0 && height > 0 &&
                 (x < 0 || x > width || y < 0 || y > height)) {
        errors.push(`${key} lies outside the ${width}x${height} board`);
      }
    });
  }

  if (!layout.metrics || typeof layout.metrics !== "object") {
    errors.push("metrics are required");
  } else {
    ["lineCrossings", "edgeNodeIntersections", "overlaps"].forEach(name => {
      const value = layout.metrics[name];
      if (!Number.isInteger(value) || value < 0) {
        errors.push(`metrics.${name} must be a non-negative integer`);
      }
    });
    // Line crossings are the only hard geometry reject: residual through-
    // pills and padded AABB "overlaps" are often invisible or acceptable,
    // and curated authoring is the escape hatch for that judgment call.
    // Metrics still record them for the panel / review.
    if (!allowUnsafe && layout.metrics.lineCrossings !== 0) {
      errors.push("authored layouts must have zero line crossings");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function starLayoutTargetMap(layout, layoutNodes) {
  return new Map(layoutNodes.map(node => {
    const point = layout.nodes[starLayoutNodeKey(node)];
    return [node, { x: Number(point.x), y: Number(point.y) }];
  }));
}
