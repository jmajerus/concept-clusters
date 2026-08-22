---
name: author-puzzle
description: Authors a Concept Clusters puzzle using simplified JSON, a prose-first blueprint, one comparable puzzle, and local MCP validation. Use when asked to author, draft, write, or create a puzzle; when hosted MCP is unavailable; or when .ccpuzzle.json, clusters, bridges, or lenses are mentioned.
disable-model-invocation: true
---

# Author a Concept Clusters puzzle

This is the Cursor fallback when the hosted authoring MCP (Claude + Cloudflare Access) is unavailable. It uses local stdio MCP against the same D1 drafts hosted MCP uses. Publication opens a GitHub pull request; it does not write this checkout or `main`.

## Do not load

Do not read these unless you are stuck on a specific field or error:

- `docs/AUTHORING.md`, `docs/MCP.md`, `docs/MCP-REMOTE.md`, `docs/MCP-CLIENTS.md`
- `modules/starRenderer.js` or other engine files
- both a `.ccpuzzle.json` source and its generated `puzzles/**/*.js` module
- this conversation's OAuth / MCP-client history

## Do load

1. This skill, then [design-judgment.md](design-judgment.md).
2. Category names from `puzzles/categories.js` (`CATEGORIES` keys). Reuse an existing category.
3. **One** similar `content/puzzles/<id>.ccpuzzle.json` as a template. Match structure, not term count.
4. [docs/SIMPLIFIED-PUZZLE-FORMAT.md](../../../docs/SIMPLIFIED-PUZZLE-FORMAT.md) only for a field you do not already know.

Canonical source is simplified JSON. Generated `puzzles/<category-slug>/<id>.js` is derived; do not hand-edit it.

## Workflow

### 0. Choose the subject immediately

If the user already named a domain, title, or id, use that.

If they did not, **do not ask, wait, or browse the catalogue**. Run this once and treat the JSON as the agreed category:

```sh
node .cursor/skills/author-puzzle/scripts/suggest-subject.mjs
```

That picks a registered category in the lowest third of puzzle counts (and an emptiest subcategory when the category uses them). Invent a **specific** subject that belongs in that category and is not in `existing`. Do not author a survey of the whole category. Use `comparable` as the one template file. State the pick in one sentence, then write the blueprint.

Do not call MCP `list_puzzles` / `list_categories` / `get_authoring_guidance` for this default path.

### 1. Lock the domain in prose first

Before any JSON, write a short blueprint (do not wait for confirmation unless the user's named domain is ambiguous):

- working `id` (kebab-case) and `title`
- existing `category` (and subcategory only if that category uses them)
- 2–6 clusters: name, what distinguishes it, why its two seeds are the most recognizable terms, 1–4 floating terms
- each bridge: why the connection is real (or state that there are none)
- lenses only if the pedagogy needs them; do not default to three

Size clusters, bridges, and lenses by distinct concepts. Equal term counts are common here and prove nothing; check for duplicate jobs and facts that name a concept missing from the terms. If the honest board is 17–24 nodes, set `large: true`; do not drop a distinct term to stay under 16.

### 2. Draft into local MCP

**Prefer local stdio MCP** (`concept-clusters-local` / `npm run mcp`) if its tools are actually available:

- `get_authoring_guidance` with `phase: "core"`, then `"review"`, then `"pedagogy"` only if lenses or a learning introduction are in play. Do not request `"complete"` or dump the full schema up front.
- `create_puzzle_draft` / `replace_puzzle_draft` with the accumulating document in the simplified format (`id`, `title`, `category`; clusters with `name`, `fact`, exactly two `seeds`, 1–4 `floatingTerms`; bridges that reference cluster **ids**, not indexes). Follow [design-judgment.md](design-judgment.md).
- Do not also write `content/puzzles/<id>.ccpuzzle.json` by hand on this path; the draft is the source.

**If MCP tools are missing**, write `content/puzzles/<id>.ccpuzzle.json` yourself. Copy structure from the comparable puzzle, not filler fields.

### 3. Validate, then pause for `/admin/drafts`

- `validate_puzzle_draft`. Fix errors; treat non-blocking flags as checks to apply, not auto-fail.
- Record the pass at the current guidance version so corpus review will not treat this puzzle as unreviewed:

```sh
node .cursor/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

Overwrite the same id if a later correction in this pass re-validates. Do not commit the log unless the user asks.
- Once it passes, **stop**. Do not call `submit_puzzle_for_publication` in this turn.
- Give the user the draft review URL `http://127.0.0.1:8787/admin/drafts/<draftId>` (list: `http://127.0.0.1:8787/admin/drafts`). That page needs `npm run dev`; if it is not running, say so.
- End the turn and wait. The user reviews design copy on that page, then either asks for draft corrections, clicks **Open pull request** (gameplay review on GitHub), clicks **Install in this checkout** to play it locally without a PR, or clicks **Uninstall from this checkout** to undo an uncommitted local install. Corrections go through `replace_puzzle_draft`, then validate, `--record <id> --authored` again, and pause again.
- Do not call `submit_puzzle_for_publication` unless the user asks you to (catalogue extras, the button failed, or the page is unavailable). Merging stays a separate human action. `preview_repository_import` is optional, not a precondition.
- Local puzzle PRs omit `puzzles/index.js`; CI registers the module after merge.
- `install_puzzle` remains for clients that are not looking at `/admin/drafts`: `preview_import`, then `install_puzzle` after explicit approval (`confirm: true`). Do not also call it after they click **Install in this checkout**.

**If MCP tools are missing**, materialize the module and stop:

```sh
node .cursor/skills/author-puzzle/scripts/materialize.mjs <id>
npm run validate
node .cursor/skills/review-puzzle/scripts/suggest-review.mjs --record <id> --authored
```

`materialize.mjs` writes `puzzles/<category-slug>/<id>.js` and registers it in `puzzles/index.js`. Do not also run JSON-LD `content:import` on this file. Then open a branch/PR of the working tree.

### 4. Ship for human review

After the user opened the pull request from `/admin/drafts` (or asked you to submit and `submit_puzzle_for_publication` ran), return its URL. If they installed in this checkout instead, do not also open a PR unless they ask. Do not also commit checkout files or run `gh pr create`. Review-loop tools (`get_review_feedback` and friends) are hosted-only in this slice.

## Tools vs tokens

Local MCP is cheaper for guided validate. This chat is cheaper for a disciplined core draft: prose, one template JSON, write the draft, validate outside the model. Opening the pull request, installing, or uninstalling this checkout is a button on `/admin/drafts`. Do not paste `AUTHORING.md` or the full schema into context.
