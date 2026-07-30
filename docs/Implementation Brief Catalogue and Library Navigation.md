# Implementation Brief: Catalogue and Library Navigation

## Repository

```
jmajerus/concept-clusters
```

Work against the **current local working tree**, including all uncommitted Concept Lenses, Geography, puzzle, documentation, registry, and test changes. Do not reset, discard, or overwrite unrelated work.

Leave the implementation uncommitted for review unless explicitly instructed otherwise.

------

## Objective

Add a lightweight catalogue layer above the existing category browser.

The intended hierarchy is:

```text
Library
  → Catalogue
    → Category within that catalogue
      → Puzzle
```

A catalogue is analogous to a curated library collection. It selects canonical puzzles for an audience, theme, or learning purpose.

The same puzzle may appear in several catalogues but must remain one canonical puzzle object with one canonical completion state.

The existing category browser should become a subject-based partition of the currently selected catalogue.

------

## Core design principles

### 1. Puzzles remain canonical

Do not copy or fork puzzle objects into catalogue files.

Catalogue entries refer to stable puzzle IDs in `PUZZLES`.

Completing a puzzle through one catalogue must count as completion everywhere that puzzle appears.

### 2. Categories and catalogues answer different questions

- **Category:** What academic subject contains this puzzle?
- **Catalogue:** For what audience, theme, or learning purpose was this puzzle selected?
- **Related puzzles:** What conceptually nearby puzzle might be useful next?

Do not replace `category` or `relatedPuzzles` with catalogues.

### 3. All Puzzles is a catalogue, not the Library

Use this vocabulary consistently:

- **Library:** the top-level screen for selecting a catalogue.
- **All Puzzles:** the comprehensive catalogue derived from `PUZZLES`.
- **Catalogue:** a curated collection.
- **Category:** a subject partition inside the active catalogue.

Do not use “master catalogue” in player-facing copy.

### 4. Preserve the current default landing

A bare root visit must continue to load a live puzzle using the existing remembered-next/showcase behavior.

Do not change the root URL into the Library screen.

The Library is reached through an explicit button or URL.

### 5. Maintain backward compatibility

Existing links must continue to work:

- `?puzzle=<id>`
- `?puzzle=<id>&moves=...`
- `?puzzle=<id>&solved`
- `?category=<slug>`
- `?puzzles=<id,id,...>`
- `?mode=graph|star|sets`
- layout-authoring URLs

When no catalogue parameter is present, existing behavior should remain unchanged except for any necessary addition of neutral All Puzzles context in the UI.

------

# Data model

## Directory structure

Create a separate catalogue layer:

```text
catalogues/
  getting-started.js
  media-literacy-civic-reasoning.js
  concept-lenses.js
  index.js
```

`All Puzzles` must be derived from `PUZZLES`; do not maintain a duplicate list for it.

## Catalogue schema

Use a small first-version schema:

```js
export default {
  id: "getting-started",
  title: "Getting Started",
  info: {
    text:
      "An approachable introduction to Concept Clusters across several subjects."
  },
  entries: [
    {
      id: "energy-flow",
      reason:
        "Begin with a familiar system whose clusters and bridges are easy to observe."
    }
  ]
};
```

Required fields:

- `id`
- `title`
- `entries`

Optional fields:

- `info`, using the project’s existing `{ text, link, extraLink }` shape
- `entries[].reason`

Do not add grade levels, prerequisites, locking, formal difficulty ratings, educator assignment fields, or audience-profile schemas in this iteration.

Array order may provide a light editorial recommendation, but it must not lock navigation.

## Catalogue registry

`catalogues/index.js` should export:

```js
export const CATALOGUES = [ ... ];
export default CATALOGUES;
```

Add pure helper functions in an appropriate module rather than scattering catalogue lookup logic throughout `game.js`. Likely helpers include:

- resolve a catalogue ID or slug;
- return the puzzle objects belonging to a catalogue;
- test whether a catalogue contains a puzzle;
- derive category names from a catalogue’s puzzle set;
- derive puzzles for one category within one catalogue;
- calculate catalogue-relative counts;
- build catalogue-aware URL parameters.

Use the project’s existing slug conventions where practical. Catalogue IDs should already be stable URL-safe identifiers.

------

# Initial catalogues

Before using these lists, verify every ID against the current local `PUZZLES` registry. Missing IDs should cause validation failure rather than being silently ignored.

