# Authoring a puzzle

Concept Clusters puzzles should teach a coherent conceptual structure, not
merely satisfy a schema. This document contains the design judgment and normal
workflow that should remain in view throughout authoring. The exhaustive field
contract, special cases, and extended examples live in the
[authoring reference](AUTHORING-REFERENCE.md).

## AI-agent retrieval path

Agents should not load the complete authoring reference by default. The normal
agent context is deliberately progressive:

1. When available, follow the repository's `author-puzzle` or `review-puzzle`
   skill and its compact design-judgment rubric.
2. Call `get_authoring_guidance` with `phase: "core"`; retrieve the matching
   `get_authoring_schema` projection when field structure is needed.
3. Work on one accumulating draft. Before every later pass, retrieve its
   latest revision and preserve every field that pass is not improving.
4. Request `review`, `pedagogy`, or `publication` guidance only when entering
   that concern. Use `complete` only when the focused views do not resolve a
   problem.
5. Call `get_workflow_guidance` only when entering pull-request review or
   catalogue authoring.
6. Consult a specific section of the [authoring
   reference](AUTHORING-REFERENCE.md) only for an unusual field, edge case, or
   validation problem that the focused MCP material does not answer.

The MCP tools do not dynamically paste this document into the conversation.
`modules/authoringDesignGuidance.js` supplies curated design and workflow
guidance; `modules/authoringSchemaResource.js` supplies phase projections from
the complete simplified-puzzle schema. See [MCP.md](MCP.md#how-guidance-reaches-an-agent)
for the complete funnel and tool list.

This separation is intentional: an agent always receives the interacting
quality principles, while mechanical detail occupies context only when it is
actually relevant.

| Need | Agent channel |
|---|---|
| Published taxonomy and examples | `list_categories`, `get_category`, `list_puzzles`, `get_puzzle`, `list_catalogues`, `get_catalogue` |
| Design judgment for the active pass | `get_authoring_guidance` |
| Machine-readable fields for the active pass | `get_authoring_schema` or the complete schema resource |
| Operational PR-review or catalogue procedure | `get_workflow_guidance` |
| Accumulating work | `create_puzzle_draft`, `get_puzzle_draft`, `save_puzzle_draft`, `validate_puzzle_draft` |

Publication, review-loop, catalogue-write, and local checkout tools are listed
once in [MCP.md](MCP.md#tools) rather than duplicated here. Local stdio and
hosted MCP share that contract; checkout installation is the only substantive
local extension.

## Normal workflow

### AI-assisted authoring

Settle the domain logic in prose before constructing the document. Write a
short blueprint containing:

- the puzzle's focused subject and existing category;
- each cluster's distinct purpose, two recognizable seeds, and remaining
  terms;
- each genuine bridge and the conceptual reason it belongs, or an explicit
  decision to use none;
- lenses only when they add a worthwhile second way to think.

Canvas size follows the honest node count; do not choose a board tier or
drop a term to stay small.

Locking this blueprint keeps content decisions from competing with schema and
validation corrections. Draft it through MCP in the
[simplified format](SIMPLIFIED-PUZZLE-FORMAT.md), save with
`save_puzzle_draft`, and validate the complete accumulated draft. Treat
non-blocking authoring flags as prompts for judgment, not automatic failures.

Once validation passes, pause at `/admin/drafts/<id>` for human design-copy
review. Install the puzzle in the LAN checkout to play (`/?puzzle=<id>`).
Opening a pull request ships a production candidate; merging remains a
separate human decision. Cloudflare serves production, not a play preview.

### Direct repository editing

Older puzzles may still be authored directly as one module under
`puzzles/<category>/`, registered in `puzzles/index.js`. Puzzles that have
passed through the publication pipeline also have a canonical simplified
document under `content/puzzles/`; edit through the draft/publication path when
possible so the two representations are regenerated together.

After a direct edit, run `node validate.mjs`. The complete registration,
interchange, and packaged-resource mechanics are in the
[direct repository reference](AUTHORING-REFERENCE.md#direct-repository-mechanics).

## Governing design judgment

These principles interact. A schema-valid puzzle may still be a poor puzzle if
one decision weakens another—for example, adding a bridge only to connect the
graph can introduce a trap term, or padding a lens can make an otherwise clear
question ambiguous.

### No trap words

Every term must belong unambiguously to its declared cluster or clusters.
Difficulty should come from recognizing concepts, not guessing which plausible
interpretation the author intended. This is especially important in fiction,
memoir, poetry, and other domains whose source vocabulary has fluid boundaries:
prefer a precise analytical mechanism over an evocative phrase that could fit
several groups.

Cold-read every board from the player's available evidence. In Star mode, a
cluster term initially has its wording, its hub name, and any `termInfo`—not the
completion-gated fact. If neither the term nor its help makes the intended home
clear, the term is under-supported or genuinely ambiguous. Bridge terms may
remain less obvious, but must not actively point toward the wrong hub.

### Seeds orient the player

The two seeds are the cluster's opening clue. Choose its two most instantly
recognizable terms, leaving less obvious but still unambiguous terms as the
player's discoveries. Do not use the seeds merely to balance visual length or
preserve an earlier ordering.

### Let the material determine the shape

Counts are constraints, not composition targets. Do not begin with an implicit
template such as three clusters, four terms each, three bridges, and three
lenses.

- Create one cluster for each coherent grouping the lesson needs.
- Give each cluster the distinct terms needed to establish its idea.
- Add only genuine bridges; zero bridges and disconnected components are valid.
- Add only lenses with a distinct, defensible learning purpose.

Equal counts are common and do not prove templating. Use repeated counts as a
cheap review trigger: look within each cluster for two terms doing the same
conceptual job, and look in its fact for a distinct concept the term list
omitted. Make a change only when that semantic check finds a real problem.

The standard board supports at most 16 nodes. An honest 17–24-node puzzle
uses the wide canvas automatically; do not drop a distinct term merely to stay small.
Twenty-four is the firm ceiling. Above it, split the subject into focused
related puzzles rather than compressing the lesson.

See the extended [shape rationale](AUTHORING-REFERENCE.md#extended-design-rationale)
and [size rules](AUTHORING-REFERENCE.md#puzzle-size-large).

### Bridges must teach a real relationship

A bridge is optional and must explain why its connected clusters share a
meaningful relationship. Do not manufacture one to make the graph connected,
and do not retain a citation or provenance fact merely because it happens to
touch both subjects. Ask whether the bridge deepens the puzzle's thesis; if it
only reports who wrote about both ideas, it probably belongs in a citation or
nowhere on the board.

The optional bridge fields refine different questions and should not be filled
by routine:

- `termRole` asks whether the displayed term is itself an intended object of
  learning (`reference`) or only carries the local relationship (`connector`).
- `relationKind` classifies the relationship described by the bridge fact, not
  the bridge term in isolation. Leave it unset when none of the six broad kinds
  clearly fits.
- `direction` is for a binary relationship whose meaning changes when reversed.
  Omission is normal.
- `idealTerms` identifies the canonical endpoint in each connected cluster:
  the one term the bridge fact would naturally name. A player may tap any
  completed member to select the correct cluster, but the line resolves to
  this authored endpoint. Use `null` for a genuinely whole-cluster side, and
  omit the field rather than manufacture false precision.
- A ternary bridge is for one genuinely collective three-cluster relationship,
  not shorthand for three pairwise links.

Detailed decision tests are in [bridge term
roles](AUTHORING-REFERENCE.md#bridge-term-roles), [relation
kinds](AUTHORING-REFERENCE.md#bridge-relation-kinds),
[direction](AUTHORING-REFERENCE.md#bridge-direction), [ideal
terms](AUTHORING-REFERENCE.md#ideal-bridge-terms), and [ternary
bridges](AUTHORING-REFERENCE.md#ternary-bridges-experimental).

### Put help at the right grain

Help should match the concept it explains. Cluster-sized context belongs on
the cluster; term-sized help belongs on the term; a connector bridge normally
needs concise `info.text`, not a reference lookup. A confidently wrong direct
link is worse than leaving a term unlinked, so verify every retained target.
Omitting a link means no chip; the player does not receive an inferred
Wikipedia search.

Use structured citations for a specific book, edition, passage, page range, or
claim that a general link cannot carry. Keep always-visible explanation and
completion-gated facts on separate surfaces; never silently replace text the
player has already read.

See [term information](AUTHORING-REFERENCE.md#term-info--links), [cluster
information](AUTHORING-REFERENCE.md#cluster-info--links), [puzzle
information](AUTHORING-REFERENCE.md#puzzle-info--links), and [link-only
overrides](AUTHORING-REFERENCE.md#link-only-overrides).

### Lenses are purposeful second readings

A Concept Lens should create a worthwhile post-solve way to think, not serve as
routine polish. Choose sequential, quiz, or assignment mode from the learning
task rather than habit. Use `preSolve` only when cluster sorting is a foregone
conclusion and the lens is the real lesson.

Fit each lens to one clear objective. A focused question with one, two, or
three honest answers is complete; do not pad toward six or add a second clause
just to cross cluster boundaries. Include every concept that genuinely answers
the wording, and revise the wording when an excluded term would also be
defensible. Reasons should explain why each target qualifies, not restate the
term or prompt.

When several lenses exist, order them as a progression. Begin with recognition
or classification, then move toward mechanism, comparison, or synthesis. A
high-target lens deserves extra scrutiny when it merely selects an entire
cluster plus every bridge already touching it—the board may already display
that answer without requiring judgment.

See the complete [Concept Lens reference](AUTHORING-REFERENCE.md#concept-lenses).

### Learning introductions

A learning introduction is optional, but a short orienting note is often
worth including: one or two paragraphs that state the learning objective and
situate the learner in the domain (vocabulary, stakes, why this subject
matters). It need not be lengthy — a tight paragraph beats a mini-essay.
Omit it when the title and cluster names already orient clearly; prefer it
when the subject is technical, sequential, or easy to misframe.

Write about the **subject**, not the puzzle. The introduction should not
mention clusters, bridges, lenses, boards, sorting, or how terms will be
grouped; schema vocabulary leaking into the lesson is a failure even when no
answer is named. Mark material `required` only when the puzzle truly depends
on it; otherwise prefer `recommended` or `optional`.

Instructional content should point toward richer resources rather than trying
to teach everything inline. Preserve exact citations discovered during
research instead of planning to reconstruct them later. Keep generative
assistance as compact current attribution—one entry per system and scope—not
an edit log or a citation. A proposed two-axis `provenance` shape (contributors
+ collaboration mode) would replace that split later; see
[authoring provenance shape](dev-briefs/authoring-provenance-shape.md).

See [learning introductions](AUTHORING-REFERENCE.md#learning-introductions)
and [generative assistance](AUTHORING-REFERENCE.md#generative-assistance).

## Discovery and stewardship

### Categories and subcategories

Reuse the published taxonomy. A puzzle has one primary `category`; optional
secondary categories are for genuinely multidisciplinary membership.
Subcategories are category-relative subject classifications, not difficulty
levels or curated sequences, and most categories do not need them. Add one
only when the category browse page benefits from a stable internal split.

See the [taxonomy reference](AUTHORING-REFERENCE.md#categories-and-subcategories).

### Related puzzles, tags, and level

`relatedPuzzles` is an informal, one-directional “try this next” list, not a
formal prerequisite graph. Give each entry a specific reason to click and
prefer connections that browsing the same catalogue would not already expose.

Tags are informal Library-search terms, not a controlled vocabulary. `level`
is optional and should remain unset unless introductory, intermediate, or
advanced is a genuinely confident editorial judgment. Never infer it merely
from cluster count or board size.

See [related puzzles](AUTHORING-REFERENCE.md#related-puzzles),
[tags](AUTHORING-REFERENCE.md#tags), and [learning
level](AUTHORING-REFERENCE.md#learning-level).

## Final review

Before validation and human review, check the complete puzzle as one lesson:

- Every term has one defensible home, and the two seeds orient each cluster.
- Cluster facts and term lists agree; no distinct concept is missing merely to
  preserve a count.
- Every bridge earns its place and its optional classifications are justified.
- Links resolve to the intended resource at the appropriate grain.
- Lens wording includes every honest answer and explicitly rules out plausible
  exclusions where necessary.
- The board uses the wide canvas at 17–24 nodes and never exceeds 24.
- The learning introduction is about the subject, not the board.
- Optional metadata is useful rather than filler.
- `generativeAssistance` reflects the current AI-authored or AI-edited scopes.

Then run `validate_puzzle_draft` for MCP drafts or `node validate.mjs` for a
direct repository edit. Structural validation is necessary, but the judgments
above determine whether the puzzle is actually ready.

## Complete field reference

Use the [authoring reference](AUTHORING-REFERENCE.md) for:

- the complete schema example;
- term, cluster, puzzle, and bridge information shapes;
- links, citations, and overrides;
- bridge roles, kinds, direction, ideal terms, and ternary bridges;
- learning-introduction packaging;
- all lens modes and diagnostics;
- category and subcategory registration;
- size limits, authored Star layouts, and cluster colors.
