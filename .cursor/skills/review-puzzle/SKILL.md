---
name: review-puzzle
description: Reviews published Concept Clusters puzzles against current design judgment (trap words, seeds, distinctness, termRole, lenses, optional bridge fields). Use when asked to review existing puzzles, run a corpus pass, or apply current authoring goals to puzzles created earlier.
disable-model-invocation: true
---

# Review a published Concept Clusters puzzle

Re-examine published puzzles against design judgment that was not in effect (or not enforced) when they were authored. Hard validation already gates the corpus; this pass may change the board (terms, seeds, facts, bridges, lenses) and add annotations only where they clearly fit. Unset is a valid outcome. Publication opens a **replace** GitHub pull request; it does not write this checkout or `main`.

Work in **comprehensive chunks of 2–3 puzzles**, one puzzle to pause before starting the next. Do not run corpus-wide thin phases (all `termRole`, then all lenses). Board edits interact; reopening each puzzle once is cheaper than once per concern.

## Do not load

Do not read these unless you are stuck on a specific field or error:

- `docs/AUTHORING.md`, `docs/MCP.md`, `docs/MCP-REMOTE.md`, `docs/MCP-CLIENTS.md`
- `modules/starRenderer.js` or other engine files
- both a `.ccpuzzle.json` source and its generated `puzzles/**/*.js` module
- this conversation's OAuth / MCP-client history

The review log is the corpus map (when each puzzle last had a pass, at which major/minor guidance version). Do not add a flag-census tool. Existing reports only: that log, authoring flags on the draft after validate, `npm run content:stats`, admin Stats.

## Do load

1. This skill, then [design-judgment.md](../author-puzzle/design-judgment.md).
2. The published document for **this** puzzle only (see Load below).
3. [docs/SIMPLIFIED-PUZZLE-FORMAT.md](../../../docs/SIMPLIFIED-PUZZLE-FORMAT.md) only for a field you do not already know.

Canonical source is simplified JSON. Generated `puzzles/<category-slug>/<id>.js` is derived; do not hand-edit it on this path.

## Do not treat omission as a gap

Leave `relationKind`, `direction`, `idealTerms`, `learningIntroduction`, `level`, and `relatedPuzzles` unset unless the current board clearly warrants them. Do not add them for coverage. Do not manufacture bridges to connect the graph. Do not equalize or un-equalize counts for catalogue aesthetics. A “looked, no change” result is still a pass: record it with `--unchanged`.

The relationKind catalog pilot is not the model here: that pass left facts alone. `termRole` can force a term rewrite (a proper-noun connector must be rephrased). Duplicate-job, trap-word, and lens-padding checks are whole-board judgments.

## Workflow

### 0. Pick 2–3 ids

Do not browse or remember the last chunk. Run this once and treat the JSON `picks` as the chunk:

```sh
node .cursor/skills/review-puzzle/scripts/suggest-review.mjs
```

If the user asked for a **dry run**, add `--dry-run`. That prints the proposed chunk plus the due map and writes nothing. State the picks and stop: do not load a draft, record a pass, or open a PR. `--record --dry-run` shows the log entry that would be written without writing it.

If the user named a **category or subcategory slug**, pass it (`--category biology`, `--category biology --subcategory genomics`). If they named ids, use those (cap at three) even when the log says they are current. Do not call `list_puzzles` / `list_categories` merely to browse. Do not regenerate a puzzle from a blank blueprint.

The picker reads [review-log.json](review-log.json) against `AUTHORING_GUIDANCE_VERSION` in [`modules/authoringGuidanceVersion.js`](../../../modules/authoringGuidanceVersion.js). A puzzle is **due** when it has no pass, or when its recorded **major** version is lower than the current major (`stale`). Matching major stays current when minor moves. Puzzles already current are skipped unless the user named them. `--due` prints that map for a filter without picking.

Bump **major** when the review bar changes (design judgment or validation that existing puzzles should be re-checked). Bump **minor** when guidance is clarified without changing that bar. Do not bump for typos.

State the picks in one sentence, then load the first id. The first empty-log chunk mixes one `.js`-only puzzle, one flagged puzzle, and one recent canonical puzzle so the rubric can be locked before continuing.

Do not record a pass at pick time. Recording means the review happened.

### 1. Load, do not regenerate

**Prefer local stdio MCP** (`concept-clusters-local` / `npm run mcp`) if its tools are actually available.

