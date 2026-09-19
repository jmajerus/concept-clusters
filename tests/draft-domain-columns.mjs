import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

    // Second focused save must leave the raw document cache untouched.
    const afterPedagogyDisk = JSON.parse(
      await readFile(join(directory, "column-level.json"), "utf8")
    );
    assert.equal(afterPedagogyDisk.documentStale, true);
    assert.equal(afterPedagogyDisk.document.title, "Column level");
    assert.match(afterPedagogyDisk.domains.pedagogy, /"relationKind":"continuity"/);

    const materialized = await store.materializeDraft("column-level");
    assert.equal(materialized.documentStale, false);
    assert.equal(materialized.document.title, "Content retitled");
    assert.equal(materialized.document.bridges[0].relationKind, "continuity");
    const refreshed = JSON.parse(
      await readFile(join(directory, "column-level.json"), "utf8")
    );
    assert.equal(refreshed.documentStale, false);
    assert.equal(refreshed.document.title, "Content retitled");

    // Legacy pre-domain file rows: first focused save must seed sibling
    // domain columns so a stale cache does not drop pedagogy/provenance.
    await writeFile(
      join(directory, "legacy-pre-domain.json"),
      `${JSON.stringify({
        draftId: "legacy-pre-domain",
        revision: 1,
        status: "draft",
        contentHash: "legacy",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        document,
        workingCopyStack: []
      }, null, 2)}\n`,
      "utf8"
    );
    const legacy = await store.getDraft("legacy-pre-domain");
    assert.equal(legacy.document.lenses[0].id, "lens");
    const afterLegacy = await store.replaceDomain({
      draftId: "legacy-pre-domain",
      domain: "content",
      projection: {
        id: "legacy-pre-domain",
        title: "Legacy retitled",
        category: "science",
        clusters: document.clusters,
        bridges: document.bridges.map(({ id, term, clusters, fact }) => ({
          id, term, clusters, fact
        }))
      },
      expectedRevision: legacy.revision
    });
    assert.equal(afterLegacy.documentStale, true);
    assert.equal(afterLegacy.document.title, "Legacy retitled");
    assert.equal(afterLegacy.document.lenses[0].id, "lens");
    const legacyDisk = JSON.parse(
      await readFile(join(directory, "legacy-pre-domain.json"), "utf8")
    );
    assert.ok(legacyDisk.domains?.content);
    assert.ok(legacyDisk.domains?.pedagogy);
    assert.match(legacyDisk.domains.pedagogy, /"id":"lens"/);

    // Revert after a focused save must clear documentStale.
    const afterPop = await store.popWorkingCopy({
      draftId: "legacy-pre-domain",
      expectedRevision: afterLegacy.revision
    });
    assert.equal(afterPop.documentStale, false);
    assert.equal(afterPop.document.title, "Column level");
    assert.equal(afterPop.document.lenses[0].id, "lens");

    // Concurrent focused saves with the same expectedRevision: one wins, one conflicts.
    const raceBase = await store.createDraft({
      draftId: "race-domain",
      document: { ...document, id: "race-domain", title: "Race" }
    });
    const contentProjection = {
      id: "race-domain",
      title: "Race content",
      category: "science",
      clusters: document.clusters,
      bridges: document.bridges.map(({ id, term, clusters, fact }) => ({
        id, term, clusters, fact
      }))
    };
    const pedagogyProjection = {
      bridges: [{ id: "b", term: "Bridge", relationKind: "analogy" }],
      lenses: [{ id: "lens", prompt: "Race", explanation: "E" }]
    };
    const raced = await Promise.allSettled([
      store.replaceDomain({
        draftId: "race-domain",
        domain: "content",
        projection: contentProjection,
        expectedRevision: raceBase.revision
      }),
      store.replaceDomain({
        draftId: "race-domain",
        domain: "pedagogy",
        projection: pedagogyProjection,
        expectedRevision: raceBase.revision
      })
    ]);
    const fulfilled = raced.filter(result => result.status === "fulfilled");
    const rejected = raced.filter(result => result.status === "rejected");
    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.match(String(rejected[0].reason?.message || rejected[0].reason), /revision conflict/i);

    // Stale rows missing a write-domain projection fail closed.
    const { assembleAuthoredDocumentFromDraftRow } = await import(
      "../modules/authoringDomains.js"
    );
    assert.throws(
      () => assembleAuthoredDocumentFromDraftRow({
        document_stale: 1,
        document: JSON.stringify(document),
        content_json: JSON.stringify({ id: "x", title: "Only content" }),
        pedagogy_json: null,
        provenance_json: null
      }),
      /missing durable content\/pedagogy/
    );
    assert.throws(
      () => assembleAuthoredDocumentFromDraftRow({
        document_stale: 1,
        document: JSON.stringify(document),
        content_json: null,
        pedagogy_json: null,
        provenance_json: null
      }),
      /missing durable content\/pedagogy/
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
