// Shape validation for the optional authored Graph layout.
//
// This module is deliberately independent of the Graph renderer. The
// renderer knows how to apply coordinates; the persistence and publication
// paths only need to validate the stable document contract.

import { layoutRevision } from "./layoutDocument.js";

export const GRAPH_LAYOUT_SCHEMA_VERSION = 1;
const REQUIRED_GRAPH_METRICS = [
  "lineCrossings",
  "edgeNodeIntersections",
  "overlaps"
];

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function expectedGraphLayoutNodeKeys(puzzle) {
  return [
    ...puzzle.clusters.flatMap(cluster => cluster.terms.map(term => `term:${term}`)),
    ...puzzle.bridges.map(bridge => `term:${bridge.term}`)
  ];
}

export function validateGraphLayoutDocument(
  layout,
  puzzle,
  expectedBoard = null,
  { allowUnsafe = false } = {}
) {
  const errors = [];
  if (!isObject(layout)) {
    return { valid: false, errors: ["Graph layout must be an object"] };
  }
  if (layout.schemaVersion !== GRAPH_LAYOUT_SCHEMA_VERSION) {
    errors.push(`Graph layout schemaVersion must be ${GRAPH_LAYOUT_SCHEMA_VERSION}`);
  }
  if (layout.puzzleId !== puzzle.id) {
    errors.push(`Graph layout puzzleId must be "${puzzle.id}"`);
  }
  if (layout.puzzleRevision !== layoutRevision(puzzle)) {
    errors.push("Graph layout puzzle revision is stale");
  }

  const width = Number(layout.board?.width);
  const height = Number(layout.board?.height);
  if (!(width > 0) || !(height > 0)) {
    errors.push("Graph layout board.width and board.height must be positive numbers");
  }
  if (expectedBoard &&
      (width !== Number(expectedBoard.width) || height !== Number(expectedBoard.height))) {
    errors.push("Graph layout board size does not match");
  }

  const positions = layout.nodes;
  if (!isObject(positions)) {
    errors.push("Graph layout nodes must be an object");
  } else {
    const expected = new Set(expectedGraphLayoutNodeKeys(puzzle));
    Object.keys(positions).forEach(key => {
      if (!expected.has(key)) errors.push(`unknown node key "${key}"`);
    });
    expected.forEach(key => {
      const point = positions[key];
      if (!isObject(point) ||
          !Number.isFinite(Number(point.x)) ||
          !Number.isFinite(Number(point.y))) {
        errors.push(`${key} must have finite x/y coordinates`);
      } else if (width > 0 && height > 0 &&
                 (point.x < 0 || point.x > width || point.y < 0 || point.y > height)) {
        errors.push(`${key} lies outside the board`);
      }
    });
  }

  if (layout.metrics == null) {
    if (!allowUnsafe) errors.push("Graph layout metrics are required");
  } else if (!isObject(layout.metrics)) {
    errors.push("Graph layout metrics must be an object");
  } else {
    REQUIRED_GRAPH_METRICS.forEach(name => {
      const value = layout.metrics[name];
      if (value == null) {
        if (!allowUnsafe) errors.push(`Graph layout metrics.${name} is required`);
      } else if (!Number.isInteger(value) || value < 0) {
        errors.push(`Graph layout metrics.${name} must be a non-negative integer`);
      }
    });
    if (!allowUnsafe && layout.metrics.lineCrossings !== 0) {
      errors.push("Graph layouts must have zero line crossings");
    }
  }

  return { valid: errors.length === 0, errors };
}
