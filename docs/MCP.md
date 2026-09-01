# MCP authoring servers

Concept Clusters exposes the same AI-assisted authoring contract over local
stdio and hosted Streamable HTTP. Both surfaces provide published-content
discovery, progressive guidance and schemas, durable drafts, semantic
validation, GitHub pull-request publication, catalogue authoring, and the
bounded pull-request review loop. Local stdio adds transactional checkout
preview and installation; the hosted Worker has no checkout to write.

`document` uses the simplified schema described in
[SIMPLIFIED-PUZZLE-FORMAT.md](./SIMPLIFIED-PUZZLE-FORMAT.md). JSON-LD is an
interchange format, not an authoring or draft-storage format.

The MCP resource
`concept-clusters://schemas/simplified-puzzle-v1` is the complete,
versioned JSON Schema for simplified input. Clients that do not inspect MCP
resources can call `get_authoring_schema` for the same schema as structured
tool output. With no arguments, that tool and `get_authoring_guidance` retain
their complete backward-compatible responses. Passing `phase: "core"`,
`"review"`, `"pedagogy"`, or `"publication"` returns a much smaller working
projection for that pass. A projection is not a standalone format: apply it to
one accumulating draft and preserve fields from every earlier pass.
Draft-write tool schemas intentionally leave `document` permissive so
temporarily invalid simplified drafts remain writable; that permissiveness
should not be mistaken for the absence of a field contract.

## How guidance reaches an agent

The server does not load either authoring document into every conversation. Its initial
MCP instructions are a routing layer that tells the client which focused
material to request:

1. `get_authoring_guidance({ phase: "core" })` supplies the design judgment
   and research concerns needed to establish the puzzle.
2. `get_authoring_schema({ phase: "core" })` supplies the corresponding field
   projection. It is generated from the complete simplified-puzzle schema.
   Call steps 1 and 2 **sequentially** on local stdio — some hosts (notably
   Codex) close the MCP transport if both tools run in parallel.
3. The agent edits one accumulating draft, retrieves its latest revision, and
   preserves fields owned by earlier phases. On Codex, the first
   `create_puzzle_draft` / `save_puzzle_draft` also needs outbound HTTPS to
   `api.cloudflare.com` (D1); approve network when prompted, then retry the
   same save — nothing is persisted until that call succeeds.
4. The same pair is requested with `review`, `pedagogy`, or `publication` only
   when that concern is active. Omitting `phase`, or passing `complete`, returns
   the full fallback payload.
5. `get_workflow_guidance` supplies operational instructions only when the
   agent enters `pull-request-review` or `catalogue` work.
6. `validate_puzzle_draft` evaluates the complete accumulated document rather
   than a phase projection.

`get_authoring_guidance` is served from
`modules/authoringDesignGuidance.js`; `get_authoring_schema` and the schema
resource are served from `modules/authoringSchemaResource.js`. The prose in
`AUTHORING.md` and `AUTHORING-REFERENCE.md` remains the fuller human
explanation and source material for the curated MCP guidance, but it is not
dynamically fetched by either tool.

## Start the server

Two MCP surfaces share these scripts. `mcp` / `mcp:stdio` is the local
stdio server Cursor and Gemini CLI launch. Cursor already starts
`tools/mcp-server.mjs` from `.cursor/mcp.json`; do not start a second
copy by hand. That process is not an HTTP server and is not part of
`npm run dev`. After MCP reloads, Cursor may leave older stdio servers
running; list or prune them with `npm run mcp:housekeep` or
`npm run mcp:prune` (keeps the newest match). Optional automatic pruning
on startup: set `MCP_PRUNE_SIBLINGS=1` in `.env`. The `mcp:hosted:*`
family is the Cloudflare authoring Worker (Wrangler preview, D1
migrations, deploy).
`mcp:hosted:migrate:dev` is Wrangler's local D1 for that Worker preview —
not the stdio server.

| Script | What it is |
|---|---|
| `mcp` / `mcp:stdio` | Local stdio server (`tools/mcp-server.mjs`). Loads repo-root `.env`. |
| `mcp:housekeep` | List stray `mcp-server.mjs` processes for this repo (dry run). |
| `mcp:prune` | Stop extra stdio servers; keep the newest one. |
| `mcp:probe-report` | Summarize captured `probe_mcp_client` call frames. |
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

