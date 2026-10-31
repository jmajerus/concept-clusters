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

## Slugs stay Concept Clusters' keys

Puzzles keep `category: "history-society"` and
`subcategories: { "history-society": "…" }`. Each `subjects` term records
its Concept Clusters identity as a source IRI and alias
(`urn:concept-clusters:category:<id>`, `cc-category:<id>`). Puzzle
documents, catalogue ids, and player URLs do not change.

A rename in terminology-mcp reaches Concept Clusters as a label change. A
slug change is the breaking case: Concept Clusters gates it, as
terminology-mcp's plan describes for slug-keyed consumers.

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

## New subcategories

An author or agent proposes a term while authoring. terminology-mcp
creates it `provisional`; additions are not breaking, so it reaches
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

## Sync

Concept Clusters subscribes to terminology-mcp's changelog from the
authoring server's drain loop (`modules/publishedReplicaSchedule.js`),
beside the taxonomy push and the ontology sync. It keeps an "applied
through N" cursor, reads `/api/changes?since=N`, and writes the result
into its published category rows. Everything downstream is unchanged: D1
and the player, Freeze, and the git snapshot (`puzzles/categories.js`)
that the public site and CI read. `puzzles/domains.js` becomes part of
that snapshot.

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
4. **Concept Clusters:** the changelog subscriber writing category rows;
   the editor narrowed to player copy; `create_category` and new
   subcategories as proposals; `domains.js` generated.
5. **Retire** the corpus-mcp taxonomy push (`modules/taxonomyPush.js`)
   once corpus-mcp subscribes to terminology-mcp directly.

## Open

- Whether a profile's depth rule lives in the concept set or in the
  subscription (terminology-mcp's open question) does not matter while
  `subjects` stays three levels deep.
