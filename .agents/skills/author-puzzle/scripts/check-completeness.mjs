#!/usr/bin/env node
// Quality gate for /author-puzzle. Schema-valid is not enough: a stop-gate
// handoff needs puzzle info, per-term notes, and a pedagogy surface.
// Reads a simplified puzzle document from a file path or stdin.
import { readFileSync } from "node:fs";

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .agents/skills/author-puzzle/scripts/check-completeness.mjs [--level board|complete] <document.json>
  node .agents/skills/author-puzzle/scripts/check-completeness.mjs [--level board|complete] < document.json

--level board     structure only (clusters/terms/bridges). Notes/lenses are advisory.
--level complete  (default) also require puzzle info, term notes, connector info, ≥1 lens

Exit 0 only when blocking gaps are empty. Print JSON either way.`);
  process.exit(message ? 1 : 0);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) usage();
  let level = "complete";
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--level") {
      const value = argv[++i];
      if (value !== "board" && value !== "complete") {
        usage(`Unknown --level "${value}". Use board or complete.`);
      }
      level = value;
    } else if (arg.startsWith("-")) usage(`Unknown option: ${arg}`);
    else rest.push(arg);
  }
  return { level, path: rest[0] || null };
}

function loadDocument(path) {
  const raw = path ? readFileSync(path, "utf8") : readFileSync(0, "utf8");
  if (!raw.trim()) usage("Document JSON is required.");
  return JSON.parse(raw);
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

function check(document, level = "complete") {
  const boardOnly = level === "board";
  const blocking = [];
  const advisory = [];
  const deferred = [];
  const clusters = Array.isArray(document.clusters) ? document.clusters : [];
  const bridges = Array.isArray(document.bridges) ? document.bridges : [];
  const lenses = Array.isArray(document.lenses) ? document.lenses : [];

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
  for (const cluster of clusters) {
    const terms = clusterTerms(cluster);
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
  } else if (boardOnly) {
    stopGate = "Board OK. Stop for human review of terms and organization. Do not write term notes or lenses until the human says continue / fill / complete.";
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
      hasPuzzleInfo: hasInfoText(document.info),
      hasLearningIntroduction: !!document.learningIntroduction
    },
    stopGate
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const document = loadDocument(args.path);
  const report = check(document, args.level);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 2);
} catch (error) {
  usage(error.message);
}
