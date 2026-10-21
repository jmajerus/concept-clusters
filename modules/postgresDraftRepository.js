import {
  assertDraftId,
  DraftConflictError,
  DraftEmptyHistoryError,
  DraftNotFoundError,
  DraftRepository,
  draftContentHash,
  MAX_WORKING_COPY_HISTORY,
  normalizeDraftActor,
  PublishedIdConflictError,
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
import {
  affectedRows,
  postgresConnectionDropped,
  uniqueViolation,
  withTransaction
} from "./postgresPool.js";

const UNUSED_DOCUMENT_CACHE = "{}";

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

function historySnapshotDocument(row) {
  const hasDomains = row.content_json != null
    || row.pedagogy_json != null
    || row.classification_json != null
    || row.provenance_json != null
    || row.administration_json != null;
  if (!hasDomains) {
    if (row.document == null) throw new Error("Stored working copy has no snapshot");
    return parsedJson(row.document, "Stored working copy");
  }
  return assembleStoredDomainDocuments({
    content: row.content_json == null ? null : parsedJson(row.content_json, "Stored working copy"),
    pedagogy: row.pedagogy_json == null ? null : parsedJson(row.pedagogy_json, "Stored working copy"),
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

function actorLabel(actor) {
  const owner = normalizeDraftActor(actor);
  return owner.name || owner.email || owner.subject;
}

function puzzleIdentity(materialized) {
  return {
    puzzleId: typeof materialized.id === "string" ? materialized.id : null,
    title: typeof materialized.title === "string" ? materialized.title : null
  };
}

const DRAFT_ROW_SQL = `
  SELECT puzzle_drafts.*,
    (SELECT COUNT(*)::int FROM puzzle_draft_history WHERE draft_id = puzzle_drafts.id)
      AS working_copy_history_count
  FROM puzzle_drafts
`;

async function readCommittedRevision(pool, draftId, ownerSubject) {
  const { rows } = await pool.query(
    `SELECT revision, content_hash, created_at
     FROM puzzle_drafts WHERE id = $1 AND owner_subject = $2`,
    [draftId, ownerSubject]
  );
  const row = rows[0];
  if (!row) return null;
  const revision = Number(row.revision);
  if (!Number.isInteger(revision) || revision <= 0) return null;
  return {
    revision,
    contentHash: typeof row.content_hash === "string" ? row.content_hash : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : null
  };
}

// One reread after a dropped connection. The write itself is not repeated.
async function recoverIfCommitted(pool, error, {
  draftId,
  ownerSubject,
  expectedRevision = null,
  expectedContentHash = null,
  draftAt
}) {
  if (!postgresConnectionDropped(error)) throw error;
  let stored;
  try {
    stored = await readCommittedRevision(pool, draftId, ownerSubject);
  } catch {
    throw error;
  }
  const revision = stored?.revision ?? null;
  if (expectedRevision == null) {
    if (revision === 1 && stored.contentHash === expectedContentHash) return draftAt(revision);
    if (revision == null) throw error;
    throw new DraftConflictError(
      `Draft "${draftId}" already exists at revision ${revision}`,
      revision
    );
  }
  if (revision === expectedRevision + 1
    && (expectedContentHash == null || stored.contentHash === expectedContentHash)) {
    return draftAt(revision);
  }
  if (revision != null && revision !== expectedRevision) {
    throw new DraftConflictError(
      `Draft revision conflict: expected ${expectedRevision}, current revision is ${revision}`,
      revision
    );
  }
  throw error;
}

async function insertHistorySnapshot(client, { draftId, ownerSubject, expectedRevision, now }) {
  await client.query(`
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
      $1
    FROM puzzle_drafts
    WHERE id = $2 AND owner_subject = $3 AND revision = $4
  `, [now, draftId, ownerSubject, expectedRevision]);
}

async function trimHistory(client, draftId) {
  await client.query(`
    DELETE FROM puzzle_draft_history
    WHERE draft_id = $1
      AND seq <= (
        SELECT MAX(seq) FROM puzzle_draft_history WHERE draft_id = $1
      ) - $2
  `, [draftId, MAX_WORKING_COPY_HISTORY]);
}

async function blockingPublishedId(contentDocuments, ids) {
  if (!contentDocuments?.getPublished) return null;
  for (const id of ids) {
    if (typeof id !== "string" || !id) continue;
    try {
      await contentDocuments.getPublished({ kind: "puzzle", id });
      return id;
    } catch (error) {
      if (error?.name === "ContentDocumentNotFoundError") continue;
      throw error;
    }
  }
  return null;
}

function waiverRequest(row) {
  return {
    id: Number(row.id),
    draftId: row.draft_id,
    puzzleId: row.puzzle_id,
    waiverType: row.waiver_type,
    targetId: row.target_id,
    count: Number(row.requested_count),
    reason: row.reason,
    status: row.status,
    requestedBy: row.requested_by,
    requestedAt: row.requested_at,
    requestedRevision: Number(row.requested_revision),
    decidedBy: row.decided_by || null,
    decidedAt: row.decided_at || null,
    decisionNote: row.decision_note || null
  };
}

export class PostgresDraftRepository extends DraftRepository {
  constructor({ pool, publishedDocuments = null } = {}) {
    super();
    if (!pool) throw new Error("A Postgres pool is required");
    this.pool = pool;
    this.publishedDocuments = publishedDocuments;
  }

  async #lockDraft(client, draftId, ownerSubject) {
    const { rows } = await client.query(`
      ${DRAFT_ROW_SQL}
      WHERE id = $1 AND owner_subject = $2
      FOR UPDATE
    `, [draftId, ownerSubject]);
    return rows[0] || null;
  }

  async #requireCurrent(client, draftId, ownerSubject, expectedRevision) {
    const current = await this.#lockDraft(client, draftId, ownerSubject);
    if (!current) throw new DraftNotFoundError(draftId);
    if (Number(current.revision) !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(current.revision)}`
      );
    }
    return current;
  }

  async #updateDomains(client, {
    draftId, ownerSubject, expectedRevision, materialized, contentHash, now, domains
  }) {
    const identity = puzzleIdentity(materialized);
    const updated = await client.query(`
      UPDATE puzzle_drafts
      SET puzzle_id = $1, title = $2, content_hash = $3,
          revision = revision + 1, validation_json = NULL, updated_at = $4,
          document_stale = 1,
          content_json = $5, pedagogy_json = $6, classification_json = $7,
          provenance_json = $8, administration_json = $9
      WHERE id = $10 AND owner_subject = $11 AND revision = $12
    `, [
      identity.puzzleId,
      identity.title,
      contentHash,
      now,
      domains.content,
      domains.pedagogy,
      domains.classification,
      domains.provenance,
      domains.administration,
      draftId,
      ownerSubject,
      expectedRevision
    ]);
    if (affectedRows(updated) !== 1) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${expectedRevision}`
      );
    }
  }

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
    const identity = puzzleIdentity(materialized);
    const guardedIds = [draftId, identity.puzzleId || draftId];
    if (!seededFromPublished) {
      const live = await blockingPublishedId(this.publishedDocuments, guardedIds);
      if (live) throw new PublishedIdConflictError(live);
    }
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
    try {
      await withTransaction(this.pool, async client => {
        await client.query(`
          INSERT INTO puzzle_drafts (
            id, puzzle_id, owner_subject, title, status,
            document, content_hash, base_commit_sha,
            created_at, updated_at, revision, document_stale,
            content_json, pedagogy_json, classification_json, provenance_json, administration_json,
            opened_from_published, review_base_published_revision
          ) VALUES (
            $1, $2, $3, $4, 'draft',
            $5, $6, $7,
            $8, $9, 1, 1,
            $10, $11, $12, $13, $14,
            $15, $16
          )
        `, [
          draftId,
          identity.puzzleId,
          owner.subject,
          identity.title,
          UNUSED_DOCUMENT_CACHE,
          contentHash,
          baseCommitSha,
          now,
          now,
          domains.content,
          domains.pedagogy,
          domains.classification,
          domains.provenance,
          domains.administration,
          seededFromPublished ? 1 : 0,
          Number.isInteger(basePublishedRevision) ? basePublishedRevision : null
        ]);
      });
    } catch (error) {
      if (uniqueViolation(error)) {
        const stored = await readCommittedRevision(this.pool, draftId, owner.subject);
        throw new DraftConflictError(
          stored
            ? `Draft "${draftId}" already exists at revision ${stored.revision}`
            : `Draft "${draftId}" already exists`,
          stored?.revision ?? null
        );
      }
      return recoverIfCommitted(this.pool, error, committed);
    }
    return draftAt(1);
  }

  async get({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const { rows } = await this.pool.query(`
      ${DRAFT_ROW_SQL}
      WHERE id = $1 AND owner_subject = $2
    `, [draftId, owner]);
    if (!rows[0]) throw new DraftNotFoundError(draftId);
    return fullDraft(rows[0]);
  }

  async materialize(input) {
    return this.get(input);
  }

  async save({ draftId, document, actor, expectedRevision }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const prepared = await this.pool.query(`
      ${DRAFT_ROW_SQL}
      WHERE id = $1 AND owner_subject = $2
    `, [draftId, owner.subject]);
    const peeked = prepared.rows[0];
    if (!peeked) throw new DraftNotFoundError(draftId);
    if (Number(peeked.revision) !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(peeked.revision)}`
      );
    }
    const currentDocument = assembleRowDocument(peeked);
    const materialized = assembleStoredDomainDocuments({
      document: preserveCurrentBoardLimitWaivers(currentDocument, document)
    });
    assertNoWriteOnceDrift(currentDocument, materialized, "stored draft document");
    const documentJson = serializeDraftDocument(materialized);
    if (serializeDraftDocument(currentDocument) === documentJson) return fullDraft(peeked);
    const domains = storedDomainDocuments(materialized);
    const contentHash = draftContentHash(documentJson);
    const now = new Date().toISOString();
    const draftAt = revision => committedDraftView({
      draftId,
      document: materialized,
      revision,
      contentHash,
      updatedAt: now,
      current: withHistoryCount(peeked, true),
      documentStale: true
    });
    const committed = {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      expectedContentHash: contentHash,
      draftAt
    };
    let wrote = false;
    try {
      await withTransaction(this.pool, async client => {
        const current = await this.#requireCurrent(client, draftId, owner.subject, expectedRevision);
        if (serializeDraftDocument(assembleRowDocument(current)) === documentJson) return;
        await insertHistorySnapshot(client, {
          draftId, ownerSubject: owner.subject, expectedRevision, now
        });
        await this.#updateDomains(client, {
          draftId,
          ownerSubject: owner.subject,
          expectedRevision,
          materialized,
          contentHash,
          now,
          domains
        });
        await trimHistory(client, draftId);
        wrote = true;
      });
    } catch (error) {
      return recoverIfCommitted(this.pool, error, committed);
    }
    if (!wrote) return this.get({ draftId, actor });
    return draftAt(expectedRevision + 1);
  }

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
    const prepared = await this.pool.query(`
      ${DRAFT_ROW_SQL}
      WHERE id = $1 AND owner_subject = $2
    `, [draftId, owner.subject]);
    const peeked = prepared.rows[0];
    if (!peeked) throw new DraftNotFoundError(draftId);
    if (Number(peeked.revision) !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(peeked.revision)}`
      );
    }
    const previousDocument = assembleRowDocument(peeked);
    let nextDocument = applyAuthoredDomain(previousDocument, domain, projection);
    if (provenance !== undefined) {
      nextDocument = { ...nextDocument, provenance };
    } else if (Object.prototype.hasOwnProperty.call(previousDocument, "provenance")) {
      nextDocument = { ...nextDocument, provenance: previousDocument.provenance };
    }
    const materialized = assembleStoredDomainDocuments({ document: nextDocument });
    const nextAssembled = serializeDraftDocument(materialized);
    if (serializeDraftDocument(previousDocument) === nextAssembled) return fullDraft(peeked);
    const domains = storedDomainDocuments(materialized);
    const columns = domainColumnsForSave({
      content: peeked.content_json,
      pedagogy: peeked.pedagogy_json,
      classification: peeked.classification_json
    }, domain, domains);
    const contentHash = draftContentHash(nextAssembled);
    const now = new Date().toISOString();
    const draftAt = revision => committedDraftView({
      draftId,
      document: materialized,
      revision,
      contentHash,
      updatedAt: now,
      current: withHistoryCount(peeked, true),
      documentStale: true
    });
    const committed = {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      expectedContentHash: contentHash,
      draftAt
    };
    try {
      await withTransaction(this.pool, async client => {
        await this.#requireCurrent(client, draftId, owner.subject, expectedRevision);
        await insertHistorySnapshot(client, {
          draftId, ownerSubject: owner.subject, expectedRevision, now
        });
        await this.#updateDomains(client, {
          draftId,
          ownerSubject: owner.subject,
          expectedRevision,
          materialized,
          contentHash,
          now,
          domains: columns
        });
        await trimHistory(client, draftId);
      });
    } catch (error) {
      return recoverIfCommitted(this.pool, error, committed);
    }
    return draftAt(expectedRevision + 1);
  }

  async popWorkingCopy({ draftId, actor, expectedRevision }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const currentView = await this.get({ draftId, actor });
    if (currentView.revision !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${currentView.revision}`
      );
    }
    const now = new Date().toISOString();
    const committed = {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      expectedContentHash: null,
      draftAt: () => this.get({ draftId, actor })
    };
    try {
      const popped = await withTransaction(this.pool, async client => {
        const current = await this.#requireCurrent(client, draftId, owner.subject, expectedRevision);
        const history = await client.query(`
          SELECT seq, document,
            content_json, pedagogy_json, classification_json, provenance_json, administration_json
          FROM puzzle_draft_history
          WHERE draft_id = $1
          ORDER BY seq DESC
          LIMIT 1
        `, [draftId]);
        const previous = history.rows[0];
        if (!previous) throw new DraftEmptyHistoryError(draftId);
        const restored = historySnapshotDocument(previous);
        const materialized = assembleStoredDomainDocuments({
          document: restored,
          administration: partitionAuthoredDocument(assembleRowDocument(current)).administration ?? {}
        });
        const documentJson = serializeDraftDocument(materialized);
        const domains = storedDomainDocuments(materialized);
        const contentHash = draftContentHash(documentJson);
        committed.expectedContentHash = contentHash;
        await this.#updateDomains(client, {
          draftId,
          ownerSubject: owner.subject,
          expectedRevision,
          materialized,
          contentHash,
          now,
          domains
        });
        await client.query(
          `DELETE FROM puzzle_draft_history WHERE draft_id = $1 AND seq = $2`,
          [draftId, previous.seq]
        );
        const view = fullDraft(current);
        return {
          ...view,
          puzzleId: typeof materialized.id === "string" ? materialized.id : null,
          title: typeof materialized.title === "string" ? materialized.title : null,
          revision: expectedRevision + 1,
          contentHash,
          updatedAt: now,
          documentStale: true,
          validation: null,
          workingCopyHistoryCount: Math.max(0, Number(view.workingCopyHistoryCount || 0) - 1),
          document: materialized
        };
      });
      return popped;
    } catch (error) {
      return recoverIfCommitted(this.pool, error, committed);
    }
  }

  async delete({ draftId, actor, expectedRevision = null }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const guarded = Number.isInteger(expectedRevision);
    await withTransaction(this.pool, async client => {
      const deleted = guarded
        ? await client.query(
          `DELETE FROM puzzle_drafts WHERE id = $1 AND owner_subject = $2 AND revision = $3`,
          [draftId, owner, expectedRevision]
        )
        : await client.query(
          `DELETE FROM puzzle_drafts WHERE id = $1 AND owner_subject = $2`,
          [draftId, owner]
        );
      if (affectedRows(deleted) === 1) {
        await client.query(
          `DELETE FROM puzzle_board_limit_waiver_requests WHERE draft_id = $1`,
          [draftId]
        );
        return;
      }
      if (guarded) {
        const { rows } = await client.query(
          `SELECT revision FROM puzzle_drafts WHERE id = $1 AND owner_subject = $2`,
          [draftId, owner]
        );
        if (rows[0]) {
          throw new DraftConflictError(
            `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(rows[0].revision)}`
          );
        }
      }
      throw new DraftNotFoundError(draftId);
    });
  }

  async list({ actor, status = null, limit = 100, includeDocument = false } = {}) {
    const owner = normalizeDraftActor(actor).subject;
    const boundedLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
    const { rows } = status
      ? await this.pool.query(`
          SELECT * FROM puzzle_drafts
          WHERE owner_subject = $1 AND status = $2
          ORDER BY updated_at DESC LIMIT $3
        `, [owner, status, boundedLimit])
      : await this.pool.query(`
          SELECT * FROM puzzle_drafts
          WHERE owner_subject = $1
          ORDER BY updated_at DESC LIMIT $2
        `, [owner, boundedLimit]);
    return rows.map(includeDocument ? fullDraft : metadata);
  }

  async listChangedSince({ actor, since = null, limit = 200 } = {}) {
    const owner = normalizeDraftActor(actor).subject;
    const boundedLimit = Math.max(1, Math.min(Number(limit) || 200, 500));
    const { rows } = await this.pool.query(`
      SELECT id, puzzle_id, revision, content_hash, updated_at, validation_json
      FROM puzzle_drafts
      WHERE owner_subject = $1 AND ($2::text IS NULL OR updated_at > $2)
      ORDER BY updated_at ASC LIMIT $3
    `, [owner, since, boundedLimit]);
    return rows.map(row => ({
      draftId: row.id,
      puzzleId: row.puzzle_id,
      revision: Number(row.revision),
      contentHash: row.content_hash,
      updatedAt: row.updated_at,
      validation: row.validation_json ? parsedJson(row.validation_json, "Stored validation") : null
    }));
  }

  async recordValidation({ draftId, validation, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.pool.query(
      `UPDATE puzzle_drafts SET validation_json = $1 WHERE id = $2 AND owner_subject = $3`,
      [JSON.stringify(validation), draftId, owner]
    );
    if (affectedRows(result) !== 1) throw new DraftNotFoundError(draftId);
    return validation;
  }

  async saveLayout({ draftId, layout, actor, expectedUpdatedAt = null }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const layoutJson = serializeLayoutDocument(layout);
    const now = new Date().toISOString();
    const result = await this.pool.query(`
      UPDATE puzzle_drafts
      SET layout_json = $1, updated_at = $2
      WHERE id = $3 AND owner_subject = $4
        AND ($5::text IS NULL OR updated_at = $5)
    `, [layoutJson, now, draftId, owner, expectedUpdatedAt]);
    if (affectedRows(result) !== 1) {
      if (expectedUpdatedAt != null) throw new LayoutConflictError(draftId);
      throw new DraftNotFoundError(draftId);
    }
    return this.get({ draftId, actor });
  }

  async clearLayout({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.pool.query(`
      UPDATE puzzle_drafts
      SET layout_json = NULL, updated_at = $1
      WHERE id = $2 AND owner_subject = $3
    `, [new Date().toISOString(), draftId, owner]);
    if (affectedRows(result) !== 1) throw new DraftNotFoundError(draftId);
    return this.get({ draftId, actor });
  }

  async recordCheckoutInstall({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.pool.query(`
      UPDATE puzzle_drafts
      SET installed_content_hash = content_hash, updated_at = $1
      WHERE id = $2 AND owner_subject = $3
    `, [new Date().toISOString(), draftId, owner]);
    if (affectedRows(result) !== 1) throw new DraftNotFoundError(draftId);
    return this.get({ draftId, actor });
  }

  async clearCheckoutInstall({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.pool.query(`
      UPDATE puzzle_drafts
      SET installed_content_hash = NULL, updated_at = $1
      WHERE id = $2 AND owner_subject = $3
    `, [new Date().toISOString(), draftId, owner]);
    if (affectedRows(result) !== 1) throw new DraftNotFoundError(draftId);
    return this.get({ draftId, actor });
  }

  async rememberReviewBaseline({
    draftId, actor, document, expectedRevision, basePublishedRevision = null
  }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    serializeDraftDocument(document);
    const result = await this.pool.query(`
      UPDATE puzzle_drafts
      SET review_baseline_json = $1,
          review_base_published_revision = COALESCE(review_base_published_revision, $2)
      WHERE id = $3 AND owner_subject = $4 AND revision = $5
        AND (review_baseline_json IS NULL OR review_baseline_json = '')
    `, [
      serializeReviewBaseline(document),
      Number.isInteger(basePublishedRevision) ? basePublishedRevision : null,
      draftId,
      owner.subject,
      expectedRevision
    ]);
    if (affectedRows(result) !== 1) {
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
    const { rows } = await this.pool.query(
      `SELECT review_baseline_json FROM puzzle_drafts WHERE id = $1 AND owner_subject = $2`,
      [draftId, owner]
    );
    if (!rows[0]) throw new DraftNotFoundError(draftId);
    if (!rows[0].review_baseline_json) return null;
    const session = parseReviewBaseline(parsedJson(rows[0].review_baseline_json, "Stored review baseline"));
    return session?.document ?? null;
  }

  async setReviewStackLoaded({ draftId, actor, stackLoaded }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const { rows } = await this.pool.query(
      `SELECT review_baseline_json FROM puzzle_drafts WHERE id = $1 AND owner_subject = $2`,
      [draftId, owner]
    );
    if (!rows[0]) throw new DraftNotFoundError(draftId);
    if (!rows[0].review_baseline_json) return this.get({ draftId, actor });
    const session = parseReviewBaseline(parsedJson(rows[0].review_baseline_json, "Stored review baseline"));
    if (!session?.document) return this.get({ draftId, actor });
    await this.pool.query(
      `UPDATE puzzle_drafts SET review_baseline_json = $1 WHERE id = $2 AND owner_subject = $3`,
      [serializeReviewBaseline(session.document, { stackLoaded: stackLoaded === true }), draftId, owner]
    );
    return this.get({ draftId, actor });
  }

  async releaseReviewSession({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    await this.pool.query(`
      UPDATE puzzle_drafts
      SET opened_from_published = 0,
          review_baseline_json = NULL,
          review_base_published_revision = NULL
      WHERE id = $1 AND owner_subject = $2
    `, [draftId, owner]);
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
    await this.pool.query(`
      INSERT INTO draft_assistance_stamps (
        id, draft_id, owner_subject, captured_at, record_json
      ) VALUES ($1, $2, $3, $4, $5)
    `, [id, draftId, owner, capturedAt, JSON.stringify(record)]);
    return { id, draftId, capturedAt };
  }

  async listAssistanceStamps({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const { rows } = await this.pool.query(`
      SELECT captured_at, record_json FROM draft_assistance_stamps
      WHERE draft_id = $1 AND owner_subject = $2
      ORDER BY captured_at ASC, id ASC
    `, [draftId, owner]);
    return rows.flatMap(row => {
      let stored;
      try {
        stored = JSON.parse(row.record_json);
      } catch {
        return [];
      }
      const client = stored?.client || {};
      return [{
        capturedAt: row.captured_at,
        tool: stored?.tool || null,
        hostId: client.hostId || null,
        system: client.system || null,
        clientName: client.clientName || null
      }];
    });
  }

  async listBoardLimitWaiverRequests({ draftId, actor }) {
    const owner = normalizeDraftActor(actor).subject;
    const owned = await this.pool.query(
      `SELECT 1 FROM puzzle_drafts WHERE id = $1 AND owner_subject = $2`,
      [draftId, owner]
    );
    if (!owned.rows[0]) throw new DraftNotFoundError(draftId);
    const { rows } = await this.pool.query(`
      SELECT * FROM puzzle_board_limit_waiver_requests
      WHERE draft_id = $1 ORDER BY requested_at DESC, id DESC
    `, [draftId]);
    return rows.map(waiverRequest);
  }

  async requestBoardLimitWaiver({
    draftId, waiverType, targetId, reason, actor, expectedRevision
  }) {
    const draft = await this.get({ draftId, actor });
    if (draft.revision !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${draft.revision}`
      );
    }
    const requested = makeBoardLimitWaiverRequest(draft.document, waiverType, targetId, reason);
    const requestedBy = actorLabel(actor);
    const now = new Date().toISOString();
    return withTransaction(this.pool, async client => {
      const existing = await client.query(`
        SELECT * FROM puzzle_board_limit_waiver_requests
        WHERE draft_id = $1 AND waiver_type = $2 AND target_id = $3
          AND status = 'pending' AND requested_count = $4
      `, [draftId, waiverType, targetId, requested.count]);
      const pending = existing.rows[0] ? waiverRequest(existing.rows[0]) : null;
      if (pending?.reason === reason.trim()) return pending;
      if (pending) {
        await client.query(`
          UPDATE puzzle_board_limit_waiver_requests
          SET status = 'superseded', decided_by = $1, decided_at = $2, decision_note = $3
          WHERE id = $4 AND draft_id = $5 AND status = 'pending'
        `, [requestedBy, now, "Superseded by an updated author rationale.", pending.id, draftId]);
      }
      await client.query(`
        INSERT INTO puzzle_board_limit_waiver_requests
          (draft_id, puzzle_id, waiver_type, target_id, requested_count, reason, status,
           requested_by, requested_at, requested_revision)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9)
        ON CONFLICT DO NOTHING
      `, [
        draftId, draft.document.id, requested.waiverType, targetId, requested.count,
        requested.reason, requestedBy, now, expectedRevision
      ]);
      const stored = await client.query(`
        SELECT * FROM puzzle_board_limit_waiver_requests
        WHERE draft_id = $1 AND waiver_type = $2 AND target_id = $3
          AND status = 'pending' AND requested_count = $4
        ORDER BY id DESC LIMIT 1
      `, [draftId, waiverType, targetId, requested.count]);
      return waiverRequest(stored.rows[0]);
    });
  }

  async #mutateWaiver(client, {
    draftId, ownerSubject, expectedRevision, document, audit
  }) {
    const current = await this.#requireCurrent(client, draftId, ownerSubject, expectedRevision);
    const currentDocument = assembleRowDocument(current);
    const materialized = assembleStoredDomainDocuments({ document });
    assertNoWriteOnceDrift(currentDocument, materialized, "stored draft document");
    const domains = storedDomainDocuments(materialized);
    const contentHash = draftContentHash(serializeDraftDocument(materialized));
    const now = new Date().toISOString();
    const recordHistory = serializeDraftDocument(currentDocument) !== serializeDraftDocument(materialized);
    if (recordHistory) {
      await insertHistorySnapshot(client, {
        draftId, ownerSubject, expectedRevision, now
      });
    }
    await this.#updateDomains(client, {
      draftId, ownerSubject, expectedRevision, materialized, contentHash, now, domains
    });
    if (recordHistory) await trimHistory(client, draftId);
    if (audit) {
      await audit(client, { revision: expectedRevision + 1, contentHash, now });
    }
    return committedDraftView({
      draftId,
      document: materialized,
      revision: expectedRevision + 1,
      contentHash,
      updatedAt: now,
      current: withHistoryCount(current, recordHistory),
      documentStale: true
    });
  }

  async decideBoardLimitWaiver({
    draftId, requestId, decision, actor, expectedRevision, note = ""
  }) {
    if (!["granted", "declined"].includes(decision)) {
      throw new Error("Decision must be granted or declined.");
    }
    const draft = await this.get({ draftId, actor });
    if (draft.revision !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${draft.revision}`
      );
    }
    const request = (await this.listBoardLimitWaiverRequests({ draftId, actor }))
      .find(item => item.id === Number(requestId));
    if (!request || request.status !== "pending") {
      throw new Error("That board limit waiver request is no longer pending.");
    }
    if (decision === "granted" && !boardLimitWaiverRequestIsCurrent(draft.document, request)) {
      throw new DraftConflictError(
        "The target's size changed after the request. Refresh and request review for the current board state."
      );
    }
    const decidedBy = actorLabel(actor);
    const owner = normalizeDraftActor(actor);
    const now = new Date().toISOString();
    if (decision === "declined") {
      return withTransaction(this.pool, async client => {
        const declined = await client.query(`
          UPDATE puzzle_board_limit_waiver_requests
          SET status = 'declined', decided_by = $1, decided_at = $2, decision_note = $3
          WHERE id = $4 AND draft_id = $5 AND status = 'pending'
        `, [decidedBy, now, note.trim() || null, request.id, draftId]);
        if (affectedRows(declined) !== 1) {
          throw new DraftConflictError("That board limit waiver request is no longer pending.");
        }
        return this.get({ draftId, actor });
      });
    }
    const previous = (draft.document.boardLimitWaivers || []).some(item =>
      item.waiverType === request.waiverType && item.targetId === request.targetId
    );
    const document = grantBoardLimitWaiver(
      draft.document, request.waiverType, request.targetId, request.reason, owner, now
    );
    return withTransaction(this.pool, client => this.#mutateWaiver(client, {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      document,
      audit: async (tx, landed) => {
        await tx.query(`
          UPDATE puzzle_board_limit_waiver_requests
          SET status = 'replaced', decided_by = $1, decided_at = $2, decision_note = $3
          WHERE draft_id = $4 AND waiver_type = $5 AND target_id = $6
            AND status = 'granted' AND id != $7
        `, [decidedBy, now, note.trim() || null, draftId, request.waiverType, request.targetId, request.id]);
        await tx.query(`
          UPDATE puzzle_board_limit_waiver_requests
          SET status = 'granted', decided_by = $1, decided_at = $2, decision_note = $3
          WHERE id = $4 AND draft_id = $5 AND status = 'pending'
        `, [decidedBy, now, note.trim() || null, request.id, draftId]);
        await tx.query(`
          INSERT INTO puzzle_board_limit_waiver_events
            (puzzle_id, waiver_type, target_id, event_type, actor, event_at,
             approved_count, reason, draft_id, draft_revision)
          SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          WHERE NOT EXISTS (
            SELECT 1 FROM puzzle_board_limit_waiver_events
            WHERE draft_id = $9 AND draft_revision = $10
              AND waiver_type = $2 AND target_id = $3
          )
        `, [
          draft.document.id, request.waiverType, request.targetId,
          previous ? "replaced" : "granted", decidedBy, now,
          request.count, request.reason, draftId, landed.revision
        ]);
      }
    }));
  }

  async grantBoardLimitWaiverDirect({
    draftId, waiverType, targetId, reason, actor, expectedRevision
  }) {
    const request = await this.requestBoardLimitWaiver({
      draftId, waiverType, targetId, reason, actor, expectedRevision
    });
    return this.decideBoardLimitWaiver({
      draftId, requestId: request.id, decision: "granted", actor, expectedRevision
    });
  }

  async revokeBoardLimitWaiver({
    draftId, waiverType, targetId, actor, expectedRevision, note = ""
  }) {
    const policy = boardLimitWaiverPolicy(waiverType);
    if (!policy) throw new Error(`Unsupported board limit waiver type: ${waiverType}`);
    const draft = await this.get({ draftId, actor });
    if (draft.revision !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${draft.revision}`
      );
    }
    const grant = (draft.document.boardLimitWaivers || []).find(item =>
      item.waiverType === waiverType && item.targetId === targetId
    );
    if (!grant) throw new Error("There is no current grant for that board limit scope.");
    const owner = normalizeDraftActor(actor);
    const decidedBy = actorLabel(actor);
    const now = new Date().toISOString();
    const document = withoutBoardLimitWaiver(draft.document, waiverType, targetId);
    return withTransaction(this.pool, client => this.#mutateWaiver(client, {
      draftId,
      ownerSubject: owner.subject,
      expectedRevision,
      document,
      audit: async (tx, landed) => {
        await tx.query(`
          UPDATE puzzle_board_limit_waiver_requests
          SET status = 'revoked', decided_by = $1, decided_at = $2, decision_note = $3
          WHERE draft_id = $4 AND waiver_type = $5 AND target_id = $6 AND status = 'granted'
        `, [decidedBy, now, note.trim() || null, draftId, waiverType, targetId]);
        await tx.query(`
          INSERT INTO puzzle_board_limit_waiver_events
            (puzzle_id, waiver_type, target_id, event_type, actor, event_at,
             approved_count, reason, draft_id, draft_revision)
          SELECT $1, $2, $3, 'revoked', $4, $5, $6, $7, $8, $9
          WHERE NOT EXISTS (
            SELECT 1 FROM puzzle_board_limit_waiver_events
            WHERE draft_id = $8 AND draft_revision = $9
              AND waiver_type = $2 AND target_id = $3
          )
        `, [
          draft.document.id, waiverType, targetId, decidedBy, now,
          grant.approvedCount, grant.reason, draftId, landed.revision
        ]);
      }
    }));
  }
}

export default PostgresDraftRepository;
