#!/usr/bin/env node
// Legacy compatibility pass for category-title aliases. New puzzle documents
// store stable category ids; use tools/migrate-category-identifiers.mjs for
// the one-time title-to-id corpus migration. This older command remains for
// deployments that still have pre-migration title references and for syncing
// category metadata through the normal D1 → Freeze path. Held published rows
// remain untouched until they are cued.
//
// Usage:
//   npm run content:propagate-category-renames
//   npm run content:propagate-category-renames -- --apply
//   npm run content:propagate-category-renames -- --git-only --json

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CATEGORIES, slugify } from "../puzzles/categories.js";
import { mergeCategoryRegistry } from "../modules/authoringMcpTaxonomy.js";
import {
  MAX_WORKING_COPY_HISTORY,
  draftContentHash,
  serializeDraftDocument
} from "../modules/draftRepository.js";
import { createHttpD1Database } from "../modules/httpD1Database.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { resolveLocalD1Config } from "../modules/localD1Config.js";
import { planCategoryRenamePropagation } from "../modules/categoryRenamePropagation.js";
import { isCuedForFreeze } from "../modules/contentFreezePlan.js";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
loadProjectEnv({ repositoryRoot: root });

function parseArgs(argv) {
  return {
    apply: argv.includes("--apply"),
    gitOnly: argv.includes("--git-only"),
    json: argv.includes("--json")
  };
}

function parsedJson(value, label, unresolved) {
  try {
    return JSON.parse(value);
  } catch (error) {
    unresolved.push({ source: "d1", kind: label, id: null, reason: `invalid JSON: ${error.message}` });
    return null;
  }
}

async function queryRows(database, sql, params = []) {
  const result = await database.prepare(sql).bind(...params).all();
  return Array.isArray(result?.results) ? result.results : [];
}

export async function loadD1Rows(database) {
  const unresolved = [];
  const published = await queryRows(database, "SELECT * FROM published_documents ORDER BY kind, id");
  const contentDrafts = await queryRows(database, "SELECT * FROM content_drafts ORDER BY kind, id, owner_subject");
  const puzzleDrafts = await queryRows(database, "SELECT * FROM puzzle_drafts ORDER BY id, owner_subject");
  const publishedDocuments = published.map(row => ({
    source: "d1:published_documents",
    table: "published_documents",
    kind: row.kind,
    id: row.id,
    revision: Number(row.revision),
    ownerSubject: null,
    row,
    document: parsedJson(row.document, `published_documents:${row.kind}`, unresolved)
  }));
  const draftDocuments = contentDrafts.map(row => ({
    source: "d1:content_drafts",
    table: "content_drafts",
    kind: row.kind,
    id: row.id,
    revision: Number(row.revision),
    ownerSubject: row.owner_subject,
    row,
    document: parsedJson(row.document, `content_drafts:${row.kind}`, unresolved)
  }));
  const puzzleDraftDocuments = puzzleDrafts.map(row => ({
    source: "d1:puzzle_drafts",
    table: "puzzle_drafts",
    kind: "puzzle",
    id: row.id,
    revision: Number(row.revision),
    ownerSubject: row.owner_subject,
    row,
    document: parsedJson(row.document, "puzzle_drafts:puzzle", unresolved)
  }));
  return {
    published,
    contentDrafts,
    puzzleDrafts,
    rows: [...publishedDocuments, ...draftDocuments, ...puzzleDraftDocuments],
    unresolved
  };
}

export async function loadGitRows() {
  const unresolved = [];
  const directory = join(root, "content", "puzzles");
  let names = [];
  try {
    names = await readdir(directory);
  } catch (error) {
    unresolved.push({ source: "git", kind: "puzzle", id: null, reason: error.message });
    return { rows: [], unresolved };
  }
  const rows = [];
  for (const name of names.filter(item => /\.ccpuzzle\.json(?:ld)?$/.test(item)).sort()) {
    const interchange = name.endsWith(".ccpuzzle.jsonld");
    const path = join(directory, name);
    let text;
    try {
      text = await readFile(path, "utf8");
    } catch (error) {
      unresolved.push({ source: interchange ? "git-interchange" : "git", kind: "puzzle", id: name, reason: error.message });
      continue;
    }
    let document;
    try {
      document = JSON.parse(text);
    } catch (error) {
      unresolved.push({ source: interchange ? "git-interchange" : "git", kind: "puzzle", id: name, reason: `invalid JSON: ${error.message}` });
      continue;
    }
    rows.push({
      source: interchange ? "git-interchange:content/puzzles" : "git:content/puzzles",
      table: interchange ? "git-interchange" : "git",
      kind: "puzzle",
      id: document?.id || name.replace(/\.ccpuzzle\.json(?:ld)?$/, ""),
      path,
      ownerSubject: null,
      document
    });
  }
  return { rows, unresolved };
}

