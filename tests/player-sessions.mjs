import assert from "node:assert/strict";

export const name = "player sessions: mode, progress, and Star layout resume locally";

const PUZZLE_ID = "fundamental-forces";

async function makeOneCorrectMove(page) {
  return page.evaluate(() => {
    for (const source of CC.state.nodes) {
      if (CC.isDone(source)) continue;
      for (const ci of source.gs) {
        if (source.connected.includes(ci)) continue;
        const target = CC.state.nodes.find(node =>
          node !== source &&
          !CC.isBridge(node) &&
          node.gs[0] === ci &&
          node.connected.includes(ci)
        );
        if (target) {
          CC.handleTap(source);
          CC.handleTap(target);
          return true;
        }
      }
    }
    return false;
  });
}

async function sessionFor(page) {
  return page.evaluate(id => {
    const key = Object.keys(localStorage)
      .find(candidate => candidate.startsWith(`ccPlayerSession:v1:${id}`));
    return key ? JSON.parse(localStorage.getItem(key)) : null;
  }, PUZZLE_ID);
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(`${baseURL}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph`);

  assert.equal(await page.evaluate(() => CC.state.layoutAdapter.mode), "graph");
  assert.equal(await page.evaluate(() => CC.state.layoutAdapter.capture), null);

  // A real mode-button choice becomes this puzzle's resumable mode even
  // though the URL initially supplied a view-only override.
  await page.click("#mode-star");
  assert.equal(await page.evaluate(() => CC.mode), "star");
  assert.equal(await page.evaluate(() => CC.state.layoutAdapter.mode), "star");
  assert.equal(typeof await page.evaluate(() => CC.state.layoutAdapter.capture), "undefined");
  assert.ok(await makeOneCorrectMove(page), "could not make a correct move");

  const draggedWord = await page.locator(".node").first().evaluate(element => element.__data__.word);
  const term = page.locator(".node").filter({ hasText: draggedWord }).first();
  const box = await term.boundingBox();
  const boardBox = await page.locator("#board").boundingBox();
  const board = await page.evaluate(() => {
    const viewBox = document.querySelector("#board").viewBox.baseVal;
    return { width: viewBox.width, height: viewBox.height };
  });
  assert.ok(box && boardBox, "Star drag target was not visible");
  const dx = 28 * boardBox.width / board.width;
  const dy = 14 * boardBox.height / board.height;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 6 });
  await page.mouse.up();

  await page.waitForFunction(id => {
    const key = Object.keys(localStorage)
      .find(candidate => candidate.startsWith(`ccPlayerSession:v1:${id}`));
    if (!key) return false;
    const session = JSON.parse(localStorage.getItem(key));
    return !!session.layouts.star;
  }, PUZZLE_ID);

  const saved = await sessionFor(page);
  assert.equal(saved.currentMode, "star");
  assert.equal(saved.completed, false);
  assert.equal(saved.moves.length, 1);
  assert.equal(typeof saved.moves[0].source, "string");
  assert.equal(typeof saved.moves[0].target, "string");
  assert.ok(saved.layouts.star.nodes[`term:${draggedWord}`], "Star session omitted the dragged term");

  // A plain return resumes the per-puzzle mode, semantic progress, and
  // exact Star snapshot.
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}`);
  // pagehide captures the final visible position just before navigation,
  // which may be a few force ticks newer than the earlier storage read.
  const resumedSession = await sessionFor(page);
  const savedPoint = resumedSession.layouts.star.nodes[`term:${draggedWord}`];
  assert.equal(await page.evaluate(() => CC.mode), "star");
  assert.equal(await page.evaluate(() => CC.state.made), 1);
  const restoredPoint = await page.locator(".node")
    .filter({ hasText: draggedWord })
    .first()
    .evaluate(element => ({ x: element.__data__.x, y: element.__data__.y }));
  assert.ok(
    Math.hypot(restoredPoint.x - savedPoint.x, restoredPoint.y - savedPoint.y) < 0.2,
    "Star layout did not restore its saved coordinates"
  );

  // Connections survive a switch to a mode whose phase-one adapter has no
  // position persistence yet, and that mode itself becomes resumable.
  await page.click("#mode-sets");
  assert.equal(await page.evaluate(() => CC.state.layoutAdapter.mode), "sets");
  assert.equal(await page.evaluate(() => CC.state.made), 1);
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}`);
  assert.equal(await page.evaluate(() => CC.mode), "sets");
  assert.equal(await page.evaluate(() => CC.state.made), 1);

  // URL mode and shared-state intent win over the local session without
  // corrupting it during reconstruction.
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph`);
  assert.equal(await page.evaluate(() => CC.mode), "graph");
  assert.equal(await page.evaluate(() => CC.state.made), 1);
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&moves=`);
  assert.equal(await page.evaluate(() => CC.state.made), 0);

  // Start Over clears progress and every saved per-mode layout.
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}`);
  await page.click("#reset");
  const reset = await sessionFor(page);
  assert.deepEqual(reset.moves, []);
  assert.deepEqual(reset.layouts, {});

  // Completed Star sessions retain the detangled stage and exact layout.
  await page.click("#mode-star");
  await page.click("#show-solution");
  await page.evaluate(() => CC.state.detanglePromise);
  await page.waitForFunction(id => {
    const key = Object.keys(localStorage)
      .find(candidate => candidate.startsWith(`ccPlayerSession:v1:${id}`));
    if (!key) return false;
    const session = JSON.parse(localStorage.getItem(key));
    return session.completed &&
      session.layouts.star?.solutionLayout === "animated";
  }, PUZZLE_ID);
  const completed = await sessionFor(page);
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}`);
  assert.equal(await page.evaluate(() => CC.mode), "star");
  assert.equal(
    await page.evaluate(() => CC.state.made === CC.state.need),
    true,
    "completed session did not restore completion"
  );
  assert.equal(await page.evaluate(() => CC.state.solutionLayout), "animated");
  const completedWord = draggedWord;
  const completedPoint = completed.layouts.star.nodes[`term:${completedWord}`];
  const restoredCompletedPoint = await page.locator(".node")
    .filter({ hasText: completedWord })
    .first()
    .evaluate(element => ({ x: element.__data__.x, y: element.__data__.y }));
  assert.ok(
    Math.hypot(
      restoredCompletedPoint.x - completedPoint.x,
      restoredCompletedPoint.y - completedPoint.y
    ) < 0.2,
    "completed Star layout did not restore exactly"
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
