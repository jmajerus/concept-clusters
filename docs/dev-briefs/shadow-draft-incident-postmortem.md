# Post-mortem: the shadow draft over `short-lived-words`

**Date of incident:** 2026-09-23 · **Written:** 2026-09-23 · **Severity:** near miss, no data loss

On 2026-09-23 an MCP client created a complete, from-scratch puzzle draft under the
id `short-lived-words` — an id that already held a finished, published, frozen board.
Nothing was corrupted and nothing was lost. This is a post-mortem of a near miss:
the draft was one Publish click away from replacing a good board with a worse one,
and the system offered no signal that the situation existed.

## Timeline (UTC)

| When | What |
| --- | --- |
| 2026-09-21 23:44:16 | `short-lived-words` published to D1, revision 1. Seven terms, eight lenses, learning introduction. |
| 2026-09-21 23:57:01 | Freeze writes it to git as `puzzles/vocabulary/short-lived-words.js` (commit `382bb96`). |
| 2026-09-22 00:12:28 | A companion board is drafted under the misspelled id `long-live-words`. |
| 2026-09-23 01:10:10 | **A second, unrelated draft is created under `short-lived-words`** — a complete 12,818-byte document, written from scratch, not seeded from the published row. |
| 2026-09-23 ~03:00 | A human validates the draft, hits `clusters[0]: Unrecognized key: "lenses"`, and asks for a fix. The shadowing is discovered while investigating. |

The shadow draft still sits at revision 1 with `updated_at == created_at`: created in
one shot and never touched again.

## What was actually wrong with the draft

Three defects, in increasing order of how much they matter:

1. **`lenses` nested inside `clusters[0]`.** `lenses` is a root-level, pedagogy-domain
   array ([`authoringFieldOwnership.js:59`](../../modules/authoringFieldOwnership.js)).
   Nested there it is an unrecognized key, which is the validation error the human saw.
2. **`targets: ["fugiture"]`** — a term that exists nowhere in the board. The published
   board spells it `fugitive` correctly; the typo is confined to the draft.
3. **All eight lens prompts contain their own answer.** "The actor's fame was always
   transitory…" with `targets: ["transitory"]`. Only three of the eight have a `___`
   blank at all, and in each of those the blank is for a *different* word than the target.
   The board is unplayable as written.

Defect 3 is the important one, because defects 1 and 2 are the kind a repair pass fixes
in a minute — and repairing them would have produced a *valid* draft that was still
strictly worse than the live board, with validity being the only thing standing between
it and a Publish.

## Impact: none, and why that was structural

The published document was verified intact after the fact: lenses at the root,
`fugitive` spelled correctly, `____` blanks, `lensMode: sequential`, learning
introduction present, matching the git artifact.

That was not luck. Drafts and published documents live in separate tables —
`puzzle_drafts` and `published_documents` — and creating a draft only ever inserts into
the first. The door between them opens one way and only on an explicit act: a human
Publish on `/admin/drafts`, or an agent passing `publish_to_authoring`. Neither
happened.

Worth stating plainly because it is easy to assume otherwise: **a draft cannot damage a
published board by existing.** It can only do damage by being published.

## Why it was possible

### 1. `create_puzzle_draft` never looks in the other drawer

The MCP server instructions say, in as many words:

> To edit an existing published puzzle, call `create_puzzle_draft` with
> `seed_from_published=true` and that `puzzle_id`; do not open a blank skeleton for a
> live id.

That rule is enforced by nothing. The non-seed branch of `create_puzzle_draft` goes
straight from the supplied document to `draftRepository.create`. The repository rejects
a duplicate **draft** id via a UNIQUE constraint, but no code path consults
`published_documents`. An id that is live in authoring play and frozen into git looks,
to that branch, exactly like a free id.

So the guardrail existed only as prose in a tool description, addressed to a reader who
had to choose to honour it.

### 2. The creating client left no trace

`short-lived-words` has **no assistance stamp and a null `provenance_json`**. That is
not because stamping is broken — the table holds 201 stamps across 54 drafts, running
from 2026-08-28 to the present.

The cause is a specific branch in
[`mcpClientIdentity.js:225-226`](../../modules/mcpClientIdentity.js):

```js
const identity = identifyMcpAssistanceClient({ ctx, server, settings });
if (!identity?.system) return { document, stampRecord: null };
```

`identifyMcpAssistanceClient` matches the client against ten host fingerprints
(cursor, claude-code, claude web, copilot, gemini-cli, muse-code, muse, codex,
kilo-code, zcode) and returns `null` for anything else. On `null`, the stamp is skipped *and* no generative
provenance is written — the draft is created anonymously, silently, with no record that
anything unusual occurred.

