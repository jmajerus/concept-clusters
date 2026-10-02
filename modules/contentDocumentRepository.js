import {
  DraftConflictError,
  DraftNotFoundError,
  assertDraftId,
  draftContentHash,
  normalizeDraftActor,
  serializeDraftDocument
} from "./draftRepository.js";
import {
  assertCurrentAuthoredDocument,
  publicationDocument,
  puzzleDocumentFromStorage,
  stripSystemAuthoredMetadata
} from "./authoringDomains.js";
import {
  parseLayoutDocument,
  serializeLayoutDocument
} from "./layoutDocument.js";

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
  const document = assertCurrentAuthoredDocument(
    parsedJson(row.document, "Stored content draft"),
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

function publishedRevisionSnapshot(kind, row) {
  const document = assertCurrentAuthoredDocument(
    parsedJson(row.document, "Published revision"),
    "Published revision"
  );
  return {
    revision: Number(row.revision),
    document: kind === "puzzle" ? stripSystemAuthoredMetadata(document, {
      keepDocumentDates: true
    }) : document
  };
}

function publishedRecord(row) {
  const document = assertCurrentAuthoredDocument(
    parsedJson(row.document, "Published document"),
    "Published document"
  );
  const layout = row.kind === "puzzle"
    ? parseLayoutDocument(row.layout_json, "Stored layout")
    : null;
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
    // Puzzle rows are complete snapshots for the player, but repository
    // lifecycle metadata still belongs in the surrounding D1 row. Clean old
    // simplified rows on read as a compatibility measure; new writes use the
    // same fold before serialization below.
    document: row.kind === "puzzle"
      ? puzzleDocumentFromStorage(document)
      : document,
    ...(layout ? { layout } : {})
  };
}

function documentForPublishedStorage(kind, document, options = {}) {
  return publicationDocument(kind, document, options);
}

function titleOf(document) {
  return typeof document?.title === "string" ? document.title : null;
}

function reviewEventRecord(row) {
  let proposal = null;
  if (row.proposal_json) {
    proposal = typeof row.proposal_json === "string"
      ? JSON.parse(row.proposal_json)
      : row.proposal_json;
  }
  return {
    id: Number(row.id),
    puzzleId: row.puzzle_id,
    reviewerKind: row.reviewer_kind,
    reviewedAt: row.reviewed_at,
    issueId: row.issue_id || null,
    eventType: row.event_type || "review",
    comments: row.comments || null,
    outcome: row.outcome || null,
    draftRevision: row.draft_revision == null ? null : Number(row.draft_revision),
    guidance: row.guidance_major == null
      ? null
      : { major: Number(row.guidance_major), minor: Number(row.guidance_minor || 0) },
    ...(proposal ? { proposal } : {}),
    ...(row.base_published_revision == null
      ? {}
      : { basePublishedRevision: Number(row.base_published_revision) }),
    ...(row.published_revision == null
      ? {}
      : { publishedRevision: Number(row.published_revision) }),
    ...(row.client_system ? { clientSystem: row.client_system } : {}),
    ...(row.client_model ? { clientModel: row.client_model } : {}),
    ...(row.client_name ? { clientName: row.client_name } : {}),
    ...(row.source_event_id == null
      ? {}
      : { sourceEventId: Number(row.source_event_id) })
  };
}

export function undecidedReviewProposals(events = []) {
  const decided = new Set(
    events
      .map(event => event.sourceEventId)
      .filter(id => Number.isInteger(id))
  );
  return events.filter(event => event.eventType === "proposed" && !decided.has(event.id));
}

const REVIEW_EVENT_TYPES = Object.freeze([
  "review", "open", "note", "resolved", "reopened", "accepted", "rejected", "proposed"
]);
const PROPOSAL_BYTE_LIMIT = 1_250_000;

