import assert from "node:assert/strict";
import { hasDefects, defectsWorse } from "../modules/playerLayoutEffort.js";

export const tier = "extended";
export const name = "player layout polish: a crafted board keeps its positions; others go to the saved layout";

const PUZZLE_ID = "fundamental-forces";

async function openFresh(page, baseURL, mode) {
  await page.goto(`${baseURL}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=${mode}&moves=`);
  await page.waitForFunction(() => window.CC?.state?.layoutAdapter && window.CC.state.need > 0, null, { timeout: 30000 });
}

// The solution's links from a Show Solution run, and that run's polished
// layout to use as a saved one.
async function solutionAndLayout(page, baseURL, mode) {
  await openFresh(page, baseURL, mode);
  await page.evaluate(() => window.CC.showSolution());
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty", null, { timeout: 60000 });
  return page.evaluate(() => ({
    moves: window.CC.state.links.map(link => [link.source.word, link.target.word]),
    layout: window.CC.state.layoutAdapter.capture({ purpose: "authoring" })
  }));
}

// Solve as a player would, by tapping, so the board is not a Show Solution
// board; then let the simulation settle.
async function solveAsPlayer(page, baseURL, mode, moves) {
  await openFresh(page, baseURL, mode);
  await page.evaluate(moves => {
    const find = word => window.CC.state.nodes.find(node => node.word === word);
    for (const [source, target] of moves) {
      const a = find(source), b = find(target);
      if (a && b && !window.CC.isDone(a)) {
        window.CC.handleTap(a);
        window.CC.handleTap(b);
      }
    }
  }, moves);
  await page.waitForFunction(() => window.CC.state.made === window.CC.state.need, null, { timeout: 15000 });
  assert.equal(await page.evaluate(() => window.CC.state.completedViaShowSolution), false);
  await page.waitForTimeout(6000);
}

function positions(page, mode) {
  return page.evaluate(mode => {
    const state = window.CC.state;
    const items = mode === "sets"
      ? [...state.setLayout.csNodes.map(node => [`cluster:${node.id}`, node]),
         ...state.nodes.filter(node => node.gs.length > 1).map(node => [node.word, node])]
      : state.nodes.map(node => [node.word, node]);
    return Object.fromEntries(items.map(([key, node]) => [key, { x: node.x, y: node.y }]));
  }, mode);
}

async function dragPill(page, mode) {
  // Circles glide on a CSS transition while the simulation cools; wait
  // until the target stops moving before pressing on it.
  await page.waitForFunction(mode => {
    const element = mode === "sets"
      ? document.querySelector(".set-clusters g.set-cluster circle")
      : [...document.querySelectorAll("g.node")].find(group => group.__data__?.gs?.length === 1);
    const rect = element.getBoundingClientRect();
    const last = window.__dragTarget;
    window.__dragTarget = { x: rect.x, y: rect.y };
    return !!last && Math.hypot(rect.x - last.x, rect.y - last.y) < 2;
  }, mode, { polling: 300, timeout: 15000 });
  // A circle cannot be dragged into a neighbour, so a drag toward one can
  // travel too little to count; try other directions until one registers.
  for (const [dx, dy] of [[60, 40], [-60, -40], [60, -40], [-60, 40]]) {
    const recorded = () => page.evaluate(mode => {
      const entry = window.CC.state.layoutEffort?.[mode];
      return entry ? entry.kept + entry.worsened : 0;
    }, mode);
    const before = await recorded();
    const start = await page.evaluate(mode => {
      const element = mode === "sets"
        ? document.querySelector(".set-clusters g.set-cluster circle")
        : [...document.querySelectorAll("g.node")].find(group => group.__data__?.gs?.length === 1);
      const rect = element.getBoundingClientRect();
      return mode === "sets"
        ? { x: rect.x + rect.width * 0.08, y: rect.y + rect.height / 2 }
        : { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }, mode);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + dx, start.y + dy, { steps: 8 });
    await page.mouse.up();
    if (await recorded() > before) return;
  }
  throw new Error(`${mode}: no drag registered`);
}

