# Draft lineage: replacing shadow detection with a recorded fact

*Status: proposal. Nothing here is built.*

## The problem in one paragraph

A puzzle working copy claims an identity — its row id says "I am the working
copy of `plate-boundary-landforms`" — and until recently nothing checked that
its contents had any relationship to the published board of that name. That
gap produced the shadow-draft incident. The gap is now closed at creation
(`d1DraftRepository.create` gates the insert itself with `WHERE NOT EXISTS
(SELECT 1 FROM published_documents …)`, so there is no check-then-write race).
What remains is that we still *detect* shadows by a content heuristic —
`draftShadowsPublished` asks whether fewer than half the published clusters,
bridges and lenses survive — because when it was written, lineage was not
recorded anywhere. The heuristic cannot distinguish a sanctioned rebuild from
a genuine shadow, so it will keep raising the question about legitimate work,
indefinitely.

## What this actually is, in standard terms

This is **check-out / check-in**, and we have implemented most of it already
without naming it that way.

In classical ECM systems — Documentum, Alfresco, SharePoint — a document has a
canonical record. You *check out* to obtain a working copy, and the system
records the check-out: who holds it, and **which version it was taken from**.
Check-in produces a new version of the canonical record. The check-out record
is the lineage; nothing needs to be inferred from content, because the system
wrote down where the working copy came from.

Our `create_puzzle_draft(seed_from_published=true)` **is** the check-out. The
refusal message says as much:

> `"x" is already a published puzzle, so a fresh draft under that id would
> shadow it rather than edit it. Call create_puzzle_draft with
> seed_from_published=true and that puzzle_id to open a working copy from the
> published snapshot, then save your document over it.`

Publish is the check-in. What we do not do is **persist the check-out record**.
`seededFromPublished` exists only as a create-time parameter controlling the
insert gate; it is never written to a column. `puzzle_drafts` has
`base_commit_sha` (a git anchor for the eventual PR) and
`installed_content_hash` (local dev install state), but neither records which
published revision a working copy was taken from.

So: we built check-out, used the check-out fact to gate the insert, and then
threw it away. Everything below follows from putting it back.

## Anchors, and where we should and should not follow them

### Git: ancestry is stored, similarity is only ever cosmetic

Git never needs to guess whether a commit is "really" a descendant of another
— parents are recorded in the object graph. Notably, git *does* compute
content similarity, for rename detection (`-M`, the similarity index), and it
uses it **strictly for presentation**. A rename shown at 87% similarity does
not change what the commit is; identity comes from the graph.

We currently do the inverse: a content-similarity score *is* our identity
signal. The correction is not to abandon similarity, but to demote it to what
git uses it for — a display nicety — and take identity from a recorded fact.

**Follow this one.** It is the single most transferable idea here.

### ECM check-out: the base version, not just a flag

A check-out record in Documentum or Alfresco names the version the working
copy came from, not merely that one was taken. That distinction matters for us
beyond shadows: it is the same fact needed to detect a **stale** working copy.

We hit this concretely. Six drafts had drifted behind their published rows,
and publishing any would have reverted canonicalized `{text}` objects to
legacy strings, dropped whole `clusters[].terms` arrays, or rewritten cluster
ids. Detecting that required reconstructing the comparison by hand, after the
fact, against the live published document. Had each working copy recorded
"taken from published revision 4," and the published row now reads revision 7,
the staleness is a subtraction rather than an investigation.

**Follow this one**, and prefer the base revision over a boolean.

### MediaWiki: `page_id` versus title

MediaWiki keeps a surrogate `page_id` distinct from the human title. Delete a
page and recreate it under the same title and you get a new `page_id` — which
is precisely our shadow situation, made visible by having a second identity
that content cannot forge.

Kubernetes does the same with `metadata.uid` versus `metadata.name`, and for
the same reason: controllers must distinguish "the object I was watching" from
"a different object that took its name."

