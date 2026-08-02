import { normalizedLensMode } from "./lensEngine.js";
import { IDENTITY_COLOR_KEY_SET } from "./colorPalette.js";

export function validatePuzzleLenses(puzzle) {
  const errors = [];
  const fail = message => errors.push(message);
  const supportedModes = new Set(["sequential", "assignment"]);

  if (puzzle.lensMode !== undefined && !supportedModes.has(puzzle.lensMode)) {
    fail(`unknown lensMode "${puzzle.lensMode}"`);
  }
  if (puzzle.lenses === undefined) {
    if (puzzle.lensMode === "assignment") {
      fail("assignment lens mode requires at least two lenses");
    }
    return errors;
  }
  if (!Array.isArray(puzzle.lenses) || puzzle.lenses.length === 0) {
    fail("lenses must be a non-empty array when present");
    return errors;
  }

  const assignmentMode = normalizedLensMode(puzzle) === "assignment";
  if (assignmentMode && puzzle.lenses.length < 2) {
    fail("assignment lens mode requires at least two lenses");
  }

  const lensIds = new Set();
  const explicitLensColors = new Set();
  const bridgeByTerm = new Map(puzzle.bridges.map(bridge => [bridge.term, bridge]));
  const assignedTargets = new Map();
  puzzle.lenses.forEach((lens, li) => {
    const label = `lenses[${li}]`;
    if (!lens || typeof lens !== "object" || Array.isArray(lens)) {
      fail(`${label}: must be an object`);
      return;
    }
    if (typeof lens.id !== "string" || !lens.id.trim()) {
      fail(`${label}: id must be a non-empty string`);
    } else if (lensIds.has(lens.id)) {
      fail(`${label}: duplicate id "${lens.id}"`);
    } else {
      lensIds.add(lens.id);
    }
    if (typeof lens.prompt !== "string" || !lens.prompt.trim()) {
      fail(`${label}: prompt must be a non-empty string`);
    }
    if (lens.label !== undefined &&
        (typeof lens.label !== "string" || !lens.label.trim())) {
      fail(`${label}: label must be a non-empty string when present`);
    }
    if (lens.definition !== undefined &&
        (typeof lens.definition !== "string" || !lens.definition.trim())) {
      fail(`${label}: definition must be a non-empty string when present`);
    }
    if (lens.color !== undefined) {
      if (!IDENTITY_COLOR_KEY_SET.has(lens.color)) {
        fail(`${label}: unknown lens color "${lens.color}"`);
      } else if (explicitLensColors.has(lens.color)) {
        fail(`${label}: lens color "${lens.color}" is already used by another lens`);
      } else {
        explicitLensColors.add(lens.color);
      }
    }
    if (typeof lens.explanation !== "string" || !lens.explanation.trim()) {
      fail(`${label}: explanation must be a non-empty string`);
    }
    const validTargetCount = assignmentMode
      ? Array.isArray(lens.targets) && lens.targets.length > 0
      : Array.isArray(lens.targets) && lens.targets.length >= 3 && lens.targets.length <= 6;
    if (!validTargetCount) {
      fail(`${label}: targets must ${assignmentMode ? "be a non-empty array" : "contain 3 to 6 terms"}`);
      return;
    }

    const seenTargets = new Set();
    const touchedClusters = new Set();
    lens.targets.forEach((term, ti) => {
      if (typeof term !== "string" || !term.trim()) {
        fail(`${label}.targets[${ti}]: must be a non-empty string`);
        return;
      }
      if (seenTargets.has(term)) {
        fail(`${label}: target "${term}" is listed more than once`);
        return;
      }
      seenTargets.add(term);
      const ordinaryCluster = puzzle.clusters.findIndex(cluster => cluster.terms.includes(term));
      const bridge = bridgeByTerm.get(term);
      if (ordinaryCluster < 0 && !bridge) {
        fail(`${label}: target "${term}" is not a puzzle term`);
      } else if (ordinaryCluster >= 0 && bridge) {
        fail(`${label}: target "${term}" is ambiguous`);
      } else if (bridge) {
        bridge.clusters.forEach(ci => touchedClusters.add(ci));
      } else {
        touchedClusters.add(ordinaryCluster);
      }
      if (assignmentMode && assignedTargets.has(term)) {
        fail(`concept "${term}" appears in lenses "${assignedTargets.get(term)}" and "${lens.id}"`);
      } else if (assignmentMode) {
        assignedTargets.set(term, lens.id);
      }
    });
    if (touchedClusters.size < 2) {
      fail(`${label}: targets must span at least two clusters`);
    }

    if (lens.reasons !== undefined) {
      if (!lens.reasons || typeof lens.reasons !== "object" || Array.isArray(lens.reasons)) {
        fail(`${label}: reasons must be an object when present`);
      } else {
        Object.entries(lens.reasons).forEach(([term, reason]) => {
          if (!seenTargets.has(term)) {
            fail(`${label}.reasons: "${term}" is not one of the targets`);
          }
          if (typeof reason !== "string" || !reason.trim()) {
            fail(`${label}.reasons.${term}: must be a non-empty string`);
          }
        });
      }
    }
  });

  return errors;
}
