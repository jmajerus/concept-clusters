import { validateInfo } from "./contentValidation.js";
import {
  CATEGORIES,
  DOMAINS,
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

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function validateCategoryRegistration(
  raw,
  { puzzle, puzzles = [], categories = CATEGORIES } = {}
) {
  const errors = [];
  if (!isObject(raw)) {
    return { valid: false, errors: ["new_category must be an object"], registration: null };
  }
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) errors.push("new_category.name must be a non-empty string");
  if (typeof raw.name === "string" && raw.name !== name) {
    errors.push("new_category.name must not have surrounding whitespace");
  }
  if (name && Object.hasOwn(categories, name)) {
    errors.push(`Category "${name}" is already registered`);
  }
  if (name && puzzles.some(item => categoriesForPuzzle(item).includes(name))) {
    errors.push(
      `Category "${name}" is already used by a published puzzle; use a category-change workflow`
    );
  }
  if (name && puzzle && !categoriesForPuzzle(puzzle).includes(name)) {
    errors.push(`The published puzzle must belong to new category "${name}"`);
  }
  if (!isObject(raw.info) || typeof raw.info.text !== "string" ||
      !raw.info.text.trim()) {
    errors.push("new_category.info.text must be a non-empty string");
  } else {
    errors.push(...validateInfo(raw.info, "new_category.info", {
      requireObject: true
    }));
  }
  if (raw.slug !== undefined &&
      (typeof raw.slug !== "string" || !raw.slug.trim() ||
       slugify(raw.slug) !== raw.slug)) {
    errors.push("new_category.slug must be a lowercase URL-safe slug when present");
  }
  if (raw.domain !== undefined && !Object.hasOwn(DOMAINS, raw.domain)) {
    errors.push(`new_category.domain "${raw.domain}" is not a registered domain`);
  }

  const metadata = {
    ...(raw.domain ? { domain: raw.domain } : {}),
    ...(raw.slug ? { slug: raw.slug } : {}),
    ...(raw.info ? { info: clone(raw.info) } : {}),
    ...(raw.subcategories ? { subcategories: clone(raw.subcategories) } : {})
  };
  if (name) {
    const merged = { ...categories, [name]: metadata };
    validateSubcategoryAssignments(puzzle ? [puzzle] : [], merged)
      .filter(error => error.scope.includes(`"${name}"`) ||
        error.scope === `${puzzle?.id}.subcategories`)
      .forEach(error => errors.push(`${error.scope}: ${error.message}`));

    const proposedSlug = raw.slug || slugify(name);
    const categoryNames = new Set([
      ...Object.keys(categories),
      ...puzzles.flatMap(categoriesForPuzzle)
    ]);
    for (const existingName of categoryNames) {
      if (existingName === name) continue;
      const existingSlug = categories[existingName]?.slug || slugify(existingName);
      if (existingSlug === proposedSlug) {
        errors.push(
          `new_category slug "${proposedSlug}" collides with "${existingName}"`
        );
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    registration: errors.length ? null : { name, metadata }
  };
}
