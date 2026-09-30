#!/usr/bin/env node
// Copy an approved split plan onto the existing inventory: set splitPlanPath
// and move each answered open question to resolvedQuestions. The plan file is
// written first; this rewrites the inventory in one pass. Do not patch that
// file by hand, and do not invoke apply_patch — this repository has no such
// executable.
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .agents/skills/author-puzzle/scripts/record-split-plan.mjs \\
    --inventory <inventory.json> --plan <split-plan.json>

Reads resolvedQuestions from the plan and updates the inventory in place.
Question text must match scope.openQuestions exactly (or already be recorded).
Exit 0 writes the inventory. Exit 2 leaves it unchanged when a question does
not match; fix the plan text and re-run. Do not patch the inventory.`);
  process.exit(message ? 1 : 0);
}

function trimmed(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) usage();
  let inventoryPath = null;
  let planPath = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--inventory") {
      inventoryPath = argv[++i];
      if (!inventoryPath) usage("--inventory requires a path.");
    } else if (arg === "--plan") {
      planPath = argv[++i];
      if (!planPath) usage("--plan requires a path.");
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else usage(`Unexpected argument: ${arg}`);
  }
  if (!inventoryPath || !planPath) usage("--inventory and --plan are required.");
  return { inventoryPath, planPath };
}

function readJson(path, label) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error) {
    usage(`Could not read ${label} at ${path}: ${error.message}`);
  }
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      usage(`${label} at ${path} must be a JSON object.`);
    }
    return value;
  } catch (error) {
    usage(`${label} at ${path} is not valid JSON: ${error.message}`);
  }
}

export function canonicalSplitPlanPath(inventory, planPath) {
  const base = basename(planPath);
  if (trimmed(inventory.id) && base === `${inventory.id.trim()}-split-plan.json`) {
    return `plans/${inventory.id.trim()}-split-plan.json`;
  }
  const normalized = planPath.split("\\").join("/");
  const marker = normalized.lastIndexOf("plans/");
  if (marker !== -1) return normalized.slice(marker);
  return `plans/${base}`;
}

export function applySplitPlan(inventory, plan, { planPath }) {
  const next = structuredClone(inventory);
  const resolutions = Array.isArray(plan.resolvedQuestions) ? plan.resolvedQuestions : [];
  const open = Array.isArray(next.scope?.openQuestions) ? next.scope.openQuestions : [];
  const resolved = Array.isArray(next.resolvedQuestions) ? [...next.resolvedQuestions] : [];
  const openKeys = new Set(open.map(trimmed).filter(Boolean));
  const resolvedIndex = new Map();
  resolved.forEach((entry, index) => {
    const key = trimmed(entry?.question);
    if (key) resolvedIndex.set(key, index);
  });

  const unmatched = [];
  const applied = [];
  for (const [index, entry] of resolutions.entries()) {
    const question = trimmed(entry?.question);
    const resolution = trimmed(entry?.resolution);
    if (!question || !resolution) {
      return {
        ok: false,
        code: "invalid-resolution",
        message: `resolvedQuestions[${index}] needs question and resolution.`
      };
    }
    if (resolvedIndex.has(question)) {
      const prior = resolved[resolvedIndex.get(question)];
      resolved[resolvedIndex.get(question)] = {
        ...prior,
        question: trimmed(prior.question) || question,
        resolution
      };
      openKeys.delete(question);
      applied.push(question);
      continue;
    }
    if (!openKeys.has(question)) {
      unmatched.push(question);
      continue;
    }
    resolved.push({ question, resolution });
    resolvedIndex.set(question, resolved.length - 1);
    openKeys.delete(question);
    applied.push(question);
  }

  if (unmatched.length) {
    return {
      ok: false,
      code: "question-mismatch",
      message: "A plan resolution does not match an open or already-recorded inventory question. Edit the plan's question text to the exact scope.openQuestions string and re-run. Do not patch the inventory, and do not invoke apply_patch.",
      unmatched,
      openQuestions: open.filter(question => openKeys.has(trimmed(question)))
    };
  }

  next.splitPlanPath = canonicalSplitPlanPath(next, planPath);
  if (next.scope && Array.isArray(next.scope.openQuestions)) {
    next.scope.openQuestions = open.filter(question => openKeys.has(trimmed(question)));
  }
  if (applied.length || Array.isArray(inventory.resolvedQuestions)) {
    next.resolvedQuestions = resolved;
  }
  return {
    ok: true,
    inventory: next,
    applied,
    openQuestions: next.scope?.openQuestions || []
  };
}

function writeJsonAtomic(path, value) {
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  const temp = join(dirname(path), `.${basename(path)}.${randomBytes(4).toString("hex")}.tmp`);
  writeFileSync(temp, payload);
  renameSync(temp, path);
}

function fail(payload, code) {
  console.log(JSON.stringify({ ok: false, ...payload }, null, 2));
  process.exit(code);
}

function main() {
  const { inventoryPath, planPath } = parseArgs(process.argv.slice(2));
  const inventory = readJson(inventoryPath, "inventory");
  const plan = readJson(planPath, "split plan");
  const inventoryId = trimmed(inventory.id);
  const planInventoryId = trimmed(plan.inventoryId);
  if (inventoryId && planInventoryId && inventoryId !== planInventoryId) {
    fail({
      code: "inventory-mismatch",
      message: `Split plan inventoryId "${planInventoryId}" does not match inventory id "${inventoryId}".`
    }, 1);
  }

  const applied = applySplitPlan(inventory, plan, { planPath });
  if (!applied.ok) fail(applied, applied.code === "question-mismatch" ? 2 : 1);

  writeJsonAtomic(inventoryPath, applied.inventory);
  console.log(JSON.stringify({
    ok: true,
    inventory: inventoryPath,
    plan: planPath,
    splitPlanPath: applied.inventory.splitPlanPath,
    resolved: applied.applied,
    openQuestions: applied.openQuestions
  }, null, 2));
}

const invokedPath = process.argv[1] ? process.argv[1].split("\\").join("/") : "";
if (invokedPath.endsWith("record-split-plan.mjs")) main();
