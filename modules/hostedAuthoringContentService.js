import { CATALOGUES } from "../catalogues/index.js";
import { PUZZLES } from "../puzzles/index.js";
import {
  CATEGORIES,
  slugify
} from "../puzzles/categories.js";
import { categorySummaries, categorySummary } from "./categoryDiscovery.js";
import { validateSubcategoryAssignments } from "./categoryValidation.js";
import { validatePuzzleContent } from "./contentValidation.js";
import { validateLearningIntroductionStructure } from "./learningIntroductionValidationCore.js";
import { HOSTED_AUTHORING_GUIDANCE } from "./authoringDesignGuidance.js";
import { computeAuthoringFlags } from "./puzzleSymmetryFlags.js";
import { createPuzzleSkeleton, normalizeAuthoredDocument } from "./authoredPuzzleDocument.js";
import { puzzleFromAuthoredDocument, puzzleToSimplified } from "./simplifiedPuzzleSchema.js";

export { HOSTED_AUTHORING_GUIDANCE };

export function createHostedAuthoringContentService({
  puzzles = PUZZLES,
  catalogues = CATALOGUES,
  categories = CATEGORIES,
  learningContentByPuzzle = new Map()
} = {}) {
  const puzzleById = new Map(puzzles.map(puzzle => [puzzle.id, puzzle]));
  const catalogueById = new Map(catalogues.map(item => [item.id, item]));
  const knownPuzzleIds = new Set(puzzleById.keys());

  function listPuzzles({ category = null } = {}) {
    return puzzles
      .filter(puzzle => !category || puzzle.category === category ||
        puzzle.categories?.includes(category))
      .map(puzzle => ({
        id: puzzle.id,
        title: puzzle.title,
        category: puzzle.category,
        ...(puzzle.categories ? { categories: [...puzzle.categories] } : {}),
        large: !!puzzle.large,
        hasLenses: !!puzzle.lenses?.length,
        hasLearningIntroduction: !!puzzle.learningIntroduction
      }));
  }

  function listCategories() {
    return categorySummaries(puzzles, categories);
  }

  function listCatalogues() {
    return catalogues.map(catalogue => ({
      id: catalogue.id,
      title: catalogue.title,
      ...(catalogue.info ? { info: JSON.parse(JSON.stringify(catalogue.info)) } : {}),
      entryCount: catalogue.entries.length
    }));
  }

  function getCategory(name) {
    return categorySummary(puzzles, categories, name);
  }

  function getPuzzleDocument(puzzleId) {
    const puzzle = puzzleById.get(puzzleId);
    if (!puzzle) throw new Error(`Unknown puzzle: ${puzzleId}`);
    const embedded = learningContentByPuzzle.get(puzzleId);
    return puzzleToSimplified(puzzle, {
      ...(embedded === undefined ? {} : { learningContent: embedded })
    });
  }

  // Plain equivalent of the old JSON-LD catalogue manifest (no @context/
  // @id/@type envelope) -- catalogues have no simplified-format authoring
  // surface of their own (create_catalogue takes its own plain input
  // shape), so this is just that same plain shape for reads.
  function getCatalogueDocument(catalogueId) {
    const catalogue = catalogueById.get(catalogueId);
    if (!catalogue) throw new Error(`Unknown catalogue: ${catalogueId}`);
    return {
      id: catalogue.id,
      title: catalogue.title,
      ...(catalogue.info ? { info: JSON.parse(JSON.stringify(catalogue.info)) } : {}),
      entries: catalogue.entries.map(entry => ({
        id: entry.id,
        ...(entry.reason ? { reason: entry.reason } : {})
      }))
    };
  }

  // create_puzzle_draft/save_puzzle_draft's early "does this even parse"
  // feedback. Storage never converts format -- see authoredPuzzleDocument.js.

  function validatePuzzleDraft(document, { categoryRegistry = categories } = {}) {
    // Safety net: a draft may have been saved with input that didn't
    // convert (create/save store it as given rather than rejecting).
    // Re-running the same conversion here means this reports formatted,
    // field-scoped errors either way instead of a separate, confusing
    // failure mode.
    const { puzzle, errors: conversionErrors } = puzzleFromAuthoredDocument(document);
    // flags stays a consistently-shaped array on every path, including
    // this early return -- a caller destructuring the response shouldn't
    // have to special-case "conversion failed" as a different shape.
    if (!puzzle) return { valid: false, errors: conversionErrors, flags: [] };
    const errors = [...conversionErrors];
    try {
      const relatedIds = new Set(knownPuzzleIds);
      relatedIds.add(puzzle.id);
      errors.push(...validatePuzzleContent(puzzle, {
        knownPuzzleIds: relatedIds
      }));
      errors.push(...validateLearningIntroductionStructure(puzzle, {
        requireEmbedded: true
      }));
      validateSubcategoryAssignments([puzzle], categoryRegistry)
        .forEach(error => errors.push(`${error.scope}: ${error.message}`));
    } catch (error) {
      errors.push(error.message);
    }
    // flags are informational, independent of pass/fail -- computed even
    // when errors are present, since the authoring agent is looking at
    // both at once anyway. See puzzleSymmetryFlags.js.
    return { valid: errors.length === 0, errors, flags: computeAuthoringFlags(puzzle) };
  }

  function previewRepositoryImport(document) {
    const validation = validatePuzzleDraft(document);
    if (!validation.valid) return { ...validation, preview: null };
    const { puzzle } = puzzleFromAuthoredDocument(document);
    const action = knownPuzzleIds.has(puzzle.id) ? "replace" : "create";
    const affectedPaths = [
      `content/puzzles/${puzzle.id}.ccpuzzle.json`,
      `puzzles/${slugify(puzzle.category)}/${puzzle.id}.js`,
      ...(action === "create" ? ["puzzles/index.js"] : [])
    ];
    return {
      valid: true,
      errors: [],
      preview: {
        action,
        puzzleId: puzzle.id,
        title: puzzle.title,
        affectedPaths,
        publicationMode: "github-pull-request",
        repositoryChanged: false,
        note: "CI will generate compatibility files and run repository validation before merge."
      }
    };
  }

  return {
    categories,
    catalogues,
    getCatalogueDocument,
    getCategory,
    getPuzzleDocument,
    guidance: HOSTED_AUTHORING_GUIDANCE,
    knownPuzzleIds,
    listPuzzles,
    listCategories,
    listCatalogues,
    normalizeAuthoredDocument,
    previewRepositoryImport,
    puzzles,
    createPuzzleSkeleton,
    validatePuzzleDraft
  };
}

export default createHostedAuthoringContentService;
