#!/usr/bin/env node
// Quality gate for /author-puzzle. Schema-valid is not enough: a stop-gate
// handoff needs the right artifact for each pass.
// Reads JSON from a file path or stdin.
import { readFileSync } from "node:fs";

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .agents/skills/author-puzzle/scripts/check-completeness.mjs [--level inventory|split|fit|board|complete] [--ledger path] [--plan path] <document.json>
  node .agents/skills/author-puzzle/scripts/check-completeness.mjs [--level inventory|split|fit|board|complete] [--ledger path] [--plan path] < document.json

Levels:
  inventory  concept map only (/tmp/<id>-inventory.json). No puzzle JSON.
  split      board split plan vs inventory (--plan /tmp/<id>-split-plan.json).
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
  let planPath = null;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--level") {
      const value = argv[++i];
      if (!["inventory", "split", "fit", "board", "complete"].includes(value)) {
        usage(`Unknown --level "${value}". Use inventory, split, fit, board, or complete.`);
      }
      level = value;
    } else if (arg === "--ledger") {
      ledgerPath = argv[++i];
      if (!ledgerPath) usage("--ledger requires a path.");
    } else if (arg === "--plan") {
      planPath = argv[++i];
      if (!planPath) usage("--plan requires a path.");
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else rest.push(arg);
  }
  return { level, ledgerPath, planPath, path: rest[0] || null };
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

  const distinctionIds = new Set(
    distinctions.map(distinction => distinction.id).filter(nonEmptyString)
  );
  const connections = Array.isArray(document.connections) ? document.connections : [];
  if (!connections.length && !nonEmptyString(document.noConnectionsBecause)) {
    blocking.push({
      id: "connections",
      message: "Add connections[] (each with concept, because, and 2-3 distinction ids) or set noConnectionsBecause explaining why this map has no spanning concepts."
    });
  }
  for (const [index, connection] of connections.entries()) {
    const label = `connections[${index}]`;
    if (!nonEmptyString(connection?.concept)) {
      blocking.push({
        id: "connection-concept",
        message: `${label}: needs concept (the candidate bridge term — a real spanning idea, not a glue label).`
      });
    }
    if (!nonEmptyString(connection?.because)) {
      blocking.push({
        id: "connection-because",
        message: `${label}: needs because (why this link is genuine).`
      });
    }
    const linked = Array.isArray(connection?.distinctions) ? connection.distinctions : [];
    if (linked.length < 2 || linked.length > 3) {
      blocking.push({
        id: "connection-arity",
        message: `${label}: distinctions must name 2 or 3 inventory distinction ids.`
      });
    } else {
      for (const id of linked) {
        if (!nonEmptyString(id) || !distinctionIds.has(id)) {
          blocking.push({
            id: "connection-distinction",
            message: `${label}: distinction "${id}" is not an inventory distinction id.`
          });
        }
      }
    }
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
  if (termCounts.length >= 3 && spread === 0 && !nonEmptyString(document.uniformTermCountsJustified)) {
    blocking.push({
      id: "uniform-inventory-counts",
      message: `All ${termCounts.length} distinctions have the same candidateTerms count (${termCounts[0]} each). ` +
        "Re-weight terms from the concept space, or set uniformTermCountsJustified to a one-sentence reason when parity is genuinely field-driven."
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
      ? "Inventory OK. Stop for human concept-map review unless they already asked to plan or fit."
      : "FAILED. Fix blocking gaps in the inventory JSON. Do not stop."
  };
}

function termsForDistinctions(inventory, distinctionIds) {
  const allowed = new Set(distinctionIds);
  const terms = new Set();
  for (const distinction of inventory.distinctions || []) {
    if (!allowed.has(distinction.id)) continue;
    for (const term of distinction.candidateTerms || []) {
      if (nonEmptyString(term)) terms.add(term.trim());
    }
  }
  return terms;
}

function checkSplitPlan(plan, inventory) {
  const blocking = [];
  const advisory = [];
  if (!plan || typeof plan !== "object") {
    blocking.push({ id: "missing-plan", message: "Split level requires --plan /tmp/<id>-split-plan.json." });
    return { blocking, advisory, coverage: {} };
  }
  if (!nonEmptyString(plan.inventoryId)) {
    blocking.push({ id: "plan-inventory-id", message: "Split plan needs inventoryId." });
  } else if (nonEmptyString(inventory.id) && plan.inventoryId.trim() !== inventory.id.trim()) {
    blocking.push({
      id: "plan-inventory-mismatch",
      message: `Split plan inventoryId "${plan.inventoryId}" does not match inventory id "${inventory.id}".`
    });
  }
  if (!nonEmptyString(plan.seam)) {
    blocking.push({ id: "plan-seam", message: "Split plan needs seam (where and why the cut falls)." });
  }
  const boards = Array.isArray(plan.boards) ? plan.boards : [];
  if (!boards.length) {
    blocking.push({ id: "plan-boards", message: "Split plan boards[] is empty." });
  }
  for (const [index, board] of boards.entries()) {
    const label = `boards[${index}]`;
    if (!nonEmptyString(board.id)) blocking.push({ id: "plan-board-id", message: `${label}: missing id.` });
    if (!nonEmptyString(board.title)) blocking.push({ id: "plan-board-title", message: `${label}: missing title.` });
    if (!Array.isArray(board.distinctions) || !board.distinctions.length) {
      blocking.push({ id: "plan-board-distinctions", message: `${label}: distinctions[] is empty.` });
    }
  }

  const distinctionOwners = new Map();
  for (const board of boards) {
    for (const distinctionId of board.distinctions || []) {
      if (distinctionOwners.has(distinctionId)) {
        blocking.push({
          id: "plan-distinction-dupe",
          message: `Distinction "${distinctionId}" assigned to both "${distinctionOwners.get(distinctionId)}" and "${board.id}".`
        });
      } else if (board.id) {
        distinctionOwners.set(distinctionId, board.id);
      }
    }
  }

  const inventoryDistinctions = (inventory.distinctions || []).map(d => d.id).filter(Boolean);
  for (const distinctionId of inventoryDistinctions) {
    if (!distinctionOwners.has(distinctionId)) {
      blocking.push({
        id: "plan-distinction-unassigned",
        message: `Inventory distinction "${distinctionId}" is not assigned to any board.`
      });
    }
  }

  const accounted = new Set();
  for (const board of boards) {
    for (const term of termsForDistinctions(inventory, board.distinctions || [])) accounted.add(term);
    for (const term of board.sharedTerms || []) {
      if (nonEmptyString(term)) accounted.add(term.trim());
    }
    for (const entry of board.trim || []) {
      if (nonEmptyString(entry?.term)) accounted.add(entry.term.trim());
    }
  }
  for (const term of inventoryTerms(inventory)) {
    if (!accounted.has(term)) {
      blocking.push({
        id: "plan-unassigned-term",
        term,
        message: `Inventory term "${term}" is not on any board (via distinction, sharedTerms, or trim).`
      });
    }
  }

  const order = plan.relatedPuzzles?.order;
  if (Array.isArray(order) && order.length) {
    const boardIds = new Set(boards.map(b => b.id).filter(Boolean));
    for (const id of order) {
      if (!boardIds.has(id)) {
        blocking.push({
          id: "plan-related-order",
          message: `relatedPuzzles.order lists "${id}" which is not a board id in this plan.`
        });
      }
    }
  } else if (boards.length > 1) {
    advisory.push({
      id: "plan-related-order-missing",
      message: "Multi-board plan should set relatedPuzzles.order for play sequence."
    });
  }

  for (const board of boards) {
    if (typeof board.expectedNodes === "number" && board.expectedNodes > 24) {
      advisory.push({
        id: "plan-over-large-cap",
        boardId: board.id,
        message: `Board "${board.id}" expectedNodes ${board.expectedNodes} exceeds 24 — confirm split, trim, or future XL/layout verification.`
      });
    }
  }

  return {
    blocking,
    advisory,
    coverage: {
      boards: boards.length,
      distinctionsAssigned: distinctionOwners.size,
      termsAccounted: accounted.size
    }
  };
}

function checkSplit(inventory, planPath) {
  let plan = null;
  try {
    plan = loadDocument(planPath);
  } catch {
    return {
      id: inventory.id || null,
      title: inventory.title || null,
      level: "split",
      ok: false,
      blocking: [{
        id: "missing-plan",
        message: `Could not read split plan at ${planPath}.`
      }],
      deferred: [],
      advisory: [],
      coverage: {},
      stopGate: "FAILED. Write and validate split plan before fit."
    };
  }

  const { blocking, advisory, coverage } = checkSplitPlan(plan, inventory);
  const ok = blocking.length === 0;
  return {
    id: inventory.id || null,
    title: inventory.title || null,
    level: "split",
    ok,
    blocking,
    deferred: [],
    advisory,
    coverage,
    stopGate: ok
      ? "Split plan OK. Proceed to fit each board (loss ledger + relatedPuzzles from plan)."
      : "FAILED. Fix split plan before fit."
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

function normalizeLabel(value) {
  return String(value).trim().toLowerCase();
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
        message: `Could not read inventory at ${inventoryPath} for term and connection reconciliation.`
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

    const connections = Array.isArray(inventory.connections) ? inventory.connections : [];
    const boardBridgeTerms = (document.bridges || [])
      .map(bridge => bridge?.term)
      .filter(nonEmptyString);
    const droppedConcepts = new Set();
    const keptTermByConcept = new Map();
    const addedTerms = new Set();
    for (const decision of decisions) {
      if (decision.type === "bridge-dropped") {
        if (!nonEmptyString(decision.concept)) {
          blocking.push({
            id: "bridge-dropped-concept",
            message: "A bridge-dropped ledger entry needs concept (the inventory connection label)."
          });
        } else if (!nonEmptyString(decision.reason)) {
          blocking.push({
            id: "bridge-dropped-reason",
            concept: decision.concept,
            message: `bridge-dropped "${decision.concept}" needs a reason.`
          });
        } else {
          droppedConcepts.add(normalizeLabel(decision.concept));
        }
      }
      if (decision.type === "bridge-kept" && nonEmptyString(decision.concept)) {
        const term = nonEmptyString(decision.term) ? decision.term : decision.concept;
        keptTermByConcept.set(normalizeLabel(decision.concept), normalizeLabel(term));
      }
      if (decision.type === "bridge-added") {
        if (!nonEmptyString(decision.term)) {
          blocking.push({
            id: "bridge-added-term",
            message: "A bridge-added ledger entry needs term."
          });
        } else if (!nonEmptyString(decision.reason)) {
          blocking.push({
            id: "bridge-added-reason",
            term: decision.term,
            message: `bridge-added "${decision.term}" needs a reason.`
          });
        } else {
          addedTerms.add(normalizeLabel(decision.term));
        }
      }
    }

    for (const connection of connections) {
      if (!nonEmptyString(connection?.concept)) continue;
      const conceptNorm = normalizeLabel(connection.concept);
      if (droppedConcepts.has(conceptNorm)) continue;
      const expectedTerm = keptTermByConcept.get(conceptNorm) || conceptNorm;
      const onBoard = boardBridgeTerms.some(term => {
        const termNorm = normalizeLabel(term);
        return termNorm === conceptNorm || termNorm === expectedTerm;
      });
      if (!onBoard) {
        blocking.push({
          id: "unaccounted-connection",
          concept: connection.concept,
          message: `Inventory connection "${connection.concept}" is not a board bridge and has no bridge-dropped ledger entry.`
        });
      }
    }

    for (const term of boardBridgeTerms) {
      const termNorm = normalizeLabel(term);
      const matchesInventory = connections.some(
        connection => nonEmptyString(connection?.concept)
          && normalizeLabel(connection.concept) === termNorm
      );
      const mappedFromKept = [...keptTermByConcept.values()].includes(termNorm);
      if (matchesInventory || mappedFromKept || addedTerms.has(termNorm)) continue;
      blocking.push({
        id: "unaccounted-bridge",
        term,
        message: `Board bridge "${term}" has no matching inventory connection and no bridge-added ledger entry.`
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

function check(document, level = "complete", { ledger = null, inventoryPath = null, planPath = null } = {}) {
  if (level === "inventory") return checkInventory(document);
  if (level === "split") return checkSplit(document, planPath);

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
      message: "No learningIntroduction. Prefer a short orienting note (1–2 paragraphs on the learning objective) when the subject is technical, sequential, or easy to misframe; leave unset when title and clusters already orient clearly."
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
  if (args.level === "split" && !args.planPath) {
    usage("Split level requires --plan /tmp/<id>-split-plan.json");
  }
  const document = loadDocument(args.path);
  const ledger = args.ledgerPath ? loadLedger(args.ledgerPath) : null;
  const inventoryPath = args.path && args.path.replace(/\.json$/, "-inventory.json");
  const report = check(document, args.level, {
    ledger,
    inventoryPath: args.level === "fit" ? inventoryPath : null,
    planPath: args.planPath
  });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 2);
} catch (error) {
  usage(error.message);
}
