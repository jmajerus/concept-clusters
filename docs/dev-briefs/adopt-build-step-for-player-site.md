# Retire the zero-build, offline-first commitment for the player site

**Status: the underlying value judgment is decided, not the migration.**
Decided in conversation on 2026-09-03: the zero-build/offline-first
commitment in [README.md:9](../../README.md#L9) is no longer wanted --
"offline is dead ... I want an offline educational app as much as I want
an offline telephone." What replaces it is not scoped. Sits alongside, and
substantially simplifies, the other two open dev-briefs:
[consolidate-content-and-puzzles-canonical-source.md](./consolidate-content-and-puzzles-canonical-source.md)
and
[separate-authoring-from-generated-puzzle-artifacts.md](./separate-authoring-from-generated-puzzle-artifacts.md).

## The decision

[README.md:9](../../README.md#L9) currently reads: "It runs by opening
`index.html` directly in a browser -- no build step, no server, no
network required (D3 is vendored locally)." That was a deliberate,
real constraint, not an accident -- and it's the reason
`puzzles/**/*.js` has to exist as hand-generated, eagerly-parseable JS
object literals rather than plain data, which is what both of the other
dev-briefs in this directory are fundamentally about working around.

The judgment call underneath it -- is a fully offline, zero-infrastructure,
double-click-the-file player experience worth its cost -- is now
answered: no. Nobody without a network connection is the audience this
project needs to serve, and shipping enrichment links to Poynter, Mayo
Clinic, and the rest of the open web already assumes connectivity for
half of what the app is for (see the conversation this brief comes out
of). A real build step is on the table.

## Current architecture (confirmed by reading the code, not assumed)

There is no build step today, and the deploy path already went further
toward modern Cloudflare primitives than "zero build" might suggest:

- `wrangler.jsonc` deploys via **Workers Static Assets**
  (`assets.directory: "./site"`), the current-generation replacement for
  the old Pages/Workers-Sites split -- not a legacy KV-backed setup.
- `./site` is, per its own comment, "a symlinked public tree, not the
  repo root" -- a curated, but *unbundled*, copy of the same raw source
  files `file://` serves. No compilation happens between source and
  deploy.
- The player does **not** eagerly import all puzzles. `puzzles/index.js`'s
  own header says so directly: "Node tools, validation, and CI import
  this file eagerly as PUZZLES. The player uses `puzzles/manifest.js` +
  lazy `import()` instead." So there's already real, deliberate
  code-splitting behavior in the current design -- a bundler wouldn't be
  introducing lazy loading, it would be taking over a job the project
  already does by hand.
- `index.html` loads its entry point as `<script type="module"
  src="modules/boot.js">` -- already ES modules, already the input shape
  every modern bundler expects natively; nothing here would need
  rewriting to a different module system first.

## What adopting a build step would unlock

This doesn't just clean up deploy -- it substantially undercuts the
*reason* the other two dev-briefs exist:

- **`separate-authoring-from-generated-puzzle-artifacts.md`** proposes a
  hand-written "compiler" step whose whole job is turning canonical JSON
  into hand-shaped `puzzles/**/*.js` module text plus registry splicing.
  A real bundler with glob-import support (Vite's `import.meta.glob()`,
  for one) does the "every canonical JSON file becomes an importable
  module, automatically, no registry file to maintain by hand" part for
  free. The custom compiler that brief proposes may not need to be
  written at all -- the bundler already *is* that compiler.
- **`consolidate-content-and-puzzles-canonical-source.md`**'s open
  question -- "which file is canonical, `content/*.ccpuzzle.json` or
  `puzzles/*.js`" -- stops being a real question. If nothing hand-reads
  or hand-generates `puzzles/*.js` any more, `content/puzzles/*.ccpuzzle.json`
  is trivially the only source there is, for every puzzle, with no
  backfill needed for old ones (the build step generates their module on
  demand from whatever canonical file already exists, or the backfill
  becomes a one-time bulk job worth doing precisely because there's now
  a real reason to finish it).
- `puzzles/index.js`'s manually-maintained array (and the whole
  `registerPuzzleSource`/`unregisterPuzzleSource` text-splice machinery
  in `publicationArtifacts.js` that exists only to edit it non-destructively)
  goes away entirely, along with the three independent
  `puzzles/<slug>/<id>.js` path-construction call sites the other brief
  documents.
- Freeze's own PR shrinks to canonical JSON only, and CI's job
  (`sync-puzzle-registry.yml`, `content-validation*.yml`) shifts from
  "keep a hand-maintained registry file in sync" to "run the build and
  fail if it doesn't succeed" -- a normal CI job, not a bespoke text-diff
  script.

## What it would take

- Picking a bundler. Vite is the natural fit given Cloudflare's own
  first-party integration (`@cloudflare/vite-plugin`) for Workers +
  Static Assets projects -- worth confirming current capability and
  fit against `WEB-perf`/`cloudflare` skill guidance before committing,
  not assumed here.
- Deciding what `npm run dev` becomes for local play-testing (a Vite dev
  server, presumably) versus what stays true of the LAN authoring flow
  (Construct/Freeze) -- those are separate servers today and don't need
  to merge, but the LAN server's own relationship to "the same source
  tree" should be re-examined once that tree is a bundler input rather
  than servable-as-is.
- What happens to `d3.v7.min.js` being "vendored locally" as a plain
  `<script src>` -- becomes a normal npm dependency and a bundled import,
  which is simpler, not harder, once a build step exists at all.
- Whether `./site`'s "symlinked tree, not repo root" comment
  (`wrangler.jsonc`) becomes unnecessary once deploy has a real build
  output directory (`dist/`) to point `assets.directory` at instead of a
  curated symlink of source.
- Rewriting [README.md:9](../../README.md#L9) itself, once this lands --
  it's a load-bearing claim other docs and this very set of dev-briefs
  cite, not just a stray sentence.

## What would still need deciding, if this is picked up

- Whether to still support "download a single file and play it fully
  offline" as an *optional*, occasionally-generated export (e.g. a
  one-off bundled single-file build for a specific offline handoff use
  case), separate from how the live site is normally built and served --
  or whether that capability is simply gone and nobody misses it.
- Sequencing against the other two briefs: this one's "what it would
  unlock" section assumes doing this *before* fully deciding those two,
  since it changes their scope rather than building on top of their
  proposed shape unmodified.
- Whether lazy per-puzzle loading (already hand-built today via
  `puzzles/manifest.js` + `import()`) should be reimplemented with the
  bundler's own code-splitting, or whether the existing manifest+loader
  pattern is worth keeping as-is on top of bundled output.
