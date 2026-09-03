import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { slugify } from "../puzzles/categories.js";
import { validateJsonLdProfile } from "./jsonLdProfile.js";
import { puzzleFromJsonLd } from "./puzzleJsonLd.js";
// From the zod-free module, not modules/simplifiedPuzzleSchema.js -- see
// modules/puzzleSimplified.js's comment on why (this file is shared with
// tools/content-jsonld.mjs's node_modules-free CLI).
import { puzzleForCanonicalPublication } from "./puzzleSimplified.js";
import {
  formattedJson,
  generatedPuzzleModule,
  publicationApprovalToken,
  registerPuzzleSource,
  unregisterPuzzleSource
} from "./publicationArtifacts.js";
import {
  currentFile,
  defaultValidateRepository,
  existingPuzzleModule,
  puzzleModulePath,
  walkPuzzleModules
} from "./puzzleModuleLocator.js";
import { applyChangesAndValidate, applyOneChange, revertChanges } from "./repositoryChangeTransaction.js";

export class ContentValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "ContentValidationError";
    this.errors = errors;
  }
}

function generatedModule(puzzle, canonicalRelativePath, modulePath, root) {
  return generatedPuzzleModule(
    puzzle,
    canonicalRelativePath,
    relative(root, modulePath).replaceAll(sep, "/")
  );
}

function registerPuzzle(registry, puzzle, modulePath, root) {
  return registerPuzzleSource(
    registry,
    puzzle,
    relative(root, modulePath).replaceAll(sep, "/")
  );
}

