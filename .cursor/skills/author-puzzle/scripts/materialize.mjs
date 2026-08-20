#!/usr/bin/env node
// File-based fallback when local stdio MCP is not connected.
// Reads content/puzzles/<id>.ccpuzzle.json, writes the generated module,
// and registers it in puzzles/index.js.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formattedJson,
  generatedPuzzleModule
} from "../../../../modules/publicationArtifacts.js";
import { puzzleToSimplified } from "../../../../modules/puzzleSimplified.js";
import { puzzleFromAuthoredDocument } from "../../../../modules/simplifiedPuzzleSchema.js";
import { slugify } from "../../../../puzzles/categories.js";
import { ensurePuzzleRegistry } from "../../../../tools/ensure-puzzle-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const id = process.argv[2];
if (!id) {
  console.error("Usage: node .cursor/skills/author-puzzle/scripts/materialize.mjs <id>");
  process.exit(1);
}

const canonicalRelative = `content/puzzles/${id}.ccpuzzle.json`;
const input = JSON.parse(await readFile(join(ROOT, canonicalRelative), "utf8"));
const { puzzle, errors } = puzzleFromAuthoredDocument(input);
if (!puzzle) {
  console.error(errors.join("\n"));
  process.exit(1);
}
if (puzzle.id !== id) {
  console.error(`Document id "${puzzle.id}" does not match filename id "${id}".`);
  process.exit(1);
}

const moduleRelative = `puzzles/${slugify(puzzle.category)}/${puzzle.id}.js`;
const modulePath = join(ROOT, moduleRelative);
await mkdir(dirname(modulePath), { recursive: true });
await writeFile(
  join(ROOT, canonicalRelative),
  formattedJson(puzzleToSimplified(puzzle)),
  "utf8"
);
await writeFile(
  modulePath,
  generatedPuzzleModule(puzzle, canonicalRelative, moduleRelative),
  "utf8"
);

const { added } = await ensurePuzzleRegistry({ repositoryRoot: ROOT });
console.log(`Wrote ${canonicalRelative}`);
console.log(`Wrote ${moduleRelative}`);
if (added.length) console.log(`Registered: ${added.join(", ")}`);
else console.log("Registry already listed this module.");
