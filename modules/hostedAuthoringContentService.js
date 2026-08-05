import { CATALOGUES } from "../catalogues/index.js";
import { PUZZLES } from "../puzzles/index.js";
import {
  CATEGORIES,
  slugify
} from "../puzzles/categories.js";
import { catalogueToJsonLd } from "./catalogueJsonLd.js";
import { categorySummaries, categorySummary } from "./categoryDiscovery.js";
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
import { AUTHORING_DESIGN_GUIDANCE } from "./authoringDesignGuidance.js";

export const HOSTED_AUTHORING_GUIDANCE = `# Concept Clusters authoring workflow

Build a complete Puzzle JSON-LD document using the Concept Clusters v1 context.
Use two to six clusters, three to six terms per cluster, two seeds per cluster,
and only genuine conceptual bridges; bridges are optional and need not make the
cluster graph connected. Bridge idealTerms should identify the strongest
conceptual connection when known.
Each cluster's color must be unique within the puzzle, one of teal, blue,
amber, magenta, olive, brown, or cyan -- purple is reserved for bridges and
green/red for lens feedback, so none of those three are valid cluster colors.
Total nodes (all cluster terms plus bridges) are capped at 16, or 24 with
\`large: true\`; only set \`large\` once validation actually flags the puzzle
as over the smaller cap. It only affects rendering, never difficulty --
don't use it as a difficulty signal.

${AUTHORING_DESIGN_GUIDANCE}

## Workflow mechanics

Discover existing subjects with list_categories before choosing category names.
Drafts may be temporarily invalid. Save, then validate and address every error.
The first published puzzle in a new category may propose its category metadata
as part of the same publication pull request; its optional \`domain\` must be
one of the ids list_categories/get_category report (a small fixed
vocabulary, not something a puzzle author invents).
Hosted learning introductions embed Markdown in
learningIntroduction.content.text; packaged files and binary assets are introduced
during repository publication.
submit_puzzle_for_publication validates and opens the pull request directly --
there's no separate approval step, and calling preview_repository_import first
is optional, not a precondition. Merging the pull request stays a separate
human action in GitHub, so submitting doesn't publish anything by itself.
On preview_repository_import and submit_puzzle_for_publication, reason is
scoped to catalogue_id: it becomes that catalogue entry's editorial-choice
text, not a general note about the submission, so pass it only when also
passing catalogue_id -- omit both when the puzzle isn't joining a catalogue.`;

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

  function getCategory(name) {
    return categorySummary(puzzles, categories, name);
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

  function validatePuzzleJsonLd(document, { categoryRegistry = categories } = {}) {
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
      validateSubcategoryAssignments([puzzle], categoryRegistry)
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
    getCategory,
    getPuzzleJsonLd,
    guidance: HOSTED_AUTHORING_GUIDANCE,
    knownPuzzleIds,
    listPuzzles,
    listCategories,
    previewRepositoryImport,
    puzzles,
    createPuzzleSkeleton,
    validatePuzzleJsonLd
  };
}

export default createHostedAuthoringContentService;
