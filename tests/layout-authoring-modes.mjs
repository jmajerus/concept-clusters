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
    assert.equal(await page.isDisabled(id), false, `${id} should switch modes in layout authoring`);
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

// Member pills each drawn ideal line passes under, excluding the pill it
// ends on.
function idealLinesUnderPills(page) {
  return page.evaluate(() => {
    const pills = [...document.querySelectorAll(".set-pills g.node")]
      .map(element => {
        const node = element.__data__;
        const match = /translate\(([-\d.e]+),([-\d.e]+)\)/.exec(element.getAttribute("transform"));
        return { word: node.word, docked: node.gs.length === 1, x: +match[1], y: +match[2], w: node.w };
      })
      .filter(pill => pill.docked);
    let passes = 0;
    document.querySelectorAll(".set-lines line.bridge-link.ideal").forEach(line => {
      const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map(name => +line.getAttribute(name));
      pills.forEach(pill => {
        if (Math.abs(x1 - pill.x) <= pill.w / 2 + 1 && Math.abs(y1 - pill.y) <= 16) return;
        for (let t = 0; t <= 1; t += 0.01) {
          const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
          if (Math.abs(x - pill.x) < pill.w / 2 - 2 && Math.abs(y - pill.y) < 13) { passes++; break; }
        }
      });
    });
    return passes;
  });
}

// Circle stacks follow connected ideal lines only, and re-stack after a
// bridge drag: a bridge dragged straight above (or below) its circle pulls
// its target term to the top (or bottom) row.
async function circleMemberOrder(page) {
  assert.equal(await idealLinesUnderPills(page), 0, "an ideal line passes under a member pill");
  const arm = await page.evaluate(() => {
    const state = window.CC.state;
    const armed = new Set();
    let found = null;
    state.links.forEach(link => {
      if (!link.ideal || !link.source.connected.includes(link.clusterIndex)) return;
      armed.add(link.clusterIndex);
      if (!found) found = { bridge: link.source.word, target: link.target.word, ci: link.clusterIndex };
    });
    const unarmedReordered = state.puzzle.clusters
      .map((_, ci) => ci)
      .filter(ci => !armed.has(ci) && state.setLayout.memberOrder?.has(ci));
    const circle = state.setLayout.csNodes[found.ci];
    const room = circle.y - circle.r - state.setLayout.stripHeight;
    const above = room > 90;
    const svg = document.querySelector("#board");
    const toScreen = (x, y) => {
      const point = svg.createSVGPoint();
      point.x = x; point.y = y;
      const screen = point.matrixTransform(svg.getScreenCTM());
      return { x: screen.x, y: screen.y };
    };
    const pill = [...document.querySelectorAll(".set-pills g.node")]
      .find(element => element.__data__.word === found.bridge);
    const box = pill.getBoundingClientRect();
    return {
      ...found,
      unarmedReordered,
      above,
      from: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      to: toScreen(circle.x, above ? circle.y - circle.r - 45 : circle.y + circle.r + 45)
    };
  });
  assert.deepEqual(arm.unarmedReordered, [], "a circle without a connected ideal line left hash order");
  await page.mouse.move(arm.from.x, arm.from.y);
  await page.mouse.down();
  await page.mouse.move(arm.to.x, arm.to.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForFunction(({ ci, target, above }) => {
    const order = window.CC.state.setLayout.memberOrder?.get(ci);
    return order && order[above ? 0 : order.length - 1] === target;
  }, arm, { timeout: 5000 });
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const mode of ["graph", "sets"]) {
    const layout = await authoringMode(page, baseURL, mode);
    assert.equal(layout.schemaVersion, 1);
    await runtimeOverride(page, baseURL, mode);
    if (mode === "sets") await circleMemberOrder(page);
  }

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
