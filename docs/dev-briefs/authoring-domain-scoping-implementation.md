# Authoring Domain Scoping: Implementation Notes

*Status: implemented on `main` as the first production slice of the
write-domain-scoping design.*

The linked public documents [STORAGE-DOMAINS.md](../STORAGE-DOMAINS.md) and
[PROVENANCE-STAMPS.md](../PROVENANCE-STAMPS.md) explain the design for readers
of the position paper. This note records repository-specific behavior for
maintainers: module boundaries, D1 storage, compatibility rules, migration
order, and verification commands.

## Implementation map

| Area | Source of truth |
|---|---|
| Domain constants, projections, merge rules, protected fields | `modules/authoringDomains.js` |
| Authored-document normalization and storage boundary | `modules/authoredPuzzleDocument.js` |
| Hosted MCP read/write contract | `modules/hostedMcpAuthoringServer.js` |
| Draft projections and D1 persistence | `modules/d1DraftRepository.js` and migration `0019_authoring_domains` |
| Contributor normalization and automatic document attribution | `modules/authoringProvenance.js` and `modules/mcpClientIdentity.js` |
| Invocation audit record and best-effort persistence | `modules/authoringAssistanceLog.js` and migration `0008_draft_assistance_stamps` |
| One-time cleanup of document snapshots | migration `0020_purge_retired_document_snapshots` |

## Domain contract

`modules/authoringDomains.js` defines four logical domains:

- `content` — puzzle identity, copy, clusters, and bridge core;
- `pedagogy` — bridge relationship annotations, lenses, learning
  introductions, category/discovery metadata, and editorial fields;
- `provenance` — contributor attribution; and
- `system` — repository-owned state.

Only `content` and `pedagogy` are agent-writable. The read domains are
`complete`, `content`, and `pedagogy`; `complete` remains the compatibility
path for clients that still work with the whole authored document.

For a focused read, `projectAuthoredDocument()` removes provenance, system
fields, and the derived `large` flag. Pedagogy receives content as read-only
`context`. Its projection also omits the human-owned
`learningIntroduction.credit`. Content receives no pedagogy context.

For a focused save, `applyAuthoredDomain()` replaces the selected projection
as a whole, so omission removes an optional field in that projection. The
other projections are retained and the infrastructure reassembles the
complete document. A pedagogy bridge entry must identify an existing content
bridge and may change only its annotation fields. Protected fields and fields
owned by the other domain are rejected. Mechanical `repair` is accepted for
complete and content saves, not pedagogy saves, because it repairs content
fields.

## Projection and sub-schema refinement

The implementation currently has two related but separate focus mechanisms:

- `projectAuthoredDocument()` defines the data and ownership boundary for a
  domain read or write; and
- `get_authoring_schema` supplies focused guidance and schemas for the
  `core`, `review`, `pedagogy`, and `publication` phases. Those responses set
  `preserveExisting: true`; they are task views, not independently complete
  replacement documents.

The intended next refinement is to make these dimensions composable. The
canonical simplified schema should remain the source of truth, supplemented
by a centrally maintained ownership/context registry that records, for each
field:

- its owning domain;
- whether it may be exposed as read-only context to another domain;
- the stable identity used when it is referenced across domains; and
- whether it is authored, protected, or derived.

From that metadata, infrastructure can derive or validate a domain projection
and then narrow it to a pass sub-schema. A pass sub-schema is an agent-facing
contract, not a valid standalone puzzle document. It should contain only the
fields the pass may change, while cross-domain context should be supplied
separately and marked read-only. The agent should not have to reproduce a
parallel domain merely to keep it intact.

The conceptual composition is:

```text
canonical schema + ownership/context metadata
        -> domain projection + read-only sibling context
        -> task or phase sub-schema
        -> narrow agent response
        -> retained sibling domains + infrastructure merge
        -> complete-document validation
```

The merge contract needs two explicit modes. A partial phase pass preserves
fields omitted because they are outside that pass. A deliberate whole-domain
replacement retains the current behavior of treating omission as removal of
optional fields within the selected domain. The API must identify which mode
is being used; it must not infer deletion from a response produced against a
narrow sub-schema.

Cross-domain references should use stable identities and small, purpose-built
context surfaces. For example, a pedagogy pass may need bridge identity and
content meaning, but it should not return the bridge core or cluster data.
Infrastructure can resolve those identities against the retained content
projection, reject unknown or conflicting references, and apply the
pedagogical annotations before validating the assembled document.

Open decisions for this refinement are the ownership/context metadata shape,
whether sub-schemas are generated or checked against a hand-authored
registry, how domain and phase selectors are represented in the authoring
API, and how sub-schema versions are tied to the canonical schema.

## D1 storage

Migration `0019_authoring_domains` adds `content_json`, `pedagogy_json`, and
`provenance_json` to `puzzle_drafts`. The existing `document` column remains a
materialized complete simplified document used by validation, publication,
rendering, and Freeze. The projections are the focused-read/write storage;
they are not a new player or Freeze format.

The new projection columns are nullable for rollout. If all three are absent,
`D1DraftRepository` can fall back to an older simplified complete document and
the next successful write materializes the projections. This fallback is not
valid for JSON-LD or retired fields. `content_drafts` and
`published_documents` remain complete simplified documents; they do not use
the puzzle-draft sidecar columns.

System metadata stays in D1 columns and response envelopes: owner, draft id,
revision, timestamps, hashes, status, validation state, checkout/publication
state, review timestamps, and Freeze-cue state. The authored document does
not carry those values, and no `system_json` column is needed. JSON-LD may
represent portable aliases at its explicit interchange boundary only.

