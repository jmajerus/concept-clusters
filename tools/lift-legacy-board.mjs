#!/usr/bin/env node
// One-time pass: published puzzle rows whose document still carries `board`
// get those settings lifted into their layout (modules/layoutDocument.js
// liftLegacyBoard), which leaves play unchanged. Publish, seed, and Freeze
// already store this canonical form; this catches the rows written before.
//
// Each lifted row gets a new published revision by `legacy-board-lift`; its
// freeze cue and lesson date are left alone. Working copies are not touched:
// publishing one lifts its `board` then, after the layout merge, which is the
// only order that keeps a newer layout save.
//
// Git catches up through Freeze, never here. --cue cues the lifted rows that
// match the git checkout apart from `board` and are not already cued by an
// author, so the next Freeze writes their canonical form. Rows that differ
// from git (held publishes, or git edits D1 does not have) are reported for
// a person to look at.
//
// Usage:
//   npm run content:lift-legacy-board
//   npm run content:lift-legacy-board -- --apply [--cue]
//   npm run content:lift-legacy-board -- --json

import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { draftContentHash, serializeDraftDocument } from "../modules/draftRepository.js";
import { createHttpD1Database } from "../modules/httpD1Database.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { resolveLocalD1Config } from "../modules/localD1Config.js";
import { isPendingFreezeCue } from "../modules/contentFreezePlan.js";
import {
  LAYOUT_BOARD_KEYS,
  liftLegacyBoard,
  parseLayoutDocument,
  serializeLayoutDocument
} from "../modules/layoutDocument.js";
import { draftMatchesCheckout, readCheckoutDocument } from "../modules/localDraftReview.js";

const root = fileURLToPath(new URL("..", import.meta.url));
loadProjectEnv({ repositoryRoot: root });

export const LIFT_ACTOR = "legacy-board-lift";

function parseArgs(argv) {
  const known = new Set(["--apply", "--cue", "--json"]);
  const unknown = argv.filter(arg => !known.has(arg));
  if (unknown.length) throw new Error(`Unknown argument: ${unknown.join(" ")}`);
  const options = {
    apply: argv.includes("--apply"),
    cue: argv.includes("--cue"),
    json: argv.includes("--json")
  };
  if (options.cue && !options.apply) throw new Error("--cue needs --apply.");
  return options;
}

async function queryRows(database, sql, params = []) {
  const result = await database.prepare(sql).bind(...params).all();
  return Array.isArray(result?.results) ? result.results : [];
}

