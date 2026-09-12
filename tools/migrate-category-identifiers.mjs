#!/usr/bin/env node
// One-time migration for the category-reference schema.  Puzzle documents
// used to store display titles in category/categories/subcategories keys;
// canonical documents now store stable category ids.  Category documents are
// unchanged: their title remains display metadata and their id is the join.
//
// Preview everything:
//   npm run content:migrate-category-identifiers -- --git-only
// Apply D1 and Git source artifacts:
//   npm run content:migrate-category-identifiers -- --apply
// Apply only one side when the other is intentionally staged separately:
//   ... -- --apply-d1
//   ... -- --git-only --apply-git
//
// Immutable published/draft history rows are not rewritten.  Current D1 rows
// are updated with the normal optimistic-concurrency/history path, and the
// canonical Git JSON/JSON-LD artifacts plus generated puzzle modules are
// rewritten only when --apply-git is supplied.
import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  CATEGORIES,
  CATEGORY_REFERENCE_SCHEMA_VERSION,
  categoryIdFor
} from "../puzzles/categories.js";
import { mergeCategoryRegistry } from "../modules/authoringMcpTaxonomy.js";
import {
  formattedJson,
  generatedPuzzleModule
} from "../modules/publicationArtifacts.js";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import {
  applyD1Changes,
  loadD1Rows,
  loadGitRows
} from "./propagate-category-renames.mjs";
import { planCategoryReferenceMigration } from "../modules/categoryReferenceMigration.js";
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

function categoryRowsForRegistry(rows) {
  return rows
    // Category drafts are authoring work, not the shared taxonomy.  Use only
    // active published category documents when resolving titles/aliases for a
    // corpus migration; otherwise an unapproved draft rename could change
    // how unrelated puzzle rows are interpreted.
    .filter(row => row?.table === "published_documents"
      && row?.kind === "category"
      && !row?.row?.withdrawn_at
      && row?.document)
    .map(row => ({ document: row.document }));
}

async function applyGitChanges(changes, { generated = true, registry = CATEGORIES } = {}) {
  const canonical = changes.filter(change => change.table === "git");
  const interchange = changes.filter(change => change.table === "git-interchange");
  for (const change of [...canonical, ...interchange]) {
    await writeFile(change.path, formattedJson(change.after), "utf8");
  }
  let registryChanged = false;
  const registryPath = join(root, "puzzles", "index.js");
  let registrySource = await readFile(registryPath, "utf8");
  // The registry contains two hand-maintained cross-disciplinary overlays.
  // Their category values are part of the runtime corpus too, so convert
  // those literals alongside generated modules. The category registry file
  // itself intentionally remains title-keyed metadata for display.
  for (const [title, metadata] of Object.entries(registry || {})) {
    const id = categoryIdFor(title, registry);
    if (!id || id === title) continue;
    const quoted = JSON.stringify(title);
    if (!registrySource.includes(quoted)) continue;
    registrySource = registrySource.split(quoted).join(JSON.stringify(id));
    registryChanged = true;
  }
  if (registryChanged) await writeFile(registryPath, registrySource, "utf8");
  if (!generated || !canonical.length) {
    return {
      files: canonical.length + interchange.length + (registryChanged ? 1 : 0),
      modules: 0,
      registryChanged
    };
  }

  const manifestPath = join(root, "puzzles", "manifest.js");
  let manifest;
  try {
    ({ PUZZLE_MANIFEST: manifest } = await import(`${pathToFileURL(manifestPath).href}?category-id-migration`));
  } catch (error) {
    throw new Error(`Cannot load puzzles/manifest.js to update generated modules: ${error.message}`);
  }
  const byId = new Map((manifest || []).map(entry => [entry.id, entry]));
  let modules = 0;
  for (const change of canonical) {
    const entry = byId.get(change.id);
    if (!entry?.module) {
      throw new Error(`No manifest module for migrated puzzle "${change.id}"`);
    }
    const { puzzle, errors } = puzzleFromAuthoredDocument(change.after);
    if (!puzzle) {
      throw new Error(`Migrated puzzle "${change.id}" is not valid: ${errors.join("; ")}`);
    }
    const moduleRelative = `puzzles/${entry.module.replace(/^\.\//, "")}`;
    const canonicalRelative = relative(root, change.path).replaceAll("\\", "/");
    const modulePath = join(root, moduleRelative);
    await writeFile(
      modulePath,
      generatedPuzzleModule(puzzle, canonicalRelative, moduleRelative),
      "utf8"
    );
    modules += 1;
  }
  // Build in a fresh process so the generated modules and registry are not
  // hidden by ESM's import cache in this migration process.
  await execFileAsync(process.execPath, [join(root, "tools", "build-puzzle-manifest.mjs")], {
    cwd: root
  });
  return {
    files: canonical.length + interchange.length + (registryChanged ? 1 : 0),
    modules,
    registryChanged
  };
}

