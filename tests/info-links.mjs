import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { buildNodesAndLinks } from "../modules/puzzleGraph.js";
import { formatCitation, normalizeInfo, parseWikiShorthand, resolveLink, searchLinkForTerm } from "../modules/termInfo.js";

export const name = "info links: primary, see also, and legacy compatibility";

async function waitForPuzzle(page, id) {
  await page.waitForFunction(expected =>
    window.CC?.state?.puzzle?.id === expected &&
    !document.querySelector("#puzzle-view")?.classList.contains("hidden"),
  id);
}

export async function run(page, baseURL) {
  assert.equal(searchLinkForTerm("negative feedback"), null);
  assert.equal(searchLinkForTerm("negative feedback", "reference"), null);
  assert.equal(searchLinkForTerm("how far to go", "connector"), null);

  assert.deepEqual(parseWikiShorthand("wiki:Irony#Dramatic irony"), {
    title: "Irony",
    section: "Dramatic irony"
  });
  assert.equal(
    resolveLink("wiki:Irony#Dramatic irony"),
    "https://en.wikipedia.org/wiki/Irony#Dramatic_irony"
  );
  assert.equal(resolveLink("wiki:Ethos"), "https://en.wikipedia.org/wiki/Ethos");
  assert.doesNotMatch(resolveLink("wiki:Irony#Dramatic irony"), /%23/);

  const noInheritedClusterLink = buildNodesAndLinks({
    clusters: [
      {
        name: "Ethos",
        color: "teal",
        fact: "Ethos persuades through character.",
        seeds: ["credibility", "character"],
        terms: ["credibility", "character", "goodwill"],
        info: { link: "wiki:Ethos" },
        termInfo: {
          credibility: { text: "The audience's judgment that the speaker can be believed.", link: "wiki:Ethos#Rhetoric" },
          goodwill: { text: "Eunoia.", link: "wiki:Eunoia" }
        }
      },
      {
        name: "Pathos",
        color: "blue",
        fact: "Pathos persuades through emotion.",
        seeds: ["emotion", "sympathy"],
        terms: ["emotion", "sympathy"],
        info: { link: "wiki:Pathos" }
      }
    ],
    bridges: []
  }).nodes;
  const byWord = Object.fromEntries(
    noInheritedClusterLink.map(node => [node.word, node])
  );
  assert.match(byWord.credibility.info.link, /Ethos#Rhetoric/);
  assert.equal(byWord.character.info.link, null);
  assert.match(byWord.goodwill.info.link, /Eunoia/);
  assert.equal(byWord.emotion.info.link, null);

  const connectorPuzzle = PUZZLES.find(candidate =>
    candidate.id === "the-quiet-rebellion"
  );
  const connectorNodes = buildNodesAndLinks(connectorPuzzle).nodes.filter(node =>
    node.gs.length > 1
  );
  assert.deepEqual(
    connectorNodes.map(node => [node.word, node.termRole]),
    [
      ["how far to go", "connector"],
      ["beyond compliance", "connector"],
      ["taken seriously", "connector"]
    ]
  );

  const legacy = normalizeInfo({
    text: "Legacy shape",
    link: "wiki:Business ethics",
    extraLink: "wiki:Professional ethics"
  });
  assert.equal(legacy.link.includes("Business_ethics"), true);
  assert.equal(legacy.extraLink.includes("Professional_ethics"), true);
  assert.deepEqual(legacy.seeAlso, [
    {
      href: "https://en.wikipedia.org/wiki/Professional_ethics",
      label: null
    }
  ]);

  const normalized = normalizeInfo({
    link: "https://example.com/primary",
    linkLabel: "Primary source",
    extraLink: "https://example.com/legacy",
    seeAlso: [
      { href: "https://example.com/labeled", label: "Labeled source" },
      "wiki:Business ethics",
      "https://example.com/primary",
      "https://example.com/legacy"
    ]
  });
  assert.equal(normalized.linkLabel, "Primary source");
  assert.deepEqual(normalized.seeAlso, [
    { href: "https://example.com/legacy", label: null },
    { href: "https://example.com/labeled", label: "Labeled source" },
    { href: "https://en.wikipedia.org/wiki/Business_ethics", label: null }
  ]);

  // Unlike seeAlso, a citation is always a structured object -- a
  // bare string, and an object missing the required title, both get
  // dropped rather than kept.
  const withCitation = normalizeInfo({
    text: "Test",
    citations: [
      { title: "Only a title" },
      {
        author: "Carse, James P.",
        title: "Finite and Infinite Games",
        publisher: "Free Press",
        year: "1986",
        url: "wiki:Finite and Infinite Games"
      },
      { author: "No title, dropped" },
      "a bare string, dropped since citations must be objects"
    ]
  });
  assert.equal(withCitation.citations.length, 2);
  assert.equal(formatCitation(withCitation.citations[0]), "Only a title.");
  assert.equal(
    formatCitation(withCitation.citations[1]),
    "Carse, James P. Finite and Infinite Games. Free Press, 1986."
  );
  assert.ok(withCitation.citations[1].url.includes("Finite_and_Infinite_Games"));
  // A bare page number gets an automatic "pp." label; an
  // already-labeled one passes through untouched.
  assert.equal(formatCitation({ title: "T", pages: "45-47" }), "T. pp. 45-47.");
  assert.equal(formatCitation({ title: "T", pages: "p. 12" }), "T. p. 12.");

  const puzzle = PUZZLES.find(candidate =>
    candidate.id === "restoring-honest-choice"
  );
  assert.ok(puzzle);
  assert.equal(puzzle.info.linkLabel, "ACM Code of Ethics");
  assert.equal(puzzle.info.seeAlso.length, 3);

  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(
    `${baseURL}/index.html?puzzle=restoring-honest-choice`
  );
  await waitForPuzzle(page, "restoring-honest-choice");

  const expectedLabels = [
    "ACM Code of Ethics ↗",
    "FTC negative-option rule ↗",
    "FTC enforcement ↗",
    "AACSB business-education standards ↗"
  ];
  assert.deepEqual(
    await page.locator("#puzzle-info a").allTextContents(),
    expectedLabels
  );
  assert.match(await page.locator("#puzzle-info").textContent(), /See also:/);

  await page.hover("#puzzle-title");
  await page.waitForFunction(() =>
    document.getElementById("term-info")?.classList.contains("visible")
  );
  assert.deepEqual(
    await page.locator("#term-info a").allTextContents(),
    expectedLabels
  );
  assert.match(await page.locator("#term-info").textContent(), /See also:/);

  // A real citation (Carse's book, no url -- plain text, not a link)
  // on finite-and-infinite-games's puzzle-level info, checked both on
  // the permanent subtitle and the title-hover popover -- the latter
  // is what actually proves #term-info's flex-direction: column fix
  // stacks the citation below the rest of the popover rather than
  // beside it.
  await page.goto(`${baseURL}/index.html?puzzle=finite-and-infinite-games`);
  await waitForPuzzle(page, "finite-and-infinite-games");
  const expectedCitation = "Carse, James P. Finite and Infinite Games: A Vision of Life as Play and Possibility. Free Press, 1986.";
  assert.match(
    await page.locator("#puzzle-info .citations").textContent(),
    new RegExp(expectedCitation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
  assert.equal(await page.locator("#puzzle-info .citations a").count(), 0);

  await page.hover("#puzzle-title");
  await page.waitForFunction(() =>
    document.getElementById("term-info")?.classList.contains("visible")
  );
  assert.match(
    await page.locator("#term-info .citations").textContent(),
    new RegExp(expectedCitation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );

  // Contextual bridge wording is useful on the board but not as a raw
  // Wikipedia query. With no authored info of its own, hovering a connector
  // should neither synthesize a Search link nor leave an empty panel open.
  await page.goto(`${baseURL}/index.html?puzzle=the-quiet-rebellion`);
  await waitForPuzzle(page, "the-quiet-rebellion");
  await page.locator(".node").filter({ hasText: "how far to go" }).hover();
  assert.equal(await page.locator("#term-info a").count(), 0);
  assert.equal(
    await page.locator("#term-info").evaluate(element =>
      element.classList.contains("visible")
    ),
    false
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
