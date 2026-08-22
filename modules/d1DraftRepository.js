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
      SELECT * FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
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
      const current = await this.get({ draftId, actor });
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${current.revision}`
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

  async delete({ draftId, actor }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    // draftId is globally unique (puzzle_drafts.id is the primary key), so
    // this doesn't need an owner join -- a publication_requests row for
    // this draft means get_publication_status must still be able to find
    // it via its own owner-scoped join to puzzle_drafts, which deleting
    // the draft would break.
    const published = await this.database.prepare(`
      SELECT 1 FROM publication_requests WHERE draft_id = ? LIMIT 1
    `).bind(draftId).first();
    if (published) {
      throw new Error(
        `Draft "${draftId}" has publication history and cannot be deleted; ` +
        "its record must remain so get_publication_status keeps working"
      );
    }
    const result = await this.database.prepare(`
      DELETE FROM puzzle_drafts WHERE id = ? AND owner_subject = ?
    `).bind(draftId, owner).run();
    if (changes(result) !== 1) throw new DraftNotFoundError(draftId);
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
}

export default D1DraftRepository;
