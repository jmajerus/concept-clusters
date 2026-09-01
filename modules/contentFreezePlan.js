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
