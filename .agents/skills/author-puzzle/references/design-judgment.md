# Design judgment (schema-valid is not enough)

Distilled from `modules/authoringDesignGuidance.js`. If this file and that
module disagree, trust the module.

## Inventory-first (Phase A)

- **Map the concept space before the grid.** On inventory pass: thesis, distinctions
  with distinct jobs, flat `candidateTerms`, anchors, exclusions — no seeds,
  no floatingTerms, no `large`, no node-cap arithmetic.
- **Fit is a lossy translation**, not a second survey. Every dropped inventory
  term needs a ledger reason. Uneven inventory → uniform board requires explicit
  justification in the loss ledger.
- **No puzzle files on inventory.** On fit, at most one **same-category** peer for JSON conventions — never a cross-domain “structural comparable.”
- **Human approves the map before JSON.** The editor may not know the field; sourced distinctions and exclusions are the review surface. Uniform `candidateTerms` counts across distinctions are blocked by `check-completeness` — fix or justify before presenting inventory; do not ask the human to lint symmetry.

## Board and pedagogy

- **No trap words.** Every term belongs unambiguously to its declared cluster(s). If two clusters could both claim it, the term is wrong.
- **Seeds** are the two most instantly recognizable terms in the cluster. The least obvious term is the aha among floating terms.
- **Do not default to "4 terms, 3 lenses."** Size by genuine distinctness. Same counts across clusters are common; use that only as a trigger to check for two terms doing one job or a fact naming a concept never used as a term. The 16-node standard board is not a composition target: 17–24 nodes set `large: true`; do not drop a distinct term to stay small. Split only above 24.
- **Bridges are optional** and must be genuine. A disconnected graph is fine. Never add a bridge merely to connect the board.
- **`termRole`:** Use `reference` (the default) when learning more about the displayed term deepens the lesson; use `connector` when it carries only a local relationship, mechanism, or detail. Do not classify by Wikipedia-worthiness, obscurity, or grammar. A connector may have short `info.text`; it must not get `links`, `link`, `extraLink`, `seeAlso`, or `citations`.
- **Help at the right grain.** Put cluster-sized help on the cluster, term-sized help on a term, and local `info.text` on a connector. Omitting a link means no chip; search is not inferred.
- **Keep information surfaces stable.** Always-visible `info.text` and a completion-gated `fact` have different jobs; never make a hover or help surface silently replace text the player already read.
- **`relationKind`** classifies the relationship in the fact, not the term: `dynamic`, `foundation`, `cross-cutting`, `contrast`, `continuity`, or `evaluation`. Leave it unset unless one clearly fits. Contrast means the clusters oppose each other about the concept; cross-cutting means the concept recurs or functions differently without contradiction.
- **`direction`** applies only to binary bridges and only when reversal would falsify the fact: `through` (with explicit from/to cluster ids), `bidirectional`, `outward`, or `inward`. Omission is normal. Ternary bridges stay undirected.
- **`idealTerms`:** Use the canonical endpoint in each connected cluster: the one term the fact would naturally name. Any completed member can select the cluster during play, but the line resolves to the authored endpoint. Use null for a genuinely whole-cluster side rather than fake precision. A ternary bridge is valid only when dropping any cluster changes what the fact describes; prefer at most one ternary per puzzle.
- **Lenses** default to sequential reclassification. Use `quiz` or `assignment` when the pedagogy needs them, not by habit. Trivia often leans `quiz` plus `preSolve: true`, but that is not a rule. Fit each lens to a learning objective worth a second look. A focused question whose honest answers are one, two, or three terms is a complete lens, not a stub to pad toward 6. A cinematography example: Dutch tilt and dolly zoom as the two Disturbance techniques that make space geometrically wrong, excluding whip pan and slow zoom, is a complete two-target reinforcing lens. Cross-cutting is welcome when those answers already span clusters; it is not a higher grade of lens and not a reason to churn, concatenate a second clause, recruit extra terms, or drop the lens. Reinforcing one cluster's color is valid when that is the honest question. The legal 1-6 unique targets are a range, not a fill target. Include every answering term and omit every non-answering term. Bound the prompt and check the most plausible excluded node.
- **`learningIntroduction`** is optional, but a short orienting note (one or
  two paragraphs stating the learning objective and situating the domain) is
  often useful — especially for technical, sequential, or easy-to-misframe
  subjects. Write about the **subject**, not the puzzle: no clusters, bridges,
  lenses, boards, sorting, or membership/topology. Schema vocabulary in the
  lesson is a failure even when no answer is named. Length is not required;
  omit when title and clusters already orient clearly. `required` holds the
  board until read and should be rare; most introductions should be `optional`
  or `recommended`.
