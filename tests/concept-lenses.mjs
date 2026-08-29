import assert from "node:assert/strict";

export const name = "concept lenses: post-solve selection, reveal, and persistence";
// Waits on prettyPrintPromise and exercises the Star detangler's
// interaction with lens phases (see the comment near line 250) -- a
// real dependency on the layout-search machinery, not just a slow
// UI-interaction test.
export const tier = "extended";

const PUZZLE_ID = "interpreting-a-text";
const NEXT_MODE = {
  graph: "star",
  star: "sets",
  sets: "graph"
};

async function solveToFirstLens(page) {
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-selecting");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termLocator(page, word) {
  return page.locator(".node").filter({
    has: page.locator("text").filter({ hasText: new RegExp(`^${escapeRegExp(word)}$`) })
  });
}

async function clickTerm(page, word) {
  const term = termLocator(page, word);
  assert.equal(await term.count(), 1, `could not find one rendered "${word}" node`);
  await term.click();
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(`${baseURL}/index.html`);
  await page.evaluate(() => localStorage.clear());

  for (const mode of ["graph", "star", "sets"]) {
    await page.goto(
      `${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=${mode}&moves=`
    );
    await solveToFirstLens(page);

    assert.equal(await page.isVisible("#lens-panel"), true);
    assert.equal(await page.textContent("#lens-progress"), "Lens 1 of 3");
    assert.equal(await page.textContent("#show-solution"), "Map complete");
    assert.equal(await page.isDisabled("#show-solution"), true);
    assert.equal(
      await page.evaluate(() => CC.state.solutionLayout),
      "pretty",
      `${mode}: Show Solution entered lenses without its final layout pass`
    );
    for (const id of ["#mode-graph", "#mode-star", "#mode-sets"]) {
      assert.equal(
        await page.isDisabled(id),
        false,
        `${mode}: mode control stayed locked during lens selection`
      );
    }

    await clickTerm(page, "diction");
    await clickTerm(page, "historical setting");
    const nextMode = NEXT_MODE[mode];
    if (nextMode === "graph") {
      await page.evaluate(puzzleId => {
        // Earlier iterations visit Graph first and legitimately cache its
        // polished layout. Remove only that cached representation so this
        // iteration covers a first-time switch whose layout search cannot
        // be skipped.
        const key = `ccPlayerSession:v1:${puzzleId}`;
        const session = JSON.parse(localStorage.getItem(key));
        delete session.layouts.graph;
        localStorage.setItem(key, JSON.stringify(session));
        document.getElementById("mode-graph").addEventListener("click", () => {
          const solution = document.getElementById("show-solution");
          window.__immediateGraphLensSwitch = {
            transforms: [...document.querySelectorAll("#board .node")]
              .map(node => node.getAttribute("transform")),
            solutionText: solution.textContent,
            solutionDisabled: solution.disabled,
            solutionBusy: solution.getAttribute("aria-busy")
          };
        }, { once: true });
      }, PUZZLE_ID);
    }
    await page.click(`#mode-${nextMode}`);
    if (nextMode === "graph") {
      const immediateSwitch = await page.evaluate(() =>
        window.__immediateGraphLensSwitch
      );
      assert.ok(
        immediateSwitch.transforms.every(transform => /^translate\([^,]+,[^)]+\)$/.test(transform)),
        "Circle-to-Graph switch briefly painted unpositioned nodes at the SVG origin"
      );
      assert.ok(
        new Set(immediateSwitch.transforms).size > immediateSwitch.transforms.length / 2,
        "Circle-to-Graph switch briefly painted the nodes in one pile"
      );
      assert.equal(immediateSwitch.solutionText, "Polishing…");
      assert.equal(immediateSwitch.solutionDisabled, true);
      assert.equal(immediateSwitch.solutionBusy, "true");
    }
    await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
    assert.equal(await page.evaluate(() => CC.mode), nextMode);
    assert.equal(await page.evaluate(() => CC.state.phase), "lens-selecting");
    assert.deepEqual(
      await page.evaluate(() => [...CC.state.lensSelections].sort()),
      ["diction", "historical setting"]
    );
    for (const id of ["#mode-graph", "#mode-star", "#mode-sets"]) {
      assert.equal(
        await page.isDisabled(id),
        false,
        `${mode} → ${nextMode}: mode control stayed locked after layout`
      );
    }
    assert.equal(
      await termLocator(page, "diction").getAttribute("aria-pressed"),
      "true"
    );
    await page.click("#lens-check");

    assert.equal(await page.evaluate(() => CC.state.phase), "lens-revealed");
    assert.match(await page.textContent("#lens-result"), /identified 1 of 5/i);
    assert.match(
      await termLocator(page, "diction").getAttribute("class"),
      /\blens-correct\b/
    );
    assert.match(
      await termLocator(page, "imagery").getAttribute("class"),
      /\blens-missed\b/
    );
    assert.match(
      await termLocator(page, "historical setting").getAttribute("class"),
      /\blens-extra\b/
    );
    assert.equal(
      await termLocator(page, "diction").locator(".lens-check").isVisible(),
      true,
      `${mode}: correctly selected term has no check mark`
    );
    assert.equal(
      await termLocator(page, "imagery").locator(".lens-check").isVisible(),
      false,
      `${mode}: missed term should not have a check mark`
    );
    assert.equal(
      await termLocator(page, "historical setting").locator(".lens-check").isVisible(),
      false,
      `${mode}: extra selection should not have a check mark`
    );
    const feedbackPresentation = await page.evaluate(() => {
      const nodeEl = word => [...document.querySelectorAll("#board .node")]
        .find(el => el.__data__?.word === word);
      const nodeTextColor = word =>
        getComputedStyle(nodeEl(word).querySelector("text")).fill;
      const nodeOutline = word => {
        const shape = nodeEl(word).querySelector("rect, polygon");
        const style = getComputedStyle(shape);
        return {
          dasharray: style.strokeDasharray,
          linecap: style.strokeLinecap
        };
      };
      const resolveToken = token => {
        const probe = document.createElement("span");
        probe.style.color = `var(${token})`;
        document.body.appendChild(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      };
      return {
        correct: nodeTextColor("diction"),
        missed: nodeTextColor("imagery"),
        extra: nodeTextColor("historical setting"),
        correctOutline: nodeOutline("diction"),
        missedOutline: nodeOutline("imagery"),
        extraOutline: nodeOutline("historical setting"),
        success: resolveToken("--success"),
        error: resolveToken("--error"),
        teal: resolveToken("--teal"),
        magenta: resolveToken("--magenta")
      };
    });
    assert.equal(feedbackPresentation.correct, feedbackPresentation.success);
    assert.equal(feedbackPresentation.missed, feedbackPresentation.success);
    assert.equal(feedbackPresentation.extra, feedbackPresentation.error);
    assert.notEqual(feedbackPresentation.correct, feedbackPresentation.teal);
    assert.notEqual(feedbackPresentation.extra, feedbackPresentation.magenta);
    assert.equal(feedbackPresentation.correctOutline.dasharray, "none");
    assert.equal(feedbackPresentation.missedOutline.dasharray, "5px, 3px");
    assert.equal(feedbackPresentation.extraOutline.dasharray, "0px, 6px");
    assert.equal(feedbackPresentation.extraOutline.linecap, "round");
    assert.match(await page.textContent("#lens-explanation"), /Direct textual evidence/);

    await page.click("#lens-next");
    assert.equal(await page.textContent("#lens-progress"), "Lens 2 of 3");
    assert.doesNotMatch(
      await termLocator(page, "diction").getAttribute("class"),
      /\blens-(?:correct|missed|extra|selected)\b/
    );
    await page.click("#lens-check");
    await page.click("#lens-next");
    assert.equal(await page.textContent("#lens-progress"), "Lens 3 of 3");
    await page.click("#lens-check");
    await page.click("#lens-next");

    assert.equal(await page.evaluate(() => CC.state.phase), "complete");
    assert.equal(await page.textContent("#lens-progress"), "Lenses complete");
    assert.equal(await page.isVisible("#related-puzzles"), true);
    for (const id of ["#mode-graph", "#mode-star", "#mode-sets"]) {
      assert.equal(await page.isDisabled(id), false, `${mode}: mode control stayed locked`);
    }

    const saved = await page.evaluate(id => {
      const raw = localStorage.getItem(`ccPlayerSession:v1:${id}`);
      return raw ? JSON.parse(raw) : null;
    }, PUZZLE_ID);
    assert.equal(saved.completed, true);
    assert.equal(saved.lens.phase, "complete");

    await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=${mode}`);
    await page.waitForFunction(() => window.CC?.state?.phase === "complete");
    assert.equal(await page.textContent("#lens-progress"), "Lenses complete");
  }

  await page.goto(
    `${baseURL}/index.html?puzzle=fundamental-forces&mode=graph&moves=`
  );
  await page.click("#show-solution");
  await page.evaluate(() => CC.state.prettyPrintPromise);
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.equal(await page.isHidden("#lens-panel"), true);

  // The Geography pilot uses the cluster partition as one axis and
  // regional lenses as another. Exercise all five authored answer sets
  // so an innocuous term rename cannot silently break that matrix.
  const geographyLenses = [
    [
      "dry-summer climate",
      "sclerophyll vegetation",
      "olive cultivation",
      "terraced farming",
      "irrigation",
      "transhumance"
    ],
    [
      "seasonal monsoon",
      "monsoon forest",
      "wet-rice agriculture",
      "terraced farming",
      "irrigation"
    ],
    [
      "variable semiarid rainfall",
      "Sahelian savanna",
      "mobile pastoralism",
      "transhumance",
      "seasonality"
    ],
    [
      "permafrost",
      "Arctic tundra",
      "reindeer herding",
      "elevated foundations",
      "seasonality"
    ],
    [
      "terraced farming",
      "irrigation",
      "transhumance",
      "seasonality"
    ]
  ];
  await page.goto(
    `${baseURL}/index.html?puzzle=climate-and-livelihoods&mode=graph&moves=`
  );
  await solveToFirstLens(page);
  for (const [index, targets] of geographyLenses.entries()) {
    assert.equal(
      await page.textContent("#lens-progress"),
      `Lens ${index + 1} of ${geographyLenses.length}`
    );
    for (const target of targets) await clickTerm(page, target);
    await page.click("#lens-check");
    assert.match(
      await page.textContent("#lens-result"),
      new RegExp(`identified ${targets.length} of ${targets.length}`, "i")
    );
    assert.equal(
      await page.locator(".node.lens-missed, .node.lens-extra").count(),
      0,
      `Geography lens ${index + 1} should reveal no missing or extra targets`
    );
    await page.click("#lens-next");
  }
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.equal(await page.textContent("#lens-progress"), "Lenses complete");

  // Lens takeover removes the ordinary second "Polish layout" click.
  // Its preparation step must therefore run the final aesthetic pass
  // automatically before freezing the map for selections.
  await page.goto(
    `${baseURL}/index.html?puzzle=the-programmers-bargain&mode=star&moves=`
  );
  await solveToFirstLens(page);
  const programmerStarMetrics = await page.evaluate(() =>
    CC.state.getStarLayoutMetrics()
  );
  assert.equal(programmerStarMetrics.lineCrossings, 0);
  assert.equal(programmerStarMetrics.edgeNodeIntersections, 0);
  assert.equal(programmerStarMetrics.edgeTitleIntersections, 0);
  assert.equal(await page.evaluate(() => CC.state.solutionLayout), "pretty");

  // A live player completion must uncross before lenses freeze the board,
  // and a drag of the last connected node must still be possible afterward.
  await page.goto(
    `${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=star&moves=`
  );
  await page.waitForFunction(
    expected => window.CC?.state?.puzzle?.id === expected,
    PUZZLE_ID
  );
  if (await page.evaluate(() => CC.state.learningGated)) {
    await page.click("#learning-introduction #skip");
  }
  await page.evaluate(() => {
    const isDone = node => node.connected.length === node.gs.length;
    const isBridge = node => node.gs.length > 1;
    while (CC.state.made < CC.state.need) {
      const source = CC.state.nodes.find(node => !isDone(node));
      const ci = source.gs.find(group => !source.connected.includes(group));
      const target = CC.state.nodes.find(node =>
        !isBridge(node) && node.gs[0] === ci && isDone(node)
      );
      CC.handleTap(source);
      CC.handleTap(target);
    }
  });
  assert.equal(
    await page.evaluate(() => CC.state.completedViaShowSolution),
    false
  );
  await page.waitForFunction(() => {
    const status = document.getElementById("board-status");
    return status && !status.hidden && /Detangling/.test(status.textContent);
  });
  await page.waitForFunction(() => CC.state.phase === "lens-selecting");
  assert.equal(
    await page.locator("#board-status").isVisible(),
    false,
    "board status overlay stayed up after lenses started"
  );
  assert.equal(
    await page.evaluate(() => CC.state.getStarLayoutMetrics().lineCrossings),
    0,
    "player-solved Star board entered lenses with a locked-in line crossing"
  );
  const beforeDrag = await page.evaluate(() => {
    const node = CC.state.nodes.find(candidate => candidate.word === "diction");
    return { x: node.x, y: node.y };
  });
  const diction = termLocator(page, "diction");
  const box = await diction.boundingBox();
  assert.ok(box, "diction node has no bounding box after player solve");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 48, box.y + box.height / 2 + 28, {
    steps: 8
  });
  await page.mouse.up();
  const afterDrag = await page.evaluate(() => {
    const node = CC.state.nodes.find(candidate => candidate.word === "diction");
    return { x: node.x, y: node.y, phase: CC.state.phase };
  });
  assert.equal(afterDrag.phase, "lens-selecting");
  assert.ok(
    Math.hypot(afterDrag.x - beforeDrag.x, afterDrag.y - beforeDrag.y) > 12,
    "frozen lens board rejected a drag of the last connected node"
  );
  await clickTerm(page, "imagery");
  assert.equal(
    await page.evaluate(() => CC.state.lensSelections.has("imagery")),
    true,
    "lens term click stopped working after a post-solve drag"
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
