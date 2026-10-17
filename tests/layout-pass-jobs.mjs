import assert from "node:assert/strict";
import { createLayoutPassJobs, layoutPassArgs, passFailureMessage } from "../modules/layoutPassJobs.js";
import { layoutPassSizePlan } from "../modules/layoutPassSizePlan.js";
import { startLayoutPass } from "../modules/layoutApi.js";

export const name = "layout pass jobs: one run per puzzle, kept until the next";

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

export async function run() {
  const runs = [];
  const jobs = createLayoutPassJobs({
    run: options => new Promise((resolve, reject) => runs.push({ options, resolve, reject })),
    now: () => "2026-10-08T00:00:00.000Z"
  });

  assert.deepEqual(jobs.get("alpha"), { status: "none" });

  const started = jobs.start("alpha", { write: false, base: "http://127.0.0.1:8787" });
  assert.equal(started.status, "running");
  assert.equal(started.write, false);
  await tick();
  assert.equal(runs.length, 1);
  assert.deepEqual(runs[0].options, { id: "alpha", write: false, base: "http://127.0.0.1:8787" });

  // A second press while it runs shows that run instead of starting another.
  const again = jobs.start("alpha", { write: true, base: "http://127.0.0.1:8787" });
  assert.equal(again.status, "running");
  assert.equal(again.write, false);
  await tick();
  assert.equal(runs.length, 1);

  runs[0].resolve({ id: "alpha", size: 1.1, rows: [] });
  await tick();
  const done = jobs.get("alpha");
  assert.equal(done.status, "done");
  assert.deepEqual(done.result, { id: "alpha", size: 1.1, rows: [] });
  assert.equal(done.finishedAt, "2026-10-08T00:00:00.000Z");

  // A failure keeps its message; the next start runs afresh.
  jobs.start("alpha", { write: true, base: "x" });
  await tick();
  runs[1].reject(new Error("browser could not start"));
  await tick();
  assert.equal(jobs.get("alpha").status, "failed");
  assert.equal(jobs.get("alpha").error, "browser could not start");
  assert.equal(jobs.start("alpha", { write: false, base: "x" }).status, "running");

  // Puzzles are independent.
  assert.equal(jobs.get("beta").status, "none");

  // A narrowed run keeps its modes and start size on the job, so Save can
  // repeat the dry run, and hands both to the pass.
  const scoped = jobs.start("gamma", { write: false, base: "x", modes: ["sets"], minSize: 1.1 });
  assert.deepEqual(scoped.modes, ["sets"]);
  assert.equal(scoped.minSize, 1.1);
  await tick();
  assert.deepEqual(runs.at(-1).options, { id: "gamma", write: false, base: "x", modes: ["sets"], minSize: 1.1 });
  const args = layoutPassArgs({ repositoryRoot: "/r", id: "gamma", write: true, base: "x", modes: ["sets", "star"], minSize: 1.1 });
  assert.deepEqual(args.slice(1), ["gamma", "--json", "--lanes", "1", "--base", "x", "--write", "--modes", "sets,star", "--min-size", "1.1"]);
  assert.deepEqual(layoutPassArgs({ repositoryRoot: "/r", id: "gamma", write: false, base: "x" }).slice(1),
    ["gamma", "--json", "--lanes", "1", "--base", "x"]);

  // The page's request names its scope; an explicit empty list still goes
  // to the server, which refuses it, rather than becoming an all-modes run.
  const sent = [];
  const fetchImpl = async (url, init) => {
    sent.push({ url, body: JSON.parse(init.body) });
    return new Response("{}", { status: 202 });
  };
  await startLayoutPass({ puzzleId: "gamma", draftId: "gamma-draft", modes: ["sets"], minSize: 1.1, fetchImpl });
  await startLayoutPass({ puzzleId: "gamma", modes: [], fetchImpl });
  await startLayoutPass({ puzzleId: "gamma", fetchImpl });
  assert.equal(sent[0].url, "/admin/puzzles/gamma/layouts-auto?draft=gamma-draft");
  assert.deepEqual(sent.map(request => request.body), [
    { write: false, modes: ["sets"], minSize: 1.1 },
    { write: false, modes: [] },
    { write: false }
  ]);

  // A failed run reports its first line, not the banner that ends it.
  assert.equal(passFailureMessage(
    "\nbrowserType.launch: Executable doesn't exist at /home/a/chrome\n╔════╗\n║ <3 Playwright Team ║\n╚════╝\n", 1
  ), "browserType.launch: Executable doesn't exist at /home/a/chrome");
  assert.equal(passFailureMessage("", 3), "layout pass exited with code 3");

  // Board size: a run over every mode starts at the start size and may
  // grow; one over some modes stays at it; an author's size, or an author's
  // layout in any mode (not only the modes run), keeps the saved size.
  const all = ["graph", "sets", "star"];
  assert.deepEqual(layoutPassSizePlan({ authorSize: false, saved: 1.15, modes: all }),
    { sizeIsOurs: true, base: 1, mayGrow: true });
  assert.deepEqual(layoutPassSizePlan({ authorSize: false, saved: 1.15, minSize: 1.1, modes: all }),
    { sizeIsOurs: true, base: 1.1, mayGrow: true });
  assert.deepEqual(layoutPassSizePlan({ authorSize: false, saved: 1.15, modes: ["sets"] }),
    { sizeIsOurs: true, base: 1.15, mayGrow: false });
  assert.deepEqual(layoutPassSizePlan({ authorSize: false, saved: 1.15, minSize: 1.2, modes: ["sets"] }),
    { sizeIsOurs: true, base: 1.2, mayGrow: false });
  assert.deepEqual(layoutPassSizePlan({ authorSize: true, saved: 1.05, minSize: 1.2, modes: all }),
    { sizeIsOurs: false, base: 1.05, mayGrow: false });
  assert.deepEqual(layoutPassSizePlan({ authorSize: false, authorModes: ["graph"], saved: 1, minSize: 1.1, modes: ["sets"] }),
    { sizeIsOurs: false, base: 1, mayGrow: false });
}
