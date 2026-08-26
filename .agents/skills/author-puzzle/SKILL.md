---
name: author-puzzle
description: Author a Concept Clusters puzzle using simplified JSON, a prose-first blueprint, one comparable puzzle, and local MCP validation. Default is a board-first pass (terms/organization), then stop for human review; a second fill/complete pass adds info, term notes, and lenses. Use when asked to author, draft, write, create, continue, or fill a puzzle.
disable-model-invocation: true
---

# Author a Concept Clusters puzzle

Use the repository's local stdio MCP against the same D1 drafts as the hosted
authoring MCP. Publication opens a GitHub pull request; it does not write this
checkout or `main`.

## Passes (pick one)

| User said | Pass | Guidance | Completeness |
|---|---|---|---|
| `/author-puzzle` (no args), new draft | **board** (default) | `core` then `review` | `--level board` |
| continue / fill / notes / lenses / complete | **complete** | `review` (if needed) then `pedagogy` | `--level complete` |
| all-in-one / full pass | **complete** from the start | `core`, `review`, `pedagogy` | `--level complete` |

**Why board-first by default:** rewriting clusters after writing 16 term notes and lenses wastes the expensive half of the work. The fixed cost of a second short session is usually cheaper than discarding notes.

**Why not always board-first:** if the board is already locked (human-approved or a fill pass), all-in-one avoids reloading guidance and the draft.

## Fail closed (non-negotiable)

1. **No filesystem thrash.** Do not `find`, glob, or ripgrep. Do not read `docs/`, `modules/`, `tools/`, `tests/`, or unrelated puzzles except one comparable template.
2. **Subject pick is one script** when the user named nothing: `suggest-subject.mjs` once. No `list_puzzles` browsing.
3. **Stop when the active pass’s checker says so.** Do not keep thinking after the stop gate. Do not call `submit_puzzle_for_publication` unless asked.
4. **Board pass must not write term notes or lenses.** Leave those for the complete pass (listed in checker `deferred`).
5. **Complete pass must clear every `blocking` gap** from `--level complete` before record/stop.

## Stop-gate report

Reply with only:

- `id`, `title`, draft `status`, `revision`, active pass (`board` or `complete`)
- coverage summary from the checker
- `http://127.0.0.1:8787/admin/drafts/<draftId>`
- whether `npm run dev` may be needed
- one line: for board — `Board ready. Waiting on term-set review.` / for complete — `Validated. Waiting on /admin/drafts.`

## Do not load

Unless blocked on a specific field or error:

- `docs/AUTHORING.md`, `docs/MCP.md`, `docs/MCP-REMOTE.md`, `docs/MCP-CLIENTS.md`
- engine files; both `.ccpuzzle.json` and generated `.js`; OAuth/MCP-client history

## Do load

1. This skill, then [design judgment](references/design-judgment.md).
2. `puzzles/categories.js` category keys.
3. **One** comparable `content/puzzles/<id>.ccpuzzle.json`. For a complete pass, prefer a peer with `info`, `termInfo`, and lenses.
4. [docs/SIMPLIFIED-PUZZLE-FORMAT.md](../../../docs/SIMPLIFIED-PUZZLE-FORMAT.md) only for an unknown field.

## Workflow

### 0. Choose the subject (board pass only, if unnamed)

```sh
node .agents/skills/author-puzzle/scripts/suggest-subject.mjs
```

Honor the picker’s `mode`. Do not invent category or subcategory ids outside the backlog or registered taxonomy unless the human named them. Edit [category-backlog.json](category-backlog.json) by hand to add or retire gaps — never put backlog entries into `puzzles/categories.js` until the first puzzle lands.

| `mode` | Author | On publication (when human opens PR / asks) |
|---|---|---|
| `new-category` | Use `category` (+ `subcategory` if present). Prefer `seedSubject` for the board thesis. | Pass picker `newCategory` as `new_category` (includes planned `subcategories`). Set puzzle `subcategories[category]=id` when a sub was picked. |
| `seed-subcategory` | Reuse registered parent `category`. Set puzzle `subcategories[parent]=id`. Prefer `seedSubject`. | Same publish PR must add the subcategory definition to `CATEGORIES` (use `publication.registerSubcategoryOnParent`); do not register it empty beforehand. |
| `densify` | Reuse registered `category` (+ thinnest `subcategory` when present). | No new category; assign subcategory on the puzzle when present. |

State the pick in one sentence (`mode`, category, optional sub, seed), then blueprint.

### 1. Blueprint

**Board:** id, title, category, optional `subcategories` assignment, clusters (distinction, two seeds, 1–4 floating), bridges or none. Size by distinct concepts; 17–24 nodes → `large: true`.

**Complete:** same board already approved; plan puzzle `info`, term-note grain, ≥1 lens (or human waiver).

### 2. Draft into MCP

**Board:** `get_authoring_guidance` phase `core`, then `review`. Save `id`, `title`, `category`, clusters, bridges, `termRole` on bridges. Do **not** fill `termInfo`, puzzle `info`, or lenses yet.

**Complete:** retrieve latest draft; `review` if the board moved; always `pedagogy`. Add puzzle `info.text` (+ citations/links from research), `termInfo.<term>.text` for every term, connector `info.text`, cluster help when cluster-sized, ≥1 focused lens. Preserve every earlier field.

### 3. Checker → validate → stop

```sh
# board pass
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level board /tmp/<id>.json

# complete pass
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level complete /tmp/<id>.json
```

Fix `blocking` until `ok: true`. Then `validate_puzzle_draft`. Then:

```sh
node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

Emit the stop-gate report and **end the turn**.

### 4. Ship (only after human opens PR / asks)

Return the PR URL. Before the PR review loop: `get_workflow_guidance` topic `pull-request-review`.

## Context discipline

One pass, one stop. Prefer aborting over another tool round after the gate fires.
