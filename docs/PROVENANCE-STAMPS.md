# Provenance Stamps: Session Provenance Capture in Concept Clusters

*Status: document provenance and infrastructure-level invocation capture are
implemented; fully attested session provenance remains aspirational.*

This document describes the provenance side of the accountability model for
Concept Clusters. It is written as a companion to the position paper and to
[STORAGE-DOMAINS.md](STORAGE-DOMAINS.md), which describes what an agent may
change. Repository-specific behavior is recorded in the [authoring domain
scoping implementation notes](dev-briefs/authoring-domain-scoping-implementation.md).

Both documents implement the paired primitives argued for in [The Integrity
Burden: Why Agentic Document Editing Belongs in the Infrastructure, Not the
Agent](https://github.com/jmajerus/write-domain-scoping).

---

## Why two provenance records exist

Provenance has two distinct audiences and time horizons. The puzzle needs a
compact, durable account of who contributed to it. The authoring
infrastructure needs an operational record of what happened when a tool was
invoked. Combining those records would either burden the authored document
with session telemetry or make the operational record too weak to explain a
contribution.

| Record | Purpose | Owner |
|---|---|---|
| Document `provenance` | Contributor names, collaboration mode, and optional per-contributor detail | Author and infrastructure |
| Assistance stamp | Invocation context: client, owner, time, role, and authoring scope | Infrastructure |

The document record is the model of record for contributor attribution and can
feed player bylines or editor summaries. The assistance stamp is an audit
event, not a document snapshot or immutable version history.

## Current implementation

At the MCP boundary, the server can recognize the calling client and observe
the authenticated authoring owner. For recognized clients, a newly created
puzzle draft and a substantial MCP edit can update document-level contributor
provenance. A trivial edit does not change the contributor list merely because
an agent touched the draft.

The infrastructure also records the invocation's tool, server capture time,
authoring role and date, and focused domain when a stamp is available. A
focused `content` or `pedagogy` operation identifies that domain; a complete
operation is recorded at the broader puzzle level. Model or reasoning hints
are retained when a client exposes them, but they are observations, not
attestations.

The implementation therefore occupies an intermediate position: attribution
and scope are captured by infrastructure at the invocation boundary, but the
system does not yet provide a complete, cryptographically verifiable session
record.

## Document provenance

The optional `provenance` object contains an ordered `contributors` list and,
when useful, a `collaboration` mode describing the relationship between human
and generative contributors. Contributors may be bare names or structured
entries with model, reasoning, or switch details. Known authoring hosts can be
recognized as generative; unknown names default to human unless explicitly
classified otherwise. Derivable kind values and provider data are not part of
the compact stored form.

For example:

```json
{
  "provenance": {
    "collaboration": "aiPrimary",
    "contributors": [
      { "name": "Claude", "model": "claude-opus-5", "reasoning": "high" },
      { "name": "jmajerus" }
    ]
  }
}
```

The author may supply model or configuration information that the invocation
boundary cannot verify. `reviewedBy`, when present, is an author-owned lesson
byline and is not another contributor. Focused agent writes cannot replace
the provenance domain; human editorial workflows remain responsible for
human-owned lesson credit and review attribution.

## Assistance stamps

An assistance stamp is assembled by the server rather than self-reported by
the agent. It can contain:

- the tool and target draft or puzzle;
- server capture time and the supplied authoring role and date;
- authenticated owner and actor context when available;
- the focused authoring scope;
- recognized client identity; and
- model or reasoning hints when the client exposes them.

Persistence is best-effort and fire-and-forget. A failed audit write must not
make a valid authoring operation fail. The stamp intentionally does not claim
to contain a before/after document, a content hash, a field-level diff, a
complete revision record, or cryptographic tamper evidence.

The old `generativeAssistance` document field and client-attribution array are
not part of this model. Current authoring uses simplified documents, keeps
repository metadata outside the document, and retains JSON-LD only as an
explicit interchange format. Historical document snapshots are handled as a
storage cleanup, not as provenance the agent must preserve. See the [implementation
notes](dev-briefs/authoring-domain-scoping-implementation.md) for those
boundaries.

## What remains human-dependent

Human authors remain the reliable source for facts the protocol does not
provide or verify: the model and configuration selected for a session, the
decision to name a contributor, and the editorial reviewer associated with a
lesson. This is manageable in a supervised workflow because it can be done at
session initiation or during editorial review.

It does not scale cleanly to unattended authoring, decentralized teams,
configuration changes during a long session, or retrospective reconstruction
of a session. Those are the cases a complete infrastructure primitive should
address.

## The gap to a full session primitive

A complete session provenance primitive would capture model identity and
configuration automatically at the moment infrastructure hands an agent its
domain. It would be external to the agent's own claims and resistant to
post-hoc alteration.

The position paper identifies four properties that must hold together:

1. **Region/field-level** — attribution at the granularity of the domain
   modified, not merely the whole document.
2. **Invocation-boundary** — captured when the agent receives its domain, not
   reconstructed afterward.
3. **External** — recorded by the infrastructure, not self-reported by the
   agent.
4. **Tamper-evident** — anchored so the record cannot be silently modified
   after the fact.

The current system provides logical-domain scope for focused authoring calls,
and external capture of the server-observed event and authenticated owner. It
does not provide exact changed-field attribution, verified model or runtime
identity, or tamper evidence. The D1 audit is useful operational provenance,
not the final primitive.

## Standards landscape

Three standards illuminate parts of the problem:

**C2PA** provides cryptographically bound provenance assertions and
per-action software-agent attribution. Its normal binding is claim-level and
self-asserted; it does not by itself prove that attribution was captured
externally at invocation time.

**PROV-AGENT** extends W3C PROV with an entity for AI model invocation, tool
use, and response generation. It models the event well but relies on
cooperative instrumentation and does not provide tamper evidence or complete
configuration capture.

**IETF SCITT** provides signed claims, transparency services, and
Merkle-anchored receipts. It is close to the external and tamper-evident side
of the requirement, but it has not been connected here to region-level
structured-document edit attribution or model-invocation provenance.

No existing standard simultaneously supplies all four properties for
structured-document agentic editing. That unoccupied intersection is where
the full primitive remains to be developed.

## Relationship to write-domain scoping

Write-domain scoping answers what an agent may change; provenance answers who
acted and under what observed conditions. Authority without attribution is
unauditable. Attribution without authority is unreliable. Together, the two
documents describe a system that has moved beyond unconstrained round trips
while remaining honest about the limits of current protocol and storage
support.
