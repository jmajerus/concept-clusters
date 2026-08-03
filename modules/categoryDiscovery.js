import { categoriesForPuzzle, slugify } from "../puzzles/categories.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function categorySummaries(puzzles, categories) {
  const names = new Set([
    ...Object.keys(categories),
    ...puzzles.flatMap(categoriesForPuzzle)
  ]);
  return [...names].map(name => {
    const metadata = categories[name] || null;
    const members = puzzles.filter(puzzle =>
      categoriesForPuzzle(puzzle).includes(name)
    );
    const subcategories = Object.entries(metadata?.subcategories || {})
      .map(([id, definition]) => ({
        id,
        ...clone(definition),
        puzzleCount: members.filter(puzzle =>
          puzzle.subcategories?.[name] === id
        ).length
      }));
    return {
      name,
      slug: metadata?.slug || slugify(name),
      registered: !!metadata,
      puzzleCount: members.length,
      primaryPuzzleCount: members.filter(puzzle => puzzle.category === name).length,
      ...(metadata?.info ? { info: clone(metadata.info) } : {}),
      ...(subcategories.length ? { subcategories } : {})
    };
  });
}

export function categorySummary(puzzles, categories, name) {
  const category = categorySummaries(puzzles, categories)
    .find(item => item.name === name);
  if (!category) throw new Error(`Unknown category: ${name}`);
  return category;
}
