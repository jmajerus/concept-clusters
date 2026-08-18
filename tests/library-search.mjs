import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { CATALOGUES } from "../catalogues/index.js";
import {
  matchingCatalogues,
  rankedPuzzleMatches
} from "../modules/librarySearch.js";
import { libraryCatalogues } from "../modules/catalogueRegistry.js";

export const name = "library search: filters by title/category/tag/subcategory/terms, catalogues, navigates, resets";

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

async function resultPuzzleIds(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
      .map(card => card.dataset.puzzleId)
  );
}

async function resultCatalogueIds(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list [data-catalogue-id]"))
      .map(card => card.dataset.catalogueId)
  );
}

async function fillSearch(page, query, libraryCount) {
  await page.fill("#overview-search-input", query);
  await page.waitForFunction(({ q, count }) => {
    const input = document.getElementById("overview-search-input");
    if (input?.value !== q) return false;
    if (!q) {
      return document.querySelectorAll("#overview-list .catalogue-card").length === count &&
        document.querySelectorAll("#overview-list [data-puzzle-id]").length === 0;
    }
    return !!document.querySelector("#overview-list .overview-empty-state") ||
      document.querySelectorAll("#overview-list [data-puzzle-id]").length > 0 ||
      !!document.querySelector(".search-result-heading") ||
      document.querySelectorAll("#overview-list .catalogue-card").length !== count;
  }, { q: query, count: libraryCount });
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");

  // The search box exists only on the Library screen, starts empty, and
  // the normal catalogue-card list is what's showing by default.
  assert.equal(await page.locator("#overview-search").isVisible(), true);
  assert.equal(await page.inputValue("#overview-search-input"), "");
  const libraryCount = libraryCatalogues(PUZZLES, CATALOGUES).length;
  assert.equal(await page.locator("#overview-list .catalogue-card").count(), libraryCount);

  // Typing a title fragment (any case) swaps in matching puzzle cards --
  // and any catalogues that also match -- computed against the live
  // matching helpers so this isn't pinned to specific puzzle content.
  const fragment = PUZZLES[0].title.slice(0, 5).toUpperCase();
  await fillSearch(page, fragment, libraryCount);
  assert.deepEqual(
    await resultPuzzleIds(page),
    rankedPuzzleMatches(PUZZLES, fragment).map(puzzle => puzzle.id)
  );
  assert.deepEqual(
    await resultCatalogueIds(page),
    matchingCatalogues(PUZZLES, CATALOGUES, fragment).map(catalogue => catalogue.id)
  );

  // A category-name query surfaces puzzles via categoriesForPuzzle even
  // when that word never appears in the title -- not just a title match.
  await fillSearch(page, "geography", libraryCount);
  const geoIds = await resultPuzzleIds(page);
  assert.ok(geoIds.includes("climate-and-livelihoods"));
  const climateCardText = await page.textContent('[data-puzzle-id="climate-and-livelihoods"] strong');
  assert.doesNotMatch(climateCardText, /geography/i);

  // Clicking a result navigates to that puzzle, in the "All Puzzles"
  // context (a search result has no single owning catalogue/category).
  await page.locator('[data-puzzle-id="climate-and-livelihoods"]').click();
  await waitForPuzzle(page, "climate-and-livelihoods");
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "all");

  // Re-entering Library (via Back) resets the search: empty input, the
  // normal catalogue list, not the stale filtered results.
  await page.goBack();
  await waitForOverview(page, "Library");
  assert.equal(await page.inputValue("#overview-search-input"), "");
  assert.equal(await page.locator("#overview-list .catalogue-card").count(), libraryCount);

  // A tag query surfaces tagged puzzles through the exact same search
  // box a title/category query uses -- no special "tag=" syntax.
  await fillSearch(page, "book", libraryCount);
  const expectedBookIds = PUZZLES
    .filter(puzzle => puzzle.tags?.includes("book"))
    .map(puzzle => puzzle.id);
  const bookIds = await resultPuzzleIds(page);
  assert.ok(expectedBookIds.every(id => bookIds.includes(id)));
  assert.deepEqual(bookIds, rankedPuzzleMatches(PUZZLES, "book").map(puzzle => puzzle.id));
  await fillSearch(page, "", libraryCount);

  // Subcategory title (and hyphenated id-as-words) surfaces puzzles that
  // sit in that split even when the words aren't in the title.
  await fillSearch(page, "computing and society", libraryCount);
  const computingSocietyIds = rankedPuzzleMatches(PUZZLES, "computing and society")
    .map(puzzle => puzzle.id);
  assert.ok(computingSocietyIds.includes("the-hidden-transaction"));
  assert.deepEqual(await resultPuzzleIds(page), computingSocietyIds);
  const hiddenTitle = await page.textContent('[data-puzzle-id="the-hidden-transaction"] strong');
  assert.doesNotMatch(hiddenTitle, /computing and society/i);

  // Board terms: a cluster term that never appears in the title still
  // finds the puzzle, ranked after any title/category/tag hits for the
  // same query.
  await fillSearch(page, "mitochondrion", libraryCount);
  const termIds = await resultPuzzleIds(page);
  assert.ok(termIds.includes("inside-the-cell"));
  assert.deepEqual(termIds, rankedPuzzleMatches(PUZZLES, "mitochondrion").map(puzzle => puzzle.id));
  const cellTitle = await page.textContent('[data-puzzle-id="inside-the-cell"] strong');
  assert.doesNotMatch(cellTitle, /mitochondrion/i);

  // Nested catalogues suppressed from the top-level Library list are
  // still reachable through this search box.
  await fillSearch(page, "", libraryCount);
  assert.equal(
    await page.locator('#overview-list [data-catalogue-id="loyalty-without-exit"]').count(),
    0
  );
  await fillSearch(page, "loyalty without exit", libraryCount);
  assert.ok((await resultCatalogueIds(page)).includes("loyalty-without-exit"));
  if ((await resultPuzzleIds(page)).length) {
    assert.deepEqual(
      await page.locator(".search-result-heading").allTextContents(),
      ["Catalogues", "Puzzles"]
    );
  }
  await page.locator('#overview-list [data-catalogue-id="loyalty-without-exit"]').click();
  await waitForOverview(page, "Loyalty Without Exit");

  // Re-entering Library via the header button also resets a stale
  // in-progress query left over from before navigating away.
  await page.click("#browse-puzzles");
  await waitForOverview(page, "Library");
  assert.equal(await page.inputValue("#overview-search-input"), "");
  assert.equal(await page.locator("#overview-list .catalogue-card").count(), libraryCount);

  // A query matching nothing shows the empty state instead of an
  // empty list.
  await fillSearch(page, "zzzznonexistentzzzz", libraryCount);
  await page.waitForSelector("#overview-list .overview-empty-state");
  assert.match(await page.textContent("#overview-list"), /no puzzles or catalogues match/i);

  // Clearing the input (backspacing to empty) reverts to the normal
  // catalogue-card list.
  await fillSearch(page, "", libraryCount);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
