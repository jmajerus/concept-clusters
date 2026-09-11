# Category rename propagation

Category titles are the join values stored on puzzle documents. The current
title in the active published D1 category row is canonical; `previousTitles`
are read-only aliases for folding older documents forward. A retired title
must not be written back into a puzzle, catalogue, or category reference.

## Permanent behavior

Authoring reads and writes pass the live merged category registry through the
draft, validation, publish, and Freeze paths. Stale puzzle references fold to
the current title on load and are persisted on the next explicit save or
publish. Alias-aware citation guards continue to protect withdrawal and
subcategory removal. Ambiguous aliases are never guessed.

## One-time corpus pass

`npm run content:propagate-category-renames` performs a dry run. It reads the
active published category registry from D1 over the Git registry and scans:

- `published_documents`
- all owner-scoped `content_drafts`
- all `puzzle_drafts`
- canonical `content/puzzles/*.ccpuzzle.json` files and retained JSON-LD
  interchange files

The report lists changed rows, ambiguous aliases, malformed documents, and Git
files that need a Freeze. Git files are intentionally not written by this
command.

After reviewing the dry-run report, apply only the D1 changes:

```sh
npm run content:propagate-category-renames -- --apply
```

The apply is revisioned, optimistic, resumable, and idempotent. Published rows
receive a new `published_document_revisions` entry with actor
`corpus-propagation`; puzzle working copies retain their undo history. Draft
ownership, publication state, and Freeze cues are not changed. If an OCC
conflict or unresolved alias is found, the command stops and should be rerun
after the conflicting edit is reviewed.

Finally, cue the affected published documents and create the normal Freeze PR
to reconcile Git source files. Rerun the dry run and require zero changes
before merging that PR.

For a repository-only inspection, use:

```sh
npm run content:propagate-category-renames -- --git-only --json
```
