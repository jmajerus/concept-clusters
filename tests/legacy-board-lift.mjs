import assert from "node:assert/strict";
import {
  D1ContentDocumentRepository,
  createMemoryContentDocumentRepository
} from "../modules/contentDocumentRepository.js";
import { samePlayablePuzzle, unpublishedChangeDomains } from "../modules/draftReviewDiff.js";
import {
  LAYOUT_BOARD_KEYS,
  autoBoardConflict,
  layoutBoardSetting,
  layoutDocumentWithBoard,
  liftLegacyBoard
} from "../modules/layoutDocument.js";
import { draftMatchesCheckout } from "../modules/localDraftReview.js";
import { puzzleToSimplified } from "../modules/puzzleSimplified.js";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import { applyLegacyBoardLift, LIFT_ACTOR, planLegacyBoardLift } from "../tools/lift-legacy-board.mjs";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name = "legacy board lift: board settings leave the document for the layout without changing play";

const envelope = (board, modes = {}) => ({ schemaVersion: 1, modes, board });
const actor = { subject: "author-1" };
const puzzle = (extra = {}) => ({
  id: "lift-lab",
  title: "Lift lab",
  category: "Science",
  clusters: [
    { name: "Alpha", fact: "Alpha fact.", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
    { name: "Beta", fact: "Beta fact.", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
  ],
  bridges: [{ term: "link", clusters: ["alpha", "beta"], fact: "Connects the two." }],
  ...extra
});

// A git checkout file is the canonical simplified document.
const canonical = document => puzzleToSimplified(puzzleFromAuthoredDocument(document).puzzle);

// Every board setting, read as play reads it.
const settings = (document, layout) => Object.fromEntries(
  LAYOUT_BOARD_KEYS.map(key => [key, layoutBoardSetting({ board: document?.board, layout }, key)])
);

export async function run() {
  // Lifting leaves every setting play reads exactly as it was.
  const legacy = { sizeFactor: 1.1, starFreeStrip: false, bridgePreconnect: true, lensFlowTrace: true, lensRevealCue: "both" };
  const layouts = [
    null,
    envelope(undefined, { star: { nodes: {} } }),
    envelope({ sizeFactor: 1.2, savedAt: "2026-10-01T00:00:00Z" }),
    envelope({ lensFlowTrace: null, bridgePreconnect: false, source: "author" }),
    envelope({ sizeFactor: 1.25, source: "auto" })
  ];
  for (const layout of layouts) {
    const document = puzzle({ board: legacy });
    const lift = liftLegacyBoard(document, layout);
    assert.equal(Object.hasOwn(lift.document, "board"), false);
    assert.deepEqual(settings(lift.document, lift.layout), settings(document, layout), JSON.stringify(layout));
  }
  const kept = liftLegacyBoard(puzzle({ board: { lensFlowTrace: true } }), envelope({ lensFlowTrace: null, savedAt: "x" }, { star: { nodes: {} } }));
  assert.deepEqual(kept.lifted, [], "a setting the layout decides is dropped, not lifted");
  const fresh = liftLegacyBoard(puzzle({ board: { lensFlowTrace: true } }), envelope({ sizeFactor: 1.1, savedAt: "x" }, { star: { nodes: {} } }));
  assert.deepEqual(fresh.layout, envelope({ sizeFactor: 1.1, savedAt: "x", lensFlowTrace: true }, { star: { nodes: {} } }),
    "modes and the save stamp stay; lifted values carry no stamp of their own");
  // A lifted setting joins the board as it stands, owner and save time
  // included; on an automatic board, the automatic pass's next size keeps it.
  const onAuto = liftLegacyBoard(puzzle({ board: { lensFlowTrace: true } }), envelope({ sizeFactor: 1, source: "auto", savedAt: "a" }));
  assert.deepEqual(onAuto.layout.board, { sizeFactor: 1, source: "auto", savedAt: "a", lensFlowTrace: true });
  const resized = { sizeFactor: 1.1, source: "auto" };
  assert.equal(autoBoardConflict(resized, onAuto.layout), null);
  assert.equal(layoutDocumentWithBoard(resized, onAuto.layout).board.lensFlowTrace, true);
  const plain = puzzle();
  assert.equal(liftLegacyBoard(plain, null).document, plain, "a document without board is returned as is");

  // Publishing and seeding store the canonical pair, in memory and in D1.
  for (const repo of [createMemoryContentDocumentRepository(), new D1ContentDocumentRepository(createSqliteD1())]) {
    const published = await repo.publish({
      kind: "puzzle",
      id: "lift-lab",
      document: puzzle({ board: { lensFlowTrace: true } }),
      actor,
      layout: envelope({ sizeFactor: 1.1 })
    });
    assert.equal(published.document.board, undefined);
    assert.deepEqual(published.layout.board, { sizeFactor: 1.1, lensFlowTrace: true });
    // A publish that keeps the stored layout lifts into that one.
    const kept = await repo.publish({
      kind: "puzzle",
      id: "lift-lab",
      document: puzzle({ board: { bridgePreconnect: true } }),
      actor
    });
    assert.deepEqual(kept.layout.board, { sizeFactor: 1.1, lensFlowTrace: true, bridgePreconnect: true });
    await repo.seedPublishedManyIfAbsent([{
      kind: "puzzle",
      id: "lift-seed",
      document: puzzle({ id: "lift-seed", board: { starFreeStrip: true } }),
      layout: null
    }]);
    const seeded = await repo.getPublished({ kind: "puzzle", id: "lift-seed" });
    assert.equal(seeded.document.board, undefined);
    assert.deepEqual(seeded.layout.board, { starFreeStrip: true });
  }

  // Comparisons read board settings where play does, so a lifted published
  // row and a working copy still carrying the same values agree.
  const draftDocument = puzzle({ board: { lensFlowTrace: true } });
  const lifted = liftLegacyBoard(draftDocument, null);
  assert.deepEqual(unpublishedChangeDomains(lifted.document, draftDocument, { publishedLayout: lifted.layout }), []);
  assert.deepEqual(
    unpublishedChangeDomains(lifted.document, puzzle({ board: { lensFlowTrace: true, bridgePreconnect: true } }), { publishedLayout: lifted.layout }),
    ["layout"],
    "a real board difference reads as a layout change"
  );
  assert.equal(samePlayablePuzzle(draftDocument, lifted.document), true);
  assert.equal(draftMatchesCheckout(draftDocument, canonical(lifted.document)), true);

  // The one-time pass: lift, bump the revision, and cue only rows that match git.
  const database = createSqliteD1();
  const repo = new D1ContentDocumentRepository(database);
  const insert = (id, board, cue) => database.prepare(`
    INSERT INTO published_documents (kind, id, title, document, content_hash, revision, published_by,
      published_at, first_published_at, updated_at, layout_json, cued_for_freeze_at, cued_for_freeze_by)
    VALUES ('puzzle', ?, 'Lift lab', ?, 'h', 3, 'author-1', 'now', 'now', 'now', ?, ?, ?)
  `).bind(id, JSON.stringify(puzzle({ id, board })), JSON.stringify(envelope({ sizeFactor: 1.1 })), cue?.at ?? null, cue?.by ?? null).run();
  await insert("seeded", { lensFlowTrace: true }, { at: "then", by: "git-seed" });
  await insert("held", { bridgePreconnect: true }, null);
  await insert("clean", undefined, { at: "then", by: "git-seed" });
  await insert("disputed", { lensFlowTrace: true }, { at: "then", by: "git-seed" });
  const rows = (await database.prepare("SELECT * FROM published_documents").all()).results;
  const checkout = {
    seeded: canonical(puzzle({ id: "seeded", board: { lensFlowTrace: true } })),
    held: canonical(puzzle({ id: "held", title: "Older title" }))
  };
  // A working copy that turned the trace off keeps its puzzle waiting.
  const draftRows = [
    { id: "disputed", owner_subject: "author-1", administration_json: null },
    { id: "seeded", owner_subject: "author-1", administration_json: JSON.stringify({ board: { lensFlowTrace: true } }) }
  ];
  const plan = await planLegacyBoardLift({ publishedRows: rows, draftRows, readCheckout: async id => checkout[id] || null });
  assert.deepEqual(plan.rows.map(row => [row.id, row.matchesGit, row.draftsDisagree.length]),
    [["seeded", true, 0], ["held", false, 0], ["disputed", false, 1]]);
  // A layout saved after planning moves the update time: that row is skipped,
  // with no history row or cue.
  await database.prepare("UPDATE published_documents SET updated_at = 'later' WHERE id = 'held'").run();
  const result = await applyLegacyBoardLift(database, plan, { cue: true, now: "2026-10-14T00:00:00Z" });
  assert.deepEqual(result.cued, ["seeded"]);
  assert.deepEqual(result.skipped, ["held"]);
  assert.equal(result.applied, 1);
  assert.equal((await repo.getPublished({ kind: "puzzle", id: "held" })).revision, 3);
  assert.equal((await database.prepare(
    "SELECT COUNT(*) AS n FROM published_document_revisions WHERE id = 'held'"
  ).first()).n, 0, "a skipped row gets no history row");
  assert.equal((await repo.getPublished({ kind: "puzzle", id: "disputed" })).revision, 3, "a disputed row waits");
  const replanned = await planLegacyBoardLift({
    publishedRows: (await database.prepare("SELECT * FROM published_documents").all()).results,
    draftRows,
    readCheckout: async id => checkout[id] || null
  });
  await applyLegacyBoardLift(database, { rows: replanned.rows.filter(row => row.id === "held") }, { now: "2026-10-14T00:00:01Z" });
  const seededRow = await repo.getPublished({ kind: "puzzle", id: "seeded" });
  assert.equal(seededRow.revision, 4);
  assert.equal(seededRow.document.board, undefined);
  assert.deepEqual(seededRow.layout.board, { sizeFactor: 1.1, lensFlowTrace: true });
  assert.equal(seededRow.cuedForFreezeBy, LIFT_ACTOR);
  const heldRow = await repo.getPublished({ kind: "puzzle", id: "held" });
  assert.equal(heldRow.cuedForFreezeAt, null, "a held publish is lifted but never cued");
  assert.equal(heldRow.layout.board.bridgePreconnect, true);
  const history = await database.prepare(
    "SELECT published_by FROM published_document_revisions WHERE id = 'held' AND revision = 4"
  ).first();
  assert.equal(history?.published_by, LIFT_ACTOR, "the lift is its own revision in the history");
  assert.equal((await repo.getPublished({ kind: "puzzle", id: "clean" })).revision, 3, "rows without board are left alone");
  // A second run finds only the disputed row left.
  const again = await planLegacyBoardLift({
    publishedRows: (await database.prepare("SELECT * FROM published_documents").all()).results,
    draftRows,
    readCheckout: async () => null
  });
  assert.deepEqual(again.rows.map(row => row.id), ["disputed"]);
}
