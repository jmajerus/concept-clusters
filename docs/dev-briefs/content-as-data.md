# Content as data

**Status: implemented (production player load deferred).** Puzzles, categories, and
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
computed. Meta catalogues are authored documents (`kind: meta`) stored as
catalogue rows; their entries are other catalogues.

## Publish vs export to player

**Publish** (admin page) copies the working document onto the published D1
row after validation, and appends `published_document_revisions`. It does
not write `main` and does not open a GitHub pull request.

**Revert** restores the last published document into the working copy.

**Remove from authoring play** withdraws the published row (`withdrawn_at`).
Authoring Library omits it. Git seed will not resurrect it. Publish again
to restore. **Delete working copy** removes only the owner’s draft.

**Export to player** is today’s GitHub pull request (and LAN checkout
install). Freeze’s git patch is add/update/delete: live D1 ids not in git
become new files, shared ids are rewritten, withdrawn or git-only ids
become file deletions (`planContentFreeze`). Export does not yet run that
full freeze.

Until the production player reads D1 (or an automated snapshot deploy exists),
production play can lag D1 publish. The UI says so.

LAN `npm run dev` is the proof for later stages: `/` is the same Library
navigation as production, assembled from published D1 rows
(`GET /play/corpus.json`, full boards at `GET /play/puzzles/<id>.json`).
Git puzzle and catalogue modules are not consulted for that play path.
`/?draft=` still overlays a working copy. Production static hosting does
not serve those routes, so `game.js` keeps loading the git manifest there.

## Admin lists

`/admin/catalogues` and `/admin/categories` read D1 published ∪ your
drafts, after an idempotent seed of missing published rows from this
checkout’s git registries. Seed never overwrites a row that already exists
in D1.

MCP `create_catalogue` / `update_catalogue` write the same catalogue draft
rows the pages use, then may still export a GitHub PR.

Apply `d1/migrations/0009_content_documents.sql` and
`d1/migrations/0010_published_withdrawn.sql`
(`npm run mcp:hosted:migrate`) before the Worker that reads these tables.

## Out of scope here

- Changing how production `game.js` loads puzzles
- Serving documents from the hosted authoring Worker as a player API
- Postgres; JSON-LD as storage
