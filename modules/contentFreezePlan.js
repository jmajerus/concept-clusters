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
    held: { puzzles: [], catalogues: [], categories: [] },
    dependencies: { automatic: [], missing: [] }
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

export function freezePlanAutomaticCount(plan = emptyContentFreezePlan()) {
  return plan?.dependencies?.automatic?.length || 0;
}

export function freezePlanHasMissingDependencies(plan = emptyContentFreezePlan()) {
  return (plan?.dependencies?.missing?.length || 0) > 0;
}

export function freezePlanSummary(plan = emptyContentFreezePlan()) {
  const cued = freezePlanChangeCount(plan);
  const held = freezePlanHeldCount(plan);
  const automatic = freezePlanAutomaticCount(plan);
  const missing = freezePlanHasMissingDependencies(plan);
  const cuedText = cued
    ? `${cued} change${cued === 1 ? "" : "s"} cued${
      automatic ? ` (${automatic} automatic)` : ""
    }`
    : "No changes cued";
  const suffixes = [];
  if (held) suffixes.push(`${held} locally published but not cued`);
  if (missing) suffixes.push("required supporting documents are missing");
  return suffixes.length ? `${cuedText}; ${suffixes.join("; ")}.` : `${cuedText}.`;
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

function planKind(publishedRows = [], gitIds = [], automaticIds = []) {
  const git = new Set(gitIds.filter(Boolean));
  const liveIds = new Set(
    idsOf(publishedRows.filter(row => !row?.withdrawnAt))
  );
  const cuedIds = new Set(
    idsOf(publishedRows.filter(row => !row?.withdrawnAt && isPendingFreezeCue(row)))
  );
  for (const id of automaticIds) cuedIds.add(id);
  const add = [...cuedIds].filter(id => !git.has(id)).sort();
  const update = [...cuedIds].filter(id => git.has(id)).sort();
  const remove = [...git].filter(id => !liveIds.has(id)).sort();
  return { add, update, remove };
}

function heldIds(publishedRows = [], automaticIds = []) {
  const automatic = new Set(automaticIds);
  return idsOf(
    publishedRows.filter(row =>
      !row?.withdrawnAt && !isCuedForFreeze(row) && !automatic.has(row.id)
    )
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

function activeRowsById(rows = []) {
  return new Map(
    rows.filter(row => row?.id && !row.withdrawnAt).map(row => [row.id, row])
  );
}

function pendingCueIds(rows = []) {
  return new Set(
    idsOf(rows.filter(row => !row?.withdrawnAt && isPendingFreezeCue(row)))
  );
}

function documentEntryIds(document) {
  return Array.isArray(document?.entries)
    ? document.entries.map(entry => entry?.id).filter(Boolean)
    : [];
}

// Resolve only forward, production-blocking references. A meta catalogue's
// relatedCatalogues are navigation suggestions, not nested content, so they
// deliberately stay out of this closure.
function resolveFreezeDependencies({
  publishedPuzzles,
  publishedCatalogues,
  publishedCategories,
  gitPuzzleIds,
  gitCatalogueIds,
  gitCategoryIds
}) {
  const rows = {
    puzzle: activeRowsById(publishedPuzzles),
    catalogue: activeRowsById(withoutReserved(publishedCatalogues)),
    category: activeRowsById(publishedCategories)
  };
  const git = {
    puzzle: new Set(gitPuzzleIds.filter(Boolean)),
    catalogue: new Set(withoutReserved(gitCatalogueIds)),
    category: new Set(gitCategoryIds.filter(Boolean))
  };
  const roots = {
    puzzle: pendingCueIds(publishedPuzzles),
    catalogue: pendingCueIds(withoutReserved(publishedCatalogues)),
    category: pendingCueIds(publishedCategories)
  };
  const automatic = new Map();
  const missing = new Map();
  const visited = new Set();

  function key(kind, id) {
    return `${kind}:${id}`;
  }

  function recordMissing(kind, id, requiredBy) {
    const dependencyKey = key(kind, id);
    if (!missing.has(dependencyKey)) {
      missing.set(dependencyKey, { kind, id, requiredBy });
    }
  }

  function resolve(kind, id) {
    const dependencyKey = key(kind, id);
    if (visited.has(dependencyKey)) return;
    visited.add(dependencyKey);
    const row = rows[kind].get(id);
    if (!row) return;
    if (kind === "catalogue") {
      const childKind = row.document?.kind === "meta" ? "catalogue" : "puzzle";
      for (const childId of documentEntryIds(row.document)) {
        requireSupporting(childKind, childId, { kind, id });
      }
    } else if (kind === "puzzle") {
      const category = typeof row.document?.category === "string"
        ? slugify(row.document.category)
        : "";
      if (category) requireSupporting("category", category, { kind, id });
    }
  }

  function requireSupporting(kind, id, requiredBy) {
    if (!id) return;
    if (roots[kind].has(id)) {
      resolve(kind, id);
      return;
    }
    // A git-only or withdrawn D1 id is slated for this plan's remove list,
    // so it cannot satisfy a dependency of a snapshot being frozen now.
    if (git[kind].has(id) && rows[kind].has(id)) return;
    if (!rows[kind].has(id)) {
      recordMissing(kind, id, requiredBy);
      return;
    }
    const dependencyKey = key(kind, id);
    if (!automatic.has(dependencyKey)) {
      automatic.set(dependencyKey, { kind, id, requiredBy });
    }
    resolve(kind, id);
  }

  for (const kind of ["puzzle", "catalogue", "category"]) {
    for (const id of roots[kind]) resolve(kind, id);
  }

  return {
    automatic: [...automatic.values()].sort((left, right) =>
      left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id)
    ),
    missing: [...missing.values()].sort((left, right) =>
      left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id)
    )
  };
}

function automaticIdsFor(dependencies, kind) {
  return dependencies.automatic
    .filter(dependency => dependency.kind === kind)
    .map(dependency => dependency.id);
}

// Live D1 vs git registries → the freeze patch. Author cues are the roots;
// missing forward dependencies are automatically included where D1 has a
// published snapshot not yet in git. Withdrawn D1 rows and git-only ids both
// land in remove. Derived catalogues stay out. Admin Freeze on the LAN server
// applies this patch to the checkout.
export function planContentFreeze({
  publishedPuzzles = [],
  publishedCatalogues = [],
  publishedCategories = [],
  gitPuzzleIds = [],
  gitCatalogueIds = [],
  gitCategoryIds = []
} = {}) {
  const dependencies = resolveFreezeDependencies({
    publishedPuzzles,
    publishedCatalogues,
    publishedCategories,
    gitPuzzleIds,
    gitCatalogueIds,
    gitCategoryIds
  });
  const automaticPuzzles = automaticIdsFor(dependencies, "puzzle");
  const automaticCatalogues = automaticIdsFor(dependencies, "catalogue");
  const automaticCategories = automaticIdsFor(dependencies, "category");
  return {
    puzzles: planKind(publishedPuzzles, gitPuzzleIds, automaticPuzzles),
    catalogues: planKind(
      withoutReserved(publishedCatalogues),
      withoutReserved(gitCatalogueIds),
      automaticCatalogues
    ),
    categories: planKind(publishedCategories, gitCategoryIds, automaticCategories),
    held: {
      puzzles: heldIds(publishedPuzzles, automaticPuzzles),
      catalogues: heldIds(withoutReserved(publishedCatalogues), automaticCatalogues),
      categories: heldIds(publishedCategories, automaticCategories)
    },
    dependencies
  };
}
