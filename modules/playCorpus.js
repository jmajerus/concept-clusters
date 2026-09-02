// Published D1 documents → the same browse / catalogue / category shapes
// the player already uses. Derived catalogues (all, new, level-*) stay
// computed on the client. Git modules are not consulted here.

import { isReservedCatalogueId } from "./contentDocumentSeed.js";
import { puzzleBrowseFromDocument } from "./puzzleBrowse.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";

export const PLAY_CORPUS_META_NAME = "cc-play-corpus";
export const PLAY_CORPUS_PATH = "/play/corpus.json";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function htmlWithPlayCorpusMeta(html) {
  const markup = String(html ?? "");
  if (markup.includes(`name="${PLAY_CORPUS_META_NAME}"`)) return markup;
  return markup.replace(
    "<head>",
    `<head>\n  <meta name="${PLAY_CORPUS_META_NAME}" content="${PLAY_CORPUS_PATH}">`
  );
}

export function catalogueFromDocument(document) {
  if (!document || typeof document !== "object") return null;
  const id = typeof document.id === "string" ? document.id.trim() : "";
  if (!id || isReservedCatalogueId(id)) return null;
  return {
    id,
    title: typeof document.title === "string" ? document.title : id,
    ...(document.kind === "meta" ? { kind: "meta" } : {}),
    ...(document.showInLibrary === true ? { showInLibrary: true } : {}),
    ...(document.info ? { info: clone(document.info) } : {}),
    ordered: document.ordered !== false,
    entries: Array.isArray(document.entries)
      ? document.entries.map(entry => ({ ...entry }))
      : [],
    ...(document.relatedCatalogues
      ? { relatedCatalogues: clone(document.relatedCatalogues) }
      : {})
  };
}

export function categoriesRegistryFromDocuments(documents = []) {
  const categories = {};
  for (const document of documents) {
    const title = typeof document?.title === "string" ? document.title.trim() : "";
    if (!title) continue;
    categories[title] = {
      ...(document.id ? { slug: document.id } : {}),
      ...(document.domain ? { domain: document.domain } : {}),
      ...(document.info ? { info: clone(document.info) } : {}),
      ...(document.subcategories ? { subcategories: clone(document.subcategories) } : {})
    };
  }
  return categories;
}

function sortPuzzles(rows, puzzleOrder = []) {
  const order = new Map(puzzleOrder.map((id, index) => [id, index]));
  return [...rows].sort((left, right) => {
    const leftIndex = order.has(left.id) ? order.get(left.id) : Number.MAX_SAFE_INTEGER;
    const rightIndex = order.has(right.id) ? order.get(right.id) : Number.MAX_SAFE_INTEGER;
    if (leftIndex !== rightIndex) return leftIndex - rightIndex;
    return String(left.publishedAt || "").localeCompare(String(right.publishedAt || ""))
      || String(left.id).localeCompare(String(right.id));
  });
}

export function assemblePlayCorpus({
  puzzleRows = [],
  catalogueRows = [],
  categoryRows = [],
  draftRows = [],
  puzzleOrder = []
} = {}) {
  const puzzles = sortPuzzles(puzzleRows, puzzleOrder).flatMap(row => {
    const document = row?.document;
    if (!document?.id) return [];
    return [puzzleBrowseFromDocument(document, { includeProse: true })];
  });
  const drafts = draftRows.flatMap(row => {
    const document = row?.document;
    const id = document?.id || row?.puzzleId || row?.draftId;
    if (!id) return [];
    const browse = puzzleBrowseFromDocument(
      document?.id ? document : { ...document, id },
      { includeProse: true }
    );
    return [{
      ...browse,
      id,
      _searchSource: "draft",
      _draftId: row.draftId || id
    }];
  });
  const catalogues = catalogueRows.flatMap(row => {
    const catalogue = catalogueFromDocument(row?.document);
    return catalogue ? [catalogue] : [];
  });
  const categories = categoriesRegistryFromDocuments(
    categoryRows.map(row => row?.document).filter(Boolean)
  );
  return {
    source: "d1",
    puzzles,
    drafts,
    catalogues,
    categories
  };
}

export function compilePublishedPuzzle(document) {
  return puzzleFromAuthoredDocument(document);
}
