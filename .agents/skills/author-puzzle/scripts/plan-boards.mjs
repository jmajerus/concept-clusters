#!/usr/bin/env node
// Sizing stats for an approved inventory — no pedagogical judgment, only numbers
// agents and humans use when choosing standard / large / split.
import { readFileSync } from "node:fs";
import { pillWidth } from "../../../../modules/puzzleGraph.js";

const NODE_CAP_STANDARD = 16;
const NODE_CAP_LARGE = 24;

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  node .agents/skills/author-puzzle/scripts/plan-boards.mjs <inventory.json>

Prints JSON stats: term counts, pill widths, connection load, and sizing options.`);
  process.exit(message ? 1 : 0);
}

function loadInventory(path) {
  if (!path) usage("Inventory path is required.");
  return JSON.parse(readFileSync(path, "utf8"));
}

function distinctionConnectionCounts(inventory) {
  const counts = new Map();
  for (const distinction of inventory.distinctions || []) {
    counts.set(distinction.id, 0);
  }
  for (const connection of inventory.connections || []) {
    for (const id of connection.distinctions || []) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }
  return counts;
}

function trimCandidates(inventory) {
  const connByDistinction = distinctionConnectionCounts(inventory);
  const candidates = [];
  for (const distinction of inventory.distinctions || []) {
    const connLoad = connByDistinction.get(distinction.id) || 0;
    for (const term of distinction.candidateTerms || []) {
      let score = 0;
      const lower = term.toLowerCase();
      if (connLoad <= 1) score += 1;
      if (/(microscope|application|example|case study)/i.test(lower)) score += 2;
      if ((distinction.candidateTerms || []).length >= 6) score += 1;
      if (score >= 2) {
        candidates.push({
          term,
          distinction: distinction.id,
          connectionLoad: connLoad,
          note: score >= 3
            ? "Application or low-bridge term in a large distinction — first reconsider if trimming."
            : "Low bridge involvement — reconsider if squeezing node count."
        });
      }
    }
  }
  return candidates.sort((a, b) => b.connectionLoad - a.connectionLoad || a.term.localeCompare(b.term));
}

function buildOptions(inventory, totalTerms, connectionCount) {
  const distinctions = inventory.distinctions || [];
  const minNodes = totalTerms;
  const maxNodes = totalTerms + connectionCount;
  const options = [];

  if (maxNodes <= NODE_CAP_STANDARD) {
    options.push({
      strategy: "single-standard",
      nodeRange: [minNodes, maxNodes],
      note: "Fits the standard board without large: true."
    });
  } else if (maxNodes <= NODE_CAP_LARGE) {
    options.push({
      strategy: "single-large",
      nodeRange: [minNodes, maxNodes],
      note: "Set large: true; do not drop distinct terms to stay at 16."
    });
  } else {
    options.push({
      strategy: "split-required",
      nodeRange: [minNodes, maxNodes],
      note: `Exceeds ${NODE_CAP_LARGE} nodes even with large: true and one bridge per connection. Plan a split or trim with ledger entries.`
    });
    const half = Math.ceil(distinctions.length / 2);
    const first = distinctions.slice(0, half);
    const second = distinctions.slice(half);
    const sumTerms = groups => groups.reduce(
      (sum, d) => sum + (d.candidateTerms?.length || 0),
      0
    );
    options.push({
      strategy: "two-boards-heuristic",
      boards: [
        {
          distinctions: first.map(d => d.id),
          termCount: sumTerms(first),
          note: "Mechanical mid-inventory cut — replace with a pedagogical seam."
        },
        {
          distinctions: second.map(d => d.id),
          termCount: sumTerms(second),
          note: "Mechanical mid-inventory cut — replace with a pedagogical seam."
        }
      ]
    });
  }

  if (maxNodes > NODE_CAP_LARGE && maxNodes <= NODE_CAP_LARGE + 3) {
    options.push({
      strategy: "marginal-overshoot",
      nodeRange: [minNodes, maxNodes],
      note: "Within a few nodes of large cap — consider honest merge, defer-with-destination, or layout verification before split."
    });
  }

  return options;
}

function analyze(inventory) {
  const distinctions = inventory.distinctions || [];
  const connections = inventory.connections || [];
  const termCounts = distinctions.map(d => (d.candidateTerms || []).length);
  const allTerms = distinctions.flatMap(d => d.candidateTerms || []);
  const uniqueTerms = new Set(allTerms);
  const longest = [...uniqueTerms]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .slice(0, 8)
    .map(term => ({
      term,
      chars: term.length,
      pillWidth: Math.round(pillWidth(term))
    }));

  const totalTerms = allTerms.length;
  const connectionCount = connections.length;

  return {
    id: inventory.id || null,
    title: inventory.title || null,
    distinctions: distinctions.length,
    termCounts,
    totalTerms,
    uniqueTerms: uniqueTerms.size,
    connections: connectionCount,
    nodeRangeWithoutBridges: [totalTerms, totalTerms],
    nodeRangeWithBridges: [totalTerms, totalTerms + connectionCount],
    longestTerms: longest,
    trimCandidates: trimCandidates(inventory),
    options: buildOptions(inventory, totalTerms, connectionCount),
    caps: {
      standard: NODE_CAP_STANDARD,
      large: NODE_CAP_LARGE
    },
    nextStep: "Discuss seam and board plan, then write /tmp/<id>-split-plan.json before fit."
  };
}

try {
  const path = process.argv[2];
  const inventory = loadInventory(path);
  console.log(JSON.stringify(analyze(inventory), null, 2));
} catch (error) {
  usage(error.message);
}
