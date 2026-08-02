import { PUZZLES } from "./puzzles/index.js";
import {
  CATEGORIES,
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
  if (categories[0] !== puzzle.category) {
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
      } else if (unique.has(category)) {
        fail(puzzle.id, `categories repeats "${category}"`);
      }
      unique.add(category);
    });
  }
}

validateSubcategoryAssignments(PUZZLES, CATEGORIES)
  .forEach(error => fail(error.scope, error.message));

const usedCategories = new Set(PUZZLES.flatMap(categoriesForPuzzle));
for (const name of Object.keys(CATEGORIES)) {
  if (!usedCategories.has(name)) {
    fail(
      `categories.js:"${name}"`,
      "registered but no puzzle uses this exact category string"
    );
  }
}

const slugOwners = new Map();
for (const name of usedCategories) {
  const slug = categorySlugFor(name);
  const owner = slugOwners.get(slug);
  if (owner && owner !== name) {
    fail(
      "categories.js",
      `"${name}" and "${owner}" both resolve to category slug "${slug}"`
    );
  }
  slugOwners.set(slug, name);
}

if (!ok) process.exit(1);
console.log(`Validated ${PUZZLES.length} puzzles across ${usedCategories.size} categories.`);
