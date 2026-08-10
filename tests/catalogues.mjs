import assert from "node:assert/strict";

export const name = "catalogues: Library hierarchy, context, history, sharing, and progress";

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

async function completeCurrentPuzzle(page) {
  await page.click("#show-solution");
  await page.waitForFunction(() =>
    CC.state.phase === "complete" ||
      ["lens-selecting", "lens-assigning"].includes(CC.state.phase)
  );
  if (await page.evaluate(() => CC.state.phase === "lens-assigning")) {
    await page.evaluate(() => {
      for (const lens of CC.state.puzzle.lenses) {
        for (const word of lens.targets) {
          CC.state.assignLens(
            CC.state.nodes.find(node => node.word === word),
            lens.id
          );
        }
      }
    });
    await page.click("#lens-check");
    return;
  }
  while (await page.evaluate(() => CC.state.phase !== "complete")) {
    await page.evaluate(() => {
      const lens = CC.state.puzzle.lenses[CC.state.lensIndex];
      for (const word of lens.targets) {
        if (!CC.state.lensSelections.has(word)) {
          CC.handleTap(CC.state.nodes.find(node => node.word === word));
        }
      }
    });
    await page.click("#lens-check");
    await page.click("#lens-next");
    await page.waitForFunction(() =>
      CC.state.phase === "complete" || CC.state.phase === "lens-selecting"
    );
  }
}

