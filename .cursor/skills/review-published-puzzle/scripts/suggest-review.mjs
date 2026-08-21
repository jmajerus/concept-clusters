#!/usr/bin/env node
// Pick or record corpus-review passes. The review log is the map of when
// each puzzle last had a design-judgment pass, and at which major/minor
// guidance version. A later major bump marks those passes stale; minor
// bumps and typos do not.
import { randomInt } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHORING_GUIDANCE_VERSION } from "../../../../modules/authoringGuidanceVersion.js";
import { computeAuthoringFlags } from "../../../../modules/puzzleSymmetryFlags.js";
import { categorySummaries } from "../../../../modules/categoryDiscovery.js";
import {
  CATEGORIES,
  GENERATED_SUBCATEGORY_IDS,
  puzzleBelongsToSubcategory
} from "../../../../puzzles/categories.js";
import { PUZZLES } from "../../../../puzzles/index.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const LOG_PATH = join(
  ROOT,
  ".cursor/skills/review-published-puzzle/review-log.json"
);

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .cursor/skills/review-published-puzzle/scripts/suggest-review.mjs
       [--category <slug>] [--subcategory <id>] [--count <n>] [--dry-run]
  node .cursor/skills/review-published-puzzle/scripts/suggest-review.mjs --due
       [--category <slug>] [--subcategory <id>] [--dry-run]
  node .cursor/skills/review-published-puzzle/scripts/suggest-review.mjs
       --record <id> [--unchanged|--authored] [--dry-run]`);
  process.exit(message ? 1 : 0);
}

function parseArgs(raw) {
  const values = { ids: [] };
  for (let index = 0; index < raw.length; index++) {
    const arg = raw[index];
    if (arg === "--unchanged") values.unchanged = true;
    else if (arg === "--authored") values.authored = true;
    else if (arg === "--due") values.due = true;
    else if (arg === "--dry-run") values.dryRun = true;
    else if (arg === "--help" || arg === "-h") usage();
    else if (["--category", "--subcategory", "--record", "--count"].includes(arg)) {
      const value = raw[++index];
      if (!value) usage(`${arg} requires a value.`);
      values[arg.slice(2)] = value;
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else values.ids.push(arg);
  }
  return values;
}

function pick(items) {
  if (!items.length) throw new Error("No candidates to pick from");
  return items[randomInt(items.length)];
}

function guidanceVersion() {
  const { major, minor } = AUTHORING_GUIDANCE_VERSION;
  if (!Number.isInteger(major) || major < 1 || !Number.isInteger(minor) || minor < 0) {
    throw new Error("AUTHORING_GUIDANCE_VERSION must be { major >= 1, minor >= 0 }");
  }
  return { major, minor };
}

function recordedGuidance(entry) {
  const guidance = entry?.guidance;
  if (!guidance || !Number.isInteger(guidance.major)) return null;
  return { major: guidance.major, minor: guidance.minor ?? 0 };
}

function isStale(entry, version) {
  const recorded = recordedGuidance(entry);
  if (!recorded) return true;
  return recorded.major < version.major;
}

function readLog() {
  if (!existsSync(LOG_PATH)) return { puzzles: {} };
  const parsed = JSON.parse(readFileSync(LOG_PATH, "utf8"));
  return parsed && typeof parsed === "object" && parsed.puzzles
    ? parsed
    : { puzzles: {} };
}

function writeLog(log) {
  const puzzles = Object.fromEntries(
    Object.entries(log.puzzles).sort(([a], [b]) => a.localeCompare(b))
  );
  writeFileSync(LOG_PATH, `${JSON.stringify({ puzzles }, null, 2)}\n`);
}

function resolveCategory(value) {
  const summaries = categorySummaries(PUZZLES, CATEGORIES);
  const lower = value.toLowerCase();
  const match = summaries.find(category =>
    category.slug === value
    || category.slug === lower
    || category.name === value
    || category.name.toLowerCase() === lower
  );
  if (!match) {
    usage(
      `Unknown category "${value}". Use a category slug (e.g. biology, political-science).`
    );
  }
  return match;
}

function resolveSubcategory(category, value) {
  const ids = new Set([
    ...(category.subcategories || []).map(item => item.id),
    GENERATED_SUBCATEGORY_IDS.other
  ]);
  if (value === GENERATED_SUBCATEGORY_IDS.all) {
    usage(`Subcategory "${value}" means the whole category; omit --subcategory.`);
  }
  if (!ids.has(value)) {
    usage(
      `Unknown subcategory "${value}" for ${category.slug}. ` +
      `Valid: ${[...ids].sort().join(", ")}.`
    );
  }
  return value;
}

function hasCanonical(id) {
  return existsSync(join(ROOT, "content/puzzles", `${id}.ccpuzzle.json`));
}

function canonicalMtime(id) {
  try {
    return statSync(join(ROOT, "content/puzzles", `${id}.ccpuzzle.json`)).mtimeMs;
  } catch {
    return 0;
  }
}

function classify(puzzle, log, version) {
  const entry = log.puzzles[puzzle.id];
  const jsOnly = !hasCanonical(puzzle.id);
  const flagged = computeAuthoringFlags(puzzle).length > 0;
  if (!entry) {
    return { due: "unreviewed", jsOnly, flagged, reviewedAt: null, guidance: null };
  }
  const guidance = recordedGuidance(entry);
  if (isStale(entry, version)) {
    return {
      due: "stale",
      jsOnly,
      flagged,
      reviewedAt: entry.reviewedAt,
      guidance
    };
  }
  return {
    due: null,
    jsOnly,
    flagged,
    reviewedAt: entry.reviewedAt,
    guidance
  };
}

function members(category, subcategoryId) {
  return PUZZLES.filter(puzzle => {
    if (category && !puzzleBelongsToSubcategory(
      puzzle,
      category.name,
      subcategoryId || GENERATED_SUBCATEGORY_IDS.all
    )) return false;
    return true;
  });
}

function summarize(puzzle, status) {
  return {
    id: puzzle.id,
    title: puzzle.title,
    category: puzzle.category,
    due: status.due,
    reviewedAt: status.reviewedAt,
    jsOnly: status.jsOnly,
    flagged: status.flagged,
    ...(status.guidance ? { guidance: status.guidance } : {})
  };
}

function take(pool, predicate) {
  const matches = pool.filter(predicate);
  return matches.length ? pick(matches) : null;
}

function pickDue(available, { logEmpty, count }) {
  const target = Math.min(count, available.length);
  const chosen = [];
  const claim = item => {
    if (!item || chosen.some(existing => existing.id === item.id)) return;
    chosen.push(item);
  };
  if (logEmpty) {
    claim(take(available, item => item.jsOnly));
    claim(take(available, item => item.flagged));
    const recent = [...available]
      .filter(item => !item.jsOnly)
      .sort((a, b) => canonicalMtime(b.id) - canonicalMtime(a.id));
    if (recent.length) claim(recent[0]);
  }
  const preferred = [
    item => item.due === "unreviewed" && item.jsOnly,
    item => item.due === "unreviewed",
    item => item.due === "stale" && item.jsOnly,
    item => item.due === "stale"
  ];
  for (const predicate of preferred) {
    while (chosen.length < target) {
      const next = take(
        available.filter(item => !chosen.some(existing => existing.id === item.id)),
        predicate
      );
      if (!next) break;
      claim(next);
    }
  }
  return chosen.slice(0, target);
}

function puzzleId(value) {
  if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    usage(`Invalid puzzle id "${value}". Use kebab-case.`);
  }
  return value;
}

function recordOutcome(args) {
  if (args.authored && args.unchanged) {
    usage("--authored and --unchanged cannot be combined.");
  }
  if (args.authored) return "authored";
  if (args.unchanged) return "unchanged";
  return "changed";
}

function recordPass(id, { outcome, version, dryRun }) {
  id = puzzleId(id);
  const unpublished = !PUZZLES.some(item => item.id === id);
  const recorded = {
    reviewedAt: new Date().toISOString(),
    outcome,
    guidance: version
  };
  if (!dryRun) {
    const log = readLog();
    log.puzzles[id] = recorded;
    writeLog(log);
  }
  return {
    id,
    recorded,
    path: ".cursor/skills/review-published-puzzle/review-log.json",
    wrote: !dryRun,
    ...(unpublished ? { unpublished: true } : {})
  };
}

function emit(payload, dryRun) {
  console.log(JSON.stringify(dryRun ? { dryRun: true, ...payload } : payload, null, 2));
}

const args = parseArgs(process.argv.slice(2));
if (args.record && (args.due || args.category || args.subcategory || args.count)) {
  usage("--record cannot be combined with pick flags.");
}
if (args.unchanged && !args.record) usage("--unchanged requires --record <id>.");
if (args.authored && !args.record) usage("--authored requires --record <id>.");
if (args.subcategory && !args.category) usage("--subcategory requires --category.");
if (args.count && args.due) usage("--count cannot be combined with --due.");

const version = guidanceVersion();

if (args.record) {
  emit(recordPass(args.record, {
    outcome: recordOutcome(args),
    version,
    dryRun: !!args.dryRun
  }), args.dryRun);
  process.exit(0);
}

const category = args.category ? resolveCategory(args.category) : null;
const subcategoryId = args.subcategory
  ? resolveSubcategory(category, args.subcategory)
  : null;
const log = readLog();
const pool = members(category, subcategoryId).map(puzzle => {
  const status = classify(puzzle, log, version);
  return { puzzle, ...status, ...summarize(puzzle, status) };
});
const due = pool.filter(item => item.due);

if (args.due) {
  emit({
    filter: {
      category: category?.slug || null,
      subcategory: subcategoryId
    },
    guidance: version,
    unreviewed: due.filter(item => item.due === "unreviewed").length,
    stale: due.filter(item => item.due === "stale").length,
    current: pool.length - due.length,
    due: due.map(item => summarize(item.puzzle, item))
  }, args.dryRun);
  process.exit(0);
}

if (!due.length) {
  emit({
    filter: {
      category: category?.slug || null,
      subcategory: subcategoryId
    },
    guidance: version,
    picks: [],
    message: pool.length
      ? "Every puzzle in this filter already has a pass against current guidance."
      : "No puzzles in this filter."
  }, args.dryRun);
  process.exit(0);
}

const count = args.count ? Number(args.count) : 3;
if (!Number.isInteger(count) || count < 1) usage("--count must be a positive integer.");
const picks = pickDue(due, {
  logEmpty: Object.keys(log.puzzles).length === 0,
  count
});

const payload = {
  filter: {
    category: category?.slug || null,
    subcategory: subcategoryId
  },
  guidance: version,
  firstChunk: Object.keys(log.puzzles).length === 0,
  unreviewed: due.filter(item => item.due === "unreviewed").length,
  stale: due.filter(item => item.due === "stale").length,
  picks: picks.map(item => summarize(item.puzzle, item))
};
if (args.dryRun) {
  payload.due = due.map(item => summarize(item.puzzle, item));
}
emit(payload, args.dryRun);
