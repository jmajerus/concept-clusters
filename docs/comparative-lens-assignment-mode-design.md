# Design: Comparative Lens Assignment Mode

**Project:** Concept Clusters  
**Status:** Proposed implementation design  
**Intended handoff:** Codex in VS Code  
**Date:** 2026-08-01

## 1. Summary

Concept Clusters currently supports a sequential post-map lens activity. Each lens is presented individually, and the player selects every concept to which that lens applies.

This design adds an optional second lens-play modality:

> Present all lenses simultaneously and ask the player to assign each concept to the single lens that best fits it.

The existing sequential modality remains the default and retains its current behavior. The new modality is puzzle-author controlled and is appropriate only when the author has designed the lens target sets as an exclusive, exhaustive classification of the selectable concept nodes.

Suggested player-facing name:

**Lens Assignment**

Suggested schema value:

```js
lensMode: "assignment"
```

Existing puzzles with `lenses` and no `lensMode` continue to use sequential lens play.

---

## 2. Problem Statement

Sequential lens play asks the player:

> Which concepts does this lens apply to?

That interaction works when lenses are independent, overlapping perspectives. A concept may legitimately appear under several lenses.

A different kind of puzzle may instead ask:

> Which available lens best explains or classifies this concept?

Sequential presentation is unsuitable for that task because the player cannot compare the current lens with later lenses that have not yet been revealed. The player needs to see the full classification vocabulary before assigning any concept.

The new mode must therefore:

1. reveal all lens choices at once;
2. permit one lens assignment per selectable concept;
3. make assignments visible on the completed map;
4. allow revision before evaluation;
5. reveal the authored answer partition and explanatory feedback;
6. work across Graph, Star, and Circle renderers;
7. preserve all existing sequential-lens behavior.

---

## 3. Goals

### 3.1 Primary goals

- Add a puzzle-level opt-in lens assignment mode.
- Reuse the existing `lenses` data model wherever practical.
- Keep the completed map spatially stable during assignment.
- Support Graph, Star, and Circle modes consistently.
- Provide an accessible alternative to color-only classification.
- Validate that assignment-mode lens targets form a valid partition.
- Add unit and browser-level regression coverage.
- Document the authoring rules and example schema.

### 3.2 Secondary goals

- Make the assignment state easy to inspect and revise.
- Preserve mode switching during post-map lens play.
- Support bridge concepts as assignable nodes.
- Reuse existing lens explanations and optional node-specific reasons.
- Keep the initial implementation modest enough for a focused pull request.

---

## 4. Non-goals for the Initial Pull Request

Do not include these unless they emerge as trivial consequences of the implementation:

- assigning a concept to multiple lenses;
- ranking primary and secondary lenses;
- drag-and-drop assignment;
- accumulated scores or competitive grading;
- timed play;
- author-configurable lens colors;
- cluster-title assignment;
- partial-credit algorithms beyond reporting correct and incorrect assignments;
- changing the existing sequential lens interaction;
- a general-purpose taxonomy editor;
- JSON-LD redesign beyond representing the new puzzle-level mode faithfully.

These can be considered separately after the basic modality is proven usable.

---

## 5. Terminology

### Sequential lens mode

The existing behavior. One lens is presented at a time. The player selects every concept that applies. Target sets may overlap and need not cover every node.

### Assignment lens mode

The proposed behavior. All lenses are visible simultaneously. Every selectable concept is assigned to exactly one lens. Lens target sets must be mutually exclusive and collectively exhaustive.

### Selectable concept

A real term node on the solved board, including ordinary cluster terms and bridge terms. Cluster-title nodes are not selectable.

### Assignment partition

The combined lens target sets in assignment mode, where every selectable concept appears exactly once.

---

## 6. Recommended Schema

### 6.1 Backward-compatible puzzle-level discriminator

