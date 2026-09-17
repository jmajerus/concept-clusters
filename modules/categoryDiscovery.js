import {
  categoriesForPuzzle,
  categoryIdFor,
  categoryTitleFor,
  primaryCategoryForPuzzle,
  slugify
} from "../puzzles/categories.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export const CATEGORY_REGISTRATION_MODES = Object.freeze({
  PUZZLE_REFERENCE: "puzzle-reference",
  PUBLISHED_DOCUMENT: "published-document"
});

export function categorySummaries(
  puzzles,
  categories,
  {
    registeredPuzzles = puzzles,
    registrationMode = CATEGORY_REGISTRATION_MODES.PUZZLE_REFERENCE
  } = {}
) {
  const puzzleRegisteredCategoryIds = registrationMode === CATEGORY_REGISTRATION_MODES.PUZZLE_REFERENCE
    ? new Set(
      registeredPuzzles.flatMap(puzzle => categoriesForPuzzle(puzzle, categories))
        .map(category => categoryIdFor(category, categories))
        .filter(Boolean)
    )
    : new Set();
  const names = new Set([
    ...Object.keys(categories),
    ...puzzles.flatMap(puzzle => categoriesForPuzzle(puzzle, categories))
  ]);
  return [...names].map(name => {
    const metadata = categories[name] || categories[categoryTitleFor(name, categories)] || null;
    const members = puzzles.filter(puzzle =>
      categoriesForPuzzle(puzzle, categories).includes(name)
    );
    const subcategories = Object.entries(metadata?.subcategories || {})
      .map(([id, definition]) => ({
        id,
        ...clone(definition),
        puzzleCount: members.filter(puzzle =>
          Object.entries(puzzle.subcategories || {})
            .some(([category, subcategory]) =>
              categoryIdFor(category, categories) === categoryIdFor(name, categories) &&
              subcategory === id
            )
        ).length
      }));
    return {
      name,
      slug: metadata?.slug || categoryIdFor(name, categories) || slugify(name),
      // A published category-editor document (or a Git category in a
      // checkout-aware caller) registers the category in published-document
      // mode. The default preserves the legacy Git-backed contract, where a
      // published puzzle reference is enough to register a category.
      registered: (
        !!metadata && metadata.registered !== false && metadata.inferred !== true
      ) || puzzleRegisteredCategoryIds.has(categoryIdFor(name, categories)),
      puzzleCount: members.length,
      primaryPuzzleCount: members.filter(puzzle =>
        categoryIdFor(primaryCategoryForPuzzle(puzzle, categories), categories) ===
        categoryIdFor(name, categories)
      ).length,
      ...(metadata?.domain ? { domain: metadata.domain } : {}),
      ...(metadata?.info ? { info: clone(metadata.info) } : {}),
      ...(subcategories.length ? { subcategories } : {})
    };
  });
}

export function categorySummary(puzzles, categories, name, options = {}) {
  const category = categorySummaries(puzzles, categories, options)
    .find(item => item.name === categoryTitleFor(name, categories));
  if (!category) {
    throw new Error(
      `Unknown category: "${name}". Category names are case-sensitive and ` +
      "must match exactly -- call list_categories to see the valid set."
    );
  }
  return category;
}
