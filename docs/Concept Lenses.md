# Concept Lenses

Proposal: "I...envisioned another type of gameplay, that may fit with certain types of puzzles. And that is where the user completes the puzzle, but the game isn't over. Instead the user is prompted for a succession of matching quizzes, where a specified attribute can be associated with multiple nodes across all clusters. The user selects each node that they think contains or is associated with that attribute. After the user submits their selections, the correct answers are then displayed by highlighting the actual nodes that have the association. Similar rounds of play can proceed until the list of attributes is exhausted for the particular puzzle?"

Yes. This fits the project extremely well, and it may deepen the game’s uniqueness more than another primary solving mode would.

The initial puzzle asks:

> **Which concepts belong together, and what connects the resulting clusters?**

The post-solve activity would ask:

> **What different patterns become visible when we examine the completed map through another lens?**

That is not merely an appended quiz. It changes the completed board from an answer display into a reusable field of knowledge.

## A useful name: “Concept lenses”

I would distinguish these from bridges:

- **Clusters** represent primary conceptual groupings.
- **Bridges** represent meaningful relationships among those groupings.
- **Lenses** reveal cross-cutting attributes shared by any subset of nodes.

A lens does not alter the map. It temporarily overlays another classification upon it.

For example, after completing a physiology puzzle:

> **Select every concept directly involved in gas exchange.**

The correct selections might include terms from the respiratory cluster, circulatory cluster, and a bridge term.

Then:

> **Select every structure whose activity depends on a pressure gradient.**

That might illuminate an entirely different subset of the same map.

The player is repeatedly re-indexing the knowledge rather than merely recalling the original cluster assignments.

## Why this plays to Concept Clusters’ distinctive strength

Most classification puzzles have one hidden partition. Once that partition is found, the conceptual work is over.

Concept Clusters already rejects that simplified model by including bridge concepts. Lenses would take the next logical step:

> A well-organized subject has a useful primary structure, but it can also be reorganized meaningfully along other dimensions.

That is an important feature of real understanding. Knowing that two terms occupy different textbook chapters does not mean they have nothing else in common.

The resulting progression becomes:

```text
Place each concept in its primary cluster
                ↓
Discover relationships between clusters
                ↓
Recognize attributes cutting across the entire map
```

The completed board would become the foundation for the deeper play rather than the end of it.

## Proposed interaction

After the final bridge is completed:

1. The ordinary completion message and teaching facts appear.

2. A transition says something like:

   > **Map complete. Now examine it through a different lens.**

3. The first lens prompt appears.

4. Clicking a node toggles it as selected.

5. The player selects as many nodes as they believe apply.

6. They press **Check selections**.

7. The board reveals:

   - correctly selected nodes;
   - applicable nodes they missed;
   - selected nodes that do not fit.

8. A brief explanation appears.

9. The next lens begins.

10. After the final lens, the puzzle is fully complete.

I would not require the player to reach a perfect answer before moving onward. The reveal itself is the teaching event, consistent with the game’s diagnostic rather than punitive philosophy.

## The reveal should preserve three distinctions

Highlighting only the true answer set would work, but showing the player’s relationship to that set would be more informative:

- **Correct selection:** selected and applicable
- **Missed association:** applicable but not selected
- **Extra selection:** selected but not applicable

This could be visually subtle. For example:

```text
Filled highlight       Correctly selected
Outlined highlight     Applicable but missed
Faded × marker         Selected but not applicable
```

The main emphasis should remain on the actual applicable set, not on penalizing errors.

After the reveal, a **Show explanation** or automatically displayed note could say:

> These concepts all involve transfer across a membrane. “Diffusion” names the process, while the alveolar and capillary structures create the surfaces across which it occurs.

Even better, some rounds could include short node-specific reasons.

## Suggested schema

The cleanest puzzle-level field might be `lenses`:

```js
lenses: [
  {
    id: "depends-on-context",
    prompt: "Which concepts depend strongly on historical or cultural context?",
    targets: [
      "genre",
      "authorship",
      "intended audience",
      "contextualization"
    ],
    explanation:
      "Each of these concepts changes how a work is understood when its setting, conventions, creator, or audience is considered.",
    reasons: {
      genre:
        "Genres carry historically developed conventions and expectations.",
      authorship:
        "Ideas about authorship vary across periods and cultures.",
      "intended audience":
        "Audience knowledge and expectations belong to a particular setting.",
      contextualization:
        "Contextualization explicitly relates interpretation to those circumstances."
    }
  }
]
```

Because puzzle terms and bridge terms are unique on a board, target words may be sufficient as identifiers. The validator should still confirm that every target names exactly one real node.

I would call the field `lenses`, rather than `postSolveQuiz`, because it identifies the intellectual purpose rather than the interface mechanism.

## Guardrails for authoring a lens

The same discipline behind “no trap words” should apply here. Each lens needs a defensible answer set.

A strong lens should:

