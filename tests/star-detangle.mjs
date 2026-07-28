import assert from "node:assert/strict";

export const name = "star detangler: line crossings clear and setup moves stay verified";

const SAMPLE_PUZZLES = [
  "lacans-three-registers",
  "revolutions-modern-world",
  "philosophy-branches",
  "maintaining-homeostasis",
  "fundamental-forces",
  "authoritarian-regimes",
  "ancient-civilizations"
];

export async function run(page, baseURL) {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error));
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const puzzleId of SAMPLE_PUZZLES) {
    await page.goto(`${baseURL}/index.html?puzzle=${puzzleId}&mode=star`);
    const stats = await page.evaluate(async () => {
      window.CC.showSolution();
      return window.CC.state.detanglePromise;
    });

    assert.ok(stats, `${puzzleId}: detangler did not report its result`);
    assert.equal(stats.lineCrossings, 0, `${puzzleId}: detangler left a line-to-line crossing`);
    if (puzzleId === "fundamental-forces") {
      assert.equal(
        stats.edgeNodeIntersections,
        0,
        `${puzzleId}: detangler left a line passing through an unrelated node`
      );
    }
    stats.moves.forEach((move, index) => {
      if (move.preparatory) {
        assert.ok(
          move.after <= move.before + 2,
          `${puzzleId}: preparatory move exceeded its bounded setup allowance`
        );
      } else {
        assert.ok(
          move.afterLineCrossings < move.beforeLineCrossings ||
            (move.afterLineCrossings === move.beforeLineCrossings &&
             move.afterNodeIntersections < move.beforeNodeIntersections),
          `${puzzleId}: move ${index + 1} (${move.node}) did not remove a crossing`
        );
      }
    });
    if (stats.before === 0) {
      assert.equal(stats.moves.length, 0, `${puzzleId}: moved an already untangled board`);
    }
  }

  assert.deepEqual(pageErrors, [], `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`);
}
