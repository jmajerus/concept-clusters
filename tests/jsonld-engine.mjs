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

  // Copilot review on #47: exercise the id/@id drift check directly (the
  // happy-path loop above never disagrees), and confirm a malformed @id
  // (missing the leading "#") reports once via the "local fragment
  // identifier" error rather than a second, less-actionable "id must
  // match" error riding along with it.
  const driftPuzzle = PUZZLES.find(puzzle => puzzle.bridges.length > 0);
  const driftDocument = puzzleToJsonLd(driftPuzzle);
  const clusterDrift = {
    ...driftDocument,
    clusters: driftDocument.clusters.map((cluster, index) =>
      index === 0 ? { ...cluster, id: `${cluster.id}-drifted` } : cluster
    )
  };
  assert.ok(
    validateJsonLdProfile(clusterDrift).some(error => error.includes(`clusters[0].id must match "@id"`)),
    "cluster id drifting from @id should fail validation"
  );
  const bridgeDrift = {
    ...driftDocument,
    bridges: driftDocument.bridges.map((bridge, index) =>
      index === 0 ? { ...bridge, id: `${bridge.id}-drifted` } : bridge
    )
  };
  assert.ok(
    validateJsonLdProfile(bridgeDrift).some(error => error.includes(`bridges[0].id must match "@id"`)),
    "bridge id drifting from @id should fail validation"
  );
  const malformedClusterId = {
    ...driftDocument,
    clusters: driftDocument.clusters.map((cluster, index) =>
      index === 0 ? { ...cluster, "@id": cluster.id } : cluster // drop the leading "#"
    )
  };
  const malformedClusterErrors = validateJsonLdProfile(malformedClusterId);
  assert.ok(
    malformedClusterErrors.some(error => error.includes("clusters[0].@id must be a local fragment identifier")),
    "malformed cluster @id should still be reported"
  );
  assert.ok(
    !malformedClusterErrors.some(error => error.includes("clusters[0].id must match")),
    "malformed @id should not also trigger a secondary id/@id mismatch error"
  );
  const malformedBridgeId = {
    ...driftDocument,
    bridges: driftDocument.bridges.map((bridge, index) =>
      index === 0 ? { ...bridge, "@id": bridge.id } : bridge // drop the leading "#"
    )
  };
  const malformedBridgeErrors = validateJsonLdProfile(malformedBridgeId);
  assert.ok(
    malformedBridgeErrors.some(error => error.includes("bridges[0].@id must be a local fragment identifier")),
    "malformed bridge @id should still be reported"
  );
  assert.ok(
    !malformedBridgeErrors.some(error => error.includes("bridges[0].id must match")),
    "malformed @id should not also trigger a secondary id/@id mismatch error"
  );

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
  // tags is exercised for every real puzzle already by the round-trip
  // loop above (any of PUZZLES tagged "book" included); these target
  // specifically what that loop can't: rejecting a malformed shape.
  // Deliberately informal like relatedPuzzles.entries[].via, but tags
  // feed directly into search matching (tag.toLowerCase()), so elements
  // must actually be strings or that call throws.
  const taggedPuzzle = PUZZLES.find(puzzle => puzzle.tags?.includes("book"));
  assert.ok(taggedPuzzle, "expected at least one book-tagged puzzle fixture");
  assert.deepEqual(
    puzzleFromJsonLd(puzzleToJsonLd(taggedPuzzle)).tags,
    taggedPuzzle.tags,
    "tags should round-trip through JSON-LD"
  );
  assert.ok(
    validatePuzzleContent({ ...taggedPuzzle, tags: [] }, { knownPuzzleIds: ids })
      .some(error => error.includes("tags must be a non-empty array")),
    "empty tags array should fail validation"
  );
  assert.ok(
    validatePuzzleContent({ ...taggedPuzzle, tags: ["book", 42] }, { knownPuzzleIds: ids })
      .some(error => error.includes("tags must contain only non-empty strings")),
    "non-string tag should fail validation"
  );

  // citations is exercised for every real puzzle already by the
  // round-trip loop above (finite-and-infinite-games/evolution-of-
  // cooperation both carry a real one); these target specifically
  // what that loop can't: rejecting a malformed shape. Unlike
  // seeAlso, a citation must always be a structured object, never a
  // bare string.
  const citedPuzzle = PUZZLES.find(puzzle => puzzle.info?.citations?.length);
  assert.ok(citedPuzzle, "expected at least one puzzle fixture with info.citations");
  assert.deepEqual(
    puzzleFromJsonLd(puzzleToJsonLd(citedPuzzle)).info.citations,
    citedPuzzle.info.citations,
    "citations should round-trip through JSON-LD"
  );
  const assistedPuzzle = PUZZLES.find(puzzle => puzzle.generativeAssistance?.length);
  assert.ok(assistedPuzzle, "expected at least one puzzle with generativeAssistance");
  assert.deepEqual(
    puzzleFromJsonLd(puzzleToJsonLd(assistedPuzzle)).generativeAssistance,
    assistedPuzzle.generativeAssistance,
    "generativeAssistance should round-trip through JSON-LD"
  );
  assert.ok(
    validatePuzzleContent({
      ...citedPuzzle,
      info: { ...citedPuzzle.info, citations: [] }
    }, { knownPuzzleIds: ids })
      .some(error => error.includes("citations must be a non-empty array")),
    "empty citations array should fail validation"
  );
  assert.ok(
    validatePuzzleContent({
      ...citedPuzzle,
      info: { ...citedPuzzle.info, citations: [{ author: "No Title Here" }] }
    }, { knownPuzzleIds: ids })
      .some(error => error.includes("citations[0].title must be a non-empty string")),
    "missing citation title should fail validation"
  );
  assert.ok(
    validatePuzzleContent({
      ...citedPuzzle,
      info: { ...citedPuzzle.info, citations: ["A Bare String Citation"] }
    }, { knownPuzzleIds: ids })
      .some(error => error.includes("citations[0] must be an object")),
    "bare-string citation should fail validation (unlike seeAlso)"
  );

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

  // Meta catalogues (kind: "meta", entries are other catalogues' ids) are
  // a runtime-only concept -- deliberately no JSON-LD support for them,
  // see docs/CATALOGUES.md.
  for (const catalogue of CATALOGUES.filter(item => item.kind !== "meta")) {
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
