import {
  assertDraftId,
  DraftConflictError,
  DraftNotFoundError,
  DraftRepository,
  draftContentHash,
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
    headRevision: row.head_revision,
    baseCommitSha: row.base_commit_sha,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function fullDraft(row) {
  return {
    ...metadata(row),
    revision: row.revision,
    contentHash: row.content_hash,
    validation: row.validation_json
      ? parsedJson(row.validation_json, "Stored validation")
      : null,
    document: parsedJson(row.document_jsonld, "Stored draft")
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
      await this.database.batch([
        this.database.prepare(`
          INSERT INTO puzzle_drafts (
            id, puzzle_id, owner_subject, title, status, head_revision,
            base_commit_sha, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'draft', 1, ?, ?, ?)
        `).bind(
          draftId,
          typeof document.id === "string" ? document.id : null,
          owner.subject,
          typeof document.title === "string" ? document.title : null,
          baseCommitSha,
          now,
          now
        ),
        this.database.prepare(`
          INSERT INTO puzzle_draft_revisions (
            draft_id, revision, document_jsonld, content_hash,
            validation_json, created_by, created_at
          ) VALUES (?, 1, ?, ?, NULL, ?, ?)
        `).bind(draftId, documentJson, contentHash, owner.subject, now)
      ]);
    } catch (error) {
      if (String(error?.message || error).includes("UNIQUE constraint failed")) {
        throw new DraftConflictError(`Draft "${draftId}" already exists`);
      }
      throw error;
    }
    return this.get({ draftId, actor });
  }

  /**
   * @param {{draftId: string, actor: {subject: string}, revision?: number | null}} input
   */
  async get({ draftId, actor, revision = null }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const row = revision === null
      ? await this.database.prepare(`
          SELECT d.*, r.revision, r.document_jsonld, r.content_hash,
                 r.validation_json
          FROM puzzle_drafts d
          JOIN puzzle_draft_revisions r
            ON r.draft_id = d.id AND r.revision = d.head_revision
          WHERE d.id = ? AND d.owner_subject = ?
        `).bind(draftId, owner).first()
      : await this.database.prepare(`
          SELECT d.*, r.revision, r.document_jsonld, r.content_hash,
                 r.validation_json
          FROM puzzle_drafts d
          JOIN puzzle_draft_revisions r ON r.draft_id = d.id
          WHERE d.id = ? AND d.owner_subject = ? AND r.revision = ?
        `).bind(draftId, owner, revision).first();
    if (!row) throw new DraftNotFoundError(draftId);
    return fullDraft(row);
  }

  async save({ draftId, document, expectedRevision, actor }) {
    assertDraftId(draftId);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const documentJson = serializeDraftDocument(document);
    const contentHash = await draftContentHash(documentJson);
    const nextRevision = expectedRevision + 1;
    const now = new Date().toISOString();
    const results = await this.database.batch([
      this.database.prepare(`
        INSERT INTO puzzle_draft_revisions (
          draft_id, revision, document_jsonld, content_hash,
          validation_json, created_by, created_at
        )
        SELECT id, ?, ?, ?, NULL, ?, ?
        FROM puzzle_drafts
        WHERE id = ? AND owner_subject = ? AND head_revision = ?
      `).bind(
        nextRevision,
        documentJson,
        contentHash,
        owner.subject,
        now,
        draftId,
        owner.subject,
        expectedRevision
      ),
      this.database.prepare(`
        UPDATE puzzle_drafts
        SET puzzle_id = ?, title = ?, head_revision = ?, updated_at = ?
        WHERE id = ? AND owner_subject = ? AND head_revision = ?
      `).bind(
        typeof document.id === "string" ? document.id : null,
        typeof document.title === "string" ? document.title : null,
        nextRevision,
        now,
        draftId,
        owner.subject,
        expectedRevision
      )
    ]);
    if (changes(results[1]) !== 1) {
      let currentRevision = null;
      try {
        currentRevision = (await this.get({ draftId, actor })).headRevision;
      } catch (error) {
        if (!(error instanceof DraftNotFoundError)) throw error;
      }
      if (currentRevision === null) throw new DraftNotFoundError(draftId);
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${currentRevision}`,
        { currentRevision }
      );
    }
    return this.get({ draftId, actor });
  }

  async list({ actor, status = null, limit = 100 } = {}) {
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
    return result.results.map(metadata);
  }

  async revisions({ draftId, actor, limit = 100 }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const boundedLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
    const result = await this.database.prepare(`
      SELECT r.revision, r.content_hash, r.validation_json,
             r.created_by, r.created_at
      FROM puzzle_draft_revisions r
      JOIN puzzle_drafts d ON d.id = r.draft_id
      WHERE d.id = ? AND d.owner_subject = ?
      ORDER BY r.revision DESC LIMIT ?
    `).bind(draftId, owner, boundedLimit).all();
    if (!result.results.length) {
      await this.get({ draftId, actor });
    }
    return result.results.map(row => ({
      revision: row.revision,
      contentHash: row.content_hash,
      createdBy: row.created_by,
      createdAt: row.created_at,
      validation: row.validation_json
        ? parsedJson(row.validation_json, "Stored validation")
        : null
    }));
  }

  async compare({ draftId, leftRevision, rightRevision, actor }) {
    const [left, right] = await Promise.all([
      this.get({ draftId, actor, revision: leftRevision }),
      this.get({ draftId, actor, revision: rightRevision })
    ]);
    return { left, right };
  }

  async recordValidation({ draftId, revision, validation, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const validationJson = JSON.stringify(validation);
    const id = crypto.randomUUID();
    const results = await this.database.batch([
      this.database.prepare(`
        INSERT INTO validation_runs (
          id, draft_id, revision, valid, errors_json, created_by, created_at
        )
        SELECT ?, d.id, ?, ?, ?, ?, ?
        FROM puzzle_drafts d
        JOIN puzzle_draft_revisions r
          ON r.draft_id = d.id AND r.revision = ?
        WHERE d.id = ? AND d.owner_subject = ?
      `).bind(
        id,
        revision,
        validation.valid ? 1 : 0,
        JSON.stringify(validation.errors || []),
        owner,
        now,
        revision,
        draftId,
        owner
      ),
      this.database.prepare(`
        UPDATE puzzle_draft_revisions
        SET validation_json = ?
        WHERE draft_id = ? AND revision = ?
          AND EXISTS (
            SELECT 1 FROM puzzle_drafts
            WHERE id = ? AND owner_subject = ?
          )
      `).bind(validationJson, draftId, revision, draftId, owner)
    ]);
    if (changes(results[1]) !== 1) throw new DraftNotFoundError(draftId);
    return validation;
  }
}

export default D1DraftRepository;
