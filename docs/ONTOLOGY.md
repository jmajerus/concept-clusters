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

## Ad hoc queries

Oxigraph serves a SPARQL editor (YASGUI) at
[http://oxigraph.localdomain:7878/](http://oxigraph.localdomain:7878/).
It queries the whole server, so wrap Concept Clusters patterns in
`GRAPH ?g { … }` with the prefix filter; the default graph holds
terminology-mcp's data. YASGUI keeps tabs in the browser, so a query pasted
once stays. These start with the same prefixes:

```sparql
PREFIX cc: <https://concept-clusters.org/vocab#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX schema: <https://schema.org/>
```

### Labels shared by the most puzzles

```sparql
SELECT ?key (COUNT(DISTINCT ?puzzle) AS ?puzzles) (GROUP_CONCAT(DISTINCT ?title; separator=" · ") AS ?titles)
WHERE {
  GRAPH ?g { ?t cc:labelKey ?key ; cc:inPuzzle ?puzzle . ?puzzle schema:name ?title }
  FILTER(STRSTARTS(STR(?g), "urn:concept-clusters:graph:puzzle:"))
}
GROUP BY ?key
HAVING (COUNT(DISTINCT ?puzzle) > 1)
ORDER BY DESC(?puzzles) ?key
LIMIT 50
```

### Where one label appears

Change `"atp"` to the label key: lowercase, with accents and extra spaces removed.

```sparql
SELECT ?title ?label ?placement ?role
WHERE {
  GRAPH ?g {
    ?t cc:labelKey "atp" ; skos:prefLabel ?label ; cc:inPuzzle ?puzzle .
    ?puzzle schema:name ?title .
    OPTIONAL { ?t cc:inCluster/schema:name ?cluster }
    OPTIONAL { ?t cc:role ?role }
    BIND(IF(EXISTS { ?t a cc:Bridge }, "bridge", ?cluster) AS ?placement)
  }
  FILTER(STRSTARTS(STR(?g), "urn:concept-clusters:graph:puzzle:"))
}
ORDER BY ?title
```

### Unlinked neighbours of one puzzle

Ranked by shared labels. Change the puzzle id in the graph IRI.

```sparql
SELECT ?other ?title (COUNT(DISTINCT ?key) AS ?shared) (GROUP_CONCAT(DISTINCT ?label; separator=", ") AS ?labels)
WHERE {
  GRAPH <urn:concept-clusters:graph:puzzle:cellular-energy> {
    ?t cc:labelKey ?key ; skos:prefLabel ?label .
    ?self a cc:Puzzle .
  }
  GRAPH ?g { ?t2 cc:labelKey ?key ; cc:inPuzzle ?other . ?other schema:name ?title }
  FILTER(STRSTARTS(STR(?g), "urn:concept-clusters:graph:puzzle:") && ?other != ?self)
  FILTER NOT EXISTS { GRAPH ?any { ?self cc:relatedPuzzle ?other } }
}
GROUP BY ?other ?title
ORDER BY DESC(?shared)
LIMIT 20
```

### Puzzles per domain and primary category

```sparql
SELECT ?domain ?category (COUNT(DISTINCT ?puzzle) AS ?puzzles)
WHERE {
  GRAPH ?g { ?puzzle cc:primaryCategory ?c }
  FILTER(STRSTARTS(STR(?g), "urn:concept-clusters:graph:puzzle:"))
  GRAPH <urn:concept-clusters:graph:taxonomy> {
    ?c schema:name ?category .
    OPTIONAL { ?c cc:inDomain ?d . ?d schema:name ?domain }
  }
}
GROUP BY ?domain ?category
ORDER BY ?domain DESC(?puzzles)
```

### Bridge relation kinds across the corpus

```sparql
SELECT ?kind (COUNT(*) AS ?bridges)
WHERE {
  GRAPH ?g { ?b a cc:Bridge . OPTIONAL { ?b cc:relationKind ?k } }
  FILTER(STRSTARTS(STR(?g), "urn:concept-clusters:graph:puzzle:"))
  BIND(COALESCE(?k, "(none)") AS ?kind)
}
GROUP BY ?kind
ORDER BY DESC(?bridges)
```

### Published puzzles with no lenses

```sparql
SELECT ?category ?title
WHERE {
  GRAPH ?g { ?puzzle a cc:Puzzle ; schema:name ?title ; cc:primaryCategory ?c }
  FILTER(STRSTARTS(STR(?g), "urn:concept-clusters:graph:puzzle:"))
  FILTER NOT EXISTS { GRAPH ?g { ?puzzle cc:hasLens ?lens } }
  GRAPH <urn:concept-clusters:graph:taxonomy> { ?c schema:name ?category }
}
ORDER BY ?category ?title
```

## Configuration

| Variable | Default | Effect |
| --- | --- | --- |
| `ONTOLOGY_SPARQL_BASE` | `http://oxigraph.localdomain:7878` | Oxigraph base URL; `off` turns the store, the sync, and the tools off |
| `ONTOLOGY_TIMEOUT_MS` | `10000` | Per-request timeout |

Tests set `ONTOLOGY_SPARQL_BASE=off` (`tests/isolate-env.mjs`) and use stub
stores.
