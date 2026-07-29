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
      assert.ok(
        stats.edgeNodeIntersections <= 2,
        `${puzzleId}: detangler left excessive line-through-pill crowding`
      );
      const fan = await page.evaluate(() => {
        const data = [...document.querySelectorAll(".title-node,.node")].map(el => el.__data__);
        const hub = data.find(node => node.word === "Electromagnetism");
        const members = ["electric charge", "Coulomb's law"]
          .map(word => data.find(node => node.word === word));
        const viewBox = document.querySelector("#board").viewBox.baseVal;
        const outwardAngle = Math.atan2(
          hub.y - (viewBox.y + viewBox.height / 2),
          hub.x - (viewBox.x + viewBox.width / 2)
        );
        const polar = node => ({
          radius: Math.hypot(node.x - hub.x, node.y - hub.y),
          angle: Math.atan2(node.y - hub.y, node.x - hub.x)
        });
        const [a, b] = members.map(polar);
        const angleBetween = (x, y) =>
          Math.abs(Math.atan2(Math.sin(x - y), Math.cos(x - y))) * 180 / Math.PI;
        return {
          radiusDifference: Math.abs(a.radius - b.radius),
          separation: angleBetween(a.angle, b.angle),
          outwardDeviations: [angleBetween(a.angle, outwardAngle), angleBetween(b.angle, outwardAngle)]
        };
      });
      assert.ok(fan.radiusDifference <= 25, `${puzzleId}: ordinary fan radii diverged`);
      assert.ok(fan.separation <= 100, `${puzzleId}: ordinary terms were not grouped together`);
      fan.outwardDeviations.forEach(deviation => {
        assert.ok(deviation <= 60, `${puzzleId}: ordinary term was not in the outward fan`);
      });
    }
    stats.moves.forEach((move, index) => {
      if (move.preparatory) {
        assert.ok(
          move.after <= move.before + 2,
          `${puzzleId}: preparatory move exceeded its bounded setup allowance`
        );
        const payoff = stats.moves[index + 1];
        assert.ok(payoff, `${puzzleId}: preparatory move had no payoff move`);
        assert.ok(
          payoff.afterLineCrossings < move.beforeLineCrossings ||
            (payoff.afterLineCrossings === move.beforeLineCrossings &&
             payoff.afterNodeIntersections < move.beforeNodeIntersections),
          `${puzzleId}: preparatory pair did not improve the original layout`
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
    assert.ok(stats.moves.length <= 8, `${puzzleId}: detangler exceeded its move budget`);
    assert.ok(
      stats.moves.filter(move => move.preparatory).length <= 1,
      `${puzzleId}: detangler used more than one preparatory drag`
    );
    if (stats.moves.length) {
      assert.ok(stats.relaxationTicks > 0, `${puzzleId}: final force relaxation did not run`);
    }
    if (stats.before === 0) {
      assert.equal(stats.moves.length, 0, `${puzzleId}: moved an already untangled board`);
      assert.equal(stats.fanMoves, 0, `${puzzleId}: polished an already untangled board`);
    }
  }

  assert.deepEqual(pageErrors, [], `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`);
}
