import {
  categoriesForPuzzle,
  subcategoryById,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import { libraryCatalogues } from "./catalogueRegistry.js";

// Library search matching. Pure: no DOM. overviewRenderer.js is the only
// player-facing caller; tests/library-search-engine.mjs covers the cases
// below without a browser.
//
// Query is normalized once at the public API (trim + lowercase). An empty
// query matches nothing here -- the Library screen treats empty as "show
// the normal catalogue list" rather than "match everything", so these
// helpers refuse to turn "" into a universal hit (every string includes
// the empty string).
//
// Experimental, admin-only (`?admin`): a query that starts with `text:`
// (any case) also walks the rest of the in-memory puzzle or catalogue
// object -- facts, lens copy, related-puzzle reasons, embedded lesson
// markdown, catalogue entry reasons, and so on. Structured fields still
// rank first; a hit that exists only in that deeper prose is
// PUZZLE_MATCH.FULLTEXT / CATALOGUE_MATCH.FULLTEXT. Without admin mode
// the prefix is not an operator (the whole string is the query). Must
// not appear in the player-facing placeholder. Lesson files referenced
// only by learningIntroduction.content.src are not read here (that would
// be async); only embedded content.text is visible.

export const PUZZLE_MATCH = {
  TITLE: 0,
  CATEGORY: 1,
  TAG: 2,
  CITATION: 3,
  SUBCATEGORY: 4,
  TERM: 5,
  FULLTEXT: 6,
  NONE: Infinity
};

const CATALOGUE_MATCH = {
  TITLE: 0,
  INFO: 1,
  FULLTEXT: 2,
  NONE: Infinity
};

const FULLTEXT_PREFIX = "text:";
const SNIPPET_RADIUS = 42;

export function parseLibraryQuery(rawQuery, { allowFullText = false } = {}) {
  const trimmed = String(rawQuery ?? "").trim();
  const lower = trimmed.toLowerCase();
  if (allowFullText && lower.startsWith(FULLTEXT_PREFIX)) {
    return {
      fullText: true,
      query: trimmed.slice(FULLTEXT_PREFIX.length).trim().toLowerCase()
    };
  }
  return { fullText: false, query: lower };
}

function containsQuery(value, query) {
  return typeof value === "string" && value.toLowerCase().includes(query);
}

function catalogueInfoText(catalogue) {
  const info = catalogue?.info;
  if (typeof info === "string") return info;
  return typeof info?.text === "string" ? info.text : "";
}

function subcategoryMatchesQuery(puzzle, query) {
  return categoriesForPuzzle(puzzle).some(category => {
    const id = subcategoryIdForPuzzle(puzzle, category);
    if (!id) return false;
    if (containsQuery(id, query) || containsQuery(id.replaceAll("-", " "), query)) {
      return true;
    }
    return containsQuery(subcategoryById(category, id)?.title, query);
  });
}

function boardTermMatchesQuery(puzzle, query) {
  for (const cluster of puzzle.clusters || []) {
    if (containsQuery(cluster.name, query)) return true;
    if ((cluster.terms || []).some(term => containsQuery(term, query))) return true;
  }
  return (puzzle.bridges || []).some(bridge => containsQuery(bridge.term, query));
}

// Puzzle-level bibliography only -- the book a puzzle is based on lives on
// info.citations (and the lesson's own footnotes), not on every cluster or
// term citation, which are supporting sources rather than the work itself.
function puzzleCitations(puzzle) {
  return [
    ...citationList(puzzle.info),
    ...citationList(puzzle.learningIntroduction)
  ];
}

function citationList(info) {
  return Array.isArray(info?.citations) ? info.citations : [];
}

// "Shay, Jonathan" ↔ "Jonathan Shay". Only invert a single comma so a
// two-author string like "Herman, Edward S., and Chomsky, Noam" is left
// to token matching below rather than turned into a scramble.
function invertedCommaName(author) {
  const comma = author.indexOf(",");
  if (comma === -1 || author.indexOf(",", comma + 1) !== -1) return "";
  const last = author.slice(0, comma).trim();
  const rest = author.slice(comma + 1).trim();
  return last && rest ? `${rest} ${last}` : "";
}

function citationAuthorMatchesQuery(author, query) {
  if (typeof author !== "string") return false;
  if (containsQuery(author, query)) return true;
  if (containsQuery(invertedCommaName(author), query)) return true;
  const tokens = query.split(/\s+/).filter(token => token.length > 1);
  if (tokens.length < 2) return false;
  const haystack = author.toLowerCase();
  return tokens.every(token => haystack.includes(token));
}

function citationMatchesQuery(puzzle, query) {
  return puzzleCitations(puzzle).some(citation =>
    citationAuthorMatchesQuery(citation.author, query) ||
    containsQuery(citation.title, query)
  );
}

function structuredPuzzleRank(puzzle, query) {
  if (containsQuery(puzzle.title, query)) return PUZZLE_MATCH.TITLE;
  if (categoriesForPuzzle(puzzle).some(name => containsQuery(name, query))) {
    return PUZZLE_MATCH.CATEGORY;
  }
  if ((puzzle.tags || []).some(tag => containsQuery(tag, query))) {
    return PUZZLE_MATCH.TAG;
  }
  if (citationMatchesQuery(puzzle, query)) return PUZZLE_MATCH.CITATION;
  if (subcategoryMatchesQuery(puzzle, query)) return PUZZLE_MATCH.SUBCATEGORY;
  if (boardTermMatchesQuery(puzzle, query)) return PUZZLE_MATCH.TERM;
  return PUZZLE_MATCH.NONE;
}

function structuredCatalogueRank(catalogue, query) {
  if (containsQuery(catalogue.title, query)) return CATALOGUE_MATCH.TITLE;
  if (containsQuery(catalogueInfoText(catalogue), query)) return CATALOGUE_MATCH.INFO;
  return CATALOGUE_MATCH.NONE;
}

// Identity, layout, and URL fields -- not the prose a full-text query is
// trying to search. Booleans/numbers are skipped by collectStringFields anyway.
const FULLTEXT_SKIP_KEYS = new Set([
  "id", "color", "link", "extraLink", "href", "url", "src",
  "relationKind", "termRole", "conceptId", "date", "system", "provider",
  "scope", "role", "requirement", "revision", "mediaType", "ordered",
  "kind", "showInLibrary", "large", "lensMode", "level", "language",
  "license", "version", "derivedFrom", "creator", "dateCreated",
  "dateModified", "generativeAssistance"
]);

function joinPath(parent, key) {
  if (typeof key === "number") return `${parent}[${key}]`;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    const quoted = `[${JSON.stringify(key)}]`;
    return parent ? parent + quoted : quoted;
  }
  return parent ? `${parent}.${key}` : key;
}

