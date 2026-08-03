import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { createRepositoryPublicationService } from "../modules/repositoryPublicationService.js";

export const name = "content services: interchange, durable drafts, and safe publication plans";

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-services-"));
  try {
    const content = createContentInterchangeService();
    const publisher = createRepositoryPublicationService({ contentService: content });
    const drafts = createPuzzleDraftStore({ directory });

    const energy = await content.getPuzzleJsonLd("energy-flow");
    assert.equal(energy.id, "energy-flow");
    assert.equal((await content.validateJsonLdDocument(energy)).valid, true);
    assert.ok(content.listPuzzles({ category: "Science" }).length > 0);
    assert.ok(content.listCatalogues().some(item => item.id === "getting-started"));
    const categories = content.listCategories();
    const science = content.getCategory("Science");
    assert.ok(categories.some(item => item.name === "Science"));
    assert.equal(science.registered, true);
    assert.ok(science.puzzleCount > 0);
    assert.ok(science.primaryPuzzleCount > 0);

    const skeleton = content.createPuzzleSkeleton({
      id: "service-fixture",
      title: "Service fixture",
      category: "Science"
    });
    const incomplete = await content.validateJsonLdDocument(skeleton);
    assert.equal(incomplete.valid, false);
    assert.ok(incomplete.errors.some(error => error.includes("cluster count")));

    const created = await drafts.createDraft({
      draftId: "service-fixture",
      document: skeleton
    });
    assert.equal(created.revision, 1);
    assert.equal((await drafts.listDrafts())[0].puzzleId, "service-fixture");
    const replacement = {
      ...energy,
      "@id": "urn:concept-clusters:puzzle:service-fixture",
      id: "service-fixture",
      title: "Service fixture"
    };
    const updated = await drafts.replaceDraft({
      draftId: "service-fixture",
      expectedRevision: 1,
      document: replacement
    });
    assert.equal(updated.revision, 2);
    await assert.rejects(
      drafts.replaceDraft({
        draftId: "service-fixture",
        expectedRevision: 1,
        document: replacement
      }),
      /revision conflict/
    );

    const firstPlan = await publisher.planPuzzleImport(replacement);
    const secondPlan = await publisher.planPuzzleImport(replacement);
    assert.equal(firstPlan.action, "create");
    assert.equal(firstPlan.approvalToken, secondPlan.approvalToken);
    assert.deepEqual(firstPlan.affectedPaths, [
      "content/puzzles/service-fixture.ccpuzzle.jsonld",
      "puzzles/science/service-fixture.js",
      "puzzles/index.js"
    ]);
    await assert.rejects(
      publisher.applyPuzzleImport(firstPlan, { approvalToken: "sha256:wrong" }),
      /approval token/
    );

    const replacing = await publisher.planPuzzleImport(
      await content.getPuzzleJsonLd("why-art-changes-what-it-sees"),
      { replace: true }
    );
    assert.deepEqual(replacing.affectedPaths, [
      "content/puzzles/why-art-changes-what-it-sees.ccpuzzle.jsonld",
      "puzzles/art/why-art-changes-what-it-sees.js"
    ]);

    const bundle = await content.exportCatalogueJsonLd("getting-started");
    assert.equal(bundle["@type"], "CatalogueBundle");
    assert.equal((await content.validateJsonLdDocument(bundle)).valid, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
