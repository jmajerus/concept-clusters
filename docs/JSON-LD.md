# JSON-LD interchange

**For MCP/chatbot authoring, start with
[SIMPLIFIED-PUZZLE-FORMAT.md](./SIMPLIFIED-PUZZLE-FORMAT.md) instead** --
it's the primary input the authoring tools expect now, and covers puzzle
content fully (multi-cluster bridges, direction, ideal terms, all three
lens modes, related puzzles, a learning introduction), not a cut-down
subset of it. This document remains the portable interchange format
underneath (every simplified document compiles down to exactly this shape
before storage or publication) and the home for Star layout curation, the
one thing genuinely outside that format's scope (see its "What stays
JSON-LD-only" section).

Concept Clusters JSON-LD is the portable interchange format for complete
puzzles and curated catalogues. Git patches remain appropriate for changing
application code; they are no longer the preferred way to hand off content.

This is the first interchange milestone. Built-in content remains in the
existing JavaScript modules so the player stays static and offline-capable.
The adapters and commands provide a stable boundary around that runtime:

```text
JavaScript puzzle registry ⇄ internal puzzle model ⇄ JSON-LD
```

Canonical JSON-LD source generation and the local authoring portal are later
milestones. The profile should gain real-world import/export experience before
all built-in source files are migrated.

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

Install a new puzzle and optionally add it to a catalogue:

```sh
npm run content:import -- puzzle.ccpuzzle.jsonld \
  --catalogue getting-started \
  --reason "Introduces the central relationship through a familiar example."
```

The importer validates before writing, then updates the canonical imported
document under `content/puzzles/`, generates its compatibility module under
`puzzles/<category>/`, registers it in `puzzles/index.js`, and optionally adds
the catalogue entry. It runs repository validation after writing and restores
the original files automatically if that validation fails. Existing puzzle
IDs are refused unless `--replace` is explicit.

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
  "category": "Art",
  "subcategories": {
    "Art": "visual-form"
  }
}
```

The profile validates this as a map of non-empty category names to stable
slug IDs. Repository installation adds the taxonomy-aware checks: every key
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
  "termRole": "connector",
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

`termRole` is optional and accepts `reference` or `connector`. Omission means
`reference` for backward compatibility. A reference bridge term is itself an
intended object of learning within the puzzle's conceptual territory and
central lesson. A connector instead carries a local relationship, evidence,
mechanism, plot detail, or biographical thread; it may be a concrete or notable
noun, not only a phrase. Article existence, familiarity, and searchability do
not decide the role.

Classify the role first, then curate links separately. Prefer a verified direct
resource for references; retain automatic search only when the result set is
deliberately useful, not merely because a link is missing. `connector`
suppresses that fallback and must not carry an authored `link`, `extraLink`,
`seeAlso`, or citation URL. Its `info.text` may—and often should—clarify the
connector's local role; a non-linked bibliographic citation may substantiate
the bridge fact. The field is independent of `relationKind`, which classifies
the relationship rather than the displayed term's role in the lesson.

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
```

`generativeAssistance` is compact current attribution for generative-AI help
(not an edit history): an ordered list of
`{ system, provider?, scope, role?, date? }`. `system` and `scope` are
required; `scope` is `learningIntroduction`, `puzzle`, or `lenses`; `role`
is `drafted` or `edited`. Keep one entry per system+scope and update it in
place when the same assistant continues on that scope. The Lesson modal
renders a short "Assisted by …" line from `learningIntroduction`- and
`puzzle`-scoped entries.

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

- Migrating every built-in puzzle to canonical JSON-LD source.
- Installing portable catalogue bundles into the repository in one command.
- Packaging binary assets in a ZIP-like `.ccpuzzle` container.
- A browser authoring workspace and IndexedDB draft repository.
- Immutable published revisions and database-backed identity.
- JSON-LD expansion, RDF graph processing, SHACL, or a triple store.

These are compatible with the v1 boundary but are not required to begin
exchanging complete puzzle and catalogue content now.
