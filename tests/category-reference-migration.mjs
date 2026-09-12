import assert from "node:assert/strict";
import {
  CATEGORY_REFERENCE_SCHEMA_VERSION,
  canonicalizePuzzleCategoryReferences,
  categoryIdFor,
  categoryTitleFor,
  puzzleBelongsToCategory,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import {
  categoryReferencesAreCanonical,
  planCategoryReferenceMigration
} from "../modules/categoryReferenceMigration.js";
import { normalizeAuthoredPuzzleDocument } from "../modules/simplifiedPuzzleSchema.js";
import { documentForEditor, documentForDraftStore } from "../modules/authoredPuzzleDocument.js";
import { SIMPLIFIED_PUZZLE_SCHEMA } from "../modules/authoringSchemaResource.js";

export const name = "category references: ids are canonical and title reads stay compatible";

function registry() {
  return {
    "Current Subject": {
      slug: "subject",
      previousTitles: ["Old Subject"],
      subcategories: { basics: { title: "Basics" } }
    },
    Art: {
      slug: "art",
      subcategories: { "visual-form": { title: "Visual Form" } }
    }
  };
}

export async function run() {
  const categories = registry();
  assert.equal(CATEGORY_REFERENCE_SCHEMA_VERSION, 2);
  assert.equal(
    SIMPLIFIED_PUZZLE_SCHEMA.properties.category.pattern,
    "^[a-z0-9]+(?:-[a-z0-9]+)*$"
  );
  assert.match(
    SIMPLIFIED_PUZZLE_SCHEMA.properties.category.description,
    /stable category id/i
  );
  assert.equal(categoryIdFor("Current Subject", categories), "subject");
  assert.equal(categoryIdFor("Old Subject", categories), "subject");
  assert.equal(categoryTitleFor("subject", categories), "Current Subject");

  const stale = {
    id: "example",
    category: "Old Subject",
    categories: ["Old Subject", "Art"],
    subcategories: { "Old Subject": "basics", art: "visual-form" }
  };
  const canonical = canonicalizePuzzleCategoryReferences(stale, categories);
  assert.deepEqual(canonical, {
    id: "example",
    category: "subject",
    categories: ["subject", "art"],
    subcategories: { subject: "basics", art: "visual-form" }
  });
  assert.equal(categoryReferencesAreCanonical(canonical, categories), true);
  assert.equal(categoryReferencesAreCanonical(stale, categories), false);
  assert.equal(puzzleBelongsToCategory(canonical, "Current Subject", categories), true);
  assert.equal(subcategoryIdForPuzzle(canonical, "Current Subject", categories), "basics");
  assert.equal(documentForEditor(canonical, { categoryRegistry: categories }).category, "Current Subject");
  assert.equal(
    documentForDraftStore(canonical, null, { categoryRegistry: categories }).document.category,
    "subject"
  );

  const plan = planCategoryReferenceMigration({
    registry: categories,
    rows: [{ source: "git", table: "git", kind: "puzzle", id: "example", document: stale }]
  });
  assert.equal(plan.unresolved.length, 0);
  assert.deepEqual(plan.changes[0].after, canonical);

  const normalized = normalizeAuthoredPuzzleDocument({
    id: "example",
    title: "Example",
    category: "Art",
    clusters: [
      { name: "One", fact: "f", seeds: ["a", "b"], floatingTerms: ["x"] },
      { name: "Two", fact: "f", seeds: ["c", "d"], floatingTerms: ["y"] }
    ],
    bridges: []
  });
  assert.deepEqual(normalized.errors, []);
  assert.equal(normalized.document.category, "art");
}
