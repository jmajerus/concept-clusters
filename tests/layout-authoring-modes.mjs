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
  // Circle names each line obstruction for the panel; a saved layout keeps
  // only the counts.
  if (mode === "sets") {
    // A Circle layout carries each circle's stacking order. Applying it
    // restores those rows exactly, and a fixed saved layout loads with them,
    // rather than re-deriving the order from the lines.
    assert.ok(layout.memberOrders?.["cluster:0"]?.length, "capture records stacking orders");
    const reversed = [...layout.memberOrders["cluster:0"]].reverse();
    const applied = await page.evaluate(order => {
      const state = window.CC.state;
      const arrangement = state.layoutAdapter.capture();
      arrangement.memberOrders["cluster:0"] = order;
      state.layoutAdapter.apply(arrangement);
      state.paint();
      return state.setLayout.memberOrder.get(0);
    }, reversed);
    assert.deepEqual(applied, reversed, "applied rows are kept");
    await page.evaluate(order => {
      const state = window.CC.state;
      const saved = state.layoutAdapter.capture({ purpose: "authoring" });
      saved.memberOrders["cluster:0"] = order;
      saved.fixed = true;
      state.puzzle.layout = { schemaVersion: 1, modes: { sets: saved } };
    }, reversed);
    await page.click("#reset");
    await page.waitForFunction(() =>
      window.CC.state.solutionLayout === "pretty" && window.CC.state.layoutSource?.kind === "fixed",
    null, { timeout: 15000 });
    assert.deepEqual(await page.evaluate(() => window.CC.state.setLayout.memberOrder.get(0)), reversed,
      "a fixed saved layout loads with its rows");
    const named = await page.evaluate(() => window.CC.state.layoutAdapter.metrics().obstructions);
    assert.ok(Array.isArray(named), "Circle metrics name their obstructions");
    assert.equal(named.length, layout.metrics.lineHeadingIntersections + layout.metrics.lineCircleIntersections);
    assert.equal(layout.metrics.obstructions, undefined, "saved metrics hold counts only");
    // A controlled obstruction: pull a bridge out past its own circle's
    // heading, so the drawn arm runs through that heading's text.
    const expected = await page.evaluate(() => {
      const state = window.CC.state;
      const line = document.querySelector("line.bridge-link");
      const word = line.parentNode.__data__.term;
      const side = line.__data__.side;
      const node = state.nodes.find(candidate => candidate.word === word);
      const heading = [...document.querySelectorAll("g.set-cluster")]
        .find(group => group.__data__.ci === side).querySelector("text.set-heading");
      const svg = document.getElementById("board");
      const box = heading.getBBox();
      const toBoard = svg.getCTM().inverse().multiply(heading.getCTM());
      const centre = svg.createSVGPoint();
      centre.x = box.x + box.width / 2;
      centre.y = box.y + box.height / 2;
      const target = centre.matrixTransform(toBoard);
      // The arm starts at its target term, which shifts as the bridge
      // moves; a few passes settle it.
      for (let pass = 0; pass < 4; pass++) {
        const arm = [...document.querySelectorAll("line.bridge-link")]
          .find(candidate => candidate.parentNode.__data__.term === word && candidate.__data__.side === side);
        const x1 = Number(arm.getAttribute("x1")), y1 = Number(arm.getAttribute("y1"));
        node.x = node.fx = x1 + (target.x - x1) * 1.6;
        node.y = node.fy = y1 + (target.y - y1) * 1.6;
        state.paint();
      }
      return `${word} → “${state.puzzle.clusters[side].name}” heading`;
    });
    const obstructed = await page.evaluate(() => window.CC.state.layoutAdapter.metrics().obstructions);
    assert.ok(obstructed.includes(expected), `expected "${expected}" among ${JSON.stringify(obstructed)}`);
    // The panel refreshes on a layout change and lists the same name.
    await page.evaluate(() => window.CC.state.onAuthorLayoutChanged?.("placement"));
    assert.ok((await page.textContent("#layout-metric-pill-crossings")).includes(expected));
    // Pushing a bridge onto a circle names the overlap in the panel and
    // outlines the defects on the board.
    const overlapLabel = await page.evaluate(() => {
      const state = window.CC.state;
      const bridge = state.nodes.find(node => node.gs.length > 1 && node.connected.length);
      const ci = bridge.gs[0];
      const circle = state.setLayout.csNodes[ci];
      bridge.x = bridge.fx = circle.x + circle.r - 10;
      bridge.y = bridge.fy = circle.y;
      state.paint();
      state.onAuthorLayoutChanged?.("drag");
      return `${bridge.word} / “${state.puzzle.clusters[ci].name}” circle`;
    });
    assert.ok((await page.textContent("#layout-metric-overlaps")).includes(overlapLabel),
      `overlap "${overlapLabel}" is named in the panel`);
    assert.ok(await page.evaluate(() => document.querySelectorAll("#board .layout-defect-marks > *").length) > 0,
      "defects are outlined on the board");
  }
  // Near edge reports boundsViolations apart from overlaps; Star has none.
  const nearEdge = mode === "star" ? "—" : String(layout.metrics.boundsViolations);
  await page.waitForFunction(expected =>
    document.getElementById("layout-metric-near-edge").textContent === expected, nearEdge);
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
// bridge drag. A bridge dragged straight above (or below) its circle pulls
// its target term to the top (or bottom) row when the term fits there;
// otherwise the line leaves from the term's side end. Either way no ideal
// line runs under another pill.
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
  await page.waitForTimeout(600);
  const placed = await page.evaluate(({ ci, target }) => {
    const order = window.CC.state.setLayout.memberOrder?.get(ci) || window.CC.state.setLayout.baseOrders[ci];
    return { index: order.indexOf(target), last: order.length - 1 };
  }, arm);
  const endRow = arm.above ? 0 : placed.last;
  const oppositeRow = arm.above ? placed.last : 0;
  assert.notEqual(placed.index, oppositeRow, "target moved to the end row facing away from its bridge");
  if (placed.index !== endRow) {
    // Left in a middle row: its line must leave from a side end of its pill.
    const start = await page.evaluate(({ bridge, target, ci }) => {
      const line = [...document.querySelectorAll("line.bridge-link")]
        .find(element => element.parentNode.__data__?.term === bridge && element.__data__.side === ci);
      const pill = [...document.querySelectorAll(".set-pills g.node")]
        .find(element => element.__data__.word === target);
      // The pill group is translated to the pill's centre in board units.
      const [cx, cy] = pill.getAttribute("transform").match(/-?[\d.]+/g).map(Number);
      const halfW = pill.__data__.w / 2;
      return { x: Number(line.getAttribute("x1")), y: Number(line.getAttribute("y1")), left: cx - halfW, right: cx + halfW, mid: cy };
    }, arm);
    assert.ok(Math.min(Math.abs(start.x - start.left), Math.abs(start.x - start.right)) < 2 && Math.abs(start.y - start.mid) < 2,
      `a middle-row target's line leaves from a side end: ${JSON.stringify(start)}`);
  }
  assert.equal(await idealLinesUnderPills(page), 0, "after the drag an ideal line passes under a member pill");
}

