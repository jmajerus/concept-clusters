# Implementing Subcategories

The current architecture already has the right separation points for adding subcategories without disturbing puzzle play:

- category metadata and membership helpers live in `puzzles/categories.js`; existing puzzles retain a primary `category` and may have multiple `categories`;
- catalogue membership remains independent of subject classification; the catalogue implementation derives its category partitions from canonical puzzle data rather than authoring them again;
- `overviewRenderer.js` already centralizes category cards, puzzle cards, breadcrumbs, and filtered catalogue/category screens.

I would implement **one optional level of subcategory**, but design the underlying helpers around category-relative assignments. That last point matters because a puzzle may belong to more than one category, and its appropriate subcategory can differ in each.

## Recommended conceptual hierarchy

```text
Library
  → Catalogue
    → Category
      → Subcategory
        → Puzzle
```

Subcategories should answer:

> What recognizable field, period, genre, or topic area within this subject contains the puzzle?

Examples might eventually include:

```text
Science
  → Physics
  → Chemistry
  → Earth Science

Humanities
  → Literature
  → Visual Arts
  → Religious Studies

Public Health
  → Epidemiology
  → Prevention
  → Health Communication

Computer Science
  → Programming Languages
  → Human–Computer Interaction
  → Computer Networks
```

A subcategory should not become another catalogue, tag, sequence, or difficulty level.

## Data model

### Category registry

Extend category metadata with an optional `subcategories` registry:

```js
export const CATEGORIES = {
  "Computer Science": {
    info: {
      text:
        "How computation is represented, constrained, and made usable—and what each layer of abstraction enables, hides, or sacrifices.",
      link: "wiki:Computer science"
    },

    subcategories: {
      "programming-languages": {
        title: "Programming Languages",
        info: {
          text:
            "How languages shape expression, abstraction, correctness, and programmer experience.",
          link: "wiki:Programming language"
        }
      },

      "human-computer-interaction": {
        title: "Human–Computer Interaction",
        info: {
          text:
            "How computing systems are designed around human abilities, expectations, and limitations.",
          link: "wiki:Human–computer interaction"
        }
      }
    }
  }
};
```

The object key is the stable subcategory ID used in URLs. The displayed title may later change without breaking links.

### Puzzle membership

Keep `category` and `categories` exactly as they are. Add an optional category-relative mapping:

```js
{
  id: "the-programmers-bargain",
  title: "The Programmer's Bargain",

  category: "Computer Science",

  subcategories: {
    "Computer Science": "programming-languages"
  },

  // ...
}
```

For a multidisciplinary puzzle:

```js
{
  category: "Computer Science",

  categories: [
    "Computer Science",
    "Business & Organizations"
  ],

  subcategories: {
    "Computer Science": "human-computer-interaction",
    "Business & Organizations": "work-design"
  }
}
```

I prefer this over a single scalar such as:

```js
subcategory: "programming-languages"
```

A scalar silently assumes that a puzzle has only one category. That is already no longer true in the application.

I would initially allow **at most one subcategory per category membership**. Multiple simultaneous subcategories would begin behaving like tags and would complicate counts, breadcrumbs, canonical URLs, and navigation.

## Normalization helpers

The UI should never inspect `puzzle.subcategories` directly. Add helpers beside the existing category functions:

```js
export function subcategoryIdForPuzzle(puzzle, category) {
  if (!puzzleBelongsToCategory(puzzle, category)) return null;

  const id = puzzle?.subcategories?.[category];
  return typeof id === "string" && id.trim()
    ? id.trim()
    : null;
}

export function subcategoryForPuzzle(puzzle, category) {
  const id = subcategoryIdForPuzzle(puzzle, category);
  if (!id) return null;

  const definition = CATEGORIES[category]?.subcategories?.[id];
  return definition
    ? { id, ...definition }
    : null;
}

export function subcategoriesForCategory(category) {
  return Object.entries(
    CATEGORIES[category]?.subcategories || {}
  ).map(([id, definition]) => ({
    id,
    ...definition
  }));
}

export function puzzleBelongsToSubcategory(
  puzzle,
  category,
  subcategoryId
) {
  return (
    subcategoryIdForPuzzle(puzzle, category) === subcategoryId
  );
}
```

