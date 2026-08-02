export const MAX_HOSTED_DRAFT_BYTES = 1_250_000;

const DRAFT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class DraftConflictError extends Error {
  constructor(message, { currentRevision = null } = {}) {
    super(message);
    this.name = "DraftConflictError";
    this.currentRevision = currentRevision;
  }
}

export class DraftNotFoundError extends Error {
  constructor(draftId) {
    super(`Unknown draft: ${draftId}`);
    this.name = "DraftNotFoundError";
    this.draftId = draftId;
  }
}

export function assertDraftId(draftId) {
  if (typeof draftId !== "string" || !DRAFT_ID_PATTERN.test(draftId)) {
    throw new Error("draftId must be a lowercase URL-safe slug");
  }
}

export function normalizeDraftActor(actor) {
  if (!actor || typeof actor.subject !== "string" || !actor.subject.trim()) {
    throw new Error("An authenticated draft actor is required");
  }
  return {
    subject: actor.subject,
    ...(typeof actor.email === "string" && actor.email.trim()
      ? { email: actor.email }
      : {}),
    ...(typeof actor.name === "string" && actor.name.trim()
      ? { name: actor.name }
      : {})
  };
}

export function serializeDraftDocument(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("Draft document must be a JSON object");
  }
  let text;
  try {
    text = JSON.stringify(document);
  } catch (error) {
    throw new Error(`Draft document is not JSON-serializable: ${error.message}`);
  }
  if (new TextEncoder().encode(text).byteLength > MAX_HOSTED_DRAFT_BYTES) {
    throw new Error(
      `Hosted draft document exceeds ${MAX_HOSTED_DRAFT_BYTES} bytes`
    );
  }
  return text;
}

export async function draftContentHash(documentOrText) {
  const text = typeof documentOrText === "string"
    ? documentOrText
    : serializeDraftDocument(documentOrText);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return `sha256:${[...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

// JavaScript has no interface declarations, so this base class is the
// executable contract shared by local/in-memory and D1 implementations.
export class DraftRepository {
  async create(_input) { throw new Error("DraftRepository.create is not implemented"); }
  async get(_input) { throw new Error("DraftRepository.get is not implemented"); }
  async save(_input) { throw new Error("DraftRepository.save is not implemented"); }
  async list(_input) { throw new Error("DraftRepository.list is not implemented"); }
  async revisions(_input) { throw new Error("DraftRepository.revisions is not implemented"); }
  async compare(_input) { throw new Error("DraftRepository.compare is not implemented"); }
  async recordValidation(_input) {
    throw new Error("DraftRepository.recordValidation is not implemented");
  }
}

export class InMemoryDraftRepository extends DraftRepository {
  constructor() {
    super();
    this.records = new Map();
  }

  ownedRecord(draftId, actor) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor).subject;
    const record = this.records.get(draftId);
    if (!record || record.ownerSubject !== owner) {
      throw new DraftNotFoundError(draftId);
    }
    return record;
  }

  async create({ draftId, document, actor, baseCommitSha = null }) {
    assertDraftId(draftId);
    const owner = normalizeDraftActor(actor);
    if (this.records.has(draftId)) {
      throw new DraftConflictError(`Draft "${draftId}" already exists`);
    }
    const documentJson = serializeDraftDocument(document);
    const now = new Date().toISOString();
    const revision = {
      revision: 1,
      document: clone(document),
      contentHash: await draftContentHash(documentJson),
      createdBy: owner.subject,
      createdAt: now,
      validation: null
    };
    const record = {
      draftId,
      puzzleId: typeof document.id === "string" ? document.id : null,
      title: typeof document.title === "string" ? document.title : null,
      ownerSubject: owner.subject,
      status: "draft",
      headRevision: 1,
      baseCommitSha,
      createdAt: now,
      updatedAt: now,
      revisions: [revision]
    };
    this.records.set(draftId, record);
    return this.get({ draftId, actor });
  }

  /**
   * @param {{draftId: string, actor: {subject: string}, revision?: number | null}} input
   */
  async get({ draftId, actor, revision = null }) {
    const record = this.ownedRecord(draftId, actor);
    const selected = revision === null
      ? record.revisions.at(-1)
      : record.revisions.find(item => item.revision === revision);
    if (!selected) {
      throw new DraftNotFoundError(`${draftId} revision ${revision}`);
    }
    return clone({
      draftId: record.draftId,
      puzzleId: record.puzzleId,
      title: record.title,
      status: record.status,
      headRevision: record.headRevision,
      revision: selected.revision,
      baseCommitSha: record.baseCommitSha,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      contentHash: selected.contentHash,
      validation: selected.validation,
      document: selected.document
    });
  }

  async save({ draftId, document, expectedRevision, actor }) {
    const record = this.ownedRecord(draftId, actor);
    if (record.headRevision !== expectedRevision) {
      throw new DraftConflictError(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${record.headRevision}`,
        { currentRevision: record.headRevision }
      );
    }
    const documentJson = serializeDraftDocument(document);
    const now = new Date().toISOString();
    const revision = expectedRevision + 1;
    record.revisions.push({
      revision,
      document: clone(document),
      contentHash: await draftContentHash(documentJson),
      createdBy: normalizeDraftActor(actor).subject,
      createdAt: now,
      validation: null
    });
    record.puzzleId = typeof document.id === "string" ? document.id : null;
    record.title = typeof document.title === "string" ? document.title : null;
    record.headRevision = revision;
    record.updatedAt = now;
    return this.get({ draftId, actor });
  }

  async list({ actor, status = null, limit = 100 } = {}) {
    const owner = normalizeDraftActor(actor).subject;
    return [...this.records.values()]
      .filter(record => record.ownerSubject === owner &&
        (!status || record.status === status))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, limit)
      .map(record => clone({
        draftId: record.draftId,
        puzzleId: record.puzzleId,
        title: record.title,
        status: record.status,
        headRevision: record.headRevision,
        baseCommitSha: record.baseCommitSha,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }));
  }

  async revisions({ draftId, actor, limit = 100 }) {
    const record = this.ownedRecord(draftId, actor);
    return record.revisions.slice(-limit).reverse().map(revision => clone({
      revision: revision.revision,
      contentHash: revision.contentHash,
      createdBy: revision.createdBy,
      createdAt: revision.createdAt,
      validation: revision.validation
    }));
  }

  async compare({ draftId, leftRevision, rightRevision, actor }) {
    return {
      left: await this.get({ draftId, actor, revision: leftRevision }),
      right: await this.get({ draftId, actor, revision: rightRevision })
    };
  }

  async recordValidation({ draftId, revision, validation, actor }) {
    const record = this.ownedRecord(draftId, actor);
    const target = record.revisions.find(item => item.revision === revision);
    if (!target) throw new DraftNotFoundError(`${draftId} revision ${revision}`);
    target.validation = clone(validation);
    return clone(validation);
  }
}
