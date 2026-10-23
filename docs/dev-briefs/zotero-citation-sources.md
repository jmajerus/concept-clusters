# Zotero citation sources for authoring, play, and freeze

Status: additive pilot implemented in code. Postgres migrations add the source
mirror and a derived published-citation usage index. The local authoring MCP
server offers optional planning and explicit filing tools. On a configured LAN
authoring database, run `npm run authoring:postgres:migrate`, then
`npm run authoring:citations:sync-zotero`, then
`npm run authoring:citations:refresh-usage`. Puzzle bindings, publication,
replica, and freeze changes remain planned.

## Decision

An authoring agent identifies a work by DOI, URL, title, or Zotero record. The
LAN authoring service resolves it in Zotero, files it in a dedicated **Concept
Clusters** collection when selected for citation, and mirrors its metadata and
Better BibTeX citekey in Postgres. The collection is the curated authoring
registry; the Postgres citation-source table is its local mirror and search
index. A work can belong to other Zotero collections at the same time. The
agent keeps writing the current ordered `info.citations` objects, including
puzzle-specific locators such as pages. The service links those objects to
sources in a separate write domain. The agent does not calculate or track
citekeys or internal source ids. It may use a known citekey as a search query,
but never has to put one in a puzzle. A browser reviews Postgres records
through the authoring service.

After activation, publication will pin an immutable metadata revision for each
citation. That published revision will be the authority for play and freeze.
Later changes in Zotero will not alter a published puzzle. Refreshing a source
will create a new authoring revision; a human will review and republish a puzzle
to adopt it.

After activation, the one-way replica will copy cited revisions to D1 in the
same generation as the puzzle. The public Worker will resolve citation
references from D1 for Library search and puzzle play. Freeze will resolve the
**pinned published revisions** from Postgres and write complete citation
objects to the canonical JSON and generated puzzle module in Git. Runtime play
will never depend on Zotero or Git.

## Phase 1: additive pilot

- Add the Postgres source mirror, immutable revisions, and a topic-aware usage
  index populated from existing published puzzle documents. Keep provenance on
  each inferred source match; ambiguous matches remain unlinked. Refresh the
  index independently of draft save and publication transactions.
- Offer a read-only `plan_puzzle_references` MCP tool. It returns Zotero or
  mirrored source candidates, current citation usage, and nearby puzzles, with
  category and subcategory filters. It labels exact links separately from
  matches inferred from existing inline citation text.
- Allow an explicit opt-in action to file a selected work in the Concept
  Clusters Zotero collection and refresh its Postgres mirror. A planning search
  never files a work. Existing agent authoring guidance gets at most a short
  pointer to the optional tool.
- Keep `create_puzzle_draft`, `save_puzzle_draft`, review, publish, D1 play, and
  freeze behavior unchanged. Pilot data cannot block or alter publication.
  Nothing in the current puzzle schema gains a citekey or source id.

The pilot filing action accepts an existing Zotero item key, DOI, or URL. It
files that work in collection `64GU7Y4Y`, verifies membership and its assigned
citekey, then mirrors the bibliographic metadata in Postgres. DOI and URL
filing use Zotero's `if_exists: "file"` behavior to reuse a matching library
item. The separate
`authoring:citations:sync-zotero` command mirrors items placed directly in the
collection.
The usage index is refreshed manually and reports its freshness; a stale or
uninitialized index must not be treated as evidence of no coverage.

## Phase 2: authoritative bindings

After the pilot confirms matching quality and review flow, link citations to
sources in a separate write domain, pin metadata revisions on publication,
replicate the cited revisions to D1, and resolve them for play and freeze.
Introduce publication checks only when existing citations are migrated or have
a deliberate compatibility path. This activation is a separate change from
the additive pilot.

## Data shape

- `citation_sources` in Postgres identifies a Zotero work by library and item
  key. It indexes the Better BibTeX citekey for authoring lookup. The citekey
  is an alias, not the database identity. The configured collection key is
  stored for provenance; membership is verified in Zotero on resolution and
  refreshed without changing published snapshots. The collection may contain
  curated works not currently cited by a puzzle; the link index determines
  actual usage.
