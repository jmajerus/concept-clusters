import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importStarLayout } from "../tools/import-star-layout.mjs";

export const name = "star layout authoring: local drafts export and curated overrides apply";
export const tier = "extended";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    `${baseURL}/index.html?puzzle=fundamental-forces&author=layout`
  );

  assert.equal(await page.getAttribute("#layout-authoring", "hidden"), null);
  assert.equal(await page.isDisabled("#mode-graph"), true);
  assert.equal(await page.isDisabled("#mode-sets"), true);
  assert.equal(await page.evaluate(() => window.CC.mode), "star");
  assert.equal(await page.isDisabled("#layout-authoring-export"), true);

  await page.click("#layout-authoring-prepare");
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty");
  assert.equal(await page.textContent("#layout-metric-crossings"), "0");
  assert.equal(await page.textContent("#layout-metric-overlaps"), "0");
  assert.equal(await page.isDisabled("#layout-authoring-export"), false);

  const term = page.locator(".node").filter({ hasText: "electric charge" }).first();
  const box = await term.boundingBox();
  assert.ok(box, "authoring drag target was not visible");
  const beforeDrag = await term.evaluate(element => ({
    x: element.__data__.x,
    y: element.__data__.y,
    width: document.querySelector("#board").viewBox.baseVal.width,
    height: document.querySelector("#board").viewBox.baseVal.height
  }));
  const boardBox = await page.locator("#board").boundingBox();
  assert.ok(boardBox, "authoring board was not visible");
  const boardScaleX = boardBox.width / beforeDrag.width;
  const boardScaleY = boardBox.height / beforeDrag.height;
  const deltaX = (beforeDrag.x < beforeDrag.width / 2 ? 30 : -30) * boardScaleX;
  const deltaY = (beforeDrag.y < beforeDrag.height / 2 ? 15 : -15) * boardScaleY;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(30);
  await page.mouse.move(
    box.x + box.width / 2 + deltaX,
    box.y + box.height / 2 + deltaY,
    { steps: 8 }
  );
  await page.mouse.up();
  await page.waitForFunction(({ x, y }) => {
    const element = [...document.querySelectorAll(".node")]
      .find(candidate => candidate.__data__.word === "electric charge");
    return element && Math.hypot(element.__data__.x - x, element.__data__.y - y) > 5;
  }, { x: beforeDrag.x, y: beforeDrag.y });
  await page.waitForFunction(() =>
    document.getElementById("layout-authoring-draft-state").textContent.includes("saved")
  );

  const afterDrag = await term.evaluate(element => ({
    x: element.__data__.x,
    y: element.__data__.y
  }));
  assert.ok(
    Math.hypot(afterDrag.x - beforeDrag.x, afterDrag.y - beforeDrag.y) > 5,
    "literal author drag did not move the node"
  );
  await page.waitForTimeout(150);
  const afterWait = await term.evaluate(element => ({
    x: element.__data__.x,
    y: element.__data__.y
  }));
  assert.ok(
    Math.hypot(afterWait.x - afterDrag.x, afterWait.y - afterDrag.y) < 1,
    "force simulation moved a node after an authoring drag"
  );

  const storedDraft = await page.evaluate(() => {
    const key = Object.keys(localStorage)
      .find(candidate => candidate.startsWith("ccStarLayoutDraft:v1:fundamental-forces:"));
    return key ? localStorage.getItem(key) : null;
  });
  assert.ok(storedDraft, "author drag did not persist a local draft");

  const exportState = await page.evaluate(() => ({
    disabled: document.getElementById("layout-authoring-export").disabled,
    metrics: window.CC.state.getStarLayoutMetrics()
  }));
  assert.equal(
    exportState.disabled,
    false,
    `author drag made the layout unsafe to export: ${JSON.stringify(exportState.metrics)}`
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#layout-authoring-export")
  ]);
  const downloadPath = await download.path();
  const exported = JSON.parse(await readFile(downloadPath, "utf8"));
  assert.equal(exported.puzzleId, "fundamental-forces");
  assert.equal(exported.metrics.lineCrossings, 0);
  assert.equal(exported.metrics.overlaps, 0);
  await importStarLayout(downloadPath, { checkOnly: true });
  const importRoot = await mkdtemp(join(tmpdir(), "cc-star-layout-import-"));
  try {
    const imported = await importStarLayout(downloadPath, { repositoryRoot: importRoot });
    assert.ok(
      (await readFile(imported.outputPath, "utf8")).includes(exported.puzzleRevision),
      "importer did not write the validated layout"
    );
    assert.ok(
      (await readFile(join(importRoot, "puzzles/layouts/star/index.js"), "utf8"))
        .includes("fundamental-forces.js"),
      "importer did not regenerate the sparse registry"
    );
  } finally {
    await rm(importRoot, { recursive: true, force: true });
  }

  // The exported document is also representative of a committed sparse
  // override. Mutate the live module registry only for this test, reset the
  // puzzle, and verify that the ordinary second pass selects it.
  await page.evaluate(async layout => {
    const repository = await import("./modules/starLayoutRepository.js");
    repository.STAR_LAYOUTS[layout.puzzleId] = layout;
  }, exported);
  await page.click("#reset");
  await page.click("#layout-authoring-prepare");
  await page.waitForFunction(() =>
    window.CC.state.solutionLayout === "pretty" &&
    window.CC.state.prettyPrintStats?.source === "curated"
  );
  assert.equal(
    await page.evaluate(() => window.CC.state.prettyPrintStats.source),
    "curated"
  );

  // Preparing again must not overwrite a previously hand-edited draft.
  assert.equal(
    await page.evaluate(() => {
      const key = Object.keys(localStorage)
        .find(candidate => candidate.startsWith("ccStarLayoutDraft:v1:fundamental-forces:"));
      return key ? localStorage.getItem(key) : null;
    }),
    storedDraft
  );
  assert.equal(await page.isDisabled("#layout-authoring-load"), false);
  await page.click("#layout-authoring-load");
  await page.waitForFunction(() =>
    document.getElementById("layout-authoring-status").textContent === "Local draft loaded."
  );

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
