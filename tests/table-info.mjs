import assert from "node:assert/strict";

export const name = "table info: optional descriptions, compact columns, grouping, and remembered visibility";
export const viewport = { width: 1100, height: 900 };
const row = (page, word) => page.locator(`.table-row[data-term=${JSON.stringify(word)}]`);

async function open(page, baseURL, id, suffix = "") {
  await page.goto(`${baseURL}/index.html?puzzle=${id}&mode=table${suffix}`);
  await page.waitForFunction(() => window.CC?.state);
  if (await page.evaluate(() => CC.state.learningGated)) await page.locator("#learning-introduction #skip").click();
}

async function columnWidths(page) {
  return page.locator(".table-cluster-heading").evaluateAll(headings => headings.map(el => el.getBoundingClientRect().width));
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, baseURL, "energy-flow", "&moves=");
  const showInfo = page.locator("#table-show-info");
  assert.equal(await showInfo.isChecked(), false);
  assert.equal(await page.locator(".table-info-heading").isHidden(), true);
  const compact = await page.locator(".membership-table").evaluate(el => el.getBoundingClientRect().width);
  assert.ok(Math.abs(compact - 352) < 1, "hidden description column must not widen the table");
  await showInfo.check();
  assert.equal(await page.locator(".table-info-heading").isVisible(), true);
  assert.deepEqual(await columnWidths(page), [44, 44, 44], "descriptions must not widen membership columns");
  const expanded = await page.locator(".membership-table").evaluate(el => el.getBoundingClientRect().width);
  assert.ok(Math.abs(expanded - compact - 320) < 1);
  const descriptions = await page.evaluate(() => CC.state.nodes.map(node => ({ word: node.word, text: node.info?.text || "" })));
  for (const item of descriptions) {
    assert.equal(await row(page, item.word).locator(".table-term-info").textContent(), item.text);
  }
  assert.equal(await row(page, "carbon dioxide").locator(".table-term-info").textContent(), "", "missing descriptions remain blank");
  assert.doesNotMatch(await row(page, "oxygen").locator(".table-term-info").textContent(), /Photosynthesis releases oxygen|Cellular respiration: aerobic/,
    "description cells must not expose bridge facts or endpoint annotations");
  await row(page, "carbon dioxide").locator('input[data-cluster="0"]').click();
  await page.click("#mode-graph");
  await page.click("#mode-table");
  assert.equal(await showInfo.isChecked(), true);
  await open(page, baseURL, "energy-flow");
  assert.equal(await showInfo.isChecked(), true, "description visibility survives reloads");
  assert.equal(await page.evaluate(() => CC.state.made), 1);
  await open(page, baseURL, "fundamental-forces", "&moves=");
  assert.equal(await showInfo.isChecked(), true, "description visibility is a player preference across puzzles");
  await open(page, baseURL, "energy-flow");
  await row(page, "oxygen").locator('input[data-cluster="0"]').click();
  await page.click("#table-cluster-0 button");
  assert.deepEqual(await page.locator(".table-group-heading th, .table-connections-heading td").evaluateAll(cells => cells.map(el => el.colSpan)), [5, 5, 5]);
  await page.click("#show-solution");
  await page.click("#table-group-clusters");
  assert.equal(await row(page, "oxygen").count(), 2);
  const oxygenText = descriptions.find(item => item.word === "oxygen").text;
  assert.deepEqual(await row(page, "oxygen").locator(".table-term-info").allTextContents(), [oxygenText, oxygenText]);
  const history = await page.evaluate(() => JSON.stringify(CC.state.moveHistory));
  await showInfo.uncheck();
  assert.deepEqual(await page.locator(".table-group-heading th, .table-connections-heading td").evaluateAll(cells => cells.map(el => el.colSpan)), [4, 4, 4, 4, 4]);
  assert.ok(Math.abs(await page.locator(".membership-table").evaluate(el => el.getBoundingClientRect().width) - compact) < 1);
  await showInfo.check();
  assert.equal(await page.evaluate(() => JSON.stringify(CC.state.moveHistory)), history, "visibility changes do not alter the solution");

  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(() => {
    const scroll = document.querySelector(".table-scroll");
    const term = document.querySelector(".table-row th");
    const before = term.getBoundingClientRect().left;
    scroll.scrollLeft = scroll.scrollWidth;
    const info = document.querySelector(".table-term-info");
    return {
      width: document.documentElement.scrollWidth, viewport: innerWidth,
      before, after: term.getBoundingClientRect().left,
      infoWidth: info.getBoundingClientRect().width,
      available: scroll.clientWidth - term.getBoundingClientRect().width,
      wraps: [...document.querySelectorAll(".table-term-info")].every(el => el.scrollWidth <= el.clientWidth + 1)
    };
  });
  assert.ok(mobile.width <= mobile.viewport, "descriptions must scroll inside the table rather than widen the page");
  assert.ok(Math.abs(mobile.after - mobile.before) < 1, "term labels remain visible beside descriptions");
  assert.ok(mobile.infoWidth <= mobile.available + 1, "mobile descriptions fit alongside the sticky term column");
  assert.equal(mobile.wraps, true);
  await showInfo.uncheck();
  await open(page, baseURL, "energy-flow");
  assert.equal(await showInfo.isChecked(), false);
  assert.equal(await page.locator(".table-info-heading").isHidden(), true);
  assert.deepEqual(errors, []);
}
