// Cluster circles in Sets mode must never overlap each other — the one
// layout guarantee computeSetLayout's resolve/clamp passes exist
// specifically to hold (see the comments there), and the one most
// worth checking automatically since it's exactly what a new puzzle's
// cluster/bridge shape could break. Scoped to circle-vs-circle only:
// bridge-pill-vs-unrelated-circle overlap is a known, pre-existing,
// harder layout problem (see "Known limitations" in DEVELOPMENT.md),
// not something this asserts clean today.
import assert from "node:assert/strict";

export const name = "layout-sanity: cluster circles never overlap in Sets mode";

export async function run(page, baseURL) {
  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-picker");
  await page.click("#mode-sets");

  const titles = await page.evaluate(() => PUZZLES.map(p => p.title));

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
    await page.waitForTimeout(50);

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