function summarize(changes) {
  const bySource = {};
  for (const change of changes) {
    bySource[change.source] = (bySource[change.source] || 0) + 1;
  }
  return bySource;
}

function uniqueUnresolved(items) {
  const seen = new Set();
  return items.filter(item => {
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
  console.log(`Category identifier migration (${report.applyD1 || report.applyGit ? "apply" : "dry-run"})`);
  console.log(`  D1 rows scanned: ${report.scanned.d1}; Git files scanned: ${report.scanned.git}`);
  console.log(`  D1 changes: ${report.changes.d1}; Git source changes: ${report.changes.git}`);
  console.log(`  Generated modules to rewrite: ${report.changes.generatedModules}`);
  if (report.unresolved.length) {
    console.log(`  Unresolved: ${report.unresolved.length}`);
    for (const item of report.unresolved.slice(0, 20)) {
      console.log(`    - ${item.source}/${item.id || "?"}: ${item.reason}`);
    }
  }
  if (report.changes.d1 && !report.applyD1) {
    console.log("\nRe-run with --apply-d1 (or --apply) after reviewing the report to update D1.");
  }
  if (report.changes.git && !report.applyGit) {
    console.log("Re-run with --apply-git (or --apply) to rewrite canonical Git artifacts and generated modules.");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let database = null;
  let d1 = { rows: [], unresolved: [] };
  if (!options.gitOnly) {
    database = createHttpD1Database(await resolveLocalD1Config({ repositoryRoot: root }));
    d1 = await loadD1Rows(database);
  }
  const git = await loadGitRows();
  const registry = mergeCategoryRegistry(
    CATEGORIES,
    categoryRowsForRegistry(d1.rows)
  );
  const d1Plan = planCategoryReferenceMigration({ registry, rows: d1.rows });
  const gitPlan = planCategoryReferenceMigration({ registry, rows: git.rows });
  const d1Changes = d1Plan.changes.filter(change => change.table !== "git" && change.table !== "git-interchange");
  const gitChanges = gitPlan.changes;
  const unresolved = uniqueUnresolved([
    ...d1.unresolved,
    ...git.unresolved,
    ...d1Plan.unresolved,
    ...gitPlan.unresolved
  ]);
  if ((options.applyD1 || options.applyGit) && unresolved.length) {
    throw new Error(`Refusing to apply with ${unresolved.length} unresolved row(s); resolve them first.`);
  }
  let appliedD1 = 0;
  let appliedGit = { files: 0, modules: 0 };
  if (options.applyD1) {
    if (!database) throw new Error("D1 apply requires credentials; omit --git-only.");
    appliedD1 = await applyD1Changes(database, d1Changes, {
      actor: "category-id-migration"
    });
  }
  if (options.applyGit) {
    appliedGit = await applyGitChanges(gitChanges, { registry });
  }
  const report = {
    applyD1: options.applyD1,
    applyGit: options.applyGit,
    schemaVersion: CATEGORY_REFERENCE_SCHEMA_VERSION,
    registry: { categoryCount: Object.keys(registry).length },
    scanned: { d1: d1.rows.length, git: git.rows.length },
    changes: {
      d1: d1Changes.length,
      git: gitChanges.length,
      generatedModules: new Set(gitChanges.filter(change => change.table === "git").map(change => change.id)).size,
      runtimeRegistry: appliedGit.registryChanged ? 1 : 0
    },
    applied: { d1: appliedD1, gitFiles: appliedGit.files, generatedModules: appliedGit.modules, runtimeRegistry: appliedGit.registryChanged ? 1 : 0 },
    bySource: summarize([...d1Changes, ...gitChanges]),
    unresolved,
    d1Changes: d1Changes.map(change => ({ source: change.source, kind: change.kind, id: change.id, ownerSubject: change.ownerSubject || null })),
    gitChanges: gitChanges.map(change => ({ source: change.source, id: change.id, path: change.path }))
  };
  render(report, options.json);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

export { applyGitChanges };
