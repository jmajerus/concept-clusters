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
- The likely mechanical reason puzzle content had to be baked into
  `export default {...}` JS modules rather than plain fetched JSON in
  the first place (inferred, not confirmed by a code comment): opening
  a page via `file://` and calling `fetch('some.json')` is blocked by
  CORS in Chrome (`origin 'null' has been blocked by CORS policy`) --
  a real, long-standing browser restriction, unrelated to anything
  Cloudflare controls. An ES module `import` of another local file is
  resolved through the module graph, not a CORS-gated network request,
  so it survives `file://` where `fetch()` doesn't. That would make the
  generated-`.js` pattern a `file://` workaround first and a
  performance choice second.

## What adopting a build step would unlock

This doesn't just clean up deploy -- it substantially undercuts the
*reason* the other two dev-briefs exist, and it may go further than
"adopt a bundler":

- If the `file://` CORS restriction above is really why content got
  baked into JS modules, then once the site is only ever served over
  `http(s)` (Static Assets already, or a dev server), that restriction
  is simply gone. At that point the player could `fetch()`
  `content/puzzles/*.ccpuzzle.json` straight off Static Assets at
  runtime and render it -- exactly what the *authoring* corpus already
  does (`playCorpusClient.js`: "fetch D1 corpus, JSON puzzle loader").
  No generated `.js` wrapper, no registry file, no compiler or bundler
  needed for puzzle *content* specifically -- **but see "Responsiveness
  is a gate, not an assumption" below before treating this as free.**
- Short of that, **`separate-authoring-from-generated-puzzle-artifacts.md`**'s
  fallback is a hand-written "compiler" step whose whole job is turning
  canonical JSON into hand-shaped `puzzles/**/*.js` module text plus
  registry splicing. A real bundler with glob-import support (Vite's
  `import.meta.glob()`, for one) does the "every canonical JSON file
  becomes an importable module, automatically, no registry file to
  maintain by hand" part for free, if runtime `fetch()` turns out not to
  be responsive enough and content still needs to ship as part of the
  bundled app instead. Bundling the *application code itself*
  (`game.js` and the rendering/interaction modules) is a separate,
  narrower win either way -- fewer round trips, smaller payloads,
  tree-shaking -- independent of how puzzle content is delivered.
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

## Responsiveness is a gate, not an assumption

Raised directly in the conversation this brief comes from: remote calls
are not free, and there's already observed loading slowness on the
authoring server today. That's a real, specific caution, not a vague one
-- but it points at a different mechanism than the one this brief
proposes for the player, and the two shouldn't be conflated:

- The authoring server's puzzle/catalogue reads go through **D1** --
  `contentDocuments.getPublished`/`getDraft`, a real database query over
  HTTP (`createHttpD1Database`), assembled per request. That has query
  latency, and possibly per-request corpus-assembly cost, baked in by
  nature. It is not cached at Cloudflare's edge the way a static asset
  is.
- What this brief proposes for the *player* is fetching an already-built
  static JSON file off **Workers Static Assets** -- the same CDN-cached
  delivery mechanism serving `game.js` and every other static file
  today, not a database query. Those are different performance profiles,
  and today's authoring-server slowness is much more likely diagnosing
  D1 query latency than it is telling us anything about static-asset
  fetch latency.

That distinction matters, but it doesn't make the caution go away --
it relocates it. Today, once `index.html` and its modules finish
loading, opening *any* puzzle costs zero further network calls (eager
`import` or same-origin lazy `import()`, both already resident or
trivially cached). Converging on runtime `fetch()` of a static JSON
file, however fast that fetch typically is, introduces a real network
round trip at the moment a puzzle opens that does not exist today.
Before this direction is adopted for the live player, that round trip
needs to be **measured, not assumed** -- on a real edge-cached static
asset, on a representative slow connection, not extrapolated from the
authoring server's D1-backed numbers. If it doesn't hold up, the
bundler/compiler path above (ship content as part of the loaded
application, no runtime fetch per puzzle) is the fallback, not a
downgrade -- it was always the available alternative to fetch-based
delivery, not a worse version of it.

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
- The authoring server's current D1-backed loading slowness is worth
  diagnosing on its own merits regardless of this brief -- it's a
  live-today user experience problem, not a hypothetical one -- but it's
  a separate investigation (D1 query shape, corpus assembly cost, HTTP
  binding overhead) from the static-asset-fetch question above, and
  fixing one doesn't require or block fixing the other.
