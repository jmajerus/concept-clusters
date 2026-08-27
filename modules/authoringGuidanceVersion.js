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
// 3.2: same bar; a focused 1-3 term lens is complete. Cross-cutting is
// welcome when it works, not a preferred grade, and 6 is a ceiling
// rather than a fill target.
// 3.3: same bar; Dutch tilt / dolly zoom is the worked example of a
// two-target reinforcing lens (bounded wording, named exclusions).
// 3.4: same bar; the existing stable-information-surface rule is now carried
// by compact agent and MCP review guidance instead of only the long reference.
// 4.0: idealTerms now defines the canonical authored graph, not merely an
// extra-praise target. Existing ideal endpoints should be re-checked because
// every accepted cluster tap now resolves to them; null means the relationship
// genuinely belongs to the cluster as a whole.
// 4.1: same bar; learningIntroduction remains optional, but short orienting
// notes (learning objective + domain situating) are encouraged when helpful —
// length is not required. Write about the subject, not the board/mechanism
// (not merely "don't spoil answers").
// 4.2: same bar; optional puzzle-level provenance (contributors +
// collaboration) is the compact authoring record agents may set at L2;
// learningIntroduction.credit remains the human-owned byline for now.
// 4.3: same bar; agents may send bare contributor names — kinds inferred
// from known AI hosts, collaboration defaulted (set aiPrimary only when needed).
// 4.4: same bar; mixed human+AI defaults to aiPrimary (honest for
// agent-authored puzzles); humans set humanPrimary when they take editorial lead.
// 4.5: same bar; lesson byline is derived from provenance (credit dropped on
// canonicalize when L1 renders); drafts show read-only derived byline.
// 4.6: same bar; stored provenance contributors stay lean (name only when
// kind/provider are derivable) so get_puzzle_draft round-trips stay cheap.
// 4.7: same bar; one bibliography on puzzle info.citations. When a lesson
// exists, play shows it under References in the Lesson dialog (not on the
// board). Leftover learningIntroduction.citations fold into info.citations.
export const AUTHORING_GUIDANCE_VERSION = Object.freeze({
  major: 4,
  minor: 7
});