- span at least two clusters;
- reveal a pattern not already identical to one cluster;
- use an attribute precise enough to support a clear yes-or-no decision;
- include a meaningful minority of the board, rather than nearly everything;
- have a short explanation of why the selected concepts belong;
- avoid penalizing a reasonable broader interpretation of vague wording.

The critical test is:

> Could a knowledgeable player reasonably argue that an excluded node also has this attribute?

When the answer is yes, either refine the wording or include the node.

For example, this is too broad:

> Select everything associated with interpretation.

Almost the entire `Interpreting a text` board could qualify.

This is stronger:

> Select every concept that can function as evidence cited directly from the text.

That gives the player a more stable decision rule.

## Good target-set size

For a board of roughly 14–19 nodes, I would normally aim for:

- 3–6 correct nodes per lens;
- spread across 2–4 clusters;
- perhaps one bridge node where conceptually appropriate.

One-node answers would feel like ordinary multiple choice. Ten-node answers would mostly test whether the player can identify the few exceptions.

## Order the lenses as a conceptual progression

A good puzzle might have three to five lenses:

1. **Concrete attribute**
2. **Functional relationship**
3. **Cross-cutting principle**
4. **Interpretive or evaluative distinction**

For a text-interpretation puzzle:

1. Which concepts refer to observable features of a text?
2. Which concepts help support or test an interpretive claim?
3. Which concepts depend on knowledge beyond the text itself?
4. Which concepts help address competing interpretations?

The rounds should not merely repeat the original clusters under slightly different wording. Each should make the learner reorganize the map.

## Puzzles especially suited to lenses

This feature would be strongest where a domain has several legitimate axes of classification.

### Science and medicine

Possible lenses:

- requires energy;
- involves transport;
- controlled by feedback;
- occurs across a membrane;
- changes under pressure;
- involves chemical signaling.

### History

Possible lenses:

- expands political participation;
- concentrates authority;
- depends on written records;
- emerges during institutional crisis;
- has both symbolic and material effects.

### Humanities

Possible lenses:

- can function as evidence;
- depends on audience expectations;
- changes across performance or interpretation;
- involves symbolic representation;
- connects an individual work to a broader culture.

### Media literacy

Possible lenses:

- concerns provenance;
- can be checked through lateral reading;
- can be manipulated without changing the underlying content;
- requires comparison with an independent source;
- may exploit emotional response.

Some puzzles would not need lenses. A lens set should be optional, used only where it reveals genuinely useful secondary structure.

## Bridges can participate

Bridge nodes should normally be eligible targets.

That is one of the most promising aspects of the mechanic. A bridge may share an attribute with ordinary terms even though its primary function is relational.

For example, `contextualization` might be selected under:

> Which concepts help evaluate an interpretation?

That reinforces that a bridge is itself a substantive concept, not just a connector drawn for gameplay convenience.

Cluster titles should probably not be selectable initially. They name containers rather than atomic concepts, and including them would make answer semantics less consistent.

## Implementation architecture

The game engine would gain an explicit phase:

```js
state.phase =
  "assembling" |
  "lens-selecting" |
  "lens-revealed" |
  "complete";
```

When `state.made === state.need`:

```js
if (puzzle.lenses?.length) {
  beginLensSequence();
} else {
  finishPuzzle();
}
```

During a lens round:

- connection-making is disabled;
- node clicks toggle membership in `state.lensSelections`;
- links and positions remain unchanged;
- the renderer adds classes based on lens state.

For example:

```js
function lensClass(node) {
  if (state.phase === "lens-selecting") {
    return state.lensSelections.has(node.word)
      ? "lens-selected"
      : "";
  }

  if (state.phase === "lens-revealed") {
    const selected = state.lensSelections.has(node.word);
    const correct = currentLens.targets.includes(node.word);

    if (selected && correct) return "lens-correct";
    if (!selected && correct) return "lens-missed";
    if (selected && !correct) return "lens-extra";
  }

  return "";
}
```

This should be renderer-neutral. Graph, Star, and Circle modes could all use the same lens state while applying their own SVG classes.

## Preserve the solved layout

The post-solve map should remain spatially stable during the lens sequence.

That matters because the player will build location-based familiarity:

> “Those two nodes on opposite sides of the map both have this property.”

If the simulation continues moving them substantially between rounds, the activity becomes harder for an irrelevant reason.

The physics could cool and stop once the final map is satisfactorily arranged. Lenses would then animate through color, outline, opacity, or gentle pulses without moving the nodes.

This also gives the detangling work a clearer purpose: produce a stable, readable stage on which the lens sequence can occur.

## Progress and completion

A compact status could read:

```text
Lens 2 of 4
Attribute: Depends on historical context
```

After each reveal:

```text
You identified 3 of 4.
```

I would avoid accumulating a score across rounds at first. The purpose is attentive reclassification, not competitive performance.

At the end, a synthesis message could say:

> **You completed the map and examined it through four cross-cutting lenses.**

There could then be a review view where the learner reopens any lens and sees its highlighted answer set.

## An especially interesting extension: cumulative overlays

Later, the game could display a small legend and let the player revisit completed lenses:

```text
Evidence-related
Context-dependent
Evaluative
Cross-cluster
```

Selecting one would recolor the same completed board.

That would turn a puzzle into a compact interactive study map. The learner could explore the map by primary cluster or by secondary attribute without creating a separate diagram.

## The strongest conceptual formulation

Clusters answer:

> **What kind of thing is this?**

Bridges answer:

> **How do these kinds of things relate?**

Lenses answer:

> **What else do these concepts have in common, despite belonging to different parts of the map?**

That three-layer structure could become the central identity of Concept Clusters:

> **Build the categories. Connect the ideas. Change the lens.**

This is not feature creep in the ordinary sense. It is a coherent extension of the project’s existing claim that knowledge is both structured and interconnected.

## Comparative lens assignment

Sequential lenses ask whether each concept fits the current cross-cutting attribute. Their target sets may overlap and may leave some concepts untouched.

Some learning goals instead depend on comparing several neighboring explanations at once:

> Which lens is the best fit for each concept?

For that task, opt into **Lens Assignment** at the puzzle level:

```js
{
  lensMode: "assignment",
  lenses: [
    {
      id: "technical-constraint",
      label: "Technical constraint",
      definition: "A limit imposed by the capabilities or rules of a technical environment.",
      // Optional exceptional override; normally omit this and let the
      // game choose an identity hue unused by the puzzle's clusters.
      color: "cyan",
      prompt: "Which concepts are primarily technical constraints?",
      targets: ["browser sandbox", "network latency"],
      explanation: "These concepts describe limits imposed by the technical environment.",
      reasons: {
        "browser sandbox": "The security model restricts access to operating-system capabilities."
      }
    },
    {
      id: "institutional-incentive",
      label: "Institutional incentive",
      prompt: "Which concepts are primarily institutional incentives?",
      targets: ["vendor lock-in", "centralized control"],
      explanation: "These concepts are best understood through organizational incentives and control."
    }
  ]
}
```

Missing `lensMode`, or an explicit `lensMode: "sequential"`, retains the original one-lens-at-a-time activity.

### Assignment-mode authoring requirements

Assignment targets form an exclusive classification of an authored subset of ordinary and bridge terms:

- provide at least two lenses;
- give every lens a unique, stable `id`;
- give every lens a compact `label`, or rely on its `prompt` as a fallback;
- add a brief `definition` when a compact label may be unfamiliar or ambiguous;
- normally let the game allocate unused lens colors; use an optional lens `color` only when an exceptional puzzle needs an authored choice;
- include each concept that should participate in exactly one target array;
- omit concepts that are not useful for the comparison; omitted nodes receive no badge;
- leave no lens empty;
- keep each lens cross-cluster rather than merely renaming a primary cluster;
- use `reasons` to explain why a concept's authored lens is its best fit, especially where another lens has a plausible secondary relationship.

The validator enforces identity, exclusivity, real target names, and reason ownership. It deliberately enforces neither whole-board coverage nor balanced lens sizes. An uneven or partial classification can be educationally meaningful, though 3–5 reasonably distributed lenses will usually be easiest to compare.

“Best fit” does not mean “only conceivable relationship.” The author should make the primary distinction defensible from the labels, prompts, explanations, and the concepts themselves rather than relying on a hidden wording trick.

### Player interaction

After the map is complete and its generated layout has been polished, all assignment lenses appear together. Activating any badged term opens one shared chooser; untargeted terms retain their normal information behavior. A numbered badge records the selected lens without making color the only cue, and the player may revise every choice before checking.

While assignment mode is active, the original cluster and bridge palette is partially desaturated. Cluster structure remains visible through its subdued tints, geometry, labels, and connections, while the fully saturated numbered badges read as the active comparative layer. Result outlines and symbols remain full strength.

Lens colors are allocated deterministically from the seven-color identity palette. Colors not used by the puzzle's clusters are assigned first; only a puzzle that exhausts the remaining pool reuses a cluster hue. Purple remains reserved for bridges, and natural green and red remain reserved for checked feedback. A lens may specify an exceptional `color` override from the identity palette, but overrides should not be used merely to decorate a puzzle.

The persistent legend and chooser show an optional `definition` beneath the compact label. Keep it to one brief sentence: it should orient the comparison without revealing which concepts belong to the lens.

Checking is available immediately, so a player may leave genuinely uncertain concepts unanswered. The reveal distinguishes correct, incorrect, and unanswered concepts; changes incorrect or unanswered badges to the authored lens; and retains the player's original choice in diagnostic text. Cluster-title nodes are never assignable, while authored bridge targets participate like other concepts.

“When systems stop seeing people” is the first catalogue example of this modality.