```js
{
  // Existing fields...
  lensMode: "assignment",
  lenses: [
    {
      id: "technical-constraint",
      label: "Technical constraint",
      prompt: "Technical constraint",
      targets: ["Browser sandbox", "Network latency"],
      explanation:
        "These concepts primarily describe limitations imposed by the technical environment.",
      reasons: {
        "Browser sandbox":
          "The browser security model restricts access to native operating-system capabilities.",
        "Network latency":
          "Remote interaction is constrained by communication delay."
      }
    },
    {
      id: "institutional-incentive",
      label: "Institutional incentive",
      prompt: "Institutional incentive",
      targets: ["Vendor lock-in", "Centralized control"],
      explanation:
        "These concepts are best understood through organizational incentives and control.",
      reasons: {
        "Vendor lock-in":
          "Lock-in preserves leverage for the provider or platform owner.",
        "Centralized control":
          "Centralization changes who can make decisions and impose constraints."
      }
    }
  ]
}
```

### 6.2 Mode values

Supported values:

```js
lensMode: "sequential" | "assignment"
```

Rules:

- missing `lensMode` means `"sequential"`;
- `"sequential"` is an explicit alias for current behavior;
- `"assignment"` enables the new modality;
- unknown values fail validation.

### 6.3 Reuse `targets` as the authored solution

Do not introduce a second concept-to-lens answer structure in the initial implementation.

In assignment mode, each lens's existing `targets` array defines the concepts whose best-fit answer is that lens. Taken together, all target arrays form the assignment solution.

Advantages:

- minimal schema expansion;
- no duplicated answer data;
- existing lens explanations and `reasons` remain useful;
- sequential and assignment modes share the same conceptual objects;
- export/import machinery has only one new discriminator to preserve.

### 6.4 Label fallback

For assignment controls and the persistent legend, use:

```js
lens.label ?? lens.prompt
```

`label` should be documented as recommended for assignment mode because a sequential prompt may be phrased as a question and may be too long for a compact selector.

Do not require `label` in the first schema revision if the fallback is sufficient.

### 6.5 Stable identity

Use `lens.id` as the stored assignment value. Do not store array indexes or display numbers as semantic identity.

Numbers may be generated from array order for compact display:

```text
1. Technical constraint
2. Institutional incentive
3. Cultural assumption
4. Human consequence
```

The authored `id` remains authoritative.

---

## 7. Validation Rules

Extend `validate.mjs` and any shared lens validation helpers.

### 7.1 Existing lens validation remains intact

Sequential puzzles retain current rules, including validation that each target identifies one real selectable node.

### 7.2 Assignment-mode validation

For a puzzle with `lensMode: "assignment"`:

1. `lenses` must exist and contain at least two lenses.
2. Every lens must have a unique non-empty `id`.
3. Every lens must have a usable display label through `label ?? prompt`.
4. Every target must identify exactly one real selectable concept.
5. No target may appear in more than one lens.
6. Every selectable concept on the board must appear in exactly one lens target array.
7. Cluster-title nodes must not appear in targets.
8. Empty target sets should fail validation unless a compelling existing convention requires warnings instead.
9. Optional `reasons` keys must refer to targets belonging to that same lens.
10. Unknown `lensMode` values must fail validation.

The validator should report actionable errors, for example:

```text
Puzzle "example": assignment lens targets do not cover concept "Network effect".
Puzzle "example": concept "Vendor lock-in" appears in lenses "technical" and "institutional".
```

### 7.3 Authoring rationale

The strict partition requirement is intentional. Without it, the interface promise "assign every concept to the lens that best fits" becomes ambiguous and the completion state cannot be determined reliably.

---

## 8. Player Experience

## 8.1 Entry transition

After the ordinary map is solved and its final layout is polished:

Sequential mode retains its current transition.

Assignment mode displays:

> **Map complete. Assign each concept to the lens that best fits it.**

All available lenses become visible in a persistent lens panel.

### 8.2 Lens panel

Replace the one-at-a-time sequential prompt panel with an assignment legend for this mode.

Each lens row should display:

- generated number;
- compact label;
- optional assigned count;
- full prompt or description where useful.

Example:

```text
Assign each concept to its best-fitting lens.

1  Technical constraint       3 assigned
2  Institutional incentive    4 assigned
3  Cultural assumption        2 assigned
4  Human consequence          5 assigned
```

The panel must not rely on color alone. Number and text remain visible.

### 8.3 Node assignment control

Each selectable term node receives a compact assignment affordance adjacent to, or visually attached to, the node.

Recommended interaction:

