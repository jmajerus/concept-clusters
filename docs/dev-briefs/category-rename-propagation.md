# Category-reference migration

Category ids are the stable join values stored on puzzle documents. Category
titles remain display metadata; `previousTitles` is only a read-compatibility
ledger for legacy documents. A title rename therefore does not require
rewriting puzzle references.

## Permanent behavior

Authoring reads and writes pass the live merged category registry through the
draft, validation, publish, and Freeze paths. Legacy title references fold to
stable ids at the authoring boundary. Alias-aware citation guards continue to
protect withdrawal and subcategory removal. Ambiguous aliases are never
guessed.

## One-time corpus pass

`npm run content:migrate-category-identifiers` performs a dry run. It reads the
active published category registry from D1 over the Git registry and scans:

- `published_documents`
- all owner-scoped `content_drafts`
- all `puzzle_drafts`
- canonical `content/puzzles/*.ccpuzzle.json` files
- retained `content/puzzles/*.ccpuzzle.jsonld` interchange files (reported
  separately; they are not rewritten by the D1/Freeze path)

The report lists changed rows, ambiguous aliases, malformed documents, and Git
files that need rewriting. The migration can apply current D1 rows and Git
artifacts independently; immutable history rows are never rewritten.

After reviewing the dry-run report, apply both sides:

```sh
npm run content:migrate-category-identifiers -- --apply
```

The apply is revisioned, optimistic, resumable, and idempotent. Published rows
receive a new `published_document_revisions` entry with actor
`category-id-migration`; puzzle working copies retain their undo history. Draft
ownership, publication state, and Freeze cues are not changed. If an OCC
conflict or unresolved alias is found, the command stops and should be rerun
after the conflicting edit is reviewed.

After application, the normal Freeze workflow is still responsible for
shipping subsequent D1 changes to production. JSON-LD files are retained
interchange artifacts and are rewritten by the Git side of this migration.

For a repository-only inspection, use:

```sh
npm run content:migrate-category-identifiers -- --git-only --json
```
