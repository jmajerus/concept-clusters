---
name: zotero-mcp
description: Find and verify Zotero records while authoring or checking Concept Clusters citations.
---

# Zotero references

Skill rev `ee8a3c43` · 2026-10-25

Use the project `zotero` MCP connection, backed by the `jmajerus/zotero-mcp`
fork, for read-only source lookup. Do not change the Zotero library during
citation lookup.

## Find and verify a source

- For a known citekey, use `zotero_search_by_citation_key` as an optional
  lookup shortcut. Never require a citekey to author a puzzle.
- For a title, author, or DOI, use `zotero_search_items` with the most distinctive
  available terms, then call `zotero_get_item_metadata` for plausible matches.
- Verify the work using its title, author, year, and DOI or URL. If results are
  ambiguous, report the candidates instead of selecting one by citekey alone.
- Better BibTeX generates the assigned citekey from the project's rule,
  `auth.lower + year + title.skipwords.select(1, 1).lower`. Do not calculate,
  copy into a puzzle, or keep track of a citekey while authoring.
- Record verified bibliographic details in the current inline citation
  fields, including puzzle-specific locators such as pages. Filing a source
  does not replace these fields. Do not use a Zotero item key as a citekey.

## Optional local authoring pilot

The local Postgres-backed `concept-clusters` MCP server offers:

- `plan_puzzle_references` for read-only coverage planning. Supply a query
  (topic, title, author, DOI, URL, or known citekey), category, or subcategory.
  It returns source candidates, published citation usage, accessible draft
  citations, and nearby puzzles. Published matches are inferred, ambiguous,
  or unmatched; draft citations are unlinked. Check `usageIndex.freshness`
  before treating missing usage as evidence of a gap. Review nearby puzzle
  content before judging missing or excessive coverage.
- `file_zotero_reference` to explicitly file a selected work in the Concept
  Clusters Zotero collection and mirror its assigned citekey and metadata in
  Postgres. Provide exactly one of `zotero_item_key`, `doi`, `url`, `isbn`,
  or `bibtex` (one `@book` entry, filed from its own metadata with no lookup).
  It returns the assigned citekey.
  Call it only when filing the selected work is within the requested task;
  a lookup or planning request alone does not authorize filing. This action
  changes collection membership and may create a Zotero item for a DOI, URL,
  ISBN, or BibTeX entry. ISBN metadata comes from Open Library or Google Books; check the
  returned citation against the book.
  It does not modify a puzzle or publish a citation.

These pilot tools are optional and available only when exposed by the local
server. Citekeys remain lookup aliases in the source domain; agents do not
maintain them in puzzle documents. Authoritative citation bindings and pinning
source revisions on publication remain planned.

If the Zotero MCP tools are unavailable, say the lookup could not be performed;
do not present a computed key as Zotero-verified.
