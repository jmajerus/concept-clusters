# Canonical content and schema evolution

Puzzle authoring and published storage use the simplified puzzle document
shape (`simplified-v1`). JSON-LD remains an explicit interchange format for
`content:export`, `content:import`, and `content:check`; it is not a canonical
source or a D1 storage format.

## Ongoing schema evolution

Canonicalization is a shared compatibility boundary. MCP tools, authoring
pages, static rendering, and generated puzzle modules should consume the
canonical authored document rather than each implementing their own legacy
field handling.

There are two deliberately different paths:

- **Read-time compatibility** may project an older document into the current
  shape in memory (for example, folding legacy links or category titles). It
  is pure and idempotent: it does not write D1 or Git, remove source data, or
  rewrite immutable revisions. A read can report that an explicit save is
  needed to persist the folded form.
- **Write-time canonicalization** runs the same safe transforms before a
  draft or current published row is stored. Shape conversion is followed by
  the full semantic, learning-introduction, and category/subcategory
  validation, so an invalid canonical document cannot be persisted.

Treat each future transform as one of three cases:

1. **Lossless and non-breaking:** add it to the shared read/write pipeline and
   keep it idempotent.
2. **Lossless but corpus-wide:** add a dry-run/apply migration using the
   transaction and optimistic-concurrency safeguards below, then retire the
   compatibility branch only after the corpus is clean.
3. **Breaking or ambiguous:** introduce an explicit target format/version and
   a reviewed migration. Unknown fields, unmappable values, and ambiguous
   references must block with an actionable unresolved result; never guess or
   silently drop authored content.

Keep current working/published rows and generated artifacts migratable, but
leave immutable published revisions and working-copy history untouched. Add
fixtures for every transform, verify that a second pass is a no-op, and keep
the corpus report free of unresolved rows before declaring an evolution
complete.

## One-time corpus pass

`content:canonicalize` previews the current D1 puzzle rows and Git puzzle
sources, folds the remaining legacy authored fields, converts any JSON-LD
puzzle to simplified JSON, and plans a fresh generated-module/manifest pass:

```sh
npm run content:canonicalize -- --json
```

On an authoring server, apply both sides only after reviewing the report:

```sh
npm run content:canonicalize -- --apply
```

The sides can be staged independently:

```sh
npm run content:canonicalize -- --apply-d1
npm run content:canonicalize -- --git-only --apply-git
```

An unresolved D1 row blocks `--apply-d1`; an unresolved Git source blocks
`--apply-git`. A combined `--apply` requires both sides to be clean.

The retired bridge `termRole` field is treated as a known legacy annotation:
the read/write fold accepts it long enough to remove it, and the corpus
report identifies those repairs as `term-role-removed`. It is not part of the
current simplified schema, MCP projections, runtime bridge shape, or newly
exported JSON-LD.

The retired `generativeAssistance` field follows the same boundary policy:
legacy simplified and JSON-LD documents are read and folded into puzzle-level
`provenance`, while current simplified documents and JSON-LD exports omit the
field. The corpus report identifies a migrated value as
`generative-assistance-removed`; scope/role/date audit detail remains in the
append-only D1 assistance-stamp record.

The Git side replaces `content/puzzles/*.ccpuzzle.jsonld` with
`*.ccpuzzle.json`, removes the old interchange files, rewrites canonical
simplified sources, regenerates every registered puzzle module, updates the
cross-disciplinary registry overlay, and rebuilds `puzzles/manifest.js`.

The D1 side updates only current `published_documents` puzzle rows and puzzle
working copies. Each published update creates a new revision attributed to
`content-canonicalization`; existing published revisions and working-copy
history remain immutable. Publication, withdrawal, and Freeze-cue state are
unchanged.

Categories and catalogues share the D1 table but have separate document
contracts, so this pass does not run puzzle canonicalization against them.
JSON-LD fields that cannot be represented by simplified content (for example
Star `layouts`, external lesson `content.src`, or namespaced extensions) block
the apply and are reported for manual handling instead of being discarded.
Invalid puzzle documents also block the apply.

After application, run:

```sh
npm run validate
npm run content:canonicalize -- --git-only --json
```

The second report should show no unresolved rows and no remaining Git
changes. The migration is designed to be idempotent and safe to resume after
an interrupted Git write.
