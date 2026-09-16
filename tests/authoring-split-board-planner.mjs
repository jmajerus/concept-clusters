import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const name = "Authoring split-board planner: one board per burst";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLANNER = ".agents/skills/author-puzzle/scripts/plan-split-boards.mjs";
const EXAMPLE_PLAN = ".agents/skills/author-puzzle/references/split-plan-example.json";
const KILO_MARKER_KEYS = [
  "KILO_APP_NAME",
  "KILO_APP_VERSION",
  "KILOCODE_FEATURE",
  "KILOCODE_VERSION",
  "KILO_CLIENT"
];

function runPlanner(args, env = {}) {
  const childEnv = { ...process.env };
  for (const key of KILO_MARKER_KEYS) delete childEnv[key];
  Object.assign(childEnv, env);
  const result = spawnSync(process.execPath, [PLANNER, ...args], {
    encoding: "utf8",
    cwd: ROOT,
    env: childEnv
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

export async function run() {
  const examplePlan = JSON.parse(readFileSync(join(ROOT, EXAMPLE_PLAN), "utf8"));
  assert.deepEqual(examplePlan.boardOrder, [
    "light-wave-and-particle-evidence",
    "matter-waves-and-quantum-outcomes"
  ]);
  assert.equal(examplePlan.relatedPuzzles.order, undefined);

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

  const kiloNative = runPlanner([
    "--plan", EXAMPLE_PLAN,
    "--pass", "fit"
  ], {
    KILO_APP_NAME: "kilo-code",
    KILO_APP_VERSION: "7.6.2",
    KILOCODE_FEATURE: "vscode-extension"
  });
  assert.equal(kiloNative.mcpTransport, "stdio");
  assert.ok(
    kiloNative.steps.some(step => step.startsWith("Call MCP tool concept-clusters_get_authoring_guidance sequentially")),
    "Kilo's project environment should select native MCP transport by default"
  );
  assert.ok(
    kiloNative.steps.some(step => step.startsWith("Call MCP tool concept-clusters_create_puzzle_draft sequentially")),
    "Kilo's native planner steps should use the server-namespaced tool names"
  );
  assert.ok(
    !kiloNative.steps.some(step => step.startsWith("Call MCP tool get_authoring_guidance sequentially")),
    "Kilo's native planner steps should not emit bare tool names"
  );
  const kiloMcpSteps = kiloNative.steps.filter(step => step.startsWith("Call MCP tool "));
  assert.ok(kiloMcpSteps.length > 0);
  assert.ok(
    kiloMcpSteps.every(step => step.startsWith("Call MCP tool concept-clusters_")),
    "every Kilo native MCP step should use a server-namespaced tool name"
  );

  const nativeMcp = runPlanner([
    "--plan", EXAMPLE_PLAN,
    "--pass", "fit",
    "--transport", "stdio"
  ]);
  assert.equal(nativeMcp.mcpTransport, "stdio");
  assert.ok(
    nativeMcp.steps.some(step => step.startsWith("Call MCP tool get_authoring_guidance sequentially")),
    "native-MCP transport must emit direct sequential tool calls"
  );

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