function reviewEventInput({
  reviewerKind,
  comments = null,
  outcome = null,
  draftRevision = null,
  guidance = null,
  issueId = null,
  eventType = "review",
  proposal = null,
  basePublishedRevision = null,
  publishedRevision = null,
  clientSystem = null,
  clientModel = null,
  clientName = null,
  sourceEventId = null
}) {
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
  if (!REVIEW_EVENT_TYPES.includes(eventType)) {
    throw new Error(`eventType must be ${REVIEW_EVENT_TYPES.join(", ")}`);
  }
  if (issueId != null && (typeof issueId !== "string" || !issueId.trim() || issueId.length > 100)) {
    throw new Error("issueId must be a non-empty string of at most 100 characters");
  }
  const decision = eventType === "accepted" || eventType === "rejected";
  const proposalEvent = eventType === "proposed" || eventType === "rejected";
  const standalone = eventType === "review" || decision || eventType === "proposed";
  const normalizedComments = comments?.trim() || null;
  if (standalone && issueId != null) {
    throw new Error(`${eventType} events cannot have an issueId`);
  }
  if (!standalone && !issueId) {
    throw new Error("issue events require an issueId");
  }
  if (!standalone && !normalizedComments) {
    throw new Error("issue events require comments");
  }
  if (basePublishedRevision != null && (!Number.isInteger(basePublishedRevision) || basePublishedRevision < 1)) {
    throw new Error("basePublishedRevision must be a positive integer");
  }
  if (publishedRevision != null && (!Number.isInteger(publishedRevision) || publishedRevision < 1)) {
    throw new Error("publishedRevision must be a positive integer");
  }
  if (eventType === "accepted" && publishedRevision == null) {
    throw new Error("accepted events require publishedRevision");
  }
  if (eventType === "proposed" && basePublishedRevision == null) {
    throw new Error("proposed events require basePublishedRevision");
  }
  if (sourceEventId != null && (!Number.isInteger(sourceEventId) || sourceEventId < 1)) {
    throw new Error("sourceEventId must be a positive integer");
  }
  if (eventType === "proposed" && sourceEventId != null) {
    throw new Error("proposed events cannot reference another event");
  }
  const client = {
    clientSystem: boundedClientLabel(clientSystem, "clientSystem"),
    clientModel: boundedClientLabel(clientModel, "clientModel"),
    clientName: boundedClientLabel(clientName, "clientName")
  };
  let proposalJson = null;
  if (proposalEvent) {
    if (!proposal || typeof proposal !== "object" || Array.isArray(proposal)) {
      throw new Error(`${eventType} events require a proposal document`);
    }
    proposalJson = JSON.stringify(proposal);
    if (new TextEncoder().encode(proposalJson).byteLength > PROPOSAL_BYTE_LIMIT) {
      throw new Error(`proposal document exceeds ${PROPOSAL_BYTE_LIMIT} bytes`);
    }
  } else if (proposal != null) {
    throw new Error("only proposed and rejected events carry a proposal document");
  }
  return {
    reviewerKind,
    comments: normalizedComments,
    outcome: outcome?.trim() || null,
    draftRevision,
    guidance: guidance ? { major: guidance.major, minor: guidance.minor } : null,
    issueId: issueId?.trim() || null,
    eventType,
    proposalJson,
    basePublishedRevision,
    publishedRevision,
    ...client,
    sourceEventId
  };
}

function boundedClientLabel(value, name) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.length > 200) {
    throw new Error(`${name} must be a string of at most 200 characters`);
  }
  return value;
}

