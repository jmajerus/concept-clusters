---
name: review-puzzle
description: Parameterized design-judgment review of Concept Clusters puzzles (published or D1 drafts). When invoked without ids, selects the oldest D1-recorded agent review first. Use for /review-puzzle, named ids, corpus picks, load-only smoke, continue, or a bounded author/critic loop (--mode loop). Run plan-review.mjs once and obey its JSON. Echo named ids/titles verbatim and prove them with a first-class id before any board edit or save; never invent or substitute a puzzle from chat memory.
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
| `/review-puzzle` (no ids) | `plan-review.mjs` (mode `pick`; one oldest last-reviewed puzzle) |
| bulk review queue | `plan-review.mjs --count 3` (three oldest, in sequence) |
| `/review-puzzle market-for-lemons` | `plan-review.mjs market-for-lemons` (mode `load`, gate on) |
| load only / smoke / dry load | same as named ids (already `load`) |
| dry run / `--dry-run` | add `--dry-run` |
| due / what's stale | `--mode due` (`--category` if given) |
| category/subcategory | `--category biology` / `--subcategory genomics` |
| continue / review it | `plan-review.mjs <id> --continue` |
| record unchanged | `--mode record --record <id> --unchanged` |
| bounded author/critic pass | `plan-review.mjs <id> --mode loop [--rounds n]` |

Bare review is deliberately one puzzle at a time. `--count` retains the existing bounded bulk queue (maximum three; `--mode loop` is one id at a time — it is already a multi-round operation per id). Do not add flags the user did not imply. Do not run `resolve-target.mjs` or `suggest-review.mjs` first — the planner already calls them.

## Obey the JSON

After the planner prints:

1. Follow `steps` in order. Call only `allowedMcp`. Read only `allowedReads`.
2. Honor `mcpBudget` per id, `stopAfter`, and `proveBeforeReview`.
3. If a step says ABORT, print `abortMessage` and stop.
4. When `stopAfter` is `load-report` or `picks` or `plan` or `due-map`, **end the turn**.
5. Never replace `chunk` ids with other puzzles. Never invent an id from chat memory.

Load-gate report (`stopAfter: load-report`): `id`, `title`, `status`, `revision`, drafts URL from `node tools/authoring-workspace.mjs` (`draftReviewUrl/<id>`), optional PR URL only if already in the draft tools, then `Loaded. Waiting for continue.`

## D1 working-copy gate

Review a D1 working copy, not a repository file in place. First call
`get_puzzle_draft`. If it is absent for a published puzzle, call
`create_puzzle_draft` with `draft_id` and `puzzle_id` set to that id and
`seed_from_published: true`. That imports the published (or git-seeded)
snapshot into the reviewer’s D1 draft and runs the shared editor
canonicalization before any review save. A human can then inspect and amend
that durable draft on the authoring page.

Never send the canonical file itself as a replacement document during this
import. If a D1 draft already exists, it is the current working copy; preserve
it and let an explicit subsequent save persist any required canonical form.

## Fail closed

- Named / planned ids are locked.
- No `find`, glob, ripgrep, or reading `docs/` / `modules/` / unrelated files to hunt a puzzle.
- No blank blueprint. No `list_puzzles` browsing.
- Minutes of extra tool calls are a failure; abort instead.

## Prove before review (non-negotiable)

Named targets from the user (or from planner `chunk`) are **not** trusted until proven. Conversation memory, earlier `/author-puzzle` brainstorms, and plausible titles do **not** count.

1. **Echo verbatim.** Restate each named id/title exactly as given before any MCP write.
2. **Prove with a first-class identifier** before any board edit or save: `get_puzzle_draft` returning that exact `draftId` (and its `revision` / `status`).
3. **Unproven → ABORT.** If proof fails, say the name is unproven (likely chat-memory contamination), ask for the drafts URL, and stop. Do not invent a nearby economics title, do not pick a substitute, do not browse.

## Board checklist (only if `mode` is `review` and the plan says so)

Load [design judgment](../author-puzzle/references/design-judgment.md) only then. Unset `relationKind`, `direction`, `idealTerms`, `learningIntroduction`, `level`, `relatedPuzzles` unless the board clearly warrants them. Do not manufacture bridges or equalize counts. Merge a targeted edit into the latest document: preserve unrelated current fields, including category metadata, citations, and provenance/contributors.

