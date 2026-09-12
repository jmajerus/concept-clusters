import assert from "node:assert/strict";
import {
  CATEGORY_REFERENCE_SCHEMA_VERSION,
  canonicalizePuzzleCategoryReferences,
  categoryReferenceKnown,
  categoryIdFor,
  categoryTitleFor,
  puzzleBelongsToCategory,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import {
  categoryReferencesAreCanonical,
  planCategoryReferenceMigration
} from "../modules/categoryReferenceMigration.js";
import {
  canonicalRuntimeRegistrySource,
  gitRowsForModuleGeneration
} from "../tools/migrate-category-identifiers.mjs";
import {
  categoryRegistryVersion,
  currentCategoryRegistryVersion
} from "../tools/propagate-category-renames.mjs";
import { normalizeAuthoredPuzzleDocument } from "../modules/simplifiedPuzzleSchema.js";
import {
  documentForEditor,
  documentForDraftStore,
  documentForStorage
} from "../modules/authoredPuzzleDocument.js";
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
  assert.equal(categoryReferenceKnown("Old Subject", categories), true);
  assert.equal(categoryReferenceKnown("unregistered-display-title", categories), false);

  // The apply-time OCC check must receive `kind` from its SQL query; without
  // it categoryRegistryVersion() filters every latest row out and every
  // migration falsely reports that the registry changed.
  const categoryRows = [{
    kind: "category",
    id: "subject",
    revision: 7,
    document: JSON.stringify({ id: "subject", title: "Current Subject" }),
    withdrawn_at: null
  }];
  const fakeDatabase = {
    prepare(sql) {
      assert.match(sql, /SELECT kind, id, revision, document, withdrawn_at/);
      return {
        bind(...params) {
          assert.deepEqual(params, ["category"]);
          return { all: async () => ({ results: categoryRows }) };
        }
      };
    }
  };
  assert.deepEqual(
    await currentCategoryRegistryVersion(fakeDatabase),
    categoryRegistryVersion(categoryRows)
  );

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

  // Editor projections must not hide malformed values before the schema sees
  // them, while the storage boundary still canonicalizes valid references.
  const malformed = {
    id: "malformed",
    category: "",
    categories: ["Art", 42, ""],
    subcategories: { "": "bad", Art: "visual-form" }
  };
  assert.deepEqual(
    documentForEditor(malformed, { categoryRegistry: categories }),
    malformed
  );
  assert.deepEqual(
    documentForStorage(malformed, { categoryRegistry: categories }),
    {
      id: "malformed",
      category: "",
      categories: ["art", 42, ""],
      subcategories: { "": "bad", art: "visual-form" }
    }
  );

  // If both a retired title key and its canonical id survive a partial
  // migration, the canonical assignment is authoritative regardless of key
  // insertion order.
  assert.equal(
    subcategoryIdForPuzzle({
      category: "Current Subject",
      subcategories: { "Current Subject": "legacy", subject: "canonical" }
    }, "Current Subject", categories),
    "canonical"
  );

  const plan = planCategoryReferenceMigration({
    registry: categories,
    rows: [{ source: "git", table: "git", kind: "puzzle", id: "example", document: stale }]
  });
  assert.equal(plan.unresolved.length, 0);
  assert.deepEqual(plan.changes[0].after, canonical);

  const unknownTitlePlan = planCategoryReferenceMigration({
    registry: categories,
    rows: [{
      source: "git",
      table: "git",
      kind: "puzzle",
      id: "unknown",
      document: { id: "unknown", category: "D1 Only Subject" }
    }]
  });
  assert.equal(unknownTitlePlan.changes.length, 0);
  assert.equal(unknownTitlePlan.unresolved.length, 1);
  assert.match(unknownTitlePlan.unresolved[0].reason, /refusing slug fallback/);
  const unknownIdPlan = planCategoryReferenceMigration({
    registry: categories,
    rows: [{
      source: "git",
      table: "git",
      kind: "puzzle",
      id: "unknown-id",
      document: { id: "unknown-id", category: "d1-only-subject" }
    }]
  });
  assert.equal(unknownIdPlan.unresolved.length, 0);
  assert.equal(unknownIdPlan.changes.length, 0);

  const runtime = canonicalRuntimeRegistrySource(
    'export const overlay = { categories: ["Old Subject", "Current Subject"] };',
    categories
  );
  assert.equal(runtime.changed, true);
  assert.match(runtime.source, /\["subject", "subject"\]/);

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

  // A prior apply may have canonicalized source JSON before failing while a
  // generated module was validated. The next apply must include every Git
  // row, while still preferring a changed row's `after` document.
  const moduleRows = gitRowsForModuleGeneration(
    [
      { table: "git", id: "unchanged", document: { id: "unchanged" } },
      { table: "git", id: "changed", document: { id: "changed", category: "old" } }
    ],
    [{ table: "git", id: "changed", after: { id: "changed", category: "new" } }]
  );
  assert.equal(moduleRows.length, 2);
  assert.equal(moduleRows.find(row => row.id === "changed").after.category, "new");
}
