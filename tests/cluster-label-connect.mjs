// Every mode lets a selected term be tapped into a cluster by its label:
// a Star title, a Graph legend chip, or a Circle cluster. With nothing
// selected, the label tap connects nothing.
import assert from "node:assert/strict";

export const name = "cluster labels: tapping a cluster's label connects the selected term in every mode";

const fixture = {
  id: "cluster-label-connect-fixture",
  title: "Cluster label fixture",
  category: "Science",
  clusters: [
    { name: "Alpha", color: "teal", fact: "Alpha is complete.",
      terms: ["alpha one", "alpha two", "alpha three"], seeds: ["alpha one", "alpha two"] },
    { name: "Beta", color: "blue", fact: "Beta is complete.",
      terms: ["beta one", "beta two", "beta three"], seeds: ["beta one", "beta two"] }
  ],
  bridges: []
};

const labelSelector = {
  graph: "#cluster-legend .legend-chip[data-ci]",
  star: "#board .title-node",
  sets: "#board g.set-cluster text.set-heading"
};

async function clickLabel(page, mode, ci) {
  await page.evaluate(({ selector, ci }) => {
    document.querySelectorAll("[data-test-label]").forEach(el => el.removeAttribute("data-test-label"));
    const label = [...document.querySelectorAll(selector)].find(el => {
      const data = el.__data__ ?? el.parentNode.__data__;
      return data ? data.ci === ci : Number(el.dataset.ci) === ci;
    });
    label.setAttribute("data-test-label", "");
  }, { selector: labelSelector[mode], ci });
  await page.click("[data-test-label]");
}

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

    const free = await page.evaluate(() => {
      const node = CC.state.nodes.find(n => !CC.isBridge(n) && !CC.isDone(n));
      return { word: node.word, ci: node.gs[0], other: (node.gs[0] + 1) % CC.state.puzzle.clusters.length };
    });

    // No selection: the label is info-only.
    await clickLabel(page, mode, free.ci);
    assert.equal(await page.evaluate(() => CC.state.made), 0, `${mode}: unselected label tap connected something`);

    // Wrong cluster: rejected the same way a member tap would be.
    await page.evaluate(word => CC.handleTap(CC.state.nodes.find(n => n.word === word)), free.word);
    await clickLabel(page, mode, free.other);
    assert.equal(await page.evaluate(() => CC.state.made), 0, `${mode}: wrong-cluster label tap connected`);

    // Right cluster.
    await page.evaluate(word => CC.handleTap(CC.state.nodes.find(n => n.word === word)), free.word);
    await clickLabel(page, mode, free.ci);
    const placed = await page.evaluate(word => ({
      made: CC.state.made,
      done: CC.isDone(CC.state.nodes.find(n => n.word === word)),
      selected: CC.state.selected?.word ?? null
    }), free.word);
    assert.deepEqual(placed, { made: 1, done: true, selected: null }, `${mode}: label tap did not connect`);
  }

  assert.deepEqual(errors, [], `browser errors:\n${errors.join("\n")}`);
}
