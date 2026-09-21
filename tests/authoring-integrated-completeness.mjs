import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const name = "Authoring integrated completeness: one-cycle Vocabulary drafts";

const CHECKER = ".agents/skills/author-puzzle/scripts/check-completeness.mjs";

function vocabularyPuzzle(overrides = {}) {
  return {
    id: "integrated-vocabulary",
    title: "Near-Synonym Usage",
    category: "vocabulary",
    puzzleKind: "vocabulary-context",
    info: { text: "Context helps select among closely related words." },
    clusters: [{
      id: "near-synonyms",
      name: "Near Synonyms",
      fact: "The terms share a core sense but differ in usage.",
      terms: ["innate", "intrinsic", "inherent"],
      termInfo: {
        innate: { text: "Present from birth or arising naturally." },
        intrinsic: { text: "Belonging to a thing's essential nature." },
        inherent: { text: "Existing as a permanent or essential part." }
      }
    }],
    bridges: [],
    lenses: [{
      id: "innate-context",
      prompt: "The behavior was ___, not learned.",
      targets: ["innate"],
      explanation: "The intended distinction is stated here."
    }],
    lensMode: "sequential",
    ...overrides
  };
}

function runIntegrated(document) {
  const directory = mkdtempSync(join(tmpdir(), "cc-integrated-"));
  const path = join(directory, "puzzle.json");
  writeFileSync(path, JSON.stringify(document, null, 2));
  const result = spawnSync(
    process.execPath,
    [CHECKER, "--level", "integrated", path],
    { encoding: "utf8" }
  );
  rmSync(directory, { recursive: true, force: true });
  assert.equal(result.status === 0 || result.status === 2, true, result.stderr || result.stdout);
  assert.ok(result.stdout.trim(), `Checker returned no report: ${result.stderr}`);
  return JSON.parse(result.stdout);
}

export async function run() {
  const valid = runIntegrated(vocabularyPuzzle());
  assert.equal(valid.ok, true, JSON.stringify(valid.blocking));
  assert.equal(valid.coverage.clusters, 1);
  assert.equal(valid.coverage.termsWithNotes, 3);
  assert.equal(valid.coverage.lenses, 1);
  assert.match(valid.stopGate, /Integrated Vocabulary cycle OK/);

  const wrongKind = runIntegrated(vocabularyPuzzle({ puzzleKind: "topic-based" }));
  assert.equal(wrongKind.ok, false);
  assert.ok(wrongKind.blocking.some(gap => gap.id === "integrated-profile"));

  const missingLens = runIntegrated(vocabularyPuzzle({ lenses: [] }));
  assert.equal(missingLens.ok, false);
  assert.ok(missingLens.blocking.some(gap => gap.id === "lenses"));

  const missingBoardFact = vocabularyPuzzle();
  delete missingBoardFact.clusters[0].fact;
  const invalidBoard = runIntegrated(missingBoardFact);
  assert.equal(invalidBoard.ok, false);
  assert.ok(invalidBoard.blocking.some(gap => gap.id === "cluster-structure"));

  const explicitPreSolve = runIntegrated(vocabularyPuzzle({ preSolve: true }));
  assert.equal(explicitPreSolve.ok, false);
  assert.ok(explicitPreSolve.blocking.some(gap => gap.id === "pre-solve-automatic"));
}
