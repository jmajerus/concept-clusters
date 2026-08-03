# Hosted MCP authoring

Concept Clusters has a separate Cloudflare Worker for authenticated remote
authoring. It complements the local stdio server rather than replacing it:

```text
Local stdio MCP ── local JSON drafts ── approval-gated local repository import

Remote HTTP MCP ── D1 drafts/revisions ── approval-gated GitHub pull requests
```

The lifecycle boundary is intentional. D1 is authoritative for unpublished
working drafts and immutable revisions. Git JSON-LD remains authoritative for
published built-in content, and generated JavaScript remains a runtime
artifact. Existing player-facing content is not migrated into D1.

## What is implemented

The remote Worker uses Cloudflare's stateless `createMcpHandler()` with
Streamable HTTP at `/mcp`. It accepts current MCP requests through the
handler's stateless compatibility lane; it does not create MCP Durable Objects
or retain protocol sessions.

The tools are:

| Area | Tools |
|---|---|
| Published content | `list_puzzles`, `list_categories`, `get_category`, `get_puzzle`, `get_catalogue`, `get_authoring_guidance` |
| Drafts | `create_puzzle_draft`, `get_puzzle_draft`, `save_puzzle_draft`, `list_puzzle_drafts`, `compare_draft_revisions` |
| Review | `validate_puzzle_draft`, `preview_repository_import` |
| Publication | `submit_puzzle_for_publication`, `get_publication_status` |

Published puzzles and the authoring guidance are also available as MCP
resources. There is deliberately no arbitrary filesystem, Git, SQL, or shell
tool, and no operation that writes directly to the base branch.

`preview_repository_import` validates a selected immutable revision, reads the
configured base commit from GitHub, generates every proposed file, and returns
an approval token over the options, base SHA, old bytes, and new bytes. It does
not write the repository. `submit_puzzle_for_publication` recreates that plan
and accepts it only with the same immutable revision, options, token, and
`confirm: true`.

`list_categories` and `get_category` expose both categories with explicit
registry metadata and categories inferred from published puzzles. Their
summaries include slugs, puzzle counts, and any configured subcategories.

When a draft is the first published puzzle in a genuinely new category,
`preview_repository_import` may include `new_category` with the category name,
introductory `info`, an optional slug, and optional subcategory definitions.
The puzzle must belong to that category. The category registry change and the
puzzle files are then generated as one plan, covered by one approval token,
and reviewed in one pull request. Existing categories cannot be re-registered
through this option; later taxonomy edits belong in a separate category-change
workflow.

An accepted submission creates one `authoring/...` branch, one commit based on
the approved tree, and one pull request. Repeating the same approved call
returns the existing publication request. `get_publication_status` reconciles
open, merged, and closed-unmerged pull requests into D1. Git remains the
published-content authority.

## D1 data model

The tracked D1 migrations create:

- `puzzle_drafts` for owner, status, and head metadata;
- `puzzle_draft_revisions` for immutable JSON-LD snapshots and SHA-256 hashes;
- `validation_runs` for revision-specific reports; and
- `publication_requests` for approval tokens, base commits, branches, commits,
  pull requests, retry state, and reconciliation.

Every save supplies `expected_revision`. D1 atomically inserts the next
revision and advances the head only when the expected head still matches.
A stale editor receives a conflict containing the current revision instead of
silently overwriting another edit.

Draft access is always filtered by the authenticated Access subject. The
application limits hosted JSON-LD documents to 1,250,000 bytes, leaving useful
headroom below D1's two-megabyte value and row limit. Binary or unusually
large instructional assets belong in R2 or the repository, not a draft row.

## Local development

Install dependencies, apply the migration to Wrangler's local D1 database,
and start the authoring Worker:

```sh
npm install
npm run mcp:remote:migrate:local
npm run mcp:remote:dev
```

The endpoint is `http://localhost:8788/mcp`. Localhost alone may use the
explicit `AUTHORING_DEV_SUBJECT` from `wrangler.authoring.jsonc`, so MCP
Inspector can connect without an external OAuth round trip. That bypass cannot
activate on a non-local hostname.

For local publication calls, put `GITHUB_TOKEN` in the ignored `.dev.vars`
file. Discovery, draft, and validation tools can still run without making a
GitHub request.

Run the Worker-specific verification with:

```sh
npm run mcp:remote:types
npm run typecheck:worker
npm run test:worker
npx wrangler deploy --dry-run -c wrangler.authoring.jsonc
```

The Vitest suite runs inside workerd with an isolated D1 binding and applies
the tracked migration before each test file.

## Cloudflare Access setup

Do not deploy this write-capable endpoint as a public MCP server.

1. Create the authoring D1 database and update its binding in the isolated
   configuration:

   ```sh
   npx wrangler d1 create concept-clusters-authoring \
     --binding AUTHORING_DB --update-config \
     -c wrangler.authoring.jsonc
   ```

2. Create an Access application for the authoring hostname and restrict it to
   the intended author identity. For MCP clients, configure Cloudflare's MCP
   Managed OAuth/AI Controls flow for that application.
3. Create a fine-grained GitHub personal access token scoped only to
   `jmajerus/concept-clusters`, with **Contents: read and write** and **Pull
   requests: read and write**. It does not need Administration, Actions, or
   Workflows permission. A GitHub App installation token can replace this
   bootstrap credential later without changing the publication boundary.
4. Store it as an encrypted Worker secret, never in the repository:

   ```sh
   npx wrangler secret put GITHUB_TOKEN -c wrangler.authoring.jsonc
   ```

5. In `wrangler.authoring.jsonc`, verify:

   - `AUTHORING_HOSTNAME` with the exact public Worker/custom hostname;
   - `TEAM_DOMAIN` with the full `https://<team>.cloudflareaccess.com` URL; and
   - `POLICY_AUD` with the Access application's audience tag;
   - `GITHUB_OWNER` and `GITHUB_REPOSITORY` with the publication repository;
   - `GITHUB_BASE_BRANCH` with the protected review target.

   These are identifiers, not credentials. OAuth client secrets, GitHub
   tokens must use Wrangler secrets and must never be committed.
6. Apply the tracked migration, deploy, and test through MCP
   Inspector or another OAuth-capable client:

   ```sh
   npm run mcp:remote:migrate
   npm run mcp:remote:deploy
   ```

The Worker independently verifies every `Cf-Access-Jwt-Assertion` against the
team's rotating remote JWK set, issuer, and application audience before it
constructs the MCP server or D1 repository. The Access subject becomes the
draft owner. Missing or invalid tokens fail closed.

## Why this is a separate Worker

[`wrangler.authoring.jsonc`](../wrangler.authoring.jsonc) deploys
`concept-clusters-authoring` independently of the player Worker. The authoring
service has D1, authentication, write-capable tools, MCP dependencies, and a
different risk profile; none of those bindings or routes are added to the
public game Worker.

Durable Objects are deferred until the visual portal needs live simultaneous
editing. D1 optimistic concurrency is sufficient for alternating AI and human
editing today.

## Pull-request review

The adapter uses GitHub's Git data API so all generated files land in one
commit derived from the approved tree. The tracked Content validation workflow
checks canonical JSON-LD, repository invariants, browser behavior, and Worker
integration for affected pull requests. Merging remains a deliberate GitHub
review action; neither the MCP tool nor the Worker can merge a pull request or
update `main`.