async function sharedUrl(page, button, status) {
  await page.click(button);
  await page.waitForFunction(selector =>
    document.querySelector(selector)?.textContent.length > 0,
  status);
  return new URL(await page.evaluate(() => navigator.clipboard.readText()));
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  // A bare visit remains a live showcase puzzle, not the Library.
  await page.goto(`${baseURL}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.locator("#puzzle-view").isVisible(), true);
  assert.equal(await page.textContent("#browse-puzzles"), "Library");

  // The global Library control exposes All Puzzles, New Puzzles, and every
  // curated catalogue that isn't suppressed for being nested under a meta
  // catalogue (modules/catalogueRegistry.js's libraryCatalogues), with
  // totals derived from canonical data.
  const expectedLibraryIds = await page.evaluate(() => {
    const nested = new Set(
      CC.CATALOGUES.filter(c => c.kind === "meta").flatMap(c => c.entries.map(e => e.id))
    );
    return [
      "all",
      "new",
      ...CC.CATALOGUES
        .filter(c => c.kind === "meta" || !nested.has(c.id) || c.showInLibrary)
        .map(c => c.id)
    ];
  });
  await page.click("#browse-puzzles");
  await waitForOverview(page, "Library");
  assert.equal(new URL(page.url()).searchParams.has("library"), true);
  assert.equal(await page.locator(".catalogue-card").count(), expectedLibraryIds.length);
  assert.equal(await page.locator(".overview-share").isHidden(), true);
  const libraryData = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".catalogue-card")).map(card => ({
      id: card.dataset.catalogueId,
      text: card.textContent.replace(/\s+/g, " ").trim()
    }))
  );
  assert.deepEqual(libraryData.map(row => row.id), expectedLibraryIds);
  assert.match(
    libraryData.find(row => row.id === "all").text,
    new RegExp(`\\b${await page.evaluate(() => CC.PUZZLES.length)} puzzles\\b`)
  );
  // New Puzzles' count is a bounded 10% of the library, not a fixed
  // number, so it stays meaningful as the catalog grows -- computed here
  // the same way modules/catalogueRegistry.js's newPuzzlesCount does,
  // independently, rather than asserting a number that would go stale.
  const newPuzzlesCount = await page.evaluate(() =>
    Math.min(20, Math.max(5, Math.ceil(CC.PUZZLES.length * 0.1)))
  );
  assert.match(
    libraryData.find(row => row.id === "new").text,
    new RegExp(`\\b${newPuzzlesCount} puzzles\\b`)
  );
  // Catalogues nested under a meta catalogue don't get their own Library
  // card (suppressed, see expectedLibraryIds above), so only check those
  // that actually render one. A meta catalogue's own count is the deduped
  // union of its children's puzzles, not entries.length (its entries are
  // other catalogues' ids, not puzzles).
  for (const catalogue of await page.evaluate(() => {
    const puzzleById = new Map(CC.PUZZLES.map(puzzle => [puzzle.id, puzzle]));
    const catalogueById = new Map(CC.CATALOGUES.map(item => [item.id, item]));
    const puzzlesFor = item => {
      if (item.kind !== "meta") {
        return item.entries.flatMap(entry => puzzleById.has(entry.id) ? [entry.id] : []);
      }
      const seen = new Set();
      for (const entry of item.entries) {
        const child = catalogueById.get(entry.id);
        for (const id of puzzlesFor(child)) seen.add(id);
      }
      return [...seen];
    };
    return CC.CATALOGUES.map(item => ({ id: item.id, count: puzzlesFor(item).length }));
  })) {
    const row = libraryData.find(item => item.id === catalogue.id);
    if (!row) continue;
    assert.match(row.text, new RegExp(`\\b${catalogue.count} puzzles\\b`));
  }

  // A catalogue's Library card shows a "New" badge if it contains one of
  // the current newest puzzles, OR if the catalogue itself is among the
  // most recently added catalogues (a catalogue can be newly minted from
  // older puzzles -- neither signal alone is sufficient). All Puzzles and
  // New Puzzles never do, even though All Puzzles technically always
  // qualifies under the first signal.
  const expectedBadged = await page.evaluate(({ puzzleCount, catalogueCount }) => {
    const newPuzzleIds = new Set(CC.PUZZLES.slice(-puzzleCount).map(puzzle => puzzle.id));
    const recentCatalogueIds = new Set(
      CC.CATALOGUES.slice(-catalogueCount).map(catalogue => catalogue.id)
    );
    const catalogueById = new Map(CC.CATALOGUES.map(item => [item.id, item]));
    const nested = new Set(
      CC.CATALOGUES.filter(c => c.kind === "meta").flatMap(c => c.entries.map(e => e.id))
    );
    // Only candidates that actually render a Library card (see
    // expectedLibraryIds above) can carry a badge, and a meta catalogue's
    // "contains a new puzzle" check has to look through its children,
    // since its own entries are other catalogues' ids, not puzzles.
    const containsNewPuzzle = catalogue => catalogue.kind === "meta"
      ? catalogue.entries.some(entry => containsNewPuzzle(catalogueById.get(entry.id) || { entries: [] }))
      : catalogue.entries.some(entry => newPuzzleIds.has(entry.id));
    return CC.CATALOGUES
      .filter(catalogue => catalogue.kind === "meta" || !nested.has(catalogue.id) || catalogue.showInLibrary)
      .filter(catalogue => containsNewPuzzle(catalogue) || recentCatalogueIds.has(catalogue.id))
      .map(catalogue => catalogue.id);
  }, {
    puzzleCount: newPuzzlesCount,
    catalogueCount: await page.evaluate(() =>
      Math.min(3, Math.max(1, Math.ceil(CC.CATALOGUES.length * 0.15)))
    )
  });
  const actualBadged = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".catalogue-card"))
      .filter(card => card.querySelector(".badge-new"))
      .map(card => card.dataset.catalogueId)
  );
  assert.deepEqual(actualBadged.sort(), expectedBadged.sort());
  assert.equal(await page.locator('[data-catalogue-id="all"] .badge-new').count(), 0);
  assert.equal(await page.locator('[data-catalogue-id="new"] .badge-new').count(), 0);

  // New Puzzles is the last N PUZZLES by array position (append-only, so
  // position already means "newest"), reversed to show newest first --
  // and it behaves like any other catalogue card: clicking it routes to
  // the standard category-grouped overview screen.
  await page.locator('[data-catalogue-id="new"]').click();
  await waitForOverview(page, "New Puzzles");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "new");
  const expectedNewIds = await page.evaluate(count =>
    CC.PUZZLES.slice(-count).reverse().map(puzzle => puzzle.id),
  newPuzzlesCount);
  await page.locator('[data-catalogue-view="all"]').click();
  await waitForOverview(page, "All puzzles in New Puzzles");
  assert.deepEqual(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    ),
    expectedNewIds
  );
  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");

  // Catalogue categories and counts are derived from just that
  // catalogue's canonical puzzle objects.
  await page.locator('[data-catalogue-id="concept-lenses"]').click();
  await waitForOverview(page, "Concept Lenses");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "concept-lenses");
  assert.equal(await page.locator('[data-catalogue-view="all"]').isVisible(), true);
  const expectedCategories = await page.evaluate(() => {
    const ids = new Set(CC.CATALOGUES.find(c => c.id === "concept-lenses").entries.map(e => e.id));
    const counts = {};
    for (const puzzle of CC.PUZZLES.filter(candidate => ids.has(candidate.id))) {
      counts[puzzle.category] = (counts[puzzle.category] || 0) + 1;
    }
    return counts;
  });
  const categoryCards = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list .overview-card-list .category-card"))
      .map(card => ({
        title: card.querySelector("strong").textContent,
        count: Number(card.querySelector(".card-count").textContent.match(/\d+/)[0])
      }))
  );
  assert.deepEqual(
    Object.fromEntries(categoryCards.map(card => [card.title, card.count])),
    expectedCategories
  );

  await page.locator('[data-category="geography"]').focus();
  assert.equal(
    await page.evaluate(() => document.getElementById("term-info").parentElement.id),
    "puzzle-overview"
  );
  assert.match(await page.textContent("#term-info"), /location, environment, movement/i);
  await page.locator('[data-category="geography"]').click();
  await waitForOverview(page, "Geography");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "concept-lenses");
  assert.equal(new URL(page.url()).searchParams.get("category"), "geography");
  assert.deepEqual(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    ),
    ["climate-and-livelihoods", "river-basins-and-human-life"]
  );
  assert.equal(
    await page.evaluate(() => document.getElementById("term-info").parentElement.id),
    "puzzle-overview"
  );

  await page.locator('[data-puzzle-id="climate-and-livelihoods"]').click();
  await waitForPuzzle(page, "climate-and-livelihoods");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "concept-lenses");
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "concept-lenses");
  assert.match(await page.textContent("#context-nav"), /Library.*Concept Lenses.*Geography/s);
  assert.equal(
    await page.evaluate(() => document.getElementById("term-info").parentElement.id),
    "puzzle-view"
  );

  // Direct routes and invalid associations resolve without cloning or
  // falsely attributing a puzzle to a catalogue.
  await page.goto(`${baseURL}/index.html?catalogue=getting-started`);
  await waitForOverview(page, "Getting Started");
  await page.goto(`${baseURL}/index.html?catalogue=getting-started&category=science`);
  await waitForOverview(page, "Science");
  assert.deepEqual(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    ),
    ["energy-flow", "states-of-matter", "body-systems"]
  );
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&catalogue=getting-started&category=science`);
  await waitForPuzzle(page, "energy-flow");
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "getting-started");

  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&catalogue=concept-lenses`);
  await waitForPuzzle(page, "energy-flow");
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "all");
  assert.match(await page.textContent("#context-nav"), /All Puzzles/);

  await page.goto(`${baseURL}/index.html?catalogue=not-a-catalogue`);
  await waitForOverview(page, "Library");
  assert.match(await page.textContent("#overview-subtitle"), /unavailable/i);

  // Legacy category and related-set URLs retain their original meaning.
  await page.goto(`${baseURL}/index.html?category=science`);
  await waitForOverview(page, "Science");
  assert.equal(await page.locator('[data-puzzle-id="energy-flow"]').isVisible(), true);
  await page.goto(`${baseURL}/index.html?puzzles=energy-flow,states-of-matter`);
  await waitForOverview(page, "Related puzzles");
  assert.deepEqual(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    ),
    ["energy-flow", "states-of-matter"]
  );

  // Same-document navigation creates meaningful Back/Forward layers.
  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");
  await page.locator('[data-catalogue-id="getting-started"]').click();
  await waitForOverview(page, "Getting Started");
  await page.locator('[data-category="science"]').click();
  await waitForOverview(page, "Science");
  await page.locator('[data-puzzle-id="energy-flow"]').click();
  await waitForPuzzle(page, "energy-flow");
  await page.goBack();
  await waitForOverview(page, "Science");
  await page.goBack();
  await waitForOverview(page, "Getting Started");
  await page.goBack();
  await waitForOverview(page, "Library");
  await page.goForward();
  await waitForOverview(page, "Getting Started");

  // The global picker preserves valid context and drops invalid context.
  await page.goto(`${baseURL}/index.html?puzzle=climate-and-livelihoods&catalogue=concept-lenses`);
  await waitForPuzzle(page, "climate-and-livelihoods");
  const energyIndex = await page.evaluate(() =>
    CC.PUZZLES.findIndex(puzzle => puzzle.id === "energy-flow")
  );
  await page.selectOption("#puzzle-picker", String(energyIndex));
  await waitForPuzzle(page, "energy-flow");
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "all");
  assert.equal(new URL(page.url()).searchParams.has("catalogue"), false);

  // Related navigation retains curated context only for another member.
  await page.goto(`${baseURL}/index.html?puzzle=quotations-and-attribution&catalogue=media-literacy-civic-reasoning`);
  await waitForPuzzle(page, "quotations-and-attribution");
  await completeCurrentPuzzle(page);
  await page.locator('#related-puzzles [data-puzzle-id="images-out-of-context"]').click();
  await waitForPuzzle(page, "images-out-of-context");
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "media-literacy-civic-reasoning");

  await page.goto(`${baseURL}/index.html?puzzle=interpreting-a-text&catalogue=getting-started`);
  await waitForPuzzle(page, "interpreting-a-text");
  await completeCurrentPuzzle(page);
  await page.locator('#related-puzzles [data-puzzle-id="reading-a-painting"]').click();
  await waitForPuzzle(page, "reading-a-painting");
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "all");

  // Puzzle sharing carries curated context, but direct/All Puzzles links
  // stay compact and backwards-compatible.
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&catalogue=getting-started&category=science`);
  await waitForPuzzle(page, "energy-flow");
  const curatedShare = await sharedUrl(page, "#share-puzzle", "#share-status");
  assert.equal(curatedShare.searchParams.get("catalogue"), "getting-started");
  assert.equal(curatedShare.searchParams.get("category"), "science");

  await page.goto(`${baseURL}/index.html?puzzle=energy-flow`);
  await waitForPuzzle(page, "energy-flow");
  const directShare = await sharedUrl(page, "#share-puzzle", "#share-status");
  assert.equal(directShare.searchParams.has("catalogue"), false);

  await page.goto(`${baseURL}/index.html?catalogue=concept-lenses&category=geography`);
  await waitForOverview(page, "Geography");
  const overviewShare = await sharedUrl(
    page,
    "#overview-share-btn",
    "#overview-share-status"
  );
  assert.equal(overviewShare.searchParams.get("catalogue"), "concept-lenses");
  assert.equal(overviewShare.searchParams.get("category"), "geography");

  // Completion is canonical: one solved record contributes to every
  // catalogue containing that puzzle.
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${baseURL}/index.html?puzzle=democracy-history&catalogue=getting-started`);
  await waitForPuzzle(page, "democracy-history");
  await completeCurrentPuzzle(page);
  await page.click("#browse-puzzles");
  await waitForOverview(page, "Library");
  for (const catalogueId of ["getting-started", "media-literacy-civic-reasoning"]) {
    assert.match(
      await page.textContent(`[data-catalogue-id="${catalogueId}"]`),
      /1 of \d+ completed/
    );
  }
  await page.locator('[data-catalogue-id="all"]').click();
  await waitForOverview(page, "All Puzzles");
  await page.locator('[data-catalogue-view="all"]').click();
  await waitForOverview(page, "All puzzles in All Puzzles");
  const completedCard = page.locator('[data-puzzle-id="democracy-history"]');
  assert.equal(await completedCard.getAttribute("data-completed"), "true");
  assert.match(await completedCard.textContent(), /✓ Completed/);
  assert.equal(
    await page.locator('[data-puzzle-id="energy-flow"]').getAttribute("data-completed"),
    "false"
  );

  // Catalogue navigation remains inside a narrow viewport.
  await page.setViewportSize({ width: 360, height: 700 });
  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "Library should not overflow a 360px viewport"
  );
  await page.goto(`${baseURL}/index.html?catalogue=getting-started`);
  await waitForOverview(page, "Getting Started");
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "catalogue overview should not overflow a 360px viewport"
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
