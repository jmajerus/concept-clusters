# Ontology graph

Published puzzles, categories, and catalogues are mirrored as RDF on the LAN
Oxigraph server (`http://oxigraph.localdomain:7878`), so the MCP ontology
tools can join puzzles: which board labels several puzzles share, and which
unlinked puzzles neighbor a given one. The graph is a read model of the
Postgres `published_documents` corpus. Nothing reads it on the publish path,
and nothing in it is authored directly.

## Ownership on a shared server

The Oxigraph server is shared with terminology-mcp, which keeps data in the
default graph and in `urn:terminology-mcp:` named graphs. Oxigraph has no
per-graph permissions, so ownership is enforced in code:

- Concept Clusters owns every graph under `urn:concept-clusters:graph:` and
  nothing else.
- Every write is a Graph Store `PUT` or `DELETE` on one named graph, guarded
  by `assertOwnedGraph` (`modules/ontologyGraph.js`). The code never writes
  the default graph and never issues `CLEAR` or `DROP`.
- Every curated query names its graphs with `GRAPH` and a
  `STRSTARTS(STR(?g), "urn:concept-clusters:graph:")` filter. On this server
  the default graph does not include named graphs.
- `ontology_query` pins its dataset to the Concept Clusters graphs the last
  sync recorded, through the SPARQL protocol's `default-graph-uri` and
  `named-graph-uri` parameters. Those override any `FROM` or `FROM NAMED` in
  the query text. The default graph is the union of the Concept Clusters
  graphs, `GRAPH ?g` ranges only over them, and the server's own default
  graph and other tools' graphs are out of reach.

## Graph layout

| Graph | Contents |
| --- | --- |
| `urn:concept-clusters:graph:puzzle:<id>` | One published puzzle: clusters, terms, bridges, lenses, relatedPuzzles, classification links |
| `urn:concept-clusters:graph:taxonomy` | Categories, subcategories, domains, catalogues, meta catalogues |
| `urn:concept-clusters:graph:sync` | When the last sync ran, the converter version, and the versioned content hash loaded for each puzzle and for the taxonomy |

No triple in one puzzle's graph points into another puzzle's graph.
Cross-puzzle questions join on `cc:labelKey`, so replacing one puzzle's graph
never leaves stale links behind.

## Identifiers

IRIs follow `modules/jsonLdProfile.js`:

- `urn:concept-clusters:puzzle:<id>`, `urn:concept-clusters:category:<id>`,
  `urn:concept-clusters:catalogue:<id>`
- `urn:concept-clusters:domain:<id>` and
  `urn:concept-clusters:subcategory:<category>--<subcategory>`
- Clusters, bridges, and lenses are fragments of their puzzle:
  `urn:concept-clusters:puzzle:<id>#<item id>`
- Terms are puzzle-scoped: `urn:concept-clusters:puzzle:<id>#term/<slug>`.
  Two labels in one puzzle that slug alike get `-2`, `-3` suffixes rather
  than merging.

## Vocabulary

Prefixes: `cc:` is `https://concept-clusters.org/vocab#`, `skos:` is SKOS
core, and `schema:` is `https://schema.org/`.

| Term | Meaning |
| --- | --- |
| `cc:Puzzle`, `cc:Cluster`, `cc:Term`, `cc:Bridge`, `cc:Lens` | Board structure |
| `cc:Category`, `cc:Subcategory`, `cc:Domain`, `cc:Catalogue`, `cc:MetaCatalogue` | Taxonomy |
| `schema:name`, `schema:description`, `schema:inLanguage` | Titles, info text, language |
| `cc:hasCluster`, `cc:hasBridge`, `cc:hasLens` | Puzzle to its parts |
| `cc:term` / `cc:inCluster` | Cluster to term and back |
| `cc:role` | `"seed"` or `"floating"` |
| `cc:connectsCluster`, `cc:relationKind` | Bridge endpoints and kind |
| `cc:targetsTerm` | Lens to the terms or bridges it targets |
| `skos:prefLabel` | The label as authored, on terms and bridges |
| `cc:labelKey` | The label with case, accents, and spacing removed: the cross-puzzle join key |
| `cc:inPuzzle` | Term or bridge to its puzzle |
| `cc:fact`, `cc:note`, `cc:prompt` | Cluster and bridge facts, term notes, lens prompts |
| `cc:primaryCategory`, `cc:inCategory`, `cc:inSubcategory` | Puzzle classification |
| `cc:puzzleKind`, `cc:level`, `cc:tag` | Literal classification fields |
| `cc:relatedPuzzle` | An authored relatedPuzzles entry |
| `cc:inDomain`, `cc:hasSubcategory` | Category to domain and subcategories (`cc:inCategory` points back from a subcategory) |
| `cc:hasEntry`, `cc:hasChildCatalogue` | Catalogue to puzzles; meta catalogue to catalogues |

A shared `cc:labelKey` is evidence of a connection, not an identity claim:
"power" in a statistics puzzle and "power" in a political one share a key.
The graph deliberately has no `owl:sameAs`.

## Keeping it current

The LAN authoring server's published-replica drain loop
(`modules/publishedReplicaSchedule.js`) calls the ontology syncer
(`modules/ontologySync.js`) on every tick, after the taxonomy push. The
syncer works like this:

1. It reads `kind, id, content_hash` for live published puzzles, categories,
   and catalogues from Postgres.
2. It compares them with the versioned hashes in the sync graph.
3. It replaces changed puzzle graphs, drops graphs for withdrawn or deleted
   puzzles, and rebuilds the taxonomy graph when any category or catalogue
   changed.
4. It rewrites the sync graph. When nothing changed, it writes nothing.

A failure is logged once and retried on the next tick. The syncer reads
Postgres, not the D1 replica queue.

Bumping `ONTOLOGY_GRAPH_VERSION` in `modules/ontologyGraph.js` changes every
recorded hash, so the next tick reloads all graphs. Bump it whenever the
converter's output changes.

### Manual load

```sh
npm run ontology:load             # replace what changed since the last sync
npm run ontology:load -- --full   # drop every urn:concept-clusters:graph:* graph, then rebuild
```

Run `--full` for the first load and to recover from a store that was
changed by hand. It needs `AUTHORING_DATABASE_URL`.

## Configuration

| Variable | Default | Effect |
| --- | --- | --- |
| `ONTOLOGY_SPARQL_BASE` | `http://oxigraph.localdomain:7878` | Oxigraph base URL; `off` turns the store, the sync, and the tools off |
| `ONTOLOGY_TIMEOUT_MS` | `10000` | Per-request timeout |

Tests set `ONTOLOGY_SPARQL_BASE=off` (`tests/isolate-env.mjs`) and use stub
stores.
