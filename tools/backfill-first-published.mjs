#!/usr/bin/env node
// One-time pass: published puzzles seeded into D1 from git took the seed time
// as `first_published_at`, so the player's lesson line dates them to the seed
// instead of their real first publication. The committed puzzles/manifest.js
// still records each puzzle's first git add as `published`; this moves
// `first_published_at` back to that day wherever it is earlier. A date is
// only ever moved earlier, so a correct date is left as it is.
//
// Run it while puzzles/manifest.js still carries `published`: it is the only
// copy of those dates.
//
// Usage:
//   npm run content:backfill-first-published
//   npm run content:backfill-first-published -- --apply
//   npm run content:backfill-first-published -- --json

import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHttpD1Database } from "../modules/httpD1Database.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { resolveLocalD1Config } from "../modules/localD1Config.js";

const root = fileURLToPath(new URL("..", import.meta.url));

function parseArgs(argv) {
  const known = new Set(["--apply", "--json"]);
  const unknown = argv.filter(arg => !known.has(arg));
  if (unknown.length) throw new Error(`Unknown argument: ${unknown.join(" ")}`);
  return { apply: argv.includes("--apply"), json: argv.includes("--json") };
}

/** The manifest's first-publication day per puzzle id, as an ISO timestamp. */
export function manifestFirstPublished(manifest) {
  const dates = new Map();
  for (const entry of manifest || []) {
    if (entry?.id && /^\d{4}-\d{2}-\d{2}$/.test(entry.published || "")) {
      dates.set(entry.id, `${entry.published}T00:00:00.000Z`);
    }
  }
  return dates;
}

/**
 * One change per published puzzle whose recorded first publication falls on
 * a later day than the manifest's (or is missing). A real D1 publication on
 * the manifest's own day keeps its time.
 */
export function planFirstPublishedBackfill({ publishedRows, manifestDates }) {
  const changes = [];
  let unchanged = 0;
  const undated = [];
  for (const row of publishedRows) {
    if (row.kind !== "puzzle") continue;
    const day = manifestDates.get(row.id);
    if (!day) {
      undated.push(row.id);
      continue;
    }
    const current = row.first_published_at || null;
    if (current && current.slice(0, 10) <= day.slice(0, 10)) {
      unchanged += 1;
      continue;
    }
    changes.push({ id: row.id, from: current, to: day });
  }
  return { changes, unchanged, undated };
}

// Each write is conditional on the value it was planned from, so a row that
// changed since is skipped and reported rather than overwritten.
export async function applyFirstPublishedBackfill(database, changes) {
  const applied = [];
  const skipped = [];
  for (const change of changes) {
    const result = await database.prepare(`
      UPDATE published_documents SET first_published_at = ?
      WHERE kind = 'puzzle' AND id = ? AND first_published_at IS ?
    `).bind(change.to, change.id, change.from).run();
    if (Number(result?.meta?.changes || 0) === 1) applied.push(change.id);
    else skipped.push(change.id);
  }
  return { applied, skipped };
}

function renderReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`First-publication backfill (${report.apply ? "apply" : "dry-run"})`);
  console.log(`  Moved earlier: ${report.changes.length}; already right: ${report.unchanged}; no manifest date: ${report.undated.length}`);
  for (const change of report.changes.slice(0, 15)) {
    console.log(`    - ${change.id}: ${change.from || "none"} -> ${change.to.slice(0, 10)}`);
  }
  if (report.changes.length > 15) console.log(`    ... ${report.changes.length - 15} more`);
  if (report.undated.length) console.log(`  Without a manifest date (left as is): ${report.undated.join(", ")}`);
  if (report.apply) {
    console.log(`  Applied: ${report.applied.length}`);
    if (report.skipped.length) console.log(`  Skipped, changed since planning (run again): ${report.skipped.join(", ")}`);
  } else if (report.changes.length) {
    console.log("\nRe-run with --apply to write these dates.");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { PUZZLE_MANIFEST } = await import(pathToFileURL(join(root, "puzzles", "manifest.js")).href);
  const manifestDates = manifestFirstPublished(PUZZLE_MANIFEST);
  if (!manifestDates.size) {
    throw new Error("puzzles/manifest.js carries no `published` dates; run this before they are removed.");
  }
  const database = createHttpD1Database(await resolveLocalD1Config({ repositoryRoot: root }));
  const publishedRows = (await database.prepare(
    "SELECT kind, id, first_published_at FROM published_documents WHERE kind = 'puzzle' ORDER BY id"
  ).all()).results || [];
  const plan = planFirstPublishedBackfill({ publishedRows, manifestDates });
  const result = options.apply
    ? await applyFirstPublishedBackfill(database, plan.changes)
    : { applied: [], skipped: [] };
  renderReport({ apply: options.apply, ...plan, ...result }, options.json);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  // Only when run as a command: importing this module (as tests do) must
  // not load the real .env into process.env.
  loadProjectEnv({ repositoryRoot: root });
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
