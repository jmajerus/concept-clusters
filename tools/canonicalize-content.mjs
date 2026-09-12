#!/usr/bin/env node

// One-time corpus migration to the canonical authored-content shape.
//
// Puzzle documents in D1 and Git may still contain the old JSON-LD envelope
// or legacy authored fields.  The canonical result is the simplified puzzle
// document used by MCP, D1, and content/puzzles/*.ccpuzzle.json.  JSON-LD
// remains available only through the explicit interchange commands.
//
// Preview everything:
//   npm run content:canonicalize -- --json
// Apply current D1 rows and Git source artifacts:
//   npm run content:canonicalize -- --apply
// Apply one side independently:
//   npm run content:canonicalize -- --apply-d1
//   npm run content:canonicalize -- --git-only --apply-git
//
// Immutable published revisions and puzzle working-copy history are not
// rewritten.  Current D1 rows use the normal revision/OCC path, while Git
// files and generated modules are changed transactionally after every source
// has passed the simplified schema gate.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CATEGORIES } from "../puzzles/categories.js";
import { mergeCategoryRegistry } from "../modules/authoringMcpTaxonomy.js";
import {
  applyOneChange,
  revertChanges
} from "../modules/repositoryChangeTransaction.js";
import { currentFile } from "../modules/puzzleModuleLocator.js";
import {
  formattedJson,
  generatedPuzzleModule
} from "../modules/publicationArtifacts.js";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import { canonicalizeCorpusRow } from "../modules/contentCanonicalization.js";
import {
  applyD1Changes,
  categoryRegistryVersion,
  currentCategoryRegistryVersion,
  loadD1Rows,
  loadGitRows
} from "./propagate-category-renames.mjs";
import { canonicalRuntimeRegistrySource } from "./migrate-category-identifiers.mjs";
import { createHttpD1Database } from "../modules/httpD1Database.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { resolveLocalD1Config } from "../modules/localD1Config.js";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const execFileAsync = promisify(execFile);
loadProjectEnv({ repositoryRoot: root });

function parseArgs(argv) {
  const apply = argv.includes("--apply");
  return {
    applyD1: apply || argv.includes("--apply-d1"),
    applyGit: apply || argv.includes("--apply-git"),
    gitOnly: argv.includes("--git-only"),
    json: argv.includes("--json")
  };
}

function relativePath(path) {
  return relative(root, path).replaceAll(sep, "/");
}

function categoryRowsForRegistry(rows = []) {
  return rows
    .filter(row => row?.table === "published_documents"
      && row?.kind === "category"
      && !row?.row?.withdrawn_at
      && row?.document)
    .map(row => ({ document: row.document }));
}

function planRows(rows, categoryRegistry) {
  const changes = [];
  const unresolved = [];
  const skipped = {};
  const byReason = {};
  const formats = {};

  for (const row of rows) {
    const result = canonicalizeCorpusRow(row, { categoryRegistry });
    if (result.skipped) {
      skipped[row?.kind || "unknown"] = (skipped[row?.kind || "unknown"] || 0) + 1;
      continue;
    }
    const source = row?.source || "unknown";
    const formatKey = `${source}:${result.sourceFormat || "unknown"}`;
    formats[formatKey] = (formats[formatKey] || 0) + 1;
    if (result.errors.length) {
      unresolved.push({
        source,
        kind: row?.kind || null,
        id: row?.id || null,
        reason: result.errors.join("; ")
      });
      continue;
    }
    // A puzzle working copy is keyed by its draft id, which may intentionally
    // differ from the puzzle id it contains (for example, a review variant).
    // Other current D1 documents use their content id as the row id.
    if (row?.table !== "puzzle_drafts"
      && row?.id
      && result.document?.id
      && row.id !== result.document.id) {
      unresolved.push({
        source,
        kind: row?.kind || null,
        id: row.id,
        reason: `document id "${result.document.id}" does not match row id "${row.id}"`
      });
      continue;
    }
    if (!result.changed) continue;
    for (const reason of result.reasons) {
      byReason[reason] = (byReason[reason] || 0) + 1;
    }
    changes.push({
      ...row,
      before: row.document,
      after: result.document,
      reasons: result.reasons
    });
  }
  return { changes, unresolved, skipped, byReason, formats };
}

function gitRowsById(rows = []) {
  const grouped = new Map();
  for (const row of rows) {
    if (row?.table !== "git" && row?.table !== "git-interchange") continue;
    const list = grouped.get(row.id) || [];
    list.push(row);
    grouped.set(row.id, list);
  }
  return grouped;
}

