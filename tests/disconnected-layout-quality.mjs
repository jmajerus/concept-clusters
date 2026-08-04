import assert from "node:assert/strict";

export const name = "disconnected layout quality: Film Classics stays legible in every mode";
export const tier = "extended";
export const viewport = { width: 800, height: 1000 };

const PUZZLE_ID = "film-classics";

function visibleBodyOverlaps(page, includeTitles) {
  return page.evaluate(includeClusterTitles => {
    const selector = includeClusterTitles
      ? "#board .node, #board .title-node"
      : "#board .node";
    const bodies = [...document.querySelectorAll(selector)].map(group => {
      const body = group.matches(".title-node")
        ? group.querySelector("rect")
        : group.querySelector(".pill-shape");
      const rect = body.getBoundingClientRect();
      return {
        word: group.__data__?.word,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      };
    });
    const overlaps = [];
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        if (a.left + 1 < b.right && a.right - 1 > b.left &&
            a.top + 1 < b.bottom && a.bottom - 1 > b.top) {
          overlaps.push(`${a.word} / ${b.word}`);
        }
      }
    }
    return overlaps;
  }, includeTitles);
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const mode of ["graph", "star", "sets"]) {
    await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=${mode}&moves=`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(
      () => CC.state.phase === "lens-quiz-answering",
      null,
      { timeout: 20000 }
    );

    const board = await page.evaluate(() => {
      const viewBox = document.getElementById("board").viewBox.baseVal;
      return [viewBox.width, viewBox.height];
    });
    assert.notDeepEqual(board, [640, 460], `${mode}: large puzzle used cramped standard board`);

    if (mode === "graph") {
      const metrics = await page.evaluate(() => CC.state.graphLayoutStats);
      assert.equal(metrics.hardOverlaps, 0, "Graph left overlapping terms");
      assert.equal(metrics.lineCrossings, 0, "Graph left crossed connections");
      assert.deepEqual(await visibleBodyOverlaps(page, false), []);
    } else if (mode === "star") {
      const metrics = await page.evaluate(() => CC.state.getStarLayoutMetrics());
      assert.equal(metrics.overlaps, 0, "Star left overlapping terms or titles");
      assert.equal(metrics.lineCrossings, 0, "Star left crossed connections");
      assert.equal(metrics.edgeNodeIntersections, 0, "Star drew a connection through a node");
      assert.equal(
        metrics.bridgeUnrelatedTitleIntrusions,
        0,
        "Star placed a bridge closer to an unrelated cluster title"
      );
      assert.deepEqual(await visibleBodyOverlaps(page, true), []);
    } else {
      const metrics = await page.evaluate(() => CC.state.circleLayoutStats);
      assert.equal(metrics.hardOverlaps, 0, "Circle left overlapping layout elements");
      assert.equal(metrics.lineCrossings, 0, "Circle left crossed bridge lines");
      assert.equal(metrics.lineCircleIntersections, 0, "Circle drew a bridge through an unrelated circle");
    }
  }

  assert.deepEqual(errors, [], `browser errors:\n${errors.join("\n")}`);
}
