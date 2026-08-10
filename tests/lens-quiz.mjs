import assert from "node:assert/strict";

export const name = "lens quiz: multiple-choice reveal, comparative highlighting, and persistence";
export const tier = "extended";

const PUZZLE_ID = "film-classics";

function nodeClass(page, word) {
  return page.locator("#board .node").evaluateAll((nodes, targetWord) =>
    nodes.find(element => element.__data__?.word === targetWord)?.getAttribute("class"),
  word);
}

function nodeAriaLabel(page, word) {
  return page.locator("#board .node").evaluateAll((nodes, targetWord) =>
    nodes.find(element => element.__data__?.word === targetWord)?.getAttribute("aria-label"),
  word);
}

async function hoverNode(page, word) {
  await page.locator("#board .node").evaluateAll((nodes, targetWord) => {
    nodes.find(element => element.__data__?.word === targetWord)
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  }, word);
}

async function answerAndCheck(page, optionText) {
  const options = page.locator("#lens-quiz-options .lens-quiz-option");
  await options.filter({ hasText: optionText }).click();
  assert.equal(await page.isDisabled("#lens-check"), false);
  await page.click("#lens-check");
  await page.waitForFunction(() => CC.state.phase === "lens-revealed");
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph&moves=`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // film-classics is authored with preSolve: true, so a fresh load with no
  // saved session lands directly in the quiz round -- no #show-solution
  // click at all, unlike every other lens-mode test in this suite.
  await page.waitForFunction(() => CC.state.phase === "lens-quiz-answering");
  // Eight non-seed films plus one binary bridge (Howard Hawks) require ten
  // links -- down from twelve before the Warner Bros. bridge was dropped
  // (see git history). The Musical cluster intentionally remains a
  // separate graph component.
  assert.deepEqual(await page.evaluate(() => [CC.state.made, CC.state.need]), [10, 10]);
  assert.equal(await page.evaluate(() => CC.state.lensMode), "quiz");
  assert.equal(await page.textContent("#lens-progress"), "Lens 1 of 3");
  assert.equal(
    await page.textContent("#lens-prompt"),
    "Which of the following directors did not direct any film shown above?"
  );
  assert.equal(await page.isDisabled("#lens-check"), true);
  assert.equal(await page.textContent("#lens-check"), "Check answer");

  // Lens 1: a wrong pick, and the "odd one out" pattern -- the correct
  // option (Arzner) has an empty targets array, so nothing on the board
  // gets the solid-correct highlight at all, only the three real directors'
  // films get the dotted incorrect one.
  const options = page.locator("#lens-quiz-options .lens-quiz-option");
  // The renderer deterministically permutes authored options. The correct
  // answer is authored fourth for this question, but content position does
  // not control display position; the permutation remains stable on reload.
  const displayedOptions = [
    "Dorothy Arzner", "John Ford", "Howard Hawks", "Billy Wilder"
  ];
  assert.deepEqual(await options.allTextContents(), displayedOptions);
  await answerAndCheck(page, "Howard Hawks");
  assert.equal(await page.textContent("#lens-result"), "Not quite — the correct answer was Dorothy Arzner.");
  assert.match(await page.textContent("#lens-explanation"), /Dorothy Arzner, the most prominent woman directing/);
  assert.match(
    await options.filter({ hasText: "Dorothy Arzner" }).getAttribute("class"),
    /\bcorrect\b/
  );
  const hawksClass = await options.filter({ hasText: "Howard Hawks" }).getAttribute("class");
  assert.match(hawksClass, /\bincorrect\b/);
  assert.match(hawksClass, /\bselected\b/);
  assert.match(await nodeClass(page, "Ball of Fire"), /\blens-quiz-incorrect\b/);
  assert.match(await nodeClass(page, "Red River"), /\blens-quiz-incorrect\b/);
  assert.match(await nodeClass(page, "Stagecoach"), /\blens-quiz-incorrect\b/);
  assert.match(await nodeClass(page, "Double Indemnity"), /\blens-quiz-incorrect\b/);
  // Nothing is the correct option's evidence -- there's nothing to be.
  assert.doesNotMatch(await nodeClass(page, "The Maltese Falcon"), /\blens-correct\b/);
  assert.equal(await page.textContent("#lens-next"), "Next lens");

  await page.click("#lens-next");
  await page.waitForFunction(() => CC.state.phase === "lens-quiz-answering");
  assert.equal(await page.textContent("#lens-progress"), "Lens 2 of 3");
  assert.equal(
    await page.textContent("#lens-prompt"),
    "Which of the following actors appears in the most films from a single genre shown above?"
  );

  // Lens 2: answer correctly this time, for coverage variety.
  await answerAndCheck(page, "John Wayne");
  assert.equal(await page.textContent("#lens-result"), "Correct — John Wayne.");
  assert.match(await nodeClass(page, "Stagecoach"), /\blens-correct\b/);
  assert.match(await nodeClass(page, "Red River"), /\blens-correct\b/);
  assert.match(await nodeClass(page, "The Searchers"), /\blens-correct\b/);
  assert.match(await nodeClass(page, "Bringing Up Baby"), /\blens-quiz-incorrect\b/);
  assert.equal(await page.textContent("#lens-next"), "Next lens");

  await page.click("#lens-next");
  await page.waitForFunction(() => CC.state.phase === "lens-quiz-answering");
  assert.equal(await page.textContent("#lens-progress"), "Lens 3 of 3");
  assert.equal(
    await page.textContent("#lens-prompt"),
    "Which of the following actors appears in films from the most different genres shown above?"
  );

  // Lens 3: the same Wayne who just won "most in one genre" is a wrong
  // answer here -- most total appearances isn't the same question as most
  // genres spanned, and this puzzle deliberately asks both.
  await answerAndCheck(page, "John Wayne");
  assert.equal(await page.textContent("#lens-result"), "Not quite — the correct answer was Gary Cooper.");
  assert.match(await page.textContent("#lens-explanation"), /Gary Cooper starred in Ball of Fire/);
  assert.match(await nodeClass(page, "Ball of Fire"), /\blens-correct\b/);
  assert.match(await nodeClass(page, "High Noon"), /\blens-correct\b/);
  assert.match(await nodeClass(page, "Stagecoach"), /\blens-quiz-incorrect\b/);
  assert.match(await nodeClass(page, "Red River"), /\blens-quiz-incorrect\b/);
  assert.match(await nodeClass(page, "The Searchers"), /\blens-quiz-incorrect\b/);
  assert.match(await nodeClass(page, "Bringing Up Baby"), /\blens-quiz-incorrect\b/);
  // A cluster node untouched by any option keeps its ordinary solved class.
  assert.doesNotMatch(await nodeClass(page, "Sunset Boulevard"), /\blens-(correct|quiz-incorrect)\b/);
  assert.equal(await options.evaluateAll(buttons => buttons.every(b => b.disabled)), true);
  assert.equal(await page.textContent("#lens-next"), "Finish lenses");

  // With up to three different incorrect options sharing the identical
  // dotted style, nothing about the board alone says which option a given
  // dotted node is evidence for -- hovering (already unconditional, every
  // phase, every node) has to be the thing that answers that.
  assert.match(
    await nodeAriaLabel(page, "Ball of Fire"),
    /^Ball of Fire\. Evidence for Gary Cooper, the correct answer\.$/
  );
  assert.match(
    await nodeAriaLabel(page, "Stagecoach"),
    /^Stagecoach\. Evidence for John Wayne, not the correct answer\.$/
  );
  await hoverNode(page, "Stagecoach");
  assert.match(
    await page.textContent("#term-info"),
    /^Evidence for John Wayne, not the correct answer\. Stagecoach/
  );
  await hoverNode(page, "Sunset Boulevard");
  assert.doesNotMatch(await page.textContent("#term-info"), /Evidence for/);

  await page.click("#lens-next");
  await page.waitForFunction(() => CC.state.phase === "complete");
  assert.match(
    await page.textContent("#lens-prompt"),
    /You completed the map and examined it through 3 cross-cutting lenses/
  );

  // Finishing the sequence clears the round's own selection, same as
  // sequential lenses clear lensSelections -- the "complete" phase shows a
  // generic summary, not the last round's specific result.
  const saved = await page.evaluate(id =>
    JSON.parse(localStorage.getItem(`ccPlayerSession:v1:${id}`)),
  PUZZLE_ID);
  assert.equal(saved.completed, true);
  assert.equal(saved.lens.phase, "complete");
  assert.equal(saved.lens.selection, null);

  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=sets`);
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.match(
    await page.textContent("#lens-prompt"),
    /You completed the map and examined it through 3 cross-cutting lenses/
  );

  // Mid-answer restore: reload before checking, confirm the phase and
  // selection round-trip rather than silently resetting to a fresh round.
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph&moves=`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => CC.state.phase === "lens-quiz-answering");
  assert.deepEqual(await options.allTextContents(), displayedOptions);
  await page.locator("#lens-quiz-options .lens-quiz-option")
    .filter({ hasText: "Dorothy Arzner" }).click();
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph`);
  assert.equal(await page.evaluate(() => CC.state.phase), "lens-quiz-answering");
  assert.equal(await page.evaluate(() => CC.state.lensQuizSelection), "dorothy-arzner");
  assert.equal(await page.isDisabled("#lens-check"), false);
  await page.click("#lens-check");
  await page.waitForFunction(() => CC.state.phase === "lens-revealed");
  assert.equal(await page.textContent("#lens-result"), "Correct — Dorothy Arzner.");

  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
