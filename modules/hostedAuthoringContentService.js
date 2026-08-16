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
import { AUTHORING_DESIGN_GUIDANCE } from "./authoringDesignGuidance.js";
import { computeSymmetryFlags } from "./puzzleSymmetryFlags.js";
import { puzzleFromAuthoredDocument, puzzleToSimplified } from "./simplifiedPuzzleSchema.js";

export const HOSTED_AUTHORING_GUIDANCE = `# Concept Clusters authoring workflow

Build \`document\` as the simplified format, not hand-written JSON-LD: no
\`@context\`/\`@id\`/\`@type\`/\`schemaVersion\`, and no cluster/bridge \`@id\`
to keep in sync with \`id\` by hand -- that dual-field pattern is exactly what
kept drifting out of sync in hand-authored JSON-LD, so this format never asks
for it. A minimal example:

\`\`\`json
{
  "id": "cognitive-load-theory",
  "title": "Cognitive Load Theory",
  "category": "Cognitive Science",
  "clusters": [
    {
      "id": "intrinsic-load",
      "name": "Intrinsic Load",
      "fact": "Intrinsic load stems from the inherent complexity of the material itself.",
      "seeds": ["element interactivity", "information complexity"],
      "floatingTerms": ["domain knowledge", "prior schemas"]
    },
    {
      "id": "extraneous-load",
      "name": "Extraneous Load",
      "fact": "Extraneous load is created by poor instructional design or unnecessary distractions.",
      "seeds": ["redundancy effect", "split-attention effect"],
      "floatingTerms": ["seductive details", "format distraction"]
    }
  ],
  "bridges": [
    {
      "term": "germane load",
      "clusters": ["intrinsic-load", "extraneous-load"],
      "fact": "Freeing working memory capacity lets mental effort shift toward schema construction."
    }
  ]
}
\`\`\`

A cluster's \`seeds\` (exactly two) plus \`floatingTerms\` (one to four) become
its full term list, two to six clusters per puzzle. A bridge's \`clusters\`
names exactly two cluster \`id\`s (three for a ternary bridge) -- not
positions, not fragments. Cluster \`id\`, bridge \`id\`, and cluster \`color\`
are all optional and assigned automatically when omitted (cluster \`id\`
derives from \`name\` -- a bridge referencing an id-less cluster should
predict that plain slug). Each cluster's color must be unique within the
puzzle, one of teal, blue, amber, magenta, olive, brown, or cyan -- purple
is reserved for bridges and green/red for lens feedback, so none of those
three are valid cluster colors. Total nodes (all cluster terms plus
bridges) are capped at 16, or 24 with \`large: true\`; only set \`large\` once
validation actually flags the puzzle as over the smaller cap. It only
affects rendering, never difficulty -- don't use it as a difficulty signal.

This is the only supported authoring shape -- not a cut-down feature set.
Bridge \`direction\`/\`idealTerms\`/\`conceptId\`/\`termRole\`/\`relationKind\`,
ternary bridges, all three lens modes, \`relatedPuzzles\`, and
\`learningIntroduction\` are all directly authorable here; call
\`get_authoring_schema\` for the complete machine-readable field contract.
Star layout curation is the one thing that's authored separately from puzzle
content, through a dedicated repository maintainer workflow, not through
this document.

${AUTHORING_DESIGN_GUIDANCE}

## Workflow mechanics

Discover existing subjects with list_categories before choosing category names.
Drafts may be temporarily invalid. Save, then validate and address every error.
When you draft or materially regenerate content with generative AI, set
puzzle.generativeAssistance (one entry per system+scope; update in place on
later edits to the same scope) before saving -- see get_authoring_guidance.
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
Pull-request CI runs structural validate and Worker unit tests -- not the
full Playwright browser suite. Hosted puzzle PRs omit
puzzles/index.js so concurrent submissions do not conflict on GitHub; CI and
a post-merge sync register on-disk modules into the index. If play or taxonomy
issues appear after import, diagnose locally with \`npm run validate\` and
optionally \`npm test\` (a dedicated MCP diagnostic tool for on-demand checks
may be added later).
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
  // feedback (modules/hostedMcpAuthoringServer.js). Storage never converts
  // format -- unlike the old JSON-LD pipeline, `document` in the result is
  // the original input echoed back unchanged when it parses, not a
  // converted replacement; null when it doesn't, same as before, so callers
  // that fall back to `normalization.document ?? document` keep working
  // unchanged. `errors` stays shape/conversion-level only (a draft that
  // parses but is semantically incomplete -- e.g. a lens with no targets --
  // is exactly the "temporarily invalid" case validate_puzzle_draft, not
  // this, is meant to catch).
  function normalizeAuthoredDocument(document) {
    const { puzzle, errors } = puzzleFromAuthoredDocument(document);
    return { document: puzzle ? document : null, errors };
  }

  function createPuzzleSkeleton({ id, title, category }) {
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

  function validatePuzzleDraft(document, { categoryRegistry = categories } = {}) {
    // Safety net: a draft may have been saved with input that didn't
    // convert (create/save store it as given rather than rejecting -- see
    // puzzleFromAuthoredDocument's own comment on JSON-LD read
    // compatibility). Re-running the same conversion here means this
    // reports formatted, field-scoped errors either way instead of a
    // separate, confusing failure mode.
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
    return { valid: errors.length === 0, errors, flags: computeSymmetryFlags(puzzle) };
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
