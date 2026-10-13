// Right-clicking a cluster's label opens its menu in every mode: Solve
// fills it, Reset takes back only that cluster's moves, and Summary lists
// every term and bridge with its status.
import assert from "node:assert/strict";

export const name = "cluster menu: solve, reset, and summary from a cluster's label in every mode";

const fixture = {
  id: "cluster-menu-fixture",
  title: "Cluster menu fixture",
  category: "Science",
  clusters: [
    { name: "Alpha", color: "teal", fact: "Alpha is complete.",
      terms: ["alpha one", "alpha two", "alpha three", "alpha four"], seeds: ["alpha one", "alpha two"] },
    { name: "Beta", color: "blue", fact: "Beta is complete.",
      terms: ["beta one", "beta two", "beta three"], seeds: ["beta one", "beta two"] }
  ],
  bridges: [{ term: "alpha beta link", clusters: [0, 1], fact: "Alpha and Beta share this." }]
};

const labelSelector = {
  graph: "#cluster-legend .legend-chip[data-ci]",
  star: "#board .title-node",
  sets: "#board g.set-cluster text.set-heading"
};

async function openMenu(page, mode, ci) {
  await page.evaluate(({ selector, ci }) => {
    document.querySelectorAll("[data-test-label]").forEach(el => el.removeAttribute("data-test-label"));
    const label = [...document.querySelectorAll(selector)].find(el => {
      const data = el.__data__ ?? el.parentNode.__data__;
      return data ? data.ci === ci : Number(el.dataset.ci) === ci;
    });
    label.setAttribute("data-test-label", "");
  }, { selector: labelSelector[mode], ci });
  await page.click("[data-test-label]", { button: "right" });
  await page.waitForSelector(".cluster-menu:not([hidden])");
  return page.evaluate(() => [...document.querySelectorAll(".cluster-menu button")]
    .map(button => ({ label: button.firstChild.textContent, enabled: !button.disabled })));
}

const choose = (page, label) =>
  page.click(`.cluster-menu button:has-text("${label}")`);

const alphaState = page => page.evaluate(() => {
  const members = CC.state.nodes.filter(n => !CC.isBridge(n) && n.gs[0] === 0);
  const bridge = CC.state.nodes.find(CC.isBridge);
  return {
    alphaPlaced: members.filter(CC.isDone).length,
    bridgeConnected: [...bridge.connected].sort(),
    betaDone: CC.state.nodes.filter(n => !CC.isBridge(n) && n.gs[0] === 1).every(CC.isDone),
    filled: CC.state.filledClusterCount,
    resets: CC.state.resetClusterCount,
    mode: CC.mode
  };
});

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=graph`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.evaluate(candidate => CC.openPuzzle(CC.registerPuzzle(candidate)), fixture);
  await page.waitForFunction(id => CC.state?.puzzle.id === id, fixture.id);

  for (const mode of ["graph", "star", "sets"]) {
    await page.click("#reset");
    await page.click(`#mode-${mode}`);
    await page.waitForFunction(expected => CC.mode === expected, mode);
    await page.waitForTimeout(100);

    // One move outside Alpha, which Reset must keep.
    await page.evaluate(() => {
      const byWord = word => CC.state.nodes.find(n => n.word === word);
      CC.handleTap(byWord("beta three"));
      CC.handleTap(byWord("beta one"));
    });

    assert.deepEqual(await openMenu(page, mode, 0), [
      { label: "Solve cluster", enabled: true },
      { label: "Reset cluster", enabled: false },
      { label: "Cluster summary", enabled: true }
    ], `${mode}: menu on an untouched cluster`);
    await choose(page, "Solve cluster");
    assert.deepEqual(await alphaState(page), {
      alphaPlaced: 4, bridgeConnected: [0], betaDone: true, filled: 1, resets: 0, mode
    }, `${mode}: Solve cluster`);

    assert.deepEqual(await openMenu(page, mode, 0), [
      { label: "Solve cluster", enabled: false },
      { label: "Reset cluster", enabled: true },
      { label: "Cluster summary", enabled: true }
    ], `${mode}: menu on a solved cluster`);
    await choose(page, "Reset cluster");
    await page.waitForTimeout(100);
    assert.deepEqual(await alphaState(page), {
      alphaPlaced: 2, bridgeConnected: [], betaDone: true, filled: 1, resets: 1, mode
    }, `${mode}: Reset cluster`);

    await openMenu(page, mode, 0);
    await choose(page, "Cluster summary");
    const summary = await page.evaluate(() => {
      const dialog = document.querySelector("dialog.cluster-summary");
      return {
        open: dialog.open,
        title: dialog.querySelector("h2").textContent,
        count: dialog.querySelector(".cluster-summary-count").textContent,
        rows: dialog.querySelectorAll(".cluster-summary-list li").length,
        placedMarks: dialog.querySelectorAll(".cluster-summary-mark.placed").length,
        summaries: CC.state.summaryBeforeCompleteCount
      };
    });
    assert.deepEqual(summary, {
      open: true, title: "Alpha", count: "2 of 4 terms placed", rows: 5, placedMarks: 2, summaries: 1
    }, `${mode}: Cluster summary`);
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => document.querySelector("dialog.cluster-summary").open), false,
      `${mode}: Escape did not close the summary`);

    // Escape also closes the menu itself.
    await openMenu(page, mode, 1);
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => document.querySelector(".cluster-menu").hidden), true,
      `${mode}: Escape did not close the menu`);
  }

  assert.deepEqual(errors, [], `browser errors:\n${errors.join("\n")}`);
}
