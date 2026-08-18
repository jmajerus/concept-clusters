#!/usr/bin/env node
// Ensure catalogues/index.js imports every catalogue module on disk.
//
// Hosted create_catalogue PRs intentionally omit catalogues/index.js so
// concurrent submissions do not conflict on GitHub (which does not honor
// merge=union) -- mirrors puzzles/index.js and
// tools/ensure-puzzle-registry.mjs. CI and a post-merge workflow run this
// tool to register any modules that are present on disk but missing from
// the registry.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerCatalogueSource } from "../modules/publicationArtifacts.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function importedModulePaths(registrySource) {
  const paths = new Set();
  const pattern = /from\s+"\.\/([^"]+\.js)"/g;
  for (const match of registrySource.matchAll(pattern)) {
    paths.add(match[1]);
  }
  return paths;
}

export async function ensureCatalogueRegistry({
  repositoryRoot = ROOT,
  write = true
} = {}) {
  const cataloguesRoot = join(repositoryRoot, "catalogues");
  const registryPath = join(cataloguesRoot, "index.js");
  let registry = await readFile(registryPath, "utf8");
  const alreadyImported = importedModulePaths(registry);
  const fileNames = (await readdir(cataloguesRoot))
    .filter(name => name.endsWith(".js") && name !== "index.js")
    .sort();
  const added = [];

  for (const fileName of fileNames) {
    if (alreadyImported.has(fileName)) continue;

    const modulePath = join(cataloguesRoot, fileName);
    const catalogue = (await import(pathToFileURL(modulePath).href)).default;
    if (!catalogue?.id) {
      throw new Error(`Catalogue module missing id: catalogues/${fileName}`);
    }

    registry = registerCatalogueSource(registry, catalogue.id, `catalogues/${fileName}`);
    alreadyImported.add(fileName);
    added.push(catalogue.id);
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
  const result = await ensureCatalogueRegistry({ write: !checkOnly });
  if (checkOnly) {
    if (result.added.length) {
      console.error(
        `catalogues/index.js is missing: ${result.added.join(", ")}`
      );
      process.exit(1);
    }
    console.log("catalogues/index.js is complete.");
  } else if (result.added.length) {
    console.log(`Registered ${result.added.join(", ")} in catalogues/index.js`);
  } else {
    console.log("catalogues/index.js already complete.");
  }
}
