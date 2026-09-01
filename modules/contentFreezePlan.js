import { slugify } from "../puzzles/categories.js";
import { isReservedCatalogueId } from "./contentDocumentSeed.js";

export const CUE_FOR_FREEZE_CONFIRM = "cue-for-freeze";
export const HOLD_FROM_FREEZE_CONFIRM = "hold-from-freeze";
export const FREEZE_CONFIRM = "freeze";
// Previous labels from the same unreleased control.
const LEGACY_CUE_CONFIRM = "ready-for-freeze";
const LEGACY_HOLD_CONFIRM = "clear-freeze-ready";

export const GIT_SEED_ACTOR = "git-seed";

export function isCuedForFreeze(row) {
  if (row?.withdrawnAt || row?.withdrawn) return false;
  return Boolean(
    row?.cuedForFreezeAt
    || row?.cuedForFreeze
    || row?.readyForFreezeAt
    || row?.readyForFreeze
  );
}

function freezeCueActor(row) {
  return row?.cuedForFreezeBy || row?.cued_for_freeze_by || null;
}

export function isGitSeedFreezeCue(row) {
  return freezeCueActor(row) === GIT_SEED_ACTOR;
}

// Git-seed marks already-production rows as cued so they are not "held".
// Freeze only ships an author Cue (or a Cue that replaced the seed actor).
export function isPendingFreezeCue(row) {
  return isCuedForFreeze(row) && !isGitSeedFreezeCue(row);
}

export function parseFreezeCueConfirm(confirm) {
  if (confirm === CUE_FOR_FREEZE_CONFIRM || confirm === LEGACY_CUE_CONFIRM) return true;
  if (confirm === HOLD_FROM_FREEZE_CONFIRM || confirm === LEGACY_HOLD_CONFIRM) return false;
  return null;
}

export function parseFreezeConfirm(confirm) {
  return confirm === FREEZE_CONFIRM;
}

export function emptyContentFreezePlan() {
  return {
    puzzles: { add: [], update: [], remove: [] },
    catalogues: { add: [], update: [], remove: [] },
    categories: { add: [], update: [], remove: [] },
    held: { puzzles: [], catalogues: [], categories: [] }
  };
}

export function freezePlanKindCount(kind = {}) {
  return (kind.add?.length || 0) + (kind.update?.length || 0) + (kind.remove?.length || 0);
}

export function freezePlanChangeCount(plan = emptyContentFreezePlan()) {
  return freezePlanKindCount(plan.puzzles)
    + freezePlanKindCount(plan.catalogues)
    + freezePlanKindCount(plan.categories);
}

export function freezePlanIsEmpty(plan) {
  return freezePlanChangeCount(plan) === 0;
}

export function freezePlanHeldCount(plan = emptyContentFreezePlan()) {
  const held = plan.held || {};
  return (held.puzzles?.length || 0)
    + (held.catalogues?.length || 0)
    + (held.categories?.length || 0);
}

export function freezePlanSummary(plan = emptyContentFreezePlan()) {
  const cued = freezePlanChangeCount(plan);
  const held = freezePlanHeldCount(plan);
  const cuedText = cued
    ? `${cued} change${cued === 1 ? "" : "s"} cued`
    : "No changes cued";
  if (!held) return `${cuedText}.`;
  return `${cuedText}; ${held} locally published but not cued.`;
}

export async function loadContentFreezePlan({
  contentDocuments,
  gitIds = { puzzles: [], catalogues: [], categories: [] }
} = {}) {
  if (!contentDocuments) return emptyContentFreezePlan();
  const [publishedPuzzles, publishedCatalogues, publishedCategories] = await Promise.all([
    contentDocuments.listPublished({ kind: "puzzle", includeWithdrawn: true }),
    contentDocuments.listPublished({ kind: "catalogue", includeWithdrawn: true }),
    contentDocuments.listPublished({ kind: "category", includeWithdrawn: true })
  ]);
  return planContentFreeze({
    publishedPuzzles,
    publishedCatalogues,
    publishedCategories,
    gitPuzzleIds: gitIds.puzzles || [],
    gitCatalogueIds: gitIds.catalogues || [],
    gitCategoryIds: gitIds.categories || []
  });
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
    idsOf(publishedRows.filter(row => !row?.withdrawnAt && isPendingFreezeCue(row)))
  );
  const add = [...cuedIds].filter(id => !git.has(id)).sort();
  const update = [...cuedIds].filter(id => git.has(id)).sort();
  const remove = [...git].filter(id => !liveIds.has(id)).sort();
  return { add, update, remove };
}

function heldIds(publishedRows = []) {
  return idsOf(
    publishedRows.filter(row => !row?.withdrawnAt && !isCuedForFreeze(row))
  ).sort();
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
export function decorateFreezeAdd(rows = [], gitIds = []) {
  const git = new Set(gitIds.filter(Boolean));
  return rows.map(row => ({
    ...row,
    freezeAdd: Boolean(
      row?.published
      && !row?.withdrawn
      && row?.id
      && !git.has(row.id)
      && isPendingFreezeCue(row)
    )
  }));
}

export async function publishedFreezeAddIds(contentDocuments, kind, gitIds = []) {
  if (!contentDocuments) return new Set();
  const git = new Set(gitIds.filter(Boolean));
  const rows = await contentDocuments.listPublished({ kind });
  return new Set(
    rows
      .filter(row => row?.id && !row.withdrawnAt && isPendingFreezeCue(row) && !git.has(row.id))
      .map(row => row.id)
  );
}

export function freezeFlagsFromPublished(row, gitIds = []) {
  const git = new Set(gitIds.filter(Boolean));
  const d1Published = Boolean(row && !row.withdrawnAt);
  const gitSeedCue = isGitSeedFreezeCue(row);
  const cuedForFreeze = isPendingFreezeCue(row);
  return {
    d1Published,
    d1Withdrawn: Boolean(row?.withdrawnAt),
    cuedForFreeze,
    gitSeedCue,
    freezeAdd: Boolean(
      d1Published && cuedForFreeze && row?.id && !git.has(row.id)
    )
  };
}

// Live D1 vs git registries → the freeze patch. Add/update only include
// ids the author cued for freeze. Withdrawn D1 rows and git-only ids both
// land in remove. Published-but-held ids stay out of the patch (git is
// unchanged). Derived catalogues stay out. Admin Freeze on the LAN server
// applies this patch to the checkout.
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
    categories: planKind(publishedCategories, gitCategoryIds),
    held: {
      puzzles: heldIds(publishedPuzzles),
      catalogues: heldIds(withoutReserved(publishedCatalogues)),
      categories: heldIds(publishedCategories)
    }
  };
}
