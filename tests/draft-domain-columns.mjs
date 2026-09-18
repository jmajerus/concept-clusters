import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";

export const name =
  "Draft domain columns: column-level save defers document materialization";

const document = {
  id: "column-level",
  title: "Column level",
  category: "science",
  clusters: [{
    id: "a",
    name: "A",
    fact: "A fact",
    seeds: ["one", "two"],
    floatingTerms: ["three"]
  }],
  bridges: [{
    id: "b",
    term: "Bridge",
    clusters: ["a"],
    fact: "Bridge fact",
    relationKind: "contrast"
  }],
  lenses: [{ id: "lens", prompt: "P", explanation: "E" }],
  provenance: { contributors: ["Test"] }
};

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-domain-cols-"));
  try {
    const store = createPuzzleDraftStore({ directory });
    await store.createDraft({ draftId: "column-level", document });
    const created = await store.getDraft("column-level");
    assert.equal(created.documentStale, false);
    assert.equal(created.document.title, "Column level");

    const afterContent = await store.replaceDomain({
      draftId: "column-level",
      domain: "content",
      projection: {
        id: "column-level",
        title: "Content retitled",
        category: "science",
        clusters: document.clusters,
        bridges: [{
          id: "b",
          term: "Bridge",
          clusters: ["a"],
          fact: "Bridge fact"
        }]
      },
      expectedRevision: created.revision
    });
    assert.equal(afterContent.documentStale, true);
    assert.equal(afterContent.document.title, "Content retitled");
    assert.equal(afterContent.document.lenses[0].id, "lens");
    assert.equal(afterContent.document.bridges[0].relationKind, "contrast");

    const onDisk = JSON.parse(
      await readFile(join(directory, "column-level.json"), "utf8")
    );
    assert.equal(onDisk.documentStale, true);
    assert.equal(onDisk.document.title, "Column level");
    assert.match(onDisk.domains.content, /Content retitled/);

    const afterPedagogy = await store.replaceDomain({
      draftId: "column-level",
      domain: "pedagogy",
      projection: {
        bridges: [{ id: "b", term: "Bridge", relationKind: "continuity" }],
        lenses: [{ id: "lens", prompt: "New", explanation: "E" }]
      },
      expectedRevision: afterContent.revision
    });
    assert.equal(afterPedagogy.documentStale, true);
    assert.equal(afterPedagogy.document.bridges[0].relationKind, "continuity");
    assert.equal(afterPedagogy.document.title, "Content retitled");

    const materialized = await store.materializeDraft("column-level");
    assert.equal(materialized.documentStale, false);
    assert.equal(materialized.document.title, "Content retitled");
    assert.equal(materialized.document.bridges[0].relationKind, "continuity");
    const refreshed = JSON.parse(
      await readFile(join(directory, "column-level.json"), "utf8")
    );
    assert.equal(refreshed.documentStale, false);
    assert.equal(refreshed.document.title, "Content retitled");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
