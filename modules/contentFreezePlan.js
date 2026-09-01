import { slugify } from "../puzzles/categories.js";
import { isReservedCatalogueId } from "./contentDocumentSeed.js";

function idsOf(rows = []) {
  return rows.map(row => row?.id).filter(Boolean);
}

function planKind(publishedRows = [], gitIds = []) {
  const git = new Set(gitIds.filter(Boolean));
  const liveIds = new Set(
    idsOf(publishedRows.filter(row => !row?.withdrawnAt))
  );
  const add = [...liveIds].filter(id => !git.has(id)).sort();
  const update = [...liveIds].filter(id => git.has(id)).sort();
  const remove = [...git].filter(id => !liveIds.has(id)).sort();
  return { add, update, remove };
}

function withoutReserved(rowsOrIds = []) {
  return rowsOrIds.filter(item => {
    const id = typeof item === "string" ? item : item?.id;
    return id && !isReservedCatalogueId(id);
  });
}

export function gitIdsFromContentService(contentService = {}) {
  const source = contentService || {};
  const catalogues = source.state?.catalogues || source.catalogues || [];
  const categories = source.state?.categories || source.categories || {};
  const puzzles = source.puzzles || source.state?.puzzles || [];
  const puzzleIds = source.knownPuzzleIds instanceof Set
    ? [...source.knownPuzzleIds]
    : puzzles.map(puzzle => puzzle?.id).filter(Boolean);
  return {
    puzzles: puzzleIds,
    catalogues: catalogues.map(item => item?.id).filter(id => id && !isReservedCatalogueId(id)),
    categories: Object.entries(categories).map(([name, meta]) =>
      (meta && typeof meta === "object" && meta.slug) || slugify(name)
    )
  };
}

// Live published D1 row, not in git, and freeze will actually emit it.
// Meta catalogues are authored in D1 but Export does not freeze them yet.
export function decorateFreezeAdd(rows = [], gitIds = []) {
  const git = new Set(gitIds.filter(Boolean));
  return rows.map(row => ({
    ...row,
    freezeAdd: Boolean(
      row?.published
      && !row?.withdrawn
      && row?.id
      && !git.has(row.id)
      && row?.kind !== "meta"
    )
  }));
}

export async function publishedFreezeAddIds(contentDocuments, kind, gitIds = []) {
  if (!contentDocuments) return new Set();
  const git = new Set(gitIds.filter(Boolean));
  const rows = await contentDocuments.listPublished({ kind });
  return new Set(
    rows
      .filter(row => row?.id && !row.withdrawnAt && !git.has(row.id))
      .map(row => row.id)
  );
}

// Live D1 vs git registries → the freeze patch. Add is a new git file,
// update rewrites an existing one, remove deletes a git file. Withdrawn
// D1 rows and git-only ids both land in remove. Derived catalogues stay
// out. Export does not run this yet.
export function planContentFreeze({
  publishedPuzzles = [],
  publishedCatalogues = [],
  publishedCategories = [],
  gitPuzzleIds = [],
  gitCatalogueIds = [],
  gitCategoryIds = []
} = {}) {
  return {
    puzzles: planKind(publishedPuzzles, gitPuzzleIds),
    catalogues: planKind(
      withoutReserved(publishedCatalogues),
      withoutReserved(gitCatalogueIds)
    ),
    categories: planKind(publishedCategories, gitCategoryIds)
  };
}
