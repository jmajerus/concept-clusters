import { randomUUID } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  writeFile
} from "node:fs/promises";
import { join } from "node:path";
import { DraftNotFoundError } from "./draftRepository.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function branchName(puzzleId, requestId) {
  const safePuzzle = String(puzzleId || "puzzle")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "puzzle";
  return `authoring/${safePuzzle}-${requestId.slice(0, 8)}`;
}

function emptyPublication(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id,
    draftId: partial.draftId,
    status: partial.status || "requested",
    contentHash: partial.contentHash || null,
    approvalToken: partial.approvalToken || null,
    baseCommitSha: partial.baseCommitSha || null,
    githubBranch: partial.githubBranch || null,
    githubCommitSha: partial.githubCommitSha || null,
    draftCommitSha: partial.draftCommitSha || null,
    reviewSyncHeadSha: partial.reviewSyncHeadSha || null,
    reviewSyncContentHash: partial.reviewSyncContentHash || null,
    publicationOptions: partial.publicationOptions || {},
    reviewHandoffHeadSha: null,
    reviewHandoff: null,
    reviewHandoffAt: null,
    reviewRoundCount: Number(partial.reviewRoundCount || 0),
    reviewWriteCount: Number(partial.reviewWriteCount || 0),
    reviewStagnantRounds: Number(partial.reviewStagnantRounds || 0),
    reviewLastFingerprint: partial.reviewLastFingerprint || null,
    reviewLastBurden: partial.reviewLastBurden ?? null,
    reviewFingerprintHistory: partial.reviewFingerprintHistory || [],
    reviewRoundHistory: partial.reviewRoundHistory || [],
    reviewLastRoundWriteCount: Number(partial.reviewLastRoundWriteCount || 0),
    reviewLoopStartedAt: partial.reviewLoopStartedAt || null,
    reviewCircuitOpenAt: partial.reviewCircuitOpenAt || null,
    reviewCircuitReason: partial.reviewCircuitReason || null,
    reviewCircuitReport: partial.reviewCircuitReport || null,
    reviewCircuitResetAt: null,
    reviewCircuitResetReason: null,
    githubPrNumber: partial.githubPrNumber ?? null,
    githubPrUrl: partial.githubPrUrl || null,
    error: partial.error || null,
    requestedAt: partial.requestedAt || now,
    updatedAt: partial.updatedAt || now
  };
}

