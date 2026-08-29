import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const name = "Authoring plan-boards: single-board vs split, no standard/large fork";

const PLANNER = ".agents/skills/author-puzzle/scripts/plan-boards.mjs";

function runPlan(inventory) {
  const directory = mkdtempSync(join(tmpdir(), "cc-plan-"));
  const path = join(directory, "inventory.json");
  writeFileSync(path, JSON.stringify(inventory, null, 2));
  const result = spawnSync(process.execPath, [PLANNER, path], { encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function inventory({ termCounts, connections = 0 }) {
  const distinctions = termCounts.map((count, index) => ({
    id: `d${index + 1}`,
    name: `D${index + 1}`,
    job: `Job ${index + 1}.`,
    candidateTerms: Array.from({ length: count }, (_, i) => `d${index + 1}-t${i + 1}`),
    anchor: { title: "A", url: "https://example.com" }
  }));
  return {
    id: "plan-test",
    title: "Plan Test",
    distinctions,
    connections: Array.from({ length: connections }, (_, i) => ({
      distinctions: ["d1", "d2"],
      concept: `span-${i + 1}`,
      because: "Genuine."
    }))
  };
}

export async function run() {
  const small = runPlan(inventory({ termCounts: [4, 3], connections: 1 }));
  assert.equal(small.options[0].strategy, "single-board");
  assert.ok(!small.options.some(option => option.strategy === "single-standard"));
  assert.ok(!small.options.some(option => option.strategy === "single-large"));
  assert.match(small.nextStep, /Proceed to fit/);

  const wide = runPlan(inventory({ termCounts: [6, 6, 5], connections: 2 }));
  assert.equal(wide.nodeRangeWithBridges[1], 19);
  assert.equal(wide.options[0].strategy, "single-board");
  assert.match(wide.options[0].note, /wide canvas is derived/);

  const split = runPlan(inventory({ termCounts: [8, 8, 8, 8], connections: 3 }));
  assert.ok(split.nodeRangeWithBridges[1] > 24);
  assert.equal(split.options[0].strategy, "split-required");
  assert.match(split.nextStep, /split-plan/);
}
