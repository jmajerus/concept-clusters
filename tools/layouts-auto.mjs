#!/usr/bin/env node
// Automatic layout pass: solve published puzzles in a headless browser,
// spending the extended search budget on boards the live search leaves
// defects on; report each board's remaining defects, and (with --write)
// save the results as automatic layouts.
//
//   npm run layouts:auto -- <puzzle-id> [...]   specific puzzles
//   npm run layouts:auto -- --all               every published puzzle
//
// Options:
//   --modes graph,sets,star   modes to lay out (default: all three)
//   --write                   save results; without it this is a dry run
//   --base <url>              authoring server (default http://127.0.0.1:8787)
//   --lanes <n>               puzzles laid out at once (default 2)
//   --report <path>           also write the full results as JSON
//
// Needs the local authoring server (`npm run dev`), which reads and writes
// the same D1 publication rows players see: --write changes live boards.
//
// Automatic layouts are tagged source: "auto". An author's saved layout for
// a mode is measured and reported, never replaced; the save endpoints
// enforce that too. Graph and Circle results are saved as hints; Star
// results as Star layouts (always exact), so they adapt after later edits.

import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const MODES = ["graph", "sets", "star"];
const MODE_LABELS = { graph: "Graph", sets: "Circle", star: "Star" };

function parseArgs(argv) {
  const options = {
    ids: [],
    all: false,
    modes: MODES,
    write: false,
    base: "http://127.0.0.1:8787",
    lanes: 2,
    report: null
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next == null) throw new Error(`${arg} needs a value`);
      return next;
    };
    if (arg === "--all") options.all = true;
    else if (arg === "--write") options.write = true;
    else if (arg === "--modes") {
      options.modes = value().split(",").map(mode => mode.trim()).filter(Boolean);
      const unknown = options.modes.filter(mode => !MODES.includes(mode));
      if (unknown.length) throw new Error(`Unknown mode(s): ${unknown.join(", ")}`);
    } else if (arg === "--base") options.base = value().replace(/\/$/, "");
    else if (arg === "--lanes") options.lanes = Math.max(1, Number.parseInt(value(), 10) || 1);
    else if (arg === "--report") options.report = value();
    else if (arg.startsWith("--")) throw new Error(`Unknown option ${arg}`);
    else options.ids.push(arg);
  }
  if (!options.all && !options.ids.length) {
    throw new Error("Name one or more puzzle ids, or pass --all");
  }
  return options;
}

// Defects players would notice, most severe first, per mode, in the order
// each engine's own scoring ranks them (graphLayout scoreGraphGeometry,
// setRenderer scoreCircleCandidate, starRenderer comparePrettyLayouts).
// Graph's hardOverlaps already includes overlaps.
const DEFECT_KEYS = {
  graph: ["hardOverlaps", "lineCrossings", "edgeNodeIntersections"],
  sets: ["hardOverlaps", "lineCrossings", "lineHeadingIntersections", "lineCircleIntersections"],
  star: ["lineCrossings", "edgeTitleIntersections", "edgeNodeIntersections", "overlaps"]
};

function defects(mode, metrics) {
  if (!metrics) return { total: null };
  const found = Object.fromEntries(DEFECT_KEYS[mode]
    .map(key => [key, Number(metrics[key]) || 0])
    .filter(([, count]) => count > 0));
  return { ...found, total: Object.values(found).reduce((sum, count) => sum + count, 0) };
}

// Fewer defects of the most severe kind wins, as in the engines' own
// scoring; a crossing is never traded for a few lines through pills.
function fewerDefects(mode, a, b) {
  for (const key of DEFECT_KEYS[mode]) {
    const x = a[key] || 0, y = b[key] || 0;
    if (x !== y) return x < y;
  }
  return false;
}