function activePublishedCategoryDocuments(rows) {
  return rows
    .filter(row => row.kind === "category" && !publishedRowState(row).withdrawnAt)
    .map(row => ({ row, document: row.document }))
    .filter(Boolean)
    .filter(item => item.document);
}

// D1 query rows use snake_case while content repositories expose camelCase.
// Normalize both shapes before applying the same cue semantics as Freeze.
function publishedRowState(row) {
  const source = row?.row || row || {};
  return {
    ...row,
    withdrawnAt: row?.withdrawnAt ?? source.withdrawn_at ?? null,
    cuedForFreezeAt: row?.cuedForFreezeAt
      ?? source.cued_for_freeze_at
      ?? source.ready_for_freeze_at
      ?? null,
    cuedForFreeze: row?.cuedForFreeze ?? source.cued_for_freeze ?? false,
    readyForFreezeAt: row?.readyForFreezeAt ?? source.ready_for_freeze_at ?? null,
    readyForFreeze: row?.readyForFreeze ?? source.ready_for_freeze ?? false
  };
}

export function isPublishedRowCuedForFreeze(row) {
  return isCuedForFreeze(publishedRowState(row));
}

export function isHeldPublishedRow(row) {
  const state = publishedRowState(row);
  return row?.table === "published_documents"
    && !state.withdrawnAt
    && !isCuedForFreeze(state);
}

function summarizeChanges(changes) {
  const bySource = {};
  const byKind = {};
  for (const change of changes) {
    bySource[change.source] = (bySource[change.source] || 0) + 1;
    byKind[change.kind] = (byKind[change.kind] || 0) + 1;
  }
  return { bySource, byKind };
}

export function gitCategoryRegistryChanges({ publishedCategories = [], gitCategories = CATEGORIES } = {}) {
  const changes = [];
  const bySlug = new Map(Object.entries(gitCategories).map(([title, metadata]) => [
    metadata?.slug || slugify(title),
    { title, metadata }
  ]));
  for (const row of publishedCategories) {
    // Held D1 rows are deliberately not production candidates. They can
    // remain in authoring play until an author cues them (or a later Freeze
    // includes them as a required dependency).
    if (!isPublishedRowCuedForFreeze(row)) continue;
    const document = row?.document;
    if (!document?.id || !document.title) continue;
    const current = bySlug.get(document.id);
    const previousTitles = Array.isArray(document.previousTitles)
      ? [...new Set(document.previousTitles)]
      : [];
    const gitPrevious = Array.isArray(current?.metadata?.previousTitles)
      ? [...new Set(current.metadata.previousTitles)]
      : [];
    if (!current
      || current.title !== document.title
      || JSON.stringify(gitPrevious) !== JSON.stringify(previousTitles)) {
      changes.push({
        source: "git:puzzles/categories.js",
        table: "git",
        kind: "category",
        id: document.id,
        path: join(root, "puzzles", "categories.js"),
        reason: current
          ? `registry entry ${current.title} differs from published D1 title/history`
          : "published D1 category is not registered in Git"
      });
    }
  }
  return changes;
}

function categoryRegistryVersion(rows = []) {
  return rows
    .filter(row => row?.kind === "category")
    .map(row => ({
      id: row.id || null,
      revision: Number(row.revision || 0),
      document: typeof row.document === "string" ? row.document : null,
      withdrawnAt: row.withdrawn_at || null
    }))
    .sort((left, right) => String(left.id).localeCompare(String(right.id)));
}

async function currentCategoryRegistryVersion(database) {
  return categoryRegistryVersion(await queryRows(
    database,
    "SELECT id, revision, document, withdrawn_at FROM published_documents WHERE kind = ? ORDER BY id",
    ["category"]
  ));
}

