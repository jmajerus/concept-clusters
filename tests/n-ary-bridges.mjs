import assert from "node:assert/strict";

export const name = "n-ary bridges: ternary progress and rendering work in every mode";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });

  for (const mode of ["graph", "star", "sets"]) {
    await page.goto(`${baseURL}/index.html?puzzle=lacans-three-registers&mode=${mode}`);
    await page.waitForSelector("#puzzle-title:not(:empty)");

    const snapshots = await page.evaluate(() => {
      const bridge = CC.state.nodes.find(n => n.word === "Borromean knot");
      const targets = ["mirror stage", "signifier", "impossibility"];
      const out = [];

      for (const word of targets) {
        const target = CC.state.nodes.find(n => n.word === word);
        CC.handleTap(bridge);
        CC.handleTap(target);
        out.push({
          connected: [...bridge.connected],
          done: CC.isDone(bridge),
          message: document.getElementById("message").textContent
        });
      }

      return {
        isBridge: CC.isBridge(bridge),
        arity: bridge.gs.length,
        snapshots: out,
        factText: document.getElementById("facts").textContent
      };
    });

    assert.equal(snapshots.isBridge, true, `${mode}: ternary node recognized as a bridge`);
    assert.equal(snapshots.arity, 3, `${mode}: bridge retains all three memberships`);
    assert.deepEqual(
      snapshots.snapshots.map(s => s.connected),
      [[0], [0, 1], [0, 1, 2]],
      `${mode}: each connection records one new cluster`
    );
    assert.equal(snapshots.snapshots[0].done, false, `${mode}: not done after first side`);
    assert.equal(snapshots.snapshots[1].done, false, `${mode}: not done after second side`);
    assert.equal(snapshots.snapshots[2].done, true, `${mode}: done after third side`);
    assert.match(snapshots.snapshots[0].message, /1 of 3 clusters connected; 2 remain/);
    assert.match(snapshots.snapshots[1].message, /2 of 3 clusters connected; 1 remains/);
    assert.match(snapshots.factText, /Borromean knot/);

    await page.waitForTimeout(150);
    const bridgeLines = await page.locator("line.bridge-link").count();
    assert.equal(bridgeLines, 3, `${mode}: completed ternary bridge renders three spokes`);
  }

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
