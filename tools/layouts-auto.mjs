#!/usr/bin/env node
// Automatic layout pass: solve published puzzles in a headless browser
// with successively stronger strategies, report each board's remaining
// defects, and (with --write) save the results as automatic layouts.
//
//   npm run layouts:auto -- <puzzle-id> [...]   specific puzzles
//   npm run layouts:auto -- --all               every published puzzle
//
// Options:
//   --modes graph,sets,star   modes to lay out (default: all three)
//   --write                   save results; without it this is a dry run
//   --base <url>              authoring server (default http://127.0.0.1:8787)
//   --lanes <n>               puzzles laid out at once (default 2)
//   --min-size <factor>       board size to start from, e.g. 1.1 for +10%
//                             (default: the default size, or the saved size
//                             when only some modes run); never goes below it
//   --draft <draft-id>        lay out a working copy instead of a published
//                             puzzle, saving into the working copy
//   --report <path>           also write the full results as JSON
//   --json                    print only the results, as JSON, to stdout
//                             (the authoring panel's Run layout pass uses it)
//
// Needs the local authoring server (`npm run dev`), which reads and writes
// the same D1 publication rows players see: --write changes live boards.
// With --draft it reads and writes that working copy instead. A server
// behind the admin sign-in (the LAN authoring server) is reached with the
// ADMIN_KEY this process inherits.
//
// Per board the strategies run in order until the board is clean:
//   1. the live (standard) search;
//   2. the extended search budget (layoutBudget.js), which for Graph also
//      repairs single pills left in an overlap or across a line. It stops
//      after a few minutes per board with the best layout found by then.
// Per puzzle, when its board size is the pass's to choose, the board grows
// in 5% steps up to +25% until every mode is clean, keeping the smallest
// size that is, else the size with the fewest defects. It starts from
// --min-size when given (a size the author finds comfortable) and never
// goes below it. The board size is the pass's to choose only when no author
// has set one and no mode has an author's layout, which a new size would
// move; otherwise the size where the board would be clean is reported as a
// suggestion. A run over only some modes never grows the board either, since
// a new size would move the modes it does not look at: it lays out at its
// start size, saves that size with its layouts, and suggests a larger one.
//
// Automatic layouts and sizes are tagged source: "auto". An author's saved
// layout or board size is measured and reported, never replaced; the save
// endpoints enforce that too. Graph and Circle results are saved as exact
// positions when they pass the strict check (else as hints), Star results
// as Star layouts; all of them adapt rather than vanish after later edits.

import { writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { boardSizeOwner } from "../modules/layoutDocument.js";
import { adminSessionCookie } from "../modules/localAdminAuth.js";
import { canonicalBoardSizeFactor } from "../modules/puzzleBoardSize.js";
import { LAYOUT_PASS_MODES, layoutPassSizePlan } from "../modules/layoutPassSizePlan.js";
import { DEFECT_TIERS, layoutDefects, tierCount } from "../modules/layoutAttention.js";

const MODES = LAYOUT_PASS_MODES;
const MODE_LABELS = { graph: "Graph", sets: "Circle", star: "Star" };
const SIZE_STEP = 0.05;
const SIZE_MAX = 1.25;

// `npm run layouts:auto --all` hands npm the flag rather than the script;
// npm passes it on as npm_config_all. Read those too, so options work with
// or without the `--` separator.
function npmFlags(env = process.env) {
  const flag = name => env[`npm_config_${name}`];
  const args = [];
  if (flag("all") === "true") args.push("--all");
  if (flag("write") === "true") args.push("--write");
  // An option with a value cannot survive npm without the separator: npm
  // keeps the flag as "true" and hands the value on as a puzzle id.
  ["modes", "min_size", "draft", "base", "lanes", "report"].forEach(name => {
    if (flag(name) !== undefined) {
      const option = `--${name.replace("_", "-")}`;
      throw new Error(`${option} takes a value, so put -- before the options: npm run layouts:auto -- ${option} <value> …`);
    }
  });
  return args;
}

function parseArgs(argv) {
  argv = [...npmFlags(), ...argv];
  const options = {
    ids: [],
    all: false,
    modes: MODES,
    minSize: null,
    draft: null,
    write: false,
    base: "http://127.0.0.1:8787",
    lanes: 2,
    report: null,
    json: false
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
    else if (arg === "--json") options.json = true;
    else if (arg === "--modes") {
      options.modes = value().split(",").map(mode => mode.trim()).filter(Boolean);
      if (!options.modes.length) throw new Error(`--modes needs one or more of ${MODES.join(", ")}`);
      const unknown = options.modes.filter(mode => !MODES.includes(mode));
      if (unknown.length) throw new Error(`Unknown mode(s): ${unknown.join(", ")}`);
    } else if (arg === "--min-size") {
      const raw = value();
      options.minSize = canonicalBoardSizeFactor(Number(raw));
      if (options.minSize == null) throw new Error(`--min-size needs a board size factor such as 1.1, not ${raw}`);
    } else if (arg === "--draft") {
      options.draft = value();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.draft)) throw new Error(`Invalid draft id ${options.draft}`);
    } else if (arg === "--base") options.base = value().replace(/\/$/, "");
    else if (arg === "--lanes") options.lanes = Math.max(1, Number.parseInt(value(), 10) || 1);
    else if (arg === "--report") options.report = value();
    else if (arg.startsWith("--")) throw new Error(`Unknown option ${arg}`);
    else options.ids.push(arg);
  }
  if (options.draft) {
    if (options.all || options.ids.length) throw new Error("--draft lays out that one working copy; drop the puzzle ids and --all");
    options.ids = [options.draft];
  }
  if (!options.all && !options.ids.length) {
    throw new Error("Name one or more puzzle ids, or pass --all (e.g. npm run layouts:auto -- --all)");
  }
  return options;
}

