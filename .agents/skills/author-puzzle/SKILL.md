---
name: author-puzzle
description: Author a Concept Clusters puzzle using an inventory-first workflow, local MCP validation, and human gates before grid fitting. Map sourced distinctions, candidate terms, and genuine connections before selecting any cluster, term, or bridge count/range. Default is inventory (concept map, sourced, no board limits), then plan (sizing/split when needed), fit (translate to simplified JSON with a loss ledger), then complete (notes and lenses). At every stop gate, prompt the human with numbered options — never require magic phrases. For splits, run plan-split-boards.mjs once per board and present its humanPrompt. Use when asked to author, draft, write, create, continue, fill, or fit a puzzle.
disable-model-invocation: true
---

# Author a Concept Clusters puzzle

Use the repository's local stdio MCP against the same D1 drafts as the hosted
authoring MCP. The human Publishes on `/admin/drafts`, or
`save_puzzle_draft` with `publish_to_authoring: true` does the same write
for a confirmed final edit -- only when they've asked for that. A GitHub
pull request for this draft is opened from that same page by a human, not
by MCP.
Set `category` / `categories` / `subcategories` on the puzzle document.
Register new category metadata with `create_category`. Add or remove
catalogue membership with `get_catalogue` then `update_catalogue`.

## Authoring workspace

Scratch files stay out of git. Default root: `.concept-clusters/authoring/`
(override with `AUTHORING_DATA_DIR`). Run `node tools/authoring-workspace.mjs`
once if you need resolved paths or the drafts URL.

| Artifact | Path under the data dir |
|---|---|
| Concept inventory | `inventories/<id>.json` |
| Split plan | `plans/<id>-split-plan.json` |
| Loss ledger | `ledgers/<id>-fit.json` |
| Working puzzle JSON | `working/<id>.json` |
| Design notes / proposals | `proposals/` |

Never write those into `docs/`, `.agents/`, or `/tmp`.

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
etc. **Pedagogical decisions also count:** agreeing to a split,
trims, or `relatedPuzzles` pairing means the concept map is
approved for that plan — if they then say create/fit, run immediately. If the
message tells you to build/save/fit, **run the fit pass**; do not bounce back
asking for a different phrase. Only stop for approval when inventory is ready
and the human has **not** yet asked you to proceed. After inventory approval,
run `plan-boards.mjs`: `single-board` means go to fit (no split-plan file);
over 24 means the plan gate.

**Why inventory-first:** the human may not know the subject. The first durable
artifact must be a sourced concept map, not a grid-shaped draft. Board limits
enter only on the fit pass, with a visible loss ledger.

**Why fit before complete:** rewriting clusters after 16 term notes and lenses
wastes the expensive half. Complete assumes the board is human-approved.

## Fail closed (non-negotiable)

1. **No filesystem thrash.** Do not `find`, glob, or ripgrep. Do not read `docs/`, `modules/`, `tools/`, `tests/`, or any `content/puzzles/*.ccpuzzle.json` on the **inventory** pass.
2. **Subject pick is one script** when the user named nothing: `suggest-subject.mjs` once. No `list_puzzles` browsing.
3. **Stop when the active pass's checker says so.** Do not keep thinking after the stop gate. Do not set `publish_to_authoring: true` on `save_puzzle_draft` unless asked.
4. **Inventory pass must not write puzzle JSON or call `create_puzzle_draft`.** No seeds, floatingTerms, or node-cap arithmetic.
5. **Fit pass requires a human proceed signal** in this session (approval phrase
   or direct create/fit instruction — see table above). Never re-prompt for
   wording when the user already told you to create or fit. Re-read
   `inventories/<id>.json`; do not re-survey the subject.
6. **Fit and complete passes must not write term notes or lenses** until the complete pass (notes/lenses listed in checker `deferred` on fit).
7. **Complete pass must clear every `blocking` gap** from `--level complete` before record/stop.

## Stop-gate report

Reply with only:

- `id`, `title`, draft `status` (if any), `revision` (if any), active pass (`inventory`, `plan`, `fit`, or `complete`)
- coverage summary from the checker
- for inventory: path `inventories/<id>.json` (no drafts URL yet)
- for plan: paths `plans/<id>-split-plan.json` and inventory; `plan-boards.mjs` summary line
- for fit/complete: drafts URL from `node tools/authoring-workspace.mjs` (`draftReviewUrl/<draftId>`)
- one line:
  - inventory — `Inventory ready. Waiting on concept-map review.`
  - plan — `Split plan ready. Waiting on board-plan approval or fit.`
  - fit — `Fit ready. Waiting on board review (see loss ledger).`
  - complete — `Validated. Waiting on /admin/drafts.`
- **What's next?** — numbered options from [Human gates](#human-gates-prompt-dont-wait-for-magic-words) below, or `humanPrompt` from `plan-split-boards.mjs` when a split is in play (print headline, question, and options; include `defaultReply`).

## Human gates (prompt; don't wait for magic words)

At **every** stop gate, end with a short **What's next?** block: 2–4 numbered options in plain language. The human should never need to remember commands, flags, or pass names.

**Accept natural replies.** Map loosely — never bounce back asking for a different phrase:

| They might say | Usually means |
|---|---|
| yes / looks good / ok / approved | Approve and take the forward option at this gate |
| continue / next / go ahead | Advance to the next pass or next board |
| revise / change / fix / push back | Stay on this pass; edit the artifact they name |
| complete / notes / lenses / fill | Complete pass for the current board |
| next board / board 2 | Next board in the split plan |
| submit / pr / ship | Publish on the drafts page (a human action; MCP does not do it). Whatever happens after that is outside this session |

Vague **continue** after a gate: pick the most likely forward step from context (e.g. after inventory approval → run `plan-boards.mjs`, then fit or split plan; after fit board 1 in a split → fit board 2 or complete board 1).