function reviewEventInsertStatement(database, puzzleId, reviewedAt, event) {
  return database.prepare(`
      INSERT INTO puzzle_review_events (
        puzzle_id, reviewer_kind, reviewed_at, comments, outcome,
        draft_revision, guidance_major, guidance_minor, issue_id, event_type,
        proposal_json, base_published_revision, published_revision,
        client_system, client_model, client_name, source_event_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      puzzleId, event.reviewerKind, reviewedAt, event.comments, event.outcome,
      event.draftRevision, event.guidance?.major ?? null, event.guidance?.minor ?? null,
      event.issueId, event.eventType,
      event.proposalJson, event.basePublishedRevision, event.publishedRevision,
      event.clientSystem, event.clientModel, event.clientName, event.sourceEventId
    );
}

function storedReviewEventRow(eventId, puzzleId, reviewedAt, event) {
  return {
    id: eventId,
    puzzle_id: puzzleId,
    reviewer_kind: event.reviewerKind,
    reviewed_at: reviewedAt,
    comments: event.comments,
    outcome: event.outcome,
    draft_revision: event.draftRevision,
    guidance_major: event.guidance?.major ?? null,
    guidance_minor: event.guidance?.minor ?? null,
    issue_id: event.issueId,
    event_type: event.eventType,
    proposal_json: event.proposalJson,
    base_published_revision: event.basePublishedRevision,
    published_revision: event.publishedRevision,
    client_system: event.clientSystem,
    client_model: event.clientModel,
    client_name: event.clientName,
    source_event_id: event.sourceEventId
  };
}

function reviewDecisionInputs(decisions, publishedRevision) {
  return (Array.isArray(decisions) ? decisions : []).map(decision => reviewEventInput({
    reviewerKind: "human",
    eventType: decision.eventType,
    draftRevision: decision.draftRevision ?? null,
    proposal: decision.proposal ?? null,
    basePublishedRevision: decision.basePublishedRevision ?? null,
    publishedRevision: decision.eventType === "accepted" ? publishedRevision : null,
    sourceEventId: decision.sourceEventId ?? null
  }));
}

function reviewIssueThreads(events) {
  const threads = new Map();
  for (const event of events) {
    if (!event.issueId) continue;
    const thread = threads.get(event.issueId) || {
      issueId: event.issueId,
      status: "open",
      openedAt: event.reviewedAt,
      openedBy: event.reviewerKind,
      summary: event.comments,
      lastActivityAt: event.reviewedAt,
      openingRevision: event.draftRevision,
      lastRecordedRevision: event.draftRevision,
      draftRevisedSinceOpening: false,
      events: []
    };
    if (event.eventType === "resolved") thread.status = "resolved";
    if (event.eventType === "open" || event.eventType === "reopened") thread.status = "open";
    thread.lastActivityAt = event.reviewedAt;
    if (event.draftRevision != null) {
      thread.lastRecordedRevision = event.draftRevision;
      thread.draftRevisedSinceOpening = thread.openingRevision != null && event.draftRevision > thread.openingRevision;
    }
    thread.events.push(event);
    threads.set(event.issueId, thread);
  }
  return [...threads.values()].sort((left, right) =>
    String(right.lastActivityAt).localeCompare(String(left.lastActivityAt))
  );
}

export class ContentDocumentNotFoundError extends Error {
  constructor(kind, id) {
    super(`Unknown ${kind}: ${id}`);
    this.name = "ContentDocumentNotFoundError";
    this.kind = kind;
    this.id = id;
  }
}

export class PublishedRevisionConflictError extends Error {
  constructor(kind, id) {
    super(`Published ${kind} "${id}" changed while publishing. Reload and try again.`);
    this.name = "PublishedRevisionConflictError";
    this.status = 409;
    this.kind = kind;
    this.id = id;
  }
}

function isPublishedPrimaryKeyError(error) {
  const message = String(error?.message || error);
  return message.includes("UNIQUE constraint failed: published_document");
}

function samePublishedSnapshot(record, { kind, contentHash, layoutJson }) {
  if (!record || record.withdrawnAt || record.contentHash !== contentHash) return false;
  if (kind !== "puzzle") return true;
  const currentLayout = record.layout ? serializeLayoutDocument(record.layout) : null;
  return currentLayout === (layoutJson || null);
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
    const contentHash = draftContentHash(documentJson);
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
    const contentHash = draftContentHash(documentJson);
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

  async getPublishedAtRevision({ kind, id, revision }) {
    assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
    assertDraftId(id);
    if (!Number.isInteger(revision) || revision < 1) {
      throw new Error("revision must be a positive integer");
    }
    const row = await this.database.prepare(`
      SELECT revision, document FROM published_document_revisions
      WHERE kind = ? AND id = ? AND revision = ?
    `).bind(kind, id, revision).first();
    if (!row) return null;
    return publishedRevisionSnapshot(kind, row);
  }

  async saveLayout({ id, layout }) {
    assertDraftId(id);
    const current = await this.getPublished({ kind: "puzzle", id });
    if (current.withdrawnAt) throw new Error(`Cannot save a layout for withdrawn puzzle "${id}"`);
    const layoutJson = serializeLayoutDocument(layout);
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE published_documents
      SET layout_json = ?, updated_at = ?
      WHERE kind = 'puzzle' AND id = ? AND withdrawn_at IS NULL
    `).bind(layoutJson, now, id).run();
    if (changes(result) !== 1) throw new ContentDocumentNotFoundError("puzzle", id);
    return this.getPublished({ kind: "puzzle", id });
  }

  async clearLayout({ id }) {
    assertDraftId(id);
    await this.getPublished({ kind: "puzzle", id });
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE published_documents
      SET layout_json = NULL, updated_at = ?
      WHERE kind = 'puzzle' AND id = ?
    `).bind(now, id).run();
    if (changes(result) !== 1) throw new ContentDocumentNotFoundError("puzzle", id);
    return this.getPublished({ kind: "puzzle", id });
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
    guidance = null,
    issueId = null,
    eventType = "review",
    proposal = null,
    basePublishedRevision = null,
    publishedRevision = null,
    clientSystem = null,
    clientModel = null,
    clientName = null,
    sourceEventId = null
  }) {
    assertDraftId(id);
    if (typeof reviewedAt !== "string" || Number.isNaN(Date.parse(reviewedAt))) {
      throw new Error("reviewedAt must be an ISO timestamp");
    }
    const event = reviewEventInput({
      reviewerKind, comments, outcome, draftRevision, guidance, issueId, eventType,
      proposal, basePublishedRevision, publishedRevision,
      clientSystem, clientModel, clientName, sourceEventId
    });
    const insertEvent = reviewEventInsertStatement(this.database, id, reviewedAt, event);
    if (event.eventType !== "review") {
      if (event.eventType !== "proposed") {
        await this.database.batch([insertEvent]);
        return null;
      }
      const result = await insertEvent.run();
      const eventId = Number(result?.meta?.last_row_id);
      if (!Number.isInteger(eventId) || eventId < 1) {
        throw new Error("Could not read the review proposal that was just filed.");
      }
      const inserted = await this.database.prepare(`
        SELECT * FROM puzzle_review_events WHERE id = ?
      `).bind(eventId).first();
      if (!inserted || inserted.puzzle_id !== id || inserted.event_type !== "proposed") {
        throw new Error("Could not read the review proposal that was just filed.");
      }
      return reviewEventRecord(inserted);
    }
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
      insertEvent
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

  async listOpenReviewProposals({ id }) {
    assertDraftId(id);
    const result = await this.database.prepare(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = ? AND event_type = 'proposed'
        AND id NOT IN (
          SELECT source_event_id FROM puzzle_review_events
          WHERE puzzle_id = ? AND source_event_id IS NOT NULL
        )
      ORDER BY reviewed_at ASC, id ASC
    `).bind(id, id).all();
    return result.results.map(reviewEventRecord);
  }

  async getPuzzleReviewEvent({ id, eventId }) {
    assertDraftId(id);
    if (!Number.isInteger(eventId) || eventId < 1) {
      throw new Error("eventId must be a positive integer");
    }
    const row = await this.database.prepare(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = ? AND id = ?
    `).bind(id, eventId).first();
    return row ? reviewEventRecord(row) : null;
  }

  async listPuzzleReviewIssues({ id, limit = 50, includeResolved = false }) {
    assertDraftId(id);
    const cappedLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const result = await this.database.prepare(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = ? AND issue_id IS NOT NULL
      ORDER BY reviewed_at ASC, id ASC
    `).bind(id).all();
    return reviewIssueThreads(result.results.map(reviewEventRecord))
      .filter(issue => includeResolved || issue.status === "open")
      .slice(0, cappedLimit);
  }

  async getPuzzleReviewIssue({ id, issueId }) {
    assertDraftId(id);
    const event = reviewEventInput({ reviewerKind: "agent", issueId, eventType: "note", comments: "lookup" });
    const result = await this.database.prepare(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = ? AND issue_id = ?
      ORDER BY reviewed_at ASC, id ASC
    `).bind(id, event.issueId).all();
    return reviewIssueThreads(result.results.map(reviewEventRecord))[0] || null;
  }

  async seedPublishedIfAbsent({ kind, id, document, layout = null }) {
    await this.seedPublishedManyIfAbsent([{ kind, id, document, layout }]);
    return this.getPublished({ kind, id });
  }

  async seedPublishedManyIfAbsent(items = []) {
    if (!items.length) return;
    const now = new Date().toISOString();
    const statements = [];
    for (const item of items) {
      assertKind(item.kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(item.id);
      const sourceDocument = documentForPublishedStorage(item.kind, item.document, {
        now,
        backfill: true
      });
      const documentJson = serializeDraftDocument({ ...sourceDocument, id: item.id });
      const contentHash = draftContentHash(documentJson);
      const layoutJson = item.kind === "puzzle"
        ? serializeLayoutDocument(item.layout)
        : null;
      statements.push(
        this.database.prepare(`
          INSERT OR IGNORE INTO published_documents (
            kind, id, title, document, content_hash, revision,
            published_by, published_at, updated_at, last_agent_reviewed_at,
            cued_for_freeze_at, cued_for_freeze_by, layout_json
          ) VALUES (?, ?, ?, ?, ?, 1, 'git-seed', ?, ?, ?, ?, 'git-seed', ?)
        `).bind(
          item.kind, item.id, titleOf(sourceDocument), documentJson, contentHash,
          now, now, now, now, layoutJson
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

  /**
   * @param {{
   *   kind: string,
   *   id: string,
   *   document: object,
   *   actor: object,
   *   layout?: object | null,
   *   expectedRevision?: number | null,
   *   reviewDecisions?: Array<object> | null
   * }} options
   */
  async publish({
    kind, id, document, actor, layout = undefined, expectedRevision = null, reviewDecisions = null
  }) {
    assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
    assertDraftId(id);
    if (expectedRevision != null && (!Number.isInteger(expectedRevision) || expectedRevision < 1)) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const publishedBy = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const existing = await this.database.prepare(`
      SELECT * FROM published_documents WHERE kind = ? AND id = ?
    `).bind(kind, id).first();
    const previous = existing?.document
      ? parsedJson(existing.document, "Published document")
      : null;
    const sourceDocument = documentForPublishedStorage(kind, document, { previous, now });
    const documentJson = serializeDraftDocument({ ...sourceDocument, id });
    const contentHash = draftContentHash(documentJson);
    if (expectedRevision != null && Number(existing?.revision) !== expectedRevision) {
      throw new PublishedRevisionConflictError(kind, id);
    }
    const layoutJson = kind === "puzzle"
      ? layout === undefined
        ? existing?.layout_json || null
        : serializeLayoutDocument(layout)
      : null;
    const snapshot = { kind, id, contentHash, layoutJson };
    if (!existing) {
      try {
        await this.database.batch([
          this.database.prepare(`
            INSERT INTO published_documents (
              kind, id, title, document, content_hash, revision,
              published_by, published_at, updated_at, last_agent_reviewed_at,
              layout_json
            ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
          `).bind(
            kind, id, titleOf(sourceDocument), documentJson, contentHash,
            publishedBy, now, now, now, layoutJson
          ),
          this.database.prepare(`
            INSERT INTO published_document_revisions (
              kind, id, revision, document, content_hash, published_by, published_at
            ) VALUES (?, ?, 1, ?, ?, ?, ?)
          `).bind(kind, id, documentJson, contentHash, publishedBy, now)
        ]);
      } catch (error) {
        if (!isPublishedPrimaryKeyError(error)) throw error;
        return this.adoptUnchangedPublication(snapshot);
      }
      return this.getPublished({ kind, id });
    }
    const nextRevision = Number(existing.revision) + 1;
    const decisionInputs = reviewDecisionInputs(reviewDecisions, nextRevision);
    const decisionInserts = decisionInputs.map(event =>
      reviewEventInsertStatement(this.database, id, now, event)
    );
    try {
      await this.database.batch([
        this.database.prepare(`
          UPDATE published_documents
          SET title = ?, document = ?, content_hash = ?, revision = ?,
              published_by = ?, published_at = ?, updated_at = ?, withdrawn_at = NULL,
              cued_for_freeze_at = NULL, cued_for_freeze_by = ?, layout_json = ?
          WHERE kind = ? AND id = ? AND revision = ?
        `).bind(
          titleOf(sourceDocument), documentJson, contentHash, nextRevision,
          publishedBy, now, now, null, layoutJson, kind, id, Number(existing.revision)
        ),
        this.database.prepare(`
          INSERT INTO published_document_revisions (
            kind, id, revision, document, content_hash, published_by, published_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(kind, id, nextRevision, documentJson, contentHash, publishedBy, now),
        ...decisionInserts
      ]);
    } catch (error) {
      if (!isPublishedPrimaryKeyError(error)) throw error;
      const current = await this.adoptUnchangedPublication(snapshot);
      if (decisionInputs.length) {
        await this.database.batch(reviewDecisionInputs(reviewDecisions, current.revision).map(event =>
          reviewEventInsertStatement(this.database, id, now, event)
        ));
      }
      return current;
    }
    return this.getPublished({ kind, id });
  }

  async adoptUnchangedPublication({ kind, id, contentHash, layoutJson }) {
    const current = await this.getPublished({ kind, id });
    if (samePublishedSnapshot(current, { kind, contentHash, layoutJson })) return current;
    throw new PublishedRevisionConflictError(kind, id);
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
        content_hash: draftContentHash(documentJson),
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
        content_hash: draftContentHash(documentJson),
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
    async getPublishedAtRevision({ kind, id, revision }) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(id);
      if (!Number.isInteger(revision) || revision < 1) {
        throw new Error("revision must be a positive integer");
      }
      const row = revisions.get(`${publishedKey(kind, id)}:${revision}`);
      if (!row) return null;
      return publishedRevisionSnapshot(kind, row);
    },
    async listPublished({ kind, includeWithdrawn = false } = {}) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      return [...published.values()]
        .filter(row => row.kind === kind)
        .map(publishedRecord)
        .filter(row => includeWithdrawn || !row.withdrawnAt)
        .sort((left, right) => String(left.title || left.id).localeCompare(right.title || right.id));
    },
    async saveLayout({ id, layout }) {
      assertDraftId(id);
      const current = await repository.getPublished({ kind: "puzzle", id });
      if (current.withdrawnAt) throw new Error(`Cannot save a layout for withdrawn puzzle "${id}"`);
      const layoutJson = serializeLayoutDocument(layout);
      const key = publishedKey("puzzle", id);
      const row = published.get(key);
      published.set(key, {
        ...row,
        layout_json: layoutJson,
        updated_at: new Date().toISOString()
      });
      return repository.getPublished({ kind: "puzzle", id });
    },
    async clearLayout({ id }) {
      assertDraftId(id);
      await repository.getPublished({ kind: "puzzle", id });
      const key = publishedKey("puzzle", id);
      const row = published.get(key);
      published.set(key, {
        ...row,
        layout_json: null,
        updated_at: new Date().toISOString()
      });
      return repository.getPublished({ kind: "puzzle", id });
    },
    async seedPublishedIfAbsent({ kind, id, document, layout = null }) {
      await repository.seedPublishedManyIfAbsent([{ kind, id, document, layout }]);
      return repository.getPublished({ kind, id });
    },
    async seedPublishedManyIfAbsent(items = []) {
      for (const item of items) {
        assertKind(item.kind, PUBLISHED_DOCUMENT_KINDS);
        assertDraftId(item.id);
        const sourceDocument = documentForPublishedStorage(item.kind, item.document, {
          now: new Date().toISOString(),
          backfill: true
        });
        const key = publishedKey(item.kind, item.id);
        if (published.has(key)) continue;
        const documentJson = serializeDraftDocument({ ...sourceDocument, id: item.id });
        const now = new Date().toISOString();
        const row = {
          kind: item.kind,
          id: item.id,
          title: titleOf(sourceDocument),
          document: documentJson,
          content_hash: draftContentHash(documentJson),
          revision: 1,
          published_by: "git-seed",
          published_at: now,
          updated_at: now,
          last_agent_reviewed_at: now,
          last_human_reviewed_at: null,
          withdrawn_at: null,
          layout_json: item.kind === "puzzle"
            ? serializeLayoutDocument(item.layout)
            : null,
          cued_for_freeze_at: now,
          cued_for_freeze_by: "git-seed"
        };
        published.set(key, row);
        revisions.set(`${key}:1`, row);
      }
    },
    async publish({
      kind, id, document, actor, layout = undefined, expectedRevision = null, reviewDecisions = null
    }) {
      assertKind(kind, PUBLISHED_DOCUMENT_KINDS);
      assertDraftId(id);
      if (expectedRevision != null && (!Number.isInteger(expectedRevision) || expectedRevision < 1)) {
        throw new Error("expectedRevision must be a positive integer");
      }
      const publishedBy = normalizeDraftActor(actor).subject;
      const now = new Date().toISOString();
      const key = publishedKey(kind, id);
      const existing = published.get(key);
      const previous = existing?.document
        ? parsedJson(existing.document, "Published document")
        : null;
      const sourceDocument = documentForPublishedStorage(kind, document, { previous, now });
      const documentJson = serializeDraftDocument({ ...sourceDocument, id });
      if (expectedRevision != null && Number(existing?.revision) !== expectedRevision) {
        throw new PublishedRevisionConflictError(kind, id);
      }
      const nextRevision = existing ? Number(existing.revision) + 1 : 1;
      const layoutJson = kind === "puzzle"
        ? layout === undefined
          ? existing?.layout_json || null
          : serializeLayoutDocument(layout)
        : null;
      const revisionKey = `${key}:${nextRevision}`;
      const contentHash = draftContentHash(documentJson);
      if (revisions.has(revisionKey)) {
        const current = published.get(key);
        const record = current ? publishedRecord(current) : null;
        if (samePublishedSnapshot(record, { kind, contentHash, layoutJson })) {
          for (const event of reviewDecisionInputs(reviewDecisions, Number(current.revision))) {
            reviewEvents.push(storedReviewEventRow(reviewEvents.length + 1, id, now, event));
          }
          return repository.getPublished({ kind, id });
        }
        throw new PublishedRevisionConflictError(kind, id);
      }
      const row = {
        kind,
        id,
        title: titleOf(sourceDocument),
        document: documentJson,
        content_hash: contentHash,
        revision: nextRevision,
        published_by: publishedBy,
        published_at: now,
        updated_at: now,
        last_agent_reviewed_at: existing?.last_agent_reviewed_at || now,
        last_human_reviewed_at: existing?.last_human_reviewed_at || null,
        withdrawn_at: null,
        layout_json: layoutJson,
        cued_for_freeze_at: null,
        cued_for_freeze_by: null
      };
      const decisionInputs = reviewDecisionInputs(reviewDecisions, nextRevision);
      published.set(key, row);
      revisions.set(revisionKey, row);
      for (const event of decisionInputs) {
        reviewEvents.push(storedReviewEventRow(reviewEvents.length + 1, id, now, event));
      }
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
      guidance = null,
      issueId = null,
      eventType = "review",
      proposal = null,
      basePublishedRevision = null,
      publishedRevision = null,
      clientSystem = null,
      clientModel = null,
      clientName = null,
      sourceEventId = null
    }) {
      assertDraftId(id);
      if (typeof reviewedAt !== "string" || Number.isNaN(Date.parse(reviewedAt))) {
        throw new Error("reviewedAt must be an ISO timestamp");
      }
      const event = reviewEventInput({
        reviewerKind, comments, outcome, draftRevision, guidance, issueId, eventType,
        proposal, basePublishedRevision, publishedRevision,
        clientSystem, clientModel, clientName, sourceEventId
      });
      const key = publishedKey("puzzle", id);
      const existing = published.get(key);
      if (event.eventType === "review" && (!existing || existing.withdrawn_at)) {
        throw new ContentDocumentNotFoundError("puzzle", id);
      }
      if (event.eventType === "review") {
        const reviewColumn = event.reviewerKind === "agent"
          ? "last_agent_reviewed_at"
          : "last_human_reviewed_at";
        published.set(key, { ...existing, [reviewColumn]: reviewedAt });
      }
      const row = storedReviewEventRow(reviewEvents.length + 1, id, reviewedAt, event);
      reviewEvents.push(row);
      if (event.eventType === "proposed") return reviewEventRecord(row);
      return event.eventType === "review"
        ? repository.getPublished({ kind: "puzzle", id })
        : null;
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
    async listOpenReviewProposals({ id }) {
      assertDraftId(id);
      return undecidedReviewProposals(
        reviewEvents
          .filter(event => event.puzzle_id === id)
          .map(reviewEventRecord)
      ).sort((left, right) =>
        String(left.reviewedAt).localeCompare(String(right.reviewedAt)) || left.id - right.id
      );
    },
    async getPuzzleReviewEvent({ id, eventId }) {
      assertDraftId(id);
      if (!Number.isInteger(eventId) || eventId < 1) {
        throw new Error("eventId must be a positive integer");
      }
      const row = reviewEvents.find(event => event.puzzle_id === id && event.id === eventId);
      return row ? reviewEventRecord(row) : null;
    },
    async listPuzzleReviewIssues({ id, limit = 50, includeResolved = false }) {
      assertDraftId(id);
      const cappedLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
      const events = reviewEvents
        .filter(event => event.puzzle_id === id && event.issue_id)
        .sort((left, right) => String(left.reviewed_at).localeCompare(String(right.reviewed_at)) || left.id - right.id)
        .map(reviewEventRecord);
      return reviewIssueThreads(events)
        .filter(issue => includeResolved || issue.status === "open")
        .slice(0, cappedLimit);
    },
    async getPuzzleReviewIssue({ id, issueId }) {
      assertDraftId(id);
      const event = reviewEventInput({ reviewerKind: "agent", issueId, eventType: "note", comments: "lookup" });
      const events = reviewEvents
        .filter(candidate => candidate.puzzle_id === id && candidate.issue_id === event.issueId)
        .sort((left, right) => String(left.reviewed_at).localeCompare(String(right.reviewed_at)) || left.id - right.id)
        .map(reviewEventRecord);
      return reviewIssueThreads(events)[0] || null;
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