Additional registry or catalogue helpers would include:

```js
puzzlesForSubcategory(puzzles, category, subcategoryId)

subcategoriesForPuzzleSet(puzzles, category)

puzzlesForCatalogueSubcategory(
  catalogue,
  puzzles,
  category,
  subcategoryId
)

subcategoryById(category, subcategoryId)
```

`subcategoriesForPuzzleSet()` is particularly important. A catalogue screen must derive only those subcategories represented within that catalogue, just as it currently derives catalogue-relative category counts.

## Progressive UI behavior

Subcategories should remain invisible until they are useful.

### Category with no represented subcategories

Nothing changes:

```text
Science
  [puzzle]
  [puzzle]
  [puzzle]
```

The same flat list also applies when subcategories exist in principle
but don't offer a real choice *within the active catalogue or category
scope* -- one puzzle total, or every puzzle sharing the one subcategory
with nothing left over untagged. Both collapse the "All X puzzles" card
and the lone subcategory card (or the whole list) into identical
puzzle sets, so the intermediate screen would be a redundant click
rather than useful progressive disclosure. `subcategoryGroups()` in
`overviewRenderer.js` is the shared choke point for this decision.

### Category with represented subcategories

The category page becomes a small intermediate overview:

```text
Science

All Science puzzles                         18 →

Physics                                      7 →
Chemistry                                    5 →
Earth Science                                4 →

Other Science puzzles                        2 →
```

The final “Other” partition is important during gradual adoption. Without it, adding the first subcategory could make all older unclassified puzzles difficult to find.

I would generate “Other” rather than register it as a real subcategory. It means only:

> Puzzles in this category that have not yet received a subcategory assignment.

Internally, it could use a reserved URL value such as `subcategory=other`, while disallowing authors from registering `other` as an ID.

### Catalogue-relative behavior

Within a curated catalogue, counts and visibility remain relative to the active catalogue:

```text
Getting Started
  → Science
      → All Science puzzles          3
      → Physics                      1
      → Other Science puzzles        2
```

A registered subcategory with zero puzzles in the current catalogue should not appear there.

## URL model

Extend the existing URL hierarchy additively:

```text
?category=computer-science
```

All Computer Science puzzles, preserving current behavior.

```text
?category=computer-science&subcategory=programming-languages
```

One subcategory in All Puzzles context.

```text
?catalogue=concept-lenses&category=computer-science
```

Computer Science inside the catalogue.

```text
?catalogue=concept-lenses
&category=computer-science
&subcategory=programming-languages
```

The subcategory inside that catalogue.

Puzzle context could preserve the complete route:

```text
?puzzle=the-programmers-bargain
&catalogue=concept-lenses
&category=computer-science
&subcategory=programming-languages
```

The puzzle remains canonical. The parameters describe only the route by which the player reached it.

### Validation of route context

When opening a puzzle:

1. Retain `catalogue` only if the puzzle belongs to it.
2. Retain `category` only if the puzzle belongs to that category.
3. Retain `subcategory` only if it is the puzzle’s assigned subcategory within that category.
4. Otherwise fall back to the nearest valid context.

An invalid subcategory should preferably open its parent category rather than the Library or a random puzzle.

## Breadcrumbs

The existing breadcrumb renderer can gain one additional optional level:

```text
Library
› All Puzzles
› Computer Science
› Programming Languages
› The Programmer’s Bargain
```

Because the puzzle title is already visually present, its breadcrumb can remain visually hidden as the current implementation does.

“Back to catalogue” may become too imprecise once this level exists. On a puzzle screen, I would supplement it with a contextual back action:

```text
← Back to Programming Languages
Library
```

The catalogue breadcrumb remains available separately.

## Rendering changes

The existing `renderCategoryCards()` provides a useful pattern. Add a parallel function rather than trying to make one function interpret every hierarchy level:

```js
function renderSubcategoryCards(
  container,
  category,
  availablePuzzles,
  onPick
) {
  // Derive represented registered subcategories.
  // Calculate counts from availablePuzzles.
  // Add an "Other" card when needed.
}
```

Then the route renderer can distinguish:

