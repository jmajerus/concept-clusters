import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assembleStoredDomainDocuments,
  partitionAuthoredDocument
} from "../modules/authoringDomains.js";
import { d1CommitOutcomeUnknown } from "../modules/d1CommitOutcome.js";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import {
  DraftConflictError,
  DraftNotFoundError,
  PublishedIdConflictError,
  draftContentHash,
  serializeDraftDocument
} from "../modules/draftRepository.js";
import { createHttpD1Database, HttpD1Error } from "../modules/httpD1Database.js";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name =
  "Lost draft-write response: recover the committed revision without rereading the document";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const actor = { subject: "owner-1" };
const draftId = "lost-draft";
const document = { id: draftId, title: "Lost response", category: "science" };
const savedDocument = { ...document, title: "Saved anyway" };
const REVISION_SQL = "SELECT revision, content_hash, created_at FROM puzzle_drafts WHERE id = ? AND owner_subject = ?";

function lostResponse(kind) {
  if (kind === "fetch") {
    return new HttpD1Error("D1 request failed: fetch failed", { outcomeUnknown: true });
  }
  if (kind === "internal") return new Error("D1_ERROR: internal error");
  return new HttpD1Error("D1 HTTP 502: response was not JSON", { outcomeUnknown: true });
}

function instrument(database, intercept) {
  const calls = [];
  function wrap(sql, bound) {
    async function invoke(method) {
      const entry = { sql, method };
      calls.push(entry);
      const decision = intercept(entry);
      if (decision instanceof Error) throw decision;
      const result = await bound[method]();
      if (decision?.after) throw decision.after;
      if (decision?.zeroChanges) {
        return { ...result, meta: { ...(result.meta || {}), changes: 0 } };
      }
      return result;
    }
    return {
      sql,
      inner: bound,
      bind(...params) {
        return wrap(sql, bound.bind(...params));
      },
      first: () => invoke("first"),
      all: () => invoke("all"),
      run: () => invoke("run")
    };
  }
  return {
    calls,
    prepare: sql => wrap(sql, database.prepare(sql)),
    async batch(statements) {
      const entry = { sql: statements.map(item => item.sql).join("\n"), method: "batch" };
      calls.push(entry);
      const decision = intercept(entry);
      if (decision instanceof Error) throw decision;
      const result = await database.batch(statements.map(item => item.inner));
      if (decision?.after) throw decision.after;
      if (decision?.zeroChanges) {
        return result.map((entry, index) => {
          const sql = statements[index]?.sql || "";
          if (!/UPDATE puzzle_drafts\b/.test(sql)) return entry;
          return { ...entry, meta: { ...(entry.meta || {}), changes: 0 } };
        });
      }
      return result;
    }
  };
}

function failOnce(predicate, error, { after = false } = {}) {
  let fired = false;
  return entry => {
    if (fired || !predicate(entry)) return undefined;
    fired = true;
    return after ? { after: error } : error;
  };
}

function zeroChangesOnce(predicate) {
  let fired = false;
  return entry => {
    if (fired || !predicate(entry)) return undefined;
    fired = true;
    return { zeroChanges: true };
  };
}

function isDraftUpdate(entry) {
  return /UPDATE puzzle_drafts\b/.test(entry.sql)
    && /revision = revision \+ 1/.test(entry.sql);
}

