import {
  categoriesForPuzzle,
  categorySlugFor,
  domainForCategory,
  DOMAINS,
  primaryCategoryForPuzzle,
  puzzleBelongsToCategory,
  puzzleLevel,
  PUZZLE_LEVELS,
  puzzlesForSubcategory
} from "../puzzles/categories.js";

let registryCatalogues = [];

export function setCatalogueRegistry(catalogues) {
  registryCatalogues = Array.isArray(catalogues) ? catalogues : [];
  return registryCatalogues;
}

export function getCatalogueRegistry() {
  return registryCatalogues;
}

if (typeof window === "undefined") {
  const { CATALOGUES } = await import("../catalogues/index.js");
  setCatalogueRegistry(CATALOGUES);
}

export const ALL_PUZZLES_CATALOGUE_ID = "all";
export const NEW_PUZZLES_CATALOGUE_ID = "new";
// Every level catalogue's id is this prefix plus the level name (e.g.
// "level-introductory") -- reserved the same way "all"/"new" are (see
// validate.mjs and catalogueValidation.js), so an authored catalogue can
// never collide with one.
export const LEVEL_CATALOGUE_ID_PREFIX = "level-";
// Same for domain catalogues ("domain-humanities") -- see domainCatalogue.
export const DOMAIN_CATALOGUE_ID_PREFIX = "domain-";

// Whether an id belongs to a catalogue derived from PUZZLES at runtime
// (all, new, level-*, domain-*) rather than authored in catalogues/ or D1.
// The single source of truth for the reserved-id rule: validation rejects
// an authored catalogue with such an id, and the D1 seed / freeze plan
// skip them since there's nothing to store.
export function isDerivedCatalogueId(id) {
  if (typeof id !== "string") return false;
  return id === ALL_PUZZLES_CATALOGUE_ID ||
    id === NEW_PUZZLES_CATALOGUE_ID ||
    id.startsWith(LEVEL_CATALOGUE_ID_PREFIX) ||
    id.startsWith(DOMAIN_CATALOGUE_ID_PREFIX);
}

// The validation message for an authored catalogue that tries to use a
// derived id -- shared so validate.mjs and the D1 authoring path agree.
export function reservedCatalogueIdError(id) {
  if (id === ALL_PUZZLES_CATALOGUE_ID) {
    return 'id "all" is reserved for the derived All Puzzles catalogue';
  }
  if (id === NEW_PUZZLES_CATALOGUE_ID) {
    return 'id "new" is reserved for the derived New Puzzles catalogue';
  }
  if (String(id).startsWith(LEVEL_CATALOGUE_ID_PREFIX)) {
    return `id prefix "${LEVEL_CATALOGUE_ID_PREFIX}" is reserved for derived level catalogues`;
  }
  return `id prefix "${DOMAIN_CATALOGUE_ID_PREFIX}" is reserved for derived domain catalogues`;
}

// A fraction of the library rather than a fixed count, so this stays
// meaningful as the catalog grows instead of shrinking toward
// irrelevance -- 10% lands on exactly 8 at today's 72 puzzles, so
// nothing changes visibly right now. Bounded so a small library doesn't
// look sparse (floor) and a much larger one doesn't stop feeling
// "recent" (ceiling). A date-based gate (e.g. "added in the last N
// days") would need an actual date field on puzzles, which doesn't
// exist yet -- deliberately deferred, not designed around, until
// there's a concrete need for it.
const NEW_PUZZLES_FRACTION = 0.1;
const NEW_PUZZLES_MIN = 5;
const NEW_PUZZLES_MAX = 20;

export function newPuzzlesCount(totalCount) {
  const target = Math.ceil(totalCount * NEW_PUZZLES_FRACTION);
  return Math.min(NEW_PUZZLES_MAX, Math.max(NEW_PUZZLES_MIN, target));
}