async function polish(page) {
  await page.click("#show-solution");
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty", null, { timeout: 60000 });
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const mode of ["graph", "sets", "star"]) {
    const { moves, layout } = await solutionAndLayout(page, baseURL, mode);

    // A real drag on the solved board is recorded with the session.
    await solveAsPlayer(page, baseURL, mode, moves);
    await dragPill(page, mode);
    assert.equal(await page.evaluate(mode => {
      const entry = window.CC.state.layoutEffort?.[mode];
      return entry.kept + entry.worsened;
    }, mode), 1, `${mode}: one deliberate drag should be recorded`);

    // A crafted board keeps the player's positions.
    await page.evaluate(mode => { window.CC.state.layoutEffort = { [mode]: { kept: 3, worsened: 0 } }; }, mode);
    await page.waitForTimeout(1500);
    const before = await positions(page, mode);
    const beforeMetrics = await page.evaluate(() => window.CC.state.layoutAdapter.metrics());
    await polish(page);
    const after = await positions(page, mode);
    const afterMetrics = await page.evaluate(() => window.CC.state.layoutAdapter.metrics());
    const moved = Object.keys(before).filter(key =>
      Math.hypot(after[key].x - before[key].x, after[key].y - before[key].y) > 1);
    if (!hasDefects(mode, beforeMetrics)) {
      assert.deepEqual(moved, [], `${mode}: a clean crafted board moved`);
    } else {
      assert.ok(moved.length <= Object.keys(before).length / 2, `${mode}: repair moved ${moved.length} items`);
      assert.equal(defectsWorse(mode, beforeMetrics, afterMetrics), false, `${mode}: repair made it worse`);
    }
    assert.match(await page.textContent("#message"), /Your layout kept/);

    // A crafted board with a real defect: only the pieces involved move,
    // and the defect is repaired.
    if (mode !== "star") {
      await solveAsPlayer(page, baseURL, mode, moves);
      await page.evaluate(mode => {
        const state = window.CC.state;
        state.layoutEffort = { [mode]: { kept: 3, worsened: 0 } };
        // Pin one piece on top of another, as a careless drag might.
        const [a, b] = mode === "sets"
          ? [state.nodes.find(node => node.gs.length > 1), state.setLayout.csNodes.find(node => node.id !== state.nodes.find(n => n.gs.length > 1).gs[0])]
          : [state.nodes[0], state.nodes[1]];
        a.x = a.fx = b.x + 4;
        a.y = a.fy = b.y + 2;
        // Freeze the board so nothing drifts between this snapshot and the
        // polish; only the repair may move anything after this.
        if (mode === "sets") state.setSim.stop();
      }, mode);
      await page.waitForTimeout(800);
      const brokenBefore = await positions(page, mode);
      const brokenMetrics = await page.evaluate(() => window.CC.state.layoutAdapter.metrics());
      assert.ok(hasDefects(mode, brokenMetrics), `${mode}: the pinned overlap did not register`);
      await polish(page);
      const repairedMetrics = await page.evaluate(() => window.CC.state.layoutAdapter.metrics());
      assert.ok(defectsWorse(mode, repairedMetrics, brokenMetrics), `${mode}: the overlap was not repaired`);
      const repaired = await positions(page, mode);
      const shifted = Object.keys(brokenBefore).filter(key =>
        Math.hypot(repaired[key].x - brokenBefore[key].x, repaired[key].y - brokenBefore[key].y) > 1);
      const reported = await page.evaluate(mode =>
        (mode === "sets" ? window.CC.state.circleLayoutStats : window.CC.state.graphLayoutStats)?.moved, mode);
      assert.ok(shifted.length >= 1 && shifted.length <= 3,
        `${mode}: repair moved ${shifted.length} items (reported ${reported}): ${shifted.join(", ")}`);
    }

    // A board nobody arranged polishes straight to the saved layout.
    await solveAsPlayer(page, baseURL, mode, moves);
    await page.evaluate(({ mode, layout }) => {
      window.CC.state.puzzle.layout = { schemaVersion: 1, modes: { [mode]: layout } };
    }, { mode, layout });
    await polish(page);
    assert.equal(await page.evaluate(() => window.CC.state.layoutSource?.kind), "fixed", `${mode}: did not use the saved layout`);
  }

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
