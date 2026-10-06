# Storage Domains: Write-Domain Scoping in Concept Clusters

*Status: implemented. `content`, `classification`, and `pedagogy` are the
focused agent-write domains; the complete authored-content form remains
available for compatibility, while protected metadata is hidden and preserved.
Pass-level writes that patch a domain instead of replacing it remain future work.*

This document describes the design and the reader-visible behavior of the
Concept Clusters authoring boundary. The repository-level migration and
compatibility details live in the [authoring domain scoping implementation
notes](dev-briefs/authoring-domain-scoping-implementation.md).

It is the companion to [PROVENANCE-STAMPS.md](PROVENANCE-STAMPS.md), and both
documents implement the paired primitives argued for in [The Integrity Burden:
Why Agentic Document Editing Belongs in the Infrastructure, Not the
Agent](https://github.com/jmajerus/write-domain-scoping).

---

## Why domains matter

The puzzle document contains several kinds of information: educational
content, pedagogical annotations, contributor attribution, and repository
state. In a round-trip editing workflow, an agent receives all of it and must
return everything intact while changing only the part that required its
judgment. That makes the agent responsible for information it neither needs
to see nor is competent to maintain.

Write-domain scoping makes ownership explicit at the authoring boundary. The
agent is given the smallest useful document for the pass it is performing;
the infrastructure preserves and recombines the other domains.

## The domains

| Domain | Purpose | Current owner | Focused agent access |
|---|---|---|---|
| `content` | Educational meaning: puzzle identity, copy, clusters, and bridge core | Agent | Read/write |
| `classification` | Disciplinary home, membership, subcategory placement, search tags, and optional level | Agent | Read/write; id and title are read-only context |
| `pedagogy` | Relationships, lenses, learning introductions, related puzzles, and language | Agent | Read/write; content and classification are read-only context |
| `administration` | Experimental play flags on `board`, such as the free-term strip, bridge pre-connect, and board size factor | Author | Protected. Not an agent write domain |
| `provenance` | Who contributed and how human and generative work relate | Author and infrastructure | Protected |
| `system` | Ownership, revisions, timestamps, hashes, validation, and lifecycle state | Infrastructure | Outside the document |

The agent-write domains stay three: content, classification, and pedagogy. Administration is a separate human projection because its stimulus is an admin turning an experiment on or off, which is not a contribution event and not a board, shelf, or lesson edit. Provenance records who contributed, and it changes when contribution changes. The shared rule is only mechanical: a content, classification, or pedagogy save must not see or replace `board`.

`board.starFreeStrip` forces the strip when true, keeps the classic Star board when false, and leaves the capacity heuristic in place when omitted. `board.bridgePreconnect` starts every bridge connected in Graph, Star, and Circle when true. Omitted or false leaves bridges for the player. `board.sizeFactor` scales the derived canvas in 5% steps from 25% smaller to 25% larger, and the page frame with it so labels keep their size; omitted leaves that derivation alone. Drafts store the object in `administration_json`. Publish still writes one assembled puzzle document, so play reads `puzzle.board` and a change alters the content fingerprint.

Promotion is a later, explicit change for one field after it has been vetted. Move that field's ownership to content or pedagogy, set its kind to authored or derived, add it to that domain's phase, and backfill draft rows from `administration_json` into the destination column. The player-facing key stays `board`. Until that promotion, agents cannot set or clear these flags. Do not add a domain per experiment; the field list stays this one closed object.

The agent-write domains are broad enough to be useful authoring surfaces.
Content includes the core of a bridge and its cluster membership. Classification
is the shelf: primary category, membership, subcategory placement, search tags,
and optional level. Pedagogy includes bridge relationship annotations, the
lesson, related puzzles, and language. Provenance is a
compact document-level record, while system state belongs to the repository
envelope rather than to authored JSON.

An authoring profile is a different axis from a storage domain. For example,
the `vocabulary-context` profile spans the existing `content` and `pedagogy`
domains: its near-synonym clusters, bridge cores, and specialized `puzzleKind`
remain content, while its context-sensitive lenses remain pedagogy. Omit
`puzzleKind` for the default topic-based type. The MCP profile selects guidance;
the document field records specialized authored types.
Neither requires a third projection or a duplicated field owner. The fuller
argument — including why domain projections and profile/phase sub-schemas
share a compositional shape but not ownership semantics — is preserved with
the Integrity Burden paper’s associated documents:
[Guidance specialization is not a storage partition](https://github.com/jmajerus/write-domain-scoping/blob/main/companions/guidance-specialization-vs-storage-domains.md).

The boundary is about ownership, not an assertion that every field needs to
remain authored. A partitioning review is also a good time to ask whether a
field is semantic, human-controlled, or derivable. Cluster color is
presentational: play needs a stored hue, and the studio can still choose
one, but MCP reads omit it and an agent save cannot choose or replace it.
The server keeps the stored hue for a cluster that is still the same one,
and assigns the next unused palette color for a cluster that has none.
That is a schema decision, not a silent consequence of partitioning.

## Write-once fields

`kind` in the field-ownership map says *who* may write a field. `writeOnce`
says *when*: the field is authored as the draft is created and immutable on
later authored saves. Today the only one is the document `id`.

It is a lifecycle constraint *inside* an owned field, not another storage
domain and not a replacement for `kind` or `identity`. Those flags stack.
The document `id` is `authored`, `identity: true`, and `writeOnce: true`: an
agent chooses it at birth, later saves match on it, and authored writes may
not move or drop it.

It is distinct from both neighbours it is easy to confuse it with:

- **Not `protected`.** An agent does legitimately choose a new puzzle's slug;
  protected fields are ones it may never write at all.
- **Not `identity` alone.** `identity: true` marks the key used to match a
  node across versions, and ordinary authoring renames those freely — a
  cluster id or a bridge term changes during a normal pass. The document id
  is different because it is also the storage key: the repository recomputes
  `puzzle_id` from the document on every save, so moving it, *or dropping it*,
  splits the row's identity from the document's.

Enforced by `assertNoWriteOnceDrift` in `authoringDomains.js`, at the storage
layer rather than at one caller: in `applyAuthoredDomain` for domain writes,
and in each store's complete-document save (`D1DraftRepository.save`,
`puzzleDraftStore.replaceDraft`). The MCP boundary checks it too, for an
earlier and better-labelled error, but the boundary is not where the rule
lives — the construct board PUTs a whole document straight to the store with
no MCP in front of it, and that path has to be covered by the same rule.

Domain payloads pass `allowAbsent`, because a projection that omits a field is
not making a claim about it — a pedagogy payload never carries the id and is
not dropping it by staying silent.

The violation is a `WriteOnceFieldError` carrying `status: 400`, so the admin
JSON routes report it as the client error it is instead of rethrowing it as an
unhandled fault.

The one writer that may move an id is the drafts-page rename, which is a
deliberate human action, copies the row and checks the target id is free. It
does not go through an authored write, so it is exempt by construction rather
than by exception.


## What is implemented

An MCP caller may request `content`, `classification`, or `pedagogy` when reading or saving a
puzzle draft. A focused read contains only the selected writable projection.
Content and pedagogy responses include the classification fields as read-only
context. A classification response includes id and title as read-only context,
and a pedagogy response also includes the content projection. A focused
save replaces the selected projection, preserves the protected
domains, and lets the infrastructure reassemble a complete document for
validation, publication, rendering, and Freeze.

The `complete` path remains available for existing clients and workflows, but
it does not expose or accept protected attribution, legacy lesson credit, or
human-managed creator/license/source-lineage fields. The server preserves
those values across complete and focused saves and stamps a recognized MCP
client where possible. Human editorial workflows remain responsible for
curating attribution and rights metadata. System metadata is likewise outside
the authored document and cannot be replaced by an agent.

The creator, license, and source-lineage values stay in the existing pedagogy
storage projection for compatibility; they are not moved into the separate
`provenance_json` record. `language` remains authored and agent-editable.

For puzzle drafts, D1 stores projections for the three authored domains as the
durable write surface. The complete `document` column is a materialized cache
refreshed on complete saves and on validate/publish (`materialize`). Focused
domain saves replace the selected authored projection, preserve the other
domains, and mark the cache stale; reads assemble from the domain columns.
The materialized document keeps publication and player-facing paths
independent of the domain model. The system domain remains in D1 columns and
response metadata rather than being duplicated in a `system` document field.
How that write lands in a row, on the undo stack, and in the publish ledger
is described in [How a save is stored](#how-a-save-is-stored).

## How a save is stored

A puzzle draft is one row in `puzzle_drafts`. `revision` is an
optimistic-concurrency counter on that row. A save updates the row and
increments the counter. The caller must send the `expected_revision` it last
read; a mismatch fails and leaves the row unchanged.

Each projection is one JSON column: `content_json`, `classification_json`,
and `pedagogy_json`, plus the protected `provenance_json` and
`administration_json` columns. A column holds the whole projection. Changing
one field inside content replaces `content_json`. On a focused save of a
draft whose domain columns are already split, the other two authored columns
keep the stored text. `provenance_json` and `administration_json` are written
again from the assembled document, so a content save cannot drop them. The
first focused save on a row that still lacks `classification_json`, or that
still keeps shelf fields inside content or pedagogy, rewrites all three
authored columns so the split is complete. The materialized `document`
column is left as it was and `document_stale` is set. A complete save
rewrites `document` and every domain column and clears the stale flag.
`materialize` refreshes `document` from the domain columns without
incrementing `revision`. A complete save whose assembled document matches
the current one leaves `revision` alone and records no history, unless
`document_stale` is set. That save refreshes the cache: `revision`
increments, and history is not pushed, because the assembled puzzle did
not change. A caller still has to send the new `expected_revision`.

Distinct saves push the previous assembled document onto
`puzzle_draft_history`. That row is the full document. The stack keeps 40
snapshots; older ones are deleted. Its `seq` is the undo order. Revert pops
one snapshot. `revision` is a different counter.

Publish copies the assembled document onto the single `published_documents`
row for that id and appends the same full document to
`published_document_revisions`. Catalogue and category working copies stay
one `document` column on `content_drafts`. They have no domain projections.
Their publish path uses the same live row plus appended snapshot.

`first_published_at` is when that published row was first written, and it
stays put. `published_at` is when the row was last published. A draft's
`created_at` and `updated_at` are the working-copy stamps. Those clocks are
not copied onto the puzzle. `dateCreated` and `dateModified` are stripped
when a document is saved or read. The lesson reads the two publication
columns from the play index. An open without that index, including an
unpublished draft, shows no publication date.

## Projections and sub-schemas

The complete puzzle schema remains the canonical contract, but it need not be
the contract an agent receives for every authoring pass. A projection is a
server-built view of the canonical document: it contains the selected
domain's writable fields and, where necessary, a read-only context view of
related data owned by another domain. The agent can refer to sibling data
without copying it into its response or taking responsibility for preserving
it.

These layers answer different questions:

| Layer | Question | Role in an authoring pass |
|---|---|---|
| Canonical schema | What is valid in the complete puzzle? | Final validation after recombination |
| Domain projection | Which data belongs to this authoring boundary? | Writable fields plus necessary read-only context |
| Pass sub-schema | Which part of that domain is relevant now? | Narrow task or phase contract for the agent |

A pass sub-schema is therefore not an independently complete puzzle schema.
It can be requested for a particular task and composed with the selected
domain projection. The intended flow is: infrastructure selects the pass,
builds its projection and context, accepts the narrow response, retains the
parallel domains, and reassembles the complete document before canonical
validation, rendering, or Freeze.

This distinction also makes omission semantics explicit. A partial phase pass
should preserve fields outside that pass; an explicit replacement of a whole
domain may define omission as removal within that domain. A narrow contract
must never cause an incomplete agent response to be mistaken for a complete
document.

The current implementation provides focused
`content`, `classification`, and `pedagogy` projections, phase-specific schema guidance, and a
shared [field-ownership map](dev-briefs/authoring-domain-scoping-implementation.md#projection-and-sub-schema-refinement)
(`modules/authoringFieldOwnership.js`) that both domain partition and phase
schemas consume. Phase schemas bind to a write domain when they are a pure
subset (`core` → content; `classification` → classification;
`pedagogy` / `publication` → pedagogy); `review`
remains a cross-domain inspection view. A future refinement can make pass
writes themselves composable (patch vs whole-domain replace), so a narrow
phase-shaped response is never mistaken for a complete domain replacement.

## Canonicalization, batch migration, and history

Automated canonicalization is the normal way for the repository to absorb
schema evolution. A known, representable legacy shape can be normalized or
converted into the current canonical document, checked for semantic validity,
and written back through an explicit save or corpus pass. This keeps migration
knowledge at a shared infrastructure boundary instead of requiring every
authoring pass to understand every historical representation.

When a schema change affects many current records, batch canonicalization is
the intermediate step between routine normalization and cleanup. A reviewed
batch pass brings the active corpus and current source artifacts to one
canonical shape, validates the result, and identifies anything that needs
human attention. It lets the repository absorb a substantial schema change
without making each authoring pass carry the entire migration history.

Purging has a different role and a narrower target. It is reserved for
historical revisions or snapshots that are no longer worth supporting. If
history must be retained, it needs an explicit format/version policy of its
own; the current canonicalizer should not be expected to understand every
ancient schema indefinitely. Current drafts and published records should be
canonicalized or stopped for review, not discarded merely because they use an
older shape.

Purging therefore complements canonicalization; it does not replace it or
turn every schema change into a deletion exercise.

The detailed migration contract and verification sequence are in
[Canonical content and schema evolution](CANONICAL-CONTENT.md).

## The integrity boundary

The infrastructure owns the things an agent should not have to reproduce:
authenticated ownership, revision tokens, timestamps, hashes, validation
state, checkout and publication state, and derived rendering values. The
agent still owns content-domain integrity: terms must be placed consistently,
cluster and bridge references must resolve, and the educational relationships
must make sense.

Domain scoping is enforced at the domain boundary. It does not replace
semantic validation, and it does not yet enforce every ownership distinction
within a domain. The complete path is intentionally broader for compatibility;
focused writes are the path for reducing the agent's context and integrity
burden.

Current authoring and storage use the simplified document shape. Alternate
interchange representations and legacy authoring fields are kept outside the
current contract. Historical document snapshots are handled by the one-time
cleanup described in the [implementation notes](dev-briefs/authoring-domain-scoping-implementation.md),
not by asking an agent to preserve obsolete formats.

## The next boundary

Classification is the shelf: category, membership, subcategory, search tags,
and optional level. Those marks can change without rewriting the board or the
lesson. Related puzzles and language stay in pedagogy. A related-puzzle entry
needs a reason written against the lesson, and language describes the prose
of this document. Further separation may be worthwhile where a field has a
distinct owner or where a different model needs a different context. The
criterion is whether the separation removes real decision and integrity
burden without turning the authoring contract into a collection of fragments
that must be mentally reconstructed by the agent.

The provenance and invocation-capture side of the design is described in
[PROVENANCE-STAMPS.md](PROVENANCE-STAMPS.md).
