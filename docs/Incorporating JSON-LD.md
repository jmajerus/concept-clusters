# Incorporating JSON-LD

> Import and Export to JSON-LD. 
> Entire puzzles, and perhaps catalogues, should be both importable and exportable via JSON-LD.
> This will be the standard mechanism, is what I'm thinking, such that .patch files are no longer preferred or desired?


Yes—with an important distinction

**JSON-LD should become the standard portable content format for Concept Clusters.** Complete puzzles and complete catalogues should be importable and exportable as self-contained `.jsonld` documents.

Consequently, **`.patch` files should no longer be the preferred way to exchange puzzle content**. A patch is tied to a particular repository state and file layout; a JSON-LD document describes the puzzle itself. Patches would remain appropriate for changes to application code, validation logic, documentation, and other repository implementation details.

I would distinguish three things:

| Purpose                               | Preferred mechanism        |
| ------------------------------------- | -------------------------- |
| Exchange or publish a puzzle          | JSON-LD puzzle document    |
| Exchange or publish a catalogue       | JSON-LD catalogue bundle   |
| Modify the application implementation | Git commit, diff, or patch |

That is a much cleaner separation.

## Interchange format first, source format later

I would **not immediately require the repository’s existing puzzle files to be replaced by JSON-LD**.

At present:

- puzzles are executable JavaScript modules registered through `puzzles/index.js`;
- catalogues are JavaScript objects containing references to canonical puzzle IDs;
- the game imports those modules synchronously;
- the prototype deliberately runs by opening `index.html` directly, without a server or build step.

Loading a collection of separate JSON files from a `file:` page is less reliable across browsers than importing the current JavaScript modules. Therefore, I would begin with this architecture:

```text
Repository puzzle modules
          ↓
    Internal puzzle model
       ↙           ↘
JSON-LD import   JSON-LD export
```

The JSON-LD importer converts portable content into the game’s internal puzzle shape. The exporter performs the reverse conversion.

After the format has stabilized, the repository could migrate to:

```text
Canonical .jsonld source files
              ↓
     generated JavaScript registry
              ↓
         offline game
```

That later step would introduce a small generation command while preserving the offline application. It should be a separate decision rather than a prerequisite for import/export.

## Use a constrained JSON-LD profile

Concept Clusters should not accept arbitrary RDF expressed as JSON-LD. It should define a deliberately narrow **Concept Clusters JSON-LD Application Profile**.

