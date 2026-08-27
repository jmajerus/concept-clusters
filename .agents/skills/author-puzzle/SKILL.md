---
name: author-puzzle
description: Author a Concept Clusters puzzle using an inventory-first workflow, local MCP validation, and human gates before grid fitting. Default is inventory (concept map, sourced, no board limits), then plan (sizing/split when needed), fit (translate to simplified JSON with a loss ledger), then complete (notes and lenses). Use when asked to author, draft, write, create, continue, fill, or fit a puzzle.
disable-model-invocation: true
---

# Author a Concept Clusters puzzle

Use the repository's local stdio MCP against the same D1 drafts as the hosted
authoring MCP. Publication opens a GitHub pull request; it does not write this
checkout or `main`.

## Passes (pick one)

| User said | Pass | MCP guidance | Completeness |
|---|---|---|---|
| `/author-puzzle` (no args), new draft | **inventory** (default) | none — skill refs only | `--level inventory` |
| proceed to plan / sizing / split | **plan** | none — skill refs only | `--level split` + `plan-boards.mjs` |
| proceed to fit (see below) | **fit** | `core` then `review` | `--level fit` + `--ledger` |
| continue / fill / notes / lenses / complete | **complete** | `review` (if needed) then `pedagogy` | `--level complete` |
| all-in-one / full pass | **discouraged** — use inventory → plan → fit → complete | — | — |

**Proceed to fit** when the human signals approval — not only magic phrases. Any
clear imperative counts: `inventory approved`, `continue to fit`, `create the
draft`, `create both puzzles`, `fit it`, `use MCP to create…`, `go ahead`,
`large board`, etc. **Pedagogical decisions also count:** agreeing to a split,
board sizes, trims, or `relatedPuzzles` pairing means the concept map is
approved for that plan — if they then say create/fit, run immediately. If the
message tells you to build/save/fit, **run the fit pass**; do not bounce back
asking for a different phrase. Only stop for approval when inventory is ready
and the human has **not** yet asked you to proceed or settled the board plan.

**Why inventory-first:** the human may not know the subject. The first durable
artifact must be a sourced concept map, not a grid-shaped draft. Board limits
enter only on the fit pass, with a visible loss ledger.

**Why fit before complete:** rewriting clusters after 16 term notes and lenses
wastes the expensive half. Complete assumes the board is human-approved.

## Fail closed (non-negotiable)

1. **No filesystem thrash.** Do not `find`, glob, or ripgrep. Do not read `docs/`, `modules/`, `tools/`, `tests/`, or any `content/puzzles/*.ccpuzzle.json` on the **inventory** pass.
2. **Subject pick is one script** when the user named nothing: `suggest-subject.mjs` once. No `list_puzzles` browsing.
3. **Stop when the active pass's checker says so.** Do not keep thinking after the stop gate. Do not call `submit_puzzle_for_publication` unless asked.
4. **Inventory pass must not write puzzle JSON or call `create_puzzle_draft`.** No seeds, floatingTerms, `large`, or node counting.
5. **Fit pass requires a human proceed signal** in this session (approval phrase
   or direct create/fit instruction — see table above). Never re-prompt for
   wording when the user already told you to create or fit. Re-read
   `/tmp/<id>-inventory.json`; do not re-survey the subject.
6. **Fit and complete passes must not write term notes or lenses** until the complete pass (notes/lenses listed in checker `deferred` on fit).
7. **Complete pass must clear every `blocking` gap** from `--level complete` before record/stop.

## Stop-gate report

Reply with only:

- `id`, `title`, draft `status` (if any), `revision` (if any), active pass (`inventory`, `plan`, `fit`, or `complete`)
- coverage summary from the checker
- for inventory: path `/tmp/<id>-inventory.json` (no drafts URL yet)
- for plan: paths `/tmp/<id>-split-plan.json` and inventory; `plan-boards.mjs` summary line
- for fit/complete: `http://127.0.0.1:8787/admin/drafts/<draftId>` and whether `npm run dev` may be needed
- one line:
  - inventory — `Inventory ready. Waiting on concept-map review.`
  - plan — `Split plan ready. Waiting on board-plan approval or fit.`
  - fit — `Fit ready. Waiting on board review (see loss ledger).`
  - complete — `Validated. Waiting on /admin/drafts.`

## Do not load

Unless blocked on a specific field or error:

- `docs/AUTHORING.md`, `docs/MCP.md`, `docs/MCP-REMOTE.md`, `docs/MCP-CLIENTS.md`
- engine files; both `.ccpuzzle.json` and generated `.js`; OAuth/MCP-client history

## Do load

**Inventory pass only:**

1. This skill, [design judgment](references/design-judgment.md), [inventory-format.md](references/inventory-format.md).
2. `puzzles/categories.js` category keys (taxonomy only — not puzzle content).
3. **Do not read** any `content/puzzles/*.ccpuzzle.json` or generated `.js` modules. Survey the subject from anchors and research, not from an unrelated board in the corpus (a random “structural comparable” is how 4×4 template contamination spreads).

**Plan pass** (sizing / split), also load:

