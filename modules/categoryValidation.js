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

function cloneDocument(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// D1 category working copies use { id, title, domain?, info?, subcategories? }.
// Title is the join string puzzles store; id is the URL slug.
export function validateCategoryDocument(
  raw,
  { existing = [], mode = "create" } = {}
) {
  const errors = [];
  if (!isObject(raw)) {
    return { valid: false, errors: ["must be an object"], document: null };
  }
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!id) errors.push("id must be a non-empty string");
  if (id && slugify(id) !== id) {
    errors.push(`id "${id}" must already be a URL-safe slug (try "${slugify(id)}")`);
  }
  if (!title) errors.push("title must be a non-empty string");
  if (typeof raw.id === "string" && raw.id !== id) {
    errors.push("id must not have surrounding whitespace");
  }
  if (typeof raw.title === "string" && raw.title !== title) {
    errors.push("title must not have surrounding whitespace");
  }
  if (raw.domain !== undefined && !Object.hasOwn(DOMAINS, raw.domain)) {
    errors.push(`domain "${raw.domain}" is not a registered domain`);
  }
  if (raw.info !== undefined) {
    errors.push(...validateInfo(raw.info, "info", { requireObject: true }));
  }

  const matchById = id ? existing.find(item => item.id === id) : null;
  const matchByTitle = title
    ? existing.find(item => item.title === title && item.id !== id)
    : null;
  if (mode === "create") {
    if (matchById) errors.push(`Category "${id}" already exists`);
    if (matchByTitle) {
      errors.push(`Category title "${title}" is already used by "${matchByTitle.id}"`);
    }
  } else if (id && !matchById) {
    errors.push(`Category "${id}" does not exist -- use create_category for a new category`);
  } else if (matchByTitle) {
    errors.push(`Category title "${title}" is already used by "${matchByTitle.id}"`);
  }

  const metadata = {
    slug: id,
    ...(raw.domain ? { domain: raw.domain } : {}),
    ...(raw.info ? { info: cloneDocument(raw.info) } : {}),
    ...(raw.subcategories ? { subcategories: cloneDocument(raw.subcategories) } : {})
  };
  if (title) {
    validateSubcategoryAssignments([], { [title]: metadata })
      .filter(error => error.scope.includes(`"${title}"`))
      .forEach(error => errors.push(`${error.scope}: ${error.message}`));
  }

  return {
    valid: errors.length === 0,
    errors,
    document: errors.length ? null : cloneDocument({ ...raw, id, title })
  };
}
