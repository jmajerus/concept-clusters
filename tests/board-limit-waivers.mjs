import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  boardLimit,
  boardLimitWaiverErrors
} from "../modules/boardLimitWaivers.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { diffPublishedDraft } from "../modules/draftReviewDiff.js";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";
import { renderDraftPage } from "../modules/draftReviewPage.js";
import { CATEGORIES } from "../puzzles/categories.js";

export const name = "board limit waivers: count-based grants, D1 audit and undo, migration, schema drift";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const draftId = "waiver-board";
const reviewer = { subject: "human", name: "Reviewer" };
const reason = "Every one of these terms marks a distinct usage boundary.";

function terms(count, prefix = "t") {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
}

function puzzleWith(clusterTerms) {
  return {
    id: draftId,
    title: "Waiver board",
    category: "Science",
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Claude", model: "Claude Opus 5.5", reasoning: "high" }]
    },
    clusters: [
      { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: clusterTerms.slice(0, 2), floatingTerms: clusterTerms.slice(2) },
      { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
    ],
    bridges: []
  };
}

function codes(document) {
  return boardLimitWaiverErrors(document).map(error => error.match(/^\[([^\]]+)\]/)[1]);
}

async function staticSchemaDrift() {
  const { normalLimit, approvedLimit } = boardLimit("cluster-term-count");
  const simplified = JSON.parse(await readFile(join(root, "content/schemas/simplified-puzzle-schema-v1.json"), "utf8"));
  const stored = JSON.parse(await readFile(join(root, "content/schemas/puzzle-v1.schema.json"), "utf8"));
  const zodText = await readFile(join(root, "content/schemas/simplified-zod-puzzle-schema.ts"), "utf8");
  const cluster = JSON.stringify(simplified);
  assert.match(cluster, new RegExp(`"floatingTerms":\\{"type":"array","minItems":1,"maxItems":${approvedLimit - 2}`));
  assert.match(cluster, new RegExp(`"terms":\\{"type":"array","minItems":2,"maxItems":${approvedLimit},`));
  assert.match(JSON.stringify(stored), new RegExp(`"terms":\\{"type":"array","minItems":2,"maxItems":${approvedLimit},`));
  assert.match(zodText, new RegExp(`floatingTerms: z\\.array\\(TermSchema\\)\\.min\\(1\\)\\.max\\(${approvedLimit - 2}\\)`));
  assert.match(zodText, new RegExp(`terms: z\\.array\\(TermSchema\\)\\.min\\(2\\)\\.max\\(${approvedLimit}\\)`));
  assert.ok(normalLimit < approvedLimit);
}

// 0032 allowed one pending request per term list; 0033 collapses lists to a
// size, so same-length pending lists must not collide on the new index.
function migrationCollapsesPendingLists() {
  const database = createSqliteD1({
    before: (number, sqlite) => {
      if (number !== 33) return;
      sqlite.prepare(`INSERT INTO puzzle_drafts
        (id, owner_subject, status, document, content_hash, created_at, updated_at)
        VALUES ('d', 'human', 'draft', '{}', 'h', '2026-10-01', '2026-10-01')`).run();
      const insert = sqlite.prepare(`INSERT INTO puzzle_cluster_term_exception_requests
        (draft_id, puzzle_id, cluster_id, terms_json, reason, status, requested_by, requested_at, requested_revision)
        VALUES ('d', 'p', 'c', ?, 'why', 'pending', 'me', ?, 1)`);
      insert.run(JSON.stringify(terms(8)), "2026-10-01");
      insert.run(JSON.stringify(terms(8, "u")), "2026-10-02");
      // A request whose draft was deleted is dropped, not carried forward.
      sqlite.prepare(`INSERT INTO puzzle_cluster_term_exception_requests
        (draft_id, puzzle_id, cluster_id, terms_json, reason, status, requested_by, requested_at, requested_revision)
        VALUES ('gone', 'p', 'c', '[]', 'why', 'declined', 'me', '2026-09-01', 1)`).run();
    }
  });
  const rows = database.sqlite.prepare(
    "SELECT requested_count, status FROM puzzle_board_limit_waiver_requests ORDER BY requested_at"
  ).all().map(row => ({ ...row }));
  assert.deepEqual(rows, [
    { requested_count: 8, status: "superseded" },
    { requested_count: 8, status: "pending" }
  ]);
}

