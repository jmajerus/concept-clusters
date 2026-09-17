# MCP authoring servers

Concept Clusters exposes the same AI-assisted authoring contract over local
stdio and hosted Streamable HTTP. Both surfaces provide published-content
discovery, progressive guidance and schemas, durable drafts, semantic
validation, and catalogue and category authoring. Neither surface writes
git or GitHub directly -- that is Admin Freeze, on the LAN authoring
checkout only.

All live MCP content and taxonomy reads come from published or owner-scoped
D1 rows. Git is an explicit bootstrap/Freeze-import source only; it is never a
silent fallback for `list_*`, `search_puzzles`, `get_*`, resources, validation
membership, or `seed_from_published`.

`document` uses the simplified schema described in
[SIMPLIFIED-PUZZLE-FORMAT.md](./SIMPLIFIED-PUZZLE-FORMAT.md). JSON-LD is an
interchange format, not an authoring or draft-storage format.

Puzzle `category`, `categories[]`, and `subcategories` keys are stable
category ids; category titles are display metadata. MCP draft reads return
those canonical ids as well. The server still reads legacy title references
while the corpus migration is being rolled out, but new clients should always
send ids.

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
Bridge terms have no separate pedagogical-role field; describe their
relationship in `fact`, optional `info`, and (when useful) `relationKind`.
Puzzle attribution uses optional puzzle-level `provenance`; JSON-LD is an
explicit interchange format, not part of the active authoring schema or draft
storage path. Repository-owned timestamps, document revisions, hashes, status,
and lesson-progress fingerprints are supplied by infrastructure and are not
fields an agent has to author.

For smaller authoring payloads, `get_puzzle_draft` and
`save_puzzle_draft` accept `domain: "content"` or `domain: "pedagogy"`.
Content is the core puzzle write surface. Pedagogy is the annotation, learning,
and discovery-metadata write surface and includes content as read-only
`context`. Focused responses omit provenance and system metadata and retain
only the draft id and revision needed for the next save. Omitting `domain`
remains the complete-document compatibility path.

## How guidance reaches an agent

The server does not load either authoring document into every conversation. Its initial
MCP instructions are a routing layer, not a gated workflow. An agent may
research and compose a complete simplified `document`, then call
`create_puzzle_draft` exactly once to store the whole puzzle. It does not need
to call a guidance/schema tool first and does not need a server-side approval
token to create or save a D1 draft.

When a client benefits from smaller focused material, it can instead use the
progressive route:

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
   agent enters `catalogue` work.
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
migrations, deploy). The `authoring:d1:migrate:*` scripts explicitly select
the local or remote D1 database; they are independent of the stdio server.

| Script | What it is |
|---|---|
| `mcp` / `mcp:stdio` | Local stdio server (`tools/mcp-server.mjs`). Loads repo-root `.env`. |
| `mcp:housekeep` | List stray `mcp-server.mjs` processes for this repo (dry run). |
| `mcp:prune` | Stop extra stdio servers; keep the newest one. |
| `mcp:probe-report` | Summarize captured `probe_mcp_client` call frames. |
| `mcp:hosted:dev` | Hosted authoring Worker on localhost (`http://localhost:8788/mcp`). |
| `authoring:d1:migrate:local` | D1 migrations for Wrangler's local database used by `mcp:hosted:dev`. |
| `authoring:d1:migrate:remote` | D1 migrations on the remote authoring database. |
| `mcp:hosted:deploy` | Deploy the hosted Worker. |
| `authoring:deploy` | From this machine, SSH to the LAN authoring server, fast-forward pull `/opt/concept-clusters`, then restart `concept-clusters-authoring.service`. Reads `AUTHORING_DEPLOY_PASSWORD` from the ignored local `.env` for SSH and sudo authentication. |
| `mcp:hosted:release` | Remote D1 migration, then hosted Worker deploy. |
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
`AUTHORING_DB` id. GitHub credentials are used by the LAN Freeze publisher,
not by the MCP tools: configure `GITHUB_TOKEN` (or `GH_TOKEN`) plus
`GITHUB_OWNER`/`GITHUB_REPOSITORY`, or authenticate with `gh` against a
GitHub origin remote, when that checkout will create release pull requests.
`GITHUB_BASE_BRANCH` defaults to `main`.

