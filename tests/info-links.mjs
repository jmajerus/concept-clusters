import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { normalizeInfo } from "../modules/termInfo.js";

export const name = "info links: primary, see also, and legacy compatibility";

async function waitForPuzzle(page, id) {
  await page.waitForFunction(expected =>
    window.CC?.state?.puzzle?.id === expected &&
    !document.querySelector("#puzzle-view")?.classList.contains("hidden"),
  id);
}

export async function run(page, baseURL) {
  const legacy = normalizeInfo({
    text: "Legacy shape",
    link: "wiki:Business ethics",
    extraLink: "wiki:Professional ethics"
  });
  assert.equal(legacy.link.includes("Business_ethics"), true);
  assert.equal(legacy.extraLink.includes("Professional_ethics"), true);
  assert.deepEqual(legacy.seeAlso, [
    {
      href: "https://en.wikipedia.org/wiki/Professional_ethics",
      label: null
    }
  ]);

  const normalized = normalizeInfo({
    link: "https://example.com/primary",
    linkLabel: "Primary source",
    extraLink: "https://example.com/legacy",
    seeAlso: [
      { href: "https://example.com/labeled", label: "Labeled source" },
      "wiki:Business ethics",
      "https://example.com/primary",
      "https://example.com/legacy"
    ]
  });
  assert.equal(normalized.linkLabel, "Primary source");
  assert.deepEqual(normalized.seeAlso, [
    { href: "https://example.com/legacy", label: null },
    { href: "https://example.com/labeled", label: "Labeled source" },
    { href: "https://en.wikipedia.org/wiki/Business_ethics", label: null }
  ]);

  const puzzle = PUZZLES.find(candidate =>
    candidate.id === "restoring-honest-choice"
  );
  assert.ok(puzzle);
  assert.equal(puzzle.info.linkLabel, "ACM Code of Ethics");
  assert.equal(puzzle.info.seeAlso.length, 3);

  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(
    `${baseURL}/index.html?puzzle=restoring-honest-choice`
  );
  await waitForPuzzle(page, "restoring-honest-choice");

  const expectedLabels = [
    "ACM Code of Ethics ↗",
    "FTC negative-option rule ↗",
    "FTC enforcement ↗",
    "AACSB business-education standards ↗"
  ];
  assert.deepEqual(
    await page.locator("#puzzle-info a").allTextContents(),
    expectedLabels
  );
  assert.match(await page.locator("#puzzle-info").textContent(), /See also:/);

  await page.hover("#puzzle-title");
  await page.waitForFunction(() =>
    document.getElementById("term-info")?.classList.contains("visible")
  );
  assert.deepEqual(
    await page.locator("#term-info a").allTextContents(),
    expectedLabels
  );
  assert.match(await page.locator("#term-info").textContent(), /See also:/);

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
