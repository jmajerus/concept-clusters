import assert from "node:assert/strict";

export const name = "canonical bridge endpoints: cluster taps always resolve to the authored graph";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const mode of ["graph", "star", "sets"]) {
    await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=${mode}&moves=`);
    await page.waitForSelector("#puzzle-title:not(:empty)");

    const immediate = await page.evaluate(() => {
      const node = word => CC.state.nodes.find(candidate => candidate.word === word);
      const oxygen = node("oxygen");

      // Chlorophyll is already placed. Tapping a different member selects
      // Photosynthesis, but the edge immediately resolves to chlorophyll.
      CC.handleTap(oxygen);
      CC.handleTap(node("sunlight"));
      const photosynthesis = CC.state.links.find(link =>
        link.source === oxygen && link.clusterIndex === 0
      );

      // Aerobic is still unplaced. The canonical target is recorded now,
      // while the visible/force endpoint remains the cluster's first seed
      // rather than the arbitrary second seed the player tapped.
      CC.handleTap(oxygen);
      CC.handleTap(node("ATP"));
      const respiration = CC.state.links.find(link =>
        link.source === oxygen && link.clusterIndex === 1
      );

      return {
        readyTarget: photosynthesis.target.word,
        readyCanonical: photosynthesis.canonicalTarget.word,
        readyIdeal: photosynthesis.ideal,
        pendingTarget: respiration.target.word,
        pendingCanonical: respiration.canonicalTarget.word,
        pendingIdeal: respiration.ideal,
        recordedHistoryTarget: CC.state.nodes[CC.state.moveHistory.at(-1).target].word
      };
    });

    assert.deepEqual(immediate, {
      readyTarget: "chlorophyll",
      readyCanonical: "chlorophyll",
      readyIdeal: true,
      pendingTarget: "mitochondria",
      pendingCanonical: "aerobic",
      pendingIdeal: false,
      recordedHistoryTarget: "mitochondria"
    }, `${mode}: bridge sides did not adopt canonical or pending endpoints`);

    const resolved = await page.evaluate(() => {
      const node = word => CC.state.nodes.find(candidate => candidate.word === word);
      CC.handleTap(node("aerobic"));
      CC.handleTap(node("mitochondria"));
      const oxygen = node("oxygen");
      const link = CC.state.links.find(candidate =>
        candidate.source === oxygen && candidate.clusterIndex === 1
      );
      return {
        target: link.target.word,
        canonical: link.canonicalTarget.word,
        ideal: link.ideal,
        resolving: link.canonicalResolving,
        arriving: node("aerobic").canonicalArriving
      };
    });

    assert.deepEqual(resolved, {
      target: "aerobic",
      canonical: "aerobic",
      ideal: true,
      resolving: true,
      arriving: true
    }, `${mode}: placing the authored endpoint did not resolve the pending edge`);

    assert.equal(
      await page.locator("line.bridge-link.ideal").count(),
      2,
      `${mode}: both canonical oxygen endpoints should render as authored links`
    );
    assert.equal(
      await page.locator("g.node.ideal-target").count(),
      2,
      `${mode}: both canonical endpoint terms should be identified`
    );
    assert.match(
      await page.locator("g.node", { hasText: "aerobic" }).getAttribute("aria-label"),
      /Canonical endpoint for oxygen/,
      `${mode}: canonical endpoint was not exposed accessibly`
    );
    await page.waitForTimeout(280);
    const endpointDistance = await page.evaluate(currentMode => {
      const idealNode = CC.state.nodes.find(node => node.word === "aerobic");
      const idealElement = [...document.querySelectorAll("#board g.node")]
        .find(element => element.__data__ === idealNode);
      const matrix = idealElement.transform.baseVal.consolidate().matrix;
      if (currentMode === "sets") {
        const group = [...document.querySelectorAll("g.bridge-lines")]
          .find(element => element.__data__?.term === "oxygen");
        const line = [...group.querySelectorAll("line")]
          .find(element => element.__data__?.side === 1);
        return Math.hypot(
          Number(line.getAttribute("x1")) - matrix.e,
          Number(line.getAttribute("y1")) - matrix.f
        );
      }
      const oxygen = CC.state.nodes.find(node => node.word === "oxygen");
      const link = CC.state.links.find(candidate =>
        candidate.source === oxygen && candidate.clusterIndex === 1
      );
      const line = [...document.querySelectorAll("line.bridge-link")]
        .find(element => element.__data__ === link);
      return Math.hypot(
        Number(line.getAttribute("x2")) - matrix.e,
        Number(line.getAttribute("y2")) - matrix.f
      );
    }, mode);
    assert.ok(endpointDistance < 70,
      `${mode}: rendered bridge line did not terminate at the canonical term`);
    const settled = await page.evaluate(() => ({
      resolving: CC.state.links.some(link => link.canonicalResolving),
      arriving: CC.state.nodes.some(node => node.canonicalArriving)
    }));
    assert.deepEqual(settled, { resolving: false, arriving: false },
      `${mode}: canonical endpoint animation state did not settle`);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=graph&moves=`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  const reduced = await page.evaluate(() => {
    const node = word => CC.state.nodes.find(candidate => candidate.word === word);
    const oxygen = node("oxygen");
    CC.handleTap(oxygen);
    CC.handleTap(node("sunlight"));
    const link = CC.state.links.find(candidate =>
      candidate.source === oxygen && candidate.clusterIndex === 0
    );
    return {
      target: link.target.word,
      resolving: !!link.canonicalResolving,
      arriving: !!node("chlorophyll").canonicalArriving
    };
  });
  assert.deepEqual(reduced, {
    target: "chlorophyll",
    resolving: false,
    arriving: false
  }, "reduced motion should snap directly to the canonical endpoint");

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
