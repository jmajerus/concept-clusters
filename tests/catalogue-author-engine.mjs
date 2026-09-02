import assert from "node:assert/strict";
import {
  addCatalogueEntry,
  createCatalogueSkeleton,
  moveCatalogueEntry,
  prepareCatalogueDocumentForPublication,
  removeCatalogueEntry,
  setCatalogueEntryReason,
  setCatalogueInfoText,
  setCatalogueOrdered,
  setCatalogueTitle
} from "../modules/catalogueAuthorEngine.js";

export const name = "catalogue author engine: membership, order, and publication shape";

export async function run() {
  const blank = createCatalogueSkeleton({ id: "getting-started-lab", title: "Lab" });
  assert.deepEqual(blank.entries, []);
  assert.equal(blank.ordered, true);

  const withEntry = addCatalogueEntry(blank, "energy-flow", "Start here.");
  assert.equal(withEntry.entries[0].id, "energy-flow");
  assert.throws(() => addCatalogueEntry(withEntry, "energy-flow"), /already in this catalogue/);

  const two = addCatalogueEntry(withEntry, "finite-and-infinite-games");
  const moved = moveCatalogueEntry(two, 1, 0);
  assert.deepEqual(moved.entries.map(entry => entry.id), [
    "finite-and-infinite-games",
    "energy-flow"
  ]);

  const reasoned = setCatalogueEntryReason(moved, "energy-flow", "  ");
  assert.equal(reasoned.entries[1].reason, undefined);

  const titled = setCatalogueTitle(
    setCatalogueInfoText(setCatalogueOrdered(reasoned, false), "A short blurb."),
    " Lab title "
  );
  const prepared = prepareCatalogueDocumentForPublication(titled);
  assert.equal(prepared.title, "Lab title");
  assert.equal(prepared.info.text, "A short blurb.");
  assert.equal(prepared.ordered, false);
  assert.deepEqual(prepared.entries, [
    { id: "finite-and-infinite-games" },
    { id: "energy-flow" }
  ]);

  const preparedMeta = prepareCatalogueDocumentForPublication({
    id: "holding-it-together",
    title: "Holding It Together",
    kind: "meta",
    info: { text: "Four catalogues." },
    entries: [{ id: "arrangements-that-hold", reason: "Start here." }],
    relatedCatalogues: {
      entries: [{ id: "getting-started", reason: "See also." }]
    }
  });
  assert.equal(preparedMeta.kind, "meta");
  assert.equal(preparedMeta.relatedCatalogues.entries[0].id, "getting-started");

  const removed = removeCatalogueEntry(withEntry, "energy-flow");
  assert.deepEqual(removed.entries, []);
}
