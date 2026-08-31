# Graphical board authoring

**Status: implemented on LAN `npm run dev`.** Production player and the
hosted authoring Worker do not grow an author engine.

The **board** is the authoring environment, not a bigger `/admin/drafts`
form. Drafts HTML stays a prose ledger plus Publish, Export to player, and
Install. MCP stays optional assistance on the same D1 document.

**Rule 0:** no MCP-only mutations. If a person cannot do it on the canvas
(or an inspector on that canvas), it is not done.

## Product

`/?draft=<id>` is one app with two rulesets:

- **Construct** (default for a new/blank draft): `createAuthorEngine` —
  select then tap, inverted meaning of play.
- **Play:** existing `createGameEngine` on a compile when the document is
  valid enough; otherwise Play is disabled with the validation list.

LAN `npm run dev` only.

## Gestures

Reuse Graph-mode motor skill; do not reuse play `handleTap`.

- Empty canvas / **Add term**: type a label → node appears. First node of
  a new component is cluster 1’s first seed.
- Select a free (or new) term, tap a placed term in a cluster → **join
  that cluster**.
- Select a term that already has a cluster, tap a placed term in a
  **different** cluster → **create or extend a bridge**. Extra clusters
  on that pill are n-ary (max three).
- Disconnect / delete from inspector or Alt-click, not by pretending
  play’s deselect is a delete.
- Seeds: first term in a cluster by default; toggle on the selected node.

Construction defaults to **Star** so cluster titles show membership;
Graph remains available. `?author=layout` stays Star geometry, not
structure.

## Document and compile

The simplified format is the stored shape. D1 already allows incomplete
rows (`{ clusters: [], bridges: [] }`).

Do not relax published Zod mins for shipping. Authoring save writes the
JSON as-is (same as `save_puzzle_draft`). `authoringBoardFromDocument`
paints partial documents. Strict `puzzleFromAuthoredDocument` remains for
Play, Install, and PRs.

409 on `expected_revision` if MCP or the drafts page saved first; reload
the document and show it.

## Human-complete surface

Board gestures cover terms, cluster membership, bridges. Everything else
is an inspector on the same page:

- Selected node: name, seed, fact/info, delete
- Selected cluster (color chip): name, color, fact, delete
- Selected bridge: term, fact, termRole, direction, idealTerms, delete
- Puzzle chrome: id, title, category, related puzzles
- Lesson / lenses / citations as panels on the same canvas

`/admin/drafts/<id>` keeps copy review, Open PR, Install. **New puzzle**
there creates a skeleton without MCP and jumps to `/?draft=<id>`.

## Engine split

`createGameEngine` does not write drafts. `modules/authorEngine.js` owns
construct taps, mutates the simplified document, POSTs, reapplies the
lenient board.

LAN routes on `modules/localDraftReview.js` only:

- `POST /admin/drafts` create skeleton
- `GET /admin/drafts/:id/document.json`
- `PUT /admin/drafts/:id/document` whole document + `expected_revision`
- `GET /admin/drafts/:id/play.json` stays strict for Play

These are not on `src/authoring-worker.ts`.
