import assert from "node:assert/strict";

export const name = "table mode: one-click membership, bridges, mode switching, persistence, and lenses";
export const viewport = { width: 1100, height: 900 };

function row(page, word) {
  return page.locator(`.table-row[data-term=${JSON.stringify(word)}]`);
}
function checkbox(page, word, ci) {
  return row(page, word).locator(`input[data-cluster="${ci}"]`);
}
async function open(page, baseURL, id, params = "&mode=table&moves=") {
  await page.goto(`${baseURL}/index.html?puzzle=${id}${params}`);
  await page.waitForFunction(() => window.CC?.state);
  if (await page.evaluate(() => CC.state.learningGated)) {
    await page.locator("#learning-introduction #skip").click();
  }
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, baseURL, "energy-flow");
  assert.equal(await page.isVisible("#board"), false);
  assert.equal(await page.getAttribute("#mode-table", "aria-pressed"), "true");

  const initial = await page.evaluate(() => ({
    nodes: CC.state.nodes.length,
    rows: document.querySelectorAll(".table-row").length,
    checked: document.querySelectorAll(".table-check input:checked").length,
    seeds: CC.state.puzzle.clusters.reduce((sum, cluster) => sum + cluster.seeds.length, 0),
    names: [...document.querySelectorAll(".table-row")].map(el => el.dataset.term),
    headerBounds: [...document.querySelectorAll(".table-cluster-heading button")].map(el => ({
      top: el.getBoundingClientRect().top,
      scrollTop: document.querySelector(".table-scroll").getBoundingClientRect().top
    }))
  }));
  assert.equal(initial.nodes, initial.rows);
  assert.equal(initial.checked, initial.seeds);
  assert.deepEqual(initial.names, [...initial.names].sort((a, b) => a.localeCompare(b)));
  assert.ok(initial.headerBounds.every(box => box.top >= box.scrollTop), "headings are clipped above the scroll area");
  assert.equal(await checkbox(page, "ATP", 1).isChecked(), true);
  assert.equal(await checkbox(page, "ATP", 1).getAttribute("aria-readonly"), "true");
  await checkbox(page, "ATP", 1).click();
  assert.equal(await checkbox(page, "ATP", 1).isChecked(), true, "seed cannot be unchecked");

  // A rejected cell stays unchecked; a correct cell commits one ordinary
  // move and retains focus so a keyboard user can continue immediately.
  await checkbox(page, "carbon dioxide", 1).click();
  assert.equal(await checkbox(page, "carbon dioxide", 1).isChecked(), false);
  assert.equal(await page.evaluate(() => CC.state.incorrectMoveCount), 1);
  assert.match(await page.textContent("#message"), /think about what those terms share/);
  await checkbox(page, "carbon dioxide", 0).press("Space");
  assert.equal(await checkbox(page, "carbon dioxide", 0).isChecked(), true);
  assert.equal(await page.evaluate(() => CC.state.made), 1);
  assert.equal(await page.evaluate(() => CC.state.moveHistory.length), 1);
  await checkbox(page, "carbon dioxide", 0).press("ArrowRight");
  assert.equal(await checkbox(page, "carbon dioxide", 1).evaluate(el => el === document.activeElement), true);
  await checkbox(page, "carbon dioxide", 0).click();
  assert.equal(await page.evaluate(() => CC.state.made), 1, "checked cells cannot duplicate or undo a move");

  const progress = await page.evaluate(() => JSON.stringify(CC.state.moveHistory));
  for (const mode of ["graph", "star", "sets", "table"]) {
    await page.click(`#mode-${mode}`);
    assert.equal(await page.evaluate(() => JSON.stringify(CC.state.moveHistory)), progress);
    assert.equal(await page.evaluate(() => CC.state.made), 1);
    assert.equal(await page.evaluate(() => CC.state.layoutAdapter.mode), mode);
  }
  await open(page, baseURL, "energy-flow", "");
  assert.equal(await page.evaluate(() => CC.mode), "table", "Table preference survives navigation");
  assert.equal(await checkbox(page, "carbon dioxide", 0).isChecked(), true, "Table move restores from the shared session");

  // Binary bridge annotations must not leak the membership of its still
  // unplaced ideal term. Placing that term promotes the same stored link
  // used when switching back to a diagram.
  await checkbox(page, "oxygen", 0).click();
  assert.match(await row(page, "oxygen").getAttribute("class"), /table-partial/);
  await checkbox(page, "oxygen", 1).click();
  assert.equal(await row(page, "oxygen").locator("input:checked").count(), 2);
  assert.doesNotMatch(await page.textContent("#table-details"), /Cellular respiration: aerobic/);
  assert.match(await page.textContent("#facts"), /Bridge: oxygen/);
  await checkbox(page, "aerobic", 1).click();
  await row(page, "oxygen").locator(".table-term").focus();
  assert.match(await page.textContent("#table-details"), /Cellular respiration: aerobic/);
  await page.click("#mode-graph");
  assert.equal(await page.evaluate(() => CC.state.links.some(link =>
    link.bridge && link.source.word === "oxygen" && link.target.word === "aerobic" && link.ideal)), true);
  await page.click("#mode-table");
  assert.equal(await row(page, "oxygen").locator("input:checked").count(), 2);
  const sharedMoves = await page.evaluate(async () => {
    const { encodeMoves } = await import("./modules/shareLink.js");
    return encodeMoves(CC.state.moveHistory);
  });
  await open(page, baseURL, "energy-flow", `&mode=table&moves=${sharedMoves}`);
  assert.equal(await row(page, "oxygen").locator("input:checked").count(), 2, "Table moves replay from a shared URL");
  assert.equal(await checkbox(page, "aerobic", 1).isChecked(), true);
  await page.click("#show-solution");
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.equal(await page.isDisabled("#show-solution"), true);
  assert.equal(await page.textContent("#show-solution"), "Table complete");

  await open(page, baseURL, "lacans-three-registers");
  for (const ci of [0, 1, 2]) await checkbox(page, "Borromean knot", ci).click();
  assert.equal(await row(page, "Borromean knot").locator("input:checked").count(), 3);
  assert.match(await page.textContent("#facts"), /Bridge: Borromean knot/);

  // Board-level bridge pre-connect is shared in Table too.
  await page.evaluate(() => {
    const fixture = structuredClone(CC.state.puzzle);
    fixture.id = "table-preconnected-fixture";
    fixture.layout = null;
    fixture.board = { bridgePreconnect: true };
    CC.openPuzzle(CC.registerPuzzle(fixture));
  });
  await page.waitForFunction(() => CC.state.puzzle.id === "table-preconnected-fixture");
  assert.equal(await row(page, "Borromean knot").locator("input:checked").count(), 3);

  // Selection rounds use the term buttons and the existing diagnostic
  // classes; changing representation retains both selections and results.
  await open(page, baseURL, "interpreting-a-text");
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-selecting");
  await row(page, "diction").locator(".table-term").click();
  await row(page, "historical setting").locator(".table-term").click();
  assert.equal(await row(page, "diction").locator(".table-term").getAttribute("aria-pressed"), "true");
  await page.click("#lens-check");
  assert.match(await row(page, "diction").getAttribute("class"), /lens-correct/);
  assert.match(await row(page, "imagery").getAttribute("class"), /lens-missed/);
  assert.match(await row(page, "historical setting").getAttribute("class"), /lens-extra/);
  await page.click("#mode-graph");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  await page.click("#mode-table");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  assert.match(await row(page, "imagery").getAttribute("class"), /lens-missed/);

  // Long diagonal headers remain inside the scrollable sheet, and a
  // narrow viewport scrolls only the table, not the entire page.
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(() => {
    const scroll = document.querySelector(".table-scroll");
    const before = document.querySelector("tbody th").getBoundingClientRect().left;
    scroll.scrollLeft = scroll.scrollWidth;
    return {
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      scrollLeft: scroll.scrollLeft,
      before,
      after: document.querySelector("tbody th").getBoundingClientRect().left
    };
  });
  assert.ok(mobile.pageWidth <= mobile.viewportWidth, "Table causes page-level overflow");
  assert.ok(mobile.scrollLeft > 0, "narrow table does not scroll horizontally");
  assert.ok(Math.abs(mobile.after - mobile.before) < 1, "term column does not stay visible while scrolling");

  await page.setViewportSize(viewport);
  await open(page, baseURL, "when-systems-stop-seeing-people");
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-assigning");
  await row(page, "eligibility category").locator(".table-term").click();
  await page.locator("#lens-assignment #options button").first().click();
  assert.equal(await row(page, "eligibility category").locator(".table-term-status").textContent(), "Lens 1");
  await page.locator("#lens-assignment #check").click();
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.match(await row(page, "eligibility category").getAttribute("class"), /lens-assignment-correct/);

  await open(page, baseURL, "film-classics");
  await page.waitForFunction(() => CC.state.phase === "lens-quiz-answering");
  await page.locator("#lens-quiz-options button").filter({ hasText: "Howard Hawks" }).click();
  await page.click("#lens-check");
  assert.match(await row(page, "Ball of Fire").getAttribute("class"), /lens-quiz-incorrect/);
  assert.deepEqual(errors, []);
}
