import assert from "node:assert/strict";

export const name = "Circle pretty print: angular ordering clears crossings and label collisions";

const densePuzzleId = "revolutions-modern-world";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(`${baseURL}/index.html`);
  const puzzleIds = await page.evaluate(() => CC.PUZZLES.map(puzzle => puzzle.id));
  let reorderedDensePuzzle = false;

  for (const puzzleId of puzzleIds) {
    await page.goto(`${baseURL}/index.html?puzzle=${puzzleId}&mode=sets&solved`);
    const stats = await page.evaluate(() => CC.state.prettyPrintPromise);
    assert.ok(stats, `${puzzleId}: Circle pretty print did not return metrics`);
    assert.equal(stats.hardOverlaps, 0, `${puzzleId}: Circle layout retained a hard overlap`);
    assert.equal(stats.lineCrossings, 0, `${puzzleId}: Circle layout retained a crossed line`);
    assert.equal(
      stats.lineHeadingIntersections,
      0,
      `${puzzleId}: Circle line crossed a cluster label`
    );
    assert.equal(
      stats.lineCircleIntersections,
      0,
      `${puzzleId}: Circle line crossed an unrelated circle`
    );
    assert.equal(await page.evaluate(() => CC.state.solutionLayout), "pretty");
    assert.equal(await page.textContent("#show-solution"), "Layout polished");

    const bridgeHeadingOverlaps = await page.evaluate(() => {
      const headings = [...document.querySelectorAll(".set-heading")]
        .map(element => element.getBoundingClientRect());
      const bridges = [...document.querySelectorAll(".set-pills .node.bridge")]
        .map(element => element.getBoundingClientRect());
      let count = 0;
      bridges.forEach(bridge => headings.forEach(heading => {
        if (bridge.left + 1 < heading.right &&
            bridge.right - 1 > heading.left &&
            bridge.top + 1 < heading.bottom &&
            bridge.bottom - 1 > heading.top) {
          count++;
        }
      }));
      return count;
    });
    assert.equal(
      bridgeHeadingOverlaps,
      0,
      `${puzzleId}: a rendered bridge pill covered a cluster label`
    );

    if (puzzleId === densePuzzleId) {
      reorderedDensePuzzle = stats.order.some((clusterIndex, slot) => clusterIndex !== slot);
    }
  }
  assert.equal(
    reorderedDensePuzzle,
    true,
    "dense Circle puzzle never exercised a non-authoring angular order"
  );

  // A player-pinned circle is outside the automatic search space.
  await page.goto(`${baseURL}/index.html?puzzle=fundamental-forces&mode=sets&moves=`);
  const cluster = page.locator(".set-cluster").first();
  const box = await cluster.boundingBox();
  assert.ok(box, "manual Circle drag target was not visible");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 24, box.y + box.height / 2 + 18, { steps: 6 });
  await page.mouse.up();
  const pinnedBefore = await page.evaluate(() => {
    const node = CC.state.setLayout.csNodes[0];
    return { x: node.x, y: node.y, fx: node.fx, fy: node.fy };
  });
  assert.equal(Number.isFinite(pinnedBefore.fx), true, "circle drag did not pin x");
  assert.equal(Number.isFinite(pinnedBefore.fy), true, "circle drag did not pin y");
  await page.click("#show-solution");
  await page.evaluate(() => CC.state.prettyPrintPromise);
  const pinnedAfter = await page.evaluate(() => {
    const node = CC.state.setLayout.csNodes[0];
    return { x: node.x, y: node.y, fx: node.fx, fy: node.fy };
  });
  assert.ok(
    Math.hypot(pinnedAfter.x - pinnedBefore.fx, pinnedAfter.y - pinnedBefore.fy) < 0.2,
    "Circle pretty print moved a player-pinned circle"
  );
  assert.equal(pinnedAfter.fx, pinnedBefore.fx);
  assert.equal(pinnedAfter.fy, pinnedBefore.fy);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
