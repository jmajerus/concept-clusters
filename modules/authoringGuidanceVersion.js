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
// 3.1: same bar; 17-25-node puzzles retained their distinct terms while
// layout remained a derived renderer choice.
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
// kind is derivable and provider is never stored) so get_puzzle_draft
// round-trips stay cheap.
// 4.7: same bar; one bibliography on puzzle info.citations. When a lesson
// exists, play shows it under References in the Lesson dialog (not on the
// board). Leftover learningIntroduction.citations fold into info.citations.
// 4.8: same bar; do not mirror citation URLs on info.links / lesson links.
// 4.9: same bar; canvas selection is derived from node count. Do not drop a
// distinct term to satisfy a renderer threshold; split only above 25.
// 5.0: structural regularity is described for every three-or-more-item
// pattern, independent of historical corpus frequency. MCP sees only a
// combination of an actual incidence-graph symmetry and a cross-axis count
// lock; individual descriptors and observations stay on the human
// draft-review page. Prior reviews must be revisited under this bar.
// 5.1: same review bar; authoring must map sourced distinctions, candidate
// terms, and genuine connections before deciding any count or range. Equal
// inventory/board counts are neither blocked nor a reason to manufacture
// irregularity.
// 5.2: same review bar; MCP guidance exposes only the 25-node hard ceiling.
// Layout details and derived renderer fields are not authoring inputs.
// 5.3: same review bar; the legacy bridge-role annotation was retired. Bridge terms are
// ordinary authored concepts; use relationKind only when the relationship
// itself needs classification.
// 5.4: same review bar; puzzle-level provenance is the sole active authoring
// attribution shape. Legacy generative-assistance data is read/import only.
// 5.5: same review bar; repository-owned timestamps and revision metadata are
// infrastructure fields, never simplified authoring fields. Lesson progress
// invalidation is derived from the introduction content.
// 5.6: same review bar; split-plan boardOrder is external sequencing metadata.
// Puzzle documents carry only the player-facing relatedPuzzles info and entries.
// 5.7: same review bar; MCP draft reads and writes use canonical stable
// category ids rather than the web editor's display-title projection.
// 5.8: same review bar; Vocabulary authoring uses sequential single-target
// cloze lenses and a single shared bridge term for homonym/homograph axes;
// multi-blank slot mapping remains deferred.
// 5.9: same review bar; Vocabulary preSolve is explicitly per-puzzle, and
// repeated bridge-context lenses are an optional pattern rather than a form.
// 5.10: same review bar; the vocabulary-context profile treats tight
// near-synonym neighborhoods and contextual best-fit lenses as lexical
// disambiguation, not simple matching, with phase-specific MCP guidance.
// 5.11: same review bar; profile-selected guidance is isolated from generic
// guidance, with a compact complete overview and one focused brief per phase.
// 5.12: same review bar; the trivia-quiz profile co-designs cluster groupings
// and factual quiz lenses, independent of the conventional Trivia category.
// 5.13: same review bar; new documents declare content-owned puzzleKind,
// independently of taxonomy and lens mode, while legacy omission remains valid.
// 5.14: topic-based becomes the implicit puzzleKind; MCP omits protected
// attribution, lesson byline, creator, license, and source-lineage metadata.
// 5.15: vocabulary-context permits one cluster and uses an integrated design
// cycle for bounded puzzles, with a post-lens substitution review.
// 5.16: one-cluster Vocabulary uses a flat term list and automatically starts
// at its lenses; seeds and an explicit preSolve choice remain for multi-cluster
// puzzles where sorting can contribute meaningful play.
// 5.17: same review bar; seeds stay required on every multi-cluster board,
// and on a pre-solved board they are invisible to the player, so agents pick
// them without deliberation rather than authoring a terms-only shape.
// 5.18: same review bar; vocabulary-context is pitched at collegiate level
// (neighborhoods a collegiate dictionary discriminates in a synonym
// paragraph), with the dictionary synonym discussion as anchor source and
// document template.
// 5.19: same review bar; the no-preselected-counts rule now reaches
// profile-routed agents through the profile preamble (it lived only in the
// generic format guidance since the 5.11 isolation).
// 5.20: same review bar; workflow mechanics now name the create / save /
// validate call shapes (document, draft_id, domain) so a client without the
// tool schemas in view does not have to read server source to find them.
// 5.21: same review bar; wiki: link verification now names the
// check_puzzle_links tool instead of leaving "verify before writing" to
// whatever the client can reach.
// 5.22: same review bar for puzzles already under the old ceiling. One board
// may hold 40 nodes. Canvas size is derived from node count, routed edges,
// and term length. Split when a seam teaches better apart, not because the
// board passed 25.
// 5.23: same review bar for existing puzzles. The hard ceiling is 32 nodes,
// a refusal point rather than a size to fill. Through about 25 nodes, one
// board is the normal lesson; past that, stay together only when a split
// would cut a connection the player has to work on the same surface.
// 5.24: same review bar. Agents are not given a second count below the
// ceiling. Canvas size stays derived. A split is a judgment about the
// subject, or the response to exceeding 32, not a way to stay under a
// preferred size.
// 6.0: the symmetry prompt is an even term count across three or more
// clusters (uniform-partition). A cluster count that repeats that number
// is a sentence on the same prompt. Bridges, attachment, and cluster
// swaps are not symmetry signals. Reviews that treated only an
// incidence-graph combination as the prompt should be revisited. A board
// with no concept-gathering inventory is repaired by reopening that pass.
// 6.1: same prompt. A review that finds no inventory writes that inventory
// and stops for approval before fitting. Leaving the reopen as an open
// issue, or treating "do not add or drop terms" as a reason not to write
// the map, is not the repair.
// 6.2: same review bar. A learning introduction is one lesson about the
// subject, including how the ideas relate. Authors do not write a short
// spoiler-free opening, a teaser, or a split. Play previews the text and
// offers Continue reading; the full text opens after the puzzle is complete.
// 6.3: same review bar. dateCreated and dateModified are stamped at
// publication and stay on the puzzle. Agents do not send them. large is
// computed from the node count and is not a stored field.
// 6.4: same review bar. Writing a lesson copies the board links that text
// relies on into info.citations in the same pass. Those URLs may stay on
// their nodes. They are not also lesson links.
// 6.5: same review bar. info.citations stays an agent content-domain write.
// The server does not copy links into it. The default set is the cluster
// links the lesson text relies on, saved after the lesson exists.
// 6.6: same review bar. check_puzzle_links with draft_id checks the filed
// review when the working copy is only the restored baseline, including a
// stacked review. The result names that document.
// 6.7: same review bar. check_puzzle_links also reports reachability of
// other http(s) links, including citation URLs. Inconclusive is not a
// broken link, and a live response is not a reading of the page.
// 6.8: same review bar. Play shows the whole learning introduction before
// the board.
// 6.9: same review bar. A learning introduction helps in almost every case.
// The author cannot know what the player already knows.
// 6.10: same review bar. Cluster and lens color are not agent fields. The
// server assigns a cluster hue and keeps a stored one; agents omit both.
// 6.11: same review bar. The lesson follows the subject's order. Where it
// reaches a board term whose meaning is not plain from the words themselves,
// it uses the term. A long board is not a list to work through.
export const AUTHORING_GUIDANCE_VERSION = Object.freeze({
  major: 6,
  minor: 11
});