- In the pilot, a citation-to-puzzle usage index is derived from existing
  published documents and accessible drafts. It marks Zotero matches as
  confirmed or inferred, with ambiguous matches left unlinked. After
  activation, authoritative binding rows record citation position, content
  fingerprint, source identity, and the published metadata revision; content
  saves then reconcile changed citations. Both forms support corpus-wide
  coverage searches and report puzzle identity, status, citation location,
  and source metadata. Published usage rows also carry the puzzle's
  stable category ids and its category-to-subcategory assignments as derived
  search facets. One work may appear under several categories through
  different puzzles, or several categories on one puzzle. Reclassification,
  withdrawal, and republication refresh these facets with the puzzle binding;
  they do not create a new bibliographic revision. The index distinguishes
  exact reuse of one work from thematic overlap across works.
- `citation_source_revisions` stores immutable, validated bibliographic
  snapshots: author, title, year, publisher, URL, and any other fields the
  player displays. Each revision has a content hash and capture time.
- Drafts keep the current inline citation objects. During activation, separate
  binding rows hold source identities and published binding rows pin source
  revisions. The authoring service manages them without exposing ids in
  agent-facing puzzle schemas or tool responses. Citekeys appear only as
  optional search terms or source metadata, never as puzzle fields.
- D1 holds only revisions referenced by current published puzzles, keyed by
  source id and revision. It is a replica of the Postgres published data, not
  another authoring database.
- A frozen citation carries the resolved display metadata, so the Git artifact
  remains self-contained. Citekeys stay in the source domain.

## Implementation sequence

1. **Preserve the authoring contract (pilot).** Keep the current inline citation shape
   in `info.citations` for `create_puzzle_draft`, content-domain saves, review,
   and pedagogy context. Do not add `citekey`, a source id, or a new mandatory
   phase to the agent-facing puzzle schema. Keep existing guidance mostly as
   written; add only a short pointer to the optional reference planning tool.
2. **Add Postgres source storage and opt-in resolution (pilot).** Add source and immutable
   revision tables, indexed by citekey and Zotero identity. Configure the
   library and the Concept Clusters collection by stable keys, not a collection
   name alone. Give agents and humans a source-resolution action that accepts
   a DOI, URL, Zotero item, or short title search. The LAN service queries the
   Zotero MCP server and validates the chosen work. For an existing Zotero
   item, file it with `zotero_set_item_collections`; for a new DOI or URL, use
   `zotero_add_item` with `collections` and `if_exists: "file"`. Do this only
   after the author selects the work, and never create a duplicate merely to
   place it in the collection. Store the resulting citekey and metadata in
   the source tables. Make a new revision only when metadata changes. A known
   citekey is an optional lookup term. Show ambiguous matches for selection;
   do not treat an unresolved reference as an exact match. Reconcile collection membership
   against the mirror, including items added directly in Zotero; do not
   silently delete sources when a draft drops one. The running Zotero server
   already exposes these write tools. This chat's `.codex/config.toml`
   allowlists only read tools; the LAN service must use its own Zotero client.
3. **Add an optional planning tool (pilot).** `plan_puzzle_references` is a read-only
   authoring MCP tool with a topic or work query and optional category and
   subcategory filters. It accepts a citekey, DOI, URL, title, author, or free
   text. It returns verified candidate works as ordinary citation metadata,
   citing puzzles from confirmed or clearly labelled inferred usage, nearby puzzles from
   `search_puzzles`, and an explicit uncertainty note for ambiguous matches.
   It can group results by the derived puzzle topics and optionally rank the
   primary category first, while allowing a global search across disciplines.
   It may query Zotero when a work is absent from the local mirror, but does
   not file a candidate
   in the Concept Clusters collection or mutate a draft. It covers published
   content and drafts the caller may access. Zero exact citations alone does
   not establish a coverage gap, and repeated citation alone does not
   establish excess duplication. Agents may skip this tool for routine
   authoring and return to it whenever coverage needs checking.
