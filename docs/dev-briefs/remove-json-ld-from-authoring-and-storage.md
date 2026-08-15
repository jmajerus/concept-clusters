# Remove JSON-LD from authoring, storage, and the MCP server; keep it as an on-demand interchange utility

**Status: done.** Implemented and merged in
[PR #107](https://github.com/jmajerus/concept-clusters/pull/107). Left
below as a record of the scoping, not a live plan. See
[consolidate-content-and-puzzles-canonical-source.md](./consolidate-content-and-puzzles-canonical-source.md)
for the natural follow-up this surfaced.

## The decision

JSON-LD stops being infrastructure and becomes a product: something the
codebase can produce and consume *on request* for portable puzzle/catalogue
hand-off, implemented later as its own feature. Everything that currently
runs *through* JSON-LD as a mandatory intermediate step -- drafts, validation,
publication, the MCP server surface -- stops doing that and works on the
simplified format (and its internal model) directly.

This isn't inventing a new direction so much as finishing one already
visible in the code: `get_authoring_guidance` and every draft-write tool
already tell authors to build the simplified format, not hand-written
JSON-LD ([mcpAuthoringServer.js:22](../../modules/mcpAuthoringServer.js#L22)).
JSON-LD is legacy plumbing the author-facing surface has already moved past;
the internal pipeline hasn't caught up.

## Current architecture (confirmed by reading the code, not assumed)

This is bigger than "drafts happen to be stored as JSON-LD." Two related
services exist, and they disagree in scope:

- **`contentInterchangeService.js`** (local/CLI path, backs
  `npm run content:export/import/check` and `tools/content-jsonld.mjs`):
  genuinely interchange-flavored. This is the part that should survive
  mostly as-is.
- **`hostedAuthoringContentService.js`** + **`hostedMcpAuthoringServer.js`**
  (the live, deployed MCP server this session is connected to): JSON-LD is
  the *canonical on-disk format for published content*. Confirmed by
  listing `content/puzzles/`: **81 of 147 puzzles** already have a
  `content/puzzles/<id>.ccpuzzle.jsonld` file that
  `githubPublicationService.js` treats as the source of truth, falling back
  to the generated `puzzles/<category>/<id>.js` module only for older
  puzzles that predate the JSON-LD pipeline
  ([githubPublicationService.js:285](../../modules/githubPublicationService.js#L285)).

So the full current pipeline, hosted side:

```
simplified doc (MCP input)
  → normalizeAuthoredDocument (write-time convert to JSON-LD)
  → D1 draft, stored as JSON-LD (document_jsonld column)
  → validateJsonLdProfile + puzzleFromJsonLd → internal model → semantic validation
  → submit_puzzle_for_publication
  → GitHub PR writing content/puzzles/<id>.ccpuzzle.jsonld (canonical)
    + generated puzzles/<category>/<id>.js (compatibility module, derived)
```

Removing JSON-LD from "the workflow" means touching every stage of that,
not just the D1 column.

## Proposed end state

```
simplified doc (MCP input)
  → D1 draft, stored as the simplified document (no conversion)
  → validate directly against the simplified/zod schema → internal model → semantic validation
  → submit_puzzle_for_publication
  → GitHub PR writing content/puzzles/<id>.ccpuzzle.json (canonical, simplified format)
    + generated puzzles/<category>/<id>.js (unchanged: still derived)
```

JSON-LD conversion (in both directions) becomes a standalone function
callable by `content:export`/`content:import`/`content:check` only --
invoked when someone explicitly wants a portable `.ccpuzzle.jsonld` file to
hand to another system, never as a side effect of authoring or publishing.

## MCP server: what actually gets stripped

Both `mcpAuthoringServer.js` (local) and `hostedMcpAuthoringServer.js`
(deployed) currently expose JSON-LD directly to the model. To remove:

- **Tools removed outright:** `get_puzzle_jsonld`, `export_puzzle_jsonld`,
  `export_catalogue_jsonld` (and the hosted server's equivalent published
  JSON-LD resource/tool registrations around
  [hostedMcpAuthoringServer.js:254-313](../../modules/hostedMcpAuthoringServer.js#L254)).
  If an interchange need surfaces later, it belongs in the future
  interchange feature, not the authoring surface.
- **Tool descriptions rewritten** to drop "...and full JSON-LD is also
  accepted" permissiveness language on `create_puzzle_draft` and
  `save_puzzle_draft` -- once storage stops round-tripping through JSON-LD,
  that affordance should stop being advertised, not just stop being
  exercised.
- **`validate_puzzle_draft` description** ("Validate ... against the
  JSON-LD and puzzle rules") loses the JSON-LD framing; it validates the
  simplified document against the simplified schema and puzzle semantics.
- **`get_authoring_guidance` body text** loses the "Build as simplified,
  not JSON-LD" contrast entirely, since there's no longer a JSON-LD path to
  warn authors away from. The Star-layout caveat (see below) is the one
  thing that still needs a sentence.
- **Internal comments** referencing `tools/content-jsonld.mjs`'s isolated
  test copy, "write-time-normalized at create/replace," etc. get cleaned up
  alongside the code they describe.

## The Star layout wrinkle (resolved -- no change needed)

Checked `puzzles/layouts/star/`: this was never actually stored as JSON-LD.
`tools/import-star-layout.mjs` already writes one generated sidecar file
per curated puzzle (`puzzles/layouts/star/<id>.js`, present only for
puzzles that got hand-placed layouts -- most don't) plus a generated
`index.js` that aggregates them into the sparse `STAR_LAYOUTS` lookup map
`starLayoutRepository.js` reads at runtime. `puzzleJsonLd.js` only *bundles*
a puzzle's current layout into a portable JSON-LD document as an optional
export convenience ([puzzleJsonLd.js:70](../../modules/puzzleJsonLd.js#L70))
-- storage was already outside JSON-LD.

So "JSON-LD-only" in SIMPLIFIED-PUZZLE-FORMAT.md's "What stays
JSON-LD-only" section describes an *authoring-input* gap (no simplified-
format field asks for layout data), not a storage dependency. Nothing here
needs to move. Worth a docs pass to stop calling it JSON-LD-only when
scoping this, since that phrasing is what suggested a trade-off that
doesn't actually exist. Still worth checking against
[[project_star_free_node_layout]] once that layout direction settles, since
a jigsaw-scatter direction could change what data Star curation needs to
carry -- but that's independent of this brief.

## Migrating the 81 existing canonical files

Existing `content/puzzles/*.ccpuzzle.jsonld` files need a decision, not
just a rename:

- Convert them once to the new canonical simplified format
  (`*.ccpuzzle.json`) via the existing `puzzleFromJsonLd` → simplified
  serializer (build the reverse direction if it doesn't exist yet), commit
  as a mechanical migration.
- Or leave them as-is and let `githubPublicationService.js` keep a
  read-only JSON-LD fallback path (parallel to its existing pre-JSON-LD
  `puzzles/index.js` fallback) so nothing needs an all-at-once rewrite.

Given there's already a two-tier fallback precedent in that file, (2) is
lower-risk to ship incrementally; (1) is cleaner long-term and avoids the
pipeline ever needing to read three formats at once (legacy `.js`-only,
JSON-LD, and new canonical simplified). Worth a real decision, not a
default, when this is picked up.

## What's touched

`d1DraftRepository.js` (column/schema), `mcpAuthoringServer.js`,
`hostedMcpAuthoringServer.js`, `contentInterchangeService.js`,
`hostedAuthoringContentService.js`, `repositoryPublicationService.js`,
`githubPublicationService.js`, plus their tests
(`tests/worker/github-publication.test.ts`, `authoring-worker.test.ts`,
`d1-drafts.test.ts`) and `docs/AUTHORING.md` / `docs/JSON-LD.md` /
`docs/MCP.md` / `docs/MCP-REMOTE.md` cross-references.

## What stays exactly as it is

- `content:export` / `content:import` / `content:check` CLI commands and
  `tools/content-jsonld.mjs` -- these remain the (only) place JSON-LD
  conversion happens, per the original framing: "on-demand utility puzzle
  interchange, codebase kept separate."
- The generated `puzzles/<category>/<id>.js` compatibility modules and the
  static, offline-capable player -- untouched either way; they've never
  read JSON-LD directly.
- `content/schemas/puzzle-v1.schema.json` etc. -- these describe the
  interchange format's contract and stay relevant to it.

## Not scoped here

- Actually writing the reverse (simplified ← JSON-LD) serializer if it
  doesn't already exist -- needed for the migration-path decision above,
  should be confirmed/built as step one of implementation, not assumed.
- Any change to what the future stand-alone interchange feature looks
  like beyond "it's where JSON-LD conversion now lives."
