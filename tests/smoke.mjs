// Loads every puzzle in all three rendering modes and confirms nothing
// throws — the baseline check: if this fails, something more specific
// broke too, so it's worth running first.
import assert from "node:assert/strict";

export const name = "smoke: every puzzle loads cleanly in all three modes";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });

  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");

  const titles = await page.evaluate(() => CC.PUZZLES.map(p => p.title));
  assert.ok(titles.length > 0, "PUZZLES is empty");

  for (const mode of ["#mode-graph", "#mode-star", "#mode-sets"]) {
    for (const title of titles) {
      const idx = await page.$$eval(
        "#puzzle-picker option",
        (els, t) => els.findIndex(o => o.textContent.startsWith(t)),
        title
      );
      assert.notEqual(idx, -1, `puzzle "${title}" missing from the picker`);
      await page.selectOption("#puzzle-picker", { index: idx });
      await page.waitForFunction(
        t => document.getElementById("puzzle-title").textContent === t,
        title
      );
      // A saved puzzle resumes its own prior mode by design. Re-select
      // the mode under test after loading it.
      await page.click(mode);
    }
  }

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
