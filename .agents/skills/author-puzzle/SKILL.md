---
name: author-puzzle
description: Author Concept Clusters puzzles through MCP and stop at human review. Profile-only vocabulary-context or trivia-quiz requests choose a compact subject and create a complete draft; open-ended or topic-based work uses staged inventory, planning, fit, and completion. Use when asked to author, draft, write, create, continue, fill, or fit a puzzle.
disable-model-invocation: true
---

# Author a Concept Clusters puzzle

Skill rev `7cce007f` · 2026-09-21

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
| bounded puzzle or profile-only `profile=vocabulary-context` / `profile=trivia-quiz` | **integrated** | profile `core` + `pedagogy`, then profile `review` after drafting lenses; full schema | `--level integrated` |
| full pass for topic-based, open-ended, or multi-board work | **staged** — use inventory → plan → fit → complete | — | — |

A profile with no subject is a “surprise me” request — see
[Profile-only selection](#profile-only-selection).

**In the staged workflow, proceed to fit** when the human signals approval —
not only magic phrases. Any clear imperative counts: `inventory approved`,
`continue to fit`, `create the draft`, `create both puzzles`, `fit it`,
`use MCP to create…`, `go ahead`, etc. **Pedagogical decisions also count:**
agreeing to a split, trims, or `relatedPuzzles` pairing means the concept map
is approved for that plan — if they then say create/fit, run immediately. If the
message tells you to build/save/fit, **run the fit pass**; do not bounce back
asking for a different phrase. Only stop for approval when inventory is ready
and the human has **not** yet asked you to proceed. After inventory approval,
run `plan-boards.mjs`: `single-board` means go to fit (no split-plan file);
over 25 means the plan gate.

**Why inventory-first:** for an open-ended subject, the human may not know its
conceptual structure. The first durable artifact is a sourced concept map, not
a grid-shaped draft. Board limits enter only on the fit pass, with a visible
loss ledger. The [integrated cycle](#integrated-cycle-vocabulary-context-and-trivia-quiz)
is the explicit exception: board structure and lenses are designed together.

**Why fit before complete in the staged workflow:** rewriting clusters after 16
term notes and lenses wastes the expensive half. Complete assumes the board is
human-approved.

## Fail closed (non-negotiable)

1. **No filesystem thrash.** Do not `find`, glob, or ripgrep. Do not read `docs/`, `modules/`, `tools/`, `tests/`, or any `content/puzzles/*.ccpuzzle.json` on the **inventory** pass.
2. Use `suggest-subject.mjs` once, only for the unprofiled no-subject default;
   profile-only requests use [Profile-only selection](#profile-only-selection).
3. **Stop when the active pass's checker says so.** Do not keep thinking after the stop gate. Do not set `publish_to_authoring: true` on `save_puzzle_draft` unless asked.
4. **Inventory pass must not write puzzle JSON or call `create_puzzle_draft`.** No seeds, floatingTerms, or node-cap arithmetic.
5. **Fit pass requires a human proceed signal** in this session (approval phrase
   or direct create/fit instruction — see table above). Never re-prompt for
   wording when the user already told you to create or fit. Re-read
   `inventories/<id>.json`; do not re-survey the subject.
6. **Staged fit must not write term notes or lenses** until the complete pass
   (notes/lenses listed in checker `deferred` on fit). The integrated cycle is
   the explicit exception: it authors board and lenses together and validates
   the full draft.
7. **Complete pass must clear every `blocking` gap** from `--level complete` before record/stop.
8. **Never run a shell command as a placeholder, no-op, or "to think."** If
   the MCP tool you need is not in your tool list, stop and name the missing
   tool; do not substitute another call.

## Stop-gate report

Reply with only:

- `id`, `title`, draft `status` (if any), `revision` (if any), active pass (`inventory`, `plan`, `fit`, `complete`, or `integrated`)
- coverage summary from the checker
- for inventory: path `inventories/<id>.json` (no drafts URL yet)
- for plan: paths `plans/<id>-split-plan.json` and inventory; `plan-boards.mjs` summary line
- for fit/complete/integrated: drafts URL from `node tools/authoring-workspace.mjs` (`draftReviewUrl/<draftId>`)
- one line:
  - inventory — `Inventory ready. Waiting on concept-map review.`
  - plan — `Split plan ready. Waiting on board-plan approval or fit.`
  - fit — `Fit ready. Waiting on board review (see loss ledger).`
  - complete — `Validated. Waiting on /admin/drafts.`
  - integrated — `Integrated profile draft validated. Waiting on /admin/drafts.`
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
1. Revise notes, lenses, or bridge help
2. Approve — open the drafts page to review copy
3. Publish and cue for freeze when ready (or next board in a split)
```

### Integrated profile gate

```
What's next?
1. Revise the selected subject, board, or lenses
2. Approve — open the drafts page to review the complete puzzle
3. Publish and cue for freeze when ready
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

**Integrated cycle** (instead of the above):

8. This skill, [design judgment](references/design-judgment.md), and the MCP
   profile guidance + complete schema. Skip inventory-format, split-pass,
   fit-pass, and the comparable; the profile guidance carries the conventions.
   [docs/SIMPLIFIED-PUZZLE-FORMAT.md](../../../docs/SIMPLIFIED-PUZZLE-FORMAT.md)
   only when a field is unclear.

## Workflow

**Route first** — decide from the invocation before running anything:

- `profile=` and no subject → [Profile-only selection](#profile-only-selection), then the integrated cycle
- `profile=` with a subject → [Integrated cycle](#integrated-cycle-vocabulary-context-and-trivia-quiz)
- subject, no profile → [1. Inventory pass](#1-inventory-pass-default-author-puzzle)
- nothing → [Generic subject picker](#generic-subject-picker-no-subject-no-profile), then the inventory pass

`suggest-subject.mjs` is reachable only through the last line.

### Profile-only selection

`/author-puzzle profile=vocabulary-context` or `profile=trivia-quiz` with no
subject means “surprise me”: choose a compact subject and run the integrated
cycle to one complete draft. That authorizes subject selection and draft
creation without an inventory or topic-approval stop; it does not authorize
publication. An explicit inventory-only request still uses the staged workflow.

- Pick an unexpected subject that fits one board; if a candidate is too
  broad, narrow it rather than expanding to multiple boards. Vocabulary-context
  needs a collegiate-level near-synonym neighborhood — one a collegiate
  dictionary discriminates in a synonym paragraph (meticulous / scrupulous /
  punctilious), not everyday words whose differences are audible from the
  words themselves (laughter / guffaw / chuckle); Trivia-quiz needs sourceable
  facts whose groups frame meaningful questions.
- Check `search_puzzles` for existing coverage; if covered, choose another
  subject. Choose an existing category from live `list_categories` /
  `get_category`; never create a category for a surprise pick.
- Do not use the generic picker or present a menu for approval. Name the
  chosen subject in the final handoff.
- Store the matching `puzzleKind` in the document; `profile` selects guidance,
  not taxonomy.

### Integrated cycle (Vocabulary-context and Trivia-quiz)

Use this route for a bounded, complete `vocabulary-context` or `trivia-quiz`
request, including profile-only “surprise me” requests. If the user asks only
for an inventory or explicitly requests open-ended/multi-board work, use the
staged workflow instead.

1. **Guidance.** `get_authoring_guidance` with the profile: overview and `core`
   before composing; `pedagogy` while drafting lenses; `review` after the
   candidate lenses exist. `get_authoring_schema` with the same profile,
   **complete** — not a core-only phase projection. One MCP call at a time.
2. **Research.** Survey the selected or requested material (the synonym
   neighborhood and its usage distinctions; the fact space and its groupings)
   and choose the taxonomy category independently through the live taxonomy,
   using `list_categories` / `search_puzzles` where the normal workflow
   requires them. Keep this focused: it is an internal design aid, not a
   separate inventory artifact or approval gate. Capture exact sources and
   links as you find them.
3. **Co-design board and lenses together** per the profile deltas below. Let
   the material — not a target count — set the groups, terms, and lenses.
   Include sourced puzzle `info` and `termInfo` in the same working document.
4. **Verify every lens against the board** per the profile deltas; repeat
   after any lens revision.
5. **Check, create once, validate, record, stop.** Run the checker, then create
   the entire draft in one `create_puzzle_draft` call — never a cluster-only
   skeleton with lenses saved later. Then `validate_puzzle_draft`, record the
   authored review, and stop at the
   [Integrated profile gate](#integrated-profile-gate). Never publish unless
   the human asks.

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level integrated working/<id>.json
node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

**Vocabulary-context deltas**

- Board: genuine near-synonyms only. A single cluster is valid and needs no
  invented foil cluster: put the complete term set in `terms` (2–7 is the
  validity limit, not a target); omit
  `seeds`, `floatingTerms`, `bridges`, and `preSolve` (the game pre-solves that
  cluster before its lenses). Use seeds/floating terms and a per-puzzle
  `preSolve` choice only when multiple clusters make sorting meaningful.
- Lenses: contextual blanks that turn on the usage distinction.
- Verify: substitute **every playable term** into every blank. Confirm one
  most natural or precise fit and explain why plausible neighbors are less
  precise. Check part of speech and inflection so an accidental form mismatch
  does not give away an answer; use syntax or collocation as a cue only when it
  serves the intended usage distinction.

**Trivia-quiz deltas**

- Board: meaningful groups whose membership frames the questions; normal
  seeds/floating-terms shape. Set `lensMode: "quiz"`; choose `preSolve` by
  whether sorting contributes to play. Seeds are still required by the
  schema; on a pre-solved board the player never sees the seed/floating
  split, so choose seeds without deliberation.
- Lenses: factual quiz questions; research and cite every factual claim.
- Verify: every question has exactly one defensible answer, and its targets
  match the board.

### Generic subject picker (no subject, no profile)

Reachable only through the route block above.

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
ahead/etc.). If they only asked for the map, wait — one line is
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
only when the inventory exceeds 25 nodes (terms plus connections) or the human
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

- **Split:** run `plan-split-boards.mjs` once per board and obey its JSON;
  transport selection (`--transport stdio` vs. `mcp-call`, Kilo's namespaced
  tools) and client-identity forwarding are in
  [split-pass.md](references/split-pass.md). Fit **each board** in the plan's
  `boardOrder`; copy only `relatedPuzzles.info` and `relatedPuzzles.entries`
  from the plan onto the first board (reciprocal link on the sequel when
  useful) — `boardOrder` is plan metadata and must not enter the puzzle
  document. **Never fit or complete two boards in one burst.**
- Use `destinationPuzzleId` in ledger `deferred` entries for sibling terms.

- If the category already has published puzzles, read **one same-category** comparable for JSON field conventions only — not to copy its cluster count or term counts.
- If the category is new (no peers), skip comparable reads; rely on MCP `get_authoring_schema` phase `core`.
- Write `ledgers/<id>-fit.json` (loss ledger) **before** MCP save.
- MCP tools **one at a time** (never parallel on stdio — Codex closes the transport): `get_authoring_guidance` phase `core`, then `get_authoring_schema` phase `core`, then `review`.
- `create_puzzle_draft` / `save_puzzle_draft`: clusters and bridges first; add
  notes, lenses, and publication metadata in later passes.

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

Retrieve latest draft. Add puzzle `info`, `termInfo`, bridge help, and lenses. Preserve every earlier field.

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