4. **Reconcile bindings on content save (activation).** After an agent saves the same
   `info.citations` list it uses today, resolve each changed citation against
   a verified Zotero work and file selected works in the Concept Clusters
   collection. Store source bindings in Postgres outside the puzzle document.
   Preserve unchanged bindings through other content edits and pedagogy saves.
   Ambiguity leaves the citation visible in the draft and flags it for human
   resolution; it must not silently bind to the wrong work. A Zotero outage
   must not fail the ordinary draft save: queue the unresolved work and show
   its status in review. Publication waits for resolution.
5. **Pin on publication (activation).** In the Postgres publish transaction, bind each
   citation to an exact source revision in published sidecar rows and include
   those pins in the public snapshot hash and revision history. Keep the
   authored document shape intact. Do not fetch Zotero as a side effect of
   publishing. Publish fails clearly if a reference was not resolved and
   reviewed. A later Zotero refresh does not rewrite a published binding.
6. **Replicate cited revisions with the puzzle (activation).** Extend
   `modules/publishedReplica.js` and the D1 schema to send the bound revision
   rows before, or atomically with, their puzzle generation. A retry must be
   idempotent, and a puzzle must not become visible with a missing citation.
   Retain a revision while any published puzzle references it.
7. **Resolve for public play (activation).** Have `modules/publicPlayService.js` bulk-load
   cited revisions for the publication index and load only a puzzle's
   revisions for its route. Resolve before `puzzleBrowseFromDocument` and
   `compilePublishedPuzzle`, preserving current citation rendering, Library
   search, and content fingerprints. Apply the same resolution to LAN play
   from Postgres.
8. **Materialize only at freeze (activation).** In `modules/contentFreezeApply.js`, resolve
   the published puzzle's pinned revisions from Postgres before writing its
   canonical JSON and generated module. Freeze uses no live Zotero lookup and
   fails if a pinned revision is missing.
9. **Migrate existing citations (before activation).** Match inline citations to Zotero records
   where unambiguous. Preserve unmatched inline entries for human resolution;
   do not generate citekeys from incomplete metadata or silently discard
   citations. Keep inline authoring after existing publications and drafts
   remain readable; no agent-facing schema migration is required.

## Pilot acceptance criteria

- Existing draft saves, review, publication, D1 play, and freeze produce the
  same results with the pilot features unused or Zotero unavailable.
- The planning tool shows reference candidates and topic-filtered puzzle
  coverage, clearly distinguishing confirmed source links from inferred
  matches and displaying ambiguity.
- Filing a selected work in the Zotero collection is explicit and opt-in;
  searching or viewing a candidate never writes to Zotero.
- Existing content and pedagogy saves retain their current input shape and
  guidance size; the optional planning tool returns source information without
  writing a puzzle or Zotero collection.

## Activation acceptance criteria

- Human review shows a citation's actual metadata and the revision that
  publication will pin.
- A cited Zotero item belongs to the configured Concept Clusters collection;
  filing an existing item preserves its other collection memberships.
- An agent can add a source without generating, entering, or remembering its
  citekey, internal source id, or publication revision; the authoring service
  handles these in the source domain. A known citekey can be used as a search
  shortcut without becoming part of the puzzle.
- An authoring agent can find all accessible puzzles citing an exact work and
  search nearby topics to judge missing or excessive coverage. Category and
  subcategory filters reflect current published puzzle classifications, not
  permanent attributes of the Zotero work.
- D1 play and Library search show the same citation text as LAN play, even
  when Zotero and Postgres are unavailable to the public Worker.
- A Zotero edit alone changes neither published play nor a later freeze.
- Replication retries cannot expose a puzzle without its bound citations.
- The frozen Git artifact contains the exact metadata version used by the
  published puzzle.
