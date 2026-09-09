import {
  DraftConflictError,
  DraftNotFoundError,
  assertDraftId,
  draftContentHash,
  normalizeDraftActor,
  serializeDraftDocument
} from "./draftRepository.js";

export const CONTENT_DRAFT_KINDS = Object.freeze(["catalogue", "category"]);
export const PUBLISHED_DOCUMENT_KINDS = Object.freeze([
  "puzzle",
  "catalogue",
  "category"
]);

function assertKind(kind, allowed) {
  if (!allowed.includes(kind)) {
    throw new Error(`Unsupported content kind: ${kind}`);
  }
}

function parsedJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON: ${error.message}`);
  }
}

function changes(result) {
  return Number(result?.meta?.changes || 0);
}

function draftRecord(row) {
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
    document: parsedJson(row.document, "Stored content draft")
  };
}

function publishedRecord(row) {
  return {
    kind: row.kind,
    id: row.id,
    title: row.title,
    revision: Number(row.revision),
    contentHash: row.content_hash,
    publishedBy: row.published_by,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    lastAgentReviewedAt: row.last_agent_reviewed_at || null,
    lastHumanReviewedAt: row.last_human_reviewed_at || null,
    withdrawnAt: row.withdrawn_at || null,
    cuedForFreezeAt: row.cued_for_freeze_at || row.ready_for_freeze_at || null,
    cuedForFreezeBy: row.cued_for_freeze_by || row.ready_for_freeze_by || null,
    document: parsedJson(row.document, "Published document")
  };
}

function titleOf(document) {
  return typeof document?.title === "string" ? document.title : null;
}

function reviewEventRecord(row) {
  return {
    id: Number(row.id),
    puzzleId: row.puzzle_id,
    reviewerKind: row.reviewer_kind,
    reviewedAt: row.reviewed_at,
    comments: row.comments || null,
    outcome: row.outcome || null,
    draftRevision: row.draft_revision == null ? null : Number(row.draft_revision),
    guidance: row.guidance_major == null
      ? null
      : { major: Number(row.guidance_major), minor: Number(row.guidance_minor || 0) }
  };
}

function reviewEventInput({ reviewerKind, comments = null, outcome = null, draftRevision = null, guidance = null }) {
  if (!['agent', 'human'].includes(reviewerKind)) {
    throw new Error("reviewerKind must be agent or human");
  }
  if (comments != null && (typeof comments !== "string" || comments.length > 10_000)) {
    throw new Error("comments must be a string of at most 10000 characters");
  }
  if (outcome != null && (typeof outcome !== "string" || outcome.length > 80)) {
    throw new Error("outcome must be a string of at most 80 characters");
  }
  if (draftRevision != null && (!Number.isInteger(draftRevision) || draftRevision < 1)) {
    throw new Error("draftRevision must be a positive integer");
  }
  if (guidance != null && (!Number.isInteger(guidance.major) || !Number.isInteger(guidance.minor))) {
    throw new Error("guidance must contain integer major and minor values");
  }
  return {
    reviewerKind,
    comments: comments?.trim() || null,
    outcome: outcome?.trim() || null,
    draftRevision,
    guidance: guidance ? { major: guidance.major, minor: guidance.minor } : null
  };
}

export class ContentDocumentNotFoundError extends Error {
  constructor(kind, id) {
    super(`Unknown ${kind}: ${id}`);
    this.name = "ContentDocumentNotFoundError";
    this.kind = kind;
    this.id = id;
  }
}

export async function publishedRowOrNull(contentDocuments, kind, id) {
  if (!contentDocuments || !id) return null;
  try {
    return await contentDocuments.getPublished({ kind, id });
  } catch (error) {
    if (error instanceof ContentDocumentNotFoundError) return null;
    throw error;
  }
}

export async function draftRowOrNull(contentDocuments, kind, id, actor) {
  if (!contentDocuments || !id) return null;
  try {
    return await contentDocuments.getDraft({ kind, id, actor }) || null;
  } catch (error) {
    if (error instanceof DraftNotFoundError) return null;
    throw error;
  }
}

export class D1ContentDocumentRepository {
  constructor(database) {
    if (!database) throw new Error("A D1 database binding is required");
    this.database = database;
  }

  async getDraft({ kind, id, actor }) {
    assertKind(kind, CONTENT_DRAFT_KINDS);
    assertDraftId(id);
    const owner = normalizeDraftActor(actor).subject;
    const row = await this.database.prepare(`
      SELECT * FROM content_drafts WHERE kind = ? AND id = ? AND owner_subject = ?
    `).bind(kind, id, owner).first();
    if (!row) throw new DraftNotFoundError(id);
    return draftRecord(row);
  }

  async createDraft({ kind, id, document, actor }) {
    assertKind(kind, CONTENT_DRAFT_KINDS);
    assertDraftId(id);
    const owner = normalizeDraftActor(actor);
    const documentJson = serializeDraftDocument({ ...document, id });
    const contentHash = await draftContentHash(documentJson);
    const now = new Date().toISOString();
    try {
      await this.database.prepare(`
        INSERT INTO content_drafts (
          kind, id, owner_subject, title, document, content_hash,
          revision, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(
        kind, id, owner.subject, titleOf(document), documentJson, contentHash, now, now
      ).run();
    } catch (error) {
      if (String(error?.message || error).includes("UNIQUE constraint failed")) {
        throw new DraftConflictError(`${kind} "${id}" already exists`);
      }
      throw error;
    }
    return this.getDraft({ kind, id, actor });
  }

  async saveDraft({ kind, id, document, actor, expectedRevision }) {
    assertKind(kind, CONTENT_DRAFT_KINDS);
    assertDraftId(id);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const owner = normalizeDraftActor(actor);
    const documentJson = serializeDraftDocument({ ...document, id });
    const contentHash = await draftContentHash(documentJson);
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE content_drafts
      SET title = ?, document = ?, content_hash = ?,
          revision = revision + 1, updated_at = ?
      WHERE kind = ? AND id = ? AND owner_subject = ? AND revision = ?
    `).bind(
      titleOf(document), documentJson, contentHash, now,
      kind, id, owner.subject, expectedRevision
    ).run();
    if (changes(result) !== 1) {
      const current = await this.getDraft({ kind, id, actor });
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${current.revision}`
      );
    }
    return this.getDraft({ kind, id, actor });
  }

  async listDrafts({ kind, actor, includeDocument = false } = {}) {
    assertKind(kind, CONTENT_DRAFT_KINDS);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.database.prepare(`
      SELECT * FROM content_drafts
      WHERE kind = ? AND owner_subject = ?
      ORDER BY updated_at DESC
    `).bind(kind, owner).all();
    return result.results.map(row => {
      const record = draftRecord(row);
      if (includeDocument) return record;
      const { document, ...metadata } = record;
      return metadata;
    });
  }

  async deleteDraft({ kind, id, actor }) {
    assertKind(kind, CONTENT_DRAFT_KINDS);
    assertDraftId(id);
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.database.prepare(`
      DELETE FROM content_drafts WHERE kind = ? AND id = ? AND owner_subject = ?
    `).bind(kind, id, owner).run();
    if (changes(result) !== 1) throw new DraftNotFoundError(id);
  }

  async getPublished({ kind, id }) {
    assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
    assertDraftId(id);
    const row = await this.database.prepare(`
      SELECT * FROM published_documents WHERE kind = ? AND id = ?
    `).bind(kind, id).first();
    if (!row) throw new ContentDocumentNotFoundError(kind, id);
    return publishedRecord(row);
  }

  async listPublished({ kind, includeWithdrawn = false } = {}) {
    assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
    const result = await this.database.prepare(`
      SELECT * FROM published_documents WHERE kind = ? ORDER BY id
    `).bind(kind).all();
    return result.results.map(publishedRecord)
      .filter(row => includeWithdrawn || !row.withdrawnAt)
      .sort((left, right) =>
        String(left.title || left.id).localeCompare(String(right.title || right.id))
      );
  }

  // A review is editorial metadata, not a publication.  In particular it must
  // not create a revision or make a later board edit look as though it was
  // reviewed.
  async recordPuzzleReviewEvent({
    id,
    reviewerKind,
    reviewedAt = new Date().toISOString(),
    comments = null,
    outcome = null,
    draftRevision = null,
    guidance = null
  }) {
    assertDraftId(id);
    if (typeof reviewedAt !== "string" || Number.isNaN(Date.parse(reviewedAt))) {
      throw new Error("reviewedAt must be an ISO timestamp");
    }
    const event = reviewEventInput({ reviewerKind, comments, outcome, draftRevision, guidance });
    await this.getPublished({ kind: "puzzle", id });
    const reviewColumn = event.reviewerKind === "agent"
      ? "last_agent_reviewed_at"
      : "last_human_reviewed_at";
    await this.database.batch([
      this.database.prepare(`
      UPDATE published_documents
      SET ${reviewColumn} = ?
      WHERE kind = 'puzzle' AND id = ? AND withdrawn_at IS NULL
      `).bind(reviewedAt, id),
      this.database.prepare(`
        INSERT INTO puzzle_review_events (
          puzzle_id, reviewer_kind, reviewed_at, comments, outcome,
          draft_revision, guidance_major, guidance_minor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, event.reviewerKind, reviewedAt, event.comments, event.outcome,
        event.draftRevision, event.guidance?.major ?? null, event.guidance?.minor ?? null
      )
    ]);
    return this.getPublished({ kind: "puzzle", id });
  }

  async recordPuzzleAgentReview(args) {
    return this.recordPuzzleReviewEvent({ ...args, reviewerKind: "agent" });
  }

  async recordPuzzleHumanReview(args) {
    return this.recordPuzzleReviewEvent({ ...args, reviewerKind: "human" });
  }

  async listPuzzleReviewEvents({ id, limit = 20 }) {
    assertDraftId(id);
    const cappedLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    const result = await this.database.prepare(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = ?
      ORDER BY reviewed_at DESC, id DESC
      LIMIT ?
    `).bind(id, cappedLimit).all();
    return result.results.map(reviewEventRecord);
  }

  async seedPublishedIfAbsent({ kind, id, document }) {
    await this.seedPublishedManyIfAbsent([{ kind, id, document }]);
    return this.getPublished({ kind, id });
  }

  async seedPublishedManyIfAbsent(items = []) {
    if (!items.length) return;
    const now = new Date().toISOString();
    const statements = [];
    for (const item of items) {
      assertKind(item.kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(item.id);
      const documentJson = serializeDraftDocument({ ...item.document, id: item.id });
      const contentHash = await draftContentHash(documentJson);
      statements.push(
        this.database.prepare(`
          INSERT OR IGNORE INTO published_documents (
            kind, id, title, document, content_hash, revision,
            published_by, published_at, updated_at, last_agent_reviewed_at,
            cued_for_freeze_at, cued_for_freeze_by
          ) VALUES (?, ?, ?, ?, ?, 1, 'git-seed', ?, ?, ?, ?, 'git-seed')
        `).bind(
          item.kind, item.id, titleOf(item.document), documentJson, contentHash, now, now, now, now
        ),
        this.database.prepare(`
          INSERT OR IGNORE INTO published_document_revisions (
            kind, id, revision, document, content_hash, published_by, published_at
          ) VALUES (?, ?, 1, ?, ?, 'git-seed', ?)
        `).bind(item.kind, item.id, documentJson, contentHash, now)
      );
    }
    const chunkSize = 80;
    for (let offset = 0; offset < statements.length; offset += chunkSize) {
      await this.database.batch(statements.slice(offset, offset + chunkSize));
    }
  }

  async publish({ kind, id, document, actor }) {
    assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
    assertDraftId(id);
    const publishedBy = normalizeDraftActor(actor).subject;
    const documentJson = serializeDraftDocument({ ...document, id });
    const contentHash = await draftContentHash(documentJson);
    const now = new Date().toISOString();
    const existing = await this.database.prepare(`
      SELECT * FROM published_documents WHERE kind = ? AND id = ?
    `).bind(kind, id).first();
    if (!existing) {
      await this.database.batch([
        this.database.prepare(`
          INSERT INTO published_documents (
            kind, id, title, document, content_hash, revision,
            published_by, published_at, updated_at, last_agent_reviewed_at
          ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
        `).bind(kind, id, titleOf(document), documentJson, contentHash, publishedBy, now, now, now),
        this.database.prepare(`
          INSERT INTO published_document_revisions (
            kind, id, revision, document, content_hash, published_by, published_at
          ) VALUES (?, ?, 1, ?, ?, ?, ?)
        `).bind(kind, id, documentJson, contentHash, publishedBy, now)
      ]);
      return this.getPublished({ kind, id });
    }
    const nextRevision = Number(existing.revision) + 1;
    await this.database.batch([
      this.database.prepare(`
        UPDATE published_documents
        SET title = ?, document = ?, content_hash = ?, revision = ?,
            published_by = ?, published_at = ?, updated_at = ?, withdrawn_at = NULL,
            cued_for_freeze_at = NULL, cued_for_freeze_by = NULL
        WHERE kind = ? AND id = ?
      `).bind(
        titleOf(document), documentJson, contentHash, nextRevision,
        publishedBy, now, now, kind, id
      ),
      this.database.prepare(`
        INSERT INTO published_document_revisions (
          kind, id, revision, document, content_hash, published_by, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(kind, id, nextRevision, documentJson, contentHash, publishedBy, now)
    ]);
    return this.getPublished({ kind, id });
  }

  async unpublish({ kind, id, actor }) {
    assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
    assertDraftId(id);
    await this.getPublished({ kind, id });
    const publishedBy = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE published_documents
      SET withdrawn_at = ?, published_by = ?, updated_at = ?,
          cued_for_freeze_at = NULL, cued_for_freeze_by = NULL
      WHERE kind = ? AND id = ?
    `).bind(now, publishedBy, now, kind, id).run();
    if (changes(result) !== 1) throw new ContentDocumentNotFoundError(kind, id);
    return this.getPublished({ kind, id });
  }

  async setFreezeCue({ kind, id, actor, cued }) {
    assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
    assertDraftId(id);
    const current = await this.getPublished({ kind, id });
    if (current.withdrawnAt) {
      throw new Error(`Cannot cue a withdrawn ${kind} for freeze`);
    }
    const publishedBy = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const cuedAt = cued ? now : null;
    const cuedBy = cued ? publishedBy : null;
    const result = await this.database.prepare(`
      UPDATE published_documents
      SET cued_for_freeze_at = ?, cued_for_freeze_by = ?, updated_at = ?
      WHERE kind = ? AND id = ?
    `).bind(cuedAt, cuedBy, now, kind, id).run();
    if (changes(result) !== 1) throw new ContentDocumentNotFoundError(kind, id);
    return this.getPublished({ kind, id });
  }

  async revertDraft({ kind, id, actor }) {
    const published = await this.getPublished({ kind, id });
    try {
      const current = await this.getDraft({ kind, id, actor });
      return this.saveDraft({
        kind,
        id,
        document: published.document,
        actor,
        expectedRevision: current.revision
      });
    } catch (error) {
      if (!(error instanceof DraftNotFoundError)) throw error;
      return this.createDraft({ kind, id, document: published.document, actor });
    }
  }
}

export function createMemoryContentDocumentRepository() {
  const drafts = new Map();
  const published = new Map();
  const revisions = new Map();
  const reviewEvents = [];

  function draftKey(kind, id, owner) {
    return `${kind}:${id}:${owner}`;
  }
  function publishedKey(kind, id) {
    return `${kind}:${id}`;
  }

  const repository = {
    async getDraft({ kind, id, actor }) {
      assertKind(kind, CONTENT_DRAFT_KINDS);
      assertDraftId(id);
      const owner = normalizeDraftActor(actor).subject;
      const row = drafts.get(draftKey(kind, id, owner));
      if (!row) throw new DraftNotFoundError(id);
      return draftRecord(row);
    },
    async createDraft({ kind, id, document, actor }) {
      assertKind(kind, CONTENT_DRAFT_KINDS);
      assertDraftId(id);
      const owner = normalizeDraftActor(actor);
      const key = draftKey(kind, id, owner.subject);
      if (drafts.has(key)) throw new DraftConflictError(`${kind} "${id}" already exists`);
      const documentJson = serializeDraftDocument({ ...document, id });
      const now = new Date().toISOString();
      drafts.set(key, {
        kind,
        id,
        owner_subject: owner.subject,
        title: titleOf(document),
        document: documentJson,
        content_hash: await draftContentHash(documentJson),
        revision: 1,
        created_at: now,
        updated_at: now
      });
      return repository.getDraft({ kind, id, actor });
    },
    async saveDraft({ kind, id, document, actor, expectedRevision }) {
      assertKind(kind, CONTENT_DRAFT_KINDS);
      assertDraftId(id);
      if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
        throw new Error("expectedRevision must be a positive integer");
      }
      const owner = normalizeDraftActor(actor);
      const key = draftKey(kind, id, owner.subject);
      const current = drafts.get(key);
      if (!current) throw new DraftNotFoundError(id);
      if (Number(current.revision) !== expectedRevision) {
        throw new DraftConflictError(
          `Draft revision conflict: expected ${expectedRevision}, current revision is ${current.revision}`
        );
      }
      const documentJson = serializeDraftDocument({ ...document, id });
      const now = new Date().toISOString();
      drafts.set(key, {
        ...current,
        title: titleOf(document),
        document: documentJson,
        content_hash: await draftContentHash(documentJson),
        revision: Number(current.revision) + 1,
        updated_at: now
      });
      return repository.getDraft({ kind, id, actor });
    },
    async deleteDraft({ kind, id, actor }) {
      assertKind(kind, CONTENT_DRAFT_KINDS);
      assertDraftId(id);
      const owner = normalizeDraftActor(actor).subject;
      const key = draftKey(kind, id, owner);
      if (!drafts.has(key)) throw new DraftNotFoundError(id);
      drafts.delete(key);
    },
    async listDrafts({ kind, actor, includeDocument = false } = {}) {
      assertKind(kind, CONTENT_DRAFT_KINDS);
      const owner = normalizeDraftActor(actor).subject;
      const rows = [...drafts.values()]
        .filter(row => row.kind === kind && row.owner_subject === owner)
        .sort((left, right) => String(right.updated_at).localeCompare(left.updated_at));
      return rows.map(row => {
        const record = draftRecord(row);
        if (includeDocument) return record;
        const { document, ...metadata } = record;
        return metadata;
      });
    },
    async getPublished({ kind, id }) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(id);
      const row = published.get(publishedKey(kind, id));
      if (!row) throw new ContentDocumentNotFoundError(kind, id);
      return publishedRecord(row);
    },
    async listPublished({ kind, includeWithdrawn = false } = {}) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      return [...published.values()]
        .filter(row => row.kind === kind)
        .map(publishedRecord)
        .filter(row => includeWithdrawn || !row.withdrawnAt)
        .sort((left, right) => String(left.title || left.id).localeCompare(right.title || right.id));
    },
    async seedPublishedIfAbsent({ kind, id, document }) {
      await repository.seedPublishedManyIfAbsent([{ kind, id, document }]);
      return repository.getPublished({ kind, id });
    },
    async seedPublishedManyIfAbsent(items = []) {
      for (const item of items) {
        assertKind(item.kind, PUBLISHED_DOCUMENT_KINDS);
        assertDraftId(item.id);
        const key = publishedKey(item.kind, item.id);
        if (published.has(key)) continue;
        const documentJson = serializeDraftDocument({ ...item.document, id: item.id });
        const now = new Date().toISOString();
        const row = {
          kind: item.kind,
          id: item.id,
          title: titleOf(item.document),
          document: documentJson,
          content_hash: await draftContentHash(documentJson),
          revision: 1,
          published_by: "git-seed",
          published_at: now,
          updated_at: now,
          last_agent_reviewed_at: now,
          last_human_reviewed_at: null,
          withdrawn_at: null,
          cued_for_freeze_at: now,
          cued_for_freeze_by: "git-seed"
        };
        published.set(key, row);
        revisions.set(`${key}:1`, row);
      }
    },
    async publish({ kind, id, document, actor }) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(id);
      const publishedBy = normalizeDraftActor(actor).subject;
      const documentJson = serializeDraftDocument({ ...document, id });
      const now = new Date().toISOString();
      const key = publishedKey(kind, id);
      const existing = published.get(key);
      const nextRevision = existing ? Number(existing.revision) + 1 : 1;
      const row = {
        kind,
        id,
        title: titleOf(document),
        document: documentJson,
        content_hash: await draftContentHash(documentJson),
        revision: nextRevision,
        published_by: publishedBy,
        published_at: now,
        updated_at: now,
        last_agent_reviewed_at: existing?.last_agent_reviewed_at || now,
        last_human_reviewed_at: existing?.last_human_reviewed_at || null,
        withdrawn_at: null,
        cued_for_freeze_at: null,
        cued_for_freeze_by: null
      };
      published.set(key, row);
      revisions.set(`${key}:${nextRevision}`, row);
      return repository.getPublished({ kind, id });
    },
    async unpublish({ kind, id, actor }) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(id);
      const key = publishedKey(kind, id);
      const existing = published.get(key);
      if (!existing) throw new ContentDocumentNotFoundError(kind, id);
      const now = new Date().toISOString();
      published.set(key, {
        ...existing,
        withdrawn_at: now,
        published_by: normalizeDraftActor(actor).subject,
        updated_at: now,
        cued_for_freeze_at: null,
        cued_for_freeze_by: null
      });
      return repository.getPublished({ kind, id });
    },
    async recordPuzzleReviewEvent({
      id,
      reviewerKind,
      reviewedAt = new Date().toISOString(),
      comments = null,
      outcome = null,
      draftRevision = null,
      guidance = null
    }) {
      assertDraftId(id);
      if (typeof reviewedAt !== "string" || Number.isNaN(Date.parse(reviewedAt))) {
        throw new Error("reviewedAt must be an ISO timestamp");
      }
      const event = reviewEventInput({ reviewerKind, comments, outcome, draftRevision, guidance });
      const key = publishedKey("puzzle", id);
      const existing = published.get(key);
      if (!existing || existing.withdrawn_at) {
        throw new ContentDocumentNotFoundError("puzzle", id);
      }
      const reviewColumn = event.reviewerKind === "agent"
        ? "last_agent_reviewed_at"
        : "last_human_reviewed_at";
      published.set(key, { ...existing, [reviewColumn]: reviewedAt });
      reviewEvents.push({
        id: reviewEvents.length + 1,
        puzzle_id: id,
        reviewer_kind: event.reviewerKind,
        reviewed_at: reviewedAt,
        comments: event.comments,
        outcome: event.outcome,
        draft_revision: event.draftRevision,
        guidance_major: event.guidance?.major ?? null,
        guidance_minor: event.guidance?.minor ?? null
      });
      return repository.getPublished({ kind: "puzzle", id });
    },
    async recordPuzzleAgentReview(args) {
      return repository.recordPuzzleReviewEvent({ ...args, reviewerKind: "agent" });
    },
    async recordPuzzleHumanReview(args) {
      return repository.recordPuzzleReviewEvent({ ...args, reviewerKind: "human" });
    },
    async listPuzzleReviewEvents({ id, limit = 20 }) {
      assertDraftId(id);
      const cappedLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
      return reviewEvents
        .filter(event => event.puzzle_id === id)
        .sort((left, right) => String(right.reviewed_at).localeCompare(String(left.reviewed_at)) || right.id - left.id)
        .slice(0, cappedLimit)
        .map(reviewEventRecord);
    },
    async setFreezeCue({ kind, id, actor, cued }) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(id);
      const key = publishedKey(kind, id);
      const existing = published.get(key);
      if (!existing) throw new ContentDocumentNotFoundError(kind, id);
      if (existing.withdrawn_at) {
        throw new Error(`Cannot cue a withdrawn ${kind} for freeze`);
      }
      const now = new Date().toISOString();
      const publishedBy = normalizeDraftActor(actor).subject;
      published.set(key, {
        ...existing,
        cued_for_freeze_at: cued ? now : null,
        cued_for_freeze_by: cued ? publishedBy : null,
        updated_at: now
      });
      return repository.getPublished({ kind, id });
    },
    async revertDraft({ kind, id, actor }) {
      const live = await repository.getPublished({ kind, id });
      try {
        const current = await repository.getDraft({ kind, id, actor });
        return repository.saveDraft({
          kind,
          id,
          document: live.document,
          actor,
          expectedRevision: current.revision
        });
      } catch (error) {
        if (!(error instanceof DraftNotFoundError)) throw error;
        return repository.createDraft({ kind, id, document: live.document, actor });
      }
    }
  };
  return repository;
}
