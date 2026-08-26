#!/usr/bin/env node
// Quality gate for /author-puzzle. Schema-valid is not enough: a stop-gate
// handoff needs the right artifact for each pass.
// Reads JSON from a file path or stdin.
import { readFileSync } from "node:fs";

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .agents/skills/author-puzzle/scripts/check-completeness.mjs [--level inventory|fit|board|complete] [--ledger path] <document.json>
  node .agents/skills/author-puzzle/scripts/check-completeness.mjs [--level inventory|fit|board|complete] [--ledger path] < document.json

Levels:
  inventory  concept map only (/tmp/<id>-inventory.json). No puzzle JSON.
  fit        board structure + loss ledger (--ledger /tmp/<id>-fit.json).
  board      clusters/terms/bridges. Notes/lenses deferred.
  complete   (default) puzzle info, term notes, connector info, ≥1 lens

Exit 0 only when blocking gaps are empty. Print JSON either way.`);
  process.exit(message ? 1 : 0);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) usage();
  let level = "complete";
  let ledgerPath = null;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--level") {
      const value = argv[++i];
      if (!["inventory", "fit", "board", "complete"].includes(value)) {
        usage(`Unknown --level "${value}". Use inventory, fit, board, or complete.`);
      }
      level = value;
    } else if (arg === "--ledger") {
      ledgerPath = argv[++i];
      if (!ledgerPath) usage("--ledger requires a path.");
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else rest.push(arg);
  }
  return { level, ledgerPath, path: rest[0] || null };
}

function loadDocument(path) {
  const raw = path ? readFileSync(path, "utf8") : readFileSync(0, "utf8");
  if (!raw.trim()) usage("Document JSON is required.");
  return JSON.parse(raw);
}

function loadLedger(path) {
  if (!path) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function clusterTerms(cluster) {
  if (Array.isArray(cluster.terms) && cluster.terms.length) return cluster.terms;
  return [...(cluster.seeds || []), ...(cluster.floatingTerms || [])];
}

function hasInfoText(info) {
  return typeof info?.text === "string" && info.text.trim().length > 0;
}

function hasAnyInfoSurface(info) {
  if (!info || typeof info !== "object") return false;
  if (hasInfoText(info)) return true;
  if (info.link || info.extraLink) return true;
  if (Array.isArray(info.links) && info.links.length) return true;
  if (Array.isArray(info.citations) && info.citations.length) return true;
  return false;
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function checkInventory(document) {
  const blocking = [];
  const advisory = [];
  const distinctions = Array.isArray(document.distinctions) ? document.distinctions : [];

  if (!nonEmptyString(document.thesis)) {
    blocking.push({ id: "thesis", message: "Add thesis (one sentence)." });
  }
  if (!nonEmptyString(document.id)) {
    blocking.push({ id: "missing-id", message: "Add provisional id." });
  }
  if (!nonEmptyString(document.title)) {
    blocking.push({ id: "missing-title", message: "Add working title." });
  }
  if (!nonEmptyString(document.category) && !(Array.isArray(document.categories) && document.categories.length)) {
    blocking.push({ id: "missing-category", message: "Add category." });
  }
  if (distinctions.length < 2) {
    blocking.push({
      id: "distinctions",
      message: "Inventory needs at least two distinctions with distinct jobs."
    });
  }

  const seenTerms = new Map();
  const termCounts = [];
  for (const distinction of distinctions) {
    const label = distinction.id || distinction.name || "?";
    if (!nonEmptyString(distinction.job)) {
      blocking.push({
        id: "distinction-job",
        distinction: distinction.id || null,
        message: `Distinction "${label}" needs a job statement.`
      });
    }
    const terms = Array.isArray(distinction.candidateTerms)
      ? distinction.candidateTerms.filter(nonEmptyString)
      : [];
    termCounts.push(terms.length);
    if (!terms.length) {
      blocking.push({
        id: "distinction-terms",
        distinction: distinction.id || null,
        message: `Distinction "${label}" needs at least one candidateTerms entry.`
      });
    }
    for (const term of terms) {
      if (seenTerms.has(term)) {
        blocking.push({
          id: "duplicate-term",
          term,
          message: `Term "${term}" appears under "${seenTerms.get(term)}" and "${label}".`
        });
      } else {
        seenTerms.set(term, label);
      }
    }
    const anchor = distinction.anchor;
    if (!anchor || typeof anchor !== "object" || !nonEmptyString(anchor.title)) {
      blocking.push({
        id: "distinction-anchor",
        distinction: distinction.id || null,
        message: `Distinction "${label}" needs anchor.title (prefer anchor.url when on the web).`
      });
    } else if (!nonEmptyString(anchor.url)) {
      advisory.push({
        id: "distinction-anchor-url",
        distinction: distinction.id || null,
        message: `Distinction "${label}" has anchor.title but no url — add one when the source is linkable.`
      });
    }
  }

  const excluded = Array.isArray(document.excluded) ? document.excluded : [];
  const noneConsidered = document.noneConsidered === true;
  if (!excluded.length && !noneConsidered) {
    blocking.push({
      id: "excluded",
      message: "Add excluded[] entries or set noneConsidered: true with scope.out explaining why."
    });
  } else if (noneConsidered && !nonEmptyString(document.scope?.out)) {
    blocking.push({
      id: "none-considered-scope",
      message: "When noneConsidered is true, scope.out must explain why nothing was set aside."
    });
  }

  const rivals = Array.isArray(document.rivalOrganizations) ? document.rivalOrganizations : [];
  if (!rivals.length && distinctions.length >= 3) {
    advisory.push({
      id: "rival-organizations",
      message: "Consider rivalOrganizations when the split is non-obvious."
    });
  }

  const spread = termCounts.length >= 2
    ? Math.max(...termCounts) - Math.min(...termCounts)
    : 0;
  if (termCounts.length >= 3 && spread === 0) {
    advisory.push({
      id: "uniform-inventory-counts",
      message: `All ${termCounts.length} distinctions have the same candidateTerms count — confirm this emerged from the concept space, not a template.`
    });
  }

  const ok = blocking.length === 0;
  return {
    id: document.id || null,
    title: document.title || null,
    level: "inventory",
    ok,
    blocking,
    deferred: [],
    advisory,
    coverage: {
      distinctions: distinctions.length,
      termsPerDistinction: termCounts,
      excluded: excluded.length,
      connections: Array.isArray(document.connections) ? document.connections.length : 0
    },
    stopGate: ok
      ? "Inventory OK. Stop for human concept-map review. Do not write puzzle JSON until inventory approved."
      : "FAILED. Fix blocking gaps in the inventory JSON. Do not stop."
  };
}

function inventoryTerms(inventory) {
  const terms = [];
  for (const distinction of inventory.distinctions || []) {
    for (const term of distinction.candidateTerms || []) {
      if (nonEmptyString(term)) terms.push(term.trim());
    }
  }
  return terms;
}

function checkFitLedger(ledger, document, inventoryPath = null) {
  const blocking = [];
  const advisory = [];
  if (!ledger || typeof ledger !== "object") {
    blocking.push({
      id: "missing-ledger",
      message: "Fit pass requires --ledger /tmp/<id>-fit.json with loss decisions."
    });
    return { blocking, advisory };
  }

  const decisions = Array.isArray(ledger.decisions) ? ledger.decisions : [];
  if (!decisions.length) {
    blocking.push({
      id: "empty-ledger",
      message: "Loss ledger decisions[] is empty."
    });
  }

  const boardTerms = new Set();
  for (const cluster of document.clusters || []) {
    for (const term of clusterTerms(cluster)) boardTerms.add(term);
  }

  let inventory = null;
  if (inventoryPath) {
    try {
      inventory = loadDocument(inventoryPath);
    } catch {
      advisory.push({
        id: "inventory-missing",
        message: `Could not read inventory at ${inventoryPath} for term reconciliation.`
      });
    }
  }

  if (inventory) {
    const invTerms = inventoryTerms(inventory);
    const accounted = new Set();
    for (const decision of decisions) {
      if (decision.type === "kept" && nonEmptyString(decision.term)) accounted.add(decision.term.trim());
      if (decision.type === "dropped" && nonEmptyString(decision.term)) accounted.add(decision.term.trim());
      if (decision.type === "deferred" && nonEmptyString(decision.term)) accounted.add(decision.term.trim());
    }
    for (const term of boardTerms) accounted.add(term);
    for (const term of invTerms) {
      if (!accounted.has(term)) {
        blocking.push({
          id: "unaccounted-term",
          term,
          message: `Inventory term "${term}" is not on the board and has no dropped/deferred ledger entry.`
        });
      }
    }
    if (nonEmptyString(ledger.inventoryId) && nonEmptyString(inventory.id)
      && ledger.inventoryId.trim() !== inventory.id.trim()) {
      blocking.push({
        id: "inventory-id-mismatch",
        message: `Ledger inventoryId "${ledger.inventoryId}" does not match inventory id "${inventory.id}".`
      });
    }
  }

  const invCounts = Array.isArray(ledger.inventoryTermCounts) ? ledger.inventoryTermCounts : [];
  const boardCounts = Array.isArray(ledger.boardTermCounts)
    ? ledger.boardTermCounts
    : (document.clusters || []).map(c => clusterTerms(c).length);

  if (invCounts.length >= 2 && boardCounts.length >= 2) {
    const invSpread = Math.max(...invCounts) - Math.min(...invCounts);
    const boardSpread = Math.max(...boardCounts) - Math.min(...boardCounts);
    const boardUniform = boardCounts.every(n => n === boardCounts[0]);
    if (invSpread >= 2 && boardSpread === 0 && boardUniform) {
      advisory.push({
        id: "equalized-in-fit",
        message: "Inventory had uneven term counts but the board is uniform — confirm equalization was intentional (see loss ledger)."
      });
    }
  }

  if (!decisions.some(d => d.type === "kept" || d.type === "merged")) {
    advisory.push({
      id: "ledger-kept",
      message: "Ledger has no kept/merged entries documenting how distinctions mapped to clusters."
    });
  }

  return { blocking, advisory };
}

function check(document, level = "complete", { ledger = null, inventoryPath = null } = {}) {
  if (level === "inventory") return checkInventory(document);

  const boardOnly = level === "board" || level === "fit";
  const blocking = [];
  const advisory = [];
  const deferred = [];
  const clusters = Array.isArray(document.clusters) ? document.clusters : [];
  const bridges = Array.isArray(document.bridges) ? document.bridges : [];
  const lenses = Array.isArray(document.lenses) ? document.lenses : [];

  if (level === "fit") {
    const ledgerResult = checkFitLedger(ledger, document, inventoryPath);
    blocking.push(...ledgerResult.blocking);
    advisory.push(...ledgerResult.advisory);
  }

  if (!document.id) blocking.push({ id: "missing-id", message: "Document has no id." });
  if (!document.title) blocking.push({ id: "missing-title", message: "Document has no title." });
  if (!document.category && !(Array.isArray(document.categories) && document.categories.length)) {
    blocking.push({ id: "missing-category", message: "Document has no category." });
  }

  if (!hasInfoText(document.info)) {
    const gap = {
      id: "puzzle-info",
      message: "Add puzzle info.text (what this board teaches in one or two sentences). Prefer citations/links gathered during research."
    };
    if (boardOnly) deferred.push(gap);
    else blocking.push(gap);
  } else if (!hasAnyInfoSurface({ ...document.info, text: undefined })) {
    advisory.push({
      id: "puzzle-info-links",
      message: "Puzzle info.text is present but has no links or citations yet."
    });
  }

  if (!clusters.length) {
    blocking.push({ id: "no-clusters", message: "Document has no clusters." });
  }

  let termsTotal = 0;
  let termsWithNotes = 0;
  const boardTermCounts = [];
  for (const cluster of clusters) {
    const terms = clusterTerms(cluster);
    boardTermCounts.push(terms.length);
    termsTotal += terms.length;
    const termInfo = cluster.termInfo && typeof cluster.termInfo === "object"
      ? cluster.termInfo
      : {};
    const missing = terms.filter((term) => !hasInfoText(termInfo[term]));
    termsWithNotes += terms.length - missing.length;
    if (missing.length) {
      const gap = {
        id: "term-notes",
        clusterId: cluster.id || null,
        terms: missing,
        message: `Cluster "${cluster.id || cluster.name || "?"}" is missing termInfo.text for: ${missing.join(", ")}`
      };
      if (boardOnly) deferred.push(gap);
      else blocking.push(gap);
    }
    if (boardOnly) {
      if (!cluster.name || !cluster.fact) {
        blocking.push({
          id: "cluster-structure",
          clusterId: cluster.id || null,
          message: `Cluster "${cluster.id || "?"}" needs name and fact.`
        });
      }
      if ((cluster.seeds || []).length !== 2) {
        blocking.push({
          id: "cluster-seeds",
          clusterId: cluster.id || null,
          message: `Cluster "${cluster.id || "?"}" needs exactly two seeds.`
        });
      }
      const floating = cluster.floatingTerms || [];
      if (floating.length < 1 || floating.length > 4) {
        blocking.push({
          id: "cluster-floating",
          clusterId: cluster.id || null,
          message: `Cluster "${cluster.id || "?"}" needs 1-4 floatingTerms.`
        });
      }
    }
    if (!hasAnyInfoSurface(cluster.info)) {
      advisory.push({
        id: "cluster-info",
        clusterId: cluster.id || null,
        message: `Cluster "${cluster.id || cluster.name || "?"}" has no info (text/links). Prefer cluster-sized help on the cluster.`
      });
    }
  }

  if (boardOnly && boardTermCounts.length >= 3 && boardTermCounts.every(n => n === boardTermCounts[0])) {
    advisory.push({
      id: "uniform-board-counts",
      message: `All ${boardTermCounts.length} clusters have exactly ${boardTermCounts[0]} terms — confirm this came from the approved inventory, not template convergence.`
    });
  }

  for (const bridge of bridges) {
    const role = bridge.termRole || "reference";
    if (role === "connector" && !hasInfoText(bridge.info)) {
      const gap = {
        id: "connector-info",
        bridgeId: bridge.id || null,
        message: `Connector bridge "${bridge.id || bridge.term || "?"}" needs info.text explaining its local function (no reference link).`
      };
      (boardOnly ? deferred : blocking).push(gap);
    } else if (role !== "connector" && !hasAnyInfoSurface(bridge.info) && !bridge.fact) {
      advisory.push({
        id: "bridge-help",
        bridgeId: bridge.id || null,
        message: `Bridge "${bridge.id || bridge.term || "?"}" has little help surface beyond the fact.`
      });
    }
  }

  if (!lenses.length) {
    const gap = {
      id: "lenses",
      message: "Run the pedagogy pass and add at least one focused lens (1-3 honest targets is complete)."
    };
    (boardOnly ? deferred : blocking).push(gap);
  }

  if (!document.learningIntroduction) {
    advisory.push({
      id: "learning-introduction",
      message: "No learningIntroduction. Add one only when domain framing genuinely helps; otherwise leave unset."
    });
  }

  const ok = blocking.length === 0;
  let stopGate;
  if (!ok) {
    stopGate = "FAILED. Fix blocking gaps with save_puzzle_draft. Do not stop. Do not submit.";
  } else if (level === "fit" || level === "board") {
    stopGate = level === "fit"
      ? "Fit OK. Stop for human board review (term set + loss ledger). Do not write term notes or lenses until the human says continue / fill / complete."
      : "Board OK. Stop for human review of terms and organization. Do not write term notes or lenses until the human says continue / fill / complete.";
  } else {
    stopGate = "Completeness OK. validate_puzzle_draft, then --record --authored, then stop-gate report.";
  }

  return {
    id: document.id || null,
    title: document.title || null,
    level,
    ok,
    blocking,
    deferred,
    advisory,
    coverage: {
      termsTotal,
      termsWithNotes,
      clusters: clusters.length,
      bridges: bridges.length,
      lenses: lenses.length,
      termCounts: boardTermCounts,
      hasPuzzleInfo: hasInfoText(document.info),
      hasLearningIntroduction: !!document.learningIntroduction
    },
    stopGate
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.level === "fit" && !args.ledgerPath) {
    usage("Fit level requires --ledger /tmp/<id>-fit.json");
  }
  const document = loadDocument(args.path);
  const ledger = args.ledgerPath ? loadLedger(args.ledgerPath) : null;
  const inventoryPath = args.path && args.path.replace(/\.json$/, "-inventory.json");
  const report = check(document, args.level, {
    ledger,
    inventoryPath: args.level === "fit" ? inventoryPath : null
  });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 2);
} catch (error) {
  usage(error.message);
}
