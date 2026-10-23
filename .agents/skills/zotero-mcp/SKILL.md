---
name: zotero-mcp
description: Find and verify Zotero records while authoring or checking Concept Clusters citations.
---

# Zotero citation lookup

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
- The planned source-resolution action will accept a DOI, URL, title, or
  Zotero record. The authoring service will store Zotero's assigned citekey and
  source revision in the citation-source domain, leaving them out of
  agent-facing puzzle schemas. The planned citation search action may accept
  and return a citekey for lookup, but the agent does not maintain it.
- Until source resolution is implemented, record verified bibliographic
  details in the current inline citation fields. Do not use a Zotero item key
  as a citekey; it is an internal record ID.

If the Zotero MCP tools are unavailable, say the lookup could not be performed;
do not present a computed key as Zotero-verified.
