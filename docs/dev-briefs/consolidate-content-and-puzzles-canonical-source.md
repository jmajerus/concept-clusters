# Make content/puzzles/*.ccpuzzle.json the universal source of truth

**Status: logged for a future revisit, not scoped or planned in detail.**
Surfaced while discussing [remove-json-ld-from-authoring-and-storage.md](./remove-json-ld-from-authoring-and-storage.md)
after that PR merged, not currently worth building on its own.

## The inconsistency this would resolve

Today there are two different, live answers to "what do I edit to change
this puzzle":

- **81 puzzles** (anything that's gone through the MCP/CLI publication
  pipeline): `content/puzzles/<id>.ccpuzzle.json` is the source; the
  matching `puzzles/<category>/<id>.js` is mechanically generated from it
  and never hand-touched.
- **66 puzzles** (everything that predates the pipeline, or has simply
  never been edited through it since): there is no `content/` file at all.
  `puzzles/<category>/<id>.js` *is* the source, hand-edited directly, per
  [AUTHORING.md](../AUTHORING.md)'s documented workflow ("After editing
  `puzzles/index.js` by hand, run `node validate.mjs`").

The proposed end state: `content/puzzles/*.ccpuzzle.json` becomes the
source for every puzzle, always; `puzzles/**/*.js` becomes a pure,
always-generated artifact for every puzzle, never hand-edited, with the
"edit the `.js` directly" workflow retired from AUTHORING.md.

## Why not build it now

Backfilling a `content/puzzles/*.ccpuzzle.json` for all 66 untouched
puzzles up front is a real, avoidable cost -- mechanical (the same
`puzzleToSimplified()` used for the JSON-LD migration would do it), but
still 66 files' worth of generation, review, and diff to carry for no
immediate benefit.

It also turns out to be unnecessary as a precondition. Checked both
publication code paths directly:

- **Game engine**: only ever reads `puzzles/**/*.js` via
  `puzzles/index.js`. It has no awareness of `content/puzzles/` at all, so
  a puzzle missing its canonical file is invisible to it -- nothing to
  backfill for gameplay, ever.
- **Publication pipeline** (`githubPublicationService.js`'s
  `planDocument`, and `repositoryPublicationService.js`'s
  `planPuzzleImport`): already backfills lazily, as a side effect, the
  first time a puzzle is edited through it. When a puzzle has no canonical
  file, `existingDocument` is `null` but the puzzle is still found in the
  loaded registry (`published`/`existingPuzzleModule`), so the plan still
  resolves to `action: "replace"` -- it falls back to the puzzle's own
  module URL to find the old `.js` file rather than requiring a canonical
  file to exist first, and writes `content/puzzles/<id>.ccpuzzle.json` for
  the first time as a normal part of that one edit
  ([githubPublicationService.js:855-872](../../modules/githubPublicationService.js#L855-L872)).

So the 66 remaining puzzles backfill themselves, one at a time, exactly
when someone actually needs to touch them through the pipeline -- which is
the only time it matters. A bulk backfill would only be buying uniformity
for its own sake.

## What would still need deciding, if this is picked up

- Whether to ever bulk-backfill the stragglers (e.g. before fully retiring
  the hand-edit-`.js` workflow from AUTHORING.md), or just let attrition
  finish the job over time and leave a permanently-shrinking "never
  touched" set.
- What enforces "never hand-edit `puzzles/*.js`" once it's the intended
  rule for pipeline-touched puzzles -- a drift check (regenerate and diff
  in CI) is the obvious candidate, not built.
- Whether `puzzles/*.js` importing its `content/*.json` sibling directly
  at runtime (rather than being pre-generated) is worth reconsidering --
  discussed and rejected for now: JSON module imports
  (`with { type: "json" }`) are recent enough to conflict with this
  project's "just open `index.html`, any browser" goal
  ([README.md:9](../../README.md#L9)), and `puzzles/index.js` eagerly
  imports all 147 puzzles, so per-load conversion would be pure recurring
  overhead against the current zero-cost baked-in object literals. Plain
  JSON also stays the right canonical shape independent of this question:
  `sync_review_changes_to_draft` parses canonical file content as a raw
  string inside a Cloudflare Worker (no filesystem, no `eval`), where
  `JSON.parse` works for free and dynamically importing a `.js` source
  string doesn't.
