// Materialize a freeze plan in this git checkout to validate its generated
// snapshots. The LAN admin can restore the checkout after validation and send
// the exact same changes to a tracked GitHub release PR. Hosted Workers have
// no checkout.
import { join, relative, sep } from "node:path";
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
import {
  freezePlanHasMissingDependencies,
  freezePlanIsEmpty
} from "./contentFreezePlan.js";
import {
  currentFile,
  defaultValidateRepository,
  existingPuzzleModule,
  puzzleModulePath
} from "./puzzleModuleLocator.js";
import { applyChangesAndValidate, revertChanges } from "./repositoryChangeTransaction.js";

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

export async function applyContentFreeze({
  plan,
  contentDocuments,
  repositoryRoot,
  validateRepository = defaultValidateRepository,
  keepChanges = true
} = {}) {
  if (freezePlanHasMissingDependencies(plan)) {
    const missing = plan.dependencies.missing
      .map(item => `${item.kind} "${item.id}"`)
      .join(", ");
    const error = new Error(`Cannot freeze: required supporting documents are missing: ${missing}`);
    error.code = "ERR_FREEZE_DEPENDENCY";
    throw error;
  }
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
    const modulePath = existing || join(repositoryRoot, puzzleModulePath(puzzle.category, id));
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

  // deleted:true marks these as always-unlink-on-rollback (matching this
  // function's own prior rollback behavior exactly); writes leave it
  // false so a rollback restores the pre-freeze content instead.
  const changes = [
    ...[...files.entries()].map(([path, content]) => ({
      path,
      relativePath: relativePath(repositoryRoot, path),
      content,
      original: originals.get(path) ?? null,
      deleted: false
    })),
    ...deletes.filter(path => !files.has(path)).map(path => ({
      path,
      relativePath: relativePath(repositoryRoot, path),
      content: null,
      original: originals.get(path) ?? null,
      deleted: true
    }))
  ];
  const written = await applyChangesAndValidate({ changes, validateRepository, repositoryRoot });

  const result = {
    frozen: true,
    plan,
    changes: changes.map(({ relativePath: changeRelativePath, content }) => ({
      relativePath: changeRelativePath,
      content
    })),
    affectedPaths: changes
      .map(change => change.relativePath)
      .filter((path, index, all) => all.indexOf(path) === index)
      .sort()
  };
  if (!keepChanges) await revertChanges(written);
  return result;
}
