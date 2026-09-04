# Hosted MCP authoring

Concept Clusters has a separate Cloudflare Worker for authenticated remote
authoring. It complements the local stdio server rather than replacing it:

For instructions on connecting leading chat clients, CLIs, agent platforms,
and model APIs, see
[Connecting AI clients to the hosted MCP server](MCP-CLIENTS.md).

```text
Local stdio MCP ── D1 drafts ── D1 Publish (authoring play) ── Cue + Freeze ── GitHub
Remote HTTP MCP  ── D1 drafts ── D1 Publish (authoring play) ── Cue + Freeze ── GitHub
```

The lifecycle boundary is intentional. Authoring D1 is the source of truth
for play and working copies. Git freeze is a snapshot out of that store.
Authoring D1 seeds published puzzle snapshots from git for LAN play; a
working copy is created when you open a puzzle from `/admin/drafts` or
`create_puzzle_draft` with `seed_from_published`. Production play still
loads git.

A draft is one mutable row: an integer `revision` is an optimistic-concurrency
token for multi-pass saves (`expected_revision` on `save_puzzle_draft`), not a
ledger of old documents. Real publication history is Git, once a Cue and a
Freeze carry a puzzle's authoring-play snapshot into a release pull request.
D1's job is only to hold the current working state of something not yet
frozen.

An agent may compose an entire simplified puzzle and store it in one
`create_puzzle_draft` call. Guidance/schema phases are optional aids, not
server-side gates, and draft create/save have no approval token. A client may
still require a human confirmation for any state-changing MCP call; that is a
client policy (for example, Claude Web’s), outside the Worker’s control.
Publishing to authoring play is opt-in per call (`publish_to_authoring` on
category, catalogue, and puzzle-draft writes) rather than a server-side gate;
the human-only boundary is Cue and Freeze, which is what actually reaches
production.

`document` is the simplified format
([SIMPLIFIED-PUZZLE-FORMAT.md](./SIMPLIFIED-PUZZLE-FORMAT.md)) -- the only
supported authoring shape. A document with a top-level `@context`
(hand-written JSON-LD, [JSON-LD.md](./JSON-LD.md)) is still accepted and
converted as a read-compatibility path, for drafts saved before this was
true, but is not how a new puzzle should be authored. A draft saved with
input that doesn't yet validate is stored exactly as given, not rejected --
consistent with drafts generally being allowed to stay temporarily invalid
between saves.

The MCP resource
`concept-clusters://schemas/simplified-puzzle-v1` exposes the complete,
versioned JSON Schema for simplified input. Clients that do not inspect MCP
resources can call `get_authoring_schema` for the same schema as structured
tool output. The `document` parameters on draft-write tools remain
deliberately permissive so incomplete drafts can still be stored; clients
should use the schema resource or tool, rather than `tools/list` alone, to
discover nested authoring fields such as `bridges[].termRole`.

Both authoring tools accept an optional `phase`: `core`, `review`, `pedagogy`,
`publication`, or `complete`. Omitting it remains equivalent to `complete` for
existing clients. The smaller responses support progressive authoring over one
accumulating draft:

1. `core` establishes identity, clusters, terms, facts, bridges, `termRole`,
   info, verified links, and citations. Record the exact citation object
   `{ title, author?, publisher?, year?, pages?, url? }` when research finds a
   source rather than attempting to rediscover it later.
2. `review` checks ambiguity, redundancy, seed quality, bridge necessity,
   connector/reference classification, sources, and optional relationship
   fields such as `relationKind`, `direction`, and `idealTerms`.
3. `pedagogy` owns lenses and learning introductions. They may be authored at
   different times: revisiting this phase to add a later introduction must
   preserve lenses already present unless they independently need revision.
4. `publication` adds only useful discovery, attribution, and publication
   metadata before validation and submission.

Before every later pass, call `get_puzzle_draft`, edit the latest document, and
preserve all earlier fields when saving. A phase schema is a focused field
projection, not a smaller replacement document or an independent validator;
the complete schema resource remains canonical. Phases can be revisited in any
order when their concern needs further work; they are not one-way lifecycle
gates.

