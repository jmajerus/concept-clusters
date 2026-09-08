#!/usr/bin/env node
// Report puzzles whose displayed term/bridge nodes have a strict majority of
// lowercase, sentence-case, or title-case labels. This is an audit, not a
// validation gate. Output lives under the gitignored authoring workspace.
//
// Usage:
//   npm run content:node-case-audit
//   node tools/audit-node-case.mjs --output /path/to/report-directory

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  auditCorpusClusterCase,
  auditCorpusNodeCase
} from "../modules/nodeCaseAudit.js";
import { PUZZLES } from "../puzzles/index.js";

const STYLES = [
  ["sentence", "Sentence case"],
  ["title", "Title case"],
  ["lower", "All lower case"]
];

function parseArgs(argv) {
  let output = ".concept-clusters/authoring/reports/node-case";
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === "--output") {
      output = argv[++index];
      if (!output) throw new Error("--output requires a directory");
    } else if (argv[index] === "--help") {
      console.log("Usage: node tools/audit-node-case.mjs [--output <directory>]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return { output: resolve(output) };
}

function matchesForStyle(results, style) {
  return results.filter(result => result.matches[style]).sort((a, b) =>
    a.category.localeCompare(b.category) || a.id.localeCompare(b.id)
  );
}

function markdownLog(scopeLabel, style, label, matches) {
  const grouped = new Map();
  matches.forEach(result => {
    if (!grouped.has(result.category)) grouped.set(result.category, []);
    grouped.get(result.category).push(result);
  });
  const lines = [
    `# ${scopeLabel}: ${label} majority`,
    "",
    `A puzzle matches only when this style accounts for more than half of its ${scopeLabel.toLocaleLowerCase()}.`,
    "Capitalized one-word labels and acronyms are counted as ambiguous rather than as sentence or title case."
  ];
  if (!matches.length) return `${lines.concat(["", "No matching puzzles.", ""]).join("\n")}`;
  for (const category of [...grouped.keys()].sort((a, b) => a.localeCompare(b))) {
    lines.push("", `## ${category}`, "");
    grouped.get(category).forEach(result => {
      const count = result.counts[style];
      lines.push(`- \`${result.id}\` — ${count}/${result.total} labels`);
    });
  }
  lines.push("");
  return lines.join("\n");
}

const { output } = parseArgs(process.argv.slice(2));
const scopes = [
  ["termNodes", "Term nodes", auditCorpusNodeCase(PUZZLES)],
  ["clusterNames", "Cluster names", auditCorpusClusterCase(PUZZLES)]
];
const summary = {
  generatedAt: new Date().toISOString(),
  corpusPuzzleCount: PUZZLES.length,
  scopes: Object.fromEntries(scopes.map(([scope, label, results]) => [scope, {
    label,
    auditedPuzzleCount: results.length,
    styles: Object.fromEntries(STYLES.map(([style]) => {
      const matches = matchesForStyle(results, style);
      return [style, { matchingPuzzleCount: matches.length, puzzleIds: matches.map(result => result.id) }];
    })),
    puzzles: results
  }]))
};

await mkdir(output, { recursive: true });
await writeFile(`${output}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
for (const [scope, scopeLabel, results] of scopes) {
  for (const [style, label] of STYLES) {
    const report = markdownLog(scopeLabel, style, label, matchesForStyle(results, style));
    await writeFile(`${output}/${scope}-${style}-majority-by-category.md`, report);
    // Preserve the original filenames as the term-node reports.
    if (scope === "termNodes") {
      await writeFile(`${output}/${style}-majority-by-category.md`, report);
    }
  }
}

console.log(`Node-case audit: ${PUZZLES.length} puzzles`);
for (const [scope, scopeLabel] of scopes) {
  console.log(`- ${scopeLabel}:`);
  for (const [style, label] of STYLES) {
    console.log(`  - ${label}: ${summary.scopes[scope].styles[style].matchingPuzzleCount} puzzles`);
  }
}
console.log(`Wrote ${output}`);
