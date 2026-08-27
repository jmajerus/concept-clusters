# Fit pass (Phase A)

Run **only after** the human approves the inventory and any **split plan** (when
the subject spans multiple boards). Re-read `/tmp/<id>-inventory.json` and
`/tmp/<parent-id>-split-plan.json` when present; do **not** re-survey the subject.

## Goal

Translate the approved inventory into simplified puzzle JSON. Pruning,
merging, `large`, and seed/floating assignment happen **here**, with a visible
loss ledger.

## Steps

1. Load [design judgment](design-judgment.md) and the approved inventory.
2. **Comparable (optional):** only if this puzzle's category already has peers in
   `content/puzzles/`, read **one same-category** `.ccpuzzle.json` for field
   conventions. Skip entirely for new categories. Never use a cross-domain puzzle
   as a structural template.
3. Map distinctions → clusters (merge or split only with ledger entries).
4. Pick two seeds + floating terms per cluster from `candidateTerms`.
5. Add bridges only where `connections` marked them; disconnected is fine.
6. Apply board limits: 17–24 nodes → `large: true`; split above 24 →
   `relatedPuzzles` per [split-pass.md](split-pass.md); do **not** drop a distinct
   term merely to stay at 16.
7. For splits: include `relatedPuzzles` from the split plan on the first board;
   use `destinationPuzzleId` on ledger `deferred` entries.
8. Write `/tmp/<id>-fit.json` (loss ledger) **before** `save_puzzle_draft`.
9. MCP (sequential on stdio): `get_authoring_guidance` phase `core`, then
   `get_authoring_schema` phase `core`, then `review`.
10. `create_puzzle_draft` or `save_puzzle_draft` with clusters/bridges only —
   no term notes, puzzle `info`, or lenses yet.

## Loss ledger shape

Save as `/tmp/<id>-fit.json`:

```json
{
  "inventoryId": "same as inventory id",
  "inventoryTermCounts": [6, 4, 3, 5],
  "boardTermCounts": [5, 3, 4, 2],
  "decisions": [
    {
      "type": "kept",
      "distinction": "d1",
      "cluster": "cluster-id",
      "note": "5 terms, seeds X and Y"
    },
    {
      "type": "dropped",
      "term": "…",
      "reason": "redundant with … in d2"
    },
    {
      "type": "deferred",
      "term": "…",
      "destinationPuzzleId": "sibling-board-id",
      "reason": "…"
    },
    {
      "type": "merged",
      "from": ["d3", "d4"],
      "into": "cluster-id",
      "reason": "…"
    },
    {
      "type": "large",
      "totalNodes": 19,
      "reason": "honest inventory size"
    }
  ]
}
```

`decisions` must account for every inventory `candidateTerms` entry: kept on
the board, dropped with reason, or deferred (with reason).

Validate:

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level fit \
  /tmp/<id>.json --ledger /tmp/<id>-fit.json
```

Then `validate_puzzle_draft`, `--record --authored`, stop-gate for **board**
review on `/admin/drafts/<id>`.
