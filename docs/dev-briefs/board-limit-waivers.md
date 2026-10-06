# Numerical board-limit waivers

Status: implemented. Apply D1 migration
`0033_board_limit_waivers.sql` before using hosted waiver requests.

## Policy model

Numerical limits that can be exceptionally exceeded are registered in
`modules/boardLimitWaivers.js`. Each policy defines its stable type, ordinary
and approved limits, scope type, target enumeration, value reader, scope
snapshot, and snapshot validation. The same registry drives the MCP request
enum, request validation, human review, grant matching, and semantic
validation. A new waiver type is added by registering one policy and adding
its structural metadata shape where needed; the request and persistence
workflow stays shared.

The registry is an allowlist. Authors send a waiver type and target, never a
limit value or grant record. The server captures the current value and exact
scope; the reviewer can approve only the fixed value in that policy. Policies
without an entry cannot be waived. The 32-node ceiling, for example, remains
an absolute publication limit until a deliberate policy defines a supported
exception for it.

The initial registered type is `cluster-term-count`: seven terms is ordinary,
exactly eight can be approved for one puzzle, cluster, and unordered term set,
and nine remains invalid. Other validity rules continue to apply.

## Request and review flow

1. Save the proposed board. Validation reports
   `board-limit-waiver-required` for a registered limit that needs review;
   content remains editable while that request is pending.
2. The agent calls `request_board_limit_waiver` with `draft_id`, the latest
   `expected_revision`, `waiver_type`, `target_id`, and a rationale. The server
   captures `requestedValue` and `scope` from the registry policy.
3. The human review page presents the captured scope and rationale. A person
   can grant or decline a request, grant a registered waiver directly, or
   revoke an existing grant. Grant and revoke operations record the human
   identity, time, and audit event.
4. A grant is effective only for the same puzzle, waiver type, target, value,
   and scope. Publication and Freeze use the same semantic validation that
   checks the current board. A request alone never grants permission.

Requests and audit events use policy-neutral D1 tables. Migration 0033 carries
forward the first cluster-term request and event tables, preserving their ids,
status, actors, timestamps, rationale, and captured terms. Existing protected
grant records are converted to the `boardLimitWaivers` representation. The old
tables remain as migration history; runtime writes use the generic tables.

Local draft stores use the same generic request shape. Generic full-document
saves and undo preserve current waivers; only human grant and revoke paths may
change protected administration metadata.

## Protected grant shape

`boardLimitWaivers` is protected administration metadata and is omitted from
agent-authored document projections. A grant has the policy-neutral form:

```ts
type BoardLimitWaiver = {
  waiverType: string;
  puzzleId: string;
  targetId: string;
  approvedLimit: number;
  approvedScope: Record<string, unknown>;
  reason: string;
  grantedBy: string;
  grantedAt: string;
};
```

The registry validates each type's `approvedScope` and `approvedLimit` against
its policy. A structurally valid object is not approval; records are created
only by the human administration path and matched against the live document
before publication.

For `cluster-term-count`, `approvedScope` contains the exact eight term labels.
Reordering terms leaves the waiver active; changing a term, cluster id, or
puzzle id makes it inapplicable. Unused and stale grants stay visible to
reviewers without invalidating a board that is within the ordinary limit.

## Validation and extension

The shared pure evaluator in `modules/boardLimitWaivers.js` is consumed by
content validation and the authoring completeness check. It emits generic
codes for a required waiver, an exceeded hard limit, malformed metadata, or a
duplicate grant. Other schema, seed, duplicate-term, board-size, and pedagogy
checks still run normally.

To register another exception, add a policy object with:

- a stable `type`, human label, scope type, normal limit, and approved limit;
- functions that enumerate its targets, read their numeric value, identify a
  stable target id, and snapshot the approval scope;
- a scope validator and matcher, plus request eligibility and rationale
  guidance.

For limits whose exceptional value needs different structural representation,
extend the simplified puzzle schema and JSON-LD adapters to represent that
candidate value. Keep the semantic decision in the policy registry so a
schema change alone cannot grant permission. Do not register an exception to
a limit until the renderer, storage shape, request scope, and publication
behavior can all honor it.
