import { normalizedLensMode } from "./lensEngine.js";
import { IDENTITY_COLOR_KEY_SET } from "./colorPalette.js";

export function validatePuzzleLenses(puzzle) {
  const errors = [];
  const fail = message => errors.push(message);
  const supportedModes = new Set(["sequential", "assignment", "quiz"]);

  if (puzzle.lensMode !== undefined && !supportedModes.has(puzzle.lensMode)) {
    fail(`unknown lensMode "${puzzle.lensMode}"`);
  }
  if (puzzle.preSolve !== undefined && typeof puzzle.preSolve !== "boolean") {
    fail("preSolve must be a boolean when present");
  } else if (puzzle.preSolve === true && !puzzle.lenses?.length) {
    fail("preSolve requires at least one lens -- there would be nothing to jump ahead to");
  }
  if (puzzle.lenses === undefined) {
    if (puzzle.lensMode === "assignment") {
      fail("assignment lens mode requires at least two lenses");
    } else if (puzzle.lensMode === "quiz") {
      fail("quiz lens mode requires at least one lens");
    }
    return errors;
  }
  if (!Array.isArray(puzzle.lenses) || puzzle.lenses.length === 0) {
    fail("lenses must be a non-empty array when present");
    return errors;
  }

  const assignmentMode = normalizedLensMode(puzzle) === "assignment";
  const quizMode = normalizedLensMode(puzzle) === "quiz";
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

    if (quizMode) {
      if (!Array.isArray(lens.options) || lens.options.length < 2) {
        fail(`${label}: options must be an array with at least two entries`);
        return;
      }
      const optionIds = new Set();
      const seenTargets = new Set();
      let correctCount = 0;
      lens.options.forEach((option, oi) => {
        const optionLabel = `${label}.options[${oi}]`;
        if (!option || typeof option !== "object" || Array.isArray(option)) {
          fail(`${optionLabel}: must be an object`);
          return;
        }
        if (typeof option.id !== "string" || !option.id.trim()) {
          fail(`${optionLabel}: id must be a non-empty string`);
        } else if (optionIds.has(option.id)) {
          fail(`${optionLabel}: duplicate option id "${option.id}"`);
        } else {
          optionIds.add(option.id);
        }
        if (typeof option.label !== "string" || !option.label.trim()) {
          fail(`${optionLabel}: label must be a non-empty string`);
        }
        if (option.correct === true) {
          correctCount++;
        } else if (option.correct !== undefined && option.correct !== false) {
          fail(`${optionLabel}: correct must be true, false, or omitted`);
        }
        if (option.targets !== undefined && !Array.isArray(option.targets)) {
          fail(`${optionLabel}: targets must be an array when present`);
          return;
        }
        (option.targets || []).forEach((term, ti) => {
          if (typeof term !== "string" || !term.trim()) {
            fail(`${optionLabel}.targets[${ti}]: must be a non-empty string`);
            return;
          }
          if (seenTargets.has(term)) {
            fail(`${label}: target "${term}" is listed in more than one option`);
            return;
          }
          seenTargets.add(term);
          const ordinaryCluster = puzzle.clusters.findIndex(cluster => cluster.terms.includes(term));
          const bridge = bridgeByTerm.get(term);
          if (ordinaryCluster < 0 && !bridge) {
            fail(`${optionLabel}: target "${term}" is not a puzzle term`);
          } else if (ordinaryCluster >= 0 && bridge) {
            fail(`${optionLabel}: target "${term}" is ambiguous`);
          }
        });
      });
      if (correctCount !== 1) {
        fail(`${label}: exactly one option must be marked correct`);
      }
      return;
    }

    const validTargetCount = assignmentMode
      ? Array.isArray(lens.targets) && lens.targets.length > 0
      : Array.isArray(lens.targets) && lens.targets.length >= 1 && lens.targets.length <= 6;
    if (!validTargetCount) {
      fail(`${label}: targets must ${assignmentMode ? "be a non-empty array" : "contain 1 to 6 terms"}`);
      return;
    }

    const seenTargets = new Set();
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
      }
      if (assignmentMode && assignedTargets.has(term)) {
        fail(`concept "${term}" appears in lenses "${assignedTargets.get(term)}" and "${lens.id}"`);
      } else if (assignmentMode) {
        assignedTargets.set(term, lens.id);
      }
    });

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
