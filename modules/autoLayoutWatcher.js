// The automatic layout pass on new working copies. The authoring server
// checks D1 every so often for working copies changed since it last looked;
// when one's board (clusters, terms, bridges) has held still for a while, it
// runs the layout pass on that working copy (tools/layouts-auto.mjs --draft
// --write) so the layout page opens on saved layouts instead of waiting for
// live searches. Automatic layouts never replace an author's.
//
// D1 has no change notifications, so this polls, cheaply: one small query
// for changed rows, and a document fetch only when a row's content hash has
// moved. A layout save moves updated_at but not the content hash, so the
// pass's own saves do not set it off again.
//
// Runs are one at a time (each is minutes of headless-browser work), under
// the same job keys the layout page reads (draft:<id>), so the page shows a
// queued, running, or finished pass. A run is tried once per board: a failed
// one waits for the next board change, or for the button.
//
// State lives in a small file in the authoring data directory, so a restart
// neither forgets what it has laid out nor sweeps up older working copies:
// the first start only watches changes made from then on.

import { readFile, rename, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { boardKey } from "./draftReviewDiff.js";

export const AUTO_LAYOUT_DEFAULTS = Object.freeze({
  pollMs: 60_000,
  settleMs: 5 * 60_000
});

/** AUTO_LAYOUT_SETTLE_MINUTES, else the default. */
export function autoLayoutSettleMs(env = process.env) {
  const minutes = Number(env.AUTO_LAYOUT_SETTLE_MINUTES);
  return env.AUTO_LAYOUT_SETTLE_MINUTES != null && env.AUTO_LAYOUT_SETTLE_MINUTES !== "" &&
    Number.isFinite(minutes) && minutes >= 0
    ? minutes * 60_000
    : AUTO_LAYOUT_DEFAULTS.settleMs;
}

const emptyState = now => ({ cursor: new Date(now).toISOString(), drafts: {} });

export async function readAutoLayoutState(path, now = Date.now()) {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    if (parsed && typeof parsed.cursor === "string" && parsed.drafts && typeof parsed.drafts === "object") {
      return parsed;
    }
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
  }
  return emptyState(now);
}

async function writeAutoLayoutState(path, state) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`);
  await rename(temporary, path);
}

/**
 * Where a working copy stands with the automatic pass, for the puzzle list:
 * "running", "pending" (its board changed since the last run: settling or
 * queued), "done" or "failed" on its current board, or null when the pass
 * has not seen it.
 */
export function autoLayoutStatus(entry, job, { settleMs = AUTO_LAYOUT_DEFAULTS.settleMs } = {}) {
  if (job?.status === "running") return { state: "running", since: job.startedAt };
  if (!entry?.boardKey) return null;
  if (entry.boardKey !== entry.laidOutBoardKey) {
    const due = Date.parse(entry.boardChangedAt) + settleMs;
    return { state: "pending", expectedAt: Number.isFinite(due) ? new Date(due).toISOString() : null };
  }
  if (entry.outcome === "done") return { state: "done", at: entry.laidOutAt, defects: entry.defects || null };
  return { state: "failed", at: entry.laidOutAt, error: String(entry.outcome || "").replace(/^failed: /, "") };
}

/** Every tracked working copy's status, by draft id. */
export async function readAutoLayoutStatuses({ statePath, jobs, jobKey, settleMs }) {
  const state = await readAutoLayoutState(statePath);
  const statuses = new Map();
  for (const [draftId, entry] of Object.entries(state.drafts)) {
    const status = autoLayoutStatus(entry, jobs.get(jobKey(draftId)), { settleMs });
    if (status) statuses.set(draftId, status);
  }
  return statuses;
}

/**
 * listChangedSince({ since }) and getDraft(draftId) read D1; jobs is the
 * layout pass registry (layoutPassJobs.js); jobKey(draftId) its key for a
 * working copy; base the URL the pass's browser reaches this server at.
 */
export function createAutoLayoutWatcher({
  listChangedSince,
  getDraft,
  jobs,
  jobKey,
  base,
  statePath,
  settleMs = AUTO_LAYOUT_DEFAULTS.settleMs,
  now = () => Date.now(),
  log = () => {}
}) {
  let state = null;
  // The working copy whose automatic run is in flight, and the board it ran on.
  let running = null;

  async function load() {
    state ||= await readAutoLayoutState(statePath, now());
    return state;
  }

  // Note what changed: a new content hash may be a new board.
  async function scan() {
    const rows = await listChangedSince({ since: state.cursor });
    for (const row of rows) {
      if (row.updatedAt > state.cursor) state.cursor = row.updatedAt;
      const entry = state.drafts[row.draftId] ||= {};
      if (row.contentHash === entry.contentHash) continue;
      let draft;
      try {
        draft = await getDraft(row.draftId);
      } catch (error) {
        if (error?.name !== "DraftNotFoundError") throw error;
        delete state.drafts[row.draftId];
        continue;
      }
      entry.contentHash = row.contentHash;
      const key = boardKey(draft.document);
      if (key !== entry.boardKey) {
        entry.boardKey = key;
        entry.boardChangedAt = new Date(now()).toISOString();
      }
    }
  }

  // Record how the run in flight ended, once it has.
  function settleRunning() {
    if (!running) return false;
    const job = jobs.get(jobKey(running.draftId));
    if (job.status === "running") return false;
    const entry = state.drafts[running.draftId];
    if (entry) {
      entry.laidOutBoardKey = running.boardKey;
      entry.laidOutAt = job.finishedAt || new Date(now()).toISOString();
      entry.outcome = job.status === "done" ? "done" : `failed: ${job.error || "unknown error"}`;
      // Problems left per mode, for the puzzle list's tooltip.
      entry.defects = job.status === "done"
        ? Object.fromEntries((job.result?.rows || []).map(row => [row.mode, row.defects?.total ?? null]))
        : null;
    }
    log(`Automatic layout pass for ${running.draftId}: ${entry?.outcome || job.status}.`);
    running = null;
    return true;
  }

  // The working copy that has waited longest since its board settled.
  function nextDue() {
    const t = now();
    let best = null;
    for (const [draftId, entry] of Object.entries(state.drafts)) {
      if (!entry.boardKey || entry.boardKey === entry.laidOutBoardKey) continue;
      const settledAt = Date.parse(entry.boardChangedAt) + settleMs;
      if (!(settledAt <= t)) continue;
      // A run the author started by hand is left to finish.
      if (jobs.get(jobKey(draftId)).status === "running") continue;
      if (!best || settledAt < best.settledAt) best = { draftId, entry, settledAt };
    }
    return best;
  }

  async function tick() {
    await load();
    await scan();
    settleRunning();
    if (!running) {
      const due = nextDue();
      if (due) {
        running = { draftId: due.draftId, boardKey: due.entry.boardKey };
        log(`Automatic layout pass for ${due.draftId} started.`);
        jobs.start(jobKey(due.draftId), { write: true, base, draft: due.draftId, trigger: "auto" });
      }
    }
    await writeAutoLayoutState(statePath, state);
  }

  return {
    tick,
    /** Polls until stop(); a failed check is logged and tried again later. */
    start({ pollMs = AUTO_LAYOUT_DEFAULTS.pollMs } = {}) {
      let timer = null;
      let stopped = false;
      const loop = async () => {
        try {
          await tick();
        } catch (error) {
          log(`Automatic layout pass check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        if (!stopped) {
          timer = setTimeout(loop, pollMs);
          timer.unref?.();
        }
      };
      loop();
      return () => {
        stopped = true;
        clearTimeout(timer);
      };
    }
  };
}
