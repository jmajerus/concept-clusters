# Subjects from terminology-mcp

**Status: steps 1–3 done; the subscriber (step 4, first part) is live on
the authoring server; domains as data is built; LCC linking under way.** terminology-mcp
(`http://terminology-mcp.localdomain:8000`) holds Concept Clusters' subject
taxonomy as the `cc-subjects` scheme and is becoming its authority: which
domains, categories, and subcategories exist, what they are called, and how
they nest. Concept Clusters keeps the player copy and keeps keying puzzles
on slugs. terminology-mcp's
[PLAN.md](https://github.com/jmajerus/terminology-mcp/blob/main/PLAN.md)
points here for the Concept Clusters side.

## Decision

| Owned by terminology-mcp | Owned by Concept Clusters |
|---|---|
| Terms of the `cc-subjects` scheme, their labels, slugs, and the hierarchy: domains (top terms), categories, subcategories | `info` texts and wiki links: the player copy, which terminology-mcp keeps out of scope notes |
| Scope notes, alternative labels, links to Wikidata, LCSH, and LCC | The Trivia and Vocabulary puzzle kinds and the generated `other` domain, as local categories with no mapping |
| Renames, moves, merges, splits, retires, slug changes, with impact previews | Which terms players see: only those with puzzles |

Concept Clusters shows three levels: domain, category, subcategory. The
`cc-subjects` scheme stays at those three levels; finer detail goes in
links to other schemes, not in deeper terms.

## Slugs come from terminology-mcp

Puzzles keep `category: "history-society"` and
`subcategories: { "history-society": "…" }`. Puzzle documents, catalogue
ids, and player URLs do not change. Concept Clusters records each
`cc-subjects` term id next to the slug, and terminology-mcp keeps the
Concept Clusters IRI as the term's source IRI and `cc-*` alias.

The slug is a field terminology-mcp owns, so other consumers can share it:

- Minted once, at creation, with Concept Clusters' `slugify`
  (`puzzles/categories.js`) plus accent folding, an empty-result fallback,
  and an 80-character cap. None of these change an existing slug.
- Stored, never re-derived: `cc-subjects` holds the slugs Concept Clusters
  uses, including the 20 that differ from their label (the `geography`
  category is "Physical Geography").
- Unique among siblings, and scheme-wide per depth where the scheme says
  so: for `cc-subjects`, among domains and among categories, separately
  (the `humanities` category sits in the `humanities` domain). Subcategory
  slugs repeat across categories (`bioinformatics`, `hydrology`); Concept
  Clusters composes them as `<category>--<sub>`.
- A rename changes the label only. A slug changes only through
  terminology-mcp's **Change slug…** operation: breaking, previewed with
  its impact, and gateable by slug-keyed consumers. The old slug moves to
  the term's `formerSlugs` and stays reserved and resolvable, so old puzzle
  references and URLs resolve while Concept Clusters migrates.
- Lookup is scoped: `GET /api/schemes/cc-subjects/slugs/<slug>` with
  `?depth=0` for domains, `?depth=1` for categories, or
  `?parent=<category slug, alias, or term id>` for subcategories. A bare
  `humanities` is ambiguous and answers 409.

## LCC is a linked reference, not a source tree

The Library of Congress Classification excerpt (480 concepts under 21
classes, up to six levels deep) is in terminology-mcp as the
`loc-classification` scheme, and in the LAN Oxigraph server's default
graph. It is a shelving scheme. Its depth does not mean the same thing
across branches, and many nodes are shelving headings ("General works",
"Theory. Method. Scope.") rather than subjects. Cutting it at a fixed
level would mix subjects with shelf labels.

Instead, a `cc-subjects` term links to the LCC class that fits, at
whatever depth fits. New subcategories come from LCC by promotion: one
class picked when content needs it, never a pass through LCC level by
level. The links also let corpus-mcp roll LCC-shelved books up to Concept
Clusters categories for reference planning.

### Linking a term to LCC

In the terminology-mcp editor:

1. Open the `loc-classification` scheme and find the class, by label or
   by its LCC notation (for example `K3236-K3268.5`). Its `id.loc.gov` IRI
   is listed under **Aliases**; copy it.
2. Open the `cc-subjects` term and choose **External references → +
   Reference**.
3. Choose the match. A new reference starts on **Exact match**, so change
   it each time: **Close match** when the class covers what the term
   covers, **broad match** when the class is wider (a whole discipline for
   a subcategory). Keep Exact match only for a true equivalent, which is
   rare across a shelving scheme.
4. Paste the IRI and save.

A link is a free edit, not a breaking change: it applies at once and
needs no impact preview. It lives only in terminology-mcp. Concept
Clusters' subjects graph does not carry links, and the subscriber does not
copy them into category rows.

### Promoting an LCC class to a subcategory

1. Under the Concept Clusters category, choose **+ Narrower term** and
   give it the label players should see.
2. The editor mints the slug from the label. If Concept Clusters needs a
   different one, use **Change slug…** before anything refers to it.
3. Link it to the LCC class as above, usually with **Close match**.

## Domains are data

Domains are top terms of `cc-subjects` like any other term, so a new one
is an addition in terminology-mcp, held to the taxonomy roadmap's
admission test. Concept Clusters publishes each as a `domain` document
(`{ id, title, info? }`) beside its categories, and the subscriber
creates, renames, and merges them like categories.

Every reader still imports `DOMAINS` from `puzzles/domains.js`; the live
rows replace that object in place (`modules/domainRegistry.js`):

- the player, from the play corpus or the public index (`domains`, present
  once any domain is published), so a new domain reaches players from D1
  without a deploy;
- the authoring server, from Postgres on every drain tick and whenever MCP
  loads the taxonomy, so category validation, `create_category`, the
  ontology sync, the taxonomy push, and the citation collections follow
  the rows. `list_categories` returns the domains a category may name.

`puzzles/domains.js` is a snapshot that every Freeze rewrites from the
published rows (`modules/domainsSnapshot.js`); the public site's static
fallback, CI, and `validate.mjs` read it. With no domain rows, everything
keeps reading the snapshot. The generated `other` domain stays in code and
is never published.

A domain's `info` text is player copy. A new domain's first row takes it
from the snapshot when there is one; otherwise it arrives with its title
only. Editing it in the category editor comes with the editor's narrowing
to player copy.

## Working with the subscriber

terminology-mcp is the master for `cc-subjects`. Structural changes are
made there; the subscriber carries them into Concept Clusters within a
drain tick (15 s), or holds them as described under
[What the subscriber applies](#what-the-subscriber-applies).

- A term arrives with its title only. Its `info` text and wiki link are
  added in the category editor, and a later rename keeps them.
- Changes made only in Concept Clusters (the category editor,
  `create_category`, `update_category`) do not reach `cc-subjects`. Avoid
  structural edits there; if one is made, add the term in terminology-mcp
  too (**+ Narrower term**, then **Change slug…** if the minted slug
  differs from Concept Clusters' id). The bootstrap reports such terms as
  `not-in-cc-subjects`.
- terminology-mcp's **Subscribers** panel shows where Concept Clusters is
  and why it is held.

## New subcategories

An agent proposes a term while authoring by copying it from a reference
vocabulary (`propose_term` with a required `source`, optionally a slug
hint); a person adds one in terminology-mcp's editor, where copying from a
reference vocabulary is optional. terminology-mcp mints or validates the
slug and creates the term `provisional`; additions are not breaking, so it reaches Concept Clusters
on the next sync and is usable at once, on drafts and on published
puzzles.

The owner confirms, merges, or retires it later in terminology-mcp's
changes tray, which lists the puzzles that use it. A rename is a label
change for Concept Clusters. A retire with a replacement re-tags the
puzzles that use it, as `reassign_puzzle_classifications` does. Concept
Clusters' Review shows a provisional subcategory as a note, not a blocker.

## The category editor

The editor (`/admin/categories`) is a player-copy editor for every
category the subscriber's mirror holds (`modules/subjectCopy.js`):

- Title, domain, and subcategories show read-only, each linked to its term
  in terminology-mcp's editor (`TERMINOLOGY_EDITOR_URL`, else
  `TERMINOLOGY_BASE`). The blurb, link, and extra link of the category and
  of each subcategory are editable. Unpublishing is refused: terminology-mcp
  decides whether a subject exists.
- The working copy carries only that copy. Saving and publishing apply it
  onto the current published row, so a working copy opened before a synced
  change cannot undo it.
- **Needs player copy** at the top of the list names every live domain,
  category, and subcategory without a blurb, linked to its field.
- A domain's blurb is edited on `/admin/domains/<id>`. Domains have no
  working copy; the copy is published straight onto the current row.

Categories outside the mirror (Trivia, Vocabulary) keep the full editor,
and without a mirror every category does.

Over MCP there is no category structure write. `update_subject_copy`
writes the blurb and links of a category and its subcategories (saved to the
working copy and, with `publish_to_authoring`, published onto the current
row the same way), or of a domain. A missing subject is proposed with
terminology-mcp's own `propose_term` tool, which requires a `source`: an
entry from a reference vocabulary such as `loc-classification`, found with
`search_terms` (`excludeScheme: cc-subjects`). The new term records that
entry as a reference link and in its proposal, so every agent-added subject
has provenance. It arrives through the subscriber.

## What the subscriber applies

| Change | Concept Clusters |
|---|---|
| A new domain, category, or subcategory | Applied: published, provisional included |
| Label change | Applied: new title, same slug |
| A category moved to another domain | Applied: the domain is a field of the category |
| Retired or merged into exactly one replacement | Applied: puzzles re-tagged |
| A subcategory moved to another category | Held, alert: its composed key changes |
| A depth change (retiring a category promotes its subcategories) | Held, alert |
| Split, or retired with no or several replacements | Held: a person decides where puzzles go |
| Slug change | Held until a person coordinates the migration |
| Links, scope notes, alternative labels | Ignored: they stay in terminology-mcp |

Holding stops the cursor at that change; later changes wait behind it.

## Sync

Concept Clusters subscribes to terminology-mcp's changelog from the
authoring server's drain loop (`modules/publishedReplicaSchedule.js`),
beside the taxonomy push and the ontology sync:

- It bootstraps from `GET /api/state?scheme=cc-subjects`, which includes
  retired terms, so old references keep resolving.
- It keeps an "applied through N" cursor and the changelog's `log` id,
  and reads `GET /api/changes?since=N&scheme=cc-subjects`. It applies each
  change's `afterTerms` (every term the change touched), not only `after`.
- A different `log` id means the store was rebuilt: it bootstraps again.
  `since` past the head answers 400 and means the same.
- It reaches terminology-mcp directly on the LAN, which skips the Access
  check that applies to public hostnames.

It writes the result into Concept Clusters' published category documents
(`modules/subjectsSubscriber.js`), as the `terminology-mcp` actor:

- The cursor (`log`, `through`, the term map, and any hold) is the
  `subjects_subscription` row in Postgres (migration 0008). Deleting it, or
  `npm run subjects:sync -- --rebootstrap`, makes the next pass bootstrap.
- The bootstrap reconciles the snapshot with the published categories. It
  adds and renames; a category or subcategory missing from `cc-subjects`,
  or retired there but still published, is logged, never deleted.
- A category rename publishes the new title (the old one joins
  `previousTitles`) and keeps the `info` text. A subcategory rename changes
  only its title: puzzles join subcategories on the slug, so no old title
  is kept. A retire re-tags published puzzles, then removes
  the subcategory or withdraws the category. Working copies are not
  re-tagged; one that still names the old key fails validation on publish.
- A new or renamed domain is published; a domain merged into another
  moves its categories to the replacement and is withdrawn. A domain is
  withdrawn only once no live category names it (`still-referenced`).
- A hold is reported as `blocked` with one of the codes above, and stays
  until a person handles the change and runs
  `npm run subjects:sync -- --accept <n>`.
- It reports progress when the cursor or the hold moves, and every five
  minutes otherwise.

`npm run subjects:sync` is a dry run: what the next pass would apply and
where it would stop. `--apply` runs one pass and reports.
`TERMINOLOGY_BASE` overrides the server (`off` disables it); the drain loop
runs the pass only with `SUBJECTS_SYNC=on`. Everything downstream is unchanged: D1 and the player, Freeze, and
the git snapshots (`puzzles/categories.js` and `puzzles/domains.js`) that
the public site and CI read.

## Order of work

1. **Concept Clusters (done):** the ontology sync writes the taxonomy as a
   plain SKOS tree to `urn:concept-clusters:graph:subjects`, with slugs and
   the per-depth uniqueness rule
   ([ONTOLOGY.md](../ONTOLOGY.md#the-subjects-graph)).
2. **terminology-mcp (done):** stored slugs, scoped slug lookup, the slug
   operation, `?scheme=` filters, and the `log` id. `cc-subjects` seeded
   from the subjects graph: 186 terms (13 domains, 56 categories, 117
   subcategories), a tree, every slug kept. LCC links are added one term
   at a time, as they help.
3. **terminology-mcp (done):** progress reports
   (`POST /api/subscribers/:id/progress`), `POST /api/proposals` creating
   provisional terms with a slug hint, and a scheme depth limit
   (`cc-subjects`: 2). Usage reports are still planned.
4. **Concept Clusters:** the changelog subscriber writing category data
   (live); domains as published documents (live); the editor narrowed to
   player copy, including domain copy (built); `create_category` and
   `update_category` retired for `update_subject_copy`, with new subjects
   proposed through terminology-mcp's `propose_term` (built).
5. **Retire** the corpus-mcp taxonomy push (`modules/taxonomyPush.js`)
   once corpus-mcp subscribes to terminology-mcp directly.

## Open

- Whether a profile's depth rule lives in the concept set or in the
  subscription (terminology-mcp's open question) does not matter while
  `cc-subjects` stays three levels deep.