function assertRevisionProbeOnly(calls, predicate) {
  const index = calls.findIndex(predicate);
  assert.ok(index >= 0, "faulting statement did not run");
  const rest = calls.slice(index + 1);
  assert.ok(rest.length >= 1, "expected a revision probe after the lost response");
  for (const call of rest) {
    assert.equal(call.sql.replace(/\s+/g, " ").trim(), REVISION_SQL);
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function httpDatabase(fetchImpl) {
  return createHttpD1Database({
    accountId: "account-1",
    databaseId: "db-1",
    token: "token",
    fetchImpl
  });
}

async function httpError(fetchImpl) {
  try {
    await httpDatabase(fetchImpl).prepare("UPDATE puzzle_drafts SET revision = revision + 1").run();
  } catch (error) {
    assert.ok(error instanceof HttpD1Error, error?.message || error);
    return error;
  }
  throw new Error("expected an HttpD1Error");
}

function openWrapped(database, intercept) {
  const wrapped = instrument(database, intercept);
  return { calls: wrapped.calls, repository: new D1DraftRepository(wrapped) };
}

async function seeded(intercept = () => undefined) {
  const database = createSqliteD1();
  await new D1DraftRepository(database).create({ draftId, document, actor });
  return { database, ...openWrapped(database, intercept) };
}

function storedRevision(database) {
  return database.sqlite.prepare(
    "SELECT revision, title FROM puzzle_drafts WHERE id = ?"
  ).get(draftId);
}

export async function run() {
  assert.equal(d1CommitOutcomeUnknown(lostResponse("fetch")), true);
  assert.equal(d1CommitOutcomeUnknown(lostResponse("internal")), true);
  assert.equal(d1CommitOutcomeUnknown(lostResponse("json")), true);
  assert.equal(d1CommitOutcomeUnknown(new Error("D1 request failed: fetch failed")), true);
  assert.equal(
    d1CommitOutcomeUnknown(new Error("D1_ERROR: UNIQUE constraint failed: puzzle_drafts.id")),
    false
  );
  assert.equal(
    d1CommitOutcomeUnknown(new Error("D1_ERROR: no such column: classification_json")),
    false
  );

  const fetchFailed = await httpError(async () => {
    throw new TypeError("fetch failed");
  });
  assert.equal(fetchFailed.outcomeUnknown, true);
  assert.match(fetchFailed.message, /fetch failed/);

  const notJson = await httpError(async () => new Response("upstream reset", { status: 502 }));
  assert.equal(notJson.outcomeUnknown, true);
  assert.match(notJson.message, /response was not JSON/);

  const bodyDropped = await httpError(async () => ({
    ok: true,
    status: 200,
    text: async () => {
      throw new TypeError("terminated");
    }
  }));
  assert.equal(bodyDropped.outcomeUnknown, true);
  assert.match(bodyDropped.message, /terminated/);

  const internal = await httpError(async () => jsonResponse({
    success: false,
    errors: [{ message: "D1_ERROR: internal error" }]
  }, 400));
  assert.equal(internal.outcomeUnknown, true);

  const unique = await httpError(async () => jsonResponse({
    success: false,
    errors: [{ message: "UNIQUE constraint failed: puzzle_drafts.id" }]
  }, 400));
  assert.equal(unique.outcomeUnknown, undefined);

  const missingColumn = await httpError(async () => jsonResponse({
    success: false,
    errors: [{ message: "D1_ERROR: no such column: classification_json" }]
  }, 400));
  assert.equal(missingColumn.outcomeUnknown, undefined);

  for (const kind of ["fetch", "internal", "json"]) {
    const error = lostResponse(kind);
    const createdDb = createSqliteD1();
    const created = openWrapped(createdDb, () => undefined);
    const draft = await created.repository.create({ draftId, document, actor });
    assert.equal(draft.revision, 1);
    assert.equal(draft.draftId, draftId);
    assert.equal(draft.document.title, "Lost response");
    assert.equal(draft.documentStale, true);
    assert.equal(Number(storedRevision(createdDb).revision), 1);
    assert.equal(created.calls.some(entry => /SELECT puzzle_drafts\.\*/.test(entry.sql)), false);

    const committedInsert = createSqliteD1();
    const insertFault = openWrapped(
      committedInsert,
      failOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql), error, { after: true })
    );
    const inserted = await insertFault.repository.create({ draftId, document, actor });
    assert.equal(inserted.revision, 1);
    assert.equal(inserted.document.title, "Lost response");
    assertRevisionProbeOnly(
      insertFault.calls,
      entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql)
    );

    const missedInsert = createSqliteD1();
    const missed = openWrapped(
      missedInsert,
      failOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql), error)
    );
    await assert.rejects(
      () => missed.repository.create({ draftId, document, actor }),
      thrown => thrown === error
    );
    assert.equal(storedRevision(missedInsert), undefined);
    assertRevisionProbeOnly(
      missed.calls,
      entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql)
    );

    const trailing = await seeded(() => undefined);
    const saved = await trailing.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    });
    assert.equal(saved.revision, 2);
    assert.equal(saved.document.title, "Saved anyway");
    assert.equal(saved.documentStale, true);
    assert.equal(saved.workingCopyHistoryCount, 1);
    assert.equal(storedRevision(trailing.database).title, "Saved anyway");
    assert.equal(trailing.calls.some(entry => /SELECT puzzle_drafts\.\*/.test(entry.sql)), false);
    assert.equal(
      trailing.calls.filter(entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql)).length,
      1
    );
    const snapshot = trailing.database.sqlite.prepare(`
      SELECT document, content_json FROM puzzle_draft_history WHERE draft_id = ?
    `).get(draftId);
    assert.equal(snapshot.document, null);
    assert.equal(JSON.parse(snapshot.content_json).title, "Lost response");

    const history = await seeded(
      failOnce(
        entry => entry.method === "batch" && /INSERT INTO puzzle_draft_history\b/.test(entry.sql),
        error,
        { after: true }
      )
    );
    const afterHistory = await history.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    });
    assert.equal(afterHistory.revision, 2);
    assert.equal(afterHistory.document.title, "Saved anyway");
    assert.equal(
      Number(history.database.sqlite.prepare(
        "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
      ).get(draftId).n),
      1
    );
    assert.equal(
      history.calls.filter(entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql)).length,
      1
    );
    assertRevisionProbeOnly(
      history.calls,
      entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql)
    );

    const lostUpdate = await seeded(
      failOnce(isDraftUpdate, error, { after: true })
    );
    const recoveredUpdate = await lostUpdate.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    });
    assert.equal(recoveredUpdate.revision, 2);
    assert.equal(recoveredUpdate.document.title, "Saved anyway");
    assertRevisionProbeOnly(lostUpdate.calls, isDraftUpdate);
    assert.equal(
      Number(lostUpdate.database.sqlite.prepare(
        "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
      ).get(draftId).n),
      1
    );
  }

  const unchanged = lostResponse("fetch");
  const uncommitted = await seeded(failOnce(isDraftUpdate, unchanged));
  await assert.rejects(
    () => uncommitted.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    thrown => thrown === unchanged
  );
  assert.equal(Number(storedRevision(uncommitted.database).revision), 1);
  assert.equal(storedRevision(uncommitted.database).title, "Lost response");
  assert.equal(
    Number(uncommitted.database.sqlite.prepare(
      "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
    ).get(draftId).n),
    0
  );

  const definite = new Error("D1_ERROR: NOT NULL constraint failed: puzzle_drafts.title");
  const rejectedCreate = openWrapped(
    createSqliteD1(),
    failOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql), definite)
  );
  await assert.rejects(
    () => rejectedCreate.repository.create({ draftId, document, actor }),
    thrown => thrown === definite
  );
  assert.equal(
    rejectedCreate.calls.some(entry => entry.sql.replace(/\s+/g, " ").trim() === REVISION_SQL),
    false
  );

  const fullHistory = new Error("SQLITE_FULL: database or disk is full");
  const historyFailed = await seeded(
    failOnce(entry => entry.method === "batch" && /INSERT INTO puzzle_draft_history\b/.test(entry.sql), fullHistory)
  );
  await assert.rejects(
    () => historyFailed.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    thrown => thrown === fullHistory
  );
  assert.equal(Number(storedRevision(historyFailed.database).revision), 1);
  assert.equal(
    Number(historyFailed.database.sqlite.prepare(
      "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
    ).get(draftId).n),
    0
  );

  const probeDown = new Error("D1 down");
  const historyLost = lostResponse("internal");
  const probeFailed = await seeded(entry => {
    if (/INSERT INTO puzzle_draft_history\b/.test(entry.sql)) return historyLost;
    if (entry.sql.replace(/\s+/g, " ").trim() === REVISION_SQL) return probeDown;
    return undefined;
  });
  await assert.rejects(
    () => probeFailed.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    thrown => thrown === historyLost
  );

  const conflict = await seeded();
  await assert.rejects(
    () => conflict.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 3
    }),
    error => error instanceof DraftConflictError && /current revision is 1/.test(error.message)
  );
  await assert.rejects(
    () => conflict.repository.save({
      draftId,
      document: savedDocument,
      actor: { subject: "someone-else" },
      expectedRevision: 1
    }),
    error => error instanceof DraftNotFoundError
  );
  await conflict.repository.create({ draftId, document, actor }).then(
    () => { throw new Error("second create should conflict"); },
    error => {
      assert.ok(error instanceof DraftConflictError);
      assert.match(error.message, /already exists at revision 1/);
      assert.equal(error.revision, 1);
    }
  );

  const ambiguous = await seeded();
  const ambiguousCreate = openWrapped(
    ambiguous.database,
    failOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql), lostResponse("internal"))
  );
  await assert.rejects(
    () => ambiguousCreate.repository.create({
      draftId,
      document: { ...document, title: "Not stored" },
      actor
    }),
    error => error instanceof DraftConflictError
      && /already exists at revision 1/.test(error.message)
      && error.revision === 1
  );
  assert.equal(storedRevision(ambiguous.database).title, "Lost response");

  const sameDocument = await seeded();
  const sameCreate = openWrapped(
    sameDocument.database,
    failOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql), lostResponse("internal"))
  );
  const recoveredSame = await sameCreate.repository.create({ draftId, document, actor });
  assert.equal(recoveredSame.revision, 1);
  assert.equal(recoveredSame.document.title, "Lost response");

  const advanced = await seeded();
  advanced.database.sqlite.prepare(
    "UPDATE puzzle_drafts SET revision = 2 WHERE id = ?"
  ).run(draftId);
  const advancedCreate = openWrapped(
    advanced.database,
    failOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql), lostResponse("internal"))
  );
  await assert.rejects(
    () => advancedCreate.repository.create({ draftId, document, actor }),
    error => error instanceof DraftConflictError
      && /already exists at revision 2/.test(error.message)
      && error.revision === 2
  );
  assert.equal(storedRevision(advanced.database).title, "Lost response");

  let bumped = false;
  const raced = await seeded(entry => {
    if (!bumped && isDraftUpdate(entry)) {
      bumped = true;
      raced.database.sqlite.prepare(
        "UPDATE puzzle_drafts SET revision = 4 WHERE id = ?"
      ).run(draftId);
    }
    return undefined;
  });
  await assert.rejects(
    () => raced.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    error => error instanceof DraftConflictError && /current revision is 4/.test(error.message)
  );
  assert.equal(
    Number(raced.database.sqlite.prepare(
      "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
    ).get(draftId).n),
    0
  );

  const capped = await seeded(() => undefined);
  for (let index = 1; index <= 41; index += 1) {
    const current = await capped.repository.get({ draftId, actor });
    await capped.repository.save({
      draftId,
      document: { ...document, title: `Revision ${index}` },
      actor,
      expectedRevision: current.revision
    });
  }
  const keptHistory = capped.database.sqlite.prepare(`
    SELECT seq, content_json FROM puzzle_draft_history
    WHERE draft_id = ? ORDER BY seq ASC
  `).all(draftId);
  assert.equal(keptHistory.length, 40);
  assert.equal(JSON.parse(keptHistory[0].content_json).title, "Revision 1");
  assert.equal(JSON.parse(keptHistory.at(-1).content_json).title, "Revision 40");

  const lostRead = lostResponse("json");
  let moved = false;
  const lostConflict = await seeded(entry => {
    if (!moved && isDraftUpdate(entry)) {
      moved = true;
      lostConflict.database.sqlite.prepare(
        "UPDATE puzzle_drafts SET revision = 4 WHERE id = ?"
      ).run(draftId);
    }
    if (/SELECT puzzle_drafts\.\*/.test(entry.sql)) return lostRead;
    return undefined;
  });
  await assert.rejects(
    () => lostConflict.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    error => error instanceof DraftConflictError && error.revision === 4
  );
  assert.equal(lostConflict.calls.some(entry => /SELECT puzzle_drafts\.\*/.test(entry.sql)), false);
  assert.ok(lostConflict.calls.some(entry => entry.sql.replace(/\s+/g, " ").trim() === REVISION_SQL));

  const domain = await seeded(() => undefined);
  const domainSaved = await domain.repository.saveDomain({
    draftId,
    domain: "content",
    projection: { id: draftId, title: "Domain saved" },
    actor,
    expectedRevision: 1
  });
  assert.equal(domainSaved.revision, 2);
  assert.equal(domainSaved.document.title, "Domain saved");
  assert.equal(domainSaved.document.category, "science");
  assert.equal(domainSaved.documentStale, true);
  assert.equal(domain.calls.some(entry => /SELECT puzzle_drafts\.\*/.test(entry.sql)), false);

  // changes === 0 with this hash is still a conflict. A concurrent writer can
  // store the same document, and a lost meta.changes cannot be told apart from that.
  const omittedChanges = await seeded(
    zeroChangesOnce(isDraftUpdate)
  );
  await assert.rejects(
    () => omittedChanges.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    error => error instanceof DraftConflictError && error.revision === 2
  );
  assert.equal(Number(storedRevision(omittedChanges.database).revision), 2);

  const omittedInsert = openWrapped(
    createSqliteD1(),
    zeroChangesOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql))
  );
  const insertedAnyway = await omittedInsert.repository.create({ draftId, document, actor });
  assert.equal(insertedAnyway.revision, 1);
  assert.equal(insertedAnyway.document.title, "Lost response");

  function publishPuzzle(database, id) {
    database.sqlite.prepare(`
      INSERT INTO published_documents (
        kind, id, title, document, content_hash, revision, published_by, published_at, updated_at
      ) VALUES ('puzzle', ?, 'Lost response', '{}', 'published', 1, 'owner-1', ?, ?)
    `).run(id, "2026-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z");
  }

  const shadowed = createSqliteD1();
  const shadowedRepository = new D1DraftRepository(shadowed);
  await shadowedRepository.create({
    draftId,
    document,
    actor,
    seededFromPublished: true
  });
  publishPuzzle(shadowed, draftId);
  await assert.rejects(
    () => shadowedRepository.create({ draftId, document, actor }),
    error => error instanceof PublishedIdConflictError
  );
  assert.equal(Number(storedRevision(shadowed).revision), 1);

  const seededRecoverDb = createSqliteD1();
  publishPuzzle(seededRecoverDb, draftId);
  const seededRecover = openWrapped(
    seededRecoverDb,
    zeroChangesOnce(entry => /INSERT INTO puzzle_drafts\b/.test(entry.sql))
  );
  const seededAnyway = await seededRecover.repository.create({
    draftId,
    document,
    actor,
    seededFromPublished: true
  });
  assert.equal(seededAnyway.revision, 1);
  assert.equal(seededAnyway.openedFromPublished, true);

  const publishedAfter = createSqliteD1();
  let publishedAfterInsert = false;
  const racedPublish = openWrapped(publishedAfter, entry => {
    const sql = entry.sql.replace(/\s+/g, " ").trim();
    if (!publishedAfterInsert && sql === REVISION_SQL) {
      publishedAfterInsert = true;
      publishPuzzle(publishedAfter, draftId);
    }
    if (/INSERT INTO puzzle_drafts\b/.test(entry.sql)) return { zeroChanges: true };
    return undefined;
  });
  const committedBeforePublish = await racedPublish.repository.create({ draftId, document, actor });
  assert.equal(committedBeforePublish.revision, 1);
  assert.equal(
    publishedAfter.sqlite.prepare(
      "SELECT id FROM published_documents WHERE kind = 'puzzle' AND id = ?"
    ).get(draftId).id,
    draftId
  );

  let probes = 0;
  let lostBatch = false;
  const flakyProbe = await seeded(entry => {
    if (!lostBatch && entry.method === "batch" && /INSERT INTO puzzle_draft_history\b/.test(entry.sql)) {
      lostBatch = true;
      return { after: lostResponse("fetch") };
    }
    if (entry.sql.replace(/\s+/g, " ").trim() === REVISION_SQL) {
      probes += 1;
      if (probes === 1) return lostResponse("json");
    }
    return undefined;
  });
  const retriedProbe = await flakyProbe.repository.save({
    draftId,
    document: savedDocument,
    actor,
    expectedRevision: 1
  });
  assert.equal(retriedProbe.revision, 2);
  assert.equal(probes, 2);

  let exhausted = 0;
  const historyLostForProbe = lostResponse("internal");
  const probeGiveUp = lostResponse("fetch");
  const probeExhausted = await seeded(entry => {
    if (entry.method === "batch" && /INSERT INTO puzzle_draft_history\b/.test(entry.sql)) {
      return { after: historyLostForProbe };
    }
    if (entry.sql.replace(/\s+/g, " ").trim() === REVISION_SQL) {
      exhausted += 1;
      return probeGiveUp;
    }
    return undefined;
  });
  await assert.rejects(
    () => probeExhausted.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    thrown => thrown === historyLostForProbe
  );
  assert.equal(exhausted, 3);

  let conflictProbes = 0;
  const conflictProbeError = lostResponse("fetch");
  const conflictProbe = await seeded(entry => {
    if (isDraftUpdate(entry)) return { zeroChanges: true };
    if (entry.sql.replace(/\s+/g, " ").trim() === REVISION_SQL) {
      conflictProbes += 1;
      return conflictProbeError;
    }
    return undefined;
  });
  await assert.rejects(
    () => conflictProbe.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    }),
    thrown => thrown === conflictProbeError
  );
  assert.equal(conflictProbes, 3);

  const racedUndo = await seeded(() => undefined);
  await racedUndo.repository.save({
    draftId,
    document: savedDocument,
    actor,
    expectedRevision: 1
  });
  const currentUndo = await racedUndo.repository.get({ draftId, actor });
  const priorUndo = racedUndo.database.sqlite.prepare(`
    SELECT document, content_json, pedagogy_json, classification_json, provenance_json, administration_json
    FROM puzzle_draft_history WHERE draft_id = ?
  `).get(draftId);
  const restoredPrior = priorUndo.content_json == null && priorUndo.pedagogy_json == null
    ? JSON.parse(priorUndo.document)
    : assembleStoredDomainDocuments({
      content: JSON.parse(priorUndo.content_json),
      pedagogy: JSON.parse(priorUndo.pedagogy_json),
      classification: priorUndo.classification_json == null ? null : JSON.parse(priorUndo.classification_json),
      provenance: priorUndo.provenance_json == null ? null : JSON.parse(priorUndo.provenance_json),
      administration: priorUndo.administration_json == null ? null : JSON.parse(priorUndo.administration_json)
    });
  const restoredHash = draftContentHash(serializeDraftDocument(assembleStoredDomainDocuments({
    document: restoredPrior,
    administration: partitionAuthoredDocument(currentUndo.document).administration ?? {}
  })));
  let planted = false;
  const racedPop = openWrapped(racedUndo.database, entry => {
    if (planted || entry.method !== "batch" || !/DELETE FROM puzzle_draft_history\b/.test(entry.sql)) {
      return undefined;
    }
    planted = true;
    racedUndo.database.sqlite.prepare(`
      UPDATE puzzle_drafts
      SET revision = 3, content_hash = ?, updated_at = ?
      WHERE id = ?
    `).run(restoredHash, "2000-01-01T00:00:00.000Z", draftId);
    return undefined;
  });
  await assert.rejects(
    () => racedPop.repository.popWorkingCopy({
      draftId,
      actor,
      expectedRevision: 2
    }),
    error => error instanceof DraftConflictError && error.revision === 3
  );
  assert.equal(
    Number(racedUndo.database.sqlite.prepare(
      "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
    ).get(draftId).n),
    1
  );

  const poppedBase = await seeded(() => undefined);
  await poppedBase.repository.save({
    draftId,
    document: savedDocument,
    actor,
    expectedRevision: 1
  });
  const poppedDb = poppedBase.database;
  const poppedFault = openWrapped(
    poppedDb,
    failOnce(entry => entry.method === "batch" && /DELETE FROM puzzle_draft_history\b/.test(entry.sql), lostResponse("fetch"), {
      after: true
    })
  );
  const popped = await poppedFault.repository.popWorkingCopy({
    draftId,
    actor,
    expectedRevision: 2
  });
  assert.equal(popped.revision, 3);
  assert.equal(popped.document.title, "Lost response");
  assert.equal(popped.workingCopyHistoryCount, 0);
  assert.equal(
    Number(poppedDb.sqlite.prepare(
      "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
    ).get(draftId).n),
    0
  );
  assert.equal(
    poppedFault.calls.some(entry => /SELECT puzzle_drafts\.\*/.test(entry.sql) && entry.sql.includes("working_copy_history_count") && poppedFault.calls.indexOf(entry) > poppedFault.calls.findIndex(call => call.method === "batch")),
    false
  );
  await assert.rejects(
    () => poppedFault.repository.popWorkingCopy({
      draftId,
      actor,
      expectedRevision: 3
    }),
    error => error.name === "DraftEmptyHistoryError"
  );

  const unpopped = await seeded(() => undefined);
  await unpopped.repository.save({
    draftId,
    document: savedDocument,
    actor,
    expectedRevision: 1
  });
  const missedPopError = lostResponse("json");
  const missedPop = openWrapped(
    unpopped.database,
    failOnce(entry => entry.method === "batch" && /DELETE FROM puzzle_draft_history\b/.test(entry.sql), missedPopError)
  );
  await assert.rejects(
    () => missedPop.repository.popWorkingCopy({
      draftId,
      actor,
      expectedRevision: 2
    }),
    thrown => thrown === missedPopError
  );
  assert.equal(Number(storedRevision(unpopped.database).revision), 2);
  assert.equal(
    Number(unpopped.database.sqlite.prepare(
      "SELECT COUNT(*) AS n FROM puzzle_draft_history WHERE draft_id = ?"
    ).get(draftId).n),
    1
  );

  const stale = await seeded(() => undefined);
  await stale.repository.saveDomain({
    draftId,
    domain: "content",
    projection: { id: draftId, title: "Domain saved" },
    actor,
    expectedRevision: 1
  });
  const refreshed = await stale.repository.materialize({ draftId, actor });
  assert.equal(refreshed.documentStale, true);
  assert.equal(refreshed.document.title, "Domain saved");
  assert.equal(refreshed.revision, 2);
  assert.equal(
    Number(stale.database.sqlite.prepare(
      "SELECT document_stale FROM puzzle_drafts WHERE id = ?"
    ).get(draftId).document_stale),
    1
  );

  const skill = readFileSync(join(root, ".agents/skills/author-puzzle/SKILL.md"), "utf8");
  assert.match(skill, /Call `get_puzzle_draft` before another save when merging a draft this session has not seen/);
  assert.match(skill, /do not return the document/);
  assert.doesNotMatch(skill, /fetch failed|D1_ERROR|non-JSON/);
  const guidance = readFileSync(join(root, "modules/authoringGuidanceVersion.js"), "utf8");
  assert.match(guidance, /Call get_puzzle_draft only to merge a draft this/);
  assert.match(guidance, /omit the document/);
  assert.match(guidance, /minor: 2\d/);
  assert.doesNotMatch(guidance, /fetch failed|D1_ERROR|non-JSON/);
}