// Fewer defects of the most severe kind wins, as in the engines' own
// scoring; a crossing is never traded for a few lines through pills.
function fewerDefects(mode, a, b) {
  for (const tier of DEFECT_TIERS[mode]) {
    const x = tierCount(a, tier), y = tierCount(b, tier);
    if (x !== y) return x < y;
  }
  return false;
}

// Defects across a puzzle's modes as counts per severity rank, so whole
// sizes can be compared: rank 0 is each mode's most severe kind.
function severityVector(rows) {
  const vector = [0, 0, 0, 0];
  rows.forEach(row => {
    DEFECT_TIERS[row.mode].forEach((tier, rank) => { vector[rank] += tierCount(row.defects, tier); });
  });
  return vector;
}

function lessVector(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}

const percent = size => {
  const value = Math.round((size - 1) * 100);
  return value === 0 ? "0%" : `${value > 0 ? "+" : ""}${value}%`;
};

// Open the published puzzle, not a working copy: on the authoring server
// ?puzzle=<id> opens the draft when one exists, so load by corpus index.
// With --draft, open that working copy's player view instead.
async function openBoard(browser, options, id, mode, budget, size = null) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  if (process.env.ADMIN_KEY) {
    await page.context().addCookies([adminSessionCookie(process.env.ADMIN_KEY, options.base)]);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const sizeParam = size == null ? "" : `&boardSize=${size}`;
  if (options.draft) {
    await page.goto(`${options.base}/?puzzle=${encodeURIComponent(options.draft)}&play&mode=${mode}&layoutBudget=${budget}${sizeParam}`);
  } else {
    await page.goto(`${options.base}/?library&mode=${mode}&layoutBudget=${budget}${sizeParam}`);
    await page.waitForFunction(() => window.CC?.PUZZLES?.length, null, { timeout: 60000 });
    const found = await page.evaluate(async id => {
      const index = window.CC.PUZZLES.findIndex(puzzle => puzzle.id === id);
      if (index < 0) return false;
      await window.CC.loadPuzzle(index, { restoreSession: false, persistInitial: false, saveCurrent: false });
      return true;
    }, id);
    if (!found) throw new Error(`No published puzzle "${id}"`);
  }
  // A working copy's puzzle id is its document's, which may differ from the
  // draft id; its Construct board (need 0) is not the one to lay out.
  await page.waitForFunction(id => {
    const state = window.CC?.state;
    return (id == null || state?.puzzle?.id === id) &&
      (state?.learningGated || (state?.layoutAdapter && state.need > 0));
  }, options.draft ? null : id, { timeout: 60000 });
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
  if (await page.evaluate(() => window.CC.playSource) !== "d1") {
    throw new Error("The page is not reading the D1 corpus; is this the local authoring server?");
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
  // The live (standard) search gives up after its time limit and leaves the
  // board unpolished (layoutBudget.js); that ends the wait too.
  await page.waitForFunction(() => window.CC.state.solutionLayout === "pretty" ||
    window.CC.state.polishTimedOut === true, null, { timeout: 600000 });
  return page.evaluate(() => ({
    metrics: window.CC.state.layoutAdapter.metrics(),
    source: window.CC.state.layoutSource || null,
    repaired: !!window.CC.state.graphLayoutStats?.repaired,
    stoppedEarlyMs: window.CC.state.layoutSource?.stoppedEarlyMs || null,
    timedOut: window.CC.state.polishTimedOut === true
  }));
}

// Who owns the puzzle's board size and layouts, read from the first board.
async function readOwnership(page, modes) {
  const read = await page.evaluate(modes => {
    const puzzle = window.CC.state.puzzle;
    const layout = puzzle.layout || {};
    return {
      layoutBoard: layout.board || null,
      legacySizeFactor: puzzle.board?.sizeFactor ?? null,
      authorModes: modes.filter(mode => {
        const saved = layout.modes?.[mode];
        return saved && saved.source !== "auto";
      })
    };
  }, modes);
  return {
    authorSize: boardSizeOwner(read.layoutBoard, read.legacySizeFactor) === "author",
    authorModes: read.authorModes
  };
}

async function currentSize(page) {
  return page.evaluate(() => {
    const puzzle = window.CC.state.puzzle;
    const board = puzzle.layout?.board;
    const value = board && Object.prototype.hasOwnProperty.call(board, "sizeFactor")
      ? board.sizeFactor
      : puzzle.board?.sizeFactor;
    return typeof value === "number" ? value : 1;
  });
}

// One board at one size: an author's layout is only measured; otherwise
// the strategies run in order until the board is clean. Returns the row
// and the page holding the best result, left open for saving.
async function layOutBoard(browser, options, id, mode, size, authorLayout) {
  const row = { id, mode, size };
  const live = await openBoard(browser, options, id, mode, "standard", size);
  if (authorLayout) {
    const result = await solve(live, mode, { dropAuto: false });
    row.action = "author layout kept";
    row.defects = layoutDefects(mode, result.metrics);
    return { row, page: live };
  }
  const liveResult = await solve(live, mode, { dropAuto: true });
  row.standardDefects = layoutDefects(mode, liveResult.metrics);
  row.defects = row.standardDefects;
  row.strategy = liveResult.timedOut ? "live search (timed out)" : "live search";
  // A live search that ran out of time freezes the page for players and
  // leaves their board unpolished, so it always goes on to the extended one.
  // Whether the board kept was left unpolished by a search that ran out of
  // time: never saved, since a Star layout saves as exact positions.
  row.timedOut = !!liveResult.timedOut;
  if (row.standardDefects.total === 0 && !liveResult.timedOut) return { row, page: live };
  const extended = await openBoard(browser, options, id, mode, "extended", size);
  const extendedResult = await solve(extended, mode, { dropAuto: true });
  const extendedDefects = layoutDefects(mode, extendedResult.metrics);
  if (fewerDefects(mode, extendedDefects, row.standardDefects) ||
      (liveResult.timedOut && !fewerDefects(mode, row.standardDefects, extendedDefects))) {
    await live.close();
    row.defects = extendedDefects;
    row.timedOut = !!extendedResult.timedOut;
    row.strategy = (extendedResult.repaired ? "extended search + repair" : "extended search") +
      (extendedResult.stoppedEarlyMs
        ? ` (stopped after ${Math.round(extendedResult.stoppedEarlyMs / 60_000)} min, best found)`
        : extendedResult.timedOut ? " (timed out)" : "");
    return { row, page: extended };
  }
  await extended.close();
  return { row, page: live };
}

// Saved as exact positions when they pass the strict check, so players get
// exactly this result (an edit later turns it into a hint, never drops it).
// Graph and Circle results with defects the strict check refuses are saved
// as hints instead; Star layouts are always exact.
// Where results save: the working copy with --draft, else the published row.
function layoutUrl(options, id) {
  return options.draft
    ? `/admin/drafts/${encodeURIComponent(options.draft)}/layout.json`
    : `/admin/puzzles/${encodeURIComponent(id)}/layout.json`;
}

async function saveLayout(page, url, mode) {
  return page.evaluate(async ({ url, mode }) => {
    const state = window.CC.state;
    const put = async fixed => {
      const layout = state.layoutAdapter.capture({ purpose: "authoring" });
      layout.source = "auto";
      if (mode !== "star") layout.fixed = fixed;
      const reply = await fetch(`${url}?mode=${mode}`, {
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
  }, { url, mode });
}

async function saveBoardSize(page, url, size) {
  return page.evaluate(async ({ url, size }) => {
    const reply = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ board: { sizeFactor: size, source: "auto" } })
    });
    const body = await reply.json().catch(() => ({}));
    return { ok: reply.ok, status: reply.status, error: body.error, errors: body.errors };
  }, { url, size });
}

