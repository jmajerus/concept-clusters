import assert from "node:assert/strict";
import programmerBargain from "../puzzles/computer-science/the-programmers-bargain.js";
import {
  AWAY_FROM_BRIDGE,
  TOWARD_BRIDGE,
  bridgeArmArrows,
  bridgeArmDirections,
  bridgeArrowPoints,
  bridgeDirectionText
} from "../modules/bridgeDirection.js";

export const name = "bridge topologies: earned arrows and explanations work in every mode";

function pointPairs(points) {
  return points.split(" ").map(pair => pair.split(",").map(Number));
}

export async function run(page, baseURL) {
  const authoredBridge = programmerBargain.bridges.find(bridge => bridge.term === "lost leverage");
  assert.deepEqual(bridgeArmDirections(authoredBridge, 0), [TOWARD_BRIDGE]);
  assert.deepEqual(bridgeArmDirections(authoredBridge, 2), [AWAY_FROM_BRIDGE]);
  assert.deepEqual(bridgeArmDirections(authoredBridge, 1), []);
  assert.equal(
    bridgeDirectionText(authoredBridge, programmerBargain),
    "Mature application leverage → lost leverage → Web reconstruction work"
  );

  const topologyCases = [
    {
      bridge: { term: "exchange", clusters: [0, 2], direction: { kind: "bidirectional" } },
      arms: [TOWARD_BRIDGE, AWAY_FROM_BRIDGE],
      text: "Mature application leverage ↔ exchange ↔ Web reconstruction work"
    },
    {
      bridge: { term: "common source", clusters: [0, 2], direction: { kind: "outward" } },
      arms: [AWAY_FROM_BRIDGE],
      text: "Mature application leverage ← common source → Web reconstruction work"
    },
    {
      bridge: { term: "convergence", clusters: [0, 2], direction: { kind: "inward" } },
      arms: [TOWARD_BRIDGE],
      text: "Mature application leverage → convergence ← Web reconstruction work"
    },
    {
      bridge: { term: "association", clusters: [0, 2], direction: { kind: "undirected" } },
      arms: [],
      text: null
    }
  ];
  topologyCases.forEach(({ bridge, arms, text }) => {
    assert.deepEqual(bridgeArmDirections(bridge, 0), arms);
    assert.deepEqual(bridgeArmDirections(bridge, 2), arms);
    assert.equal(bridgeDirectionText(bridge, programmerBargain), text);
  });
  assert.deepEqual(
    bridgeArmArrows(topologyCases[0].bridge, 0).map(arrow => arrow.centerOffset),
    [7, -7],
    "opposing arrows use separate centers"
  );

  const toward = pointPairs(bridgeArrowPoints(
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    TOWARD_BRIDGE
  ));
  const away = pointPairs(bridgeArrowPoints(
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    AWAY_FROM_BRIDGE
  ));
  const baseCenterX = points => (points[1][0] + points[2][0]) / 2;
  assert.ok(toward[0][0] < baseCenterX(toward), "toward arrow points from cluster to bridge");
  assert.ok(away[0][0] > baseCenterX(away), "away arrow points from bridge to cluster");

  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const mode of ["graph", "star", "sets"]) {
    await page.goto(`${baseURL}/index.html?puzzle=the-programmers-bargain&mode=${mode}&moves=`);
    await page.waitForSelector("#puzzle-title:not(:empty)");

    await page.evaluate(() => {
      const bridge = CC.state.nodes.find(node => node.word === "lost leverage");
      const target = CC.state.nodes.find(node => node.word === "visual form designer");
      CC.handleTap(bridge);
      CC.handleTap(target);
    });
    await page.waitForTimeout(80);
    assert.equal(
      await page.locator("polygon.bridge-direction-arrow").count(),
      0,
      `${mode}: a partial bridge does not reveal direction`
    );

    await page.evaluate(() => {
      const bridge = CC.state.nodes.find(node => node.word === "lost leverage");
      const target = CC.state.nodes.find(node => node.word === "session state");
      CC.handleTap(bridge);
      CC.handleTap(target);
    });
    await page.waitForTimeout(120);

    const rendered = await page.evaluate(() => {
      const arrows = [...document.querySelectorAll("polygon.bridge-direction-arrow")];
      const bridgeNode = [...document.querySelectorAll("#board g.node")]
        .find(element => element.__data__?.word === "lost leverage");
      return {
        arrowCount: arrows.length,
        points: arrows.map(arrow => arrow.getAttribute("points")),
        ariaLabel: bridgeNode?.getAttribute("aria-label"),
        facts: document.getElementById("facts").textContent
      };
    });

    assert.equal(rendered.arrowCount, 2, `${mode}: a completed directed bridge renders two arrows`);
    if (mode === "sets") {
      await page.evaluate(() => CC.state.setSim.stop());
      const box = await page.evaluate(() => {
        const group = [...document.querySelectorAll("g.node")]
          .find(element => element.__data__?.word === "lost leverage");
        const rect = group.querySelector(".bridge-shape").getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });
      const before = await page.evaluate(() => {
        const bridge = CC.state.nodes.find(node => node.word === "lost leverage");
        return { x: bridge.x, y: bridge.y };
      });
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 70, box.y + box.height / 2 + 36, { steps: 6 });
      await page.mouse.up();
      const followed = await page.evaluate(start => {
        const bridge = CC.state.nodes.find(node => node.word === "lost leverage");
        const lines = [...document.querySelectorAll("g.bridge-lines")]
          .find(group => group.__data__?.term === "lost leverage")
          .querySelectorAll("line");
        const distanceToSegment = (px, py, x1, y1, x2, y2) => {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const lengthSquared = dx * dx + dy * dy || 1;
          const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
          return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
        };
        const arrows = [...document.querySelectorAll("g.bridge-directions")]
          .find(group => group.__data__?.term === "lost leverage")
          .querySelectorAll("polygon");
        return {
          moved: Math.hypot(bridge.x - start.x, bridge.y - start.y),
          lineEndsAtBridge: [...lines].every(line =>
            Math.hypot(
              Number(line.getAttribute("x2")) - bridge.x,
              Number(line.getAttribute("y2")) - bridge.y
            ) < 1
          ),
          arrowsOnLines: [...arrows].every(arrow => {
            const points = arrow.getAttribute("points").split(" ").map(pair => pair.split(",").map(Number));
            const cx = (points[0][0] + points[1][0] + points[2][0]) / 3;
            const cy = (points[0][1] + points[1][1] + points[2][1]) / 3;
            return [...lines].some(line => distanceToSegment(
              cx, cy,
              Number(line.getAttribute("x1")),
              Number(line.getAttribute("y1")),
              Number(line.getAttribute("x2")),
              Number(line.getAttribute("y2"))
            ) < 1.5);
          })
        };
      }, before);
      assert.ok(followed.moved > 8, "Circle bridge drag did not move the pill");
      assert.equal(followed.lineEndsAtBridge, true, "Circle bridge lines stayed behind the dragged pill");
      assert.equal(followed.arrowsOnLines, true, "Circle arrows left the bridge lines after the drag");
    }
    assert.ok(
      rendered.points.every(points => points && !points.includes("NaN")),
      `${mode}: every arrow has finite geometry`
    );
    assert.match(
      rendered.ariaLabel,
      /Directed bridge: Mature application leverage → lost leverage → Web reconstruction work/,
      `${mode}: the completed bridge exposes its direction accessibly`
    );
    assert.match(
      rendered.facts,
      /Direction\. Mature application leverage → lost leverage → Web reconstruction work/,
      `${mode}: the earned fact card states the direction in text`
    );

    await page.evaluate(() => {
      const bridge = CC.state.nodes.find(node => node.word === "frameworks");
      for (const word of ["session state", "cross-browser compatibility"]) {
        CC.handleTap(bridge);
        CC.handleTap(CC.state.nodes.find(node => node.word === word));
      }
    });
    await page.waitForTimeout(120);
    const outward = await page.evaluate(() => {
      const bridgeNode = [...document.querySelectorAll("#board g.node")]
        .find(element => element.__data__?.word === "frameworks");
      return {
        arrowCount: document.querySelectorAll("polygon.bridge-direction-arrow").length,
        ariaLabel: bridgeNode?.getAttribute("aria-label"),
        facts: document.getElementById("facts").textContent
      };
    });
    assert.equal(outward.arrowCount, 4, `${mode}: outward and through bridges each render two arrows`);
    assert.match(
      outward.ariaLabel,
      /Web reconstruction work ← frameworks → New measures of competence/,
      `${mode}: outward topology is exposed accessibly`
    );
    assert.match(
      outward.facts,
      /Direction\. Web reconstruction work ← frameworks → New measures of competence/,
      `${mode}: outward topology is stated in its fact card`
    );

    // Exercise the double-arrow rendering path without assigning a
    // speculative reciprocal meaning to a real authored bridge.
    await page.evaluate(() => {
      const bridge = CC.state.nodes.find(node => node.word === "frameworks");
      bridge.direction = { kind: "bidirectional" };
      CC.state.onLinkAdded();
      CC.state.paint();
    });
    await page.waitForTimeout(120);
    assert.equal(
      await page.locator("polygon.bridge-direction-arrow").count(),
      6,
      `${mode}: a reciprocal bridge renders two opposing arrows on each arm`
    );
  }

  // A canonical arm is drawn to the term inside the circle. Its arrow has
  // to sit on that line, not on the radius from the circle's center.
  await page.goto(`${baseURL}/index.html?puzzle=how-light-makes-form&mode=sets&moves=`);
  await page.waitForSelector("#puzzle-title:not(:empty)");
  await page.evaluate(() => {
    const bridge = CC.state.nodes.find(node => node.word === "reflected light");
    for (const word of ["midtone", "core shadow"]) {
      CC.handleTap(bridge);
      CC.handleTap(CC.state.nodes.find(node => node.word === word));
    }
    CC.state.setSim.stop();
    CC.state.paint();
  });
  const canonicalArrows = await page.evaluate(() => {
    const lines = [...document.querySelectorAll("g.bridge-lines")]
      .find(group => group.__data__?.term === "reflected light")
      ?.querySelectorAll("line.ideal");
    const arrows = [...document.querySelectorAll("g.bridge-directions")]
      .find(group => group.__data__?.term === "reflected light")
      ?.querySelectorAll("polygon");
    if (!lines?.length || !arrows?.length) return { lines: lines?.length || 0, arrows: arrows?.length || 0, onLine: false };
    const distanceToSegment = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSquared = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    };
    const onLine = [...arrows].every(arrow => {
      const points = arrow.getAttribute("points").split(" ").map(pair => pair.split(",").map(Number));
      const cx = (points[0][0] + points[1][0] + points[2][0]) / 3;
      const cy = (points[0][1] + points[1][1] + points[2][1]) / 3;
      return [...lines].some(line => distanceToSegment(
        cx, cy,
        Number(line.getAttribute("x1")),
        Number(line.getAttribute("y1")),
        Number(line.getAttribute("x2")),
        Number(line.getAttribute("y2"))
      ) < 1.5);
    });
    return { lines: lines.length, arrows: arrows.length, onLine };
  });
  assert.equal(canonicalArrows.lines, 2, "canonical bridge did not draw both ideal arms");
  assert.ok(canonicalArrows.arrows >= 2, "canonical bridge did not draw its direction arrows");
  assert.equal(canonicalArrows.onLine, true, "canonical arrows sat off their lines");

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
