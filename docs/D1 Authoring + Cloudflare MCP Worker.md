# D1 Authoring + Cloudflare MCP Worker

**A Cloudflare-hosted MCP server is feasible now, and it is a natural point to introduce database-backed drafts—but a database is not required merely to expose MCP.**

The key distinction is:

- **MCP transport:** does not require a database.
- **Persistent remote authoring:** probably should use one.
- **Simultaneous real-time collaboration:** eventually benefits from Durable Objects.

## What the Worker would require

Cloudflare currently recommends new MCP servers use a **stateless Streamable HTTP handler** created with `createMcpHandler()`. A Durable Object is no longer required merely to maintain MCP protocol sessions. Cloudflare’s older `McpAgent` approach is deprecated for new servers. ([developers.cloudflare.com](https://developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/?utm_source=chatgpt.com))

I would deploy a separate Worker:

```text
concept-clusters.jmajerus.workers.dev
    Public game, analytics and admin

concept-clusters-authoring.jmajerus.workers.dev/mcp
    Authenticated MCP authoring service
```

It could be added to the existing Worker, but a separate Worker is cleaner because the authoring service would have:

- OAuth endpoints;
- GitHub credentials;
- write-capable tools;
- database bindings;
- MCP SDK dependencies;
- a different security and deployment profile.

The existing Worker currently serves assets and routes only `/api/*` and `/admin*` through Worker code. Adding MCP to it would require routing `/mcp` and the OAuth-related paths through the Worker as well.

## The existing importer cannot run unchanged inside a Worker

The JSON-LD adapters and semantic validator are strong candidates for direct reuse. The command-line publication workflow is not.

`tools/content-jsonld.mjs` currently uses:

- `node:fs`;
- directory traversal;
- file writes and rollback;
- `spawnSync()` to run repository validation;
- direct editing of JavaScript registries and catalogue files.

Workers now have a virtual filesystem, but bundled files are read-only and writable `/tmp` files are ephemeral to the Worker invocation. Also, `node:child_process` remains a nonfunctional stub rather than a usable process runner. ([Cloudflare Docs](https://developers.cloudflare.com/workers/runtime-apis/nodejs/fs/?utm_source=chatgpt.com))

Therefore, the remote service should reuse:

```text
puzzleJsonLd.js
catalogueJsonLd.js
jsonLdProfile.js
contentValidation.js
```

but replace filesystem publication with a remote publication adapter.

## Recommended publication model

I would keep GitHub—not D1—as the canonical publication system for built-in content.

```text
MCP authoring client
        ↓
Cloudflare MCP Worker
        ↓
D1 draft and revision storage
        ↓
Submit for publication
        ↓
GitHub branch and pull request
        ↓
GitHub Actions runs:
  content:check
  content:import
  npm run validate
  npm test
        ↓
Merge and normal Worker deployment
```

This is much safer than allowing a running Worker to alter its own deployed static assets.

Cloudflare static assets are uploaded as part of a Worker deployment and form a deployed unit with the Worker code; they are not a mutable repository filesystem available to requests. ([Cloudflare Docs](https://developers.cloudflare.com/workers/static-assets/?utm_source=chatgpt.com))

The MCP publication tool should therefore be named something like:

```text
submit_puzzle_for_publication
```

rather than:

```text
publish_directly_to_main
```

It would create a branch or pull request containing the JSON-LD source and generated changes—or preferably let CI generate the compatibility files from the JSON-LD document.

## Is this where to add a database?

### No database is needed for a limited MCP server

The first remote MCP server could be entirely stateless and expose:

```text
list_puzzles
get_puzzle_jsonld
export_catalogue_bundle
validate_jsonld
normalize_jsonld
preview_import
```

It could read the currently deployed puzzle registry and validate documents supplied in each tool call.

A one-shot GitHub publication tool could also work without a database if it accepts the complete JSON-LD document and immediately opens a pull request.

### A database is appropriate for actual authoring

Because your goal is reducing the effort of iterative puzzle authoring, I would introduce **D1 at the same time as the useful write-capable MCP server**.

Without persistent draft storage, the AI client must repeatedly carry the complete puzzle document in its conversation context. That creates risks:

- losing work between sessions;
- overwriting a newer edit;
- no revision history;
- no way for the visual portal and MCP client to share a draft;
- no clear review and publication state.

D1 is Cloudflare’s managed serverless SQL database and is directly accessible to Workers through a binding. It uses SQLite semantics and is suitable for structured records such as drafts, revisions, users and publication requests. ([Cloudflare Docs](https://developers.cloudflare.com/d1/worker-api/?utm_source=chatgpt.com))

A minimal schema could be:

```sql
CREATE TABLE puzzle_drafts (
    id TEXT PRIMARY KEY,
    puzzle_id TEXT,
    owner_subject TEXT NOT NULL,
    title TEXT,
    status TEXT NOT NULL,
    head_revision INTEGER NOT NULL,
    base_commit_sha TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE puzzle_draft_revisions (
    draft_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    document_jsonld TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    validation_json TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (draft_id, revision),
    FOREIGN KEY (draft_id) REFERENCES puzzle_drafts(id)
);

CREATE TABLE publication_requests (
    id TEXT PRIMARY KEY,
    draft_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL,
    github_pr_number INTEGER,
    requested_at TEXT NOT NULL
);
```

Every update should include an expected revision:

```json
{
  "draftId": "draft-123",
  "expectedRevision": 7,
  "document": {}
}
```

An update succeeds only if revision 7 is still current. Otherwise, the tool reports a conflict instead of silently overwriting revision 8.

## One storage caveat

The current Concept Clusters importer limits JSON-LD documents to two megabytes. D1 also has a two-megabyte maximum for a string, BLOB or row. ([Cloudflare Docs](https://developers.cloudflare.com/d1/platform/limits/))

Those equal limits leave no practical headroom for database overhead or future expansion.

I would therefore:

- store ordinary JSON-LD puzzle drafts in D1;
- impose a lower database document limit, perhaps 1–1.5 MB;
- store binary assets and unusually large instructional resources in R2;
- keep only resource references and metadata in D1.

R2 is Cloudflare’s object storage product and is intended for larger unstructured objects; Cloudflare describes R2 objects as strongly consistent per object. ([Cloudflare Docs](https://developers.cloudflare.com/workers/platform/storage-options/?utm_source=chatgpt.com))

## Where Durable Objects enter

Do **not** introduce Durable Objects merely because the service uses MCP.

Cloudflare explicitly distinguishes stateless request handling from stateful coordination. Durable Objects are intended for cases where multiple clients must coordinate around shared state, such as collaborative editors, chat rooms and multiplayer systems. ([Cloudflare Docs](https://developers.cloudflare.com/durable-objects/?utm_source=chatgpt.com))

A sensible progression is:

```text
Phase 1
MCP + D1
Persistent drafts, revision history, optimistic concurrency

Phase 2
Visual portal + D1
Autosave, validation, preview and publication workflow

Phase 3
Durable Object per active draft
Live presence, WebSockets and simultaneous collaborative editing
```

For one author editing through one AI client or browser at a time, D1 with optimistic concurrency is enough.

When two people or an AI and a human need to edit the same puzzle simultaneously, a Durable Object keyed by draft ID can coordinate the live session:

```text
Durable Object: draft-123
    ├── connected editor A
    ├── connected editor B
    ├── current operation stream
    └── durable SQLite state
```

D1 can remain the global index and revision archive, while the Durable Object manages the active collaboration session.

## Authentication is mandatory

A write-capable MCP server should not be publicly accessible.

Remote MCP authorization uses OAuth. Cloudflare supports using Cloudflare Access, GitHub, Google or another OAuth provider, and its OAuth Provider Library handles the MCP authorization surface. ([Cloudflare Docs](https://developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/?utm_source=chatgpt.com))

For the initial owner-only service, Cloudflare Access would be attractive:

```text
Allowed identity:
    your email address

MCP scopes:
    puzzles:read
    drafts:write
    publication:submit
```

The existing admin-key mechanism is adequate for a private dashboard but is not the best authorization model for remote MCP clients. The MCP server should know the authenticated user identity and enforce tool-level permissions.

## Initial MCP tool surface

I would keep it focused:

### Read-only

```text
list_puzzles
get_puzzle
get_catalogue
get_authoring_guidance
```

### Drafts

```text
create_puzzle_draft
get_puzzle_draft
save_puzzle_draft
list_puzzle_drafts
compare_draft_revisions
```

### Validation

```text
validate_puzzle_draft
preview_repository_import
```

### Publication

```text
submit_puzzle_for_publication
get_publication_status
```

The server should not expose arbitrary filesystem, shell, Git or SQL tools. Cloudflare likewise recommends a small number of tools designed around user goals rather than simply wrapping an entire underlying API. ([Cloudflare Docs](https://developers.cloudflare.com/agents/model-context-protocol/?utm_source=chatgpt.com))

## Concrete implementation work

The first hosted version would require:

1. Extract runtime-neutral validation and import-planning functions from `tools/content-jsonld.mjs`.
2. Add a `DraftRepository` interface.
3. Implement `D1DraftRepository`.
4. Implement a GitHub publication adapter that opens a branch and pull request.
5. Create a new Cloudflare Worker using `createMcpHandler()`.
6. Add Cloudflare Access or OAuth Provider authentication.
7. Register the focused MCP tools and JSON-LD resources.
8. Add D1 migrations and Wrangler bindings.
9. Test through MCP Inspector and add tool-use evaluation tests.
10. Configure GitHub Actions to run the existing import and validation pipeline on publication PRs.

Cloudflare’s current stateless handler uses the new MCP server package, whose v2 line is still beta; Cloudflare advises using the exact MCP package version required by the installed Agents SDK release. ([Cloudflare Docs](https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/?utm_source=chatgpt.com))

## My recommendation

Implement the hosted service as:

```text
Separate authenticated Cloudflare MCP Worker
        +
D1 for drafts and immutable draft revisions
        +
GitHub pull requests for publication
        +
Existing static Worker for the player
```

Do **not** add Durable Objects yet. Add them when the authoring portal genuinely supports concurrent editing.

This introduces the database at the point where it solves a concrete problem—durable shared authoring state—without prematurely replacing GitHub or the static application as the publication architecture.

------

**An all-or-nothing migration would add risk without solving the immediate authoring problem.** The cleanest transition is hybrid, divided by the **lifecycle of the content**, not arbitrarily by which puzzle happens to live where.

## Recommended boundary

```text
D1
  Drafts
  Draft revisions
  Authors and permissions
  Validation reports
  Review state
  Publication requests

Git / repository
  Approved published JSON-LD
  Catalogue definitions
  Versioned schemas and contexts
  Generated compatibility modules
  Static offline release

Static Worker assets
  Player-facing published content
```

That preserves the strengths of the existing architecture while giving the MCP server and authoring portal durable working storage.

Your implemented JSON-LD design already describes the current milestone as an interchange boundary around a static, offline-capable runtime, and explicitly defers database-backed identity and revisions. There is no need to overturn that boundary merely to introduce D1.

## Avoid two authoritative copies

A hybrid design is safe only when each kind of state has **one clear authority**.

For example:

| Content state                  | Authority                 |
| ------------------------------ | ------------------------- |
| Unpublished working draft      | D1                        |
| Immutable draft revision       | D1                        |
| Pending review                 | D1                        |
| Published puzzle source        | Git JSON-LD               |
| Runtime JavaScript module      | Generated artifact        |
| Deployed player content        | Worker static assets      |
| Published-content search index | Rebuildable D1 projection |

The problematic arrangement would be:

```text
Puzzle A in Git is authoritative
Puzzle B in D1 is authoritative
Puzzle C exists in both and might differ
```

That creates conditional code paths, ambiguous updates, and difficult backup and recovery rules.

The cleaner arrangement is:

```text
All drafts live in D1
All published releases live in Git
```

A puzzle moves between lifecycle stages through an explicit publication operation.

## The publication transition

A draft could follow this process:

```text
D1 draft revision 12
        ↓
Validate using existing shared validator
        ↓
Generate canonical JSON-LD
        ↓
Open GitHub pull request
        ↓
Run repository import and validation
        ↓
Merge
        ↓
Deploy static release
        ↓
Mark D1 revision as published
```

The D1 record should retain:

- the published Git commit SHA;
- pull request number;
- published puzzle version;
- publication timestamp;
- the exact content hash of the JSON-LD document.

That gives the database a durable link to the authoritative published artifact without making D1 another competing publication source.

## First migration phase: additive D1

Initially, add D1 without migrating any existing puzzle content into it.

Possible tables:

```sql
puzzle_drafts
puzzle_draft_revisions
validation_runs
publication_requests
authors
```

Existing repository puzzles continue working exactly as they do now.

The MCP server can:

- create a draft from nothing;
- import an existing puzzle export into a draft;
- revise and validate it;
- submit it for publication;
- reopen a published puzzle as a new draft.

This immediately addresses iterative authoring while avoiding any player-facing migration.

D1 supports versioned SQL migration files through Wrangler, so the database schema itself can remain tracked alongside the application code. ([Cloudflare Docs](https://developers.cloudflare.com/d1/reference/migrations/?utm_source=chatgpt.com))

## Second phase: derived published-content index

Later, D1 could hold a **rebuildable index** of published content:

```sql
published_puzzles
published_categories
published_catalogue_entries
published_concepts
```

That would support:

- portal search;
- filtering by creator, category, license, or source;
- concept reuse analysis;
- detecting related puzzles;
- MCP discovery tools;
- catalogue management.

But this index would initially be a projection of Git JSON-LD, not its replacement:

```text
Git JSON-LD
    ↓ synchronize
D1 published-content index
```

If the index becomes corrupted or stale, it can be regenerated from the repository.

This is a useful safety distinction:

> **The D1 draft store is primary data. The early D1 publication index is derived data.**

## Third phase: migrate built-in source to JSON-LD

This is separate from adopting D1.

The repository currently has:

- legacy built-in puzzles whose source remains JavaScript;
- imported puzzles whose canonical source is JSON-LD and whose JavaScript module is generated.

You can gradually migrate the legacy built-ins to canonical repository JSON-LD without making them database-resident:

```text
Legacy JavaScript source
        ↓ one-time export and review
Canonical Git JSON-LD
        ↓ generation
Compatibility JavaScript module
```

That would unify the published source format while D1 handles authoring workflow.

## When D1 might become authoritative for published content

A later all-database publication model may become worthwhile if the project needs:

- immediate publication without a Git merge and redeployment;
- per-user or private catalogues;
- frequently changing public content;
- server-side content queries at player runtime;
- tenant-specific puzzle libraries;
- localization edited continuously;
- database-managed moderation and approvals.

At that stage:

```text
D1 published revision
        ↓
JSON-LD export and archival snapshot
        ↓
Player API or generated static release
```

could become the main model.

Even then, I would preserve periodic JSON-LD exports in Git or object storage. D1 can be exported as SQL, supports import/export tooling, and provides automatic point-in-time recovery through Time Travel, but none of those replaces a portable, content-level JSON-LD archive. ([Cloudflare Docs](https://developers.cloudflare.com/d1/best-practices/import-export-data/?utm_source=chatgpt.com))

## Data that does not belong in D1

Do not force every artifact into relational storage.

Keep these outside D1:

- images;
- large instructional assets;
- downloadable bundles;
- generated screenshots;
- static application files.

D1 limits an individual string, BLOB, or row to 2 MB. ([Cloudflare Docs](https://developers.cloudflare.com/d1/platform/limits/?utm_source=chatgpt.com)) Large resources should use R2 or remain packaged in the repository, with D1 storing references and metadata.

Ordinary puzzle JSON-LD could fit in D1, but storing each revision as a single JSON document should use a lower application limit to leave headroom.

## A useful repository abstraction

Introduce a storage interface now:

```js
class DraftRepository {
  async create(document, actor) {}
  async get(draftId) {}
  async save(draftId, document, expectedRevision, actor) {}
  async list(query) {}
  async revisions(draftId) {}
}
```

Implementations:

```text
InMemoryDraftRepository       tests
LocalDraftRepository          browser/local development
D1DraftRepository             hosted MCP and portal
```

Published content gets a different interface:

```js
class PublishedContentRepository {
  async listPuzzles() {}
  async getPuzzle(id) {}
  async submitRevision(document, metadata) {}
}
```

Initially, that implementation is Git-backed. Keeping draft storage and publication storage separate prevents a future database decision from leaking through the entire application.

## The staged path

I would use this progression:

1. **Add D1 for drafts and revisions only.**
2. Connect the remote MCP server to those drafts.
3. Add publication through GitHub pull requests.
4. Add the visual portal over the same draft service.
5. Build a disposable D1 index of published repository content.
6. Convert remaining JavaScript-authored puzzles to canonical Git JSON-LD.
7. Reevaluate whether published content should ever move from Git to D1.

D1 is designed for incremental schema evolution through migrations and can be developed locally through Wrangler before applying those migrations remotely. ([Cloudflare Docs](https://developers.cloudflare.com/d1/reference/migrations/?utm_source=chatgpt.com))

## Bottom line

**Do not perform a big-bang file-to-D1 migration.**

Use a lifecycle split:

> **D1 is the authoring workspace. Git JSON-LD is the published record. Generated files are the runtime distribution.**

That solves the immediate need for persistent, AI-accessible, portal-accessible drafts while preserving version control, reviewability, portability, and the offline player. It also leaves open a later move to database-authoritative publication without committing the project to it prematurely.

## Implementation status

The first additive phase is implemented. A separate
`concept-clusters-authoring` Worker uses the current stateless MCP handler,
validates Cloudflare Access JWTs, and stores owner-scoped drafts plus immutable
revisions in D1. The runtime-neutral repository contract has in-memory and D1
implementations, and the existing local stdio server remains available for
offline authoring.

The hosted tool surface includes published-content discovery, draft creation
and revision, comparison, validation, exact repository-import previews,
approval-gated GitHub pull-request submission, and PR status reconciliation.
The adapter binds approval to a base commit and generated file bytes, creates
only dedicated review branches, and cannot merge or update `main`. Durable
Objects and published-content migration remain deferred.

Setup, security boundaries, commands, and exact tools are documented in
[`MCP-REMOTE.md`](MCP-REMOTE.md).
