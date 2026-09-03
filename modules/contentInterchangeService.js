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
import { searchAuthoringPuzzles } from "./authoringPuzzleSearch.js";
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
import { puzzleToSimplified } from "./puzzleSimplified.js";
import { computeAuthoringFlags, computeUserOnlyAuthoringFlags } from "./puzzleSymmetryFlags.js";
import { createPuzzleSkeleton } from "./puzzleSkeleton.js";
import { derivedLarge, puzzleNodeCount } from "./puzzleBoardSize.js";

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

  // The process-start registry, not state.puzzles: checkout install mutates
  // state so a review pass can still diff against the published original.
  function getPuzzleDocument(id) {
    const puzzle = puzzles.find(item => item.id === id);
    if (!puzzle) throw new Error(`Unknown puzzle: ${id}`);
    return puzzleToSimplified(puzzle);
  }

  async function getPuzzleDocumentForPublication(id) {
    const puzzle = puzzles.find(item => item.id === id);
    if (!puzzle) throw new Error(`Unknown puzzle: ${id}`);
    const learningContent = await learningContentFor(puzzle);
    const text = learningContent
      ?? (typeof puzzle.learningIntroduction?.content?.text === "string"
        ? puzzle.learningIntroduction.content.text
        : null);
    return puzzleToSimplified(puzzle, { learningContent: text });
  }

  function getCatalogueDocument(id) {
    const catalogue = state.catalogues.find(item => item.id === id);
    if (!catalogue) throw new Error(`Unknown catalogue: ${id}`);
    return {
      id: catalogue.id,
      title: catalogue.title,
      ...(catalogue.kind === "meta" ? { kind: "meta" } : {}),
      ...(catalogue.showInLibrary === true ? { showInLibrary: true } : {}),
      ...(catalogue.info ? { info: clone(catalogue.info) } : {}),
      ...(catalogue.kind === "meta" ? { ordered: catalogue.ordered !== false } : {}),
      entries: catalogue.entries.map(entry => ({ ...entry })),
      ...(catalogue.kind === "meta" && catalogue.relatedCatalogues
        ? { relatedCatalogues: clone(catalogue.relatedCatalogues) }
        : {})
    };
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
      large: derivedLarge(puzzleNodeCount(puzzle)),
      hasLenses: !!puzzle.lenses?.length,
      hasLearningIntroduction: !!puzzle.learningIntroduction
    }));
  }

  function listCatalogues() {
    return state.catalogues.map(catalogue => ({
      id: catalogue.id,
      title: catalogue.title,
      entryCount: catalogue.entries.length,
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

  function searchPuzzles({
    query,
    category = null,
    catalogueId = null,
    fullText = false,
    limit = 10
  } = {}) {
    return searchAuthoringPuzzles(state.puzzles, state.categories, {
      query,
      category,
      catalogueId,
      catalogues: state.catalogues,
      fullText,
      limit
    });
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

  // Authoring-document helpers live in authoredPuzzleDocument.js. This file
  // loads them lazily so tools/content-jsonld.mjs's isolated, node_modules-free
  // CLI copy never pulls zod on the JSON-LD path.
  async function authoredDocument() {
    return import("./authoredPuzzleDocument.js");
  }

  async function normalizeAuthoredDocument(document) {
    return (await authoredDocument()).normalizeAuthoredDocument(document);
  }

  async function authoredPuzzleFromDocument(document) {
    const { puzzleFromAuthoredDocument } = await import("./simplifiedPuzzleSchema.js");
    return puzzleFromAuthoredDocument(document);
  }

  async function validateRuntimePuzzle(puzzle, {
    sourceUrl = null,
    repositoryAware = true,
    categoryRegistry = state.categories
  } = {}) {
    const errors = [];
    try {
      definePuzzle(
        sourceUrl || pathToFileURL(join(repositoryRoot, `puzzles/${puzzle.id}.js`)),
        puzzle
      );
      const knownIds = new Set(state.puzzles.map(item => item.id));
      knownIds.add(puzzle.id);
      for (const entry of puzzle.relatedPuzzles?.entries || []) {
        if (entry?.id) knownIds.add(entry.id);
      }
      errors.push(...validatePuzzleContent(puzzle, {
        knownPuzzleIds: knownIds
      }));
      errors.push(...await validateLearningIntroduction(puzzle));
      if (repositoryAware) {
        validateSubcategoryAssignments([puzzle], categoryRegistry)
          .forEach(error => errors.push(`${error.scope}: ${error.message}`));
      }
    } catch (error) {
      errors.push(error.message);
    }
    return {
      valid: errors.length === 0,
      errors,
      flags: computeAuthoringFlags(puzzle)
    };
  }

  async function validatePuzzleDraft(document, { categoryRegistry = state.categories } = {}) {
    const { puzzle, errors: conversionErrors } = await authoredPuzzleFromDocument(document);
    if (!puzzle) return { valid: false, errors: conversionErrors, flags: [] };
    const result = await validateRuntimePuzzle(puzzle, { categoryRegistry });
    return {
      valid: result.valid && conversionErrors.length === 0,
      errors: [...conversionErrors, ...result.errors],
      flags: result.flags
    };
  }

  // Deliberately not part of validatePuzzleDraft/validateRuntimePuzzle's
  // return value: that result is what an MCP client sees and what gets
  // persisted via recordValidation (and so can be read back through
  // get_puzzle_draft). User-only flags are for the draft review page's own
  // render path to call directly, so they never round-trip through MCP.
  // See puzzleSymmetryFlags.js.
  async function computeUserOnlyFlags(document) {
    const { puzzle } = await authoredPuzzleFromDocument(document);
    return puzzle ? computeUserOnlyAuthoringFlags(puzzle) : [];
  }

  async function validateJsonLdDocument(document, {
    sourceUrl = null,
    repositoryAware = true
  } = {}) {
    const looksLikeJsonLd = !!document && typeof document === "object" &&
      !Array.isArray(document) && "@context" in document;
    if (!looksLikeJsonLd) return validatePuzzleDraft(document);
    // Interchange path: a real .ccpuzzle.jsonld file. Drafts never take
    // this branch.
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
        for (const entry of puzzle.relatedPuzzles?.entries || []) {
          if (entry?.id) knownIds.add(entry.id);
        }
        errors.push(...validatePuzzleContent(puzzle, {
          knownPuzzleIds: knownIds
        }));
        errors.push(...await validateLearningIntroduction(puzzle));
        if (repositoryAware) {
          validateSubcategoryAssignments([puzzle], state.categories)
            .forEach(error => errors.push(`${error.scope}: ${error.message}`));
        }
        flags = computeAuthoringFlags(puzzle);
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

  function recordInstalledPuzzle(puzzle) {
    const index = state.puzzles.findIndex(item => item.id === puzzle.id);
    if (index === -1) state.puzzles.push(puzzle);
    else state.puzzles[index] = puzzle;
  }

  function forgetInstalledPuzzle(puzzleId) {
    const index = state.puzzles.findIndex(item => item.id === puzzleId);
    if (index !== -1) state.puzzles.splice(index, 1);
    for (const catalogue of state.catalogues) {
      catalogue.entries = catalogue.entries.filter(entry => entry.id !== puzzleId);
    }
  }

  return {
    get categories() { return state.categories; },
    get catalogues() { return state.catalogues; },
    get puzzles() { return state.puzzles; },
    repositoryRoot,
    state,
    createPuzzleSkeleton,
    exportCatalogueJsonLd,
    getPuzzleJsonLd,
    getPuzzleDocument,
    getPuzzleDocumentForPublication,
    getCatalogueDocument,
    getCategory,
    listCategories,
    listCatalogues,
    listPuzzles,
    searchPuzzles,
    materializeImportedLearning,
    normalizeAuthoredDocument,
    readJsonLdFile,
    recordInstalledPuzzle,
    forgetInstalledPuzzle,
    validateJsonLdDocument,
    validatePuzzleDraft,
    validateRuntimePuzzle,
    computeUserOnlyFlags
  };
}

export default createContentInterchangeService;
