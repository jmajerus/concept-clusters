import { validateCatalogueContent } from "./contentValidation.js";
import { LEVEL_CATALOGUE_ID_PREFIX } from "./catalogueRegistry.js";
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
// Hosted create_catalogue supplies puzzleIds/catalogues from the GitHub
// base branch rather than the Worker-bundled registries.
export function validateCatalogueCreation(
  raw,
  { puzzles = null, puzzleIds = null, catalogues = [] } = {}
) {
  // puzzleIds wins when provided. Passing puzzles: null / puzzleIds: null
  // skips membership checks (shape and registry rules still run). An empty
  // Set still means "no published puzzles," so every entry fails resolution.
  const resolvedPuzzleIds = puzzleIds instanceof Set
    ? puzzleIds
    : puzzles
      ? new Set(puzzles.map(puzzle => puzzle.id))
      : null;
  // "all"/"new" are synthesized on demand (modules/catalogueRegistry.js's
  // catalogueById), never present in `catalogues`, so they're already
  // excluded here without special-casing -- a meta entry referencing
  // either simply won't resolve, the same as any other unknown id.
  const catalogueIds = new Set(catalogues.map(catalogue => catalogue.id));
  const metaCatalogueIds = new Set(
    catalogues.filter(catalogue => catalogue.kind === "meta").map(catalogue => catalogue.id)
  );
  const errors = validateCatalogueContent(raw, {
    puzzleIds: resolvedPuzzleIds,
    catalogueIds,
    metaCatalogueIds
  });
  const id = typeof raw?.id === "string" ? raw.id.trim() : "";

  if (id) {
    if (id === "all") {
      errors.push('id "all" is reserved for the derived All Puzzles catalogue');
    }
    if (id === "new") {
      errors.push('id "new" is reserved for the derived New Puzzles catalogue');
    }
    if (id.startsWith(LEVEL_CATALOGUE_ID_PREFIX)) {
      errors.push(`id prefix "${LEVEL_CATALOGUE_ID_PREFIX}" is reserved for derived level catalogues`);
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

// update_catalogue's counterpart to validateCatalogueCreation: a
// catalogue is edited by resubmitting its complete {id, title, info,
// entries} document (add, remove, and reorder are all just differences
// in that entries list), the same way replacing a puzzle document
// replaces its whole canonical file rather than patching one field --
// nothing about a catalogue is more privileged than a puzzle here. The
// registry-level rules invert creation's: `id` must already resolve to
// an existing, non-meta catalogue rather than being new. Meta catalogues
// aren't supported yet, on either path (create_catalogue can't make one
// either) -- their entries mean "other catalogue ids," which this
// narrow {id, title, info, entries} document has no way to distinguish
// from "puzzle ids" without a kind field the schema doesn't expose.
export function validateCatalogueUpdate(
  raw,
  { puzzles = null, puzzleIds = null, catalogues = [] } = {}
) {
  const resolvedPuzzleIds = puzzleIds instanceof Set
    ? puzzleIds
    : puzzles
      ? new Set(puzzles.map(puzzle => puzzle.id))
      : null;
  const catalogueIds = new Set(catalogues.map(catalogue => catalogue.id));
  const metaCatalogueIds = new Set(
    catalogues.filter(catalogue => catalogue.kind === "meta").map(catalogue => catalogue.id)
  );
  const errors = validateCatalogueContent(raw, {
    puzzleIds: resolvedPuzzleIds,
    catalogueIds,
    metaCatalogueIds
  });
  const id = typeof raw?.id === "string" ? raw.id.trim() : "";
  const existing = id ? catalogues.find(catalogue => catalogue.id === id) ?? null : null;

  if (id) {
    if (!existing) {
      errors.push(`Catalogue "${id}" does not exist -- use create_catalogue for a new catalogue`);
    } else if (existing.kind === "meta") {
      errors.push(`Catalogue "${id}" is a meta catalogue; update_catalogue does not support meta catalogues yet`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    // Non-content fields the {id, title, info, entries} document can't
    // even express (kind, ordered, showInLibrary, relatedCatalogues)
    // carry over from the existing catalogue untouched, rather than
    // silently dropping out of the regenerated file just because this
    // narrower update schema has no way to ask for them.
    catalogue: errors.length ? null : { ...existing, ...clone(raw) }
  };
}