## What is implemented

The remote Worker uses Cloudflare's stateless `createMcpHandler()` with
Streamable HTTP at `/mcp`. It accepts current MCP requests through the
handler's stateless compatibility lane; it does not create MCP Durable Objects
or retain protocol sessions.

The tools are:

| Area | Tools |
|---|---|
| Published content | `list_puzzles`, `search_puzzles`, `list_categories`, `get_category`, `get_puzzle`, `get_catalogue`, `list_catalogues`, `get_authoring_guidance`, `get_authoring_schema`, `get_workflow_guidance` |
| Drafts | `create_puzzle_draft`, `get_puzzle_draft`, `save_puzzle_draft`, `list_puzzle_drafts`, `delete_puzzle_draft` |
| Review | `validate_puzzle_draft`, `preview_catalogue_creation`, `preview_update_catalogue` |
| Categories and catalogues | `create_category`, `update_category`, `create_catalogue`, `update_catalogue`, `update_meta_catalogue` |

Published puzzles, the authoring guidance, and the simplified-puzzle v1 schema
are also available as MCP resources. There is deliberately no arbitrary
filesystem, Git, SQL, or shell tool, and no operation that writes directly to
the base branch.

These tools, their input schemas, result shapes, resources, and server
instructions come from the same registration factory used by local stdio MCP.
The hosted surface differs only in transport, authentication, and analytics.
Neither surface exposes checkout installation any more (`preview_import` /
`install_puzzle` were removed as cross-purposed with D1 being the source of
truth); Admin Freeze is the only thing that writes the checkout.

Design-copy review happens on `/admin/drafts` (same pause as local stdio
MCP). **Publish** on that page writes the shared D1 document; so does
`save_puzzle_draft` with `publish_to_authoring: true` on a confirmed final
edit, in the same call (see below) -- it remains held, not cued for Freeze.
Hosted authoring has no git checkout and does not write the base branch;
this repo does not auto-deploy the player-facing Worker on push. Only LAN
Freeze writes git and opens the release pull request that eventually
reaches production; merging that pull request stays a separate human
action, so Freeze does not update the bundled player by itself.

`list_categories` and `get_category` expose both categories with explicit
registry metadata and categories inferred from published puzzles. Their
summaries include slugs, puzzle counts, and any configured subcategories.

When a draft is the first puzzle in a genuinely new category,
`create_category` registers its metadata (title, introductory `info`, optional
slug, optional subcategory definitions) as a D1 working copy. Set the puzzle
document's `category` to that title. `create_category`, `update_category`,
`create_catalogue`, `update_catalogue`, `update_meta_catalogue`, and
`save_puzzle_draft` accept `publish_to_authoring: true` to promote their
valid D1 working copy in the same call. That publishes it held, never cued:
a human still chooses Cue and Freeze before production.

`create_catalogue` / `preview_catalogue_creation` and their update
counterparts `update_catalogue` / `preview_update_catalogue` likewise treat
the configured GitHub base branch as authority for entry membership and
existing catalogue ids: a puzzle counts if `content/puzzles/<id>.ccpuzzle.json`
exists on that commit, or if it is already registered in `puzzles/index.js`.
Agents linking a catalogue to recently merged puzzles should use known ids
rather than waiting for the Worker-bundled `list_puzzles` snapshot to
redeploy -- this is what makes `update_catalogue` usable to add a puzzle to
a catalogue authored ahead of it, right after the Freeze that includes that
puzzle merges, without an authoring Worker redeploy in between.
`update_catalogue` sends the catalogue's whole
`{id, title, info, entries}` document, not a single-entry patch: it
replaces the entries list wholesale, so an omitted existing entry is
removed and the caller controls ordering directly, the same way replacing
a puzzle document replaces its whole canonical file. `update_meta_catalogue`
is the separate, update-only D1-working-copy path for existing meta catalogues:
it accepts their complete `kind: "meta"` document, where entries are existing
non-meta catalogue ids. It neither creates nor deletes meta catalogues and
does not open a pull request.

