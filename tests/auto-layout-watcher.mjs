import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { autoLayoutStatus, createAutoLayoutWatcher, readAutoLayoutState, readAutoLayoutStatuses } from "../modules/autoLayoutWatcher.js";
import { createLayoutPassJobs } from "../modules/layoutPassJobs.js";

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
    const make = () => createAutoLayoutWatcher({
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
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
