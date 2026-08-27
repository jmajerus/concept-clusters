import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { DOMAINS, domainForCategory } from "../puzzles/categories.js";
import {
  allPuzzlesCatalogue,
  categoriesForCatalogue
} from "../modules/catalogueRegistry.js";

export const name = "domains: category-browse cards grouped under domain headings";

async function waitForOverview(page, title) {
  await page.waitForFunction(expected =>
    document.querySelector("#puzzle-overview")?.classList.contains("shown") &&
    document.getElementById("overview-title")?.textContent === expected,
  title);
}

export async function run(page, baseURL) {
  // Every registered category has a domain drawn from the fixed
  // vocabulary. Sciences, Mathematics, Computer Science, Data Science, and
  // Engineering were originally five separate domains, consolidated to two
  // for parity with how broadly Social Sciences/Humanities/Art & Design
  // already bundle comparably distinct fields -- see
  // docs/TAXONOMY-ROADMAP.md. Film was unregistered (and landed in "Other
  // subjects") until it was given a home under Art & Design alongside Art
  // and Music, matching the roadmap's own note that "film... will likely
  // arrive as sibling categories" there.
  assert.equal(Object.keys(DOMAINS).length, 11);
  assert.equal(domainForCategory("Computer Science"), "computing-engineering");
  assert.equal(domainForCategory("Engineering"), "computing-engineering");
  assert.equal(domainForCategory("Science"), "sciences-mathematics");
  assert.equal(domainForCategory("Biology"), "sciences-mathematics");
  assert.equal(domainForCategory("Physics"), "sciences-mathematics");
  assert.equal(domainForCategory("Math"), "sciences-mathematics");
  assert.equal(domainForCategory("Music"), "art-design");
  assert.equal(domainForCategory("Film"), "art-design");
  // Trivia is the one deliberate exception: registered (so it has an
  // authored subtitle) but permanently domain-less, since trivia cuts
  // across every discipline rather than belonging to one.
  assert.equal(domainForCategory("Trivia"), null);
  assert.equal(domainForCategory("not-a-real-category"), null);

  // Literature & Classics is registered so Literary Theory & Poetics can
  // claim it; Education & Teaching was removed from the vocabulary when
  // that slot was reused. Domains with no assigned categories must never
  // appear as empty headings (see docs/TAXONOMY-ROADMAP.md).
  const allCatalogue = allPuzzlesCatalogue(PUZZLES);
  const allCategories = categoriesForCatalogue(allCatalogue, PUZZLES);
  const representedDomains = new Set(
    allCategories.map(domainForCategory).filter(Boolean)
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
  // above the threshold, staying a card even once unordered) is what
  // tests/catalogues.mjs's Media Literacy and Civic Reasoning covers.
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
    { kind: "category", text: "Geography" },
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

  // Trivia is the only currently-registered category with no domain, and
  // it's meant to stay that way permanently (see the comment above
  // Trivia's registration in puzzles/categories.js) -- so "All Puzzles",
  // the broadest catalogue there is, always shows exactly one "Other
  // subjects" card, positioned after every real domain heading (see
  // docs/TAXONOMY-ROADMAP.md: "must not render as empty headings" --
  // the flip side being it must render whenever it's genuinely non-empty).
  await page.goto(`${baseURL}/index.html?catalogue=all`);
  await waitForOverview(page, "All Puzzles");
  const allGroups = await page.evaluate(() =>
    Array.from(document.querySelectorAll(
      "#overview-list .domain-group-heading"
    )).map(element => element.textContent)
  );
  assert.equal(allGroups.length, 12, "11 represented domains plus Other subjects");
  assert.equal(allGroups.at(-1), "Other subjects");
  // Trivia currently has exactly 5 puzzles -- at INLINE_PUZZLE_LIST_THRESHOLD
  // (overviewRenderer.js) -- but All Puzzles is an ordered catalogue like
  // any other by default (isOrderedCatalogue doesn't special-case the two
  // synthetic catalogues), so per-category inlining doesn't apply here
  // either: Trivia stays a .category-card, the sole content grouped
  // under "Other subjects".
  const otherCards = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll(".domain-group-heading"));
    const other = headings.find(h => h.textContent === "Other subjects");
    return Array.from(
      other.nextElementSibling.querySelectorAll(".category-card")
    ).map(card => card.dataset.category);
  });
  assert.deepEqual(otherCards, ["trivia"]);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
