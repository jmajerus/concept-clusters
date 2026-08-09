// Star cold start is classic force by default. An admin-locked boolean
// opts a puzzle into Circle-style free-term strip packing (localStorage
// try, or sparse STAR_FREE_STRIP after import).
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importStarFreeStrip } from "../tools/import-star-free-strip.mjs";

export const name = "star layout: admin free-term strip flag is opt-in";

export async function run(page, baseURL) {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error));
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(`${baseURL}/index.html?puzzle=fundamental-forces&mode=star`);
  await page.waitForFunction(() =>
    window.CC?.state?.phase === "assembling" &&
    typeof window.CC.state.getStarFreeStripReport === "function"
  );
  const classic = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(classic.useFreeStrip, false, "default cold start should not use the strip");
  assert.ok(classic.freeCount > 0);

  await page.goto(
    `${baseURL}/index.html?puzzle=fundamental-forces&admin&mode=star`
  );
  await page.waitForFunction(() =>
    document.getElementById("admin-layout-actions") &&
    !document.getElementById("admin-layout-actions").hidden
  );
  await page.evaluate(() => localStorage.removeItem("ccStarFreeStripOverrides"));
  // Matching the empty registry: no export until the local try differs.
  assert.equal(await page.isHidden("#star-free-strip-export-btn"), true);

  await page.click("#star-free-strip-btn");
  await page.waitForURL(/admin/);
  await page.waitForFunction(() =>
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === true
  );
  const stripped = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(stripped.useFreeStrip, true);
  assert.equal(stripped.freeStripActive, true);
  assert.ok(stripped.stripHeight > 20);
  assert.equal(await page.isHidden("#star-free-strip-export-btn"), false);
  assert.equal(
    await page.textContent("#star-free-strip-export-btn"),
    "Export strip flag"
  );

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#star-free-strip-export-btn")
  ]);
  const downloadPath = await download.path();
  const exported = JSON.parse(await readFile(downloadPath, "utf8"));
  assert.equal(exported.kind, "star-free-strip");
  assert.equal(exported.puzzleId, "fundamental-forces");
  assert.equal(exported.freeStrip, true);

  // Simulate a registry-locked puzzle, then clear locally: export must
  // carry freeStrip: false so import can remove the sparse entry. Stay on
  // this page so the in-memory STAR_FREE_STRIP mutation survives.
  await page.evaluate(async () => {
    const repository = await import("./modules/starLayoutRepository.js");
    repository.STAR_FREE_STRIP["fundamental-forces"] = true;
    localStorage.setItem(
      "ccStarFreeStripOverrides",
      JSON.stringify({ "fundamental-forces": false })
    );
    window.__ccSyncStarFreeStripButtons();
  });
  assert.equal(await page.isHidden("#star-free-strip-export-btn"), false);
  assert.equal(
    await page.textContent("#star-free-strip-export-btn"),
    "Export clear-strip flag"
  );
  const [clearDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#star-free-strip-export-btn")
  ]);
  const clearPath = await clearDownload.path();
  const clearDoc = JSON.parse(await readFile(clearPath, "utf8"));
  assert.equal(clearDoc.freeStrip, false);

  const tmp = await mkdtemp(join(tmpdir(), "cc-star-free-strip-"));
  try {
    const flagPath = join(tmp, "flag.json");
    await writeFile(flagPath, JSON.stringify(exported));
    const checked = await importStarFreeStrip(flagPath, { checkOnly: true });
    assert.equal(checked.doc.freeStrip, true);
    const clearFlagPath = join(tmp, "clear.json");
    await writeFile(clearFlagPath, JSON.stringify(clearDoc));
    const cleared = await importStarFreeStrip(clearFlagPath, { checkOnly: true });
    assert.equal(cleared.doc.freeStrip, false);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  assert.deepEqual(
    pageErrors,
    [],
    `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`
  );
}
