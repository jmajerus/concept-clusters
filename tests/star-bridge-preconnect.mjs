// Cold start can pre-connect bridges in every layout mode. The flag is
// off unless an admin localStorage try or the sparse registry locks it.
// Switching modes keeps those bridges connected.
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PUZZLES } from "../puzzles/index.js";
import { buildNodesAndLinks } from "../modules/puzzleGraph.js";
import {
  applyStarBridgePreconnect,
  remainingLinkCount
} from "../modules/starBridgePreconnect.js";
import {
  repositoryStarBridgePreconnect,
  starBridgePreconnectEnabled
} from "../modules/starLayoutRepository.js";
import { importStarBridgePreconnect } from "../tools/import-star-bridge-preconnect.mjs";

export const name = "star layout: bridge pre-connect cold start";
export const viewport = { width: 1100, height: 800 };

const OVERRIDE_KEY = "ccStarBridgePreconnectOverrides";

function bridgeSnapshot(puzzle) {
  const built = buildNodesAndLinks(puzzle);
  const before = remainingLinkCount(built.nodes);
  const memberships = puzzle.bridges.reduce((sum, bridge) => sum + bridge.clusters.length, 0);
  const added = applyStarBridgePreconnect(puzzle, built.nodes, built.links);
  return { before, memberships, added, built };
}