// puzzles/index.js's PUZZLES array is append-only (registerPuzzleSource
// only ever adds to the end), so array position is already a reliable
// "newest" signal -- newest first here, oldest last. Shared by
// newPuzzlesCatalogue and the Library card "New" badge membership check.
export function newPuzzles(puzzles) {
  return puzzles.slice(-newPuzzlesCount(puzzles.length));
}

// A catalogue can be newly minted from older puzzles -- containing no
// puzzle from newPuzzles() above doesn't mean the catalogue itself isn't
// new. Same append-only trick, scaled for a much smaller list:
// catalogues/index.js's CATALOGUES array is append-only the same way
// PUZZLES is (registerCatalogueSource only ever adds to the end), so
// array position is just as reliable a signal here. The puzzle-side
// fraction/bounds don't transfer -- 10% clamped to 5-20 would flag most
// of a 6-catalogue library -- so these are scaled down separately: 15%
// clamped to 1-3, landing on just the single most recent catalogue
// today rather than nearly all of them.
const NEW_CATALOGUES_FRACTION = 0.15;
const NEW_CATALOGUES_MIN = 1;
const NEW_CATALOGUES_MAX = 3;

export function newCataloguesCount(totalCount) {
  const target = Math.ceil(totalCount * NEW_CATALOGUES_FRACTION);
  return Math.min(NEW_CATALOGUES_MAX, Math.max(NEW_CATALOGUES_MIN, target));
}

export function newCatalogues(catalogues) {
  return catalogues.slice(-newCataloguesCount(catalogues.length));
}

export function allPuzzlesCatalogue(puzzles) {
  return {
    id: ALL_PUZZLES_CATALOGUE_ID,
    title: "All Puzzles",
    info: {
      text: "The complete Concept Clusters collection, organized by subject."
    },
    entries: puzzles.map(puzzle => ({ id: puzzle.id }))
  };
}

export function newPuzzlesCatalogue(puzzles) {
  return {
    id: NEW_PUZZLES_CATALOGUE_ID,
    title: "New Puzzles",
    info: { text: "The most recently added puzzles." },
    entries: newPuzzles(puzzles).reverse().map(puzzle => ({ id: puzzle.id }))
  };
}

// Player-facing copy per level -- see puzzles/categories.js's PUZZLE_LEVELS
// for why this stays a small fixed set rather than something authored.
const LEVEL_CATALOGUE_INFO = {
  introductory: {
    title: "Introductory Puzzles",
    text: "Puzzles marked as an approachable starting point."
  },
  intermediate: {
    title: "Intermediate Puzzles",
    text: "Puzzles marked as a step up in depth from an introductory one."
  },
  advanced: {
    title: "Advanced Puzzles",
    text: "Puzzles marked as the deepest treatment of a topic."
  }
};

export function levelCatalogueId(level) {
  return `${LEVEL_CATALOGUE_ID_PREFIX}${level}`;
}

// Unlike All/New Puzzles, a level catalogue can legitimately have zero
// members for a long time -- level is opt-in (see puzzleLevel), so most
// puzzles won't have one set for a while. Returns null rather than an
// empty catalogue object: callers (catalogueById, levelCatalogues) treat
// null as "doesn't exist right now", the same way an unrecognized id
// would, rather than rendering an empty Library card.
export function levelCatalogue(level, puzzles) {
  const meta = LEVEL_CATALOGUE_INFO[level];
  if (!meta) return null;
  const members = puzzles.filter(puzzle => puzzleLevel(puzzle) === level);
  if (!members.length) return null;
  return {
    id: levelCatalogueId(level),
    title: meta.title,
    info: { text: meta.text },
    // No genuine editorial sequence to a level-filtered cross-section of
    // the whole library -- same reasoning as All/New Puzzles, but those
    // two are exempted by id in overviewRenderer.js's own inlining check;
    // this is exempted structurally instead, by just not being ordered.
    ordered: false,
    entries: members.map(puzzle => ({ id: puzzle.id }))
  };
}

