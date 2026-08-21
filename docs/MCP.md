# MCP authoring server

Concept Clusters includes a local Model Context Protocol server for
AI-assisted puzzle authoring. It exposes semantic validation, durable
drafts, GitHub pull-request publication, and optional transactional
checkout installation over stdio. It does not open a network port.

`document` accepts either format: the simplified schema described in
[SIMPLIFIED-PUZZLE-FORMAT.md](./SIMPLIFIED-PUZZLE-FORMAT.md) (the default,
primary shape for AI-authored input) or full JSON-LD
([JSON-LD.md](./JSON-LD.md), detected by a top-level `@context`). Both
compile down to the same canonical JSON-LD before storage.

The MCP resource
`concept-clusters://schemas/simplified-puzzle-v1` is the complete,
versioned JSON Schema for simplified input. Clients that do not inspect MCP
resources can call `get_authoring_schema` for the same schema as structured
tool output. With no arguments, that tool and `get_authoring_guidance` retain
their complete backward-compatible responses. Passing `phase: "core"`,
`"review"`, `"pedagogy"`, or `"publication"` returns a much smaller working
projection for that pass. A projection is not a standalone format: apply it to
one accumulating draft and preserve fields from every earlier pass.
Draft-write tool schemas intentionally leave `document`
permissive so temporarily invalid drafts and full JSON-LD remain writable;
that permissiveness should not be mistaken for the absence of a field contract.

## Start the server

Two MCP surfaces share these scripts. `mcp` / `mcp:stdio` is the local
stdio server Cursor and Gemini CLI launch. Cursor already starts
`tools/mcp-server.mjs` from `.cursor/mcp.json`; do not start a second
copy by hand. That process is not an HTTP server and is not part of
`npm run dev`. The `mcp:hosted:*` family is the Cloudflare authoring
Worker (Wrangler preview, D1 migrations, deploy).
`mcp:hosted:migrate:dev` is Wrangler's local D1 for that Worker preview —
not the stdio server.

| Script | What it is |
|---|---|
| `mcp` / `mcp:stdio` | Local stdio server (`tools/mcp-server.mjs`). Loads repo-root `.env`. |
| `mcp:hosted:dev` | Hosted authoring Worker on localhost (`http://localhost:8788/mcp`). |
| `mcp:hosted:migrate:dev` | D1 migrations for Wrangler's local database used by `mcp:hosted:dev`. |
| `mcp:hosted:migrate` | D1 migrations on production. |
| `mcp:hosted:deploy` | Deploy the hosted Worker. |
| `mcp:hosted:release` | Production migrate, then deploy. |
| `mcp:hosted:types` | Regenerate Worker TypeScript types. |

From the repository root:

```sh
npm install
npm run mcp
```

An MCP host normally launches this command itself. The process writes protocol
messages only to stdout and diagnostics only to stderr.

Example client configuration:

```json
{
  "servers": {
    "concept-clusters": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/concept-clusters/tools/mcp-server.mjs"
      ]
    }
  }
}
```

The server resolves the repository from its own module location, so the host's
working directory does not matter. It loads gitignored `.env` from that
repository root without overriding variables already present in the process
environment. Put shared stdio secrets there so Cursor, Gemini CLI, and other
MCP clients do not each need a copy. `GEMINI_API_KEY` in the same file is for
Gemini CLI itself, not the MCP server.

Drafts and publication requests live in the same D1 database the hosted
authoring Worker uses. Configure the stdio server environment with:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` (D1 edit on `concept-clusters-authoring`)
- `AUTHORING_OWNER_SUBJECT` (the Cloudflare Access `sub` claim hosted MCP
  uses), or `CF_ACCESS_JWT` so the subject can be read from the token.
  If both are set, they must match.

`CLOUDFLARE_D1_DATABASE_ID` defaults to `wrangler.authoring.jsonc`'s
`AUTHORING_DB` id. Set `GITHUB_TOKEN` (or `GH_TOKEN`) plus
`GITHUB_OWNER`/`GITHUB_REPOSITORY`, or authenticate with `gh` against a
GitHub origin remote, so `submit_puzzle_for_publication` can open pull
requests. `GITHUB_BASE_BRANCH` defaults to `main`.

The optional official MCP Inspector can exercise the tools interactively:

```sh
npx @modelcontextprotocol/inspector \
  node /absolute/path/to/concept-clusters/tools/mcp-server.mjs
