import assert from "node:assert/strict";

export const name = "library search: filters by title/category, navigates, resets";

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
  // 1 for All Puzzles, 1 for New Puzzles, plus every curated catalogue.
  const catalogueCount = 2 + await page.evaluate(() => CC.CATALOGUES.length);
  assert.equal(await page.locator("#overview-list .catalogue-card").count(), catalogueCount);

  // Typing a title fragment (any case) swaps the catalogue-card list for
  // matching puzzle cards -- computed against the live PUZZLES data so
  // this isn't pinned to specific puzzle content.
  const fragment = (await page.evaluate(() => CC.PUZZLES[0].title.slice(0, 5))).toUpperCase();
  await page.fill("#overview-search-input", fragment);
  await page.waitForFunction(() =>
    document.querySelectorAll("#overview-list .catalogue-card").length === 0
  );
  const expectedIds = await page.evaluate(query => {
    const q = query.toLowerCase();
    return CC.PUZZLES.filter(puzzle =>
      puzzle.title.toLowerCase().includes(q) ||
      (puzzle.categories || [puzzle.category]).some(name => name.toLowerCase().includes(q))
    ).map(p => p.id);
  }, fragment);
  assert.deepEqual((await resultPuzzleIds(page)).sort(), expectedIds.sort());

  // A category-name query surfaces puzzles via categoriesForPuzzle even
  // when that word never appears in the title -- not just a title match.
  await page.fill("#overview-search-input", "geography");
  await page.waitForFunction(() =>
    document.querySelectorAll("#overview-list [data-puzzle-id]").length > 0
  );
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
  assert.equal(await page.locator("#overview-list .catalogue-card").count(), catalogueCount);

  // A tag query surfaces tagged puzzles through the exact same search
  // box a title/category query uses -- no special "tag=" syntax.
  await page.fill("#overview-search-input", "book");
  await page.waitForFunction(() =>
    document.querySelectorAll("#overview-list [data-puzzle-id]").length > 0
  );
  const expectedBookIds = await page.evaluate(() =>
    CC.PUZZLES.filter(puzzle => puzzle.tags?.includes("book")).map(puzzle => puzzle.id)
  );
  assert.deepEqual((await resultPuzzleIds(page)).sort(), expectedBookIds.sort());
  await page.fill("#overview-search-input", "");
  await page.waitForFunction(count =>
    document.querySelectorAll("#overview-list .catalogue-card").length === count,
  catalogueCount);

  // Re-entering Library via the header button also resets a stale
  // in-progress query left over from before navigating away. #browse-puzzles
  // is disabled while already on Library (it exists to return there from
  // elsewhere), so this exercises it from a puzzle screen instead.
  await page.fill("#overview-search-input", "geography");
  await page.waitForFunction(() =>
    document.querySelectorAll("#overview-list .catalogue-card").length === 0
  );
  await page.locator('[data-puzzle-id="climate-and-livelihoods"]').click();
  await waitForPuzzle(page, "climate-and-livelihoods");
  await page.click("#browse-puzzles");
  await waitForOverview(page, "Library");
  assert.equal(await page.inputValue("#overview-search-input"), "");
  assert.equal(await page.locator("#overview-list .catalogue-card").count(), catalogueCount);

  // A query matching nothing shows the empty state instead of an
  // empty list.
  await page.fill("#overview-search-input", "zzzznonexistentzzzz");
  await page.waitForSelector("#overview-list .overview-empty-state");
  assert.match(await page.textContent("#overview-list"), /no puzzles match/i);

  // Clearing the input (backspacing to empty) reverts to the normal
  // catalogue-card list.
  await page.fill("#overview-search-input", "");
  await page.waitForFunction(count =>
    document.querySelectorAll("#overview-list .catalogue-card").length === count,
  catalogueCount);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
