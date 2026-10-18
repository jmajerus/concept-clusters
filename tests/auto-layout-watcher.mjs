import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { autoLayoutStatus, createAutoLayoutWatcher, readAutoLayoutState, readAutoLayoutStatuses } from "../modules/autoLayoutWatcher.js";
import { createLayoutPassJobs } from "../modules/layoutPassJobs.js";
import { boardKey as boardKeyOf } from "../modules/draftReviewDiff.js";

export const name = "automatic layout pass: working copies laid out once their board settles";

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const MINUTE = 60_000;

function board(terms, fact = "A fact.") {
  return {
    id: "alpha",
    clusters: [{ id: "one", name: "One", fact, seeds: terms.slice(0, 2), floatingTerms: terms.slice(2) }],
    bridges: []
  };
}

export async function run() {
  const dir = await mkdtemp(join(tmpdir(), "auto-layout-"));
  try {
    let clock = Date.parse("2026-10-17T12:00:00.000Z");
    const iso = () => new Date(clock).toISOString();
    // D1 stand-in: rows carry what the light query returns.
    const rows = new Map();
    const save = (draftId, document, layout = rows.get(draftId)?.layout ?? null) => {
      const previous = rows.get(draftId);
      rows.set(draftId, {
        draftId,
        updatedAt: iso(),
        contentHash: JSON.stringify(document),
        document,
        layout
      });
      return previous;
    };
    // A layout save moves updated_at only.
    const saveLayout = draftId => { rows.get(draftId).updatedAt = iso(); };
    let fetched = 0;
    const runs = [];
    const jobs = createLayoutPassJobs({
      run: options => new Promise((resolve, reject) => runs.push({ options, resolve, reject })),
      now: iso
    });
    const statePath = join(dir, "auto-layout-pass.json");
    // Published rows by puzzle id, for working copies of published puzzles.
    const published = new Map();
    let publishedReadFails = false;
    const make = () => createAutoLayoutWatcher({
      getPublished: async puzzleId => {
        if (publishedReadFails) throw new Error("D1 unavailable");
        return published.get(puzzleId) || null;
      },
      listChangedSince: async ({ since }) => [...rows.values()]
        .filter(row => row.updatedAt > since)
        .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
        .map(({ document: _document, layout: _layout, ...row }) => row),
      getDraft: async draftId => {
        fetched++;
        const row = rows.get(draftId);
        if (!row) throw Object.assign(new Error("gone"), { name: "DraftNotFoundError" });
        return { draftId, document: row.document, layout: row.layout };
      },
      jobs,
      jobKey: draftId => `draft:${draftId}`,
      base: "http://127.0.0.1:8787",
      statePath,
      settleMs: 5 * MINUTE,
      now: () => clock
    });

    // A working copy from before the first start is not swept up.
    save("old-copy", board(["a", "b", "c"]));
    clock += MINUTE;
    let watcher = make();
    await watcher.tick();
    clock += 10 * MINUTE;
    await watcher.tick();
    assert.equal(runs.length, 0, "an older working copy was laid out");

    // A new working copy waits until its board has held still long enough.
    clock += MINUTE;
    save("new-copy", board(["a", "b", "c"]));
    await watcher.tick();
    clock += 3 * MINUTE;
    save("new-copy", board(["a", "b", "c", "d"]));
    await watcher.tick();
    clock += 3 * MINUTE;
    await watcher.tick();
    assert.equal(runs.length, 0, "ran before the board settled");
    // A text-only save does not restart the wait.
    save("new-copy", board(["a", "b", "c", "d"], "Reworded."));
    clock += 2 * MINUTE + 1;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 1);
    assert.deepEqual(runs[0].options, {
      id: "draft:new-copy", write: true, base: "http://127.0.0.1:8787", draft: "new-copy"
    });
    assert.equal(jobs.get("draft:new-copy").trigger, "auto");

    // The pass's own layout saves do not set it off again, nor fetch the document.
    const fetchedBefore = fetched;
    saveLayout("new-copy");
    runs[0].resolve({ id: "new-copy", rows: [{ mode: "graph", defects: { total: 0 } }, { mode: "sets", defects: { total: 2 } }] });
    await tick();
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 1, "the pass's own save set off another run");
    assert.equal(fetched, fetchedBefore, "a layout-only save fetched the document");
    const state = await readAutoLayoutState(statePath);
    assert.equal(state.drafts["new-copy"].outcome, "done");
    assert.deepEqual(state.drafts["new-copy"].defects, { graph: 0, sets: 2 });
    // The puzzle list reads the same state: done on the current board.
    const listed = await readAutoLayoutStatuses({ statePath, jobs, jobKey: draftId => `draft:${draftId}`, settleMs: 5 * MINUTE });
    assert.deepEqual(listed.get("new-copy"), { state: "done", at: state.drafts["new-copy"].laidOutAt, defects: { graph: 0, sets: 2 } });
    assert.equal(listed.has("old-copy"), false, "an untracked working copy has no status");

    // A restart remembers what it laid out.
    watcher = make();
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 1, "a restart laid out the same board again");

    // A board change after a run lays it out again; runs are one at a time,
    // longest-waiting first.
    save("new-copy", board(["a", "b", "c", "d", "e"]));
    clock += MINUTE;
    save("second-copy", board(["x", "y", "z"]));
    clock += 5 * MINUTE;
    await watcher.tick();
    clock += 5 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 2);
    assert.equal(runs[1].options.draft, "new-copy");
    // A failure is kept, and that board is not retried.
    runs[1].reject(new Error("browser could not start"));
    await tick();
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 3);
    assert.equal(runs[2].options.draft, "second-copy");
    runs[2].resolve({ id: "second-copy", rows: [] });
    await tick();
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 3, "a failed board was retried without a change");
    const saved = JSON.parse(await readFile(statePath, "utf8"));
    assert.equal(saved.drafts["new-copy"].outcome, "failed: browser could not start");
    assert.deepEqual(autoLayoutStatus(saved.drafts["new-copy"], jobs.get("draft:new-copy")),
      { state: "failed", at: saved.drafts["new-copy"].laidOutAt, error: "browser could not start" });
    // A board changed since its last run reads as pending, due once settled.
    assert.deepEqual(autoLayoutStatus({ boardKey: "b", laidOutBoardKey: "a", boardChangedAt: "2026-10-17T12:00:00.000Z" }, null, { settleMs: 5 * MINUTE }),
      { state: "pending", expectedAt: "2026-10-17T12:05:00.000Z" });
    assert.equal(autoLayoutStatus({ boardKey: "a", laidOutBoardKey: "a", outcome: "done" }, { status: "running", startedAt: "t" }).state, "running");

    // A run the author started by hand is left alone, not doubled.
    save("third-copy", board(["p", "q", "r"]));
    jobs.start("draft:third-copy", { write: false, base: "x", draft: "third-copy" });
    await tick();
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 4);
    assert.equal(runs[3].options.write, false);
    runs[3].resolve({ id: "third-copy", rows: [] });
    await tick();
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 5, "the hand-started run leaves the board for the watcher");
    runs[4].resolve({ id: "third-copy", rows: [] });
    await tick();
    await watcher.tick();

    // An author's layout in every mode: no run, no marker. Clearing one
    // (a layout-only save) gives the pass a mode to fill.
    const authored = { schemaVersion: 1, modes: { graph: { nodes: {} }, sets: { nodes: {} }, star: { nodes: {} } } };
    save("authored-copy", board(["m", "n", "o"]), authored);
    await watcher.tick();
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 5, "a working copy laid out by its author was run");
    const statusOf = async draftId => (await readAutoLayoutStatuses({
      statePath, jobs, jobKey: id => `draft:${id}`, settleMs: 5 * MINUTE
    })).get(draftId);
    assert.equal(await statusOf("authored-copy"), undefined);
    rows.get("authored-copy").layout = { schemaVersion: 1, modes: { graph: { nodes: {} }, sets: { nodes: {} } } };
    saveLayout("authored-copy");
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.length, 6, "a cleared author layout did not bring the pass back");
    assert.equal(runs[5].options.draft, "authored-copy");
    runs[5].resolve({ id: "authored-copy", rows: [{ mode: "star", action: "saved", defects: { total: 0 } }] });
    await tick();
    await watcher.tick();
    assert.equal((await statusOf("authored-copy")).state, "done");

    // A run that kept an author's layout in every mode (inherited, so the
    // watcher could not tell beforehand) leaves nothing to review.
    save("inherited-copy", board(["s", "t", "u"]));
    await watcher.tick();
    clock += 10 * MINUTE;
    await watcher.tick();
    await tick();
    assert.equal(runs.at(-1).options.draft, "inherited-copy");
    runs.at(-1).resolve({ id: "inherited-copy", rows: ["graph", "sets", "star"].map(mode => ({ mode, action: "author layout kept", defects: { total: 0 } })) });
    await tick();
    await watcher.tick();
    assert.equal(await statusOf("inherited-copy"), undefined);

    // Entries recorded before the author-layout check get it once.
    const recorded = await readAutoLayoutState(statePath);
    save("older-entry", board(["v", "w", "x"]), authored);
    recorded.drafts["older-entry"] = { contentHash: rows.get("older-entry").contentHash, boardKey: "k", boardChangedAt: iso() };
    recorded.cursor = iso();
    await writeFile(statePath, JSON.stringify(recorded));
    const restarted = make();
    clock += 10 * MINUTE;
    const before = runs.length;
    await restarted.tick();
    await tick();
    assert.equal(runs.length, before, "an older entry laid out by its author was run");
    assert.equal((await readAutoLayoutState(statePath)).drafts["older-entry"].authorEveryMode, true);

    // A working copy of a published puzzle, first seen with the published
    // board and a layout for every mode it inherits (a batch run's), is
    // already laid out: no run, no marker. A different board, or a mode
    // with no layout, still gets the pass.
    const batchLayout = { schemaVersion: 1, modes: { graph: { source: "auto", nodes: {} }, sets: { source: "auto", nodes: {} }, star: { source: "auto", nodes: {} } } };
    const publishedBoard = id => ({ ...board(["g", "h", "i"]), id });
    for (const id of ["same-board", "new-board", "missing-mode"]) {
      published.set(id, {
        document: publishedBoard(id),
        layout: id === "missing-mode"
          ? { schemaVersion: 1, modes: { graph: { source: "auto", nodes: {} } } }
          : batchLayout
      });
    }
    const runsBefore = runs.length;
    save("same-board", { ...publishedBoard("same-board"), clusters: [{ ...publishedBoard("same-board").clusters[0], fact: "A provenance-only or text edit." }] });
    save("new-board", { ...board(["g", "h", "i", "j"]), id: "new-board" });
    save("missing-mode", publishedBoard("missing-mode"));
    await restarted.tick();
    clock += 10 * MINUTE;
    for (let i = 0; i < 3; i++) {
      await restarted.tick();
      await tick();
      const pending = runs.slice(runsBefore).find(run => !run.settled);
      if (pending) {
        pending.settled = true;
        pending.resolve({ id: pending.options.draft, rows: [{ mode: "graph", action: "saved", defects: { total: 0 } }] });
        await tick();
      }
    }
    const laidOut = runs.slice(runsBefore).map(run => run.options.draft).sort();
    assert.deepEqual(laidOut, ["missing-mode", "new-board"], "the batch-laid-out working copy was run again");
    assert.equal((await readAutoLayoutStatuses({ statePath, jobs, jobKey: id => `draft:${id}`, settleMs: 5 * MINUTE })).get("same-board"), undefined);

    // An entry queued from its first sighting before this check gets it once.
    const queued = await readAutoLayoutState(statePath);
    published.set("queued-copy", { document: publishedBoard("queued-copy"), layout: batchLayout });
    save("queued-copy", publishedBoard("queued-copy"));
    queued.drafts["queued-copy"] = {
      contentHash: rows.get("queued-copy").contentHash,
      authorEveryMode: false,
      boardKey: boardKeyOf(publishedBoard("queued-copy")),
      boardChangedAt: iso()
    };
    queued.cursor = iso();
    await writeFile(statePath, JSON.stringify(queued));
    const upgraded = make();
    clock += 10 * MINUTE;
    const beforeUpgrade = runs.length;
    await upgraded.tick();
    await tick();
    assert.equal(runs.length, beforeUpgrade, "a queued batch-laid-out entry was run");
    assert.equal((await readAutoLayoutState(statePath)).drafts["queued-copy"].outcome, "already laid out");

    // A failed published read is retried, not taken as "not laid out".
    published.set("flaky-copy", { document: publishedBoard("flaky-copy"), layout: batchLayout });
    save("flaky-copy", publishedBoard("flaky-copy"));
    publishedReadFails = true;
    await assert.rejects(upgraded.tick());
    publishedReadFails = false;
    clock += 10 * MINUTE;
    const beforeRetry = runs.length;
    await upgraded.tick();
    await tick();
    assert.equal(runs.length, beforeRetry, "a copy whose published read failed once was run");
    assert.equal((await readAutoLayoutState(statePath)).drafts["flaky-copy"].outcome, "already laid out");

    // A copy with an author layout in every mode is not marked laid out by
    // that check, so clearing one of those layouts still brings the pass.
    const authorAll = { schemaVersion: 1, modes: { graph: { nodes: {} }, sets: { nodes: {} }, star: { nodes: {} } } };
    published.set("author-all", { document: publishedBoard("author-all"), layout: batchLayout });
    save("author-all", publishedBoard("author-all"), authorAll);
    await upgraded.tick();
    clock += 10 * MINUTE;
    await upgraded.tick();
    await tick();
    assert.notEqual((await readAutoLayoutState(statePath)).drafts["author-all"].outcome, "already laid out");
    const beforeClear = runs.length;
    rows.get("author-all").layout = { schemaVersion: 1, modes: { graph: { nodes: {} }, sets: { nodes: {} } } };
    saveLayout("author-all");
    clock += 10 * MINUTE;
    await upgraded.tick();
    await tick();
    assert.equal(runs.length, beforeClear + 1, "clearing an author layout did not bring the pass back");
    assert.equal(runs.at(-1).options.draft, "author-all");

    // The board key reads the board, not its storage form: a published
    // document's listed terms and bridge ids against a working copy's seeds
    // and floating terms, in another order, are the same board. Changing a
    // term, a cluster name, or a bridge's clusters is not.
    const publishedForm = {
      id: "forms",
      clusters: [
        { id: "a", name: "A", terms: ["x", "y", "z"], seeds: ["x", "y"], floatingTerms: ["z"] },
        { id: "b", name: "B", terms: ["p", "q"], seeds: ["p", "q"] }
      ],
      bridges: [{ id: "bridge-one", term: "bridge one", clusters: ["a", "b"] }]
    };
    const workingForm = {
      id: "forms",
      category: "moved by a classification edit",
      clusters: [
        { id: "a", name: "A", fact: "Reworded.", seeds: ["y", "z"], floatingTerms: ["x"] },
        { id: "b", name: "B", seeds: ["q", "p"] }
      ],
      bridges: [{ term: "bridge one", clusters: ["b", "a"], fact: "New fact." }]
    };
    assert.equal(boardKeyOf(workingForm), boardKeyOf(publishedForm), "storage form or a non-board edit counted as a board change");
    const changedTerm = structuredClone(workingForm);
    changedTerm.clusters[0].floatingTerms = ["w"];
    assert.notEqual(boardKeyOf(changedTerm), boardKeyOf(publishedForm));
    const renamed = structuredClone(workingForm);
    renamed.clusters[1].name = "Bee";
    assert.notEqual(boardKeyOf(renamed), boardKeyOf(publishedForm));
    const rerouted = structuredClone(workingForm);
    rerouted.bridges[0].clusters = ["a"];
    assert.notEqual(boardKeyOf(rerouted), boardKeyOf(publishedForm));

    // Keys stored in the old form are recomputed once; a board laid out
    // under the old key stays laid out.
    const legacy = await readAutoLayoutState(statePath);
    save("old-key", publishedBoard("old-key"));
    legacy.drafts["old-key"] = {
      contentHash: rows.get("old-key").contentHash,
      authorEveryMode: false,
      baselineChecked: true,
      boardKey: "an old-form key",
      laidOutBoardKey: "an old-form key",
      outcome: "done",
      boardChangedAt: iso()
    };
    legacy.cursor = iso();
    await writeFile(statePath, JSON.stringify(legacy));
    const rekeyed = make();
    // A later save that leaves the board alone must not look like a change.
    save("old-key", { ...publishedBoard("old-key"), category: "reclassified" });
    clock += 10 * MINUTE;
    const beforeRekey = runs.length;
    await rekeyed.tick();
    clock += 10 * MINUTE;
    await rekeyed.tick();
    await tick();
    assert.equal(runs.length, beforeRekey, "an old-form key made a laid-out board run again");
    const rekeyedEntry = (await readAutoLayoutState(statePath)).drafts["old-key"];
    assert.equal(rekeyedEntry.boardKey, boardKeyOf(publishedBoard("old-key")));
    assert.equal(rekeyedEntry.laidOutBoardKey, rekeyedEntry.boardKey);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
