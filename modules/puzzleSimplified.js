// Pure conversion from the runtime puzzle shape to the simplified document
// shape (modules/simplifiedPuzzleSchema.js's SimplifiedPuzzleInputSchema),
// factored into its own zod-free module so repositoryPublicationService.js
// can depend on it directly. That module backs tools/content-jsonld.mjs's
// standalone CLI, whose own test suite runs it against an isolated
// repository copy with no node_modules (see tests/jsonld-cli.mjs) -- a
// static import of zod (which modules/simplifiedPuzzleSchema.js pulls in
// for its schema) would break that path. simplifiedPuzzleSchema.js
// re-exports this function so every other caller keeps importing it from
// there unchanged.
import {
  canonicalizePuzzleCategoryReferences,
  slugify
} from "../puzzles/categories.js";
import { largeField, puzzleNodeCount } from "./puzzleBoardSize.js";
import { canonicalizeDocumentInfoLinks, hoistDocumentCitations } from "./termInfo.js";
import { canonicalizeDocumentProvenance } from "./authoringProvenance.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// Puzzles loaded straight from their original hand-authored .js module
// (most of them -- only puzzles that have gone through the canonical-file
// pipeline are guaranteed a stable `id` on every cluster/bridge already)
// may have no cluster/bridge `id` at all. Derive one the same way
// deriveClusterIds() in simplifiedPuzzleSchema.js would for simplified
// input that omits it, so the emitted document is stable either way.
function stableIds(items, labelFor) {
  const used = new Set();
  return items.map(item => {
    const preferred = typeof item.id === "string" && item.id.trim()
      ? item.id
      : slugify(labelFor(item)) || "item";
    let id = preferred;
    let suffix = 2;
    while (used.has(id)) id = `${preferred}-${suffix++}`;
    used.add(id);
    return id;
  });
}

