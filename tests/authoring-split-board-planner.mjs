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
  assert.ok(plan.forbidden.some(line => line.includes("notes or lenses")));
  assert.ok(plan.steps.some(step => step.includes("check-completeness.mjs --level fit")));
  assert.equal(plan.presentGate, false);
  assert.equal(plan.humanPrompt.presentGate, false);
  assert.equal(plan.stopAfter, "continue-same-pass");
  assert.match(plan.report.closing, /Continue the fit pass/);
  assert.doesNotMatch(plan.report.closing, /Waiting on board review/);
  assert.equal(plan.humanPrompt.options.length, 0);
  assert.ok(plan.steps.at(-1).includes("--pass fit"));
  assert.ok(plan.steps.at(-1).includes("--continue"));
  assert.ok(plan.humanNext.onValidated.includes("--continue"));
  assert.ok(plan.humanNext.onValidated.includes("--transport mcp-call"));
  assert.ok(plan.steps.at(-1).includes("--transport mcp-call"));
  assert.ok(plan.artifacts.ledger.includes("ledgers"));
  assert.doesNotMatch(plan.artifacts.inventory, /\/tmp\//);
  assert.ok(plan.humanPrompt.draftsUrl.includes("/admin/drafts/"));
  assert.equal(plan.humanNext.acceptsNaturalLanguage, false);

  const lastFit = runPlanner([
    "--plan", EXAMPLE_PLAN,
    "--pass", "fit",
    "--board", "light-wave-and-particle-evidence",
    "--continue",
    "--dry-run"
  ]);
  assert.equal(lastFit.activeBoard.id, "matter-waves-and-quantum-outcomes");
  assert.equal(lastFit.presentGate, true);
  assert.equal(lastFit.stopAfter, "validate-and-pause");
  assert.ok(lastFit.humanPrompt.options.length >= 2);
  assert.ok(lastFit.humanPrompt.options.some(option => /notes and lenses/i.test(option.label)));
  assert.ok(!lastFit.humanPrompt.options.some(option => /fit the next/i.test(option.label)));
  assert.ok(lastFit.humanNext.onApprove.includes("--pass complete"));
  assert.ok(lastFit.humanNext.onApprove.includes("light-wave-and-particle-evidence"));
  assert.ok(lastFit.humanNext.onApprove.includes("--transport mcp-call"));
  assert.match(lastFit.report.closing, /Waiting on board review/);
  assert.equal(lastFit.humanNext.acceptsNaturalLanguage, true);

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
  assert.ok(nativeMcp.humanNext.onValidated.includes("--transport stdio"));
  assert.ok(nativeMcp.steps.at(-1).includes("--transport stdio"));
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
  assert.equal(second.presentGate, true);
  assert.ok(second.steps.at(-1).includes("Every board passed complete validation"));

  const firstComplete = runPlanner([
    "--plan", EXAMPLE_PLAN,
    "--pass", "complete",
    "--dry-run"
  ]);
  assert.equal(firstComplete.activeBoard.id, "light-wave-and-particle-evidence");
  assert.equal(firstComplete.presentGate, false);
  assert.match(firstComplete.report.closing, /Continue the complete pass/);
  assert.ok(firstComplete.humanNext.onValidated.includes("--transport mcp-call"));
  assert.ok(firstComplete.steps.at(-1).includes("--pass complete"));
  assert.ok(firstComplete.humanNext.onValidated.includes("--continue"));
}
