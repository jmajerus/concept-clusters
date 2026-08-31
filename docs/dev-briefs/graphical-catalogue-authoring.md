# Graphical catalogue authoring

**Status: implemented.** Working copies and published rows live in D1.
The construct-canvas editor is LAN `/?catalogue=&view=author`. Production
player still loads git modules until the player-load cut.

MCP `create_catalogue` / `update_catalogue` write the same D1 draft rows
and may still open a GitHub PR as **export to player**.

**Rule 0:** no MCP-only mutations. If a person cannot do it on this page
(or the Library cards it drives), it is not done.

## Product

`/admin/catalogues` lists leaf catalogues from D1 (published ∪ your drafts)
and creates a working copy. `/?catalogue=<id>&view=author` is the editor:
Library puzzle cards plus an inspector for title, blurb, ordered, add/remove,
reasons, and drag-to-reorder.

**Publish** writes the shared D1 published row. **Export to player** opens a
GitHub pull request for the git-bundled player. It does not write this
checkout. Merge stays a human action.

Derived catalogues (`all`, `new`, `level-*`) and meta catalogues are out
of scope here.

## Working copies

Owner-scoped `content_drafts` in D1. Published documents are shared
`published_documents` rows. Seed missing published rows from git once;
never overwrite an existing D1 published row. Empty `entries` are allowed
while editing; export to player still requires at least one puzzle.

See [content-as-data.md](content-as-data.md).

## Routes

- `GET /admin/catalogues`
- `POST /admin/catalogues` create skeleton
- `GET /admin/catalogues/:id/document.json`
- `PUT /admin/catalogues/:id/document` + `expected_revision`
- `POST /admin/catalogues/:id` publish, revert, or export to player
- `GET /admin/categories` and `/admin/categories/:id`
