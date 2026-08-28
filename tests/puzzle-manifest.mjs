import assert from "node:assert/strict";
import { puzzleBrowseFromFull } from "../modules/puzzleBrowse.js";
import { createPuzzleLoader, PuzzleLoadError } from "../modules/puzzleLoader.js";
import { buildPuzzleManifest } from "../tools/build-puzzle-manifest.mjs";

export const name = "puzzle manifest and lazy loader";

export async function run() {
  const sample = {
    id: "demo",
    title: "Demo puzzle",
    category: "Science",
    clusters: [
      { name: "A", fact: "Fact", terms: ["alpha", "beta"], seeds: ["alpha"], floatingTerms: ["beta"] }
    ],
    bridges: [{ term: "bridge-term", fact: "Bridge fact" }]
  };
  const browse = puzzleBrowseFromFull(sample);
  assert.deepEqual(browse._searchTerms, ["A", "alpha", "beta", "bridge-term"]);

  const built = await buildPuzzleManifest({ write: false });
  assert.ok(built.entries.length > 0, "manifest should include puzzles");
  assert.equal(built.entries.length, built.entries.filter(e => e.id && e.module).length);

  const { writeFile, unlink } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const tempPath = join(process.cwd(), ".manifest-syntax-check.js");
  const { serializeManifest } = await import("../tools/build-puzzle-manifest.mjs");
  // Exercise the generator output directly — category keys like "Computer Science"
  // must stay quoted or the player bundle fails to parse.
  await writeFile(
    tempPath,
    serializeManifest(
      [{
        id: "syntax-fixture",
        module: "./science/energy-flow.js",
        browse: {
          id: "syntax-fixture",
          title: "Fixture",
          category: "Science",
          subcategories: { "Computer Science": "computing-and-society" }
        }
      }],
      []
    ),
    "utf8"
  );
  const check = spawnSync(process.execPath, ["--check", tempPath], { encoding: "utf8" });
  await unlink(tempPath);
  assert.equal(check.status, 0, check.stderr || "manifest output must be valid JS");

  const loader = createPuzzleLoader(built.entries);
  assert.equal(loader.browsePuzzles.length, built.entries.length);
  const energy = await loader.loadPuzzleById("energy-flow");
  assert.equal(energy.id, "energy-flow");
  assert.ok(Array.isArray(energy.clusters) && energy.clusters.length > 0);

  const broken = createPuzzleLoader([
    {
      id: "missing",
      module: "./does-not-exist/missing.js",
      browse: { id: "missing", title: "Missing", category: "Science", _searchTerms: [] }
    }
  ]);
  await assert.rejects(
    () => broken.loadPuzzleById("missing"),
    error => error instanceof PuzzleLoadError
  );
}
