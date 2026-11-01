# Subjects from terminology-mcp

**Status: step 1 done; step 2 is terminology-mcp's import.** terminology-mcp becomes the
authority for Concept Clusters' subject taxonomy: which domains,
categories, and subcategories exist, what they are called, and how they
nest. Concept Clusters keeps the player copy and keeps keying puzzles on
slugs. terminology-mcp's [PLAN.md](https://github.com/jmajerus/terminology-mcp/blob/main/PLAN.md)
points here for the Concept Clusters side.

## Decision

| Owned by terminology-mcp | Owned by Concept Clusters |
|---|---|
| Terms of the `subjects` scheme, their labels, and the hierarchy: domains (top terms), categories, subcategories | `info` texts and wiki links: the player copy, which terminology-mcp keeps out of scope notes |
| Scope notes, alternative labels, links to Wikidata, LCSH, and LCC | The Trivia and Vocabulary puzzle kinds and the generated `other` domain, as local categories with no mapping |
| Renames, moves, merges, splits, retires, with impact previews | Which terms players see: only those with puzzles |

Concept Clusters shows three levels: domain, category, subcategory. The
`subjects` scheme stays at those three levels; finer detail goes in links
to other schemes, not in deeper `subjects` terms.

## Slugs come from terminology-mcp

Puzzles keep `category: "history-society"` and
`subcategories: { "history-society": "…" }`. Puzzle documents, catalogue
ids, and player URLs do not change. Concept Clusters records each
`subjects` term id next to the slug, and terminology-mcp keeps the Concept
Clusters IRI as the term's source IRI and `cc-*` alias.

The slug is a field terminology-mcp owns, so other consumers can share it:

- Minted once, at creation, with Concept Clusters' `slugify`
  (`puzzles/categories.js`) plus accent folding, an empty-result fallback,
  and an 80-character cap. None of these change an existing slug.
- Stored, never re-derived: the seed carries today's slugs as they are,
  including the 20 that differ from their label.
- Unique among siblings, and scheme-wide per depth where the scheme says
  so: for `subjects`, among domains and among categories, separately.
  Subcategory slugs repeat across categories (`bioinformatics`,
  `hydrology`); Concept Clusters composes them as `<category>--<sub>`.
- A rename changes the label only. A slug changes only through
  terminology-mcp's explicit slug operation: breaking, previewed with its
  impact, and gateable by slug-keyed consumers. The old slug moves to the
  term's `formerSlugs` and stays reserved and resolvable, so old puzzle
  references and URLs resolve while Concept Clusters migrates.

## LCC is a linked reference, not a source tree

The Library of Congress Classification excerpt on the LAN Oxigraph server
(480 concepts under 21 classes, up to six levels deep) is a shelving
scheme. Its depth does not mean the same thing across branches, and many
nodes are shelving headings ("General works", "Theory. Method. Scope.")
rather than subjects. Cutting it at a fixed level would mix subjects with
shelf labels.

Instead, a `subjects` term links to the LCC class that fits, at whatever
depth fits, with `skos:closeMatch` or `skos:broadMatch`. New subcategories
come from LCC by promotion: browse the LCC branch under the relevant
category, pick one class, and create a `subjects` term with a
`closeMatch` back. Terms arrive when content needs them, one pick at a
time. The links also let corpus-mcp roll LCC-shelved books up to Concept
Clusters categories for reference planning.

## Domains are data

Domains are code today. `puzzles/domains.js` is read by the player's
category browse (`modules/overviewRenderer.js`), by category validation
(`modules/categoryValidation.js`, which refuses an unknown domain), by
`create_category`'s domain enum, by the citation collection sync, and by
the ontology sync. Adding a domain takes a commit and a deploy.

