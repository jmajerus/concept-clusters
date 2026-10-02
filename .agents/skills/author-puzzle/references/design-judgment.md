# Design judgment (schema-valid is not enough)

Distilled from `modules/authoringDesignGuidance.js`. If this file and that
module disagree, trust the module.

## Inventory-first (Phase A)

- **Map the concept space before the grid.** On inventory pass: thesis, distinctions
  with distinct jobs, flat `candidateTerms`, anchors, exclusions, genuine
  `connections` — no seeds, no floatingTerms, no renderer fields, and no
  node-cap arithmetic.
- **Fit is a lossy translation**, not a second survey. Every dropped inventory
  term needs a ledger reason; neither equal nor unequal counts require a
  justification in themselves.
- **No puzzle files on inventory.** On fit, at most one **same-category** peer for JSON conventions — never a cross-domain “structural comparable.”
- **Human approves the map before JSON.** The editor may not know the field;
  sourced distinctions and exclusions are the review surface. Counts describe
  that map; do not ask the human to lint symmetry or manufacture asymmetry.

## Board and pedagogy

- **No trap words.** Every term belongs unambiguously to its declared cluster(s). If two clusters could both claim it, the term is wrong.
- **Seeds** are the two most instantly recognizable terms in the cluster. The least obvious term is the aha among floating terms. A minimum-size two-term cluster keeps only one seed, so its one remaining term is still the aha.
- **Do not default to "4 terms, 3 lenses."** Before mapping the material, do
  not pick any count or narrow range for clusters, terms, bridges, or lenses.
  Size by genuine distinctness. A subject's clusters are usually uneven.
  `validate_puzzle_draft` emits `uniform-partition` when three or more
  clusters all have the same term count, and mentions it when the cluster
  count repeats that number. That prompt is a reason to re-read each cluster
  for two terms doing one job, or a fact naming a concept the term list
  omitted; fix those on the board. That is not a licence to add or drop
  terms just to break an even count. If the board has no concept-gathering
  inventory, write that inventory in this review and stop for human approval
  before fitting it onto the board. Do not leave that inventory as an open
  issue. Early boards were often sparse as well as even,
  and gathering the omitted concepts usually changes the counts. Keep even
  counts when the sourced map supports them. Do not add or drop terms on the
  current board to break the pattern, and do not change bridges because of
  the prompt. Canvas size
  is derived from the honest node count, routed edges, and term length. Do
  not drop a distinct term to stay small, do not keep terms to fill toward
  32, and do not split in order to change the canvas. Split when the subject
  has a natural seam that teaches better as two lessons, and whenever the
  map needs more than 32 nodes.
- **Bridges are optional** and must be genuine. A disconnected graph is fine. Never add a bridge merely to connect the board.
- **Help at the right grain.** Put cluster-sized help on the cluster, term-sized help on a term, and bridge context on the bridge. Omitting a link means no chip; search is not inferred.
- **Keep information surfaces stable.** Always-visible `info.text` and a completion-gated `fact` have different jobs; never make a hover or help surface silently replace text the player already read.
- **`relationKind`** classifies the relationship in the fact, not the term: `dynamic`, `foundation`, `cross-cutting`, `contrast`, `continuity`, or `evaluation`. Leave it unset unless one clearly fits. Contrast means the clusters oppose each other about the concept; cross-cutting means the concept recurs or functions differently without contradiction.
- **`direction`** applies only to binary bridges and only when reversal would falsify the fact: `through` (with explicit from/to cluster ids), `bidirectional`, `outward`, or `inward`. Omission is normal. Ternary bridges stay undirected.
- **`idealTerms`:** Use the canonical endpoint in each connected cluster: the one term the fact would naturally name. Any completed member can select the cluster during play, but the line resolves to the authored endpoint. Use null for a genuinely whole-cluster side rather than fake precision. A ternary bridge is valid only when dropping any cluster changes what the fact describes; prefer at most one ternary per puzzle.
- **Lenses** default to sequential reclassification. Use `quiz` or `assignment` when the pedagogy needs them, not by habit. Trivia often leans `quiz` plus `preSolve: true`, but that is not a rule. Fit each lens to a learning objective worth a second look. A focused question whose honest answers are one, two, or three terms is a complete lens, not a stub to pad toward 6. A cinematography example: Dutch tilt and dolly zoom as the two Disturbance techniques that make space geometrically wrong, excluding whip pan and slow zoom, is a complete two-target reinforcing lens. Cross-cutting is welcome when those answers already span clusters; it is not a higher grade of lens and not a reason to churn, concatenate a second clause, recruit extra terms, or drop the lens. Reinforcing one cluster's color is valid when that is the honest question. The legal 1-6 unique targets are a range, not a fill target. Include every answering term and omit every non-answering term. Bound the prompt and check the most plausible excluded node.
- **`learningIntroduction`** is optional. Write one lesson about the
  **subject**: the learning objective, the domain, and how the ideas relate,
  including the groupings and why they hold. No clusters, bridges, lenses,
  boards, sorting, or gameplay instructions. Do not author a preview, a
  teaser, or a split. Play shows the start, then Continue reading, and the
  full text once the board and its lenses are complete. Omit when the title
  and clusters already orient clearly; prefer a lesson for technical,
  sequential, or easy-to-misframe subjects. `required` holds the board until
  the learner chooses Start puzzle in the lesson and should be rare; most lessons should
  be `optional` or `recommended`.