function collectStringFields(value, path, out) {
  if (typeof value === "string") {
    if (path && value && !value.startsWith("wiki:") && !/^https?:/i.test(value)) {
      out.push({ path, value });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStringFields(item, joinPath(path, index), out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (FULLTEXT_SKIP_KEYS.has(key)) continue;
      collectStringFields(nested, joinPath(path, key), out);
    }
  }
}

const puzzleFieldsCache = new WeakMap();
const catalogueFieldsCache = new WeakMap();

function contentFields(target, cache) {
  let fields = cache.get(target);
  if (fields === undefined) {
    fields = [];
    collectStringFields(target, "", fields);
    cache.set(target, fields);
  }
  return fields;
}

function isAuthorPath(path) {
  return path === "author" || path.endsWith(".author");
}

function snippetAround(value, query) {
  const at = value.toLowerCase().indexOf(query);
  if (at === -1) {
    return value.length > SNIPPET_RADIUS * 2
      ? `${value.slice(0, SNIPPET_RADIUS * 2)}…`
      : value;
  }
  const start = Math.max(0, at - SNIPPET_RADIUS);
  const end = Math.min(value.length, at + query.length + SNIPPET_RADIUS);
  return `${start > 0 ? "…" : ""}${value.slice(start, end)}${end < value.length ? "…" : ""}`;
}

function matchingContentFields(target, query, cache) {
  return contentFields(target, cache).flatMap(({ path, value }) => {
    const hit = containsQuery(value, query) ||
      (isAuthorPath(path) && citationAuthorMatchesQuery(value, query));
    if (!hit) return [];
    return [{ path, snippet: snippetAround(value, query) }];
  });
}

export function puzzleMatchFields(puzzle, rawQuery, options) {
  const { query, fullText } = parseLibraryQuery(rawQuery, options);
  if (!query || !fullText) return [];
  return matchingContentFields(puzzle, query, puzzleFieldsCache);
}

export function catalogueMatchFields(catalogue, rawQuery, options) {
  const { query, fullText } = parseLibraryQuery(rawQuery, options);
  if (!query || !fullText) return [];
  return matchingContentFields(catalogue, query, catalogueFieldsCache);
}

export function puzzleMatchRank(puzzle, rawQuery, options) {
  const { query, fullText } = parseLibraryQuery(rawQuery, options);
  if (!query) return PUZZLE_MATCH.NONE;
  const structured = structuredPuzzleRank(puzzle, query);
  if (structured !== PUZZLE_MATCH.NONE) return structured;
  if (fullText && matchingContentFields(puzzle, query, puzzleFieldsCache).length) {
    return PUZZLE_MATCH.FULLTEXT;
  }
  return PUZZLE_MATCH.NONE;
}

export function puzzleMatchesQuery(puzzle, rawQuery, options) {
  return puzzleMatchRank(puzzle, rawQuery, options) !== PUZZLE_MATCH.NONE;
}

export function rankedPuzzleMatches(puzzles, rawQuery, options) {
  const { query } = parseLibraryQuery(rawQuery, options);
  if (!query) return [];
  return puzzles
    .map((puzzle, index) => ({
      puzzle,
      index,
      rank: puzzleMatchRank(puzzle, rawQuery, options)
    }))
    .filter(item => item.rank !== PUZZLE_MATCH.NONE)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(item => item.puzzle);
}

export function catalogueMatchRank(catalogue, rawQuery, options) {
  const { query, fullText } = parseLibraryQuery(rawQuery, options);
  if (!query) return CATALOGUE_MATCH.NONE;
  const structured = structuredCatalogueRank(catalogue, query);
  if (structured !== CATALOGUE_MATCH.NONE) return structured;
  if (fullText && matchingContentFields(catalogue, query, catalogueFieldsCache).length) {
    return CATALOGUE_MATCH.FULLTEXT;
  }
  return CATALOGUE_MATCH.NONE;
}

export function catalogueMatchesQuery(catalogue, rawQuery, options) {
  return catalogueMatchRank(catalogue, rawQuery, options) !== CATALOGUE_MATCH.NONE;
}

// Library's visible catalogues (All/New/levels + top-level authored), then
// any authored catalogue suppressed from that list for being nested under
// a meta parent. Nested catalogues stay reachable by search even when they
// don't get a top-level Library card (see CATALOGUES.md).
export function searchableCatalogues(puzzles, catalogues) {
  const byId = new Map();
  for (const catalogue of libraryCatalogues(puzzles, catalogues)) {
    byId.set(catalogue.id, catalogue);
  }
  for (const catalogue of catalogues) {
    if (!byId.has(catalogue.id)) byId.set(catalogue.id, catalogue);
  }
  return [...byId.values()];
}

export function matchingCatalogues(puzzles, catalogues, rawQuery, options) {
  const { query } = parseLibraryQuery(rawQuery, options);
  if (!query) return [];
  return searchableCatalogues(puzzles, catalogues)
    .map((catalogue, index) => ({
      catalogue,
      index,
      rank: catalogueMatchRank(catalogue, rawQuery, options)
    }))
    .filter(item => item.rank !== CATALOGUE_MATCH.NONE)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(item => item.catalogue);
}
