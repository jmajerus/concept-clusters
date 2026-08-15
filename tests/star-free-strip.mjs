// Star cold start uses Circle-style free-term strip packing when the
// sparse registry locks it, an admin localStorage try opts in/out, or
// free terms would need a deep multi-row strip at the board width.
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PUZZLES } from "../puzzles/index.js";
import {
  starFreeStripCapacityNeeded,
  starFreeStripEnabled
} from "../modules/starLayoutRepository.js";
import { importStarFreeStrip } from "../tools/import-star-free-strip.mjs";

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
    !document.getElementById("admin-layout-actions").hidden
  );
  await page.evaluate(() => {
    localStorage.removeItem("ccStarFreeStripOverrides");
    localStorage.removeItem("ccStarSeedBesideTitleOverrides");
  });
  await page.reload();
  await page.waitForFunction(() =>
    document.getElementById("admin-layout-actions") &&
    !document.getElementById("admin-layout-actions").hidden &&
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === false
  );
  assert.equal(await page.isHidden("#star-free-strip-export-btn"), true);

  await page.click("#star-free-strip-btn");
  await page.waitForURL(/admin/);
  await page.waitForFunction(() =>
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === true
  );
  const stripped = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(stripped.useFreeStrip, true);
  assert.equal(stripped.useSeedBesideTitle, true, "strip implies seed-beside-title");
  assert.equal(stripped.freeStripActive, true);
  assert.ok(stripped.stripHeight > 20);
  assert.equal(await page.isHidden("#star-free-strip-export-btn"), false);
  assert.equal(await page.isDisabled("#star-seed-beside-title-btn"), true);
  assert.equal(
    await page.textContent("#star-free-strip-export-btn"),
    "Export strip flag"
  );

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#star-free-strip-export-btn")
  ]);
  const downloadPath = await download.path();
  const exported = JSON.parse(await readFile(downloadPath, "utf8"));
  assert.equal(exported.kind, "star-free-strip");
  assert.equal(exported.puzzleId, "energy-flow");
  assert.equal(exported.freeStrip, true);

  // Simulate a registry-locked puzzle, then clear locally: export must
  // carry freeStrip: false so import can remove the sparse entry. Stay on
  // this page so the in-memory STAR_FREE_STRIP mutation survives.
  await page.evaluate(async () => {
    const repository = await import("./modules/starLayoutRepository.js");
    repository.STAR_FREE_STRIP["energy-flow"] = true;
    localStorage.setItem(
      "ccStarFreeStripOverrides",
      JSON.stringify({ "energy-flow": false })
    );
    window.__ccSyncStarFreeStripButtons();
  });
  assert.equal(await page.isHidden("#star-free-strip-export-btn"), false);
  assert.equal(
    await page.textContent("#star-free-strip-export-btn"),
    "Export clear-strip flag"
  );
  const [clearDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#star-free-strip-export-btn")
  ]);
  const clearPath = await clearDownload.path();
  const clearDoc = JSON.parse(await readFile(clearPath, "utf8"));
  assert.equal(clearDoc.freeStrip, false);

  const tmp = await mkdtemp(join(tmpdir(), "cc-star-free-strip-"));
  try {
    const flagPath = join(tmp, "flag.json");
    await writeFile(flagPath, JSON.stringify(exported));
    const checked = await importStarFreeStrip(flagPath, { checkOnly: true });
    assert.equal(checked.doc.freeStrip, true);
    const clearFlagPath = join(tmp, "clear.json");
    await writeFile(clearFlagPath, JSON.stringify(clearDoc));
    const cleared = await importStarFreeStrip(clearFlagPath, { checkOnly: true });
    assert.equal(cleared.doc.freeStrip, false);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  // Local seed-beside-title try without strip (compact puzzle, classic).
  await page.evaluate(() => {
    localStorage.removeItem("ccStarFreeStripOverrides");
    localStorage.removeItem("ccStarSeedBesideTitleOverrides");
  });
  await page.goto(
    `${baseURL}/index.html?puzzle=energy-flow&admin&mode=star`
  );
  await page.waitForFunction(() =>
    document.getElementById("star-seed-beside-title-btn") &&
    !document.getElementById("star-seed-beside-title-btn").disabled &&
    window.CC?.state?.getStarFreeStripReport?.().useSeedBesideTitle === false
  );
  await page.click("#star-seed-beside-title-btn");
  await page.waitForFunction(() =>
    window.CC?.state?.getStarFreeStripReport?.().useSeedBesideTitle === true &&
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === false
  );

  // Dense strip: free terms sit off-board above y=0 so the play rectangle
  // keeps full board height. Connecting terms reflows the off-board band
  // (viewBox shrinks); at 2 or fewer free terms the strip is abandoned.
  // Capacity already auto-enables strip for this puzzle.
  await page.evaluate(() => {
    localStorage.removeItem("ccStarFreeStripOverrides");
    localStorage.removeItem("ccStarSeedBesideTitleOverrides");
  });
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
  assert.match(afterAbandon.viewBox, /^0 0 /);
  assert.ok(
    afterAbandon.leftoverYs.every(y => y > 40),
    "leftover free terms should be released into the play area"
  );

  // Capacity auto-on can be forced off and stays off.
  await page.goto(
    `${baseURL}/index.html?puzzle=models-of-the-divided-mind&admin&mode=star`
  );
  if (await page.evaluate(() => window.CC?.state?.learningGated)) {
    await page.click("#learning-introduction #skip");
  }
  await page.waitForFunction(() =>
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === true
  );
  await page.click("#star-free-strip-btn");
  await page.waitForFunction(() =>
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === false
  );
  const forcedOff = await page.evaluate(() => ({
    report: window.CC.state.getStarFreeStripReport(),
    override: localStorage.getItem("ccStarFreeStripOverrides")
  }));
  assert.equal(forcedOff.report.capacityNeeded, true);
  assert.match(forcedOff.override, /false/);

  // Same Playwright browser context is reused across test modules — do not
  // leave strip/seed overrides for later puzzles to inherit.
  await page.evaluate(() => {
    localStorage.removeItem("ccStarFreeStripOverrides");
    localStorage.removeItem("ccStarSeedBesideTitleOverrides");
  });

  assert.deepEqual(
    pageErrors,
    [],
    `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`
  );
}
