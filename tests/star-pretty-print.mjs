import assert from "node:assert/strict";

export const name = "star pretty print: second Show Solution click polishes the solved layout";

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

  assert.deepEqual(pageErrors, [], `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`);
}