## Getting Started

Suggested entries:

```text
energy-flow
states-of-matter
sentence-structure
democracy-history
body-systems
media-literacy
interpreting-a-text
climate-and-livelihoods
```

Purpose:

> An approachable cross-disciplinary introduction to clusters, bridges, and lenses without claiming a formal grade level.

## Media Literacy and Civic Reasoning

Suggested entries:

```text
democracy-history
authoritarian-regimes
media-literacy
social-media-hygiene
quotations-and-attribution
images-out-of-context
ai-generated-synthetic-media
evidence-and-inference-across-disciplines
```

Purpose:

> Source evaluation, provenance, context, manipulation, public reasoning, and institutions.

## Concept Lenses

Suggested entries:

```text
interpreting-a-text
climate-and-livelihoods
river-basins-and-human-life
evidence-and-inference-across-disciplines
revolutions-as-a-process
signals-and-regulation-in-the-body
performance-creates-meaning
```

Purpose:

> Puzzles selected to demonstrate reinforcing, cross-cutting, matrix, comparison, and synthesis lenses.

`interpreting-a-text` is useful here even if its lenses are more cluster-reinforcing, because it provides a contrast with the later matrix-oriented puzzles.

------

# Validation

Extend `validate.mjs` to validate curated catalogues.

Check:

- every catalogue ID is nonempty and unique;
- every title is nonempty;
- every `info` value has the same valid shape used elsewhere;
- `entries` is a nonempty array;
- every entry ID resolves to exactly one puzzle;
- no catalogue lists the same puzzle twice;
- every authored `reason`, when present, is a nonempty string;
- no curated catalogue uses the reserved ID `all`;
- catalogue IDs do not collide after whatever slug/normalization logic is used.

Do not require:

- every puzzle to appear in a curated catalogue;
- every category to appear in every catalogue;
- every catalogue to span multiple categories;
- reciprocal membership of any kind;
- numerical balance among categories.

Export catalogue data or helper functions through `window.CC` only where tests or development inspection genuinely need them.

------

# UI hierarchy

## Global control

Change or supplement the current **Browse puzzles** control so the global action is labeled:

> **Library**

This button opens the Library screen from any ordinary puzzle or overview screen.

Keep the direct puzzle picker available. It remains a fast global shortcut to any puzzle.

In layout-authoring mode, preserve current authoring behavior. Hide or disable Library navigation there if ordinary navigation would interfere with the authoring session.

## Library screen

The Library screen lists:

1. All Puzzles
2. Getting Started
3. Media Literacy and Civic Reasoning
4. Concept Lenses

Each card should show:

- catalogue title;
- catalogue description;
- puzzle count;
- completed count when available;
- a clear action such as “Browse →”.

The Library screen itself does not need a Share button in the first version.

## Catalogue screen

A catalogue screen shows:

- title;
- description;
- completed/total progress;
- an **All puzzles in this catalogue** option;
- category cards derived from the selected catalogue’s puzzles.

Do not author category membership separately in catalogue data.

A category card count is relative to the active catalogue.

For example:

```text
Media & Information Literacy · 5 puzzles
History & Society · 2 puzzles
```

The same category may show a larger count in All Puzzles.

## Catalogue category screen

This is the existing category-puzzle list, filtered to the active catalogue.

It should show:

- Library breadcrumb;
- catalogue breadcrumb;
- current category;
- catalogue-relative puzzle cards;
- a clear **Back to catalogue** action.

Reuse the existing puzzle-card and category-card presentation where appropriate rather than creating a visually unrelated parallel system.

## Puzzle screen

When entered through a catalogue, show compact context navigation such as:

```text
Library › Concept Lenses › Geography › Climate and livelihoods across regions
```

At minimum provide:

- **Library**
- **Back to catalogue**

The breadcrumb/category may be derived from the puzzle’s canonical `category`.

Do not duplicate the puzzle title unnecessarily if it already appears immediately below the context strip.

## Local versus global navigation

These controls have different meanings:

- **Back to catalogue:** return to the active catalogue, preferably to the category partition from which the puzzle was opened.
- **Library:** leave the active catalogue and choose another.
- **All Puzzles:** enter the comprehensive catalogue.
- Browser Back: return through actual navigation history.

------

# URL model

Support:

```text
?library
```

Open the Library.

```text
?catalogue=getting-started
```

Open a catalogue overview.