// Every level with at least one matching puzzle, in PUZZLE_LEVELS' fixed
// order (introductory, intermediate, advanced) -- not sorted by count or
// alphabetically, so the Library's ordering stays stable and meaningful
// even as membership changes.
export function levelCatalogues(puzzles) {
  return PUZZLE_LEVELS.flatMap(level => {
    const catalogue = levelCatalogue(level, puzzles);
    return catalogue ? [catalogue] : [];
  });
}

export function domainCatalogueId(domainId) {
  return `${DOMAIN_CATALOGUE_ID_PREFIX}${domainId}`;
}

// A domain catalogue is All Puzzles filtered to one domain of
// puzzles/categories.js's DOMAINS: every puzzle with at least one category
// (primary or additional) in that domain, so a multidisciplinary puzzle
// appears under several domains by the same mechanism it appears under
// several categories (docs/TAXONOMY-ROADMAP.md). This is the domain
// "landing page" the roadmap deferred -- realized as a derived catalogue
// rather than a new route kind, so progress, breadcrumbs, share links, and
// the category partition all come from the existing catalogue plumbing.
// Title and description are the domain's own, so there's no separate copy
// to author. `domain` marks the catalogue so categoriesForCatalogue can
// scope its subject partition to the domain's categories (a cross-listed
// puzzle would otherwise drag a foreign category card in with it). Same
// null-when-empty rule as levelCatalogue: domain-less puzzles (Trivia,
// Vocabulary) get no "other" catalogue -- they stay reachable through All
// Puzzles, whose subject list is the only place an "Other subjects"
// heading belongs.
export function domainCatalogue(domainId, puzzles) {
  const meta = DOMAINS[domainId];
  if (!meta) return null;
  const members = puzzles.filter(puzzle =>
    categoriesForPuzzle(puzzle).some(name => domainForCategory(name) === domainId)
  );
  if (!members.length) return null;
  return {
    id: domainCatalogueId(domainId),
    title: meta.title,
    info: meta.info,
    domain: domainId,
    ordered: false,
    entries: members.map(puzzle => ({ id: puzzle.id }))
  };
}

// Every non-empty domain, alphabetical by title -- the same "no implied
// ranking between subjects" rule the category-browse headings follow
// (DOMAINS' declaration order carries no meaning).
export function domainCatalogues(puzzles) {
  return Object.keys(DOMAINS)
    .sort((a, b) => DOMAINS[a].title.localeCompare(DOMAINS[b].title))
    .flatMap(domainId => {
      const catalogue = domainCatalogue(domainId, puzzles);
      return catalogue ? [catalogue] : [];
    });
}

// Whether a catalogue's entry order reflects a deliberate editorial
// sequence worth telling a player to follow, vs. just being the order
// the author happened to list a themed grouping in. Defaults to true --
// most existing catalogues do chain entries with a `reason` -- so authors
// opt specific catalogues *out* with `ordered: false` rather than every
// catalogue needing to opt in.
export function isOrderedCatalogue(catalogue) {
  return catalogue?.ordered !== false;
}

export function catalogueById(id, puzzles, catalogues = getCatalogueRegistry()) {
  if (id === ALL_PUZZLES_CATALOGUE_ID) return allPuzzlesCatalogue(puzzles);
  if (id === NEW_PUZZLES_CATALOGUE_ID) return newPuzzlesCatalogue(puzzles);
  if (typeof id === "string" && id.startsWith(LEVEL_CATALOGUE_ID_PREFIX)) {
    return levelCatalogue(id.slice(LEVEL_CATALOGUE_ID_PREFIX.length), puzzles);
  }
  if (typeof id === "string" && id.startsWith(DOMAIN_CATALOGUE_ID_PREFIX)) {
    return domainCatalogue(id.slice(DOMAIN_CATALOGUE_ID_PREFIX.length), puzzles);
  }
  return catalogues.find(catalogue => catalogue.id === id) || null;
}