The optional official MCP Inspector can exercise the tools interactively:

```sh
npx @modelcontextprotocol/inspector \
  node /absolute/path/to/concept-clusters/tools/mcp-server.mjs
```

## Recommended workflow

For a client that asks for confirmation on every write, prefer the one-shot
path: research and compose the complete simplified document, then call
`create_puzzle_draft` once with `draft_id` and `document`. Validate it and
return the draft id and revision for whatever human publication workflow the
team uses. If later revisions are necessary, call `get_puzzle_draft` followed
by one `save_puzzle_draft` using its current revision. The server imposes no
phase gate or approval token on either draft write; any confirmation dialog is
the MCP client’s policy and cannot be overridden by this Worker.

The following progressive workflow remains useful for agents that need it:

1. Call `list_categories` to reuse the published taxonomy when appropriate. A
   genuinely new subject may use a new stable URL-safe category id; publishing
   the puzzle registers it, so do not move it to a parent category merely
   because that id is not listed yet. For a new board,
   call `create_puzzle_draft` with a skeleton (`puzzle_id`, `title`,
   `   category`) or a supplied document. To edit a puzzle that predates D1
   drafts, call `create_puzzle_draft` with `seed_from_published: true` and
   that `puzzle_id`. Do not open a blank skeleton for a live id. You can still
   pass `get_puzzle`'s document into `create_puzzle_draft` if you already have
   it.
2. Optionally call both authoring tools with `phase: "core"`. Build the identity,
   clusters, terms, facts, bridges, info, links, and citations.
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
7. Stop after `validate_puzzle_draft`. MCP has no publication-cue or Freeze
   operation. If explicitly requested, `save_puzzle_draft` accepts
   `publish_to_authoring: true` to promote a confirmed valid save to a held
   D1 authoring snapshot in the same call; it does not Cue that snapshot.
   Set `category` /
   `categories` / `subcategories` on the draft; publication registers each
   referenced category, while `create_category` or `update_category` adds
   optional metadata and subcategory definitions; add or remove catalogue membership with
   `get_catalogue` then `update_catalogue` (or `update_meta_catalogue` for a
   meta catalogue). Those tools accept `publish_to_authoring: true` to
   promote a valid category or catalogue working copy to authoring play in
   the same call. It remains held; only a human Cues and Freezes it.

`preview_import` and `install_puzzle` (checkout installation) were removed:
they wrote the checkout directly, at cross purposes with D1 being the source
of truth. Admin Freeze is now the only thing that writes `puzzles/`,
`catalogues/`, and `content/`.

Validation is intentionally available at any point. A stored draft may be
incomplete or temporarily invalid; D1 authoring publication and LAN Freeze
require a complete valid puzzle.

## Tools

| Area | Tools | Availability |
|---|---|---|
| Published content | `list_puzzles`, `search_puzzles`, `list_categories`, `get_category`, `get_puzzle`, `list_catalogues`, `get_catalogue` | Both |
| Guidance and contract | `get_authoring_guidance`, `get_authoring_schema`, `get_workflow_guidance` | Both |
| Drafts | `create_puzzle_draft`, `get_puzzle_draft`, `save_puzzle_draft` (`publish_to_authoring: true` promotes a valid save to held D1 authoring play; Cue/Freeze remains human-only), `list_puzzle_drafts`, `delete_puzzle_draft` | Both |
| Validation | `validate_puzzle_draft` | Both |
| Categories and catalogues | `create_category`, `update_category`, `preview_catalogue_creation`, `create_catalogue`, `preview_update_catalogue`, `update_catalogue`, `update_meta_catalogue` (`publish_to_authoring: true` promotes a valid write to held D1 authoring play; Cue/Freeze remains human-only) | Both |

