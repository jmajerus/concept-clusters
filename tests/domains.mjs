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
  // vocabulary; the deliberately-unregistered "Film" has none. Sciences,
  // Mathematics, Computer Science, Data Science, and Engineering were
  // originally five separate domains, consolidated to two for parity with
  // how broadly Social Sciences/Humanities/Art & Design already bundle
  // comparably distinct fields -- see docs/TAXONOMY-ROADMAP.md.
  assert.equal(Object.keys(DOMAINS).length, 11);
  assert.equal(domainForCategory("Computer Science"), "computing-engineering");
  assert.equal(domainForCategory("Engineering"), "computing-engineering");
  assert.equal(domainForCategory("Science"), "sciences-mathematics");
  assert.equal(domainForCategory("Math"), "sciences-mathematics");
  assert.equal(domainForCategory("Music"), "art-design");
  assert.equal(domainForCategory("Film"), null);
  assert.equal(domainForCategory("not-a-real-category"), null);

  // Education & Teaching is a registered domain with no categories assigned
  // to it yet -- it must never appear as a heading (see
  // docs/TAXONOMY-ROADMAP.md: "must not render as empty headings").
  const allCatalogue = allPuzzlesCatalogue(PUZZLES);
  const allCategories = categoriesForCatalogue(allCatalogue, PUZZLES);
  const representedDomains = new Set(
    allCategories.map(domainForCategory).filter(Boolean)
  );
  assert.ok(!representedDomains.has("education-teaching"));
  assert.ok(allCategories.includes("Film"), "fixture assumption: Film is in use");
  assert.equal(domainForCategory("Film"), null, "Film stays domain-less, not silently defaulted");

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

  // The only catalogue containing the unregistered "Film" category shows an
  // "Other subjects" heading, positioned after every real domain heading.
  await page.goto(`${baseURL}/index.html?catalogue=all`);
  await waitForOverview(page, "All Puzzles");
  const allGroups = await page.evaluate(() =>
    Array.from(document.querySelectorAll(
      "#overview-list .domain-group-heading"
    )).map(element => element.textContent)
  );
  assert.equal(allGroups.length, 11, "10 represented domains plus Other subjects");
  assert.equal(allGroups.at(-1), "Other subjects");
  const otherCards = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll(".domain-group-heading"));
    const other = headings.find(h => h.textContent === "Other subjects");
    return other.nextElementSibling.querySelectorAll(".category-card").length;
  });
  assert.equal(otherCards, 1);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
