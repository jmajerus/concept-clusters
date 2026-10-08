import assert from "node:assert/strict";
import { createLayoutPassJobs } from "../modules/layoutPassJobs.js";

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
}
