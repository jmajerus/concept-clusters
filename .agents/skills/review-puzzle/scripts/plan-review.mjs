#!/usr/bin/env node
// Single entry for /review-puzzle. Maps flags to a machine-readable agent
// contract. The skill tells the model: run this once, then obey the JSON.
import { resolveTargets } from "./resolve-target.mjs";
import { runSuggest } from "./suggest-review.mjs";
import { localDraftReviewUrl } from "../../../../modules/authoringDesignGuidance.js";
import { loadProjectEnv } from "../../../../modules/loadProjectEnv.js";

const SCRIPT = "node .agents/skills/review-puzzle/scripts/plan-review.mjs";
const MODES = ["load", "pick", "due", "review", "record", "loop"];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FORBIDDEN = [
  "Do not glob, find, or ripgrep the repo",
  "Do not read docs/, modules/, tools/, tests/, or unrelated puzzles",
  "Do not call list_puzzles or list_categories to browse",
  "Do not create a blank blueprint or invent a substitute puzzle",
  "Do not invent a puzzle id/title from chat memory or an earlier authoring brainstorm",
  "Do not run suggest-review.mjs or resolve-target.mjs except as this plan already folded their results in",
  "Do not exceed mcpBudget or allowedMcp"
];

const PROVE_BEFORE_REVIEW = [
  "Echo each named id/title verbatim before any MCP write",
  "Proof = get_puzzle_draft matching that draftId",
  "Unproven names are ABORT (treat as chat-memory contamination); ask for the drafts URL",
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
  loop     Bounded author/critic pass (requires ids; --rounds n, default 3)

Flags:
  --mode <${MODES.join("|")}>
  --gate / --no-gate     Stop after load (default: on for load/pick)
  --dry-run              Plan only; no MCP, no log writes
  --category <slug>      --subcategory <id>  --count <n>
  --record <id>          --unchanged  --authored
  --budget <n>           Max MCP calls per id (default: 7 for review, 3 otherwise)
  --rounds <n>           Max critic/author rounds for --mode loop (default 3)`);
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
    else if (["--mode", "--category", "--subcategory", "--count", "--record", "--budget", "--rounds"].includes(arg)) {
      const value = raw[++index];
      if (!value) usage(`${arg} requires a value.`);
      values[arg.slice(2)] = value;
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else values.ids.push(arg);
  }
  return values;
}

function inferMode(args) {
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
  if (mode === "review" || mode === "loop") {
    return [
      "get_puzzle_draft",
      "get_authoring_guidance",
      "save_puzzle_draft",
      "validate_puzzle_draft"
    ];
  }
  return [];
}

function readsFor(mode, gate) {
  if ((mode === "review" || mode === "loop") && !gate) {
    return [
      ".agents/skills/author-puzzle/references/design-judgment.md",
      "docs/SIMPLIFIED-PUZZLE-FORMAT.md (one field only, if unknown)",
      "After a structural-regularity-combination prompt only: node tools/authoring-workspace.mjs, then the exact ledger/inventory paths named by the selected draft (no search)"
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
  // A changed single-pass review can need: load, guidance, save, validate,
  // then refresh, corrective save, and re-validation. Load/pick remain
  // deliberately cheaper; loop supplies its own per-round calculation below.
  const budget = args.budget ? Number(args.budget) : mode === "review" ? 7 : 3;
  if (!Number.isInteger(budget) || budget < 1) usage("--budget must be a positive integer.");
  const rounds = args.rounds ? Number(args.rounds) : 3;
  if (!Number.isInteger(rounds) || rounds < 1) usage("--rounds must be a positive integer.");

  let gate = args.gate;
  if (gate == null) {
    gate = mode === "load";
  }
  if (mode === "due" || mode === "record") gate = false;
  if (args.dryRun && (mode === "load" || mode === "pick" || mode === "review")) {
    // Dry run never calls MCP.
  }

  const invocation = {
    ids: args.ids,
    mode,
    gate,
    dryRun: !!args.dryRun,
    category: args.category || null,
    subcategory: args.subcategory || null,
    count: args.count ? Number(args.count) : (mode === "pick" ? 3 : null),
    record: args.record || null,
    budget,
    rounds
  };

  const base = {
    invocation,
    mode,
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
        "If validation has a structural-regularity-combination prompt: resolve the authoring workspace once; read only ledgers/<draft-id>-fit.json, then inventories/<ledger.inventoryId>.json when named (otherwise inventories/<draft-id>.json). If neither source exists, keep the prompt open for human source review; do not alter counts merely to clear it.",
        "Apply the board checklist on this document only",
        "If changing the document: save_puzzle_draft with the current expected_revision, then validate_puzzle_draft. If validation needs a correction, refresh revision, save once more, and re-validate.",
        `node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record ${fromTargets.firstId} [--unchanged]`,
        "Give the drafts URL. Publish, Cue, and Freeze are human actions there, not MCP tools. STOP."
      ],
      report: {
        ...loadReport(),
        closing: "Validated. Waiting on /admin/drafts."
      },
      humanNext: "Publish and Cue on the drafts page, or say continue for the next id"
    };
  }

  if (mode === "loop") {
    if (!args.ids.length) {
      throw new Error("--mode loop requires one puzzle id (or say continue on a loaded id).");
    }
    if (args.ids.length > 1) {
      throw new Error("--mode loop handles one puzzle id at a time; run it again for the next id.");
    }
    if (args.ids.some((id) => !ID_RE.test(id))) {
      throw new Error(`Invalid id in ${JSON.stringify(args.ids)}. Use kebab-case.`);
    }
    // Each round costs up to 4 MCP calls (guidance, save, validate, and
    // slack for a re-validate after fixing errors), plus one initial
    // get_puzzle_draft -- well past review/load's flat default of 3.
    // An explicit --budget is trusted as-is; only the default is scaled.
    const loopBudget = args.budget ? budget : rounds * 4 + 1;
    const resolved = resolveTargets(args.ids, { namedByUser: true });
    const fromTargets = planFromTargets(resolved.targets, {
      namedByUser: true,
      mode: "loop",
      gate: false,
      dryRun: args.dryRun,
      budget: loopBudget
    });
    if (args.dryRun) {
      return {
        ...base,
        ...fromTargets,
        steps: ["Show this plan. Do not call MCP."],
        report: loadReport()
      };
    }
    return {
      ...base,
      gate: false,
      ...fromTargets,
      stopAfter: "loop-complete",
      allowedMcp: allowedMcpFor("loop"),
      rounds,
      steps: [
        `get_puzzle_draft draft_id="${fromTargets.firstId}" (already loaded; refresh before each save)`,
        "Two roles, one agent switching hats each turn -- not a truly independent critic. The critic turn must judge the draft as written, not defend why it was written that way.",
        "CRITIC TURN: get_authoring_guidance phase=\"review\" (pedagogy only if lenses/intro need work). Evaluate the current document fresh against the board checklist. List concrete objections tied to specific clusters/terms/bridges/facts. Make no edits this turn.",
        "If zero objections: stop looping, reason=\"converged\", go to WRAP-UP.",
        "If these objections are substantially the same as the previous round's: stop looping, reason=\"stagnant\", go to WRAP-UP.",
        "AUTHOR TURN: address each objection with targeted edits, then save_puzzle_draft with the current expected_revision. validate_puzzle_draft; fix any errors before the next round.",
        `Repeat CRITIC TURN / AUTHOR TURN up to ${rounds} rounds total. If the cap is reached with objections still open: stop looping, reason="capped".`,
        "WRAP-UP: report each round's objections and fixes, and the stop reason (converged/stagnant/capped).",
        `node .agents/skills/review-puzzle/scripts/suggest-review.mjs --record ${fromTargets.firstId} [--unchanged]`,
        "Give the drafts URL. Publish, Cue, and Freeze are human actions there, not MCP tools. STOP."
      ],
      report: {
        ...loadReport(),
        closing: "Loop complete. Waiting on /admin/drafts."
      },
      humanNext: "Publish and Cue on the drafts page, or say continue for the next id"
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