```text
?catalogue=getting-started&category=science
```

Open one category within that catalogue.

```text
?puzzle=energy-flow&catalogue=getting-started
```

Open a puzzle while preserving catalogue context.

Optionally preserve the originating category:

```text
?puzzle=energy-flow&catalogue=getting-started&category=science
```

A direct legacy puzzle URL without `catalogue` should behave as All Puzzles context, but it should not need to be rewritten merely by loading the page.

## Parameter precedence

Preserve current behavior wherever new catalogue parameters are absent.

Recommended precedence:

1. `?puzzle=` remains the most specific intent and wins.
2. Existing `?category=` and `?puzzles=` behavior remains compatible.
3. `?catalogue=...&category=...` opens a filtered category.
4. `?catalogue=...` opens a catalogue.
5. `?library` opens the Library.
6. A parameter-free root visit uses the existing default puzzle landing.

When `?puzzle=` and `?catalogue=` appear together:

- load the named puzzle;
- retain the catalogue only when it exists and contains that puzzle;
- otherwise use neutral All Puzzles context.

An invalid explicit catalogue should open the Library rather than choosing a random puzzle.

A bare legacy `?category=<slug>` should continue to mean that category within All Puzzles.

## History behavior

Use `history.pushState`/`replaceState` and a `popstate` handler so that:

- Library → catalogue → category → puzzle creates meaningful history;
- browser Back returns through those layers;
- browser Forward works;
- URL and rendered screen remain synchronized.

Do not re-run shared `moves` or `solved` state when moving around after initial bootstrap.

Strip one-time state parameters when navigating to another puzzle or overview:

- `moves`
- `solved`
- layout-authoring parameters where inappropriate

Preserve `mode` behavior as currently documented. Do not begin adding `mode` to ordinary generated Share links.

------

# Context rules for existing navigation

## Puzzle picker

Keep the picker global rather than filtering it to the current catalogue.

When a player chooses a puzzle:

- preserve active catalogue context if that puzzle belongs to the catalogue;
- otherwise drop to All Puzzles context.

## Related-puzzle cards

When clicking a related puzzle:

- retain active catalogue context if the target belongs to it;
- otherwise drop to All Puzzles context.

Do not imply that a puzzle belongs to a catalogue that does not contain it.

## Puzzle Share button

Preserve existing `puzzle`, `moves`, and `solved` behavior.

When a puzzle was opened through a curated catalogue, include its valid catalogue context in the shared URL.

When context is All Puzzles or absent, omit `catalogue=all` to keep ordinary links compact and backward-compatible.

Never include an invalid catalogue association.

## Overview Share button

Catalogue and catalogue-category screens should be shareable:

```text
?catalogue=concept-lenses
?catalogue=concept-lenses&category=geography
```

Keep existing related-set and category sharing intact.

------

# Completion and progress

Do not create separate completion records per catalogue.

Use the canonical puzzle session keyed by puzzle identity and revision.

Catalogue progress is derived:

```text
number of catalogue puzzles whose canonical session is complete
---------------------------------------------------------------
total number of puzzles in the catalogue
```

A lens puzzle should count as complete according to the project’s existing player-session definition of completion. Do not invent a separate catalogue-specific threshold.

The same completed puzzle must immediately contribute to every catalogue that contains it.

A first version only needs summary progress. Do not add locked stages, certificates, scores, due dates, or completion synchronization across devices.

------

# Code organization

Avoid turning `game.js` into a larger monolith.

Extract pure catalogue logic and, where useful, overview navigation logic into modules.

Possible organization:

```text
catalogues/
  *.js
  index.js

modules/
  catalogueRegistry.js
  catalogueNavigation.js
```

The exact split may be adjusted after inspecting the current tree, but keep:

- data definitions separate from rendering;
- pure filtering/lookup helpers testable without the browser;
- URL parsing/building centralized;
- DOM rendering separated from catalogue membership logic.

Reuse the existing:

- `showOverview`;
- `renderPuzzleCards`;
- `renderCategoryCards`;
- `renderInfoLine`;
- category metadata;
- player session storage;
- share-link helpers.

Refactor those helpers only where needed to accept a filtered puzzle set or navigation context.

Do not silently change puzzle content.

------

# Accessibility and responsive behavior

Add:

