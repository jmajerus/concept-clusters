import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import {
  registerPuzzleSource,
  unregisterPuzzleSource
} from "../modules/publicationArtifacts.js";
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
    const energyValidation = await content.validateJsonLdDocument(energy);
    assert.equal(energyValidation.valid, true);
    // flags is non-blocking, additive to pass/fail -- see
    // modules/puzzleSymmetryFlags.js.
    assert.ok(Array.isArray(energyValidation.flags));
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
    // createPuzzleSkeleton() now emits the simplified shape (no @context),
    // so an incomplete skeleton fails simplified-schema validation directly
    // -- a clear "clusters" shape error, not a JSON-LD-profile or
    // contentValidation.js semantic error riding on top of it.
    assert.ok(incomplete.errors.some(error => error.includes("clusters")));
    // flags stays a consistently-shaped (empty) array even on this early-
    // return failure path, rather than an absent key.
    assert.deepEqual(incomplete.flags, []);

    const created = await drafts.createDraft({
      draftId: "service-fixture",
      document: skeleton
    });
    assert.equal(created.revision, 1);
    assert.equal(created.status, "draft");
    assert.equal((await drafts.listDrafts())[0].puzzleId, "service-fixture");
    const installed = await drafts.markInstalled("service-fixture");
    assert.equal(installed.status, "installed");
    assert.equal(installed.revision, 1);
    assert.ok(installed.installedAt);
    assert.equal(installed.installedContentHash, installed.contentHash);
    const uninstalled = await drafts.markUninstalled("service-fixture");
    assert.equal(uninstalled.status, "draft");
    assert.equal(uninstalled.installedAt, null);
    const reinstalled = await drafts.markInstalled("service-fixture");
    assert.equal(reinstalled.status, "installed");
    assert.equal(reinstalled.installedContentHash, reinstalled.contentHash);
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
    assert.equal(updated.status, "installed");
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
      "content/puzzles/service-fixture.ccpuzzle.json",
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
      "content/puzzles/why-art-changes-what-it-sees.ccpuzzle.json",
      "puzzles/art/why-art-changes-what-it-sees.js"
    ]);

    const bundle = await content.exportCatalogueJsonLd("getting-started");
    assert.equal(bundle["@type"], "CatalogueBundle");
    assert.equal((await content.validateJsonLdDocument(bundle)).valid, true);

    const registry = `import energyFlow from "./science/energy-flow.js";

// Cross-disciplinary membership

export const PUZZLES = [
  energyFlow,
];
`;
    const registered = registerPuzzleSource(
      registry,
      { id: "service-uninst" },
      "puzzles/science/service-uninst.js"
    );
    assert.match(registered, /import serviceUninst from "\.\/science\/service-uninst\.js";/);
    assert.match(registered, /serviceUninst,/);
    const unregistered = unregisterPuzzleSource(registered, "service-uninst");
    assert.doesNotMatch(unregistered, /serviceUninst/);
    assert.match(unregistered, /energyFlow/);

    const uninstallRoot = join(directory, "repo");
    await mkdir(join(uninstallRoot, "content", "puzzles"), { recursive: true });
    await mkdir(join(uninstallRoot, "puzzles", "science"), { recursive: true });
    await writeFile(
      join(uninstallRoot, "content", "puzzles", "service-uninst.ccpuzzle.json"),
      "{}\n"
    );
    await writeFile(
      join(uninstallRoot, "puzzles", "science", "service-uninst.js"),
      "export default {};\n"
    );
    await writeFile(join(uninstallRoot, "puzzles", "index.js"), registered);
    const forgotten = [];
    const uninstallPublisher = createRepositoryPublicationService({
      contentService: {
        repositoryRoot: uninstallRoot,
        forgetInstalledPuzzle(id) { forgotten.push(id); }
      },
      readCommittedFile: () => null,
      validateRepository: () => {}
    });
    const removed = await uninstallPublisher.applyPuzzleUninstall("service-uninst", {
      category: "Science"
    });
    assert.equal(removed.action, "remove");
    assert.deepEqual(forgotten, ["service-uninst"]);
    await assert.rejects(access(
      join(uninstallRoot, "content", "puzzles", "service-uninst.ccpuzzle.json")
    ));
    await assert.rejects(access(
      join(uninstallRoot, "puzzles", "science", "service-uninst.js")
    ));

    await writeFile(
      join(uninstallRoot, "content", "puzzles", "service-restore.ccpuzzle.json"),
      "dirty\n"
    );
    const restorePublisher = createRepositoryPublicationService({
      contentService: {
        repositoryRoot: uninstallRoot,
        forgetInstalledPuzzle() {}
      },
      readCommittedFile: (_root, relativePath) => (
        relativePath === "content/puzzles/service-restore.ccpuzzle.json"
          ? "committed\n"
          : null
      ),
      validateRepository: () => {}
    });
    const restored = await restorePublisher.applyPuzzleUninstall("service-restore", {
      category: "Science"
    });
    assert.equal(restored.action, "restore");
    assert.equal(
      await readFile(
        join(uninstallRoot, "content", "puzzles", "service-restore.ccpuzzle.json"),
        "utf8"
      ),
      "committed\n"
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
