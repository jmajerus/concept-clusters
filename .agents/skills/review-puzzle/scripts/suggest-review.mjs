#!/usr/bin/env node
// Pick or record corpus-review passes. D1 is the durable schedule; the local
// log retains outcome and guidance-version detail for the author's workspace.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHORING_GUIDANCE_VERSION } from "../../../../modules/authoringGuidanceVersion.js";
import { computeAuthoringFlags } from "../../../../modules/puzzleSymmetryFlags.js";
import { categorySummaries } from "../../../../modules/categoryDiscovery.js";
import { ensureAuthoringWorkspace } from "../../../../modules/authoringWorkspacePaths.js";
import { loadProjectEnv } from "../../../../modules/loadProjectEnv.js";
import { resolveLocalAuthoringWorkspace } from "../../../../modules/localAuthoringWorkspace.js";
import { ContentDocumentNotFoundError } from "../../../../modules/contentDocumentRepository.js";
import {
  CATEGORIES,
  GENERATED_SUBCATEGORY_IDS,
  puzzleBelongsToSubcategory
} from "../../../../puzzles/categories.js";
import { PUZZLES } from "../../../../puzzles/index.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

function reviewLogPath() {
  return ensureAuthoringWorkspace({ repositoryRoot: ROOT }).reviewLog;
}

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .agents/skills/review-puzzle/scripts/suggest-review.mjs
       [--category <slug>] [--subcategory <id>] [--count <n>] [--dry-run]
  node .agents/skills/review-puzzle/scripts/suggest-review.mjs --due
       [--category <slug>] [--subcategory <id>] [--dry-run]
  node .agents/skills/review-puzzle/scripts/suggest-review.mjs
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
  const path = reviewLogPath();
  if (!existsSync(path)) return { puzzles: {} };
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  return parsed && typeof parsed === "object" && parsed.puzzles
    ? parsed
    : { puzzles: {} };
}

