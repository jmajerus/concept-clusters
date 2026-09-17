import assert from "node:assert/strict";

export const name = "layout authoring modes: selected URL, shared adapters, and runtime overrides";
export const tier = "extended";

const PUZZLE_ID = "fundamental-forces";

async function waitForGame(page) {
  await page.waitForFunction(() => window.CC?.state?.layoutAdapter?.capture);
}

async function authoringMode(page, baseURL, mode) {
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&admin&mode=${mode}`);
  await waitForGame(page);
  await page.click("#layout-author-btn");
  await page.waitForURL(/author=layout/);
  assert.equal(new URL(page.url()).searchParams.get("mode"), mode);

  await page.goto(
    `${baseURL}/index.html?puzzle=${PUZZLE_ID}&author=layout&mode=${mode}`
  );
  await waitForGame(page);
  assert.equal(await page.evaluate(() => window.CC.mode), mode);
  assert.equal(new URL(page.url()).searchParams.get("mode"), mode);
  for (const id of ["#mode-graph", "#mode-star", "#mode-sets"]) {
    assert.equal(await page.isDisabled(id), true, `${id} remained enabled in layout authoring`);
  }
  for (const name of ["capture", "apply", "validate", "metrics"]) {
    assert.equal(
      await page.evaluate(adapterName => typeof window.CC.state.layoutAdapter[adapterName], name),
      "function",
      `${mode} renderer did not publish ${name}()`
    );
  }

  await page.click("#layout-authoring-prepare");
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty");
  const layout = await page.evaluate(() =>
    window.CC.state.layoutAdapter.capture({ purpose: "authoring" })
  );
  assert.equal(layout.puzzleId, PUZZLE_ID);
  assert.equal(layout.metrics.lineCrossings, 0);
  return layout;
}

async function runtimeOverride(page, baseURL, mode) {
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=${mode}&moves=`);
  await waitForGame(page);
  await page.evaluate(() => window.CC.showSolution());
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty");

  const changed = await page.evaluate(() => {
    const state = window.CC.state;
    const mode = window.CC.mode;
    const layout = state.layoutAdapter.capture({ purpose: "authoring" });
    if (mode === "graph") {
      const key = Object.keys(layout.nodes)[0];
      const point = layout.nodes[key];
      layout.nodes[key] = {
        ...point,
        x: Math.max(24, point.x - 35),
        y: Math.max(28, point.y - 20),
        pinned: true
      };
    } else {
      const point = layout.circles["cluster:0"];
      layout.circles["cluster:0"] = {
        ...point,
        x: Math.max(24, point.x - 35),
        y: Math.max(28, point.y - 20),
        pinned: true
      };
    }
    state.puzzle.layout = { schemaVersion: 1, modes: { [mode]: layout } };
    state.solutionLayout = null;
    state.prettyPrintPromise = null;
    return mode === "graph"
      ? layout.nodes[Object.keys(layout.nodes)[0]]
      : layout.circles["cluster:0"];
  });

  await page.evaluate(() => window.CC.state.layoutAdapter.autoLayout());
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty");
  const applied = await page.evaluate(mode => {
    const state = window.CC.state;
    const node = mode === "graph"
      ? state.nodes[0]
      : state.setLayout.csNodes[0];
    return { x: node.x, y: node.y };
  }, mode);
  assert.ok(Math.hypot(applied.x - changed.x, applied.y - changed.y) < 0.2);
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const mode of ["graph", "sets"]) {
    const layout = await authoringMode(page, baseURL, mode);
    assert.equal(layout.schemaVersion, 1);
    await runtimeOverride(page, baseURL, mode);
  }

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
