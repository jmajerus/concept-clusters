#!/usr/bin/env node
// Single entry for split-board fit/complete. Emits a machine-readable contract
// so agents work one board per burst — native MCP when registered, otherwise
// via mcp-call by default (Codex-safe). Kilo's own backend markers select the
// native transport automatically; callers can still override explicitly.
import { readFileSync } from "node:fs";
import { localDraftReviewUrl } from "../../../../modules/authoringDesignGuidance.js";
import { ensureAuthoringWorkspace } from "../../../../modules/authoringWorkspacePaths.js";
import { loadProjectEnv } from "../../../../modules/loadProjectEnv.js";
import { isKiloCodeEnvironment } from "../../../../modules/mcpCallInvocation.js";

const SCRIPT = "node .agents/skills/author-puzzle/scripts/plan-split-boards.mjs";
const MCP_SERVER_NAME = "concept-clusters";
const PASSES = ["fit", "complete", "board-review"];
const TRANSPORTS = ["mcp-call", "stdio"];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FORBIDDEN = [
  "Do not fit or complete more than one board in this burst",
  "Do not call registered MCP tools when mcpTransport is mcp-call",
  "Do not run get_authoring_guidance and get_authoring_schema in parallel",
  "Do not present a human gate while another board remains in this pass",
  "Do not start notes or lenses until every board has been fitted and the human has approved the ledgers",
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
  --transport <mcp-call|stdio>         stdio = registered native MCP; default mcp-call (stdio in Kilo Code)
  --dry-run                            Emit plan only; no MCP

Examples:
  ${SCRIPT} --plan .concept-clusters/authoring/plans/foo-split-plan.json --pass fit
  ${SCRIPT} --plan .concept-clusters/authoring/plans/foo-split-plan.json --pass complete --board board-a
  ${SCRIPT} --plan .concept-clusters/authoring/plans/foo-split-plan.json --pass complete --board board-a --continue`);
  process.exit(message ? 1 : 0);
}

function parseArgs(raw, env = process.env) {
  const values = {
    dryRun: false,
    transport: isKiloCodeEnvironment(env) ? "stdio" : "mcp-call"
  };
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
  const fromPlan = plan.boardOrder;
  if (Array.isArray(fromPlan) && fromPlan.length) {
    return fromPlan.filter(id => plan.boards.some(board => board.id === id));
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

function mcpCall(transport, tool, args = {}, { kiloNative = false } = {}) {
  const argsJson = JSON.stringify(args);
  if (transport === "stdio") {
    const visibleTool = kiloNative ? `${MCP_SERVER_NAME}_${tool}` : tool;
    return `Call MCP tool ${visibleTool} sequentially with ${argsJson}`;
  }
  return `node tools/mcp-call.mjs ${tool} '${argsJson.replace(/'/g, "'\\''")}'`;
}

function plannerCommand(planPath, pass, boardId, transport, { advance = false } = {}) {
  const continueFlag = advance ? " --continue" : "";
  return `${SCRIPT} --plan ${planPath} --pass ${pass} --board ${boardId}${continueFlag} --transport ${transport}`;
}

function fitSteps({
  boardId, transport, kiloNative, inventoryPath, planPath, ledgerPath, draftPath, dryRun, nextBoard
}) {
  const steps = [
    `Read ${inventoryPath}, ${planPath}, and references/fit-pass.md for board "${boardId}" only`,
    `Write ${ledgerPath} before any MCP save`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_authoring_guidance", { phase: "core" }, { kiloNative }),
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_authoring_schema", { phase: "core" }, { kiloNative }),
    `Build ${draftPath} from inventory + plan for this board only (clusters/bridges; no notes or lenses)`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "create_puzzle_draft", {
      draft_id: boardId,
      document: `<from ${draftPath}>`
    }, { kiloNative }),
    `node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level fit ${draftPath} --ledger ${ledgerPath}`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "validate_puzzle_draft", { draft_id: boardId }, { kiloNative }),
    `node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record ${boardId} --authored`
  ];
  steps.push(nextBoard
    ? `Validated. In a new burst, run \`${plannerCommand(planPath, "fit", boardId, transport, { advance: true })}\`. Do not present a human gate. Do not add notes or lenses.`
    : "Emit stop-gate: Every board in this plan is fitted. Waiting on ledger review. STOP — do not start notes or lenses.");
  return steps;
}

