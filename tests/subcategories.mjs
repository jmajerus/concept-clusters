import assert from "node:assert/strict";
import {
  puzzleBelongsToSubcategory,
  puzzlesForSubcategory,
  resolveSubcategory,
  subcategoriesForPuzzleSet,
  subcategoryForPuzzle,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import { puzzlesForCatalogueSubcategory } from "../modules/catalogueRegistry.js";
import { validateSubcategoryAssignments } from "../modules/categoryValidation.js";
import { PUZZLES } from "../puzzles/index.js";

export const name = "subcategories: progressive subject navigation and category-relative context";

async function waitForOverview(page, title) {
  await page.waitForFunction(expected =>
    document.querySelector("#puzzle-overview")?.classList.contains("shown") &&
    document.getElementById("overview-title")?.textContent === expected,
  title);
}

async function waitForPuzzle(page, id) {
  await page.waitForFunction(expected =>
    window.CC?.state?.puzzle?.id === expected &&
    !document.querySelector("#puzzle-view")?.classList.contains("hidden"),
  id);
}

export async function run(page, baseURL) {
  const visualIds = [
    "how-a-picture-directs-the-eye",
    "the-work-of-color"
  ];
  const interpretationIds = [
    "where-meaning-comes-from",
    "why-art-changes-what-it-sees"
  ];
  const artPuzzles = PUZZLES.filter(puzzle => puzzle.category === "Art");

  assert.deepEqual(
    subcategoriesForPuzzleSet(artPuzzles, "Art")
      .map(({ id, count }) => ({ id, count })),
    [
      { id: "visual-form", count: 2 },
      { id: "representation-and-interpretation", count: 2 }
    ]
  );
  assert.deepEqual(
    puzzlesForSubcategory(artPuzzles, "Art", "visual-form")
      .map(puzzle => puzzle.id),
    visualIds
  );
  assert.equal(
    subcategoryIdForPuzzle(artPuzzles[0], "Art"),
    "visual-form"
  );
  assert.equal(subcategoryForPuzzle(artPuzzles[0], "Art").title, "Visual Form");
  assert.equal(
    resolveSubcategory("representation-and-interpretation", [artPuzzles[0]], "Art"),
    null,
    "an unrepresented registered subcategory should stay hidden in a filtered set"
  );

  const computerSciencePuzzles = PUZZLES.filter(puzzle =>
    (puzzle.categories || [puzzle.category]).includes("Computer Science")
  );
  const computingAndSocietyIds = [
    "the-webs-bargain",
    "choice-under-influence",
    "the-hidden-transaction",
    "manufactured-pressure",
    "control-and-exit",
    "after-the-click",
    "when-manipulation-becomes-normal",
    "restoring-honest-choice"
  ];
  const artificialIntelligenceIds = [
    "learning-from-examples",
    "neural-networks-layer-by-layer",
    "how-language-models-generate-text"
  ];
  const programmingLanguageIds = [
    "language-design-choices",
    "research-languages-and-future-directions",
    "from-research-language-to-production",
    "designing-for-programmer-ergonomics",
    "where-failures-stop"
  ];
  const bioinformaticsIds = [
    "when-biology-becomes-data",
    "aligning-biological-sequences",
    "reproducible-bioinformatics-workflows"
  ];
  assert.deepEqual(
    subcategoriesForPuzzleSet(computerSciencePuzzles, "Computer Science")
      .map(({ id, count }) => ({ id, count })),
    [
      { id: "artificial-intelligence", count: 3 },
      { id: "bioinformatics", count: 3 },
      { id: "computing-and-society", count: 8 },
      { id: "programming-languages", count: 5 }
    ]
  );
  assert.deepEqual(
    puzzlesForSubcategory(
      computerSciencePuzzles,
      "Computer Science",
      "bioinformatics"
    ).map(puzzle => puzzle.id),
    bioinformaticsIds
  );
  assert.deepEqual(
    puzzlesForSubcategory(
      computerSciencePuzzles,
      "Computer Science",
      "programming-languages"
    ).map(puzzle => puzzle.id),
    programmingLanguageIds
  );
  assert.deepEqual(
    puzzlesForSubcategory(
      computerSciencePuzzles,
      "Computer Science",
      "artificial-intelligence"
    ).map(puzzle => puzzle.id),
    artificialIntelligenceIds
  );
  assert.deepEqual(
    puzzlesForSubcategory(
      computerSciencePuzzles,
      "Computer Science",
      "computing-and-society"
    ).map(puzzle => puzzle.id),
    computingAndSocietyIds
  );
  assert.deepEqual(
    puzzlesForSubcategory(computerSciencePuzzles, "Computer Science", "other")
      .map(puzzle => puzzle.id),
    ["the-web-canon", "the-programmers-bargain"]
  );

  const biologyPuzzles = PUZZLES.filter(puzzle =>
    (puzzle.categories || [puzzle.category]).includes("Biology")
  );
  const genomicsIds = [
    "from-dna-to-gene-expression",
    "from-reads-to-a-genome",
    "reading-genetic-variation"
  ];
  const foundationIds = [
    "inside-the-cell",
    "cell-division-and-inheritance",
    "how-populations-evolve"
  ];
  assert.deepEqual(
    subcategoriesForPuzzleSet(biologyPuzzles, "Biology")
      .map(({ id, count }) => ({ id, count })),
    [
      { id: "foundations", count: 3 },
      { id: "genomics", count: 3 },
      { id: "bioinformatics", count: 3 }
    ]
  );
  assert.deepEqual(
    puzzlesForSubcategory(biologyPuzzles, "Biology", "foundations")
      .map(puzzle => puzzle.id),
    foundationIds
  );
  assert.deepEqual(
    puzzlesForSubcategory(biologyPuzzles, "Biology", "genomics")
      .map(puzzle => puzzle.id),
    genomicsIds
  );
  assert.deepEqual(
    puzzlesForSubcategory(biologyPuzzles, "Biology", "bioinformatics")
      .map(puzzle => puzzle.id),
    bioinformaticsIds
  );

  const multidisciplinary = {
    category: "First",
    categories: ["First", "Second"],
    subcategories: { First: "one", Second: "two" }
  };
  assert.equal(subcategoryIdForPuzzle(multidisciplinary, "First"), "one");
  assert.equal(subcategoryIdForPuzzle(multidisciplinary, "Second"), "two");
  assert.equal(puzzleBelongsToSubcategory(multidisciplinary, "First", "two"), false);

  const validationMessages = validateSubcategoryAssignments([
    {
      id: "bad-assignment",
      category: "Subject",
      subcategories: { "Not a membership": "missing" }
    }
  ], {
    Subject: {
      subcategories: {
        all: { title: "Reserved" },
        "Not URL Safe": { title: "" }
      }
    }
  }).map(error => error.message).join("\n");
  assert.match(validationMessages, /reserved/);
  assert.match(validationMessages, /URL-safe/);
  assert.match(validationMessages, /title must be a non-empty string/);
  assert.match(validationMessages, /not one of this puzzle's categories/);

  const tinyCatalogue = {
    id: "tiny-art",
    entries: [
      { id: visualIds[0] },
      { id: interpretationIds[0] }
    ]
  };
  assert.deepEqual(
    puzzlesForCatalogueSubcategory(
      tinyCatalogue,
      "Art",
      "visual-form",
      PUZZLES
    ).map(puzzle => puzzle.id),
    [visualIds[0]]
  );

  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  // Categories without represented subcategories retain their direct list.
  await page.goto(`${baseURL}/index.html?category=science`);
  await waitForOverview(page, "Science");
  assert.equal(await page.locator(".subcategory-card").count(), 0);
  assert.ok(await page.locator("#overview-list [data-puzzle-id]").count() > 0);

  // Art progressively reveals one intermediate level, including a generated
  // All partition, but no duplicate puzzle cards on the parent screen.
  await page.goto(`${baseURL}/index.html?category=art`);
  await waitForOverview(page, "Art");
  assert.equal(await page.locator("#overview-list [data-puzzle-id]").count(), 0);
  const cards = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".subcategory-card")).map(card => ({
      id: card.dataset.subcategory,
      title: card.querySelector("strong").textContent,
      count: Number(card.querySelector(".card-count").textContent.match(/\d+/)[0])
    }))
  );
  assert.deepEqual(cards, [
    { id: "all", title: "All Art puzzles", count: 4 },
    { id: "visual-form", title: "Visual Form", count: 2 },
    {
      id: "representation-and-interpretation",
      title: "Representation & Interpretation",
      count: 2
    }
  ]);

  await page.locator('[data-subcategory="visual-form"]').click();
  await waitForOverview(page, "Visual Form");
  assert.equal(new URL(page.url()).searchParams.get("category"), "art");
  assert.equal(new URL(page.url()).searchParams.get("subcategory"), "visual-form");
  assert.deepEqual(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    ),
    visualIds
  );
  assert.match(
    (await page.textContent("#context-nav")).replace(/\s+/g, " "),
    /Library.*All Puzzles.*Art.*Visual Form/
  );

  await page.click("#overview-share-btn");
  await page.waitForFunction(() =>
    document.getElementById("overview-share-status").textContent.length > 0
  );
  const overviewShare = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  assert.equal(overviewShare.searchParams.get("category"), "art");
  assert.equal(overviewShare.searchParams.get("subcategory"), "visual-form");

  await page.locator(`[data-puzzle-id="${visualIds[0]}"]`).click();
  await waitForPuzzle(page, visualIds[0]);
  assert.equal(new URL(page.url()).searchParams.get("subcategory"), "visual-form");
  assert.match(await page.textContent("#back-to-catalogue"), /Back to Visual Form/);
  assert.match(
    (await page.textContent("#context-nav")).replace(/\s+/g, " "),
    /Art.*Visual Form/
  );

  await page.click("#share-puzzle");
  await page.waitForFunction(() =>
    document.getElementById("share-status").textContent.length > 0
  );
  const puzzleShare = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  assert.equal(puzzleShare.searchParams.has("catalogue"), false);
  assert.equal(puzzleShare.searchParams.get("category"), "art");
  assert.equal(puzzleShare.searchParams.get("subcategory"), "visual-form");

  // Picker navigation keeps the valid parent subject but drops a subcategory
  // that does not contain the new puzzle.
  const interpretationIndex = PUZZLES.findIndex(
    puzzle => puzzle.id === interpretationIds[0]
  );
  await page.selectOption("#puzzle-picker", String(interpretationIndex));
  await waitForPuzzle(page, interpretationIds[0]);
  assert.equal(new URL(page.url()).searchParams.get("category"), "art");
  assert.equal(new URL(page.url()).searchParams.has("subcategory"), false);

  // Invalid routes fall back to the nearest valid parent rather than leaving
  // the subject or selecting an arbitrary puzzle.
  await page.goto(`${baseURL}/index.html?category=art&subcategory=not-real`);
  await waitForOverview(page, "Art");
  await page.goto(
    `${baseURL}/index.html?puzzle=${visualIds[0]}&category=art&subcategory=representation-and-interpretation`
  );
  await waitForPuzzle(page, visualIds[0]);
  assert.match(await page.textContent("#context-nav"), /Art/);
  assert.doesNotMatch(await page.textContent("#context-nav"), /Representation & Interpretation/);

  // All is a generated route, and browser history retains every level.
  await page.goto(`${baseURL}/index.html?category=art`);
  await waitForOverview(page, "Art");
  await page.locator('[data-subcategory="all"]').click();
  await waitForOverview(page, "All Art puzzles");
  assert.equal(await page.locator("#overview-list [data-puzzle-id]").count(), 4);
  await page.locator(`[data-puzzle-id="${visualIds[0]}"]`).click();
  await waitForPuzzle(page, visualIds[0]);
  await page.goBack();
  await waitForOverview(page, "All Art puzzles");
  await page.goBack();
  await waitForOverview(page, "Art");
  await page.goForward();
  await waitForOverview(page, "All Art puzzles");

  await page.setViewportSize({ width: 320, height: 700 });
  await page.locator(`[data-puzzle-id="${visualIds[0]}"]`).click();
  await waitForPuzzle(page, visualIds[0]);
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "subcategory puzzle breadcrumbs should not overflow a 320px viewport"
  );

  // The Other partition is generated only when this active set has an
  // unassigned puzzle. Mutating one in the isolated browser page exercises
  // gradual adoption without weakening the authored Art taxonomy.
  await page.evaluate(id => {
    delete CC.PUZZLES.find(puzzle => puzzle.id === id).subcategories.Art;
    history.pushState({}, "", "?category=art");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, visualIds[0]);
  await waitForOverview(page, "Art");
  assert.match(
    await page.locator('[data-subcategory="other"]').textContent(),
    /Other Art puzzles.*1 puzzle/s
  );
  await page.locator('[data-subcategory="other"]').click();
  await waitForOverview(page, "Other Art puzzles");
  assert.deepEqual(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    ),
    [visualIds[0]]
  );

  // A subcategory selection screen offering only one real choice is a
  // redundant extra click -- see subcategoryGroups in overviewRenderer.js.
  // Every Art puzzle sharing the one subcategory it was just reassigned
  // to above, with nothing left untagged, collapses to a single group:
  // the screen should skip straight to the flat puzzle list instead of
  // showing one lonely subcategory card next to a synthetic "All" card
  // that would list the exact same puzzles.
  await page.evaluate(ids => {
    for (const id of ids) {
      const puzzle = CC.PUZZLES.find(candidate => candidate.id === id);
      puzzle.subcategories = { ...puzzle.subcategories, Art: "visual-form" };
    }
    history.pushState({}, "", "?category=art");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [...visualIds, ...interpretationIds]);
  await waitForOverview(page, "Art");
  assert.equal(await page.locator('[data-subcategory]').count(), 0);
  assert.deepEqual(
    (await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    )).sort(),
    [...visualIds, ...interpretationIds].sort()
  );

  // Real-world anchor for the same collapse, one card list up: a
  // catalogue-category combination with exactly one member puzzle offers
  // no subcategory choice either, regardless of whether that puzzle has
  // a subcategory at all.
  await page.goto(`${baseURL}/index.html?catalogue=disentanglements&category=philosophy`);
  await waitForOverview(page, "Philosophy");
  assert.equal(await page.locator('[data-subcategory]').count(), 0);
  assert.deepEqual(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    ),
    ["freedom-from-freedom-to"]
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
