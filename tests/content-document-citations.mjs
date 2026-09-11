import assert from "node:assert/strict";
import {
  assertCategoryUnused,
  assertSubcategoryUnused,
  puzzlesCitingCategory
} from "../modules/contentDocumentCitations.js";

export const name = "content document citations: live puzzles block taxonomy delete";

export async function run() {
  const puzzles = [
    { id: "cell-division-and-inheritance", category: "Biology", subcategories: { Biology: "foundations" } },
    { id: "why-atoms-bond", category: "Chemistry" }
  ];
  assert.deepEqual(
    puzzlesCitingCategory(puzzles, { id: "biology", title: "Biology" }).map(item => item.id),
    ["cell-division-and-inheritance"]
  );
  assertCategoryUnused(puzzles, { id: "film", title: "Film" });
  assert.throws(
    () => assertCategoryUnused(puzzles, { id: "biology", title: "Biology" }),
    error => /still cite/.test(error.message) && error.status === 400
  );
  assert.throws(
    () => assertSubcategoryUnused(puzzles, "Biology", "foundations"),
    error => /still cite/.test(error.message)
  );
  assertSubcategoryUnused(puzzles, "Biology", "genomics");
}
