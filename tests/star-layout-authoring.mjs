import assert from "node:assert/strict";

export const name = "star layout authoring: local drafts and curated overrides apply";
export const tier = "extended";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  // &admin surfaces a one-click jump into layout authoring for the
  // current puzzle (the editorial path for boards the detangler cannot
  // fully clear).
  await page.goto(
    `${baseURL}/index.html?puzzle=models-of-the-divided-mind&admin&mode=star`
  );
  assert.equal(await page.getAttribute("#admin-layout-actions", "hidden"), null);
  await page.click("#star-layout-author-btn");
  await page.waitForURL(/author=layout/);
  await page.waitForFunction(() => !document.getElementById("layout-authoring")?.hidden);
  assert.match(page.url(), /puzzle=models-of-the-divided-mind/);
  assert.match(page.url(), /author=layout/);
  assert.equal(await page.getAttribute("#layout-authoring", "hidden"), null);

  await page.goto(
    `${baseURL}/index.html?puzzle=fundamental-forces&author=layout`
  );

  await page.waitForFunction(() => !document.getElementById("layout-authoring")?.hidden);
  assert.equal(await page.getAttribute("#layout-authoring", "hidden"), null);
  assert.equal(await page.isDisabled("#mode-graph"), true);
  assert.equal(await page.isDisabled("#mode-sets"), true);
  assert.equal(await page.evaluate(() => window.CC.mode), "star");
  assert.notEqual(
    await page.getAttribute("#layout-authoring-export", "hidden"),
    null,
    "static player must not expose a layout publication button"
  );

  await page.click("#layout-authoring-prepare");
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty");
  assert.equal(await page.textContent("#layout-metric-crossings"), "0");
  assert.equal(await page.textContent("#layout-metric-overlaps"), "0");

  // Author judgment wins: a padded AABB near-miss is advisory rather than a
  // hard block on a valid layout save.
  await page.evaluate(() => {
    const terms = [...document.querySelectorAll(".node")]
      .map(element => element.__data__)
      .filter(node => node && !node.isTitleNode);
    if (terms.length < 2) throw new Error("need two terms to force an overlap");
    terms[1].x = terms[0].x;
    terms[1].y = terms[0].y;
    window.CC.state.paint();
    window.CC.state.onAuthorLayoutChanged?.("placement");
  });
  await page.waitForFunction(() =>
    window.CC.state.getStarLayoutMetrics().overlaps >= 1 &&
    document.getElementById("layout-metric-overlaps").textContent.includes("/")
  );
  assert.match(
    await page.textContent("#layout-metric-overlaps"),
    /\d+ \(.+ \/ .+\)/
  );

  // Prepare is a no-op once already pretty — Start Over rebuilds a clean board.
  await page.click("#reset");
  await page.click("#layout-authoring-prepare");
  await page.waitForFunction(() =>
    window.CC.state.solutionLayout === "pretty" &&
    window.CC.state.getStarLayoutMetrics().overlaps === 0
  );

  const term = page.locator(".node").filter({ hasText: "electric charge" }).first();
  const box = await term.boundingBox();
  assert.ok(box, "authoring drag target was not visible");
  const beforeDrag = await term.evaluate(element => ({
    x: element.__data__.x,
    y: element.__data__.y,
    width: document.querySelector("#board").viewBox.baseVal.width,
    height: document.querySelector("#board").viewBox.baseVal.height
  }));
  const boardBox = await page.locator("#board").boundingBox();
  assert.ok(boardBox, "authoring board was not visible");
  const boardScaleX = boardBox.width / beforeDrag.width;
  const boardScaleY = boardBox.height / beforeDrag.height;
  const deltaX = (beforeDrag.x < beforeDrag.width / 2 ? 30 : -30) * boardScaleX;
  const deltaY = (beforeDrag.y < beforeDrag.height / 2 ? 15 : -15) * boardScaleY;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(30);
  await page.mouse.move(
    box.x + box.width / 2 + deltaX,
    box.y + box.height / 2 + deltaY,
    { steps: 8 }
  );
  await page.mouse.up();
  await page.waitForFunction(({ x, y }) => {
    const element = [...document.querySelectorAll(".node")]
      .find(candidate => candidate.__data__.word === "electric charge");
    return element && Math.hypot(element.__data__.x - x, element.__data__.y - y) > 5;
  }, { x: beforeDrag.x, y: beforeDrag.y });
  await page.waitForFunction(() =>
    document.getElementById("layout-authoring-draft-state").textContent.includes("saved")
  );

  const afterDrag = await term.evaluate(element => ({
    x: element.__data__.x,
    y: element.__data__.y
  }));
  assert.ok(
    Math.hypot(afterDrag.x - beforeDrag.x, afterDrag.y - beforeDrag.y) > 5,
    "literal author drag did not move the node"
  );
  await page.waitForTimeout(150);
  const afterWait = await term.evaluate(element => ({
    x: element.__data__.x,
    y: element.__data__.y
  }));
  assert.ok(
    Math.hypot(afterWait.x - afterDrag.x, afterWait.y - afterDrag.y) < 1,
    "force simulation moved a node after an authoring drag"
  );

  const storedDraft = await page.evaluate(() => {
    const key = Object.keys(localStorage)
      .find(candidate => candidate.startsWith("ccStarLayoutDraft:v1:fundamental-forces:"));
    return key ? localStorage.getItem(key) : null;
  });
  assert.ok(storedDraft, "author drag did not persist a local draft");

  // A captured document is representative of a committed override. Attach it
  // to the runtime puzzle object as Freeze does, reset the puzzle, and verify
  // that the ordinary second pass selects it. Static pages can inspect and
  // edit a local draft, but cannot publish it.
  const curatedLayout = await page.evaluate(() => {
    const layout = window.CC.state.captureStarLayout();
    window.CC.state.puzzle.starLayout = layout;
    return layout;
  });
  assert.equal(curatedLayout.puzzleId, "fundamental-forces");
  assert.equal(curatedLayout.metrics.lineCrossings, 0);
  assert.equal(curatedLayout.metrics.overlaps, 0);
  await page.click("#reset");
  await page.click("#layout-authoring-prepare");
  await page.waitForFunction(() =>
    window.CC.state.solutionLayout === "pretty" &&
    window.CC.state.prettyPrintStats?.source === "curated"
  );
  assert.equal(
    await page.evaluate(() => window.CC.state.prettyPrintStats.source),
    "curated"
  );

  // Preparing again must not overwrite a previously hand-edited draft.
  assert.equal(
    await page.evaluate(() => {
      const key = Object.keys(localStorage)
        .find(candidate => candidate.startsWith("ccStarLayoutDraft:v1:fundamental-forces:"));
      return key ? localStorage.getItem(key) : null;
    }),
    storedDraft
  );
  assert.equal(await page.isDisabled("#layout-authoring-load"), false);
  await page.click("#layout-authoring-load");
  await page.waitForFunction(() =>
    document.getElementById("layout-authoring-status").textContent === "Local draft loaded."
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
