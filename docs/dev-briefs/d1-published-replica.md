# D1 as a published replica

**Status: implemented on the LAN.** Postgres is the published corpus the
LAN reads and writes. D1 is a replica the authoring server drains when the
network is up. The public play Worker still reads D1. Step 6, removing the
authoring server's leftover direct published-row writes after a quiet
period, has not been done. Run `npm run authoring:postgres:copy` once
before serving, so the live D1 corpus is the first Postgres fill. A later
copy does not replace rows Postgres has since published.

## Decision

Postgres on the LAN is the system of record for the published corpus.
Publish, unpublish, and layout save commit there and return. LAN play,
Freeze, and the drafts page read those rows. The authoring server starts
and serves that work with D1 unreachable.

D1 keeps a replica of the current public rows. The public play Worker
(`src/worker.js`, `modules/publicPlayService.js`) keeps reading D1. Sync
is one-way, LAN to D1, and runs when the network is up. Public players
lag until the drain succeeds. The publish result says so.

The replica is the current row, not the authoring history. One pending
sync per kind and id is enough: a later edit replaces the earlier one.
The upsert stays the existing content-hash publish, so sending the same
row twice is a no-op.

## What the replica holds

Only what the public index and the public puzzle route read:

- the current `puzzle`, `catalogue`, and `category` documents
- the puzzle layout
- the withdrawn flag
- `firstPublishedAt`, `publishedAt`, `contentRevisedAt`, and the content hash
- the site settings included in the public index

A puzzle goes out with the categories it references and the catalogues
that include it, as one generation. The public site must not show a
puzzle whose category has not arrived, or a catalogue that still lists a
puzzle withdrawn in the same generation.

## What stays on the LAN

Review stamps, published-revision history, Freeze cues, working copies,
proposals, issues, link-check results, the model catalogue, and waivers.
The drafts page reads stamps and revision history from Postgres. Freeze
compares the Postgres corpus to git, so it can run offline and does not
snapshot a replica that is behind.

`complete` is one Postgres insert. The D1 review-stamp write, and the
retry in `createSplitContentDocuments` that exists because the event and
the stamp cannot commit together, go away.

## The drain

The queue is dumb on purpose.

- Coalesce to the latest row per kind and id.
- Ship a generation together. A failed member stays pending with the
  generation; do not publish the puzzle and leave its category behind.
- Retry the same hash. A dropped connection is a pending row, not a
  second publish.
- Surface the lag on the publish result and the drafts page: on the LAN,
  not yet on the public site, until the replica hash matches.
- D1 is written only by this drain. A direct publish, a seed into the
  live D1 rows, or `content:canonicalize --apply-d1` would fight it.

The first fill copies the current D1 corpus into Postgres once. After
that, Postgres is upstream.

## What this removes

Once the LAN reads Postgres and the drain is the only D1 writer:

- the synchronous D1 round trip on publish, unpublish, layout save, and
  Freeze cue
- the review-stamp split and its retry
- the site-settings update waiting on the D1 mirror (`createMirroredSiteSettingsStore`
  reads Postgres and still awaits the mirror)
- D1 as a requirement for booting the authoring server
- the large-column D1 cache on the authoring hot path

Leave the public Worker on D1. A missing replica answers the public site
with the last successful generation, not with an authoring error.

## Sequence

1. **Postgres published tables.** Current rows for puzzle, catalogue, and
   category, plus the layout, cue, and revision snapshots the LAN still
   reads. Copy the live D1 corpus once.
2. **Point the LAN at those tables.** LAN play, Freeze, the drafts page,
   and publish read and write Postgres. Publish returns on that commit
   and enqueues the replica.
3. **Drain.** Coalesce, ship a generation, upsert by content hash, and
   show the lag.
4. **Stop the extra D1 writes.** Review stamps, cues, and revision
   history stay on the LAN. Delete the stamp retry.
5. **Make the D1 client optional** at authoring startup. Authoring and
   LAN play work while it is absent; the queue waits.
6. **After a quiet period,** remove the authoring server's direct
   published-row writes and any fallback that still reads D1 when the
   replica is behind.

## Non-goals

- Moving public play off D1.
- Syncing working copies, proposals, issues, link checks, the model
  catalogue, or waivers.
- A bidirectional sync, or any authoring write aimed at D1.
- Hyperdrive, or a public route to Postgres.
- Folding this into the open review-patch work. That branch is separate.

## Read first

- `docs/dev-briefs/authoring-postgres-on-the-lan.md` — the cut this one
  finishes. Its note that LAN play stays on D1 is the part this replaces.
  Public play stays on D1.
- `docs/dev-briefs/hosted-worker-scope.md` — why the LAN server is the
  only authoring writer.
- `modules/authoringContentDocuments.js` — the stamp split to delete.
- `modules/publicPlayService.js` — the replica payload.
- `modules/localPlayCorpus.js` — LAN play still lists D1.
- `modules/siteSettings.js` — the mirror the settings update still awaits.
- `modules/localAuthoringWorkspace.js` — startup still opens a D1 client
  before the split repositories exist.
