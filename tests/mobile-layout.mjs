// Regression for a real bug: on a 414px-wide phone (iPhone 11 Pro
// Max), the header's puzzle-picker select — sized to its longest
// option, "20th-century authoritarian regimes" — pushed "Show
// solution" entirely past the right edge, invisible and unreachable.
// The actual cause was a circular flexbox sizing problem: .controls
// shrank to fit its content while the select's max-width:100% tried
// to size against .controls, so max-width never had a stable target
// to resolve against (see the comments above the max-width:600px
// media query in styles.css for the full explanation). Checked at the
// narrowest viewport width Playwright's device list has, 320px (iPhone
// SE) — the header is where this broke, but any horizontal overflow
// anywhere on the page is worth catching here, not just that one spot.
import assert from "node:assert/strict";

export const name = "mobile-layout: no horizontal overflow on a 320px viewport";
export const viewport = { width: 320, height: 700 };

export async function run(page, baseURL) {
  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-picker");

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

    const overflowPx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflowPx <= 0, `"${title}" overflows the viewport by ${overflowPx}px`);
  }
}
