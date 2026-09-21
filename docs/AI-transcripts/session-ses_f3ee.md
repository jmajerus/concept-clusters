# Author Concept Clusters puzzle

**Session ID:** ses_f3eed5f7dffehiVYzi3FycmrAc
**Created:** 9/20/2026, 6:06:58 PM
**Updated:** 9/20/2026, 6:56:06 PM

---

## User

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
over 25 means the plan gate.

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
1. Revise notes, lenses, or bridge help
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

- **Split:** run `plan-split-boards.mjs` once per board; obey its JSON. Use
  `--transport stdio` when this client has the authoring server registered as a
  native MCP server: invoke each returned MCP tool directly and sequentially.
  This preserves the host's true call frame and is preferred. In Kilo Code,
  the project `.kilo/kilo.json` registers this server and exposes its tools
  under the `concept-clusters_<tool>` names; call those namespaced tools
  directly, never `node tools/mcp-call.mjs`. If those tools are not visible,
  reload the Kilo MCP connection or start a new session instead of silently
  switching transports. Use the default `mcp-call` transport only when native
  MCP calls are unavailable (including Codex-safe shell execution). Fit **each
  board** in the split plan's `boardOrder`;
  copy only `relatedPuzzles.info` and `relatedPuzzles.entries` from the plan
  onto the first board (reciprocal link on the sequel when useful). `boardOrder`
  is external plan metadata and must not be copied into the puzzle document.
  **Never fit or complete two boards in one burst.**
  `mcp-call` starts a distinct stdio client: when the invoking client has an
  actual MCP `clientInfo` and call `_meta`, forward them with
  `CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO` and `CONCEPT_CLUSTERS_MCP_CALL_META`
  (or the helper's `--client-info` and `--meta` flags). Never guess or hard-code
  a client identity. Without the actual envelope, the server cannot auto-stamp
  the drafting client. `CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME` is a surface-only
  fallback for isolated scripts or CI, never a shared repository setting.
  When Kilo launches the helper from its own VS Code backend, the helper
  recognizes Kilo's exact process markers and stamps the Kilo surface as a
  low-trust fallback; native calls remain the only way to preserve per-call
  metadata.
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


Base directory for this skill: /home/john/Workspace/concept-clusters/.agents/skills/author-puzzle
Relative paths in this skill (e.g., scripts/, references/) are relative to this base directory.

Create a vocabulary-in-context puzzle using a single cluster of synonyms such as innate, intrinsic, inherent. Use profile: "vocabulary-context" on each applicable get_authoring_guidance and get_authoring_schema call, with the current phase. Set puzzleKind: "vocabulary-context" in the puzzle document. Choose category independently, and follow the normal inventory-first workflow and human gates.

---

## Assistant

**Tool: read**

**Tool: read**

**Tool: grep**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: concept-clusters_list_categories**

---

## Assistant

The registered **Vocabulary** category (slug `vocabulary`, "How context, usage, and neighboring meanings determine what a word means") is the right home. Checking corpus overlap with planned anchor terms before mapping:

**Tool: concept-clusters_search_puzzles**

---

## Assistant

**Tool: concept-clusters_search_puzzles**

---

## Assistant

No overlap in `vocabulary` — the gap is open. Researching the synonym family with anchors:

**Tool: webfetch**

**Tool: webfetch**

**Tool: webfetch**

---

## Assistant

Strong anchors for the birth-origin and essence facets. Fetching the remaining facet anchors:

**Tool: webfetch**

**Tool: webfetch**

---

## Assistant

Facet anchors secured. The synonym family maps into three sourced usage facets. Writing the inventory:

**Tool: write**

---

## Assistant

**Tool: bash**

---

## Assistant

**id:** `innate-intrinsic-inherent` · **title:** Born In, Built In, or Worked In? — innate, intrinsic, inherent, and their neighbors · **pass:** inventory · **category:** Vocabulary (registered, slug `vocabulary`; corpus search confirmed no overlap)

**Coverage:** distinctions 3 — terms per distinction: d1 birth endowment 4 (innate, inborn, congenital, inbred), d2 essence membership 5 (intrinsic, inherent, built-in, integral, essential), d3 absorbed fixity 3 (ingrained, deep-seated, entrenched); connections 3 (unacquired presence; embedded beyond removal; the "so deep it seems innate" zone); excluded 8 (hereditary, genetic, implicit/tacit, instinctive, endemic, natural, antonyms, technical senses). Checker: `ok: true`, no blocking gaps.

**Inventory:** `.concept-clusters/authoring/inventories/innate-intrinsic-inherent.json`

Inventory ready. Waiting on concept-map review.

**What's next?**
1. Revise the concept map (tell me what to change — e.g. cluster width, whether ingrained/deep-seated belong in the cluster or as distractors)
2. Approve — continue (fit if it fits one board; otherwise plan a split)

---

## User

Revise to single cluster. This is an inagural test of this puzzle type and I'm trying to start simple. The puzzle can be revised and expanded later. Then move on to creating 2 lenses, each that uses a single on of the cluster terms in a sentence, such that the 2 lenses together help disambiguate where one term would be preferred over the other in sentence contexts?

---

## Assistant

Human proceed signal received: revise to a single tight cluster, then fit + two sentence-context lenses. Revising the inventory to record the decision:

**Tool: write**

---

## Assistant

**Tool: bash**

---

## Assistant

Inventory revised and passing. Proceed signal given — running the board planner, then loading fit-pass materials:

**Tool: bash**

**Tool: read**

---

## Assistant

Single-board confirmed. Finding the one same-category comparable for field conventions:

**Tool: concept-clusters_list_puzzles**

---

## Assistant

**Tool: read**

---

## Assistant

Comparable loaded — the vocabulary peer confirms field conventions (blank-sentence lens prompts, `targets`, `reasons`, `sequential` + `preSolve`). Writing the fit-stage working document and loss ledger before any MCP save:

**Tool: write**

**Tool: write**

---

## Assistant

**Tool: bash**

---

## Assistant

Fit checker passes with no blocking gaps — the deferred items are exactly the pre-approved complete-pass work. MCP now, sequentially:

**Tool: concept-clusters_get_authoring_guidance**

---

## Assistant

**Tool: concept-clusters_get_authoring_schema**

---

## Assistant

Schema constraint discovered: `clusters.minItems: 2` — a literal one-cluster board is not valid in this format. Closest shape honoring "one synonym family, start simple": keep the six synonyms as **one cluster**, and add a small **contrast cluster** (acquired, learned, extrinsic — the inventory's excluded antonyms) so the board is playable and schema-valid. The synonym family stays single; I'll flag this at the gate. Updating fit artifacts:

**Tool: write**

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: bash**

---

## Assistant

Fit still clean. Review-phase guidance next, then draft creation:

**Tool: concept-clusters_get_authoring_guidance**

---

## Assistant

Review guidance confirms single-target lenses with decisive contextual cues. Creating the fit-stage draft:

**Tool: concept-clusters_create_puzzle_draft**

---

## Assistant

Draft created (revision 1). Complete pass — pedagogy guidance first:

**Tool: concept-clusters_get_authoring_guidance**

---

## Assistant

Pedagogy guidance confirms one-blank/one-target lenses, sequential mode, `preSolve` when grouping is obvious and context is the lesson. Writing the complete working document:

**Tool: write**

---

## Assistant

**Tool: concept-clusters_save_puzzle_draft**

---

## Assistant

Content domain saved (revision 2). Pedagogy save with the two lenses:

**Tool: concept-clusters_save_puzzle_draft**

---

## Assistant

Both domains saved (revision 3). Complete-pass checker:

**Tool: bash**

---

## Assistant

**Tool: concept-clusters_validate_puzzle_draft**

---

## Assistant

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

**id:** `innate-intrinsic-inherent` · **title:** Already There? Innate, Intrinsic, Inherent · **status:** draft · **revision:** 3 · **pass:** complete · **category:** Vocabulary (`vocabulary`, profile `vocabulary-context`)

**Coverage:** 2 clusters — "Already Present" (innate, intrinsic, inborn, congenital, inherent, ingrained; seeds innate + intrinsic) and "Added From Outside" (acquired, extrinsic, learned) as the contrast foil · 9/9 terms have sourced notes (Merriam-Webster citations on puzzle info) · 0 bridges (single synonym family; all 3 inventory connections carried into facts/lens explanations, logged `bridge-dropped` in the ledger) · 2 lenses: `history-did-the-fixing` → target **ingrained** ("twenty years in politics had ______ it so deep"), `in-the-constitution` → target **inherent** ("______ in the bridge's design") — each one blank/one target per profile guidance, together teaching the two selection cues (named history vs preposition/collocation) that separate ingrained from the birth words and inherent from intrinsic · `sequential`, `preSolve: true`

**One deviation to note:** the format requires ≥2 clusters (`clusters.minItems: 2`), so a literal one-cluster board is impossible; the synonym family stayed single and the second cluster is the inventory's excluded antonyms, logged in the loss ledger.

Checker: `ok: true`, no blocking (advisories only: optional cluster info, omitted learning introduction) · `validate_puzzle_draft`: **valid, no flags** · review recorded (`--authored`)

**Drafts:** http://authoring.localdomain:8787/admin/drafts

Validated. Waiting on /admin/drafts.

**What's next?**
1. Revise notes, lenses, or cluster wording (tell me what to change)
2. Approve — open the drafts page to review copy
3. Publish and cue for freeze when ready (a human action on `/admin/drafts`, or ask me to set `publish_to_authoring`)

---

## User

You designed the first lens such that the answer was made obvious by the fact that you used "ingrained" as a verb ("had ingrained it") while the other terms only have the adjectival form?

---

## Assistant

Valid catch — the "had ______ it" slot is verbal, and only *ingrained* (via *ingrain*) fills it as a verb, so part of speech decided the answer rather than the usage distinction the lens teaches. Rebuilding lens 1 around an adjectival slot where the collocation and origin cue decide:

**Tool: concept-clusters_get_puzzle_draft**

---

## Assistant

Revision 3 confirmed. Saving the rebuilt lens (revision 4, pedagogy domain):

**Tool: concept-clusters_save_puzzle_draft**

---

## Assistant

Syncing the working file and re-validating:

**Tool: edit**

---

## Assistant

**Tool: bash**

---

## Assistant

**Tool: concept-clusters_validate_puzzle_draft**

---

## Assistant

**Tool: bash**

---

## Assistant

**id:** `innate-intrinsic-inherent` · **status:** draft · **revision:** 4 · **pass:** complete

Fixed. Lens 1's blank is now adjectival — *"twenty years in politics had left it so deeply ______ that he no longer noticed it."* Every board term is adjectival, so no part-of-speech advantage: substitution gives one natural fit ("deeply **ingrained**", the fixed collocation) with genuine semantic near-misses — birth words ruled out by "wasn't there in childhood", acquired/learned rejected because they name the taking-in, not the fixed state, inherent/intrinsic because no history did the fixing. The explanation now names the collocation + origin-logic cues. Lens 2 was already adjectival-slot (preposition `in` + *inherent risk* collocation decide) and is unchanged.

Checker: `ok: true`, no blocking · `validate_puzzle_draft`: **valid, no flags** · review re-recorded.

**Drafts:** http://authoring.localdomain:8787/admin/drafts

Validated. Waiting on /admin/drafts.

**What's next?**
1. Revise notes, lenses, or cluster wording (tell me what to change)
2. Approve — open the drafts page to review copy
3. Publish and cue for freeze when ready (a human action on `/admin/drafts`, or ask me to set `publish_to_authoring`)

---

## User

There's a real problem here. You're not seeing it. "left it so deeply ingrained" is also a verb form? Here's a solution. Don't use words that have dual usage. Stick to straight adjectives?

---

## Assistant

You're right — "left it so deeply ingrained" is a passive participle slot, and *ingrained* (verb *ingrain*) is still the only board word that can fill it by form. Applying your rule: board terms must be straight adjectives only. That removes *ingrained* (verb/participle), and also *acquired*/*learned* in the contrast cluster. Rebuilding the board around pure adjectives:

**Tool: edit**

---

## Assistant

**Tool: bash**

---

## Assistant

Inventory still clean (ingrained stays mapped in d3; the board rule lives in the resolutions). Rewriting working document and ledger:

**Tool: write**

---

## Assistant

**Tool: write**

---

## Assistant

**Tool: bash**

---

## Assistant

Both checkers clean. Saving content domain (revision 4 → 5):

**Tool: concept-clusters_save_puzzle_draft**

---

## Assistant

**Tool: concept-clusters_save_puzzle_draft**

---

## Assistant

**Tool: concept-clusters_validate_puzzle_draft**

---

## Assistant

**Tool: bash**

---

## Assistant

**id:** `innate-intrinsic-inherent` · **status:** draft · **revision:** 6 · **pass:** complete

Rebuilt per your rule — every board term is now a straight adjective with no verb/participle dual usage:

- **Already Present** (5): innate, intrinsic, inborn, congenital, inherent
- **Added From Outside** (3): extrinsic, external, foreign
- Dropped from board: **ingrained** (verb *ingrain* + participle), **acquired**, **learned** — all logged in the loss ledger with your reason; ingrained stays in the concept map (absorbed-fixity facet) as expansion material.

**Lens 1** now targets **congenital**: *"The cardiologist explained that the defect was ______ : her heart had simply formed that way before she was born."* All eight terms are adjectives, so no form can win the blank — register and collocation decide (congenital heart defect; innate/inborn stay with qualities, not defects). **Lens 2** unchanged, **inherent**: *"it was ______ in the bridge's design"* — preposition + collocation decide against *intrinsic* ('intrinsic **to**'). Together: two straight-adjective selection axes — register within the birth family, grammatical frame within the essence family.

Checkers: fit + complete `ok: true`, no blocking · `validate_puzzle_draft`: **valid, no flags** · review recorded.

**Drafts:** http://authoring.localdomain:8787/admin/drafts

Validated. Waiting on /admin/drafts.

**What's next?**
1. Revise notes, lenses, or cluster wording (tell me what to change)
2. Approve — open the drafts page to review copy
3. Publish and cue for freeze when ready (a human action on `/admin/drafts`, or ask me to set `publish_to_authoring`)

---

## User

Okay, here's the deal. You named this puzzle "innate-intrinsic-inherent". I'd like 3 lenses to exercise each of those selections in order to teach the nuances between them. Congential is not nuanced. We don't need a puzzle for it.

---

## Assistant

Three lenses, one per namesake, ordered innate → intrinsic → inherent; congenital keeps its board seat but loses its lens. Updating the inventory record first:

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: bash**

---

## Assistant

**Tool: concept-clusters_save_puzzle_draft**

---

## Assistant

**Tool: concept-clusters_validate_puzzle_draft**

---

## Assistant

**Tool: bash**

---

## Assistant

**id:** `innate-intrinsic-inherent` · **status:** draft · **revision:** 7 · **pass:** complete

Three lenses, one per namesake, in id order — all straight-adjective blanks, no form monopoly:

1. **innate** — *"Spiderlings weave perfect webs on their very first try, with no adult to teach them; the behavior is ______ , not learned."* → the learned-behavior opposition; Merriam-Webster's own example is "innate behavior". Near-miss inborn addressed (it stays with qualities, not behavior).
2. **intrinsic** — *"Psychologists warn that paying children to read can crowd out ______ motivation — the desire to read for its own sake."* → the external-reward contrast; fixed term *intrinsic motivation* alongside *intrinsic value*. Birth words fail (no being born here); *inherent* lives in risk/flaw talk, not reward.
3. **inherent** — *"The weakness wasn't introduced by shoddy construction; it was ______ in the bridge's design from the start."* → preposition + collocation decide (*inherent in the design*; *intrinsic* wants *to*).

Per your call, **congenital has no lens** — I've kept it on the board as an unambiguous birth-family member since it's still sourced and unambiguous; say the word if you want it off the board entirely. Checker `ok: true`, `validate_puzzle_draft` **valid, no flags**, review recorded.

**Drafts:** http://authoring.localdomain:8787/admin/drafts

Validated. Waiting on /admin/drafts.

**What's next?**
1. Revise notes, lenses, or cluster wording (tell me what to change)
2. Approve — open the drafts page to review copy
3. Publish and cue for freeze when ready (a human action on `/admin/drafts`, or ask me to set `publish_to_authoring`)

---

