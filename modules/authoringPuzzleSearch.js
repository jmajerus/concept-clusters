// Category-scoped puzzle discovery for authoring MCP. Reuses library search
// ranking (title, terms, tags, optional full text) so agents can check
// coverage before opening a gap-fill draft. The MCP caller supplies published
// D1 rows and the owner's drafts; the generic merge function still accepts a
// Git collection for checkout-aware non-MCP callers.

import {
  categoriesForPuzzle,
  puzzleBelongsToCategory,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import { categorySummary } from "./categoryDiscovery.js";
import {
  PUZZLE_MATCH,
  parseLibraryQuery,
  puzzleMatchFields,
  puzzleMatchRank
} from "./librarySearch.js";
import { puzzleSearchTerms } from "./puzzleBrowse.js";
import {
  documentForEditor,
  redactMcpExcludedDocumentFields
} from "./authoredPuzzleDocument.js";
import { unpublishedChangeDomains } from "./draftReviewDiff.js";
import { AGENT_CORPUS_STATUSES, updatedWithin } from "./puzzleCorpusStatus.js";

const MATCH_KIND = Object.freeze({
  [PUZZLE_MATCH.TITLE]: "title",
  [PUZZLE_MATCH.CATEGORY]: "category",
  [PUZZLE_MATCH.TAG]: "tag",
  [PUZZLE_MATCH.CITATION]: "citation",
  [PUZZLE_MATCH.SUBCATEGORY]: "subcategory",
  [PUZZLE_MATCH.TERM]: "term",
  [PUZZLE_MATCH.FULLTEXT]: "fulltext"
});

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function gitPuzzlesFromService(contentService = null) {
  if (Array.isArray(contentService?.puzzles)) return contentService.puzzles;
  if (Array.isArray(contentService?.state?.puzzles)) return contentService.state.puzzles;
  return [];
}

export function puzzleForAuthoringSearch(source, {
  searchSource = "git",
  draftId = null,
  id = null,
  categoryRegistry = null
} = {}) {
  if (!source || typeof source !== "object") return null;
  const puzzle = redactMcpExcludedDocumentFields(
    documentForEditor(clone(source), { categoryRegistry })
  );
  const puzzleId = id || puzzle.id;
  if (!puzzleId) return null;
  puzzle.id = puzzleId;
  puzzle.clusters = (puzzle.clusters || []).map(cluster => ({
    ...cluster,
    terms: Array.isArray(cluster.terms) && cluster.terms.length
      ? cluster.terms
      : [...(cluster.seeds || []), ...(cluster.floatingTerms || [])]
  }));
  puzzle._searchTerms = puzzleSearchTerms(puzzle);
  puzzle._searchSource = searchSource;
  if (draftId) puzzle._draftId = draftId;
  return puzzle;
}

export function mergeAuthoringSearchPuzzles({
  gitPuzzles = [],
  publishedRows = [],
  drafts = [],
  categoryRegistry = null
} = {}) {
  const byId = new Map();
  for (const puzzle of gitPuzzles) {
    const item = puzzleForAuthoringSearch(puzzle, { searchSource: "git", categoryRegistry });
    if (item) byId.set(item.id, item);
  }
  const publishedById = new Map();
  for (const row of publishedRows) {
    const item = puzzleForAuthoringSearch(row?.document, {
      searchSource: "published",
      categoryRegistry
    });
    if (!item) continue;
    publishedById.set(item.id, row);
    item._corpus = {
      published: !row.withdrawnAt,
      withdrawn: Boolean(row.withdrawnAt),
      hasWorkingCopy: false,
      updatedAt: row.updatedAt || ""
    };
    byId.set(item.id, item);
  }
  for (const draft of drafts) {
    const document = draft?.document;
    const puzzleId = document?.id || draft?.puzzleId || draft?.draftId;
    const item = puzzleForAuthoringSearch(document || { id: puzzleId }, {
      searchSource: "draft",
      draftId: draft?.draftId || puzzleId,
      id: puzzleId,
      categoryRegistry
    });
    if (!item) continue;
    const published = byId.get(item.id)?._corpus;
    item._corpus = {
      published: published?.published === true,
      withdrawn: published?.withdrawn === true,
      hasWorkingCopy: true,
      updatedAt: draft?.updatedAt || published?.updatedAt || ""
    };
    item._changeBasis = {
      publishedRow: publishedById.get(item.id) || null,
      draft,
      categoryRegistry
    };
    byId.set(item.id, item);
  }
  return [...byId.values()];
}

// Change domains cost a full partition diff, so they are computed only when a
// status filter needs them, the same way the admin list computes its column.
function corpusStatusOf(puzzle) {
  const status = puzzle._corpus || {};
  if (status.unpublishedChangeDomains) return status;
  const { publishedRow, draft, categoryRegistry } = puzzle._changeBasis || {};
  let domains = [];
  if (publishedRow?.document && !publishedRow.withdrawnAt && draft?.document) {
    domains = unpublishedChangeDomains(
      documentForEditor(publishedRow.document, { categoryRegistry }),
      documentForEditor(draft.document, { categoryRegistry }),
      { publishedLayout: publishedRow.layout || null, draftLayout: draft.layout || null }
    );
  }
  status.unpublishedChangeDomains = domains;
  puzzle._corpus = status;
  return status;
}

/** Corpus fields a list or search result reports beside the puzzle's identity. */
export function corpusStatusSummary(puzzle, { includeChangeDomains = false } = {}) {
  const status = includeChangeDomains ? corpusStatusOf(puzzle) : puzzle._corpus || {};
  return {
    ...(status.updatedAt ? { updatedAt: status.updatedAt } : {}),
    ...(puzzle._draftId ? { draft_id: puzzle._draftId } : {}),
    ...(includeChangeDomains && status.unpublishedChangeDomains?.length
      ? { unpublishedChangeDomains: [...status.unpublishedChangeDomains] }
      : {})
  };
}

function containsQuery(value, query) {
  return typeof value === "string" && value.toLowerCase().includes(query);
}

function normalizedId(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, "-");
}