- unassigned state: a compact `?` badge or button;
- assigned state: a numbered badge representing the selected lens;
- activating the badge opens a native or custom selection control listing all lenses;
- selection immediately updates the badge, legend counts, and completion progress;
- the player may revise an assignment until checking answers.

A native `<select>` is acceptable for the first implementation if it can be positioned and used reliably in all renderers. If SVG embedding makes a native select fragile, use an accessible HTML popover/menu anchored to the clicked SVG node.

Avoid permanent full-width combo boxes beside every node. They are likely to overwhelm dense Graph and Star layouts.

### 8.4 Selection contents

Each option should include both number and label:

```text
1 · Technical constraint
2 · Institutional incentive
3 · Cultural assumption
4 · Human consequence
```

The default option is:

```text
Choose a lens
```

### 8.5 Progress

Show assignment progress:

```text
9 of 14 concepts assigned
```

The **Check assignments** button remains disabled until every selectable concept has an assignment.

Do not silently auto-submit when the final assignment is made.

### 8.6 Evaluation

When the player activates **Check assignments**:

- freeze assignment editing;
- compare each concept's selected lens ID with its authored target lens;
- visually distinguish:
  - correct assignment;
  - incorrect assignment;
- for incorrect assignments, reveal the correct lens number and label;
- show an overall summary such as:

```text
You assigned 11 of 14 concepts to the intended lens.
```

The emphasis should remain diagnostic rather than punitive.

### 8.7 Explanations

After evaluation:

- display each lens's general `explanation`;
- where `reasons` are provided, selecting or focusing a node may display its node-specific reason;
- for an incorrect answer, feedback should identify both:
  - the player's chosen lens;
  - the authored best-fit lens.

Suggested wording:

> You assigned **Vendor lock-in** to Technical constraint. The authored best fit is **Institutional incentive** because lock-in primarily preserves provider leverage, even though technical mechanisms may enforce it.

The implementation does not need to generate comparative prose automatically. It can combine structured labels with the authored reason.

### 8.8 Completion

After evaluation, the puzzle is complete.

A future review interaction may permit re-opening lens overlays, but that is not required for this pull request.

---

## 9. Visual Design

### 9.1 Badge behavior

- Place badges consistently relative to node labels.
- Keep badges compact enough not to dominate the map.
- Ensure badges remain legible at the current SVG scale.
- Recalculate or preserve badge position when nodes move before lens play.
- Once assignment mode begins, freeze the polished layout as existing lens play does.

### 9.2 Color

A stable lens color may be assigned from the existing UI palette, but color is supplementary.

Every assignment must also be represented by:

- lens number;
- accessible name;
- text in the selector or legend.

Do not encode correctness solely by red/green.

### 9.3 Incorrect-answer reveal

A possible representation:

- correct assignment: solid lens badge plus success outline;
- incorrect assignment: selected lens badge struck or outlined, with a small arrow or adjacent correct badge;
- focused node: text feedback in the lens panel.

Exact styling may be refined during browser testing. The design requirement is unambiguous communication without excessive graph clutter.

### 9.4 Responsive behavior

Test at minimum:

- desktop wide layout;
- ordinary desktop;
- narrow/mobile viewport;
- Graph mode;
- Star mode;
- Circle mode;
- a dense/large puzzle.

On narrow viewports, the selector may open as a centered dialog or bottom sheet rather than a tiny map-adjacent menu.

---

## 10. Accessibility Requirements

- Every node assignment trigger must be keyboard reachable.
- The trigger's accessible name should identify the concept and current assignment, for example:

```text
Assign a lens to Vendor lock-in. Currently Institutional incentive.
```

- The lens options must be operable with keyboard controls.
- Focus must return to the originating node after a menu/dialog closes.
- Evaluation feedback must be announced through an appropriate live region.
- Correctness must not depend on color perception.
- Lens numbers must not be the only labels exposed to assistive technology.
- Touch targets should meet the project's practical minimum size.
- Escape should close a custom menu/dialog without changing the assignment.
- Mode switching must not lose keyboard focus or assignments.

---

## 11. State Model

The current lens implementation uses lens-specific phases and `lensSelections`.

Recommended approach: extend the existing lens state rather than create an unrelated subsystem.

### 11.1 Proposed phases

Keep current sequential phases unchanged.

