// Show Solution should fully complete every puzzle in both modes, with
// no leftover unconnected nodes and no console errors — the mechanism
// this project has broken and re-fixed more than once (see the
// showSolution() history in game.js), so it's worth a standing check.
import assert from "node:assert/strict";

export const name = "solution: Show Solution fully completes every puzzle in both modes";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });

  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-picker");

  const titles = await page.evaluate(() => PUZZLES.map(p => p.title));

  for (const mode of ["#mode-graph", "#mode-sets"]) {
    await page.click(mode);
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
      await page.click("#show-solution");
      await page.waitForTimeout(150);
      const { made, need } = await page.evaluate(() => ({ made: state.made, need: state.need }));
      assert.equal(made, need, `${mode} / "${title}": ${made} of ${need} links after Show Solution`);
    }
  }

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
