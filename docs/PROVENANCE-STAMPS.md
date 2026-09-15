# Provenance Stamps: Session Provenance Capture in Concept Clusters

*Status: document provenance and the MCP invocation audit are implemented; attested session provenance remains aspirational.*

This document describes how the Concept Clusters authoring system records who contributed to a puzzle document, what is captured automatically at the invocation boundary, what requires human input, and where the gap to the full session provenance capture primitive lies. It is the companion implementation document to [STORAGE-DOMAINS.md](STORAGE-DOMAINS.md), which covers the write-domain scoping side of the same design.

Both documents implement the paired primitives argued for in [The Integrity Burden: Why Agentic Document Editing Belongs in the Infrastructure, Not the Agent](https://github.com/jmajerus/write-domain-scoping).

---

## Overview

Provenance in an agentic document editing system has to answer two questions: what was changed, and who changed it under what conditions. The write-domain scoping implementation described in [STORAGE-DOMAINS.md](STORAGE-DOMAINS.md) addresses the first question by making domain ownership explicit and infrastructure-enforced. This document addresses the second through two complementary records: the puzzle document's compact `provenance` field, which is the model of record for contributor attribution, and the infrastructure-owned `draft_assistance_stamps` audit, which records recognized MCP invocation context.

The honest answer, for the current implementation, is: partially. For recognized MCP clients, new puzzle drafts and substantial MCP edits can update document provenance automatically, while the invocation boundary, authenticated owner, date, role, and focused authoring domain are recorded in the assistance audit. Some clients also expose model or reasoning hints. Complete, attested model identity, configuration, and runtime parameters are not available from the protocol in a consistent verifiable form. This is a workable approximation for a supervised single-author workflow. It is not the intended endpoint.

---

## The Three-Position Landscape

The gap between no provenance capture and full session provenance capture has three positions, not two.

**Position 1: No capture.** The round-trip model with attribution entirely absent. The document is handed to an agent and returned; nothing records who touched it, under what conditions, or what changed. This is the baseline from which the current implementation has moved.

**Position 2: Partial infrastructure capture.** What the current Concept Clusters implementation achieves. Recognized MCP client identity, authenticated owner identity, timing, role, and (when present in the call frame) model/reasoning hints are recorded automatically for stamped puzzle-authoring calls. A focused `content` or `pedagogy` call is also stamped with that logical domain. New drafts and substantial MCP edits can update the document's compact contributor provenance; trivial edits do not change the contributor list merely because an agent touched the draft. The record is not a cryptographically attested model/runtime statement, and complete configuration is not available from the protocol.

**Position 3: Full session provenance capture.** The missing primitive. All of the above — including model identity, version, reasoning configuration, and runtime parameters — recorded automatically at the invocation boundary, without requiring human presence or manual recording. This position requires protocol-level support that does not yet exist in the MCP specification.

The current implementation occupies Position 2 honestly. It has closed the gap between no capture and infrastructure capture of the invocation event. The gap between Position 2 and Position 3 is precisely where the full primitive is needed.

---

## What `draft_assistance_stamps` Records

Stamped puzzle-authoring calls through the hosted MCP server write an
append-oriented record to the `draft_assistance_stamps` table in D1. This is
not self-reported by the agent — it is assembled by the server while handling
the request. Persistence and Analytics Engine emission are best-effort and
must never make the authoring call fail.

```sql
draft_assistance_stamps (
  id            TEXT PRIMARY KEY,
  draft_id      TEXT NOT NULL,
  owner_subject TEXT NOT NULL,        -- authenticated Access subject
  captured_at   TEXT NOT NULL,        -- ISO 8601 timestamp
  record_json   TEXT NOT NULL         -- tool, role, scope, client, and actor data
)
```

The record contains an `authoring_assistance_stamp` event name, a server-side
`capturedAt`, the tool and draft/puzzle identifiers, the supplied authoring
`role` and `date`, the effective scope, recognized client details, and (when
available) the authenticated actor subject. It may include the current
document's collaboration mode as context, but it is not a document snapshot.

### What this captures

- **Tool call identity** — which MCP tool was invoked (e.g., `save_puzzle_draft`, `validate_puzzle_draft`)
- **Session identity** — the authenticated Cloudflare Access subject, verified independently of anything the agent reports about itself
- **Timing** — when the call was made, enabling reconstruction of the interaction sequence
- **Authoring scope** — a focused `content` or `pedagogy` write records that
  domain; a complete write records `puzzle` and, when present, the separate
  `learningIntroduction` scope
- **Authoring state** — the record identifies the draft/puzzle and the client call, but the current stamp does not claim to be a content hash or a full snapshot
- **Transport and actor context** — when available, the transport and the
  authenticated actor subject are retained in the audit record

### What this does not capture

- **Attested model identity** — the server can observe a model hint from some client frames, but it cannot verify that hint as the model/checkpoint actually running
- **Complete model version** — the specific release or checkpoint is not consistently available from the protocol
- **Complete reasoning configuration** — some clients expose a reasoning hint; the full setting is not standardized or guaranteed
- **Runtime parameters** — temperature, context window, system prompt, and equivalent settings are not provided as a verified per-call record
- **Document change evidence** — the stamp has no before/after document,
  field-level diff, content hash, or revision snapshot
- **Tamper evidence** — D1 and Analytics Engine records are not currently
  cryptographically anchored or externally immutable

These are the fields that distinguish Position 2 from Position 3. Some facts
exist at the invocation boundary — the infrastructure that handed the agent
its domain may know them — but the MCP protocol does not currently convey
them to the server in a verified, consistent form.

---

## What Requires Human Input

The author may record model identity and configuration in the `provenance`
field of the puzzle document when the call frame does not provide enough
information. This field is part of the protected provenance domain described
in [STORAGE-DOMAINS.md](STORAGE-DOMAINS.md); focused agent writes cannot
replace it. Recognized MCP clients may also be added automatically on a new
puzzle draft or a substantial MCP edit.

### The `provenance` field

An object containing an optional collaboration mode and an ordered
`contributors` array. Contributor entries may be bare names or objects
carrying an explicit kind, model, reasoning, or switch details. The server
infers `generative` for recognized host names and defaults unknown names to
`human`; explicit kind overrides are retained. The stored form omits
derivable kind values and never persists provider data. `reviewedBy` is an
author-owned reviewer name for the lesson byline, not another contributor.

```json
"provenance": {
  "collaboration": "aiPrimary",
  "contributors": [
    { "name": "Claude", "model": "claude-opus-5", "reasoning": "high" },
    { "name": "jmajerus" }
  ]
}
```

The per-contributor `reasoning` and `switch` fields record settings visible to
the author at session initiation — not a self-report by the agent, but an
observation by the human who controlled for them. The server may also fill a
model label and reasoning level from a recognized client call frame when the
client exposes them; switch values remain author-supplied. Neither route is a
cryptographically attested model/runtime statement.

### Automatic document attribution

For a recognized MCP client, `create_puzzle_draft` credits the client when it
creates a draft from a supplied document or a new skeleton. Seeding a working
copy from an existing published document does not invent a new contributor. A
`save_puzzle_draft` call credits the client only when its change is substantial;
a trivial edit or metadata fix does not add or update a contributor merely
because the client touched the draft. The server preserves existing provenance
when a complete save omits the optional field, and focused writes cannot
replace the protected provenance domain.

This document-level attribution is intentionally separate from the assistance
stamp. A substantial save may both update `provenance` and create an audit
stamp; a recognized but non-credit-worthy call still creates the audit stamp.
The document stores contributor attribution, while the D1 audit stores the
invocation's role, date, and scope.

### Current-format boundary

The former `generativeAssistance` document field and client-attribution array
are retired. They are not read or written by current authoring; the retired
field is rejected if it appears at the current storage boundary. JSON-LD is
also not a current authoring or D1 row format. It remains available through
the explicit `content:export`, `content:import`, and `content:check` commands
as a future interchange format; `content:canonicalize` is the one-time
migration path for legacy JSON-LD current rows.

The one-time `0020_purge_retired_document_snapshots` migration clears the
historical document-snapshot tables rather than attempting to preserve their
old attribution or format. `draft_assistance_stamps` is separate operational
audit data: it records invocation context, not immutable document history.

### Why human presence is currently load-bearing

The human author is present at session initiation. They may know which agent
is being used, which model version, and what configuration settings they
selected. Recording information unavailable or unverified in the client call
frame is a single deliberate act at the start of a session, not an ongoing
burden. The human also owns the lesson reviewer byline; it is deliberately not
assigned to an agent's focused pedagogy write.

This works reliably in a supervised single-author workflow. It does not scale to:

- Delegated or automated authoring pipelines where no human is present at invocation
- Multi-author workflows where session initiation is not centralized
- Long sessions where configuration changes mid-session
- Retrospective attribution where the session record must be reconstructed

These are the failure modes that the full primitive would eliminate.

---

## The Gap to the Full Primitive

Full session provenance capture requires the MCP protocol — or a layer above it — to convey model identity and configuration to the server at the invocation boundary, automatically and without agent self-report.

### What the protocol would need to provide

At minimum, for each tool call:

- A verified model identifier (not self-reported by the model; attested by the infrastructure that loaded it)
- A model version or checkpoint identifier
- Active configuration parameters material to output quality (reasoning mode, context window, system prompt hash)

These are facts the infrastructure knows at invocation time. They are not facts the agent knows about itself reliably. The protocol gap is not a capability gap — the information exists — it is an interface gap: the server has no channel through which to receive it.

### The four-property requirement

The companion paper identifies four properties that a complete session provenance capture primitive must satisfy simultaneously:

1. **Region/field-level** — attribution at the granularity of the domain modified, not merely the whole document
2. **Invocation-boundary** — captured at the moment the agent is handed its domain, not reconstructed afterward
3. **External** — recorded by the infrastructure, not self-reported by the agent
4. **Tamper-evident** — cryptographically anchored so the record cannot be modified after the fact

The current implementation provides property 1 at logical-domain granularity for focused calls, and properties 2 and 3 for the server-observed tool event and authenticated owner. It does not provide exact changed-field attribution, verified model/configuration identity, or property 4: the D1 audit has no cryptographic transparency or immutable external anchor yet.

### Standards landscape

Three existing standards address parts of this requirement:

**C2PA** (Coalition for Content Provenance and Authenticity, v2.1–2.4) provides region-level assertions and per-action `softwareAgent` attribution with cryptographic binding. Its binding operates at whole-claim granularity via a single signer and is self-asserted — a valid signature certifies the metadata was not modified since signing, but not that the attribution was captured externally at the moment of invocation.

**PROV-AGENT** (Souza et al., IEEE e-Science 2025) extends W3C PROV with an `AIModelInvocation` entity modelling agent identity, tool use, and response generation. Implemented via cooperative in-process instrumentation with no tamper-evidence; records agent identity and name but not model configuration.

**IETF SCITT** (Signed Claims → Transparency Service → Merkle-anchored receipts) provides the closest standards-track mechanism for external capture and tamper-evidence, but has not been connected to per-region document edit attribution or model-invocation provenance.

No existing standard simultaneously satisfies all four properties for structured-document agentic editing. The unoccupied intersection is where the full primitive sits.

---

## Relationship to Write-Domain Scoping

This document and [STORAGE-DOMAINS.md](STORAGE-DOMAINS.md) together cover both sides of the accountability gap described in the companion paper. Write-domain scoping answers what the agent may change; session provenance capture answers who changed it and under what conditions. Each is weakened by the absence of the other:

- Authority without attribution is unauditable: the domain boundary was enforced, but there is no reliable record of who acted within it.
- Attribution without authority is unreliable: the record names a contributor, but the contributor was never properly constrained.

The Concept Clusters implementation has made meaningful progress on both sides. [STORAGE-DOMAINS.md](STORAGE-DOMAINS.md) describes the write-domain scoping implementation and its limits. This document describes the provenance capture implementation and its limits. Together they constitute an honest account of where the paired primitives stand in a real system — further along than the round-trip model left things, and short of where the full primitives would take them.
