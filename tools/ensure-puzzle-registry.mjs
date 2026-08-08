#!/usr/bin/env node
// Ensure puzzles/index.js imports every puzzle module on disk.
//
// Hosted puzzle PRs intentionally omit puzzles/index.js so concurrent
// submissions do not conflict on GitHub (which does not honor merge=union).
// CI and a post-merge workflow run this tool to register any modules that are
// present on disk but missing from the registry. Local install_puzzle still
// splices the registry immediately; this script is idempotent either way.
//
// Cross-disciplinary *Source modules are already imported for wrappers, so
// path-based detection skips them without double registration.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerPuzzleSource } from "../modules/publicationArtifacts.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_NAMES = new Set(["index.js", "categories.js", "showcase.js"]);

async function walkPuzzleModules(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "layouts") {
        paths.push(...await walkPuzzleModules(path));
      }
    } else if (entry.name.endsWith(".js") && !SKIP_NAMES.has(entry.name)) {
      paths.push(path);
    }
  }
  return paths;
}

function importedModulePaths(registrySource) {
  const paths = new Set();
  const pattern = /from\s+"(\.\/[^"]+\.js)"/g;
  for (const match of registrySource.matchAll(pattern)) {
    paths.add(match[1].replace(/^\.\//, ""));
  }
  return paths;
}

export async function ensurePuzzleRegistry({
  repositoryRoot = ROOT,
  write = true
} = {}) {
  const registryPath = join(repositoryRoot, "puzzles", "index.js");
  const puzzlesRoot = join(repositoryRoot, "puzzles");
  let registry = await readFile(registryPath, "utf8");
  const alreadyImported = importedModulePaths(registry);
  const modules = (await walkPuzzleModules(puzzlesRoot)).sort();
  const added = [];

  for (const modulePath of modules) {
    const moduleRelative = relative(puzzlesRoot, modulePath).replaceAll("\\", "/");
    if (alreadyImported.has(moduleRelative)) continue;

    const puzzle = (await import(pathToFileURL(modulePath).href)).default;
    if (!puzzle?.id) {
      throw new Error(`Puzzle module missing id: ${moduleRelative}`);
    }

    registry = registerPuzzleSource(
      registry,
      puzzle,
      relative(repositoryRoot, modulePath).replaceAll("\\", "/")
    );
    alreadyImported.add(moduleRelative);
    added.push(puzzle.id);
  }

  if (write && added.length) {
    await writeFile(registryPath, registry, "utf8");
  }

  return { added, registry, registryPath };
}

const isCli = process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isCli) {
  const checkOnly = process.argv.includes("--check");
  const result = await ensurePuzzleRegistry({ write: !checkOnly });
  if (checkOnly) {
    if (result.added.length) {
      console.error(
        `puzzles/index.js is missing: ${result.added.join(", ")}`
      );
      process.exit(1);
    }
    console.log("puzzles/index.js is complete.");
  } else if (result.added.length) {
    console.log(`Registered ${result.added.join(", ")} in puzzles/index.js`);
  } else {
    console.log("puzzles/index.js already complete.");
  }
}