**We therefore cannot say which client did this.** The absence of a stamp is itself the
strongest evidence we have: the creating client matched none of the ten known hosts.

### 3. Nothing surfaces a draft that shadows a published board

`/admin/drafts` shows publication badges and freeze state, but nothing distinguishes
"working copy opened from the published board" from "entirely different document filed
under a published board's id". Both look like a draft with a live sibling.

## Blast radius

A scan of production D1 for drafts created after their published row returned nine rows.
Three are byte-identical to their published document (clean seeded working copies).
Of the six that differ:

- **`short-lived-words`** — revision 1, differs substantially. The subject of this
  post-mortem.
- **`what-public-health-does`** — revision 1, differs from published but at *identical
  byte length* (10,908 both). **Since resolved:** the structural check scores it 10 of
  10 nodes surviving with a field-level diff of zero, so the stored bytes differ only in
  serialization. A clean seeded working copy, not a second incident.
- The remaining four are at revision 2–3, i.e. seeded and then deliberately edited.
  Normal.

A revision-1 draft whose content diverges from its published row is the detectable
signature of this failure. That is a cheap query, and it is the basis of recommendation 3.

## What worked

- **Table isolation.** The one-way door held; no published row was touched.
- **Freeze had already banked the good version.** Because the board was frozen to git
  two minutes after publication, there was an independent, diffable copy to compare
  against. The investigation was fast because of it.
- **Validation caught the structural defect before publication**, which is what brought
  a human to look at all.

## Recommendations

Ranked by value over cost. **All four are implemented.**

1. **Refuse a non-seeded `create_puzzle_draft` for a published id.** *(Done, and since
   hardened into an invariant — see below.)* Look in
   `published_documents` (and the git corpus) before creating; on a hit, error with
   "that id is live — pass `seed_from_published=true` to open a working copy from it."
   This is the fix that would have prevented the incident outright, and it converts a
   prose rule into an enforced one. Small and server-side, but it changes behaviour for
   every client of the hosted server and so needs a `wrangler deploy`.

2. **Never let an unidentified client write anonymously.** *(Done — recording, not
   refusing.)* An unrecognized host now produces an audit row marked
   `client.unidentified: true` carrying whatever name it presented. Refusing the write
   outright was the stricter option and was not taken: it would break a new host on its
   first call, and the goal here is an audit trail, not an allowlist.

   It also records **provenance**, which was a second pass on this recommendation after
   the first version stopped at the audit row. Reaching an authoring tool through MCP is
   itself the evidence of generative authorship — a human does not hand-call
   `create_puzzle_draft` — so an unrecognized client is recorded as AI, just unnamed:
   the contributor `generative assistance`, rendering as "Drafted with generative
   assistance". Stopping at the audit row left the board asserting *human* authorship by
   default, which is the claim that most needs evidence, and left the editor unable to
   correct it (see below). Details in [PROVENANCE-STAMPS.md](../PROVENANCE-STAMPS.md).

3. **Badge shadowing drafts on `/admin/drafts`.** *(Done.)* Built into the existing
   diff engine rather than beside it: `draftShadowsPublished` in
   [`draftReviewDiff.js`](../../modules/draftReviewDiff.js) reads the same
   `diffPublishedDraft` result the review page already renders, and asks how much of
   the published board's identity survives into the draft — clusters, bridges and
   lenses still present under the same key. An edit keeps nearly all of them and
   changes their contents; a document written from scratch under a live id keeps almost
   none. Below half, the list badges the row `shadow` and the diff summary stops
   describing the marks as an edit history, because for a shadow they are the gap
   between two unrelated boards.

   The first attempt used "revision 1 and differs at all", on the reasoning that a
   seeded working copy starts byte-identical. That was wrong, and the existing tests
   caught it: `energy-flow-review` is a legitimate second working copy sitting at
   revision 1 with one legacy field changed, and it was accused immediately. The
   structural measure has no such false positive and does not decay once the shadow is
   edited.

4. **Guard id drift on `save_puzzle_draft`.** *(Done.)* A save whose `document.id`
   differs from the stored one is rejected and points at the drafts-page rename. Same
   family: identity changing silently through a path never meant to change it, which
   would leave the row keyed by the old id while a later Publish wrote to the new one.

## Disposition of the draft

Recommendation: **delete it.** The published board already is what the draft was trying
to be, and is better on every axis. If `short-lived-words` needs editing later, the
correct opening move is `create_puzzle_draft` with `seed_from_published=true`.

Not yet done — awaiting a decision.

## A related defect this surfaced

Chasing recommendation 2 turned up a separate bug in
`applyProvenanceCollaboration`. Setting collaboration to `aiPrimary` on a document with
only human contributors **silently returned `human`** — no error, no warning. `human`
and `ai` raised a clear error in the same situation; the two mixed modes fell past the
consistency check and were rewritten by inference.

