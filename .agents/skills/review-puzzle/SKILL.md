---
name: review-puzzle
description: Parameterized design-judgment review of Concept Clusters puzzles (published or D1 drafts). Use for /review-puzzle, named ids, corpus picks, load-only smoke, continue, or --mode pr. Run plan-review.mjs once and obey its JSON. Echo named ids/titles verbatim and prove them with a first-class id before any review-loop tool; never invent or substitute a puzzle from chat memory.
disable-model-invocation: true
---

# Review a Concept Clusters puzzle

Run **one** planner. Treat its JSON as the contract. Do not improvise a search.

```sh
node .agents/skills/review-puzzle/scripts/plan-review.mjs [id ...] [flags]
```

## Map the prompt to flags

| User said | Command |
|---|---|
| `/review-puzzle` (no ids) | `plan-review.mjs` (mode `pick`) |
| `/review-puzzle market-for-lemons` | `plan-review.mjs market-for-lemons` (mode `load`, gate on) |
| load only / smoke / dry load | same as named ids (already `load`) |
| dry run / `--dry-run` | add `--dry-run` |
| due / what's stale | `--mode due` (`--category` if given) |
| category/subcategory | `--category biology` / `--subcategory genomics` |
| continue / review it | `plan-review.mjs <id> --continue` |
| record unchanged | `--mode record --record <id> --unchanged` |
| PR checks/comments | `plan-review.mjs <id> --mode pr` |

Cap is three ids. Do not add flags the user did not imply. Do not run `resolve-target.mjs` or `suggest-review.mjs` first — the planner already calls them.

## Obey the JSON

After the planner prints:

1. Follow `steps` in order. Call only `allowedMcp`. Read only `allowedReads`.
2. Honor `mcpBudget` per id, `stopAfter`, and `proveBeforeReview`.
3. If a step says ABORT, print `abortMessage` and stop.
4. When `stopAfter` is `load-report` or `picks` or `plan` or `due-map`, **end the turn**.
5. Never replace `chunk` ids with other puzzles. Never invent an id from chat memory.

Load-gate report (`stopAfter: load-report`): `id`, `title`, `status`, `revision`, drafts URL from `node tools/authoring-workspace.mjs` (`draftReviewUrl/<id>`), optional PR URL only if already in the draft tools, then `Loaded. Waiting for continue.`

## Fail closed

- Named / planned ids are locked.
- No `find`, glob, ripgrep, or reading `docs/` / `modules/` / unrelated files to hunt a puzzle.
- No blank blueprint. No `list_puzzles` browsing.
- Minutes of extra tool calls are a failure; abort instead.

## Prove before review (non-negotiable)

Named targets from the user (or from planner `chunk`) are **not** trusted until proven. Conversation memory, earlier `/author-puzzle` brainstorms, and plausible titles do **not** count.

1. **Echo verbatim.** Restate each named id/title exactly as given before any MCP write or review-loop call.
2. **Prove with a first-class identifier** before board edits or any of: `get_review_feedback`, `apply_review_suggestion`, `reply_to_review_comment`, `resolve_review_feedback`, `sync_review_changes_to_draft`, `complete_review_round`, `prepare_human_review_handoff`, `reset_review_circuit`. Proof is one of:
   - `get_puzzle_draft` returning that exact `draftId` (and its `revision` / `status`), or
   - a `publication_request_id` (UUID) the human supplied or that is already attached to that proven draft/PR, or
   - a PR URL / PR number the human supplied that maps to that same id
3. **Unproven → ABORT.** If proof fails, say the name is unproven (likely chat-memory contamination), ask for drafts URL / PR URL / `publication_request_id`, and stop. Do not invent a nearby economics title, do not pick a substitute, do not browse.
4. **`--mode pr` still proves first.** Call `get_puzzle_draft` for the named id; only then enter the PR loop with that draft’s publication request. No proof, no `get_review_feedback`.

## Board checklist (only if `mode` is `review` and the plan says so)

Load [design judgment](../author-puzzle/references/design-judgment.md) only then. Unset `relationKind`, `direction`, `idealTerms`, `learningIntroduction`, `level`, `relatedPuzzles` unless the board clearly warrants them. Do not manufacture bridges or equalize counts.

- Trap words, duplicate jobs, facts naming missing terms, seed recognizability, necessary bridges. Nodes 17–24 use the wide canvas automatically; split only above 24.
- `termRole`; help grain
- Lenses only if pedagogy needs a change; do not pad toward 6
- Metadata only for a real discovery fix

Do not set `publish_to_authoring: true` on `save_puzzle_draft` unless the human asks. One puzzle per PR, opened by a human from the drafts page. The drafts page is the copy surface; this skill is structural.

## Record

Only when the plan’s review steps include it:

```sh
node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record <id> [--unchanged]
```

Do not commit the log (it lives in the authoring data dir). `--authored` is for author-puzzle, not this skill.

## Context

Canonical source is simplified JSON. Do not hand-edit generated `puzzles/**/*.js`. Prefer aborting over another tool round when the plan has already failed.
