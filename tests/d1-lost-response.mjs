import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { d1CommitOutcomeUnknown } from "../modules/d1CommitOutcome.js";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { DraftConflictError, DraftNotFoundError } from "../modules/draftRepository.js";
import { createHttpD1Database, HttpD1Error } from "../modules/httpD1Database.js";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name =
  "Lost draft-write response: recover the committed revision without rereading the document";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const actor = { subject: "owner-1" };
const draftId = "lost-draft";
const document = { id: draftId, title: "Lost response", category: "science" };
const savedDocument = { ...document, title: "Saved anyway" };
const REVISION_SQL = "SELECT revision, content_hash FROM puzzle_drafts WHERE id = ? AND owner_subject = ?";

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
    assert.equal(draft.documentStale, false);
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
    assert.equal(saved.documentStale, false);
    assert.equal(saved.workingCopyHistoryCount, 1);
    assert.equal(storedRevision(trailing.database).title, "Saved anyway");
    assert.equal(trailing.calls.some(entry => /SELECT puzzle_drafts\.\*/.test(entry.sql)), false);
    assert.equal(
      trailing.calls.filter(entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql)).length,
      1
    );

    const history = await seeded(
      failOnce(entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql), error)
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
      0
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
      failOnce(entry => entry.method === "run" && /UPDATE puzzle_drafts\b/.test(entry.sql), error, {
        after: true
      })
    );
    const recoveredUpdate = await lostUpdate.repository.save({
      draftId,
      document: savedDocument,
      actor,
      expectedRevision: 1
    });
    assert.equal(recoveredUpdate.revision, 2);
    assert.equal(recoveredUpdate.document.title, "Saved anyway");
    assertRevisionProbeOnly(
      lostUpdate.calls,
      entry => entry.method === "run" && /UPDATE puzzle_drafts\b/.test(entry.sql)
    );
    assert.equal(
      lostUpdate.calls.filter(entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql)).length,
      0
    );
  }

  const unchanged = lostResponse("fetch");
  const uncommitted = await seeded(
    failOnce(entry => entry.method === "run" && /UPDATE puzzle_drafts\b/.test(entry.sql), unchanged)
  );
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
    failOnce(entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql), fullHistory)
  );
  const kept = await historyFailed.repository.save({
    draftId,
    document: savedDocument,
    actor,
    expectedRevision: 1
  });
  assert.equal(kept.revision, 2);
  assert.equal(
    historyFailed.calls.filter(entry => /INSERT INTO puzzle_draft_history\b/.test(entry.sql)).length,
    1
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
    if (!bumped && entry.method === "run" && /UPDATE puzzle_drafts\b/.test(entry.sql)) {
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

  const lostRead = lostResponse("json");
  let moved = false;
  const lostConflict = await seeded(entry => {
    if (!moved && entry.method === "run" && /UPDATE puzzle_drafts\b/.test(entry.sql)) {
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

  const skill = readFileSync(join(root, ".agents/skills/author-puzzle/SKILL.md"), "utf8");
  assert.match(skill, /Call `get_puzzle_draft` before another save when merging a draft this session has not seen/);
  assert.match(skill, /do not return the document/);
  assert.doesNotMatch(skill, /fetch failed|D1_ERROR|non-JSON/);
  const guidance = readFileSync(join(root, "modules/authoringGuidanceVersion.js"), "utf8");
  assert.match(guidance, /Call get_puzzle_draft only to merge a draft this/);
  assert.match(guidance, /omit the document/);
  assert.match(guidance, /minor: 20/);
  assert.doesNotMatch(guidance, /fetch failed|D1_ERROR|non-JSON/);
}
