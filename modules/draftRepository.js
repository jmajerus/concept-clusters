export const MAX_HOSTED_DRAFT_BYTES = 1_250_000;

const DRAFT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class DraftConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "DraftConflictError";
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
// executable contract the D1 implementation follows.
// save() requires expectedRevision: a positive integer from get/create/list
// matching the draft's current generation. One current document is stored;
// the integer is an OCC token, not a retained history of old blobs.
export class DraftRepository {
  async create(_input) { throw new Error("DraftRepository.create is not implemented"); }
  async get(_input) { throw new Error("DraftRepository.get is not implemented"); }
  async save(_input) { throw new Error("DraftRepository.save is not implemented"); }
  async list(_input) { throw new Error("DraftRepository.list is not implemented"); }
  async delete(_input) { throw new Error("DraftRepository.delete is not implemented"); }
  async recordValidation(_input) {
    throw new Error("DraftRepository.recordValidation is not implemented");
  }
  async recordAssistanceStamp(_input) {
    throw new Error("DraftRepository.recordAssistanceStamp is not implemented");
  }
}
