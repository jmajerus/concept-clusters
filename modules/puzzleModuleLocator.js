// Shared "where does this puzzle live on disk" logic, extracted from
// contentFreezeApply.js and repositoryPublicationService.js, which each
// independently reimplemented the exact same walk/import/compare and
// path-construction logic. See docs/dev-briefs/
// separate-authoring-from-generated-puzzle-artifacts.md for why. This
// module intentionally has no opinion about D1, GitHub, or JSON-LD --
// just the filesystem shape of a puzzle module.
import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { slugify } from "../puzzles/categories.js";

export async function walkPuzzleModules(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "layouts") {
        paths.push(...await walkPuzzleModules(path));
      }
    } else if (entry.name.endsWith(".js") &&
        !["index.js", "categories.js", "showcase.js"].includes(entry.name)) {
      paths.push(path);
    }
  }
  return paths;
}

export async function existingPuzzleModule(repositoryRoot, id) {
  const puzzlesDir = join(repositoryRoot, "puzzles");
  for (const path of await walkPuzzleModules(puzzlesDir)) {
    const candidate = (await import(pathToFileURL(path).href)).default;
    if (candidate?.id === id) return path;
  }
  return null;
}

export async function currentFile(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export function defaultValidateRepository(root) {
  const validation = spawnSync(process.execPath, ["validate.mjs"], {
    cwd: root,
    encoding: "utf8"
  });
  if (validation.status !== 0) {
    throw new Error(
      `Repository validation failed:\n${validation.stdout}${validation.stderr}`
    );
  }
}

// Repo-relative, forward-slash path -- callers filesystem-side join it
// against a root (`join(repositoryRoot, puzzleModulePath(...))`); the
// GitHub-API-based publication path uses it directly, since it has no
// local filesystem to join against.
export function puzzleModulePath(category, id) {
  return `puzzles/${slugify(category)}/${id}.js`;
}
