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

## Publish vs freeze

**Publish** (admin page) copies the working document onto the published D1
row after validation, and appends `published_document_revisions`. It does
not write `main` and does not open a GitHub pull request. After Publish
the author may **Cue** that snapshot for the next freeze, or **Hold** it
in authoring play. Cue is not “finished” or “reviewed”: hold a complete
board until other puzzles (a new catalogue, for example) can ship
together. Reviewers are optional and are not asked to sign off. Authors
may record an optional `provenance.reviewedBy` name on the drafts page so
the lesson byline can say “reviewed by …”; that is attribution, not a
gate. Freeze’s git patch starts with ids the author cued. It then
automatically includes a missing forward dependency when D1 has a published
snapshot that git does not: a meta catalogue's leaf catalogue, a leaf
catalogue's puzzle, or a puzzle's category. The Admin plan labels every
automatic inclusion and its parent. A required id found in neither D1 nor git
blocks Freeze. Publish clears the explicit cue, so a new snapshot stays held
until the author cues it again. Git-seeded rows start cued (they are already
production). Freeze does not rewrite those until an author Cues them — the
seed cue is not a pending git patch.

**Revert** restores the last published document into the working copy.

**Remove from authoring play** withdraws the published row (`withdrawn_at`).
Authoring Library omits it. Git seed will not resurrect it. Publish again
to restore. **Delete working copy** removes only the owner’s draft.
Category **title** is the join string puzzles store; the authoring server
refuses a rename (and a subcategory-id delete) while live puzzles still
cite it. The manual sequence is in
[AUTHORING-REFERENCE.md](../AUTHORING-REFERENCE.md#rewording-a-category-name).

**Freeze** on LAN `/admin` (confirm dialog first) applies that patch to
this checkout: live D1 ids not in git become new files, shared ids are
rewritten, withdrawn or git-only ids become file deletions
(`planContentFreeze` / `applyContentFreeze`). Hosted `/admin` shows the
same plan and does not write files. Admin lists mark published D1 rows
that git does not have yet and that you cued as **new on next freeze**.
Published rows you have not cued show **held** unless they are automatically
included as a required Freeze dependency.

Until the production player reads D1 (or an automated snapshot deploy exists),
production play can lag D1 publish. The UI says so.

LAN `npm run dev` is the proof for later stages: `/` is the same Library
navigation as production, assembled from published D1 rows
(`GET /play/corpus.json`, full boards at `GET /play/puzzles/<id>.json`).
Library search there includes facts, lessons, and your working copies.
Git puzzle and catalogue modules are not consulted for that play path.
`/?draft=` still overlays a working copy. Production static hosting does
not serve those routes, so `game.js` keeps loading the git manifest there.

## Admin lists

`/admin/catalogues` and `/admin/categories` read D1 published ∪ your
drafts, after an idempotent seed of missing published rows from this
checkout’s git registries. Seed never overwrites a row that already exists
in D1.

`/admin/drafts` lists the authoring puzzle corpus: published D1 ∪ git seed
∪ your working copies, by category or by recent working-copy update, after
an idempotent seed of missing published rows from this checkout’s git
registry. Opening a
published-only row starts a working copy from that snapshot (seeded from
git if D1 has none) and does not overwrite a draft you already have. MCP
`create_puzzle_draft` with `seed_from_published: true` is the same open.
`list_puzzle_drafts` stays working copies; do not bulk-create a working
copy for every corpus id.

MCP `create_catalogue` / `update_catalogue` write the same catalogue draft
rows the pages use, then may still export a GitHub PR.

Apply `d1/migrations/0009_content_documents.sql`,
`d1/migrations/0010_published_withdrawn.sql`, and
`d1/migrations/0011_ready_for_freeze.sql`
(`npm run mcp:hosted:migrate`) before the Worker that reads these tables.

## Out of scope here

- Changing how production `game.js` loads puzzles
- Serving documents from the hosted authoring Worker as a player API
- Postgres; JSON-LD as storage
