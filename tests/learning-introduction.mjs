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
  // a catalogue card -- info.text summary, provenance byline, first-published
  // month from the manifest -- with no lesson fetch.
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
  assert.match(
    await page.textContent("#learning-introduction #published"),
    /^First published [A-Z][a-z]+ 20\d\d$/
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
  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