export async function run(page, baseURL) {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error));
  await page.emulateMedia({ reducedMotion: "reduce" });

  const energyFlow = PUZZLES.find(puzzle => puzzle.id === "energy-flow");
  assert.equal(repositoryStarBridgePreconnect(energyFlow), false);
  assert.equal(starBridgePreconnectEnabled(energyFlow), false);
  const snap = bridgeSnapshot(energyFlow);
  assert.ok(snap.memberships >= 2);
  assert.equal(snap.added, snap.memberships);
  assert.equal(remainingLinkCount(snap.built.nodes), snap.before - snap.memberships);
  assert.equal(applyStarBridgePreconnect(energyFlow, snap.built.nodes, snap.built.links), 0);
  assert.ok(snap.built.nodes
    .filter(node => node.gs.length > 1)
    .every(node => node.connected.length === node.gs.length));
  assert.ok(snap.built.links
    .filter(link => link.bridge)
    .every(link => link.ideal === false && link.canonicalTarget !== undefined));
  const seed = snap.built.nodes.find(node =>
    node.word === energyFlow.clusters[0].seeds[0]
  );
  assert.deepEqual(seed.connected, [0]);

  const clearStorage = () => page.evaluate(key => {
    localStorage.removeItem(key);
    for (const stored of Object.keys(localStorage)) {
      if (stored.startsWith("ccPlayerSession:v1:energy-flow")) localStorage.removeItem(stored);
    }
  }, OVERRIDE_KEY);

  try {
    await page.goto(`${baseURL}/index.html?puzzle=energy-flow&admin&mode=star`);
    await clearStorage();
    await page.reload();
    await page.waitForFunction(() =>
      window.CC?.state?.phase === "assembling" &&
      window.CC?.state?.getStarFreeStripReport &&
      document.getElementById("star-bridge-preconnect-btn")
    );
    const classic = await page.evaluate(() => {
      const bridges = window.CC.state.nodes.filter(node => node.gs.length > 1);
      return {
        preconnect: window.CC.state.getStarFreeStripReport().useBridgePreconnect,
        connected: bridges.some(node => node.connected.length > 0),
        need: window.CC.state.need,
        label: document.getElementById("star-bridge-preconnect-btn").textContent
      };
    });
    assert.equal(classic.preconnect, false);
    assert.equal(classic.connected, false);
    assert.equal(classic.label, "Pre-connect bridges");
    assert.equal(await page.isHidden("#star-bridge-preconnect-export-btn"), true);

    await page.click("#star-bridge-preconnect-btn");
    await page.waitForURL(/admin/);
    await page.waitForFunction(() =>
      window.CC?.state?.getStarFreeStripReport?.().useBridgePreconnect === true &&
      window.CC.state.nodes.some(node => node.gs.length > 1 && node.connected.length === node.gs.length)
    );
    const opened = await page.evaluate(() => {
      const bridges = window.CC.state.nodes.filter(node => node.gs.length > 1);
      const bridgeLinks = window.CC.state.links.filter(link => link.bridge);
      return {
        allConnected: bridges.every(node => node.connected.length === node.gs.length),
        made: window.CC.state.made,
        need: window.CC.state.need,
        bridgeLinks: bridgeLinks.length,
        memberships: bridges.reduce((sum, node) => sum + node.gs.length, 0),
        ideals: bridgeLinks.filter(link => link.ideal).length,
        pinned: bridges.every(node => Number.isFinite(node.fx) && Number.isFinite(node.fy)),
        placed: bridges.every(node => Number.isFinite(node.x) && Number.isFinite(node.y)),
        lineCount: document.querySelectorAll("#board line.bridge-link").length,
        label: document.getElementById("star-bridge-preconnect-btn").textContent
      };
    });
    assert.equal(opened.allConnected, true);
    assert.equal(opened.made, 0);
    assert.equal(opened.need, classic.need - opened.memberships);
    assert.equal(opened.bridgeLinks, opened.memberships);
    assert.equal(opened.ideals, 0);
    assert.equal(opened.pinned, true);
    assert.equal(opened.placed, true);
    assert.equal(opened.lineCount, opened.memberships);
    assert.equal(opened.label, "Clear bridge pre-connect");
    assert.equal(await page.isHidden("#star-bridge-preconnect-export-btn"), false);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("#star-bridge-preconnect-export-btn")
    ]);
    const exported = JSON.parse(await readFile(await download.path(), "utf8"));
    assert.equal(exported.kind, "star-bridge-preconnect");
    assert.equal(exported.puzzleId, "energy-flow");
    assert.equal(exported.preconnect, true);

    const tmp = await mkdtemp(join(tmpdir(), "cc-star-bridge-preconnect-"));
    try {
      const flagPath = join(tmp, "flag.json");
      await writeFile(flagPath, JSON.stringify(exported));
      const checked = await importStarBridgePreconnect(flagPath, { checkOnly: true });
      assert.equal(checked.doc.preconnect, true);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }

    await page.click("#star-bridge-preconnect-btn");
    await page.waitForFunction(() =>
      window.CC?.state?.getStarFreeStripReport?.().useBridgePreconnect === false
    );
    const cleared = await page.evaluate(() =>
      window.CC.state.nodes.some(node => node.gs.length > 1 && node.connected.length > 0)
    );
    assert.equal(cleared, false);

    await page.evaluate(key => {
      localStorage.setItem(key, JSON.stringify({ "energy-flow": true }));
    }, OVERRIDE_KEY);
    const bridgeState = () => page.evaluate(() => {
      const bridges = window.CC.state.nodes.filter(node => node.gs.length > 1);
      return {
        allConnected: bridges.every(node => node.connected.length === node.gs.length),
        bridgeLinks: window.CC.state.links.filter(link => link.bridge).length,
        memberships: bridges.reduce((sum, node) => sum + node.gs.length, 0)
      };
    });
    for (const layoutMode of ["graph", "sets", "star"]) {
      await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=${layoutMode}`);
      await page.waitForFunction(() => window.CC?.state?.phase === "assembling");
      const openedMode = await bridgeState();
      assert.equal(openedMode.allConnected, true, layoutMode);
      assert.equal(openedMode.bridgeLinks, openedMode.memberships, layoutMode);
    }
    await page.evaluate(() => document.getElementById("mode-graph").click());
    await page.waitForFunction(() =>
      document.getElementById("mode-graph")?.getAttribute("aria-pressed") === "true"
    );
    const switched = await bridgeState();
    assert.equal(switched.allConnected, true);
    assert.equal(switched.bridgeLinks, switched.memberships);
    await page.evaluate(() => document.getElementById("mode-sets").click());
    await page.waitForFunction(() =>
      document.getElementById("mode-sets")?.getAttribute("aria-pressed") === "true"
    );
    const circled = await bridgeState();
    assert.equal(circled.allConnected, true);
    assert.equal(circled.bridgeLinks, circled.memberships);
  } finally {
    await clearStorage().catch(() => {});
  }

  assert.deepEqual(pageErrors, []);
}
