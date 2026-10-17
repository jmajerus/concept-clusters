import assert from "node:assert/strict";
import { renderDraftListPage } from "../modules/draftReviewPage.js";

export const name = "puzzle list: Layout work shows unfinished automatic passes in a Pending section";

const sound = {
  schemaVersion: 1,
  modes: { graph: { nodes: {} }, star: { nodes: {} }, sets: { nodes: {} } }
};
const row = (id, updatedAt, autoLayout) => ({
  id,
  draftId: id,
  title: id,
  category: "Science",
  hasWorkingCopy: true,
  updatedAt,
  savedLayout: sound,
  autoLayout
});

export async function run(page, baseURL) {
  const html = renderDraftListPage([
    row("older-pending", "2026-10-17T10:00:00.000Z", { state: "pending", expectedAt: "2026-10-17T10:05:00.000Z" }),
    row("ready", "2026-10-17T11:00:00.000Z", { state: "done", at: "2026-10-17T11:00:00.000Z" }),
    row("newer-running", "2026-10-17T12:00:00.000Z", { state: "running", since: "2026-10-17T12:00:00.000Z" }),
    row("untouched", "2026-10-17T09:00:00.000Z", null)
  ], { variant: "local" });
  await page.route("**/__layout-work-fixture", route => route.fulfill({ contentType: "text/html", body: html }));
  await page.goto(`${baseURL}/__layout-work-fixture`);

  const pendingIds = arrangement => page.evaluate(arrangement =>
    [...document.querySelectorAll(`#${arrangement} [data-pending-section] tr[data-puzzle-id]`)]
      .map(row => row.getAttribute("data-puzzle-id")), arrangement);
  const sectionShown = arrangement => page.evaluate(arrangement =>
    !document.querySelector(`#${arrangement} [data-pending-section]`).hidden, arrangement);

  // Under All, nothing moves and the section stays out of sight.
  assert.deepEqual(await pendingIds("corpus-by-recent"), []);
  assert.equal(await sectionShown("corpus-by-recent"), false);

  // Layout work: unfinished passes in Pending, newest first; the ready one
  // stays in the main list, the untouched one is filtered out.
  await page.check('input[name=puzzle-corpus-scope][value="layouts"]');
  assert.deepEqual(await pendingIds("corpus-by-recent"), ["newer-running", "older-pending"]);
  assert.equal(await sectionShown("corpus-by-recent"), true);
  assert.equal(await page.textContent("#corpus-by-recent [data-pending-count]"), "2 puzzles");
  assert.equal(await page.isVisible('#corpus-by-recent .corpus-group:not([data-pending-section]) tr[data-puzzle-id="ready"]'), true);
  assert.equal(await page.isVisible('#corpus-by-recent tr[data-puzzle-id="untouched"]'), false);
  assert.equal(await page.textContent("#corpus-by-recent .corpus-group:not([data-pending-section]) > p.meta"), "1 puzzle",
    "a group's count follows what it shows");

  // The Category arrangement has its own section with the same rows.
  await page.check('input[name=puzzle-corpus-arrange][value="category"]');
  assert.deepEqual(await pendingIds("corpus-by-category"), ["newer-running", "older-pending"]);
  assert.equal(await sectionShown("corpus-by-category"), true);

  // Another filter puts every row back in its own place.
  await page.check('input[name=puzzle-corpus-arrange][value="recent"]');
  await page.check('input[name=puzzle-corpus-scope][value="all"]');
  assert.deepEqual(await pendingIds("corpus-by-recent"), []);
  assert.equal(await sectionShown("corpus-by-recent"), false);
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("#corpus-by-recent .corpus-group:not([data-pending-section]) tr[data-puzzle-id]")]
      .map(row => row.getAttribute("data-puzzle-id")));
  assert.deepEqual(order, ["newer-running", "ready", "older-pending", "untouched"]);
}
