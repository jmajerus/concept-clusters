// Loads every puzzle in all three rendering modes and confirms nothing
// throws — the baseline check: if this fails, something more specific
// broke too, so it's worth running first.
import assert from "node:assert/strict";
import { IDENTITY_COLOR_KEYS } from "../modules/colorPalette.js";

export const name = "smoke: every puzzle loads cleanly in all three modes";

export async function run(page, baseURL) {
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });

  await page.goto(`${baseURL}/index.html`);
  await page.waitForSelector("#puzzle-title:not(:empty)");

  const titles = await page.evaluate(() => CC.PUZZLES.map(p => p.title));
  assert.ok(titles.length > 0, "PUZZLES is empty");

  const pickerPresentation = await page.evaluate(() => ({
    key: Array.from(document.querySelectorAll("#puzzle-picker > option"))
      .find(option => option.disabled && option.textContent.includes("Concept Lenses"))
      ?.textContent,
    rows: CC.PUZZLES.map((p, index) => ({
      title: p.title,
      large: !!p.large,
      lenses: !!p.lenses?.length,
      option: Array.from(document.querySelectorAll("#puzzle-picker option"))
        .find(option => option.value === String(index))?.textContent
    }))
  }));
  assert.equal(pickerPresentation.key, "▣ Large board · ◉ Concept Lenses");
  for (const row of pickerPresentation.rows) {
    assert.ok(row.option?.startsWith(row.title), `"${row.title}" has no picker row`);
    assert.equal(row.option.includes("▣"), row.large, `"${row.title}" has the wrong large marker`);
    assert.equal(row.option.includes("◉"), row.lenses, `"${row.title}" has the wrong lens marker`);
    assert.equal(row.option.includes("(Large)"), false, `"${row.title}" still uses the old parenthetical suffix`);
  }

  // Every authoring color must work on every surface that carries a
  // cluster hue, not only ordinary Graph pills.
  const clusterColorSurfaces = await page.evaluate(identityColors => {
    const svgNS = "http://www.w3.org/2000/svg";
    const resolveToken = token => {
      const probe = document.createElement("span");
      probe.style.color = `var(--${token})`;
      document.body.appendChild(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    return identityColors.map(color => {
      const svg = document.createElementNS(svgNS, "svg");
      svg.style.position = "fixed";
      svg.style.left = "-10000px";
      svg.innerHTML = `
        <g class="node done c-${color}">
          <rect></rect><text></text><circle class="info-dot"></circle>
        </g>
        <g class="title-node c-${color}">
          <rect></rect><text></text><circle class="info-dot"></circle>
        </g>
        <circle class="set-circle c-${color}"></circle>`;
      const fact = document.createElement("div");
      fact.className = `fact-card c-${color}`;
      document.body.append(svg, fact);
      const node = svg.querySelector(".node");
      const title = svg.querySelector(".title-node");
      const setCircle = svg.querySelector(".set-circle");
      const result = {
        color,
        foreground: resolveToken(color),
        background: resolveToken(`${color}-bg`),
        line: resolveToken(`${color}-line`),
        nodeFill: getComputedStyle(node.querySelector("rect")).fill,
        nodeStroke: getComputedStyle(node.querySelector("rect")).stroke,
        nodeText: getComputedStyle(node.querySelector("text")).fill,
        nodeInfo: getComputedStyle(node.querySelector(".info-dot")).fill,
        titleStroke: getComputedStyle(title.querySelector("rect")).stroke,
        titleText: getComputedStyle(title.querySelector("text")).fill,
        titleInfo: getComputedStyle(title.querySelector(".info-dot")).fill,
        setFill: getComputedStyle(setCircle).fill,
        setStroke: getComputedStyle(setCircle).stroke,
        factBackground: getComputedStyle(fact).backgroundColor,
        factText: getComputedStyle(fact).color
      };
      svg.remove();
      fact.remove();
      return result;
    });
  }, IDENTITY_COLOR_KEYS);
  for (const surface of clusterColorSurfaces) {
    assert.equal(surface.nodeFill, surface.background, `${surface.color}: Graph fill`);
    assert.equal(surface.nodeStroke, surface.line, `${surface.color}: Graph stroke`);
    assert.equal(surface.nodeText, surface.foreground, `${surface.color}: Graph text`);
    assert.equal(surface.nodeInfo, surface.line, `${surface.color}: Graph info dot`);
    assert.equal(surface.titleStroke, surface.line, `${surface.color}: Star title stroke`);
    assert.equal(surface.titleText, surface.foreground, `${surface.color}: Star title text`);
    assert.equal(surface.titleInfo, surface.line, `${surface.color}: Star info dot`);
    assert.equal(surface.setFill, surface.background, `${surface.color}: Circle fill`);
    assert.equal(surface.setStroke, surface.line, `${surface.color}: Circle stroke`);
    assert.equal(surface.factBackground, surface.background, `${surface.color}: fact-card fill`);
    assert.equal(surface.factText, surface.foreground, `${surface.color}: fact-card text`);
  }

  for (const mode of ["#mode-graph", "#mode-star", "#mode-sets"]) {
    for (const title of titles) {
      const idx = await page.$$eval(
        "#puzzle-picker option",
        (els, t) => els.findIndex(o => o.textContent.startsWith(t)),
        title
      );
      assert.notEqual(idx, -1, `puzzle "${title}" missing from the picker`);
      await page.selectOption("#puzzle-picker", { index: idx });
      await page.waitForFunction(
        t => document.getElementById("puzzle-title").textContent === t,
        title
      );
      if (mode === "#mode-graph") {
        const badges = await page.evaluate(() => ({
          large: !!CC.state.puzzle.large,
          lenses: !!CC.state.puzzle.lenses?.length,
          largeShown: document.getElementById("large-badge").classList.contains("shown"),
          lensesShown: document.getElementById("lenses-badge").classList.contains("shown")
        }));
        assert.equal(badges.largeShown, badges.large, `"${title}" has the wrong active Large badge`);
        assert.equal(badges.lensesShown, badges.lenses, `"${title}" has the wrong active Lenses badge`);
      }
      // A saved puzzle resumes its own prior mode by design. Re-select
      // the mode under test after loading it.
      await page.click(mode);
    }
  }

  assert.equal(errors.length, 0, `console errors:\n${errors.join("\n")}`);
}
