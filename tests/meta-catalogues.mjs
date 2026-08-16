import assert from "node:assert/strict";

export const name = "meta catalogues: nested Library screen, suppression, breadcrumb, progress rollup";

const META_ID = "holding-it-together";
const CHILD_IDS = [
  "arrangements-that-hold",
  "loyalty-without-exit",
  "wholeness-and-its-discontents",
  "the-unspoken-organization"
];

// A second meta catalogue, chosen specifically because it carries a
// relatedCatalogues "see also" -- holding-it-together above has none, so
// this is the only fixture that exercises that section at all.
const RELATED_META_ID = "anatomy-of-coercion-and-conscience";
const RELATED_CATALOGUE_ID = "the-shape-of-power";

async function waitForOverview(page, title) {
  await page.waitForFunction(expected =>
    document.querySelector("#puzzle-overview")?.classList.contains("shown") &&
    document.getElementById("overview-title")?.textContent === expected,
  title);
}

// Mirrors tests/catalogues.mjs's own completeCurrentPuzzle -- not exported
// from there, so duplicated here rather than restructuring that module.
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

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  // The meta catalogue itself appears as one ordinary card on the Library
  // screen; its four children don't get their own cards there -- they're
  // suppressed for being nested under it (no showInLibrary override on any
  // of the four).
  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");
  const libraryIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".catalogue-card")).map(card => card.dataset.catalogueId)
  );
  assert.ok(libraryIds.includes(META_ID));
  for (const childId of CHILD_IDS) {
    assert.ok(!libraryIds.includes(childId), `${childId} should be suppressed from the Library screen`);
  }

  // The meta card's own progress/count is the deduped union of every
  // child's puzzles, not a count of its four (catalogue) entries.
  const expectedUnionCount = await page.evaluate((ids) => {
    const byId = new Map(CC.CATALOGUES.map(c => [c.id, c]));
    const seen = new Set();
    for (const childId of ids) {
      for (const entry of byId.get(childId).entries) seen.add(entry.id);
    }
    return seen.size;
  }, CHILD_IDS);
  const metaCardText = await page.locator(`[data-catalogue-id="${META_ID}"]`).textContent();
  assert.match(metaCardText, new RegExp(`\\b${expectedUnionCount} puzzles\\b`));

  // Clicking the meta card reuses the exact same card-list component the
  // Library screen itself uses, scoped to its four children -- not the
  // usual category-partition screen a leaf catalogue renders.
  await page.locator(`[data-catalogue-id="${META_ID}"]`).click();
  await waitForOverview(page, "Holding It Together");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), META_ID);
  const childCardIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list .catalogue-card")).map(card => card.dataset.catalogueId)
  );
  assert.deepEqual(childCardIds.sort(), [...CHILD_IDS].sort());
  // No "Browse by subject" category partitioning on a meta catalogue's own
  // screen -- it has no puzzles of its own, only children.
  assert.equal(await page.locator(".catalogue-all-card").count(), 0);

  // Navigating into a child from there lands on that catalogue's ordinary
  // screen (category-partition UI), with a three-level breadcrumb showing
  // the meta catalogue as an intermediate segment.
  await page.locator(`[data-catalogue-id="loyalty-without-exit"]`).click();
  await waitForOverview(page, "Loyalty Without Exit");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "loyalty-without-exit");
  // Loyalty Without Exit has 5 puzzles -- at the inline-expansion threshold
  // (see INLINE_PUZZLE_LIST_THRESHOLD in overviewRenderer.js), so its
  // puzzles show directly rather than behind an "All puzzles" card.
  assert.equal(await page.locator(".catalogue-all-card").count(), 0);
  assert.equal(await page.locator("#overview-list [data-puzzle-id]").count(), 5);
  assert.match(
    await page.textContent("#context-nav"),
    /Library.*Holding It Together.*Loyalty Without Exit/s
  );

  // The breadcrumb is derived from the registry, not carried through
  // navigation clicks -- a direct URL load (simulating a refresh or a
  // shared link) shows the same meta-parent segment.
  await page.goto(`${baseURL}/index.html?catalogue=loyalty-without-exit`);
  await waitForOverview(page, "Loyalty Without Exit");
  assert.match(
    await page.textContent("#context-nav"),
    /Library.*Holding It Together.*Loyalty Without Exit/s
  );

  // A catalogue that ISN'T nested under any meta gets no such segment.
  await page.goto(`${baseURL}/index.html?catalogue=getting-started`);
  await waitForOverview(page, "Getting Started");
  assert.doesNotMatch(await page.textContent("#context-nav"), /Holding It Together/);

  // Completing a puzzle inside one child updates the meta card's rollup
  // progress on the Library screen -- union semantics, computed fresh at
  // render time, not cached per catalogue.
  await page.goto(`${baseURL}/index.html?catalogue=loyalty-without-exit`);
  await waitForOverview(page, "Loyalty Without Exit");
  const firstPuzzleCard = page.locator("[data-puzzle-id]").first();
  await firstPuzzleCard.click();
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await completeCurrentPuzzle(page);

  await page.goto(`${baseURL}/index.html?library`);
  await waitForOverview(page, "Library");
  const metaCardTextAfter = await page.locator(`[data-catalogue-id="${META_ID}"]`).textContent();
  assert.match(metaCardTextAfter, /1 of \d+ completed/);

  // A meta catalogue's relatedCatalogues renders as a "See also" section
  // below its primary card list -- a real, clickable catalogue card, not
  // just descriptive text, and distinct from the primary entries above it.
  await page.goto(`${baseURL}/index.html?catalogue=${RELATED_META_ID}`);
  await waitForOverview(page, "Anatomy of Coercion & Conscience");
  const primaryIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list .catalogue-card")).map(card => card.dataset.catalogueId)
  );
  assert.ok(!primaryIds.includes(RELATED_CATALOGUE_ID),
    "the see-also catalogue should not also appear in the primary entries list");
  await page.waitForSelector("#overview-related-catalogues .related-heading");
  assert.equal(
    await page.textContent("#overview-related-catalogues .related-heading"),
    "See also"
  );
  const relatedIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-related-catalogues .catalogue-card")).map(card => card.dataset.catalogueId)
  );
  assert.deepEqual(relatedIds, [RELATED_CATALOGUE_ID]);
  await page.locator(`#overview-related-catalogues [data-catalogue-id="${RELATED_CATALOGUE_ID}"]`).click();
  await waitForOverview(page, "The Shape of Power");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), RELATED_CATALOGUE_ID);

  // The section is scoped to the meta catalogue that declares it -- a
  // plain catalogue, and a meta catalogue with no relatedCatalogues at
  // all, both show nothing there.
  await page.goto(`${baseURL}/index.html?catalogue=getting-started`);
  await waitForOverview(page, "Getting Started");
  assert.equal(await page.locator("#overview-related-catalogues").innerHTML(), "");
  await page.goto(`${baseURL}/index.html?catalogue=${META_ID}`);
  await waitForOverview(page, "Holding It Together");
  assert.equal(await page.locator("#overview-related-catalogues").innerHTML(), "");

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
