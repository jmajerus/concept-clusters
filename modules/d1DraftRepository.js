import {
  assertDraftId,
  DraftConflictError,
  DraftEmptyHistoryError,
  DraftNotFoundError,
  DraftRepository,
  draftContentHash,
  MAX_WORKING_COPY_HISTORY,
  normalizeDraftActor,
  serializeDraftDocument
} from "./draftRepository.js";

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
    updatedAt: row.updated_at
  };
}

function fullDraft(row) {
  return {
    ...metadata(row),
    workingCopyHistoryCount: Number(row.working_copy_history_count || 0),
    validation: row.validation_json
      ? parsedJson(row.validation_json, "Stored validation")
      : null,
    document: parsedJson(row.document, "Stored draft")
  };
}

function changes(result) {
  return Number(result?.meta?.changes || 0);
}

export class D1DraftRepository extends DraftRepository {
  constructor(database) {
    super();
    if (!database) throw new Error("A D1 database binding is required");
    this.database = database;
  }

  async create({ draftId, document, actor, baseCommitSha = null }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor);
    const documentJson = serializeDraftDocument(document);
    const contentHash = await draftContentHash(documentJson);
    const now = new Date().toISOString();
    try {
      await this.database.prepare(`
        INSERT INTO puzzle_drafts (
          id, puzzle_id, owner_subject, title, status,
          document, content_hash, base_commit_sha,
          created_at, updated_at, revision
        ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, 1)
      `).bind(
        draftId,
        typeof document.id === "string" ? document.id : null,
        owner.subject,
        typeof document.title === "string" ? document.title : null,
        documentJson,
        contentHash,
        baseCommitSha,
        now,
        now
      ).run();
    } catch (error) {
      if (String(error?.message || error).includes("UNIQUE constraint failed")) {
        throw new DraftConflictError(`Draft "${draftId}" already exists`);
      }
      throw error;
    }
    return this.get({ draftId, actor });
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

  async save({ draftId, document, actor, expectedRevision }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const current = await this.database.prepare(`
      SELECT document, content_hash, revision
      FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner.subject).first();
    if (!current) throw new DraftNotFoundError(draftId);
    if (Number(current.revision) !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${Number(current.revision)}`
      );
    }
    const documentJson = serializeDraftDocument(document);
    const contentHash = await draftContentHash(documentJson);
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts
      SET puzzle_id = ?, title = ?, document = ?, content_hash = ?,
          revision = revision + 1, validation_json = NULL, updated_at = ?
      WHERE id = ? AND owner_subject = ? AND revision = ?
    `).bind(
      typeof document.id === "string" ? document.id : null,
      typeof document.title === "string" ? document.title : null,
      documentJson,
      contentHash,
      now,
      draftId,
      owner.subject,
      expectedRevision
    ).run();
    if (changes(result) !== 1) {
      const latest = await this.get({ draftId, actor });
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${latest.revision}`
      );
    }
    if (contentHash !== current.content_hash) {
      const seqRow = await this.database.prepare(`
        SELECT MAX(seq) AS seq FROM puzzle_draft_history WHERE draft_id = ?
      `).bind(draftId).first();
      const nextSeq = Number(seqRow?.seq || 0) + 1;
      await this.database.prepare(`
        INSERT INTO puzzle_draft_history (
          draft_id, seq, document, content_hash, saved_at
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        draftId,
        nextSeq,
        current.document,
        current.content_hash,
        now
      ).run();
      if (nextSeq > MAX_WORKING_COPY_HISTORY) {
        await this.database.prepare(`
          DELETE FROM puzzle_draft_history
          WHERE draft_id = ? AND seq <= ?
        `).bind(draftId, nextSeq - MAX_WORKING_COPY_HISTORY).run();
      }
    }
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
      SELECT seq, document, content_hash
      FROM puzzle_draft_history
      WHERE draft_id = ?
      ORDER BY seq DESC
      LIMIT 1
    `).bind(draftId).first();
    if (!previous) throw new DraftEmptyHistoryError(draftId);
    const restored = parsedJson(previous.document, "Stored working copy");
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE puzzle_drafts
      SET puzzle_id = ?, title = ?, document = ?, content_hash = ?,
          revision = revision + 1, validation_json = NULL, updated_at = ?
      WHERE id = ? AND owner_subject = ? AND revision = ?
    `).bind(
      typeof restored.id === "string" ? restored.id : null,
      typeof restored.title === "string" ? restored.title : null,
      previous.document,
      previous.content_hash,
      now,
      draftId,
      owner.subject,
      expectedRevision
    ).run();
    if (changes(result) !== 1) {
      const latest = await this.get({ draftId, actor });
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${latest.revision}`
      );
    }
    await this.database.prepare(`
      DELETE FROM puzzle_draft_history WHERE draft_id = ? AND seq = ?
    `).bind(draftId, previous.seq).run();
    return this.get({ draftId, actor });
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

  async delete({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.database.batch([
      this.database.prepare(`
        DELETE FROM puzzle_draft_history WHERE draft_id = ?
      `).bind(draftId),
      this.database.prepare(`
        DELETE FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
      `).bind(draftId, owner)
    ]);
    if (changes(result[1]) !== 1) throw new DraftNotFoundError(draftId);
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
}

export default D1DraftRepository;
