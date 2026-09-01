import assert from "node:assert/strict";
import { planContentFreeze } from "../modules/contentFreezePlan.js";

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
}