// Open the published puzzle, not a working copy: on the authoring server
// ?puzzle=<id> opens the draft when one exists, so load by corpus index.
async function openBoard(browser, options, id, mode, budget) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${options.base}/?library&mode=${mode}&layoutBudget=${budget}`);
  await page.waitForFunction(() => window.CC?.PUZZLES?.length, null, { timeout: 60000 });
  const found = await page.evaluate(async id => {
    const index = window.CC.PUZZLES.findIndex(puzzle => puzzle.id === id);
    if (index < 0) return false;
    await window.CC.loadPuzzle(index, { restoreSession: false, persistInitial: false, saveCurrent: false });
    return true;
  }, id);
  if (!found) throw new Error(`No published puzzle "${id}"`);
  await page.waitForFunction(id => {
    const state = window.CC.state;
    return state?.puzzle?.id === id && (state.learningGated || (state.layoutAdapter && state.need > 0));
  }, id, { timeout: 60000 });
  if (await page.evaluate(() => window.CC.state.learningGated)) {
    await page.click("#learning-introduction #skip");
    await page.waitForFunction(() => {
      const state = window.CC.state;
      return !state.learningGated && state.layoutAdapter && state.need > 0;
    }, null, { timeout: 60000 });
  }
  if (await page.evaluate(() => window.CC.mode) !== mode) {
    throw new Error(`Board opened in ${await page.evaluate(() => window.CC.mode)} mode, not ${mode}`);
  }
  return page;
}

// Solve the board and wait for its final layout. `dropAuto` removes a
// previous automatic layout first, so the search starts fresh instead of
// being steered by its own earlier result.
async function solve(page, mode, { dropAuto }) {
  await page.evaluate(({ mode, dropAuto }) => {
    const state = window.CC.state;
    const saved = state.puzzle.layout?.modes?.[mode];
    if (dropAuto && saved?.source === "auto") {
      delete state.puzzle.layout.modes[mode];
      if (mode === "star") delete state.puzzle.starLayout;
    }
    window.CC.showSolution();
  }, { mode, dropAuto });
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty", null, { timeout: 600000 });
  return page.evaluate(() => ({
    metrics: window.CC.state.layoutAdapter.metrics(),
    source: window.CC.state.layoutSource || null
  }));
}

// Saved as exact positions when they pass the strict check, so players get
// exactly this result (an edit later turns it into a hint, never drops it).
// Graph and Circle results with defects the strict check refuses are saved
// as hints instead; Star layouts are always exact.
async function saveLayout(page, id, mode) {
  return page.evaluate(async ({ id, mode }) => {
    const state = window.CC.state;
    const put = async fixed => {
      const layout = state.layoutAdapter.capture({ purpose: "authoring" });
      layout.source = "auto";
      if (mode !== "star") layout.fixed = fixed;
      const reply = await fetch(`/admin/puzzles/${encodeURIComponent(id)}/layout.json?mode=${mode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ mode, layout })
      });
      const body = await reply.json().catch(() => ({}));
      return { ok: reply.ok, status: reply.status, error: body.error, errors: body.errors, fixed };
    };
    const exact = await put(true);
    if (exact.ok || mode === "star" || exact.status !== 400) return exact;
    return put(false);
  }, { id, mode });
}

// One board: an author's layout is only measured. Otherwise solve with the
// live search, and only when that leaves defects spend the extended search;
// the result with fewer defects is the one reported and saved.
async function layOut(browser, options, id, mode) {
  const row = { id, mode };
  const started = Date.now();
  const pages = [];
  try {
    const live = await openBoard(browser, options, id, mode, "standard");
    pages.push(live);
    if (await live.evaluate(() => window.CC.playSource) !== "d1") {
      throw new Error("The page is not reading the D1 corpus; is this the local authoring server?");
    }
    const saved = await live.evaluate(mode => {
      const layout = window.CC.state.puzzle.layout?.modes?.[mode];
      return layout ? { source: layout.source || "author" } : null;
    }, mode);
    row.saved = saved?.source || null;

    if (saved && saved.source !== "auto") {
      const result = await solve(live, mode, { dropAuto: false });
      row.action = "author layout kept";
      row.defects = defects(mode, result.metrics);
      return row;
    }

    const liveResult = await solve(live, mode, { dropAuto: true });
    row.standardDefects = defects(mode, liveResult.metrics);
    row.defects = row.standardDefects;
    row.budget = "standard";
    let best = live;
    if (row.standardDefects.total > 0) {
      const extended = await openBoard(browser, options, id, mode, "extended");
      pages.push(extended);
      const extendedResult = await solve(extended, mode, { dropAuto: true });
      const extendedDefects = defects(mode, extendedResult.metrics);
      if (fewerDefects(mode, extendedDefects, row.standardDefects)) {
        row.defects = extendedDefects;
        row.budget = "extended";
        best = extended;
      }
    }
    if (!options.write) {
      row.action = "dry run";
      return row;
    }
    const response = await saveLayout(best, id, mode);
    row.action = response.ok
      ? (mode === "star" || response.fixed ? "saved" : "saved as hint")
      : `not saved (${response.status}: ${[response.error, ...(response.errors || [])].filter(Boolean).join("; ")})`;
    return row;
  } finally {
    row.ms = Date.now() - started;
    await Promise.all(pages.map(page => page.close()));
  }
}

