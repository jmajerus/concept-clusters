---
name: author-puzzle
description: Author a Concept Clusters puzzle using an inventory-first workflow, local MCP validation, and human gates before grid fitting. Default is inventory (concept map, sourced, no board limits), then fit (translate to simplified JSON with a loss ledger), then complete (notes and lenses). Use when asked to author, draft, write, create, continue, fill, or fit a puzzle.
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
| `inventory approved` / `continue to fit` | **fit** | `core` then `review` | `--level fit` + `--ledger` |
| continue / fill / notes / lenses / complete | **complete** | `review` (if needed) then `pedagogy` | `--level complete` |
| all-in-one / full pass | **discouraged** — use inventory → fit → complete | — | — |

**Why inventory-first:** the human may not know the subject. The first durable
artifact must be a sourced concept map, not a grid-shaped draft. Board limits
enter only on the fit pass, with a visible loss ledger.

**Why fit before complete:** rewriting clusters after 16 term notes and lenses
wastes the expensive half. Complete assumes the board is human-approved.

## Fail closed (non-negotiable)

1. **No filesystem thrash.** Do not `find`, glob, or ripgrep. Do not read `docs/`, `modules/`, `tools/`, `tests/`, or unrelated puzzles except one comparable template.
2. **Subject pick is one script** when the user named nothing: `suggest-subject.mjs` once. No `list_puzzles` browsing.
3. **Stop when the active pass's checker says so.** Do not keep thinking after the stop gate. Do not call `submit_puzzle_for_publication` unless asked.
4. **Inventory pass must not write puzzle JSON or call `create_puzzle_draft`.** No seeds, floatingTerms, `large`, or node counting.
5. **Fit pass requires explicit human inventory approval** (`inventory approved` or `continue to fit`) in this session. Re-read `/tmp/<id>-inventory.json`; do not re-survey the subject.
6. **Fit and complete passes must not write term notes or lenses** until the complete pass (notes/lenses listed in checker `deferred` on fit).
7. **Complete pass must clear every `blocking` gap** from `--level complete` before record/stop.

## Stop-gate report

Reply with only:

- `id`, `title`, draft `status` (if any), `revision` (if any), active pass (`inventory`, `fit`, or `complete`)
- coverage summary from the checker
- for inventory: path `/tmp/<id>-inventory.json` (no drafts URL yet)
- for fit/complete: `http://127.0.0.1:8787/admin/drafts/<draftId>` and whether `npm run dev` may be needed
- one line:
  - inventory — `Inventory ready. Waiting on concept-map review.`
  - fit — `Fit ready. Waiting on board review (see loss ledger).`
  - complete — `Validated. Waiting on /admin/drafts.`

## Do not load

Unless blocked on a specific field or error:

- `docs/AUTHORING.md`, `docs/MCP.md`, `docs/MCP-REMOTE.md`, `docs/MCP-CLIENTS.md`
- engine files; both `.ccpuzzle.json` and generated `.js`; OAuth/MCP-client history

## Do load

1. This skill, then [design judgment](references/design-judgment.md).
2. [inventory-format.md](references/inventory-format.md) on inventory pass; [fit-pass.md](references/fit-pass.md) on fit pass.
3. `puzzles/categories.js` category keys.
4. **One** comparable `content/puzzles/<id>.ccpuzzle.json`. For complete pass, prefer a peer with `info`, `termInfo`, and lenses.
5. [docs/SIMPLIFIED-PUZZLE-FORMAT.md](../../../docs/SIMPLIFIED-PUZZLE-FORMAT.md) only for an unknown field (fit pass onward).

## Workflow

### 0. Choose the subject (inventory pass, if unnamed)

```sh
node .agents/skills/author-puzzle/scripts/suggest-subject.mjs
```

Honor the picker's `mode`. Edit [category-backlog.json](category-backlog.json) by hand to add or retire gaps — never put backlog entries into `puzzles/categories.js` until the first puzzle lands.

State the pick in one sentence (`mode`, category, optional sub, seed).

### 1. Inventory pass (default `/author-puzzle`)

Survey the concept space **before** board limits. Follow [inventory-format.md](references/inventory-format.md).

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

Required phrases: `inventory approved` or `continue to fit`.

If the human pushes back, revise `/tmp/<id>-inventory.json` and re-run the inventory checker. Do not fit until approved.

### 3. Fit pass

Follow [fit-pass.md](references/fit-pass.md). Translate the **approved** inventory into simplified JSON.

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
