#!/usr/bin/env node
// Dry-run (default) or apply preferred lesson-credit wording across
// content/puzzles/*.ccpuzzle.json using authoringSettings accept + preferred
// templates. Does not edit puzzles/**/*.js modules — publish/backfill those
// through the normal pipeline after reviewing canonical files.
//
// Usage:
//   npm run content:normalize-credits
//   npm run content:normalize-credits -- --write
//   node tools/normalize-lesson-credits.mjs [--write] [id ...]

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHORING_SETTINGS } from "../modules/authoringSettings.js";
import {
  normalizeLessonCredit,
  systemsForLessonCredit
} from "../modules/generativeAssistance.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "puzzles");

function parseArgs(argv) {
  const write = argv.includes("--write");
  const ids = argv.filter(arg => arg !== "--write" && !arg.startsWith("-"));
  return { write, ids };
}

async function listCanonicalFiles(ids) {
  const names = await readdir(contentDir);
  const files = names.filter(name => name.endsWith(".ccpuzzle.json"));
  if (!ids.length) return files.map(name => join(contentDir, name));
  const wanted = new Set(ids.map(id => `${id}.ccpuzzle.json`));
  return files
    .filter(name => wanted.has(name))
    .map(name => join(contentDir, name));
}

async function main() {
  const { write, ids } = parseArgs(process.argv.slice(2));
  const paths = await listCanonicalFiles(ids);
  const changes = [];
  const skipped = [];

  for (const path of paths) {
    const raw = await readFile(path, "utf8");
    let document;
    try {
      document = JSON.parse(raw);
    } catch (error) {
      skipped.push({ path, reason: `invalid JSON: ${error.message}` });
      continue;
    }
    const credit = document?.learningIntroduction?.credit;
    if (typeof credit !== "string" || !credit.trim()) {
      skipped.push({ path, reason: "no learningIntroduction.credit" });
      continue;
    }
    const next = normalizeLessonCredit(credit, {
      hosts: systemsForLessonCredit(document.generativeAssistance),
      authorName: AUTHORING_SETTINGS.credit.defaultAuthorName,
      settings: AUTHORING_SETTINGS,
      allowOpaqueAppend: false
    });
    if (!next) {
      skipped.push({ path, reason: "already preferred or unparseable" });
      continue;
    }
    changes.push({ path, from: credit.trim(), to: next, document });
  }

  if (!changes.length) {
    console.log("No lesson-credit rewrites needed.");
    if (skipped.length) {
      console.log(`(${skipped.length} file(s) skipped)`);
    }
    return;
  }

  console.log(`${changes.length} credit rewrite(s)${write ? "" : " (dry-run)"}:\n`);
  for (const change of changes) {
    const id = change.path.split("/").at(-1).replace(/\.ccpuzzle\.json$/, "");
    console.log(`${id}`);
    console.log(`  - ${change.from}`);
    console.log(`  + ${change.to}`);
  }

  if (!write) {
    console.log("\nRe-run with --write to update content/puzzles/*.ccpuzzle.json.");
    return;
  }

  for (const change of changes) {
    const nextDoc = {
      ...change.document,
      learningIntroduction: {
        ...change.document.learningIntroduction,
        credit: change.to
      }
    };
    await writeFile(change.path, `${JSON.stringify(nextDoc, null, 2)}\n`, "utf8");
  }
  console.log(`\nWrote ${changes.length} file(s).`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
