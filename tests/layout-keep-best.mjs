import assert from "node:assert/strict";

export const name = "layout time limit: the extended search keeps its best, the live search gives up";

// The extended search (the automatic layout pass) stops at its time limit
// with the best layout found so far, while the live search still leaves the
// board unpolished. A tiny limit makes both stop after the first candidate
// or two.
async function polishUnder(page, baseURL, mode, budget) {
  await page.goto(`${baseURL}/index.html?puzzle=energy-flow&mode=${mode}&moves=`);
  await page.waitForFunction(() => window.CC?.state?.layoutAdapter && window.CC.state.need > 0);
  return page.evaluate(async budget => {
    const state = window.CC.state;
    state.layoutBudget = budget;
    state.layoutTimeLimitMs = 30;
    await window.CC.showSolution();
    // Star polishes after its detangle animation.
    const deadline = Date.now() + 45000;
    while (state.solutionLayout !== "pretty" && !state.polishTimedOut && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return {
      solutionLayout: state.solutionLayout,
      timedOut: state.polishTimedOut === true,
      stoppedEarlyMs: state.layoutSource?.stoppedEarlyMs ?? null
    };
  }, budget);
}

export async function run(page, baseURL) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const mode of ["graph", "sets", "star"]) {
    const extended = await polishUnder(page, baseURL, mode, "extended");
    assert.deepEqual(extended, { solutionLayout: "pretty", timedOut: false, stoppedEarlyMs: 30 },
      `${mode}: the extended search did not keep its best`);
    const live = await polishUnder(page, baseURL, mode, "standard");
    assert.equal(live.timedOut, true, `${mode}: the live search did not give up`);
    assert.notEqual(live.solutionLayout, "pretty");
  }
}
