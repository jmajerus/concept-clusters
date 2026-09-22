import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { DOMAINS, domainForCategory } from "../puzzles/categories.js";
import {
  allPuzzlesCatalogue,
  catalogueById,
  categoriesForCatalogue
} from "../modules/catalogueRegistry.js";

export const name = "domains: category-browse cards grouped under domain headings, and domain catalogues";

async function waitForOverview(page, title) {
  await page.waitForFunction(expected =>
    document.querySelector("#puzzle-overview")?.classList.contains("shown") &&
    document.getElementById("overview-title")?.textContent === expected,
  title);
}

export async function run(page, baseURL) {
  // Most registered categories have a domain drawn from the fixed
  // vocabulary. Sciences, Mathematics, Computer Science, Data Science, and
  // Engineering were originally five separate domains, consolidated to two
  // for parity with how broadly Social Sciences/Humanities/Art & Design
  // already bundle comparably distinct fields -- see
  // docs/TAXONOMY-ROADMAP.md. Film was unregistered (and landed in "Other
  // subjects") until it was given a home under Art & Design alongside Art
  // and Music, matching the roadmap's own note that "film... will likely
  // arrive as sibling categories" there.
  assert.equal(Object.keys(DOMAINS).length, 12);
  assert.equal(domainForCategory("Computer Science"), "computing-engineering");
  assert.equal(domainForCategory("Engineering"), "computing-engineering");
  assert.equal(domainForCategory("Science"), "sciences-mathematics");
  // Biology split into its own Life Sciences domain once its puzzle count
  // justified it -- see docs/TAXONOMY-ROADMAP.md's 2026-09-16 update.
  assert.equal(domainForCategory("Biology"), "life-sciences");
  assert.equal(domainForCategory("Physics"), "sciences-mathematics");
  assert.equal(domainForCategory("Math"), "sciences-mathematics");
  assert.equal(domainForCategory("Music"), "art-design");
  assert.equal(domainForCategory("Film"), "art-design");
  // Trivia and Vocabulary are deliberate exceptions: registered (so they
  // have authored subtitles) but permanently domain-less, since both cut
  // across disciplinary homes rather than belonging to one.
  assert.equal(domainForCategory("Trivia"), null);
  assert.equal(domainForCategory("Vocabulary"), null);
  assert.equal(domainForCategory("not-a-real-category"), null);

  // Literature & Classics is registered so Literary Theory & Poetics can
  // claim it; Education & Teaching was removed from the vocabulary when
  // that slot was reused. Domains with no assigned categories must never
  // appear as empty headings (see docs/TAXONOMY-ROADMAP.md).
  const allCatalogue = allPuzzlesCatalogue(PUZZLES);
  const allCategories = categoriesForCatalogue(allCatalogue, PUZZLES);
  const representedDomains = new Set(
    allCategories.map(name => domainForCategory(name)).filter(Boolean)
  );
  assert.ok(representedDomains.has("literature-classics"));
  assert.ok(!Object.hasOwn(DOMAINS, "education-teaching"));

  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  // A catalogue spanning several domains, each with just one or two
  // categories, shows headings alphabetically by title -- not curated --
  // so the list carries no implied ranking between subjects, each
  // heading followed only by its own categories. Domain grouping (and
  // per-category inlining) only applies at all for an unordered
  // catalogue now (isOrderedCatalogue in overviewRenderer.js): Concept
  // Lenses is ordered like most, so its own overview is fully inlined
  // regardless of its 8 puzzles -- mutating it unordered here (same
  // technique used in tests/catalogues.mjs) reaches the domain-grouped
  // rendering this checks. Every one of its categories is small enough
  // to inline once unordered (none exceed
  // INLINE_PUZZLE_LIST_THRESHOLD), so this exercises domain headings
  // over inline category groups, not cards -- the card case (a category
  // above the threshold, staying a card even once unordered) is checked
  // on the Humanities domain catalogue below.
  await page.goto(`${baseURL}/index.html?catalogue=concept-lenses`);
  await waitForOverview(page, "Concept Lenses");
  await page.evaluate(() => {
    CC.CATALOGUES.find(c => c.id === "concept-lenses").ordered = false;
  });
  await page.click("#browse-puzzles");
  await waitForOverview(page, "Library");
  await page.locator('[data-catalogue-id="concept-lenses"]').click();
  await waitForOverview(page, "Concept Lenses");
  const groups = await page.evaluate(() =>
    Array.from(document.querySelectorAll(
      "#overview-list .domain-group-heading, #overview-list .category-group-heading"
    )).map(element => ({
      kind: element.classList.contains("domain-group-heading") ? "heading" : "category",
      text: element.textContent
    }))
  );
  assert.deepEqual(groups, [
    { kind: "heading", text: "Communication & Media" },
    { kind: "category", text: "Media & Information Literacy" },
    { kind: "heading", text: "Earth & Environment" },
    { kind: "category", text: "Physical Geography" },
    { kind: "heading", text: "Health & Medicine" },
    { kind: "category", text: "Physiology & Medicine" },
    { kind: "heading", text: "Humanities" },
    { kind: "category", text: "History & Society" },
    { kind: "category", text: "Humanities" }
  ]);

  // A single category's own overview (reached directly here, since
  // Concept Lenses' categories are inline groups, not cards to click
  // through, once unordered) has no domain headings of its own --
  // domain grouping is purely visual on the catalogue-overview screen,
  // not a new navigation level.
  await page.goto(`${baseURL}/index.html?catalogue=concept-lenses&category=humanities`);
  await waitForOverview(page, "Humanities");
  assert.equal(new URL(page.url()).searchParams.get("category"), "humanities");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "concept-lenses");
  assert.equal(
    await page.locator(".domain-group-heading").count(),
    0,
    "a single category's own overview has no domain headings of its own"
  );

  // Trivia and Vocabulary are the currently-registered categories with no
  // domain, and they're meant to stay that way permanently (see the
  // registrations in puzzles/categories.js) -- so "All Puzzles", the
  // broadest catalogue there is, always shows one "Other subjects" group,
  // positioned after every real domain heading (see
  // docs/TAXONOMY-ROADMAP.md: "must not render as empty headings" --
  // the flip side being it must render whenever it's genuinely non-empty).
  await page.goto(`${baseURL}/index.html?catalogue=all`);
  await waitForOverview(page, "All Puzzles");
  const allGroups = await page.evaluate(() =>
    Array.from(document.querySelectorAll(
      "#overview-list .domain-group-heading"
    )).map(element => element.textContent)
  );
  assert.equal(allGroups.length, 13, "12 represented domains plus Other subjects");
  assert.equal(allGroups.at(-1), "Other subjects");
  // All Puzzles is an ordered catalogue like any other by default
  // (isOrderedCatalogue doesn't special-case the two synthetic catalogues),
  // so per-category inlining doesn't apply here either: both categories stay
  // .category-card entries grouped under "Other subjects".
  const otherCards = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll(".domain-group-heading"));
    const other = headings.find(h => h.textContent === "Other subjects");
    return Array.from(
      other.nextElementSibling.querySelectorAll(".category-card")
    ).map(card => card.dataset.category);
  });
  assert.deepEqual(otherCards, ["trivia", "vocabulary"]);

  // --- domain catalogues on the Library --------------------------------
  // The Library is sectioned: the whole-collection entry points unheaded,
  // then every represented domain under "Subject areas" (the breadth of
  // the collection, visible before any click), then curated catalogues.
  await page.click("#browse-puzzles");
  await waitForOverview(page, "Library");
  const librarySections = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list > *")).map(element =>
      element.classList.contains("overview-section-heading")
        ? { heading: element.textContent }
        : { cards: Array.from(element.querySelectorAll(".catalogue-card")).map(card => card.dataset.catalogueId) }
    )
  );
  assert.equal(librarySections[0].cards[0], "all");
  assert.deepEqual(librarySections[1], { heading: "Subject areas" });
  const domainCards = librarySections[2].cards;
  assert.equal(domainCards.length, 12, "every represented domain, none empty");
  assert.ok(domainCards.every(id => id.startsWith("domain-")));
  // Alphabetical by title, same no-implied-ranking rule as the headings.
  const domainTitle = id => DOMAINS[id.slice("domain-".length)].title;
  assert.deepEqual(
    domainCards,
    [...domainCards].sort((a, b) => domainTitle(a).localeCompare(domainTitle(b)))
  );
  assert.deepEqual(librarySections[3], { heading: "Catalogues" });
  assert.ok(librarySections[4].cards.includes("getting-started"));
  assert.ok(!librarySections[4].cards.some(id => id.startsWith("domain-")));
  // No "New" badge on a domain card -- same reasoning as All Puzzles.
  assert.equal(
    await page.locator('.catalogue-card[data-catalogue-id^="domain-"] .badge-new').count(),
    0
  );

  // A domain catalogue's overview: its own title, the domain's own
  // description, and a subject list scoped to that domain -- no domain
  // heading (it would repeat the title) and no foreign category dragged
  // in by a cross-listed member.
  await page.locator('[data-catalogue-id="domain-humanities"]').click();
  await waitForOverview(page, "Humanities");
  assert.equal(new URL(page.url()).searchParams.get("catalogue"), "domain-humanities");
  assert.equal(await page.locator("#overview-list .domain-group-heading").count(), 0);
  const humanitiesCards = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list .category-card[data-category]"))
      .map(card => card.dataset.category)
  );
  assert.ok(humanitiesCards.includes("philosophy"));
  assert.ok(!humanitiesCards.includes("psychology"), "cross-listed member's foreign category stays out");
  for (const slug of humanitiesCards) {
    assert.equal(
      domainForCategory(slug), "humanities",
      `${slug} shown inside the Humanities catalogue`
    );
  }
  // A category above INLINE_PUZZLE_LIST_THRESHOLD stays a card even in
  // an unordered catalogue (History & Society, 26 puzzles), with the
  // category's own info on hover/focus; a category at or below it
  // (Humanities at 6, Religion at 1) inlines under a heading instead.
  assert.ok(humanitiesCards.includes("history-society"));
  assert.ok(!humanitiesCards.includes("humanities"));
  assert.ok(!humanitiesCards.includes("religion"));
  assert.deepEqual(
    await page.locator("#overview-list .category-group-heading").allTextContents(),
    ["Humanities", "Religion"]
  );
  await page.locator('[data-category="history-society"]').focus();
  assert.equal(
    await page.evaluate(() => document.getElementById("term-info").parentElement.id),
    "puzzle-overview"
  );
  assert.match(await page.textContent("#term-info"), /built, governed, and upended/i);

  // A domain whose partition is a single category inlines it regardless
  // of size -- Communication & Media's one category has 10 puzzles,
  // above INLINE_PUZZLE_LIST_THRESHOLD, but a lone card is a click that
  // can only go one place (isSoleCategory in overviewRenderer.js).
  await page.goto(`${baseURL}/index.html?catalogue=domain-communication-media`);
  await waitForOverview(page, "Communication & Media");
  assert.equal(await page.locator("#overview-list .category-card[data-category]").count(), 0);
  assert.deepEqual(
    await page.locator("#overview-list .category-group-heading").allTextContents(),
    ["Media & Information Literacy"]
  );
  assert.equal(await page.locator("#overview-list [data-puzzle-id]").count(), 10);
  // ...and with every puzzle already on screen, no "All puzzles" card
  // either (everyCategoryInlines); the view=all route still resolves.
  assert.equal(await page.locator(".catalogue-all-card").count(), 0);
  await page.goto(`${baseURL}/index.html?catalogue=domain-communication-media&view=all`);
  await waitForOverview(page, "All puzzles in Communication & Media");
  await page.goto(`${baseURL}/index.html?catalogue=domain-humanities`);
  await waitForOverview(page, "Humanities");
  // Humanities keeps two cards, so its "All puzzles" card stays.
  assert.equal(await page.locator(".catalogue-all-card").count(), 1);

  // Its flat list groups by category (like All Puzzles) with no domain
  // headings, every member exactly once.
  await page.locator(".catalogue-all-card").click();
  await waitForOverview(page, "All puzzles in Humanities");
  assert.equal(new URL(page.url()).searchParams.get("view"), "all");
  assert.equal(await page.locator("#overview-list .domain-group-heading").count(), 0);
  assert.ok(await page.locator("#overview-list .category-group-heading").count() >= 3);
  const listedIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#overview-list [data-puzzle-id]")).map(card => card.dataset.puzzleId)
  );
  assert.equal(new Set(listedIds).size, listedIds.length, "each member listed once");
  const humanitiesCatalogue = catalogueById("domain-humanities", PUZZLES);
  assert.equal(listedIds.length, humanitiesCatalogue.entries.length);

  // The header picker lists domain catalogues under "Subject areas" and
  // tracks the one being browsed.
  assert.equal(
    await page.evaluate(() => document.querySelector("#puzzle-picker").value),
    "catalogue:domain-humanities"
  );
  assert.equal(
    await page.evaluate(() =>
      document.querySelector('#puzzle-picker optgroup[label="Subject areas"]').children.length
    ),
    12
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