// Meta catalogues (kind: "meta") are ordinary catalogues whose entries are
// other catalogues' ids instead of puzzle ids -- a curated grouping of
// catalogues, one level deep (a meta catalogue's own entries are never
// themselves meta; enforced at validation time, not here). childCatalogues
// resolves that one level; every function below that needs a meta
// catalogue's puzzle membership goes through it rather than reading
// `entries` directly, so "what puzzles does this catalogue contain" stays
// correct for both kinds from one place.
export function childCatalogues(catalogue, catalogues = getCatalogueRegistry()) {
  if (catalogue?.kind !== "meta") return [];
  return catalogue.entries.flatMap(entry => {
    const child = catalogues.find(candidate => candidate.id === entry.id);
    return child ? [child] : [];
  });
}

// relatedCatalogues is a meta catalogue's "see also" list: catalogues
// related in spirit but left out of entries' primary sequence. Unlike
// childCatalogues it isn't nesting -- no suppression from the Library
// screen, no breadcrumb segment -- so it can point at a meta catalogue
// too, not just a leaf one.
export function relatedCatalogues(catalogue, catalogues = getCatalogueRegistry()) {
  const entries = catalogue?.relatedCatalogues?.entries;
  if (!Array.isArray(entries)) return [];
  return entries.flatMap(entry => {
    const related = catalogues.find(candidate => candidate.id === entry.id);
    return related ? [related] : [];
  });
}

// Every catalogue id that appears as some meta catalogue's child --
// libraryCatalogues uses this to suppress those from the flat top-level
// list by default (reduces sprawl once a catalogue has a meta home), and a
// catalogue can opt back in with `showInLibrary: true`.
function catalogueIdsNestedUnderMeta(catalogues) {
  const nested = new Set();
  for (const catalogue of catalogues) {
    if (catalogue.kind !== "meta") continue;
    for (const entry of catalogue.entries) nested.add(entry.id);
  }
  return nested;
}

// The reverse of childCatalogues: which meta catalogue, if any, a given
// (leaf) catalogue is nested under. Used to add a breadcrumb segment when
// a catalogue was reached through its meta parent -- derived from the
// registry rather than carried in navigation/URL state, so it's correct
// on a direct link or refresh, not just after a click-through. A catalogue
// nested under more than one meta has no single unambiguous parent to
// show, so this deliberately returns null for that case rather than
// guessing.
export function parentMetaCatalogueFor(catalogueId, catalogues = getCatalogueRegistry()) {
  const parents = catalogues.filter(catalogue =>
    catalogue.kind === "meta" &&
    catalogue.entries.some(entry => entry.id === catalogueId)
  );
  return parents.length === 1 ? parents[0] : null;
}

export function libraryCatalogues(puzzles, catalogues = getCatalogueRegistry()) {
  const nested = catalogueIdsNestedUnderMeta(catalogues);
  const visible = catalogues.filter(catalogue =>
    catalogue.kind === "meta" || !nested.has(catalogue.id) || catalogue.showInLibrary
  );
  return [
    allPuzzlesCatalogue(puzzles),
    newPuzzlesCatalogue(puzzles),
    ...levelCatalogues(puzzles),
    ...domainCatalogues(puzzles),
    ...visible
  ];
}

export function puzzlesForCatalogue(catalogue, puzzles, catalogues = getCatalogueRegistry()) {
  if (!catalogue) return [];
  if (catalogue.id === ALL_PUZZLES_CATALOGUE_ID) return [...puzzles];
  if (catalogue.kind === "meta") {
    const seen = new Set();
    const members = [];
    for (const child of childCatalogues(catalogue, catalogues)) {
      for (const puzzle of puzzlesForCatalogue(child, puzzles, catalogues)) {
        if (seen.has(puzzle.id)) continue;
        seen.add(puzzle.id);
        members.push(puzzle);
      }
    }
    return members;
  }
  const puzzleById = new Map(puzzles.map(puzzle => [puzzle.id, puzzle]));
  return catalogue.entries.flatMap(entry => {
    const puzzle = puzzleById.get(entry.id);
    return puzzle ? [puzzle] : [];
  });
}

