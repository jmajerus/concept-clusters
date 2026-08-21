# Design judgment (schema-valid is not enough)

Distilled from `modules/authoringDesignGuidance.js`. If this file and that module disagree, trust the module.

- **No trap words.** Every term belongs unambiguously to its declared cluster(s). If two clusters could both claim it, the term is wrong.
- **Seeds** are the two most instantly recognizable terms in the cluster. The least obvious term is the aha among floating terms.
- **Do not default to "4 terms, 3 lenses."** Size by genuine distinctness. Same counts across clusters are common; use that only as a trigger to check (a) two terms doing one job, (b) a fact that names a concept never used as a term.
- **Bridges are optional** and must be genuine. A disconnected graph is fine. Never add a bridge just to connect the board.
- **`termRole`:** `reference` (default) when learning more about the displayed term deepens this lesson; `connector` when it only carries a local relationship, mechanism, or detail. Do not classify by Wikipedia-worthiness, obscurity, or grammar. A connector may have short `info.text`; it must not get `link` / `extraLink` / `seeAlso` / `citations`.
- **Help at the right grain.** Provide help at the appropriate level of granularity: cluster-sized help on the cluster, term-sized help on a term, local `info.text` on a connector. Omitting a link means no chip — search is not inferred.
- **`relationKind`** classifies the *relationship in the fact*, not the term: `dynamic`, `foundation`, `cross-cutting`, `contrast`, `continuity`, `evaluation`. Leave unset unless one clearly fits. Contrast = the clusters oppose each other about the concept; cross-cutting = the concept recurs or functions differently without contradiction.
- **`direction`** (binary bridges only) only when reversing it would falsify the fact: `through` (needs explicit from/to cluster ids), `bidirectional`, `outward`, `inward`. Omission is normal. Ternary bridges stay undirected.
- **`idealTerms`:** the one term in each connected cluster the fact would naturally name. Leave null rather than fake precision. Ternary only when dropping any one cluster would change what the fact describes; prefer at most one ternary per puzzle.
- **Lenses** default to sequential reclassification. Use `quiz` or `assignment` when the pedagogy needs them, not by habit. Trivia often leans `quiz` + `preSolve: true`; that is a lean for that category, not a rule. A lens that a player can answer by picking one cluster's color is a legitimate reinforcing lens, not a defect. Do not add a second clause to recruit another cluster's terms so the set looks cross-cutting; that spanning has to come from one bounded question. 6 targets is a ceiling, not a goal. Bound the prompt; check the most plausible excluded node.
- **`learningIntroduction`** is optional pre-puzzle domain framing, never gameplay instructions. `required` holds the board until read — rare. Most should be `optional` or `recommended`.
