#!/usr/bin/env node
// Single entry for split-board fit/complete. Emits a machine-readable contract
// so agents work one board per burst — via mcp-call by default (Codex-safe).
import { readFileSync } from "node:fs";
import { localDraftReviewUrl } from "../../../../modules/authoringDesignGuidance.js";
import { ensureAuthoringWorkspace } from "../../../../modules/authoringWorkspacePaths.js";
import { loadProjectEnv } from "../../../../modules/loadProjectEnv.js";

const SCRIPT = "node .agents/skills/author-puzzle/scripts/plan-split-boards.mjs";
const PASSES = ["fit", "complete", "board-review"];
const TRANSPORTS = ["mcp-call", "stdio"];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FORBIDDEN = [
  "Do not fit or complete more than one board in this burst",
  "Do not call registered MCP tools when mcpTransport is mcp-call",
  "Do not run get_authoring_guidance and get_authoring_schema in parallel",
  "Do not start the next board until humanNext is satisfied for this board",
  "Do not glob, find, or ripgrep the repo for puzzle content"
];

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  ${SCRIPT} --plan <authoring-data>/plans/<parent-id>-split-plan.json [flags]

Flags:
  --pass <fit|complete|board-review>   (default: fit)
  --board <board-id>                   Active board (default: first in plan order)
  --continue                           Next board after --board (or first if omitted)
  --transport <mcp-call|stdio>         (default: mcp-call)
  --dry-run                            Emit plan only; no MCP

Examples:
  ${SCRIPT} --plan .concept-clusters/authoring/plans/foo-split-plan.json --pass fit
  ${SCRIPT} --plan .concept-clusters/authoring/plans/foo-split-plan.json --pass complete --board board-a
  ${SCRIPT} --plan .concept-clusters/authoring/plans/foo-split-plan.json --pass complete --board board-a --continue`);
  process.exit(message ? 1 : 0);
}

function parseArgs(raw) {
  const values = { dryRun: false, transport: "mcp-call" };
  for (let index = 0; index < raw.length; index++) {
    const arg = raw[index];
    if (arg === "--help" || arg === "-h") usage();
    else if (arg === "--dry-run") values.dryRun = true;
    else if (arg === "--continue") values.continue = true;
    else if (["--plan", "--pass", "--board", "--transport"].includes(arg)) {
      const value = raw[++index];
      if (!value) usage(`${arg} requires a value.`);
      values[arg.slice(2)] = value;
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else usage(`Unexpected argument: ${arg}`);
  }
  return values;
}

function loadPlan(path) {
  if (!path) usage("--plan <split-plan.json> is required.");
  const plan = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(plan.boards) || !plan.boards.length) {
    throw new Error("Split plan boards[] is empty.");
  }
  return plan;
}

function boardOrder(plan) {
  const fromRelated = plan.relatedPuzzles?.order;
  if (Array.isArray(fromRelated) && fromRelated.length) {
    return fromRelated.filter(id => plan.boards.some(board => board.id === id));
  }
  return plan.boards.map(board => board.id);
}

function resolveBoard(plan, { board, continue: advance }) {
  const order = boardOrder(plan);
  if (!order.length) throw new Error("Split plan has no board ids.");

  if (board) {
    if (!ID_RE.test(board)) usage(`Invalid board id "${board}".`);
    if (!order.includes(board)) {
      throw new Error(`Board "${board}" is not in split plan order: ${order.join(", ")}`);
    }
    if (advance) {
      const index = order.indexOf(board);
      if (index < 0 || index >= order.length - 1) {
        throw new Error(`No board follows "${board}" in plan order.`);
      }
      return { id: order[index + 1], index: index + 1, order };
    }
    return { id: board, index: order.indexOf(board), order };
  }

  if (advance) {
    throw new Error("--continue requires --board <current-board-id>.");
  }
  return { id: order[0], index: 0, order };
}

function mcpCall(transport, tool, args = {}) {
  const argsJson = JSON.stringify(args);
  if (transport === "stdio") {
    return `Call MCP tool ${tool} sequentially with ${argsJson}`;
  }
  return `node tools/mcp-call.mjs ${tool} '${argsJson.replace(/'/g, "'\\''")}'`;
}

