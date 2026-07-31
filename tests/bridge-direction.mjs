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

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
