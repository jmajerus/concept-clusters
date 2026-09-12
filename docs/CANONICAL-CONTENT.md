# Canonical content migration

Puzzle authoring and published storage use the simplified puzzle document
shape (`simplified-v1`). JSON-LD remains an explicit interchange format for
`content:export`, `content:import`, and `content:check`; it is not a canonical
source or a D1 storage format.

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
