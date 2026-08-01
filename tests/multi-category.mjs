import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { categoriesForPuzzle } from "../puzzles/categories.js";

export const name = "categories: multiple membership and catalogue intersections";

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

function puzzle(id) {
  return PUZZLES.find(candidate => candidate.id === id);
}

export async function run(page, baseURL) {
  assert.deepEqual(
    categoriesForPuzzle(puzzle("after-the-click")),
    ["Philosophy & Social Science", "Computer Science"]
  );
  assert.deepEqual(
    categoriesForPuzzle(puzzle("when-manipulation-becomes-normal")),
    ["Business & Organizations", "Computer Science"]
  );

  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  // A secondary category includes the puzzle exactly once and exposes both
  // its other disciplinary home and its curated catalogue membership.
  await page.goto(`${baseURL}/index.html?category=computer-science`);
  await waitForOverview(page, "Computer Science");
  const computerScienceIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
      .map(card => card.dataset.puzzleId)
  );
  assert.equal(
    computerScienceIds.filter(id => id === "after-the-click").length,
    1
  );
  assert.equal(
    computerScienceIds.filter(id => id === "when-manipulation-becomes-normal").length,
    1
  );

  const afterCard = page.locator('[data-puzzle-id="after-the-click"]');
  assert.match(await afterCard.textContent(), /Philosophy & Social Science/);
  assert.match(await afterCard.textContent(), /Dark Patterns/);
  assert.equal(
    await afterCard.locator(".badge-category-membership").count(),
    1
  );
  assert.equal(
    await afterCard.locator(".badge-catalogue-membership").count(),
    1
  );

  const darkPatternsIntersection = page.locator(
    '.catalogue-intersection-card[data-catalogue-id="dark-patterns"]'
  );
  assert.equal(await darkPatternsIntersection.isVisible(), true);
  assert.match(await darkPatternsIntersection.textContent(), /7 puzzles here/);

  // Following the intersection keeps both the catalogue and secondary
  // category in the URL and filters the catalogue through that category.
  await darkPatternsIntersection.click();
  await waitForOverview(page, "Computer Science");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "dark-patterns");
  assert.equal(new URL(page.url()).searchParams.get("category"), "computer-science");
  assert.equal(
    await page.locator("#overview-list [data-puzzle-id]").count(),
    7
  );

  // The catalogue currently being browsed remains visible as an explicit
  // intersection rather than causing this section to disappear.
  const currentDarkPatterns = page.locator(
    '.catalogue-intersection-card[data-catalogue-id="dark-patterns"]'
  );
  assert.equal(await currentDarkPatterns.getAttribute("data-current"), "true");
  assert.match(
    await currentDarkPatterns.textContent(),
    /7 puzzles here.*Full catalogue/s
  );
  assert.match(
    await page.locator("#overview-list").textContent(),
    /Catalogue intersections/
  );

  await page.locator('[data-puzzle-id="after-the-click"]').click();
  await waitForPuzzle(page, "after-the-click");
  assert.match(
    (await page.textContent("#context-nav")).replace(/\s+/g, " "),
    /Dark Patterns.*Computer Science/
  );

  // The new primary category also shows the Computer Science intersection
  // and the Dark Patterns learning sequence from within its own overview.
  await page.goto(`${baseURL}/index.html?category=business-organizations`);
  await waitForOverview(page, "Business & Organizations");
  const normalCard = page.locator(
    '[data-puzzle-id="when-manipulation-becomes-normal"]'
  );
  assert.equal(await normalCard.isVisible(), true);
  assert.match(await normalCard.textContent(), /Computer Science/);
  assert.match(await normalCard.textContent(), /Dark Patterns/);
  assert.match(
    await page.locator(
      '.catalogue-intersection-card[data-catalogue-id="dark-patterns"]'
    ).textContent(),
    /2 puzzles here/
  );

  // The single-intersection Business category still shows the section when
  // entered through Dark Patterns, marking that catalogue as current.
  await page.goto(
    `${baseURL}/index.html?catalogue=dark-patterns&category=business-organizations`
  );
  await waitForOverview(page, "Business & Organizations");
  const currentBusinessCatalogue = page.locator(
    '.catalogue-intersection-card[data-catalogue-id="dark-patterns"]'
  );
  assert.equal(await currentBusinessCatalogue.isVisible(), true);
  assert.equal(
    await currentBusinessCatalogue.getAttribute("data-current"),
    "true"
  );
  assert.match(
    await currentBusinessCatalogue.textContent(),
    /2 puzzles here.*Full catalogue/s
  );

  // Primary-category browsing remains intact for the same canonical puzzle.
  await page.goto(`${baseURL}/index.html?category=philosophy-social-science`);
  await waitForOverview(page, "Philosophy & Social Science");
  assert.equal(
    await page.locator('[data-puzzle-id="after-the-click"]').count(),
    1
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
