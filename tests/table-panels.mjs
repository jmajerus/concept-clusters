import assert from "node:assert/strict";

export const name = "table panels: completed groups, bridge migration, completion order, and responsive layout";
export const viewport = { width: 1200, height: 900 };
const row = (scope, word) => scope.locator(`.table-row[data-term=${JSON.stringify(word)}]`);
const input = (scope, word, ci) => row(scope, word).locator(`input[data-cluster="${ci}"]`);
const names = scope => scope.locator(".table-row").evaluateAll(rows => rows.map(row => row.dataset.term));
const clusters = scope => scope.locator(".table-cluster-group").evaluateAll(groups => groups.map(group => Number(group.dataset.cluster)));

async function open(page, baseURL, id, suffix = "&moves=") {
  await page.goto(`${baseURL}/index.html?puzzle=${id}&mode=table${suffix}`);
  await page.waitForFunction(() => window.CC?.state);
  if (await page.evaluate(() => CC.state.learningGated)) await page.locator("#learning-introduction #skip").click();
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, baseURL, "energy-flow");
  const split = page.getByRole("checkbox", { name: "Separate completed clusters", exact: true });
  const working = page.locator(".table-panel-working");
  const completed = page.locator(".table-panel-completed");
  const group = ci => completed.locator(`tbody[data-cluster="${ci}"]`);
  const alphabetical = await names(page);
  assert.equal(await split.isChecked(), false);
  await split.check();
  assert.deepEqual(await names(working), alphabetical);
  assert.deepEqual(await clusters(completed), []);
  assert.equal(await completed.locator(".table-panel-empty").isVisible(), true);
  assert.equal(await page.evaluate(() => CC.state.made), 0, "enabling panels never changes progress");
  const desktop = await page.evaluate(() => {
    const left = document.querySelector(".table-panel-working").getBoundingClientRect();
    const right = document.querySelector(".table-panel-completed").getBoundingClientRect();
    return { left: left.left, right: right.left, topDifference: Math.abs(left.top - right.top) };
  });
  assert.ok(desktop.right > desktop.left && desktop.topDifference < 1, "wide screens place the panels side by side");

  await page.locator("#table-cluster-0 button").click();
  await input(working, "carbon dioxide", 0).press("Space");
  assert.deepEqual(await clusters(completed), [0], "ordinary-member completion moves the cluster before bridges are finished");
  assert.deepEqual(await names(group(0)), ["carbon dioxide", "chlorophyll", "sunlight"]);
  assert.equal(await row(working, "carbon dioxide").count(), 0);
  assert.equal(await row(group(0), "carbon dioxide").locator(".table-term").evaluate(el => el === document.activeElement), true,
    "focus moves from the checkbox to its completed term button");
  assert.equal(await completed.locator('input, .table-cluster-heading, col:not(:first-child):not(.table-info-column)').count(), 0,
    "completed groups have no membership inputs, columns, or diagonal headings");
  assert.equal(await completed.locator("thead").isHidden(), true, "the compact list starts directly with its cluster heading");
  assert.equal(await group(0).locator(".table-group-heading th").evaluate(el => el.colSpan), 1);
  await row(group(0), "carbon dioxide").locator(".table-term").press("ArrowDown");
  assert.equal(await row(group(0), "chlorophyll").locator(".table-term").evaluate(el => el === document.activeElement), true);
  assert.match(await page.locator("#term-info").textContent(), /green pigment/);
  assert.equal(await row(group(0), "oxygen").count(), 0, "unconfirmed bridges never leak into completed groups");
  await page.locator("#table-alphabetical").click();

  // Horizontal arrows cross panel boundaries; vertical arrows stay in
  // the current panel and follow its own rendered group order.
  await input(working, "aerobic", 2).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.evaluate(() => !!document.activeElement.closest(".table-panel-completed")), true);
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains("table-term")), true);
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.evaluate(() => !!document.activeElement.closest(".table-panel-working")), true);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.cluster), "2");

  await input(working, "oxygen", 0).click();
  assert.equal(await row(working, "oxygen").count(), 1);
  assert.equal(await row(group(0), "oxygen").count(), 1);
  assert.deepEqual(await row(page, "oxygen").locator(".table-term-status").allTextContents(), ["1/2 clusters", "1/2 clusters"]);
  assert.equal(await row(group(0), "oxygen").getAttribute("data-ideal-endpoint"), null);
  assert.equal(await group(0).locator(".table-connections-heading").textContent(), "Shared connections");
  assert.doesNotMatch(await row(group(0), "oxygen").locator(".table-term").getAttribute("aria-label"), /aerobic/);
  await page.getByRole("checkbox", { name: "Remember incorrect choices", exact: true }).check();
  await input(working, "oxygen", 2).click();
  await page.waitForFunction(() => !document.querySelector(".table-cell-incorrect"));
  assert.deepEqual(await row(working, "oxygen").locator('input[data-cluster="2"] + .table-wrong-mark').evaluateAll(marks => marks.map(mark => mark.hidden)), [false]);
  const beforeInspection = await page.evaluate(() => CC.state.made);
  await row(group(0), "oxygen").locator(".table-term").click();
  assert.equal(await page.evaluate(() => CC.state.made), beforeInspection, "completed term buttons inspect without placing a connection");
  await input(working, "oxygen", 1).click();
  assert.equal(await row(working, "oxygen").count(), 0, "a solved bridge with a completed destination leaves the working panel");
  assert.equal(await row(group(0), "oxygen").count(), 1);
  assert.equal(await row(group(0), "oxygen").locator(".table-term").evaluate(el => el === document.activeElement), true,
    "a finished bridge's checkbox focus follows it into the compact list");

  await completed.locator(".table-scroll").evaluate(el => { el.style.maxHeight = "120px"; el.scrollTop = el.scrollHeight; });
  assert.ok(await completed.locator(".table-scroll").evaluate(el => el.scrollTop > 0));
  await input(working, "aerobic", 1).click();
  assert.deepEqual(await clusters(completed), [1, 0], "newly completed clusters are prepended");
  assert.equal(await completed.locator(".table-scroll").evaluate(el => el.scrollTop), 0);
  await completed.locator(".table-scroll").evaluate(el => { el.style.maxHeight = ""; });
  assert.equal(await row(group(1), "oxygen").getAttribute("data-ideal-endpoint"), "aerobic");
  assert.equal(await row(page, "oxygen").count(), 2);

  // Reset returns ordinary terms and unfinished bridges to play. A
  // subsequent completion in a diagram gets its own new position.
  await group(0).locator(".table-completed-cluster").click({ button: "right" });
  await page.locator(".cluster-menu").getByRole("menuitem", { name: "Reset cluster", exact: true }).click();
  assert.equal(await split.isChecked(), true);
  assert.deepEqual(await clusters(completed), [1]);
  assert.equal(await row(working, "carbon dioxide").count(), 1);
  assert.equal(await row(working, "oxygen").count(), 1);
  await page.click("#mode-graph");
  await page.evaluate(() => {
    CC.handleTap(CC.state.nodes.find(node => node.word === "carbon dioxide"));
    CC.handleTap(CC.state.nodes.find(node => node.word === "sunlight"));
  });
  await page.click("#mode-table");
  assert.deepEqual(await clusters(completed), [0, 1], "completion order includes moves made in other modes");
  await input(working, "oxygen", 0).click();
  for (const word of ["decomposers", "trophic level"]) await input(working, word, 2).click();
  assert.deepEqual(await clusters(completed), [2, 0, 1]);
  assert.deepEqual(await names(working), ["glucose", "producers"], "unfinished bridges remain after all ordinary clusters are complete");
  await input(working, "glucose", 0).click();
  assert.equal(await row(working, "glucose").count(), 1);
  assert.equal(await row(group(0), "glucose").count(), 1);
  await input(working, "glucose", 1).click();
  assert.equal(await row(working, "glucose").count(), 0);
  assert.equal(await row(group(1), "glucose").getAttribute("data-ideal-endpoint"), "ATP");
  for (const ci of [0, 2]) await input(working, "producers", ci).click();
  assert.deepEqual(await clusters(completed), [2, 0, 1], "bridge arrivals cannot rearrange completed clusters");
  assert.equal(await working.locator(".table-panel-empty").isVisible(), true);
  assert.equal(await working.locator(".table-scroll").isHidden(), true);
  assert.equal(await page.evaluate(() => CC.state.made === CC.state.need), true);
  assert.equal(await row(page, "producers").count(), 2);
  assert.equal(await page.locator("#table-group-clusters").isDisabled(), true, "the completed panel already groups every cluster");
  assert.equal(await page.evaluate(() => {
    const ids = [...document.querySelectorAll("#table-board [id]")].map(el => el.id);
    return ids.length === new Set(ids).size && [...document.querySelectorAll(".table-check input")].every(el =>
      el.getAttribute("aria-labelledby").split(" ").every(id => document.getElementById(id)));
  }), true, "both tables have unique IDs and valid accessible heading references");

  const history = await page.evaluate(() => JSON.stringify(CC.state.moveHistory));
  await split.uncheck();
  assert.deepEqual(await names(page), alphabetical, "the single-table index remains available");
  assert.equal(await completed.count(), 0);
  await split.check();
  assert.deepEqual(await clusters(completed), [2, 0, 1]);
  assert.equal(await page.evaluate(() => JSON.stringify(CC.state.moveHistory)), history);
  await open(page, baseURL, "energy-flow", "");
  assert.equal(await split.isChecked(), true, "panel preference survives reloads");
  assert.deepEqual(await clusters(completed), [2, 0, 1], "replayed moves reconstruct completion order");

  await page.locator("#table-show-info").check();
  assert.ok((await group(1).locator(".table-term-info").allTextContents()).some(Boolean));
  assert.equal(await completed.locator("thead").isVisible(), true);
  assert.equal(await group(1).locator(".table-group-heading th").evaluate(el => el.colSpan), 2);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(() => {
    const left = document.querySelector(".table-panel-working").getBoundingClientRect();
    const right = document.querySelector(".table-panel-completed").getBoundingClientRect();
    const scroll = document.querySelector(".table-panel-completed .table-scroll");
    const term = scroll.querySelector(".table-row th");
    const before = term.getBoundingClientRect().left;
    scroll.scrollLeft = scroll.scrollWidth;
    return { stacked: right.top >= left.bottom, width: document.documentElement.scrollWidth,
      viewport: innerWidth, before, after: term.getBoundingClientRect().left,
      wraps: [...scroll.querySelectorAll(".table-term-info")].every(el => el.scrollWidth <= el.clientWidth + 1) };
  });
  assert.equal(mobile.stacked, true);
  assert.ok(mobile.width <= mobile.viewport);
  assert.ok(Math.abs(mobile.after - mobile.before) < 1);
  assert.equal(mobile.wraps, true);

  await page.setViewportSize(viewport);
  await page.click("#reset");
  assert.equal(await split.isChecked(), true, "Start over keeps the layout preference");
  assert.deepEqual(await clusters(completed), []);
  assert.deepEqual(await names(working), alphabetical);
  await open(page, baseURL, "lacans-three-registers");
  assert.equal(await split.isChecked(), true, "panel preference applies across puzzles");
  // A bridge solved before any ordinary cluster completes must stay visible.
  for (const ci of [0, 1, 2]) await input(working, "Borromean knot", ci).click();
  assert.equal(await row(working, "Borromean knot").count(), 1);
  await page.click("#show-solution");
  assert.equal(await row(completed, "Borromean knot").count(), 3);
  assert.deepEqual(await row(completed, "Borromean knot").locator(".table-term-status").allTextContents(), Array(3).fill("Shared bridge"));
  assert.equal(await completed.locator("input").count(), 0);
  assert.equal(await row(working, "Borromean knot").count(), 0);

  await open(page, baseURL, "interpreting-a-text");
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-selecting");
  await row(group(0), "close reading").locator(".table-term").click();
  assert.deepEqual(await row(completed, "close reading").locator(".table-term").evaluateAll(buttons => buttons.map(el => el.getAttribute("aria-pressed"))), ["true", "true"]);
  await row(group(0), "diction").locator(".table-term").click();
  await page.click("#lens-check");
  assert.match(await row(group(0), "diction").getAttribute("class"), /lens-correct/);

  await open(page, baseURL, "when-systems-stop-seeing-people");
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-assigning");
  await row(completed, "eligibility category").locator(".table-term").click();
  await page.locator("#lens-assignment #options button").first().click();
  assert.equal(await row(completed, "eligibility category").locator(".table-term-status").textContent(), "Lens 1");
  await page.locator("#lens-assignment #check").click();
  assert.match(await row(completed, "eligibility category").getAttribute("class"), /lens-assignment-correct/);

  await open(page, baseURL, "film-classics");
  await page.waitForFunction(() => CC.state.phase === "lens-quiz-answering");
  await page.locator("#lens-quiz-options button").filter({ hasText: "Howard Hawks" }).click();
  await page.click("#lens-check");
  assert.match(await row(completed, "Ball of Fire").getAttribute("class"), /lens-quiz-incorrect/);
  assert.deepEqual(errors, []);
}
