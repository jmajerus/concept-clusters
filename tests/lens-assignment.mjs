import assert from "node:assert/strict";

export const name = "lens assignment: comparative classification, reveal, and persistence";
export const tier = "extended";

const PUZZLE_ID = "when-systems-stop-seeing-people";

async function focusTerm(page, word) {
  await page.locator("#board .node").evaluateAll((nodes, targetWord) => {
    const node = nodes.find(element => element.__data__?.word === targetWord);
    if (!node) throw new Error(`Could not find rendered node: ${targetWord}`);
    node.focus();
  }, word);
}

async function assignTerm(page, word, lensIndex, { keyboard = false } = {}) {
  await focusTerm(page, word);
  if (keyboard) {
    await page.keyboard.press("Enter");
  } else {
    await page.locator("#board .node").evaluateAll((nodes, targetWord) => {
      const node = nodes.find(element => element.__data__?.word === targetWord);
      node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, word);
  }
  assert.equal(await page.isVisible("#lens-assignment #dialog"), true);
  await page.locator("#lens-assignment #options button").nth(lensIndex).click();
}

async function badgeText(page, word) {
  return page.locator("#board .node").evaluateAll((nodes, targetWord) => {
    const node = nodes.find(element => element.__data__?.word === targetWord);
    return node?.querySelector(".lens-assignment-badge text")?.textContent;
  }, word);
}

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph&moves=`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-assigning");
  assert.equal(
    await page.evaluate(() => document.getElementById("board").classList.contains("lens-assignment-focus")),
    true
  );
  assert.equal(await page.textContent("#lens-assignment #progress"), "0 of 15 concepts assigned");
  assert.equal(await page.locator("#lens-assignment .row").count(), 3);
  assert.deepEqual(
    await page.locator("#lens-assignment .number").evaluateAll(numbers =>
      numbers.map(number => [...number.classList].find(name => name.startsWith("tone-")))
    ),
    ["tone-olive", "tone-brown", "tone-cyan"]
  );
  assert.equal(await page.isDisabled("#lens-assignment #check"), false);
  assert.equal(await page.textContent("#lens-assignment #check"), "Check assignments");
  assert.match(
    await page.locator("#lens-assignment .definition").first().textContent(),
    /represented through categories, measures, or uniform procedures/i
  );
  assert.equal(await page.locator("#board .node .lens-assignment-badge.visible").count(), 15);

  await focusTerm(page, "case number");
  await page.keyboard.press("Enter");
  assert.equal(await page.isVisible("#lens-assignment #dialog"), false);
  assert.equal(await badgeText(page, "case number"), "");

  await focusTerm(page, "eligibility category");
  await page.keyboard.press("Enter");
  assert.match(
    await page.locator("#lens-assignment #options .definition").first().textContent(),
    /represented through categories, measures, or uniform procedures/i
  );
  await page.locator("#lens-assignment #options button").first().click();
  assert.equal(await badgeText(page, "eligibility category"), "1");
  assert.match(
    await page.locator("#board .node").evaluateAll(nodes =>
      nodes.find(element => element.__data__?.word === "eligibility category")
        ?.querySelector(".lens-assignment-badge")?.getAttribute("class")
    ),
    /lens-tone-olive/
  );
  const assignmentColors = await page.locator("#board .node").evaluateAll(nodes => {
    const node = nodes.find(element => element.__data__?.word === "eligibility category");
    return {
      term: getComputedStyle(node.querySelector(":scope > text")).fill,
      badge: getComputedStyle(node.querySelector(".lens-assignment-badge text")).fill
    };
  });
  assert.notEqual(
    assignmentColors.term,
    assignmentColors.badge,
    "the subdued cluster layer and active lens badge reused the same rendered color"
  );
  assert.match(
    await page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
    /eligibility category.*Currently Standardization and abstraction/i
  );
  await assignTerm(page, "eligibility category", 1);
  assert.equal(await badgeText(page, "eligibility category"), "2");

  await focusTerm(page, "population aggregate");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  assert.equal(await page.isVisible("#lens-assignment #dialog"), false);
  assert.equal(await page.evaluate(() => CC.state.lensAssignments.has("population aggregate")), false);
  assert.match(
    await page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
    /population aggregate/i
  );

  await assignTerm(page, "chain of command", 1);
  await page.click("#mode-star");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  assert.equal(
    await page.evaluate(() => document.getElementById("board").classList.contains("lens-assignment-focus")),
    true
  );
  assert.equal(await page.evaluate(() => CC.state.lensAssignments.size), 2);
  assert.equal(await badgeText(page, "eligibility category"), "2");
  assert.equal(await page.locator("#board .title-node .lens-assignment-badge").count(), 0);

  await page.click("#mode-sets");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  assert.equal(await page.evaluate(() => CC.state.lensAssignments.size), 2);

  const answers = await page.evaluate(() => Object.fromEntries(
    CC.state.puzzle.lenses.flatMap((lens, index) =>
      lens.targets.map(word => [word, index])
    )
  ));
  for (const [word, lensIndex] of Object.entries(answers)) {
    if (["eligibility category", "chain of command", "performance metric"].includes(word)) continue;
    await assignTerm(page, word, lensIndex);
  }
  assert.equal(await page.textContent("#lens-assignment #progress"), "14 of 15 concepts assigned");
  assert.equal(await page.isDisabled("#lens-assignment #check"), false);

  await page.click("#lens-assignment #check");
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.match(await page.textContent("#lens-assignment #result"), /13 of 15 concepts/i);
  assert.match(await page.textContent("#lens-assignment #result"), /1 was left unanswered/i);
  assert.equal(await badgeText(page, "eligibility category"), "1");
  const eligibilityClass = await page.locator("#board .node").evaluateAll(nodes =>
    nodes.find(element => element.__data__?.word === "eligibility category")?.getAttribute("class")
  );
  assert.match(eligibilityClass, /lens-assignment-incorrect/);
  assert.match(
    await page.locator("#board .node").evaluateAll(nodes =>
      nodes.find(element => element.__data__?.word === "performance metric")?.getAttribute("class")
    ),
    /lens-assignment-unanswered/
  );
  assert.match(
    await page.textContent("#lens-assignment #explanation"),
    /eligibility category: you chose Displaced responsibility; the authored best fit is Standardization and abstraction/i
  );
  assert.match(
    await page.textContent("#lens-assignment #explanation"),
    /performance metric: left unanswered; the authored best fit is Standardization and abstraction/i
  );
  assert.equal(
    await page.locator("#lens-assignment #explanation details").count(),
    3,
    "not every lens exposed its authored node-specific reasons"
  );
  await page.locator("#lens-assignment #explanation details summary").first().click();
  assert.match(
    await page.locator("#lens-assignment #explanation details").first().textContent(),
    /eligibility category: A category sorts people/i
  );
  assert.equal(await page.isVisible("#related-puzzles"), true);

  await page.click("#mode-graph");
  await page.evaluate(() => CC.state.modeSwitchLayoutPromise);
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.equal(await badgeText(page, "eligibility category"), "1");
  assert.match(
    await page.locator("#board .node").evaluateAll(nodes =>
      nodes.find(element => element.__data__?.word === "eligibility category")?.getAttribute("class")
    ),
    /lens-assignment-incorrect/
  );

  const saved = await page.evaluate(id =>
    JSON.parse(localStorage.getItem(`ccPlayerSession:v1:${id}`)),
  PUZZLE_ID);
  assert.equal(saved.completed, true);
  assert.equal(saved.lens.phase, "complete");
  assert.equal(saved.lens.assignments.length, 14);

  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=sets`);
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.match(await page.textContent("#lens-assignment #result"), /13 of 15 concepts/i);
  assert.equal(await badgeText(page, "eligibility category"), "1");

  // Checking without guessing is a valid learner choice, not a blocked
  // state. The authored classification should still be available as a
  // wholly unanswered reveal, while untargeted terms stay unbadged.
  await page.goto(`${baseURL}/index.html?puzzle=${PUZZLE_ID}&mode=graph&moves=`);
  await page.click("#show-solution");
  await page.waitForFunction(() => CC.state.phase === "lens-assigning");
  assert.equal(await page.isDisabled("#lens-assignment #check"), false);
  await page.click("#lens-assignment #check");
  assert.equal(await page.evaluate(() => CC.state.phase), "complete");
  assert.match(await page.textContent("#lens-assignment #result"), /0 of 15 concepts/i);
  assert.match(await page.textContent("#lens-assignment #result"), /15 were left unanswered/i);
  assert.match(
    await page.locator("#board .node").evaluateAll(nodes =>
      nodes.find(element => element.__data__?.word === "eligibility category")?.getAttribute("class")
    ),
    /lens-assignment-unanswered/
  );
  assert.equal(await badgeText(page, "case number"), "");
  assert.deepEqual(errors, [], `page errors: ${errors.join("\n")}`);
}