To capture what each MCP host sends in its call frame, see
[MCP client identity probes](MCP-CLIENT-PROBES.md).

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

1. Call `list_categories` to reuse the published taxonomy. For a new board,
   call `create_puzzle_draft` with a skeleton (`puzzle_id`, `title`,
   `   category`) or a supplied document. To edit a puzzle that predates D1
   drafts, call `create_puzzle_draft` with `seed_from_published: true` and
   that `puzzle_id`, or open it from `/admin/drafts`. Do not open a blank
   skeleton for a live id. You can still pass `get_puzzle`'s document into
   `create_puzzle_draft` if you already have it.
2. Call both authoring tools with `phase: "core"`. Build the identity,
   clusters, terms, facts, bridges, `termRole`, info, links, and citations.
   Capture exact citation details when research finds them; do not defer a
   second search merely to reconstruct their final shape.
3. Save with `save_puzzle_draft`, passing the current revision.
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
7. Stop after `validate_puzzle_draft`. Give the human the local drafts URL
   (`http://127.0.0.1:8787/admin/drafts/<id>` by default, or
   `AUTHORING_DRAFT_REVIEW_URL/<id>` when that env is set). The page is
   served by `npm run dev` against a checkout, so **Play**
   (`/?draft=&view=play`) is a clean player preview of the working copy
   without writing git. **Open board** (`/?draft=`) is Construct. They
   review design copy there, then Play. They click **Publish** to write
   the shared D1 row, then **Cue** that snapshot when it should join the
   next freeze. **Freeze** on `/admin` writes git in this checkout. Do not
   call `submit_puzzle_for_publication` unless they ask you to (catalogue
   extras, or the page is unavailable). `preview_repository_import` is
   optional if a client wants to see the affected GitHub paths first.
8. `preview_import` / `install_puzzle` remain for clients that are not
   looking at `/admin/drafts`. That path still requires the unchanged
   draft revision, preview token, and `confirm: true` after explicit
   approval, because it writes the checkout. Do not call `install_puzzle`
   unless they ask you to.

Validation is intentionally available at any point. A stored draft may be
incomplete or temporarily invalid; publication and installation require a
complete valid puzzle.

## Tools

| Area | Tools | Availability |
|---|---|---|
| Published content | `list_puzzles`, `search_puzzles`, `list_categories`, `get_category`, `get_puzzle`, `list_catalogues`, `get_catalogue` | Both |
| Guidance and contract | `get_authoring_guidance`, `get_authoring_schema`, `get_workflow_guidance` | Both |
| Drafts | `create_puzzle_draft`, `get_puzzle_draft`, `save_puzzle_draft`, `list_puzzle_drafts`, `delete_puzzle_draft` | Both |
| Validation and publication preview | `validate_puzzle_draft`, `preview_repository_import` | Both |
| Puzzle publication | `submit_puzzle_for_publication`, `get_publication_status` | Both |
| Pull-request review | `get_review_feedback`, `apply_review_suggestion`, `reply_to_review_comment`, `resolve_review_feedback`, `sync_review_changes_to_draft`, `complete_review_round`, `reset_review_circuit`, `prepare_human_review_handoff` | Both |
| Catalogue publication | `preview_catalogue_creation`, `create_catalogue`, `preview_update_catalogue`, `update_catalogue` (D1 working copy, then optional GitHub export) | Both |
| Checkout installation | `preview_import`, `install_puzzle` | Local only |
| Compatibility | `replace_puzzle_draft` (deprecated alias for `save_puzzle_draft`) | Local only |

`search_puzzles` covers git, live published D1, and your working copies
(one row per id; a draft overlays the published/git snapshot). Set
`full_text: true` to search facts, lessons, and other prose without a
`text:` prefix. Structured title/term/tag matching stays the default for
gap-fill checks. LAN Library search on `npm run dev` uses the same corpus
and searches prose on every query.

JSON-LD interchange (reading a puzzle/catalogue as portable JSON-LD,
exporting one without writing a file) isn't on this MCP tool surface --
use `npm run content:export`/`content:check` directly; see
[JSON-LD.md](./JSON-LD.md).

Tool results include concise text plus `structuredContent`, allowing an
authoring client to manipulate the document without scraping prose. The MCP
annotations mark discovery and preview as read-only;
`submit_puzzle_for_publication` is an external create; installation and draft
saving carry write hints, while draft deletion and checkout installation carry
destructive hints. Validation records its latest result on a stored draft and
is therefore annotated as a write.

