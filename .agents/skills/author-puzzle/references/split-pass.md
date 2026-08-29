# Split / plan pass (Phase A)

Run **after** inventory is approved and **before** fit when the concept map
exceeds 24 nodes, or when the human is comparing two-board splits.

Re-read `/tmp/<parent-id>-inventory.json`. Do **not** re-survey the subject.

## Goal

Turn sizing conversation into a durable **`/tmp/<parent-id>-split-plan.json`**
before any MCP draft writes. The plan records the seam, board allocation, trim
decisions, and `relatedPuzzles` wiring.

## When to run

- Inventory totals exceed 24 once connections count as bridges.
- Human asks about split, trim, two boards, or `relatedPuzzles`.
- Human agrees to a board plan and says create/fit — **write the plan first**,
  then fit each board.

Skip this pass when `plan-boards.mjs` reports `single-board`.

## Steps

1. Run sizing stats (no judgment — numbers only):

   ```sh
   node .agents/skills/author-puzzle/scripts/plan-boards.mjs /tmp/<parent-id>-inventory.json
   ```

2. Discuss seam and trims with the human (pedagogy stays in chat). Do not
   discuss standard vs large — canvas size is derived.
3. Write `/tmp/<parent-id>-split-plan.json` capturing the **agreed** plan.
4. Resolve answered `openQuestions` on the inventory JSON (move to
   `resolvedQuestions`; clear or shorten `openQuestions`).
5. Validate the plan:

   ```sh
   node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level split \
     --plan /tmp/<parent-id>-split-plan.json \
     /tmp/<parent-id>-inventory.json
   ```

6. **Fit pass** — run the split planner once per board, then obey its JSON:

   ```sh
   node .agents/skills/author-puzzle/scripts/plan-split-boards.mjs \
     --plan /tmp/<parent-id>-split-plan.json --pass fit --board <board-id>
   ```

   Default transport is **`mcp-call`** (one-shot stdio per tool — Codex-safe). Fit
   **one board per burst**; stop at the planner's `stopAfter`. Present the
   planner's **`humanPrompt`** at the gate; on reply, follow **`humanNext`**
   (never ask the human for flags or `--continue`).

   Per board:
   - loss ledger (`/tmp/<board-id>-fit.json`)
   - include `relatedPuzzles` from the split plan on the **first** board (and
     reciprocal link on the sequel when useful)
   - MCP via planner steps only — never both boards in one burst

## Split plan shape

Save as `/tmp/<parent-id>-split-plan.json`. See
[split-plan-example.json](split-plan-example.json) for a real two-board plan.

```json
{
  "inventoryId": "same as inventory id",
  "strategy": "two-large-boards",
  "seam": "One sentence: where the cut falls and why pedagogically.",
  "boards": [
    {
      "id": "first-board-slug",
      "title": "Board title",
      "distinctions": ["d1", "d2"],
      "sharedTerms": ["terms carried on both boards if any"],
      "trim": [{ "term": "…", "reason": "…" }],
      "bridges": ["connection concept labels on this board"],
      "expectedNodes": 18
    }
  ],
  "relatedPuzzles": {
    "info": { "text": "What the linked sequence teaches together." },
    "order": ["first-board-slug", "second-board-slug"],
    "entries": [
      {
        "id": "second-board-slug",
        "reason": "Why play this next."
      }
    ]
  },
  "resolvedQuestions": [
    {
      "question": "Original open question text",
      "resolution": "What the human decided"
    }
  ]
}
```

### Rules

- `strategy`: `single-board`, `two-large-boards`, `two-mixed-boards`, or `split-custom`.
- Every inventory `distinction.id` appears on **exactly one** board.
- Every inventory `candidateTerms` entry is either on that board (via its
  distinction), listed in `sharedTerms`, or in some board's `trim` with reason.
- `expectedNodes` includes bridge nodes the board will carry.
- `relatedPuzzles.order` lists board ids in play order; `entries` links forward
  from the first board (sequel boards may link back optionally on complete).

## Loss ledger additions for splits

Each board ledger should include:

```json
{
  "type": "split",
  "into": ["board-a", "board-b"],
  "reason": "…"
},
{
  "type": "deferred",
  "term": "wavelength",
  "destinationPuzzleId": "board-b",
  "reason": "…"
}
```

Use `destinationPuzzleId` whenever a term moves to a sibling board.

## Complete pass (split pairs)

When completing a linked pair, **one board per burst** — same planner:

```sh
node .agents/skills/author-puzzle/scripts/plan-split-boards.mjs \
  --plan /tmp/<parent-id>-split-plan.json --pass complete --board <board-id>
```

After board 1 validates: present `humanPrompt`; when the human picks the next
board, the agent re-runs the planner with `--continue --board <board-1-id>`.

- Shared `relatedPuzzles.info` tone across both boards.
- Sibling ids in `relatedPuzzles.entries` are valid before both PRs merge;
  validation and review treat each puzzle's own entry ids as known. Do not
  strip reciprocal links to make Copilot or CI happy.
- Board 2 may reference board 1 in puzzle `info` or `learningIntroduction`.
- Run `--level complete` on each board separately.
