// The ?puzzle=/&moves=/&solved query-param scheme (see the "Sharing
// links" section in docs/DEVELOPMENT.md) has zero coverage anywhere
// else — every prior check of it was a throwaway script run once by
// hand and discarded. This is the permanent version: a plain puzzle
// link, a partial-progress link round-tripping through a fresh page
// load, a fully-solved link using the terser &solved form, Start Over
// and the puzzle picker both refusing to re-apply a URL's state after
// the initial load, and a couple of malformed &moves values degrading
// to a plain load instead of throwing.
//
// Reads game internals via window.CC (see the "test/debug hooks"
// comment in game.js) rather than bare globals -- game.js is an ES
// module now, so its own top-level scope no longer leaks onto window
// the way a classic <script> did.
import assert from "node:assert/strict";

export const name = "sharing: ?puzzle=/&moves=/&solved links encode and replay correctly";

// Finds one legal (source, target) tap pair from whatever the current
// puzzle happens to be, so this doesn't hardcode term text that could
// go stale if puzzle content changes.
async function makeOneCorrectMove(page) {
  return page.evaluate(() => {
    for (const n of CC.state.nodes) {
      if (CC.isDone(n)) continue;
      for (const gi of n.gs) {
        if (n.connected.includes(gi)) continue;
        const target = CC.state.nodes.find(t => !CC.isBridge(t) && t.gs[0] === gi && t.connected.includes(gi) && t !== n);
        if (target) {
          CC.handleTap(n);
          CC.handleTap(target);
          return true;
        }
      }
    }
    return false;
  });
}