function fitSteps({ boardId, transport, inventoryPath, planPath, ledgerPath, draftPath, dryRun }) {
  return [
    `Read ${inventoryPath}, ${planPath}, and references/fit-pass.md for board "${boardId}" only`,
    `Write ${ledgerPath} before any MCP save`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_authoring_guidance", { phase: "core" }),
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_authoring_schema", { phase: "core" }),
    `Build ${draftPath} from inventory + plan for this board only (clusters/bridges; no notes or lenses)`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "create_puzzle_draft", {
      draft_id: boardId,
      document: `<from ${draftPath}>`
    }),
    `node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level fit ${draftPath} --ledger ${ledgerPath}`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "validate_puzzle_draft", { draft_id: boardId }),
    `node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record ${boardId} --authored`,
    "Emit stop-gate: Fit ready. Waiting on board review. STOP — do not start the next board."
  ];
}

function completeSteps({ boardId, transport, draftPath, dryRun }) {
  return [
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_puzzle_draft", { draft_id: boardId }),
    `Refresh revision; add puzzle info, termInfo, connector help, lenses for "${boardId}" only`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_authoring_guidance", { phase: "pedagogy" }),
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "save_puzzle_draft", {
      draft_id: boardId,
      expected_revision: "<from get_puzzle_draft>",
      document: `<merged draft from ${draftPath} or get_puzzle_draft>`
    }),
    `node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level complete ${draftPath}`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "validate_puzzle_draft", { draft_id: boardId }),
    `node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record ${boardId} --authored`,
    "Emit stop-gate: Validated. Waiting on /admin/drafts. STOP — do not start the next board."
  ];
}

function boardReviewSteps({ boardId, draftsUrl, ledgerPath }) {
  return [
    `Human reviews ${draftsUrl} and loss ledger ${ledgerPath}`,
    "Wait for human reply mapped from humanPrompt — do not call MCP until they approve or ask for revisions"
  ];
}

function boardMeta(plan, boardId) {
  const board = plan.boards.find(item => item.id === boardId);
  return board ? { id: board.id, title: board.title } : { id: boardId, title: boardId };
}

function buildHumanPrompt({ pass, active, boardOrder, nextBoard, draftsUrl, plan }) {
  const total = boardOrder.length;
  const boardNum = active.index + 1;
  const label = `"${active.title}" (board ${boardNum} of ${total})`;
  const nextTitle = nextBoard ? boardMeta(plan, nextBoard).title : null;

  if (pass === "fit") {
    const options = [
      {
        label: "Revise clusters, bridges, or the loss ledger on this board",
        accepts: ["revise", "change", "fix", "push back", "trim", "redo"]
      },
      {
        label: "Approve this board — open the drafts page to play it",
        accepts: ["approve", "looks good", "yes", "ok", "good", "approved"]
      }
    ];
    if (nextBoard) {
      options.push({
        label: `Fit the next board (${nextTitle || nextBoard})`,
        accepts: ["next board", "next", "fit next", "board 2", nextBoard]
      });
    }
    options.push({
      label: "Add notes and lenses (complete pass) for this board",
      accepts: ["complete", "notes", "lenses", "fill", "finish this board"]
    });
    return {
      headline: `${label} is fit. Review the grid and loss ledger.`,
      draftsUrl,
      question: "What would you like to do?",
      options,
      defaultReply: "A short reply like “looks good” or “next board” is enough — no special wording."
    };
  }

  if (pass === "complete") {
    const options = [
      {
        label: "Revise notes, lenses, or connector help on this board",
        accepts: ["revise", "change", "fix", "push back"]
      },
      {
        label: "Approve — open the drafts page to review copy",
        accepts: ["approve", "looks good", "yes", "ok", "good", "approved"]
      }
    ];
    if (nextBoard) {
      options.push({
        label: `Complete the next board (${nextTitle || nextBoard})`,
        accepts: ["next board", "next", "complete next", "board 2", nextBoard]
      });
    } else {
      options.push({
        label: "Open pull requests when ready",
        accepts: ["submit", "pr", "pull request", "ship", "publish"]
      });
    }
    return {
      headline: `${label} passed complete validation.`,
      draftsUrl,
      question: "What would you like to do?",
      options,
      defaultReply: "Say “next board”, “looks good”, or “open PR” — plain language is fine."
    };
  }

  return {
    headline: `Review ${label} on the drafts page.`,
    draftsUrl,
    question: "Approve the board, ask for revisions, or say what to do next?",
    options: [
      { label: "Revise this board", accepts: ["revise", "change", "fix"] },
      { label: "Approve and continue", accepts: ["approve", "yes", "looks good", "continue", "next"] }
    ],
    defaultReply: "Any short reply is fine."
  };
}

