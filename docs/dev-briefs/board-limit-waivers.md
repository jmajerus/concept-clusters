# Numerical board-limit waivers

Status: implemented. Apply D1 migration `0033_board_limit_waivers.sql` before
using hosted waiver requests.

## Model

Every waivable limit is the size of a collection on the board: the terms in a
cluster, the clusters in a puzzle, and so on. `modules/boardLimitWaivers.js`
holds one registry entry per limit:

```js
{
  type: "cluster-term-count",
  label: "Terms per cluster",
  normalLimit: 7,     // ordinary maximum
  approvedLimit: 8,   // most a human may approve
  collections: puzzle => [{ id, label, detail?, size }]
}
```

Everything else is shared and policy-blind: request eligibility (above
`normalLimit`, at most `approvedLimit`), matching, human review, storage and
validation.

A waiver is a layout allowance, not a content approval. It names a target and
a size; it never looks at which terms fill that size. Swapping a term keeps
it; growing past the approved size needs a new grant. Term validity, duplicate
and pedagogy checks run independently as always.

A new limit is one registry entry; no new request path, storage column,
review markup or record shape.

Schemas, validation and authoring guidance read their numbers from the
registry (`boardLimit(type)`, `describeBoardLimits()`). The static reference
schemas under `content/schemas/` cannot import it, so
`tests/board-limit-waivers.mjs` fails if they drift.

The registry is an allowlist. Authors send a waiver type and target, never a
number or a grant record. Unregistered limits, such as the 32-node ceiling,
cannot be waived. Register a limit only after the renderer, schema and storage
can hold the larger value.

## Request and review flow

1. Save the proposed board. Validation reports `board-limit-waiver-required`
   for a target over its ordinary limit; content stays editable while a
   request is pending.
2. The agent calls `request_board_limit_waiver` with `draft_id`,
   `expected_revision`, `waiver_type`, `target_id` and a rationale. The server
   records the target's current size.
3. On the draft review page a human grants or declines the request, grants
   directly, or revokes a grant. Each decision records the reviewer, time and
   an audit event.
4. A grant applies while the same puzzle and target stay within its approved
   size. Renaming the target (its id) or growing it past that size voids it.
   Publication and Freeze run the same validation. A request alone never
   grants anything.

## Protected grant shape

`boardLimitWaivers` is administration metadata, omitted from agent-authored
projections and changed only by the human grant and revoke paths. Generic
saves and undo preserve the current grants.

```ts
type BoardLimitWaiver = {
  waiverType: string;
  puzzleId: string;
  targetId: string;
  approvedCount: number; // the target may hold up to this many
  reason: string;
  grantedBy: string;
  grantedAt: string;
};
```

Unused and stale grants stay visible to reviewers without invalidating a board
that is within its ordinary limit.

## Storage

D1 has one request table and one audit-event table for all types, keyed by
`waiver_type` and `target_id` with the size in `requested_count` /
`approved_count`. Local draft files keep the same request records in `boardLimitWaiverRequests`.

Migration 0032 created cluster-only tables before the registry existed. 0033
carries any rows they hold into the generic tables, converts any
`clusterTermExceptions` grants in `administration_json`, and drops the 0032
tables. 0032's move of board flags into the `{ board }` administration
envelope is general and stays; the envelope's fields come from
`ADMINISTRATION_ROOT_FIELDS` in `authoringFieldOwnership.js`.
