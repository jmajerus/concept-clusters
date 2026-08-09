# Proposal: align the runtime puzzle schema with the simplified MCP format (v2)

**Status: not started. Logged for a future dedicated session, not scoped or
planned in detail yet.**

## The question this answers

`modules/simplifiedPuzzleSchema.js` (see `docs/SIMPLIFIED-PUZZLE-FORMAT.md`)
was built to fix two real footguns in how puzzles reference their own parts:

- **JSON-LD's `id`/`@id` pair** — every cluster and bridge needs two
  independently-typed identity fields that must agree byte-for-byte. This
  drifted out of sync repeatedly (five published puzzles shipped broken,
  fixed in `3ece4a0`).
- **The runtime `.js` shape's positional bridge references** — a puzzle
  module's bridges name their clusters by array position (`"clusters": [0,
  1]`), and clusters have no id of their own, only a display `name`. This is
  the same class of bug: reorder or miscount the cluster array and a bridge
  silently connects the wrong two clusters, with no validation possible,
  since any small integer is a "valid" index. The runtime shape also
  requires a cluster's `seeds` to be a literal, hand-maintained subset of
  its `terms` -- a second "two things must independently agree" pattern.

The simplified format fixes both, but only as an *authoring* surface: it
converts to the existing runtime shape via `puzzleFromSimplified()`, so the
footguns it fixes still exist in the canonical format underneath. The
question raised in review: since the fix already exists and works, why not
apply it to the runtime schema itself -- a v2 `puzzles/*.js` shape -- instead
of only to the authoring veneer on top of it?

## Why this isn't a small follow-up

Unlike the MCP-facing work, this touches the live game engine, not just
the authoring/publication pipeline. Confirmed by grep, positional cluster
indices are baked directly into rendering and game logic:

- `modules/gameLogic.js`, `modules/graphLayout.js`,
  `modules/graphRenderer.js`, `modules/setRenderer.js`,
  `modules/starRenderer.js`, `modules/bridgeDirection.js`,
  `modules/puzzleStats.js` -- all do `puzzle.clusters[bridge.clusters[i]]`-
  style positional array lookups.
- Curated Star layouts (`modules/starLayoutSchema.js`) key node identity by
  index too: a node's stable id is literally `` `cluster:${ci}` ``, built
  from the cluster's position in the array. Every hand-curated Star layout
  in the repository would need re-keying, not just the puzzle content
  files.

A real migration would require, at minimum:

1. Migrating all 96 `puzzles/**/*.js` files: derive/assign cluster ids,
   convert `terms` + `seeds` to `seeds` + `floatingTerms`, convert bridge
   `clusters` from positional indices to id strings (and `direction`/
   `idealTerms` similarly).
2. Re-keying every curated Star layout to match the new cluster identity.
3. Updating every engine module currently doing index-based array access --
   either resolve id references to indices once at load time (functionally
   moving today's JSON-LD-to-runtime conversion step one layer earlier), or
   thread id-based lookups through the hot rendering/layout code directly.
4. Rewriting `modules/contentValidation.js`'s core structural rules around
   the new shape (node-cap counting, bridge cluster-count checks, direction/
   idealTerms validation all currently assume integer indices).
5. Working out `puzzleToJsonLd()`/`puzzleFromJsonLd()`'s new role -- likely
   simpler afterward, since runtime and JSON-LD would no longer need
   index-\<-\>fragment resolution, but this needs to be designed, not assumed.

## Why it would be worth doing eventually

- Removes the last "two schemas that must be kept in sync" pairing in the
  system (simplified vs. runtime) -- `puzzleFromSimplified()` could shrink to
  near-trivial, or disappear.
- Fixes both footguns (positional bridge refs, terms/seeds redundancy) in
  the *canonical* format, not just the AI-facing convenience layer, so a
  human hand-editing an existing `.js` file directly gets the same safety
  an MCP-authored draft already has.
- Net reduction in the number of distinct puzzle-shape dialects the
  codebase has to reason about.

## Recommendation

Treat as a dedicated future session: full `EnterPlanMode`-style survey of
every engine file and every existing puzzle before committing to an
approach, not a quick change layered onto an already-large day of related
architecture work (JSON-LD `@id` fix, simplified MCP schema, widening it to
full content parity -- see `docs/SIMPLIFIED-PUZZLE-FORMAT.md` and this
directory's other dev-briefs). This touches the player-facing rendering
engine directly, which warrants going slow and thorough when it's actually
scoped, per this project's own "go big only for player-facing work"
principle.