**Do not follow this one.** A surrogate id for puzzles would have to thread
through the generated modules in `puzzles/`, catalogue entries, `relatedPuzzles`,
the manifest, and every inbound link, all to disambiguate a case the
insert-level gate already makes unreachable. The human-meaningful id *is* the
identity here, deliberately — see STORAGE-DOMAINS.md on `writeOnce`. Adding a
surrogate would be solving a problem we do not have, at a cost spread across
the whole corpus. I raise it only to say explicitly that it was considered and
rejected, because it is the textbook answer and its absence should not look
like an oversight.

### Records management: supersession

Records systems that permit a record to be replaced record it as a *superseded
by* relationship: an explicit, logged act rather than an inference. This is the
closest analogue to "rebuild an unsalvageable puzzle from scratch."

**Follow the spirit, skip the machinery** — see "What I would not build."

## Where we diverge, and why

**No draft revision ledger.** The obvious ECM move is to version the working
copy. We deliberately removed that: a D1 draft revision ledger was stripped as
a "2nd-rate GitHub," and git is the version history. A working copy here is a
single mutable row with optimistic concurrency (`expectedRevision`) plus a
small capped undo stack (`puzzle_draft_history`). The proposal below adds one
recorded fact to that row; it does not reintroduce versioning, and should be
rejected if it starts drifting that way.

**Check-in is two steps, not one.** Publish writes the D1 canonical row;
Freeze writes the git files that production serves. This is unusual for a DMS
and worth stating plainly, because it is the cause of a recurring confusion:
correcting D1 changes nothing a player sees until a non-seed cue and a freeze.
Lineage does not fix that, and nothing here should pretend otherwise.

**No locking.** A check-out in ECM typically locks the document. We have a
single sequential editor and have already decided to fix races that destroy
work while declining ones that only make recoverable clutter. The check-out
record proposed here is *descriptive* — it records where a copy came from — and
grants no exclusivity.

## The proposal

Add to `puzzle_drafts`:

| column | meaning |
|---|---|
| `seeded_from_revision` | the `published_documents.revision` this working copy was opened from; `NULL` when no published row existed (an original draft) |
| `seeded_at` | when it was taken |

`seededFromPublished` stays a create-time parameter and keeps gating the
insert. The difference is that the seeding helper now writes what it knew.

Then:

1. **`draftShadowsPublished` takes the fact, not the ratio.** A shadow becomes
   "a published row existed and this working copy was not taken from it." After
   the insert gate, that can only be a pre-guard legacy row. A rebuild — seeded,
   then wholly rewritten — stops being flagged, permanently.

2. **Staleness becomes a subtraction.** `seeded_from_revision` against the
   published row's current `revision` answers "has published moved since this
   copy was taken?" without comparing documents. That is the check that would
   have caught the six divergent drafts before they were a problem, and it is
   cheap enough to run on the drafts list.

3. **Keep the similarity score for display only**, or drop it. It is honest as
   "82% of the published board survives here," useful next to a large diff, and
   no longer load-bearing. I lean toward keeping it as a number and deleting
   the shadow *verdict* it currently produces.

### Backfill

Existing rows cannot be retroactively classified, and should not be guessed at.
Set `seeded_from_revision` to `NULL` with a separate `lineage_unknown` marker,
or simply treat `NULL` as unknown and accept that pre-migration rows answer
"don't know" to both questions. This is benign today: a scan of all 155 drafts
with a live published counterpart currently returns **zero** shadows, so the
unknown set contains nothing alarming. New rows are exact from the start.

## What I would not build

**A "rebuild" marker.** Tempting, and it was my own suggestion in conversation,
but once lineage is recorded a rebuild is simply a seeded working copy with a
large diff, and the system already describes that accurately. Adding a flag
asks the editor to declare an intention the data already shows, and creates a
new way to be wrong (a rebuild nobody marked, a marker nobody cleared). If it
turns out that "this board was replaced wholesale on 2026-10-01" is something
you actually want to *read later*, the honest place for it is the git commit
that freezes the change — which already records it, in prose, for free.

**A surrogate puzzle id.** Covered above. The textbook answer, wrong for this
corpus.

## Where this is clunky, and other reservations