- Trap words, duplicate jobs, facts naming missing terms, seed recognizability, necessary bridges. Nodes 17–25 use the wide canvas automatically; split only above 25.
- `termRole`; help grain
- Lenses only if pedagogy needs a change; do not pad toward 6
- Metadata only for a real discovery fix

### Structural-regularity prompts

`structural-regularity-combination` is the MCP-visible prompt: an actual
non-identity symmetry in the attributed cluster--bridge incidence graph plus a
cross-axis count lock (terms per cluster equal the cluster count). Individual
count, topology, and symmetry observations are draft-review-only, deliberately
kept out of MCP responses to reduce author noise. For a combination prompt,
resolve the authoring workspace once, then read only the exact source paths for
this draft: `ledgers/<draft-id>-fit.json`; its `inventoryId` selects
`inventories/<inventory-id>.json`, otherwise try `inventories/<draft-id>.json`.
Do not search the workspace.

Compare the board to that source map and loss ledger before retaining or
changing a repeated shape. Never add/remove terms or bridges merely to clear a
prompt. If the artifacts are absent (common for legacy published puzzles),
report the prompt as open and ask the human for the source rationale; do not
reconstruct an inventory from the board.

For every save, use the latest `expected_revision`. Validate after a save; if
validation requires a correction, refresh the draft and validate the corrected
revision before recording the pass.

Do not set `publish_to_authoring: true` on `save_puzzle_draft` unless the human asks. Cue and Freeze, from the drafts and admin pages, are how a puzzle reaches production; this skill is structural, not a publish action. The drafts page is the copy surface.

## Author/critic loop (only if `mode` is `loop`)

Two roles, one agent switching hats each round — not a truly independent critic. On the critic turn, judge the draft as it is written; do not defend or explain the reasoning behind a choice you made as author. That discipline is the entire value of the loop: a critic that re-litigates its own reasoning instead of the document in front of it isn't checking anything.

Each round: **critic turn** (load [design judgment](../author-puzzle/references/design-judgment.md), list concrete objections tied to specific clusters/terms/bridges/facts, no edits) → **author turn** (fix each objection, `save_puzzle_draft`, `validate_puzzle_draft`). Stop looping — and report why — on whichever comes first:

- **converged**: the critic turn finds nothing to object to;
- **stagnant**: this round's objections are substantially the same as last round's (a fix didn't land, or the critic is repeating itself);
- **capped**: `--rounds` is reached with objections still open.

Report the objections and fixes from every round, then the stop reason, before the same `suggest-review.mjs --record` step and human handoff the single-pass review ends with. `publish_to_authoring` still requires the human to ask.

## Record

Only when the plan’s review steps include it:

Before opening an issue, apply this threshold:

- It must be a judgment call, structural question, or future authoring decision that remains after `validate_puzzle_draft` and a careful routine editing pass. Fix mechanical validation failures and ordinary copy defects now instead.
- One issue describes one unresolved pattern or decision. Do not open node-by-node threads for a board-wide concern such as unverified links.
- Resolved work belongs in the completion comment; an open issue is only for work needing a later decision or action.

Open one independent issue for each qualifying concern with `record_agent_puzzle_review action="open"` and non-empty comments. Do not leave a qualifying open concern only in the completion comment.

Call MCP `record_agent_puzzle_review` with its default `action="complete"` only at successful wrap-up, after the current draft is valid. It takes the `draft_id`, an outcome (`unchanged`, `changed`, or `open-questions`), and optional comments limited to the completed review. The server derives the timestamp, draft revision, and guidance version and advances only the agent-review timestamp. It never changes the separate human-review time, which only the authoring-page action records.

For unfinished work—during creation or review—call the same tool with `action="open"` and non-empty comments. It creates a durable unresolved handoff without requiring a valid draft or advancing either review timestamp. `list_puzzle_review_issues` returns only actionable open issues by default; use its returned `issue_id` before `note` or `resolve`. Set `include_resolved: true` only to audit history or select an issue to `reopen`. Do not treat a completed review as resolving an issue.

`suggest-review.mjs --record` remains a local fallback for non-native workflows; do not commit its local log. `--authored` is for author-puzzle, not this skill.

## Context

Canonical source is simplified JSON. Do not hand-edit generated `puzzles/**/*.js`. Prefer aborting over another tool round when the plan has already failed.