const describeSave = response => (response.ok
  ? null
  : `${response.status}: ${[response.error, ...(response.errors || [])].filter(Boolean).join("; ")}`);

// One puzzle, all requested modes, one board size at a time.
async function layOutPuzzle(browser, options, id) {
  const probe = await openBoard(browser, options, id, options.modes[0], "standard");
  let ownership, saved;
  try {
    // Every mode, not just the ones this run lays out: an author's layout in
    // any mode pins the board size, since a new size would move it.
    ownership = await readOwnership(probe, MODES);
    saved = await currentSize(probe);
  } finally {
    await probe.close();
  }
  const { sizeIsOurs, base, mayGrow } = layoutPassSizePlan({
    ...ownership, saved, minSize: options.minSize, modes: options.modes
  });
  const sizes = [base];
  for (let size = base + SIZE_STEP; size <= SIZE_MAX + 1e-9; size += SIZE_STEP) {
    sizes.push(Math.round(size * 100) / 100);
  }

  let best = null;   // { size, rows, pages }
  let cleanAt = null;
  for (const size of sizes) {
    const rows = [], pages = [];
    try {
      for (const mode of options.modes) {
        const { row, page } = await layOutBoard(
          browser, options, id, mode, size, ownership.authorModes.includes(mode)
        );
        rows.push(row);
        pages.push(page);
      }
    } catch (error) {
      await Promise.all(pages.map(page => page.close()));
      throw error;
    }
    const vector = severityVector(rows);
    const clean = vector.every(count => count === 0);
    if (clean && cleanAt == null) cleanAt = size;
    if (!best || lessVector(vector, best.vector)) {
      if (best) await Promise.all(best.pages.map(page => page.close()));
      best = { size, rows, pages, vector };
    } else {
      await Promise.all(pages.map(page => page.close()));
    }
    // A size the pass may not apply is only explored to find where the
    // board would be clean; stop there, or at once when nothing is wrong.
    if (clean) break;
  }

  // The size to report and save: the best one when the pass may grow the
  // board, otherwise the start size, with any clean size as a suggestion.
  let chosen = best;
  try {
    if (!mayGrow && best.size !== base) {
      await Promise.all(best.pages.map(page => page.close()));
      const rows = [], pages = [];
      for (const mode of options.modes) {
        const { row, page } = await layOutBoard(
          browser, options, id, mode, base, ownership.authorModes.includes(mode)
        );
        rows.push(row);
        pages.push(page);
      }
      chosen = { size: base, rows, pages };
    }
    const summary = {
      id,
      size: chosen.size,
      sizeOwner: ownership.authorSize ? "author" : ownership.authorModes.length ? "author layouts" : "auto",
      suggestedSize: !mayGrow && cleanAt != null && cleanAt !== base ? cleanAt : null,
      rows: chosen.rows
    };
    if (!options.write) {
      chosen.rows.forEach(row => { row.action ||= "dry run"; });
      return summary;
    }
    if (sizeIsOurs) {
      const sized = await saveBoardSize(chosen.pages[0], layoutUrl(options, id), chosen.size);
      summary.sizeAction = sized.ok ? "saved" : `not saved (${describeSave(sized)})`;
    }
    for (let i = 0; i < chosen.rows.length; i++) {
      const row = chosen.rows[i];
      if (row.action === "author layout kept") continue;
      if (row.timedOut) {
        row.action = "not saved (timed out before polishing)";
        continue;
      }
      const response = await saveLayout(chosen.pages[i], layoutUrl(options, id), row.mode);
      row.action = response.ok
        ? (row.mode === "star" || response.fixed ? "saved" : "saved as hint")
        : `not saved (${describeSave(response)})`;
    }
    return summary;
  } finally {
    const open = new Set([...best.pages, ...chosen.pages]);
    await Promise.all([...open].map(page => page.close().catch(() => {})));
  }
}

