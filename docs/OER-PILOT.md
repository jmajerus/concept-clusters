# Open educational resource pilot

This pilot tests whether openly licensed educational content can support new
Concept Clusters puzzles **without merely converting a source's headings,
glossary, or review questions into another quiz**.

The first pilot puzzle is `puzzles/engineering/closing-the-loop.js`.

## The complementarity test

A source topic is a strong candidate when the game performs intellectual work
that the source does not already perform for the learner.

Score each candidate from 0 (absent) to 2 (strong) on these dimensions:

1. **Distributed structure** — concepts that belong together are taught across
   different chapters, modules, diagrams, or examples.
2. **Necessary relationships** — understanding depends on how components act on,
   constrain, inform, or transform one another, not just on knowing definitions.
3. **Genuine bridges** — at least two or three terms can connect clusters for a
   reason worth explaining.
4. **Lens potential** — the same completed map supports a second classification
   that reveals another valid structure.
5. **Productive partial models** — learners commonly know pieces of the system
   without seeing how the pieces form a whole.
6. **Transformative distance** — the puzzle's grouping, bridge facts, and lenses
   require synthesis rather than copying the source's existing organization.
7. **Pedagogical fit** — reconstructing the map provides a useful learning act,
   not decorative interactivity.
8. **Rights and provenance** — the exact source version permits adaptation and
   can be attributed at puzzle level.
9. **Extraction practicality** — useful text and metadata can be retrieved in a
   stable enough form for a repeatable authoring workflow.

A pilot candidate should normally score at least 14 of 18, with no zero in
Necessary relationships, Transformative distance, Pedagogical fit, or Rights
and provenance.

## Why process control was selected first

**Source:** *Chemical Process Dynamics and Controls*, Peter Woolf et al.,
University of Michigan; Engineering LibreTexts edition.

- Open Textbook Library record:
  <https://open.umn.edu/opentextbooks/textbooks/chemical-process-dynamics-and-controls>
- LibreTexts book:
  <https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29>
- License shown by the LibreTexts edition: CC BY 3.0.

The source spreads the core loop across material on sensors and actuators,
error-based control, PID control, tuning, modeling, and control architectures.
The textbook teaches each component and supplies equations and examples, but a
learner can still finish a section knowing the parts without holding one stable
mental model of how information returns, becomes a decision, crosses into
physical action, and encounters real-world limits.

Concept Clusters adds value by asking the learner to construct that integrated
model:

- clusters distinguish measurement, decision, action, and limits;
- bridges reconstruct the loop through `feedback`, `control signal`, and
  `tuning`;
- lenses separate information flow from physical intervention, expose why
  correction remains imperfect, and surface the human choices embedded inside
  automation.

This is not the source's chapter outline. In fact, the puzzle deliberately cuts
across the chapter outline.

### Provisional score

| Criterion | Score | Reason |
|---|---:|---|
| Distributed structure | 2 | Core concepts are spread across several chapters. |
| Necessary relationships | 2 | Control is intelligible only as a connected loop. |
| Genuine bridges | 2 | Feedback, control signal, and tuning each perform distinct relational work. |
| Lens potential | 2 | Information, physical action, limitations, and design choices cross the clusters differently. |
| Productive partial models | 2 | Learners may recognize sensors, controllers, or actuators without integrating them. |
| Transformative distance | 2 | The puzzle reorganizes rather than reproduces the source. |
| Pedagogical fit | 2 | Building the loop is itself the target understanding. |
| Rights and provenance | 2 | The source is identified as CC BY 3.0 and attribution is embedded in the puzzle file. |
| Extraction practicality | 2 | The book and chapter pages are available as structured web content. |
| **Total** | **18/18** | Suitable for the first pilot. |

The score is a hypothesis to test with actual play, not a claim that every
puzzle produced from this source will be equally strong.

## Why not begin with Wikidata

Wikidata remains an excellent CC0 source for candidate facts and relationship
verification. It is not the ideal first complementarity pilot because its
native form is already a graph. A puzzle generated directly from its edges may
re-display the source's structure rather than add a new learning operation.
It may become more valuable later as a factual substrate beneath a puzzle whose
clusters, bridge explanations, and lenses are authored from a separate
pedagogical question.

## Why not begin with a PLC course package

SkillsCommons PLC and mechatronics materials remain strong second-stage
candidates. Their practical sequences could support puzzles about signal flow,
interlocks, machine states, and troubleshooting. The first pilot uses the
process-control textbook because its HTML structure and broad, vendor-neutral
concepts make it easier to test the authoring proposition before adding SCORM,
IMSCC, or vendor-specific extraction work.

## Pilot hypotheses

The pilot succeeds only if playtesting supports all of the following:

1. The puzzle helps a learner explain the complete loop more clearly than a
   glossary or component diagram alone.
2. The bridge reveals feel necessary rather than ornamental.
3. At least two lenses produce genuine new insight from the completed map.
4. The clusters do not collapse into a simple chronological sequence or a list
   of synonyms.
5. The source remains visibly attributable without making the player-facing
   experience feel like copied textbook material.
6. A second puzzle can be produced from the same source without repeating the
   first one's organizing insight.

## Playtest questions

- Before playing, ask the learner to describe how a controller knows what to do.
- After the map, ask them to trace both the information path and the physical
  action path.
- After the lenses, ask where human judgment remains inside the automatic loop.
- Note any term that plausibly belongs in more than one cluster; revise rather
  than treating that ambiguity as desirable difficulty.
- Ask which bridge reveal changed or completed the learner's explanation.

## Candidate continuation catalogue

The source appears capable of supporting a small **Control and Systems**
catalogue, provided later puzzles pass the same test:

1. **Closing the Loop** — measurement, decision, action, and limitations.
2. **Three Ways to Correct** — proportional, integral, and derivative action,
   organized around the different temporal information each uses and the
   failure modes each introduces.
3. **Seeing Trouble Before It Arrives** — feedback, feed-forward, cascade, and
   combined architectures, emphasizing what each architecture can know and
   when it can act.
4. **When a Stable Loop Fails** — delay, noise, saturation, windup, oscillation,
   and robustness, with bridges between mathematical response and physical
   constraints.

Only the first puzzle is part of the initial implementation. The remaining
items are catalogue hypotheses, not commitments.
