import {
  assertDraftId,
  DraftConflictError,
  PublishedIdConflictError,
  DraftEmptyHistoryError,
  DraftNotFoundError,
  DraftRepository,
  draftContentHash,
  MAX_WORKING_COPY_HISTORY,
  normalizeDraftActor,
  serializeDraftDocument
} from "./draftRepository.js";
import {
  applyAuthoredDomain,
  assertNoWriteOnceDrift,
  assembleStoredDomainDocuments,
  assembleAuthoredDocumentFromDraftRow,
  AUTHORING_WRITE_DOMAINS,
  domainColumnsForSave,
  partitionAuthoredDocument,
  storedDomainDocuments
} from "./authoringDomains.js";
import {
  LayoutConflictError,
  parseLayoutDocument,
  serializeLayoutDocument
} from "./layoutDocument.js";
import { parseReviewBaseline, serializeReviewBaseline } from "./reviewBaseline.js";
import {
  boardLimitWaiverPolicy,
  boardLimitWaiverRequestIsCurrent,
  grantBoardLimitWaiver,
  makeBoardLimitWaiverRequest,
  preserveCurrentBoardLimitWaivers,
  revokeBoardLimitWaiver as withoutBoardLimitWaiver
} from "./boardLimitWaivers.js";
import { d1CommitOutcomeUnknown } from "./d1CommitOutcome.js";

function parsedJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON: ${error.message}`);
  }
}

function metadata(row) {
  return {
    draftId: row.id,
    puzzleId: row.puzzle_id,
    title: row.title,
    status: row.status,
    revision: Number(row.revision),
    contentHash: row.content_hash,
    installedContentHash: row.installed_content_hash || null,
    baseCommitSha: row.base_commit_sha,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documentStale: Number(row.document_stale || 0) === 1,
    openedFromPublished: Number(row.opened_from_published || 0) === 1,
    hasReviewBaseline: row.review_baseline_json != null && row.review_baseline_json !== "",
    reviewBasePublishedRevision: row.review_base_published_revision == null
      ? null
      : Number(row.review_base_published_revision)
  };
}

function assembleRowDocument(row) {
  return assembleAuthoredDocumentFromDraftRow(row, { parseJson: parsedJson });
}

const CLASSIFICATION_COLUMN_MIGRATION =
  "puzzle_drafts.classification_json is missing. Apply d1/migrations/0028_classification_domain.sql before writing drafts.";

// SELECT and UPDATE say "no such column: name". INSERT says
// "table puzzle_drafts has no column named name".
function sqliteMissingColumn(message, column) {
  const text = String(message || "");
  const name = column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`no such column:?\\s*${name}\\b`, "i").test(text)
    || new RegExp(`has no column named\\s+${name}\\b`, "i").test(text);
}

function rethrowMissingDomainColumn(error) {
  const message = String(error?.message || error);
  if (sqliteMissingColumn(message, "administration_json")) {
    throw new Error(
      "puzzle_drafts.administration_json is missing. Apply d1/migrations/0030_administration_domain.sql before writing drafts."
    );
  }
  if (sqliteMissingColumn(message, "classification_json")) {
    throw new Error(CLASSIFICATION_COLUMN_MIGRATION);
  }
  throw error;
}

async function runDraftWrite(statement) {
  try {
    return await statement.run();
  } catch (error) {
    rethrowMissingDomainColumn(error);
  }
}

function domainColumnValues(current, domain, domains) {
  return domainColumnsForSave({
    content: current.content_json,
    pedagogy: current.pedagogy_json,
    classification: current.classification_json
  }, domain, domains);
}

function reviewStackLoadedFromRow(row) {
  if (!row.review_baseline_json) return false;
  try {
    return parseReviewBaseline(row.review_baseline_json)?.stackLoaded === true;
  } catch {
    return false;
  }
}

function fullDraft(row) {
  return {
    ...metadata(row),
    reviewStackLoaded: reviewStackLoadedFromRow(row),
    workingCopyHistoryCount: Number(row.working_copy_history_count || 0),
    validation: row.validation_json
      ? parsedJson(row.validation_json, "Stored validation")
      : null,
    layout: row.layout_json == null
      ? null
      : parseLayoutDocument(row.layout_json, "Stored layout"),
    document: assembleRowDocument(row)
  };
}

function changes(result) {
  return Number(result?.meta?.changes || 0);
}

// The draft row is the source of truth. A dropped response can arrive after
// the batch has committed. Read revision only — never the document or the
// domain columns — and rebuild the success shape from the document the caller
// already holds. The batch is never retried. A dropped response on this
// select is safe to try again.
const REVISION_PROBE_ATTEMPTS = 3;

async function readWithLostResponseRetry(read) {
  let lastError;
  for (let attempt = 1; attempt <= REVISION_PROBE_ATTEMPTS; attempt += 1) {
    try {
      return await read();
    } catch (error) {
      lastError = error;
      if (!d1CommitOutcomeUnknown(error) || attempt === REVISION_PROBE_ATTEMPTS) throw error;
    }
  }
  throw lastError;
}

async function readCommittedRevision(database, draftId, ownerSubject) {
  return readWithLostResponseRetry(async () => {
    const row = await database.prepare(`
      SELECT revision, content_hash, created_at FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
    `).bind(draftId, ownerSubject).first();
    if (!row) return null;
    const revision = Number(row.revision);
    if (!Number.isInteger(revision) || revision <= 0) return null;
    return {
      revision,
      contentHash: typeof row.content_hash === "string" ? row.content_hash : null,
      createdAt: typeof row.created_at === "string" ? row.created_at : null
    };
  });
}

// Null means the column is not on this database yet. A present column tells a
// fresh create from a seeded working copy that shares this millisecond's stamp.
async function readOpenedFromPublished(database, draftId, ownerSubject) {
  try {
    return await readWithLostResponseRetry(async () => {
      const row = await database.prepare(`
        SELECT opened_from_published FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
      `).bind(draftId, ownerSubject).first();
      if (!row) return false;
      return Number(row.opened_from_published || 0) === 1;
    });
  } catch (error) {
    if (sqliteMissingColumn(String(error?.message || error), "opened_from_published")) return null;
    throw error;
  }
}

function committedDraftView({
  draftId,
  document,
  revision,
  contentHash,
  updatedAt,
  current = null,
  documentStale = false,
  createdAt = null,
  baseCommitSha = null,
  openedFromPublished = false,
  reviewBasePublishedRevision = null,
  status = "draft"
}) {
  const row = {
    id: draftId,
    puzzle_id: typeof document?.id === "string" ? document.id : null,
    title: typeof document?.title === "string" ? document.title : null,
    status: current?.status || status,
    revision,
    content_hash: contentHash,
    installed_content_hash: current?.installed_content_hash || null,
    base_commit_sha: current ? current.base_commit_sha : baseCommitSha,
    created_at: current?.created_at || createdAt || updatedAt,
    updated_at: updatedAt,
    document_stale: documentStale ? 1 : 0,
    opened_from_published: current
      ? current.opened_from_published
      : (openedFromPublished ? 1 : 0),
    review_baseline_json: current?.review_baseline_json || null,
    review_base_published_revision: current
      ? current.review_base_published_revision
      : reviewBasePublishedRevision
  };
  return {
    ...metadata(row),
    reviewStackLoaded: current ? reviewStackLoadedFromRow(current) : false,
    workingCopyHistoryCount: Number(current?.working_copy_history_count || 0),
    validation: null,
    layout: current?.layout_json == null
      ? null
      : parseLayoutDocument(current.layout_json, "Stored layout"),
    document
  };
}

// `expectedRevision` null is a create. The insert stores revision 1 and this
// request's content hash, so a matching row is this insert (or an identical
// draft already at revision 1). Any other row was already there and was not
// overwritten. A save landed only at expectedRevision + 1. History travels in
// that same batch, so a committed save has its undo snapshot.
async function returnCommittedDraft(database, error, {
  draftId,
  ownerSubject,
  expectedRevision = null,
  expectedContentHash = null,
  acceptDefiniteError = false,
  draftAt
}) {
  if (!acceptDefiniteError && !d1CommitOutcomeUnknown(error)) throw error;
  let stored;
  try {
    stored = await readCommittedRevision(database, draftId, ownerSubject);
  } catch {
    throw error;
  }
  const revision = stored?.revision ?? null;
  if (expectedRevision == null) {
    if (
      revision === 1 &&
      stored.contentHash != null &&
      stored.contentHash === expectedContentHash
    ) {
      return draftAt(revision);
    }
    if (revision == null) throw error;
    throw new DraftConflictError(
      `Draft "${draftId}" already exists at revision ${revision}`,
      revision
    );
  }
  if (revision === expectedRevision + 1) {
    // A different hash at the next revision belongs to another writer.
    if (expectedContentHash == null || stored.contentHash === expectedContentHash) {
      return draftAt(revision);
    }
    throw new DraftConflictError(
      `Draft revision conflict: expected ${expectedRevision}, current revision is ${revision}`,
      revision
    );
  }
  if (
    d1CommitOutcomeUnknown(error) &&
    revision != null &&
    revision !== expectedRevision
  ) {
    throw new DraftConflictError(
      `Draft revision conflict: expected ${expectedRevision}, current revision is ${revision}`,
      revision
    );
  }
  throw error;
}

async function rejectConflictUnlessCommitted(repository, {
  draftId,
  ownerSubject,
  expectedRevision
}) {
  let stored;
  try {
    stored = await readCommittedRevision(repository.database, draftId, ownerSubject);
  } catch (error) {
    // The probe already spent its attempts. Recovering here would read the
    // same revision again and start that budget over.
    throw error;
  }
  if (stored == null) throw new DraftNotFoundError(draftId);
  // No reported row change conflicts with the stored revision. A matching
  // hash can belong to another caller that stored the same document, as a
  // double-submitted revoke does. The revision probe confirms a commit when
  // the write throws, which is the lost-response path.
  throw new DraftConflictError(
    `Draft revision conflict: expected ${expectedRevision}, current revision is ${stored.revision}`,
    stored.revision
  );
}

// puzzle_drafts.document is still NOT NULL. Writers store this placeholder
// and set document_stale so readers assemble from the domain columns. The
// column stays until a later migration drops it.
const UNUSED_DOCUMENT_CACHE = "{}";

function withHistoryCount(current, recordHistory) {
  if (!current || !recordHistory) return current;
  return {
    ...current,
    working_copy_history_count: Math.min(
      Number(current.working_copy_history_count || 0) + 1,
      MAX_WORKING_COPY_HISTORY
    )
  };
}

// Copy the current domain columns before the update. The INSERT's WHERE is
// the update's WHERE, so a save that does not match writes no snapshot. A
// pre-domain row still has its document blob; every later row leaves document
// null. The trim runs only when the update changed a row.
function workingCopySnapshotStatements(database, {
  draftId,
  ownerSubject,
  expectedRevision,
  now,
  extraWhere = "",
  extraBindings = []
}) {
  return [
    database.prepare(`
      INSERT INTO puzzle_draft_history (
        draft_id, seq, document,
        content_json, pedagogy_json, classification_json, provenance_json, administration_json,
        content_hash, saved_at
      )
      SELECT
        id,
        COALESCE((SELECT MAX(seq) FROM puzzle_draft_history WHERE draft_id = puzzle_drafts.id), 0) + 1,
        CASE
          WHEN content_json IS NULL AND pedagogy_json IS NULL THEN document
          ELSE NULL
        END,
        content_json, pedagogy_json, classification_json, provenance_json, administration_json,
        content_hash,
        ?
      FROM puzzle_drafts
      WHERE id = ? AND owner_subject = ? AND revision = ?${extraWhere}
    `).bind(now, draftId, ownerSubject, expectedRevision, ...extraBindings),
    database.prepare(`
      DELETE FROM puzzle_draft_history
      WHERE draft_id = ?
        AND changes() = 1
        AND seq <= (
          SELECT MAX(seq) FROM puzzle_draft_history WHERE draft_id = ?
        ) - ?
    `).bind(draftId, draftId, MAX_WORKING_COPY_HISTORY)
  ];
}

function draftWriteBatch({ snapshot, update, after = [] }) {
  return [
    ...(snapshot ? [snapshot[0]] : []),
    update,
    ...(snapshot ? [snapshot[1]] : []),
    ...after
  ];
}

function updateResultIndex(snapshot) {
  return snapshot ? 1 : 0;
}

function historySnapshotDocument(row) {
  const hasDomains = row.content_json != null
    || row.pedagogy_json != null
    || row.classification_json != null
    || row.provenance_json != null
    || row.administration_json != null;
  if (!hasDomains) {
    if (row.document == null) {
      throw new Error("Stored working copy has no snapshot");
    }
    return parsedJson(row.document, "Stored working copy");
  }
  return assembleStoredDomainDocuments({
    content: row.content_json == null
      ? null
      : parsedJson(row.content_json, "Stored working copy"),
    pedagogy: row.pedagogy_json == null
      ? null
      : parsedJson(row.pedagogy_json, "Stored working copy"),
    classification: row.classification_json == null
      ? null
      : parsedJson(row.classification_json, "Stored working copy"),
    provenance: row.provenance_json == null
      ? null
      : parsedJson(row.provenance_json, "Stored working copy"),
    administration: row.administration_json == null
      ? null
      : parsedJson(row.administration_json, "Stored working copy")
  });
}

export class D1DraftRepository extends DraftRepository {
  constructor(database) {
    super();
    if (!database) throw new Error("A D1 database binding is required");
    this.database = database;
  }

  async persistBoardLimitWaiverMutation({
    draftId,
    document,
    actor,
    expectedRevision,
    requestId = null,
    audit = () => []
  }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor);
    const current = await this.database.prepare(`
      SELECT *,
        (SELECT COUNT(*) FROM puzzle_draft_history WHERE draft_id = puzzle_drafts.id) AS working_copy_history_count
      FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner.subject).first();
    if (!current) throw new DraftNotFoundError(draftId);
    if (Number(current.revision) !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(current.revision)}`
      );
    }
    const currentDocument = assembleRowDocument(current);
    const materialized = assembleStoredDomainDocuments({ document });
    assertNoWriteOnceDrift(
      currentDocument, materialized, "stored draft document"
    );
    const documentJson = serializeDraftDocument(materialized);
    const previousAssembled = serializeDraftDocument(currentDocument);
    const domains = storedDomainDocuments(materialized);
    const contentHash = draftContentHash(documentJson);
    const now = new Date().toISOString();
    const recordHistory = previousAssembled !== documentJson;
    const requestGuard = requestId == null ? "" : `
      AND EXISTS (
        SELECT 1 FROM puzzle_board_limit_waiver_requests
        WHERE id = ? AND draft_id = ? AND status = 'pending'
      )`;
    const guardBindings = requestId == null ? [] : [requestId, draftId];
    const bindings = [
      typeof materialized.id === "string" ? materialized.id : null,
      typeof materialized.title === "string" ? materialized.title : null,
      contentHash,
      now,
      domains.content,
      domains.pedagogy,
      domains.classification,
      domains.provenance,
      domains.administration,
      draftId,
      owner.subject,
      expectedRevision,
      ...guardBindings
    ];
    const draftAt = revision => committedDraftView({
      draftId,
      document: materialized,
      revision,
      contentHash,
      updatedAt: now,
      current: withHistoryCount(current, recordHistory),
      documentStale: true
    });
    const committed = {
      draftId,
      actor,
      ownerSubject: owner.subject,
      expectedRevision,
      expectedContentHash: contentHash,
      draftAt
    };
    const snapshot = recordHistory
      ? workingCopySnapshotStatements(this.database, {
        draftId,
        ownerSubject: owner.subject,
        expectedRevision,
        now,
        extraWhere: requestGuard,
        extraBindings: guardBindings
      })
      : null;
    let results;
    try {
      results = await this.database.batch(draftWriteBatch({
        snapshot,
        update: this.database.prepare(`
          UPDATE puzzle_drafts
          SET puzzle_id = ?, title = ?, content_hash = ?,
              revision = revision + 1, validation_json = NULL, updated_at = ?,
              document_stale = 1,
              content_json = ?, pedagogy_json = ?, classification_json = ?, provenance_json = ?, administration_json = ?
          WHERE id = ? AND owner_subject = ? AND revision = ?${requestGuard}
        `).bind(...bindings),
        // Audit rows are written only if this exact document landed: a
        // concurrent save can reach the same revision number, not this hash.
        // An identical concurrent decision (a double-submitted revoke) lands
        // the same hash, so each target also gets at most one event per
        // resulting revision. The trim sits immediately after the update so
        // changes() is that update, not an audit insert.
        after: audit({
          sql: "EXISTS (SELECT 1 FROM puzzle_drafts WHERE id = ? AND revision = ? AND content_hash = ?)",
          bindings: [draftId, expectedRevision + 1, contentHash],
          firstEvent: `NOT EXISTS (SELECT 1 FROM puzzle_board_limit_waiver_events
            WHERE draft_id = ? AND draft_revision = ? AND waiver_type = ? AND target_id = ?)`,
          firstEventBindings: (waiverType, targetId) =>
            [draftId, expectedRevision + 1, waiverType, targetId]
        })
      }));
    } catch (error) {
      try {
        rethrowMissingDomainColumn(error);
      } catch (classified) {
        return returnCommittedDraft(this.database, classified, committed);
      }
    }
    if (changes(results?.[updateResultIndex(snapshot)]) !== 1) {
      return rejectConflictUnlessCommitted(this, committed);
    }
    return draftAt(expectedRevision + 1);
  }

  async listBoardLimitWaiverRequests({ draftId, actor }) {
    const owner = normalizeDraftActor(actor);
    const owned = await this.database.prepare(`
      SELECT 1 FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner.subject).first();
    if (!owned) throw new DraftNotFoundError(draftId);
    const result = await this.database.prepare(`
      SELECT * FROM puzzle_board_limit_waiver_requests
      WHERE draft_id = ? ORDER BY requested_at DESC, id DESC
    `).bind(draftId).all();
    return (result.results || []).map(row => ({
      id: Number(row.id), draftId: row.draft_id, puzzleId: row.puzzle_id,
      waiverType: row.waiver_type, targetId: row.target_id,
      count: Number(row.requested_count),
      reason: row.reason, status: row.status, requestedBy: row.requested_by,
      requestedAt: row.requested_at, requestedRevision: Number(row.requested_revision),
      decidedBy: row.decided_by || null, decidedAt: row.decided_at || null,
      decisionNote: row.decision_note || null
    }));
  }

  async requestBoardLimitWaiver({ draftId, waiverType, targetId, reason, actor, expectedRevision }) {
    const draft = await this.get({ draftId, actor });
    if (draft.revision !== expectedRevision) {
      throw new DraftConflictError(`Draft revision conflict: expected ${expectedRevision}, current revision is ${draft.revision}`);
    }
    const requested = makeBoardLimitWaiverRequest(
      draft.document, waiverType, targetId, reason
    );
    const owner = normalizeDraftActor(actor);
    const requestedBy = owner.name || owner.email || owner.subject;
    const now = new Date().toISOString();
    const existingRequests = await this.listBoardLimitWaiverRequests({ draftId, actor });
    const existingPending = existingRequests.find(item => item.waiverType === waiverType &&
      item.targetId === targetId && item.status === "pending" &&
      item.count === requested.count);
    if (existingPending?.reason === reason.trim()) return existingPending;
    if (existingPending) {
      await this.database.prepare(`UPDATE puzzle_board_limit_waiver_requests
        SET status = 'superseded', decided_by = ?, decided_at = ?, decision_note = ?
        WHERE id = ? AND draft_id = ? AND status = 'pending'`)
        .bind(requestedBy, now, "Superseded by an updated author rationale.", existingPending.id, draftId).run();
    }
    await this.database.prepare(`
      INSERT INTO puzzle_board_limit_waiver_requests
        (draft_id, puzzle_id, waiver_type, target_id, requested_count, reason, status,
         requested_by, requested_at, requested_revision)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
      ON CONFLICT DO NOTHING
    `).bind(
      draftId, draft.document.id, requested.waiverType, targetId, requested.count,
      requested.reason, requestedBy, now, expectedRevision
    ).run();
    const requests = await this.listBoardLimitWaiverRequests({ draftId, actor });
    const request = requests.find(item => item.waiverType === waiverType &&
      item.targetId === targetId && item.status === "pending" &&
      item.count === requested.count);
    return request;
  }

  async decideBoardLimitWaiver({ draftId, requestId, decision, actor, expectedRevision, note = "" }) {
    if (!["granted", "declined"].includes(decision)) throw new Error("Decision must be granted or declined.");
    const draft = await this.get({ draftId, actor });
    if (draft.revision !== expectedRevision) {
      throw new DraftConflictError(`Draft revision conflict: expected ${expectedRevision}, current revision is ${draft.revision}`);
    }
    const request = (await this.listBoardLimitWaiverRequests({ draftId, actor }))
      .find(item => item.id === Number(requestId));
    if (!request || request.status !== "pending") throw new Error("That board limit waiver request is no longer pending.");
    if (decision === "granted" && !boardLimitWaiverRequestIsCurrent(draft.document, request)) {
      throw new DraftConflictError("The target's size changed after the request. Refresh and request review for the current board state.");
    }
    const reviewer = normalizeDraftActor(actor);
    const decidedBy = reviewer.name || reviewer.email || reviewer.subject;
    const now = new Date().toISOString();
    if (decision === "granted") {
      const previous = (draft.document.boardLimitWaivers || []).some(item =>
        item.waiverType === request.waiverType && item.targetId === request.targetId
      );
      const document = grantBoardLimitWaiver(
        draft.document, request.waiverType, request.targetId, request.reason, reviewer, now
      );
      const audit = landed => [
        this.database.prepare(`UPDATE puzzle_board_limit_waiver_requests
          SET status = 'replaced', decided_by = ?, decided_at = ?, decision_note = ?
          WHERE draft_id = ? AND waiver_type = ? AND target_id = ? AND status = 'granted' AND id != ?
            AND ${landed.sql}`)
          .bind(decidedBy, now, note.trim() || null, draftId, request.waiverType, request.targetId,
            request.id, ...landed.bindings),
        this.database.prepare(`UPDATE puzzle_board_limit_waiver_requests
          SET status = 'granted', decided_by = ?, decided_at = ?, decision_note = ?
          WHERE id = ? AND draft_id = ? AND status = 'pending'
            AND ${landed.sql}`)
          .bind(decidedBy, now, note.trim() || null, request.id, draftId, ...landed.bindings),
        this.database.prepare(`INSERT INTO puzzle_board_limit_waiver_events
          (puzzle_id, waiver_type, target_id, event_type, actor, event_at,
           approved_count, reason, draft_id, draft_revision)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          WHERE ${landed.sql} AND ${landed.firstEvent}
            AND EXISTS (SELECT 1 FROM puzzle_board_limit_waiver_requests
              WHERE id = ? AND draft_id = ? AND status = 'granted')`)
          .bind(draft.document.id, request.waiverType, request.targetId,
            previous ? "replaced" : "granted", decidedBy, now,
            request.count, request.reason, draftId, expectedRevision + 1,
            ...landed.bindings, ...landed.firstEventBindings(request.waiverType, request.targetId),
            request.id, draftId)
      ];
      return this.persistBoardLimitWaiverMutation({
        draftId, document, actor, expectedRevision, requestId: request.id, audit
      });
    }
    const declined = await this.database.prepare(`UPDATE puzzle_board_limit_waiver_requests
      SET status = 'declined', decided_by = ?, decided_at = ?, decision_note = ?
      WHERE id = ? AND draft_id = ? AND status = 'pending'`)
      .bind(decidedBy, now, note.trim() || null, request.id, draftId).run();
    // Someone else decided it between the read above and this write.
    if (changes(declined) !== 1) {
      throw new DraftConflictError("That board limit waiver request is no longer pending.");
    }
    return this.get({ draftId, actor });
  }

  async grantBoardLimitWaiverDirect({ draftId, waiverType, targetId, reason, actor, expectedRevision }) {
    const request = await this.requestBoardLimitWaiver({
      draftId, waiverType, targetId, reason, actor, expectedRevision
    });
    return this.decideBoardLimitWaiver({
      draftId, requestId: request.id, decision: "granted", actor, expectedRevision
    });
  }

  async revokeBoardLimitWaiver({ draftId, waiverType, targetId, actor, expectedRevision, note = "" }) {
    const policy = boardLimitWaiverPolicy(waiverType);
    if (!policy) throw new Error(`Unsupported board limit waiver type: ${waiverType}`);
    const draft = await this.get({ draftId, actor });
    if (draft.revision !== expectedRevision) {
      throw new DraftConflictError(`Draft revision conflict: expected ${expectedRevision}, current revision is ${draft.revision}`);
    }
    const grant = (draft.document.boardLimitWaivers || []).find(item =>
      item.waiverType === waiverType && item.targetId === targetId
    );
    if (!grant) throw new Error("There is no current grant for that board limit scope.");
    const reviewer = normalizeDraftActor(actor);
    const decidedBy = reviewer.name || reviewer.email || reviewer.subject;
    const now = new Date().toISOString();
    const document = withoutBoardLimitWaiver(draft.document, waiverType, targetId);
    const audit = landed => [
      this.database.prepare(`UPDATE puzzle_board_limit_waiver_requests
        SET status = 'revoked', decided_by = ?, decided_at = ?, decision_note = ?
        WHERE draft_id = ? AND waiver_type = ? AND target_id = ? AND status = 'granted'
          AND ${landed.sql}`)
        .bind(decidedBy, now, note.trim() || null, draftId, waiverType, targetId, ...landed.bindings),
      this.database.prepare(`INSERT INTO puzzle_board_limit_waiver_events
        (puzzle_id, waiver_type, target_id, event_type, actor, event_at,
         approved_count, reason, draft_id, draft_revision)
        SELECT ?, ?, ?, 'revoked', ?, ?, ?, ?, ?, ?
        WHERE ${landed.sql} AND ${landed.firstEvent}`)
        .bind(draft.document.id, waiverType, targetId, decidedBy, now,
          grant.approvedCount, grant.reason, draftId, expectedRevision + 1,
          ...landed.bindings, ...landed.firstEventBindings(waiverType, targetId))
    ];
    return this.persistBoardLimitWaiverMutation({
      draftId, document, actor, expectedRevision, audit
    });
  }

  /**
   * `seededFromPublished` is set by the seeding helper, never by a caller:
   * a working copy opened from a published board is the one draft that may
   * legitimately exist under a live id. Every other create is gated in the
   * insert itself rather than by a preceding read, so there is no window in
   * which a concurrent Publish can turn a free id into a live one between the
   * check and the write.
   */
  async create({
    draftId,
    document,
    actor,
    baseCommitSha = null,
    seededFromPublished = false,
    basePublishedRevision = null
  }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor);
    const materialized = assembleStoredDomainDocuments({ document });
    const documentJson = serializeDraftDocument(materialized);
    const domains = storedDomainDocuments(materialized);
    const contentHash = draftContentHash(documentJson);
    const now = new Date().toISOString();
    const bindIdentity = [
      draftId,
      typeof materialized.id === "string" ? materialized.id : null,
      owner.subject,
      typeof materialized.title === "string" ? materialized.title : null,
      UNUSED_DOCUMENT_CACHE,
      contentHash,
      baseCommitSha,
      now,
      now
    ];
    const bindModern = [
      ...bindIdentity,
      domains.content,
      domains.pedagogy,
      domains.classification,
      domains.provenance,
      domains.administration
    ];
    // Both identities are gated: the row id keys the drafts list and the admin
    // URL, and puzzle_id is what a later Publish writes to.
    const guardedIds = [draftId, typeof materialized.id === "string" ? materialized.id : draftId];
    const shadowGate = seededFromPublished
      ? ""
      : `WHERE NOT EXISTS (
          SELECT 1 FROM published_documents WHERE kind = 'puzzle' AND id IN (?, ?)
        )`;
    const gateBindings = seededFromPublished ? [] : guardedIds;
    const insert = columns => `
      INSERT INTO puzzle_drafts (${columns.names})
      SELECT ${columns.values}
      ${shadowGate}
    `;
    const draftAt = revision => committedDraftView({
      draftId,
      document: materialized,
      revision,
      contentHash,
      updatedAt: now,
      createdAt: now,
      baseCommitSha,
      documentStale: true,
      openedFromPublished: seededFromPublished,
      reviewBasePublishedRevision: Number.isInteger(basePublishedRevision)
        ? basePublishedRevision
        : null
    });
    const committed = {
      draftId,
      ownerSubject: owner.subject,
      expectedContentHash: contentHash,
      draftAt
    };
    let result;
    try {
      result = await runDraftWrite(this.database.prepare(insert({
        names: `id, puzzle_id, owner_subject, title, status,
          document, content_hash, base_commit_sha,
          created_at, updated_at, revision, document_stale,
          content_json, pedagogy_json, classification_json, provenance_json, administration_json, opened_from_published,
          review_base_published_revision`,
        values: "?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?"
      })).bind(
        ...bindModern,
        seededFromPublished ? 1 : 0,
        Number.isInteger(basePublishedRevision) ? basePublishedRevision : null,
        ...gateBindings
      ));
    } catch (error) {
      if (String(error?.message || error).includes("UNIQUE constraint failed")) {
        const row = await this.database.prepare(
          `SELECT revision FROM puzzle_drafts WHERE id = ?`
        ).bind(draftId).first();
        const revision = Number(row?.revision);
        const known = Number.isInteger(revision) && revision > 0 ? revision : null;
        throw new DraftConflictError(
          known
            ? `Draft "${draftId}" already exists at revision ${known}`
            : `Draft "${draftId}" already exists`,
          known
        );
      }
      // Older local D1 DBs may lack document_stale until migrate. That retry
      // still writes classification_json. A database missing the column fails
      // here instead of accepting a draft that later saves cannot update.
      const message = String(error?.message || error);
      if (sqliteMissingColumn(message, "document_stale")) {
        try {
          result = await runDraftWrite(this.database.prepare(insert({
            names: `id, puzzle_id, owner_subject, title, status,
              document, content_hash, base_commit_sha,
              created_at, updated_at, revision,
              content_json, pedagogy_json, classification_json, provenance_json, administration_json`,
            values: "?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?"
          })).bind(...bindModern, ...gateBindings));
        } catch (retryError) {
          return returnCommittedDraft(this.database, retryError, committed);
        }
      } else {
        return returnCommittedDraft(this.database, error, committed);
      }
    }
    // A UNIQUE violation throws above. changes === 0 is the shadow gate, unless
    // the insert committed and the response omitted meta.changes. This insert
    // stamps created_at with `now` and opened_from_published for this route.
    // An older row can share the hash. A publish that lands after this insert
    // does not un-commit it, so the published row is consulted only when the
    // stored stamp is not this statement's.
    if (changes(result) !== 1) {
      const stored = await readCommittedRevision(this.database, draftId, owner.subject);
      const openedFromPublished = await readOpenedFromPublished(this.database, draftId, owner.subject);
      if (
        stored?.revision === 1 &&
        stored.contentHash === contentHash &&
        stored.createdAt === now &&
        (openedFromPublished == null || openedFromPublished === seededFromPublished)
      ) {
        return draftAt(1);
      }
      const live = await this.database.prepare(`
        SELECT id FROM published_documents
        WHERE kind = 'puzzle' AND id IN (?, ?) LIMIT 1
      `).bind(...guardedIds).first();
      throw new PublishedIdConflictError(live?.id || guardedIds[1]);
    }
    return draftAt(1);
  }

  async get({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const row = await this.database.prepare(`
      SELECT puzzle_drafts.*,
        (
          SELECT COUNT(*) FROM puzzle_draft_history
          WHERE draft_id = puzzle_drafts.id
        ) AS working_copy_history_count
      FROM puzzle_drafts
      WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner).first();
    if (!row) throw new DraftNotFoundError(draftId);
    return fullDraft(row);
  }

  async rememberReviewBaseline({
    draftId,
    actor,
    document,
    expectedRevision,
    basePublishedRevision = null
  }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    serializeDraftDocument(document);
    const baselineJson = serializeReviewBaseline(document);
    const publishedRevision = Number.isInteger(basePublishedRevision)
      ? basePublishedRevision
      : null;
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts
      SET review_baseline_json = ?,
          review_base_published_revision = COALESCE(review_base_published_revision, ?)
      WHERE id = ? AND owner_subject = ? AND revision = ?
        AND (review_baseline_json IS NULL OR review_baseline_json = '')
    `).bind(
      baselineJson,
      publishedRevision,
      draftId,
      owner.subject,
      expectedRevision
    ).run();
    if (changes(result) !== 1) {
      const current = await this.get({ draftId, actor });
      if (current.hasReviewBaseline) return current;
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${current.revision}`
      );
    }
    return this.get({ draftId, actor });
  }

  async readReviewBaseline({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const row = await this.database.prepare(`
      SELECT review_baseline_json FROM puzzle_drafts
      WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner).first();
    if (!row) throw new DraftNotFoundError(draftId);
    if (!row.review_baseline_json) return null;
    const session = parseReviewBaseline(parsedJson(row.review_baseline_json, "Stored review baseline"));
    return session?.document ?? null;
  }

  async setReviewStackLoaded({ draftId, actor, stackLoaded }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const row = await this.database.prepare(`
      SELECT review_baseline_json FROM puzzle_drafts
      WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner).first();
    if (!row) throw new DraftNotFoundError(draftId);
    if (!row.review_baseline_json) return this.get({ draftId, actor });
    const session = parseReviewBaseline(parsedJson(row.review_baseline_json, "Stored review baseline"));
    if (!session?.document) return this.get({ draftId, actor });
    await this.database.prepare(`
      UPDATE puzzle_drafts
      SET review_baseline_json = ?
      WHERE id = ? AND owner_subject = ?
    `).bind(
      serializeReviewBaseline(session.document, { stackLoaded: stackLoaded === true }),
      draftId,
      owner
    ).run();
    return this.get({ draftId, actor });
  }

  async releaseReviewSession({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    await this.database.prepare(`
      UPDATE puzzle_drafts
      SET opened_from_published = 0,
          review_baseline_json = NULL,
          review_base_published_revision = NULL
      WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner).run();
    return this.get({ draftId, actor });
  }

  async save({ draftId, document, actor, expectedRevision }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const current = await this.database.prepare(`
      SELECT *,
        (SELECT COUNT(*) FROM puzzle_draft_history WHERE draft_id = puzzle_drafts.id) AS working_copy_history_count
      FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner.subject).first();
    if (!current) throw new DraftNotFoundError(draftId);
    if (Number(current.revision) !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(current.revision)}`
      );
    }
    const currentDocument = assembleRowDocument(current);
    const materialized = assembleStoredDomainDocuments({
      document: preserveCurrentBoardLimitWaivers(currentDocument, document)
    });
    // Enforced at the repository, not at one caller: puzzle_id is recomputed
    // from the document on every save, so any writer that could move or drop
    // the id would split the row key from the document identity. The admin
    // board PUTs a whole document straight to this method.
    assertNoWriteOnceDrift(
      currentDocument,
      materialized,
      "stored draft document"
    );
    const documentJson = serializeDraftDocument(materialized);
    const previousAssembled = serializeDraftDocument(currentDocument);
    if (previousAssembled === documentJson) return fullDraft(current);
    const domains = storedDomainDocuments(materialized);
    const contentHash = draftContentHash(documentJson);
    const now = new Date().toISOString();
    const draftAt = revision => committedDraftView({
      draftId,
      document: materialized,
      revision,
      contentHash,
      updatedAt: now,
      current: withHistoryCount(current, true),
      documentStale: true
    });
    const committed = {
      draftId,
      actor,
      ownerSubject: owner.subject,
      expectedRevision,
      expectedContentHash: contentHash,
      draftAt
    };
    const snapshot = workingCopySnapshotStatements(this.database, {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      now
    });
    let results;
    try {
      results = await this.database.batch(draftWriteBatch({
        snapshot,
        update: this.database.prepare(`
          UPDATE puzzle_drafts
          SET puzzle_id = ?, title = ?, content_hash = ?,
              revision = revision + 1, validation_json = NULL, updated_at = ?,
              document_stale = 1,
              content_json = ?, pedagogy_json = ?, classification_json = ?, provenance_json = ?, administration_json = ?
          WHERE id = ? AND owner_subject = ? AND revision = ?
        `).bind(
          typeof materialized.id === "string" ? materialized.id : null,
          typeof materialized.title === "string" ? materialized.title : null,
          contentHash,
          now,
          domains.content,
          domains.pedagogy,
          domains.classification,
          domains.provenance,
          domains.administration,
          draftId,
          owner.subject,
          expectedRevision
        )
      }));
    } catch (error) {
      try {
        rethrowMissingDomainColumn(error);
      } catch (classified) {
        return returnCommittedDraft(this.database, classified, committed);
      }
    }
    if (changes(results?.[updateResultIndex(snapshot)]) !== 1) {
      return rejectConflictUnlessCommitted(this, committed);
    }
    return draftAt(expectedRevision + 1);
  }

  /**
   * Replace one agent write-domain column. The document cache is not written.
   * document_stale stays set so readers assemble from the domain columns.
   */
  async saveDomain({
    draftId,
    domain,
    projection,
    actor,
    expectedRevision,
    provenance = undefined
  }) {
    assertDraftId(draftId);
    if (!AUTHORING_WRITE_DOMAINS.includes(domain)) {
      throw new Error(`saveDomain requires domain ${AUTHORING_WRITE_DOMAINS.join(", ")}`);
    }
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const current = await this.database.prepare(`
      SELECT *,
        (SELECT COUNT(*) FROM puzzle_draft_history WHERE draft_id = puzzle_drafts.id) AS working_copy_history_count
      FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner.subject).first();
    if (!current) throw new DraftNotFoundError(draftId);
    if (Number(current.revision) !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(current.revision)}`
      );
    }
    const previousDocument = assembleRowDocument(current);
    const previousAssembled = serializeDraftDocument(previousDocument);
    let nextDocument = applyAuthoredDomain(previousDocument, domain, projection);
    if (provenance !== undefined) {
      nextDocument = { ...nextDocument, provenance };
    } else if (Object.prototype.hasOwnProperty.call(previousDocument, "provenance")) {
      nextDocument = { ...nextDocument, provenance: previousDocument.provenance };
    }
    const materialized = assembleStoredDomainDocuments({ document: nextDocument });
    const nextAssembled = serializeDraftDocument(materialized);
    if (previousAssembled === nextAssembled) {
      return fullDraft(current);
    }
    const domains = storedDomainDocuments(materialized);
    const contentHash = draftContentHash(nextAssembled);
    const now = new Date().toISOString();
    // Seed any missing domain columns from the assembled snapshot so the first
    // focused save on a pre-domain row does not drop sibling fields when the
    // document cache is marked stale.
    const columns = domainColumnValues(current, domain, domains);
    const draftAt = revision => committedDraftView({
      draftId,
      document: materialized,
      revision,
      contentHash,
      updatedAt: now,
      current: withHistoryCount(current, true),
      documentStale: true
    });
    const committed = {
      draftId,
      actor,
      ownerSubject: owner.subject,
      expectedRevision,
      expectedContentHash: contentHash,
      draftAt
    };
    const snapshot = workingCopySnapshotStatements(this.database, {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      now
    });
    let results;
    try {
      results = await this.database.batch(draftWriteBatch({
        snapshot,
        update: this.database.prepare(`
          UPDATE puzzle_drafts
          SET puzzle_id = ?, title = ?, content_hash = ?,
              revision = revision + 1, validation_json = NULL, updated_at = ?,
              document_stale = 1,
              content_json = ?, pedagogy_json = ?, classification_json = ?, provenance_json = ?, administration_json = ?
          WHERE id = ? AND owner_subject = ? AND revision = ?
        `).bind(
          typeof materialized.id === "string" ? materialized.id : null,
          typeof materialized.title === "string" ? materialized.title : null,
          contentHash,
          now,
          columns.content,
          columns.pedagogy,
          columns.classification,
          columns.provenance,
          columns.administration,
          draftId,
          owner.subject,
          expectedRevision
        )
      }));
    } catch (error) {
      try {
        rethrowMissingDomainColumn(error);
      } catch (classified) {
        return returnCommittedDraft(this.database, classified, committed);
      }
    }
    if (changes(results?.[updateResultIndex(snapshot)]) !== 1) {
      return rejectConflictUnlessCommitted(this, committed);
    }
    return draftAt(expectedRevision + 1);
  }

  /**
   * Return the assembled draft. Domain columns are authoritative, so this
   * does not write the document cache.
   */
  async materialize({ draftId, actor }) {
    return this.get({ draftId, actor });
  }

  async popWorkingCopy({ draftId, actor, expectedRevision }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const current = await this.get({ draftId, actor });
    if (current.revision !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${current.revision}`
      );
    }
    const previous = await this.database.prepare(`
      SELECT seq, document,
        content_json, pedagogy_json, classification_json, provenance_json, administration_json
      FROM puzzle_draft_history
      WHERE draft_id = ?
      ORDER BY seq DESC
      LIMIT 1
    `).bind(draftId).first();
    if (!previous) throw new DraftEmptyHistoryError(draftId);
    const restored = historySnapshotDocument(previous);
    const materialized = assembleStoredDomainDocuments({
      document: restored,
      // Keep the current administration, including none: undefined would
      // fall back to the restored document and revive a revoked grant.
      administration: partitionAuthoredDocument(current.document).administration ?? {}
    });
    const documentJson = serializeDraftDocument(materialized);
    const domains = storedDomainDocuments(materialized);
    const contentHash = draftContentHash(documentJson);
    const now = new Date().toISOString();
    const nextRevision = expectedRevision + 1;
    // The restored document is already in hand. Undo returns it, and the
    // history delete travels in the same batch as the update so a lost
    // response cannot leave the popped snapshot in place for a second undo.
    const popped = revision => ({
      ...current,
      puzzleId: typeof materialized.id === "string" ? materialized.id : null,
      title: typeof materialized.title === "string" ? materialized.title : null,
      revision,
      contentHash,
      updatedAt: now,
      documentStale: true,
      validation: null,
      workingCopyHistoryCount: Math.max(0, Number(current.workingCopyHistoryCount || 0) - 1),
      document: materialized
    });
    const committed = {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      expectedContentHash: contentHash,
      draftAt: popped
    };
    let results;
    try {
      results = await this.database.batch([
        this.database.prepare(`
          UPDATE puzzle_drafts
          SET puzzle_id = ?, title = ?, content_hash = ?,
              revision = revision + 1, validation_json = NULL, updated_at = ?,
              document_stale = 1,
              content_json = ?, pedagogy_json = ?, classification_json = ?, provenance_json = ?, administration_json = ?
          WHERE id = ? AND owner_subject = ? AND revision = ?
        `).bind(
          typeof materialized.id === "string" ? materialized.id : null,
          typeof materialized.title === "string" ? materialized.title : null,
          contentHash,
          now,
          domains.content,
          domains.pedagogy,
          domains.classification,
          domains.provenance,
          domains.administration,
          draftId,
          owner.subject,
          expectedRevision
        ),
        this.database.prepare(`
          DELETE FROM puzzle_draft_history
          WHERE draft_id = ? AND seq = ?
            AND changes() = 1
            AND EXISTS (
              SELECT 1 FROM puzzle_drafts
              WHERE id = ? AND owner_subject = ? AND revision = ?
                AND content_hash = ? AND updated_at = ?
            )
        `).bind(
          draftId,
          previous.seq,
          draftId,
          owner.subject,
          nextRevision,
          contentHash,
          now
        )
      ]);
    } catch (error) {
      try {
        rethrowMissingDomainColumn(error);
      } catch (classified) {
        return returnCommittedDraft(this.database, classified, committed);
      }
    }
    if (changes(results?.[0]) !== 1) {
      return rejectConflictUnlessCommitted(this, committed);
    }
    return popped(nextRevision);
  }

  async list({ actor, status = null, limit = 100, includeDocument = false } = {}) {
    const owner = normalizeDraftActor(actor).subject;
    const boundedLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
    const statement = status
      ? this.database.prepare(`
          SELECT * FROM puzzle_drafts
          WHERE owner_subject = ? AND status = ?
          ORDER BY updated_at DESC LIMIT ?
        `).bind(owner, status, boundedLimit)
      : this.database.prepare(`
          SELECT * FROM puzzle_drafts
          WHERE owner_subject = ?
          ORDER BY updated_at DESC LIMIT ?
        `).bind(owner, boundedLimit);
    const result = await statement.all();
    return result.results.map(includeDocument ? fullDraft : metadata);
  }

  /**
   * Working copies updated after `since` (an ISO time; null for all), oldest
   * first, with only what a watcher needs to decide whether to look closer:
   * the content hash moves with every document save but not with a layout
   * save, and validation is cleared by every document save.
   */
  async listChangedSince({ actor, since = null, limit = 200 } = {}) {
    const owner = normalizeDraftActor(actor).subject;
    const boundedLimit = Math.max(1, Math.min(Number(limit) || 200, 500));
    const result = await this.database.prepare(`
      SELECT id, puzzle_id, revision, content_hash, updated_at, validation_json
      FROM puzzle_drafts
      WHERE owner_subject = ? AND (? IS NULL OR updated_at > ?)
      ORDER BY updated_at ASC LIMIT ?
    `).bind(owner, since, since, boundedLimit).all();
    return result.results.map(row => ({
      draftId: row.id,
      puzzleId: row.puzzle_id,
      revision: Number(row.revision),
      contentHash: row.content_hash,
      updatedAt: row.updated_at,
      validation: row.validation_json ? parsedJson(row.validation_json, "Stored validation") : null
    }));
  }

  /**
   * `expectedRevision` makes the delete a compare-and-delete, the same OCC
   * token save() uses. A rename copies a draft and then removes the source,
   * and without this the removal is unconditional: a save landing between the
   * copy and the delete would be carried away with the row it was written to.
   * Callers that simply discard a draft pass nothing and delete regardless.
   *
   * @param {{ draftId: string, actor: object, expectedRevision?: number|null }} input
   * @returns {Promise<void>}
   */
  async delete({ draftId, actor, expectedRevision = null }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const guarded = Number.isInteger(expectedRevision);
    const result = await this.database.batch([
      this.database.prepare(`
        DELETE FROM puzzle_draft_history WHERE draft_id = ?
      `).bind(draftId),
      guarded
        ? this.database.prepare(`
            DELETE FROM puzzle_drafts
            WHERE id = ? AND owner_subject = ? AND revision = ?
          `).bind(draftId, owner, expectedRevision)
        : this.database.prepare(`
            DELETE FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
          `).bind(draftId, owner),
      // Requests belong to the draft; drop them only if it was deleted, so a
      // reused id never shows another draft's rationale. Audit events stay.
      this.database.prepare(`
        DELETE FROM puzzle_board_limit_waiver_requests
        WHERE draft_id = ? AND NOT EXISTS (SELECT 1 FROM puzzle_drafts WHERE id = ?)
      `).bind(draftId, draftId)
    ]);
    if (changes(result[1]) === 1) return;
    if (guarded) {
      const row = await this.database.prepare(`
        SELECT revision FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
      `).bind(draftId, owner).first();
      if (row) {
        throw new DraftConflictError(
          `Draft revision conflict: expected ${expectedRevision}, `
          + `current revision is ${Number(row.revision)}`
        );
      }
    }
    throw new DraftNotFoundError(draftId);
  }

  async recordValidation({ draftId, validation, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts SET validation_json = ?
      WHERE id = ? AND owner_subject = ?
    `).bind(JSON.stringify(validation), draftId, owner).run();
    if (changes(result) !== 1) throw new DraftNotFoundError(draftId);
    return validation;
  }

  // `expectedUpdatedAt` makes the write conditional on the draft not having
  // changed since the caller read it (LayoutConflictError otherwise).
  async saveLayout({ draftId, layout, actor, expectedUpdatedAt = null }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const layoutJson = serializeLayoutDocument(layout);
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts
      SET layout_json = ?, updated_at = ?
      WHERE id = ? AND owner_subject = ?
        AND (? IS NULL OR updated_at = ?)
    `).bind(layoutJson, now, draftId, owner, expectedUpdatedAt, expectedUpdatedAt).run();
    if (changes(result) !== 1) {
      if (expectedUpdatedAt != null) throw new LayoutConflictError(draftId);
      throw new DraftNotFoundError(draftId);
    }
    return this.get({ draftId, actor });
  }

  async clearLayout({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts
      SET layout_json = NULL, updated_at = ?
      WHERE id = ? AND owner_subject = ?
    `).bind(now, draftId, owner).run();
    if (changes(result) !== 1) throw new DraftNotFoundError(draftId);
    return this.get({ draftId, actor });
  }

  async recordCheckoutInstall({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts
      SET installed_content_hash = content_hash, updated_at = ?
      WHERE id = ? AND owner_subject = ?
    `).bind(now, draftId, owner).run();
    if (changes(result) !== 1) throw new DraftNotFoundError(draftId);
    return this.get({ draftId, actor });
  }

  async clearCheckoutInstall({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts
      SET installed_content_hash = NULL, updated_at = ?
      WHERE id = ? AND owner_subject = ?
    `).bind(now, draftId, owner).run();
    if (changes(result) !== 1) throw new DraftNotFoundError(draftId);
    return this.get({ draftId, actor });
  }

  async recordAssistanceStamp({ record, actor }) {
    if (!record || typeof record !== "object") return null;
    const draftId = typeof record.draftId === "string"
      ? record.draftId
      : (typeof record.puzzleId === "string" ? record.puzzleId : null);
    if (!draftId) return null;
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const capturedAt = typeof record.capturedAt === "string"
      ? record.capturedAt
      : new Date().toISOString();
    const id = crypto.randomUUID();
    await this.database.prepare(`
      INSERT INTO draft_assistance_stamps (
        id, draft_id, owner_subject, captured_at, record_json
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      draftId,
      owner,
      capturedAt,
      JSON.stringify(record)
    ).run();
    return { id, draftId, capturedAt };
  }

  // The raw client each stamped MCP call reported, oldest first, so the
  // drafts page can show the editor what the frame said.
  async listAssistanceStamps({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.database.prepare(`
      SELECT captured_at, record_json FROM draft_assistance_stamps
      WHERE draft_id = ? AND owner_subject = ?
      ORDER BY captured_at ASC, id ASC
    `).bind(draftId, owner).all();
    return (result.results || []).flatMap(row => {
      let record;
      try {
        record = JSON.parse(row.record_json);
      } catch {
        return [];
      }
      const client = record?.client || {};
      return [{
        capturedAt: row.captured_at,
        tool: record?.tool || null,
        hostId: client.hostId || null,
        system: client.system || null,
        clientName: client.clientName || null
      }];
    });
  }
}

export default D1DraftRepository;
