import assert from "node:assert/strict";
import {
  addClusterWithTerm,
  addTerm,
  createBridge,
  createAuthorEngine,
  deleteTerm,
  extendBridge,
  interpretAuthorTap,
  interpretAuthorClusterTap,
  joinTermToCluster,
  prepareDocumentForSave,
  renameTerm,
  toggleSeed
} from "../modules/authorEngine.js";
import { createPuzzleSkeleton } from "../modules/puzzleSkeleton.js";

export const name = "author engine: join vs bridge gestures";

function blank() {
  return createPuzzleSkeleton({
    id: "author-engine-fixture",
    title: "Author engine fixture",
    category: "Science"
  });
}

export async function run() {
  const engine = createAuthorEngine();
  assert.equal(typeof engine.interpretAuthorTap, "function");

  const first = addTerm(blank(), "photon");
  assert.equal(first.clusters.length, 1);
  assert.deepEqual(first.clusters[0].seeds, ["photon"]);
  assert.equal((first.unplacedTerms || []).length, 0);

  const second = addTerm(first, "electron");
  assert.deepEqual(second.unplacedTerms, ["electron"]);
  assert.equal(second.clusters.length, 1);

  const joined = joinTermToCluster(second, "electron", second.clusters[0].id);
  assert.equal((joined.unplacedTerms || []).length, 0);
  assert.deepEqual(joined.clusters[0].seeds, ["photon", "electron"]);
  assert.equal(prepareDocumentForSave(joined).unplacedTerms, undefined);

  const twoClusters = addClusterWithTerm(joined, "gravity");
  assert.equal(twoClusters.clusters.length, 2);
  const tapBridge = interpretAuthorTap(
    twoClusters,
    { word: "photon", gs: [0] },
    { word: "gravity", gs: [1] }
  );
  assert.equal(tapBridge.document.bridges.length, 1);
  assert.deepEqual(tapBridge.document.bridges[0].clusters, [
    twoClusters.clusters[0].id,
    twoClusters.clusters[1].id
  ]);

  const named = createBridge(twoClusters, [
    twoClusters.clusters[0].id,
    twoClusters.clusters[1].id
  ], "force");
  const third = addClusterWithTerm(named, "mass");
  const extended = extendBridge(third, "force", third.clusters[2].id);
  assert.equal(extended.bridges[0].clusters.length, 3);

  const renamed = renameTerm(extended, "photon", "light quantum");
  assert.ok(renamed.clusters[0].seeds.includes("light quantum"));
  assert.ok(!renamed.clusters[0].seeds.includes("photon"));

  const seeded = toggleSeed(joined, "electron");
  assert.deepEqual(seeded.clusters[0].seeds, ["photon"]);
  assert.deepEqual(seeded.clusters[0].floatingTerms, ["electron"]);

  const joinTap = interpretAuthorTap(
    second,
    { word: "electron", gs: [], unplaced: true },
    { word: "photon", gs: [0] }
  );
  assert.ok(joinTap.document.clusters[0].seeds.includes("electron"));
  assert.equal((joinTap.document.unplacedTerms || []).length, 0);

  const titleJoin = interpretAuthorClusterTap(
    second,
    { word: "electron", gs: [], unplaced: true },
    second.clusters[0].id
  );
  assert.ok(titleJoin.document.clusters[0].seeds.includes("electron"));
  const titleSelect = interpretAuthorClusterTap(joined, null, joined.clusters[0].id);
  assert.equal(titleSelect.selectedClusterId, joined.clusters[0].id);

  const deleted = deleteTerm(joined, "electron");
  assert.deepEqual(deleted.clusters[0].seeds, ["photon"]);

  const withLens = engine.upsertLens(first, {
    id: "wave",
    prompt: "Which terms are waves?",
    explanation: "Waves transfer energy without transferring matter."
  });
  assert.equal(withLens.lenses.length, 1);
  const withLesson = engine.setLearningIntroduction(withLens, {
    requirement: "optional",
    title: "Light",
    text: "Photons are packets of light."
  });
  assert.equal(withLesson.learningIntroduction.content.text, "Photons are packets of light.");
}
