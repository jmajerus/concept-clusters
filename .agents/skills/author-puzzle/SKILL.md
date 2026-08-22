---
name: author-puzzle
description: Author a Concept Clusters puzzle using simplified JSON, a prose-first blueprint, one comparable puzzle, and local MCP validation. Use when explicitly asked to author, draft, write, or create a puzzle, or when .ccpuzzle.json, clusters, bridges, or lenses are mentioned.
disable-model-invocation: true
---

# Author a Concept Clusters puzzle

Use the repository's local stdio MCP against the same D1 drafts as the hosted
authoring MCP. Publication opens a GitHub pull request; it does not write this
checkout or `main`.

## Do not load

Do not read these unless blocked on a specific field or error:

- `docs/AUTHORING.md`, `docs/MCP.md`, `docs/MCP-REMOTE.md`, `docs/MCP-CLIENTS.md`
- `modules/starRenderer.js` or other engine files
- both a `.ccpuzzle.json` source and its generated `puzzles/**/*.js` module
- this conversation's OAuth or MCP-client history

## Do load

1. This skill, then [design judgment](references/design-judgment.md).
2. Category names from `puzzles/categories.js` (`CATEGORIES` keys). Reuse an existing category.
3. **One** similar `content/puzzles/<id>.ccpuzzle.json` as a template. Match structure, not term count.
4. [docs/SIMPLIFIED-PUZZLE-FORMAT.md](../../../docs/SIMPLIFIED-PUZZLE-FORMAT.md) only for a field not already known.

Canonical source is simplified JSON. Generated `puzzles/<category-slug>/<id>.js`
is derived; do not hand-edit it.

## Workflow

### 0. Choose the subject immediately

If the user already named a domain, title, or id, use that.

If they did not, do not ask, wait, or browse the catalogue. Run this once and
treat the JSON as the agreed category:

```sh
node .agents/skills/author-puzzle/scripts/suggest-subject.mjs
```

That picks a registered category in the lowest third of puzzle counts and an
emptiest subcategory when the category uses them. Invent a specific subject
that belongs in that category and is not in `existing`. Do not author a survey
of the whole category. Use `comparable` as the one template file. State the pick
in one sentence, then write the blueprint.

Do not call MCP `list_puzzles`, `list_categories`, or `get_authoring_guidance`
for this default subject-selection step.

### 1. Lock the domain in prose first

Before any JSON, write a short blueprint. Do not wait for confirmation unless
the user's named domain is ambiguous. Include:

- working `id` (kebab-case) and `title`
- existing `category`, and subcategory only if that category uses them
- 2-6 clusters: name, distinction, why its two seeds are the most recognizable terms, and 1-4 floating terms
- each bridge and why the connection is real, or state that there are none
- lenses only if the pedagogy needs them; do not default to three

Size clusters, bridges, and lenses by distinct concepts. Equal term counts are
common here and prove nothing; check for duplicate jobs and facts that name a
concept missing from the terms. If the honest board is 17-24 nodes, set
`large: true`; do not drop a distinct term to stay under 16.

### 2. Draft into local MCP

Prefer the local `concept-clusters` stdio MCP when its tools are available:

- Call `get_authoring_guidance` with `phase: "core"`, then `"review"`, then
  `"pedagogy"` only when lenses or a learning introduction are in play. Do not
  request `"complete"` or dump the full schema up front.
- Use `create_puzzle_draft` and `replace_puzzle_draft` with the accumulating
  simplified document: `id`, `title`, `category`; clusters with `name`, `fact`,
  exactly two `seeds`, and 1-4 `floatingTerms`; bridges referencing cluster
  **ids**, not indexes. Follow [design judgment](references/design-judgment.md).
- Do not also write `content/puzzles/<id>.ccpuzzle.json` by hand on this path;
  the draft is the source.

If MCP tools are missing, write `content/puzzles/<id>.ccpuzzle.json` directly.
Copy structure from the comparable puzzle, not filler fields.

### 3. Validate, then pause for `/admin/drafts`

- Call `validate_puzzle_draft`. Fix errors; treat non-blocking flags as checks
  to apply, not automatic failures.
- Record the pass at the current guidance version so corpus review does not
  treat this puzzle as unreviewed:

```sh
node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

  Overwrite the same id if a later correction in this pass re-validates. Do not
  commit the log unless the user asks.
- Once validation passes, stop. Do not call `submit_puzzle_for_publication` in
  this turn.
- Give the user `http://127.0.0.1:8787/admin/drafts/<draftId>` (or the list at
  `http://127.0.0.1:8787/admin/drafts`). The page needs `npm run dev`; say when
  it is not running.
- End the turn and wait. The user reviews design copy there, then asks for
  corrections, opens a pull request, installs the puzzle locally, or uninstalls
  an uncommitted local install. Corrections use `replace_puzzle_draft`, followed
  by validation, another `--record <id> --authored`, and another pause.
- Call `submit_puzzle_for_publication` only when the user asks, such as for
  catalogue extras, a failed button, or an unavailable page. Merging remains a
  separate human action. `preview_repository_import` is optional.
- Local puzzle PRs omit `puzzles/index.js`; CI registers the module after merge.
- `install_puzzle` is for clients not using `/admin/drafts`: call
  `preview_import`, then `install_puzzle` only after explicit approval with
  `confirm: true`. Do not also call it after the page button was used.

If MCP tools are missing, materialize the module and stop:

```sh
node .agents/skills/author-puzzle/scripts/materialize.mjs <id>
npm run validate
node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

`materialize.mjs` writes `puzzles/<category-slug>/<id>.js` and registers it in
`puzzles/index.js`. Do not also run JSON-LD `content:import` on this file. Then
open a branch and pull request from the working tree.

### 4. Ship for human review

After the user opens the pull request from `/admin/drafts`, or asks for MCP
submission, return its URL. If they installed in this checkout instead, do not
also open a pull request unless asked. Do not also commit checkout files or run
`gh pr create`. Review-loop tools are hosted-only in this repository slice.

## Context discipline

Local MCP is efficient for guided validation. Use the conversation for the
disciplined core draft: prose, one template JSON, draft creation, and
validation. Opening the pull request, installing, or uninstalling the checkout
is normally a button on `/admin/drafts`. Do not paste `AUTHORING.md` or the full
schema into context.