- a semantic breadcrumb `<nav aria-label="Breadcrumb">`;
- `aria-current="page"` on the active breadcrumb where appropriate;
- real buttons or links for navigation;
- visible keyboard focus;
- logical focus movement after changing screens;
- an announced page/view heading;
- wrapped breadcrumbs on narrow screens.

Test at desktop width and approximately 320–390 CSS pixels.

Do not introduce horizontal scrolling for ordinary catalogue or category screens.

Ensure that the shared `#term-info` panel still moves correctly between puzzle and overview screens.

------

# Tests

Add a focused browser test file, likely:

```text
tests/catalogues.mjs
```

Update existing tests where new context intentionally changes output.

Cover at least:

1. A parameter-free fresh visit still opens a live showcase puzzle.
2. The Library button opens the Library.
3. Library lists All Puzzles and all curated catalogues.
4. All Puzzles derives its total directly from `PUZZLES`.
5. Catalogue puzzle counts match their valid entries.
6. Catalogue category names and counts are derived correctly.
7. Selecting a catalogue category shows only matching catalogue puzzles.
8. Clicking a puzzle preserves catalogue context.
9. `?catalogue=<id>` opens the correct catalogue.
10. `?catalogue=<id>&category=<slug>` opens the correct filtered category.
11. `?puzzle=<id>&catalogue=<id>` loads the puzzle with correct context.
12. A puzzle not belonging to the named catalogue drops to All Puzzles context.
13. An invalid catalogue opens the Library without throwing.
14. Legacy `?category=` links still work.
15. Legacy `?puzzles=` related-set links still work.
16. Existing `?puzzle=`, `moves`, `solved`, and `mode` tests still pass.
17. Browser Back and Forward traverse Library, catalogue, category, and puzzle.
18. Selecting an out-of-catalogue puzzle from the global picker drops catalogue context.
19. Related-puzzle navigation retains context only when membership is valid.
20. Puzzle sharing includes curated catalogue context when valid.
21. Puzzle sharing omits catalogue context for All Puzzles/direct legacy context.
22. Completing one puzzle changes progress in every catalogue containing it.
23. The term-info panel remains visible and correctly located on catalogue/category screens.
24. Narrow viewport navigation remains usable.

Add unit-level validation tests if catalogue validation has a test fixture system.

------

# Documentation

Create:

```text
docs/CATALOGUES.md
```

Document:

- Library versus All Puzzles;
- catalogue schema;
- canonical puzzle ownership;
- overlapping membership;
- category partitioning;
- URL forms;
- validation;
- editorial guidance for adding catalogues;
- the distinction among categories, catalogues, pathways, and related puzzles.

Update `docs/DEVELOPMENT.md` with:

- relevant files;
- routing/bootstrap behavior;
- browser-history behavior;
- testing commands.

Add a short pointer from `README.md` or the appropriate existing documentation index.

Do not turn `AUTHORING.md` into a catalogue implementation manual. A brief pointer is acceptable because puzzle authors may need to understand that catalogue membership is managed elsewhere.

------

# Non-goals

Do not implement in this iteration:

- teacher-created catalogues;
- a catalogue editor;
- accounts or cloud progress;
- grade-level claims;
- standards alignment;
- formal difficulty scores;
- prerequisites;
- locked sequencing;
- multiple versions of one puzzle;
- catalogue-specific puzzle text;
- catalogue-specific completion state;
- search, tagging, or faceted filtering;
- dynamic catalogue generation from AI or analytics;
- drag-and-drop catalogue management.

------

# Acceptance criteria

The feature is ready for review when:

- the Library can be reached from any normal screen;
- All Puzzles and three curated catalogues render correctly;
- categories are derived as sub-partitions of each catalogue;
- the same puzzle may appear in several catalogues without duplication;
- completion follows the canonical puzzle;
- context-aware breadcrumbs and return paths work;
- direct, legacy, shared-progress, category, and related-set links remain functional;
- Back/Forward navigation works;
- catalogue validation passes;
- the complete automated suite passes;
- desktop and narrow-screen manual review is clean;
- no unrelated local work was overwritten.

------

# Required final report

When finished, report:

1. Files added and modified.
2. Final catalogue schema.
3. Initial catalogue membership.
4. URL and precedence rules implemented.
5. How completion progress is derived.
6. Any refactoring of `game.js`.
7. Tests added or updated.
8. Exact validation/test commands and results.
9. Manual desktop and narrow-screen observations.
10. Remaining concerns or deliberately deferred work.

Leave the changes uncommitted for review.