# JSON-LD interchange

**For authoring, start with
[SIMPLIFIED-PUZZLE-FORMAT.md](./SIMPLIFIED-PUZZLE-FORMAT.md) instead** --
it's the only input the authoring tools (MCP and CLI alike) accept now, and
covers puzzle content fully (multi-cluster bridges, direction, ideal terms,
all three lens modes, related puzzles, a learning introduction). JSON-LD is
no longer part of the authoring workflow or of storage: drafts, canonical
`content/puzzles/*.ccpuzzle.json` files, and published `puzzles/**/*.js`
modules are all the simplified format's shape end to end. This document
describes JSON-LD's one remaining role -- an on-demand *portable interchange*
format, generated and consumed only when a puzzle or catalogue needs to leave
this codebase (or be handed off between two installations of it), via
`npm run content:export`/`content:import`/`content:check` (and, on the local
MCP server only, the equivalent tools). It is never read from or written to
as a side effect of drafting, validating, or publishing a puzzle.

Concept Clusters JSON-LD is the portable interchange format for complete
puzzles and curated catalogues. Git patches remain appropriate for changing
application code; they are no longer the preferred way to hand off content.

Built-in content lives in the existing JavaScript modules so the player stays
static and offline-capable. The adapters and commands provide a stable
boundary around that runtime, with the simplified format as the actual
canonical shape in the middle:

```text
JavaScript puzzle registry ⇄ internal puzzle model ⇄ simplified format ⇄ JSON-LD
```

The JSON-LD adapters (`puzzleToJsonLd`/`puzzleFromJsonLd`) still exist and are
still exercised by the interchange commands below; they just no longer sit on
the path any draft, validation, or publish call takes.

## Commands

Export one puzzle:

```sh
npm run content:export -- energy-flow
npm run content:export -- from-evidence-to-action --output /tmp/evidence.ccpuzzle.jsonld
```

Exporting materializes an outboard learning-introduction Markdown file into
the portable document. The default filename is
`<id>.ccpuzzle.jsonld`. Use `--output -` to write JSON to standard output.

Export a portable catalogue bundle (the default catalogue form):

```sh
npm run content:export -- --catalogue getting-started
```

The resulting `<id>.ccbundle.jsonld` contains one catalogue, all of its member
puzzles, and metadata for the categories those puzzles use. Related puzzles
outside the catalogue remain references rather than being recursively added.
For the smaller reference-only form:

```sh
npm run content:export -- --catalogue getting-started --manifest
```

Validate one or more documents without installing them:

```sh
npm run content:check -- puzzle.ccpuzzle.jsonld
npm run content:check -- first.ccpuzzle.jsonld second.ccbundle.jsonld
```

Preview repository publication:

```sh
npm run content:import -- puzzle.ccpuzzle.jsonld --dry-run
```

Install a new puzzle:

```sh
npm run content:import -- puzzle.ccpuzzle.jsonld
```

The importer validates before writing, then updates the canonical imported
document under `content/puzzles/`, generates its compatibility module under
`puzzles/<category>/`, and registers it in `puzzles/index.js`. Catalogue
membership is authored in D1 through the catalogue editor or MCP
`update_catalogue`, then ships through Cue and Freeze; JSON-LD import does not
edit catalogue modules. It runs repository validation after writing and
restores the original files automatically if that validation fails. Existing
puzzle IDs are refused unless `--replace` is explicit.

Repository installation of an entire catalogue bundle is intentionally not
in this milestone. Bundles can already be exported, checked, and round-tripped
through the adapter; applying collision and revision policy to several
canonical puzzles at once deserves a separate transactional workflow.

## Application profile v1

Every top-level document uses:

```json
{
  "@context": "https://concept-clusters.org/context/v1",
  "schemaVersion": "1.0"
}
```

The context URL is an identifier, not a runtime dependency. Import never
retrieves it from the network. The supported context is shipped locally at
`content/contexts/concept-clusters-v1.jsonld`.

The profile is deliberately constrained rather than accepting arbitrary
JSON-LD. Its schema contracts are:

- `content/schemas/puzzle-v1.schema.json`
- `content/schemas/catalogue-v1.schema.json`
- `content/schemas/bundle-v1.schema.json`

The importer performs equivalent profile checks directly, without expanding
JSON-LD or fetching a remote context, and then applies the shared Concept
Clusters semantic validator. The checked-in JSON Schemas document the
machine-readable contract for other tools and future standards-based schema
validation.

### Category-relative subcategories

Portable puzzles preserve the optional category-to-subcategory mapping:

```json
{
  "category": "art",
  "subcategories": {
    "art": "visual-form"
  }
}
```

The profile accepts stable category ids as the canonical interchange form and
also accepts legacy display-title references for backwards-compatible imports.
Repository installation canonicalizes those titles before a draft or
publication is stored. It then applies the taxonomy-aware checks: every key
must be one of that puzzle's categories and every ID must be registered under
that category in `puzzles/categories.js`. Catalogue bundles also include the
relevant category subcategory definitions, so the classification survives a
portable bundle round trip. Missing assignments remain valid and are exposed
by the browser's generated Other partition.

## Stable identity and ordering

Hand-authoring this `id`/`@id` pairing for every cluster and bridge is
exactly what the simplified format sidesteps by construction -- it only ever
asks for `id`, and `@id` is always mechanically `"#" + id`, derived here
rather than typed twice. See `modules/simplifiedPuzzleSchema.js`.

