import assert from "node:assert/strict";

export const name = "table sorting: confirmed memberships, completed cluster groups, and shared bridge rows";
export const viewport = { width: 1100, height: 900 };

const names = scope => scope.locator(".table-row").evaluateAll(rows => rows.map(row => row.dataset.term));
const row = (scope, word) => scope.locator(`.table-row[data-term=${JSON.stringify(word)}]`);
const group = (page, ci) => page.locator(`.table-cluster-group[data-cluster="${ci}"]`);

async function open(page, baseURL, id) {
  await page.goto(`${baseURL}/index.html?puzzle=${id}&mode=table&moves=`);
  await page.waitForFunction(() => window.CC?.state);
  if (await page.evaluate(() => CC.state.learningGated)) await page.locator("#learning-introduction #skip").click();
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, baseURL, "energy-flow");
  const alphabetical = await names(page);
  assert.equal(await page.locator("#table-group-clusters").isDisabled(), true);

  // Only checked cells influence a heading sort. Unplaced authored
  // members and bridges stay mixed into the alphabetical remainder.
  await page.locator("#table-cluster-0 button").click();
  const confirmed = await page.evaluate(() => CC.state.nodes
    .filter(node => node.connected.includes(0)).map(node => node.word).sort((a, b) => a.localeCompare(b)));
  assert.deepEqual(await names(group(page, 0)), confirmed);
  assert.deepEqual((await names(page)).slice(0, confirmed.length), confirmed);
  assert.match(await group(page, 0).locator(".table-group-heading").textContent(), /Photosynthesis · 2 connected/);
  assert.equal(await row(group(page, 0), "carbon dioxide").count(), 0);
  assert.equal(await row(group(page, 0), "oxygen").count(), 0);
  assert.equal(await page.locator("#table-cluster-0").getAttribute("aria-sort"), "other");
  assert.equal(await page.evaluate(() => CC.state.made), 0);

  await row(page, "oxygen").locator('input[data-cluster="0"]').click();
  assert.equal(await row(group(page, 0), "oxygen").count(), 1, "partially connected bridge joins its confirmed group");
  assert.match(await group(page, 0).locator(".table-group-heading").textContent(), /3 connected/);
  assert.equal(await row(group(page, 0), "oxygen").locator('input[data-cluster="0"]').evaluate(el => el === document.activeElement), true,
    "moving a newly connected row retains checkbox focus");
  // Arrow navigation follows the rendered sort, rather than the original
  // alphabetic indices, and skips the group heading.
  const focusedOrder = await names(page);
  const oxygenIndex = focusedOrder.indexOf("oxygen");
  await row(page, "oxygen").locator('input[data-cluster="0"]').press("ArrowDown");
  const nextName = focusedOrder[Math.min(focusedOrder.length - 1, oxygenIndex + 1)];
  assert.equal(await row(page, nextName).locator('input[data-cluster="0"]').evaluate(el => el === document.activeElement), true);
  await page.locator(".table-scroll").evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page.locator("#table-cluster-1 button").focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".table-scroll").evaluate(el => el.scrollTop), 0,
    "heading sort brings the selected cluster back into view");
  assert.equal(await row(group(page, 1), "oxygen").count(), 0, "unconfirmed bridge destination does not affect sorting");
  const remainder = await page.locator("tbody:not(.table-cluster-group) .table-row").evaluateAll(rows => rows.map(row => row.dataset.term));
  assert.deepEqual(remainder, [...remainder].sort((a, b) => a.localeCompare(b)));

  // A confirmed bridge stays in Shared connections while its ideal term
  // is unplaced. Sorting and accessible labels must not reveal that term.
  await row(page, "oxygen").locator('input[data-cluster="1"]').click();
  assert.deepEqual(await names(group(page, 1)), ["ATP", "mitochondria", "oxygen"]);
  assert.equal(await group(page, 1).locator(".table-connections-heading").textContent(), "Shared connections");
  assert.equal(await row(group(page, 1), "oxygen").getAttribute("data-ideal-endpoint"), null);
  assert.equal(await row(group(page, 1), "oxygen").locator(".table-bridge-indent").isHidden(), true);
  assert.doesNotMatch(await row(group(page, 1), "oxygen").locator(".table-term").getAttribute("aria-label"), /aerobic/);
  await row(page, "aerobic").locator('input[data-cluster="1"]').click();
  assert.deepEqual(await names(group(page, 1)), ["aerobic", "oxygen", "ATP", "mitochondria"]);
  assert.equal(await row(group(page, 1), "oxygen").getAttribute("data-ideal-endpoint"), "aerobic");
  assert.equal(await row(group(page, 1), "oxygen").locator(".table-bridge-indent").isVisible(), true);
  assert.match(await row(group(page, 1), "oxygen").locator(".table-term").getAttribute("aria-label"), /Shared connection through aerobic/);
  assert.equal(await group(page, 1).locator(".table-connections-heading").count(), 0);
  await row(page, "aerobic").locator('input[data-cluster="1"]').press("ArrowDown");
  assert.equal(await row(page, "oxygen").locator('input[data-cluster="1"]').evaluate(el => el === document.activeElement), true,
    "keyboard navigation follows bridges nested beneath their endpoints");

  await page.locator("#table-alphabetical").click();
  assert.deepEqual(await names(page), alphabetical);
  await page.click("#show-solution");
  assert.deepEqual(await names(page), alphabetical, "completion must not automatically rearrange rows");
  assert.equal(await page.locator("#table-group-clusters").isEnabled(), true);
  const history = await page.evaluate(() => JSON.stringify(CC.state.moveHistory));
  await page.locator("#table-group-clusters").click();
  assert.equal(await page.locator(".table-cluster-group").count(), 3);
  const expected = [
    ["carbon dioxide", "chlorophyll", "sunlight", "glucose", "oxygen", "producers"],
    ["aerobic", "oxygen", "ATP", "glucose", "mitochondria"],
    ["consumers", "decomposers", "food chain", "trophic level", "producers"]
  ];
  for (const [ci, terms] of expected.entries()) {
    assert.deepEqual(await names(group(page, ci)), terms);
    assert.match(await group(page, ci).locator(".table-group-heading").textContent(), new RegExp(`${terms.length} connected`));
  }
  assert.equal(await row(page, "oxygen").count(), 2);
  assert.equal(await row(page, "aerobic").count(), 1);
  assert.equal(await row(group(page, 1), "glucose").getAttribute("data-ideal-endpoint"), "ATP");
  assert.equal(await row(group(page, 0), "glucose").getAttribute("data-ideal-endpoint"), null);
  assert.equal(await group(page, 0).locator(".table-connections-heading").count(), 1);
  assert.equal(await group(page, 1).locator(".table-connections-heading").count(), 0);
  assert.equal(await group(page, 2).locator(".table-connections-heading").count(), 1);
  assert.equal(await row(group(page, 0), "oxygen").locator("input:checked").count(), 2);
  assert.match(await row(group(page, 0), "oxygen").locator(".table-term-status").textContent(), /Shared bridge/);
  assert.equal(await page.evaluate(() => {
    const ids = [...document.querySelectorAll("#table-board [id]")].map(el => el.id);
    return ids.length === new Set(ids).size;
  }), true, "repeated bridges need unique accessible row IDs");
  assert.equal(await page.evaluate(() => JSON.stringify(CC.state.moveHistory)), history);

  // A view switch preserves grouping, and returning to Alphabetical
  // restores a single row for each term without changing the solution.
  await page.click("#mode-graph");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  await page.click("#mode-table");
  assert.equal(await page.locator("#table-group-clusters").getAttribute("aria-pressed"), "true");
  assert.deepEqual(await names(group(page, 0)), expected[0]);
  await page.locator("#table-alphabetical").click();
  assert.deepEqual(await names(page), alphabetical);
  assert.equal(await page.locator(".table-nested-bridge").count(), 0, "Alphabetical remains a flat term index");
  assert.equal(await page.evaluate(() => JSON.stringify(CC.state.moveHistory)), history);

  await open(page, baseURL, "lacans-three-registers");
  await page.click("#show-solution");
  await page.locator("#table-group-clusters").click();
  assert.equal(await row(page, "Borromean knot").count(), 3);
  for (const ci of [0, 1, 2]) {
    assert.equal(await row(group(page, ci), "Borromean knot").locator("input:checked").count(), 3);
    assert.equal((await names(group(page, ci))).at(-1), "Borromean knot");
    assert.equal(await row(group(page, ci), "Borromean knot").locator(".table-bridge-indent").isHidden(), true);
  }

  // Multiple bridges share one endpoint without displacing alphabetical
  // ordinary terms. Sibling bridges have their own alphabetical order.
  await open(page, baseURL, "authoritarian-regimes");
  await page.click("#show-solution");
  await page.locator("#table-group-clusters").click();
  const siblings = await names(group(page, 0));
  const endpointIndex = siblings.indexOf("Il Duce");
  assert.notEqual(endpointIndex, -1);
  assert.deepEqual(siblings.slice(endpointIndex + 1, endpointIndex + 3), ["personality cult", "propaganda"]);
  for (const term of ["personality cult", "propaganda"]) {
    assert.equal(await row(group(page, 0), term).getAttribute("data-ideal-endpoint"), "Il Duce");
  }

  // Duplicated bridge rows remain two presentations of one lens answer.
  await open(page, baseURL, "interpreting-a-text");
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-selecting");
  await page.locator("#table-group-clusters").click();
  assert.equal(await row(group(page, 0), "close reading").getAttribute("data-ideal-endpoint"), "diction");
  assert.equal(await row(group(page, 2), "close reading").getAttribute("data-ideal-endpoint"), "textual evidence");
  await row(group(page, 0), "close reading").locator(".table-term").click();
  assert.deepEqual(await row(page, "close reading").locator(".table-term").evaluateAll(buttons => buttons.map(button => button.getAttribute("aria-pressed"))), ["true", "true"]);
  await row(group(page, 2), "close reading").locator(".table-term").click();
  assert.deepEqual(await row(page, "close reading").locator(".table-term").evaluateAll(buttons => buttons.map(button => button.getAttribute("aria-pressed"))), ["false", "false"]);
  await row(group(page, 0), "diction").locator(".table-term").click();
  await page.click("#lens-check");
  assert.match(await row(group(page, 0), "diction").getAttribute("class"), /lens-correct/);
  assert.equal(await page.locator("#table-group-clusters").getAttribute("aria-pressed"), "true");

  // Group headings and repeated bridge rows must fit the mobile scroll
  // area without widening the page or scrolling away the term labels.
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(() => {
    const scroll = document.querySelector(".table-scroll");
    const before = document.querySelector(".table-row th").getBoundingClientRect().left;
    scroll.scrollLeft = scroll.scrollWidth;
    return { width: document.documentElement.scrollWidth, viewport: innerWidth,
      before, after: document.querySelector(".table-row th").getBoundingClientRect().left };
  });
  assert.ok(mobile.width <= mobile.viewport);
  assert.ok(Math.abs(mobile.after - mobile.before) < 1);
  assert.deepEqual(errors, []);
}
