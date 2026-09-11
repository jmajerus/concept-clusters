import assert from "node:assert/strict";
import {
  SAVE_TO_CANONICALIZE_FLAG_ID,
  canonicalizePuzzleCategoryTitles,
  categoryTitleAliases,
  categoryTitleAliasConflicts,
  documentForEditor,
  documentForDraftStore,
  withStorageCanonicalizeFlags
} from "../modules/authoredPuzzleDocument.js";
import { validateCategoryDocument } from "../modules/categoryValidation.js";
import {
  categoryRegistryEntryFromDocument,
  existingCategoryRecords,
  mergeCategoryRegistry
} from "../modules/authoringMcpTaxonomy.js";
import { categoryDocumentFromRegistry } from "../modules/contentDocumentSeed.js";
import {
  registerCategorySource,
  replaceCategorySource
} from "../modules/publicationArtifacts.js";

export const name = "category rename: previousTitles fold stale puzzle citations forward";

export async function run() {
  // update_category appends the old title; history the client omits is kept.
  const renamed = validateCategoryDocument(
    { id: "geography", title: "Physical Geography" },
    { existing: [{ id: "geography", title: "Geography" }], mode: "update" }
  );
  assert.equal(renamed.valid, true, renamed.errors.join("; "));
  assert.deepEqual(renamed.document.previousTitles, ["Geography"]);
  const unchanged = validateCategoryDocument(
    { id: "geography", title: "Physical Geography" },
    { existing: [{ id: "geography", title: "Physical Geography", previousTitles: ["Geography"] }], mode: "update" }
  );
  assert.deepEqual(unchanged.document.previousTitles, ["Geography"]);
  const back = validateCategoryDocument(
    { id: "geography", title: "Geography" },
    { existing: [{ id: "geography", title: "Physical Geography", previousTitles: ["Geography"] }], mode: "update" }
  );
  assert.deepEqual(back.document.previousTitles, ["Physical Geography"]);
  assert.equal(
    validateCategoryDocument({ id: "x", title: "X", previousTitles: [""] }).valid,
    false
  );

  // The ledger survives document <-> registry <-> git round-trips.
  const document = renamed.document;
  const entry = categoryRegistryEntryFromDocument(document);
  assert.deepEqual(entry.previousTitles, ["Geography"]);
  const registry = mergeCategoryRegistry({ History: { slug: "history" } }, [{ document }]);
  assert.deepEqual(registry["Physical Geography"].previousTitles, ["Geography"]);
  assert.deepEqual(
    categoryDocumentFromRegistry("Physical Geography", registry["Physical Geography"]).previousTitles,
    ["Geography"]
  );
  assert.deepEqual(
    existingCategoryRecords(registry).find(item => item.id === "geography").previousTitles,
    ["Geography"]
  );

  // A D1 rename replaces the stale same-slug Git key rather than exposing
  // both titles in the merged taxonomy.
  const replaced = mergeCategoryRegistry(
    { Geography: { slug: "geography" }, History: { slug: "history" } },
    [{ document }]
  );
  assert.equal(replaced.Geography, undefined);
  assert.equal(replaced["Physical Geography"].slug, "geography");

  // Aliases never shadow a live title.
  const aliases = categoryTitleAliases({
    "Physical Geography": { previousTitles: ["Geography", "History"] },
    History: {}
  });
  assert.deepEqual([...aliases.entries()], [["Geography", "Physical Geography"]]);

  const conflicts = categoryTitleAliasConflicts({
    One: { previousTitles: ["Old"] },
    Two: { previousTitles: ["Old"] }
  });
  assert.deepEqual([...conflicts.entries()].map(([name, targets]) => [name, [...targets]]), [
    ["Old", ["One", "Two"]]
  ]);

  // Stale citations fold forward on read; untouched documents are returned as-is.
  const stale = {
    id: "river-basins",
    category: "Geography",
    categories: ["Geography", "History"],
    subcategories: { Geography: "landforms" }
  };
  const folded = canonicalizePuzzleCategoryTitles(stale, registry);
  assert.deepEqual(folded, {
    id: "river-basins",
    category: "Physical Geography",
    categories: ["Physical Geography", "History"],
    subcategories: { "Physical Geography": "landforms" }
  });
  assert.deepEqual(stale.categories, ["Geography", "History"], "input is not mutated");
  const fresh = { id: "x", category: "History" };
  assert.equal(canonicalizePuzzleCategoryTitles(fresh, registry), fresh);
  assert.equal(documentForEditor(stale).category, "Geography", "no registry, no fold");
  assert.equal(documentForEditor(stale, { categoryRegistry: registry }).category, "Physical Geography");
  assert.equal(
    documentForDraftStore(stale, null, { categoryRegistry: registry }).document.category,
    "Physical Geography"
  );

  // Both old and new cited: dedupe, keep the current title's subcategory.
  const both = canonicalizePuzzleCategoryTitles({
    category: "Physical Geography",
    categories: ["Physical Geography", "Geography"],
    subcategories: { "Physical Geography": "climate", Geography: "landforms" }
  }, registry);
  assert.deepEqual(both.categories, ["Physical Geography"]);
  assert.deepEqual(both.subcategories, { "Physical Geography": "climate" });

  // Duplicate current category strings need canonical cleanup, but this is
  // not a retired-title citation and must not raise a rename flag.
  const alreadyFolded = {
    category: "Physical Geography",
    categories: ["Physical Geography", "Physical Geography"]
  };
  assert.notEqual(canonicalizePuzzleCategoryTitles(alreadyFolded, registry), alreadyFolded);
  assert.deepEqual(withStorageCanonicalizeFlags(alreadyFolded, { flags: [] }, {
    categoryRegistry: registry
  }).flags, []);

  // Same save-to-canonicalize flag family; storage is not rewritten.
  const { flags } = withStorageCanonicalizeFlags(stale, { flags: [] }, { categoryRegistry: registry });
  assert.equal(flags.length, 1);
  assert.equal(flags[0].id, SAVE_TO_CANONICALIZE_FLAG_ID);
  assert.match(flags[0].message, /retired title/);
  assert.deepEqual(withStorageCanonicalizeFlags(fresh, { flags: [] }, { categoryRegistry: registry }).flags, []);

  // Freeze replaces the git entry still keyed by the retired title.
  let source = "export const CATEGORIES = {\n};\n";
  source = registerCategorySource(source, { name: "Geography", metadata: { slug: "geography" } });
  source = replaceCategorySource(source, {
    name: "Physical Geography",
    previousNames: ["Geography"],
    metadata: { slug: "geography", previousTitles: ["Geography"] }
  });
  assert.doesNotMatch(source, /\n  Geography: /);
  assert.match(source, /"Physical Geography": \{/);
  assert.match(source, /previousTitles: \[\n\s+"Geography"\n\s+\]/);
}
