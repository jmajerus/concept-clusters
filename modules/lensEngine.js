// Pure Concept Lenses state helpers. Game state orchestration lives in game.js;
// the assignment component owns its HTML UI, while renderers only ask for
// display metadata belonging on each real term node.

import { lensColorMap } from "./colorPalette.js";

export const LENS_PHASES = new Set([
  "lens-preparing",
  "lens-selecting",
  "lens-revealed",
  "lens-assigning",
  "lens-quiz-answering"
]);

export function normalizedLensMode(puzzle) {
  if (puzzle?.lensMode === "assignment") return "assignment";
  if (puzzle?.lensMode === "quiz") return "quiz";
  return "sequential";
}

export function lensPhaseActive(state) {
  return !!state && (
    LENS_PHASES.has(state.phase) ||
    (normalizedLensMode(state.puzzle) === "assignment" &&
      state.phase === "complete" &&
      !!state.lensAssignmentResult)
  );
}

export function currentLens(state) {
  return state?.puzzle?.lenses?.[state.lensIndex] || null;
}

export function lensLabel(lens) {
  return lens?.label || lens?.prompt || "";
}

export function selectableConceptWords(puzzle) {
  if (!puzzle) return [];
  return [
    ...puzzle.clusters.flatMap(cluster => cluster.terms),
    ...puzzle.bridges.map(bridge => bridge.term)
  ];
}

export function assignmentTargetMap(puzzle) {
  const targets = new Map();
  for (const lens of puzzle?.lenses || []) {
    for (const word of lens.targets || []) targets.set(word, lens.id);
  }
  return targets;
}

export function assignmentConceptWords(puzzle) {
  return [...assignmentTargetMap(puzzle).keys()];
}

export function assignmentComplete(
  puzzle,
  assignments,
  selectableWords = assignmentConceptWords(puzzle)
) {
  if (!(assignments instanceof Map)) return false;
  const validLensIds = new Set((puzzle?.lenses || []).map(lens => lens.id));
  return selectableWords.length > 0 && selectableWords.every(word =>
    validLensIds.has(assignments.get(word))
  );
}

export function lensAssignmentResult(puzzle, assignments) {
  const selected = assignments instanceof Map ? assignments : new Map();
  const targets = assignmentTargetMap(puzzle);
  const correct = [];
  const incorrect = [];
  const unassigned = [];
  for (const word of assignmentConceptWords(puzzle)) {
    const selectedLensId = selected.get(word);
    const correctLensId = targets.get(word);
    if (!selectedLensId) {
      unassigned.push({ word, correctLensId });
    } else if (selectedLensId === correctLensId) {
      correct.push(word);
    } else {
      incorrect.push({ word, selectedLensId, correctLensId });
    }
  }
  return {
    correct,
    incorrect,
    unassigned,
    correctCount: correct.length,
    assignedCount: correct.length + incorrect.length,
    totalCount: correct.length + incorrect.length + unassigned.length
  };
}

export function lensAssignmentSummary(result) {
  const unanswered = result?.unassigned?.length || 0;
  return `${result?.correctCount || 0} of ${result?.totalCount || 0} concepts matched the authored best fit.` +
    (unanswered
      ? ` ${unanswered} ${unanswered === 1 ? "was" : "were"} left unanswered.`
      : "");
}

function assignmentLensForNode(node, state, { authored = false } = {}) {
  if (normalizedLensMode(state?.puzzle) !== "assignment") return null;
  const lensId = authored
    ? assignmentTargetMap(state.puzzle).get(node.word)
    : state.lensAssignments?.get(node.word);
  return state.puzzle.lenses.find(lens => lens.id === lensId) || null;
}

export function lensAssignmentBadge(node, state) {
  if (normalizedLensMode(state?.puzzle) !== "assignment" ||
      !["lens-assigning", "complete"].includes(state.phase)) {
    return null;
  }
  const revealed = state.phase === "complete";
  const selectedLens = assignmentLensForNode(node, state);
  const authoredLens = assignmentLensForNode(node, state, { authored: true });
  if (!authoredLens) return null;
  const displayedLens = revealed
    ? authoredLens
    : selectedLens;
  const lensIndex = displayedLens
    ? state.puzzle.lenses.findIndex(lens => lens.id === displayedLens.id)
    : -1;
  return {
    text: lensIndex >= 0 ? String(lensIndex + 1) : "?",
    tone: lensIndex >= 0 ? lensColorMap(state.puzzle).get(displayedLens.id) : null,
    assigned: !!selectedLens,
    correct: revealed && selectedLens?.id === displayedLens?.id,
    unanswered: revealed && !selectedLens
  };
}

