import { CATALOGUES } from "../catalogues/index.js";
import { PUZZLES } from "../puzzles/index.js";
import { CATEGORIES, slugify } from "../puzzles/categories.js";
import { catalogueToJsonLd } from "./catalogueJsonLd.js";
import { validateSubcategoryAssignments } from "./categoryValidation.js";
import { validatePuzzleContent } from "./contentValidation.js";
import {
  CONCEPT_CLUSTERS_CONTEXT,
  CONTENT_SCHEMA_VERSION,
  JSON_LD_TYPES,
  puzzleUrn,
  validateJsonLdProfile
} from "./jsonLdProfile.js";
import { validateLearningIntroductionStructure } from "./learningIntroductionValidationCore.js";
import { puzzleFromJsonLd, puzzleToJsonLd } from "./puzzleJsonLd.js";

export const HOSTED_AUTHORING_GUIDANCE = `# Concept Clusters authoring workflow

Build a complete Puzzle JSON-LD document using the Concept Clusters v1 context.
Use two to six clusters, three to six terms per cluster, two seeds per cluster,
and bridges that make the cluster graph connected. Cluster colors must be unique.
Bridge idealTerms should identify the strongest conceptual connection when known.

Drafts may be temporarily invalid. Save with the current expected revision, then
validate and address every error. Hosted learning introductions embed Markdown in
learningIntroduction.content.text; packaged files and binary assets are introduced
during repository publication. Previewing describes the Git transition but does
not publish or modify the deployed game.`;

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

  function getPuzzleJsonLd(puzzleId) {
    const puzzle = puzzleById.get(puzzleId);
    if (!puzzle) throw new Error(`Unknown puzzle: ${puzzleId}`);
    const embedded = learningContentByPuzzle.get(puzzleId);
    return puzzleToJsonLd(puzzle, {
      ...(embedded === undefined ? {} : { learningContent: embedded })
    });
  }

  function getCatalogueJsonLd(catalogueId) {
    const catalogue = catalogueById.get(catalogueId);
    if (!catalogue) throw new Error(`Unknown catalogue: ${catalogueId}`);
    return catalogueToJsonLd(catalogue);
  }

  function createPuzzleSkeleton({ id, title, category }) {
    return {
      "@context": CONCEPT_CLUSTERS_CONTEXT,
      "@id": puzzleUrn(id),
      "@type": JSON_LD_TYPES.puzzle,
      schemaVersion: CONTENT_SCHEMA_VERSION,
      id,
      title,
      category,
      clusters: [],
      bridges: []
    };
  }

  function validatePuzzleJsonLd(document) {
    const errors = validateJsonLdProfile(document);
    if (errors.length) return { valid: false, errors };
    if (document["@type"] !== JSON_LD_TYPES.puzzle) {
      return {
        valid: false,
        errors: ["Hosted authoring drafts must contain a Puzzle document"]
      };
    }
    try {
      const puzzle = puzzleFromJsonLd(document);
      const relatedIds = new Set(knownPuzzleIds);
      relatedIds.add(puzzle.id);
      errors.push(...validatePuzzleContent(puzzle, {
        knownPuzzleIds: relatedIds
      }));
      errors.push(...validateLearningIntroductionStructure(puzzle, {
        requireEmbedded: true
      }));
      validateSubcategoryAssignments([puzzle], categories)
        .forEach(error => errors.push(`${error.scope}: ${error.message}`));
    } catch (error) {
      errors.push(error.message);
    }
    return { valid: errors.length === 0, errors };
  }

  function previewRepositoryImport(document) {
    const validation = validatePuzzleJsonLd(document);
    if (!validation.valid) return { ...validation, preview: null };
    const puzzle = puzzleFromJsonLd(document);
    const action = knownPuzzleIds.has(puzzle.id) ? "replace" : "create";
    const affectedPaths = [
      `content/puzzles/${puzzle.id}.ccpuzzle.jsonld`,
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
    getCatalogueJsonLd,
    getPuzzleJsonLd,
    guidance: HOSTED_AUTHORING_GUIDANCE,
    knownPuzzleIds,
    listPuzzles,
    previewRepositoryImport,
    puzzles,
    createPuzzleSkeleton,
    validatePuzzleJsonLd
  };
}

export default createHostedAuthoringContentService;
