import { readFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CATALOGUES } from "../catalogues/index.js";
import { CATEGORIES } from "../puzzles/categories.js";
import { PUZZLES } from "../puzzles/index.js";
import {
  catalogueBundleToJsonLd,
  catalogueFromJsonLd,
  catalogueToJsonLd
} from "./catalogueJsonLd.js";
import {
  validateCatalogueContent,
  validatePuzzleContent
} from "./contentValidation.js";
import { validateSubcategoryAssignments } from "./categoryValidation.js";
import { categorySummaries, categorySummary } from "./categoryDiscovery.js";
import {
  JSON_LD_TYPES,
  validateJsonLdProfile
} from "./jsonLdProfile.js";
import { validateLearningIntroduction } from "./learningIntroductionValidation.js";
import {
  definePuzzle,
  resolvePuzzleResourceUrl
} from "./puzzleManifest.js";
import { puzzleFromJsonLd, puzzleToJsonLd } from "./puzzleJsonLd.js";
import { computeSymmetryFlags } from "./puzzleSymmetryFlags.js";

export const MAX_JSON_LD_DOCUMENT_BYTES = 2 * 1024 * 1024;

export const DEFAULT_REPOSITORY_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  ".."
);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function clonedCatalogues(catalogues) {
  return catalogues.map(catalogue => ({
    ...catalogue,
    ...(catalogue.info ? { info: clone(catalogue.info) } : {}),
    entries: catalogue.entries.map(entry => ({ ...entry }))
  }));
}

function sourceUrlForDocument(document, repositoryRoot, sourceUrl) {
  if (sourceUrl) return sourceUrl instanceof URL ? sourceUrl : pathToFileURL(sourceUrl);
  const id = typeof document?.id === "string" && document.id.trim()
    ? document.id
    : "draft";
  return pathToFileURL(join(repositoryRoot, "puzzles", "drafts", `${id}.js`));
}