Seed `create_puzzle_draft` with the published document (`draft_id` = puzzle `id`):

- If `content/puzzles/<id>.ccpuzzle.json` exists, pass that object. Do not also read the generated `.js`.
- If it does not, export JSON-LD and pass that (MCP accepts it):

```sh
npm run content:export -- <id> --output -
```

Do not also write `content/puzzles/<id>.ccpuzzle.json` by hand; the draft is the source. First replace publication lazily writes the canonical file for `.js`-only puzzles.

`get_authoring_guidance` with `phase: "review"`, then `"pedagogy"` only if lenses or a learning introduction actually need work. Do not request `"complete"` or dump the full schema up front. Follow [design-judgment.md](../author-puzzle/design-judgment.md). Retrieve the draft before each save; preserve every field you are not improving.

**If MCP tools are missing**, edit the published source in place (`content/puzzles/<id>.ccpuzzle.json`, or the `.js` module when that is still the source). Then `npm run validate` and open a replace PR of the working tree. Do not also run JSON-LD `content:import` on a file you already edited.

### 2. Review the whole board

Apply the review checklist to this puzzle as it stands. Fix structural issues in the same pass as any annotations those fixes make true:

- Ambiguity / trap words; redundant terms doing the same conceptual job; a cluster fact that names a concept missing from its terms; seed recognizability; whether each bridge is necessary. If validation flags more than 16 nodes, set `large: true` rather than dropping a distinct term; split only above 24.
- `termRole` (connector vs reference); help grain (omitting a link means no chip)
- `relationKind` / `direction` / `idealTerms` only when they clearly fit; leave unset when they do not
- Lenses only if the pedagogy needs a change. Fit the lesson to a learning objective, preferably a genuine cross-cut. Reinforcing is valid when that is the honest question. Include every term that answers the question; omit every term that does not. Do not concatenate a second clause to look cross-cutting. Flags catch a whole-cluster recitation (or that cluster plus every touching bridge), not omitted answers — still apply the keep-every-answer check.
- Publication metadata only for a real discovery fix, never as a coverage pass

### 3. Validate, then pause for `/admin/drafts`

- `validate_puzzle_draft`. Fix errors; treat non-blocking flags as checks to apply, not auto-fail.
- Record the pass in the log (this checkout; the drafts PR does not include it):

```sh
node .cursor/skills/review-puzzle/scripts/suggest-review.mjs --record <id>
```

Use `--unchanged` when the board did not change, `--authored` when recording a newly authored puzzle (author-puzzle does this). Overwrite the same id if a later correction in this pass re-validates. Do not commit the log unless the user asks.
- Once it passes, **stop**. Do not call `submit_puzzle_for_publication` in this turn.
- Give the user the drafts page `http://127.0.0.1:8787/admin/drafts/<draftId>` (list: `http://127.0.0.1:8787/admin/drafts`). That page needs `npm run dev`; if it is not running, say so. It is the human authoring surface, not this skill: they can change any field for any reason. Until in-page editing exists, corrections still go through `replace_puzzle_draft`. The page highlights divergences from the published puzzle (amber edit, green added, struck red removed, with “was:” for the published text).
- The drafts page treats an already-published id as an update of those files. They click **Open pull request** or **Install in this checkout**; there is no separate replace checkbox.
- End the turn and wait. Then start the next id in the chunk.
- Do not call `submit_puzzle_for_publication` unless the user asks you to (catalogue extras, the button failed, or the page is unavailable). Merging stays a separate human action. `preview_repository_import` is optional, not a precondition.
- One puzzle per PR. Do not batch unrelated puzzles into one PR.
- `install_puzzle` remains for clients that are not looking at `/admin/drafts`: `preview_import` with `replace: true`, then `install_puzzle` after explicit approval (`confirm: true`, `replace: true`). Do not also call it after they click **Install in this checkout**.

### 4. Ship for human review

After the user opened the pull request from `/admin/drafts` (or asked you to submit and `submit_puzzle_for_publication` ran), return its URL. If they installed in this checkout instead, do not also open a PR unless they ask. Do not also commit checkout files or run `gh pr create`. Review-loop tools (`get_review_feedback` and friends) are hosted-only in this slice.

## Tools vs tokens

Local MCP is cheaper for guided validate. This chat is cheaper for a disciplined pass over one loaded document. Opening the pull request, installing, or uninstalling this checkout is a button on `/admin/drafts`. Do not paste `AUTHORING.md` or the full schema into context.
