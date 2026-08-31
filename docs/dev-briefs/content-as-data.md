# Content as data

**Status: implemented (player load deferred).** Puzzles, categories, and
catalogues are documents. Git keeps the program (player, authoring UI,
validation, renderers). A copy fix is a document publish, not a software
change.

This is the split already named in
[Incorporating JSON-LD.md](../Incorporating JSON-LD.md) (domain model →
database / interchange / runtime bundle). D1 is the database we have.
JSON-LD stays interchange only.

## Stores

| Kind | Working copy | Published row |
|---|---|---|
| Puzzle | existing `puzzle_drafts` (owner-scoped) | `published_documents` `kind=puzzle` |
| Catalogue | `content_drafts` `kind=catalogue` | `published_documents` `kind=catalogue` |
| Category | `content_drafts` `kind=category` | `published_documents` `kind=category` |

Drafts stay owner-scoped. Published documents are shared: one live id for
the library, not per-author published copies.

Derived catalogues (`all`, `new`, `level-*`) and category membership stay
computed. Meta catalogues stay out of the editors. Do not store them as
rows.

## Publish vs export to player

**Publish** (admin page) copies the working document onto the published D1
row after validation, and appends `published_document_revisions`. It does
not write `main` and does not open a GitHub pull request.

**Revert** restores the last published document into the working copy.

**Export to player** is today’s GitHub pull request (and LAN checkout
install). It refreshes the git-bundled production player. Optional. A typo
the author considers live in authoring does not require it.

Until the player reads D1 (or an automated snapshot deploy exists),
production play can lag D1 publish. The UI says so.

## Admin lists

`/admin/catalogues` and `/admin/categories` read D1 published ∪ your
drafts, after an idempotent seed of missing published rows from this
checkout’s git registries. Seed never overwrites a row that already exists
in D1.

MCP `create_catalogue` / `update_catalogue` write the same catalogue draft
rows the pages use, then may still export a GitHub PR.

Apply `d1/migrations/0009_content_documents.sql` (`npm run mcp:hosted:migrate`)
before the Worker that reads these tables.

## Out of scope here

- Changing how production `game.js` loads puzzles
- Serving documents from the authoring Worker as a player API
- Postgres; JSON-LD as storage
