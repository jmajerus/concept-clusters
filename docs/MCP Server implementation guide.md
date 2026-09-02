# MCP Server implementation guide

The repository already has:

- JSON-LD puzzle export and import;
- portable catalogue bundles and manifest export;
- `content:check`, `content:export`, and `content:import` commands;
- stable cluster and bridge identities;
- reference-based bridge direction and ideal terms;
- shared semantic validation in `modules/contentValidation.js`;
- locally shipped context and JSON Schemas;
- preservation of provenance and namespaced extensions;
- generated compatibility JavaScript modules;
- automatic `puzzles/index.js` registration;
- optional catalogue registration;
- dry-run publication;
- transactional writes with rollback when repository validation fails.

The package scripts confirm that the interchange pipeline is already part of the working toolchain. The importer writes the canonical document under `content/puzzles/`, generates the runtime module, registers a new puzzle, optionally adds a catalogue entry, validates the repository, and restores the original files on failure.

## Revised understanding of the remaining problem

The repository-side manual effort is already largely solved:

```text
One JSON-LD puzzle document
             ↓
npm run content:import
             ↓
canonical source + runtime module + registry + catalogue
```

What remains burdensome is **constructing and revising that complete JSON-LD document**. That makes the immediate need an authoring client, not another interchange pipeline.

## This strengthens the MCP opportunity

An MCP server no longer needs to invent the JSON-LD model or publication workflow. It can expose the existing system almost directly:

```text
AI authoring client
        ↓ MCP
Concept Clusters authoring service
        ↓
existing JSON-LD adapters
shared semantic validator
transactional repository importer
```

A useful initial tool set could now be quite small:

```text
list_puzzles
get_puzzle_jsonld
create_puzzle_draft
save_puzzle_draft
validate_puzzle_draft
export_puzzle_jsonld
preview_import
install_puzzle
export_catalogue_bundle
```

The JSON-LD document itself can be the principal structured value passed between the client and server.

## The next engineering step

Rather than have the MCP server invoke the command-line script as a subprocess, I would extract the reusable operations currently embedded in `tools/content-jsonld.mjs`:

```text
modules/contentInterchangeService.js
modules/repositoryPublicationService.js
```

For example:

```js
export async function exportPuzzle(id, options) {}
export async function validateJsonLdDocument(document, options) {}
export async function planPuzzleImport(document, options) {}
export async function applyPuzzleImport(plan, options) {}
```

Then the interfaces become thin adapters:

```text
content-jsonld.mjs ───────┐
                          │
local authoring portal ───┼── shared services
                          │
MCP server ───────────────┘
```

The current CLI already contains the required logic, but argument parsing, filesystem work, publication planning, output formatting, and process exit behavior are combined in one file. Separating those responsibilities would allow MCP and the browser portal to reuse the implementation safely.

## A particularly useful MCP workflow

An AI client could perform:

1. `get_puzzle_jsonld` for an existing puzzle, or `create_puzzle_draft`.
2. Modify the complete document in memory.
3. `validate_puzzle_draft`.
4. Correct reported semantic errors.
5. `preview_import` to receive the exact affected repository paths.
6. Present the proposed puzzle and publication effects to you.
7. Call `install_puzzle` only after explicit approval.

That last separation maps naturally to the importer’s existing `--dry-run` and transactional publication behavior.

## Revised priority

The project is therefore closer than I thought:

1. Extract the existing JSON-LD and publication logic into reusable services.
2. Add a local `stdio` MCP server over those services.
3. Add durable local draft storage.
4. Build the visual authoring portal using the same services.
5. Later replace local draft storage with PostgreSQL and expose remote authenticated MCP.

So the answer remains yes, but for a stronger reason: **the JSON-LD implementation has already supplied nearly the entire domain boundary an MCP server needs.** The MCP server can now focus on making that working interchange and publication system available to AI-assisted authoring, rather than waiting for foundational content work.

## Implementation status

Implemented in August 2026. The CLI now delegates to
`contentInterchangeService.js` and `repositoryPublicationService.js`; the local
stdio adapter in `mcpAuthoringServer.js` exposes the proposed tool set plus
draft discovery tools. Durable drafts use revision-aware atomic local files.

The approval boundary is stronger than the initial sketch: `preview_import`
hashes the exact paths, original file state, and proposed contents.
`install_puzzle` requires that token, the unchanged draft revision, identical
options, and `confirm: true`, then rechecks file preconditions before the
transaction. The server updates its in-memory puzzle/catalogue view after a
successful installation, so a long-running authoring session does not require
a restart.

Full setup, tool contracts, storage behavior, and client configuration are in
[`MCP.md`](MCP.md).

The later [D1 and Cloudflare Worker addendum](D1%20Authoring%20%2B%20Cloudflare%20MCP%20Worker.md)
supersedes the tentative PostgreSQL direction. The local adapter remains, and
a separate Access-protected hosted adapter now uses D1 for unpublished drafts
while Git remains the published authority. See [MCP-REMOTE.md](MCP-REMOTE.md).
