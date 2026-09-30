import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const name = "Authoring split plan: record answered questions on the existing inventory";

const RECORDER = ".agents/skills/author-puzzle/scripts/record-split-plan.mjs";
const CHECKER = ".agents/skills/author-puzzle/scripts/check-completeness.mjs";

const OPEN_SEAM = "One board or two?";
const OPEN_OTHER = "Which category should this live under?";

function writePair(directory, inventory, plan) {
  const inventoryPath = join(directory, "stellar-life-cycle.json");
  const planPath = join(directory, "plans", "stellar-life-cycle-split-plan.json");
  writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  return { inventoryPath, planPath };
}

function inventory() {
  return {
    id: "stellar-life-cycle",
    title: "Stellar life cycle",
    distinctions: [
      { id: "d1", candidateTerms: ["molecular cloud", "white dwarf"] },
      { id: "d2", candidateTerms: ["neutron star"] }
    ],
    scope: {
      in: "single stars",
      out: "binaries",
      openQuestions: [OPEN_SEAM, OPEN_OTHER]
    },
    resolvedQuestions: []
  };
}

function plan(question = OPEN_SEAM) {
  return {
    inventoryId: "stellar-life-cycle",
    strategy: "two-balanced-boards",
    seam: "Sun-like path ends at the white dwarf; the next board takes the massive-star fork.",
    boards: [
      {
        id: "sunlike",
        title: "Sun-like",
        distinctions: ["d1"],
        sharedTerms: ["white dwarf"],
        trim: []
      },
      {
        id: "massive",
        title: "Massive",
        distinctions: ["d2"],
        sharedTerms: ["white dwarf"],
        trim: []
      }
    ],
    boardOrder: ["sunlike", "massive"],
    resolvedQuestions: [{
      question,
      resolution: "Two boards. Carry white dwarf across so the first reaches a Sun-like endpoint."
    }]
  };
}

function runRecorder(args) {
  return spawnSync(process.execPath, [RECORDER, ...args], { encoding: "utf8" });
}

export async function run() {
  const directory = mkdtempSync(join(tmpdir(), "cc-split-record-"));
  try {
    mkdirSync(join(directory, "plans"));
    const paths = writePair(directory, inventory(), plan());

    const blocked = spawnSync(process.execPath, [
      CHECKER, "--level", "split", "--plan", paths.planPath, paths.inventoryPath
    ], { encoding: "utf8" });
    assert.equal(blocked.status, 2, blocked.stderr || blocked.stdout);
    const blockedReport = JSON.parse(blocked.stdout);
    const gap = blockedReport.blocking.find(entry => entry.id === "inventory-resolution-missing");
    assert.ok(gap, blocked.stdout);
    assert.match(gap.message, /record-split-plan\.mjs/);
    assert.match(gap.message, /apply_patch/);

    const recorded = runRecorder([
      "--inventory", paths.inventoryPath,
      "--plan", paths.planPath
    ]);
    assert.equal(recorded.status, 0, recorded.stderr || recorded.stdout);
    const report = JSON.parse(recorded.stdout);
    assert.equal(report.splitPlanPath, "plans/stellar-life-cycle-split-plan.json");
    assert.deepEqual(report.resolved, [OPEN_SEAM]);
    assert.deepEqual(report.openQuestions, [OPEN_OTHER]);

    const updated = JSON.parse(readFileSync(paths.inventoryPath, "utf8"));
    assert.equal(updated.splitPlanPath, "plans/stellar-life-cycle-split-plan.json");
    assert.deepEqual(updated.scope.openQuestions, [OPEN_OTHER]);
    assert.deepEqual(updated.resolvedQuestions, [{
      question: OPEN_SEAM,
      resolution: "Two boards. Carry white dwarf across so the first reaches a Sun-like endpoint."
    }]);
    assert.deepEqual(updated.distinctions[0].candidateTerms, ["molecular cloud", "white dwarf"]);

    const again = runRecorder(["--inventory", paths.inventoryPath, "--plan", paths.planPath]);
    assert.equal(again.status, 0, again.stderr || again.stdout);
    const twice = JSON.parse(readFileSync(paths.inventoryPath, "utf8"));
    assert.equal(twice.resolvedQuestions.length, 1);
    assert.deepEqual(twice.scope.openQuestions, [OPEN_OTHER]);

    const passed = spawnSync(process.execPath, [
      CHECKER, "--level", "split", "--plan", paths.planPath, paths.inventoryPath
    ], { encoding: "utf8" });
    assert.equal(passed.status, 0, passed.stderr || passed.stdout);
    assert.equal(JSON.parse(passed.stdout).ok, true);

    const mismatched = writePair(directory, inventory(), plan("A paraphrased seam question"));
    const before = readFileSync(mismatched.inventoryPath, "utf8");
    const rejected = runRecorder([
      "--inventory", mismatched.inventoryPath,
      "--plan", mismatched.planPath
    ]);
    assert.equal(rejected.status, 2, rejected.stdout);
    const rejection = JSON.parse(rejected.stdout);
    assert.equal(rejection.code, "question-mismatch");
    assert.match(rejection.message, /apply_patch/);
    assert.equal(readFileSync(mismatched.inventoryPath, "utf8"), before);

    const wrongId = plan();
    wrongId.inventoryId = "other-inventory";
    const wrongPaths = writePair(directory, inventory(), wrongId);
    const wrongBefore = readFileSync(wrongPaths.inventoryPath, "utf8");
    const wrong = runRecorder([
      "--inventory", wrongPaths.inventoryPath,
      "--plan", wrongPaths.planPath
    ]);
    assert.equal(wrong.status, 1, wrong.stdout);
    assert.equal(JSON.parse(wrong.stdout).code, "inventory-mismatch");
    assert.equal(readFileSync(wrongPaths.inventoryPath, "utf8"), wrongBefore);

    const unbound = plan();
    delete unbound.inventoryId;
    const unboundPaths = writePair(directory, inventory(), unbound);
    const unboundBefore = readFileSync(unboundPaths.inventoryPath, "utf8");
    const unboundRun = runRecorder([
      "--inventory", unboundPaths.inventoryPath,
      "--plan", unboundPaths.planPath
    ]);
    assert.equal(unboundRun.status, 1, unboundRun.stdout);
    assert.equal(JSON.parse(unboundRun.stdout).code, "inventory-id-missing");
    assert.equal(readFileSync(unboundPaths.inventoryPath, "utf8"), unboundBefore);

    const malformed = plan();
    malformed.resolvedQuestions = { question: OPEN_SEAM, resolution: "Two boards." };
    const malformedPaths = writePair(directory, inventory(), malformed);
    const malformedBefore = readFileSync(malformedPaths.inventoryPath, "utf8");
    const malformedRun = runRecorder([
      "--inventory", malformedPaths.inventoryPath,
      "--plan", malformedPaths.planPath
    ]);
    assert.equal(malformedRun.status, 1, malformedRun.stdout);
    assert.equal(JSON.parse(malformedRun.stdout).code, "invalid-resolutions");
    assert.equal(readFileSync(malformedPaths.inventoryPath, "utf8"), malformedBefore);

    const shape = spawnSync(process.execPath, [
      CHECKER, "--level", "split", "--plan", malformedPaths.planPath, malformedPaths.inventoryPath
    ], { encoding: "utf8" });
    assert.equal(shape.status, 2, shape.stderr || shape.stdout);
    assert.ok(JSON.parse(shape.stdout).blocking.some(entry => entry.id === "plan-resolved-questions"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
