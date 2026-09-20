# Storage Domains: Write-Domain Scoping in Concept Clusters

*Status: the first production slice is implemented. `content` and `pedagogy`
are the focused agent-write domains; the complete authored-content form remains
available for compatibility, while protected metadata is hidden and preserved.
Finer-grained partitioning remains future work.*

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

## The four domains

| Domain | Purpose | Current owner | Focused agent access |
|---|---|---|---|
| `content` | Educational meaning: puzzle identity, copy, clusters, and bridge core | Agent | Read/write |
| `pedagogy` | Relationships, lenses, learning introductions, and discovery metadata | Agent | Read/write; content is read-only context |
| `provenance` | Who contributed and how human and generative work relate | Author and infrastructure | Protected |
| `system` | Ownership, revisions, timestamps, hashes, validation, and lifecycle state | Infrastructure | Outside the document |

The first two domains are intentionally broad enough to be useful authoring
surfaces. Content includes the core of a bridge and its cluster membership;
pedagogy includes bridge relationship annotations and the surrounding
discovery and lesson structure. Provenance is a compact document-level record,
while system state belongs to the repository envelope rather than to authored
JSON.

An authoring profile is a different axis from a storage domain. For example,
the `vocabulary-context` profile spans the existing `content` and `pedagogy`
domains: its near-synonym clusters, bridge cores, and specialized `puzzleKind`
remain content, while its context-sensitive lenses remain pedagogy. Omit
`puzzleKind` for the default topic-based type. The MCP profile selects guidance;
the document field records specialized authored types.
Neither requires a third projection or a duplicated field owner.

The boundary is about ownership, not an assertion that every field needs to
remain authored. A partitioning review is also a good time to ask whether a
field is semantic, human-controlled, or derivable. For example, a
presentational cluster color may eventually be derived from cluster order
instead of being part of an agent payload. That would be a schema decision,
not a silent consequence of partitioning.

## What is implemented

An MCP caller may request `content` or `pedagogy` when reading or saving a
puzzle draft. A focused read contains only the selected writable projection;
the pedagogy response additionally supplies content as read-only context. A
focused save replaces the selected projection, preserves the protected
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
domain saves update only the selected projection and mark the cache stale;
reads assemble from the domain columns. The materialized document keeps
publication and player-facing paths independent of the domain model. The
system domain remains in D1 columns and response metadata rather than being
duplicated in a `system` document field.

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

The current implementation provides the first building blocks: focused
`content` and `pedagogy` projections, phase-specific schema guidance, and a
shared [field-ownership map](dev-briefs/authoring-domain-scoping-implementation.md#projection-and-sub-schema-refinement)
(`modules/authoringFieldOwnership.js`) that both domain partition and phase
schemas consume. Phase schemas bind to a write domain when they are a pure
subset (`core` → content; `pedagogy` / `publication` → pedagogy); `review`
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

The current partition is deliberately a useful minimum: two agent-write
domains plus protected provenance and infrastructure-owned system state.
Further separation may be worthwhile where a field has a distinct owner or
where a different model needs a different context. The criterion is whether
the separation removes real decision and integrity burden without turning the
authoring contract into a collection of fragments that must be mentally
reconstructed by the agent.

The provenance and invocation-capture side of the design is described in
[PROVENANCE-STAMPS.md](PROVENANCE-STAMPS.md).
