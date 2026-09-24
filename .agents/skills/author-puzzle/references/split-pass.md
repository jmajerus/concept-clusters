# Split / plan pass (Phase A)

Run **after** inventory is approved and **before** fit when the concept map
exceeds 32 nodes, or when the human is comparing two-board splits because the subject has a natural seam.

Re-read `inventories/<parent-id>.json`. Do **not** re-survey the subject.

## Goal

Turn sizing conversation into a durable **`plans/<parent-id>-split-plan.json`**
before any MCP draft writes. The plan records the seam, board allocation, trim
decisions, external board sequence, and `relatedPuzzles` wiring.

## When to run

- Inventory totals exceed 32 once connections count as bridges.
- Human asks about split, trim, two boards, or `relatedPuzzles` because the subject has a natural seam.
- Human agrees to a board plan and says create/fit — **write the plan first**,
  then fit each board.

Skip this pass when `plan-boards.mjs` reports `single-board`. Do not open a
split in order to change the canvas; canvas size is derived.

## Steps

1. Run sizing stats (no judgment — numbers only):

   ```sh
   node .agents/skills/author-puzzle/scripts/plan-boards.mjs inventories/<parent-id>.json
   ```

2. Discuss seam and trims with the human (pedagogy stays in chat). Do not
   discuss renderer cutovers — layout is derived.
3. Write `plans/<parent-id>-split-plan.json` capturing the **agreed** plan.
4. Resolve answered `openQuestions` on the inventory JSON (move to
   `resolvedQuestions`; clear or shorten `openQuestions`).
5. Validate the plan:

   ```sh
   node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level split \
     --plan plans/<parent-id>-split-plan.json \
     inventories/<parent-id>.json
   ```

6. **Fit pass** — run the split planner once per board, then obey its JSON:

   ```sh
   node .agents/skills/author-puzzle/scripts/plan-split-boards.mjs \
     --plan plans/<parent-id>-split-plan.json --pass fit --board <board-id>
   ```

   When the client has the authoring server registered as a native MCP server,
   pass **`--transport stdio`** and call the returned MCP tools directly,
   sequentially. This preserves the actual client envelope and is preferred.
   In Kilo Code, use the namespaced native tools (`concept-clusters_<tool>`)
   directly; the project `.kilo/kilo.json` registers and auto-approves that
   namespace. If they are not listed, reload Kilo's MCP connection or start a
   new session. Do not fall back to `node tools/mcp-call.mjs` just because a
   permission prompt appeared.
   Default **`mcp-call`** is one-shot stdio per tool for clients without native
   MCP calls (Codex-safe); when Kilo's own VS Code backend launches the helper,
   it recognizes Kilo's process markers and stamps the Kilo surface as a
   low-trust fallback, but only native calls preserve per-call metadata.
   Fit **one board per burst**. When `presentGate` is false, start the next
   fit in a new burst and do not ask the human anything. When `presentGate`
   is true (the last board), present **`humanPrompt`** and follow
   **`humanNext`** (never ask the human for flags or `--continue`). Notes and
   lenses wait until that gate is approved.

   `mcp-call` is a new MCP client, not a transparent relay. Forward the real
   caller envelope through `CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO` and (when
   applicable) `CONCEPT_CLUSTERS_MCP_CALL_META`, or use its matching flags.
   Do not invent an identity; absent the envelope, automatic attribution is
   intentionally unavailable. `CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME` can give
   isolated scripts or CI stable surface attribution; never put it in the
   repository environment.

   Per board:
   - loss ledger (`ledgers/<board-id>-fit.json`)
   - copy only the split plan's `relatedPuzzles.info` and `relatedPuzzles.entries`
     into the **first** board (and a reciprocal link on the sequel when useful);
     never copy plan metadata such as `boardOrder` into the puzzle document
   - MCP via planner steps only — never both boards in one burst

## Split plan shape

Save as `plans/<parent-id>-split-plan.json`. See
[split-plan-example.json](split-plan-example.json) for a real two-board plan.

```json
{
  "inventoryId": "same as inventory id",
  "strategy": "two-balanced-boards",
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
  "boardOrder": ["first-board-slug", "second-board-slug"],
  "relatedPuzzles": {
    "info": { "text": "What the linked sequence teaches together." },
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

- `strategy`: `single-board`, `two-balanced-boards`, `two-mixed-density-boards`, or `split-custom`.
- Every inventory `distinction.id` appears on **exactly one** board.
- Every inventory `candidateTerms` entry is either on that board (via its
  distinction), listed in `sharedTerms`, or in some board's `trim` with reason.
- `expectedNodes` includes bridge nodes the board will carry.
- `boardOrder` lists board ids in fit/play order. It is split-plan metadata,
  not part of a puzzle document. `relatedPuzzles.entries` links forward from
  the first board (sequel boards may link back optionally on complete).

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
  --plan plans/<parent-id>-split-plan.json --pass complete --board <board-id>
```

After a board validates, follow the planner. A board that is not last says
to re-run with `--continue` in a new burst and not to present a gate. The
last board presents `humanPrompt` for the whole set.

- Shared `relatedPuzzles.info` tone across both boards.
- Sibling ids in `relatedPuzzles.entries` are valid before both PRs merge;
  validation and review treat each puzzle's own entry ids as known. Do not
  strip reciprocal links to make Copilot or CI happy.
- Board 2 may reference board 1 in puzzle `info` or `learningIntroduction`.
- Run `--level complete` on each board separately.