async function d1GrantRevokeUndo(approvedLimit) {
  const database = createSqliteD1();
  const repository = new D1DraftRepository(database);
  const actor = { subject: "human", name: "Reviewer" };
  let draft = await repository.create({ draftId, document: puzzleWith(terms(approvedLimit)), actor });
  const request = await repository.requestBoardLimitWaiver({
    draftId, waiverType: "cluster-term-count", targetId: "alpha", reason, actor,
    expectedRevision: draft.revision
  });

  // A save that lands between the preflight read and the batch takes the
  // revision this grant expected; no audit row may claim the grant happened.
  const batch = database.batch.bind(database);
  database.batch = async statements => {
    database.sqlite.prepare("UPDATE puzzle_drafts SET revision = revision + 1, content_hash = 'other' WHERE id = ?").run(draftId);
    database.batch = batch;
    return batch(statements);
  };
  await assert.rejects(repository.decideBoardLimitWaiver({
    draftId, requestId: request.id, decision: "granted", actor, expectedRevision: draft.revision
  }), /revision conflict/i);
  assert.equal(database.sqlite.prepare("SELECT status FROM puzzle_board_limit_waiver_requests").get().status, "pending");
  assert.equal(database.sqlite.prepare("SELECT count(*) n FROM puzzle_board_limit_waiver_events").get().n, 0);

  draft = await repository.get({ draftId, actor });
  draft = await repository.decideBoardLimitWaiver({
    draftId, requestId: request.id, decision: "granted", actor, expectedRevision: draft.revision
  });
  assert.equal(draft.document.boardLimitWaivers.length, 1);
  draft = await repository.revokeBoardLimitWaiver({
    draftId, waiverType: "cluster-term-count", targetId: "alpha", actor, expectedRevision: draft.revision
  });
  assert.equal(draft.document.boardLimitWaivers, undefined);

  // Undo is a content operation; it must not revive the revoked grant.
  draft = await repository.popWorkingCopy({ draftId, actor, expectedRevision: draft.revision });
  assert.equal(draft.document.boardLimitWaivers, undefined);

  // A decline that loses a race to a grant elsewhere must not report success.
  const raced = await repository.requestBoardLimitWaiver({
    draftId, waiverType: "cluster-term-count", targetId: "alpha",
    reason: `${reason} (second request)`, actor, expectedRevision: draft.revision
  });
  const prepare = database.prepare;
  database.prepare = sql => {
    if (sql.includes("SET status = 'declined'")) {
      database.sqlite.prepare("UPDATE puzzle_board_limit_waiver_requests SET status = 'granted' WHERE id = ?").run(raced.id);
      database.prepare = prepare;
    }
    return prepare(sql);
  };
  await assert.rejects(repository.decideBoardLimitWaiver({
    draftId, requestId: raced.id, decision: "declined", actor, expectedRevision: draft.revision
  }), /no longer pending/);
  database.sqlite.prepare("UPDATE puzzle_board_limit_waiver_requests SET status = 'superseded' WHERE id = ?").run(raced.id);

  // A double-submitted revoke lands one document and one audit event.
  draft = await repository.grantBoardLimitWaiverDirect({
    draftId, waiverType: "cluster-term-count", targetId: "alpha", reason, actor,
    expectedRevision: draft.revision
  });
  const revoke = () => repository.revokeBoardLimitWaiver({
    draftId, waiverType: "cluster-term-count", targetId: "alpha", actor, expectedRevision: draft.revision
  });
  const outcomes = await Promise.allSettled([revoke(), revoke()]);
  assert.deepEqual(outcomes.map(outcome => outcome.status).sort(), ["fulfilled", "rejected"]);
  const events = database.sqlite.prepare(
    "SELECT event_type FROM puzzle_board_limit_waiver_events ORDER BY id"
  ).all().map(row => row.event_type);
  assert.deepEqual(events, ["granted", "revoked", "granted", "revoked"]);

  // Requests go with their draft; a reused id starts with none.
  await repository.delete({ draftId, actor });
  await repository.create({ draftId, document: puzzleWith(terms(approvedLimit)), actor: { subject: "someone-else" } });
  assert.deepEqual(await repository.listBoardLimitWaiverRequests({ draftId, actor: { subject: "someone-else" } }), []);
  assert.equal(database.sqlite.prepare("SELECT count(*) n FROM puzzle_board_limit_waiver_events").get().n, 4);
}