export function catalogueContainsPuzzle(catalogue, puzzleOrId, puzzles, catalogues = getCatalogueRegistry()) {
  const id = typeof puzzleOrId === "string" ? puzzleOrId : puzzleOrId?.id;
  return !!id && puzzlesForCatalogue(catalogue, puzzles, catalogues)
    .some(puzzle => puzzle.id === id);
}

// The category a puzzle files under within a given catalogue's subject
// partition: its primary category, except inside a domain catalogue,
// where a cross-listed puzzle's primary category may sit in another
// domain -- there it's the puzzle's first category in that domain, so
// the route and the grouped list agree with categoriesForCatalogue.
export function primaryCategoryInCatalogue(catalogue, puzzle) {
  if (catalogue?.domain) {
    return categoriesForPuzzle(puzzle)
      .find(name => domainForCategory(name) === catalogue.domain) || null;
  }
  return primaryCategoryForPuzzle(puzzle);
}

// A domain catalogue's subject partition is scoped to its own domain's
// categories: a member cross-listed under a category from another domain
// is still a member (that's how it got in), but that foreign category
// isn't one of this catalogue's subjects.
export function categoriesForCatalogue(catalogue, puzzles, catalogues = getCatalogueRegistry()) {
  const names = [...new Set(
    puzzlesForCatalogue(catalogue, puzzles, catalogues)
      .flatMap(categoriesForPuzzle)
  )];
  const scoped = catalogue?.domain
    ? names.filter(name => domainForCategory(name) === catalogue.domain)
    : names;
  return scoped.sort((a, b) => a.localeCompare(b));
}

export function puzzlesForCatalogueCategory(catalogue, category, puzzles, catalogues = getCatalogueRegistry()) {
  return puzzlesForCatalogue(catalogue, puzzles, catalogues)
    .filter(puzzle => puzzleBelongsToCategory(puzzle, category));
}

export function puzzlesForCatalogueSubcategory(
  catalogue,
  category,
  subcategoryId,
  puzzles,
  catalogues = getCatalogueRegistry()
) {
  return puzzlesForSubcategory(
    puzzlesForCatalogue(catalogue, puzzles, catalogues),
    category,
    subcategoryId
  );
}

export function resolveCategory(value, puzzles) {
  if (!value) return null;
  const names = [...new Set(puzzles.flatMap(categoriesForPuzzle))];
  return names.find(name => categorySlugFor(name) === value)
    || names.find(name => name === value)
    || null;
}

export function cataloguesForPuzzle(
  puzzleOrId,
  puzzles,
  catalogues = getCatalogueRegistry()
) {
  const id = typeof puzzleOrId === "string" ? puzzleOrId : puzzleOrId?.id;
  if (!id) return [];
  return catalogues.filter(catalogue =>
    catalogue.entries.some(entry => entry.id === id)
  );
}

export function cataloguesForCategory(
  category,
  puzzles,
  catalogues = getCatalogueRegistry()
) {
  return catalogues.flatMap(catalogue => {
    const count = puzzlesForCatalogueCategory(catalogue, category, puzzles, catalogues).length;
    return count ? [{ catalogue, count }] : [];
  });
}

export function entriesForPuzzles(catalogue, puzzles) {
  const reasons = new Map(
    (catalogue?.entries || []).map(entry => [entry.id, entry.reason])
  );
  return puzzles.map(puzzle => ({
    id: puzzle.id,
    ...(reasons.get(puzzle.id) ? { reason: reasons.get(puzzle.id) } : {})
  }));
}

export function catalogueProgress(catalogue, puzzles, isComplete, catalogues = getCatalogueRegistry()) {
  const members = puzzlesForCatalogue(catalogue, puzzles, catalogues);
  return {
    completed: members.filter(puzzle => isComplete(puzzle)).length,
    total: members.length
  };
}
