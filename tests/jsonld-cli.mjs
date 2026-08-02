import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

export const name = "JSON-LD CLI: export, check, and transactional import preview";

function command(args, cwd = process.cwd()) {
  return spawnSync(process.execPath, ["tools/content-jsonld.mjs", ...args], {
    cwd,
    encoding: "utf8"
  });
}

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-jsonld-"));
  try {
    const puzzlePath = join(directory, "energy-flow.ccpuzzle.jsonld");
    let result = command(["export", "energy-flow", "--output", puzzlePath]);
    assert.equal(result.status, 0, result.stderr);
    const puzzle = JSON.parse(await readFile(puzzlePath, "utf8"));
    assert.equal(puzzle["@type"], "Puzzle");
    assert.ok(puzzle.clusters.every(cluster => cluster["@id"].startsWith("#cluster-")));
    assert.ok(puzzle.bridges.every(bridge =>
      bridge.clusters.every(reference => typeof reference["@id"] === "string")
    ));
    result = command(["check", puzzlePath]);
    assert.equal(result.status, 0, result.stderr);

    const lessonPath = join(directory, "lesson.ccpuzzle.jsonld");
    result = command(["export", "from-evidence-to-action", "--output", lessonPath]);
    assert.equal(result.status, 0, result.stderr);
    const lesson = JSON.parse(await readFile(lessonPath, "utf8"));
    assert.match(lesson.learningIntroduction.content.text, /Evidence is not the same as certainty/);
    assert.equal(lesson.learningIntroduction.content.src, undefined);

    const bundlePath = join(directory, "getting-started.ccbundle.jsonld");
    result = command([
      "export", "--catalogue", "getting-started", "--output", bundlePath
    ]);
    assert.equal(result.status, 0, result.stderr);
    result = command(["check", bundlePath]);
    assert.equal(result.status, 0, result.stderr);

    const fixture = {
      ...puzzle,
      "@id": "urn:concept-clusters:puzzle:jsonld-import-fixture",
      id: "jsonld-import-fixture",
      title: "JSON-LD import fixture"
    };
    const fixturePath = join(directory, "jsonld-import-fixture.ccpuzzle.jsonld");
    await writeFile(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);
    result = command([
      "import", fixturePath, "--catalogue", "getting-started",
      "--reason", "Exercises the import preview.", "--dry-run"
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /Would update:/,
      `stdout=${JSON.stringify(result.stdout)} stderr=${JSON.stringify(result.stderr)} error=${result.error}`
    );
    assert.match(result.stdout, /puzzles\/science\/jsonld-import-fixture\.js/);
    assert.match(result.stdout, /puzzles\/index\.js/);
    assert.match(result.stdout, /catalogues\/getting-started\.js/);

    // Exercise real publication and rollback in an isolated repository copy,
    // never against the developer's working tree.
    const repository = join(directory, "repository");
    await cp(process.cwd(), repository, {
      recursive: true,
      filter: source => ![".git", "node_modules", ".wrangler"].includes(basename(source))
    });
    result = command([
      "import", fixturePath, "--catalogue", "getting-started",
      "--reason", "Exercises transactional publication."
    ], repository);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      await readFile(join(repository, "puzzles/science/jsonld-import-fixture.js"), "utf8"),
      /Generated from content\/puzzles\/jsonld-import-fixture\.ccpuzzle\.jsonld/
    );
    assert.match(
      await readFile(join(repository, "puzzles/index.js"), "utf8"),
      /jsonldImportFixture/
    );
    assert.match(
      await readFile(join(repository, "catalogues/getting-started.js"), "utf8"),
      /jsonld-import-fixture/
    );

    // A related-puzzle entry may mention another puzzle id before that
    // puzzle's own module is visited. Replacement must resolve the exported
    // manifest, not the first source file containing an `id` field.
    result = command([
      "import",
      "content/puzzles/why-art-changes-what-it-sees.ccpuzzle.jsonld",
      "--replace"
    ], repository);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /puzzles\/art\/why-art-changes-what-it-sees\.js/);
    assert.doesNotMatch(result.stdout, /puzzles\/art\/where-meaning-comes-from\.js/);

    const rollbackFixture = {
      ...fixture,
      "@id": "urn:concept-clusters:puzzle:jsonld-rollback-fixture",
      id: "jsonld-rollback-fixture",
      title: "JSON-LD rollback fixture",
      category: "Science!"
    };
    const rollbackPath = join(directory, "jsonld-rollback-fixture.ccpuzzle.jsonld");
    await writeFile(rollbackPath, `${JSON.stringify(rollbackFixture, null, 2)}\n`);
    result = command(["import", rollbackPath], repository);
    assert.equal(result.status, 1, "post-write validation should reject the category slug collision");
    assert.match(result.stderr, /Repository validation failed/);
    await assert.rejects(
      readFile(join(repository, "puzzles/science/jsonld-rollback-fixture.js"), "utf8"),
      error => error.code === "ENOENT"
    );
    assert.doesNotMatch(
      await readFile(join(repository, "puzzles/index.js"), "utf8"),
      /jsonldRollbackFixture/
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
