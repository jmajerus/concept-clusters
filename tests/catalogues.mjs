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

  // An ordered catalogue's whole puzzle list shows inline regardless of
  // count -- Media Literacy and Civic Reasoning is ordered (the default)
  // with 8 puzzles, well past what used to be a count threshold, but
  // count isn't the gate anymore (isOrderedCatalogue in
  // overviewRenderer.js): no "All puzzles" card, and "Browse by subject"
  // becomes the plain-text "By subject" summary, not category cards --
  // same treatment Disentanglements (3 puzzles) gets below, for the
  // same reason.
  await page.locator('[data-catalogue-id="media-literacy-civic-reasoning"]').click();
  await waitForOverview(page, "Media Literacy and Civic Reasoning");
  assert.equal(
    new URL(page.url()).searchParams.get("catalogue"),
    "media-literacy-civic-reasoning"
  );
  assert.equal(await page.locator(".catalogue-all-card").count(), 0);
  assert.equal(
    await page.textContent("#overview-list h3.overview-section-heading"),
    "By subject"
  );
  assert.equal(
    await page.locator("#overview-list .category-card[data-category]").count(),
    0
  );
  assert.equal(
    await page.locator("#overview-list [data-puzzle-id]").count(),
    8
  );

  // Marking it unordered flips the whole screen: the "All puzzles" card
  // returns, and "Browse by subject" goes back to cards -- Media &
  // Information Literacy (6 puzzles) stays a card regardless (always
  // above INLINE_PUZZLE_LIST_THRESHOLD), while History & Society (2
  // puzzles) now inlines too, since per-category inlining is only
  // available for an unordered catalogue in the first place. Mutating
  // the live registry object and re-navigating client-side (not
  // page.goto, which would reload a fresh, unmutated module instance)
  // exercises this without a dedicated fixture catalogue.
  await page.evaluate(() => {
    CC.CATALOGUES.find(c => c.id === "media-literacy-civic-reasoning").ordered = false;
  });
  await page.click("#browse-puzzles");
  await waitForOverview(page, "Library");
  await page.locator('[data-catalogue-id="media-literacy-civic-reasoning"]').click();
  await waitForOverview(page, "Media Literacy and Civic Reasoning");
  assert.equal(await page.locator('[data-catalogue-view="all"]').isVisible(), true);
  const categoryCards = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list .overview-card-list .category-card"))
      .map(card => ({
        title: card.querySelector("strong").textContent,
        count: Number(card.querySelector(".card-count").textContent.match(/\d+/)[0])
      }))
  );
  assert.deepEqual(
    Object.fromEntries(categoryCards.map(card => [card.title, card.count])),
    { "Media & Information Literacy": 6 }
  );
  assert.match(
    await page.locator(".category-group-heading").last().textContent(),
    /History & Society/
  );

  await page.locator('[data-category="media-information-literacy"]').focus();
  assert.equal(
    await page.evaluate(() => document.getElementById("term-info").parentElement.id),
    "puzzle-overview"
  );
  assert.match(await page.textContent("#term-info"), /real, sourced, and trustworthy/i);
  await page.locator('[data-category="media-information-literacy"]').click();
  await waitForOverview(page, "Media & Information Literacy");
  assert.equal(
    new URL(page.url()).searchParams.get("catalogue"),
    "media-literacy-civic-reasoning"
  );
  assert.equal(new URL(page.url()).searchParams.get("category"), "media-information-literacy");
  assert.deepEqual(
    (await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
        .map(card => card.dataset.puzzleId)
    )).sort(),
    [
      "ai-generated-synthetic-media",
      "evidence-and-inference-across-disciplines",
      "images-out-of-context",
      "media-literacy",
      "quotations-and-attribution",
      "social-media-hygiene"
    ]
  );
  assert.equal(
    await page.evaluate(() => document.getElementById("term-info").parentElement.id),
    "puzzle-overview"
  );

  await page.locator('[data-puzzle-id="media-literacy"]').click();
  await waitForPuzzle(page, "media-literacy");
  assert.equal(
    new URL(page.url()).searchParams.get("catalogue"),
    "media-literacy-civic-reasoning"
  );
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "media-literacy-civic-reasoning");
  assert.match(
    await page.textContent("#context-nav"),
    /Library.*Media Literacy and Civic Reasoning.*Media & Information Literacy/s
  );
  assert.equal(
    await page.evaluate(() => document.getElementById("term-info").parentElement.id),
    "puzzle-view"
  );

  // A small catalogue's overview shows its puzzles inline instead of
  // behind an "All puzzles" card -- Disentanglements has 3, at or below
  // INLINE_PUZZLE_LIST_THRESHOLD (overviewRenderer.js), so the card that
  // Concept Lenses (8 puzzles, just above) still shows above is replaced
  // by the puzzle cards themselves.
  await page.goto(`${baseURL}/index.html?catalogue=disentanglements`);
  await waitForOverview(page, "Disentanglements");
  assert.equal(await page.locator(".catalogue-all-card").count(), 0);
  const disentanglementsIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]"))
      .map(card => card.dataset.puzzleId)
  );
  assert.deepEqual(
    disentanglementsIds,
    await page.evaluate(() =>
      CC.CATALOGUES.find(c => c.id === "disentanglements").entries.map(e => e.id)
    )
  );
  // "Browse by subject" becomes a plain-text "By subject" reference
  // index here, not cards -- every puzzle is already listed once, above,
  // so a card leading back to a subset of the same puzzles has nothing
  // left to offer (see renderSubjectSummary in overviewRenderer.js).
  assert.equal(
    await page.textContent("#overview-list h3.overview-section-heading"),
    "By subject"
  );
  assert.equal(await page.locator("#overview-list .category-card").count(), 0);
  const subjectRows = await page.evaluate(() =>
    Object.fromEntries(
      Array.from(document.querySelectorAll("#overview-list .category-group-heading"))
        .map(heading => [heading.textContent, heading.nextElementSibling.textContent])
    )
  );
  assert.deepEqual(subjectRows, {
    "Business & Organizations": "True Self, False Self",
    "Philosophy": "Political Philosophy: Freedom From, Freedom To",
    "Political Science": "Power Over, Power To•Freedom From, Freedom To",
    "Psychology": "Power Over, Power To•True Self, False Self"
  });
  await page.locator(`[data-puzzle-id="${disentanglementsIds[0]}"]`).click();
  await waitForPuzzle(page, disentanglementsIds[0]);
  assert.equal(await page.evaluate(() => CC.activeCatalogue.id), "disentanglements");

  // A category where every puzzle shares one subcategory gets one row,
  // labeled once -- not the subcategory repeated after each title.
  // Dark Patterns' Computer Science category is exactly this case, all
  // 7 puzzles under Computing & Society, and is what surfaced the
  // original bug: repeating "(Computing & Society)" 7 times also broke
  // word wrap, since the browser could split a line inside the
  // parenthetical itself.
  await page.goto(`${baseURL}/index.html?catalogue=dark-patterns`);
  await waitForOverview(page, "Dark Patterns");
  const darkPatternsRows = await page.evaluate(() =>
    Object.fromEntries(
      Array.from(document.querySelectorAll("#overview-list .category-group-heading"))
        .map(heading => [heading.textContent, heading.nextElementSibling.textContent])
    )
  );
  // The Computer Science value below (all 7 titles in one string) only
  // matches if they're in a single row with one label -- an unfixed
  // one-row-per-puzzle bug would instead put just "Choice Under
  // Influence" in the first (and only inspected) row here, failing
  // this comparison.
  assert.deepEqual(darkPatternsRows, {
    "Business & Organizations": "When Manipulation Becomes Normal•Restoring Honest Choice",
    "Computer Science": "Computing & Society: Choice Under Influence•The Hidden Transaction" +
      "•Manufactured Pressure•Control and Exit•After the Click" +
      "•When Manipulation Becomes Normal•Restoring Honest Choice",
    "Psychology": "After the Click"
  });

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
  // No real catalogue's categories show as cards by default anymore --
  // every one is ordered, so its own overview is always fully inlined
  // (isOrderedCatalogue in overviewRenderer.js) -- so this needs the
  // same ordered: false mutation used above to get a genuine
  // intermediate category screen to exercise Back/Forward through.
  // Client-side Back/Forward (popstate, not a reload) keeps the
  // mutation in effect the whole way.
  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");
  await page.evaluate(() => {
    CC.CATALOGUES.find(c => c.id === "media-literacy-civic-reasoning").ordered = false;
  });
  await page.locator('[data-catalogue-id="media-literacy-civic-reasoning"]').click();
  await waitForOverview(page, "Media Literacy and Civic Reasoning");
  await page.locator('[data-category="media-information-literacy"]').click();
  await waitForOverview(page, "Media & Information Literacy");
  await page.locator('[data-puzzle-id="quotations-and-attribution"]').click();
  await waitForPuzzle(page, "quotations-and-attribution");
  await page.goBack();
  await waitForOverview(page, "Media & Information Literacy");
  await page.goBack();
  await waitForOverview(page, "Media Literacy and Civic Reasoning");
  await page.goBack();
  await waitForOverview(page, "Library");
  await page.goForward();
  await waitForOverview(page, "Media Literacy and Civic Reasoning");

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

  // The picker also lists real catalogues (not Library/All/New), lets a
  // player jump straight to one, and keeps its own selection in sync
  // while browsing that catalogue's overview/category/subcategory/flat
  // list -- without this, it kept showing the last-loaded puzzle even
  // while looking at an unrelated catalogue.
  const pickerCatalogueValues = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#puzzle-picker optgroup[label="Catalogues"] option'))
      .map(option => option.value)
  );
  assert.deepEqual(
    pickerCatalogueValues.sort(),
    (await page.evaluate(() => CC.CATALOGUES.map(c => `catalogue:${c.id}`))).sort()
  );
  assert.equal(pickerCatalogueValues.includes("catalogue:all"), false);
  assert.equal(pickerCatalogueValues.includes("catalogue:new"), false);

  // Fresh page load above means the ordered:false mutation from the
  // Back/Forward check didn't carry over -- reapply it here to reach a
  // real category screen (rather than the fully-inlined default) for
  // the sync check just below.
  await page.evaluate(() => {
    CC.CATALOGUES.find(c => c.id === "media-literacy-civic-reasoning").ordered = false;
  });
  await page.selectOption("#puzzle-picker", "catalogue:media-literacy-civic-reasoning");
  await waitForOverview(page, "Media Literacy and Civic Reasoning");
  assert.equal(
    new URL(page.url()).searchParams.get("catalogue"),
    "media-literacy-civic-reasoning"
  );
  assert.equal(
    await page.locator("#puzzle-picker").inputValue(),
    "catalogue:media-literacy-civic-reasoning"
  );
  await page.locator('[data-category="media-information-literacy"]').click();
  await waitForOverview(page, "Media & Information Literacy");
  assert.equal(
    await page.locator("#puzzle-picker").inputValue(),
    "catalogue:media-literacy-civic-reasoning"
  );
  await page.goto(`${baseURL}/index.html?catalogue=getting-started&view=all`);
  await waitForOverview(page, "All puzzles in Getting Started");
  assert.equal(
    await page.locator("#puzzle-picker").inputValue(),
    "catalogue:getting-started"
  );

  // Loading a puzzle (from that catalogue or otherwise) still shows the
  // puzzle's own option, not the catalogue's.
  await page.locator('[data-puzzle-id="energy-flow"]').click();
  await waitForPuzzle(page, "energy-flow");
  assert.equal(await page.locator("#puzzle-picker").inputValue(), String(energyIndex));

  // A screen with no single real catalogue (Library, Related) resets the
  // picker to its placeholder rather than showing stale state.
  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");
  assert.equal(await page.locator("#puzzle-picker").inputValue(), "");

  // A legacy `?category=` link (and the equivalent explicit
  // `?catalogue=all&category=`) resolves to a catalogue-category route
  // carrying the *synthetic* All Puzzles catalogue, not a real curated
  // one -- the picker has no `catalogue:all` option, so setting .value
  // to it would silently deselect the picker entirely (selectedIndex
  // -1, blank UI) rather than falling back to the placeholder option.
  // Checking selectedIndex, not just the read-back value, is what
  // actually catches that: an unmatched value already reads back as ""
  // either way.
  await page.goto(`${baseURL}/index.html?category=science`);
  await waitForOverview(page, "Science");
  assert.equal(await page.locator("#puzzle-picker").inputValue(), "");
  assert.equal(
    await page.evaluate(() => document.getElementById("puzzle-picker").selectedIndex),
    0
  );
  await page.goto(`${baseURL}/index.html?catalogue=all&category=science`);
  await waitForOverview(page, "Science");
  assert.equal(await page.locator("#puzzle-picker").inputValue(), "");
  assert.equal(
    await page.evaluate(() => document.getElementById("puzzle-picker").selectedIndex),
    0
  );

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

  // Reached from the flat All Puzzles list, a puzzle that belongs to a
  // real curated catalogue gets a gentle "play its catalogue" suggestion
  // (see showPuzzleCatalogueSuggestion in overviewRenderer.js), worded
  // by that catalogue's `ordered` flag (default true).
  await page.locator('[data-puzzle-id="energy-flow"]').click();
  await waitForPuzzle(page, "energy-flow");
  assert.equal(await page.locator("#puzzle-catalogue-suggestion").isHidden(), false);
  assert.match(
    await page.textContent("#puzzle-catalogue-suggestion"),
    /Part of the Getting Started catalogue — play it in sequence\./
  );

  // Reached through the catalogue's own browsing flow instead, the
  // suggestion has nothing useful to add and stays hidden.
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&catalogue=getting-started`);
  await waitForPuzzle(page, "energy-flow");
  assert.equal(await page.locator("#puzzle-catalogue-suggestion").isHidden(), true);

  // `ordered: false` drops the "play it in sequence" implication while
  // still linking to the catalogue -- mutating the live registry object
  // and re-navigating client-side (not page.goto, which would reload a
  // fresh, unmutated module instance) exercises that wording branch
  // without needing a dedicated fixture catalogue.
  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");
  await page.evaluate(() => {
    CC.CATALOGUES.find(c => c.id === "getting-started").ordered = false;
  });
  await page.locator('[data-catalogue-id="all"]').click();
  await waitForOverview(page, "All Puzzles");
  await page.locator('[data-catalogue-view="all"]').click();
  await waitForOverview(page, "All puzzles in All Puzzles");
  await page.locator('[data-puzzle-id="energy-flow"]').click();
  await waitForPuzzle(page, "energy-flow");
  assert.equal(
    await page.textContent("#puzzle-catalogue-suggestion"),
    "Part of the Getting Started catalogue."
  );

  // With Getting Started now unordered (mutated above, still in effect
  // client-side), its small "Browse by subject" categories -- Science
  // among them -- inline instead of staying cards: nothing about an
  // unordered catalogue implies a sequence a promoted category could
  // undermine. Asserting Science's presence specifically (rather than
  // that zero .category-card elements exist at all) keeps this from
  // breaking if Getting Started's categories grow past the inline
  // threshold later -- that would be real content drift, unrelated to
  // whether unordered per-category inlining itself still works.
  await page.selectOption("#puzzle-picker", "catalogue:getting-started");
  await waitForOverview(page, "Getting Started");
  assert.match(
    (await page.evaluate(() =>
      Array.from(document.querySelectorAll("#overview-list .category-group-heading"))
        .map(heading => heading.textContent)
    )).join(", "),
    /Science/
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
