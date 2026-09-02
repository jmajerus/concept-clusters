import assert from "node:assert/strict";
import {
  decorateFreezeAdd,
  emptyContentFreezePlan,
  freezePlanChangeCount,
  freezePlanAutomaticCount,
  freezePlanHasMissingDependencies,
  freezePlanHeldCount,
  freezePlanIsEmpty,
  freezePlanSummary,
  freezeFlagsFromPublished,
  gitIdsFromContentService,
  loadContentFreezePlan,
  parseFreezeConfirm,
  planContentFreeze
} from "../modules/contentFreezePlan.js";

export const name = "content freeze plan: D1 add/update/delete vs git ids";

export async function run() {
  const plan = planContentFreeze({
    publishedPuzzles: [
      { id: "keep-me", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" },
      { id: "brand-new", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" },
      { id: "still-in-review" },
      { id: "held-update" },
      {
        id: "seeded-production",
        cuedForFreezeAt: "2026-08-31T00:00:00.000Z",
        cuedForFreezeBy: "git-seed"
      },
      { id: "gone-from-play", withdrawnAt: "2026-08-31T00:00:00.000Z" }
    ],
    publishedCatalogues: [
      { id: "lab-set", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" },
      { id: "all", withdrawnAt: null }
    ],
    publishedCategories: [{ id: "science", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" }],
    gitPuzzleIds: ["keep-me", "gone-from-play", "retired", "held-update", "seeded-production"],
    gitCatalogueIds: ["lab-set", "all", "old-catalogue"],
    gitCategoryIds: ["science", "film"]
  });
  assert.deepEqual(plan.puzzles.add, ["brand-new"]);
  assert.deepEqual(plan.puzzles.update, ["keep-me"]);
  assert.deepEqual(plan.puzzles.remove, ["gone-from-play", "retired"]);
  assert.ok(!plan.puzzles.add.includes("still-in-review"));
  assert.ok(!plan.puzzles.update.includes("held-update"));
  assert.ok(!plan.puzzles.update.includes("seeded-production"));
  assert.ok(!plan.puzzles.remove.includes("held-update"));
  assert.ok(!plan.puzzles.remove.includes("seeded-production"));
  assert.ok(!plan.held.puzzles.includes("seeded-production"));
  assert.deepEqual(plan.catalogues.add, []);
  assert.deepEqual(plan.catalogues.update, ["lab-set"]);
  assert.deepEqual(plan.catalogues.remove, ["old-catalogue"]);
  assert.ok(!plan.catalogues.remove.includes("all"));
  assert.deepEqual(plan.categories.remove, ["film"]);
  assert.deepEqual(plan.held.puzzles, ["held-update", "still-in-review"]);
  assert.deepEqual(plan.held.catalogues, []);
  assert.deepEqual(plan.held.categories, []);
  assert.equal(freezePlanHeldCount(plan), 2);
  assert.equal(
    freezePlanSummary(plan),
    "8 changes cued; 2 locally published but not cued."
  );

  const decorated = decorateFreezeAdd(
    [
      { id: "brand-new", published: true, cuedForFreeze: true },
      { id: "keep-me", published: true, cuedForFreeze: true },
      { id: "in-review", published: true, cuedForFreeze: false },
      { id: "gone", published: true, withdrawn: true, cuedForFreeze: true },
      { id: "lab-meta", published: true, kind: "meta", cuedForFreeze: true },
      { id: "draft-only", published: false },
      {
        id: "seeded-production",
        published: true,
        cuedForFreeze: true,
        cuedForFreezeBy: "git-seed"
      }
    ],
    ["keep-me"]
  );
  assert.equal(decorated[0].freezeAdd, true);
  assert.equal(decorated[1].freezeAdd, false);
  assert.equal(decorated[2].freezeAdd, false);
  assert.equal(decorated[3].freezeAdd, false);
  assert.equal(decorated[4].freezeAdd, true);
  assert.equal(decorated[5].freezeAdd, false);
  assert.equal(decorated[6].freezeAdd, false);

  const ids = gitIdsFromContentService({
    knownPuzzleIds: new Set(["keep-me"]),
    catalogues: [{ id: "lab-set" }, { id: "all" }],
    categories: { Science: {}, Biology: { slug: "biology" } }
  });
  assert.deepEqual(ids.puzzles, ["keep-me"]);
  assert.deepEqual(ids.catalogues, ["lab-set"]);
  assert.ok(ids.categories.includes("science"));
  assert.ok(ids.categories.includes("biology"));

  assert.equal(parseFreezeConfirm("freeze"), true);
  assert.equal(parseFreezeConfirm("cue-for-freeze"), false);
  assert.equal(freezePlanChangeCount(plan), 8);
  assert.equal(freezePlanIsEmpty(emptyContentFreezePlan()), true);
  assert.equal(freezePlanIsEmpty(plan), false);
  assert.equal(freezePlanSummary(emptyContentFreezePlan()), "No changes cued.");
  assert.equal(
    freezePlanSummary({
      puzzles: { add: ["brand-new"], update: ["keep-me"], remove: ["retired"] },
      catalogues: { add: [], update: [], remove: [] },
      categories: { add: [], update: [], remove: [] },
      held: { puzzles: ["still-in-review", "held-update"], catalogues: [], categories: [] }
    }),
    "3 changes cued; 2 locally published but not cued."
  );
  assert.equal(
    freezePlanSummary({
      puzzles: { add: [], update: [], remove: [] },
      catalogues: { add: [], update: [], remove: [] },
      categories: { add: [], update: [], remove: [] },
      held: { puzzles: ["held-only"], catalogues: [], categories: [] }
    }),
    "No changes cued; 1 locally published but not cued."
  );

  const autoCuePlan = planContentFreeze({
    publishedCatalogues: [
      {
        id: "learning-path",
        cuedForFreezeAt: "2026-09-02T00:00:00.000Z",
        document: {
          kind: "meta",
          entries: [{ id: "science-basics" }],
          relatedCatalogues: { entries: [{ id: "see-also" }] }
        }
      },
      {
        id: "science-basics",
        document: { entries: [{ id: "new-science-puzzle" }] }
      },
      {
        id: "science-followup",
        cuedForFreezeAt: "2026-09-02T00:00:00.000Z",
        document: { entries: [{ id: "new-science-puzzle" }] }
      },
      { id: "see-also", document: { entries: [{ id: "unrelated-puzzle" }] } }
    ],
    publishedPuzzles: [
      { id: "new-science-puzzle", document: { category: "Science" } },
      { id: "unrelated-puzzle", document: { category: "Science" } }
    ],
    publishedCategories: [{ id: "science", document: { title: "Science" } }]
  });
  assert.deepEqual(autoCuePlan.catalogues.add, [
    "learning-path", "science-basics", "science-followup"
  ]);
  assert.deepEqual(autoCuePlan.puzzles.add, ["new-science-puzzle"]);
  assert.deepEqual(autoCuePlan.categories.add, ["science"]);
  assert.deepEqual(autoCuePlan.held.catalogues, ["see-also"]);
  assert.deepEqual(autoCuePlan.held.puzzles, ["unrelated-puzzle"]);
  assert.deepEqual(autoCuePlan.dependencies.automatic, [
    {
      kind: "catalogue",
      id: "science-basics",
      requiredBy: [{ kind: "catalogue", id: "learning-path" }]
    },
    {
      kind: "category",
      id: "science",
      requiredBy: [{ kind: "puzzle", id: "new-science-puzzle" }]
    },
    {
      kind: "puzzle",
      id: "new-science-puzzle",
      requiredBy: [
        { kind: "catalogue", id: "science-basics" },
        { kind: "catalogue", id: "science-followup" }
      ]
    }
  ]);
  assert.equal(freezePlanAutomaticCount(autoCuePlan), 3);
  assert.equal(
    freezePlanSummary(autoCuePlan),
    "5 changes cued (3 automatic); 2 locally published but not cued."
  );

  const missingDependencyPlan = planContentFreeze({
    publishedCatalogues: [{
      id: "needs-a-puzzle",
      cuedForFreezeAt: "2026-09-02T00:00:00.000Z",
      document: { entries: [{ id: "not-published-anywhere" }] }
    }, {
      id: "also-needs-a-puzzle",
      cuedForFreezeAt: "2026-09-02T00:00:00.000Z",
      document: { entries: [{ id: "not-published-anywhere" }] }
    }]
  });
  assert.equal(freezePlanHasMissingDependencies(missingDependencyPlan), true);
  assert.deepEqual(missingDependencyPlan.dependencies.missing, [{
    kind: "puzzle",
    id: "not-published-anywhere",
    requiredBy: [
      { kind: "catalogue", id: "needs-a-puzzle" },
      { kind: "catalogue", id: "also-needs-a-puzzle" }
    ]
  }]);
  assert.equal(
    freezePlanSummary(missingDependencyPlan),
    "2 changes cued; required supporting documents are missing."
  );

  const withdrawnDependencyPlan = planContentFreeze({
    publishedCatalogues: [{
      id: "needs-live-puzzle",
      cuedForFreezeAt: "2026-09-02T00:00:00.000Z",
      document: { entries: [{ id: "withdrawn-puzzle" }] }
    }],
    publishedPuzzles: [{
      id: "withdrawn-puzzle",
      withdrawnAt: "2026-09-02T00:00:00.000Z"
    }],
    gitPuzzleIds: ["withdrawn-puzzle"]
  });
  assert.deepEqual(withdrawnDependencyPlan.puzzles.remove, ["withdrawn-puzzle"]);
  assert.equal(freezePlanHasMissingDependencies(withdrawnDependencyPlan), true);
  assert.deepEqual(withdrawnDependencyPlan.dependencies.missing, [{
    kind: "puzzle",
    id: "withdrawn-puzzle",
    requiredBy: [{ kind: "catalogue", id: "needs-live-puzzle" }]
  }]);

  const loaded = await loadContentFreezePlan({
    contentDocuments: {
      async listPublished({ kind }) {
        if (kind === "puzzle") return [{ id: "brand-new", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" }];
        return [];
      }
    },
    gitIds: { puzzles: [], catalogues: [], categories: [] }
  });
  assert.deepEqual(loaded.puzzles.add, ["brand-new"]);

  const seedFlags = freezeFlagsFromPublished({
    id: "seeded-production",
    cuedForFreezeAt: "2026-08-31T00:00:00.000Z",
    cuedForFreezeBy: "git-seed"
  }, ["seeded-production"]);
  assert.equal(seedFlags.cuedForFreeze, false);
  assert.equal(seedFlags.gitSeedCue, true);
  assert.equal(seedFlags.freezeAdd, false);

  const authorFlags = freezeFlagsFromPublished({
    id: "brand-new",
    cuedForFreezeAt: "2026-08-31T00:00:00.000Z",
    cuedForFreezeBy: "author-1"
  }, []);
  assert.equal(authorFlags.cuedForFreeze, true);
  assert.equal(authorFlags.gitSeedCue, false);
  assert.equal(authorFlags.freezeAdd, true);
}
