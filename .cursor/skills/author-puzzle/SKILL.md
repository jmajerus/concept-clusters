---
name: author-puzzle
description: >-
  Authors a Concept Clusters puzzle into the git working tree using the
  simplified JSON format, a prose-first blueprint, one comparable existing
  puzzle, and local validation. Use when the user asks to author, draft,
  write, or create a puzzle in this Cursor chat; when Claude authoring
  credits are exhausted; when the hosted authoring MCP is unavailable; or
  when they mention .ccpuzzle.json, clusters, bridges, or lenses.
---

# Author a Concept Clusters puzzle

This is the Cursor fallback when the hosted authoring MCP (Claude + Cloudflare Access) is unavailable. It writes the repo, not D1 drafts.

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

### 1. Lock the domain in prose first

Before any JSON, write a short blueprint and wait if the domain is not already agreed:

- working `id` (kebab-case) and `title`
- existing `category` (and subcategory only if that category uses them)
- 2–6 clusters: name, what distinguishes it, why its two seeds are the most recognizable terms, 1–4 floating terms
- each bridge: why the connection is real (or state that there are none)
- lenses only if the pedagogy needs them; do not default to three

Size clusters, bridges, and lenses by distinct concepts. Equal term counts are common here and prove nothing; check for duplicate jobs and facts that name a concept missing from the terms.

### 2. Draft the JSON

Write `content/puzzles/<id>.ccpuzzle.json` in the simplified format (`id`, `title`, `category`; clusters with `name`, `fact`, exactly two `seeds`, 1–4 `floatingTerms`; bridges that reference cluster **ids**, not indexes). Follow [design-judgment.md](design-judgment.md).

A minimal shape is in `docs/SIMPLIFIED-PUZZLE-FORMAT.md`. Copy structure from the comparable puzzle, not filler fields.

### 3. Materialize and validate

**Prefer local stdio MCP** (`concept-clusters` / `npm run mcp`) if its tools are actually available in this session:

- `get_authoring_guidance` with `phase: "core"`, then `"review"`, then `"pedagogy"` only if lenses or a learning introduction are in play. Do not request `"complete"` or dump the full schema up front.
- `create_puzzle_draft` / `replace_puzzle_draft` with the accumulating document.
- `validate_puzzle_draft`. Fix errors; treat non-blocking flags as checks to apply, not auto-fail.
- `preview_import`, then `install_puzzle` **only after the user approves** the preview.

Do **not** call hosted tools (`submit_puzzle_for_publication`, D1 draft APIs) from this path. Hosted MCP is a different lifecycle (Access OAuth, D1, GitHub PRs that omit `puzzles/index.js`).

**If MCP tools are missing**, keep the canonical JSON and materialize the module:

```sh
node .cursor/skills/author-puzzle/scripts/materialize.mjs <id>
npm run validate
```

`materialize.mjs` writes `puzzles/<category-slug>/<id>.js` and registers it in `puzzles/index.js`. Do not also run JSON-LD `content:import` on this file.

### 4. Ship for human review

Open a branch/PR of the working tree. This path is not `submit_puzzle_for_publication`.

## Tools vs tokens

Local MCP is cheaper for guided validate/install. This chat is cheaper for a disciplined core draft: prose, one template JSON, write JSON, validate outside the model. Do not paste `AUTHORING.md` or the full schema into context.
