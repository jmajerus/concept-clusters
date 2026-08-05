import { CATALOGUES } from "./catalogues/index.js";
import {
  validateCatalogueContent,
  validateInfo,
  validatePuzzleContent
} from "./modules/contentValidation.js";
import { validateLearningIntroduction } from "./modules/learningIntroductionValidation.js";
import { validateStarLayoutDocument } from "./modules/starLayoutSchema.js";
import { validateSubcategoryAssignments } from "./modules/categoryValidation.js";
import {
  CATEGORIES,
  DOMAINS,
  categoriesForPuzzle,
  categorySlugFor,
  slugify
} from "./puzzles/categories.js";
import { PUZZLES } from "./puzzles/index.js";
import { STAR_LAYOUTS } from "./puzzles/layouts/star/index.js";
import { SHOWCASE_PUZZLE_IDS } from "./puzzles/showcase.js";

let ok = true;
const fail = (id, message) => {
  console.log(`${id}: ${message}`);
  ok = false;
};

const puzzleIdCounts = new Map();
for (const puzzle of PUZZLES) {
  puzzleIdCounts.set(puzzle.id, (puzzleIdCounts.get(puzzle.id) || 0) + 1);
}
const allPuzzleIds = new Set(puzzleIdCounts.keys());

// The semantic rules live in a browser-safe module shared with JSON-LD
// import and the future authoring workspace. This repository entry point
// adds filesystem-backed learning resources and registry-wide checks.
for (const puzzle of PUZZLES) {
  if (puzzleIdCounts.get(puzzle.id) !== 1) {
    fail(puzzle.id, `id resolves to ${puzzleIdCounts.get(puzzle.id)} puzzles instead of exactly one`);
  }
  validatePuzzleContent(puzzle, { knownPuzzleIds: allPuzzleIds })
    .forEach(error => fail(puzzle.id, error));
  (await validateLearningIntroduction(puzzle))
    .forEach(error => fail(puzzle.id, error));
}

// Curated catalogues reference canonical puzzle IDs. All Puzzles remains a
// derived runtime view and is deliberately absent from this registry.
const catalogueIds = new Set();
const catalogueSlugs = new Map();
for (const [index, catalogue] of CATALOGUES.entries()) {
  const label = `catalogues[${index}]`;
  validateCatalogueContent(catalogue, { puzzleIds: allPuzzleIds })
    .forEach(error => fail(label, error));
  if (catalogue?.id === "all") {
    fail(label, 'id "all" is reserved for the derived All Puzzles catalogue');
  }
  if (catalogue?.id) {
    if (catalogueIds.has(catalogue.id)) fail(label, `duplicate id "${catalogue.id}"`);
    catalogueIds.add(catalogue.id);
    const normalized = slugify(catalogue.id);
    if (normalized !== catalogue.id) {
      fail(label, `id "${catalogue.id}" must already be a URL-safe slug`);
    }
    const owner = catalogueSlugs.get(normalized);
    if (owner) {
      fail(label, `id collides with "${owner}" after normalization ("${normalized}")`);
    } else {
      catalogueSlugs.set(normalized, catalogue.id);
    }
  }
  for (const [entryIndex, entry] of (catalogue?.entries || []).entries()) {
    const count = puzzleIdCounts.get(entry?.id) || 0;
    if (entry?.id && count !== 1) {
      fail(`${label}.entries[${entryIndex}]`, `"${entry.id}" resolves to ${count} puzzles instead of exactly one`);
    }
  }
}

// Category metadata is additive, but registered names must be in use and
// every derived URL slug must remain unambiguous.
const usedCategories = new Set(PUZZLES.flatMap(categoriesForPuzzle));
for (const [name, entry] of Object.entries(CATEGORIES)) {
  validateInfo(entry.info, "info")
    .forEach(error => fail(`categories.js:"${name}"`, error));
  if (!usedCategories.has(name)) {
    fail(`categories.js:"${name}"`, "registered but no puzzle uses this exact category string (typo?)");
  }
  if (entry.domain !== undefined && !Object.hasOwn(DOMAINS, entry.domain)) {
    fail(`categories.js:"${name}"`, `domain "${entry.domain}" is not a registered domain`);
  }
}
validateSubcategoryAssignments(PUZZLES, CATEGORIES)
  .forEach(error => fail(error.scope, error.message));
const categorySlugOwners = new Map();
for (const name of usedCategories) {
  const slug = categorySlugFor(name);
  const owner = categorySlugOwners.get(slug);
  if (owner) {
    fail("categories.js", `"${name}" and "${owner}" both resolve to the same ?category= slug ("${slug}")`);
  } else {
    categorySlugOwners.set(slug, name);
  }
}

for (const id of SHOWCASE_PUZZLE_IDS) {
  if (!allPuzzleIds.has(id)) fail("showcase.js", `"${id}" is not a real puzzle id`);
}

for (const [puzzleId, layout] of Object.entries(STAR_LAYOUTS)) {
  const puzzle = PUZZLES.find(candidate => candidate.id === puzzleId);
  if (!puzzle) {
    fail(`star layout:"${puzzleId}"`, "does not match a real puzzle id");
    continue;
  }
  validateStarLayoutDocument(layout, puzzle).errors
    .forEach(error => fail(`star layout:"${puzzleId}"`, error));
}

console.log(ok ? `ALL CHECKS PASSED (${PUZZLES.length} puzzles)` : "CHECKS FAILED");
process.exit(ok ? 0 : 1);
