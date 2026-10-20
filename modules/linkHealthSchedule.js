import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resolveAuthoringDataDir } from "./authoringWorkspacePaths.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import { runWikiLinkHealth } from "./wikiLinkCheck.js";

const MINUTE_MS = 60_000;

function mondaySlot(now) {
  const day = now.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  const slot = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysSinceMonday,
    6, 0, 0, 0
  ));
  if (now < slot) slot.setUTCDate(slot.getUTCDate() - 7);
  return slot;
}

function stampPath({ repositoryRoot, env }) {
  return join(resolveAuthoringDataDir({ repositoryRoot, env }), "link-health-last-run.txt");
}

function lastRunMs(path) {
  try {
    const text = readFileSync(path, "utf8").trim();
    const parsed = Date.parse(text);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

export function linkHealthDue(now = new Date(), previousMs = 0) {
  const slot = mondaySlot(now);
  return now >= slot && previousMs < slot.getTime();
}

// Monday 06:00 UTC, the same schedule the authoring Worker cron used.
// A restart after that hour still runs once for the week.
export function startWeeklyLinkHealth({
  repositoryRoot,
  env = process.env,
  enabled = true
} = {}) {
  if (!enabled) return () => {};
  const path = stampPath({ repositoryRoot, env });
  let timer = null;
  let running = false;

  async function tick() {
    if (running) return;
    if (!linkHealthDue(new Date(), lastRunMs(path))) return;
    running = true;
    try {
      const resolved = await resolveLocalAuthoringWorkspace({ repositoryRoot, env });
      if (!resolved.contentDocuments || !resolved.wikiLinkStore) return;
      await runWikiLinkHealth({
        contentDocuments: resolved.contentDocuments,
        store: resolved.wikiLinkStore
      });
      mkdirSync(resolveAuthoringDataDir({ repositoryRoot, env }), { recursive: true });
      writeFileSync(path, new Date().toISOString());
    } catch (error) {
      console.error("Link health sweep failed", error);
    } finally {
      running = false;
    }
  }

  timer = setInterval(() => {
    tick().catch(error => console.error("Link health sweep failed", error));
  }, MINUTE_MS);
  timer.unref?.();
  tick().catch(error => console.error("Link health sweep failed", error));
  return () => {
    if (timer) clearInterval(timer);
  };
}
