import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile
} from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { slugify } from "../puzzles/categories.js";
import { validateJsonLdProfile } from "./jsonLdProfile.js";
import { definePuzzle } from "./puzzleManifest.js";
import { puzzleFromJsonLd } from "./puzzleJsonLd.js";

export class ContentValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "ContentValidationError";
    this.errors = errors;
  }
}

function pretty(document) {
  return `${JSON.stringify(document, null, 2)}\n`;
}

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
  for (const path of await walkPuzzleModules(join(repositoryRoot, "puzzles"))) {
    const candidate = (await import(pathToFileURL(path).href)).default;
    if (candidate?.id === id) return path;
  }
  return null;
}

function variableName(id) {
  const words = id.split("-");
  return words[0] + words.slice(1).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join("");
}

function generatedModule(puzzle, canonicalRelativePath, modulePath, root) {
  let manifestImport = relative(
    dirname(modulePath),
    join(root, "modules", "puzzleManifest.js")
  ).replaceAll(sep, "/");
  if (!manifestImport.startsWith(".")) manifestImport = `./${manifestImport}`;
  return `// Generated from ${canonicalRelativePath}.\n` +
    "// Edit the JSON-LD source and re-import it rather than editing this file directly.\n\n" +
    `import { definePuzzle } from "${manifestImport}";\n\n` +
    `export default definePuzzle(import.meta.url, ${JSON.stringify(puzzle, null, 2)});\n`;
}

function registerPuzzle(registry, puzzle, modulePath, root) {
  const variable = variableName(puzzle.id);
  const importPath = `./${relative(
    join(root, "puzzles"),
    modulePath
  ).replaceAll(sep, "/")}`;
  const commentMarker = "\n// Cross-disciplinary membership";
  const importLine = `import ${variable} from "${importPath}";`;
  let updated = registry;
  const markerIndex = updated.indexOf(commentMarker);
  if (markerIndex < 0) {
    throw new Error("Could not locate puzzle registry import boundary");
  }
  updated = `${updated.slice(0, markerIndex)}\n${importLine}${updated.slice(markerIndex)}`;
  const arrayStart = updated.indexOf("export const PUZZLES = [");
  const arrayEnd = updated.indexOf("\n];", arrayStart);
  if (arrayStart < 0 || arrayEnd < 0) {
    throw new Error("Could not locate PUZZLES registry array");
  }
  const before = updated.slice(0, arrayEnd).trimEnd();
  return `${before},\n  ${variable}${updated.slice(arrayEnd)}`;
}

function addCatalogueEntry(source, entry) {
  const closing = source.lastIndexOf("\n  ]\n};");
  if (closing < 0) {
    throw new Error("Could not locate catalogue entries array");
  }
  const block = JSON.stringify(entry, null, 2)
    .split("\n")
    .map(line => `    ${line}`)
    .join("\n");
  return `${source.slice(0, closing).trimEnd()},\n${block}${source.slice(closing)}`;
}