Add assignment-specific phases:

```js
"lens-assignment-preparing"
"lens-assigning"
"lens-assignment-revealed"
```

Alternatively, generalize phase plus submode only if doing so clearly reduces complexity without risking regressions.

A conservative implementation is preferable for the initial PR.

### 11.2 Proposed state fields

```js
state.lensMode              // normalized "sequential" or "assignment"
state.lensAssignments       // Map<nodeWord, lensId>
state.lensAssignmentResult  // derived result after check, optional cache
```

Continue using:

```js
state.lensIndex
state.lensSelections
```

for sequential mode.

Do not overload `lensSelections` to represent assignments; their shapes and semantics differ.

### 11.3 Pure engine helpers

Extend `modules/lensEngine.js` with pure functions such as:

```js
export function normalizedLensMode(puzzle) {
  return puzzle?.lensMode === "assignment"
    ? "assignment"
    : "sequential";
}

export function assignmentTargetMap(puzzle) {
  // Map concept word -> lens id
}

export function lensAssignmentResult(puzzle, assignments) {
  // Return per-node and aggregate correctness.
}

export function assignmentComplete(puzzle, assignments, selectableWords) {
  // True only when every selectable concept has one valid lens id.
}
```

Possible result shape:

```js
{
  correct: ["Vendor lock-in"],
  incorrect: [
    {
      word: "Network latency",
      selectedLensId: "institutional",
      correctLensId: "technical"
    }
  ],
  correctCount: 13,
  totalCount: 14
}
```

Keep DOM orchestration in `game.js`, consistent with the current module comment and architecture.

---

## 12. Renderer Integration

The existing sequential lens system is renderer-neutral: renderers query shared lens state and apply classes.

Assignment mode should preserve that principle.

### 12.1 Shared renderer contract

Each renderer should receive enough shared state or callbacks to:

- render the assignment badge for each real term node;
- style nodes based on selected lens;
- style correctness after reveal;
- invoke a shared assignment-selection handler;
- exclude cluster-title nodes;
- preserve bridge-node participation.

### 12.2 Avoid renderer-specific business logic

Do not independently calculate correctness inside Graph, Star, and Circle renderers.

Correctness and display metadata should come from pure `lensEngine` helpers or shared game-state methods.

### 12.3 SVG versus HTML controls

Codex should inspect the existing renderer structure before choosing the control implementation.

Preferred decision rule:

- use an SVG badge/button for the persistent map affordance;
- use one shared HTML menu, popover, or dialog for lens selection;
- anchor or contextualize it to the activated node;
- avoid one embedded HTML `<select>` per SVG node unless browser testing demonstrates that it is robust.

This keeps map rendering lightweight and centralizes accessibility behavior.

---

## 13. Interaction with Existing Features

### 13.1 Rendering modes

Assignment state must survive switching among Graph, Star, and Circle modes during lens play, just as sequential selections currently survive relevant redraws.

### 13.2 Layout

Reuse the existing solved-layout polishing and `freezeForLenses` behavior.

Changing an assignment must never restart force simulation or move nodes.

### 13.3 Show solution

When **Show solution** is used to complete the map:

- the map should still proceed into assignment mode if the puzzle defines it;
- assignments should begin empty;
- the player should not receive the lens solution automatically.

If the current sequential behavior differs, preserve established semantics unless tests or product logic indicate otherwise.

### 13.4 Session persistence

Inspect `modules/playerSessionStore.js`.

Preferred behavior:

- persist in-progress assignments if current lens state is already persisted;
- restore assignments only when puzzle identity and lens IDs match;
- ignore or safely discard stale assignments from a changed puzzle schema;
- do not break restoration of existing sequential sessions.

If lens state is intentionally not persisted today, document that and keep assignment mode consistent for the first PR.

### 13.5 Share links

Do not add assignment answers to public share URLs in the initial PR unless sequential lens selections are already shared.

Solved-map sharing must remain backward compatible.

### 13.6 Analytics

Preserve current puzzle completion analytics.

If lens completion is already part of the completion boundary, assignment evaluation should reach the same completion path. Do not add new analytics events without a clear existing convention.

### 13.7 JSON-LD import/export

Where puzzle serialization already preserves arbitrary supported puzzle fields:

