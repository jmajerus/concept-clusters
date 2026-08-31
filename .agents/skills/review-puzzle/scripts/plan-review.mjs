#!/usr/bin/env node
// Single entry for /review-puzzle. Maps flags to a machine-readable agent
// contract. The skill tells the model: run this once, then obey the JSON.
import { resolveTargets } from "./resolve-target.mjs";
import { runSuggest } from "./suggest-review.mjs";
import { localDraftReviewUrl } from "../../../../modules/authoringDesignGuidance.js";
import { loadProjectEnv } from "../../../../modules/loadProjectEnv.js";

const SCRIPT = "node .agents/skills/review-puzzle/scripts/plan-review.mjs";
const MODES = ["load", "pick", "due", "review", "record", "pr"];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FORBIDDEN = [
  "Do not glob, find, or ripgrep the repo",
  "Do not read docs/, modules/, tools/, tests/, or unrelated puzzles",
  "Do not call list_puzzles or list_categories to browse",
  "Do not create a blank blueprint or invent a substitute puzzle",
  "Do not invent a puzzle id/title from chat memory or an earlier authoring brainstorm",
  "Do not call get_review_feedback or other PR review-loop tools until the named id is proven",
  "Do not run suggest-review.mjs or resolve-target.mjs except as this plan already folded their results in",
  "Do not exceed mcpBudget or allowedMcp"
];

const PROVE_BEFORE_REVIEW = [
  "Echo each named id/title verbatim before MCP writes or review-loop tools",
  "Proof = get_puzzle_draft matching that draftId, or a human-supplied publication_request_id / PR URL for that same id",
  "Unproven names are ABORT (treat as chat-memory contamination); ask for drafts URL / PR URL / publication_request_id",
  "Never substitute a plausible nearby title"
];

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  ${SCRIPT} [id ...] [flags]

Modes (--mode, default: load if ids else pick):
  load     Resolve + MCP-load the first id, then stop (load gate)
  pick     Choose due ids (optional --category/--subcategory/--count)
  due      Print the due map; write nothing
  review   Design-judgment pass on already-loaded ids (requires ids)
  record   Write review-log.json (--record <id> [--unchanged|--authored])
  pr       GitHub PR gameplay review loop, not a board pass