// A saved Graph or Circle layout steers the solve unless it is fixed and
// still current. Polish once, save that result back with a stale revision
// (as a puzzle edit would leave it), and polish again from scratch.
async function hintedSolve(page, baseURL, mode, { fixed }) {
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=${mode}&moves=`);
  await waitForGame(page);
  await page.evaluate(() => window.CC.showSolution());
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty");
  const savedOrder = await page.evaluate(({ mode, fixed }) => {
    const state = window.CC.state;
    const layout = state.layoutAdapter.capture({ purpose: "authoring" });
    layout.puzzleRevision = "fnv1a32:stale000";
    if (fixed === false) layout.fixed = false;
    // Swap where clusters 1 and 2 sat, so the hinted order differs from
    // the one a fresh search just chose.
    const centre = ci => {
      if (mode === "sets") return layout.circles[`cluster:${ci}`];
      const points = state.puzzle.clusters[ci].terms.map(term => layout.nodes[`term:${term}`]);
      return {
        x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
        y: points.reduce((sum, point) => sum + point.y, 0) / points.length
      };
    };
    const [c1, c2] = [centre(1), centre(2)];
    const shift = (ci, dx, dy) => {
      const keys = mode === "sets"
        ? [`cluster:${ci}`]
        : state.puzzle.clusters[ci].terms.map(term => `term:${term}`);
      const points = mode === "sets" ? layout.circles : layout.nodes;
      keys.forEach(key => { points[key] = { ...points[key], x: points[key].x + dx, y: points[key].y + dy }; });
    };
    shift(1, c2.x - c1.x, c2.y - c1.y);
    shift(2, c1.x - c2.x, c1.y - c2.y);
    state.puzzle.layout = { schemaVersion: 1, modes: { [mode]: layout } };
    state.solutionLayout = null;
    state.prettyPrintPromise = null;
    const stats = mode === "graph" ? state.graphLayoutStats : state.circleLayoutStats;
    return stats.order.map(ci => (ci === 1 ? 2 : ci === 2 ? 1 : ci));
  }, { mode, fixed });
  await page.evaluate(() => window.CC.state.layoutAdapter.autoLayout());
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty");
  const result = await page.evaluate(mode => {
    const state = window.CC.state;
    const stats = mode === "graph" ? state.graphLayoutStats : state.circleLayoutStats;
    return { source: state.layoutSource, order: stats.order };
  }, mode);
  assert.equal(result.source.kind, "hint", `${mode}: saved layout did not steer the solve`);
  assert.deepEqual(result.order, savedOrder, `${mode}: hinted solve changed the cluster order`);
  if (fixed === false) {
    assert.equal(result.source.fixedErrors, null);
  } else {
    assert.ok(
      result.source.fixedErrors?.some(error => error.includes("revision is stale")),
      `${mode}: outdated fixed layout did not say why it fell back`
    );
  }
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const mode of ["graph", "sets"]) {
    const layout = await authoringMode(page, baseURL, mode);
    assert.equal(layout.schemaVersion, 1);
    await runtimeOverride(page, baseURL, mode);
    await hintedSolve(page, baseURL, mode, { fixed: false });
    await hintedSolve(page, baseURL, mode, { fixed: true });
    if (mode === "sets") await circleMemberOrder(page);
  }

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
