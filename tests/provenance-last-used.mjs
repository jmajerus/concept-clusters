import assert from "node:assert/strict";
import { renderDraftPage } from "../modules/draftReviewPage.js";
import { PROVENANCE_LAST_USED_STORAGE_KEY } from "../modules/provenanceLastUsedElement.js";
import { CATEGORIES } from "../puzzles/categories.js";

export const name = "draft review page: provenance \"use last\" fills blank client fields on click only";

const draftWith = contributors => ({
  draftId: "review-fixture",
  puzzleId: "review-fixture",
  title: "Review Fixture",
  revision: 1,
  status: "draft",
  updatedAt: "2026-08-15T00:00:00.000Z",
  validation: null,
  document: {
    id: "review-fixture",
    title: "Review Fixture",
    category: "Science",
    clusters: [
      { id: "alpha", name: "Alpha", color: "teal", fact: "Alpha fact.", terms: ["a", "b", "c"], seeds: ["a", "b"] }
    ],
    bridges: [],
    provenance: { collaboration: "ai", contributors }
  }
});

export async function run(page, baseURL) {
  let html = "";
  // localStorage needs a real origin, so the rendered page is served from the
  // test server's; the working-copy POST lands on a blank page.
  await page.route("**/__provenance-fixture", route =>
    route.fulfill({ contentType: "text/html", body: html }));
  await page.route("**/admin/drafts/review-fixture", route =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html><p>saved</p>" }));
  const load = async contributors => {
    html = renderDraftPage(draftWith(contributors), {
      categoryRegistry: CATEGORIES,
      actor: { name: "Jane Doe" }
    });
    await page.goto(`${baseURL}/__provenance-fixture`);
  };
  const chip = row => page.locator(`${row} [data-provenance-use-last]`);
  const codexRow = '[data-provenance-row][data-host-key="codex"]';

  await load([{ name: "Codex" }]);
  await page.evaluate(key => localStorage.removeItem(key), PROVENANCE_LAST_USED_STORAGE_KEY);
  await page.reload();
  assert.equal(await chip(codexRow).isHidden(), true, "no memory, no button");

  const modelOptions = await page.$$eval(`${codexRow} [data-provenance-field="model"] option`,
    options => options.map(option => option.value).filter(Boolean));
  const [model, otherModel] = modelOptions;
  assert.ok(model && otherModel, "fixture needs two model suggestions");
  await page.selectOption(`${codexRow} [data-provenance-field="model"]`, model);
  await page.selectOption(`${codexRow} [data-provenance-field="reasoning"]`, "high");
  await Promise.all([
    page.waitForURL("**/admin/drafts/review-fixture"),
    page.click('button[type="submit"][form]:has-text("Save working copy")')
  ]);
  const memory = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), PROVENANCE_LAST_USED_STORAGE_KEY);
  assert.deepEqual(memory.codex, { model, reasoning: "high", switch: "" });

  // A fresh draft from the same client: blank until the button is clicked.
  await load([{ name: "Codex" }]);
  assert.equal(await page.inputValue(`${codexRow} [data-provenance-field="model"]`), "",
    "memory must never pre-select a value");
  assert.match(await chip(codexRow).textContent(), new RegExp(`use last: ${model.replace(/[.()]/g, "\\$&")} · High`));
  await chip(codexRow).click();
  assert.equal(await page.inputValue(`${codexRow} [data-provenance-field="model"]`), model);
  assert.equal(await page.inputValue(`${codexRow} [data-provenance-field="reasoning"]`), "high");
  assert.equal(await chip(codexRow).isHidden(), true, "nothing left to fill");

  // A model already on the row that differs from memory is a recorded fact;
  // no button offers to pair it with the other model's reasoning.
  await load([{ name: `Codex (${otherModel})` }]);
  assert.equal(await chip(codexRow).isHidden(), true);

  // Claude rows share one memory that carries the Claude Code tick, since the
  // MCP frame stamps every Claude surface as plain Claude.
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    claude: { model: "Claude Opus 5", reasoning: "high", switch: "", claudeCode: true }
  })), PROVENANCE_LAST_USED_STORAGE_KEY);
  await load([{ name: "Claude (Claude Opus 5)" }]);
  const claudeRow = '[data-provenance-row][data-host-key="claude"]:has([name$="claudeCodeHost"])';
  assert.match(await chip(claudeRow).textContent(), /use last: Claude Code · Claude Opus 5 · High/);
  await chip(claudeRow).click();
  assert.equal(await page.isChecked(`${claudeRow} [data-provenance-field="claudeCode"]`), true);
  assert.equal(await page.inputValue(`${claudeRow} [data-provenance-field="reasoning"]`), "high");

  // Ticking Claude Code alone on a credited row is an edit worth
  // remembering; the same tick on the "another Claude model" row adds
  // nothing without a model, so it records nothing.
  await page.evaluate(key => localStorage.removeItem(key), PROVENANCE_LAST_USED_STORAGE_KEY);
  await load([{ name: "Claude" }]);
  await page.check(`${claudeRow} [data-provenance-field="claudeCode"]`);
  await Promise.all([
    page.waitForURL("**/admin/drafts/review-fixture"),
    page.click('button[type="submit"][form]:has-text("Save working copy")')
  ]);
  const tickOnly = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), PROVENANCE_LAST_USED_STORAGE_KEY);
  assert.deepEqual(tickOnly.claude, { model: "", reasoning: "", switch: "", claudeCode: true });

  await page.evaluate(key => localStorage.removeItem(key), PROVENANCE_LAST_USED_STORAGE_KEY);
  await load([{ name: "Claude (Claude Opus 5)" }]);
  await page.check('[data-provenance-add] [data-provenance-field="claudeCode"]');
  await Promise.all([
    page.waitForURL("**/admin/drafts/review-fixture"),
    page.click('button[type="submit"][form]:has-text("Save working copy")')
  ]);
  const addRowTick = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), PROVENANCE_LAST_USED_STORAGE_KEY);
  assert.equal(addRowTick.claude.claudeCode, false, "the credited row's untouched box, not the add row's tick");
}