export async function applyD1Changes(
  database,
  changes,
  { actor = "corpus-propagation" } = {}
) {
  const historyRows = await queryRows(
    database,
    "SELECT draft_id, MAX(seq) AS seq FROM puzzle_draft_history GROUP BY draft_id"
  );
  const nextHistory = new Map(historyRows.map(row => [row.draft_id, Number(row.seq || 0)]));
  const operations = [];
  for (const change of changes.filter(item =>
    item.table !== "git" && item.table !== "git-interchange"
  )) {
    const now = new Date().toISOString();
    const documentJson = serializeDraftDocument(change.after);
    const contentHash = await draftContentHash(documentJson);
    const row = change.row;
    if (change.table === "published_documents") {
      const nextRevision = Number(row.revision) + 1;
      operations.push({
        id: `${change.kind}:${change.id}`,
        statements: [
          database.prepare(`
            UPDATE published_documents
            SET title = ?, document = ?, content_hash = ?, revision = ?, updated_at = ?
            WHERE kind = ? AND id = ? AND revision = ?
          `).bind(
            typeof change.after.title === "string" ? change.after.title : null,
            documentJson,
            contentHash,
            nextRevision,
            now,
            row.kind,
            row.id,
            Number(row.revision)
          ),
          database.prepare(`
            INSERT INTO published_document_revisions
              (kind, id, revision, document, content_hash, published_by, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            row.kind,
            row.id,
            nextRevision,
            documentJson,
            contentHash,
            actor,
            now
          )
        ],
        updateIndex: 0
      });
      continue;
    }
    if (change.table === "content_drafts") {
      operations.push({
        id: `${change.kind}:${change.id}:${row.owner_subject}`,
        statements: [
          database.prepare(`
            UPDATE content_drafts
            SET title = ?, document = ?, content_hash = ?, revision = revision + 1, updated_at = ?
            WHERE kind = ? AND id = ? AND owner_subject = ? AND revision = ?
          `).bind(
            typeof change.after.title === "string" ? change.after.title : null,
            documentJson,
            contentHash,
            now,
            row.kind,
            row.id,
            row.owner_subject,
            Number(row.revision)
          )
        ],
        updateIndex: 0
      });
      continue;
    }
    if (change.table === "puzzle_drafts") {
      const seq = (nextHistory.get(row.id) || 0) + 1;
      nextHistory.set(row.id, seq);
      operations.push({
        id: `puzzle_draft:${row.id}:${row.owner_subject}`,
        statements: [
          database.prepare(`
            UPDATE puzzle_drafts
            SET puzzle_id = ?, title = ?, document = ?, content_hash = ?,
                revision = revision + 1, validation_json = NULL, updated_at = ?
            WHERE id = ? AND owner_subject = ? AND revision = ?
          `).bind(
            typeof change.after.id === "string" ? change.after.id : null,
            typeof change.after.title === "string" ? change.after.title : null,
            documentJson,
            contentHash,
            now,
            row.id,
            row.owner_subject,
            Number(row.revision)
          ),
          database.prepare(`
            INSERT INTO puzzle_draft_history
              (draft_id, seq, document, content_hash, saved_at)
            VALUES (?, ?, ?, ?, ?)
          `).bind(row.id, seq, row.document, row.content_hash, now),
          ...(seq > MAX_WORKING_COPY_HISTORY
            ? [database.prepare(`
                DELETE FROM puzzle_draft_history WHERE draft_id = ? AND seq <= ?
              `).bind(row.id, seq - MAX_WORKING_COPY_HISTORY)]
            : [])
        ],
        updateIndex: 0
      });
    }
  }

  let applied = 0;
  const maxStatements = 80;
  let batch = [];
  let offsets = [];
  async function flush() {
    if (!batch.length) return;
    const results = await database.batch(batch);
    for (const offset of offsets) {
      const result = results[offset.index];
      if (Number(result?.meta?.changes || 0) !== 1) {
        throw new Error(`Propagation OCC conflict while updating ${offset.id}; re-run the dry-run and retry.`);
      }
      applied += 1;
    }
    batch = [];
    offsets = [];
  }
  for (const operation of operations) {
    if (batch.length + operation.statements.length > maxStatements) await flush();
    const index = batch.length + operation.updateIndex;
    batch.push(...operation.statements);
    offsets.push({ index, id: operation.id });
  }
  await flush();
  return applied;
}

function renderReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`Category rename propagation (${report.apply ? "apply" : "dry-run"})`);
  console.log(`  Categories: ${report.registry.categoryCount}; aliases: ${report.registry.aliasCount}; conflicts: ${report.registry.conflictCount}`);
  console.log(`  D1 rows scanned: ${report.scanned.d1}; Git files scanned: ${report.scanned.git}`);
  if (report.skipped?.held) {
    console.log(`  Held published rows skipped: ${report.skipped.held}`);
  }
  console.log(`  D1 changes: ${report.changes.d1}; Git changes requiring Freeze: ${report.changes.git} (${report.changes.gitFiles} files)`);
  if (report.changes.jsonld) {
    console.log(`  JSON-LD interchange changes requiring a separate migration: ${report.changes.jsonld}`);
  }
  if (report.unresolved.length) {
    console.log(`  Unresolved: ${report.unresolved.length}`);
    for (const item of report.unresolved.slice(0, 20)) {
      console.log(`    - ${item.source}/${item.kind}/${item.id || "?"}: ${item.reason}`);
    }
    if (report.unresolved.length > 20) console.log(`    ... ${report.unresolved.length - 20} more`);
  }
  if (report.changes.d1 && !report.apply) {
    console.log("\nRe-run with --apply after reviewing the report to update D1.");
  }
  if (report.changes.git || report.changes.jsonld) {
    console.log("Git changes are intentionally not written here; cue affected documents and create a Freeze PR.");
    if (report.changes.jsonld) {
      console.log("Retained JSON-LD files are interchange artifacts and are not rewritten by Freeze.");
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let database = null;
  let d1 = { rows: [], unresolved: [], published: [] };
  if (!options.gitOnly) {
    database = createHttpD1Database(await resolveLocalD1Config({ repositoryRoot: root }));
    d1 = await loadD1Rows(database);
  }
  const git = await loadGitRows();
  const publishedCategories = activePublishedCategoryDocuments(
    d1.rows.filter(row => row.table === "published_documents")
  );
  const registry = mergeCategoryRegistry(CATEGORIES, publishedCategories);
  const d1Plan = planCategoryRenamePropagation({
    registry,
    // A held published snapshot is intentionally outside this one-time
    // production propagation pass. Drafts remain eligible and can be
    // canonicalized before their eventual publish/cue.
    rows: d1.rows.filter(row => !isHeldPublishedRow(row))
  });
  const gitRegistry = mergeCategoryRegistry(
    CATEGORIES,
    publishedCategories.filter(isPublishedRowCuedForFreeze)
  );
  const gitPlan = planCategoryRenamePropagation({
    registry: gitRegistry,
    rows: git.rows
  });
  const d1Changes = d1Plan.changes.filter(change =>
    change.table !== "git" && change.table !== "git-interchange"
  );
  const gitChanges = [
    ...gitPlan.changes.filter(change => change.table === "git"),
    ...gitCategoryRegistryChanges({
      publishedCategories,
      gitCategories: CATEGORIES
      })
  ];
  const interchangeChanges = gitPlan.changes.filter(change => change.table === "git-interchange");
  let applied = 0;
  if (options.apply) {
    if (!database) throw new Error("--apply requires D1; omit --git-only.");
    const unresolved = [
      ...d1.unresolved,
      ...git.unresolved,
      ...d1Plan.unresolved,
      ...gitPlan.unresolved
    ];
    if (unresolved.length) {
      throw new Error(`Refusing to apply with ${unresolved.length} unresolved row(s); run dry-run and resolve them first.`);
    }
    const initialCategoryVersion = categoryRegistryVersion(
      d1.published.filter(row => row.kind === "category")
    );
    const latestCategoryVersion = await currentCategoryRegistryVersion(database);
    if (JSON.stringify(initialCategoryVersion) !== JSON.stringify(latestCategoryVersion)) {
      throw new Error("Category registry changed while planning; re-run the dry-run and retry.");
    }
    applied = await applyD1Changes(database, d1Changes);
  }
  const finalGitChanges = [...gitChanges, ...interchangeChanges];
  const changeSummary = summarizeChanges([...d1Changes, ...finalGitChanges]);
  const gitFiles = new Set(gitChanges.map(change => change.path).filter(Boolean));
  const heldPublishedRows = d1.rows.filter(isHeldPublishedRow).length;
  const report = {
    apply: options.apply,
    registry: {
      categoryCount: Object.keys(registry).length,
      aliasCount: gitPlan.aliases.length,
      conflictCount: gitPlan.conflicts.length,
      aliases: gitPlan.aliases,
      conflicts: gitPlan.conflicts
    },
    scanned: { d1: d1.rows.length, git: git.rows.length },
    skipped: { held: heldPublishedRows },
    changes: {
      d1: d1Changes.length,
      git: gitChanges.length,
      gitFiles: gitFiles.size,
      jsonld: interchangeChanges.length
    },
    applied,
    bySource: changeSummary.bySource,
    byKind: changeSummary.byKind,
    unresolved: [
      ...d1.unresolved,
      ...git.unresolved,
      ...d1Plan.unresolved,
      ...gitPlan.unresolved
    ],
    d1Changes: d1Changes.map(change => ({
      source: change.source,
      kind: change.kind,
      id: change.id,
      ownerSubject: change.ownerSubject || null
    })),
    gitChanges: gitChanges.map(change => ({ id: change.id, path: change.path })),
    jsonldChanges: interchangeChanges.map(change => ({ id: change.id, path: change.path }))
  };
  renderReport(report, options.json);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
