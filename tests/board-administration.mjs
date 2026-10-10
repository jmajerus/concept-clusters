import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { partitionAuthoredDocument } from "../modules/authoringDomains.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { createLocalDraftReviewHandler } from "../modules/localDraftReview.js";
import { createLocalPlayCorpusHandler } from "../modules/localPlayCorpus.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { createMemorySiteSettingsStore } from "../modules/siteSettings.js";
import { startServer, serverURL } from "./lib/server.mjs";

export const name = "board administration: layout and working-copy board controls survive a focused save";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const draftId = "board-flags";
// Bridge pre-connect changes play and stays in the puzzle document; the
// free-term strip and board size are layout settings saved with the layout.
const savedBoard = { bridgePreconnect: true };
const layoutBoard = layout => {
  const { savedAt, ...rest } = layout?.board || {};
  return rest;
};

const puzzle = {
  id: draftId,
  title: "Board flags",
  category: "Science",
  provenance: {
    collaboration: "ai",
    contributors: [{ name: "Claude", model: "Claude Opus 4.7", reasoning: "high" }]
  },
  clusters: [
    { name: "Alpha", fact: "Alpha fact.", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
    { name: "Beta", fact: "Beta fact.", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
  ],
  bridges: [
    { term: "link", clusters: ["alpha", "beta"], fact: "Connects the two." }
  ],
  lenses: [
    {
      id: "alpha-lens",
      prompt: "Which term belongs to Alpha?",
      targets: ["a1"],
      explanation: "a1 is one of Alpha's.",
      reasons: { a1: "It is Alpha's first seed." }
    }
  ]
};

async function waitForBoard(page) {
  await page.waitForFunction(expected => {
    const strip = document.getElementById("star-free-strip-btn");
    const preconnect = document.getElementById("star-bridge-preconnect-btn");
    const size = document.getElementById("board-size-factor");
    return window.CC?.state?.puzzle?.id === expected
      && strip && !strip.hidden && !strip.disabled
      && preconnect && !preconnect.hidden && !preconnect.disabled
      && size && !size.hidden;
  }, draftId, { timeout: 15000 });
}

export async function run(page) {
  const directory = await mkdtemp(join(tmpdir(), "cc-board-administration-"));
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") pageErrors.push(message.text());
  });
  const draftStore = createPuzzleDraftStore({ directory });
  await draftStore.createDraft({ draftId, document: puzzle });
  const siteSettings = createMemorySiteSettingsStore();
  const handlePlay = createLocalPlayCorpusHandler({
    contentDocuments: createMemoryContentDocumentRepository(),
    contentService: { puzzles: [], catalogues: [], categories: {} },
    listDrafts: () => draftStore.listDrafts({ includeDocument: true }),
    repositoryRoot: root,
    siteSettings
  });
  const handleDrafts = createLocalDraftReviewHandler({
    draftStore,
    repositoryRoot: root
  });
  const server = await startServer(root, {
    handleRequest: async (req, res) =>
      (await handlePlay(req, res)) || (await handleDrafts(req, res))
  });
  try {
    const baseURL = serverURL(server);
    // Board settings live in the layout view's Board settings card; the
    // free-term strip is offered in Star mode only.
    const boardURL = `${baseURL}/?puzzle=${draftId}&author=layout&mode=star`;
    await page.goto(`${baseURL}/index.html`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.goto(boardURL, { waitUntil: "networkidle" });
    await waitForBoard(page);
    assert.equal(await page.textContent("#star-free-strip-btn"), "Use free-term strip");
    assert.equal(await page.textContent("#star-bridge-preconnect-btn"), "Pre-connect bridges");
    assert.equal(await page.isVisible("#board-settings"), true);
    assert.equal(await page.isVisible("#layout-authoring"), true);

    await page.click("#star-free-strip-btn");
    await page.waitForFunction(() => window.CC?.state?.puzzle?.layout?.board?.starFreeStrip === true, null, {
      timeout: 15000
    });
    await waitForBoard(page);
    await page.click("#star-bridge-preconnect-btn");
    await page.waitForFunction(() =>
      window.CC?.state?.puzzle?.layout?.board?.starFreeStrip === true
      && window.CC.state.puzzle.board?.bridgePreconnect === true,
    null, { timeout: 15000 });

    const stored = await draftStore.getDraft(draftId);
    assert.deepEqual(stored.document.board, savedBoard);
    assert.deepEqual(layoutBoard(stored.layout), { starFreeStrip: true, source: "author" });

    await page.goto(boardURL, { waitUntil: "networkidle" });
    await page.waitForFunction(() =>
      window.CC?.state?.puzzle?.layout?.board?.starFreeStrip === true
      && window.CC.state.puzzle.board?.bridgePreconnect === true,
    null, { timeout: 15000 });
    await waitForBoard(page);
    const beforeWidth = await page.evaluate(() => document.getElementById("board").viewBox.baseVal.width);
    const labelHeight = () => page.evaluate(() => {
      const text = document.querySelector("#board .node text");
      return text ? text.getBoundingClientRect().height : 0;
    });
    const derivedLabelHeight = await labelHeight();
    assert.ok(derivedLabelHeight > 0);
    assert.match(await page.textContent("#board-size-factor-readout"), /0%/);
    await page.evaluate(() => {
      const input = document.getElementById("board-size-factor-input");
      input.value = "0.75";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForFunction(start => {
      const box = document.getElementById("board").viewBox.baseVal;
      const readout = document.getElementById("board-size-factor-readout")?.textContent || "";
      return box.width < start && readout.includes("-25%");
    }, beforeWidth, { timeout: 15000 });
    const tighterLabelHeight = await labelHeight();
    assert.ok(
      Math.abs(tighterLabelHeight - derivedLabelHeight) / derivedLabelHeight < 0.08,
      `label height ${tighterLabelHeight} drifted from ${derivedLabelHeight}`
    );
    await page.evaluate(() => {
      const input = document.getElementById("board-size-factor-input");
      input.value = "1.2";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForFunction(start => {
      const box = document.getElementById("board").viewBox.baseVal;
      const readout = document.getElementById("board-size-factor-readout")?.textContent || "";
      return box.width > start && readout.includes("+20%");
    }, beforeWidth, { timeout: 15000 });
    await page.evaluate(() => {
      document.getElementById("board-size-factor-input")
        .dispatchEvent(new Event("change", { bubbles: true }));
    });
    let sized = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      sized = await draftStore.getDraft(draftId);
      if (sized.layout?.board?.sizeFactor === 1.2) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const savedLayoutBoard = { starFreeStrip: true, sizeFactor: 1.2, source: "author" };
    assert.deepEqual(layoutBoard(sized.layout), savedLayoutBoard);
    assert.deepEqual(sized.document.board, savedBoard, "board size stays out of the puzzle document");

    const content = partitionAuthoredDocument(sized.document).content;
    const focused = await draftStore.replaceDomain({
      draftId,
      domain: "content",
      projection: { ...content, title: "Retitled by a content save" },
      expectedRevision: sized.revision
    });
    assert.equal(focused.document.title, "Retitled by a content save");
    assert.deepEqual(focused.document.board, savedBoard);
    assert.deepEqual(layoutBoard((await draftStore.getDraft(draftId)).layout), savedLayoutBoard);
    assert.equal(focused.documentStale, true);

    await page.goto(boardURL, { waitUntil: "networkidle" });
    await page.waitForFunction(() =>
      document.getElementById("puzzle-title")?.textContent === "Retitled by a content save"
      && window.CC?.state?.puzzle?.layout?.board?.starFreeStrip === true
      && window.CC.state.puzzle.board?.bridgePreconnect === true
      && window.CC.state.puzzle.layout.board.sizeFactor === 1.2,
    null, { timeout: 15000 });

    // Changing a size that is already saved still resizes the board: the
    // preview stages the layout setting, which takes precedence.
    await waitForBoard(page);
    const savedWidth = await page.evaluate(() => document.getElementById("board").viewBox.baseVal.width);
    await page.evaluate(() => {
      const input = document.getElementById("board-size-factor-input");
      input.value = "1";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForFunction(start => {
      const box = document.getElementById("board").viewBox.baseVal;
      const readout = document.getElementById("board-size-factor-readout")?.textContent || "";
      return box.width < start && readout.startsWith("0%");
    }, savedWidth, { timeout: 15000 });
    await page.evaluate(() => {
      document.getElementById("board-size-factor-input")
        .dispatchEvent(new Event("change", { bubbles: true }));
    });
    let resized = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      resized = await draftStore.getDraft(draftId);
      if (resized.layout?.board?.sizeFactor === 1) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.equal(resized.layout.board.sizeFactor, 1, "back to the default is saved as an explicit choice");

    // Experiments: the lens flow trace is offered on a puzzle with lenses
    // and, like pre-connect, saves on the working copy's document.
    await page.goto(boardURL, { waitUntil: "networkidle" });
    await waitForBoard(page);
    assert.equal(await page.isVisible("#board-experiments"), true);
    assert.equal(await page.textContent("#lens-flow-trace-btn"), "Turn on lens flow trace");
    await page.click("#lens-flow-trace-btn");
    await page.waitForFunction(() => window.CC?.state?.puzzle?.board?.lensFlowTrace === true, null, {
      timeout: 15000
    });
    await waitForBoard(page);
    assert.equal(await page.textContent("#lens-flow-trace-btn"), "Turn off lens flow trace");
    const traced = await draftStore.getDraft(draftId);
    assert.deepEqual(traced.document.board, { ...savedBoard, lensFlowTrace: true });
    assert.equal(traced.layout.board.sizeFactor, 1, "experiments leave the layout's board settings alone");

    // Lens reveal cue: this puzzle's choice saves on the working copy
    // without rebuilding the board; the site setting saves for every puzzle
    // and shows up as what "Use site setting" means.
    assert.equal(await page.isVisible("#lens-reveal-controls"), true);
    assert.equal(await page.isVisible("#site-settings"), true);
    const selectedText = selector => page.$eval(selector, select => select.selectedOptions[0]?.textContent);
    assert.equal(await selectedText("#lens-reveal-cue-select"), "Use site setting (None)");
    await page.evaluate(() => { window.__sameBoard = true; });
    await page.selectOption("#lens-reveal-cue-select", "spotlight");
    await page.waitForFunction(() => window.CC?.state?.puzzle?.board?.lensRevealCue === "spotlight"
      && !document.getElementById("lens-reveal-cue-select").disabled, null, { timeout: 15000 });
    assert.equal(await page.evaluate(() => window.__sameBoard), true, "saving the cue does not reload");
    const cued = await draftStore.getDraft(draftId);
    assert.deepEqual(cued.document.board, { ...savedBoard, lensFlowTrace: true, lensRevealCue: "spotlight" });

    await page.selectOption("#site-lens-reveal-cue", "ripple");
    await page.waitForFunction(() => !document.getElementById("site-lens-reveal-cue").disabled
      && document.getElementById("lens-reveal-cue-select").options[0]?.textContent === "Use site setting (Ripple)",
    null, { timeout: 15000 });
    await page.check("#site-lens-hover-ping");
    await page.waitForFunction(() => !document.getElementById("site-lens-hover-ping").disabled, null, { timeout: 15000 });
    assert.deepEqual(await siteSettings.read(), { lensRevealCue: "ripple", lensRevealHoverPing: true });

    // Try draws a cue on the board; it keeps the last cue picked so a
    // comparison is not reset by a save.
    await page.selectOption("#lens-reveal-try-cue", "spotlight");
    await page.click("#lens-reveal-try-btn");
    await page.waitForSelector("#board g.lens-reveal-cue .lens-cue-shade", { state: "attached", timeout: 5000 });
    await page.selectOption("#lens-reveal-try-cue", "ripple");
    await page.click("#lens-reveal-try-btn");
    await page.waitForSelector("#board g.lens-reveal-cue .lens-cue-ring", { state: "attached", timeout: 5000 });
    assert.equal(await page.$("#board g.lens-reveal-cue .lens-cue-shade"), null, "a new Try replaces the last one");

    // A reload reads the site setting from the play corpus.
    await page.goto(boardURL, { waitUntil: "networkidle" });
    await waitForBoard(page);
    assert.equal(await page.inputValue("#site-lens-reveal-cue"), "ripple");
    assert.equal(await page.isChecked("#site-lens-hover-ping"), true);
    assert.equal(await page.inputValue("#lens-reveal-cue-select"), "spotlight");

    // With the hover ping on, pointing at an answer named in the revealed
    // explanation pings its pill.
    await page.click("#layout-authoring-prepare");
    await page.waitForFunction(() => window.CC?.state?.phase === "lens-selecting", null, { timeout: 15000 });
    await page.click("#lens-check");
    await page.waitForSelector("#lens-explanation.lens-hover-ping [data-lens-term='a1']", { timeout: 5000 });
    await page.hover("#lens-explanation [data-lens-term='a1']");
    await page.waitForSelector("#board g.lens-term-ping .lens-cue-ring", { state: "attached", timeout: 5000 });

    // A resize keeps a prepared arrangement and re-centres it: every pill
    // moves by half the change in size, adding margin evenly all round.
    await page.goto(boardURL, { waitUntil: "networkidle" });
    await waitForBoard(page);
    await page.click("#layout-authoring-prepare");
    await page.waitForFunction(() => window.CC?.state?.solutionLayout === "pretty", null, { timeout: 15000 });
    const before = await page.evaluate(() => {
      const box = document.getElementById("board").viewBox.baseVal;
      const node = window.CC.state.nodes[0];
      return { width: box.width, height: box.height, word: node.word, x: node.x, y: node.y };
    });
    await page.evaluate(() => {
      const input = document.getElementById("board-size-factor-input");
      input.value = String(Number(input.value) + 0.1);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.waitForFunction(() =>
      /re-centred/.test(document.getElementById("layout-authoring-status")?.textContent || ""),
    null, { timeout: 15000 });
    const after = await page.evaluate(word => {
      const box = document.getElementById("board").viewBox.baseVal;
      const node = window.CC.state.nodes.find(candidate => candidate.word === word);
      return { width: box.width, height: box.height, x: node.x, y: node.y };
    }, before.word);
    assert.ok(after.width > before.width, "the board grew");
    assert.ok(Math.abs((after.x - before.x) - (after.width - before.width) / 2) < 0.5, "moved by half the width change");
    assert.ok(Math.abs((after.y - before.y) - (after.height - before.height) / 2) < 0.5, "moved by half the height change");
    assert.equal(await page.evaluate(() => window.CC.state.solutionLayout), "pretty", "no new layout was asked for");
  } finally {
    server.close();
    await rm(directory, { recursive: true, force: true });
  }
  assert.equal(pageErrors.length, 0, `console errors:\n${pageErrors.join("\n")}`);
}