function puzzleHasSubcategory(puzzle, subcategory, category, categoryRegistry) {
  const wanted = normalizedId(subcategory);
  const categories = category
    ? [category]
    : categoriesForPuzzle(puzzle, categoryRegistry || undefined);
  return categories.some(name => {
    const id = subcategoryIdForPuzzle(puzzle, name, categoryRegistry || undefined);
    return id && normalizedId(id) === wanted;
  });
}

/**
 * Narrow a merged authoring corpus. Every criterion is optional and they
 * combine with AND. status and updatedWithin follow the admin puzzle list
 * (see puzzleCorpusStatus.js); a puzzle's date is its working copy's when it
 * has one, otherwise its published row's.
 */
export function filterAuthoringPuzzles(
  puzzles,
  {
    category = null,
    catalogueId = null,
    catalogues = [],
    categoryRegistry = null,
    subcategory = null,
    tag = null,
    puzzleKind = null,
    hasLenses = null,
    hasLearningIntroduction = null,
    status = null,
    updatedWithin: window = null,
    now = new Date()
  } = {}
) {
  let members = puzzles;
  if (catalogueId && catalogueId !== "all") {
    const catalogue = catalogues.find(item => item.id === catalogueId);
    if (!catalogue) throw new Error(`Unknown catalogue: ${catalogueId}`);
    const ids = new Set(catalogue.entries.map(entry => entry.id));
    members = members.filter(puzzle => ids.has(puzzle.id));
  }
  if (category) {
    members = members.filter(puzzle =>
      puzzleBelongsToCategory(puzzle, category, categoryRegistry || undefined)
    );
  }
  if (subcategory) {
    members = members.filter(puzzle =>
      puzzleHasSubcategory(puzzle, subcategory, category, categoryRegistry)
    );
  }
  if (tag) {
    const wanted = tag.trim().toLowerCase();
    members = members.filter(puzzle =>
      (puzzle.tags || []).some(value => String(value).trim().toLowerCase() === wanted)
    );
  }
  if (puzzleKind) {
    members = members.filter(puzzle => (puzzle.puzzleKind || "topic-based") === puzzleKind);
  }
  if (typeof hasLenses === "boolean") {
    members = members.filter(puzzle => Boolean(puzzle.lenses?.length) === hasLenses);
  }
  if (typeof hasLearningIntroduction === "boolean") {
    members = members.filter(puzzle =>
      Boolean(puzzle.learningIntroduction) === hasLearningIntroduction
    );
  }
  if (status) {
    const matches = AGENT_CORPUS_STATUSES[status];
    if (!matches) throw new Error(`Unknown status: ${status}`);
    members = members.filter(puzzle => matches(
      status === "unpublished_changes" ? corpusStatusOf(puzzle) : puzzle._corpus || {}
    ));
  }
  if (window) {
    members = members.filter(puzzle => updatedWithin(puzzle._corpus?.updatedAt, window, now));
  }
  return members;
}