export async function run() {
  await staticSchemaDrift();
  migrationCollapsesPendingLists();

  const { normalLimit, approvedLimit } = boardLimit("cluster-term-count");
  assert.deepEqual(codes(puzzleWith(terms(normalLimit))), []);
  assert.deepEqual(codes(puzzleWith(terms(approvedLimit))), ["board-limit-waiver-required"]);
  assert.deepEqual(codes(puzzleWith(terms(approvedLimit + 1))), ["board-limit-hard-limit"]);

  const directory = await mkdtemp(join(tmpdir(), "cc-board-limit-waivers-"));
  try {
    const store = createPuzzleDraftStore({ directory });
    let draft = await store.createDraft({ draftId, document: puzzleWith(terms(approvedLimit)) });

    await assert.rejects(
      store.requestBoardLimitWaiver({
        draftId, waiverType: "cluster-term-count", targetId: "beta",
        reason, expectedRevision: draft.revision, actor: reviewer
      }),
      /must hold more than/
    );

    const request = await store.requestBoardLimitWaiver({
      draftId, waiverType: "cluster-term-count", targetId: "alpha",
      reason, expectedRevision: draft.revision, actor: reviewer
    });
    assert.equal(request.count, approvedLimit);

    // The decision sits inside the Review section, counted in its summary,
    // and Publish says why it is waiting.
    const page = renderDraftPage({
      ...draft, draftId, puzzleId: draftId, status: "draft",
      validation: { valid: false, errors: [] },
      boardLimitWaiverRequests: [request]
    }, { categoryRegistry: CATEGORIES });
    const review = page.slice(page.indexOf("<h2>Review</h2>"));
    assert.match(review, /1 waiver request awaiting decision/);
    assert.match(review.slice(0, review.indexOf("</section>")), /<h3>Board limits<\/h3>[\s\S]*Awaiting decision[\s\S]*Grant waiver/);
    assert.equal(page.includes("<h2>Board limit waivers</h2>"), false);
    assert.match(page, /1 board-limit waiver request is awaiting decision under Review/);

    // Once the board is back within the ordinary limit the request is stale:
    // still listed for a decision, but no longer said to block publishing.
    const stalePage = renderDraftPage({
      ...draft, document: puzzleWith(terms(normalLimit)), draftId, puzzleId: draftId,
      status: "draft", validation: { valid: true, errors: [] },
      boardLimitWaiverRequests: [request]
    }, { categoryRegistry: CATEGORIES });
    assert.match(stalePage, /1 waiver request awaiting decision/);
    assert.doesNotMatch(stalePage, /blocks publishing/);

    draft = await store.decideBoardLimitWaiver({
      draftId, requestId: request.id, decision: "granted",
      expectedRevision: draft.revision, actor: reviewer
    });
    const [grant] = draft.document.boardLimitWaivers;
    assert.deepEqual(Object.keys(grant).sort(), [
      "approvedCount", "grantedAt", "grantedBy", "puzzleId", "reason", "targetId", "waiverType"
    ]);
    assert.equal(grant.approvedCount, approvedLimit);
    assert.deepEqual(codes(draft.document), []);

    // The grant is a layout allowance: swapping a term or shrinking keeps it.
    const swapped = puzzleWith([...terms(approvedLimit - 1), "a much longer replacement term"]);
    assert.deepEqual(codes({ ...swapped, boardLimitWaivers: [grant] }), []);
    assert.deepEqual(codes({ ...puzzleWith(terms(normalLimit)), boardLimitWaivers: [grant] }), []);
    const moved = { ...swapped, clusters: swapped.clusters.map(cluster =>
      cluster.id === "alpha" ? { ...cluster, id: "gamma" } : cluster) };
    assert.deepEqual(codes({ ...moved, boardLimitWaivers: [grant] }), ["board-limit-waiver-required"]);

    // A full-document save keeps the human's grant; it cannot drop or supply one.
    draft = await store.replaceDraft({
      draftId, document: swapped, expectedRevision: draft.revision
    });
    assert.deepEqual(draft.document.boardLimitWaivers, [grant]);
    assert.deepEqual(codes(draft.document), []);

    draft = await store.revokeBoardLimitWaiver({
      draftId, waiverType: "cluster-term-count", targetId: "alpha",
      expectedRevision: draft.revision, actor: reviewer
    });
    assert.equal(draft.document.boardLimitWaivers, undefined);
    const history = await store.listBoardLimitWaiverRequests(draftId);
    assert.deepEqual(history.map(item => item.status), ["revoked"]);

    // A waiver-only change (here, revoking) is a publishable difference.
    const published = { ...draft.document, boardLimitWaivers: [grant] };
    assert.ok(diffPublishedDraft(published, draft.document).fields.boardLimitWaivers);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }

  await d1GrantRevokeUndo(approvedLimit);
}
