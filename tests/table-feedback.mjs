import assert from "node:assert/strict";
import { loadPlayerSession, playerSessionKey, savePlayerSession } from "../modules/playerSessionStore.js";

export const name = "table feedback: brief rejection color, optional remembered choices, and session compatibility";
export const viewport = { width: 1100, height: 900 };

const row = (page, word) => page.locator(`.table-row[data-term=${JSON.stringify(word)}]`);
const input = (page, word, ci) => row(page, word).locator(`input[data-cluster="${ci}"]`);
const cell = (page, word, ci) => input(page, word, ci).locator("../..");
const mark = (page, word, ci) => cell(page, word, ci).locator(".table-wrong-mark");

function checkSessionCompatibility() {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const puzzle = { id: "feedback-session", clusters: [
    { name: "A", terms: ["a", "b"] }, { name: "B", terms: ["c", "d"] }
  ], bridges: [{ term: "shared", clusters: [0, 1] }] };
  const moves = [{ source: "a", target: "b" }];
  assert.equal(savePlayerSession(storage, puzzle, { currentMode: "table", moves, tableFeedback: {
    rememberWrongChoices: true,
    wrongChoices: [
      { term: "a", clusterIndex: 1 }, { term: "a", clusterIndex: 1 },
      { term: "a", clusterIndex: 0 }, { term: "missing", clusterIndex: 1 },
      { term: "shared", clusterIndex: 0 }, { term: "c", clusterIndex: 8 }, null
    ]
  } }), true);
  assert.deepEqual(loadPlayerSession(storage, puzzle).tableFeedback, {
    rememberWrongChoices: true, wrongChoices: [{ term: "a", clusterIndex: 1 }]
  });
  const key = playerSessionKey(puzzle);
  const session = JSON.parse(storage.getItem(key));
  delete session.tableFeedback;
  storage.setItem(key, JSON.stringify(session));
  assert.deepEqual(loadPlayerSession(storage, puzzle).tableFeedback, { rememberWrongChoices: false, wrongChoices: [] });
  assert.deepEqual(loadPlayerSession(storage, puzzle).moves, moves, "old sessions retain progress");
  session.tableFeedback = { rememberWrongChoices: "yes", wrongChoices: [null, { term: "a", clusterIndex: -1 }] };
  storage.setItem(key, JSON.stringify(session));
  assert.deepEqual(loadPlayerSession(storage, puzzle).tableFeedback, { rememberWrongChoices: false, wrongChoices: [] });
  assert.deepEqual(loadPlayerSession(storage, puzzle).moves, moves, "bad optional feedback must not discard progress");
}