function completeSteps({ boardId, transport, kiloNative, draftPath, dryRun, planPath, nextBoard }) {
  const steps = [
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_puzzle_draft", { draft_id: boardId }, { kiloNative }),
    `Refresh revision; add puzzle info, termInfo, bridge help, lenses for "${boardId}" only`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "get_authoring_guidance", { phase: "pedagogy" }, { kiloNative }),
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "save_puzzle_draft", {
      draft_id: boardId,
      expected_revision: "<from get_puzzle_draft>",
      document: `<merged draft from ${draftPath} or get_puzzle_draft>`
    }, { kiloNative }),
    `node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level complete ${draftPath}`,
    dryRun ? `(dry-run) skip MCP` : mcpCall(transport, "validate_puzzle_draft", { draft_id: boardId }, { kiloNative }),
    `node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record ${boardId} --authored`
  ];
  steps.push(nextBoard
    ? `Validated. In a new burst, run \`${plannerCommand(planPath, "complete", boardId, transport, { advance: true })}\`. Do not present a human gate.`
    : "Emit stop-gate: Every board passed complete validation. Waiting on /admin/drafts. STOP.");
  return steps;
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
    if (nextBoard) {
      return {
        presentGate: false,
        headline: `${label} is fit. Continue the fit pass on "${nextTitle || nextBoard}" before any review.`,
        draftsUrl,
        question: null,
        options: [],
        defaultReply: null
      };
    }
    return {
      presentGate: true,
      headline: total > 1
        ? "Every board is fitted. Review each grid and loss ledger."
        : `${label} is fit. Review the grid and loss ledger.`,
      draftsUrl,
      question: "What would you like to do?",
      options: [
        {
          label: "Revise a board's clusters, bridges, or loss ledger (name which board)",
          accepts: ["revise", "change", "fix", "push back", "trim", "redo"]
        },
        {
          label: "Approve — add notes and lenses, starting with the first board",
          accepts: ["approve", "looks good", "yes", "ok", "good", "approved", "complete", "notes", "lenses"]
        }
      ],
      defaultReply: "“Looks good” starts notes and lenses on the first board. Name a board to revise it."
    };
  }

  if (pass === "complete") {
    if (nextBoard) {
      return {
        presentGate: false,
        headline: `${label} passed complete validation. Continue the complete pass on "${nextTitle || nextBoard}" before any review.`,
        draftsUrl,
        question: null,
        options: [],
        defaultReply: null
      };
    }
    return {
      presentGate: true,
      headline: total > 1
        ? "Every board passed complete validation."
        : `${label} passed complete validation.`,
      draftsUrl,
      question: "What would you like to do?",
      options: [
        {
          label: "Revise notes, lenses, or bridge help (name which board)",
          accepts: ["revise", "change", "fix", "push back"]
        },
        {
          label: "Approve — open the drafts pages to review copy",
          accepts: ["approve", "looks good", "yes", "ok", "good", "approved"]
        },
        {
          label: "Open pull requests when ready",
          accepts: ["submit", "pr", "pull request", "ship", "publish"]
        }
      ],
      defaultReply: "“Looks good” opens the drafts pages. Name a board to revise it."
    };
  }

  return {
    presentGate: true,
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

function buildHumanNext({ pass, active, nextBoard, planPath, draftPath, ledgerPath, firstBoardId, transport }) {
  if (pass === "fit" && nextBoard) {
    return {
      presentGate: false,
      onValidated: plannerCommand(planPath, "fit", active.id, transport, { advance: true }),
      acceptsNaturalLanguage: false
    };
  }
  if (pass === "fit") {
    return {
      presentGate: true,
      onRevise: `Edit the named board's draft and ledger, re-run its fit, then continue the fit pass through any boards after it. This board's ledger is ${ledgerPath}.`,
      onApprove: `Run ${plannerCommand(planPath, "complete", firstBoardId, transport)}`,
      acceptsNaturalLanguage: true
    };
  }
  if (pass === "complete" && nextBoard) {
    return {
      presentGate: false,
      onValidated: plannerCommand(planPath, "complete", active.id, transport, { advance: true }),
      acceptsNaturalLanguage: false
    };
  }
  if (pass === "complete") {
    return {
      presentGate: true,
      onRevise: `Edit the named board's draft (${draftPath} is this board); re-run its complete pass, then continue the complete pass through any boards after it.`,
      onApprove: "Human reviews each board on its drafts page.",
      onSubmit: "Opening a PR for a draft is a drafts-page button, not an MCP tool. Point them there.",
      acceptsNaturalLanguage: true
    };
  }
  return { presentGate: true, acceptsNaturalLanguage: true };
}

function build() {
  const args = parseArgs(process.argv.slice(2));
  const pass = args.pass || "fit";
  if (!PASSES.includes(pass)) usage(`Unknown --pass "${pass}".`);
  if (!TRANSPORTS.includes(args.transport)) usage(`Unknown --transport "${args.transport}".`);

  const workspace = ensureAuthoringWorkspace();
  const plan = loadPlan(args.plan);
  const kiloNative = isKiloCodeEnvironment(process.env) && args.transport === "stdio";
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
  const nextBoard = active.index < active.order.length - 1
    ? active.order[active.index + 1]
    : null;

  const steps = pass === "fit"
    ? fitSteps({
      boardId: active.id,
      transport: args.transport,
      kiloNative,
      inventoryPath,
      planPath,
      ledgerPath,
      draftPath,
      dryRun: args.dryRun,
      nextBoard
    })
    : pass === "complete"
      ? completeSteps({
        boardId: active.id,
        transport: args.transport,
        kiloNative,
        draftPath,
        dryRun: args.dryRun,
        planPath,
        nextBoard
      })
      : boardReviewSteps({ boardId: active.id, draftsUrl, ledgerPath });

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
      ledgerPath,
      firstBoardId: active.order[0],
      transport: args.transport
    }),
    steps,
    presentGate: humanPrompt.presentGate !== false,
    stopAfter: pass === "board-review"
      ? "human-board-review"
      : humanPrompt.presentGate === false
        ? "continue-same-pass"
        : "validate-and-pause",
    report: {
      fields: ["id", "title", "status", "revision", "draftsUrl"],
      closing: humanPrompt.presentGate === false
        ? (pass === "complete"
          ? "Validated. Continue the complete pass. Do not present a human gate."
          : "Fit ready. Continue the fit pass. Do not present a human gate.")
        : pass === "fit"
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
