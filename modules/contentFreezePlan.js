import { slugify } from "../puzzles/categories.js";
import { isReservedCatalogueId } from "./contentDocumentSeed.js";

export const CUE_FOR_FREEZE_CONFIRM = "cue-for-freeze";
export const HOLD_FROM_FREEZE_CONFIRM = "hold-from-freeze";
// Previous labels from the same unreleased control.
const LEGACY_CUE_CONFIRM = "ready-for-freeze";
const LEGACY_HOLD_CONFIRM = "clear-freeze-ready";

export function isCuedForFreeze(row) {
  if (row?.withdrawnAt || row?.withdrawn) return false;
  return Boolean(
    row?.cuedForFreezeAt
    || row?.cuedForFreeze
    || row?.readyForFreezeAt
    || row?.readyForFreeze
  );
}

export function parseFreezeCueConfirm(confirm) {
  if (confirm === CUE_FOR_FREEZE_CONFIRM || confirm === LEGACY_CUE_CONFIRM) return true;
  if (confirm === HOLD_FROM_FREEZE_CONFIRM || confirm === LEGACY_HOLD_CONFIRM) return false;
  return null;
}

function idsOf(rows = []) {
  return rows.map(row => row?.id).filter(Boolean);
}

function planKind(publishedRows = [], gitIds = []) {
  const git = new Set(gitIds.filter(Boolean));
  const liveIds = new Set(
    idsOf(publishedRows.filter(row => !row?.withdrawnAt))
  );
  const cuedIds = new Set(
    idsOf(publishedRows.filter(row => !row?.withdrawnAt && isCuedForFreeze(row)))
  );
  const add = [...cuedIds].filter(id => !git.has(id)).sort();
  const update = [...cuedIds].filter(id => git.has(id)).sort();
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
      && isCuedForFreeze(row)
    )
  }));
}

export async function publishedFreezeAddIds(contentDocuments, kind, gitIds = []) {
  if (!contentDocuments) return new Set();
  const git = new Set(gitIds.filter(Boolean));
  const rows = await contentDocuments.listPublished({ kind });
  return new Set(
    rows
      .filter(row => row?.id && !row.withdrawnAt && isCuedForFreeze(row) && !git.has(row.id))
      .map(row => row.id)
  );
}

export function freezeFlagsFromPublished(row, gitIds = []) {
  const git = new Set(gitIds.filter(Boolean));
  const d1Published = Boolean(row && !row.withdrawnAt);
  const cuedForFreeze = isCuedForFreeze(row);
  return {
    d1Published,
    d1Withdrawn: Boolean(row?.withdrawnAt),
    cuedForFreeze,
    freezeAdd: Boolean(
      d1Published && cuedForFreeze && row?.id && !git.has(row.id) && row?.kind !== "meta"
    )
  };
}

// Live D1 vs git registries → the freeze patch. Add/update only include
// ids the author cued for freeze. Withdrawn D1 rows and git-only ids both
// land in remove. Published-but-held ids stay out of the patch (git is
// unchanged). Derived catalogues stay out. Export does not run this yet.
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
