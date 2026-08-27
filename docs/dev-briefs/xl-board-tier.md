# XL board tier (investigation + prototype)

**Status: roadmap — investigation first, no committed cap or ship date.**

Surfaced while rolling out inventory-first authoring (Phase A) and authoring
`wave-and-particle-descriptions`, whose approved concept map (~31 candidate
terms, six cross-distinction connections) exceeds the current 24-node ceiling
without an obvious cost-free split.

## Problem

Instruction and learning are the project's primary goals. The current board
size model optimizes for **playable density on one canvas**, not for **honest
concept maps**:

| Total nodes | Today |
|---|---|
| ≤16 | Standard canvas (640×460) |
| 17–24 | `large: true` → wide canvas (960×620) |
| 25+ | **Rejected** — split into `relatedPuzzles` or prune |

That cap made sense when puzzles were authored grid-first (many 4×4 boards).
Inventory-first authoring surfaces larger, uneven maps **before** board limits
apply. Fitting them into 24 nodes often means one of:

1. **Prune** distinct terms (bad for learning).
2. **Split** into two puzzles (sometimes right — sequential curriculum).
3. **Sever load-bearing bridges** (bad when the relationship *is* the lesson).

`relatedPuzzles` helps when the topic is naturally sequential (prerequisite →
application). It is a weak substitute when co-presence matters: the player reads
a `via` line instead of **working** the bridge on one board.

**Conclusion:** if we keep inventory-first and treat bridges as pedagogically
load-bearing, an **XL tier** belongs on the roadmap — not as “bigger grids for
their own sake,” but as the honest response when relational structure must stay
on one surface.

## Current implementation (touch points)

| Area | Role |
|---|---|
| `modules/contentValidation.js` | Hard cap: 16 standard, 24 with `large` |
| `game.js` `BOARD_SIZE` | `standard` 640×460, `wide` 960×620; Circle wide 960×720 |
| `game.js` `applyBoardSize()` | `large` preserves expanded canvas across modes |
| `modules/puzzleGraph.js` | Cluster-order search; factorial, capped at 6 clusters |
| Star layout (`puzzles/layouts/star/`, import tool) | Manual override when auto layout fails |
| `tests/jsonld-engine.mjs` | Node-cap validation tests |
| Authoring docs | [AUTHORING-REFERENCE.md](../AUTHORING-REFERENCE.md) “Puzzle size (`large`)” |

Corpus today: **no puzzle exceeds 24 nodes**; several sit at exactly 24 with
`large: true`. Real puzzles already stress wide layout (`control-and-exit`,
`after-the-click` — see comments in `game.js`).

## Proposed direction (not final)

Introduce a third tier — name TBD (`xlarge`, `xl`, or extended `large` with
sub-flag):

- **Raised node cap** — target range to be **measured**, not guessed (likely
  28–36; investigate before committing).
- **Larger canvas** — third `BOARD_SIZE` entry; all modes that honor `large`
  must honor XL consistently.
- **Authoring rule** — XL for **relational** oversize (load-bearing bridges
  would be severed by split), not lazy “everything on one board.” Split and
  `relatedPuzzles` remain first choice when the seam is pedagogically clean.

Schema sketch (illustrative only):

```js
{
  "large": true,
  "xl": true,   // or a single enum: boardSize: "standard" | "large" | "xl"
  // …
}
```

Prefer the smallest schema change that validation, MCP, and the game engine can
share. Do not ship until one real puzzle proves layouts work.

## When XL vs split (authoring policy)

Use the fit-pass **loss ledger** and inventory **connections**:

| Signal | Prefer |
|---|---|
| Inventory >24 but ≤24 after dropping true duplicates only | `large: true`, no XL |
| Inventory >24, split cuts **no** load-bearing connections | `relatedPuzzles` split (uneven halves OK) |
| Inventory >24, every seam severs **load-bearing** connections | XL candidate (after layout proof) |
| Inventory > XL cap (TBD) | multi-puzzle sequence (2 or 3), not prune |

