import assert from "node:assert/strict";

export const name = "Graph pretty print: settled candidates clear crossings and pill collisions";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(`${baseURL}/index.html`);
  const puzzleIds = await page.evaluate(() => CC.PUZZLES.map(puzzle => puzzle.id));

  // The click handler must yield before its CPU-bound candidate search so
  // the pressed/busy state reaches the screen immediately.
  await page.goto(`${baseURL}/index.html?puzzle=fundamental-forces&mode=graph&moves=`);
  await page.evaluate(() => {
    const button = document.getElementById("show-solution");
    window.__solutionButtonStates = [];
    const capture = () => window.__solutionButtonStates.push({
      text: button.textContent,
      disabled: button.disabled,
      busy: button.getAttribute("aria-busy")
    });
    new MutationObserver(capture).observe(button, {
      attributes: true,
      childList: true,
      subtree: true
    });
  });
  await page.click("#show-solution");
  await page.evaluate(() => CC.state.prettyPrintPromise);
  const buttonStates = await page.evaluate(() => window.__solutionButtonStates);
  assert.ok(
    buttonStates.some(button =>
      button.text === "Polishing…" &&
      button.disabled &&
      button.busy === "true"
    ),
    "Graph search never exposed a disabled Polishing state"
  );
  assert.equal(await page.getAttribute("#show-solution", "aria-busy"), "false");

  for (const puzzleId of puzzleIds) {
    await page.goto(`${baseURL}/index.html?puzzle=${puzzleId}&mode=graph&solved`);
    const stats = await page.evaluate(() => CC.state.prettyPrintPromise);
    assert.ok(stats, `${puzzleId}: Graph pretty print did not return metrics`);
    assert.equal(stats.hardOverlaps, 0, `${puzzleId}: Graph layout retained a pill overlap`);
    assert.equal(stats.lineCrossings, 0, `${puzzleId}: Graph layout retained a crossed line`);
    assert.equal(
      stats.edgeNodeIntersections,
      0,
      `${puzzleId}: Graph layout retained a line through an unrelated pill`
    );
    assert.equal(await page.evaluate(() => CC.state.solutionLayout), "pretty");
    assert.equal(await page.textContent("#show-solution"), "Layout polished");
    assert.equal(await page.isDisabled("#show-solution"), true);
  }

  const polishedControl = await page.locator("#show-solution").evaluate(element => {
    const style = getComputedStyle(element);
    const before = CC.state.prettyPrintPromise;
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return {
      cursor: style.cursor,
      opacity: Number(style.opacity),
      ignoredSyntheticClick: CC.state.prettyPrintPromise === before
    };
  });
  assert.equal(polishedControl.cursor, "default");
  assert.ok(polishedControl.opacity < 1, "polished button did not look disabled");
  assert.equal(polishedControl.ignoredSyntheticClick, true);

  // A solved-board drag is a durable player preference and stays fixed
  // when the remaining graph is polished again.
  await page.goto(`${baseURL}/index.html?puzzle=fundamental-forces&mode=graph&solved`);
  await page.evaluate(() => CC.state.prettyPrintPromise);
  const term = page.locator(".node").first();
  const box = await term.boundingBox();
  assert.ok(box, "manual Graph drag target was not visible");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2 + 16, { steps: 6 });
  await page.mouse.up();
  const pinnedBefore = await page.evaluate(() => {
    const node = CC.state.nodes[0];
    return { x: node.x, y: node.y, fx: node.fx, fy: node.fy };
  });
  assert.equal(Number.isFinite(pinnedBefore.fx), true, "Graph drag did not pin x");
  assert.equal(Number.isFinite(pinnedBefore.fy), true, "Graph drag did not pin y");
  await page.click("#show-solution");
  await page.evaluate(() => CC.state.prettyPrintPromise);
  const pinnedAfter = await page.evaluate(() => {
    const node = CC.state.nodes[0];
    return { x: node.x, y: node.y, fx: node.fx, fy: node.fy };
  });
  assert.ok(
    Math.hypot(pinnedAfter.x - pinnedBefore.fx, pinnedAfter.y - pinnedBefore.fy) < 0.2,
    "Graph pretty print moved a player-pinned node"
  );
  assert.equal(pinnedAfter.fx, pinnedBefore.fx);
  assert.equal(pinnedAfter.fy, pinnedBefore.fy);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
