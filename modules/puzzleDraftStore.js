import { randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  writeFile
} from "node:fs/promises";
import { join } from "node:path";
import { draftContentHash } from "./draftRepository.js";
import { slugify } from "../puzzles/categories.js";

const MAX_DRAFT_DOCUMENT_BYTES = 2 * 1024 * 1024;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDraftId(id) {
  if (typeof id !== "string" || !id.trim() || slugify(id) !== id) {
    throw new Error("draftId must be a non-empty URL-safe slug");
  }
}

function assertDocumentSize(document) {
  const text = JSON.stringify(document);
  if (Buffer.byteLength(text) > MAX_DRAFT_DOCUMENT_BYTES) {
    throw new Error(
      `Draft document exceeds ${MAX_DRAFT_DOCUMENT_BYTES} bytes`
    );
  }
}

export function createPuzzleDraftStore({ directory }) {
  if (!directory) throw new Error("draft directory is required");

  function pathFor(id) {
    assertDraftId(id);
    return join(directory, `${id}.json`);
  }

  async function readRecord(id) {
    const path = pathFor(id);
    let text;
    try {
      text = await readFile(path, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") throw new Error(`Unknown draft: ${id}`);
      throw error;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Draft ${id} is not valid JSON: ${error.message}`);
    }
  }

  async function writeRecord(record) {
    await mkdir(directory, { recursive: true });
    const target = pathFor(record.draftId);
    const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(record, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx"
    });
    await rename(temporary, target);
  }

  async function createDraft({ draftId, document }) {
    assertDraftId(draftId);
    assertDocumentSize(document);
    try {
      await readFile(pathFor(draftId), "utf8");
      throw new Error(`Draft "${draftId}" already exists`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const now = new Date().toISOString();
    const record = {
      draftId,
      revision: 1,
      status: "draft",
      contentHash: await draftContentHash(document),
      createdAt: now,
      updatedAt: now,
      document: clone(document)
    };
    await writeRecord(record);
    return clone(record);
  }

  async function replaceDraft({ draftId, document, expectedRevision = null }) {
    assertDocumentSize(document);
    const current = await readRecord(draftId);
    if (expectedRevision !== null && current.revision !== expectedRevision) {
      throw new Error(
        `Draft revision conflict: expected ${expectedRevision}, current revision is ${current.revision}`
      );
    }
    const record = {
      ...current,
      revision: current.revision + 1,
      contentHash: await draftContentHash(document),
      updatedAt: new Date().toISOString(),
      document: clone(document)
    };
    await writeRecord(record);
    return clone(record);
  }

  // Records that install_puzzle wrote this draft into the checkout.
  // Does not bump revision: publication is not a document edit, and the
  // install tool has already matched expected_revision.
  async function markInstalled(draftId) {
    const current = await readRecord(draftId);
    const now = new Date().toISOString();
    const contentHash = current.contentHash || await draftContentHash(current.document);
    const record = {
      ...current,
      status: "installed",
      contentHash,
      installedAt: now,
      installedContentHash: contentHash,
      updatedAt: now
    };
    await writeRecord(record);
    return clone(record);
  }

  async function markUninstalled(draftId) {
    const current = await readRecord(draftId);
    if (current.status !== "installed" && !current.installedContentHash) {
      return clone(current);
    }
    const now = new Date().toISOString();
    const record = {
      ...current,
      status: "draft",
      installedAt: null,
      installedContentHash: null,
      updatedAt: now
    };
    await writeRecord(record);
    return clone(record);
  }

  // Records that submit_puzzle_for_publication opened or updated a GitHub
  // pull request. Does not bump revision: publication is not a document edit.
  async function markSubmitted(draftId) {
    const current = await readRecord(draftId);
    const now = new Date().toISOString();
    const record = {
      ...current,
      status: "submitted",
      submittedAt: now,
      updatedAt: now
    };
    await writeRecord(record);
    return clone(record);
  }

  async function getDraft(draftId) {
    return clone(await readRecord(draftId));
  }

  async function listDrafts() {
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
    return records
      .map(({ document, ...metadata }) => ({
        ...metadata,
        puzzleId: document?.id || null,
        title: document?.title || null
      }))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  return {
    createDraft,
    getDraft,
    listDrafts,
    replaceDraft,
    markInstalled,
    markUninstalled,
    markSubmitted,
    contentHash: draftContentHash
  };
}

export default createPuzzleDraftStore;
