import assert from "node:assert/strict";

export const name = "Table authoring inspection and lens cues, traces, cancellation, and reduced motion";
export const viewport = { width: 1400, height: 1400 };
const term = (page, word) => page.locator(`.table-row[data-term=${JSON.stringify(word)}] .table-term`);
const fixture = {
  id: "table-lens-effects", title: "Table lens effects", category: "Science",
  board: { lensRevealCue: "both", lensFlowTrace: true },
  clusters: ["teal", "blue", "orange"].map((color, ci) => ({
    name: `Cluster ${ci}`, color, fact: "Cluster complete.",
    terms: [`${ci} one`, `${ci} two`, `${ci} endpoint`], seeds: [`${ci} one`, `${ci} two`]
  })),
  bridges: [
    { term: "relay", clusters: [0, 1], idealTerms: ["0 endpoint", "1 endpoint"],
      direction: { kind: "through", from: 0, to: 1 }, fact: "Through flow." },
    { term: "fan", clusters: [0, 1, 2], idealTerms: ["0 endpoint", "1 endpoint", "2 endpoint"],
      direction: { kind: "outward" }, fact: "Outward flow." },
    { term: "gather", clusters: [0, 1, 2], idealTerms: ["0 endpoint", "1 endpoint", "2 endpoint"],
      direction: { kind: "inward" }, fact: "Inward flow." },
    { term: "neutral", clusters: [0, 2], idealTerms: ["0 endpoint", "2 endpoint"], fact: "An undirected relationship." }
  ],
  lenses: [
    { id: "flow", prompt: "Find these connections.", targets: ["relay", "fan", "neutral", "0 one"],
      explanation: "These connections carry the relationship.", reasons: { relay: "A through connection." } },
    { id: "inward", prompt: "Find the inward connection.", targets: ["gather"], explanation: "The endpoints converge." }
  ]
};

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&author=layout&mode=table&moves=`);
  await page.waitForFunction(() => window.CC?.state?.tableLensEffects);
  assert.equal(await page.evaluate(() => CC.mode), "table", "authoring links retain the Table mode");
  assert.equal(await page.locator("#mode-table").isVisible(), true);
  assert.equal(await page.locator("#layout-authoring-prepare").isHidden(), true);
  assert.equal(await page.locator("#layout-authoring-save-layout").isHidden(), true);
  assert.equal(await page.locator("#board-settings").isHidden(), true);
  assert.equal(await page.evaluate(() => typeof CC.state.layoutAdapter.capture), "undefined");
  await page.evaluate(candidate => CC.openPuzzle(CC.registerPuzzle(candidate)), fixture);
  await page.waitForFunction(() => CC.state.puzzle.id === "table-lens-effects");
  await page.locator("#table-separate-completed").check();
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-selecting");
  assert.equal(await page.locator("#lens-reveal-controls").isVisible(), true);

  // A natural reveal runs the configured cue, then the trace; repeated
  // bridge labels receive the same effects without changing the answer.
  await term(page, "0 one").click();
  await page.click("#lens-check");
  await page.locator(".table-lens-cue-answer").first().waitFor();
  assert.equal(await term(page, "relay").evaluateAll(elements => elements.every(el => el.classList.contains("table-lens-cue-answer"))), true);
  assert.ok(await page.locator(".table-lens-cue-dimmed").count() > 0);
  assert.match(await term(page, "0 one").locator("../..").getAttribute("class"), /lens-correct/);
  await page.locator(".table-lens-trace-active").first().waitFor();
  assert.equal(await page.locator(".table-lens-cue-dimmed").count(), 0, "the cue finishes before the trace begins");
  await page.waitForFunction(() => [...document.querySelectorAll('.table-row[data-term="relay"] .table-term')]
    .every(el => el.classList.contains("table-lens-trace-sweep")));
  assert.equal(await term(page, "relay").count(), 2);
  assert.equal(await term(page, "fan").count(), 3);
  assert.equal(await term(page, "neutral").evaluateAll(elements => elements.every(el =>
    el.classList.contains("table-lens-trace-active") && !el.classList.contains("table-lens-trace-sweep"))), true);
  const moves = await page.evaluate(() => JSON.stringify(CC.state.moveHistory));
  await page.click("#lens-next");
  await page.waitForTimeout(900);
  assert.equal(await page.locator('[class*="table-lens-"]').count(), 0, "the next lens cancels pending timers and effects");

  // Explicit previews are available without a writable layout and do not
  // save settings, coordinates, or answers.
  await page.selectOption("#lens-reveal-try-cue", "ripple");
  await page.click("#lens-reveal-try-btn");
  await page.locator(".table-lens-cue-answer").first().waitFor();
  assert.equal(await page.locator(".table-lens-cue-dimmed").count(), 0);
  await page.selectOption("#lens-reveal-try-cue", "spotlight");
  await page.click("#lens-reveal-try-btn");
  await page.locator(".table-lens-cue-dimmed").first().waitFor();
  assert.equal(await page.evaluate(() => JSON.stringify(CC.state.moveHistory)), moves);
  assert.equal(await page.evaluate(() => CC.state.phase), "lens-selecting");
  await page.click("#lens-flow-trace-try-btn");
  await page.locator(".table-lens-trace-active").first().waitFor();
  assert.equal(await page.locator(".table-lens-cue-dimmed").count(), 0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.click("#lens-flow-trace-try-btn");
  assert.ok(await page.locator(".table-lens-trace-still").count() > 0);
  assert.equal(await page.locator("#table-board").evaluate(el => el.getAnimations({ subtree: true }).length), 0);
  await page.click("#lens-reveal-try-btn");
  await page.locator(".table-lens-cue-answer").first().waitFor();
  assert.equal(await page.locator("#table-board").evaluate(el => el.getAnimations({ subtree: true }).length), 0);
  await page.evaluate(() => CC.state.tableLensEffects.clear());
  await page.click("#lens-check");
  assert.equal(await page.locator(".table-lens-cue-answer").count(), 0, "reduced motion suppresses the automatic reveal cue");
  assert.ok(await page.locator(".table-lens-trace-still").count() > 0);

  // Cancelling a cue during a mode switch must not fire its continuation.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    window.cancelledCueFinished = false;
    CC.state.tableLensEffects.reveal({ cue: "both", targets: [{ word: "relay", rounds: 2 }],
      onDone: () => { window.cancelledCueFinished = true; } });
  });
  await page.locator(".table-lens-cue-answer").first().waitFor();
  await page.click("#mode-star");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  assert.equal(await page.locator("#layout-authoring-prepare").isVisible(), true);
  assert.equal(await page.evaluate(() => CC.state.tableLensEffects), undefined);
  await page.waitForTimeout(1600);
  assert.equal(await page.evaluate(() => window.cancelledCueFinished), false);
  await page.click("#mode-table");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  await page.locator(".table-lens-cue-answer").first().waitFor();
  assert.equal(await page.evaluate(() => JSON.stringify(CC.state.moveHistory)), moves);
  assert.deepEqual(errors, []);
}