```

## Recommended workflow

1. Call `list_categories` to reuse the published taxonomy, then call
   `create_puzzle_draft` with an existing puzzle's document (export it first
   with `npm run content:export`, or build one fresh from a skeleton).
2. Call both authoring tools with `phase: "core"`. Build the identity,
   clusters, terms, facts, bridges, `termRole`, info, links, and citations.
   Capture exact citation details when research finds them; do not defer a
   second search merely to reconstruct their final shape.
3. Save with `replace_puzzle_draft`, passing the current revision.
4. Retrieve that latest accumulated draft, then use `phase: "review"` to check
   ambiguity, redundancy, seeds, bridge necessity, links/citations, and the
   optional bridge relationship fields. Preserve everything not being edited.
5. Repeat that retrieve-preserve-save pattern for `phase: "pedagogy"` and
   `phase: "publication"` when those passes apply. Use `phase: "complete"` (or
   omit `phase`) whenever the full contract or guidance is needed. Phases are
   reusable concern areas, not one-way gates: for example, an author can return
   to `pedagogy` later to add a learning introduction while preserving lenses
   that were already authored.
6. Call `validate_puzzle_draft` and correct every reported error against the
   complete accumulated document.
7. Stop after `validate_puzzle_draft`. Give the human
   `http://127.0.0.1:8787/admin/drafts/<id>` (the page requires `npm run
   dev`). They review design copy there and either click **Open pull
   request** for gameplay review on GitHub or **Install in this checkout**
   to write the working tree without a PR. Do not call
   `submit_puzzle_for_publication` unless they ask you to (catalogue
   extras, the button failed, or the page is unavailable). Merging stays
   a separate human action in GitHub. `preview_repository_import` is
   optional if a client wants to see the affected GitHub paths first.
8. `preview_import` / `install_puzzle` remain for clients that are not
   looking at `/admin/drafts`. That path still requires the unchanged
   draft revision, preview token, and `confirm: true` after explicit
   approval, because it writes the checkout. Do not also call
   `install_puzzle` after they click **Install in this checkout**.

Validation is intentionally available at any point. A stored draft may be
incomplete or temporarily invalid; publication and installation require a
complete valid puzzle.

## Tools

| Tool | Purpose | Repository writes |
|---|---|---|
| `list_puzzles` | List installed puzzles, optionally by category or catalogue | No |
| `list_catalogues` | Discover curated catalogue IDs | No |
| `list_categories` | List categories, slugs, subcategories, and puzzle counts | No |
| `get_category` | Inspect one category and its navigation metadata | No |
| `get_authoring_guidance` | Return complete guidance, or focused core/review/pedagogy/publication guidance | No |
| `get_authoring_schema` | Return the complete simplified-puzzle v1 schema, or a focused phase projection | No |
| `list_puzzle_drafts` | List draft metadata for the configured D1 owner | No |
| `get_puzzle_draft` | Return one draft document and revision | No |
| `create_puzzle_draft` | Persist a supplied document or minimal skeleton | Draft only |
| `replace_puzzle_draft` | Replace a draft with optimistic revision checking | Draft only |
| `validate_puzzle_draft` | Run profile, semantic, lesson, reference, and taxonomy checks | No |
| `preview_repository_import` | Optional: show GitHub pull-request file effects without writing | No |
| `submit_puzzle_for_publication` | Validate and open (or amend) a GitHub pull request | GitHub PR |
| `preview_import` | Plan exact checkout paths plus an approval token | No |
| `install_puzzle` | Apply one approved plan transactionally to this checkout | Yes |

JSON-LD interchange (reading a puzzle/catalogue as portable JSON-LD,
exporting one without writing a file) isn't on this MCP tool surface --
use `npm run content:export`/`content:check` directly; see
[JSON-LD.md](./JSON-LD.md).

Tool results include concise text plus `structuredContent`, allowing an
authoring client to manipulate the document without scraping prose. The MCP
annotations mark discovery, validation, and preview as read-only;
`submit_puzzle_for_publication` is an external create; installation and draft
replacement carry write/destructive hints.

## Draft storage

Stdio MCP is a client of the hosted authoring D1 database, not a second
store. `create_puzzle_draft` / `get_puzzle_draft` / `replace_puzzle_draft`
and `submit_puzzle_for_publication` use `D1DraftRepository` and
`D1PublicationRepository` over Cloudflare's D1 HTTP API. Rows are scoped
to `AUTHORING_OWNER_SUBJECT`, which must be the same Access `sub` hosted
MCP authenticated as, so a Cursor draft is the same row Claude sees.

Git remains the published record. D1 holds unpublished working state,
including `publication_requests` used as the pull-request ledger.

`CONCEPT_CLUSTERS_DRAFT_DIR` remains only as a test/migration remnant.
It is not the default, and it is not a sync path into D1.

While `npm run dev` is running, those same D1 drafts are readable as HTML
at `http://127.0.0.1:8787/admin/drafts`. Worker mode
(`npm run dev -- --worker`) serves the same page from Node in front of
Wrangler. After you review design copy, click **Open pull request** on
that page to open a GitHub PR for gameplay review, or **Install in this
checkout** to write the working tree without a PR. **Uninstall from this
checkout** undoes an uncommitted local install (deletes new files, or
restores the last committed files after a replace). Catalogue extras still
go through the authoring conversation. Corrections still go back through
the authoring conversation, not the page.