export async function run(page, baseURL) {
  checkSessionCompatibility();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=table&moves=`);
  await page.waitForFunction(() => window.CC?.state);
  if (await page.evaluate(() => CC.state.learningGated)) await page.locator("#learning-introduction #skip").click();
  const remember = page.getByRole("checkbox", { name: "Remember incorrect choices", exact: true });
  assert.equal(await remember.isChecked(), false);
  await input(page, "carbon dioxide", 1).click();
  assert.match(await cell(page, "carbon dioxide", 1).getAttribute("class"), /table-cell-incorrect/);
  const color = await cell(page, "carbon dioxide", 1).evaluate(el => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--error-bg)";
    document.body.append(probe);
    const expected = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return { actual: getComputedStyle(el).backgroundColor, expected };
  });
  assert.equal(color.actual, color.expected, "wrong cells use the same error background as lens feedback");
  assert.equal(await input(page, "carbon dioxide", 1).isChecked(), false);
  assert.match(await page.locator("#message").textContent(), /think about what those terms share/);
  await page.waitForFunction(() => !document.querySelector(".table-cell-incorrect"));
  assert.equal(await mark(page, "carbon dioxide", 1).isHidden(), true);
  assert.equal(await page.evaluate(() => CC.state.tableFeedback.wrongChoices.length), 0);

  await remember.check();
  await input(page, "carbon dioxide", 1).press("Space");
  await mark(page, "carbon dioxide", 1).waitFor({ state: "visible" });
  assert.equal(await input(page, "carbon dioxide", 1).isChecked(), false, "gray × does not mean checked or mixed");
  const noteId = await input(page, "carbon dioxide", 1).getAttribute("aria-describedby");
  assert.match(await page.locator(`[id=${JSON.stringify(noteId)}]`).textContent(), /Previously tried/);
  await input(page, "carbon dioxide", 1).click();
  await mark(page, "carbon dioxide", 1).waitFor({ state: "visible" });
  assert.equal(await page.evaluate(() => CC.state.tableFeedback.wrongChoices.length), 1, "repeated wrong choices do not duplicate markers");
  await remember.uncheck();
  assert.equal(await mark(page, "carbon dioxide", 1).isHidden(), true);
  await input(page, "carbon dioxide", 2).click();
  await page.waitForFunction(() => !document.querySelector(".table-cell-incorrect"));
  assert.equal(await page.evaluate(() => CC.state.tableFeedback.wrongChoices.length), 1,
    "turning remembering off stops recording new choices");
  await remember.check();
  assert.equal(await mark(page, "carbon dioxide", 1).isVisible(), true);
  assert.equal(await mark(page, "carbon dioxide", 2).isHidden(), true);
  await input(page, "carbon dioxide", 0).click();
  assert.equal(await input(page, "carbon dioxide", 0).isChecked(), true);
  assert.equal(await mark(page, "carbon dioxide", 1).isVisible(), true);
  const incorrectBefore = await page.evaluate(() => CC.state.incorrectMoveCount);
  await input(page, "carbon dioxide", 0).click();
  await input(page, "carbon dioxide", 2).click();
  assert.equal(await page.evaluate(() => CC.state.incorrectMoveCount), incorrectBefore, "read-only cells are not wrong attempts");
  assert.match(await cell(page, "carbon dioxide", 2).getAttribute("class"), /table-cell-incorrect/,
    "blocked empty cells still acknowledge a rejected placement");
  assert.match(await cell(page, "carbon dioxide", 0).getAttribute("class"), /table-cell-connected-pulse/);
  assert.doesNotMatch(await cell(page, "carbon dioxide", 0).getAttribute("class"), /table-cell-incorrect/,
    "existing correct checks use their cluster color rather than red");
  assert.equal(await input(page, "carbon dioxide", 0).isChecked(), true);
  assert.equal(await page.evaluate(() => CC.state.tableFeedback.wrongChoices.length), 1,
    "blocked placements do not add remembered wrong choices");
  await input(page, "oxygen", 2).click();
  await page.click("#mode-graph");
  await page.click("#mode-table");
  assert.equal(await mark(page, "oxygen", 2).isVisible(), true, "mode switching preserves remembered choices and clears transient color");
  assert.equal(await page.locator(".table-cell-incorrect").count(), 0);

  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=table`);
  await page.waitForFunction(() => window.CC?.state?.made === 1);
  assert.equal(await remember.isChecked(), true, "per-puzzle preference survives reload");
  assert.equal(await mark(page, "oxygen", 2).isVisible(), true);
  assert.equal(await input(page, "carbon dioxide", 0).isChecked(), true);
  assert.equal(await page.locator(".table-cell-incorrect").count(), 0, "transient rejection color is not replayed");
  await page.locator("#table-cluster-0 button").click({ button: "right" });
  await page.locator(".cluster-menu").getByRole("menuitem", { name: "Reset cluster", exact: true }).click();
  assert.equal(await page.evaluate(() => CC.state.made), 0);
  assert.equal(await remember.isChecked(), true);
  assert.equal(await mark(page, "oxygen", 2).isVisible(), true, "resetting a cluster preserves remembered notes");
  await input(page, "carbon dioxide", 0).click();
  await page.click("#show-solution");
  await page.click("#table-group-clusters");
  assert.equal(await row(page, "oxygen").count(), 2);
  assert.deepEqual(await mark(page, "oxygen", 2).evaluateAll(marks => marks.map(el => el.hidden)), [false, false]);
  assert.deepEqual(await input(page, "oxygen", 2).evaluateAll(inputs => inputs.map(el => el.checked)), [false, false]);
  const notes = await page.evaluate(() => JSON.stringify(CC.state.tableFeedback.wrongChoices));
  await input(page, "glucose", 2).first().click();
  assert.deepEqual(await cell(page, "glucose", 2).evaluateAll(cells => cells.map(el => el.classList.contains("table-cell-incorrect"))), [true, true]);
  assert.equal(await page.evaluate(() => JSON.stringify(CC.state.tableFeedback.wrongChoices)), notes);
  await page.waitForFunction(() => !document.querySelector(".table-cell-incorrect"));
  assert.deepEqual(await mark(page, "glucose", 2).evaluateAll(marks => marks.map(el => el.hidden)), [true, true]);
  await input(page, "glucose", 0).first().click();
  assert.deepEqual(await cell(page, "glucose", 0).evaluateAll(cells => cells.map(el => el.classList.contains("table-cell-connected-pulse"))), [true, true]);
  assert.deepEqual(await input(page, "glucose", 0).evaluateAll(inputs => inputs.map(el => el.checked)), [true, true]);

  await page.click("#reset");
  await page.waitForFunction(() => CC.state.made === 0 && CC.state.phase === "assembling");
  assert.equal(await page.evaluate(() => CC.state.tableFeedback.wrongChoices.length), 0);
  assert.equal(await remember.isChecked(), false);
  await remember.check();
  assert.equal(await page.locator(".table-wrong-mark:not([hidden])").count(), 0, "Start over clears rather than only hides markers");
  assert.deepEqual(errors, []);
}
