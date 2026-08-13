# MCP authoring server

Concept Clusters includes a local Model Context Protocol server for
AI-assisted puzzle authoring. It exposes the existing JSON-LD adapters,
semantic validation, durable drafts, preview planning, and transactional
repository publication over stdio. It does not open a network port.

`document` accepts either format: the simplified schema described in
[SIMPLIFIED-PUZZLE-FORMAT.md](./SIMPLIFIED-PUZZLE-FORMAT.md) (the default,
primary shape for AI-authored input) or full JSON-LD
([JSON-LD.md](./JSON-LD.md), detected by a top-level `@context`). Both
compile down to the same canonical JSON-LD before storage.

The MCP resource
`concept-clusters://schemas/simplified-puzzle-v1` is the complete,
versioned JSON Schema for simplified input. Clients that do not inspect MCP
resources can call `get_authoring_schema` for the same schema as structured
tool output. Draft-write tool schemas intentionally leave `document`
permissive so temporarily invalid drafts and full JSON-LD remain writable;
that permissiveness should not be mistaken for the absence of a field contract.

## Start the server

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
working directory does not matter. Set `CONCEPT_CLUSTERS_DRAFT_DIR` in the
server environment to move draft storage elsewhere.

The optional official MCP Inspector can exercise the tools interactively:

```sh
npx @modelcontextprotocol/inspector \
  node /absolute/path/to/concept-clusters/tools/mcp-server.mjs
```

## Recommended workflow

1. Call `list_categories` to reuse the published taxonomy, then call
   `get_puzzle_jsonld` for an existing puzzle, or
   `create_puzzle_draft` for a new skeleton.
2. Call `get_authoring_schema` before constructing or editing the simplified
   document, and `get_authoring_guidance` for design judgment beyond validity.
3. Save revisions with `replace_puzzle_draft`, passing the current revision.
4. Call `validate_puzzle_draft` and correct every reported error.
5. Call `preview_import` with the intended replacement and catalogue options.
6. Present the puzzle, affected paths, and action to the user.
7. Only after explicit approval, call `install_puzzle` with the unchanged
   draft revision, preview token, identical options, and `confirm: true`.

Validation is intentionally available at any point. A stored draft may be
incomplete or temporarily invalid; only preview and installation require a
complete valid puzzle.

## Tools

| Tool | Purpose | Repository writes |
|---|---|---|
| `list_puzzles` | List installed puzzles, optionally by category or catalogue | No |
| `list_catalogues` | Discover curated catalogue IDs | No |
| `list_categories` | List categories, slugs, subcategories, and puzzle counts | No |
| `get_category` | Inspect one category and its navigation metadata | No |
| `get_authoring_guidance` | Return concise authoring considerations, including design judgment beyond schema validity | No |
| `get_authoring_schema` | Return the complete simplified-puzzle v1 JSON Schema and its resource URI | No |
| `get_puzzle_jsonld` | Return one installed puzzle as complete JSON-LD | No |
| `list_puzzle_drafts` | List local draft metadata | No |
| `get_puzzle_draft` | Return one draft document and revision | No |
| `create_puzzle_draft` | Persist a supplied document or minimal skeleton | Draft only |
| `replace_puzzle_draft` | Replace a draft with optimistic revision checking | Draft only |
| `validate_puzzle_draft` | Run profile, semantic, lesson, reference, and taxonomy checks | No |
| `export_puzzle_jsonld` | Return formatted portable JSON-LD without writing a file | No |
| `preview_import` | Plan exact repository effects and issue an approval token | No |
| `install_puzzle` | Apply one approved plan transactionally | Yes |
| `export_catalogue_bundle` | Return a portable bundle or compact manifest | No |

Tool results include concise text plus `structuredContent`, allowing an
authoring client to manipulate the JSON-LD document without scraping prose.
The MCP annotations mark discovery, validation, export, and preview as
read-only; installation and draft replacement carry write/destructive hints.

## Draft storage

Drafts default to:

```text
.concept-clusters/drafts/<draft-id>.json
```

The directory is ignored by Git. Each record contains its document, creation
and update timestamps, and a monotonically increasing revision. Replacement
uses an atomic temporary-file rename and refuses stale expected revisions,
preventing two clients from silently overwriting one another.

Draft IDs are URL-safe slugs and cannot escape the draft directory. Documents
are limited to 2 MiB, matching the interchange CLI limit.

## Publication safety

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
                          │   puzzleDraftStore
future authoring portal ──┘
```

`modules/contentInterchangeService.js` owns export and validation operations.
`modules/repositoryPublicationService.js` owns deterministic planning,
preconditions, transactional writes, rollback, and live in-process registry
updates. `modules/puzzleDraftStore.js` owns durable local drafts. The CLI and
MCP server contain only argument/protocol adaptation.

The separate [hosted MCP authoring Worker](MCP-REMOTE.md) provides
Access-authenticated HTTP tools, D1-backed immutable draft revisions, and an
approval-gated GitHub pull-request adapter. It creates a dedicated branch and
PR from an exact preview and never mutates `main`, deployed Worker assets, or
D1 as though it were the published-content authority. The local server remains
useful for offline work and local repository transactions.
