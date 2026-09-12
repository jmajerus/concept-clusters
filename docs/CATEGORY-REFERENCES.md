# Category references

Puzzle documents use category identifiers, not display titles, for
`category`, `categories[]`, and the keys of `subcategories`.

Category documents keep both fields:

```json
{ "id": "computer-science", "title": "Computer Science" }
```

`id` is the stable join. `title` is display copy and may change without
requiring a corpus rewrite. Readers accept legacy title values during the
migration and resolve them through the category registry; writers and
publication paths canonicalize them to ids.

## Corpus migration

Preview the repository and, when configured, authoring D1:

```sh
npm run content:migrate-category-identifiers -- --json
```

On an authoring server without D1 credentials, preview the Git corpus only:

```sh
npm run content:migrate-category-identifiers -- --git-only
```

Apply both current D1 rows and Git artifacts after reviewing the dry run:

```sh
npm run content:migrate-category-identifiers -- --apply
```

The migration updates current `published_documents`, `content_drafts`, and
`puzzle_drafts` rows using optimistic concurrency. It does not rewrite
`published_document_revisions` or `puzzle_draft_history`; those remain an
immutable record of what was previously published or saved. D1 revision
entries created by this tool are attributed to `category-id-migration`.
Git application rewrites canonical `.ccpuzzle.json` and retained `.jsonld`
artifacts, updates the cross-disciplinary overlays in `puzzles/index.js`, then
regenerates every puzzle module and the manifest. Module validation happens
before any Git file is written, and rerunning `--apply` is safe after an
interrupted attempt.

Once the category-reference migration is complete, run
`npm run content:canonicalize` for the broader authored-schema pass. That pass
converts any remaining JSON-LD puzzle sources to simplified JSON and removes
the old `.ccpuzzle.jsonld` files; see [CANONICAL-CONTENT.md](CANONICAL-CONTENT.md).