JSON-LD is particularly suitable because its `@context` maps readable field names to stable vocabulary identifiers, `@id` provides persistent identities, and `@graph` can package multiple related resources in one document. ([W3C](https://www.w3.org/TR/json-ld11/?utm_source=chatgpt.com))

A puzzle might look approximately like this:

```json
{
  "@context": "https://concept-clusters.org/context/v1",
  "@id": "urn:concept-clusters:puzzle:maintaining-homeostasis",
  "@type": "Puzzle",
  "schemaVersion": "1.0",
  "id": "maintaining-homeostasis",
  "title": "Maintaining Homeostasis",
  "category": "Physiology & Medicine",
  "clusters": [
    {
      "@id": "#monitoring",
      "@type": "Cluster",
      "id": "monitoring",
      "name": "Monitoring conditions",
      "color": "teal",
      "terms": [
        "receptor",
        "stimulus",
        "sensory input"
      ],
      "seeds": [
        "receptor",
        "stimulus"
      ],
      "fact": "..."
    }
  ],
  "bridges": [
    {
      "@id": "#afferent-pathway",
      "@type": "Bridge",
      "term": "afferent pathway",
      "clusters": [
        { "@id": "#monitoring" },
        { "@id": "#comparison" }
      ],
      "direction": {
        "kind": "through",
        "from": { "@id": "#monitoring" },
        "to": { "@id": "#comparison" }
      },
      "fact": "..."
    }
  ]
}
```

The ordinary fields remain readable JSON. An application that knows nothing about RDF can still process it normally, while a JSON-LD processor can recognize the identities and relationships.

## Improve one part of the existing schema

The existing bridge schema identifies clusters by numeric array positions:

```js
clusters: [0, 1]
direction: { kind: "through", from: 0, to: 1 }
```

That works inside a single JavaScript object, but it is not ideal for durable interchange. Reordering clusters should not silently change the meaning of a bridge.

The JSON-LD profile should introduce stable local cluster IDs:

```json
"clusters": [
  { "@id": "#monitoring" },
  { "@id": "#comparison" }
]
```

Direction then references those IDs rather than positions. The importer can translate them back into numeric indexes for the current game engine.

This would also improve `idealTerms`. Rather than relying on parallel arrays:

```json
"idealTerms": [
  {
    "cluster": { "@id": "#monitoring" },
    "term": "receptor"
  },
  {
    "cluster": { "@id": "#comparison" },
    "term": null
  }
]
```

That is more verbose, but much harder to corrupt accidentally.

## Preserve ordering explicitly

Ordering matters in several parts of Concept Clusters:

- cluster order;
- term and seed order;
- catalogue entry order;
- lens sequence;
- the correspondence currently represented by `clusters` and `idealTerms`.

In RDF, multiple property values are not inherently ordered. The JSON-LD context should therefore define these properties as ordered lists using `@container: "@list"`, or the profile should explicitly preserve array order as part of its non-RDF application contract.

I favor declaring them as JSON-LD lists. Otherwise, a generic JSON-LD round trip could legally lose meaningful ordering.

## Two forms of catalogue export

The current catalogue design intentionally stores puzzle IDs rather than copies of puzzle objects, allowing one canonical puzzle to belong to several catalogues. That remains the right internal model.

For interchange, however, there should be two export forms.

### Catalogue manifest

Contains the catalogue metadata and puzzle references:

```text
Catalogue
 ├── energy-flow
 ├── maintaining-homeostasis
 └── closing-the-loop
```

This is small and appropriate when the recipient already has the referenced puzzles.

### Portable catalogue bundle

Contains:

- the catalogue;
- all member puzzles;
- category metadata used by those puzzles;
- relevant provenance and licensing metadata;
- references to related puzzles, even when those related puzzles are not bundled.

A top-level `@graph` is well suited to this package. The catalogue entries refer to puzzle `@id` values, while the puzzle resources themselves appear elsewhere in the same graph. JSON-LD expressly supports graph-shaped documents through `@graph`. ([W3C](https://www.w3.org/TR/json-ld11/?utm_source=chatgpt.com))

For the user-facing **Export catalogue** command, the portable bundle should be the default. “Manifest only” can be an advanced option.

I would not recursively include every `relatedPuzzles` target, because that could unexpectedly expand one catalogue into most of the library. Related entries outside the bundle should remain valid external references.

## Validation should remain layered

JSON-LD supplies meaning and identity; it does not by itself enforce the Concept Clusters authoring rules.

I recommend three validation stages:

1. **JSON parsing and JSON-LD profile checks**
   Known context, supported document type, supported schema version.
2. **JSON Schema validation**
   Required properties, accepted colors, bridge direction shapes, array sizes, information-object shapes, and so forth. JSON Schema is designed for structural validation of JSON documents. ([JSON Schema](https://json-schema.org/draft/2020-12?utm_source=chatgpt.com))
3. **Concept Clusters semantic validation**
   Reuse and generalize the rules already enforced by `validate.mjs`:
   - IDs are unique;
   - seeds occur among cluster terms;
   - bridges reference real clusters;
   - ideal terms exist;
   - direction topology is valid;
   - lens targets exist.

SHACL could eventually validate the RDF graph itself, but I would not make that a first-release dependency. It is designed for constraining RDF graphs, but JSON Schema plus the existing semantic validator will be considerably easier to integrate into this codebase. ([W3C](https://www.w3.org/TR/shacl/?utm_source=chatgpt.com))

## Versioning and context safety

Every file should carry both:

```json
"@context": "https://concept-clusters.org/context/v1",
"schemaVersion": "1.0"
```

They serve different purposes:

- `@context` defines vocabulary meaning;
- `schemaVersion` defines the accepted Concept Clusters document shape.

The application should ship with a local copy of every supported context. It should **not need to retrieve a remote context during import**. That preserves offline operation, prevents a context URL from changing the interpretation of an old file, and avoids importing data that depends upon network access.

An importer should reject unsupported major versions and run explicit migrations for older supported versions.

## Provenance is a major benefit

JSON-LD also gives the project a natural place for educational-content provenance:

```json
{
  "creator": {
    "name": "John Majerus"
  },
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "derivedFrom": [
    {
      "name": "Open textbook chapter title",
      "url": "..."
    }
  ],
  "dateCreated": "2026-07-31",
  "dateModified": "2026-08-04",
  "language": "en"
}
```

That will be especially valuable for OER-derived puzzles and imported catalogues. Provenance stops being something that must be reconstructed from commit history or a separate note.

## Recommended file types

I would use:

```text
energy-flow.ccpuzzle.jsonld
getting-started.cccatalogue.jsonld
engineering-foundations.ccbundle.jsonld
```

All three can use the standard JSON-LD media type, `application/ld+json`, while the extra filename segment makes their Concept Clusters role immediately visible.

Player progress, move history, and local layout experimentation should not be included in a normal puzzle or catalogue export. Those are separate document types if portable player sessions are ever desired.

## Proposed migration

### Phase 1: establish the contract

Add:

```text
schema/
  context-v1.jsonld
  puzzle-v1.schema.json
  catalogue-v1.schema.json
  bundle-v1.schema.json

modules/
  puzzleJsonLd.js
  catalogueJsonLd.js
  importValidation.js
```

Implement:

- Export current puzzle;
- Import puzzle from file;
- Export current catalogue as a portable bundle;
- Import a catalogue bundle into a local “Imported” library;
- command-line conversion and validation.

Built-in puzzles remain JavaScript modules during this phase.

### Phase 2: contribution workflow

A puzzle author supplies a complete `.ccpuzzle.jsonld` file rather than a `.patch`. The repository tooling validates it and converts or registers it.

A pull request still shows a normal Git diff, but the **authored artifact is the puzzle**, not a set of instructions for changing some earlier version of the repository.

### Phase 3: canonical source migration

Once the profile has survived real imports and exports, migrate built-in puzzles and catalogues to JSON-LD and generate the offline runtime registry.

That avoids prematurely freezing a first-draft interchange schema.

## Bottom line

I would adopt the following policy:

> **JSON-LD is the canonical interchange and publication format for complete Concept Clusters content. Puzzle and catalogue contributions should normally be delivered as complete JSON-LD documents or bundles, not as `.patch` files. Git patches remain an implementation mechanism, not a content format.**

That gives puzzles an existence independent of this particular repository, enables complete catalogue portability, supports OER provenance, and creates the foundation for other learning platforms to produce or consume Concept Clusters content.

------

> Yes, and at some point in time we may have to allow for database storage and a real-time authoring portal?

Yes. **Database storage and a real-time authoring portal are likely the natural next architectural stage**, and the JSON-LD decision can prepare for them rather than compete with them.

The governing principle should be:

> **One conceptual content model, with multiple representations.**

```text
                         Concept Clusters domain model
                                      │
              ┌───────────────────────┼────────────────────────┐
              │                       │                        │
       JSON-LD interchange     Database persistence      Runtime bundle
       import and export       drafts and revisions      offline application
                                      │
                               Authoring portal
```

## JSON-LD should not become the database design

JSON-LD should be the **portable publication and interchange representation**. The database should store the same concepts in the form most useful for editing, querying, validation, permissions, and revision history.

Trying to store everything only as opaque JSON-LD documents would make some future operations unnecessarily difficult:

- finding every puzzle that uses a particular concept;
- listing puzzles by category, author, source, or license;
- validating catalogue references;
- tracking changes to one bridge or cluster;
- managing drafts and published revisions;
- identifying which puzzles require migration;
- supporting simultaneous authors.

Conversely, forcing every optional content feature into rigid relational tables would make schema evolution cumbersome.

A practical first database would therefore be **PostgreSQL with a hybrid relational/JSONB model**:

- relational columns and tables for stable identity, ownership, status, relationships, and frequently queried fields;
- JSONB for flexible information objects, provenance details, experimental fields, and possibly a complete document snapshot;
- generated JSON-LD for import, export, and publication.

An RDF triple store would not be necessary merely because the interchange format is JSON-LD. It might become useful much later if cross-resource semantic querying becomes central, but PostgreSQL is the more practical starting point.

## Stable internal identity becomes essential

The current puzzle model uses array positions for cluster references and often uses displayed term strings as identifiers. That is reasonable for hand-authored JavaScript files, but a database and authoring portal need identities that survive reordering and renaming. The current bridge representation, for example, refers to clusters numerically.

I would introduce stable IDs now or as part of the JSON-LD work:

```json
{
  "@id": "urn:concept-clusters:puzzle:maintaining-homeostasis",
  "id": "maintaining-homeostasis",
  "clusters": [
    {
      "@id": "#cluster-monitoring",
      "id": "cluster-monitoring",
      "name": "Monitoring conditions"
    }
  ]
}
```

Eventually, the significant authored entities should have stable identities:

- puzzle;
- cluster;
- bridge;
- lens;
- catalogue;
- catalogue entry;
- possibly terms, especially if definitions, links, translations, or analytics attach to them independently.

The player-facing word can then change without changing the identity of the underlying authored object.

## Separate puzzle identity from puzzle revision

A real authoring system should distinguish:

```text
Puzzle
  stable identity: maintaining-homeostasis
      │
      ├── Revision 1 — published
      ├── Revision 2 — published
      └── Revision 3 — draft
```

A useful model would include:

- `puzzle_id`: permanent identity;
- `revision_id`: immutable identity for one saved revision;
- `version`: human-readable or sequential version;
- `status`: draft, review, published, archived;
- `created_by`;
- `created_at`;
- `based_on_revision`;
- `schema_version`;
- publication and licensing metadata.

Published revisions should generally be immutable. Editing a published puzzle creates a new draft revision rather than silently changing the historical object.

This is particularly important once catalogues, classrooms, saved player sessions, citations, or external repositories refer to puzzles.

## Catalogues need a version policy

The present catalogue model correctly refers to canonical puzzle IDs instead of duplicating puzzle content. In a database system, each catalogue entry will eventually need to express one of two policies:

```text
Follow latest published revision
```

or:

```text
Pinned to revision 7
```

Most ordinary catalogues should probably follow the latest published revision. A curriculum, assessment, research archive, or formally released OER package may need to pin exact revisions for reproducibility.

Portable catalogue bundles should always record the exact revisions included, even when the live catalogue normally follows the latest release.

## The authoring portal should edit drafts, not files

The portal would operate on the domain model through an application API:

```text
Browser authoring interface
          ↓
Authoring API
          ↓
Draft and revision service
          ↓
PostgreSQL
```

The author should be able to:

- create or import a puzzle;
- add and reorder clusters;
- manage terms and seeds;
- draw bridges between clusters;
- author bridge direction visually;
- add definitions, links, provenance, and licensing;
- preview Graph, Star, and Circle modes;
- run validation continuously;
- save drafts automatically;
- submit a revision for review;
- publish an approved revision;
- export the result as JSON-LD.

Imported JSON-LD should normally become a **draft**, not immediately enter the public catalogue. That gives the system an opportunity to validate, review provenance, resolve ID collisions, and show the author exactly what will be added.

## Real-time does not initially require Google-Docs-style collaboration

There are two meanings of “real-time authoring”:

1. **Immediate interactive authoring**
   Autosave, live preview, immediate validation, and no manual file editing.
2. **Concurrent collaborative authoring**
   Multiple people changing the same puzzle simultaneously, with cursor presence and conflict-free merging.

The first is straightforward and should come first.

For early multi-user editing, ordinary optimistic concurrency is likely enough:

```text
Author opens revision 17
Author saves with expected revision 17
Database accepts it and creates revision 18
```

If another author has already created revision 18, the save is rejected or presented as a merge conflict.

A CRDT or operational-transformation system should be considered only when simultaneous editing of the same puzzle becomes a demonstrated need. Adding it prematurely would impose substantial complexity on a content structure that is mostly arrays, relationships, and small text fields.

## Validation should be one shared service

The project already has substantial semantic validation: term and seed rules, bridge references, direction topology, and lens targets.

Those rules should eventually be extracted from `validate.mjs` into a reusable validation package:

```text
concept-clusters-validator
        │
        ├── command-line validation
        ├── browser authoring validation
        ├── JSON-LD import validation
        ├── publication validation
        └── repository CI validation
```

That prevents the portal, repository tooling, and import system from gradually acquiring different definitions of a valid puzzle.

Validation messages should identify stable object IDs and exact fields:

```text
bridge "afferent-pathway":
direction.to references unknown cluster "comparison"
```

This will be much more useful in an interactive editor than a general file-level error.

## Preserve the offline application

The real-time portal does not need to replace the existing offline-capable player. The current prototype intentionally uses locally vendored assets and JavaScript imports.

A future deployment could publish generated content bundles:

```text
Authoring database
       ↓ publish
Versioned JSON-LD release
       ↓ build
Static runtime registry
       ↓
Offline-capable Concept Clusters player
```

That gives the project both:

- a dynamic, database-backed authoring and library environment;
- a durable static application that can be downloaded, archived, mirrored, or used without continuous service availability.

This is especially appropriate for educational and OER material. The content should not become inaccessible merely because the authoring service is unavailable.

## Design decisions worth making early

To avoid a painful migration later, the JSON-LD phase should establish these foundations now:

1. Stable IDs for nested authored entities.
2. Explicit schema versions.
3. Separate stable content identity from immutable revisions.
4. Provenance and license fields.
5. Reference-based catalogue membership.
6. Ordered collections explicitly preserved.
7. A single internal domain model independent of storage format.
8. Import and export adapters rather than JSON-LD assumptions throughout the game.
9. Validation rules usable in Node and the browser.
10. Unknown extension fields preserved when safely possible.

The last point matters for interoperability. A system should not necessarily discard a valid extension merely because the current editor does not display it. Extensions can be namespaced in JSON-LD and retained through round trips, subject to security and validation limits.

## Recommended long-term architecture

```text
┌─────────────────────────────────────────────────────┐
│                 Authoring portal                    │
│ editor · preview · validation · review · publishing │
└─────────────────────────┬───────────────────────────┘
                          │ API
┌─────────────────────────▼───────────────────────────┐
│                  Domain services                    │
│ puzzles · catalogues · revisions · provenance       │
│ validation · permissions · publication              │
└───────────────┬───────────────────────┬─────────────┘
                │                       │
┌───────────────▼──────────────┐  ┌─────▼──────────────────────┐
│ PostgreSQL                   │  │ JSON-LD adapter            │
│ relational identity         │  │ import · export · bundles  │
│ relationships and revisions │  │ version migration          │
│ JSONB extensible content    │  └─────┬──────────────────────┘
└──────────────────────────────┘        │
                              ┌─────────▼──────────────────────┐
                              │ Static publication pipeline   │
                              │ generated registry and assets │
                              └─────────┬──────────────────────┘
                                        │
                              ┌─────────▼──────────────────────┐
                              │ Offline-capable puzzle player │
                              └────────────────────────────────┘
```

So yes: **JSON-LD is not merely an alternative to `.patch` files. It can be the boundary that allows the repository prototype, a future PostgreSQL database, a web authoring portal, static OER distributions, and third-party tools all to exchange the same conceptual content without sharing the same implementation.**

------

> I want to implement this sooner than later, as there is too much manual effort in editing multiple separate files when authoring a puzzle at the moment?

I agree. **The present authoring friction is already sufficient reason to bring this forward.** The repository currently treats `puzzles/` JavaScript modules as the authoring format, requires registration in `puzzles/index.js`, and may also require catalogue, category, learning-introduction, and resource edits. That was manageable for a smaller prototype, but it will become increasingly expensive and error-prone as puzzles gain instructional content, provenance, subcategories, layouts, lenses, and catalogue membership.

I would revise the earlier sequencing:

> **Make a single JSON-LD authoring package the canonical source soon, while retaining generated JavaScript for the offline runtime.**

## The immediate target

An author should work with **one puzzle package**, either through a form or as a JSON-LD file:

```text
closing-the-loop.ccpuzzle.jsonld
```

That document should contain:

- puzzle metadata;
- category and eventual subcategory;
- clusters, terms, seeds, and facts;
- bridges, direction, ideal terms, and explanations;
- concept lenses;
- learning introduction metadata and content references;
- provenance, sources, creator, and license;
- related-puzzle relationships;
- desired catalogue memberships;
- authored layouts, when present.

The author should not manually edit:

```text
puzzles/engineering/closing-the-loop.js
puzzles/index.js
catalogues/some-catalogue.js
puzzles/categories.js
resource registration or manifests
```

Those should be generated or updated by tooling.

## Preserve the current runtime

The application is presently a static site with native ES modules and no runtime build step. That is worth preserving.

The new flow should therefore be:

```text
JSON-LD authoring package
          │
          ▼
Import and publication tool
          │
          ├── validates the complete package
          ├── writes or updates the puzzle source
          ├── updates catalogue membership
          ├── resolves category registration
          ├── installs packaged resources
          └── regenerates runtime files
                    │
                    ▼
      Existing static/offline application
```

Generated runtime files can remain committed to Git so the deployed player still needs no database, server request, or compilation step.

They should carry a warning such as:

```js
// Generated from content/puzzles/closing-the-loop.ccpuzzle.jsonld.
// Do not edit this file directly.
```

## A practical first release

I would divide the implementation into three closely connected milestones.

### 1. Single-file content pipeline

Add canonical content directories:

```text
content/
  contexts/
    concept-clusters-v1.jsonld
  schemas/
    puzzle-v1.schema.json
    catalogue-v1.schema.json
  puzzles/
    closing-the-loop.ccpuzzle.jsonld
```

Add commands such as:

```text
npm run content:import -- my-puzzle.ccpuzzle.jsonld
npm run content:export -- closing-the-loop
npm run content:sync
npm run content:check
```

`content:import` should:

1. parse and validate the document;
2. detect ID collisions;
3. copy or update the canonical JSON-LD file;
4. update requested catalogue memberships;
5. regenerate `puzzles/index.js`;
6. generate the compatibility JavaScript puzzle module;
7. run the existing semantic validation;
8. report every file it changed.

This alone would eliminate much of the repetitive work even before the visual editor exists.

### 2. Local authoring portal

Add a separate authoring entry point:

```text
author.html
author/
  author.js
  editorState.js
  puzzleForm.js
  clusterEditor.js
  bridgeEditor.js
  lensEditor.js
  publicationEditor.js
  previewController.js
```

It should provide:

- **New puzzle**
- **Import JSON-LD**
- **Open an existing built-in puzzle**
- **Save local draft**
- **Export JSON-LD**
- **Preview puzzle**
- **Validate**
- **Download repository package**

The authoring workspace should use the existing renderers for live preview rather than creating a second imitation of the game. The repository already has separate Graph, Star, Circle, engine, validation, and storage-oriented modules, which makes reuse more feasible than it would have been when `game.js` was monolithic.

A useful layout would be:

```text
┌───────────────────────┬────────────────────────────┐
│ Puzzle editor         │ Live puzzle preview        │
│                       │                            │
│ Metadata              │ Graph / Star / Circle      │
│ Clusters              │                            │
│ Bridges               │ Validation overlays        │
│ Lenses                │                            │
│ Introduction          │                            │
│ Sources               │                            │
│ Publication           │                            │
├───────────────────────┴────────────────────────────┤
│ Errors · warnings · authoring guidance             │
└────────────────────────────────────────────────────┘
```

The first portal does not need accounts or a database. Drafts can use IndexedDB or local storage, and completed documents can be exported to JSON-LD.

### 3. Repository publication command

The portal itself should not need permission to rewrite local repository files. Instead, it produces a document that one command installs:

```text
npm run content:import -- ~/Downloads/new-puzzle.ccpuzzle.jsonld
```

Later, a server-backed portal can invoke the same import and publication service through an API.

## Design it for database storage now

The portal should not directly depend on local storage. Give it a narrow persistence interface:

```js
export class DraftRepository {
  async listDrafts() {}
  async loadDraft(id) {}
  async saveDraft(document, expectedRevision) {}
  async deleteDraft(id) {}
}
```

The first implementation can be:

```text
IndexedDbDraftRepository
```

A future implementation becomes:

```text
ApiDraftRepository
        ↓
PostgreSQL
```

The editor should not care which one is active. This is the most important architectural preparation for the later real-time portal.

The same applies to publication:

```text
LocalJsonLdPublisher
RepositoryPublisher
ApiPublisher
```

## Do not make authors edit raw JSON-LD

JSON-LD should be the standard interchange and canonical storage document, but it should not normally be the authoring interface.

The portal should present meaningful controls:

```text
Bridge term:       negative feedback
Connects:
  From:            Producing a correction
  To:              Monitoring conditions
Direction:         Through-directed
Best matching terms:
  Source:          corrective response
  Destination:     receptor
Teaching fact:     ...
```

It then serializes the corresponding JSON-LD structure.

An advanced “View source” panel would still be useful, but it should be secondary.

## Catalogue membership can remain conceptually separate

Catalogue membership should not become an intrinsic property of a puzzle. One puzzle can belong to multiple editorial collections, and the current model correctly keeps catalogues as references to canonical puzzle IDs.

However, the **authoring package** can include publication instructions:

```json
{
  "@type": "PuzzlePackage",
  "puzzle": {
    "@id": "urn:concept-clusters:puzzle:closing-the-loop"
  },
  "catalogueEntries": [
    {
      "catalogue": {
        "@id": "urn:concept-clusters:catalogue:getting-started"
      },
      "reason": "Introduces bridges through a familiar control loop."
    }
  ]
}
```

The importer applies those instructions to the canonical catalogue documents. Thus, the author works in one portal and exports one package without collapsing the underlying separation.

## Extract validation before building much UI

The existing validator already understands substantial authoring semantics, including seeds, ideal terms, bridge topology, and lens references.

The first engineering task should be to extract those rules into a shared pure module:

```text
modules/contentValidation.js
```

Then:

```text
validate.mjs
authoring portal
JSON-LD importer
publication command
future API
```

all call the same validator.

Otherwise, the portal may tell an author that a puzzle is valid while repository CI rejects it later.

## What the first usable version should accomplish

The first release is successful when a new puzzle can be created this way:

1. Open the authoring page.
2. Enter puzzle metadata.
3. Add clusters and terms.
4. select two seeds per cluster.
5. draw and describe bridges.
6. optionally add lenses and instructional material.
7. choose category and catalogue placement.
8. preview all rendering modes.
9. resolve validation findings.
10. export one JSON-LD package.
11. run one import command.
12. see the puzzle appear in the application.

No hand-editing of registries or catalogue files should be required.

## Recommended implementation order

I would make this the next substantial feature in the following order:

```text
1. Stable IDs and internal content model
2. Shared validation module
3. JSON-LD context, schema, importer, and exporter
4. Generated puzzle registry and compatibility modules
5. Basic authoring workspace
6. Live game preview
7. Catalogue and resource publication handling
8. Database-backed drafts and collaboration
```

The crucial point is that steps 1–4 already remove a large amount of manual work. The visual portal then becomes a client of a working content pipeline rather than a large UI built atop an unsettled format.

**So I would not wait for a future database project. The right near-term feature is a local-first authoring portal built around one canonical JSON-LD package, one shared validator, and one-command publication into the existing static application.**

------

## Implemented interchange milestone

The first implementation establishes the portable boundary without yet
migrating all built-in source or building the authoring portal:

- a locally shipped, network-independent v1 context and JSON Schema contracts;
- stable puzzle, cluster, bridge, catalogue, and catalogue-entry identities;
- ID-based bridge, direction, and ideal-term references that survive cluster
  reordering;
- round-trip puzzle, catalogue-manifest, and portable catalogue-bundle adapters;
- materialization of outboard lesson Markdown during export;
- namespaced extension preservation and publication/provenance fields;
- a browser-safe semantic validator shared by repository CI and JSON-LD import;
- `content:export`, `content:check`, and transactional `content:import` commands;
- generated compatibility puzzle modules, registry updates, optional catalogue
  placement, collision refusal, dry runs, and automatic rollback on failed
  repository validation; and
- full-catalogue round-trip and command-line regression coverage.

Repository installation of a whole bundle, canonical migration of the 60
built-in puzzles, packaged binary assets, and the local authoring portal remain
separate milestones. See [JSON-LD.md](JSON-LD.md) for the implemented profile
and workflow.
