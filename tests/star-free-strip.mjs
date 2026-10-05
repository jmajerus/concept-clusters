// Star cold start uses Circle-style free-term strip packing when
// puzzle.board.starFreeStrip is true, stays classic when it is false, or
// follows the capacity heuristic when the field is omitted.
import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import {
  starFreeStripCapacityNeeded,
  starFreeStripEnabled
} from "../modules/starLayoutRepository.js";

export const name = "star layout: free-term strip capacity heuristic and admin try";
// Wide Star canvas (960x620) only when the wrap is >= 900px — pin that so
// capacity assertions stay deterministic outside the default runner viewport.
export const viewport = { width: 1100, height: 800 };

export async function run(page, baseURL) {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error));
  await page.emulateMedia({ reducedMotion: "reduce" });

  const energyFlow = PUZZLES.find(puzzle => puzzle.id === "energy-flow");
  const models = PUZZLES.find(puzzle => puzzle.id === "models-of-the-divided-mind");
  const fundamentalForces = PUZZLES.find(puzzle => puzzle.id === "fundamental-forces");
  const confrontingShadow = PUZZLES.find(puzzle => puzzle.id === "confronting-the-shadow");
  // 1-row and 2-row openings stay classic; 3+ row openings auto-enable.
  assert.equal(starFreeStripCapacityNeeded(energyFlow, 960, 620), false);
  assert.equal(starFreeStripCapacityNeeded(fundamentalForces, 960, 620), false);
  assert.equal(starFreeStripCapacityNeeded(confrontingShadow, 960, 620), true);
  assert.equal(starFreeStripCapacityNeeded(models, 960, 620), true);
  assert.equal(starFreeStripEnabled(energyFlow, { width: 960, height: 620 }), false);
  assert.equal(starFreeStripEnabled(fundamentalForces, { width: 960, height: 620 }), false);
  assert.equal(starFreeStripEnabled(confrontingShadow, { width: 960, height: 620 }), true);
  assert.equal(starFreeStripEnabled(models, { width: 960, height: 620 }), true);
  assert.equal(starFreeStripEnabled(
    { ...energyFlow, board: { starFreeStrip: true } },
    { width: 960, height: 620 }
  ), true);
  assert.equal(starFreeStripEnabled(
    { ...models, board: { starFreeStrip: false } },
    { width: 960, height: 620 }
  ), false);

  // Compact puzzle: classic force cold start.
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=star`);
  await page.waitForFunction(() =>
    window.CC?.state?.phase === "assembling" &&
    typeof window.CC.state.getStarFreeStripReport === "function"
  );
  const classic = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(classic.useFreeStrip, false);
  assert.equal(classic.capacityNeeded, false);
  assert.equal(classic.useSeedBesideTitle, false);
  assert.ok(classic.freeCount > 0);
  assert.equal(classic.offboard, false, "no strip in play, so nothing is off-board");

  // Dense puzzle: capacity auto-enables strip without a registry lock.
  await page.goto(
    `${baseURL}/index.html?puzzle=models-of-the-divided-mind&mode=star`
  );
  if (await page.evaluate(() => window.CC?.state?.learningGated)) {
    await page.click("#learning-introduction #skip");
  }
  await page.waitForFunction(() =>
    window.CC?.state?.phase === "assembling" &&
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === true
  );
  const auto = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(auto.capacityNeeded, true);
  assert.equal(auto.freeStripActive, true);
  assert.ok(auto.stripHeight > 20);

  await page.goto(
    `${baseURL}/index.html?puzzle=energy-flow&admin&mode=star`
  );
  await page.waitForFunction(() =>
    document.getElementById("admin-layout-actions") &&
    !document.getElementById("admin-layout-actions").hidden &&
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === false
  );
  assert.equal(await page.isHidden("#star-free-strip-btn"), true);
  assert.equal(await page.isHidden("#star-bridge-preconnect-btn"), true);
  assert.equal(await page.isVisible("#layout-author-btn"), true);

  await page.evaluate(() => {
    const puzzle = structuredClone(window.CC.state.puzzle);
    puzzle.board = { starFreeStrip: true };
    window.CC.openPuzzle(window.CC.registerPuzzle(puzzle));
  });
  await page.waitForFunction(() =>
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === true
  );
  const stripped = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(stripped.useFreeStrip, true);
  assert.equal(stripped.useSeedBesideTitle, true, "strip implies seed-beside-title");
  assert.equal(stripped.freeStripActive, true);
  assert.ok(stripped.stripHeight > 20);

  // Dense strip: free terms sit off-board above y=0 so the play rectangle
  // keeps full board height. Connecting terms reflows the off-board band
  // (viewBox shrinks); at 2 or fewer free terms the strip is abandoned.
  // Capacity already auto-enables strip for this puzzle.
  await page.goto(
    `${baseURL}/index.html?puzzle=models-of-the-divided-mind&mode=star`
  );
  if (await page.evaluate(() => window.CC?.state?.learningGated)) {
    await page.click("#learning-introduction #skip");
  }
  await page.waitForFunction(() =>
    window.CC?.state?.phase === "assembling" &&
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === true &&
    window.CC?.state?.getStarFreeStripReport?.().freeCount > 8
  );
  const beforeReflow = await page.evaluate(() => {
    const report = window.CC.state.getStarFreeStripReport();
    const board = document.getElementById("board");
    return {
      report,
      viewBox: board?.getAttribute("viewBox") || "",
      titleMidY: [...document.querySelectorAll(".title-node")]
        .map(el => el.__data__?.y)
        .filter(y => Number.isFinite(y))
        .reduce((sum, y, _, arr) => sum + y / arr.length, 0)
    };
  });
  assert.ok(beforeReflow.report.stripHeight > 60, "expected a multi-row opening strip");
  assert.equal(beforeReflow.report.freeStripActive, true);
  assert.equal(beforeReflow.report.offboard, true);
  assert.ok(beforeReflow.report.viewBoxY < 0, "viewBox should grow upward for the strip");
  assert.equal(beforeReflow.report.playMidY, beforeReflow.report.boardHeight / 2);
  assert.match(beforeReflow.viewBox, /^-?\d/);
  assert.ok(
    Math.abs(beforeReflow.titleMidY - beforeReflow.report.playMidY) < 40,
    `play titles should stay centered in the full board (mid=${beforeReflow.titleMidY}, playMid=${beforeReflow.report.playMidY})`
  );
  assert.ok(
    beforeReflow.viewBox.startsWith(`0 ${beforeReflow.report.viewBoxY} `) ||
      beforeReflow.viewBox.startsWith(`0 ${beforeReflow.report.viewBoxY}.`),
    `viewBox should start at off-board y (got ${beforeReflow.viewBox})`
  );

  // A session persisted mid-strip must be able to restore -- free terms'
  // real off-board y (negative) has to round-trip through capture,
  // validation, and apply without getting rejected as "outside the board".
  const roundTrip = await page.evaluate(() => {
    const state = window.CC.state;
    const captured = state.layoutAdapter.capture();
    const freeKeys = state.nodes
      .filter(node => !node.connected.length)
      .map(node => `term:${node.word}`);
    const applied = state.layoutAdapter.apply(captured);
    return { captured, freeKeys, appliedValid: applied.valid, appliedErrors: applied.errors };
  });
  assert.equal(
    roundTrip.appliedValid,
    true,
    `a layout captured mid-strip should re-apply cleanly: ${(roundTrip.appliedErrors || []).join("; ")}`
  );
  assert.ok(
    roundTrip.captured.board.viewBoxY < 0,
    "the captured document should record the off-board band it was captured under"
  );
  assert.ok(
    roundTrip.freeKeys.length > 0 &&
      roundTrip.freeKeys.every(key => roundTrip.captured.nodes[key].y < 0),
    "still-free terms should be captured at their real off-board y, not clamped onto the board"
  );

  const afterReflow = await page.evaluate(() => {
    const state = window.CC.state;
    const free = state.nodes.filter(node => !node.connected.length);
    free.slice(0, Math.max(0, free.length - 3)).forEach(node => {
      if (!node.connected.includes(node.gs[0])) node.connected.push(node.gs[0]);
    });
    state.onLinkAdded();
    return {
      report: state.getStarFreeStripReport(),
      viewBox: document.getElementById("board")?.getAttribute("viewBox") || ""
    };
  });
  assert.equal(afterReflow.report.freeCount, 3);
  assert.equal(afterReflow.report.freeStripActive, true, "three free terms still justify a strip row");
  assert.ok(
    afterReflow.report.stripHeight < beforeReflow.report.stripHeight,
    `strip should shrink after reflow (${afterReflow.report.stripHeight} !< ${beforeReflow.report.stripHeight})`
  );
  assert.ok(
    afterReflow.report.viewBoxY > beforeReflow.report.viewBoxY,
    "off-board viewBox top should rise (less negative) as rows leave"
  );
  assert.equal(afterReflow.report.playMidY, afterReflow.report.boardHeight / 2);

  const afterAbandon = await page.evaluate(() => {
    const state = window.CC.state;
    const free = state.nodes.filter(node => !node.connected.length);
    free.slice(0, 1).forEach(node => {
      if (!node.connected.includes(node.gs[0])) node.connected.push(node.gs[0]);
    });
    state.onLinkAdded();
    const report = state.getStarFreeStripReport();
    const leftover = state.nodes.filter(node => !node.connected.length);
    return {
      report,
      leftoverYs: leftover.map(node => node.y),
      viewBox: document.getElementById("board")?.getAttribute("viewBox") || ""
    };
  });
  assert.equal(afterAbandon.report.freeCount, 2);
  assert.equal(afterAbandon.report.freeStripActive, false);
  assert.equal(afterAbandon.report.stripHeight, 0);
  assert.equal(afterAbandon.report.viewBoxY, 0);
  assert.equal(afterAbandon.report.offboard, false, "abandoned strip is no longer off-board");
  assert.match(afterAbandon.viewBox, /^0 0 /);
  assert.ok(
    afterAbandon.leftoverYs.every(y => y > 40),
    "leftover free terms should be released into the play area"
  );

  // Capacity auto-on can be forced off by the document and stays off.
  await page.evaluate(() => {
    const puzzle = structuredClone(window.CC.state.puzzle);
    puzzle.board = { starFreeStrip: false };
    window.CC.openPuzzle(window.CC.registerPuzzle(puzzle));
  });
  if (await page.evaluate(() => window.CC?.state?.learningGated)) {
    await page.evaluate(() => {
      document.querySelector("#learning-introduction").shadowRoot.getElementById("skip").click();
    });
  }
  await page.waitForFunction(() =>
    window.CC?.state?.puzzle?.board?.starFreeStrip === false &&
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === false
  );
  const forcedOff = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(forcedOff.capacityNeeded, true);
  assert.equal(forcedOff.useFreeStrip, false);

  assert.deepEqual(
    pageErrors,
    [],
    `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`
  );
}
