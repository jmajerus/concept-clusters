import { validateCatalogueContent } from "./contentValidation.js";
import { slugify } from "../puzzles/categories.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// Registry-aware rules live outside contentValidation because a portable
// catalogue document can be checked before a repository's catalogue
// registry is available -- the same split categoryValidation.js uses for
// new_category. validateCatalogueContent already covers id/title/info
// shape, nonempty entries, per-entry id/reason shape, duplicate entries
// within this one catalogue, and (given puzzleIds) each entry resolving
// to a real puzzle; this layer adds only what depends on the existing
// catalogue registry, mirroring validate.mjs's own catalogue loop.
export function validateCatalogueCreation(
  raw,
  { puzzles = [], catalogues = [] } = {}
) {
  const puzzleIds = new Set(puzzles.map(puzzle => puzzle.id));
  const errors = validateCatalogueContent(raw, { puzzleIds });
  const id = typeof raw?.id === "string" ? raw.id.trim() : "";

  if (id) {
    if (id === "all") {
      errors.push('id "all" is reserved for the derived All Puzzles catalogue');
    }
    if (id === "new") {
      errors.push('id "new" is reserved for the derived New Puzzles catalogue');
    }
    if (catalogues.some(catalogue => catalogue.id === id)) {
      errors.push(`Catalogue "${id}" already exists`);
    }
    const normalized = slugify(id);
    if (normalized !== id) {
      errors.push(`id "${id}" must already be a URL-safe slug (try "${normalized}")`);
    }
    for (const existing of catalogues) {
      if (existing.id === id) continue;
      if (slugify(existing.id) === normalized) {
        errors.push(`id "${id}" collides with "${existing.id}" after normalization`);
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    catalogue: errors.length ? null : clone(raw)
  };
}