async function shareCurrentPuzzle(page) {
  await page.click("#share-puzzle");
  await page.waitForFunction(() => document.getElementById("share-status").textContent.length > 0);
  return page.evaluate(() => navigator.clipboard.readText());
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });

  const context = page.context();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  // ---- a genuinely fresh visit (nothing in localStorage yet) lands
  // directly on a live, playable puzzle -- never a blank/idle state (see
  // the arcade-machines framing in the design discussion this responds
  // to: the machines are always lit up and running something). Which
  // puzzle is a random pick from the showcase pool
  // (puzzles/showcase.js), not always PUZZLES[0] and not the whole
  // catalog. ----
  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.locator("#puzzle-view").isVisible(), true, "a fresh visit should land directly on a puzzle");
  const puzzleId = await page.evaluate(() => CC.state.puzzle.id);
  assert.ok(
    await page.evaluate(id => CC.SHOWCASE_PUZZLE_IDS.has(id), puzzleId),
    "the puzzle loaded on a fresh visit should come from the showcase pool"
  );
  assert.equal(
    await page.evaluate(() => localStorage.getItem("ccLastPuzzle")),
    puzzleId,
    "loading a puzzle should remember it as the last one played"
  );

  // ---- goToDefaultLanding's two branches, exercised directly: a
  // remembered puzzle that lists a relatedPuzzles entry advances to that
  // entry -- the one deliberately-authored "what's next" signal this
  // catalog has -- rather than reloading itself or picking randomly;
  // one with no relatedPuzzles falls back to a random pick, where only
  // "some real puzzle" is checkable, not which one. Both branches are
  // driven independently via explicit ?puzzle= links rather than
  // whatever the fresh visit above happened to land on, so this doesn't
  // depend on the catalog's current random draw to exercise either
  // path. ----
  const puzzleWithNext = await page.evaluate(() => {
    const p = CC.PUZZLES.find(x => x.relatedPuzzles?.entries?.length);
    return p ? { id: p.id, nextId: p.relatedPuzzles.entries[0].id } : null;
  });
  if (puzzleWithNext) {
    await page.goto(`${baseURL}/index.html?puzzle=${encodeURIComponent(puzzleWithNext.id)}`);
    await page.waitForSelector("#puzzle-title:not(:empty)");
    await page.goto(`${baseURL}/index.html?puzzle=not-a-real-puzzle-id`);
    await page.waitForSelector("#puzzle-title:not(:empty)");
    assert.equal(
      await page.evaluate(() => CC.state.puzzle.id),
      puzzleWithNext.nextId,
      "a remembered puzzle with a relatedPuzzles entry should advance to that entry"
    );
  }

  const puzzleWithoutNext = await page.evaluate(() =>
    CC.PUZZLES.find(x => !x.relatedPuzzles?.entries?.length)?.id
  );
  if (puzzleWithoutNext) {
    await page.goto(`${baseURL}/index.html?puzzle=${encodeURIComponent(puzzleWithoutNext)}`);
    await page.waitForSelector("#puzzle-title:not(:empty)");
    await page.goto(`${baseURL}/index.html?puzzle=not-a-real-puzzle-id`);
    await page.waitForSelector("#puzzle-title:not(:empty)");
    const landedId = await page.evaluate(() => CC.state.puzzle.id);
    assert.ok(
      await page.evaluate(id => CC.SHOWCASE_PUZZLE_IDS.has(id), landedId),
      "a remembered puzzle with no relatedPuzzles should fall back to a random pick from the showcase pool"
    );
  }

  // Reload the original fresh-visit puzzle so the rest of this test
  // builds on a known, remembered `puzzleId` again.
  await page.goto(`${baseURL}/index.html?puzzle=${encodeURIComponent(puzzleId)}`);
  await page.waitForSelector("#puzzle-title:not(:empty)");

  // ---- that same puzzle shares a plain ?puzzle= link ----

  const plainUrl = new URL(await shareCurrentPuzzle(page));
  assert.equal(plainUrl.searchParams.get("puzzle"), puzzleId, "plain share link has the wrong puzzle id");
  assert.equal(plainUrl.searchParams.has("moves"), false, "an untouched puzzle shouldn't share a moves param");
  assert.equal(plainUrl.searchParams.has("solved"), false, "an untouched puzzle shouldn't share a solved flag");

  await page.goto(plainUrl.toString());
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.evaluate(() => CC.state.puzzle.id), puzzleId, "plain link didn't select the right puzzle");
  const pickerValue = await page.$eval("#puzzle-picker", el => +el.value);
  const puzzleIndex = await page.evaluate(id => CC.PUZZLES.findIndex(p => p.id === id), puzzleId);
  assert.equal(pickerValue, puzzleIndex, "picker dropdown didn't sync to the puzzle loaded from the link");

  // An unrecognized id degrades to this visitor's default landing
  // (goToDefaultLanding in game.js) rather than erroring -- checked
  // generically here (some real puzzle loaded, no error) since the
  // deterministic next-vs-random behavior is already covered directly
  // above; puzzleId itself has no relatedPuzzles guarantee at this
  // point in the test.
  await page.goto(`${baseURL}/index.html?puzzle=not-a-real-puzzle-id`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.ok(
    await page.evaluate(() => CC.PUZZLES.some(p => p.id === CC.state.puzzle.id)),
    "unrecognized id should fall back to some valid puzzle from the catalog"
  );

  // ---- a manually-added &mode= overrides the stored preference for
  // this view only, and is never generated by the Share button ----
  // Cleared first: the puzzle loads above each auto-landed on a random
  // puzzle and persisted their own per-puzzle session (with whatever the
  // ambient default mode was at the time), and that saved session's
  // currentMode outranks the general ccMode preference on a later visit
  // to that same puzzle (see restorePlayerSession/persistedMode in
  // game.js) -- a leftover session here would shadow the "graph"
  // preference this block is about to set and make the rest of this
  // block depend on which random puzzle a later step happens to reload.
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("ccMode", "graph");
  });
  await page.goto(`${baseURL}/index.html?mode=sets`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.evaluate(() => CC.mode), "sets", "&mode=sets should override a stored 'graph' preference");
  assert.equal(await page.getAttribute("#mode-sets", "aria-pressed"), "true", "&mode=sets should be reflected on the Sets button");

  await page.goto(`${baseURL}/index.html?mode=star`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.evaluate(() => CC.mode), "star", "&mode=star should override a stored 'graph' preference");
  assert.equal(await page.getAttribute("#mode-star", "aria-pressed"), "true", "&mode=star should be reflected on the Star button");

  // Reloading the SAME page without &mode= must revert to the stored
  // preference, proving the override wasn't persisted to localStorage.
  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.evaluate(() => CC.mode), "graph", "&mode= must not overwrite the stored preference for later, param-less visits");

  // A garbage &mode= value falls back to the normal stored/default logic.
  await page.goto(`${baseURL}/index.html?mode=bogus`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.evaluate(() => CC.mode), "graph", "an invalid &mode= value should fall back to the stored preference, not error");

  const plainShareAfterModeOverride = new URL(await shareCurrentPuzzle(page));
  assert.equal(plainShareAfterModeOverride.searchParams.has("mode"), false, "the Share button must never add &mode= on its own");

  // ---- partial progress shares &moves=, and round-trips exactly ----
  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.ok(await makeOneCorrectMove(page), "couldn't make a first correct move to seed the moves test");
  assert.ok(await makeOneCorrectMove(page), "couldn't make a second correct move to seed the moves test");
  const madeBefore = await page.evaluate(() => CC.state.made);
  const puzzleIdForMoves = await page.evaluate(() => CC.state.puzzle.id);
  const connectedBefore = await page.evaluate(() => CC.state.nodes.filter(n => CC.isDone(n)).map(n => n.word).sort());

  const movesUrl = new URL(await shareCurrentPuzzle(page));
  assert.ok(movesUrl.searchParams.has("moves"), "partial progress should share a moves param");
  assert.equal(movesUrl.searchParams.has("solved"), false, "partial progress shouldn't also set solved");

  await page.goto(movesUrl.toString());
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => CC.state.puzzle.id), puzzleIdForMoves, "moves link loaded the wrong puzzle");
  assert.equal(await page.evaluate(() => CC.state.made), madeBefore, "moves link didn't reconstruct the same progress count");
  const connectedAfter = await page.evaluate(() => CC.state.nodes.filter(n => CC.isDone(n)).map(n => n.word).sort());
  assert.deepEqual(connectedAfter, connectedBefore, "moves link reconstructed a different set of connections");

  // Start Over must not re-apply the URL's moves on a later loadPuzzle call.
  await page.click("#reset");
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => CC.state.made), 0, "Start Over should not re-replay a shared moves param");

  // Switching puzzles via the picker must not leak stale moves either.
  await page.goto(movesUrl.toString());
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.waitForTimeout(150);
  const currentIndex = await page.evaluate(() =>
    CC.PUZZLES.findIndex(puzzle => puzzle.id === CC.state.puzzle.id)
  );
  const otherIndex = (currentIndex + 1) % (await page.evaluate(() => CC.PUZZLES.length));
  // By option *value* (each real option's value is its PUZZLES index --
  // see the picker-population comment in game.js), not DOM position: the
  // picker now has a disabled placeholder option at position 0, so a
  // raw positional { index: otherIndex } would silently select one
  // puzzle too early instead of erroring.
  await page.selectOption("#puzzle-picker", { value: String(otherIndex) });
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => CC.state.made), 0, "switching puzzles via the picker should not carry over a shared moves param");

  // ---- a fully-solved puzzle shares the terser &solved flag instead ----
  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.click("#show-solution");
  await page.waitForTimeout(150);
  const need = await page.evaluate(() => CC.state.need);
  assert.equal(await page.evaluate(() => CC.state.made), need, "Show Solution should have fully completed the puzzle before sharing it");

  const solvedUrl = new URL(await shareCurrentPuzzle(page));
  assert.equal(solvedUrl.searchParams.has("solved"), true, "a fully-solved puzzle should share &solved");
  assert.equal(solvedUrl.searchParams.has("moves"), false, "a fully-solved puzzle shouldn't also share &moves");

  await page.goto(solvedUrl.toString());
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => CC.state.made), await page.evaluate(() => CC.state.need), "&solved link didn't fully complete the puzzle");

  // A bare &solved (no value at all) must work too -- that's the form
  // documented as "shorthand", not just ...&solved=1.
  await page.goto(`${baseURL}/index.html?puzzle=${encodeURIComponent(puzzleId)}&solved`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => CC.state.made), await page.evaluate(() => CC.state.need), "bare &solved flag (no value) should still fully complete the puzzle");

  // ---- malformed &moves degrades to a plain load, never throws ----
  for (const badMoves of ["!!!not-valid!!!", "A"]) {
    await page.goto(`${baseURL}/index.html?puzzle=${encodeURIComponent(puzzleId)}&moves=${encodeURIComponent(badMoves)}`);
    await page.waitForSelector("#puzzle-title:not(:empty)");
    assert.equal(await page.evaluate(() => CC.state.puzzle.id), puzzleId, `corrupted moves param "${badMoves}" should still load the puzzle`);
  }

  // ---- ?category= shows the overview screen instead of a single
  // puzzle -- listing every puzzle in that category, not auto-entering
  // any of them (see the design note above showOverview in game.js) ----
  // Encoded as categorySlugFor(someCategory), not the raw name -- see
  // puzzles/categories.js -- so this is also exercising the normal,
  // going-forward form of the link, not just a backward-compat path.
  const someCategory = await page.evaluate(() => CC.PUZZLES[0].category);
  const someCategorySlug = await page.evaluate(cat => CC.categorySlugFor(cat), someCategory);
  assert.ok(!/[^a-z0-9-]/.test(someCategorySlug), `categorySlugFor should produce a clean slug, got "${someCategorySlug}"`);
  const expectedInCategory = await page.evaluate(
    cat => CC.PUZZLES.filter(p => p.category === cat).map(p => p.title).sort(),
    someCategory
  );
  await page.goto(`${baseURL}/index.html?category=${someCategorySlug}`);
  await page.waitForSelector("#overview-title");
  assert.equal(await page.textContent("#overview-title"), someCategory, "overview title should be the shared category");
  assert.equal(await page.locator("#puzzle-overview").isVisible(), true, "overview should be visible for ?category=");
  assert.equal(await page.locator("#puzzle-view").isVisible(), false, "puzzle-view should be hidden while the overview is showing");
  // .related-card is shared by puzzle cards and by the category/
  // catalogue/catalogue-intersection cards that can now also appear on
  // this same overview -- data-puzzle-id is what actually distinguishes
  // a puzzle card from those.
  const cardTitles = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list [data-puzzle-id] strong")).map(el => el.textContent).sort()
  );
  assert.deepEqual(cardTitles, expectedInCategory, "overview should list exactly the puzzles in that category");

  // A raw, unslugified category name (how every ?category= link was
  // encoded before this change) must keep working too -- resolveCategory
  // in catalogueRegistry.js falls back to a literal match for this case.
  await page.goto(`${baseURL}/index.html?category=${encodeURIComponent(someCategory)}`);
  await page.waitForSelector("#overview-title");
  assert.equal(await page.textContent("#overview-title"), someCategory, "a raw (pre-slug) category name should still resolve correctly");

  // The category overview's own Share button encodes the slug too, not
  // the raw name -- confirms the whole encode path end-to-end, not just
  // resolveCategory's decode side.
  await page.click("#overview-share-btn");
  await page.waitForFunction(() => document.getElementById("overview-share-status").textContent.length > 0);
  const categoryShareUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  assert.equal(categoryShareUrl.searchParams.get("category"), someCategorySlug, "the category overview's Share button should encode the slug, not the raw name");

  await page.goto(`${baseURL}/index.html?category=${someCategorySlug}`);
  await page.waitForSelector("#overview-title");

  // Picking a card enters that puzzle directly and hides the overview.
  await page.locator("#overview-list .related-card").first().click();
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.equal(await page.evaluate(() => CC.state.puzzle.category), someCategory, "clicking an overview card loaded the wrong puzzle");
  assert.equal(await page.locator("#puzzle-overview").isVisible(), false, "overview should hide once a puzzle is entered");
  assert.equal(await page.locator("#puzzle-view").isVisible(), true, "puzzle-view should show once a puzzle is entered");

  // An unrecognized category degrades to this visitor's default landing
  // (goToDefaultLanding), same "stale link still just opens the game"
  // philosophy as ?puzzle= -- checked generically, since which puzzle
  // that resolves to isn't predictable here (see the dedicated
  // next-vs-random coverage above).
  await page.goto(`${baseURL}/index.html?category=NoSuchCategoryAtAll`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.ok(
    await page.evaluate(() => CC.PUZZLES.some(p => p.id === CC.state.puzzle.id)),
    "unrecognized category should fall back to some valid puzzle from the catalog"
  );
  assert.equal(await page.locator("#puzzle-overview").isVisible(), false, "overview should not show for an unrecognized category");

  // Puzzle cards can use real styled badges even though the native
  // picker must use compact symbols. Cover all four combinations so a
  // missing badge never gets hidden by a homogeneous category.
  const featureCases = await page.evaluate(() => {
    const combinations = [
      [false, false],
      [true, false],
      [false, true],
      [true, true]
    ];
    return combinations.map(([large, lenses]) => {
      const puzzle = CC.PUZZLES.find(p =>
        !!p.large === large && !!p.lenses?.length === lenses
      );
      return puzzle && {
        id: puzzle.id,
        title: puzzle.title,
        badges: [
          ...(large ? ["Large"] : []),
          ...(lenses ? ["Lenses"] : []),
          ...(puzzle.learningIntroduction ? ["Lesson"] : [])
        ]
      };
    });
  });
  assert.equal(featureCases.every(Boolean), true, "catalog should contain all Large/Lenses badge combinations");
  await page.goto(
    `${baseURL}/index.html?puzzles=${featureCases.map(p => p.id).join(",")}`
  );
  const featureCards = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list .related-card")).map(card => ({
      title: card.querySelector("strong").textContent,
      badges: Array.from(card.querySelectorAll(
        ".card-badges .puzzle-badge:not(.badge-completed)"
      ))
        .map(badge => badge.textContent)
    }))
  );
  assert.deepEqual(
    featureCards,
    featureCases.map(({ title, badges }) => ({ title, badges })),
    "overview cards should show the correct feature badges"
  );

  // ---- &puzzles=id1,id2 shows the overview for exactly those puzzles,
  // in the order given, silently dropping any unrecognized id ----
  const puzzleA = await page.evaluate(() => CC.PUZZLES[0].id);
  const puzzleB = await page.evaluate(() => CC.PUZZLES[1].id);
  await page.goto(`${baseURL}/index.html?puzzles=${puzzleA},not-a-real-id,${puzzleB}`);
  await page.waitForSelector("#overview-title");
  const multiTitles = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list .related-card strong")).map(el => el.textContent)
  );
  assert.deepEqual(
    multiTitles,
    await page.evaluate(([a, b]) => [CC.PUZZLES.find(p => p.id === a).title, CC.PUZZLES.find(p => p.id === b).title], [puzzleA, puzzleB]),
    "&puzzles= should list exactly the recognized ids, in order, dropping the unrecognized one"
  );

  // All-unrecognized ids degrades to this visitor's default landing, not
  // an empty/broken overview -- checked generically for the same reason
  // as the unrecognized-category case above.
  await page.goto(`${baseURL}/index.html?puzzles=nope-1,nope-2`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  assert.ok(
    await page.evaluate(() => CC.PUZZLES.some(p => p.id === CC.state.puzzle.id)),
    "an all-unrecognized &puzzles= list should fall back to some valid puzzle from the catalog"
  );

  // ---- the overview's own Share button reproduces the same view ----
  await page.goto(`${baseURL}/index.html?puzzles=${puzzleA},${puzzleB}`);
  await page.waitForSelector("#overview-title");
  await page.click("#overview-share-btn");
  await page.waitForFunction(() => document.getElementById("overview-share-status").textContent.length > 0);
  const overviewShareUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  assert.deepEqual(
    overviewShareUrl.searchParams.get("puzzles").split(","),
    [puzzleA, puzzleB],
    "the overview's Share button should encode exactly the puzzles it's showing"
  );

  // ---- Library is always available, not gated on a puzzle being
  // loaded, and All Puzzles preserves the former drill-down
  // (categories, then that category's puzzles), reaching the same overview
  // ?category= does. The picker still works as a direct bypass while
  // any overview is showing (selecting a puzzle enters it directly). ----
  await page.goto(`${baseURL}/index.html?puzzle=${encodeURIComponent(puzzleId)}`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  const puzzleCategory = await page.evaluate(() => CC.state.puzzle.category);
  await page.click("#browse-puzzles");
  await page.waitForSelector("#overview-title");
  assert.equal(await page.textContent("#overview-title"), "Library", "Library should open the catalogue list");
  await page.locator('[data-catalogue-id="all"]').click();
  await page.waitForFunction(() =>
    document.getElementById("overview-title").textContent === "All Puzzles"
  );

  // Matched via an exact-text descendant, not the button's own
  // accessible name -- that name now also includes the card's
  // puzzle-count cue (e.g. "Science 4 puzzles →"), so a `getByRole`
  // exact match against just the category name no longer matches
  // anything. A loose substring match has its own problem: "Science" is
  // itself a substring of "Philosophy & Social Science", resolving to
  // two cards instead of one.
  await page.locator(".category-card", { has: page.getByText(puzzleCategory, { exact: true }) }).click();
  await page.waitForSelector("#overview-title");
  assert.equal(await page.textContent("#overview-title"), puzzleCategory, "clicking a category card should open that category's own overview");

  await page.selectOption("#puzzle-picker", { value: String(puzzleIndex) });
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => CC.state.puzzle.id), puzzleId, "the picker should still work as a direct bypass while an overview is showing");
  assert.equal(await page.locator("#puzzle-overview").isVisible(), false, "selecting from the picker should close the overview");

  // ---- finishing a puzzle solved via Show Solution offers to share its
  // related set when it has one (reuses the completion-screen section
  // covered more directly in the completion-screen's own feature, this
  // just confirms the share link it produces actually round-trips) ----
  const relatedPuzzleId = await page.evaluate(() => {
    const p = CC.PUZZLES.find(x => x.relatedPuzzles?.entries?.length);
    return p ? p.id : null;
  });
  if (relatedPuzzleId) {
    await page.goto(`${baseURL}/index.html?puzzle=${encodeURIComponent(relatedPuzzleId)}`);
    await page.waitForSelector("#puzzle-title:not(:empty)");
    await page.click("#show-solution");
    await page.waitForTimeout(150);
    await page.click(".related-share-link");
    await page.waitForFunction(() => document.querySelector(".related-share-link + [role=status]")?.textContent.length > 0);
    const relatedShareUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    const sharedIds = relatedShareUrl.searchParams.get("puzzles").split(",");
    assert.ok(sharedIds.includes(relatedPuzzleId), "sharing related puzzles should include the just-finished puzzle itself");
    assert.ok(sharedIds.length > 1, "sharing related puzzles should include at least one related puzzle too");
  }

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