function writeLog(log) {
  const path = reviewLogPath();
  const puzzles = Object.fromEntries(
    Object.entries(log.puzzles).sort(([a], [b]) => a.localeCompare(b))
  );
  writeFileSync(path, `${JSON.stringify({ puzzles }, null, 2)}\n`);
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

function classify(puzzle, log, version, published) {
  const entry = log.puzzles[puzzle.id];
  const flagged = computeAuthoringFlags(puzzle).length > 0;
  // Before migration/for an unpublished draft, the document timestamp remains
  // a stable fallback. Published puzzles receive this field from D1.
  const lastReviewedAt = published?.lastReviewedAt || published?.updatedAt || null;
  if (!entry) {
    return { due: "unreviewed", flagged, lastReviewedAt, guidance: null };
  }
  const guidance = recordedGuidance(entry);
  if (isStale(entry, version)) {
    return {
      due: "stale",
      flagged,
      lastReviewedAt,
      guidance
    };
  }
  return {
    due: null,
    flagged,
    lastReviewedAt,
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
    lastReviewedAt: status.lastReviewedAt,
    flagged: status.flagged,
    ...(status.guidance ? { guidance: status.guidance } : {})
  };
}

function reviewTime(item) {
  const value = Date.parse(item.lastReviewedAt || "");
  return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
}

function pickDue(available, { count }) {
  return [...available]
    .sort((left, right) => reviewTime(left) - reviewTime(right) || left.id.localeCompare(right.id))
    .slice(0, Math.min(count, available.length));
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

async function defaultContentDocuments() {
  const workspace = await resolveLocalAuthoringWorkspace({ repositoryRoot: ROOT });
  return workspace.contentDocuments;
}

async function recordPass(id, { outcome, version, dryRun, contentDocuments, now = () => new Date().toISOString() }) {
  id = puzzleId(id);
  const unpublished = !PUZZLES.some(item => item.id === id);
  const recorded = {
    reviewedAt: now(),
    outcome,
    guidance: version
  };
  if (!dryRun) {
    const repository = contentDocuments || await defaultContentDocuments();
    let durable = false;
    try {
      await repository.recordPuzzleReview({ id, reviewedAt: recorded.reviewedAt });
      durable = true;
    } catch (error) {
      // Reviews of a draft that has never been published still get a local
      // outcome record; they cannot enter the published-corpus schedule yet.
      if (!(error instanceof ContentDocumentNotFoundError)) throw error;
    }
    const log = readLog();
    log.puzzles[id] = recorded;
    writeLog(log);
    return {
      id, recorded, path: reviewLogPath(), wrote: true, durable,
      ...(unpublished ? { unpublished: true } : {})
    };
  }
  return {
    id, recorded, path: reviewLogPath(), wrote: false,
    ...(unpublished ? { unpublished: true } : {})
  };
}

function emit(payload, dryRun) {
  console.log(JSON.stringify(dryRun ? { dryRun: true, ...payload } : payload, null, 2));
}

export function assertSuggestArgs(args) {
  if (args.record && (args.due || args.category || args.subcategory || args.count)) {
    throw new Error("--record cannot be combined with pick flags.");
  }
  if (args.unchanged && !args.record) throw new Error("--unchanged requires --record <id>.");
  if (args.authored && !args.record) throw new Error("--authored requires --record <id>.");
  if (args.subcategory && !args.category) throw new Error("--subcategory requires --category.");
  if (args.count && args.due) throw new Error("--count cannot be combined with --due.");
}

export async function runSuggest(args, { contentDocuments = null, publishedRows = null } = {}) {
  assertSuggestArgs(args);
  const version = guidanceVersion();

  if (args.record) {
    return await recordPass(args.record, {
      outcome: recordOutcome(args),
      version,
      dryRun: !!args.dryRun,
      contentDocuments
    });
  }

  const category = args.category ? resolveCategory(args.category) : null;
  const subcategoryId = args.subcategory
    ? resolveSubcategory(category, args.subcategory)
    : null;
  const log = readLog();
  let rows = publishedRows;
  if (rows == null) {
    const repository = contentDocuments || await defaultContentDocuments();
    rows = await repository.listPublished({ kind: "puzzle" });
  }
  const publishedById = new Map(rows.map(row => [row.id, row]));
  const pool = members(category, subcategoryId).map(puzzle => {
    const status = classify(puzzle, log, version, publishedById.get(puzzle.id));
    return { puzzle, ...status, ...summarize(puzzle, status) };
  });
  const due = pool.filter(item => item.due);

  if (args.due) {
    return {
      filter: {
        category: category?.slug || null,
        subcategory: subcategoryId
      },
      guidance: version,
      unreviewed: due.filter(item => item.due === "unreviewed").length,
      stale: due.filter(item => item.due === "stale").length,
      current: pool.length - due.length,
      due: due.map(item => summarize(item.puzzle, item))
    };
  }

  const count = args.count ? Number(args.count) : 1;
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("--count must be a positive integer.");
  }
  // A no-parameter review is a recurring corpus sweep, not only a response
  // to a guidance bump.  Guidance status is reported, but age alone sets its
  // deterministic queue order.
  const picks = pickDue(pool, { count });

  const payload = {
    filter: {
      category: category?.slug || null,
      subcategory: subcategoryId
    },
    guidance: version,
    eligible: pool.length,
    unreviewed: due.filter(item => item.due === "unreviewed").length,
    stale: due.filter(item => item.due === "stale").length,
    picks: picks.map(item => summarize(item.puzzle, item))
  };
  if (args.dryRun) {
    payload.due = due.map(item => summarize(item.puzzle, item));
  }
  return payload;
}

export { parseArgs, recordPass };

function isMain() {
  try {
    return resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
  } catch {
    return false;
  }
}

if (isMain()) {
  loadProjectEnv({ repositoryRoot: ROOT });
  const args = parseArgs(process.argv.slice(2));
  try {
    assertSuggestArgs(args);
    emit(await runSuggest(args), args.dryRun);
  } catch (error) {
    usage(error.message);
  }
}