async function currentFile(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function approvalToken(changes) {
  const hash = createHash("sha256");
  for (const change of changes) {
    hash.update(change.relativePath);
    hash.update("\0");
    hash.update(change.original === null ? "<new>" : change.original);
    hash.update("\0");
    hash.update(change.content);
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

export function createRepositoryPublicationService({ contentService }) {
  if (!contentService) throw new Error("contentService is required");
  const root = contentService.repositoryRoot;

  async function planPuzzleImport(rawDocument, {
    replace = false,
    catalogueId = null,
    reason = null,
    sourcePath = null
  } = {}) {
    if (reason && !catalogueId) throw new Error("reason requires catalogueId");
    const document = await contentService.materializeImportedLearning(
      rawDocument,
      sourcePath
    );
    const profileErrors = validateJsonLdProfile(document);
    if (profileErrors.length) {
      throw new ContentValidationError(
        "JSON-LD profile validation failed",
        profileErrors
      );
    }
    if (document["@type"] !== "Puzzle") {
      throw new Error(
        "Repository publication currently accepts Puzzle documents; catalogue bundles remain export-only"
      );
    }

    const puzzle = puzzleFromJsonLd(document);
    const existing = await existingPuzzleModule(root, puzzle.id);
    if (existing && !replace) {
      throw new Error(
        `Puzzle "${puzzle.id}" already exists; explicit replace approval is required`
      );
    }
    const modulePath = existing || join(
      root,
      "puzzles",
      slugify(puzzle.category),
      `${puzzle.id}.js`
    );
    const validation = await contentService.validateJsonLdDocument(document, {
      sourceUrl: pathToFileURL(modulePath),
      repositoryAware: true
    });
    if (!validation.valid) {
      throw new ContentValidationError(
        "Puzzle semantic validation failed",
        validation.errors
      );
    }
    definePuzzle(pathToFileURL(modulePath), puzzle);

    let catalogue = null;
    if (catalogueId) {
      catalogue = contentService.state.catalogues.find(
        item => item.id === catalogueId
      );
      if (!catalogue) throw new Error(`Unknown catalogue: ${catalogueId}`);
    }

    const canonicalPath = join(
      root,
      "content",
      "puzzles",
      `${puzzle.id}.ccpuzzle.jsonld`
    );
    const canonicalRelative = relative(root, canonicalPath).replaceAll(sep, "/");
    const proposed = new Map([
      [canonicalPath, pretty(document)],
      [modulePath, generatedModule(puzzle, canonicalRelative, modulePath, root)]
    ]);
    if (!existing) {
      const registryPath = join(root, "puzzles", "index.js");
      proposed.set(
        registryPath,
        registerPuzzle(
          await readFile(registryPath, "utf8"),
          puzzle,
          modulePath,
          root
        )
      );
    }
    if (catalogue &&
        !catalogue.entries.some(entry => entry.id === puzzle.id)) {
      const cataloguePath = join(root, "catalogues", `${catalogue.id}.js`);
      proposed.set(
        cataloguePath,
        addCatalogueEntry(await readFile(cataloguePath, "utf8"), {
          id: puzzle.id,
          ...(reason ? { reason } : {})
        })
      );
    }

    const changes = await Promise.all([...proposed].map(async ([path, content]) => ({
      path,
      relativePath: relative(root, path).replaceAll(sep, "/"),
      original: await currentFile(path),
      content
    })));
    const token = approvalToken(changes);
    return {
      action: existing ? "replace" : "create",
      puzzle,
      document,
      catalogueId,
      reason,
      changes,
      approvalToken: token,
      affectedPaths: changes.map(change => change.relativePath)
    };
  }

  async function applyPuzzleImport(plan, { approvalToken: token } = {}) {
    if (!plan?.changes || !plan.approvalToken) {
      throw new Error("A publication plan is required");
    }
    if (!token || token !== plan.approvalToken) {
      throw new Error(
        "Publication approval token does not match the current preview"
      );
    }
    for (const change of plan.changes) {
      if (await currentFile(change.path) !== change.original) {
        throw new Error(
          `Publication plan is stale because ${change.relativePath} changed; preview again`
        );
      }
    }

    const written = [];
    try {
      for (const change of plan.changes) {
        await mkdir(dirname(change.path), { recursive: true });
        await writeFile(change.path, change.content, "utf8");
        written.push(change);
      }
      const validation = spawnSync(process.execPath, ["validate.mjs"], {
        cwd: root,
        encoding: "utf8"
      });
      if (validation.status !== 0) {
        throw new Error(
          `Repository validation failed:\n${validation.stdout}${validation.stderr}`
        );
      }
    } catch (error) {
      for (const change of [...written].reverse()) {
        if (change.original === null) {
          await unlink(change.path).catch(() => {});
        } else {
          await writeFile(change.path, change.original, "utf8");
        }
      }
      throw error;
    }

    contentService.recordInstalledPuzzle(plan.puzzle, {
      catalogueId: plan.catalogueId,
      reason: plan.reason
    });
    return {
      installed: true,
      action: plan.action,
      puzzleId: plan.puzzle.id,
      affectedPaths: [...plan.affectedPaths]
    };
  }

  return {
    applyPuzzleImport,
    planPuzzleImport
  };
}

export default createRepositoryPublicationService;
