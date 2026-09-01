import assert from "node:assert/strict";
import { decorateFreezeAdd, gitIdsFromContentService, planContentFreeze } from "../modules/contentFreezePlan.js";

export const name = "content freeze plan: D1 add/update/delete vs git ids";

export async function run() {
  const plan = planContentFreeze({
    publishedPuzzles: [
      { id: "keep-me" },
      { id: "brand-new" },
      { id: "gone-from-play", withdrawnAt: "2026-08-31T00:00:00.000Z" }
    ],
    publishedCatalogues: [
      { id: "lab-set" },
      { id: "all", withdrawnAt: null }
    ],
    publishedCategories: [{ id: "science" }],
    gitPuzzleIds: ["keep-me", "gone-from-play", "retired"],
    gitCatalogueIds: ["lab-set", "all", "old-catalogue"],
    gitCategoryIds: ["science", "film"]
  });
  assert.deepEqual(plan.puzzles.add, ["brand-new"]);
  assert.deepEqual(plan.puzzles.update, ["keep-me"]);
  assert.deepEqual(plan.puzzles.remove, ["gone-from-play", "retired"]);
  assert.deepEqual(plan.catalogues.add, []);
  assert.deepEqual(plan.catalogues.update, ["lab-set"]);
  assert.deepEqual(plan.catalogues.remove, ["old-catalogue"]);
  assert.ok(!plan.catalogues.remove.includes("all"));
  assert.deepEqual(plan.categories.remove, ["film"]);

  const decorated = decorateFreezeAdd(
    [
      { id: "brand-new", published: true },
      { id: "keep-me", published: true },
      { id: "gone", published: true, withdrawn: true },
      { id: "lab-meta", published: true, kind: "meta" },
      { id: "draft-only", published: false }
    ],
    ["keep-me"]
  );
  assert.equal(decorated[0].freezeAdd, true);
  assert.equal(decorated[1].freezeAdd, false);
  assert.equal(decorated[2].freezeAdd, false);
  assert.equal(decorated[3].freezeAdd, false);
  assert.equal(decorated[4].freezeAdd, false);

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
