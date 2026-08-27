import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { buildNodesAndLinks } from "../modules/puzzleGraph.js";
import { authoredLinks, canonicalizeDocumentInfoLinks, canonicalizeInfoLinks, formatCitation, normalizeInfo, parseWikiShorthand, resolveLink, searchLinkForTerm } from "../modules/termInfo.js";
import { puzzleForCanonicalPublication } from "../modules/puzzleSimplified.js";
import { documentForDraftStore, draftForAuthoring, SAVE_TO_CANONICALIZE_FLAG_ID, storedDocumentNeedsCanonicalSave, withStorageCanonicalizeFlags } from "../modules/authoredPuzzleDocument.js";

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

  const native = normalizeInfo({
    text: "Native links",
    links: [
      { href: "https://example.com/primary", label: "Primary source" },
      "wiki:Business ethics"
    ]
  });
  assert.equal(native.link, "https://example.com/primary");
  assert.equal(native.linkLabel, "Primary source");
  assert.equal(native.links.length, 2);
  assert.equal(native.seeAlso.length, 1);
  assert.equal(native.seeAlso[0].href, "https://en.wikipedia.org/wiki/Business_ethics");

  assert.deepEqual(authoredLinks({
    link: "wiki:Ethos",
    extraLink: "https://example.com/extra"
  }), [
    { href: "wiki:Ethos" },
    { href: "https://example.com/extra" }
  ]);
  assert.deepEqual(authoredLinks({
    links: [{ href: "wiki:Ethos", label: "Ethos" }],
    link: "https://example.com/should-not-duplicate-if-same",
    extraLink: "wiki:Pathos"
  }), [
    { href: "wiki:Ethos", label: "Ethos" },
    { href: "https://example.com/should-not-duplicate-if-same" },
    { href: "wiki:Pathos" }
  ]);

  assert.deepEqual(canonicalizeInfoLinks({
    text: "Note.",
    link: "wiki:Ethos",
    extraLink: "https://example.com/extra",
    seeAlso: [{ href: "wiki:Pathos", label: "Pathos" }]
  }), {
    text: "Note.",
    links: [
      { href: "wiki:Ethos" },
      { href: "https://example.com/extra" },
      { href: "wiki:Pathos", label: "Pathos" }
    ]
  });
  const alreadyCanonical = { text: "Note.", links: [{ href: "wiki:Ethos" }] };
  assert.equal(canonicalizeInfoLinks(alreadyCanonical), alreadyCanonical);
  assert.equal(canonicalizeInfoLinks("plain string"), "plain string");

  const migrated = canonicalizeDocumentInfoLinks({
    title: "Draft",
    info: { link: "wiki:Ethos" },
    clusters: [{
      id: "alpha",
      termInfo: { a: { text: "A.", extraLink: "wiki:Pathos" } }
    }],
    bridges: [{ id: "link", info: { link: "wiki:Logos", seeAlso: ["wiki:Kairos"] } }],
    relatedPuzzles: { info: { extraLink: "wiki:Related" }, entries: [{ id: "other", reason: "pair" }] }
  });
  assert.deepEqual(migrated.info, { links: [{ href: "wiki:Ethos" }] });
  assert.deepEqual(migrated.clusters[0].termInfo.a, {
    text: "A.",
    links: [{ href: "wiki:Pathos" }]
  });
  assert.deepEqual(migrated.bridges[0].info, {
    links: [{ href: "wiki:Logos" }, { href: "wiki:Kairos" }]
  });
  assert.deepEqual(migrated.relatedPuzzles.info, {
    links: [{ href: "wiki:Related" }]
  });

  const lessonMigrated = canonicalizeDocumentInfoLinks({
    title: "Draft",
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." },
      sources: [{ label: "Handout", href: "https://example.org/handout" }]
    }
  });
  assert.deepEqual(lessonMigrated.learningIntroduction.links, [
    { href: "https://example.org/handout", label: "Handout" }
  ]);
  assert.equal(lessonMigrated.learningIntroduction.sources, undefined);

  const stored = documentForDraftStore({
    id: "legacy-links",
    title: "Legacy",
    category: "Test",
    info: { text: "Note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" },
    clusters: []
  });
  assert.deepEqual(stored.document.info, {
    text: "Note.",
    links: [{ href: "wiki:Ethos" }, { href: "wiki:Pathos" }]
  });
  assert.equal(stored.document.info.link, undefined);

  const leftoverRead = draftForAuthoring({
    draftId: "legacy-links",
    revision: 1,
    contentHash: "sha256:stored-leftover",
    document: {
      id: "legacy-links",
      title: "Legacy",
      category: "Test",
      info: { text: "Note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" },
      clusters: []
    }
  });
  assert.deepEqual(leftoverRead.document.info, {
    text: "Note.",
    links: [{ href: "wiki:Ethos" }, { href: "wiki:Pathos" }]
  });
  assert.equal(leftoverRead.contentHash, "sha256:stored-leftover");
  assert.equal(leftoverRead.revision, 1);
  assert.equal(storedDocumentNeedsCanonicalSave(leftoverRead.document), false);
  assert.equal(storedDocumentNeedsCanonicalSave({
    id: "legacy-links",
    title: "Legacy",
    category: "Test",
    info: { text: "Note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" },
    clusters: []
  }), true);
  const flagged = withStorageCanonicalizeFlags(
    { info: { link: "wiki:Ethos" } },
    { valid: true, errors: [], flags: [] }
  );
  assert.equal(flagged.valid, true);
  assert.equal(flagged.flags[0].id, SAVE_TO_CANONICALIZE_FLAG_ID);
  assert.deepEqual(
    withStorageCanonicalizeFlags(
      { info: { text: "Note.", links: [{ href: "wiki:Ethos" }] } },
      { valid: true, errors: [], flags: [] }
    ).flags,
    []
  );

  const storedEscapedLesson = documentForDraftStore({
    id: "escaped-lesson-newlines",
    title: "Escaped lesson",
    category: "Test",
    clusters: [],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "# Title\\n\\n## Section\\nBody." }
    }
  });
  assert.equal(
    storedEscapedLesson.document.learningIntroduction.content.text,
    "# Title\n\n## Section\nBody."
  );
  assert.equal(storedDocumentNeedsCanonicalSave({
    id: "escaped-lesson-newlines",
    title: "Escaped lesson",
    category: "Test",
    clusters: [],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "# Title\\n\\n## Section\\nBody." }
    }
  }), false);

  const storedLesson = documentForDraftStore({
    id: "legacy-lesson-links",
    title: "Legacy lesson",
    category: "Test",
    clusters: [],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." },
      sources: [{ label: "Handout", href: "https://example.org/handout" }]
    }
  });
  assert.deepEqual(storedLesson.document.learningIntroduction.links, [
    { href: "https://example.org/handout", label: "Handout" }
  ]);
  assert.equal(storedLesson.document.learningIntroduction.sources, undefined);

  const hoisted = documentForDraftStore({
    id: "nested-citations",
    title: "Nested",
    category: "Test",
    info: { text: "Puzzle note." },
    clusters: [{
      name: "Alpha",
      info: {
        text: "Cluster note.",
        citations: [{ title: "On Violence", author: "Hannah Arendt", year: "1970" }]
      },
      termInfo: {
        a: { text: "A.", citations: [{ title: "On Violence", author: "Hannah Arendt", year: "1970" }] }
      }
    }],
    bridges: [{
      term: "link",
      info: { citations: [{ title: "The Human Condition", author: "Hannah Arendt" }] }
    }]
  });
  assert.deepEqual(hoisted.document.info.citations, [
    { title: "On Violence", author: "Hannah Arendt", year: "1970" },
    { title: "The Human Condition", author: "Hannah Arendt" }
  ]);
  assert.equal(hoisted.document.clusters[0].info.citations, undefined);
  assert.equal(hoisted.document.clusters[0].termInfo.a.citations, undefined);
  assert.equal(hoisted.document.bridges[0].info, undefined);

  const lessonFolded = documentForDraftStore({
    id: "lesson-citations",
    title: "Lesson cites",
    category: "Test",
    info: {
      text: "Puzzle note.",
      citations: [{ title: "Already on puzzle", author: "A" }]
    },
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." },
      citations: [
        { title: "Already on puzzle", author: "A" },
        { title: "Only on lesson", author: "B" }
      ]
    },
    clusters: [{ name: "Alpha", seeds: ["a", "b"], floatingTerms: ["c"], fact: "F." }]
  });
  assert.deepEqual(lessonFolded.document.info.citations, [
    { title: "Already on puzzle", author: "A" },
    { title: "Only on lesson", author: "B" }
  ]);
  assert.equal(lessonFolded.document.learningIntroduction.citations, undefined);


  const published = puzzleForCanonicalPublication({
    id: "canonical-write",
    title: "Canonical write",
    category: "Science",
    info: { text: "Puzzle note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" },
    clusters: [{
      id: "alpha",
      name: "Alpha",
      color: "teal",
      fact: "Alpha fact.",
      seeds: ["a", "b"],
      terms: ["a", "b", "c"],
      info: { link: "wiki:Logos" },
      termInfo: { a: { text: "A.", seeAlso: ["wiki:Kairos"] } }
    }],
    bridges: [{
      id: "link",
      term: "link",
      clusters: [0],
      fact: "Bridge fact.",
      info: { link: "wiki:Nomos" }
    }]
  });
  assert.deepEqual(published.simplified.info, {
    text: "Puzzle note.",
    links: [{ href: "wiki:Ethos" }, { href: "wiki:Pathos" }]
  });
  assert.equal(published.simplified.info.link, undefined);
  assert.deepEqual(published.simplified.clusters[0].info, { links: [{ href: "wiki:Logos" }] });
  assert.deepEqual(published.simplified.clusters[0].termInfo.a, {
    text: "A.",
    links: [{ href: "wiki:Kairos" }]
  });
  assert.deepEqual(published.simplified.bridges[0].info, { links: [{ href: "wiki:Nomos" }] });
  assert.deepEqual(published.puzzle.info, published.simplified.info);

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
