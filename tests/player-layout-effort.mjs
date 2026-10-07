import assert from "node:assert/strict";
import {
  BUILD_DRAG_WEIGHT,
  CRAFTED_DRAGS,
  effortScore,
  DELIBERATE_DRAG,
  classifyDrag,
  defectsWorse,
  hasDefects,
  isCrafted,
  normalizeEffort,
  recordDrag
} from "../modules/playerLayoutEffort.js";
import { loadPlayerSession, playerSessionKey, savePlayerSession } from "../modules/playerSessionStore.js";

export const name = "player layout effort: deliberate drags, kept or worsened, decide whose layout it is";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

export async function run() {
  const clean = { hardOverlaps: 0, lineCrossings: 0, edgeNodeIntersections: 0 };
  const crossed = { ...clean, lineCrossings: 1 };
  const obstructed = { ...clean, edgeNodeIntersections: 2 };

  // A nudge is not a decision.
  assert.equal(classifyDrag({ mode: "graph", before: clean, after: clean, displacement: DELIBERATE_DRAG - 1 }), null);
  // Taste counts: spreading lines apart changes no defect.
  assert.equal(classifyDrag({ mode: "graph", before: clean, after: clean, displacement: 80 }), "kept");
  // So does fixing something.
  assert.equal(classifyDrag({ mode: "graph", before: crossed, after: clean, displacement: 40 }), "kept");
  // Making it worse counts against.
  assert.equal(classifyDrag({ mode: "graph", before: clean, after: crossed, displacement: 40 }), "worsened");
  // Severity order: trading a crossing for two lines through pills is not worse.
  assert.equal(defectsWorse("graph", crossed, obstructed), false);
  assert.equal(defectsWorse("graph", obstructed, crossed), true);
  // Star ranks crossings first, overlaps last.
  assert.equal(defectsWorse("star", { lineCrossings: 0, overlaps: 3 }, { lineCrossings: 1, overlaps: 0 }), true);
  assert.equal(hasDefects("sets", { hardOverlaps: 0, lineCrossings: 0, lineHeadingIntersections: 0, lineCircleIntersections: 1 }), true);
  // Star's total line-through count includes titles: clearing a title hit
  // while adding several pill hits is worse, not better.
  assert.equal(defectsWorse("star",
    { lineCrossings: 0, edgeNodeIntersections: 1, edgeTitleIntersections: 1, overlaps: 0 },
    { lineCrossings: 0, edgeNodeIntersections: 5, edgeTitleIntersections: 0, overlaps: 0 }), true);
  // Circle weighs lines through headings and circles the same.
  const circleBase = { hardOverlaps: 0, lineCrossings: 0 };
  assert.equal(defectsWorse("sets",
    { ...circleBase, lineHeadingIntersections: 1, lineCircleIntersections: 0 },
    { ...circleBase, lineHeadingIntersections: 0, lineCircleIntersections: 3 }), true);
  assert.equal(defectsWorse("sets",
    { ...circleBase, lineHeadingIntersections: 1, lineCircleIntersections: 0 },
    { ...circleBase, lineHeadingIntersections: 0, lineCircleIntersections: 1 }), false);
  assert.equal(hasDefects("graph", clean), false);

  // Crafted: net counted drags reach the threshold, per mode.
  let effort = {};
  for (let i = 0; i < CRAFTED_DRAGS - 1; i++) effort = recordDrag(effort, "graph", "kept");
  assert.equal(isCrafted(effort, "graph"), false);
  effort = recordDrag(effort, "graph", "kept");
  assert.equal(isCrafted(effort, "graph"), true);
  assert.equal(isCrafted(effort, "star"), false, "effort is per mode");
  effort = recordDrag(effort, "graph", "worsened");
  assert.equal(isCrafted(effort, "graph"), false, "a worsening drag counts against");
  assert.deepEqual(recordDrag(effort, "graph", null), effort);

  // Malformed records read as no effort.
  assert.deepEqual(normalizeEffort(null), {});
  assert.deepEqual(normalizeEffort({ graph: { kept: -1, worsened: "x" }, bogus: { kept: 3 } }), {});
  // One bad counter voids that mode's record rather than leaving the
  // valid-looking part to make the board count as crafted.
  assert.deepEqual(normalizeEffort({ graph: { kept: 3, worsened: "x" } }), {});
  assert.deepEqual(normalizeEffort({ graph: { kept: 3, worsened: 0 }, star: { kept: 2, buildKept: 1.5 } }), {
    graph: { kept: 3, worsened: 0, buildKept: 0, buildWorsened: 0 }
  });
  assert.deepEqual(normalizeEffort({ star: { kept: 2 } }), {
    star: { kept: 2, worsened: 0, buildKept: 0, buildWorsened: 0 }
  });

  // Drags while building count, at reduced weight.
  let building = {};
  const buildDragsToCraft = Math.ceil(CRAFTED_DRAGS / BUILD_DRAG_WEIGHT);
  for (let i = 0; i < buildDragsToCraft - 1; i++) {
    building = recordDrag(building, "star", "kept", { building: true });
  }
  assert.equal(isCrafted(building, "star"), false);
  building = recordDrag(building, "star", "kept", { building: true });
  assert.equal(isCrafted(building, "star"), true, "enough build-phase arranging makes a board the player's");
  assert.equal(effortScore(building, "star"), buildDragsToCraft * BUILD_DRAG_WEIGHT);
  building = recordDrag(building, "star", "worsened", { building: true });
  assert.equal(effortScore(building, "star"), (buildDragsToCraft - 1) * BUILD_DRAG_WEIGHT);
  // Mixed: one tidying drag after the solve plus two while building.
  let mixed = recordDrag({}, "graph", "kept");
  mixed = recordDrag(mixed, "graph", "kept", { building: true });
  mixed = recordDrag(mixed, "graph", "kept", { building: true });
  assert.equal(isCrafted(mixed, "graph"), true);

  // Stored with the player's session, and a bad record never costs the session.
  const storage = memoryStorage();
  const puzzle = { id: "effort-lab", clusters: [{ name: "A", terms: ["a", "b"] }], bridges: [] };
  assert.equal(savePlayerSession(storage, puzzle, {
    currentMode: "graph",
    layouts: {},
    effort: { graph: { kept: 3, worsened: 1, buildKept: 2 } }
  }), true);
  assert.deepEqual(loadPlayerSession(storage, puzzle).effort, {
    graph: { kept: 3, worsened: 1, buildKept: 2, buildWorsened: 0 }
  });
  const raw = JSON.parse(storage.getItem(playerSessionKey(puzzle)));
  storage.setItem(playerSessionKey(puzzle), JSON.stringify({ ...raw, effort: "corrupt" }));
  const recovered = loadPlayerSession(storage, puzzle);
  assert.ok(recovered, "session survives a malformed effort record");
  assert.deepEqual(recovered.effort, {});
}
