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
      // This suite revisits every puzzle in three modes; local completion
      // from an earlier pass is intentionally not the starting condition
      // being tested here.
      await page.click("#reset");
      // Player-session restoration is intentionally per puzzle, so choose
      // the test's requested mode after loading each puzzle.
      await page.click(mode);
      await page.click("#show-solution");
      await page.waitForTimeout(150);
      const { made, need } = await page.evaluate(() => ({ made: CC.state.made, need: CC.state.need }));
      assert.equal(made, need, `${mode} / "${title}": ${made} of ${need} links after Show Solution`);
      // A lens-enabled puzzle deliberately locks mode switching until its
      // post-solve sequence is finished. Complete the empty diagnostic
      // rounds so the next outer-loop mode can still exercise this puzzle.
      if (await page.evaluate(() => !!CC.state.puzzle.lenses?.length)) {
        await page.waitForFunction(() => CC.state.phase === "lens-selecting");
        while (await page.evaluate(() => CC.state.phase !== "complete")) {
          await page.click("#lens-check");
          await page.click("#lens-next");
        }
      }
    }
  }

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
