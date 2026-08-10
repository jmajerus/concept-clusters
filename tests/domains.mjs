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
  // so the list carries no implied ranking between subjects, each heading
  // followed only by its own categories.
  await page.goto(`${baseURL}/index.html?catalogue=concept-lenses`);
  await waitForOverview(page, "Concept Lenses");
  const groups = await page.evaluate(() =>
    Array.from(document.querySelectorAll(
      "#overview-list .domain-group-heading, #overview-list .category-card[data-category]"
    )).map(element => ({
      kind: element.classList.contains("domain-group-heading") ? "heading" : "card",
      text: element.classList.contains("domain-group-heading")
        ? element.textContent
        : element.dataset.category
    }))
  );
  assert.deepEqual(groups, [
    { kind: "heading", text: "Communication & Media" },
    { kind: "card", text: "media-information-literacy" },
    { kind: "heading", text: "Earth & Environment" },
    { kind: "card", text: "geography" },
    { kind: "heading", text: "Health & Medicine" },
    { kind: "card", text: "physiology-medicine" },
    { kind: "heading", text: "Humanities" },
    { kind: "card", text: "history-society" },
    { kind: "card", text: "humanities" }
  ]);

  // Clicking a category card under a domain heading still navigates to the
  // exact same category route it always has -- domain grouping is purely
  // visual, not a new navigation level.
  await page.locator('.category-card[data-category="humanities"]').click();
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