function summarize(rows, options) {
  const lines = [];
  options.modes.forEach(mode => {
    const forMode = rows.filter(row => row.mode === mode);
    const failed = forMode.filter(row => row.error);
    const ok = forMode.filter(row => !row.error);
    const clean = ok.filter(row => row.defects?.total === 0);
    const author = ok.filter(row => row.action === "author layout kept");
    const saved = ok.filter(row => row.action?.startsWith("saved"));
    let line = `${MODE_LABELS[mode]}: ${ok.length} boards, ${clean.length} clean, ${ok.length - clean.length} with defects`;
    if (author.length) line += `, ${author.length} author layouts kept`;
    if (options.write) line += `, ${saved.length} saved`;
    const tried = ok.filter(row => row.standardDefects?.total > 0);
    if (tried.length) {
      const improved = tried.filter(row => row.budget === "extended").length;
      line += `; extended search improved ${improved} of ${tried.length} boards the live search left defects on`;
    }
    if (failed.length) line += `, ${failed.length} failed`;
    lines.push(line);
  });
  const attention = rows.filter(row => !row.error && row.defects?.total > 0);
  if (attention.length) {
    lines.push("", "Boards needing attention:");
    attention
      .sort((a, b) => b.defects.total - a.defects.total || a.id.localeCompare(b.id))
      .forEach(row => {
        const { total, ...kinds } = row.defects;
        const detail = Object.entries(kinds).map(([kind, count]) => `${kind} ${count}`).join(", ");
        lines.push(`  ${row.id} [${MODE_LABELS[row.mode]}${row.action === "author layout kept" ? ", author layout" : ""}]: ${detail}`);
      });
  }
  const failures = rows.filter(row => row.error);
  if (failures.length) {
    lines.push("", "Failed:");
    failures.forEach(row => lines.push(`  ${row.id} [${MODE_LABELS[row.mode]}]: ${row.error}`));
  }
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const browser = await chromium.launch();
  try {
    let ids = options.ids;
    if (options.all) {
      const page = await browser.newPage();
      await page.goto(`${options.base}/`);
      await page.waitForFunction(() => window.CC?.PUZZLES?.length, null, { timeout: 60000 });
      ids = await page.evaluate(() => window.CC.PUZZLES.map(puzzle => puzzle.id));
      await page.close();
    }
    // Lanes run different puzzles at once, but one puzzle's modes run in
    // turn: each save rewrites that puzzle's whole layout document, so two
    // modes saved at once could erase each other.
    ids = [...new Set(ids)];
    const queue = [...ids];
    const total = ids.length * options.modes.length;
    console.log(`${options.write ? "Laying out" : "Dry run:"} ${total} boards (${ids.length} puzzles × ${options.modes.length} modes), ${options.lanes} puzzles at a time.`);
    const rows = [];
    let done = 0;
    await Promise.all(Array.from({ length: Math.min(options.lanes, queue.length) }, async () => {
      while (queue.length) {
        const id = queue.shift();
        for (const mode of options.modes) {
          let row;
          try {
            row = await layOut(browser, options, id, mode);
          } catch (error) {
            row = { id, mode, error: error.message.split("\n")[0] };
          }
          rows.push(row);
          done++;
          if (done % 25 === 0) console.log(`  ${done} boards done`);
        }
      }
    }));
    console.log(`\n${summarize(rows, options)}`);
    if (options.report) {
      writeFileSync(options.report, `${JSON.stringify(rows, null, 2)}\n`);
      console.log(`\nFull results: ${options.report}`);
    }
    if (!options.write) console.log("\nDry run: nothing was saved. Pass --write to save automatic layouts.");
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