The pull request is also the playable review boundary. An author may use its
branch preview to play the exact generated puzzle in every layout and lens
mode before deciding whether to merge it. A pull request that reveals a weak
conceptual or visual result need not be published: close it, delete its branch
if desired, revise the D1 draft, and submit again -- that produces a fresh
pull request, since a closed one no longer counts as open. Resubmitting
*without* closing it first updates the same still-open pull request instead.
The pull-request body records the source D1 draft ID and content hash so the
playable result remains traceable to the reviewed authoring state.

Semantic review and revision proposals do not require additional MCP tools.
The connected model can compose them from `get_puzzle_draft`,
`validate_puzzle_draft`, and `get_authoring_guidance`; `save_puzzle_draft`
remains the deliberate boundary for overwriting the draft's document.

## D1 data model

The tracked D1 migrations create:

- `puzzle_drafts` for owner, status, current document, revision (OCC token),
  content hash, and last validation result; and
- `puzzle_draft_history` for the capped previous-working-copy stack the
  drafts page pops; and
- `content_drafts` for owner-scoped catalogue and category working copies; and
- `published_documents` plus `published_document_revisions` for the shared
  live document of each puzzle, catalogue, or category id; and
- `draft_assistance_stamps` for append-only MCP assistance audit (scope, role,
  date, client system) formerly carried in `generativeAssistance`.

`save_puzzle_draft` requires `expected_revision` matching the draft's current
generation (from `get_puzzle_draft` / `create_puzzle_draft` / `list_puzzle_drafts`).
A matching save replaces the current document and bumps the integer; a stale
token fails closed. Distinct saves push the previous working copy onto a
capped D1 stack (`puzzle_draft_history`). The drafts page
**Revert to last working copy** button pops one save at a time. Set
`publish_to_authoring: true` on a confirmed final edit to also publish the
saved document to authoring play in that same call -- the same D1 write
**Publish** on `/admin/drafts/<id>` performs. Only a valid document
publishes (an invalid one still saves; the response reports why nothing was
published); either way it remains held, not cued for Freeze.
`create_puzzle_draft` does not take this flag -- publish only a document
that has actually been reviewed and saved.

`delete_puzzle_draft` removes a draft's row outright, for cleaning up an
abandoned or test draft.

Draft access is always filtered by the authenticated Access subject. The
application limits hosted draft documents to 1,250,000 bytes, leaving useful
headroom below D1's two-megabyte value and row limit. Binary or unusually
large instructional assets belong in R2 or the repository, not a draft row.

## Reviewing a draft's content before submission

`GET /admin/drafts` (list, most recently updated first) and
`GET /admin/drafts/<id>` (one draft, formatted for reading) render a draft's
actual content as HTML -- clusters, bridges, lenses, related puzzles, and
the full learning introduction text, plus the last `validate_puzzle_draft`
result at the top. Copy can be edited on this page, or restored to
published wording on a marked change. Structural changes still go through
the authoring conversation. The page can POST to **Publish** (shared D1 row),
**Cue** / **Hold**, Revert, withdraw, or delete the working copy. Puzzle
drafts no longer Export or Install. Freeze is LAN `/admin` only. Routes
require the same Cloudflare Access authentication as `/mcp` and are
scoped to the authenticated owner's own drafts, same as every other draft
tool.

The GitHub column is whether that puzzle id is in the base-branch
`puzzles/manifest.js` on GitHub (what the player boots). Hosted authoring
has no Freeze, so it does not join a pending freeze patch; the Worker
fetches that file once per isolate and caches it. LAN `/admin/drafts`
projects origin ∪ the last freeze assuming merge. **Refresh from GitHub**
on LAN `/admin` fetches origin without freezing. A failed fetch omits the
badge instead of claiming every row is out of production. D1 `submitted` is
leftover PR-ledger state from the retired per-puzzle submission path,
unreachable by any current write path, and not shown.

