import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const name = "Authoring split-board planner: one board per burst";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLANNER = ".agents/skills/author-puzzle/scripts/plan-split-boards.mjs";
const EXAMPLE_PLAN = ".agents/skills/author-puzzle/references/split-plan-example.json";

function runPlanner(args) {
  const result = spawnSync(process.execPath, [PLANNER, ...args], {
    encoding: "utf8",
    cwd: ROOT
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

export async function run() {
  const plan = runPlanner([
    "--plan", EXAMPLE_PLAN,
    "--pass", "fit",
    "--dry-run"
  ]);
  assert.equal(plan.activeBoard.id, "light-wave-and-particle-evidence");
  assert.equal(plan.mcpTransport, "mcp-call");
  assert.ok(plan.forbidden.some(line => line.includes("one board")));
  assert.ok(plan.steps.some(step => step.includes("check-completeness.mjs --level fit")));
  assert.ok(plan.humanPrompt?.options?.length >= 2);
  assert.ok(plan.artifacts.ledger.includes("ledgers"));
  assert.doesNotMatch(plan.artifacts.inventory, /\/tmp\//);
  assert.ok(plan.humanPrompt.draftsUrl.includes("/admin/drafts/"));
  assert.ok(plan.humanPrompt.defaultReply);
  assert.equal(plan.humanNext.acceptsNaturalLanguage, true);

  const second = runPlanner([
    "--plan", EXAMPLE_PLAN,
    "--pass", "complete",
    "--board", "light-wave-and-particle-evidence",
    "--continue",
    "--dry-run"
  ]);
  assert.equal(second.activeBoard.id, "matter-waves-and-quantum-outcomes");
  assert.equal(second.invocation.pass, "complete");
}
