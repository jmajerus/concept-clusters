// Pure Concept Lenses state helpers. DOM orchestration lives in game.js;
// renderers only ask for the class belonging on each real term node.

export const LENS_PHASES = new Set([
  "lens-preparing",
  "lens-selecting",
  "lens-revealed"
]);

export function lensPhaseActive(state) {
  return !!state && LENS_PHASES.has(state.phase);
}

export function currentLens(state) {
  return state?.puzzle?.lenses?.[state.lensIndex] || null;
}

export function lensNodeClass(node, state) {
  const lens = currentLens(state);
  if (!lens || !lensPhaseActive(state)) return "";
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
