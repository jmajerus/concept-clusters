import { validateInfo } from "./contentValidation.js";
import {
  CATEGORIES,
  RESERVED_SUBCATEGORY_IDS,
  categoriesForPuzzle,
  slugify
} from "../puzzles/categories.js";

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// Registry-aware rules live outside contentValidation because portable
// puzzle documents can be checked before a repository's category taxonomy is
// available. Installation and authoring validation call this second layer.
export function validateSubcategoryAssignments(
  puzzles,
  categories = CATEGORIES
) {
  const errors = [];
  const fail = (scope, message) => errors.push({ scope, message });

  for (const [category, metadata] of Object.entries(categories)) {
    if (metadata.subcategories === undefined) continue;
    const scope = `categories.js:"${category}".subcategories`;
    if (!isObject(metadata.subcategories)) {
      fail(scope, "must be an object keyed by stable subcategory id");
      continue;
    }
    const normalizedOwners = new Map();
    for (const [id, definition] of Object.entries(metadata.subcategories)) {
      const itemScope = `${scope}."${id}"`;
      if (!id.trim()) {
        fail(itemScope, "id must be non-empty");
        continue;
      }
      const normalized = slugify(id);
      if (normalized !== id) {
        fail(itemScope, `id must already be a URL-safe slug (try "${normalized}")`);
      }
      if (RESERVED_SUBCATEGORY_IDS.has(id)) {
        fail(itemScope, `"${id}" is reserved for a generated navigation partition`);
      }
      const owner = normalizedOwners.get(normalized);
      if (owner && owner !== id) {
        fail(itemScope, `id collides with "${owner}" after normalization`);
      } else {
        normalizedOwners.set(normalized, id);
      }
      if (!isObject(definition)) {
        fail(itemScope, "definition must be an object");
        continue;
      }
      if (typeof definition.title !== "string" || !definition.title.trim()) {
        fail(itemScope, "title must be a non-empty string");
      }
      validateInfo(definition.info, `${itemScope}.info`)
        .forEach(message => fail(itemScope, message));
    }
  }

  for (const puzzle of puzzles) {
    if (puzzle.subcategories === undefined) continue;
    const scope = `${puzzle.id}.subcategories`;
    if (!isObject(puzzle.subcategories)) {
      fail(scope, "must be an object keyed by category");
      continue;
    }
    const memberships = new Set(categoriesForPuzzle(puzzle));
    for (const [category, id] of Object.entries(puzzle.subcategories)) {
      if (!memberships.has(category)) {
        fail(scope, `"${category}" is not one of this puzzle's categories`);
        continue;
      }
      if (typeof id !== "string" || !id.trim()) {
        fail(scope, `"${category}" must name one non-empty subcategory id`);
        continue;
      }
      if (!categories[category]?.subcategories?.[id]) {
        fail(scope, `"${id}" is not registered under "${category}"`);
      }
    }
  }

  return errors;
}
