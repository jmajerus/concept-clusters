# Storage Domains: Write-Domain Scoping in Concept Clusters

*Status: implemented compatibility-preserving first slice (MCP authoring contract v1.13.0). The final sections retain the further partitioning ideas that are not yet implemented.*

This document describes how the Concept Clusters authoring system decomposes puzzle documents into ownership domains, how those domains map to storage, and what the agent-facing contract looks like in practice. It is the companion implementation document to [PROVENANCE-STAMPS.md](PROVENANCE-STAMPS.md), which covers the session provenance capture side of the same design.

Both documents implement the paired primitives argued for in [The Integrity Burden: Why Agentic Document Editing Belongs in the Infrastructure, Not the Agent](https://github.com/jmajerus/write-domain-scoping).

---

## Overview

The Concept Clusters puzzle document is a structured JSON object with fields serving distinct purposes: educational content authored by an agent, pedagogical annotations layered on top of that content, provenance recording who contributed, and system fields maintained entirely by the infrastructure. In the round-trip model, an agent receives the whole document and must return it intact with targeted changes — placing the integrity burden for all four categories on the agent regardless of which category required its judgment.

The storage-domain design reduces that burden by making logical ownership explicit at the authoring boundary. The current implementation exposes two agent-writable domains (`content` and `pedagogy`), keeps `provenance` protected, and treats the existing D1 row metadata as the `system` domain. The complete document remains materialized for compatibility with the rest of the application.

---

## Domain Decomposition

The puzzle document decomposes into four ownership domains:

### Content
The puzzle's educational core: `id`, `title`, `category`, `info`, `clusters`, and the core of `bridges` (`id`, `term`, `clusters`, `fact`, `info`). Cluster fields remain together in this first slice, including names, facts, terms, seeds, colors, term notes, and links. This is the primary agent write domain.

Unknown authored root fields are retained here for forward compatibility. That keeps a new field from being silently discarded before the ownership map is deliberately updated.

### Pedagogy
Structural and discovery annotations layered on top of content: bridge relationship classifications (`conceptId`, `relationKind`, `direction`, `idealTerms`), lenses and lens mode, learning introductions, related puzzles, category membership metadata (`categories`, `subcategories`, `tags`, `level`), and the current publication/discovery metadata fields. These require judgment but can be handled as a separate pass from the core puzzle.

Separating pedagogy from content allows a focused annotation pass — potentially by a different agent or a different model configuration — without touching the content domain.

Fields: `categories`, `subcategories`, `tags`, `level`, `lenses`, `lensMode`, `preSolve`, `relatedPuzzles`, `learningIntroduction`, publication/discovery metadata, and the bridge annotation fields above. The legacy human-owned `learningIntroduction.credit` value is protected: it is omitted from the focused pedagogy projection and remains under the provenance/editor boundary.

### Provenance
Who contributed to this puzzle. The current document shape is an object with `collaboration` and an ordered `contributors` array; normalization may add contributor kind and observed model settings. This domain is protected from focused agent writes. Recognized MCP clients can be stamped by the server, while author-owned attribution remains available through the existing provenance/editor paths.

For the limits of human-controlled provenance and the path toward automated capture, see [PROVENANCE-STAMPS.md](PROVENANCE-STAMPS.md).

Fields: `provenance`.

### System
Fields the infrastructure owns entirely: authenticated owner, draft id, revision, status, hashes, timestamps, validation state, checkout/publish metadata, and other repository envelope values. The derived `large` rendering flag is also omitted from focused MCP documents. Agents receive the minimum draft envelope needed to address a scoped save (`draftId` and `revision`), not the full system record.

These values currently live in D1 columns and the draft response envelope rather than a `system_json` document column.

---

## Storage Model

The migration adds persisted projections for the three JSON domains that belong in the draft document. The existing `document` column remains the materialized canonical snapshot used by current consumers:

```sql
puzzle_drafts (
  id             TEXT PRIMARY KEY,
  owner_subject  TEXT NOT NULL,
  document       TEXT NOT NULL, -- materialized complete document
  content_json   TEXT,          -- content projection; null only before backfill
  pedagogy_json  TEXT,          -- pedagogy projection; null only before backfill
  provenance_json TEXT,         -- protected provenance projection
  status         TEXT,
  content_hash   TEXT,
  revision       INTEGER,
  updated_at     TEXT
)
```

Migration `0019` deliberately leaves these new columns nullable so existing
draft rows remain readable. A read falls back to the legacy complete blob when
the projections are null; the next successful write materializes and stores
all three projections.

### Agent-facing API presentation

When an agent is asked to draft educational content, the API presents only the `content` column. The `pedagogy` column may be included as read-only context when the agent needs to understand existing annotations, but it is not part of the agent's write surface for a content pass.

When an agent is asked to annotate bridge relationships or classify lenses, it receives only the `pedagogy` column, with `content` visible as read-only context.

In neither case does the agent receive `provenance` or `system` fields. They are not in its context. It cannot read them, reproduce them incorrectly, or accidentally modify them.

### Merge semantics

The infrastructure combines the stored content, pedagogy, and provenance projections into a complete document at the draft repository read boundary. The system domain remains the row envelope. A complete materialized document is then written on create/save/pop and is the artifact passed to validation and publication. Writers that update a complete snapshot outside the draft repository, such as category-rename propagation, must refresh all three projections in the same update so a later read cannot reintroduce stale sidecar data.

Published puzzle rows are intentionally still complete snapshots. The current Freeze and rendering paths read `published_documents.document`; they do not need to know about mutable draft projections. This keeps the domain upgrade out of the player and Freeze bundle format while preserving the option to make published reads assemble later.

---

## What the Agent Sees

### Focused MCP contract

`get_puzzle_draft` and `save_puzzle_draft` accept an optional `domain`:

```json
{ "draft_id": "energy-flow", "domain": "content" }
```

The default is `complete`, preserving existing clients. `content` and
`pedagogy` are the only focused agent domains. A focused save still requires
the normal `expected_revision`; it replaces the selected domain while the
server retains the other projections, reassembles the complete document, and
runs the normal canonicalization path. Omitting an optional field from the
selected projection therefore removes it. A content payload containing
pedagogy fields (or vice versa) is rejected rather than silently moved.

The `pedagogy` response has a writable `document` projection and a read-only
`context` containing content needed to refer to clusters and bridges. The
projection omits legacy `learningIntroduction.credit`; an explicit attempt to
write that protected field is rejected, while an existing value is preserved
when the introduction remains present. The `content` response has no pedagogy
context because it is the primary drafting surface. Neither focused document
includes provenance or system metadata. Mechanical `repair` is available to
complete and content saves only because it repairs content-domain fields.

### Content domain (drafting pass)

The agent receives the content projection — identity, core puzzle copy, clusters, and bridge core — with pedagogy annotations, provenance, derived flags, and repository metadata absent by construction.

The agent's task is unambiguous: produce good educational content within this structure. It does not need to know what it is not seeing. The integrity of what it is not seeing is not its concern.

### Pedagogy domain (annotation pass)

The agent receives the pedagogy projection alongside content as read-only `context`. It can classify bridge relationships, set directions and ideal terms, author lenses or learning introductions, and update the grouped discovery metadata. It does not send content fields back through this scoped write.

### What is absent by construction

Focused domain documents do not transmit system or provenance fields. The small draft envelope still exposes `draftId` and `revision`, because those values are required to address and concurrency-check the next save. The backwards-compatible `domain: "complete"` response continues to expose the existing complete draft contract.

---

## Limits of the Implementation

Column-level partitioning enforces domain boundaries at the domain level. It cannot enforce field-level ownership boundaries *within* a domain, and the complete compatibility path remains intentionally broad.

### Fields removed rather than partitioned

The current schema audit did retire some fields, but not all fields proposed for removal in the original design note. In the actual active simplified schema:

- **`termRole` on bridges** is compatibility-only and removed before current authoring validation.
- JSON-LD and audit-only client details are not stored in the current puzzle
  document; attribution is represented by `provenance`.
- **`color` on clusters**, **`via` on related-puzzle entries**, and **`conceptId` on bridges** are still represented by the active schema and are therefore retained in the appropriate projection. They may be candidates for a later, separately reviewed ownership change.

This distinction matters: a domain partition should not silently become a schema deletion.

### The residual integrity burden

What remains within the content domain is a residual integrity burden that is appropriate and correctly located: term references must be consistent, seed terms must appear in their cluster's term list, bridge cluster references must point to real clusters. These are content-domain integrity constraints, checkable by validation, within the agent's competence to satisfy, and directly related to the quality of the educational content being produced.

This is the integrity burden the agent should bear. Everything else has been moved to domains owned by parties competent to discharge it.

---

## Relationship to Session Provenance Capture

This document covers the write-domain scoping side of the paired primitives. The provenance domain is protected, but the current server can automatically record recognized MCP client identity and domain scope in its assistance audit. That is useful attribution, not yet a complete attested session record.

The session provenance capture side — automatic, infrastructure-level recording of agent identity, model configuration, and runtime parameters at the invocation boundary — is covered in [PROVENANCE-STAMPS.md](PROVENANCE-STAMPS.md), which also maps the three-position landscape between no capture and full capture, and identifies where the current implementation sits within it.
