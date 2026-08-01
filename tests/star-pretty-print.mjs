import assert from "node:assert/strict";

export const name = "star pretty print: second Show Solution click polishes the solved layout";
export const tier = "extended";

const SAMPLE_PUZZLES = [
  "lacans-three-registers",
  "revolutions-modern-world",
  "fundamental-forces"
];

export async function run(page, baseURL) {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error));
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const puzzleId of SAMPLE_PUZZLES) {
    await page.goto(`${baseURL}/index.html?puzzle=${puzzleId}&mode=star`);
    assert.equal(await page.textContent("#show-solution"), "Show solution");

    await page.click("#show-solution");
    await page.evaluate(() => window.CC.state.detanglePromise);
    assert.equal(await page.textContent("#show-solution"), "Polish layout");
    assert.equal(await page.isDisabled("#show-solution"), false);

    const before = await page.evaluate(() =>
      [...document.querySelectorAll(".title-node,.node")].map(el => ({
        word: el.__data__.word,
        x: el.__data__.x,
        y: el.__data__.y
      }))
    );
    await page.click("#show-solution");
    const stats = await page.evaluate(() => window.CC.state.prettyPrintPromise);

    assert.equal(stats.lineCrossings, 0, `${puzzleId}: pretty print introduced a crossing`);
    assert.equal(await page.textContent("#show-solution"), "Layout polished");
    assert.equal(await page.isDisabled("#show-solution"), true);
    assert.equal(
      await page.evaluate(() => window.CC.state.solutionLayout),
      "pretty",
      `${puzzleId}: pretty-print stage was not recorded`
    );

    if (puzzleId === "fundamental-forces") {
      const moved = await page.evaluate(previous => {
        const oldByWord = new Map(previous.map(node => [node.word, node]));
        return [...document.querySelectorAll(".title-node,.node")]
          .map(el => el.__data__)
          .filter(node => {
            const old = oldByWord.get(node.word);
            return Math.hypot(node.x - old.x, node.y - old.y) > 5;
          }).length;
      }, before);
      assert.ok(moved > 0, `${puzzleId}: pretty print did not change the layout`);
      assert.equal(stats.overlaps, 0, `${puzzleId}: pretty print left overlapping pills`);
    }
  }

  // Show Solution is a puzzle-level decision. Switching from a polished
  // solved Graph board to Star should automatically polish the newly
  // built renderer instead of showing crossed lines and reactivating the
  // same control.
  await page.goto(
    `${baseURL}/index.html?puzzle=fundamental-forces&mode=graph&moves=`
  );
  await page.evaluate(() => localStorage.clear());
  await page.click("#show-solution");
  await page.evaluate(() => CC.state.prettyPrintPromise);
  assert.equal(await page.textContent("#show-solution"), "Layout polished");
  assert.equal(await page.isDisabled("#show-solution"), true);

  await page.evaluate(() => {
    const button = document.getElementById("show-solution");
    const modes = ["mode-graph", "mode-star", "mode-sets"]
      .map(id => document.getElementById(id));
    window.__modeSwitchSolutionStates = [];
    const capture = () => window.__modeSwitchSolutionStates.push({
      text: button.textContent,
      disabled: button.disabled,
      modesDisabled: modes.every(mode => mode.disabled)
    });
    [button, ...modes].forEach(element => {
      new MutationObserver(capture).observe(element, {
        attributes: true,
        childList: true,
        subtree: true
      });
    });
    capture();
  });
  await page.click("#mode-star");
  assert.equal(await page.evaluate(() => CC.mode), "star");
  const switchedStats = await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  const switchStates = await page.evaluate(() => window.__modeSwitchSolutionStates);
  assert.ok(
    switchStates.some(state =>
      (state.text === "Untangling…" || state.text === "Polishing…") &&
      state.disabled &&
      state.modesDisabled
    ),
    "Graph-to-Star switch never exposed a locked layout state"
  );
  assert.equal(
    switchStates
      .filter(state => state.text !== "Layout polished")
      .every(state => state.disabled),
    true,
    "Show Solution became actionable during the Graph-to-Star handoff"
  );
  assert.equal(switchedStats.lineCrossings, 0, "Graph-to-Star switch retained crossed lines");
  assert.equal(switchedStats.edgeNodeIntersections, 0, "Graph-to-Star switch retained a line through a pill");
  assert.equal(await page.textContent("#show-solution"), "Layout polished");
  assert.equal(await page.isDisabled("#show-solution"), true);
  assert.equal(await page.evaluate(() => CC.state.solutionLayout), "pretty");
  assert.equal(
    await page.textContent("#message"),
    "Solution shown — Star layout polished."
  );

  await page.click("#mode-sets");
  const circleStats = await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  assert.equal(circleStats.lineCrossings, 0, "Star-to-Circle switch retained crossed lines");
  assert.equal(
    await page.textContent("#message"),
    "Solution shown — Circle layout polished."
  );

  // Graph and Star have already been polished in this session. Returning
  // to either restores its saved layout immediately, but must still
  // replace the previous mode's announcement.
  await page.click("#mode-graph");
  assert.equal(await page.evaluate(() => CC.mode), "graph");
  assert.equal(await page.evaluate(() => CC.state.solutionLayout), "pretty");
  assert.equal(
    await page.textContent("#message"),
    "Solution shown — Graph layout polished."
  );
  await page.click("#mode-star");
  assert.equal(await page.evaluate(() => CC.mode), "star");
  assert.equal(await page.evaluate(() => CC.state.solutionLayout), "pretty");
  assert.equal(
    await page.textContent("#message"),
    "Solution shown — Star layout polished."
  );

  assert.deepEqual(pageErrors, [], `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`);
}