// Inverse of puzzleFromSimplified: takes the runtime puzzle shape (as
// produced by puzzleFromJsonLd or puzzleFromSimplified itself) and returns
// a document matching SimplifiedPuzzleInputSchema. Used for the one-time
// migration of hand-authored JSON-LD content to the simplified canonical
// format, by repository/content-interchange publication to write the
// canonical content/puzzles/<id>.ccpuzzle.json file, and by content:export
// as the simplified-shaped sibling of puzzleToJsonLd. Round-trips current
// fields losslessly: bridge/cluster ids are always carried explicitly (never
// left to re-derivation), and a cluster's terms order is always set explicitly
// via the `terms` override field (see ClusterSchema in
// simplifiedPuzzleSchema.js), even when it happens to already equal
// seeds-then-floatingTerms, so this never depends on floatingTerms order
// reconstructing anything. Retired legacy bridge termRole is intentionally
// omitted from the current projection. Retired generativeAssistance is folded
// into provenance before projection when a legacy runtime module still has it.
export function puzzleToSimplified(
  puzzle,
  {
    learningContent = null,
    canonicalCategories = false,
    categoryRegistry
  } = {}
) {
  // Runtime modules from before the provenance migration may still carry the
  // legacy generative-assistance array. Canonicalize that read projection too
  // so authoring/interchange callers do not silently lose attribution merely
  // because they bypassed the publication wrapper.
  const withProvenance = canonicalizeDocumentProvenance(puzzle);
  const source = canonicalCategories
    ? canonicalizePuzzleCategoryReferences(withProvenance, categoryRegistry)
    : withProvenance;
  const clusterIds = stableIds(source.clusters, cluster => cluster.name);
  const bridgeIds = stableIds(source.bridges, bridge => bridge.term);

  const clusters = source.clusters.map((cluster, index) => {
    const floatingTerms = cluster.terms.filter(term => !cluster.seeds.includes(term));
    return {
      id: clusterIds[index],
      name: cluster.name,
      color: cluster.color,
      fact: cluster.fact,
      seeds: [...cluster.seeds],
      floatingTerms,
      terms: [...cluster.terms],
      ...(cluster.termInfo ? { termInfo: clone(cluster.termInfo) } : {}),
      ...(cluster.info ? { info: clone(cluster.info) } : {})
    };
  });

  const bridges = source.bridges.map((bridge, index) => {
    const result = {
      id: bridgeIds[index],
      term: bridge.term,
      clusters: bridge.clusters.map(index => clusterIds[index]),
      fact: bridge.fact,
      ...(bridge.info ? { info: clone(bridge.info) } : {}),
      ...(bridge.conceptId ? { conceptId: bridge.conceptId } : {}),
      ...(bridge.relationKind ? { relationKind: bridge.relationKind } : {})
    };
    if (bridge.idealTerms) {
      const idealTerms = {};
      bridge.clusters.forEach((clusterIndex, position) => {
        const term = bridge.idealTerms[position];
        if (term) idealTerms[clusterIds[clusterIndex]] = term;
      });
      // Always set, even when every entry is null -- bridge.idealTerms
      // being present at all (vs. undefined) is itself meaningful state to
      // round-trip, not just its non-null entries.
      result.idealTerms = idealTerms;
    }
    if (bridge.direction) {
      result.direction = { kind: bridge.direction.kind };
      if (bridge.direction.kind === "through") {
        if (bridge.direction.from !== undefined) result.direction.from = clusterIds[bridge.direction.from];
        if (bridge.direction.to !== undefined) result.direction.to = clusterIds[bridge.direction.to];
      }
    }
    return result;
  });

  const learningIntroduction = source.learningIntroduction ? {
    requirement: source.learningIntroduction.requirement,
    ...(source.learningIntroduction.title ? { title: source.learningIntroduction.title } : {}),
    ...(source.learningIntroduction.summary ? { summary: source.learningIntroduction.summary } : {}),
    ...(source.learningIntroduction.estimatedMinutes !== undefined
      ? { estimatedMinutes: source.learningIntroduction.estimatedMinutes } : {}),
    ...(source.learningIntroduction.credit
      ? { credit: source.learningIntroduction.credit } : {}),
    content: { text: learningContent !== null ? learningContent : source.learningIntroduction.content.text },
    ...(source.learningIntroduction.links ? { links: clone(source.learningIntroduction.links) } : {}),
    ...(source.learningIntroduction.sources ? { sources: clone(source.learningIntroduction.sources) } : {}),
    ...(source.learningIntroduction.revision !== undefined
      ? { revision: source.learningIntroduction.revision } : {})
  } : undefined;

  return {
    id: source.id,
    title: source.title,
    category: source.category,
    ...(source.categories ? { categories: [...source.categories] } : {}),
    ...(source.subcategories ? { subcategories: clone(source.subcategories) } : {}),
    ...largeField(puzzleNodeCount(source)),
    ...(source.tags ? { tags: [...source.tags] } : {}),
    ...(source.level ? { level: source.level } : {}),
    ...(source.info ? { info: clone(source.info) } : {}),
    clusters,
    bridges,
    ...(source.lenses ? { lenses: clone(source.lenses) } : {}),
    ...(source.lensMode ? { lensMode: source.lensMode } : {}),
    ...(source.preSolve !== undefined ? { preSolve: source.preSolve } : {}),
    ...(source.relatedPuzzles ? { relatedPuzzles: clone(source.relatedPuzzles) } : {}),
    ...(learningIntroduction ? { learningIntroduction } : {}),
    ...(source.provenance ? { provenance: clone(source.provenance) } : {}),
    ...(source.creator ? { creator: source.creator } : {}),
    ...(source.license ? { license: source.license } : {}),
    ...(source.derivedFrom ? { derivedFrom: source.derivedFrom } : {}),
    ...(source.dateCreated ? { dateCreated: source.dateCreated } : {}),
    ...(source.dateModified ? { dateModified: source.dateModified } : {}),
    ...(source.language ? { language: source.language } : {}),
    ...(source.version ? { version: source.version } : {})
  };
}

// `canonicalCategories: true` opts into the stable category-id storage
// contract; the default remains a lossless compatibility projection for
// legacy runtime modules.
//
// Install and publication replace the puzzle as one JSON blob. That write
// is when leftover link/extraLink/seeAlso become `links` puzzle-wide,
// legacy generativeAssistance folds into two-axis provenance and is dropped,
// and puzzleToSimplified emits only the current schema fields.
export function puzzleForCanonicalPublication(puzzle, options) {
  const next = hoistDocumentCitations(
    canonicalizeDocumentInfoLinks(
      canonicalizeDocumentProvenance(clone(puzzle))
    )
  );
  const canonical = canonicalizePuzzleCategoryReferences(
    next,
    options?.categoryRegistry
  );
  return { puzzle: canonical, simplified: puzzleToSimplified(canonical, {
    ...(options || {}),
    canonicalCategories: true
  }) };
}
