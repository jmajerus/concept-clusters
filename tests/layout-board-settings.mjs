import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import {
  autoBoardConflict,
  autoEnvelopeConflict,
  boardSizeOwner,
  boardSettingsErrors,
  layoutBoardSetting,
  layoutDocumentForMode,
  layoutDocumentWithBoard,
  mergePublishLayout
} from "../modules/layoutDocument.js";
import { boardCanvas, boardSizeFactor, canonicalBoardSizeFactor } from "../modules/puzzleBoardSize.js";
import { starFreeStripEnabled } from "../modules/starLayoutRepository.js";

export const name = "layout board settings: size and free-term strip live with the layout";

export async function run() {
  // Reading: the layout document wins; an explicit null there means the
  // default even when an older puzzle document still carries a value.
  const legacy = { board: { sizeFactor: 1.1, starFreeStrip: true } };
  assert.equal(boardSizeFactor(legacy), 1.1);
  assert.equal(layoutBoardSetting(legacy, "starFreeStrip"), true);
  const moved = { ...legacy, layout: { schemaVersion: 1, modes: {}, board: { sizeFactor: 1.2 } } };
  assert.equal(boardSizeFactor(moved), 1.2);
  assert.equal(layoutBoardSetting(moved, "starFreeStrip"), true, "unset in layout falls back");
  const cleared = { ...legacy, layout: { schemaVersion: 1, modes: {}, board: { sizeFactor: null, starFreeStrip: null } } };
  assert.equal(boardSizeFactor(cleared), 1);
  assert.equal(layoutBoardSetting(cleared, "starFreeStrip"), undefined);
  assert.equal(starFreeStripEnabled({
    clusters: [], bridges: [], layout: { schemaVersion: 1, modes: {}, board: { starFreeStrip: false } }
  }), false);

  // The canvas follows the layout's size.
  const puzzle = {
    clusters: [{ terms: ["alpha", "beta", "gamma"] }, { terms: ["delta", "epsilon", "zeta"] }],
    bridges: [{ term: "eta", clusters: [0, 1] }]
  };
  const base = boardCanvas(puzzle, "graph");
  const grown = boardCanvas({ ...puzzle, layout: { schemaVersion: 1, modes: {}, board: { sizeFactor: 1.1 } } }, "graph");
  assert.ok(grown.width > base.width && grown.height > base.height);

  // Writing: changes merge into the settings; saving a mode keeps them.
  const withSize = layoutDocumentWithBoard({ sizeFactor: 1.1, source: "author" }, null);
  assert.deepEqual(withSize, { schemaVersion: 1, modes: {}, board: { sizeFactor: 1.1, source: "author" } });
  const withStrip = layoutDocumentWithBoard({ starFreeStrip: true }, withSize);
  assert.deepEqual(withStrip.board, { sizeFactor: 1.1, source: "author", starFreeStrip: true });
  const withGraph = layoutDocumentForMode("graph", { nodes: {} }, withStrip);
  assert.deepEqual(withGraph.board, withStrip.board, "a mode save keeps board settings");
  assert.deepEqual(layoutDocumentForMode("graph", null, withGraph).board, withStrip.board);

  // Publishing a working copy: the same keep-published rule as modes.
  const envelope = board => ({ schemaVersion: 1, modes: {}, board });
  const older = envelope({ sizeFactor: 1.1, savedAt: "2026-10-01T00:00:00Z" });
  const newer = envelope({ sizeFactor: 1.2, savedAt: "2026-10-03T00:00:00Z" });
  const keptNewer = mergePublishLayout(older, newer);
  assert.deepEqual(keptNewer.keptPublished, ["board"]);
  assert.equal(keptNewer.layout.board.sizeFactor, 1.2);
  assert.equal(mergePublishLayout(newer, older).layout.board.sizeFactor, 1.2);
  // A working copy that never touched board settings carries the published ones.
  assert.equal(mergePublishLayout({ schemaVersion: 1, modes: {} }, newer).layout.board.sizeFactor, 1.2);
  // An automatic size never beats an author's.
  const autoNewer = envelope({ sizeFactor: 1.25, source: "auto", savedAt: "2026-10-06T00:00:00Z" });
  assert.equal(mergePublishLayout(older, autoNewer).layout.board.sizeFactor, 1.1);
  assert.equal(mergePublishLayout(autoNewer, older).layout.board.sizeFactor, 1.1);

  // Saving: automatic over author is refused.
  assert.match(autoBoardConflict({ source: "auto" }, envelope({ sizeFactor: 1 })), /never replaces/);
  assert.equal(autoBoardConflict({ source: "auto" }, envelope({ sizeFactor: 1.1, source: "auto" })), null);
  assert.equal(autoBoardConflict({ source: "auto" }, null), null);
  assert.equal(autoBoardConflict({ source: "author" }, envelope({ sizeFactor: 1.1, source: "auto" })), null);
  // A whole-document write carrying automatic board settings is checked too.
  assert.match(autoEnvelopeConflict(envelope({ sizeFactor: 1.2, source: "auto" }), envelope({ sizeFactor: 1 })), /never replaces/);

  // Draft layout writes can be conditional on the draft not having changed.
  const directory = await mkdtemp(join(tmpdir(), "cc-layout-board-"));
  try {
    const store = createPuzzleDraftStore({ directory });
    await store.createDraft({
      draftId: "board-cas",
      document: {
        id: "board-cas",
        title: "Board CAS",
        category: "Science",
        clusters: [
          { name: "Alpha", fact: "Alpha.", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
          { name: "Beta", fact: "Beta.", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
        ],
        bridges: [{ term: "link", clusters: ["alpha", "beta"], fact: "Link." }]
      }
    });
    const read = await store.getDraft("board-cas");
    await new Promise(resolve => setTimeout(resolve, 2));
    await store.saveLayout({ draftId: "board-cas", layout: envelope({ sizeFactor: 1.1 }), expectedUpdatedAt: read.updatedAt });
    await assert.rejects(
      store.saveLayout({ draftId: "board-cas", layout: envelope({ sizeFactor: 1.2 }), expectedUpdatedAt: read.updatedAt }),
      error => error.name === "LayoutConflictError"
    );
    assert.equal((await store.getDraft("board-cas")).layout.board.sizeFactor, 1.1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }

  // Board size ownership follows the reading precedence: a layout size
  // decides; a leftover legacy value is only a fallback.
  assert.equal(boardSizeOwner({ sizeFactor: 1.1, source: "auto" }, 1.2), "auto");
  assert.equal(boardSizeOwner({ sizeFactor: 1.1 }, null), "author");
  assert.equal(boardSizeOwner({ sizeFactor: null, source: "author" }, 1.2), "author");
  assert.equal(boardSizeOwner({ starFreeStrip: true }, 1.2), "author");
  assert.equal(boardSizeOwner(null, 1.2), "author");
  assert.equal(boardSizeOwner(null, null), null);

  // Validation.
  assert.deepEqual(boardSettingsErrors({ sizeFactor: 1.1, starFreeStrip: null, source: "author", savedAt: "x" }, canonicalBoardSizeFactor), []);
  assert.ok(boardSettingsErrors({ sizeFactor: 1.13 }, canonicalBoardSizeFactor).length);
  assert.ok(boardSettingsErrors({ starFreeStrip: "yes" }, canonicalBoardSizeFactor).length);
  assert.ok(boardSettingsErrors({ bridgePreconnect: true }, canonicalBoardSizeFactor).length);
}