## Draft storage

Stdio MCP is a client of the hosted authoring D1 database, not a second
store. `create_puzzle_draft` / `get_puzzle_draft` / `save_puzzle_draft`
and `submit_puzzle_for_publication` use `D1DraftRepository` and
`D1PublicationRepository` over Cloudflare's D1 HTTP API. Rows are scoped
to `AUTHORING_OWNER_SUBJECT`, which must be the same Access `sub` hosted
MCP authenticated as, so a Cursor draft is the same row Claude sees.

Git remains the published record. D1 holds unpublished working state,
including `publication_requests` used as the pull-request ledger.
`create_puzzle_draft` with `seed_from_published: true` copies a published
(or git-seeded) snapshot into that working state without overwriting an
existing draft.

`CONCEPT_CLUSTERS_DRAFT_DIR` remains only as a test/migration remnant.
It is not the default, and it is not a sync path into D1.

## Authoring workspace

The local drafts server (`npm run dev`) is a checkout-backed workspace:
Install/Uninstall write this tree, and `/admin/drafts` is available on the
LAN if you bind off loopback. Hosted MCP still owns D1 drafts and GitHub
PRs; it has no working tree.

Operational files that used to dirty git (review cadence log, inventories,
split plans, loss ledgers, proposal scratch) live in a data directory
outside version control:

- default: `<repo>/.concept-clusters/authoring/` (already gitignored)
- override: `AUTHORING_DATA_DIR` (a Proxmox volume, NFS share, etc.)

`node tools/authoring-workspace.mjs` prints the resolved paths and the
drafts URL. `suggest-review.mjs --record` writes `review-log.json` there,
migrating the old `.agents/skills/review-puzzle/review-log.json` once if
needed.

A persistent LAN box typically sets:

```
AUTHORING_LISTEN_HOST=0.0.0.0
AUTHORING_DRAFT_REVIEW_URL=http://<lan-host>:8787/admin/drafts
AUTHORING_DATA_DIR=/var/lib/concept-clusters-authoring
```

That bind has no Access gate — treat it as a home-network / VPN service.
Cursor on a laptop should load the same `.env` (or the same
`AUTHORING_DRAFT_REVIEW_URL` / `AUTHORING_DATA_DIR`) so MCP and skill
scripts agree with the box.

While `npm run dev` is running, `/admin` on that server is the authoring
index (drafts, catalogues, categories). Those same D1 drafts are readable as HTML
at `/admin/drafts` (`http://127.0.0.1:8787` by default). Worker mode
(`npm run dev -- --worker`) serves the same page from Node in front of
Wrangler. After you review design copy, **Play** (`/?draft=&view=play`)
is a clean player preview of the working copy; add `&admin` for layout
tools. **Open board** (`/?draft=`) is Construct. **Publish** writes the
shared D1 document. **Cue** that snapshot for the next freeze; **Freeze**
on `/admin` writes git in this checkout (Confirm after the change count). **Uninstall
leftover checkout files** appears when this puzzle’s files differ from git
HEAD. Leaf catalogues are edited at `/admin/catalogues`
(`/?catalogue=&view=author`). **Publish**
there writes D1; **Export to player** is the optional GitHub PR. MCP
`create_catalogue` / `update_catalogue` write the same D1 drafts. Copy can
be edited on the drafts page, or restored to published wording on a marked
change. Structural puzzle changes still go through the construct canvas or
the authoring conversation.

`submit_puzzle_for_publication` still records `status: "submitted"` on the
D1 draft (PR-ledger state). `/admin/drafts` does not show that field, and
it does not show checkout lifecycle (`installed` / `committed` /
`published`). Status is the publish path: **working copy** → **authoring
play** (**held**, **cued**, or **new on next freeze**) → **GitHub
production**. Checkout install (the leftover drafts-page button or
`install_puzzle`) still writes the working tree when used; leftover
uninstall remains a repair action when files differ from git HEAD. The
GitHub column is whether that id is in origin’s `puzzles/manifest.js`
joined with the last freeze patch (add/update minus remove), assuming that
freeze merges. **Refresh from GitHub** on LAN `/admin` fetches origin into
that snapshot without freezing. Freeze still fetches origin; a failed fetch
does not fail the freeze. Hosted `/admin/drafts` stays origin-only until the
merge actually lands.

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
