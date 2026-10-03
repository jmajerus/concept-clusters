import assert from "node:assert/strict";

export const name = "learning lesson: the dialog shows the whole lesson";

const ready = page => page.waitForFunction(() => window.CC?.state);
const REST = "The chapter may name the groups. The later section still belongs in the first reading.";

function puzzle(id, { lenses } = {}) {
  return {
    id,
    title: "Lesson section fixture",
    category: "Science",
    clusters: [
      {
        id: "alpha",
        name: "Alpha",
        color: "teal",
        fact: "Alpha fact.",
        terms: ["a", "b", "c"],
        seeds: ["a", "b"]
      },
      {
        id: "beta",
        name: "Beta",
        color: "blue",
        fact: "Beta fact.",
        terms: ["d", "e", "f"],
        seeds: ["d", "e"]
      }
    ],
    bridges: [],
    learningIntroduction: {
      requirement: "recommended",
      title: "Before You Begin: Groups",
      content: {
        text: `Orientation opens the lesson.\n\n${REST}`,
        mediaType: "text/markdown"
      }
    },
    ...(lenses ? { lenses } : {})
  };
}

async function openFixture(page, candidate) {
  await page.evaluate(fixture => {
    const index = CC.registerPuzzle(fixture);
    CC.openPuzzle(index);
  }, candidate);
  await page.waitForFunction(id => CC.state?.puzzle?.id === id, candidate.id);
}

function lessonText(page) {
  return page.evaluate(() => {
    const root = document.querySelector("#learning-introduction")?.shadowRoot;
    const lesson = root?.getElementById("lesson");
    return {
      text: lesson?.textContent || "",
      continueReading: !!root?.getElementById("continue-reading")
    };
  });
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=graph`);
  await ready(page);
  await page.evaluate(() => localStorage.clear());
  assert.equal(await page.locator("#show-full-lessons").count(), 0);
  assert.equal(await page.locator("#library-preferences").count(), 0);

  await openFixture(page, puzzle("lesson-whole"));
  await page.click("#learning-introduction #read");
  await page.waitForFunction(() => {
    const lesson = document.querySelector("#learning-introduction")
      ?.shadowRoot?.getElementById("lesson");
    return lesson?.textContent?.includes("The chapter may name the groups");
  });
  let shown = await lessonText(page);
  assert.match(shown.text, /Orientation opens the lesson/);
  assert.match(shown.text, /The chapter may name the groups/);
  assert.equal(shown.continueReading, false);
  await page.click("#learning-introduction #finish");

  const lensPuzzle = puzzle("lesson-whole-lenses", {
    lenses: [{
      id: "floating",
      prompt: "Which term was left to place?",
      targets: ["c"],
      explanation: "C was not a seed."
    }]
  });
  await openFixture(page, lensPuzzle);
  await page.click("#learning-introduction #skip");
  await page.evaluate(() => CC.showSolution());
  await page.waitForFunction(() => CC.state.phase === "lens-selecting");
  await page.click("#learning-review");
  await page.waitForFunction(() => {
    const lesson = document.querySelector("#learning-introduction")
      ?.shadowRoot?.getElementById("lesson");
    return lesson?.textContent?.includes("The chapter may name the groups");
  });
  shown = await lessonText(page);
  assert.match(shown.text, /The chapter may name the groups/);
  assert.equal(shown.continueReading, false);
  await page.click("#learning-introduction #close");
  await page.locator(".node").filter({
    has: page.locator("text").filter({ hasText: /^c$/ })
  }).click();
  await page.click("#lens-check");
  await page.waitForFunction(() => CC.state.phase === "complete");
  await page.click("#learning-review");
  await page.waitForFunction(() => {
    const lesson = document.querySelector("#learning-introduction")
      ?.shadowRoot?.getElementById("lesson");
    return lesson?.textContent?.includes("The chapter may name the groups");
  });
  shown = await lessonText(page);
  assert.match(shown.text, /Orientation opens the lesson/);
  assert.match(shown.text, /The chapter may name the groups/);
  assert.equal(shown.continueReading, false);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