export function lensNodeAriaLabel(node, state, fallback = node.word) {
  if (normalizedLensMode(state?.puzzle) === "quiz") {
    if (state?.phase !== "lens-revealed") return fallback;
    const option = quizOptionForNode(node, currentLens(state));
    if (!option) return fallback;
    return option.correct
      ? `${node.word}. Evidence for ${option.label}, the correct answer.`
      : `${node.word}. Evidence for ${option.label}, not the correct answer.`;
  }
  if (normalizedLensMode(state?.puzzle) !== "assignment" ||
      !["lens-assigning", "complete"].includes(state.phase)) {
    return fallback;
  }
  const correctLens = assignmentLensForNode(node, state, { authored: true });
  if (!correctLens) return fallback;
  const selectedLens = assignmentLensForNode(node, state);
  if (state.phase === "lens-assigning") {
    return selectedLens
      ? `Assign a lens to ${node.word}. Currently ${lensLabel(selectedLens)}.`
      : `Assign a lens to ${node.word}. Currently unassigned.`;
  }
  if (!selectedLens) {
    return `${node.word}. Left unanswered. Authored best fit: ${lensLabel(correctLens)}.`;
  }
  return selectedLens?.id === correctLens?.id
    ? `${node.word}. Correctly assigned to ${lensLabel(correctLens)}.`
    : `${node.word}. Assigned to ${lensLabel(selectedLens)}. Authored best fit: ${lensLabel(correctLens)}.`;
}

export function quizOptionForNode(node, lens) {
  return (lens?.options || []).find(option =>
    (option.targets || []).includes(node.word)
  ) || null;
}

// Quiz content keeps its authored order for interchange and review, but the
// player should not be able to infer the answer from that order. Rank each
// option from stable puzzle/lens/option identity instead of Math.random(): the
// visible permutation varies from question to question without jumping around
// on re-render or reload. FNV-1a is only a compact deterministic mixer here,
// not a security primitive.
function quizOptionRank(puzzle, lens, option) {
  let hash = 0x811c9dc5;
  const identity = `${puzzle?.id || ""}\0${lens?.id || ""}\0${option?.id || ""}`;
  for (const char of identity) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function quizOptionsForDisplay(puzzle, lens) {
  return [...(lens?.options || [])].sort((a, b) => {
    const rankDifference = quizOptionRank(puzzle, lens, a) -
      quizOptionRank(puzzle, lens, b);
    if (rankDifference) return rankDifference;
    const aId = String(a?.id || "");
    const bId = String(b?.id || "");
    return aId < bId ? -1 : aId > bId ? 1 : 0;
  });
}

export function lensQuizResult(lens, selectedOptionId) {
  const options = lens?.options || [];
  const selectedOption = options.find(option => option.id === selectedOptionId) || null;
  const correctOption = options.find(option => option.correct) || null;
  return {
    correct: !!selectedOption && selectedOption.id === correctOption?.id,
    selectedOption,
    correctOption
  };
}

export function lensNodeClass(node, state) {
  if (normalizedLensMode(state?.puzzle) === "assignment") {
    if (state.phase === "lens-assigning") {
      const authored = assignmentLensForNode(node, state, { authored: true });
      if (!authored) return "";
      return state.lensAssignments?.has(node.word) ? "lens-assigned" : "";
    }
    if (state.phase !== "complete" || !state.lensAssignmentResult) return "";
    const selected = assignmentLensForNode(node, state);
    const correct = assignmentLensForNode(node, state, { authored: true });
    if (!correct) return "";
    if (!selected) return "lens-assignment-unanswered";
    return selected?.id === correct?.id
      ? "lens-assignment-correct"
      : "lens-assignment-incorrect";
  }

  const lens = currentLens(state);
  if (!lens || !lensPhaseActive(state)) return "";

  if (normalizedLensMode(state.puzzle) === "quiz") {
    if (state.phase !== "lens-revealed") return "";
    const option = quizOptionForNode(node, lens);
    if (!option) return "";
    // Reuses lens-correct's exact visual (solid green) since the semantics
    // match: this node is evidence for the right answer. The incorrect
    // side gets its own class rather than lens-extra -- these nodes are
    // comparison data for a plausible option, not a player mistake, so
    // they shouldn't read as an error in red.
    return option.correct ? "lens-correct" : "lens-quiz-incorrect";
  }

  const selected = state.lensSelections?.has(node.word) || false;
  const target = lens.targets.includes(node.word);
  if (state.phase === "lens-selecting") return selected ? "lens-selected" : "";
  if (state.phase !== "lens-revealed") return "";
  if (selected && target) return "lens-correct";
  if (!selected && target) return "lens-missed";
  if (selected) return "lens-extra";
  return "";
}

export function withLensClass(base, node, state) {
  const lens = lensNodeClass(node, state);
  return lens ? `${base} ${lens}` : base;
}

export function lensResult(lens, selections) {
  const selected = selections || new Set();
  const targets = new Set(lens.targets);
  const correct = lens.targets.filter(word => selected.has(word));
  const missed = lens.targets.filter(word => !selected.has(word));
  const extra = [...selected].filter(word => !targets.has(word));
  return { correct, missed, extra, targetCount: lens.targets.length };
}
