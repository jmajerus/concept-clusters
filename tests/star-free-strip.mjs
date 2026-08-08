// Star cold start is classic force by default. An admin-locked boolean
// opts a puzzle into Circle-style free-term strip packing (localStorage
// try, or sparse STAR_FREE_STRIP after import).
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
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
  await page.click("#star-free-strip-btn");
  await page.waitForURL(/admin/);
  await page.waitForFunction(() =>
    window.CC?.state?.getStarFreeStripReport?.().useFreeStrip === true
  );
  const stripped = await page.evaluate(() => window.CC.state.getStarFreeStripReport());
  assert.equal(stripped.useFreeStrip, true);
  assert.equal(stripped.freeStripActive, true);
  assert.ok(stripped.stripHeight > 20);

  const tmp = await mkdtemp(join(tmpdir(), "cc-star-free-strip-"));
  try {
    const flagPath = join(tmp, "flag.json");
    await writeFile(flagPath, JSON.stringify({
      schemaVersion: 1,
      kind: "star-free-strip",
      puzzleId: "fundamental-forces",
      freeStrip: true
    }));
    const checked = await importStarFreeStrip(flagPath, { checkOnly: true });
    assert.equal(checked.doc.freeStrip, true);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  assert.deepEqual(
    pageErrors,
    [],
    `page exceptions: ${pageErrors.map(error => error.message).join("; ")}`
  );
}