async function planGit(rows, categoryRegistry) {
  const changes = [];
  const unresolved = [];
  const byReason = {};
  const formats = {};
  const documents = new Map();
  const grouped = gitRowsById(rows);
  const sourceIds = new Set(grouped.keys());

  for (const [id, group] of grouped) {
    if (group.length !== 1) {
      unresolved.push({
        source: "git:content/puzzles",
        kind: "puzzle",
        id,
        reason: "multiple Git source files share this puzzle id; resolve the duplicate before migration",
        paths: group.map(row => relativePath(row.path))
      });
      continue;
    }
    const row = group[0];
    const result = canonicalizeCorpusRow(row, { categoryRegistry });
    const source = row.source || "git";
    const formatKey = `${source}:${result.sourceFormat || "unknown"}`;
    formats[formatKey] = (formats[formatKey] || 0) + 1;
    if (result.errors.length) {
      unresolved.push({
        source,
        kind: row.kind,
        id,
        reason: result.errors.join("; ")
      });
      continue;
    }
    if (result.document?.id && id !== result.document.id) {
      unresolved.push({
        source,
        kind: row.kind,
        id,
        reason: `document id "${result.document.id}" does not match source id "${id}"`
      });
      continue;
    }

    documents.set(id, {
      id,
      document: result.document,
      sourceFormat: result.sourceFormat,
      sourcePath: row.path,
      reasons: result.reasons
    });
    for (const reason of result.reasons) {
      byReason[reason] = (byReason[reason] || 0) + 1;
    }

    const canonicalPath = join(root, "content", "puzzles", `${id}.ccpuzzle.json`);
    const canonicalContent = formattedJson(result.document);
    const sourceContent = await currentFile(row.path);
    if (sourceContent === null) {
      unresolved.push({
        source,
        kind: row.kind,
        id,
        reason: `source file is no longer present: ${relativePath(row.path)}`
      });
      documents.delete(id);
      continue;
    }

    if (row.table === "git-interchange") {
      // A duplicate canonical .json was normally caught by grouped rows. The
      // explicit path check also protects against a malformed .json file that
      // loadGitRows reported as unresolved and therefore could not group.
      const existingCanonical = await currentFile(canonicalPath);
      if (existingCanonical !== null) {
        unresolved.push({
          source,
          kind: row.kind,
          id,
          reason: `canonical target already exists: ${relativePath(canonicalPath)}`
        });
        documents.delete(id);
        continue;
      }
      changes.push({
        path: canonicalPath,
        relativePath: relativePath(canonicalPath),
        original: null,
        content: canonicalContent,
        deleted: false,
        reasons: [...result.reasons, "jsonld-source-replaced"]
      });
      changes.push({
        path: row.path,
        relativePath: relativePath(row.path),
        original: sourceContent,
        content: null,
        deleted: false,
        reasons: ["jsonld-source-removed"]
      });
    } else if (sourceContent !== canonicalContent) {
      changes.push({
        path: canonicalPath,
        relativePath: relativePath(canonicalPath),
        original: sourceContent,
        content: canonicalContent,
        deleted: false,
        reasons: result.reasons.length ? result.reasons : ["serialized-format"]
      });
    }
  }

  let manifest;
  try {
    ({ PUZZLE_MANIFEST: manifest } = await import(
      `${pathToFileURL(join(root, "puzzles", "manifest.js")).href}?content-canonicalization`
    ));
  } catch (error) {
    unresolved.push({
      source: "git:puzzles/manifest.js",
      kind: "puzzle",
      id: null,
      reason: `cannot load puzzle manifest: ${error.message}`
    });
    manifest = [];
  }

  const manifestById = new Map((manifest || []).map(entry => [entry.id, entry]));
  for (const entry of manifest || []) {
    // If a source row exists but failed conversion, its own unresolved entry
    // is the useful diagnostic. Do not add a second "missing source" message
    // for the same id; that used to make one malformed puzzle look like two
    // independent migration failures.
    if (!documents.has(entry.id) && !sourceIds.has(entry.id)) {
      unresolved.push({
        source: "git:puzzles/manifest.js",
        kind: "puzzle",
        id: entry.id,
        reason: "manifest puzzle has no canonical content source"
      });
    }
  }
  for (const id of documents.keys()) {
    if (!manifestById.has(id)) {
      unresolved.push({
        source: "git:content/puzzles",
        kind: "puzzle",
        id,
        reason: "canonical content source is not registered in puzzles/manifest.js"
      });
    }
  }

  // Generated modules are rebuilt from the final canonical document set on
  // every Git apply. This also repairs a partially-applied prior run where
  // the source files were written before module validation failed.
  const modules = [];
  for (const [id, item] of [...documents.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const entry = manifestById.get(id);
    if (!entry) continue;
    if (!entry.module) {
      unresolved.push({
        source: "git:generated-module",
        kind: "puzzle",
        id,
        reason: "manifest entry has no generated module path"
      });
      continue;
    }
    const { puzzle, errors } = puzzleFromAuthoredDocument(item.document, {
      categoryRegistry
    });
    if (!puzzle) {
      unresolved.push({
        source: "git:generated-module",
        kind: "puzzle",
        id,
        reason: errors.join("; ")
      });
      continue;
    }
    const modulePath = join(root, "puzzles", entry.module.replace(/^\.\//, ""));
    const moduleContent = generatedPuzzleModule(
      puzzle,
      `content/puzzles/${id}.ccpuzzle.json`,
      relativePath(modulePath)
    );
    const original = await currentFile(modulePath);
    if (original === null) {
      unresolved.push({
        source: "git:generated-module",
        kind: "puzzle",
        id,
        reason: `manifest module is missing: ${relativePath(modulePath)}`
      });
      continue;
    }
    if (original !== moduleContent) {
      modules.push({
        path: modulePath,
        relativePath: relativePath(modulePath),
        original,
        content: moduleContent,
        deleted: false,
        reasons: ["generated-module"]
      });
    }
  }
  changes.push(...modules);

  const registryPath = join(root, "puzzles", "index.js");
  const registryOriginal = await currentFile(registryPath);
  let registryChange = null;
  if (registryOriginal !== null) {
    const runtime = canonicalRuntimeRegistrySource(registryOriginal, categoryRegistry);
    if (runtime.changed) {
      registryChange = {
        path: registryPath,
        relativePath: relativePath(registryPath),
        original: registryOriginal,
        content: runtime.source,
        deleted: false,
        reasons: ["runtime-category-identifiers"]
      };
      changes.push(registryChange);
      byReason["runtime-category-identifiers"] =
        (byReason["runtime-category-identifiers"] || 0) + 1;
    }
  } else {
    unresolved.push({
      source: "git:puzzles/index.js",
      kind: "puzzle",
      id: null,
      reason: "puzzles/index.js is missing"
    });
  }

  return {
    changes,
    documents,
    unresolved,
    byReason,
    formats,
    manifestCount: manifest?.length || 0,
    generatedModuleChanges: modules.length,
    registryChanged: !!registryChange
  };
}

async function validateRepository(rootPath) {
  // Run the same three repository checks an authoring release uses, rather
  // than only validate.mjs (which does not inspect category/info registries).
  for (const script of ["validate.mjs", "validate-categories.mjs", "validate-info-links.mjs"]) {
    try {
      await execFileAsync(process.execPath, [script], { cwd: rootPath });
    } catch (error) {
      const output = `${error.stdout || ""}${error.stderr || ""}`.trim();
      throw new Error(`Repository validation failed (${script}): ${output || error.message}`);
    }
  }
}

async function applyGitPlan(plan, { validate = validateRepository } = {}) {
  const manifestPath = join(root, "puzzles", "manifest.js");
  const manifestOriginal = await currentFile(manifestPath);
  const written = [];
  try {
    for (const change of plan.changes) {
      if (await currentFile(change.path) !== change.original) {
        throw new Error(`Canonicalization plan is stale because ${change.relativePath} changed; preview again.`);
      }
    }
    for (const change of plan.changes) {
      if (await applyOneChange(change)) written.push(change);
    }

    // Use a fresh process so ESM's module cache cannot hide the newly-written
    // generated modules or puzzles/index.js from manifest generation.
    await execFileAsync(process.execPath, [
      join(root, "tools", "build-puzzle-manifest.mjs")
    ], { cwd: root });
    const manifestAfter = await currentFile(manifestPath);
    if (manifestAfter !== manifestOriginal) {
      written.push({
        path: manifestPath,
        relativePath: relativePath(manifestPath),
        original: manifestOriginal,
        content: manifestAfter,
        deleted: false
      });
    }
    await validate(root);
  } catch (error) {
    await revertChanges(written);
    throw error;
  }
  return {
    files: written.length,
    manifestChanged: written.some(change => change.path === manifestPath)
  };
}

function mergeUnresolved(...lists) {
  const seen = new Set();
  return lists.flat().filter(item => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function render(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`Content canonicalization (${report.applyD1 || report.applyGit ? "apply" : "dry-run"})`);
  console.log(`  D1 rows scanned: ${report.scanned.d1}; Git files scanned: ${report.scanned.git}`);
  console.log(`  D1 changes: ${report.changes.d1}; Git file changes: ${report.changes.git}`);
  console.log(`  Generated modules: ${report.changes.generatedModules}; JSON-LD sources removed: ${report.changes.jsonldRemoved}`);
  if (report.unresolved.length) {
    console.log(`  Unresolved: ${report.unresolved.length}`);
    for (const item of report.unresolved.slice(0, 20)) {
      console.log(`    - ${item.source}/${item.kind || "?"}/${item.id || "?"}: ${item.reason}`);
    }
    if (report.unresolved.length > 20) {
      console.log(`    ... ${report.unresolved.length - 20} more`);
    }
  }
  if (report.changes.d1 && !report.applyD1) {
    console.log("\nRe-run with --apply-d1 (or --apply) after reviewing the report to update D1.");
  }
  if (report.changes.git && !report.applyGit) {
    console.log("Re-run with --apply-git (or --apply) after reviewing the report to rewrite Git sources and generated modules.");
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
  const registry = mergeCategoryRegistry(
    CATEGORIES,
    categoryRowsForRegistry(d1.rows)
  );
  const d1Plan = planRows(d1.rows, registry);
  const gitPlan = await planGit(git.rows, registry);
  const unresolved = mergeUnresolved(
    d1.unresolved,
    git.unresolved,
    d1Plan.unresolved,
    gitPlan.unresolved
  );

  const applyUnresolved = mergeUnresolved(
    ...(options.applyD1 ? [d1.unresolved, d1Plan.unresolved] : []),
    ...(options.applyGit ? [git.unresolved, gitPlan.unresolved] : [])
  );
  if (applyUnresolved.length) {
    const sides = [
      options.applyD1 ? "D1" : null,
      options.applyGit ? "Git" : null
    ].filter(Boolean).join(" and ");
    throw new Error(`Refusing to apply ${sides} with ${applyUnresolved.length} unresolved row(s); resolve them first.`);
  }

  let appliedD1 = 0;
  let appliedGit = { files: 0, manifestChanged: false };
  if (options.applyD1) {
    if (!database) throw new Error("D1 apply requires credentials; omit --git-only.");
    const initialCategoryVersion = categoryRegistryVersion(
      d1.published.filter(row => row.kind === "category")
    );
    const latestCategoryVersion = await currentCategoryRegistryVersion(database);
    if (JSON.stringify(initialCategoryVersion) !== JSON.stringify(latestCategoryVersion)) {
      throw new Error("Category registry changed while planning; re-run the dry-run and retry.");
    }
    appliedD1 = await applyD1Changes(database, d1Plan.changes, {
      actor: "content-canonicalization"
    });
  }
  if (options.applyGit) {
    appliedGit = await applyGitPlan(gitPlan);
  }

  const byReason = {};
  for (const source of [d1Plan.byReason, gitPlan.byReason]) {
    for (const [reason, count] of Object.entries(source)) {
      byReason[reason] = (byReason[reason] || 0) + count;
    }
  }
  const jsonldRemoved = gitPlan.changes.filter(change =>
    change.content === null && change.relativePath.endsWith(".ccpuzzle.jsonld")
  ).length;
  const report = {
    applyD1: options.applyD1,
    applyGit: options.applyGit,
    targetFormat: "simplified-v1",
    scanned: {
      d1: d1.rows.length,
      git: git.rows.length,
      manifest: gitPlan.manifestCount
    },
    changes: {
      d1: d1Plan.changes.length,
      git: gitPlan.changes.length,
      generatedModules: options.applyGit
        ? gitPlan.generatedModuleChanges
        : gitPlan.changes.filter(change => change.reasons?.includes("generated-module")).length,
      jsonldRemoved,
      runtimeRegistry: gitPlan.registryChanged ? 1 : 0,
      manifest: appliedGit.manifestChanged ? 1 : 0
    },
    applied: {
      d1: appliedD1,
      gitFiles: appliedGit.files,
      manifest: appliedGit.manifestChanged ? 1 : 0
    },
    byReason,
    formats: {
      d1: d1Plan.formats,
      git: gitPlan.formats
    },
    skipped: {
      d1: d1Plan.skipped
    },
    d1Changes: d1Plan.changes.map(change => ({
      source: change.source,
      table: change.table,
      kind: change.kind,
      id: change.id,
      ownerSubject: change.ownerSubject || null,
      reasons: change.reasons
    })),
    gitChanges: gitPlan.changes.map(change => ({
      path: change.relativePath,
      reasons: change.reasons || []
    })),
    unresolved
  };
  render(report, options.json);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

export {
  applyGitPlan,
  categoryRowsForRegistry,
  planGit,
  planRows
};
