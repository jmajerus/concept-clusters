import assert from "node:assert/strict";
import { LESSON_PREVIEW_CHARACTERS } from "../modules/learningIntroduction.js";

export const name = "learning lesson: preview, continue reading, full text at the end";

const ready = page => page.waitForFunction(() => window.CC?.state);
const REST = `The chapter may name the groups. ${"word ".repeat(LESSON_PREVIEW_CHARACTERS)}`;

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
        text: `Orientation stays in the preview.\n\n${REST}`,
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
    const more = root?.getElementById("continue-reading");
    return {
      text: lesson?.textContent || "",
      continueReading: !!more && !more.hidden
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

  await openFixture(page, puzzle("lesson-preview-plain"));
  await page.click("#learning-introduction #read");
  await page.waitForFunction(() => {
    const lesson = document.querySelector("#learning-introduction")
      ?.shadowRoot?.getElementById("lesson");
    return lesson?.textContent?.includes("Orientation stays in the preview");
  });
  let shown = await lessonText(page);
  assert.match(shown.text, /Orientation stays in the preview/);
  assert.equal(shown.text.includes("The chapter may name the groups"), false);
  assert.equal(shown.continueReading, true);
  await page.click("#learning-introduction #continue-reading");
  assert.equal(await page.evaluate(() => document.querySelector("#learning-introduction")
    ?.shadowRoot?.activeElement?.id), "lesson-remainder");
  shown = await lessonText(page);
  assert.match(shown.text, /The chapter may name the groups/);
  assert.equal(shown.continueReading, false);
  await page.click("#learning-introduction #finish");

  await page.evaluate(() => CC.showSolution());
  await page.waitForFunction(() => CC.state.phase === "complete");
  await page.click("#learning-review");
  await page.waitForFunction(() => {
    const lesson = document.querySelector("#learning-introduction")
      ?.shadowRoot?.getElementById("lesson");
    return lesson?.textContent?.includes("The chapter may name the groups");
  });
  shown = await lessonText(page);
  assert.match(shown.text, /Orientation stays in the preview/);
  assert.match(shown.text, /The chapter may name the groups/);
  assert.equal(shown.continueReading, false);
  await page.click("#learning-introduction #close");

  const lensPuzzle = puzzle("lesson-preview-lenses", {
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
    const root = document.querySelector("#learning-introduction")?.shadowRoot;
    return root?.getElementById("continue-reading") &&
      !root.getElementById("lesson")?.textContent?.includes("The chapter may name the groups");
  });
  await page.click("#learning-introduction #close");
  await page.locator(".node").filter({
    has: page.locator("text").filter({ hasText: /^c$/ })
  }).click();
  await page.click("#lens-check");
  await page.waitForFunction(() => CC.state.phase === "complete");
  await page.click("#learning-review");
  await page.waitForFunction(() => {
    const root = document.querySelector("#learning-introduction")?.shadowRoot;
    const lesson = root?.getElementById("lesson");
    return lesson?.textContent?.includes("The chapter may name the groups") &&
      !root.getElementById("continue-reading");
  });

  await page.click("#learning-introduction #close");
  await page.click("#browse-puzzles");
  await page.click("#library-preferences summary");
  await page.click("#show-full-lessons");
  assert.equal(await page.evaluate(() => localStorage.getItem("ccShowFullLessons")), "1");
  await openFixture(page, puzzle("lesson-preview-preference"));
  await page.click("#learning-introduction #read");
  await page.waitForFunction(() => {
    const root = document.querySelector("#learning-introduction")?.shadowRoot;
    return root?.getElementById("lesson")?.textContent?.includes("The chapter may name the groups") &&
      !root.getElementById("continue-reading") &&
      !root.getElementById("show-full-lessons");
  });
  await page.click("#learning-introduction #close");
  await page.click("#browse-puzzles");
  await page.click("#show-full-lessons");
  await openFixture(page, puzzle("lesson-preview-preference"));
  await page.click("#learning-introduction #read");
  await page.waitForFunction(() => document.querySelector("#learning-introduction")
    ?.shadowRoot?.getElementById("continue-reading"));

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
