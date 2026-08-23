# Multi-category puzzles

A puzzle may belong to more than one disciplinary category without being
copied or given another puzzle ID.

```js
{
  id: "after-the-click",
  category: "Psychology",
  categories: [
    "Psychology",
    "Computer Science"
  ]
}
```

## Primary and secondary categories

`category` remains required and is the puzzle's **primary category**. It
controls:

- which category landing pages appear for it in the compact global picker;
- the default disciplinary context used when a puzzle link needs one category;
- the puzzle's principal authoring home.

`categories` is optional. When present:

- it must be a non-empty array of unique category names;
- its first entry must exactly match `category`;
- it should normally contain no more than two or three categories;
- each category must contribute concepts, methods, or explanatory structure
  essential to the puzzle, not merely be a field in which the topic is useful.

Existing puzzles that define only `category` continue to work unchanged.

## Category and catalogue navigation

Categories and catalogues answer different questions:

- **Categories:** Which disciplines materially structure this puzzle?
- **Catalogues:** Which curated learning journeys include this puzzle?

A category overview includes every puzzle whose normalized category list
contains that category. Puzzle cards on category pages show:

- other disciplinary categories to which the puzzle belongs;
- curated catalogues containing that puzzle.

Category pages also show **Related catalogues** with the number of puzzles at
that category/catalogue intersection. Selecting one opens the catalogue already
filtered to the current category, from which the player can continue into the
full cross-category sequence.

## Canonical identity and progress

Multiple category membership never creates another puzzle object in storage.
Puzzle identity, completion state, layouts, and Concept Lens progress remain
keyed by the one canonical `id`.

## Validation

Run:

```sh
npm run validate
```

The multi-category validator checks primary-category alignment, duplicate or
empty names, category inflation, registered-category use, and slug collisions.