`submit_puzzle_for_publication` records `status: "submitted"` on the D1
draft the same way hosted submission does. Checkout install (the drafts
page button or `install_puzzle`) writes the working tree and does not
change D1 status. The Checkout badge looks at
`content/puzzles/<id>.ccpuzzle.json` on disk rather than the in-memory
puzzle list from process start.

## Publication safety

`submit_puzzle_for_publication` uses the same GitHub publication service as
the hosted server: it validates the current draft, commits generated files to
an `authoring/...` branch, and opens or amends a pull request. It never writes
this checkout or the base branch. Local puzzle PRs omit `puzzles/index.js` so
concurrent submissions do not conflict on GitHub; CI and a post-merge sync
register on-disk modules. Resubmitting unchanged content returns the existing
pull request; an edited draft appends a commit to that same PR while it is
still open. Publication request metadata lives in D1 `publication_requests`,
shared with hosted MCP.

`preview_import` / `install_puzzle` remain for clients that are not looking
at `/admin/drafts`. The page button plans and applies in one request.
`preview_import` creates a SHA-256 approval token over:

- every affected repository path;
- each target file's current contents or absence; and
- the exact proposed replacement contents.

`install_puzzle` recreates the plan from the durable draft and supplied
options. It refuses a changed revision, mismatched token, changed target file,
missing `confirm: true`, an unapproved replacement, or invalid puzzle. Once
accepted, it uses the same transactional write and rollback behavior as the
CLI and runs repository validation before declaring success.

The server exposes no arbitrary filesystem path or shell-execution tool.
Learning content in MCP drafts should be embedded as
`learningIntroduction.content.text`; relative `src` imports remain available
to the file-based CLI, where a package directory provides a safe resolution
boundary.

## Shared architecture

The interfaces are deliberately thin:

```text
content-jsonld.mjs ───────┐
                          ├── contentInterchangeService
MCP stdio server ─────────┤   repositoryPublicationService
                          │   githubPublicationService
                          │   D1DraftRepository / D1PublicationRepository
future authoring portal ──┘
```

`modules/contentInterchangeService.js` owns export and validation operations.
`modules/repositoryPublicationService.js` owns deterministic checkout
planning, preconditions, transactional writes, rollback, and live in-process
registry updates. `modules/githubPublicationService.js` owns GitHub
pull-request planning and submission, shared with the hosted Worker.
`modules/httpD1Database.js` is a D1 HTTP binding used by the same
`D1DraftRepository` / `D1PublicationRepository` classes the hosted Worker
binds natively. File-backed `puzzleDraftStore.js` remains a test remnant.
The CLI and MCP server contain only argument/protocol adaptation.

The separate [hosted MCP authoring Worker](MCP-REMOTE.md) is the other
client of that D1 database. Both servers open GitHub pull requests without
writing `main`; merging stays a human action. Stdio MCP is useful for
checkout installation (`install_puzzle`) and the same PR-shaped publication
when a GitHub token is available. Authoring assumes network; there is no
offline draft store.