```js
{ kind: "catalogue-category", catalogueId, category }

{
  kind: "catalogue-subcategory",
  catalogueId,
  category,
  subcategoryId
}

{ kind: "legacy-category", category }

{
  kind: "legacy-subcategory",
  category,
  subcategoryId
}
```

I would probably rename `legacy-category` eventually to `all-puzzles-category`, but that is not necessary for this change.

## Validation

Extend `validate.mjs` to check:

- each subcategory registry is an object;
- every subcategory ID is nonempty and unique within its category;
- IDs are URL-safe and do not collide after normalization;
- every subcategory has a nonempty `title`;
- optional `info` uses the established information shape;
- every key in `puzzle.subcategories` names one of that puzzle’s categories;
- every assigned subcategory ID exists under that category;
- no puzzle assigns more than one subcategory within one category;
- reserved IDs such as `all` and `other` cannot be authored.

Do **not** require every puzzle in a subdivided category to have a subcategory. Gradual adoption should be valid.

## Tests worth adding now

The initial implementation should cover these behaviors:

1. Existing category-only puzzles render unchanged.
2. A category with no represented subcategories still opens its ordinary puzzle list.
3. A subdivided category shows an All card and represented subcategory cards.
4. Unassigned puzzles appear under generated Other.
5. Subcategory counts are correct.
6. Catalogue subcategory counts use only that catalogue’s puzzles.
7. Selecting a subcategory filters by both category and subcategory.
8. A multidisciplinary puzzle can have a different subcategory in each category.
9. Direct subcategory URLs work.
10. Invalid subcategory URLs fall back to the parent category.
11. Puzzle navigation preserves valid subcategory context.
12. Related-puzzle and picker navigation discard context when the target is outside it.
13. Browser Back and Forward traverse category → subcategory → puzzle.
14. Existing category URLs and shared links remain valid.
15. Narrow-screen breadcrumbs wrap without horizontal overflow.

## Suggested implementation boundary

I would divide the work into two stages.

**Stage 1: structural readiness**

- extend category metadata;
- add puzzle-assignment helpers;
- add validation;
- add subcategory-aware route parsing and URL generation;
- add tests with a synthetic or fixture assignment;
- preserve the present UI when no real subcategories exist.

**Stage 2: activate the first subcategory**

- add actual subcategory definitions;
- assign selected puzzles;
- expose the category → subcategory overview;
- finalize wording based on the first real subject taxonomy.

This avoids inventing a taxonomy merely to test the feature, while ensuring that the first genuine subcategory becomes primarily a content decision rather than a new application feature.

The central recommendation is therefore:

> Add stable subcategory IDs to category metadata, and store puzzle assignments as a category-relative mapping. Treat missing assignments as valid, derive all catalogue counts dynamically, and expose the extra navigation level only when the active puzzle set actually contains subcategories.

That gives the application useful readiness without committing it to arbitrary subdivisions or an indefinitely deep taxonomy.

## Implementation status

Implemented in August 2026 as a complete first usable slice rather than
stopping after structural readiness:

- category-relative `subcategories` assignments and normalization helpers;
- repository-aware registry and assignment validation, including reserved
  `all` and `other` IDs;
- progressive category screens, catalogue-relative counts, generated All and
  Other partitions, direct URLs, breadcrumbs, contextual Back actions,
  sharing, picker fallback, and browser history;
- JSON-LD context, schema, adapter, bundle, CLI, and round-trip support;
- a first restrained Art taxonomy: **Visual Form** and
  **Representation & Interpretation**, with the four imported Art puzzles
  divided evenly between them; and
- regression coverage in `tests/subcategories.mjs`.

Two small adjustments emerged during implementation. First, `subcategory=all`
became an explicit generated route so the parent category can remain a true
overview without losing a shareable complete list. Second, puzzle routes in
All Puzzles now retain valid category and subcategory context while direct
puzzle links remain compact. This gives breadcrumbs, Back, and Share the same
meaning regardless of whether the originating catalogue is curated.

Regenerating the imported Art modules also exposed and fixed an interchange
replacement bug: source-text matching could mistake a `relatedPuzzles` entry
for a module's own ID. The CLI now resolves the actual exported puzzle
manifest, with a regression test covering adjacent cross-references.