Optional inventory extension (Phase B+): `connections[].loadBearing: true`
so fit pass documents bridge severance cost explicitly.

## Investigation phase (do this first)

### 1. Pilot puzzle

Use **`wave-and-particle-descriptions`** (or the first approved inventory that
triggers the conflict):

- Fit to a **single** board at natural term count + honest bridges.
- Do **not** prune for symmetry; do **not** split for the prototype.
- Temporarily bypass validation cap locally if needed (branch-only) to render.

### 2. Layout measurement

For the pilot at 28, 32, 36 nodes (whichever apply), record pass/fail:

- **Graph** mode — label overlap, line crossings at rest
- **Star** mode — auto pretty-printer; note if manual star layout required
- **Sets / Circle** mode — wide canvas behavior, hub routing
- Narrow viewport fallback — document degradation, not silent breakage

Success is not “JSON validates”; it is **readable, playable, no hard overlaps**
on representative viewports (see `tests/mobile-layout.mjs` patterns).

### 3. Cap selection

Choose XL cap from **measured** failure points:

- Where does auto Star layout first fail exhaustively?
- Where does label density become unreadable without authored star layout?
- Cluster-order search still bounded (≤6 clusters)?

Document rejected caps with evidence.

### 4. Authoring + validation wiring (after cap chosen)

- `contentValidation.js` node cap tier
- `game.js` canvas tier
- Simplified schema + MCP schema projection
- `validate.mjs` / tests
- AUTHORING-REFERENCE + `authoringDesignGuidance.js` + author-puzzle fit pass
- Optional: soft flag when inventory term spread collapses to uniform on fit
  (already advisory in checker)

## Success criteria

1. One **published-quality** XL pilot puzzle (wave–particle or successor) passes
   extended layout checks and human play review.
2. XL cap is justified by measurement, not round-number guess.
3. Authoring policy distinguishes XL (relational co-presence) from split
   (sequential) and prune (duplicate scope only).
4. Inventory-first fit pass can recommend XL with an explicit ledger entry
   (`type: "xl"`, reason citing load-bearing bridges).

## Non-goals (initial PR)

- Unlimited board size — firm upper cap still required (likely ≤36).
- Replacing `relatedPuzzles` — splits remain correct for many topics.
- Auto-splitting oversized inventories — human/agent judgment + ledger.
- Retrofitting the entire corpus to XL — only puzzles that fail split cleanly.
- Changing the 16-node standard tier — unchanged.

## Risks

| Risk | Mitigation |
|---|---|
| XL boards unreadable on mobile | Measure; document mode fallback; may require “Graph recommended” copy |
| Star layout authoring burden | Budget manual layout time; import tool already exists |
| Agents default to XL to avoid thinking about splits | Policy: XL only with load-bearing bridge rationale in ledger |
| Factorial layout search | Cluster count stays ≤6; monitor perf at XL node counts |
| Scope creep (XL + inventory Phase B + schema) | Ship investigation + pilot before MCP/schema churn |

## Relationship to other work

- **Inventory-first authoring (Phase A)** — surfaces oversized maps early; XL
  is the downstream answer when fit pass hits 25+ with high split cost.
- **Phase B (D1 inventory field, admin UI)** — can add `splitRisk` / load-bearing
  connection metadata later.
- **4×4 template problem** — orthogonal; XL does not excuse grid-shaped boards.

## Suggested sequence

1. Approve wave–particle inventory (or equivalent pilot).
2. Spike: local validation bypass + draft XL dimensions in `game.js` only.
3. Playtest all four modes; record cap evidence.
4. Dev brief revision with chosen cap and canvas size.
5. Implementation PR: validation, schema, game, docs, pilot puzzle.
6. Extended Playwright / layout tests for XL fixture.

## Open questions

- Single flag (`xl: true` implies `large: true`) vs explicit size enum?
- Should XL require authored star layout in publication checklist?
- Catalogue/library UI: badge or filter for XL puzzles?
- Maximum bridges at XL — separate cap or same node budget?

---

*First draft: 2026-08-26. Revisit after pilot layout measurements.*