`search_puzzles` covers the authoring corpus and your working copies
(one row per id; a draft overlays the active authoring document). Set
`full_text: true` to search facts, lessons, and other prose without a
`text:` prefix. Structured title/term/tag matching stays the default for
gap-fill checks.

JSON-LD interchange (reading a puzzle/catalogue as portable JSON-LD,
exporting one without writing a file) isn't on this MCP tool surface --
use `npm run content:export`/`content:check` directly; see
[JSON-LD.md](./JSON-LD.md).

Tool results include concise text plus `structuredContent`, allowing an
authoring client to manipulate the document without scraping prose. The MCP
annotations mark discovery and preview as read-only; draft saving carries a
write hint, while draft deletion carries a destructive hint. Validation
records its latest result on a stored draft and is therefore annotated as a
write.

## Draft storage

Stdio MCP is a client of the hosted authoring D1 database, not a second
store. `create_puzzle_draft` / `get_puzzle_draft` / `save_puzzle_draft`
use `D1DraftRepository` over Cloudflare's D1 HTTP API. Rows are
scoped to `AUTHORING_OWNER_SUBJECT`, which must be the same Access `sub`
hosted MCP authenticated as, so a Cursor draft is the same row Claude sees.

Published D1 is the runtime record read by both MCP surfaces; D1 also holds
unpublished working state. Git-to-D1 publication is an explicit bootstrap or
Freeze/import step, not a read fallback. `create_puzzle_draft` with
`seed_from_published: true` copies an existing published D1 snapshot into that
working state without overwriting an existing draft. If the D1 row is absent,
the call fails and asks for the explicit bootstrap/import.

`CONCEPT_CLUSTERS_DRAFT_DIR` remains only as a test/migration remnant.
It is not the default, and it is not a sync path into D1.

## Publication boundary

MCP writes D1 working copies and, when explicitly requested, can promote a
valid save to a held published D1 snapshot with
`publish_to_authoring: true`. MCP has no Cue or Freeze operation; those are
human-controlled lifecycle steps outside the protocol. For the separate HTML
authoring workflow, see [AUTHORING.md](AUTHORING.md) and
[CATALOGUES.md](CATALOGUES.md).

## Removed MCP surfaces

`submit_puzzle_for_publication` and `preview_repository_import` -- an
MCP-callable path that opened or previewed a dedicated GitHub pull request
for a single puzzle draft -- were removed once D1 Publish + Cue + Freeze
fully covered a single puzzle draft's path to production too. A human still
initiates the batch release process; no MCP tool opens or
previews a pull request any more.

`preview_import` and `install_puzzle` -- an MCP-callable checkout
install/uninstall path with a deterministic approval fingerprint over the
affected paths, target file state, and proposed contents -- were removed as
cross-purposed with D1 being the source of truth. `repositoryPublicationService.js`
still backs `tools/content-jsonld.mjs`'s `content:import` CLI command (see
[JSON-LD.md](JSON-LD.md)), with the same transactional write, rollback, and
repository-validation behavior; it is just no longer reachable from MCP.

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
                          │   repositoryPublicationService
MCP stdio server ─────────┤   D1DraftRepository
future authoring portal ──┘
```

`modules/contentInterchangeService.js` owns export and validation operations.
`modules/repositoryPublicationService.js` owns deterministic checkout
planning, preconditions, transactional writes, rollback, and live in-process
registry updates, for `tools/content-jsonld.mjs`'s `content:import` --
the MCP server no longer calls it. `modules/httpD1Database.js` is a D1 HTTP
binding used by the same `D1DraftRepository` class the hosted Worker binds
natively. File-backed `puzzleDraftStore.js` remains a test remnant. The CLI
and MCP server contain only argument/protocol adaptation.

The separate [hosted MCP authoring Worker](MCP-REMOTE.md) is the other
client of that D1 database. Neither writes git or GitHub; that is Admin
Freeze, on the LAN authoring checkout only. Authoring assumes network;
there is no offline draft store.
