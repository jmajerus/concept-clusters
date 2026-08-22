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
// 2.1: same bar; target-set size stated as a drop-one coverage test
// rather than pad-up / pad-out examples.
// 3.0: drop-one was the wrong inclusion rule — it licensed omitting
// answers that already had an exemplar. Include every term that answers
// the learning objective; prefer a genuine cross-cut. 1–6 remains the
// legal range, not a size to chase. 2.x lens reviews that applied
// drop-one should be re-checked.
// 3.1: same bar; 17-24 nodes set large: true rather than dropping a
// distinct term to stay under the standard-board cap of 16.
export const AUTHORING_GUIDANCE_VERSION = Object.freeze({
  major: 3,
  minor: 1
});