- include `lensMode`;
- preserve `label` if used;
- preserve existing `lenses`, `targets`, `explanation`, and `reasons`.

If JSON-LD uses an explicit allowlist or context, update it and add a round-trip test. Do not redesign the vocabulary in this PR.

---

## 14. Authoring Guidance

Add a section to `docs/AUTHORING.md` or update `docs/Concept Lenses.md`.

### 14.1 When to use sequential mode

Use sequential mode when:

- lenses overlap;
- some concepts fit no lens;
- the player should consider one cross-cutting property at a time;
- the task is multi-select applicability.

### 14.2 When to use assignment mode

Use assignment mode when:

- the lenses form a deliberate classification set;
- every concept has one defensible best fit;
- comparison among lenses is essential;
- the educational objective is discrimination among neighboring explanations or categories.

### 14.3 Authoring caution

"Best fit" does not mean "only conceivable relationship."

Authors should write reasons that explain why the selected lens is primary even when another lens has a secondary relationship.

Avoid categories whose boundaries depend on hidden assumptions or wording distinctions that knowledgeable players could not infer.

### 14.4 Recommended lens count

For an ordinary board:

- 3–5 lenses is preferred;
- 2 may be acceptable for a strong binary distinction;
- more than 6 should receive careful usability testing.

### 14.5 Recommended distribution

Avoid placing nearly all concepts in one lens unless the imbalance itself is pedagogically important.

The validator should not enforce balanced counts, but documentation should encourage meaningful distribution.

---

## 15. Testing Plan

## 15.1 Pure unit tests

Add tests for `modules/lensEngine.js`:

- missing `lensMode` normalizes to sequential;
- explicit sequential mode normalizes correctly;
- assignment mode normalizes correctly;
- target map is constructed correctly;
- complete assignments return true;
- missing assignments return false;
- invalid lens IDs do not count as complete;
- result calculation identifies correct and incorrect nodes;
- bridge concepts are treated like ordinary selectable concepts;
- result ordering is deterministic where tests depend on it.

### 15.2 Validator tests

Add fixtures or validation cases for:

- valid assignment partition;
- uncovered concept;
- duplicate concept across lenses;
- target that is not a real node;
- duplicate lens ID;
- unknown `lensMode`;
- one-lens assignment puzzle;
- empty target set;
- reason key outside its lens targets;
- existing sequential puzzle with overlapping targets remains valid.

### 15.3 Browser/Playwright tests

Add an intentionally small assignment-mode fixture puzzle.

Test:

1. solve or reveal the map;
2. assignment panel appears with all lenses;
3. every real term has an assignment trigger;
4. cluster titles do not;
5. Check button is disabled while concepts remain unassigned;
6. assignment can be made and revised;
7. switching render modes preserves assignments;
8. checking reveals correct and incorrect answers;
9. explanation text appears;
10. keyboard operation works for at least the principal interaction;
11. restarting or changing puzzles clears assignment state appropriately;
12. existing sequential lens fixture still behaves unchanged.

### 15.4 Manual visual QA

Run:

```bash
npm test
npm run validate
npm run dev
```

Manually inspect:

- Graph, Star, and Circle layouts;
- ordinary and wide puzzles;
- desktop and narrow viewport;
- long concept labels;
- long lens labels;
- 5–6 lenses;
- all-correct and mixed-correctness reveals;
- keyboard focus;
- screen-reader-friendly names through browser accessibility inspection;
- mode switching during assignment;
- no node movement after lens assignment begins.

---

## 16. Acceptance Criteria

The feature is complete when all of the following are true:

1. Existing puzzles with lenses and no `lensMode` behave exactly as before.
2. A puzzle can opt into `lensMode: "assignment"`.
3. All lenses are shown simultaneously in assignment mode.
4. Every real term and bridge node can be assigned to one lens.
5. Cluster-title nodes cannot be assigned.
6. Assignments are visible through compact node badges and textual/accessible labels.
7. The player can revise assignments before checking.
8. Evaluation is unavailable until all selectable concepts are assigned.
9. Evaluation reports per-node correctness and an aggregate result.
10. Authored explanations and reasons are available after reveal.
11. The map remains frozen during assignment and reveal.
12. Assignments survive redraws and rendering-mode switches during the activity.
13. Graph, Star, and Circle modes all work.
14. Validation enforces an exclusive, exhaustive target partition.
15. Unit tests, validator tests, and Playwright coverage pass.
16. `npm test` and `npm run validate` pass.
17. Authoring documentation includes the new mode and a complete example.
18. JSON-LD or other puzzle serialization round-trips the new field where applicable.
19. No new accessibility-critical issue is introduced.
20. The PR includes at least one small demonstration puzzle or test fixture, without requiring a catalogue-level content expansion.