function buildHumanNext({ pass, active, nextBoard, planPath, draftPath, ledgerPath }) {
  const boardArg = `--board ${active.id}`;
  const cont = nextBoard ? ` --continue ${boardArg}` : "";
  if (pass === "fit") {
    return {
      onRevise: `Edit ${draftPath} and ${ledgerPath}; re-run fit checker. Stay on this board.`,
      onApprove: `Human reviewed drafts page. Wait for fit/complete/next choice.`,
      onNextBoard: nextBoard
        ? `Run plan-split-boards.mjs --plan ${planPath} --pass fit${cont}`
        : null,
      onComplete: `Run plan-split-boards.mjs --plan ${planPath} --pass complete ${boardArg}`,
      acceptsNaturalLanguage: true
    };
  }
  if (pass === "complete") {
    return {
      onRevise: `Edit ${draftPath}; re-run complete checker and validate.`,
      onApprove: `Human reviewed drafts page.`,
      onNextBoard: nextBoard
        ? `Run plan-split-boards.mjs --plan ${planPath} --pass complete${cont}`
        : null,
      onSubmit: "Opening a PR for this draft is a drafts-page button, not an MCP tool. Point them there.",
      acceptsNaturalLanguage: true
    };
  }
  return { acceptsNaturalLanguage: true };
}

function build() {
  const args = parseArgs(process.argv.slice(2));
  const pass = args.pass || "fit";
  if (!PASSES.includes(pass)) usage(`Unknown --pass "${pass}".`);
  if (!TRANSPORTS.includes(args.transport)) usage(`Unknown --transport "${args.transport}".`);

  const workspace = ensureAuthoringWorkspace();
  const plan = loadPlan(args.plan);
  const active = resolveBoard(plan, { board: args.board, continue: args.continue });
  const board = plan.boards.find(item => item.id === active.id);
  if (!board) throw new Error(`Board "${active.id}" missing from plan.boards[].`);

  const inventoryId = plan.inventoryId;
  if (!inventoryId || !ID_RE.test(inventoryId)) {
    throw new Error("Split plan needs inventoryId (kebab-case parent inventory id).");
  }
  const inventoryPath = workspace.inventoryFile(inventoryId);
  const planPath = args.plan;
  const ledgerPath = workspace.ledgerFile(active.id);
  const draftPath = workspace.workingDraftFile(active.id);
  const draftsUrl = `${localDraftReviewUrl()}/${active.id}`;

  const steps = pass === "fit"
    ? fitSteps({
      boardId: active.id,
      transport: args.transport,
      inventoryPath,
      planPath,
      ledgerPath,
      draftPath,
      dryRun: args.dryRun
    })
    : pass === "complete"
      ? completeSteps({
        boardId: active.id,
        transport: args.transport,
        draftPath,
        dryRun: args.dryRun
      })
      : boardReviewSteps({ boardId: active.id, draftsUrl, ledgerPath });

  const nextBoard = active.index < active.order.length - 1
    ? active.order[active.index + 1]
    : null;
  const humanPrompt = buildHumanPrompt({
    pass,
    active: { ...board, index: active.index },
    boardOrder: active.order,
    nextBoard,
    draftsUrl,
    plan
  });

  const payload = {
    invocation: {
      plan: planPath,
      pass,
      board: active.id,
      transport: args.transport,
      dryRun: !!args.dryRun
    },
    inventoryId,
    strategy: plan.strategy || null,
    seam: plan.seam || null,
    boardOrder: active.order,
    activeBoard: {
      ...board,
      index: active.index,
      pass
    },
    mcpTransport: args.transport,
    forbidden: FORBIDDEN,
    allowedReads: [
      inventoryPath,
      planPath,
      pass === "fit"
        ? ".agents/skills/author-puzzle/references/fit-pass.md"
        : ".agents/skills/author-puzzle/references/design-judgment.md",
      ledgerPath,
      ...(pass === "complete" ? [draftPath] : [])
    ],
    artifacts: {
      inventory: inventoryPath,
      splitPlan: planPath,
      ledger: ledgerPath,
      workingDraft: draftPath,
      draftsUrl
    },
    humanPrompt,
    humanNext: buildHumanNext({
      pass,
      active: board,
      nextBoard,
      planPath,
      draftPath,
      ledgerPath
    }),
    steps,
    stopAfter: pass === "board-review" ? "human-board-review" : "validate-and-pause",
    report: {
      fields: ["id", "title", "status", "revision", "draftsUrl"],
      closing: pass === "fit"
        ? "Fit ready. Waiting on board review."
        : pass === "complete"
          ? "Validated. Waiting on /admin/drafts."
          : "Waiting on board review."
    }
  };

  console.log(JSON.stringify(payload, null, 2));
}

try {
  loadProjectEnv();
  build();
} catch (error) {
  usage(error.message);
}
