import assert from "node:assert/strict";
import { DOMAINS, domainForCategory, categoriesForPuzzle } from "../puzzles/categories.js";
import { validateCatalogueCreation } from "../modules/catalogueValidation.js";
import { isReservedCatalogueId } from "../modules/contentDocumentSeed.js";
import {
  DOMAIN_CATALOGUE_ID_PREFIX,
  catalogueById,
  categoriesForCatalogue,
  domainCatalogue,
  domainCatalogues,
  isDerivedCatalogueId,
  libraryCatalogues,
  primaryCategoryInCatalogue,
  puzzlesForCatalogue,
  reservedCatalogueIdError
} from "../modules/catalogueRegistry.js";
import { PUZZLES } from "../puzzles/index.js";

export const name = "domain catalogues: All Puzzles filtered by domain, derived like level-*";

function fixture(id, category, categories) {
  return {
    id,
    title: id,
    category,
    ...(categories ? { categories } : {}),
    clusters: [],
    bridges: []
  };
}

export async function run() {
  // Science → sciences-mathematics, Philosophy → humanities, Psychology →
  // social-sciences, Trivia → no domain (see tests/domains.mjs).
  const puzzles = [
    fixture("sci-1", "Science"),
    fixture("phil-1", "Philosophy"),
    // Primary category in one domain, cross-listed into another: a member
    // of both domain catalogues, by the same mechanism it belongs to both
    // categories.
    fixture("cross-1", "Psychology", ["Psychology", "Philosophy"]),
    fixture("trivia-1", "Trivia")
  ];

  // --- synthesis ---------------------------------------------------------
  const humanities = domainCatalogue("humanities", puzzles);
  assert.equal(humanities.id, "domain-humanities");
  assert.equal(humanities.title, DOMAINS.humanities.title);
  assert.equal(humanities.info, DOMAINS.humanities.info, "card copy is the domain's own");
  assert.equal(humanities.domain, "humanities");
  assert.equal(humanities.ordered, false);
  assert.deepEqual(humanities.entries.map(entry => entry.id), ["phil-1", "cross-1"]);

  const social = domainCatalogue("social-sciences", puzzles);
  assert.deepEqual(social.entries.map(entry => entry.id), ["cross-1"]);

  // Empty and unknown domains are absent, not empty cards; domain-less
  // puzzles get no "other" catalogue.
  assert.equal(domainCatalogue("art-design", puzzles), null);
  assert.equal(domainCatalogue("not-a-domain", puzzles), null);
  assert.equal(catalogueById("domain-other", puzzles), null);
  assert.equal(catalogueById("domain-", puzzles), null);

  // Alphabetical by title, non-empty only.
  assert.deepEqual(
    domainCatalogues(puzzles).map(catalogue => catalogue.id),
    ["domain-humanities", "domain-sciences-mathematics", "domain-social-sciences"]
  );

  // --- resolves like any URL-driven lookup ----------------------------------
  const byUrl = catalogueById(`${DOMAIN_CATALOGUE_ID_PREFIX}humanities`, puzzles);
  assert.deepEqual(
    puzzlesForCatalogue(byUrl, puzzles).map(puzzle => puzzle.id),
    ["phil-1", "cross-1"]
  );

  // --- subject partition scoped to the domain --------------------------------
  // cross-1's Psychology membership is how it got into Social Sciences; it
  // must not drag a Psychology card into the Humanities catalogue.
  assert.deepEqual(categoriesForCatalogue(humanities, puzzles), ["Philosophy"]);
  assert.deepEqual(categoriesForCatalogue(social, puzzles), ["Psychology"]);
  // A non-domain catalogue is unaffected: every member category, as before.
  const curated = { id: "c", title: "C", entries: [{ id: "cross-1" }] };
  assert.deepEqual(categoriesForCatalogue(curated, puzzles), ["Philosophy", "Psychology"]);

  // The category a puzzle files under follows the same scoping, so the
  // puzzle route, breadcrumb, and grouped list agree with the partition.
  const cross = puzzles[2];
  assert.equal(primaryCategoryInCatalogue(humanities, cross), "Philosophy");
  assert.equal(primaryCategoryInCatalogue(social, cross), "Psychology");
  assert.equal(primaryCategoryInCatalogue(curated, cross), "Psychology", "primary outside a domain");
  assert.equal(primaryCategoryInCatalogue(humanities, puzzles[0]), null, "non-member has no category here");

  // --- Library placement -------------------------------------------------------
  const libraryIds = libraryCatalogues(puzzles, [curated]).map(catalogue => catalogue.id);
  assert.deepEqual(libraryIds, [
    "all", "new",
    "domain-humanities", "domain-sciences-mathematics", "domain-social-sciences",
    "c"
  ]);

  // --- reserved id: shared rule, one source of truth ------------------------------
  for (const id of ["all", "new", "level-introductory", "domain-humanities", "domain-anything"]) {
    assert.ok(isDerivedCatalogueId(id), id);
    assert.ok(isReservedCatalogueId(id), `${id} has no stored document`);
    assert.match(reservedCatalogueIdError(id), /reserved/);
  }
  for (const id of ["getting-started", "domains", "level", "", null, undefined]) {
    assert.ok(!isDerivedCatalogueId(id), String(id));
  }
  const attempt = validateCatalogueCreation(
    { id: "domain-humanities", title: "Sneaky", entries: [{ id: "phil-1" }] },
    { puzzles, catalogues: [] }
  );
  assert.equal(attempt.valid, false);
  assert.ok(attempt.errors.some(error => error.includes("domain-") && error.includes("reserved")));

  // --- real corpus --------------------------------------------------------------
  // Every registered domain with at least one category in play has a
  // catalogue; each member has a category in that domain; no member is
  // domain-less.
  const corpus = domainCatalogues(PUZZLES);
  const representedDomains = new Set(
    PUZZLES.flatMap(puzzle => categoriesForPuzzle(puzzle))
      .map(name => domainForCategory(name))
      .filter(Boolean)
  );
  assert.deepEqual(
    new Set(corpus.map(catalogue => catalogue.domain)),
    representedDomains
  );
  for (const catalogue of corpus) {
    for (const puzzle of puzzlesForCatalogue(catalogue, PUZZLES)) {
      assert.ok(
        categoriesForPuzzle(puzzle).some(name => domainForCategory(name) === catalogue.domain),
        `${puzzle.id} in ${catalogue.id}`
      );
    }
    for (const category of categoriesForCatalogue(catalogue, PUZZLES)) {
      assert.equal(domainForCategory(category), catalogue.domain, `${category} in ${catalogue.id}`);
    }
  }
}