function parsedObject(json) {
  try {
    const value = JSON.parse(json || "null");
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function hasBoard(json) {
  return Object.hasOwn(parsedObject(json) || {}, "board");
}

// A working copy's administration column is an envelope ({ board }) or, in
// older rows, the board object itself.
function draftCarriesBoard(json) {
  const value = parsedObject(json) || {};
  return Object.hasOwn(value, "board") || LAYOUT_BOARD_KEYS.some(key => Object.hasOwn(value, key));
}

/**
 * What the pass would do: one entry per live published puzzle that still
 * carries `board`, plus the working copies that do (reported only).
 * `readCheckout` returns the git canonical document for an id, or null.
 */
export async function planLegacyBoardLift({ publishedRows, draftRows = [], readCheckout }) {
  const rows = [];
  for (const row of publishedRows) {
    if (row.kind !== "puzzle" || row.withdrawn_at || !hasBoard(row.document)) continue;
    const document = JSON.parse(row.document);
    const layout = row.layout_json ? parseLayoutDocument(row.layout_json, `Layout for ${row.id}`) : null;
    const lift = liftLegacyBoard(document, layout);
    const checkout = await readCheckout(row.id);
    const authorCued = isPendingFreezeCue({
      cuedForFreezeAt: row.cued_for_freeze_at,
      cuedForFreezeBy: row.cued_for_freeze_by
    });
    rows.push({
      row,
      id: row.id,
      document: lift.document,
      layoutJson: lift.lifted.length ? serializeLayoutDocument(lift.layout) : row.layout_json ?? null,
      lifted: lift.lifted,
      // Settings the layout already decided, so the document's were unused.
      dropped: Object.keys(document.board || {}).filter(key => !lift.lifted.includes(key)),
      authorCued,
      matchesGit: Boolean(checkout) && draftMatchesCheckout(lift.document, checkout)
    });
  }
  const drafts = draftRows
    .filter(row => draftCarriesBoard(row.administration_json))
    .map(row => ({ id: row.id, ownerSubject: row.owner_subject || null }));
  return { rows, drafts };
}

export async function applyLegacyBoardLift(database, plan, { cue = false, now = new Date().toISOString() } = {}) {
  const cued = [];
  for (const item of plan.rows) {
    const documentJson = serializeDraftDocument(item.document);
    const contentHash = await draftContentHash(documentJson);
    const nextRevision = Number(item.row.revision) + 1;
    const cueNow = cue && item.matchesGit && !item.authorCued;
    const results = await database.batch([
      database.prepare(`
        UPDATE published_documents
        SET document = ?, content_hash = ?, layout_json = ?, revision = ?, updated_at = ?
        WHERE kind = 'puzzle' AND id = ? AND revision = ?
      `).bind(documentJson, contentHash, item.layoutJson, nextRevision, now, item.id, Number(item.row.revision)),
      database.prepare(`
        INSERT INTO published_document_revisions
          (kind, id, revision, document, content_hash, published_by, published_at)
        VALUES ('puzzle', ?, ?, ?, ?, ?, ?)
      `).bind(item.id, nextRevision, documentJson, contentHash, LIFT_ACTOR, now),
      ...(cueNow
        ? [database.prepare(`
            UPDATE published_documents
            SET cued_for_freeze_at = ?, cued_for_freeze_by = ?
            WHERE kind = 'puzzle' AND id = ? AND revision = ?
          `).bind(now, LIFT_ACTOR, item.id, nextRevision)]
        : [])
    ]);
    if (Number(results[0]?.meta?.changes || 0) !== 1) {
      throw new Error(`${item.id} changed while planning; re-run the dry run and retry.`);
    }
    if (cueNow) cued.push(item.id);
  }
  return { applied: plan.rows.length, cued };
}

function renderReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`Legacy board lift (${report.apply ? "apply" : "dry-run"})`);
  console.log(`  Published puzzles carrying board: ${report.rows.length}`);
  for (const row of report.rows) {
    const notes = [
      row.lifted.length ? `lift ${row.lifted.join(", ")}` : null,
      row.dropped.length ? `drop ${row.dropped.join(", ")} (layout already decides)` : null,
      row.authorCued ? "already cued" : row.matchesGit ? "matches git" : "differs from git"
    ].filter(Boolean);
    console.log(`    - ${row.id}: ${notes.join("; ")}`);
  }
  if (report.apply) {
    console.log(`  Lifted: ${report.applied}; cued for Freeze: ${report.cued.length}`);
  }
  console.log(`  Working copies still carrying board (lifted when published): ${report.drafts.length}`);
  for (const draft of report.drafts) console.log(`    - ${draft.id}`);
  const uncued = report.rows.filter(row => !row.authorCued && !report.cued.includes(row.id));
  if (!report.apply && report.rows.length) {
    console.log("\nRe-run with --apply to lift these rows; add --cue to cue the ones that match git.");
  } else if (uncued.length) {
    console.log(`\n${uncued.length} lifted row(s) are not cued, so git keeps their board until a person cues them.`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const database = createHttpD1Database(await resolveLocalD1Config({ repositoryRoot: root }));
  const publishedRows = await queryRows(database, "SELECT * FROM published_documents WHERE kind = 'puzzle' ORDER BY id");
  const draftRows = await queryRows(database, "SELECT id, owner_subject, administration_json FROM puzzle_drafts ORDER BY id");
  const plan = await planLegacyBoardLift({
    publishedRows,
    draftRows,
    readCheckout: id => readCheckoutDocument(root, id)
  });
  const result = options.apply
    ? await applyLegacyBoardLift(database, plan, { cue: options.cue })
    : { applied: 0, cued: [] };
  renderReport({
    apply: options.apply,
    applied: result.applied,
    cued: result.cued,
    rows: plan.rows.map(({ id, lifted, dropped, authorCued, matchesGit }) => ({
      id, lifted, dropped, authorCued, matchesGit
    })),
    drafts: plan.drafts
  }, options.json);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
