import { randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  unlink,
  writeFile
} from "node:fs/promises";
import { join } from "node:path";
import {
  DraftEmptyHistoryError,
  MAX_WORKING_COPY_HISTORY,
  draftContentHash
} from "./draftRepository.js";
import {
  applyAuthoredDomain,
  assertNoWriteOnceDrift,
  assembleAuthoredDocument,
  assembleStoredDomainDocuments,
  partitionAuthoredDocument,
  storedDomainDocuments
} from "./authoringDomains.js";
import {
  layoutDocumentForMode,
  serializeLayoutDocument
} from "./layoutDocument.js";
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

  // Serialize mutations per draft so optimistic revision checks are meaningful
  // within a process. Cross-process races are out of scope for this local store.
  const mutationChains = new Map();

  function pathFor(id) {
    assertDraftId(id);
    return join(directory, `${id}.json`);
  }

  function withDraftMutation(draftId, fn) {
    const previous = mutationChains.get(draftId) || Promise.resolve();
    const run = previous.then(fn, fn);
    mutationChains.set(draftId, run.then(() => undefined, () => undefined));
    return run;
  }

  function storedDomainValue(record, key, label) {
    const value = record?.domains?.[key];
    if (value == null) return null;
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`${label} contains invalid JSON: ${error.message}`);
    }
  }

  function materializeRecord(record) {
    if (!record || typeof record !== "object") return record;
    const layout = record.layout || (record.starLayout
      ? layoutDocumentForMode("star", record.starLayout)
      : null);
    const documentStale = Boolean(record.documentStale);
    if (!record.domains || typeof record.domains !== "object") {
      if (documentStale) {
        throw new Error(
          `Draft ${record.draftId || "unknown"} is stale but missing durable domain projections`
        );
      }
      return { ...record, layout, documentStale };
    }
    const content = storedDomainValue(record, "content", "Stored content domain");
    const pedagogy = storedDomainValue(record, "pedagogy", "Stored pedagogy domain");
    if (documentStale && (content == null || pedagogy == null)) {
      throw new Error(
        `Draft ${record.draftId || "unknown"} is stale but missing durable content/pedagogy projections`
      );
    }
    return {
      ...record,
      layout,
      documentStale,
      document: assembleStoredDomainDocuments({
        document: documentStale ? undefined : record.document,
        content,
        pedagogy,
        provenance: storedDomainValue(record, "provenance", "Stored provenance domain")
      })
    };
  }

  async function readRawRecord(id) {
    const path = pathFor(id);
    let text;
    try {
      text = await readFile(path, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") throw new Error(`Unknown draft: ${id}`);
      throw error;
    }
    try {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        documentStale: Boolean(parsed.documentStale)
      };
    } catch (error) {
      throw new Error(`Draft ${id} is not valid JSON: ${error.message}`);
    }
  }

  async function readRecord(id) {
    return materializeRecord(await readRawRecord(id));
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

  function historyOf(record) {
    return Array.isArray(record.workingCopyStack) ? record.workingCopyStack : [];
  }

  function publicRecord(record) {
    const { workingCopyStack, domains, ...rest } = record;
    return clone({
      ...rest,
      documentStale: Boolean(record.documentStale),
      workingCopyHistoryCount: historyOf({ workingCopyStack }).length
    });
  }

  async function createDraft({ draftId, document }) {
    assertDraftId(draftId);
    assertDocumentSize(document);
    return withDraftMutation(draftId, async () => {
      try {
        await readFile(pathFor(draftId), "utf8");
        throw new Error(`Draft "${draftId}" already exists`);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      const now = new Date().toISOString();
      const domains = partitionAuthoredDocument(document);
      const materialized = assembleAuthoredDocument(domains);
      const record = {
        draftId,
        revision: 1,
        status: "draft",
        contentHash: draftContentHash(materialized),
        createdAt: now,
        updatedAt: now,
        document: clone(materialized),
        documentStale: false,
        domains: storedDomainDocuments(materialized),
        layout: null
      };
      await writeRecord(record);
      return publicRecord(record);
    });
  }

  async function replaceDraft({ draftId, document, expectedRevision = null }) {
    assertDocumentSize(document);
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (expectedRevision !== null && raw.revision !== expectedRevision) {
        throw new Error(
          `Draft revision conflict: expected ${expectedRevision}, current revision is ${raw.revision}`
        );
      }
      const current = materializeRecord(raw);
      const materialized = assembleAuthoredDocument(partitionAuthoredDocument(document));
      // Enforced at the store, not at one caller: every complete-document
      // save lands here, including the construct board's PUT of a whole
      // document, which is not routed through the MCP boundary.
      assertNoWriteOnceDrift(current.document, materialized, "stored draft document");
      // A canonical round-trip is not a document edit. In particular, the
      // graphical authoring client may read display-form category titles and
      // send them back through documentForStorage; once canonicalized, that
      // should preserve the current revision instead of consuming one.
      if (JSON.stringify(current.document) === JSON.stringify(materialized)
          && !raw.documentStale) {
        return publicRecord(current);
      }
      const contentHash = draftContentHash(materialized);
      const stack = historyOf(raw);
      stack.push({
        document: clone(current.document),
        contentHash: raw.contentHash,
        savedAt: new Date().toISOString()
      });
      if (stack.length > MAX_WORKING_COPY_HISTORY) {
        stack.splice(0, stack.length - MAX_WORKING_COPY_HISTORY);
      }
      const record = {
        ...raw,
        revision: raw.revision + 1,
        contentHash,
        updatedAt: new Date().toISOString(),
        document: clone(materialized),
        documentStale: false,
        domains: storedDomainDocuments(materialized),
        workingCopyStack: stack
      };
      await writeRecord(record);
      return publicRecord(record);
    });
  }

  async function replaceDomain({
    draftId,
    domain,
    projection,
    expectedRevision = null,
    provenance = undefined
  }) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (expectedRevision !== null && raw.revision !== expectedRevision) {
        throw new Error(
          `Draft revision conflict: expected ${expectedRevision}, current revision is ${raw.revision}`
        );
      }
      const current = materializeRecord(raw);
      let nextDocument = applyAuthoredDomain(current.document, domain, projection);
      if (provenance !== undefined) {
        nextDocument = { ...nextDocument, provenance };
      } else if (Object.prototype.hasOwnProperty.call(current.document, "provenance")) {
        nextDocument = { ...nextDocument, provenance: current.document.provenance };
      }
      const materialized = assembleAuthoredDocument(partitionAuthoredDocument(nextDocument));
      if (JSON.stringify(current.document) === JSON.stringify(materialized)) {
        return publicRecord(current);
      }
      assertDocumentSize(materialized);
      const contentHash = draftContentHash(materialized);
      const stack = historyOf(raw);
      stack.push({
        document: clone(current.document),
        contentHash: raw.contentHash,
        savedAt: new Date().toISOString()
      });
      if (stack.length > MAX_WORKING_COPY_HISTORY) {
        stack.splice(0, stack.length - MAX_WORKING_COPY_HISTORY);
      }
      // Persist the selected domain column (and provenance). On the first
      // focused save for a pre-domain row, seed sibling projections from the
      // assembled document so marking the cache stale does not drop them.
      // Keep the on-disk document blob unchanged until materializeDraft().
      const nextDomains = storedDomainDocuments(materialized);
      const domains = raw.domains && typeof raw.domains === "object"
        ? {
          ...raw.domains,
          [domain]: nextDomains[domain],
          provenance: nextDomains.provenance
        }
        : nextDomains;
      const record = {
        ...raw,
        revision: raw.revision + 1,
        contentHash,
        updatedAt: new Date().toISOString(),
        document: clone(raw.document),
        documentStale: true,
        domains,
        workingCopyStack: stack
      };
      await writeRecord(record);
      return publicRecord(materializeRecord(record));
    });
  }

  async function materializeDraft(draftId) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (!raw.documentStale) return publicRecord(materializeRecord(raw));
      const materialized = materializeRecord(raw).document;
      const record = {
        ...raw,
        document: clone(materialized),
        documentStale: false,
        domains: storedDomainDocuments(materialized),
        contentHash: draftContentHash(materialized),
        updatedAt: new Date().toISOString()
      };
      await writeRecord(record);
      return publicRecord(record);
    });
  }

  async function popWorkingCopy({ draftId, expectedRevision = null }) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (expectedRevision !== null && raw.revision !== expectedRevision) {
        throw new Error(
          `Draft revision conflict: expected ${expectedRevision}, current revision is ${raw.revision}`
        );
      }
      const stack = historyOf(raw);
      const previous = stack.pop();
      if (!previous) throw new DraftEmptyHistoryError(draftId);
      const materialized = assembleAuthoredDocument(
        partitionAuthoredDocument(previous.document)
      );
      const record = {
        ...raw,
        revision: raw.revision + 1,
        contentHash: draftContentHash(materialized),
        updatedAt: new Date().toISOString(),
        document: clone(materialized),
        documentStale: false,
        domains: storedDomainDocuments(materialized),
        workingCopyStack: stack
      };
      await writeRecord(record);
      return publicRecord(record);
    });
  }

  async function recordValidation(draftId, validation) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      const record = {
        ...raw,
        validation: clone(validation),
        updatedAt: new Date().toISOString()
      };
      await writeRecord(record);
      return clone(validation);
    });
  }

  async function saveLayout({ draftId, layout }) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      const layoutJson = serializeLayoutDocument(layout);
      const record = {
        ...raw,
        layout: layoutJson == null ? null : JSON.parse(layoutJson),
        updatedAt: new Date().toISOString()
      };
      await writeRecord(record);
      return publicRecord(materializeRecord(record));
    });
  }

  async function clearLayout(draftId) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      const record = {
        ...raw,
        layout: null,
        updatedAt: new Date().toISOString()
      };
      await writeRecord(record);
      return publicRecord(materializeRecord(record));
    });
  }

  // See D1DraftRepository.delete: expectedRevision turns this into a
  // compare-and-delete so a rename cannot carry away a save that landed
  // between the copy and the removal.
  async function deleteDraft(draftId, { expectedRevision = null } = {}) {
    return withDraftMutation(draftId, async () => {
      if (Number.isInteger(expectedRevision)) {
        const raw = await readRawRecord(draftId);
        if (raw.revision !== expectedRevision) {
          throw new Error(
            `Draft revision conflict: expected ${expectedRevision}, `
            + `current revision is ${raw.revision}`
          );
        }
      }
      await unlink(pathFor(draftId));
    });
  }

  // Records a checkout install against this draft. Unused now that
  // install_puzzle is gone (Freeze is the only thing that writes the
  // checkout); kept as a draftStore capability, not wired to any caller.
  // Does not bump revision: publication is not a document edit.
  async function markInstalled(draftId) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      const current = materializeRecord(raw);
      const now = new Date().toISOString();
      const contentHash = raw.contentHash || draftContentHash(current.document);
      const record = {
        ...raw,
        status: "installed",
        contentHash,
        installedAt: now,
        installedContentHash: contentHash,
        updatedAt: now
      };
      await writeRecord(record);
      return publicRecord(materializeRecord(record));
    });
  }

  async function markUninstalled(draftId) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (raw.status !== "installed" && !raw.installedContentHash) {
        return publicRecord(materializeRecord(raw));
      }
      const now = new Date().toISOString();
      const record = {
        ...raw,
        status: "draft",
        installedAt: null,
        installedContentHash: null,
        updatedAt: now
      };
      await writeRecord(record);
      return publicRecord(materializeRecord(record));
    });
  }

  // Records that submitting this draft opened or updated a GitHub pull
  // request. Does not bump revision: publication is not a document edit.
  async function markSubmitted(draftId) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      const now = new Date().toISOString();
      const record = {
        ...raw,
        status: "submitted",
        submittedAt: now,
        updatedAt: now
      };
      await writeRecord(record);
      return publicRecord(materializeRecord(record));
    });
  }

  async function getDraft(draftId) {
    return publicRecord(await readRecord(draftId));
  }

  async function listDrafts({ includeDocument = false } = {}) {
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
      .map(record => {
        const {
          document,
          workingCopyStack,
          domains,
          layout: _layout,
          ...metadata
        } = record;
        return {
          ...metadata,
          puzzleId: document?.id || null,
          title: document?.title || null,
          workingCopyHistoryCount: historyOf({ workingCopyStack }).length,
          ...(includeDocument ? { document } : {})
        };
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  return {
    createDraft,
    deleteDraft,
    getDraft,
    listDrafts,
    replaceDraft,
    replaceDomain,
    materializeDraft,
    popWorkingCopy,
    recordValidation,
    saveLayout,
    clearLayout,
    markInstalled,
    markUninstalled,
    markSubmitted,
    contentHash: draftContentHash
  };
}

export default createPuzzleDraftStore;
