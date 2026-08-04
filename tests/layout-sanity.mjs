// Cluster circles in Circle mode must never overlap each other — the one
// layout guarantee the live simulation's tick handler (modules/
// setRenderer.js) exists specifically to hold on every single tick, not
// just eventually: its deterministic resolveClusterOverlaps pass always
// runs last, after the board-bounds clamp, so it's the final word before
// each frame draws. That means a short fixed wait is enough here — no
// need to wait for the simulation's alpha to fully decay (for a busy
// topology it may never reach a low, "settled" alpha at all, since
// resolveClusterOverlaps deliberately keeps re-elevating it whenever
// there's correction work to do; the invariant this test checks holds
// well before that, and independently of it). This remains the
// in-progress/live-layout invariant; completed Circle geometry, including
// bridge pills and headings, is covered separately by
// circle-pretty-print.mjs.
//
// A preSolve: true puzzle never has an in-progress state to check here at
// all -- it jumps straight past "assembling" toward the lens sequence, and
// the fixed 300ms wait below can land mid-polish (solutionLayout still
// "polishing", not yet "pretty"), which is exactly the transitional state
// this test isn't meant to assert on. Skip those; circle-pretty-print.mjs
// already covers the completed-layout guarantee those puzzles land in,
// with a proper await on the polish promise rather than a fixed wait.
import assert from "node:assert/strict";

export const name = "layout-sanity: cluster circles never overlap in Circle mode";

export async function run(page, baseURL) {
  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.click("#mode-sets");

  const titles = await page.evaluate(() => CC.PUZZLES.map(p => p.title));

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
    await page.waitForTimeout(300);

    if (await page.evaluate(() => CC.state.phase !== "assembling")) continue;

    const overlaps = await page.evaluate(() => {
      const circles = CC.state.setLayout.csNodes.map((c, ci) => ({
        name: CC.state.puzzle.clusters[ci].name,
        x: c.x, y: c.y, r: CC.state.setLayout.clusterBoxes[ci].r
      }));
      const bad = [];
      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          const a = circles[i], b = circles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < a.r + b.r) {
            bad.push(`${a.name} / ${b.name}: overlap by ${(a.r + b.r - dist).toFixed(1)}px`);
          }
        }
      }
      return bad;
    });

    assert.deepEqual(overlaps, [], `"${title}": ${overlaps.join("; ")}`);
  }
}
