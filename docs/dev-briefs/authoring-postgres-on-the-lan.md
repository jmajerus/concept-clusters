# Authoring on Postgres, D1 for published play

**Status: implemented on the LAN.** Gameplay stays on D1. Working copies are
on Postgres. MCP reaches the LAN server, not the database. The Worker
`/mcp` 410 ships with `npm run mcp:hosted:release`, which has not been run.
Removing the D1 lost-response recovery waits until this path has been quiet.

This is the follow-up to the lost-response work (`d1CommitOutcome.js`, the
revision probe, and the history batch in `0036_puzzle_draft_history_domains.sql`).
Those measures paper over a write that leaves the building and can return
`D1_ERROR: internal error` after the row has committed. The approved fix is
to stop sending authoring writes on that trip.

## Decision

Postgres runs next to the LAN authoring server and is the system of record
for everything not yet player-visible: puzzle drafts and their undo stack,
content drafts, waivers, review, link-check results, the model catalogue,
and site settings.

D1 keeps the player-visible published corpus. Publish is an upsert of that
document, safe to send twice. A failed publish means the person clicks
again. Kinds that the play Worker reads go out in that upsert, not puzzles
alone: `published_documents` for `puzzle`, `catalogue`, and `category`,
plus `published_document_revisions`.

The Cloudflare tunnel, if a remote client needs MCP, terminates at the LAN
server's `/mcp`. Cloudflare Access sits in front of that hostname. The
server checks the same Access token the authoring Worker checks today
(`TEAM_DOMAIN` / `POLICY_AUD`). Workstation stdio does not use the tunnel.
It opens Postgres on the LAN.

Do not put Postgres behind Hyperdrive, and do not expose the database on a
public route. A second program talking to the authoring database is the
duplication `hosted-worker-scope.md` already removed.

## Why this shape

The LAN server is already upstream of git for human edits, and it is the
only place Publish happens. Of 201 stamped MCP writes, 199 arrived over
stdio. Players already read published rows through `src/worker.js` and
`modules/publicPlayService.js`. Narrowing D1 to that read is the cut the
scope brief left open when it said retiring the authoring Worker needed a
tunnel and an Access rework.

D1 has no interactive transaction. Related writes are packed into `batch()`
because that is the only all-or-nothing unit, which is why undo, the draft
update, and the trim share one request. Postgres can lock the draft row,
check `expected_revision`, write the snapshot and the new row, and commit
or roll back. That replaces the hand-built `changes()` guards.

A local commit also removes the usual form of the failure already seen. A
Durable Object reset can commit and then report `internal error`. A LAN
socket that dies is a dropped connection. It is uncommon, and it does not
look like a constraint failure.

## What not to port

Do not preserve `prepare` / `bind` / `batch` as the portability layer. That
interface is how D1 was made to look like a transaction. Carrying it into
Postgres keeps the fiddliness. Each repository method becomes one
transaction.

Leave these behind once the new path is quiet. They exist because the
response and the commit could part company:

- `modules/d1CommitOutcome.js` and the outcome-unknown classification
- the revision probe and its three-attempt budget in `modules/d1DraftRepository.js`
- packing the undo snapshot into the same batch with `changes() = 1`
- the `{}` placeholder in `puzzle_drafts.document`

Keep one narrow behavior through the first quiet period: if the connection
drops, read `revision` (and `content_hash` when the write's identity
matters) before the agent retries. Do not delete that in the same change
that switches databases. Do not rebuild the stamp-matching around
`created_at` and `opened_from_published` unless a real conflict shows up.
More than one writer at a time is not the failure this move is for.

The SQL dialect gap is small. Draft JSON is parsed in JavaScript, and
timestamps are ISO text. What is SQLite-specific is `changes()`, `STRICT`
tables, and the migration files. JSON operators are not the cost. The cost
is moving the rows and deleting the recovery after the new path has been
quiet.

`modules/puzzleDraftStore.js` is the file-backed store used by local tests.
It is not the LAN database. Leave it unless a test cannot express the new
transaction without it.

## Durability

Freeze snapshots git. It does not back up working copies. Those live only
in the authoring database. D1 replicates them today. A Postgres on one
machine does not, until backups exist.

Minimum: a nightly `pg_dump`, kept off that machine. WAL archiving can
wait. The LAN box is already the practical single point of failure for
authoring; this move makes that explicit and adds the dump.

A SQLite file on a network share is not a substitute. Writers sit on the
server and on each workstation. SQLite over a share is unreliable, and it
still lacks the row lock the repository wants.

## MCP

Both transports already share `modules/hostedMcpAuthoringServer.js`.
Stdio is wrapped by `modules/mcpAuthoringServer.js`. The tool surface does
not get a second implementation.

- On the LAN, stdio uses the Postgres repository directly.
- Off the LAN, the client connects to the tunnel hostname. Access
  authenticates. The existing authoring listener already binds every
  interface for the LAN deployment (`modules/localDevHttp.js`).
- The authoring Worker keeps serving `/mcp` until the connector spike
  below has succeeded. Then `/mcp` can leave the Worker. The weekly
  link-health cron (`0 6 * * 1` in `src/authoring-worker.ts`) moves to a
  timer on the LAN server at that point, not before.

## Sequence

Do these in order. The storage work does not start until step 1 has
produced a working sign-in.

1. **Spike the remote client.** A tunnel hostname in front of the LAN
   server's `/mcp`, an Access application, and the same token check the
   Worker performs. Prove the claude.ai connector against that hostname.
   This is the only unknown. Everything after it is ordinary engineering.
2. **Stand up Postgres** on the LAN host. Schema covers the authoring
   tables only. Published player rows stay in D1.
3. **Transactions in the repositories.** Port `D1DraftRepository` and the
   content-document repository so each write is one transaction. The
   draft write locks the row, checks `expected_revision`, inserts the
   undo snapshot from the current domain columns, and updates the draft.
4. **Point the LAN server and stdio at Postgres.** Publish becomes an
   idempotent upsert into D1 `published_documents` for puzzle, catalogue,
   and category. Sending it twice is a no-op when the content hash
   already matches.
5. **Retire the authoring Worker `/mcp`** after the connector from step 1
   is the one people use. Move the link-health cron to a timer. The play
   Worker (`src/worker.js`) stays on D1.
6. **After a quiet period,** remove the outcome-unknown recovery from the
   authoring path. Keep the single disconnect reread until that period
   is over.

## Non-goals

- Moving gameplay reads off D1.
- Hyperdrive, or any public route to Postgres.
- A second authoring Worker that shares the database.
- Rewriting puzzles, or folding this into an in-flight content change.
- Dropping `puzzle_drafts.document` in D1. That column is irrelevant once
  drafts no longer live there.
- Replacing the lost-response recovery before the Postgres path exists.
  It is what makes D1 safe until the cut.

## Read first

- `docs/dev-briefs/hosted-worker-scope.md` — why the LAN server is the
  system of record, and what retiring the Worker requires.
- `docs/dev-briefs/content-as-data.md` — which kinds are working copies
  and which are published rows.
- `modules/d1CommitOutcome.js` and `modules/d1DraftRepository.js` — the
  recovery and the batch this plan replaces.
- `modules/hostedMcpAuthoringServer.js` — the shared MCP surface.
- `modules/publicPlayService.js` and `src/worker.js` — the D1 read that
  stays.