Puzzle and catalogue identities are URNs:

```text
urn:concept-clusters:puzzle:maintaining-homeostasis
urn:concept-clusters:catalogue:getting-started
```

Clusters and bridges receive stable local fragment IDs. An existing internal
`id` is retained; otherwise export derives one deterministically from the
displayed name or term:

```json
{
  "@id": "#cluster-monitoring-conditions",
  "@type": "Cluster",
  "id": "cluster-monitoring-conditions",
  "name": "Monitoring conditions"
}
```

Bridges refer to these identities rather than cluster array positions.
Through-direction endpoints and ideal terms do the same:

```json
{
  "@type": "Bridge",
  "term": "from monitoring to comparison",
  "clusters": [
    { "@id": "#cluster-monitoring" },
    { "@id": "#cluster-comparison" }
  ],
  "direction": {
    "kind": "through",
    "from": { "@id": "#cluster-monitoring" },
    "to": { "@id": "#cluster-comparison" }
  },
  "idealTerms": [
    {
      "cluster": { "@id": "#cluster-monitoring" },
      "term": "receptor"
    }
  ]
}
```

Bridge help should match the relationship described by its fact. Use concise
`info.text` for local context, `info.links` for verified destinations that
advance that connection, and puzzle-level citations for broader lesson
support. Omitting a link is fine; automatic Wikipedia search is not inferred.
`relationKind`, when present, classifies the relationship expressed by the
bridge fact.

Legacy JSON-LD documents may still contain `termRole`; the importer and the
corpus canonicalizer accept that old field only long enough to discard it.
Current simplified content and newly exported JSON-LD never emit it.

The importer translates those references back to the current runtime's
numeric indices. Reordering a JSON-LD cluster list therefore does not silently
change bridge meaning.

Arrays whose order affects learning or presentation are declared as JSON-LD
`@list` containers in the context. This includes clusters, bridges, terms,
seeds, lenses, lens targets, ideal terms, and catalogue entries.

## Provenance and extensions

The puzzle adapter preserves these publication fields when present:

```js
creator
license
derivedFrom
dateCreated
dateModified
language
version
generativeAssistance
provenance
```

`generativeAssistance` is compact current attribution for generative-AI help
(not an edit history): an ordered list of
`{ system, scope, role?, date? }`. `system` and `scope` are
required; `scope` is `learningIntroduction`, `puzzle`, or `lenses`; `role`
is `drafted` or `edited`. Keep one entry per system+scope and update it in
place when the same assistant continues on that scope. The Lesson modal
renders a short "Assisted by …" line from `learningIntroduction`- and
`puzzle`-scoped entries.

`provenance` is the optional two-axis authoring record
(`collaboration` + `contributors`, plus optional client settings and
author-owned `reviewedBy`). See
[authoring provenance shape](dev-briefs/authoring-provenance-shape.md). It
is meant to supersede the split between `generativeAssistance` and
`learningIntroduction.credit` in a later interchange bump (byline becomes a
derived L1 render). Agents should only author the L2 two-axis shape.

Unknown namespaced properties such as `example:reviewStatus` are preserved
through puzzle import/export instead of silently discarded. Unknown plain
fields are not treated as extensions. Nested terms do not yet have durable
entity IDs of their own; that remains a later profile evolution if definitions,
translations, or analytics need to address a term independently.

## Validation layers

Validation occurs in this order:

1. JSON syntax and the two-megabyte import limit.
2. Known local context, supported type, and exact schema version.
3. JSON-LD profile structure and resolvable stable references.
4. Shared Concept Clusters semantic rules: clusters, seeds, colors, bridge
   topology, ideal terms, lenses, and related puzzles.
5. Filesystem-backed learning-introduction and asset validation.
6. Full repository validation after publication.

The semantic rules live in `modules/contentValidation.js` and are used both by
`validate.mjs` and the JSON-LD pipeline. This is also the validation boundary
the future authoring portal should call.

## Deliberately deferred

- Installing portable catalogue bundles into the repository in one command.
- Packaging binary assets in a ZIP-like `.ccpuzzle` container.
- A browser authoring workspace and IndexedDB draft repository.
- Immutable published revisions and database-backed identity.
- JSON-LD expansion, RDF graph processing, SHACL, or a triple store.

These are compatible with the v1 boundary but are not required to begin
exchanging complete puzzle and catalogue content now.

## History

An earlier milestone made canonical `content/puzzles/*.ccpuzzle.jsonld`
JSON-LD the actual storage format underneath drafts, validation, and
publication -- the simplified format was a thin authoring-time convenience
that got converted to JSON-LD immediately. That coupling was removed:
JSON-LD added real overhead (`@id`/`@type` ceremony, profile validation, an
extra conversion hop) to every draft and publish, almost none of which paid
for itself outside the genuinely-portable-interchange case. Canonical files
are `content/puzzles/*.ccpuzzle.json` (simplified format) now; all 81
puzzles that had JSON-LD canonical files were mechanically migrated over
losslessly, and the small number of gaps the migration surfaced (a `seeAlso`
info-link shape, `learningIntroduction.revision`, non-string `version`
values, and cluster term order not always being seeds-then-floatingTerms)
were folded into the simplified schema rather than dropped.

Any later JSON-LD puzzle files are legacy repository artifacts rather than a
second source of truth. `npm run content:canonicalize` converts them to the
simplified source and removes the `.ccpuzzle.jsonld` copy after validation.
