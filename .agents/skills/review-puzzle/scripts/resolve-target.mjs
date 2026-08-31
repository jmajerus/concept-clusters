#!/usr/bin/env node
// Resolve named review targets before any MCP or file thrash.
// Prints a machine-readable plan. Non-zero exit only on bad usage.
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PUZZLES } from "../../../../puzzles/index.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const CONTENT_DIR = join(ROOT, "content/puzzles");
const PUZZLES_DIR = join(ROOT, "puzzles");
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .agents/skills/review-puzzle/scripts/resolve-target.mjs <id> [<id> ...]
       Cap: 3 ids. Run this once before loading anything else.`);
  process.exit(message ? 1 : 0);
}

function findJsModule(id) {
  const entries = readdirSync(PUZZLES_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const candidate = join(PUZZLES_DIR, entry.name, `${id}.js`);
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return `puzzles/${entry.name}/${id}.js`;
    }
  }
  return null;
}

function resolveOne(id) {
  if (!ID_RE.test(id)) {
    return {
      id,
      ok: false,
      error: "invalid_id",
      message: `Id "${id}" is not a kebab-case puzzle id.`
    };
  }

  const canonicalRel = `content/puzzles/${id}.ccpuzzle.json`;
  const canonicalAbs = join(CONTENT_DIR, `${id}.ccpuzzle.json`);
  const hasCanonical = existsSync(canonicalAbs);
  const jsModule = findJsModule(id);
  const published = PUZZLES.some((puzzle) => puzzle?.id === id);

  /** @type {"existing-draft"|"canonical-file"|"js-export"|"missing"} */
  let source;
  /** @type {string[]} */
  const steps = [];
  /** @type {string[]} */
  const forbidden = [
    "Do not run suggest-review.mjs to replace this id",
    "Do not load or review any other puzzle id",
    "Do not glob, find, or ripgrep the repo for this id",
    "Do not read docs/, modules/, tools/, tests/, or unrelated puzzles",
    "Do not call list_puzzles or list_categories to browse",
    "Do not create a blank blueprint or invent a substitute puzzle"
  ];

  if (hasCanonical || published || jsModule) {
    // Still prefer an existing D1 draft when present (may be ahead of main).
    source = hasCanonical ? "canonical-file" : jsModule ? "js-export" : "published-mcp";
    steps.push(`Call get_puzzle_draft with draft_id="${id}"`);
    steps.push(
      "If that returns a draft: use it as the working document (do not create_puzzle_draft; do not overwrite from an older published copy without reading the draft first)"
    );
    if (hasCanonical) {
      steps.push(
        `If get_puzzle_draft says not found: create_puzzle_draft with draft_id="${id}" seeded from ${canonicalRel} only`
      );
    } else if (jsModule || published) {
      steps.push(
        `If get_puzzle_draft says not found: npm run content:export -- ${id} --output - (or get_puzzle puzzle_id="${id}"), then create_puzzle_draft with that document (draft_id="${id}")`
      );
    }
  } else {
    source = "existing-draft";
    steps.push(`Call get_puzzle_draft with draft_id="${id}"`);
    steps.push(
      "If found: continue the design-judgment review on that draft (status may be draft or submitted; an open PR is fine)"
    );
    steps.push(
      `If not found: call list_puzzle_drafts once and look for draftId="${id}" only — then get_puzzle_draft if listed`
    );
    steps.push(
      "If still not found: ABORT. Tell the user the id is neither published nor in D1 drafts. Do not continue."
    );
  }

  return {
    id,
    ok: true,
    source,
    published,
    files: {
      canonical: hasCanonical ? canonicalRel : null,
      jsModule
    },
    steps,
    forbidden,
    abortMessage:
      `Target "${id}" could not be loaded. Stop immediately. Do not substitute another puzzle.`
  };
}

export function resolveTargets(ids, { namedByUser = true, cap = 3 } = {}) {
  if (!ids.length) {
    throw new Error("At least one puzzle id is required.");
  }
  if (ids.length > cap) {
    throw new Error(`Cap is ${cap} ids per invocation.`);
  }
  const targets = ids.map(resolveOne);
  return {
    namedByUser,
    count: targets.length,
    targets,
    hardRules: [
      "These ids are locked. Never replace them with suggest-review picks.",
      "Echo named ids/titles verbatim; prove with get_puzzle_draft (or human-supplied publication_request_id / PR URL) before any PR review-loop tool.",
      "Unproven names are ABORT — treat as chat-memory contamination, not a search problem.",
      "Fail closed: if a target cannot be loaded in the steps above, abort that id and report why.",
      "Load budget: at most the listed MCP/file steps per id. No exploratory searches.",
      "Load gate: after the first id is loaded (or aborted), end the turn. Do not start design judgment, guidance, edits, or validate until the human says continue.",
      "If the user said load-only / smoke / dry load, the load gate is the entire task.",
      "One puzzle at a time. Pause after each id's validate + drafts URL.",
      "If the user wanted GitHub production PR review (checks/comments), say so and call get_workflow_guidance topic=pull-request-review — do not invent a different corpus review target. Play unpublished boards on the LAN checkout after Install."
    ]
  };
}

function isMain() {
  try {
    return resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
  } catch {
    return false;
  }
}

if (isMain()) {
  const ids = process.argv.slice(2).filter((arg) => {
    if (arg === "--help" || arg === "-h") usage();
    if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    return true;
  });
  try {
    const plan = resolveTargets(ids);
    console.log(JSON.stringify(plan, null, 2));
    if (plan.targets.some((t) => !t.ok)) process.exit(1);
  } catch (error) {
    usage(error.message);
  }
}
