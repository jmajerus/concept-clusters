# Storage Domains: Write-Domain Scoping in Concept Clusters

*Status: the first production slice is implemented. `content` and `pedagogy`
are the focused agent-write domains; the complete document contract remains
available for compatibility. Finer-grained partitioning remains future work.*

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

The `complete` path remains available for existing clients and workflows and
is intentionally broader. Repository state remains infrastructure-controlled;
the server preserves existing provenance when a complete save omits it and
normalizes modern provenance when a complete client supplies it. Focused
writes cannot replace provenance or system metadata. Human-owned lesson credit
is similarly kept outside the focused pedagogy write surface.

For puzzle drafts, D1 stores the complete materialized document alongside
projections for the three authored domains. The projections reduce the
context and write payload seen by focused MCP calls; the materialized document
keeps current publication and player-facing paths independent of the domain
model. The system domain remains in D1 columns and response metadata rather
than being duplicated in a `system` document field.

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
