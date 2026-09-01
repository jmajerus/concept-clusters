import assert from "node:assert/strict";
import { decorateFreezeAdd, gitIdsFromContentService, planContentFreeze } from "../modules/contentFreezePlan.js";

export const name = "content freeze plan: D1 add/update/delete vs git ids";

export async function run() {
  const plan = planContentFreeze({
    publishedPuzzles: [
      { id: "keep-me", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" },
      { id: "brand-new", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" },
      { id: "still-in-review" },
      { id: "held-update" },
      { id: "gone-from-play", withdrawnAt: "2026-08-31T00:00:00.000Z" }
    ],
    publishedCatalogues: [
      { id: "lab-set", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" },
      { id: "all", withdrawnAt: null }
    ],
    publishedCategories: [{ id: "science", cuedForFreezeAt: "2026-08-31T00:00:00.000Z" }],
    gitPuzzleIds: ["keep-me", "gone-from-play", "retired", "held-update"],
    gitCatalogueIds: ["lab-set", "all", "old-catalogue"],
    gitCategoryIds: ["science", "film"]
  });
  assert.deepEqual(plan.puzzles.add, ["brand-new"]);
  assert.deepEqual(plan.puzzles.update, ["keep-me"]);
  assert.deepEqual(plan.puzzles.remove, ["gone-from-play", "retired"]);
  assert.ok(!plan.puzzles.add.includes("still-in-review"));
  assert.ok(!plan.puzzles.update.includes("held-update"));
  assert.ok(!plan.puzzles.remove.includes("held-update"));
  assert.deepEqual(plan.catalogues.add, []);
  assert.deepEqual(plan.catalogues.update, ["lab-set"]);
  assert.deepEqual(plan.catalogues.remove, ["old-catalogue"]);
  assert.ok(!plan.catalogues.remove.includes("all"));
  assert.deepEqual(plan.categories.remove, ["film"]);

  const decorated = decorateFreezeAdd(
    [
      { id: "brand-new", published: true, cuedForFreeze: true },
      { id: "keep-me", published: true, cuedForFreeze: true },
      { id: "in-review", published: true, cuedForFreeze: false },
      { id: "gone", published: true, withdrawn: true, cuedForFreeze: true },
      { id: "lab-meta", published: true, kind: "meta", cuedForFreeze: true },
      { id: "draft-only", published: false }
    ],
    ["keep-me"]
  );
  assert.equal(decorated[0].freezeAdd, true);
  assert.equal(decorated[1].freezeAdd, false);
  assert.equal(decorated[2].freezeAdd, false);
  assert.equal(decorated[3].freezeAdd, false);
  assert.equal(decorated[4].freezeAdd, false);
  assert.equal(decorated[5].freezeAdd, false);

  const ids = gitIdsFromContentService({
    knownPuzzleIds: new Set(["keep-me"]),
    catalogues: [{ id: "lab-set" }, { id: "all" }],
    categories: { Science: {}, Biology: { slug: "biology" } }
  });
  assert.deepEqual(ids.puzzles, ["keep-me"]);
  assert.deepEqual(ids.catalogues, ["lab-set"]);
  assert.ok(ids.categories.includes("science"));
  assert.ok(ids.categories.includes("biology"));
}