function summarize(puzzles, options) {
  const rows = puzzles.flatMap(puzzle => puzzle.rows || []);
  const lines = [];
  options.modes.forEach(mode => {
    const forMode = rows.filter(row => row.mode === mode);
    const clean = forMode.filter(row => row.defects?.total === 0);
    const author = forMode.filter(row => row.action === "author layout kept");
    const saved = forMode.filter(row => row.action?.startsWith("saved"));
    const extended = forMode.filter(row => row.strategy?.startsWith("extended")).length;
    let line = `${MODE_LABELS[mode]}: ${forMode.length} boards, ${clean.length} clean, ${forMode.length - clean.length} with defects`;
    if (extended) line += `, ${extended} improved by the extended search`;
    if (author.length) line += `, ${author.length} author layouts kept`;
    if (options.write) line += `, ${saved.length} saved`;
    lines.push(line);
  });
  const grown = puzzles.filter(puzzle => puzzle.sizeOwner === "auto" && puzzle.size !== 1);
  if (grown.length) {
    lines.push("", "Board size set by the pass:");
    grown.forEach(puzzle => lines.push(`  ${puzzle.id}: ${percent(puzzle.size)}${puzzle.sizeAction ? ` (${puzzle.sizeAction})` : ""}`));
  }
  const suggested = puzzles.filter(puzzle => puzzle.suggestedSize != null);
  if (suggested.length) {
    lines.push("", `Clean at a larger board size (yours to set; the pass leaves ${"an author's"} size and layouts alone):`);
    suggested.forEach(puzzle => lines.push(`  ${puzzle.id}: ${percent(puzzle.suggestedSize)} (now ${percent(puzzle.size)}, ${puzzle.sizeOwner})`));
  }
  const attention = rows.filter(row => row.defects?.total > 0);
  if (attention.length) {
    lines.push("", "Boards still needing attention:");
    attention
      .sort((a, b) => b.defects.total - a.defects.total || a.id.localeCompare(b.id))
      .forEach(row => {
        const { total, ...kinds } = row.defects;
        const detail = Object.entries(kinds).map(([kind, count]) => `${kind} ${count}`).join(", ");
        const notes = [row.action === "author layout kept" ? "author layout" : null, percent(row.size)].filter(Boolean);
        lines.push(`  ${row.id} [${MODE_LABELS[row.mode]}, ${notes.join(", ")}]: ${detail}`);
      });
  }
  const unsaved = rows.filter(row => row.action?.startsWith("not saved"))
    .concat(puzzles.filter(puzzle => puzzle.sizeAction?.startsWith("not saved")).map(puzzle => ({ id: puzzle.id, mode: null, action: puzzle.sizeAction })));
  if (unsaved.length) {
    lines.push("", "Not saved:");
    unsaved.forEach(row => lines.push(`  ${row.id}${row.mode ? ` [${MODE_LABELS[row.mode]}]` : " [board size]"}: ${row.action}`));
  }
  const failures = puzzles.filter(puzzle => puzzle.error);
  if (failures.length) {
    lines.push("", "Failed:");
    failures.forEach(puzzle => lines.push(`  ${puzzle.id}: ${puzzle.error}`));
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
    // Lanes run different puzzles at once; one puzzle's boards run in turn,
    // since each save rewrites that puzzle's whole layout document.
    ids = [...new Set(ids)];
    const queue = [...ids];
    const log = options.json ? () => {} : line => console.log(line);
    log(`${options.write ? "Laying out" : "Dry run:"} ${ids.length} puzzles × ${options.modes.length} modes, ${options.lanes} puzzles at a time.`);
    const puzzles = [];
    await Promise.all(Array.from({ length: Math.min(options.lanes, queue.length) }, async () => {
      while (queue.length) {
        const id = queue.shift();
        const started = Date.now();
        let result;
        try {
          result = await layOutPuzzle(browser, options, id);
        } catch (error) {
          result = { id, error: error.message.split("\n")[0] };
        }
        result.ms = Date.now() - started;
        puzzles.push(result);
        if (puzzles.length % 10 === 0) log(`  ${puzzles.length} puzzles done`);
      }
    }));
    if (options.report) writeFileSync(options.report, `${JSON.stringify(puzzles, null, 2)}\n`);
    if (options.json) {
      process.stdout.write(`${JSON.stringify({ write: options.write, puzzles })}\n`);
      return;
    }
    log(`\n${summarize(puzzles, options)}`);
    if (options.report) log(`\nFull results: ${options.report}`);
    if (!options.write) log("\nDry run: nothing was saved. Pass --write to save automatic layouts.");
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
