#!/usr/bin/env node

// Generates content/puzzles/<id>.ccpuzzle.json (the canonical simplified
// document, see docs/JSON-LD.md and docs/SIMPLIFIED-PUZZLE-FORMAT.md) from
// a puzzle's already-loaded puzzles/**/*.js module, for puzzles that don't
// have a canonical source file yet.
//
// Two uses:
//   node tools/backfill-canonical-content.mjs
//     Bulk backfill: writes one for every puzzle currently missing it --
//     the puzzles that predate the authoring pipeline, or simply haven't
//     been edited through it since.
//   node tools/backfill-canonical-content.mjs <id> [<id> ...] [--force]
//     One-off: writes just the named puzzles. Useful right after
//     hand-authoring a new puzzles/**/*.js module directly, to give it a
//     canonical source immediately rather than waiting for its first
//     pipeline edit. --force overwrites an existing canonical file
//     (without it, an existing file for a named id is left untouched).
//
// This is a convenience, not a requirement -- the publication pipeline
// already backfills a puzzle's canonical file lazily, as a side effect,
// the first time it's edited through the MCP/CLI pipeline. Running this
// ahead of time just lets the canonical shape be reviewed/diffed before
// that, or seeds one without going through a pipeline edit at all. See
// docs/dev-briefs/consolidate-content-and-puzzles-canonical-source.md.

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PUZZLES } from "../puzzles/index.js";
import { resolvePuzzleResourceUrl } from "../modules/puzzleManifest.js";
import { puzzleToSimplified } from "../modules/puzzleSimplified.js";
import { SimplifiedPuzzleInputSchema } from "../modules/simplifiedPuzzleSchema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "puzzles");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Mirrors contentInterchangeService.js's learningContentFor(): a hand-
// authored puzzle's learningIntroduction may point at a sibling Markdown
// file via content.src rather than embedding the text directly, and the
// canonical document (like every simplified document) only ever carries
// embedded text.
async function learningContentFor(puzzle) {
  const content = puzzle.learningIntroduction?.content;
  if (!content?.src) return null;
  const url = resolvePuzzleResourceUrl(puzzle, content.src);
  if (url.protocol !== "file:") return null;
  return readFile(fileURLToPath(url), "utf8");
}

async function backfillOne(puzzle, { force = false } = {}) {
  const outputPath = join(contentDir, `${puzzle.id}.ccpuzzle.json`);
  const alreadyExists = await exists(outputPath);
  if (alreadyExists && !force) {
    return { id: puzzle.id, status: "skipped", detail: "canonical file already exists" };
  }
  const learningContent = await learningContentFor(puzzle);
  const simplified = puzzleToSimplified(puzzle, {
    ...(learningContent !== null ? { learningContent } : {})
  });
  // Fails loudly rather than silently writing something the publication
  // pipeline would reject on the puzzle's next edit -- same schema every
  // draft is validated against.
  let parsed;
  try {
    parsed = SimplifiedPuzzleInputSchema.parse(simplified);
  } catch (error) {
    return { id: puzzle.id, status: "failed", detail: error.message };
  }
  await mkdir(contentDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return {
    id: puzzle.id,
    status: alreadyExists ? "overwritten" : "written"
  };
}

function parseArgs(argv) {
  const force = argv.includes("--force");
  const ids = argv.filter(arg => arg !== "--force");
  return { force, ids };
}

async function main() {
  const { force, ids } = parseArgs(process.argv.slice(2));
  const puzzleById = new Map(PUZZLES.map(puzzle => [puzzle.id, puzzle]));

  let targets;
  if (ids.length) {
    targets = ids.map(id => {
      const puzzle = puzzleById.get(id);
      if (!puzzle) throw new Error(`Unknown puzzle: ${id}`);
      return puzzle;
    });
  } else {
    // Bulk mode only considers puzzles missing a canonical file --
    // backfillOne's own alreadyExists check would just skip the rest
    // anyway, but this keeps a plain run's output limited to what it
    // actually did.
    const missing = [];
    for (const puzzle of PUZZLES) {
      if (!await exists(join(contentDir, `${puzzle.id}.ccpuzzle.json`))) {
        missing.push(puzzle);
      }
    }
    targets = missing;
  }

  if (!targets.length) {
    console.log("Nothing to backfill -- every puzzle already has a canonical file.");
    return;
  }

  const results = [];
  for (const puzzle of targets) {
    results.push(await backfillOne(puzzle, { force }));
  }

  for (const result of results) {
    const suffix = result.detail ? ` (${result.detail})` : "";
    console.log(`${result.status.padEnd(11)} ${result.id}${suffix}`);
  }

  const failed = results.filter(result => result.status === "failed");
  const written = results.filter(result => result.status === "written" || result.status === "overwritten");
  console.log(`\n${written.length} written, ${results.length - written.length - failed.length} skipped, ${failed.length} failed.`);
  if (failed.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
