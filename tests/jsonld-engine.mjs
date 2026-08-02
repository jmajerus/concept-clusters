import assert from "node:assert/strict";
import { CATALOGUES } from "../catalogues/index.js";
import {
  catalogueBundleToJsonLd,
  catalogueFromJsonLd,
  catalogueToJsonLd
} from "../modules/catalogueJsonLd.js";
import {
  CONCEPT_CLUSTERS_CONTEXT,
  validateJsonLdProfile
} from "../modules/jsonLdProfile.js";
import { validateCatalogueContent, validatePuzzleContent } from "../modules/contentValidation.js";
import { puzzleFromJsonLd, puzzleToJsonLd } from "../modules/puzzleJsonLd.js";
import { CATEGORIES } from "../puzzles/categories.js";
import { PUZZLES } from "../puzzles/index.js";

export const name = "JSON-LD: puzzle and catalogue profile round trips";

function runtimeShape(puzzle) {
  const copy = JSON.parse(JSON.stringify(puzzle));
  copy.clusters.forEach(cluster => delete cluster.id);
  copy.bridges.forEach(bridge => delete bridge.id);
  return copy;
}

export async function run() {
  const ids = new Set(PUZZLES.map(puzzle => puzzle.id));
  for (const puzzle of PUZZLES) {
    assert.deepEqual(validatePuzzleContent(puzzle, { knownPuzzleIds: ids }), [], puzzle.id);
    const document = puzzleToJsonLd(puzzle);
    assert.equal(document["@context"], CONCEPT_CLUSTERS_CONTEXT);
    assert.deepEqual(validateJsonLdProfile(document), [], puzzle.id);
    assert.deepEqual(runtimeShape(puzzleFromJsonLd(document)), runtimeShape(puzzle), puzzle.id);
  }

  const directed = PUZZLES.find(puzzle =>
    puzzle.bridges.some(bridge => bridge.direction?.kind === "through")
  );
  const reorderedDocument = puzzleToJsonLd(directed);
  const originalFirstName = reorderedDocument.clusters[0].name;
  reorderedDocument.clusters.reverse();
  reorderedDocument.bridges.forEach(bridge => bridge.idealTerms?.reverse());
  const reordered = puzzleFromJsonLd(reorderedDocument);
  const directedBridge = reordered.bridges.find(bridge => bridge.direction?.kind === "through");
  assert.notEqual(reordered.clusters[0].name, originalFirstName);
  assert.equal(
    reordered.clusters[directedBridge.direction.from].id,
    reorderedDocument.bridges.find(bridge => bridge.id === directedBridge.id)
      .direction.from["@id"].slice(1),
    "direction changed meaning when cluster order changed"
  );
  assert.deepEqual(validatePuzzleContent(reordered, { knownPuzzleIds: ids }), []);

  const extensionDocument = puzzleToJsonLd(PUZZLES[0]);
  extensionDocument["example:pedagogy"] = { level: "introductory" };
  extensionDocument.clusters[0]["example:reviewed"] = true;
  extensionDocument.creator = { name: "Example Author" };
  extensionDocument.license = "https://creativecommons.org/licenses/by/4.0/";
  assert.deepEqual(
    puzzleToJsonLd(puzzleFromJsonLd(extensionDocument))["example:pedagogy"],
    { level: "introductory" }
  );
  const extensionRoundTrip = puzzleToJsonLd(puzzleFromJsonLd(extensionDocument));
  assert.equal(extensionRoundTrip.clusters[0]["example:reviewed"], true);
  assert.deepEqual(extensionRoundTrip.creator, { name: "Example Author" });
  assert.equal(extensionRoundTrip.license, "https://creativecommons.org/licenses/by/4.0/");
  const unsafeContext = { ...extensionDocument, "@context": "https://example.org/context" };
  assert.ok(validateJsonLdProfile(unsafeContext).some(error => error.includes("@context")));

  const artPuzzle = PUZZLES.find(puzzle => puzzle.id === "how-a-picture-directs-the-eye");
  const artDocument = puzzleToJsonLd(artPuzzle);
  assert.deepEqual(artDocument.subcategories, { Art: "visual-form" });
  assert.deepEqual(puzzleFromJsonLd(artDocument).subcategories, { Art: "visual-form" });
  const artBundle = catalogueBundleToJsonLd({
    id: "art-fixture",
    title: "Art fixture",
    entries: [{ id: artPuzzle.id }]
  }, PUZZLES, { categories: CATEGORIES });
  const importedArtBundle = catalogueFromJsonLd(artBundle);
  assert.deepEqual(
    importedArtBundle.categories.Art.subcategories,
    CATEGORIES.Art.subcategories
  );

  for (const catalogue of CATALOGUES) {
    assert.deepEqual(validateCatalogueContent(catalogue, { puzzleIds: ids }), [], catalogue.id);
    const manifest = catalogueToJsonLd(catalogue);
    assert.deepEqual(validateJsonLdProfile(manifest), [], catalogue.id);
    assert.deepEqual(catalogueFromJsonLd(manifest).catalogue, catalogue);

    const bundle = catalogueBundleToJsonLd(catalogue, PUZZLES, { categories: CATEGORIES });
    assert.deepEqual(validateJsonLdProfile(bundle), [], catalogue.id);
    const imported = catalogueFromJsonLd(bundle);
    assert.deepEqual(imported.catalogue, catalogue);
    assert.deepEqual(
      imported.puzzles.map(puzzle => puzzle.id),
      catalogue.entries.map(entry => entry.id)
    );
    imported.puzzles.forEach(puzzle =>
      assert.deepEqual(validatePuzzleContent(puzzle, { knownPuzzleIds: ids }), [], puzzle.id)
    );
  }
}
