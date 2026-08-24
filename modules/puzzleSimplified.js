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
import { slugify } from "../puzzles/categories.js";
import { canonicalizeDocumentInfoLinks, hoistDocumentCitations } from "./termInfo.js";

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
// as the simplified-shaped sibling of puzzleToJsonLd. Round-trips
// losslessly: bridge/cluster ids are always carried explicitly (never left
// to re-derivation), and a cluster's terms order is always set explicitly
// via the `terms` override field (see ClusterSchema in
// simplifiedPuzzleSchema.js), even when it happens to already equal
// seeds-then-floatingTerms, so this never depends on floatingTerms order
// reconstructing anything.
export function puzzleToSimplified(puzzle, { learningContent = null } = {}) {
  const clusterIds = stableIds(puzzle.clusters, cluster => cluster.name);
  const bridgeIds = stableIds(puzzle.bridges, bridge => bridge.term);

  const clusters = puzzle.clusters.map((cluster, index) => {
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

  const bridges = puzzle.bridges.map((bridge, index) => {
    const result = {
      id: bridgeIds[index],
      term: bridge.term,
      clusters: bridge.clusters.map(index => clusterIds[index]),
      fact: bridge.fact,
      ...(bridge.info ? { info: clone(bridge.info) } : {}),
      ...(bridge.conceptId ? { conceptId: bridge.conceptId } : {}),
      ...(bridge.termRole ? { termRole: bridge.termRole } : {}),
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

  const learningIntroduction = puzzle.learningIntroduction ? {
    requirement: puzzle.learningIntroduction.requirement,
    ...(puzzle.learningIntroduction.title ? { title: puzzle.learningIntroduction.title } : {}),
    ...(puzzle.learningIntroduction.summary ? { summary: puzzle.learningIntroduction.summary } : {}),
    ...(puzzle.learningIntroduction.estimatedMinutes !== undefined
      ? { estimatedMinutes: puzzle.learningIntroduction.estimatedMinutes } : {}),
    content: { text: learningContent !== null ? learningContent : puzzle.learningIntroduction.content.text },
    ...(puzzle.learningIntroduction.links ? { links: clone(puzzle.learningIntroduction.links) } : {}),
    ...(puzzle.learningIntroduction.sources ? { sources: clone(puzzle.learningIntroduction.sources) } : {}),
    ...(puzzle.learningIntroduction.citations ? { citations: clone(puzzle.learningIntroduction.citations) } : {}),
    ...(puzzle.learningIntroduction.revision !== undefined
      ? { revision: puzzle.learningIntroduction.revision } : {})
  } : undefined;

  return {
    id: puzzle.id,
    title: puzzle.title,
    category: puzzle.category,
    ...(puzzle.categories ? { categories: [...puzzle.categories] } : {}),
    ...(puzzle.subcategories ? { subcategories: clone(puzzle.subcategories) } : {}),
    ...(puzzle.large !== undefined ? { large: puzzle.large } : {}),
    ...(puzzle.tags ? { tags: [...puzzle.tags] } : {}),
    ...(puzzle.level ? { level: puzzle.level } : {}),
    ...(puzzle.info ? { info: clone(puzzle.info) } : {}),
    clusters,
    bridges,
    ...(puzzle.lenses ? { lenses: clone(puzzle.lenses) } : {}),
    ...(puzzle.lensMode ? { lensMode: puzzle.lensMode } : {}),
    ...(puzzle.preSolve !== undefined ? { preSolve: puzzle.preSolve } : {}),
    ...(puzzle.relatedPuzzles ? { relatedPuzzles: clone(puzzle.relatedPuzzles) } : {}),
    ...(learningIntroduction ? { learningIntroduction } : {}),
    ...(puzzle.generativeAssistance ? { generativeAssistance: clone(puzzle.generativeAssistance) } : {}),
    ...(puzzle.creator ? { creator: puzzle.creator } : {}),
    ...(puzzle.license ? { license: puzzle.license } : {}),
    ...(puzzle.derivedFrom ? { derivedFrom: puzzle.derivedFrom } : {}),
    ...(puzzle.dateCreated ? { dateCreated: puzzle.dateCreated } : {}),
    ...(puzzle.dateModified ? { dateModified: puzzle.dateModified } : {}),
    ...(puzzle.language ? { language: puzzle.language } : {}),
    ...(puzzle.version ? { version: puzzle.version } : {})
  };
}

// Install and publication replace the puzzle as one JSON blob. That write
// is when leftover link/extraLink/seeAlso become `links` puzzle-wide.
// puzzleToSimplified stays a lossless round-trip so unedited published
// puzzles do not look rewritten in checkout diffs.
export function puzzleForCanonicalPublication(puzzle, options) {
  const next = hoistDocumentCitations(canonicalizeDocumentInfoLinks(clone(puzzle)));
  return { puzzle: next, simplified: puzzleToSimplified(next, options) };
}