### Inventory gate

```
What's next?
1. Revise the concept map (tell me what to change)
2. Approve — continue (fit if it fits one board; otherwise plan a split)
```

### Plan gate (split only)

```
What's next?
1. Revise the seam, trims, or board count
2. Approve — fit the first board
3. Approve — fit all boards (I'll do them one at a time)
```

### Fit gate (single board)

```
What's next?
1. Revise clusters, bridges, or the loss ledger
2. Approve — add notes and lenses (complete pass)
```

### Split boards

Run `plan-split-boards.mjs` once per board; **print its `humanPrompt` verbatim** (headline, drafts URL, numbered options, `defaultReply`). Obey `humanNext` for which planner invocation to run on their reply — the human never sees flags.

### Complete gate

```
What's next?
1. Revise notes, lenses, or connector help
2. Approve — open the drafts page to review copy
3. Publish and cue for freeze when ready (or next board in a split)
```

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
- Before the map is complete, do not choose or announce a cluster count, a
  terms-per-cluster range, or a bridge count. First enumerate the sourced
  distinctions, their candidate terms, and genuine connections; counts are a
  resulting audit, not a provisional design brief.
- Before `create_puzzle_draft` for a gap-fill or densify subject, call
  `search_puzzles` with 2–3 planned anchor terms in that category. If a hit
  already covers the distinction, extend or relate instead of opening a
  parallel puzzle.
- Candidate-term counts may be uneven or equal — do not equalize them or
  manufacture variation.
- Record exclusions and rival splits; note open questions for the human.
- Save `inventories/<id>.json` and run the inventory checker. It checks source
  coverage and the map's internal accounting, not whether its counts look
  regular or irregular.

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level inventory inventories/<id>.json
```

**Do not** call `create_puzzle_draft`, `save_puzzle_draft`, or MCP `core` until the human approves the inventory.

**Codex:** inventory pass needs no MCP writes (no D1 network prompt).

Stop-gate: concept-map review only.

### 2. Human gate — inventory approval

Stop after inventory unless the human already said to proceed (create/fit/go
ahead/large board/etc.). If they only asked for the map, wait — one line is
enough: inventory path + what you need to continue. The human reviews **concept
substance** (thesis, distinction jobs, exclusions, open questions) — not count
symmetry; equal and unequal candidate-term counts are both valid when the
material supports them.

If they push back on the map, revise `inventories/<id>.json` and re-run the
inventory checker. Multiple puzzles: one proceed signal can cover every
inventory you just presented (`create both puzzles` approves both).

### 2b. Plan pass (only when the map cannot be one board)

Run `plan-boards.mjs` after inventory approval. If it reports `single-board`,
**skip this pass** and go to fit. Follow [split-pass.md](references/split-pass.md)
only when the inventory exceeds 24 nodes (terms plus connections) or the human
asks for a split.

```sh
node .agents/skills/author-puzzle/scripts/plan-boards.mjs inventories/<parent-id>.json
```

After the human agrees on seam, board count, trims, and split strategy:

- Write `plans/<parent-id>-split-plan.json`.
- Move answered `openQuestions` to `resolvedQuestions` on the inventory (clear
  or shorten `openQuestions`).

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level split \
  --plan plans/<parent-id>-split-plan.json \
  inventories/<parent-id>.json
```

Skip this pass when `plan-boards.mjs` shows `single-board`.

Stop-gate: board plan review only if the human has not already said create/fit.

### 3. Fit pass

Follow [fit-pass.md](references/fit-pass.md). Translate the **approved** inventory (and split plan, if any) into simplified JSON.

- **Split:** run `plan-split-boards.mjs` once per board; obey its JSON. Default
  transport is `mcp-call` (Codex-safe). Fit **each board** in `split-plan.json`
  order; wire `relatedPuzzles` from the plan on the first board (reciprocal link
  on the sequel when useful). **Never fit or complete two boards in one burst.**
- Use `destinationPuzzleId` in ledger `deferred` entries for sibling terms.

- If the category already has published puzzles, read **one same-category** comparable for JSON field conventions only — not to copy its cluster count or term counts.
- If the category is new (no peers), skip comparable reads; rely on MCP `get_authoring_schema` phase `core`.
- Write `ledgers/<id>-fit.json` (loss ledger) **before** MCP save.
- MCP tools **one at a time** (never parallel on stdio — Codex closes the transport): `get_authoring_guidance` phase `core`, then `get_authoring_schema` phase `core`, then `review`.
- `create_puzzle_draft` / `save_puzzle_draft`: clusters, bridges, `termRole` only.

**Codex:** first draft write hits Cloudflare D1 — approve network if prompted, then retry unchanged.

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level fit \
  working/<id>.json --ledger ledgers/<id>-fit.json
```

Fix `blocking` until `ok: true`. Then `validate_puzzle_draft`. Then:

```sh
node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

Stop-gate: board + loss ledger review on `/admin/drafts`.

### 4. Complete pass

Retrieve latest draft. Add puzzle `info`, `termInfo`, connector help, lenses. Preserve every earlier field.

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level complete working/<id>.json
```

Fix `blocking` → `validate_puzzle_draft` → `--record --authored` → stop-gate.

### 5. Ship (only after human asks)

Publish on `/admin/drafts` -- or `save_puzzle_draft` with
`publish_to_authoring: true` for a confirmed final edit, only when
asked -- ends this skill's job. Whatever happens to the draft after that
is the human's call, outside this session. Don't promise a delivery
mechanism or artifact (a PR URL or otherwise) and don't wait on one;
there's nothing further to do here.

## Context discipline

One pass, one stop. Prefer aborting over another tool round after the gate fires.