/** Newest first, as the admin list's Recent arrangement orders working copies. */
export function sortByRecent(puzzles) {
  return [...puzzles].sort((left, right) =>
    String(right._corpus?.updatedAt || "").localeCompare(String(left._corpus?.updatedAt || ""))
    || String(left.title || "").localeCompare(String(right.title || ""))
  );
}

function matchingBoardTerm(puzzle, query) {
  for (const cluster of puzzle.clusters || []) {
    if (containsQuery(cluster.name, query)) {
      return { kind: "cluster", value: cluster.name };
    }
    for (const term of cluster.terms || []) {
      if (containsQuery(term, query)) return { kind: "term", value: term };
    }
    for (const seed of cluster.seeds || []) {
      if (containsQuery(seed, query)) return { kind: "seed", value: seed };
    }
  }
  for (const bridge of puzzle.bridges || []) {
    if (containsQuery(bridge.term, query)) {
      return { kind: "bridge", value: bridge.term };
    }
  }
  return null;
}

function matchDetail(puzzle, rawQuery, rank, options) {
  const { query } = parseLibraryQuery(rawQuery, options);
  if (!query) return null;

  switch (rank) {
    case PUZZLE_MATCH.TITLE:
      return { field: "title", value: puzzle.title };
    case PUZZLE_MATCH.CATEGORY: {
      const hit = categoriesForPuzzle(puzzle, options.categoryRegistry || undefined)
        .find(name => containsQuery(name, query));
      return hit ? { field: "category", value: hit } : null;
    }
    case PUZZLE_MATCH.TAG: {
      const hit = (puzzle.tags || []).find(tag => containsQuery(tag, query));
      return hit ? { field: "tag", value: hit } : null;
    }
    case PUZZLE_MATCH.SUBCATEGORY: {
      for (const category of categoriesForPuzzle(puzzle, options.categoryRegistry || undefined)) {
        const id = subcategoryIdForPuzzle(puzzle, category, options.categoryRegistry || undefined);
        if (id && (containsQuery(id, query) || containsQuery(id.replaceAll("-", " "), query))) {
          return { field: "subcategory", value: `${category}: ${id}` };
        }
      }
      return null;
    }
    case PUZZLE_MATCH.TERM: {
      const hit = matchingBoardTerm(puzzle, query);
      return hit ? { field: hit.kind, value: hit.value } : null;
    }
    case PUZZLE_MATCH.FULLTEXT: {
      const fields = puzzleMatchFields(puzzle, rawQuery, options);
      const first = fields[0];
      return first ? { field: first.path, value: first.snippet } : null;
    }
    case PUZZLE_MATCH.CITATION:
      return { field: "citation", value: query };
    default:
      return null;
  }
}

/**
 * Search the supplied published/D1 and owner-draft collections for overlap
 * before gap-fill authoring, or for copy/fact lookup when fullText is true.
 * Prefer category (or catalogue_id) so results stay teachable-neighbor sized.
 */
export function searchAuthoringPuzzles(
  puzzles,
  categories,
  {
    query,
    category = null,
    catalogueId = null,
    catalogues = [],
    fullText = false,
    limit = 10,
    ...filters
  } = {}
) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (!trimmed) {
    return { query: "", category: category || null, catalogue_id: catalogueId || null, matches: [] };
  }
  if (category) categorySummary(puzzles, categories, category);

  const options = {
    allowFullText: true,
    implicitFullText: !!fullText,
    categoryRegistry: categories
  };
  const members = filterAuthoringPuzzles(puzzles, {
    ...filters,
    category,
    catalogueId,
    catalogues,
    categoryRegistry: categories
  });
  const ranked = members
    .map((puzzle, index) => {
      const rank = puzzleMatchRank(puzzle, trimmed, options);
      return rank === PUZZLE_MATCH.NONE
        ? null
        : {
          puzzle,
          index,
          rank,
          match: MATCH_KIND[rank],
          detail: matchDetail(puzzle, trimmed, rank, options)
        };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, Math.max(1, Math.min(limit, 25)));

  return {
    query: trimmed,
    category: category || null,
    catalogue_id: catalogueId || null,
    full_text: !!fullText,
    matches: ranked.map(({ puzzle, match, detail }) => ({
      id: puzzle.id,
      title: puzzle.title,
      category: puzzle.category,
      ...(puzzle.categories ? { categories: [...puzzle.categories] } : {}),
      match,
      ...(puzzle._searchSource ? { source: puzzle._searchSource } : {}),
      ...corpusStatusSummary(puzzle, {
        includeChangeDomains: filters.status === "unpublished_changes"
      }),
      ...(detail ? { detail } : {})
    }))
  };
}