Domains become top terms of `subjects` like any other term, so a new one
is an addition in terminology-mcp, held to the taxonomy roadmap's
admission test. Concept Clusters stores the domains it receives as
published data beside its category rows. Those five readers use that
registry instead of the module, and the player picks up a new domain from
D1 without a deploy. `domains.js` becomes a generated snapshot for the
public site and CI, like `puzzles/categories.js`. A domain's `info` text
is player copy, edited in the category editor with the rest.

Concept Clusters gets no domain editor of its own in the meantime. Until
the subscriber exists, a domain change is still an edit to `domains.js`,
and the ontology sync's taxonomy hash covers the registry, so the subjects
graph follows it after a deploy.

## New subcategories

An author or agent proposes a term while authoring, optionally with a
slug hint. terminology-mcp mints or validates the slug and creates the term
`provisional`; additions are not breaking, so it reaches
Concept Clusters on the next sync and is usable at once, on drafts and on
published puzzles.

The owner confirms, merges, or retires it later in terminology-mcp's
changes tray, which lists the puzzles that use it. A rename is a label
change for Concept Clusters. A retire with a replacement re-tags the
puzzles that use it, as `reassign_puzzle_classifications` does. Concept
Clusters' Review shows a provisional subcategory as a note, not a blocker.

## The category editor

The editor stays, as a player-copy editor. Structure (which terms exist,
labels, nesting) shows read-only with a link to the term in
terminology-mcp. What remains editable is Concept Clusters' own: the
`info` text and wiki link of each domain, category, and subcategory. A
short list names terms that arrived without player copy.

Over MCP, `update_category` edits player copy only, and `create_category`
and new subcategories become proposals to terminology-mcp.

## What the subscriber applies

| Change | Concept Clusters |
|---|---|
| Label change | Applied: new title, same slug |
| A category moved to another domain | Applied: the domain is a field of the category |
| Retired or merged into exactly one replacement | Applied: puzzles re-tagged |
| A subcategory moved to another category | Held, alert: its composed key changes |
| A depth change (retiring a category promotes its subcategories) | Held, alert |
| Split, or retired with no or several replacements | Held: a person decides where puzzles go |
| Slug change | Held until a person coordinates the migration |

Holding stops the cursor at that change; later changes wait behind it.

## Sync

Concept Clusters subscribes to terminology-mcp's changelog from the
authoring server's drain loop (`modules/publishedReplicaSchedule.js`),
beside the taxonomy push and the ontology sync. It keeps an "applied
through N" cursor, reads `/api/changes?since=N`, and writes the result
into its published category and domain data. Everything downstream is
unchanged: D1 and the player, Freeze, and the git snapshots
(`puzzles/categories.js`, and `puzzles/domains.js` once generated) that the
public site and CI read.

## Order of work

1. **Concept Clusters (done):** the ontology sync writes the taxonomy as a
   plain SKOS tree to `urn:concept-clusters:graph:subjects`
   ([ONTOLOGY.md](../ONTOLOGY.md#the-subjects-graph)), so terminology-mcp's
   SPARQL import can seed `subjects` from it with the Concept Clusters
   IRIs as source IRIs. terminology-mcp's own import code, run against a
   scratch database, took the 186 concepts (13 domains, 56 categories, 117
   subcategories) as a tree with no warnings.
2. **terminology-mcp:** import `subjects` from that graph. Add LCC links
   one at a time, when they help.
3. **terminology-mcp:** subscribers with cursors, and `propose_term`
   creating provisional terms. Behind Access before MCP proposals come
   from outside the LAN.
4. **Concept Clusters:** the changelog subscriber writing category and
   domain data; the five domain readers moved off `domains.js`, which
   becomes a generated snapshot; the editor narrowed to player copy;
   `create_category` and new subcategories as proposals.
5. **Retire** the corpus-mcp taxonomy push (`modules/taxonomyPush.js`)
   once corpus-mcp subscribes to terminology-mcp directly.

## Open

- Whether a profile's depth rule lives in the concept set or in the
  subscription (terminology-mcp's open question) does not matter while
  `subjects` stays three levels deep.