Any writer that updates a complete puzzle snapshot outside the draft
repository must refresh all three projections in the same update. Category
rename propagation is the current example.

## Canonicalization, batch migration, and cleanup

Canonicalization is the normal forward path for schema evolution, not merely
a prelude to the current cleanup. `content:canonicalize` centralizes the
read/write transforms and can produce a reviewable report or an apply plan
for current D1 rows and Git sources. Transforms should be shared, lossless
where possible, idempotent, and followed by the same semantic validation used
by authoring and publication. This keeps future compatibility logic out of
individual domain passes.

Use the following lifecycle for future changes:

1. Lossless, non-breaking changes belong in the shared read/write
   canonicalization pipeline and should be safe to run repeatedly.
2. Lossless changes that affect the existing corpus should use a batch
   canonicalization pass with a dry-run/apply migration and
   optimistic-concurrency safeguards. Review unresolved rows before applying
   the plan.
3. Breaking or ambiguous changes require an explicit target format or
   reviewed migration. Unknown, unmappable, or ambiguous data must block the
   migration rather than being guessed at or silently dropped.

The batch pass is deliberately scoped to active/current material: current D1
rows, current Git sources, and generated artifacts derived from them. It is
the bridge between reusable canonicalization logic and a stable corpus. It
does not imply that every retained historical revision must be rewritten.

Purge is the final history decision, not the migration mechanism. Historical
revisions may contain shapes from several generations of the schema. Unless
they have an explicit format/version and reader policy, they should not be
fed indefinitely through the current canonicalizer. Retain them only when
their recovery or audit value justifies that support burden; otherwise purge
the disposable historical rows after the active corpus is canonical. A
schema change does not automatically justify purging current records.

The current authoring/storage contract is simplified JSON:

- `assertCurrentAuthoredDocument()` rejects a root `@context` and therefore
  rejects JSON-LD at current row and domain boundaries.
- `assertNoRetiredAuthoringFields()` rejects the retired root
  `generativeAssistance`. There is no compatibility fold that can resurrect
  that field.
- Invalid but simplified intermediate drafts remain writable where the normal
  authoring workflow permits them. JSON-LD is different: it must pass through
  the explicit interchange or migration boundary first.
- `termRole` remains a narrow migration-time fold and is removed before the
  current schema is validated. The former client-attribution array was folded
  into `provenance`; it is not part of current authoring.

The supported JSON-LD interchange commands are `content:export`,
`content:import`, and `content:check`. The current corpus pass uses
`content:canonicalize` to convert legacy JSON-LD current puzzle rows when the
conversion is lossless and semantically valid; the same tool remains the
forward path for future compatible schema changes. Current rows containing
`generativeAssistance` require manual replacement or removal because the
retired field is intentionally rejected.

Migration `0020_purge_retired_document_snapshots` deletes every row from
`published_document_revisions` and `puzzle_draft_history`. Those are historical
document snapshots, so they are purged rather than converted. It leaves the
current `puzzle_drafts`, `content_drafts`, and `published_documents` rows in
place. It also leaves `draft_assistance_stamps` and `puzzle_review_events` in
place because those are operational audit/review records, not document
snapshots.

The purge is a one-time data cleanup, not removal of the mechanisms. Future
publishes still append a published revision, and distinct draft saves still
maintain the bounded working-copy undo stack. Removing those mechanisms would
be a separate schema and repository change.

## Document provenance and invocation stamps

`provenance` is optional in the authored document. Its canonical shape is an
optional collaboration mode plus an ordered contributor list. Contributors
may be supplied as names or objects with kind, model, reasoning, and switch
details. Known host names infer `generative`; unknown names default to
`human`; explicit kind overrides are retained. Derivable kind values and
provider data are not persisted. `reviewedBy` is an author-owned lesson
byline, not a contributor.

For recognized MCP clients:

- a new draft created from a supplied document or skeleton receives automatic
  contributor credit;
- seeding a working copy from an existing published document does not invent
  credit;
- a substantial MCP save may add or update contributor credit;
- a trivial save records the call but does not change the contributor list;
- omitting provenance from a complete save preserves existing provenance; and
- focused writes cannot replace provenance.

The separate `draft_assistance_stamps` table stores an
`authoring_assistance_stamp` record with server capture time, tool and
draft/puzzle identifiers, role, date, scope, recognized client information,
and available actor context. Focused writes record `content` or `pedagogy`;
complete writes record `puzzle` and may also record `learningIntroduction`.
The record is an audit event, not a before/after document snapshot, content
hash, field-level diff, or tamper-evident history entry. D1 persistence and
Analytics Engine emission are fire-and-forget and must not make the authoring
call fail.

## Operational verification

Before releasing the hosted authoring Worker after a schema or corpus change:

```sh
npm run content:canonicalize -- --json
npm run content:canonicalize -- --apply-d1
npm run test:worker
npm test
```

Review the canonicalization report before applying it. Apply the D1 migrations
with `npm run mcp:hosted:migrate` only when the destructive snapshot purge and
the current-row cleanup are understood; deploy afterward with the normal
hosted release process. The public canonical-content guidance remains the
authoritative description of the corpus migration sequence.

## Open design decisions

Partitioning does not require every presentational field to remain authored.
Cluster color is currently still an optional authored field, with rendering,
validation, and the human authoring UI supporting explicit values. If it is
made purely ordinal and derived, remove it from the agent-facing schema and
storage contract while retaining a derived runtime color for rendering. Lens
color is a separate visual concern.

Likewise, migration `0020` intentionally purges existing document snapshots
without deciding whether future published-revision or working-copy history
should disappear. That decision belongs to a separate repository/storage
change, not to the domain partition itself.