---

## 17. Suggested Implementation Sequence for Codex

1. Inspect current lens flow in:
   - `modules/lensEngine.js`
   - `game.js`
   - Graph, Star, and Circle renderers
   - `styles.css`
   - `index.html`
   - `validate.mjs`
   - `modules/playerSessionStore.js`
   - existing lens tests and Playwright tests
   - JSON-LD import/export modules, if present

2. Add schema normalization and pure assignment helpers to `lensEngine.js`.

3. Extend validation and add validator tests before building the UI.

4. Add a minimal assignment-mode fixture puzzle.

5. Add assignment state and transition orchestration in `game.js`.

6. Implement one shared accessible selector/popover and renderer badge hooks.

7. Add styling and correctness reveal.

8. Verify mode switching and layout freezing.

9. Add session/serialization support only to the extent required by existing conventions.

10. Add Playwright coverage.

11. Update authoring documentation.

12. Run all automated checks and perform manual viewport/render-mode QA.

---

## 18. Files Likely to Change

This list is advisory; Codex should confirm against the current tree.

Likely:

```text
modules/lensEngine.js
game.js
styles.css
index.html
validate.mjs
docs/AUTHORING.md
docs/Concept Lenses.md
tests/...
```

Possibly:

```text
modules/graphRenderer.js
modules/starRenderer.js
modules/setRenderer.js
modules/playerSessionStore.js
JSON-LD import/export modules
puzzle fixture or demonstration catalogue file
```

Avoid broad unrelated refactors.

---

## 19. Open Design Questions to Resolve During Implementation

Codex may choose sensible defaults, but should call out any consequential deviation in the PR description.

1. Is the shared assignment chooser best implemented as a popover, dialog, or native select?
2. Should the post-check view show both chosen and correct badges simultaneously, or show the correct badge and place the chosen answer in textual feedback?
3. Does existing session persistence include lens state, and should assignment state follow the same policy?
4. Is `label` already an accepted lens property, or should assignment mode initially use `prompt` only?
5. Where should aggregate assignment feedback live within the current lens panel?
6. Does JSON-LD serialization use an allowlist requiring explicit vocabulary updates?

The schema and product decisions in this document should otherwise be treated as the intended contract.

---

## 20. Recommended PR Title and Description

### PR title

```text
Add comparative lens assignment mode
```

### PR description outline

```markdown
## What changed

Adds an optional `lensMode: "assignment"` post-map activity that presents all
lenses simultaneously and asks players to assign every concept to its best-fit
lens.

## Why

Sequential lens play cannot support comparative classification because later
lens choices are hidden while earlier lenses are answered.

## Compatibility

Puzzles without `lensMode` continue to use the existing sequential lens flow.

## Validation

Assignment-mode lens targets must form an exclusive, exhaustive partition of
all selectable term and bridge nodes.

## Testing

- lens engine unit tests
- validator coverage
- Playwright interaction and regression tests
- manual Graph, Star, Circle, desktop, and narrow-viewport QA
```

---

## 21. Codex Handoff Prompt

Use the following prompt with this document attached or available in the repository:

> Implement the feature described in **Design: Comparative Lens Assignment Mode**. First inspect the current lens architecture and tests. Preserve all existing sequential-lens behavior and avoid unrelated refactors. Implement the schema discriminator, strict assignment-partition validation, pure lens-engine helpers, accessible assignment UI across Graph/Star/Circle renderers, diagnostic reveal, documentation, and automated tests. Use the existing renderer-neutral lens architecture and solved-layout freezing behavior. Run `npm test` and `npm run validate`, launch the development server for manual browser QA, and open a draft pull request summarizing design choices, test results, and any deviations from the document.