This exists because the pull request is a poor tool for the kind of
review that actually matters most for *copy* -- disagreements concentrate
in prose (facts, term notes, the learning introduction), not board
mechanics the game engine already validates structurally, and reading
prose in a PR diff means checking out the branch and playing through the
puzzle just to proofread text. This page is that copy review. Play is a
clean player preview on the LAN authoring checkout
(`/?draft=&view=play`). LAN **Freeze** on `/admin` is the git ship path: it
creates or updates one release PR from all cued snapshots and accepts optional
human context alongside its generated summary. Cloudflare is production after
that PR merges and deploys. Hosted MCP
instructions match local stdio: after `validate_puzzle_draft` passes, pause,
give the human `/admin/drafts/<id>`, and wait until they have reviewed it.
There is no hosted freeze apply: this Worker has no git working tree. Play
unpublished boards on the LAN box, not here.

## Authoring activity

Every tool call writes one Analytics Engine data point to the `ANALYTICS`
binding (dataset `concept_clusters_authoring_events`), a separate dataset
from the player-facing game Worker's `concept_clusters_events` — same
reasoning as keeping this a separate Worker: different audience, different
risk profile. The wrapper lives in `modules/hostedMcpAuthoringServer.js`
(`track()`), applied uniformly around every registered tool from the outside,
so instrumenting a new tool needs no changes to that tool's own handler.

This is deliberately just a call counter for `mcp_tool_call`, not usage
analytics in the fuller sense: schema (one event type, `mcp_tool_call`) is
`blob1` = event name,
`blob2` = tool name; `blob3` = the requested phase for
`get_authoring_schema`/`get_authoring_guidance` only (omitted phase is recorded
as `complete`); `blob4` = target kind (`puzzle`, `catalogue`, `publication`,
`category`, or `global`); `double1` = 1 (count column). `index1` is the stable
target identifier: puzzle/draft id, catalogue id, publication-request id for
review-only operations, category name, or `global` when the call has no object.
The phase dimension measures retrieval of a phase response, not whether the
agent subsequently followed it or changed a draft. Stable identifiers are used
instead of display titles so analytics remain continuous across title changes.
No actor, outcome, or duration. Per-author and friction/funnel breakdowns
were considered and dropped — at this project's actual scale (one owner
alternating AI/human edits, low call volume) they'd measure a multi-author
audience and a drop-off funnel that don't exist, and a failing tool is
something a person watches happen in the same chat, not something that
needs a dashboard to surface. What's left is the one question that's
actually answerable at this scale: which endpoints get used, and roughly
how often relative to each other. A missing binding or a write failure is a
silent no-op — telemetry must never break an authoring call, matching the
fire-and-forget convention in `modules/analyticsClient.js` and `src/worker.js`.

Successful MCP assistance stamps on `create_puzzle_draft` / `save_puzzle_draft`
also write `authoring_assistance_stamp` rows (`blob1` = event name,
`blob2` = tool, `blob3` = client system, `blob4` = role, `blob5` =
comma-separated scopes, `blob6` = date; `index1` = draft id). That preserves
scope/role/date audit detail after `generativeAssistance` was dropped from stored
drafts. The full record is in D1 table `draft_assistance_stamps` — see
`docs/MCP-CLIENT-PROBES.md`.

`src/admin.js` queries this dataset (same `ACCOUNT_ID`/`API_TOKEN` as the
game Worker's dashboard — reads don't need their own binding) for call counts
by tool, a separate schema/guidance phase breakdown, and activity grouped by
target object, all over the last 30 days. Analytics Engine accepts the
additional blob columns and changed index meaning without a migration. The
object query requires the new target-kind blob, so historical rows whose index
held the tool name are not misreported as objects; older phase rows remain
visible as `legacy (pre-phase)`.

## Local development

This section is the **hosted** authoring Worker running on your machine via
Wrangler. It is not the stdio MCP (`npm run mcp` / `mcp:stdio`) that Cursor
and Gemini CLI launch.

Install dependencies, apply the migration to Wrangler's local D1 database,
and start the authoring Worker:

