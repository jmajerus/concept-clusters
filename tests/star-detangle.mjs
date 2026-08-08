import assert from "node:assert/strict";

export const name = "star detangler: line crossings clear and setup moves stay verified";
export const tier = "extended";

const SAMPLE_PUZZLES = [
  "lacans-three-registers",
  "revolutions-modern-world",
  "philosophy-branches",
  "maintaining-homeostasis",
  "fundamental-forces",
  "authoritarian-regimes",
  "ancient-civilizations",
  // Dense ideal arms: long bridge + long ideal term can bury the connector
  // and drop the direction arrow unless visible edge clearance is enforced.
  "the-birth-of-the-drive",
  // 24-node comparative board: pill overlaps and residual short arms showed
  // up after crossing clearance alone.
  "models-of-the-divided-mind"
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
    if (puzzleId === "the-birth-of-the-drive") {
      const clearance = await page.evaluate(() => {
        const metrics = window.CC.state.getStarLayoutMetrics();
        const termNodes = [...document.querySelectorAll("#board g.node")].map(el => el.__data__);
        const titleNodes = [...document.querySelectorAll("#board g.title-node")].map(el => el.__data__);
        const titlesByCi = Object.fromEntries(titleNodes.map(title => [title.ci, title]));
        const displayedTarget = link =>
          link.ideal ? link.target : titlesByCi[link.target.gs[0]];
        const bridge = termNodes.find(node => node.word === "energy neutralization");
        const arms = window.CC.state.links
          .filter(link => link.bridge && link.source === bridge)
          .map(link => {
            const target = displayedTarget(link);
            const dx = target.x - bridge.x, dy = target.y - bridge.y;
            const length = Math.hypot(dx, dy) || 1;
            const ux = dx / length, uy = dy / length;
            const halfExtent = (node, u, v) => {
              const xHit = Math.abs(u) < 1e-9 ? Infinity : (node.w / 2) / Math.abs(u);
              const yHit = Math.abs(v) < 1e-9 ? Infinity : 15 / Math.abs(v);
              return Math.min(xHit, yHit);
            };
            return Math.max(0, length - halfExtent(bridge, ux, uy) - halfExtent(target, ux, uy));
          });
        return {
          shortVisibleBridgeLegs: metrics.shortVisibleBridgeLegs,
          minVisibleBridgeLeg: metrics.minVisibleBridgeLeg,
          energyArms: arms
        };
      });
      assert.equal(
        clearance.shortVisibleBridgeLegs,
        0,
        `${puzzleId}: detangler left a bridge arm with buried connector`
      );
      assert.ok(
        clearance.energyArms.every(visible => visible >= 36),
        `${puzzleId}: energy neutralization arm still too short (${clearance.energyArms.join(", ")})`
      );
    }
    if (puzzleId === "models-of-the-divided-mind") {
      const quality = await page.evaluate(() => {
        const metrics = window.CC.state.getStarLayoutMetrics();
        const termNodes = [...document.querySelectorAll("#board g.node")].map(el => el.__data__);
        const titleNodes = [...document.querySelectorAll("#board g.title-node")].map(el => el.__data__);
        const titlesByCi = Object.fromEntries(titleNodes.map(title => [title.ci, title]));
        const displayedTarget = link =>
          link.ideal ? link.target : titlesByCi[link.target.gs[0]];
        const visible = (a, b) => {
          const dx = b.x - a.x, dy = b.y - a.y;
          const length = Math.hypot(dx, dy) || 1;
          const ux = dx / length, uy = dy / length;
          const halfExtent = (node, u, v) => Math.min(
            Math.abs(u) < 1e-9 ? Infinity : (node.w / 2) / Math.abs(u),
            Math.abs(v) < 1e-9 ? Infinity : 15 / Math.abs(v)
          );
          return Math.max(0, length - halfExtent(a, ux, uy) - halfExtent(b, ux, uy));
        };
        const mask = termNodes.find(node => node.word === "the social mask");
        const maskArms = window.CC.state.links
          .filter(link => link.bridge && link.source === mask)
          .map(link => {
            const target = displayedTarget(link);
            return { target: target.word || target.name, visible: visible(mask, target) };
          });
        return {
          overlaps: metrics.overlaps,
          shortVisibleBridgeLegs: metrics.shortVisibleBridgeLegs,
          edgeNodeIntersections: metrics.edgeNodeIntersections,
          maskArms
        };
      });
      assert.equal(quality.overlaps, 0, `${puzzleId}: detangler left overlapping pills`);
      assert.equal(
        quality.shortVisibleBridgeLegs,
        0,
        `${puzzleId}: detangler left a short visible bridge arm`
      );
      assert.ok(
        quality.edgeNodeIntersections <= 1,
        `${puzzleId}: detangler left excessive through-pill contacts (${quality.edgeNodeIntersections})`
      );
      assert.ok(
        quality.maskArms.every(arm => arm.visible >= 36),
        `${puzzleId}: the social mask arm still too short (${JSON.stringify(quality.maskArms)})`
      );
    }
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
             move.afterNodeIntersections < move.beforeNodeIntersections) ||
            (move.afterLineCrossings === move.beforeLineCrossings &&
             move.afterNodeIntersections === move.beforeNodeIntersections &&
             move.afterOverlaps < move.beforeOverlaps) ||
            (move.afterLineCrossings === move.beforeLineCrossings &&
             move.afterNodeIntersections === move.beforeNodeIntersections &&
             move.afterOverlaps === move.beforeOverlaps &&
             move.afterShortVisibleBridgeLegs < move.beforeShortVisibleBridgeLegs),
          `${puzzleId}: move ${index + 1} (${move.node}) did not improve crossings, through-pill contacts, overlaps, or short bridge arms`
        );
      }
    });
    assert.ok(stats.moves.length <= 42, `${puzzleId}: detangler exceeded its move budget`);
    assert.ok(
      stats.moves.filter(move => move.preparatory).length <= 8,
      `${puzzleId}: detangler used more than eight preparatory drags`
    );
    if (stats.moves.length) {
      assert.ok(stats.relaxationTicks > 0, `${puzzleId}: final force relaxation did not run`);
    }
    if (stats.before === 0 && stats.shortVisibleBridgeLegsBefore === 0) {
      assert.equal(stats.moves.length, 0, `${puzzleId}: moved an already untangled board`);
      assert.equal(stats.fanMoves, 0, `${puzzleId}: polished an already untangled board`);
    }
    // Dense ideal-arm clearance is asserted explicitly for Birth of the Drive
    // below; other sample puzzles only require that crossings stay clear.
  }

  assert.deepEqual(pageErrors, [], `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`);
}
