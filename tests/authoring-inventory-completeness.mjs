import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const name = "Authoring inventory completeness: uniform term counts block";

const CHECKER = ".agents/skills/author-puzzle/scripts/check-completeness.mjs";

function runInventory(document) {
  const directory = mkdtempSync(join(tmpdir(), "cc-inventory-"));
  const path = join(directory, "inventory.json");
  writeFileSync(path, JSON.stringify(document, null, 2));
  const result = spawnSync(process.execPath, [CHECKER, "--level", "inventory", path], {
    encoding: "utf8"
  });
  rmSync(directory, { recursive: true, force: true });
  assert.equal(result.status === 0 || result.status === 2, true, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function baseInventory(distinctions) {
  return {
    id: "test-inventory",
    title: "Test Inventory",
    category: "Biology",
    thesis: "A one-sentence thesis for testing.",
    distinctions,
    excluded: [{ item: "noise", reason: "out of scope for this test fixture" }],
    scope: { in: "test", out: "test", openQuestions: [] }
  };
}

function distinction(id, termCount) {
  const terms = Array.from({ length: termCount }, (_, index) => `${id}-term-${index + 1}`);
  return {
    id,
    name: id,
    job: `Conceptual job for ${id}.`,
    candidateTerms: terms,
    anchor: { title: `Anchor for ${id}`, url: "https://example.com" }
  };
}

export async function run() {
  const uniform = runInventory(baseInventory([
    distinction("d1", 4),
    distinction("d2", 4),
    distinction("d3", 4)
  ]));
  assert.equal(uniform.ok, false);
  assert.ok(uniform.blocking.some(gap => gap.id === "uniform-inventory-counts"));

  const uneven = runInventory(baseInventory([
    distinction("d1", 5),
    distinction("d2", 3),
    distinction("d3", 4)
  ]));
  assert.equal(uneven.ok, true);
  assert.ok(!uneven.blocking.some(gap => gap.id === "uniform-inventory-counts"));

  const justified = runInventory({
    ...baseInventory([
      distinction("d1", 4),
      distinction("d2", 4),
      distinction("d3", 4)
    ]),
    uniformTermCountsJustified: "Each distinction is one instrument mode with four vendor-neutral control knobs."
  });
  assert.equal(justified.ok, true);
  assert.ok(!justified.blocking.some(gap => gap.id === "uniform-inventory-counts"));
}
