import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const name = "Authoring fit completeness: inventory connections vs board bridges";

const CHECKER = ".agents/skills/author-puzzle/scripts/check-completeness.mjs";

function runFit({ inventory, board, ledger }) {
  const directory = mkdtempSync(join(tmpdir(), "cc-fit-"));
  const boardPath = join(directory, "board.json");
  writeFileSync(join(directory, "board-inventory.json"), JSON.stringify(inventory, null, 2));
  writeFileSync(boardPath, JSON.stringify(board, null, 2));
  const ledgerPath = join(directory, "board-fit.json");
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
  const result = spawnSync(
    process.execPath,
    [CHECKER, "--level", "fit", "--ledger", ledgerPath, boardPath],
    { encoding: "utf8" }
  );
  rmSync(directory, { recursive: true, force: true });
  assert.equal(result.status === 0 || result.status === 2, true, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function inventory() {
  return {
    id: "fit-test",
    title: "Fit Test",
    category: "Biology",
    thesis: "A thesis.",
    distinctions: [
      {
        id: "d1",
        name: "One",
        job: "Job one.",
        candidateTerms: ["alpha", "beta", "gamma"],
        anchor: { title: "A", url: "https://example.com" }
      },
      {
        id: "d2",
        name: "Two",
        job: "Job two.",
        candidateTerms: ["delta", "epsilon", "zeta"],
        anchor: { title: "B", url: "https://example.com" }
      }
    ],
    connections: [{
      distinctions: ["d1", "d2"],
      concept: "shared mechanism",
      because: "The same process spans both groupings."
    }],
    excluded: [{ item: "noise", reason: "out of scope" }],
    scope: { in: "test", out: "test", openQuestions: [] }
  };
}

function board(bridges) {
  return {
    id: "fit-test",
    title: "Fit Test",
    category: "Biology",
    clusters: [
      {
        name: "One",
        fact: "Fact one.",
        seeds: ["alpha", "beta"],
        floatingTerms: ["gamma"]
      },
      {
        name: "Two",
        fact: "Fact two.",
        seeds: ["delta", "epsilon"],
        floatingTerms: ["zeta"]
      }
    ],
    bridges
  };
}

function ledger(decisions) {
  return {
    inventoryId: "fit-test",
    inventoryTermCounts: [3, 3],
    boardTermCounts: [3, 3],
    decisions: [
      { type: "kept", distinction: "d1", cluster: "one", note: "3 terms" },
      { type: "kept", distinction: "d2", cluster: "two", note: "2 terms" },
      ...decisions
    ]
  };
}

export async function run() {
  const kept = runFit({
    inventory: inventory(),
    board: board([{
      term: "shared mechanism",
      clusters: ["one", "two"],
      fact: "Connects the two groupings."
    }]),
    ledger: ledger([])
  });
  assert.equal(kept.ok, true, JSON.stringify(kept.blocking));

  const dropped = runFit({
    inventory: inventory(),
    board: board([]),
    ledger: ledger([{
      type: "bridge-dropped",
      concept: "shared mechanism",
      reason: "The span is sequential, not a board relationship."
    }])
  });
  assert.equal(dropped.ok, true, JSON.stringify(dropped.blocking));

  const missing = runFit({
    inventory: inventory(),
    board: board([]),
    ledger: ledger([])
  });
  assert.equal(missing.ok, false);
  assert.ok(missing.blocking.some(gap => gap.id === "unaccounted-connection"));

  const extra = runFit({
    inventory: inventory(),
    board: board([
      {
        term: "shared mechanism",
        clusters: ["one", "two"],
        fact: "Kept."
      },
      {
        term: "invented glue",
        clusters: ["one", "two"],
        fact: "Should be ledgered."
      }
    ]),
    ledger: ledger([])
  });
  assert.equal(extra.ok, false);
  assert.ok(extra.blocking.some(gap => gap.id === "unaccounted-bridge"));

  const added = runFit({
    inventory: inventory(),
    board: board([
      {
        term: "shared mechanism",
        clusters: ["one", "two"],
        fact: "Kept."
      },
      {
        term: "later discovery",
        clusters: ["one", "two"],
        fact: "Found during fit."
      }
    ]),
    ledger: ledger([{
      type: "bridge-added",
      term: "later discovery",
      reason: "Sources named this span after inventory."
    }])
  });
  assert.equal(added.ok, true, JSON.stringify(added.blocking));
}
