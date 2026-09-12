import { validateInfo } from "./contentValidation.js";
import {
  CATEGORIES,
  DOMAINS,
  RESERVED_SUBCATEGORY_IDS,
  categoryIdFor,
  categoryMetadataFor,
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
    const memberships = new Set(categoriesForPuzzle(puzzle, categories)
      .map(category => categoryIdFor(category, categories)));
    for (const [category, id] of Object.entries(puzzle.subcategories)) {
      const categoryId = categoryIdFor(category, categories);
      if (!memberships.has(categoryId)) {
        fail(scope, `"${category}" is not one of this puzzle's categories`);
        continue;
      }
      if (typeof id !== "string" || !id.trim()) {
        fail(scope, `"${category}" must name one non-empty subcategory id`);
        continue;
      }
      const metadata = categoryMetadataFor(category, categories);
      if (!metadata?.subcategories?.[id]) {
        const registeredIds = Object.keys(metadata?.subcategories || {}).sort();
        const registered = registeredIds.length
          ? `registered: ${registeredIds.join(", ")}`
          : `"${category}" has no subcategories registered yet`;
        fail(
          scope,
          `"${id}" is not registered under "${category}" (${registered}). ` +
          "If this is genuinely new, register it on the category first (update_category), then reference it from the puzzle."
        );
      }
    }
  }

  return errors;
}

function cloneDocument(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// D1 category working copies use { id, title, domain?, info?, subcategories? }.
// The title is display metadata; puzzle documents join to the stable id.
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
  if (raw.previousTitles !== undefined) {
    if (!Array.isArray(raw.previousTitles)
      || raw.previousTitles.some(item => typeof item !== "string" || !item.trim())) {
      errors.push("previousTitles must be an array of non-empty strings");
    }
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
    document: errors.length
      ? null
      : cloneDocument({
          ...raw,
          id,
          title,
          ...withRenameHistory(raw, { id, title }, matchById)
        })
  };
}

// The category's own rename ledger. On an update whose title differs from
// the stored one, the stored title joins previousTitles; history the
// caller omitted (a client echoing get_category's document) is kept rather
// than dropped; the current title never lists itself. Absent when empty.
function withRenameHistory(raw, { title }, existingRecord) {
  const merged = new Set([
    ...(existingRecord?.previousTitles || []),
    ...(Array.isArray(raw.previousTitles) ? raw.previousTitles : [])
  ]);
  const storedTitle = existingRecord?.title;
  if (storedTitle && storedTitle !== title) merged.add(storedTitle);
  merged.delete(title);
  return merged.size ? { previousTitles: [...merged] } : { previousTitles: undefined };
}