Flags:
  --mode <${MODES.join("|")}>
  --gate / --no-gate     Stop after load (default: on for load/pick)
  --dry-run              Plan only; no MCP, no log writes
  --category <slug>      --subcategory <id>  --count <n>
  --record <id>          --unchanged  --authored
  --budget <n>           Max MCP calls per id (default 3)
  --workflow board|pr    Alias: --workflow pr == --mode pr`);
  process.exit(message ? 1 : 0);
}

function parseArgs(raw) {
  const values = { ids: [], gate: null, dryRun: false };
  for (let index = 0; index < raw.length; index++) {
    const arg = raw[index];
    if (arg === "--help" || arg === "-h") usage();
    else if (arg === "--gate") values.gate = true;
    else if (arg === "--no-gate") values.gate = false;
    else if (arg === "--dry-run") values.dryRun = true;
    else if (arg === "--unchanged") values.unchanged = true;
    else if (arg === "--authored") values.authored = true;
    else if (arg === "--continue") {
      values.mode = "review";
      values.gate = false;
    }
    else if (["--mode", "--workflow", "--category", "--subcategory", "--count", "--record", "--budget"].includes(arg)) {
      const value = raw[++index];
      if (!value) usage(`${arg} requires a value.`);
      values[arg.slice(2)] = value;
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else values.ids.push(arg);
  }
  return values;
}

function inferMode(args) {
  if (args.workflow === "pr") return "pr";
  if (args.record) return "record";
  if (args.mode) return args.mode;
  if (args.ids.length) return "load";
  return "pick";
}

function loadReport() {
  return {
    fields: ["id", "title", "status", "revision", "draftsUrl"],
    optional: ["prUrl"],
    closing: "Loaded. Waiting for continue.",
    draftsUrl: `${localDraftReviewUrl()}/<id>`
  };
}

function allowedMcpFor(mode) {
  if (mode === "load" || mode === "pick") {
    return ["get_puzzle_draft", "list_puzzle_drafts", "get_puzzle", "create_puzzle_draft"];
  }
  if (mode === "review") {
    return [
      "get_puzzle_draft",
      "get_authoring_guidance",
      "save_puzzle_draft",
      "validate_puzzle_draft"
    ];
  }
  if (mode === "pr") {
    return [
      "get_workflow_guidance",
      "get_review_feedback",
      "apply_review_suggestion",
      "reply_to_review_comment",
      "resolve_review_feedback",
      "sync_review_changes_to_draft",
      "complete_review_round",
      "prepare_human_review_handoff",
      "reset_review_circuit"
    ];
  }
  return [];
}

function readsFor(mode, gate) {
  if (mode === "pr") return [];
  if (mode === "review" && !gate) {
    return [
      ".agents/skills/author-puzzle/references/design-judgment.md",
      "docs/SIMPLIFIED-PUZZLE-FORMAT.md (one field only, if unknown)"
    ];
  }
  return [];
}

function planFromTargets(targets, { namedByUser, mode, gate, dryRun, budget }) {
  const first = targets[0];
  const stopAfter = gate ? "load-report" : mode === "review" ? "validate-and-pause" : "load-report";
  return {
    chunk: targets.map((t, index) => ({
      ...t,
      active: index === 0,
      mcpBudget: budget,
      pauseAfter: index === 0
    })),
    namedByUser,
    firstId: first?.id || null,
    stopAfter: dryRun ? "plan" : stopAfter,
    load: first?.steps || [],
    abortMessage: first?.abortMessage
  };
}

function build() {
  const args = parseArgs(process.argv.slice(2));
  const mode = inferMode(args);
  if (!MODES.includes(mode)) usage(`Unknown --mode "${mode}".`);
  if (args.workflow && args.workflow !== "board" && args.workflow !== "pr") {
    usage(`Unknown --workflow "${args.workflow}". Use board or pr.`);
  }
  const budget = args.budget ? Number(args.budget) : 3;
  if (!Number.isInteger(budget) || budget < 1) usage("--budget must be a positive integer.");

  const workflow = mode === "pr" ? "pr" : "board";
  let gate = args.gate;
  if (gate == null) {
    gate = mode === "load";
  }
  if (mode === "due" || mode === "record" || mode === "pr") gate = false;
  if (args.dryRun && (mode === "load" || mode === "pick" || mode === "review")) {
    // Dry run never calls MCP.
  }

  const invocation = {
    ids: args.ids,
    mode,
    workflow,
    gate,
    dryRun: !!args.dryRun,
    category: args.category || null,
    subcategory: args.subcategory || null,
    count: args.count ? Number(args.count) : (mode === "pick" ? 3 : null),
    record: args.record || null,
    budget
  };

  const base = {
    invocation,
    mode,
    workflow,
    gate,
    dryRun: !!args.dryRun,
    forbidden: FORBIDDEN,
    proveBeforeReview: PROVE_BEFORE_REVIEW,
    allowedMcp: args.dryRun ? [] : allowedMcpFor(mode),
    allowedReads: readsFor(mode, gate),
    humanNext: null
  };

  if (mode === "record") {
    const recorded = runSuggest({
      record: args.record || args.ids[0],
      unchanged: args.unchanged,
      authored: args.authored,
      dryRun: args.dryRun
    });
    return {
      ...base,
      stopAfter: "record",
      record: recorded,
      steps: args.dryRun
        ? ["Show the log entry. Do not write."]
        : ["Log written. Do not continue into another puzzle unless asked."]
    };
  }

  if (mode === "due") {
    const due = runSuggest({
      due: true,
      category: args.category,
      subcategory: args.subcategory,
      dryRun: args.dryRun
    });
    return {
      ...base,
      stopAfter: "due-map",
      due,
      steps: ["Print the due summary. Do not load a draft or pick a substitute."]
    };
  }

  if (mode === "pr") {
    const ids = args.ids;
    if (!ids.length) {
      throw new Error("--mode pr requires the puzzle id (or say continue on a loaded id).");
    }
    if (ids.some((id) => !ID_RE.test(id))) {
      throw new Error(`Invalid id in ${JSON.stringify(ids)}. Use kebab-case.`);
    }
    const resolved = resolveTargets(ids, { namedByUser: true });
    const first = resolved.targets[0];
    return {
      ...base,
      chunk: resolved.targets.map((t, index) => ({ ...t, active: index === 0 })),
      namedByUser: true,
      firstId: first?.id || null,
      stopAfter: "pr-loop",
      allowedMcp: args.dryRun
        ? []
        : ["get_puzzle_draft", "list_puzzle_drafts", ...allowedMcpFor("pr")],
      steps: args.dryRun
        ? ["Show this plan. Do not call MCP."]
        : [
            `Echo verbatim: ${ids.join(", ")}`,
            `PROVE: get_puzzle_draft draft_id="${ids[0]}" (exact match required)`,
            "If not found: one list_puzzle_drafts lookup for that draftId only — still missing → ABORT (unproven / likely chat memory). Ask for drafts URL, PR URL, or publication_request_id",
            "Only after proof: get_workflow_guidance topic=\"pull-request-review\"",
            "Call get_review_feedback only with the publication_request_id for that proven draft/PR",
            "Do not start a design-judgment board pass",
            "Do not substitute a different puzzle"
          ],
      abortMessage:
        first?.abortMessage
        || `Target "${ids[0]}" is unproven. Stop. Do not invent another puzzle.`,
      report: {
        closing: "PR review loop only after proof. Do not review a different id."
      }
    };
  }

  if (mode === "pick") {
    const picked = runSuggest({
      category: args.category,
      subcategory: args.subcategory,
      count: args.count,
      dryRun: args.dryRun
    });
    const pickIds = (picked.picks || []).map((p) => p.id);
    if (args.dryRun || !pickIds.length || gate !== true) {
      return {
        ...base,
        stopAfter: "picks",
        picks: picked,
        steps: [
          "State the picks in one sentence",
          "Stop. Do not load a draft until the human names an id or says continue"
        ],
        humanNext: pickIds.length
          ? `Say continue to load ${pickIds[0]}, or name ids explicitly`
          : null
      };
    }
    const resolved = resolveTargets(pickIds, { namedByUser: false });
    const fromTargets = planFromTargets(resolved.targets, {
      namedByUser: false,
      mode: "load",
      gate: true,
      dryRun: false,
      budget
    });
    return {
      ...base,
      mode: "load",
      picks: picked,
      ...fromTargets,
      allowedMcp: allowedMcpFor("load"),
      steps: [
        `Picks are locked: ${pickIds.join(", ")}`,
        ...fromTargets.load,
        "Then emit the load-gate report and STOP"
      ],
      report: loadReport(),
      humanNext: `Say continue to review ${fromTargets.firstId}`
    };
  }

  if (mode === "load" || mode === "review") {
    if (!args.ids.length) {
      throw new Error(`--mode ${mode} requires one to three kebab-case puzzle ids.`);
    }
    if (args.ids.some((id) => !ID_RE.test(id))) {
      throw new Error(`Invalid id in ${JSON.stringify(args.ids)}. Use kebab-case.`);
    }
    const resolved = resolveTargets(args.ids, { namedByUser: true });
    const fromTargets = planFromTargets(resolved.targets, {
      namedByUser: true,
      mode,
      gate: mode === "load" ? true : gate,
      dryRun: args.dryRun,
      budget
    });
    if (args.dryRun) {
      return {
        ...base,
        ...fromTargets,
        steps: ["Show this plan. Do not call MCP."],
        report: loadReport()
      };
    }
    if (mode === "load" || gate) {
      return {
        ...base,
        gate: true,
        ...fromTargets,
        stopAfter: "load-report",
        allowedMcp: allowedMcpFor("load"),
        allowedReads: [],
        steps: [
          `Echo verbatim / ids locked: ${args.ids.join(", ")}`,
          ...fromTargets.load,
          "If unproven after those steps: ABORT (treat as chat-memory contamination). Do not invent a substitute title",
          "Emit the load-gate report and STOP. Do not read design judgment yet."
        ],
        report: loadReport(),
        humanNext: `Say continue to review ${fromTargets.firstId}`
      };
    }
    return {
      ...base,
      gate: false,
      ...fromTargets,
      stopAfter: "validate-and-pause",
      allowedMcp: allowedMcpFor("review"),
      steps: [
        `get_puzzle_draft draft_id="${fromTargets.firstId}" (already loaded; refresh before save)`,
        `get_authoring_guidance phase="review" (pedagogy only if lenses/intro need work)`,
        "Apply the board checklist on this document only",
        "validate_puzzle_draft; fix errors",
        `node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record ${fromTargets.firstId} [--unchanged]`,
        "Give the drafts URL. Do not submit_puzzle_for_publication. STOP."
      ],
      report: {
        ...loadReport(),
        closing: "Validated. Waiting on /admin/drafts."
      },
      humanNext: "Open the PR from the drafts page, or say continue for the next id"
    };
  }

  throw new Error(`Unhandled mode "${mode}".`);
}

try {
  loadProjectEnv();
  const plan = build();
  console.log(JSON.stringify(plan, null, 2));
  if (plan.chunk?.some((t) => t.ok === false)) process.exit(1);
} catch (error) {
  usage(error.message);
}