```sh
npm install
npm run mcp:hosted:migrate:dev
npm run mcp:hosted:dev
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
npm run mcp:hosted:types
npm run typecheck:worker
npm run test:worker
npx wrangler deploy --dry-run -c wrangler.authoring.jsonc
```

The Vitest suite runs inside workerd with an isolated D1 binding and applies
the tracked migrations before each test file.

## Cloudflare Access setup

Do not deploy this write-capable endpoint as a public MCP server.

Unlike D1, the `ANALYTICS` Analytics Engine dataset needs no separate create
step — `analytics_engine_datasets` in `wrangler.authoring.jsonc` is enough;
Cloudflare provisions the dataset on first `writeDataPoint()` call.

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
6. Release the authoring service, then test through MCP Inspector or another
   OAuth-capable client. The release applies every pending D1 migration first
   and deploys the Worker only if migration succeeds:

   ```sh
   npm run mcp:hosted:release
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
editing. Today a draft has a single owner alternating between AI and human
edits. Draft saves use `expected_revision` so a stale multi-pass write cannot
clobber a newer one; publication history still lives in pull-request commits.

## Pull-request review

Freeze's release pull request is the only one this Worker's content
eventually reaches GitHub through. The Content validation workflow runs
structural `npm run validate`, canonical `content:check`, and the authoring
Worker unit suite against it; it does **not** run the full Playwright
browser suite (`npm run test:extended`) on every pull request. Merging
remains a deliberate GitHub review action; neither an MCP tool nor the
Worker can merge a pull request or update `main`.

A future optional MCP diagnostic tool could invoke repository checks
on demand (validate, targeted content:check, quick `npm test`, and optionally
`npm run test:extended`) when
an authoring session hits errors; until then, run those commands locally.

## Continuous deployment

`list_puzzles`, `get_puzzle`, `list_catalogues`, and `get_catalogue` read
`contentService`, which imports `puzzles/index.js` and `catalogues/index.js`
as static ES modules — a snapshot bundled into the Worker at `wrangler
deploy` time. Merging to `main` never refreshes that snapshot by itself.
(`create_catalogue`, `preview_catalogue_creation`, and draft validation don't
have this problem — they resolve puzzle and catalogue ids against the live
GitHub base branch instead, so recently merged puzzles are usable through
those tools immediately, before any redeploy. `update_catalogue` and
`preview_update_catalogue` only get half of that: the entries you submit
resolve against the live GitHub base branch the same way, but which
catalogue ids exist, and their `kind`, still comes from the Worker-bundled
snapshot -- so a catalogue itself needs a redeploy after its own
`create_catalogue` PR merges before `update_catalogue` can find it. In
practice this rarely matters for the catalogue-created-ahead-of-a-puzzle
case: the catalogue is usually created (and its PR merged, redeploying the
snapshot) well before someone comes back to add the puzzle it was waiting
on.)

The [Deploy authoring worker](../.github/workflows/deploy-authoring-worker.yml)
workflow closes that gap: it runs `npm run mcp:hosted:release` on every push
to `main` that touches `puzzles/`, `catalogues/`, `content/`, `modules/`, the
authoring Worker/configuration, or `d1/migrations/`. The release applies
pending D1 migrations before deploying the Worker and stops without deploying
if migration fails. This prevents a new Worker revision from querying columns
that production has not created yet.

It requires two repository secrets:

- `CLOUDFLARE_API_TOKEN` — a **new** token scoped to this Worker and database
  (**Account.Workers Scripts: Edit** and **Account.D1: Edit**; nothing
  broader). Do not reuse or
  widen the analytics-read token used elsewhere in this project.
- `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard URL or
  `npx wrangler whoami`; not secret, but kept alongside the token rather
  than hardcoded in `wrangler.authoring.jsonc`.

Add both under Settings → Secrets and variables → Actions before merging any PR
that changes `puzzles/`, `catalogues/`, `content/`, `modules/`, or the authoring
worker, or the workflow will fail closed with an auth error rather than deploy
with excess permission.
