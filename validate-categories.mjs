import { PUZZLES } from "./puzzles/index.js";
import {
  CATEGORIES,
  categoryIdFor,
  categoriesForPuzzle,
  categorySlugFor
} from "./puzzles/categories.js";
import { validateSubcategoryAssignments } from "./modules/categoryValidation.js";

let ok = true;
const fail = (id, message) => {
  console.log(`${id}: ${message}`);
  ok = false;
};

for (const puzzle of PUZZLES) {
  const categories = categoriesForPuzzle(puzzle);
  if (!categories.length) {
    fail(puzzle.id, "must define at least one category");
    continue;
  }
  if (typeof puzzle.category !== "string" || !puzzle.category.trim()) {
    fail(puzzle.id, "category must remain a non-empty primary category");
  }
  const categoryIds = categories.map(category => categoryIdFor(category, CATEGORIES));
  const primaryId = categoryIdFor(puzzle.category, CATEGORIES);
  if (categoryIds[0] !== primaryId) {
    fail(
      puzzle.id,
      `categories[0] must match primary category "${puzzle.category}"`
    );
  }
  if (puzzle.categories !== undefined) {
    if (!Array.isArray(puzzle.categories) || !puzzle.categories.length) {
      fail(puzzle.id, "categories must be a non-empty array when present");
    }
    if (puzzle.categories.length > 3) {
      fail(
        puzzle.id,
        `categories has ${puzzle.categories.length} entries; use catalogues rather than broad category inflation`
      );
    }
    const unique = new Set();
    puzzle.categories.forEach((category, index) => {
      if (typeof category !== "string" || !category.trim()) {
        fail(puzzle.id, `categories[${index}] must be a non-empty string`);
      } else if (unique.has(categoryIdFor(category, CATEGORIES))) {
        fail(puzzle.id, `categories repeats "${category}"`);
      }
      unique.add(categoryIdFor(category, CATEGORIES));
    });
  }
}

validateSubcategoryAssignments(PUZZLES, CATEGORIES)
  .forEach(error => fail(error.scope, error.message));

// Puzzle category references are canonical identifiers after the category
// identifier migration, while the registry is keyed by display titles for
// backwards compatibility. Resolve both sides to identifiers before checking
// registry coverage so title/identifier representation does not affect the
// result.
const usedCategoryIds = new Set(
  PUZZLES.flatMap(puzzle =>
    categoriesForPuzzle(puzzle).map(category =>
      categoryIdFor(category, CATEGORIES)
    )
  )
);
for (const name of Object.keys(CATEGORIES)) {
  const id = categoryIdFor(name, CATEGORIES);
  if (!usedCategoryIds.has(id)) {
    fail(
      `categories.js:"${name}"`,
      "registered but no puzzle resolves to this category identifier"
    );
  }
}

const slugOwners = new Map();
for (const id of usedCategoryIds) {
  const slug = categorySlugFor(id);
  const owner = slugOwners.get(slug);
  if (owner && owner !== id) {
    fail(
      "categories.js",
      `"${id}" and "${owner}" both resolve to category slug "${slug}"`
    );
  }
  slugOwners.set(slug, id);
}

if (!ok) process.exit(1);
console.log(`Validated ${PUZZLES.length} puzzles across ${usedCategoryIds.size} categories.`);
