# Separate authoring/Freeze from the generated puzzle-artifact shape

**Status: logged for a future revisit, not scoped or planned in detail.**
Surfaced while discussing Freeze's self-sync fix and the removal of
`install_puzzle` (PR #182). Builds on
[consolidate-content-and-puzzles-canonical-source.md](./consolidate-content-and-puzzles-canonical-source.md),
which settled *which file* is canonical per puzzle; this is the further
step of getting the authoring/Freeze layer out of the business of knowing
how the generated side is shaped at all.

## The coupling this would remove

Today, whichever layer writes new, changed, or removed puzzle content --
Freeze, the `content:import` CLI, or the legacy per-puzzle GitHub PR path --
has to know, inline, exactly how to:

- map a puzzle's `category` to its on-disk directory slug;
- construct the generated `.js` module's file path and its JS source text
  (import statements plus the object-literal wrapper);
- textually splice an entry into `puzzles/index.js`'s array literal (add)
  or remove one (delete); and
- do the analogous thing for `catalogues/index.js` and
  `puzzles/categories.js`.

None of that is "what changed" -- it's "how do I make the zero-build
player site see it." Authoring's actual job (D1 documents, drafts, review,
GitHub PRs) has nothing to do with any of it, but currently can't avoid
knowing it.

## Current architecture (confirmed by reading the code, not assumed)

The generation logic itself is centralized in
[`modules/publicationArtifacts.js`](../../modules/publicationArtifacts.js)
(`generatedPuzzleModule`, `registerPuzzleSource`/`unregisterPuzzleSource`,
and the catalogue/category equivalents) -- all three write paths already
delegate to it rather than reimplementing the splice/generate logic three
times over. That part is already reasonably separated.

What is *not* centralized: the `puzzles/<slug>/<id>.js` path convention
itself is constructed independently in three places --

- [`contentFreezeApply.js:161-166`](../../modules/contentFreezeApply.js#L161-L166)
  (Freeze),
- [`githubPublicationService.js:810` and `:816`](../../modules/githubPublicationService.js#L810)
  (the legacy per-puzzle GitHub PR path), and
- [`repositoryPublicationService.js:152-157` and `:272-284`](../../modules/repositoryPublicationService.js#L152-L157)
  (the `content:import` CLI, both the install and uninstall directions).

Each of these also independently walks `puzzles/` to find an existing
module for a given id, independently imports category metadata to resolve
`slugify(category)`, and independently decides add-vs-replace by checking
the filesystem or registry directly -- three parallel implementations of
"where does this puzzle live on disk," not three callers of one shared
answer.

The reason the generated shape has to exist at all is real and
deliberate, not incidental: [README.md:9](../../README.md#L9) commits to
opening `index.html` directly -- no build step, no server, no network --
and the game engine only ever reads `puzzles/**/*.js` via eagerly-imported
baked-in object literals. This brief does not propose changing that.

## Proposed end state

Draw the boundary at canonical JSON. Authoring -- D1, drafts, Freeze,
`content:import`, and the legacy per-puzzle PR path -- reads and writes
only `content/puzzles/*.ccpuzzle.json` (and the catalogue/category
canonical equivalents): plain declarative data. None of it constructs a
`puzzles/**` path, generates JS module text, or touches a registry file,
ever.

A separate, purely mechanical build step -- e.g.
`tools/build-puzzle-artifacts.mjs` -- becomes the only code that knows the
generated shape. Given the complete canonical set, it deterministically
regenerates the entire `puzzles/**/*.js` tree, `puzzles/index.js`,
`catalogues/index.js`, `puzzles/categories.js`, and `puzzles/manifest.js`
from scratch every run -- a full rebuild, not an incremental patch. This
retires the current three independent implementations of "splice an entry
into this array literal" in favor of one function that just writes what
should be there.

Freeze's own PR would then contain only canonical JSON changes. The
generated tree would be produced by CI after merge -- the same shape
[`sync-puzzle-registry.yml`](../../.github/workflows/sync-puzzle-registry.yml)
already runs today for `puzzles/index.js` and `puzzles/manifest.js`; it
would grow to own the module bodies too, not just the registry entries.
This generalizes that workflow's own stated reasoning ("register any
modules ... after a merge") from the registry file to the entire
generated tree.

## Why not build it now

This touches four places that all currently work correctly
(`contentFreezeApply.js`, `githubPublicationService.js`,
`repositoryPublicationService.js`, and the CI workflow), replacing
incremental splice logic that's had real bugs fixed in it over time (see
the PRs behind this brief and #107) with a from-scratch full-rebuild step
that would need equivalent scrutiny before anyone would trust it as a
replacement.

It's also downstream of
[consolidate-content-and-puzzles-canonical-source.md](./consolidate-content-and-puzzles-canonical-source.md)'s
still-open question: as of that brief, 66 puzzles have no canonical
`content/puzzles/*.ccpuzzle.json` at all and backfill lazily, one at a
time, the first time each is touched through the pipeline. A full-rebuild
compiler needs a *complete* canonical set to rebuild the generated tree
from -- so that brief's backfill question would need resolving first, not
just logged alongside this one.

## What would still need deciding, if this is picked up

- Whether the compiler runs synchronously inside Freeze/CI (so a broken
  generation fails the same PR/run that caused it) or as a fully separate
  scheduled/triggered step -- `sync-puzzle-registry.yml`'s current model
  (separate, post-merge, auto-retry-on-race) is the closer precedent.
- What replaces the three per-file `existingPuzzleModule`-style disk walks
  once nothing needs the generated path convention to answer "does this
  puzzle already exist" -- that question would move to checking
  `content/puzzles/*.ccpuzzle.json` existence instead, which the
  still-partial backfill above complicates.
- Whether a full-rebuild compiler should also become the drift-detection
  mechanism (regenerate and diff in CI, fail on mismatch) that
  consolidate-content-and-puzzles-canonical-source.md flagged as wanted,
  but not built, for enforcing "never hand-edit `puzzles/*.js`."
- Whether `repositoryPublicationService.js`'s `content:import` CLI keeps
  writing generated `.js` files itself for its own immediate local
  preview/dry-run use, or defers to the same compiler and only ever
  writes canonical JSON.
