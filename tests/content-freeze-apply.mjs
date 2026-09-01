import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyContentFreeze } from "../modules/contentFreezeApply.js";
import { emptyContentFreezePlan } from "../modules/contentFreezePlan.js";

export const name = "content freeze apply: writes cued snapshots into a checkout";

function puzzleDocument(id = "freeze-add-fixture") {
  return {
    id,
    title: "Freeze Add Fixture",
    category: "Science",
    clusters: [
      {
        id: "alpha",
        name: "Alpha",
        color: "teal",
        fact: "Alpha fact.",
        seeds: ["a", "b"],
        floatingTerms: ["c", "d"]
      },
      {
        id: "beta",
        name: "Beta",
        color: "blue",
        fact: "Beta fact.",
        seeds: ["e", "f"],
        floatingTerms: ["g", "h"]
      }
    ],
    bridges: [
      {
        term: "link",
        clusters: ["alpha", "beta"],
        fact: "Bridges alpha and beta."
      }
    ]
  };
}

export async function run() {
  try {
    await applyContentFreeze({
      plan: emptyContentFreezePlan(),
      contentDocuments: {},
      repositoryRoot: "/tmp"
    });
    assert.fail("expected empty freeze to throw");
  } catch (error) {
    assert.equal(error.code, "ERR_FREEZE_EMPTY");
  }

  const root = await mkdtemp(join(tmpdir(), "freeze-apply-"));
  try {
    await mkdir(join(root, "puzzles", "science"), { recursive: true });
    await mkdir(join(root, "catalogues"), { recursive: true });
    await mkdir(join(root, "content", "puzzles"), { recursive: true });
    await writeFile(join(root, "puzzles", "index.js"), `import energyFlow from "./science/energy-flow.js";

// Cross-disciplinary membership

export const PUZZLES = [
  energyFlow,
];
`);
    await writeFile(join(root, "catalogues", "index.js"), `import gettingStarted from "./getting-started.js";

export const CATALOGUES = [
  gettingStarted,
];
`);
    await writeFile(join(root, "puzzles", "categories.js"), `export const CATEGORIES = {
  Science: { slug: "science" }
};

`);
    const documents = {
      async getPublished({ kind, id }) {
        if (kind === "puzzle" && id === "freeze-add-fixture") {
          return { id, document: puzzleDocument(id) };
        }
        throw new Error(`unexpected ${kind} ${id}`);
      }
    };
    const result = await applyContentFreeze({
      plan: {
        puzzles: { add: ["freeze-add-fixture"], update: [], remove: [] },
        catalogues: { add: [], update: [], remove: [] },
        categories: { add: [], update: [], remove: [] }
      },
      contentDocuments: documents,
      repositoryRoot: root,
      validateRepository: () => {}
    });
    assert.equal(result.frozen, true);
    const canonical = await readFile(
      join(root, "content", "puzzles", "freeze-add-fixture.ccpuzzle.json"),
      "utf8"
    );
    assert.match(canonical, /freeze-add-fixture/);
    const registry = await readFile(join(root, "puzzles", "index.js"), "utf8");
    assert.match(registry, /freezeAddFixture/);
    const moduleSource = await readFile(
      join(root, "puzzles", "science", "freeze-add-fixture.js"),
      "utf8"
    );
    assert.match(moduleSource, /definePuzzle/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
