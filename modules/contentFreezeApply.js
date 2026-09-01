// Apply a freeze plan to this git checkout: add/update cued D1 snapshots
// and delete withdrawn or git-only files. Admin Freeze on the LAN server
// is the production ship path. Hosted Workers have no checkout.
import { spawnSync } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  rmdir,
  unlink,
  writeFile
} from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { CATEGORIES, slugify } from "../puzzles/categories.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { puzzleForCanonicalPublication } from "./puzzleSimplified.js";
import {
  formattedJson,
  generatedCatalogueModule,
  generatedPuzzleModule,
  registerCatalogueSource,
  registerCategorySource,
  registerPuzzleSource,
  replaceCategorySource,
  unregisterCatalogueSource,
  unregisterCategorySource,
  unregisterPuzzleSource
} from "./publicationArtifacts.js";
import { freezePlanIsEmpty } from "./contentFreezePlan.js";

async function walkPuzzleModules(directory) {
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

async function existingPuzzleModule(repositoryRoot, id) {
  const puzzlesDir = join(repositoryRoot, "puzzles");
  for (const path of await walkPuzzleModules(puzzlesDir)) {
    const candidate = (await import(pathToFileURL(path).href)).default;
    if (candidate?.id === id) return path;
  }
  return null;
}

async function currentFile(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function relativePath(root, path) {
  return relative(root, path).replaceAll(sep, "/");
}

function categoryTitleForId(id) {
  for (const [name, meta] of Object.entries(CATEGORIES)) {
    if ((meta?.slug || slugify(name)) === id) return name;
  }
  return null;
}

function queueWrite(files, path, content) {
  files.set(path, content);
}

function categoryMetadataFromDocument(document) {
  const metadata = {
    slug: document.id
  };
  if (document.domain) metadata.domain = document.domain;
  if (document.info) metadata.info = document.info;
  if (document.subcategories) metadata.subcategories = document.subcategories;
  return metadata;
}

function defaultValidateRepository(root) {
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

export async function applyContentFreeze({
  plan,
  contentDocuments,
  repositoryRoot,
  validateRepository = defaultValidateRepository
} = {}) {
  if (!plan || freezePlanIsEmpty(plan)) {
    const error = new Error("Nothing is cued to freeze.");
    error.code = "ERR_FREEZE_EMPTY";
    throw error;
  }
  if (!contentDocuments) throw new Error("contentDocuments is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");

  const files = new Map();
  const originals = new Map();
  const deletes = [];

  async function remember(path) {
    if (!originals.has(path)) originals.set(path, await currentFile(path));
  }

  const puzzleRegistryPath = join(repositoryRoot, "puzzles", "index.js");
  const catalogueRegistryPath = join(repositoryRoot, "catalogues", "index.js");
  const categoriesPath = join(repositoryRoot, "puzzles", "categories.js");
  let puzzleRegistry = await currentFile(puzzleRegistryPath);
  let catalogueRegistry = await currentFile(catalogueRegistryPath);
  let categoriesSource = await currentFile(categoriesPath);
  if (puzzleRegistry == null) throw new Error("Missing puzzles/index.js");
  if (catalogueRegistry == null) throw new Error("Missing catalogues/index.js");
  if (categoriesSource == null) throw new Error("Missing puzzles/categories.js");
  await remember(puzzleRegistryPath);
  await remember(catalogueRegistryPath);
  await remember(categoriesPath);

  async function writePuzzle(id, { create }) {
    const published = await contentDocuments.getPublished({ kind: "puzzle", id });
    const { puzzle, errors } = puzzleFromAuthoredDocument(published.document);
    if (!puzzle) {
      throw new Error(`Puzzle "${id}" is not a valid freeze snapshot: ${errors.join("; ")}`);
    }
    const existing = await existingPuzzleModule(repositoryRoot, id);
    if (create && existing) {
      throw new Error(`Puzzle "${id}" is already a git module; freeze planned an add`);
    }
    const modulePath = existing || join(
      repositoryRoot,
      "puzzles",
      slugify(puzzle.category),
      `${id}.js`
    );
    const canonicalPath = join(repositoryRoot, "content", "puzzles", `${id}.ccpuzzle.json`);
    const canonicalRelative = relativePath(repositoryRoot, canonicalPath);
    const publishedShape = puzzleForCanonicalPublication(puzzle);
    await remember(canonicalPath);
    await remember(modulePath);
    queueWrite(files, canonicalPath, formattedJson(publishedShape.simplified));
    queueWrite(files, modulePath, generatedPuzzleModule(
      publishedShape.puzzle,
      canonicalRelative,
      relativePath(repositoryRoot, modulePath)
    ));
    if (existing && existing !== modulePath) {
      await remember(existing);
      deletes.push(existing);
    }
    if (!existing) {
      puzzleRegistry = registerPuzzleSource(
        puzzleRegistry,
        puzzle,
        relativePath(repositoryRoot, modulePath)
      );
    }
  }

  for (const id of plan.puzzles.add || []) {
    await writePuzzle(id, { create: true });
  }
  for (const id of plan.puzzles.update || []) {
    await writePuzzle(id, { create: false });
  }
  for (const id of plan.puzzles.remove || []) {
    const existing = await existingPuzzleModule(repositoryRoot, id);
    const canonicalPath = join(repositoryRoot, "content", "puzzles", `${id}.ccpuzzle.json`);
    await remember(canonicalPath);
    deletes.push(canonicalPath);
    if (existing) {
      await remember(existing);
      deletes.push(existing);
    }
    try {
      puzzleRegistry = unregisterPuzzleSource(puzzleRegistry, id);
    } catch (error) {
      if (existing) throw error;
    }
  }

  async function writeCatalogue(id, { create }) {
    const published = await contentDocuments.getPublished({ kind: "catalogue", id });
    const modulePath = join(repositoryRoot, "catalogues", `${id}.js`);
    const existed = await currentFile(modulePath);
    if (create && existed != null) {
      throw new Error(`Catalogue "${id}" is already a git module; freeze planned an add`);
    }
    await remember(modulePath);
    queueWrite(files, modulePath, generatedCatalogueModule(published.document));
    if (existed == null) {
      catalogueRegistry = registerCatalogueSource(
        catalogueRegistry,
        id,
        relativePath(repositoryRoot, modulePath)
      );
    }
  }

  for (const id of plan.catalogues.add || []) {
    await writeCatalogue(id, { create: true });
  }
  for (const id of plan.catalogues.update || []) {
    await writeCatalogue(id, { create: false });
  }
  for (const id of plan.catalogues.remove || []) {
    const modulePath = join(repositoryRoot, "catalogues", `${id}.js`);
    await remember(modulePath);
    deletes.push(modulePath);
    try {
      catalogueRegistry = unregisterCatalogueSource(catalogueRegistry, id);
    } catch (error) {
      if (originals.get(modulePath) != null) throw error;
    }
  }

  for (const id of plan.categories.add || []) {
    const published = await contentDocuments.getPublished({ kind: "category", id });
    categoriesSource = registerCategorySource(categoriesSource, {
      name: published.document.title,
      metadata: categoryMetadataFromDocument(published.document)
    });
  }
  for (const id of plan.categories.update || []) {
    const published = await contentDocuments.getPublished({ kind: "category", id });
    categoriesSource = replaceCategorySource(categoriesSource, {
      name: published.document.title,
      metadata: categoryMetadataFromDocument(published.document)
    });
  }
  for (const id of plan.categories.remove || []) {
    const published = await contentDocuments.getPublished({
      kind: "category",
      id
    }).catch(() => null);
    const name = published?.document?.title || categoryTitleForId(id);
    if (!name) {
      throw new Error(`Cannot remove category "${id}" without a title`);
    }
    categoriesSource = unregisterCategorySource(categoriesSource, name);
  }

  queueWrite(files, puzzleRegistryPath, puzzleRegistry);
  queueWrite(files, catalogueRegistryPath, catalogueRegistry);
  queueWrite(files, categoriesPath, categoriesSource);

  const written = [];
  try {
    for (const [path, content] of files) {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, "utf8");
      written.push({ path, original: originals.get(path) ?? null, deleted: false });
    }
    for (const path of deletes) {
      if (files.has(path)) continue;
      try {
        await unlink(path);
        written.push({ path, original: originals.get(path) ?? null, deleted: true });
        if (path.startsWith(join(repositoryRoot, "puzzles") + sep) && path.endsWith(".js")) {
          await rmdir(dirname(path)).catch(() => {});
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    await validateRepository(repositoryRoot);
  } catch (error) {
    for (const change of [...written].reverse()) {
      if (change.original == null || change.deleted) {
        await unlink(change.path).catch(() => {});
      } else {
        await mkdir(dirname(change.path), { recursive: true });
        await writeFile(change.path, change.original, "utf8");
      }
    }
    throw error;
  }

  return {
    frozen: true,
    plan,
    affectedPaths: [
      ...[...files.keys()].map(path => relativePath(repositoryRoot, path)),
      ...deletes.map(path => relativePath(repositoryRoot, path))
    ].filter((path, index, all) => all.indexOf(path) === index).sort()
  };
}
