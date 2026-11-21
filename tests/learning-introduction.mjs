import assert from "node:assert/strict";

export const name = "learning introduction: lazy lesson, entry choice, and persistence";

const PUZZLE_ID = "from-evidence-to-action";

// game.js awaits its manifest import at top level, so `load` can fire
// before window.CC exists.
const ready = page => page.waitForFunction(() => window.CC?.state);

export async function run(page, baseURL) {
  const errors = [];
  const lessonRequests = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", request => {
    if (request.url().endsWith("from-evidence-to-action.intro.md")) {
      lessonRequests.push(request.url());
    }
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseURL}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph`);
  await ready(page);
  assert.equal(await page.evaluate(() => CC.state.learningGated), true);
  assert.equal(await page.isVisible("#learning-introduction #offer"), true);
  assert.equal(await page.isVisible("#board"), false);
  assert.equal(await page.isVisible("#show-solution"), false);
  assert.equal(await page.isVisible("#learning-review"), false);
  assert.equal(lessonRequests.length, 0, "lesson Markdown loaded before the learner requested it");
  assert.equal(await page.locator("#puzzle-picker").inputValue(), "");
  assert.equal(
    await page.locator("#puzzle-picker option:checked").textContent(),
    "Browse puzzles…"
  );

  await page.click("#learning-introduction #read");
  await page.waitForSelector("#learning-introduction #lesson h2");
  // Canonicalization inlined this lesson (content.text), so reading it is
  // a render, not a fetch; the request hook stays as a guard against a
  // stray .intro.md load for an inline lesson.
  assert.equal(lessonRequests.length, 0);
  assert.match(
    await page.textContent("#learning-introduction #lesson"),
    /A signal is not yet a cause/i
  );
  assert.match(
    await page.textContent("#learning-introduction #lesson blockquote"),
    /When should changing a public recommendation/i
  );
  assert.match(
    await page.textContent("#learning-introduction #assistance"),
    /Drafted with Claude/i
  );
  const unsafeMarkdown = await page.evaluate(async () => {
    const { renderSafeMarkdown } = await import("./modules/safeMarkdown.js");
    const host = document.createElement("div");
    host.appendChild(renderSafeMarkdown(
      '<img src=x onerror="window.__unsafeLessonRan=true">\n\n[unsafe](javascript:alert(1))',
      { baseUrl: location.href, resolveAssetUrl: value => value }
    ));
    return {
      text: host.textContent,
      images: host.querySelectorAll("img").length,
      links: host.querySelectorAll("a").length,
      executed: !!window.__unsafeLessonRan
    };
  });
  assert.equal(unsafeMarkdown.images, 0);
  assert.equal(unsafeMarkdown.links, 0);
  assert.equal(unsafeMarkdown.executed, false);
  assert.match(unsafeMarkdown.text, /<img src=x/);
  const lessonBlocks = await page.evaluate(async () => {
    const { renderSafeMarkdown } = await import("./modules/safeMarkdown.js");
    const host = document.createElement("div");
    host.appendChild(renderSafeMarkdown([
      "<!-- quote 12 -->",
      "::: {.epigraph}",
      "Words *matter*.",
      "",
      "— Someone, *Book*",
      ":::",
      "",
      "::: note.insight",
      "A **point**.",
      ":::",
      "",
      "::: {.note .definition}",
      "Term means this.",
      ":::",
      "",
      "::: sidebar.example",
      "- one",
      ":::",
      "",
      "::: note.warning",
      "Plain fallback.",
      ":::"
    ].join("\n"), { baseUrl: location.href, resolveAssetUrl: value => value }));
    const epigraph = host.querySelector("figure.lesson-block-epigraph");
    return {
      text: host.textContent,
      epigraphQuote: epigraph?.querySelector("blockquote")?.textContent.trim(),
      epigraphCaption: epigraph?.querySelector("figcaption")?.textContent,
      asides: [...host.querySelectorAll("aside.lesson-block")].map(aside => [
        aside.className, aside.getAttribute("aria-label"),
        aside.querySelector(".lesson-block-label")?.textContent
      ]),
      exampleItems: host.querySelectorAll("aside.lesson-block-example li").length,
      fallbackParagraph: [...host.children].some(node =>
        node.tagName === "P" && node.textContent === "Plain fallback.")
    };
  });
  assert.equal(lessonBlocks.epigraphQuote, "Words matter.");
  assert.equal(lessonBlocks.epigraphCaption, "— Someone, Book");
  assert.deepEqual(lessonBlocks.asides, [
    ["lesson-block lesson-block-insight", "Insight", "Insight"],
    ["lesson-block lesson-block-definition", "Definition", "Definition"],
    ["lesson-block lesson-block-example", "Example", "Example"]
  ]);
  assert.equal(lessonBlocks.exampleItems, 1);
  assert.equal(lessonBlocks.fallbackParagraph, true);
  assert.doesNotMatch(lessonBlocks.text, /quote 12|:::/);
  await page.click("#learning-introduction #finish");
  assert.equal(await page.evaluate(() => CC.state.learningGated), false);
  assert.equal(await page.isVisible("#board"), true);
  assert.equal(await page.isVisible("#show-solution"), true);
  assert.equal(
    await page.evaluate(id => {
      const key = Object.keys(localStorage)
        .find(candidate => candidate.endsWith(`:${id}`) && candidate.startsWith("ccLearningIntroduction:"));
      return key ? JSON.parse(localStorage.getItem(key)).status : null;
    }, PUZZLE_ID),
    "read"
  );

  await page.reload();
  await ready(page);
  assert.equal(await page.evaluate(() => CC.state.learningGated), false);
  assert.equal(await page.textContent("#learning-review"), "Lesson");
  assert.equal(await page.getAttribute("#learning-review", "title"), "Review introduction");
  const compactControl = await page.evaluate(() => {
    const mode = document.getElementById("mode-sets").getBoundingClientRect();
    const lesson = document.getElementById("learning-review").getBoundingClientRect();
    const host = document.getElementById("learning-introduction").getBoundingClientRect();
    return {
      sameRow: Math.abs(
        (mode.top + mode.bottom) / 2 - (lesson.top + lesson.bottom) / 2
      ) < 1,
      comparableHeight: Math.abs(mode.height - lesson.height) < 3,
      hostHeight: host.height
    };
  });
  assert.equal(compactControl.sameRow, true);
  assert.equal(compactControl.comparableHeight, true);
  assert.equal(compactControl.hostHeight, 0);
  await page.click("#learning-review");
  await page.waitForSelector("#learning-introduction #lesson h2");
  await page.click("#learning-introduction #close");
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "learning-review"
  );

  await page.evaluate(id => {
    const key = Object.keys(localStorage)
      .find(candidate => candidate.endsWith(`:${id}`) && candidate.startsWith("ccLearningIntroduction:"));
    if (key) localStorage.removeItem(key);
  }, PUZZLE_ID);
  await page.reload();
  await ready(page);
  assert.equal(await page.evaluate(() => CC.state.learningGated), true);
  await page.click("#learning-introduction #skip");
  assert.equal(await page.evaluate(() => CC.state.learningGated), false);
  assert.equal(await page.isVisible("#learning-review"), true);
  assert.equal(
    await page.getAttribute("#learning-review", "title"),
    "Read the learning introduction"
  );

  await page.goto(`${baseURL}/index.html?puzzles=${PUZZLE_ID}`);
  await page.waitForSelector("#overview-list .card-badges .puzzle-badge");
  assert.deepEqual(
    await page.locator("#overview-list .card-badges .puzzle-badge").allTextContents(),
    ["Large", "Lenses", "Lesson"]
  );

  // Shared completion is deferred until the learner makes the introduction
  // choice; it must not flash or expose a solved board beneath the gate.
  await page.goto(`${baseURL}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph&solved`);
  await ready(page);
  assert.equal(await page.evaluate(() => CC.state.learningGated), true);
  assert.equal(await page.evaluate(() => CC.state.made), 0);
  await page.click("#learning-introduction #skip");
  await page.waitForFunction(() => CC.state.made === CC.state.need);
  assert.equal(await page.evaluate(() => CC.state.learningGated), false);

  // No authored lesson: the same slot reads "About", never gates, and opens
  // a catalogue card -- info.text summary and provenance byline, with no
  // publication line unless the play index supplied row stamps -- and no
  // lesson fetch.
  const lessonFetches = lessonRequests.length;
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=graph`);
  await page.waitForFunction(() => window.CC?.state?.puzzle?.id === "energy-flow");
  assert.equal(await page.evaluate(() => CC.state.learningGated), false);
  assert.equal(await page.isVisible("#board"), true);
  assert.equal(await page.isVisible("#learning-introduction #offer"), false);
  assert.equal(await page.textContent("#learning-review"), "About");
  assert.equal(await page.getAttribute("#learning-review", "title"), "About this puzzle");
  await page.click("#learning-review");
  assert.equal(await page.isVisible("#learning-introduction #dialog"), true);
  assert.equal(
    await page.textContent("#learning-introduction #dialog-title"),
    "Energy flow in living systems"
  );
  assert.match(await page.textContent("#learning-introduction #dialog-meta"), /^Science/);
  assert.ok(
    (await page.textContent("#learning-introduction #lesson")).trim().length > 0,
    "About card needs a summary"
  );
  assert.equal(
    await page.textContent("#learning-introduction #published"),
    ""
  );
  assert.equal(await page.isVisible("#learning-introduction #lesson-status"), false);
  assert.equal(lessonRequests.length, lessonFetches, "About mode must not fetch a lesson");
  await page.click("#learning-introduction #finish");
  assert.equal(await page.isVisible("#learning-introduction #dialog"), false);
  assert.equal(
    await page.evaluate(() => Object.keys(localStorage)
      .some(key => key.startsWith("ccLearningIntroduction:") && key.endsWith(":energy-flow"))),
    false,
    "About mode must not record an introduction status"
  );

  // Standalone Ghost article lesson: offer card links straight out without a
  // lesson fetch, Lesson modal shows the summary + Full essay card, and
  // paired lessons show both embedded Markdown and Expanded lesson + post-solve card.
  const standaloneUi = await page.evaluate(async () => {
    const { normalizedLearningIntroduction, learningIntroductionGate } = await import("./modules/learningIntroduction.js");
    const host = document.getElementById("learning-introduction");
    const puzzle = {
      ...CC.state.puzzle,
      id: "ghost-standalone-ui",
      info: {
        citations: [{ title: "Primary Source", author: "Author, A.", year: "2024" }]
      },
      learningIntroduction: {
        requirement: "recommended",
        summary: "Framing summary stored on the puzzle.",
        article: {
          url: "https://essays.example.org/full-ghost-article/",
          title: "The Full Ghost Essay",
          summary: "Extended primary-source argument.",
          estimatedMinutes: 15
        },
        links: [
          { href: "https://essays.example.org/full-ghost-article/", label: "Duplicate" },
          { href: "https://example.org/extra", label: "Extra reading" }
        ]
      }
    };
    const introduction = normalizedLearningIntroduction(puzzle);
    host.model = {
      puzzle,
      introduction,
      about: { category: "Science", catalogues: [], termCount: 8 },
      gate: learningIntroductionGate(introduction, null),
      status: null
    };
    const root = host.shadowRoot;
    const offerReadHidden = root.getElementById("read").hidden;
    const offerArticleHidden = root.getElementById("read-article").hidden;
    const offerArticleHref = root.getElementById("read-article").getAttribute("href");
    const offerMeta = root.getElementById("offer-meta").textContent;
    await host.openLesson();
    const statusHidden = root.getElementById("lesson-status").hidden;
    const calloutHidden = root.getElementById("article-callout").hidden;
    const calloutMeta = root.getElementById("article-callout-meta").textContent;
    const calloutText = root.getElementById("article-callout-link").textContent;
    const calloutSummary = root.getElementById("article-callout-summary").textContent;
    const sourceLinks = [...root.querySelectorAll("#source-list a")].map(a => a.href);
    const citationsVisible = !root.getElementById("citations").hidden;
    host.closeLesson();
    return {
      offerReadHidden,
      offerArticleHidden,
      offerArticleHref,
      offerMeta,
      statusHidden,
      calloutHidden,
      calloutMeta,
      calloutText,
      calloutSummary,
      sourceLinks,
      citationsVisible
    };
  });
  assert.equal(standaloneUi.offerReadHidden, true);
  assert.equal(standaloneUi.offerArticleHidden, false);
  assert.equal(standaloneUi.offerArticleHref, "https://essays.example.org/full-ghost-article/");
  assert.equal(standaloneUi.offerMeta, "Recommended · Essay · About 15 min");
  assert.equal(standaloneUi.statusHidden, true);
  assert.equal(standaloneUi.calloutHidden, false);
  assert.equal(standaloneUi.calloutMeta, "Full essay · About 15 min");
  assert.equal(standaloneUi.calloutText, "The Full Ghost Essay ↗");
  assert.equal(standaloneUi.calloutSummary, "Extended primary-source argument.");
  // Duplicate article URL is omitted from Further reading while distinct links remain:
  assert.deepEqual(standaloneUi.sourceLinks, ["https://example.org/extra"]);
  assert.equal(standaloneUi.citationsVisible, true);
  assert.equal(lessonRequests.length, lessonFetches, "Standalone article mode must not fetch Markdown");

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