export function createLocalPublicationRepository({ directory, draftStore }) {
  if (!directory) throw new Error("publication directory is required");
  if (!draftStore) throw new Error("draftStore is required");

  function pathFor(id) {
    return join(directory, `${id}.json`);
  }

  async function writeRecord(record) {
    await mkdir(directory, { recursive: true });
    const target = pathFor(record.id);
    const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(record, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx"
    });
    await rename(temporary, target);
  }

  async function readRecord(id) {
    try {
      return JSON.parse(await readFile(pathFor(id), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }

  async function listRecords() {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
    const records = await Promise.all(entries
      .filter(entry => entry.isFile() && entry.name.endsWith(".json"))
      .map(entry => readRecord(entry.name.slice(0, -5))));
    return records.filter(Boolean);
  }

  async function requireRecord(requestId) {
    const record = await readRecord(requestId);
    if (!record) throw new Error(`Unknown publication request: ${requestId}`);
    return record;
  }

  async function save(record) {
    const next = { ...record, updatedAt: new Date().toISOString() };
    await writeRecord(next);
    return clone(next);
  }

  async function get({ requestId }) {
    return clone(await requireRecord(requestId));
  }

  async function findActiveRequest({ draftId }) {
    const matches = (await listRecords())
      .filter(record => record.draftId === draftId && record.status === "pull-request-open")
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    return matches[0] ? clone(matches[0]) : null;
  }

  async function reserve({
    draftId,
    contentHash,
    approvalToken,
    baseCommitSha,
    puzzleId,
    publicationOptions = {}
  }) {
    const existing = (await listRecords())
      .find(record => record.approvalToken === approvalToken);
    if (existing) return clone(existing);
    const draft = await draftStore.getDraft(draftId);
    const currentHash = await draftStore.contentHash(draft.document);
    if (currentHash !== contentHash) throw new DraftNotFoundError(draftId);
    const id = randomUUID();
    const record = emptyPublication({
      id,
      draftId,
      status: "requested",
      contentHash,
      approvalToken,
      baseCommitSha,
      githubBranch: branchName(puzzleId, id),
      publicationOptions
    });
    await writeRecord(record);
    return clone(record);
  }

  async function recordCommit({ requestId, commitSha }) {
    const current = await requireRecord(requestId);
    return save({
      ...current,
      githubCommitSha: commitSha,
      draftCommitSha: commitSha,
      reviewHandoffHeadSha: null,
      reviewHandoff: null,
      reviewHandoffAt: null,
      status: "requested",
      error: null
    });
  }

  async function recordPullRequest({ requestId, commitSha, pullRequest }) {
    const current = await requireRecord(requestId);
    const saved = await save({
      ...current,
      githubCommitSha: commitSha,
      draftCommitSha: commitSha,
      githubPrNumber: pullRequest.number,
      githubPrUrl: pullRequest.url,
      reviewHandoffHeadSha: null,
      reviewHandoff: null,
      reviewHandoffAt: null,
      status: "pull-request-open",
      error: null
    });
    const draft = await draftStore.getDraft(current.draftId);
    const currentHash = await draftStore.contentHash(draft.document);
    if (currentHash === current.contentHash) {
      await draftStore.markSubmitted(current.draftId);
    }
    return saved;
  }

  async function recordAmendedCommit({
    requestId,
    contentHash,
    approvalToken,
    baseCommitSha,
    commitSha,
    publicationOptions
  }) {
    const current = await requireRecord(requestId);
    if (current.status !== "pull-request-open") {
      throw new Error(`Unknown or no-longer-open publication request: ${requestId}`);
    }
    const saved = await save({
      ...current,
      contentHash,
      approvalToken,
      baseCommitSha,
      githubCommitSha: commitSha,
      draftCommitSha: commitSha,
      reviewSyncHeadSha: null,
      reviewSyncContentHash: null,
      reviewHandoffHeadSha: null,
      reviewHandoff: null,
      reviewHandoffAt: null,
      publicationOptions: publicationOptions || {},
      error: null
    });
    await draftStore.markSubmitted(current.draftId);
    return saved;
  }

  async function recordObservedHead({ requestId, commitSha }) {
    const current = await requireRecord(requestId);
    if (current.status !== "pull-request-open") {
      throw new Error(`Unknown or no-longer-open publication request: ${requestId}`);
    }
    return save({
      ...current,
      githubCommitSha: commitSha,
      reviewHandoffHeadSha: null,
      reviewHandoff: null,
      reviewHandoffAt: null,
      error: null
    });
  }

  async function reserveReviewWrites({ requestId, count, maximum, action }) {
    const increment = Math.max(0, Number(count) || 0);
    const current = await requireRecord(requestId);
    if (!increment) return { allowed: true, publication: clone(current) };
    if (current.reviewCircuitOpenAt) {
      return { allowed: false, reason: current.reviewCircuitReason, publication: clone(current) };
    }
    if (current.status !== "pull-request-open") {
      throw new Error(`Unknown or no-longer-open publication request: ${requestId}`);
    }
    if (current.reviewWriteCount + increment > maximum) {
      return {
        allowed: false,
        reason: "maximum-write-actions",
        attemptedAction: action,
        attemptedCount: increment,
        publication: clone(current)
      };
    }
    const now = new Date().toISOString();
    const saved = await save({
      ...current,
      reviewWriteCount: current.reviewWriteCount + increment,
      reviewLoopStartedAt: current.reviewLoopStartedAt || now,
      reviewHandoffHeadSha: null,
      reviewHandoff: null,
      reviewHandoffAt: null
    });
    return { allowed: true, publication: saved };
  }

  async function tripReviewCircuit({ requestId, reason, report }) {
    const current = await requireRecord(requestId);
    const now = new Date().toISOString();
    return save({
      ...current,
      reviewCircuitOpenAt: current.reviewCircuitOpenAt || now,
      reviewCircuitReason: current.reviewCircuitReason || reason,
      reviewCircuitReport: current.reviewCircuitReport || report,
      reviewHandoffHeadSha: null,
      reviewHandoff: null,
      reviewHandoffAt: null
    });
  }

  async function markFailed({ requestId, message }) {
    const current = await requireRecord(requestId);
    return save({
      ...current,
      status: "failed",
      error: String(message).slice(0, 1000)
    });
  }

  async function reconcile({ requestId, pullRequest }) {
    const current = await requireRecord(requestId);
    const status = pullRequest.merged
      ? "merged"
      : pullRequest.state === "open" ? "pull-request-open" : "rejected";
    return save({
      ...current,
      status,
      githubPrUrl: pullRequest.url,
      githubCommitSha: pullRequest.merged
        ? pullRequest.mergeCommitSha || current.githubCommitSha
        : pullRequest.headCommitSha || current.githubCommitSha
    });
  }

  return {
    get,
    findActiveRequest,
    reserve,
    recordCommit,
    recordPullRequest,
    recordAmendedCommit,
    recordObservedHead,
    reserveReviewWrites,
    tripReviewCircuit,
    markFailed,
    reconcile
  };
}

export default createLocalPublicationRepository;
