import {
  DraftConflictError,
  DraftNotFoundError,
  assertDraftId,
  draftContentHash,
  normalizeDraftActor,
  serializeDraftDocument
} from "./draftRepository.js";
import { assertCurrentAuthoredDocument } from "./authoringDomains.js";
import { CONTENT_DRAFT_KINDS } from "./contentDocumentRepository.js";
import { affectedRows, uniqueViolation, withTransaction } from "./postgresPool.js";

function assertKind(kind) {
  if (!CONTENT_DRAFT_KINDS.includes(kind)) {
    throw new Error(`Unsupported content kind: ${kind}`);
  }
}

function titleOf(document) {
  return typeof document?.title === "string" ? document.title : null;
}

function draftRecord(row) {
  const document = assertCurrentAuthoredDocument(
    JSON.parse(row.document),
    "Stored content draft"
  );
  return {
    kind: row.kind,
    id: row.id,
    draftId: row.id,
    ownerSubject: row.owner_subject,
    title: row.title,
    revision: Number(row.revision),
    contentHash: row.content_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    document
  };
}

export class PostgresContentDraftRepository {
  constructor(pool) {
    if (!pool) throw new Error("A Postgres pool is required");
    this.pool = pool;
  }

  async getDraft({ kind, id, actor }) {
    assertKind(kind);
    assertDraftId(id);
    const owner = normalizeDraftActor(actor).subject;
    const { rows } = await this.pool.query(`
      SELECT * FROM content_drafts
      WHERE kind = $1 AND id = $2 AND owner_subject = $3
    `, [kind, id, owner]);
    if (!rows[0]) throw new DraftNotFoundError(id);
    return draftRecord(rows[0]);
  }

  async createDraft({ kind, id, document, actor }) {
    assertKind(kind);
    assertDraftId(id);
    const owner = normalizeDraftActor(actor);
    const documentJson = serializeDraftDocument({ ...document, id });
    const contentHash = draftContentHash(documentJson);
    const now = new Date().toISOString();
    try {
      await withTransaction(this.pool, client => client.query(`
        INSERT INTO content_drafts (
          kind, id, owner_subject, title, document, content_hash,
          revision, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8)
      `, [kind, id, owner.subject, titleOf(document), documentJson, contentHash, now, now]));
    } catch (error) {
      if (uniqueViolation(error)) throw new DraftConflictError(`${kind} "${id}" already exists`);
      throw error;
    }
    return this.getDraft({ kind, id, actor });
  }

  async saveDraft({ kind, id, document, actor, expectedRevision }) {
    assertKind(kind);
    assertDraftId(id);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const documentJson = serializeDraftDocument({ ...document, id });
    const contentHash = draftContentHash(documentJson);
    const now = new Date().toISOString();
    const result = await withTransaction(this.pool, client => client.query(`
      UPDATE content_drafts
      SET title = $1, document = $2, content_hash = $3,
          revision = revision + 1, updated_at = $4
      WHERE kind = $5 AND id = $6 AND owner_subject = $7 AND revision = $8
    `, [
      titleOf(document), documentJson, contentHash, now,
      kind, id, owner.subject, expectedRevision
    ]));
    if (affectedRows(result) !== 1) {
      const current = await this.getDraft({ kind, id, actor });
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${current.revision}`
      );
    }
    return this.getDraft({ kind, id, actor });
  }

  async listDrafts({ kind, actor, includeDocument = false } = {}) {
    assertKind(kind);
    const owner = normalizeDraftActor(actor).subject;
    const { rows } = await this.pool.query(`
      SELECT * FROM content_drafts
      WHERE kind = $1 AND owner_subject = $2
      ORDER BY updated_at DESC
    `, [kind, owner]);
    return rows.map(row => {
      const record = draftRecord(row);
      if (includeDocument) return record;
      const { document, ...rest } = record;
      return rest;
    });
  }

  async deleteDraft({ kind, id, actor }) {
    assertKind(kind);
    assertDraftId(id);
    const owner = normalizeDraftActor(actor).subject;
    const result = await withTransaction(this.pool, client => client.query(
      `DELETE FROM content_drafts WHERE kind = $1 AND id = $2 AND owner_subject = $3`,
      [kind, id, owner]
    ));
    if (affectedRows(result) !== 1) throw new DraftNotFoundError(id);
  }
}