Wrong on three levels, and all three are now fixed:

1. **The silence.** Two of the four modes told you, two did not. All four now raise.
2. **The direction.** It resolved toward `human`, laundering an AI-written board into an
   assertion of human authorship, which then flowed into the player-facing byline.
3. **The asymmetry.** `authorName` could supply a missing *human* contributor and make a
   mode stick; there was no equivalent for the generative side, which could only ever be
   populated automatically by a recognized client. Combined with an unattributed write,
   that made the record permanently uncorrectable by hand: `ai` errored, `aiPrimary`
   silently reverted, and adding an author name only added another human. Recording the
   unnamed generative contributor dissolves this: the AI side is now populated from the
   MCP pathway itself.

## Hardening: from a check to an invariant

The guards above are reads that precede a write, which leaves a window: a Publish
landing between the check and the insert would still produce a shadow. With D1 as the
only creation path, that window can be closed properly rather than documented.

`D1DraftRepository.create` now makes the check part of the write:

```sql
INSERT INTO puzzle_drafts (...)
SELECT ?, ?, ...
WHERE NOT EXISTS (
  SELECT 1 FROM published_documents WHERE kind = 'puzzle' AND id IN (?, ?)
)
```

Zero rows inserted means the id went live, and the repository raises
`PublishedIdConflictError`. Both identities are gated: the row id, which keys the drafts
list, and `document.id`, which is what a later Publish writes to.

The one legitimate draft over a live id is a working copy opened from that board, so
`openPuzzleWorkingCopy` marks its create `seededFromPublished`. That flag is set by
server code and never appears in a tool schema, so an agent cannot ask for the
exemption.

What this buys beyond closing the race: every caller of the repository is covered,
including ones nobody has written yet. The three call-site guards are now
defence-in-depth and better error messages rather than the only thing standing there.

**Auto-renaming a colliding id was considered and rejected.** Appending a digit would
prevent the *id* collision while leaving a from-scratch duplicate of a live board under
a meaningless id, with no error and nothing to notice — and it would break the caller's
model of what it is working on, which is the incident's own mechanism. It is also the
same move as the collaboration bug below: substituting the system's guess for an
explicit statement. Suffixing belongs to an explicit "duplicate this puzzle" action, if
one is ever wanted, where making another copy is the stated intent.

### Identity as a write-domain rule

The `save_puzzle_draft` guard (recommendation 4) started as a hand-rolled comparison in
the MCP server. It now lives where the rest of "who may write this" lives: a `writeOnce`
axis on the field-ownership map, enforced by `assertNoWriteOnceDrift`.

Placing it took two passes, and the first was wrong in an instructive way. It went in at
the MCP boundary and inside `applyAuthoredDomain`, which covers domain writes — but a
*complete*-document save through `D1DraftRepository.save` or
`puzzleDraftStore.replaceDraft` went around both, and the construct board PUTs exactly
that, straight to the store with no MCP in front of it. Since `puzzle_id` is recomputed
from the document on every save, that route could still have split the row key from the
document identity. The rule now sits in the stores themselves, which is the same lesson
as the creation gate: a boundary check protects the callers you thought of.
See [STORAGE-DOMAINS.md](../STORAGE-DOMAINS.md#write-once-fields).

## Validation against production

The finished classifier was run over every draft in production D1 created after its
published row — the nine rows in the blast-radius scan:

```
SHADOW short-lived-words         survived 1/9    field diff 12
ok     choice-under-influence    survived 12/12  field diff 0
ok     from-dna-to-gene-expression survived 12/12 field diff 2
ok     what-public-health-does   survived 10/10  field diff 0
ok     counted-and-modeled       survived 9/9    field diff 2
ok     philosophy-branches       survived 7/7    field diff 2
ok     dose-of-reality           survived 8/8    field diff 0
ok     algebra-basics            survived 5/5    field diff 0
ok     media-literacy            survived 5/5    field diff 0
```

One flagged, eight clear, with the threshold (half) sitting in a wide empty gap between
1/9 and 5/5. Heavy editing moves the field diff, not the survival ratio, which is why
the structural measure is the stable one.

## Open questions

- Which client created the draft? Unanswerable from the database as it stands. If it
  recurs after recommendation 2 ships, the next one will be attributable.
*(The admin **New puzzle** form gap noted here has since been closed: it refuses a live
id on the same terms, and all three paths that can bind a draft to an id — rename,
`create_puzzle_draft`, and the form — now share one definition of "this id is taken" in
[`draftIdRename.js`](../../modules/draftIdRename.js). The hosted worker never had the
gap: its `/admin/drafts` POST only accepts the seeded route.)*