export function createContentInterchangeService({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  puzzles = PUZZLES,
  catalogues = CATALOGUES,
  categories = CATEGORIES
} = {}) {
  const state = {
    puzzles: [...puzzles],
    catalogues: clonedCatalogues(catalogues),
    categories
  };

  async function readJsonLdFile(filename) {
    const path = resolve(filename);
    const bytes = await readFile(path);
    if (bytes.byteLength > MAX_JSON_LD_DOCUMENT_BYTES) {
      throw new Error(
        `${filename}: document exceeds ${MAX_JSON_LD_DOCUMENT_BYTES} bytes`
      );
    }
    try {
      return { path, document: JSON.parse(bytes.toString("utf8")) };
    } catch (error) {
      throw new Error(`${filename}: invalid JSON (${error.message})`);
    }
  }

  async function learningContentFor(puzzle) {
    const content = puzzle.learningIntroduction?.content;
    if (!content?.src) return null;
    const url = resolvePuzzleResourceUrl(puzzle, content.src);
    if (url.protocol !== "file:") return null;
    return readFile(fileURLToPath(url), "utf8");
  }

  async function getPuzzleJsonLd(id) {
    const puzzle = state.puzzles.find(item => item.id === id);
    if (!puzzle) throw new Error(`Unknown puzzle: ${id}`);
    return puzzleToJsonLd(puzzle, {
      learningContent: await learningContentFor(puzzle)
    });
  }

  function listPuzzles({ category = null, catalogueId = null } = {}) {
    let members = state.puzzles;
    if (catalogueId && catalogueId !== "all") {
      const catalogue = state.catalogues.find(item => item.id === catalogueId);
      if (!catalogue) throw new Error(`Unknown catalogue: ${catalogueId}`);
      const ids = new Set(catalogue.entries.map(entry => entry.id));
      members = members.filter(puzzle => ids.has(puzzle.id));
    }
    if (category) {
      members = members.filter(puzzle =>
        puzzle.category === category || puzzle.categories?.includes(category)
      );
    }
    return members.map(puzzle => ({
      id: puzzle.id,
      title: puzzle.title,
      category: puzzle.category,
      ...(puzzle.categories ? { categories: [...puzzle.categories] } : {}),
      ...(puzzle.subcategories
        ? { subcategories: clone(puzzle.subcategories) }
        : {}),
      large: !!puzzle.large,
      hasLenses: !!puzzle.lenses?.length,
      hasLearningIntroduction: !!puzzle.learningIntroduction
    }));
  }

  function listCatalogues() {
    return state.catalogues.map(catalogue => ({
      id: catalogue.id,
      title: catalogue.title,
      puzzleCount: catalogue.entries.length,
      ...(catalogue.info ? { info: clone(catalogue.info) } : {})
    }));
  }

  function listCategories() {
    return categorySummaries(state.puzzles, state.categories);
  }

  function getCategory(name) {
    return categorySummary(state.puzzles, state.categories, name);
  }

  async function exportCatalogueJsonLd(id, { manifest = false } = {}) {
    const catalogue = state.catalogues.find(item => item.id === id);
    if (!catalogue) throw new Error(`Unknown catalogue: ${id}`);
    if (manifest) return catalogueToJsonLd(catalogue);
    return catalogueBundleToJsonLd(catalogue, state.puzzles, {
      categories: state.categories,
      puzzleOptions: new Map(await Promise.all(
        catalogue.entries.map(async entry => {
          const puzzle = state.puzzles.find(item => item.id === entry.id);
          return [entry.id, {
            learningContent: puzzle
              ? await learningContentFor(puzzle)
              : null
          }];
        })
      ))
    });
  }

  // modules/simplifiedPuzzleSchema.js is imported lazily, only when actually
  // needed, rather than statically at the top of this file. This file is
  // also loaded by tools/content-jsonld.mjs's standalone CLI, whose own test
  // suite runs it against an isolated repository copy with no node_modules
  // (see jsonld-cli.mjs) -- a static top-level `import` would resolve zod
  // eagerly for every CLI invocation and break that. The CLI only ever
  // handles canonical JSON-LD (real .ccpuzzle.jsonld files), so the cheap
  // inline "@context" check below means this dynamic import is never
  // actually reached on that path.
  async function normalizeAuthoredDocument(document) {
    const looksLikeJsonLd = !!document && typeof document === "object" &&
      !Array.isArray(document) && "@context" in document;
    if (looksLikeJsonLd) return { document, errors: [] };
    const { normalizeAuthoredPuzzleDocument } = await import("./simplifiedPuzzleSchema.js");
    return normalizeAuthoredPuzzleDocument(document);
  }

  async function validateJsonLdDocument(document, {
    sourceUrl = null,
    repositoryAware = true
  } = {}) {
    // Safety net: a draft may have been saved with simplified input that
    // didn't convert (create/save store it as given rather than rejecting,
    // per this codebase's "drafts may be temporarily invalid" philosophy --
    // see normalizeAuthoredDocument above). Re-attempt conversion here so
    // that case gets formatted zod-style errors instead of falling through
    // to confusing JSON-LD-profile errors ("@context must be...") for an
    // author who never wrote JSON-LD. Already-JSON-LD documents pass through
    // this call unchanged at negligible cost.
    // flags stays a consistently-shaped array on every path that fails
    // before a puzzle is even resolved, including these two early
    // returns -- a caller destructuring the response shouldn't have to
    // special-case "failed before conversion/profile validation" as a
    // different shape. (The success path below still omits the key
    // entirely for a catalogue bundle, where "not applicable" and "zero
    // flags" are genuinely different claims -- see flags = null there.)
    const normalized = await normalizeAuthoredDocument(document);
    if (!normalized.document) {
      return { valid: false, type: null, errors: normalized.errors, flags: [] };
    }
    document = normalized.document;
    const errors = validateJsonLdProfile(document);
    if (errors.length) {
      return {
        valid: false,
        type: document?.["@type"] || null,
        errors,
        flags: []
      };
    }
    // Only meaningful for a single puzzle document -- a catalogue bundle's
    // several puzzles have no one obvious puzzle to attribute a flag to,
    // so that branch below doesn't set this.
    let flags = null;
    try {
      if (document["@type"] === JSON_LD_TYPES.puzzle) {
        const puzzle = definePuzzle(
          sourceUrlForDocument(document, repositoryRoot, sourceUrl),
          puzzleFromJsonLd(document)
        );
        const knownIds = new Set(state.puzzles.map(item => item.id));
        knownIds.add(puzzle.id);
        errors.push(...validatePuzzleContent(puzzle, {
          knownPuzzleIds: knownIds
        }));
        errors.push(...await validateLearningIntroduction(puzzle));
        if (repositoryAware) {
          validateSubcategoryAssignments([puzzle], state.categories)
            .forEach(error => errors.push(`${error.scope}: ${error.message}`));
        }
        flags = computeSymmetryFlags(puzzle);
      } else {
        const imported = catalogueFromJsonLd(document);
        const ids = new Set(imported.puzzles.map(puzzle => puzzle.id));
        errors.push(...validateCatalogueContent(
          imported.catalogue,
          imported.puzzles.length ? { puzzleIds: ids } : {}
        ));
        for (const puzzle of imported.puzzles) {
          definePuzzle(
            sourceUrlForDocument(puzzle, repositoryRoot, sourceUrl),
            puzzle
          );
          errors.push(...validatePuzzleContent(puzzle));
          errors.push(...await validateLearningIntroduction(puzzle));
        }
      }
    } catch (error) {
      errors.push(error.message);
    }
    return {
      valid: errors.length === 0,
      type: document["@type"],
      errors,
      ...(flags !== null ? { flags } : {})
    };
  }

  async function materializeImportedLearning(document, sourcePath = null) {
    const copy = clone(document);
    const content = copy.learningIntroduction?.content;
    if (!content?.src) return copy;
    if (!sourcePath) {
      throw new Error(
        "learningIntroduction.content.src requires a source file; MCP drafts should embed content.text"
      );
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(content.src) ||
        content.src.startsWith("//")) {
      throw new Error(
        "learningIntroduction.content.src must be a local relative path"
      );
    }
    const base = `${dirname(sourcePath)}${sep}`;
    const source = resolve(dirname(sourcePath), content.src);
    if (!source.startsWith(base)) {
      throw new Error(
        "learningIntroduction.content.src cannot escape the import package"
      );
    }
    const markdown = await readFile(source, "utf8");
    copy.learningIntroduction = {
      ...copy.learningIntroduction,
      content: { text: markdown, mediaType: "text/markdown" }
    };
    return copy;
  }

  function createPuzzleSkeleton({ id, title, category }) {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error("puzzle id must be a non-empty string");
    }
    if (typeof title !== "string" || !title.trim()) {
      throw new Error("puzzle title must be a non-empty string");
    }
    if (typeof category !== "string" || !category.trim()) {
      throw new Error("puzzle category must be a non-empty string");
    }
    // Simplified shape (see modules/simplifiedPuzzleSchema.js), not a JSON-LD
    // envelope -- this is what an author fills in next via save_puzzle_draft.
    return {
      id,
      title,
      category,
      clusters: [],
      bridges: []
    };
  }

  function recordInstalledPuzzle(puzzle, { catalogueId = null, reason = null } = {}) {
    const index = state.puzzles.findIndex(item => item.id === puzzle.id);
    if (index === -1) state.puzzles.push(puzzle);
    else state.puzzles[index] = puzzle;
    if (!catalogueId) return;
    const catalogue = state.catalogues.find(item => item.id === catalogueId);
    if (!catalogue) return;
    if (!catalogue.entries.some(entry => entry.id === puzzle.id)) {
      catalogue.entries.push({
        id: puzzle.id,
        ...(reason ? { reason } : {})
      });
    }
  }

  return {
    repositoryRoot,
    state,
    createPuzzleSkeleton,
    exportCatalogueJsonLd,
    getPuzzleJsonLd,
    getCategory,
    listCategories,
    listCatalogues,
    listPuzzles,
    materializeImportedLearning,
    normalizeAuthoredDocument,
    readJsonLdFile,
    recordInstalledPuzzle,
    validateJsonLdDocument
  };
}

export default createContentInterchangeService;
