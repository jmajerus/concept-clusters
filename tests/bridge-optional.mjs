import assert from "node:assert/strict";
import { validatePuzzleContent } from "../modules/contentValidation.js";

export const name = "optional bridges: disconnected puzzles work in every board mode";

const fixture = {
  id: "bridge-optional-fixture",
  title: "Bridge-optional fixture",
  category: "Science",
  clusters: [
    {
      name: "Alpha",
      color: "teal",
      fact: "The Alpha cluster is complete.",
      terms: ["alpha one", "alpha two", "alpha three"],
      seeds: ["alpha one", "alpha two"]
    },
    {
      name: "Beta",
      color: "blue",
      fact: "The Beta cluster is complete.",
      terms: ["beta one", "beta two", "beta three"],
      seeds: ["beta one", "beta two"]
    },
    {
      name: "Gamma",
      color: "amber",
      fact: "The Gamma cluster is complete.",
      terms: ["gamma one", "gamma two", "gamma three"],
      seeds: ["gamma one", "gamma two"]
    }
  ],
  bridges: []
};

const partiallyConnectedFixture = {
  ...fixture,
  id: "partially-connected-fixture",
  title: "Partially connected fixture",
  bridges: [{
    term: "real relationship",
    clusters: [0, 1],
    fact: "Alpha and Beta have a genuine relationship; Gamma does not need a manufactured one."
  }]
};

export async function run(page, baseURL) {
  // Both a completely bridge-free puzzle and a partially connected cluster
  // graph are valid. Bridge validation itself remains unchanged.
  assert.deepEqual(validatePuzzleContent(fixture), []);
  assert.deepEqual(validatePuzzleContent(partiallyConnectedFixture), []);
  assert.ok(validatePuzzleContent({
    ...fixture,
    bridges: [{ term: "broken relationship", clusters: [0], fact: "Invalid." }]
  }).some(error => error.includes("bridges must name 2 or 3 clusters")));

  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=graph`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  async function exercisePuzzle(puzzle) {
    const fixtureIndex = await page.evaluate(candidate => {
      const index = CC.PUZZLES.push(candidate) - 1;
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = candidate.title;
      document.getElementById("puzzle-picker").appendChild(option);
      return index;
    }, puzzle);
    await page.selectOption("#puzzle-picker", String(fixtureIndex));
    await page.waitForFunction(id => CC.state?.puzzle.id === id, puzzle.id);

    const expectedNodeCount = puzzle.clusters.reduce(
      (sum, cluster) => sum + cluster.terms.length,
      puzzle.bridges.length
    );
    const expectedNeed = puzzle.clusters.reduce(
      (sum, cluster) => sum + cluster.terms.length - cluster.seeds.length,
      puzzle.bridges.reduce((sum, bridge) => sum + bridge.clusters.length, 0)
    );
    const expectedBridgeLines = puzzle.bridges.reduce(
      (sum, bridge) => sum + bridge.clusters.length,
      0
    );

    for (const [mode, selector] of [
      ["graph", "#mode-graph"],
      ["star", "#mode-star"],
      ["sets", "#mode-sets"]
    ]) {
      await page.click("#reset");
      await page.click(selector);
      await page.waitForFunction(expected => CC.mode === expected, mode);
      await page.waitForTimeout(100);

      const initial = await page.evaluate(() => ({
        nodeCount: CC.state.nodes.length,
        bridgeCount: CC.state.puzzle.bridges.length,
        made: CC.state.made,
        need: CC.state.need,
        renderedNodes: document.querySelectorAll("#board g.node").length,
        bridgeLines: document.querySelectorAll("#board .bridge-link").length,
        badTransforms: [...document.querySelectorAll("#board g.node")]
          .map(node => node.getAttribute("transform") || "")
          .filter(transform => /NaN|undefined/.test(transform))
      }));
      assert.deepEqual(initial, {
        nodeCount: expectedNodeCount,
        bridgeCount: puzzle.bridges.length,
        made: 0,
        need: expectedNeed,
        renderedNodes: expectedNodeCount,
        bridgeLines: 0,
        badTransforms: []
      }, `${mode}: ${puzzle.id} initial board`);

      await page.evaluate(() => CC.showSolution());
      await page.waitForFunction(() => CC.state.made === CC.state.need);
      const solved = await page.evaluate(() => ({
        phase: CC.state.phase,
        allTermsPlaced: CC.state.nodes.every(CC.isDone),
        shownClusters: CC.state.shownClusters.size,
        bridgeLines: document.querySelectorAll("#board .bridge-link").length
      }));
      assert.deepEqual(solved, {
        phase: "complete",
        allTermsPlaced: true,
        shownClusters: 3,
        bridgeLines: expectedBridgeLines
      }, `${mode}: ${puzzle.id} solved board`);
    }
  }

  await exercisePuzzle(fixture);
  await exercisePuzzle(partiallyConnectedFixture);

  assert.deepEqual(errors, [], `browser errors:\n${errors.join("\n")}`);
}