4. [split-pass.md](references/split-pass.md).

**Fit pass onward**, also load:

5. [fit-pass.md](references/fit-pass.md) (fit); [docs/SIMPLIFIED-PUZZLE-FORMAT.md](../../../docs/SIMPLIFIED-PUZZLE-FORMAT.md) when a field is unclear.
6. **At most one** in-category comparable `content/puzzles/<id>.ccpuzzle.json` — a puzzle already in the **same registered category** as this draft, if any exist. If the category is new or empty, **skip the comparable**; use MCP schema/guidance only. Never use a cross-domain puzzle as a “structural template.”
7. **Complete pass:** prefer that comparable (or another same-category peer) to have `info`, `termInfo`, and lenses.

## Workflow

### 0. Choose the subject (inventory pass, if unnamed)

```sh
node .agents/skills/author-puzzle/scripts/suggest-subject.mjs
```

Honor the picker's `mode`. Edit [category-backlog.json](category-backlog.json) by hand to add or retire gaps — never put backlog entries into `puzzles/categories.js` until the first puzzle lands.

State the pick in one sentence (`mode`, category, optional sub, seed).

### 1. Inventory pass (default `/author-puzzle`)

Survey the concept space **before** board limits. Follow [inventory-format.md](references/inventory-format.md).

- **No puzzle files.** Do not read `content/puzzles/` or peer boards — inventory is subject-first, not shape-first.
- Research while mapping; attach an **anchor** source per distinction.
- Uneven `candidateTerms` counts are expected — do not equalize.
- Record exclusions and rival splits; note open questions for the human.
- Save `/tmp/<id>-inventory.json` and summarize in chat.

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level inventory /tmp/<id>-inventory.json
```

**Do not** call `create_puzzle_draft`, `save_puzzle_draft`, or MCP `core` until the human approves the inventory.

**Codex:** inventory pass needs no MCP writes (no D1 network prompt).

Stop-gate: concept-map review only.

### 2. Human gate — inventory approval

Stop after inventory unless the human already said to proceed (create/fit/go
ahead/large board/etc.). If they only asked for the map, wait — one line is
enough: inventory path + what you need to continue.

If they push back on the map, revise `/tmp/<id>-inventory.json` and re-run the
inventory checker. Multiple puzzles: one proceed signal can cover every
inventory you just presented (`create both puzzles` approves both).

### 2b. Plan pass (when sizing or split is in play)

Follow [split-pass.md](references/split-pass.md) when the inventory exceeds one
board or the human is comparing split options.

```sh
node .agents/skills/author-puzzle/scripts/plan-boards.mjs /tmp/<parent-id>-inventory.json
```

After the human agrees on seam, board count, trims, and `large` / split strategy:

- Write `/tmp/<parent-id>-split-plan.json`.
- Move answered `openQuestions` to `resolvedQuestions` on the inventory (clear
  or shorten `openQuestions`).

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level split \
  --plan /tmp/<parent-id>-split-plan.json \
  /tmp/<parent-id>-inventory.json
```

Skip this pass when a single board clearly fits (`plan-boards.mjs` shows
`single-standard` or `single-large` and the human does not want a split).

Stop-gate: board plan review only if the human has not already said create/fit.

### 3. Fit pass

Follow [fit-pass.md](references/fit-pass.md). Translate the **approved** inventory (and split plan, if any) into simplified JSON.

- **Split:** fit **each board** in `split-plan.json` order; wire `relatedPuzzles`
  from the plan on the first board (reciprocal link on the sequel when useful).
- Use `destinationPuzzleId` in ledger `deferred` entries for sibling terms.

- If the category already has published puzzles, read **one same-category** comparable for JSON field conventions only — not to copy its cluster count or term counts.
- If the category is new (no peers), skip comparable reads; rely on MCP `get_authoring_schema` phase `core`.
- Write `/tmp/<id>-fit.json` (loss ledger) **before** MCP save.
- MCP tools **one at a time** (never parallel on stdio — Codex closes the transport): `get_authoring_guidance` phase `core`, then `get_authoring_schema` phase `core`, then `review`.
- `create_puzzle_draft` / `save_puzzle_draft`: clusters, bridges, `termRole` only.

**Codex:** first draft write hits Cloudflare D1 — approve network if prompted, then retry unchanged.

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level fit \
  /tmp/<id>.json --ledger /tmp/<id>-fit.json
```

Fix `blocking` until `ok: true`. Then `validate_puzzle_draft`. Then:

```sh
node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

Stop-gate: board + loss ledger review on `/admin/drafts`.

### 4. Complete pass

Retrieve latest draft. Add puzzle `info`, `termInfo`, connector help, lenses. Preserve every earlier field.

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level complete /tmp/<id>.json
```

Fix `blocking` → `validate_puzzle_draft` → `--record --authored` → stop-gate.

### 5. Ship (only after human opens PR / asks)

Return the PR URL. Before the PR review loop: `get_workflow_guidance` topic `pull-request-review`.

## Context discipline

One pass, one stop. Prefer aborting over another tool round after the gate fires.