- **Two columns for one fact.** `seeded_at` is arguably redundant with
  `created_at` for a seeded row. I would probably drop it and keep only
  `seeded_from_revision`, accepting that a draft seeded, then left for a month,
  reports the revision but not the age of the decision. Mentioning it because
  the tidy version of this proposal has one column, not two.

- **`NULL` is doing two jobs.** It means both "no published row existed" and
  "we don't know." That is the kind of overloading that reads fine now and
  confuses someone in six months. The clean fix is a small enum
  (`original` / `seeded` / `unknown`) alongside the revision, which is more
  schema than the problem strictly warrants. I genuinely do not know which way
  to go and would take a second opinion.

- **It does not eliminate the concept, only the false positives.** The request
  that prompted this was to never think about shadow drafts again. Lineage gets
  you most of the way — the detector stops raising legitimate rebuilds, and the
  legacy set is currently empty — but "shadow" remains a word in the codebase
  describing a state that can still exist in old rows. Deleting the concept
  outright would mean deleting the badge and trusting the gate, which is
  defensible once the legacy set is verified empty and stays that way.

- **The staleness win is the real payoff, and it is a side effect.** If this
  proposal is worth building, it is at least as much for catching stale working
  copies before a publish reverts published work as for shadows. If you only
  care about shadows, the cheaper move is to verify the legacy set is empty,
  delete the heuristic, and rely on the insert gate.

## Open questions

1. `seeded_from_revision` alone, or with a lineage enum?
2. Delete the shadow verdict entirely once lineage lands, or keep the badge for
   legacy rows?
3. Is stale-working-copy detection worth surfacing on the drafts list, or only
   at publish time, where the damage would actually occur?

### Claude Opus 5 commentary:

Written for: you, plus whoever picks up the authoring system later — it's a dev brief, so it assumes the codebase but not this conversation.

This brief is intentionally a proposal; revise it as the lineage design is implemented.

**The central finding, which reframes the whole thing:** this is **check-out / check-in**, and we already built it without naming it. `seed_from_published` *is* the check-out; Publish is the check-in. What we don't do is persist the check-out record — `seededFromPublished` gates the insert and is then discarded. Neither `base_commit_sha` (git PR anchor) nor `installed_content_hash` (local dev install state) records which published revision a copy was taken from. So the proposal is just: write down what the seeding helper already knew.

**Anchors I'd follow:**

- **Git** — ancestry is stored; similarity is computed *only* for rename display and never determines identity. We do the exact inverse today. That's the correction in one sentence.
- **ECM check-out** — records the *base version*, not just that a copy exists. That's what makes staleness a subtraction instead of an investigation.

**One I'd explicitly reject:** MediaWiki's `page_id`-vs-title (and Kubernetes' `uid`-vs-`name`). It's the textbook answer to "same name, different object," and it's wrong here — a surrogate id would thread through the generated modules, catalogues, `relatedPuzzles`, the manifest and every inbound link, to disambiguate a case the insert gate already makes unreachable. I said so in the brief so its absence doesn't look like an oversight.

**What I talked myself out of:** the rebuild marker — my own suggestion last message. Once lineage is recorded, a rebuild is just a seeded copy with a big diff, and the data already says that. A marker asks you to declare an intention the system can see, and adds a new way to be wrong. If you want "replaced wholesale on this date" readable later, the freeze commit already records it in prose.

**Where it's clunky, flagged in the brief:** `NULL` on `seeded_from_revision` would mean both "no published row existed" and "we don't know" — fine now, confusing in six months; the clean fix is an enum, which is more schema than the problem warrants, and I genuinely don't know which way to go. Also `seeded_at` is probably redundant with `created_at`.

**And the honest caveat about your actual request.** You wanted to never think about shadow drafts again. This gets the false positives to zero and your legacy set is *already* empty — but "shadow" stays a word in the codebase describing a state old rows can still be in. If shadows are all you care about, the cheaper move is: verify the legacy set is empty, delete the heuristic, trust the gate. **The real payoff here is stale-working-copy detection** — the thing that nearly reverted published content on six puzzles — and that arrives as a side effect. If the brief justifies building anything, it's that.