export function committedFileAtHead(repositoryRoot, relativePath) {
  const result = spawnSync("git", ["show", `HEAD:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
  if (result.status !== 0) return null;
  return result.stdout;
}

export function createRepositoryPublicationService({
  contentService,
  readCommittedFile = committedFileAtHead,
  validateRepository = defaultValidateRepository
} = {}) {
  if (!contentService) throw new Error("contentService is required");
  const root = contentService.repositoryRoot;

  async function planPuzzleImport(rawDocument, {
    replace = false,
    sourcePath = null
  } = {}) {
    // rawDocument is canonical JSON-LD -- interchange CLI only
    // (tools/content-jsonld.mjs). Live authoring never calls this; MCP
    // uses planPuzzleFromModel on the runtime puzzle instead.
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
    return planPuzzleFromModel(puzzle, {
      replace
    });
  }

  async function planPuzzleFromModel(puzzle, {
    replace = false
  } = {}) {
    const existing = await existingPuzzleModule(root, puzzle.id);
    if (existing && !replace) {
      throw new Error(
        `Puzzle "${puzzle.id}" already exists; explicit replace approval is required`
      );
    }
    const modulePath = existing || join(root, puzzleModulePath(puzzle.category, puzzle.id));
    const validation = await contentService.validateRuntimePuzzle(puzzle, {
      sourceUrl: pathToFileURL(modulePath),
      repositoryAware: true
    });
    if (!validation.valid) {
      throw new ContentValidationError(
        "Puzzle semantic validation failed",
        validation.errors
      );
    }

    // Canonical repository storage is the simplified format. JSON-LD stays
    // an on-demand interchange shape (content:export/import), not what's
    // kept on disk. See docs/JSON-LD.md.
    const canonicalPath = join(
      root,
      "content",
      "puzzles",
      `${puzzle.id}.ccpuzzle.json`
    );
    const canonicalRelative = relative(root, canonicalPath).replaceAll(sep, "/");
    const published = puzzleForCanonicalPublication(puzzle);
    const proposed = new Map([
      [canonicalPath, formattedJson(published.simplified)],
      [modulePath, generatedModule(published.puzzle, canonicalRelative, modulePath, root)]
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

    const changes = await Promise.all([...proposed].map(async ([path, content]) => ({
      path,
      relativePath: relative(root, path).replaceAll(sep, "/"),
      original: await currentFile(path),
      content
    })));
    const token = await publicationApprovalToken({ changes });
    return {
      action: existing ? "replace" : "create",
      puzzle,
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

    await applyChangesAndValidate({ changes: plan.changes, validateRepository, repositoryRoot: root });

    contentService.recordInstalledPuzzle(plan.puzzle);
    return {
      installed: true,
      action: plan.action,
      puzzleId: plan.puzzle.id,
      affectedPaths: [...plan.affectedPaths]
    };
  }

  async function planFileChange(path, relativePath) {
    const current = await currentFile(path);
    const committed = readCommittedFile(root, relativePath);
    if (current === committed) return null;
    return {
      path,
      relativePath,
      original: current,
      content: committed
    };
  }

  async function findUninstallModulePath(puzzleId, category) {
    if (category) {
      const candidate = join(root, puzzleModulePath(category, puzzleId));
      if (await currentFile(candidate) !== null) return candidate;
    }
    const suffix = `/${puzzleId}.js`;
    try {
      for (const path of await walkPuzzleModules(join(root, "puzzles"))) {
        if (path.replaceAll(sep, "/").endsWith(suffix)) return path;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    return category ? join(root, puzzleModulePath(category, puzzleId)) : null;
  }

  async function planPuzzleUninstall(puzzleId, { category = null } = {}) {
    if (typeof puzzleId !== "string" || slugify(puzzleId) !== puzzleId) {
      throw new Error("puzzleId must be a lowercase slug");
    }
    const canonicalPath = join(root, "content", "puzzles", `${puzzleId}.ccpuzzle.json`);
    const canonicalRelative = relative(root, canonicalPath).replaceAll(sep, "/");
    const modulePath = await findUninstallModulePath(puzzleId, category);
    const proposed = [];
    const canonicalChange = await planFileChange(canonicalPath, canonicalRelative);
    if (canonicalChange) proposed.push(canonicalChange);
    if (modulePath) {
      const moduleRelative = relative(root, modulePath).replaceAll(sep, "/");
      const moduleChange = await planFileChange(modulePath, moduleRelative);
      if (moduleChange) proposed.push(moduleChange);
    }

    const moduleRelative = modulePath
      ? relative(root, modulePath).replaceAll(sep, "/")
      : null;
    const moduleWasCommitted = moduleRelative
      ? readCommittedFile(root, moduleRelative) !== null
      : false;
    if (!moduleWasCommitted) {
      const registryPath = join(root, "puzzles", "index.js");
      const currentRegistry = await currentFile(registryPath);
      if (currentRegistry) {
        try {
          const nextRegistry = unregisterPuzzleSource(currentRegistry, puzzleId);
          if (nextRegistry !== currentRegistry) {
            proposed.push({
              path: registryPath,
              relativePath: relative(root, registryPath).replaceAll(sep, "/"),
              original: currentRegistry,
              content: nextRegistry
            });
          }
        } catch {
          // Not registered — a broken install may have written files without
          // splicing the registry. Still uninstall the files.
        }
      }
    }

    if (!proposed.length) {
      throw new Error(
        `Puzzle "${puzzleId}" matches git HEAD, so uninstall would delete published content. Uninstall only undoes a local install that has not been committed.`
      );
    }
    const deletingCanonical = proposed.some(change =>
      change.relativePath === `content/puzzles/${puzzleId}.ccpuzzle.json`
      && change.content === null
    );
    return {
      action: deletingCanonical ? "remove" : "restore",
      puzzleId,
      changes: proposed,
      affectedPaths: proposed.map(change => change.relativePath)
    };
  }

  async function applyPuzzleUninstall(puzzleId, { category = null } = {}) {
    const plan = await planPuzzleUninstall(puzzleId, { category });
    const written = [];
    try {
      for (const change of plan.changes) {
        if (await currentFile(change.path) !== change.original) {
          throw new Error(
            `Uninstall plan is stale because ${change.relativePath} changed`
          );
        }
        if (await applyOneChange(change)) written.push(change);
      }
      await validateRepository(root);
    } catch (error) {
      await revertChanges(written);
      throw error;
    }

    const canonicalChange = plan.changes.find(change =>
      change.relativePath === `content/puzzles/${puzzleId}.ccpuzzle.json`
    );
    if (typeof contentService.forgetInstalledPuzzle === "function") {
      if (!canonicalChange || canonicalChange.content === null) {
        contentService.forgetInstalledPuzzle(puzzleId);
      }
    }
    return {
      uninstalled: true,
      action: plan.action,
      puzzleId: plan.puzzleId,
      affectedPaths: [...plan.affectedPaths]
    };
  }

  return {
    applyPuzzleImport,
    applyPuzzleUninstall,
    planPuzzleFromModel,
    planPuzzleImport,
    planPuzzleUninstall
  };
}

export default createRepositoryPublicationService;
