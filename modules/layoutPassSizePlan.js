// The board sizes one automatic layout pass (tools/layouts-auto.mjs) may
// try for a puzzle. An author's size, or an author's layout in any mode,
// keeps the size in use: a new size would replace the one or move the
// other. Otherwise the run starts from minSize (a size the author finds
// comfortable; else the default, or the saved size when only some modes
// run). Only a run over every mode may grow the board from there, since a
// new size moves the modes a narrower run does not look at.

export const LAYOUT_PASS_MODES = Object.freeze(["graph", "sets", "star"]);

export function layoutPassSizePlan({ authorSize, authorModes = [], saved, minSize = null, modes = LAYOUT_PASS_MODES }) {
  const sizeIsOurs = !authorSize && !authorModes.length;
  const allModes = LAYOUT_PASS_MODES.every(mode => modes.includes(mode));
  const base = !sizeIsOurs ? saved : minSize ?? (allModes ? 1 : saved);
  return { sizeIsOurs, base, mayGrow: sizeIsOurs && allModes };
}
