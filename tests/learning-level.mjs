import assert from "node:assert/strict";
import { PUZZLE_LEVELS, puzzleLevel } from "../puzzles/categories.js";
import { validatePuzzleContent } from "../modules/contentValidation.js";
import { validateCatalogueCreation } from "../modules/catalogueValidation.js";
import {
  LEVEL_CATALOGUE_ID_PREFIX,
  catalogueById,
  levelCatalogue,
  levelCatalogues,
  libraryCatalogues,
  puzzlesForCatalogue
} from "../modules/catalogueRegistry.js";
import { puzzleFromSimplified, SimplifiedPuzzleInputSchema } from "../modules/simplifiedPuzzleSchema.js";
import { puzzleToSimplified } from "../modules/puzzleSimplified.js";
import { puzzleFromJsonLd, puzzleToJsonLd } from "../modules/puzzleJsonLd.js";
import { PUZZLES } from "../puzzles/index.js";

export const name = "learning level: opt-in field and its auto-catalogues";

function minimalPuzzle(overrides = {}) {
  return {
    id: "level-fixture",
    title: "Level Fixture",
    category: "Science",
    clusters: [
      {
        id: "alpha",
        name: "Alpha",
        color: "teal",
        fact: "Alpha fact.",
        terms: ["a", "b", "c"],
        seeds: ["a", "b"]
      },
      {
        id: "beta",
        name: "Beta",
        color: "blue",
        fact: "Beta fact.",
        terms: ["d", "e", "f"],
        seeds: ["d", "e"]
      }
    ],
    bridges: [],
    ...overrides
  };
}

export async function run() {
  // --- puzzleLevel() -----------------------------------------------
  assert.equal(puzzleLevel({ level: "introductory" }), "introductory");
  assert.equal(puzzleLevel({ level: "expert" }), null, "unrecognized value doesn't count");
  assert.equal(puzzleLevel({}), null, "unset is null, not a fourth level");
  assert.equal(puzzleLevel(null), null);

  // --- contentValidation.js -----------------------------------------
  assert.deepEqual(
    validatePuzzleContent(minimalPuzzle(), { knownPuzzleIds: new Set(["level-fixture"]) }),
    []
  );
  for (const level of PUZZLE_LEVELS) {
    assert.deepEqual(
      validatePuzzleContent(minimalPuzzle({ level }), { knownPuzzleIds: new Set(["level-fixture"]) }),
      [],
      level
    );
  }
  assert.ok(
    validatePuzzleContent(
      minimalPuzzle({ level: "expert" }),
      { knownPuzzleIds: new Set(["level-fixture"]) }
    ).some(error => error.includes("level")),
    "an unrecognized level should fail validation"
  );

  // --- simplified-schema round trip (MCP authoring path) -------------
  const simplifiedInput = SimplifiedPuzzleInputSchema.parse({
    id: "level-fixture",
    title: "Level Fixture",
    category: "Science",
    level: "introductory",
    clusters: [
      { name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
      { name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
    ],
    bridges: []
  });
  assert.equal(simplifiedInput.level, "introductory");
  assert.throws(() => SimplifiedPuzzleInputSchema.parse({
    id: "level-fixture-bad",
    title: "Bad",
    category: "Science",
    level: "expert",
    clusters: [
      { name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
      { name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
    ],
    bridges: []
  }), "an unrecognized level should fail schema parsing");

  const fromSimplified = puzzleFromSimplified(simplifiedInput);
  assert.equal(fromSimplified.level, "introductory");
  const backToSimplified = puzzleToSimplified(fromSimplified);
  assert.equal(backToSimplified.level, "introductory");

  // --- JSON-LD interchange round trip ---------------------------------
  const withLevel = minimalPuzzle({ level: "advanced" });
  const document = puzzleToJsonLd(withLevel);
  assert.equal(document.level, "advanced");
  const backFromJsonLd = puzzleFromJsonLd(document);
  assert.equal(backFromJsonLd.level, "advanced");
  const withoutLevel = puzzleToJsonLd(minimalPuzzle());
  assert.equal(withoutLevel.level, undefined, "omitted level stays omitted, not a default");

  // --- catalogueRegistry.js: synthesis, emptiness, ordering -----------
  const puzzlesNoLevels = [minimalPuzzle({ id: "p1" }), minimalPuzzle({ id: "p2" })];
  for (const level of PUZZLE_LEVELS) {
    assert.equal(levelCatalogue(level, puzzlesNoLevels), null, `${level}: no members yet`);
  }
  assert.deepEqual(levelCatalogues(puzzlesNoLevels), []);
  assert.equal(catalogueById(`${LEVEL_CATALOGUE_ID_PREFIX}introductory`, puzzlesNoLevels), null);
  assert.equal(catalogueById("level-not-a-real-level", puzzlesNoLevels), null);

  const mixedPuzzles = [
    minimalPuzzle({ id: "p1", level: "introductory" }),
    minimalPuzzle({ id: "p2", level: "introductory" }),
    minimalPuzzle({ id: "p3", level: "advanced" }),
    minimalPuzzle({ id: "p4" }) // unset
  ];
  const introCatalogue = levelCatalogue("introductory", mixedPuzzles);
  assert.equal(introCatalogue.id, "level-introductory");
  assert.equal(introCatalogue.title, "Introductory Puzzles");
  assert.equal(introCatalogue.ordered, false);
  assert.deepEqual(introCatalogue.entries.map(entry => entry.id), ["p1", "p2"]);
  assert.equal(levelCatalogue("intermediate", mixedPuzzles), null, "no intermediate members");

  // Fixed order (introductory, intermediate, advanced), not insertion/
  // count order -- only the two levels with members appear.
  assert.deepEqual(
    levelCatalogues(mixedPuzzles).map(catalogue => catalogue.id),
    ["level-introductory", "level-advanced"]
  );

  // Resolves the same way through catalogueById as any URL-driven lookup.
  const resolvedByUrl = catalogueById("level-introductory", mixedPuzzles);
  assert.deepEqual(resolvedByUrl.entries.map(entry => entry.id), ["p1", "p2"]);
  assert.deepEqual(
    puzzlesForCatalogue(resolvedByUrl, mixedPuzzles).map(puzzle => puzzle.id),
    ["p1", "p2"]
  );

  // libraryCatalogues includes non-empty level catalogues alongside All/
  // New Puzzles; an empty level is simply absent, not an empty card.
  const libraryIds = libraryCatalogues(mixedPuzzles, []).map(catalogue => catalogue.id);
  assert.ok(libraryIds.includes("level-introductory"));
  assert.ok(libraryIds.includes("level-advanced"));
  assert.ok(!libraryIds.includes("level-intermediate"));

  // --- reserved id: an authored catalogue can never collide -----------
  const reservedAttempt = validateCatalogueCreation(
    { id: "level-introductory", title: "Sneaky", entries: [{ id: "p1" }] },
    { puzzles: mixedPuzzles, catalogues: [] }
  );
  assert.equal(reservedAttempt.valid, false);
  assert.ok(reservedAttempt.errors.some(error => error.includes("reserved")));

  // --- real corpus: level catalogues reflect whatever has opted in -------
  const corpusLevels = new Set(PUZZLES.map(puzzle => puzzleLevel(puzzle)).filter(Boolean));
  assert.deepEqual(
    levelCatalogues(PUZZLES).map(catalogue => catalogue.id),
    PUZZLE_LEVELS.filter(level => corpusLevels.has(level)).map(level => `level-${level}`)
  );
}
