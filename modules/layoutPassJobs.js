// Runs the automatic layout pass (tools/layouts-auto.mjs) for one puzzle at
// a time on behalf of the layout-authoring panel's Run layout pass and Save
// automatic layouts buttons. The pass drives a headless browser against this
// same local authoring server, so it runs as a child process; the panel
// starts it and polls for the result.

import { spawn } from "node:child_process";
import { join } from "node:path";

// npm passes flags it was given to child scripts as npm_config_*; the tool
// reads those, so strip them rather than let the dev server's own launch
// flags leak into a pass.
function cleanEnv(env) {
  return Object.fromEntries(Object.entries(env).filter(([key]) => !key.startsWith("npm_config_")));
}

/** Run the pass for one puzzle; resolves with that puzzle's result. */
export function spawnLayoutPass({ repositoryRoot, id, write, base, env = process.env }) {
  return new Promise((resolve, reject) => {
    const args = [join(repositoryRoot, "tools", "layouts-auto.mjs"), id, "--json", "--lanes", "1", "--base", base];
    if (write) args.push("--write");
    const child = spawn(process.execPath, args, { cwd: repositoryRoot, env: cleanEnv(env) });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", code => {
      if (code !== 0) {
        reject(new Error(stderr.trim().split("\n").slice(-3).join(" ") || `layout pass exited with code ${code}`));
        return;
      }
      try {
        const report = JSON.parse(stdout.trim().split("\n").pop());
        const puzzle = report.puzzles.find(entry => entry.id === id);
        if (!puzzle) throw new Error("the layout pass returned no result for this puzzle");
        if (puzzle.error) throw new Error(puzzle.error);
        resolve(puzzle);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * In-memory jobs, one per puzzle id: at most one run at a time per puzzle,
 * and the last finished run kept so a reload can still show it.
 */
export function createLayoutPassJobs({ run, now = () => new Date().toISOString() }) {
  const jobs = new Map();
  const view = job => (job ? { ...job } : { status: "none" });
  return {
    get(id) {
      return view(jobs.get(id));
    },
    start(id, { write = false, base }) {
      const current = jobs.get(id);
      if (current?.status === "running") return view(current);
      const job = {
        id,
        write: !!write,
        status: "running",
        startedAt: now(),
        finishedAt: null,
        result: null,
        error: null
      };
      jobs.set(id, job);
      Promise.resolve()
        .then(() => run({ id, write: !!write, base }))
        .then(result => {
          Object.assign(job, { status: "done", result, finishedAt: now() });
        }, error => {
          Object.assign(job, {
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
            finishedAt: now()
          });
        });
      return view(job);
    }
  };
}
