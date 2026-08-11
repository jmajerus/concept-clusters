# Idea: extend the "By subject" inline-summary pattern to subcategory cards

**Status: logged for a future revisit as the puzzle library grows, not
scoped or planned in detail. Not currently worth building -- see below.**

## The pattern this would extend

The catalogue overview screen (`renderCatalogueOverviewList` in
`modules/overviewRenderer.js`) already does this at two levels:

- A catalogue whose own puzzle count is at or below
  `INLINE_PUZZLE_LIST_THRESHOLD` (5) shows its puzzles inline instead of
  behind an "All puzzles in this catalogue" card.
- When that's already happened, "Browse by subject" itself becomes a
  plain-text "By subject" summary (`renderSubjectSummary`) instead of
  clickable category cards -- every puzzle is already listed once, above,
  so a card leading back to a subset of the same puzzles has nothing left
  to offer.

## Where the same idea could apply next

The category screen (`showCatalogueCategory`), when a category has 2+
represented subcategory groups (`subcategoryGroups` in
`overviewRenderer.js`), shows *only* subcategory cards today -- no
puzzles are visible on that screen until a subcategory card is clicked.
That's different from the catalogue-overview case (where the redundancy
comes from puzzles already being shown once, above) -- here, nothing is
shown yet, so there's no existing redundancy to remove.

The proposed extension: if a category's *total* puzzle count (summed
across its subcategories) is small enough, show its puzzles inline on
the category screen itself (same threshold, same idea as the
catalogue-level case), and turn "browse by subcategory" into a plain "By
subcategory" summary the same way "Browse by subject" did.

## Why this is logged, not built

Checked against real content: this condition (a category with 2+
subcategory groups *and* a small enough total puzzle count) currently
occurs on exactly **one** screen in the whole game -- the
"Wholeness and Its Discontents" catalogue's Philosophy category (5
puzzles, 2 subcategory groups, right at the threshold). Real
subcategories are still rare across the puzzle set as a whole.

Building and testing this for one screen isn't worth it yet, especially
given real weekly usage-cost constraints (see feedback memory on
verification cost awareness) -- the effort-to-payoff ratio is poor right
now. Revisit once more categories have real subcategory splits, which
will happen naturally as the puzzle library grows and more puzzles get
`subcategories` assignments.

## Sketch, if revisited

Mirrors the catalogue-level implementation closely:

- A `wholeCategoryInlined` condition in `showCatalogueCategory`,
  parallel to `wholeCatalogueInlined` in `renderCatalogueOverviewList`.
- Reuse `renderSubjectSummary`'s shape for a "By subcategory" listing
  (subcategory title as the heading, its puzzle titles as the row, same
  `•` separator).
- Same "only when not already redundant" guard shouldn't be needed here
  the way it was for the catalogue/category-card double-inlining case,
  since this is a single level (category → subcategory), not two nested
  levels -- worth double-checking against `showCatalogueSubcategory`'s
  own screen when actually scoping this, though.
