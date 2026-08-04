// Show Solution should fully complete every puzzle in all three modes,
// with no leftover unconnected nodes and no console errors — the
// mechanism this project has broken and re-fixed more than once (see
// the showSolution() history in game.js), so it's worth a standing check.
import assert from "node:assert/strict";

export const name = "solution: Show Solution fully completes every puzzle in all three modes";
// Standard in purpose (pure correctness, no layout-quality assertion),
// but 56 puzzles x 3 modes each trigger Star's detangler in the
// background regardless of whether this test waits on it, making this
// the single slowest file in the whole suite by a wide margin -- extended
// by necessity, not by topic. See tests/run.mjs's own header comment.
export const tier = "extended";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });

  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");

  const titles = await page.evaluate(() => CC.PUZZLES.map(p => p.title));

  for (const mode of ["#mode-graph", "#mode-star", "#mode-sets"]) {
    for (const title of titles) {
      const idx = await page.$$eval(
        "#puzzle-picker option",
        (els, t) => els.findIndex(o => o.textContent.startsWith(t)),
        title
      );
      await page.selectOption("#puzzle-picker", { index: idx });
      await page.waitForFunction(
        t => document.getElementById("puzzle-title").textContent === t,
        title
      );
      if (await page.evaluate(() => CC.state.learningGated)) {
        await page.click("#learning-introduction #skip");
      }
      // This suite revisits every puzzle in three modes; local completion
      // from an earlier pass is intentionally not the starting condition
      // being tested here.
      await page.click("#reset");
      // Player-session restoration is intentionally per puzzle, so choose
      // the test's requested mode after loading each puzzle.
      await page.click(mode);
      // A preSolve puzzle re-solves itself on this same reset (no saved
      // session survives #reset), which disables #show-solution before
      // this ever gets a chance to click it -- Playwright's actionability
      // check would otherwise hang waiting for an element that never
      // becomes enabled.
      if (await page.evaluate(() => CC.state.made !== CC.state.need)) {
        await page.click("#show-solution");
      }
      await page.waitForTimeout(150);
      const { made, need } = await page.evaluate(() => ({ made: CC.state.made, need: CC.state.need }));
      assert.equal(made, need, `${mode} / "${title}": ${made} of ${need} links after Show Solution`);
      // Complete either post-solve lens modality so the next outer-loop
      // mode can still exercise this puzzle from a clean finished state.
      if (await page.evaluate(() => !!CC.state.puzzle.lenses?.length)) {
        await page.waitForFunction(() =>
          ["lens-selecting", "lens-assigning", "lens-quiz-answering"].includes(CC.state.phase)
        );
        if (await page.evaluate(() => CC.state.phase === "lens-assigning")) {
          await page.evaluate(() => {
            for (const lens of CC.state.puzzle.lenses) {
              for (const word of lens.targets) {
                CC.state.assignLens(
                  CC.state.nodes.find(node => node.word === word),
                  lens.id
                );
              }
            }
          });
          await page.click("#lens-assignment #check");
        } else if (await page.evaluate(() => CC.state.phase === "lens-quiz-answering")) {
          while (await page.evaluate(() => CC.state.phase !== "complete")) {
            await page.click("#lens-quiz-options .lens-quiz-option >> nth=0");
            await page.click("#lens-check");
            await page.click("#lens-next");
          }
        } else {
          while (await page.evaluate(() => CC.state.phase !== "complete")) {
            await page.click("#lens-check");
            await page.click("#lens-next");
          }
        }
      }
    }
  }

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
