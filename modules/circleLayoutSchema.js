// Shape validation for the optional authored Circle (sets-mode) layout.
// The renderer remains responsible for circle radii, heading placement, and
// bridge geometry; this module validates the persisted coordinate contract.

import { layoutRevision } from "./layoutDocument.js";

export const CIRCLE_LAYOUT_SCHEMA_VERSION = 1;

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function expectedCircleLayoutClusterKeys(puzzle) {
  return puzzle.clusters.map((_, index) => `cluster:${index}`);
}

export function expectedCircleLayoutBridgeKeys(puzzle, bridgeTerms = null) {
  const terms = bridgeTerms || puzzle.bridges.map(bridge => bridge.term);
  return terms.map(term => `term:${term}`);
}

export function validateCircleLayoutDocument(
  layout,
  puzzle,
  expectedBoard = null,
  { bridgeTerms = null, requireBridges = true } = {}
) {
  const errors = [];
  if (!isObject(layout)) {
    return { valid: false, errors: ["Circle layout must be an object"] };
  }
  if (layout.schemaVersion !== CIRCLE_LAYOUT_SCHEMA_VERSION) {
    errors.push(`Circle layout schemaVersion must be ${CIRCLE_LAYOUT_SCHEMA_VERSION}`);
  }
  if (layout.puzzleId !== puzzle.id) {
    errors.push(`Circle layout puzzleId must be "${puzzle.id}"`);
  }
  if (layout.puzzleRevision !== layoutRevision(puzzle)) {
    errors.push("Circle layout puzzle revision is stale");
  }

  const width = Number(layout.board?.width);
  const height = Number(layout.board?.height);
  if (!(width > 0) || !(height > 0)) {
    errors.push("Circle layout board.width and board.height must be positive numbers");
  }
  if (expectedBoard &&
      (width !== Number(expectedBoard.width) || height !== Number(expectedBoard.height))) {
    errors.push("Circle layout board size does not match");
  }
  if (layout.stripHeight != null &&
      (!Number.isFinite(Number(layout.stripHeight)) || Number(layout.stripHeight) < 0)) {
    errors.push("Circle layout stripHeight must be a non-negative number");
  }

  const validatePoints = (value, allowedKeys, requiredKeys, label) => {
    if (!isObject(value)) {
      if (requiredKeys.length) errors.push(`Circle layout ${label} must be an object`);
      return;
    }
    const allowed = new Set(allowedKeys);
    Object.keys(value).forEach(key => {
      if (!allowed.has(key)) errors.push(`unknown ${label} key "${key}"`);
    });
    requiredKeys.forEach(key => {
      const point = value[key];
      if (!isObject(point) ||
          !Number.isFinite(Number(point.x)) ||
          !Number.isFinite(Number(point.y))) {
        errors.push(`${key} must have finite x/y coordinates`);
      } else if (width > 0 && height > 0 &&
                 (point.x < 0 || point.x > width || point.y < 0 || point.y > height)) {
        errors.push(`${key} lies outside the board`);
      }
    });
  };

  validatePoints(
    layout.circles,
    expectedCircleLayoutClusterKeys(puzzle),
    expectedCircleLayoutClusterKeys(puzzle),
    "circles"
  );

  const allBridgeKeys = expectedCircleLayoutBridgeKeys(puzzle);
  const requiredBridgeKeys = expectedCircleLayoutBridgeKeys(puzzle, bridgeTerms);
  const bridgeKeys = requireBridges ? allBridgeKeys : requiredBridgeKeys;
  if (layout.bridges != null || requireBridges || bridgeKeys.length) {
    validatePoints(layout.bridges, allBridgeKeys, bridgeKeys, "bridges");
  }

  if (layout.metrics != null && !isObject(layout.metrics)) {
    errors.push("Circle layout metrics must be an object");
  }

  return { valid: errors.length === 0, errors };
}
