import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
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
    const staleLargeFlag = {
      id: "stale-large-flag",
      title: "Stale large flag",
      category: "Trivia",
      large: true,
      clusters: [{
        terms: Array.from({ length: 15 }, (_, i) => `term-${i}`)
      }],
      bridges: [{ term: "bridge" }]
    };
    assert.equal(
      createContentInterchangeService({ puzzles: [staleLargeFlag] })
        .listPuzzles()[0].large,
      false
    );
    assert.equal(
      createHostedAuthoringContentService({ puzzles: [staleLargeFlag] })
        .listPuzzles()[0].large,
      false
    );
    const honestWide = {
      ...staleLargeFlag,
      id: "honest-wide",
      large: false,
      clusters: [{
        terms: Array.from({ length: 16 }, (_, i) => `term-${i}`)
      }]
    };
    assert.equal(
      createContentInterchangeService({ puzzles: [honestWide] })
        .listPuzzles()[0].large,
      true
    );
    assert.equal(
      createHostedAuthoringContentService({ puzzles: [honestWide] })
        .listPuzzles()[0].large,
      true
    );
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

    // bridge-term-role is user-only: validatePuzzleDraft's flags (what an
    // MCP client sees, and what recordValidation persists) must never
    // include it, even though the puzzle triggers it. computeUserOnlyFlags
    // is the separate, non-persisted accessor the draft review page calls
    // for its own render. See puzzleSymmetryFlags.js.
    {
      const uniformTermRolePuzzle = {
        id: "uniform-term-role-fixture",
        title: "Uniform term role fixture",
        category: "Science",
        clusters: [
          { id: "a", name: "A", fact: "fa", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
          { id: "b", name: "B", fact: "fb", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
        ],
        bridges: [
          { term: "bt1", clusters: ["a", "b"], fact: "f1", termRole: "connector" },
          { term: "bt2", clusters: ["a", "b"], fact: "f2", termRole: "connector" },
          { term: "bt3", clusters: ["a", "b"], fact: "f3", termRole: "connector" }
        ]
      };
      const uniformTermRoleValidation = await content.validatePuzzleDraft(uniformTermRolePuzzle);
      assert.equal(
        uniformTermRoleValidation.flags.some(flag => flag.id === "bridge-term-role"),
        false
      );
      const userOnlyFlags = await content.computeUserOnlyFlags(uniformTermRolePuzzle);
      assert.equal(userOnlyFlags.some(flag => flag.id === "bridge-term-role"), true);

      const hosted = createHostedAuthoringContentService();
      const hostedValidation = hosted.validatePuzzleDraft(uniformTermRolePuzzle);
      assert.equal(
        hostedValidation.flags.some(flag => flag.id === "bridge-term-role"),
        false
      );
      assert.equal(
        hosted.computeUserOnlyFlags(uniformTermRolePuzzle)
          .some(flag => flag.id === "bridge-term-role"),
        true
      );
    }

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
