// Major/minor version of the published-puzzle review bar: design judgment
// (this module and design-judgment.md) plus validation (contentValidation,
// lensValidation, puzzleSymmetryFlags). Corpus review records this pair on
// each pass; a later major bump marks those passes stale.
//
// Bump major when existing puzzles should be re-checked against a changed
// rule. Bump minor when guidance is clarified without changing that bar.
// Do not bump for typos.
//
// 2.0: sequential lens target floor is 1–6 (was 3–6). Whole-cluster
// recitation and padding sibling types to three are now in-scope for
// corpus review; only the recitation case is auto-flagged.
export const AUTHORING_GUIDANCE_VERSION = Object.freeze({
  major: 2,
  minor: 0
});
