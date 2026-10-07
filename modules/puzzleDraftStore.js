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
  domainColumnsForSave,
  partitionAuthoredDocument,
  storedDomainDocuments
} from "./authoringDomains.js";
import {
  LayoutConflictError,
  layoutDocumentForMode,
  serializeLayoutDocument
} from "./layoutDocument.js";
import { slugify } from "../puzzles/categories.js";
import {
  boardLimitWaiverRequestIsCurrent,
  makeBoardLimitWaiverRequest,
  grantBoardLimitWaiver,
  preserveCurrentBoardLimitWaivers,
  revokeBoardLimitWaiver as withoutBoardLimitWaiver
} from "./boardLimitWaivers.js";

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
    const classification = storedDomainValue(record, "classification", "Stored classification domain");
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
        classification,
        provenance: storedDomainValue(record, "provenance", "Stored provenance domain"),
        administration: storedDomainValue(record, "administration", "Stored administration domain")
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
    const { workingCopyStack, domains, reviewBaselineDocument, ...rest } = record;
    return clone({
      ...rest,
      openedFromPublished: record.openedFromPublished === true,
      hasReviewBaseline: reviewBaselineDocument != null,
      reviewStackLoaded: record.reviewStackLoaded === true,
      reviewBasePublishedRevision: Number.isInteger(record.reviewBasePublishedRevision)
        ? record.reviewBasePublishedRevision
        : null,
      documentStale: Boolean(record.documentStale),
      workingCopyHistoryCount: historyOf({ workingCopyStack }).length
    });
  }

  async function createDraft({
    draftId,
    document,
    seededFromPublished = false,
    basePublishedRevision = null
  }) {
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
        openedFromPublished: seededFromPublished === true,
        reviewBaselineDocument: null,
        reviewBasePublishedRevision: Number.isInteger(basePublishedRevision)
          ? basePublishedRevision
          : null,
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
      const preservedDocument = preserveCurrentBoardLimitWaivers(current.document, document);
      const materialized = assembleAuthoredDocument(partitionAuthoredDocument(preservedDocument));
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
      const storedDomains = raw.domains && typeof raw.domains === "object"
        ? raw.domains
        : null;
      // Legacy rows keep category inside content and categories inside
      // pedagogy. The first focused save rewrites every projection together
      // so those fields are not stored twice. tags and level that still sit
      // on a sibling projection are moved the same way.
      const columns = domainColumnsForSave({
        content: storedDomains?.content ?? null,
        pedagogy: storedDomains?.pedagogy ?? null,
        classification: storedDomains?.classification ?? null
      }, domain, nextDomains);
      const domains = storedDomains
        ? { ...storedDomains, ...columns }
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
      const current = materializeRecord(raw);
      const restoredDomains = partitionAuthoredDocument(previous.document);
      // Content undo must not roll back a human's current board settings or
      // a later grant/revocation decision.
      restoredDomains.administration = partitionAuthoredDocument(current.document).administration;
      const materialized = assembleAuthoredDocument(
        restoredDomains
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

  async function listBoardLimitWaiverRequests(input) {
    const draftId = typeof input === "string" ? input : input?.draftId;
    const raw = await readRawRecord(draftId);
    return clone(raw.boardLimitWaiverRequests || []);
  }

  async function requestBoardLimitWaiver({ draftId, waiverType, targetId, reason, expectedRevision, actor }) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (raw.revision !== expectedRevision) {
        throw new Error(`Draft revision conflict: expected ${expectedRevision}, current revision is ${raw.revision}`);
      }
      const current = materializeRecord(raw);
      const waiver = makeBoardLimitWaiverRequest(current.document, waiverType, targetId, reason);
      const requests = raw.boardLimitWaiverRequests || [];
      const pendingIndex = requests.findIndex(item => item.status === "pending" &&
        item.waiverType === waiverType && item.targetId === targetId &&
        item.count === waiver.count);
      let nextRequests = [...requests];
      const requestedBy = actor?.name || actor?.email || actor?.subject || "author";
      const now = new Date().toISOString();
      if (pendingIndex >= 0) {
        const pending = requests[pendingIndex];
        if (pending.reason === reason.trim()) return clone(pending);
        nextRequests[pendingIndex] = {
          ...pending,
          status: "superseded",
          decidedBy: requestedBy,
          decidedAt: now,
          decisionNote: "Superseded by an updated author rationale.",
          events: [...(pending.events || []), {
            eventType: "superseded", actor: requestedBy, at: now,
            note: "Superseded by an updated author rationale."
          }]
        };
      }
      const request = {
        id: crypto.randomUUID(), draftId, puzzleId: current.document.id,
        ...waiver, status: "pending",
        requestedBy,
        requestedAt: now, requestedRevision: expectedRevision
      };
      await writeRecord({ ...raw, boardLimitWaiverRequests: [...nextRequests, request] });
      return clone(request);
    });
  }

  async function decideBoardLimitWaiver({ draftId, requestId, decision, expectedRevision, actor, note = "" }) {
    if (!["granted", "declined"].includes(decision)) throw new Error("Decision must be granted or declined.");
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (raw.revision !== expectedRevision) {
        throw new Error(`Draft revision conflict: expected ${expectedRevision}, current revision is ${raw.revision}`);
      }
      const current = materializeRecord(raw);
      const requests = raw.boardLimitWaiverRequests || [];
      const requestIndex = requests.findIndex(item => item.id === requestId && item.status === "pending");
      if (requestIndex < 0) throw new Error("That board limit waiver request is no longer pending.");
      const request = requests[requestIndex];
      if (decision === "granted" && !boardLimitWaiverRequestIsCurrent(current.document, request)) {
        throw new Error("The target's size changed after the request. Refresh and request review for the current board state.");
      }
      const now = new Date().toISOString();
      const reviewer = actor?.name || actor?.email || actor?.subject || "local reviewer";
      let document = current.document;
      if (decision === "granted") {
        document = grantBoardLimitWaiver(
          document, request.waiverType, request.targetId, request.reason, reviewer, now
        );
      }
      const materialized = assembleAuthoredDocument(partitionAuthoredDocument(document));
      const stack = historyOf(raw);
      if (decision === "granted") stack.push({ document: clone(current.document), contentHash: raw.contentHash, savedAt: now });
      const nextRequests = requests.map((item, index) => {
        if (index === requestIndex) {
          return {
            ...item, status: decision, decidedBy: reviewer, decidedAt: now,
            decisionNote: note.trim() || null,
            events: [...(item.events || []), { eventType: decision, actor: reviewer, at: now, note: note.trim() || null }]
          };
        }
        if (decision === "granted" && item.waiverType === request.waiverType &&
            item.targetId === request.targetId && item.status === "granted") {
          return {
            ...item, status: "replaced", decidedBy: reviewer, decidedAt: now,
            decisionNote: note.trim() || null,
            events: [...(item.events || []), { eventType: "replaced", actor: reviewer, at: now, note: note.trim() || null }]
          };
        }
        return item;
      });
      await writeRecord({
        ...raw,
        revision: decision === "granted" ? raw.revision + 1 : raw.revision,
        contentHash: decision === "granted" ? draftContentHash(materialized) : raw.contentHash,
        updatedAt: now,
        document: clone(materialized),
        documentStale: false,
        domains: storedDomainDocuments(materialized),
        workingCopyStack: stack,
        boardLimitWaiverRequests: nextRequests
      });
      return publicRecord(materializeRecord(await readRawRecord(draftId)));
    });
  }

  async function revokeBoardLimitWaiver({ draftId, waiverType, targetId, expectedRevision, actor, note = "" }) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (raw.revision !== expectedRevision) {
        throw new Error(`Draft revision conflict: expected ${expectedRevision}, current revision is ${raw.revision}`);
      }
      const current = materializeRecord(raw);
      const grant = current.document.boardLimitWaivers?.find(item =>
        item.waiverType === waiverType && item.targetId === targetId
      );
      if (!grant) throw new Error("There is no current grant for that board limit scope.");
      const document = withoutBoardLimitWaiver(current.document, waiverType, targetId);
      const materialized = assembleAuthoredDocument(partitionAuthoredDocument(document));
      const now = new Date().toISOString();
      const reviewer = actor?.name || actor?.email || actor?.subject || "local reviewer";
      const stack = historyOf(raw);
      stack.push({ document: clone(current.document), contentHash: raw.contentHash, savedAt: now });
      const requests = (raw.boardLimitWaiverRequests || []).map(request =>
        request.waiverType === waiverType && request.targetId === targetId && request.status === "granted"
          ? { ...request, status: "revoked", decidedBy: reviewer, decidedAt: now,
              decisionNote: note.trim() || null,
              events: [...(request.events || []), { eventType: "revoked", actor: reviewer, at: now, note: note.trim() || null }] }
          : request
      );
      await writeRecord({
        ...raw, revision: raw.revision + 1, contentHash: draftContentHash(materialized),
        updatedAt: now, document: clone(materialized), documentStale: false,
        domains: storedDomainDocuments(materialized), workingCopyStack: stack,
        boardLimitWaiverRequests: requests
      });
      return publicRecord(materializeRecord(await readRawRecord(draftId)));
    });
  }

  async function grantBoardLimitWaiverDirect(input) {
    const request = await requestBoardLimitWaiver(input);
    return decideBoardLimitWaiver({
      ...input, requestId: request.id, decision: "granted"
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

  async function saveLayout({ draftId, layout, expectedUpdatedAt = null }) {
    return withDraftMutation(draftId, async () => {
      const raw = await readRawRecord(draftId);
      if (expectedUpdatedAt != null && raw.updatedAt !== expectedUpdatedAt) {
        throw new LayoutConflictError(draftId);
      }
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
          reviewBaselineDocument: _baseline,
          ...metadata
        } = record;
        return {
          ...metadata,
          puzzleId: document?.id || null,
          title: document?.title || null,
          workingCopyHistoryCount: historyOf({ workingCopyStack }).length,
          ...(includeDocument ? { document, layout: _layout ?? null } : {})
        };
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async function rememberReviewBaseline({
    draftId,
    document,
    expectedRevision,
    basePublishedRevision = null
  }) {
    return withDraftMutation(draftId, async () => {
      const record = await readRecord(draftId);
      if (record.reviewBaselineDocument != null) return publicRecord(record);
      if (Number(record.revision) !== expectedRevision) {
        throw new Error(
          `Draft revision conflict: expected ${expectedRevision}, current revision is ${record.revision}`
        );
      }
      record.reviewBaselineDocument = clone(document);
      record.reviewStackLoaded = false;
      if (!Number.isInteger(record.reviewBasePublishedRevision) &&
          Number.isInteger(basePublishedRevision)) {
        record.reviewBasePublishedRevision = basePublishedRevision;
      }
      await writeRecord(record);
      return publicRecord(record);
    });
  }

  async function readReviewBaseline(draftId) {
    const record = await readRecord(draftId);
    return record.reviewBaselineDocument ? clone(record.reviewBaselineDocument) : null;
  }

  async function setReviewStackLoaded({ draftId, stackLoaded }) {
    return withDraftMutation(draftId, async () => {
      const record = await readRecord(draftId);
      if (record.reviewBaselineDocument == null) return publicRecord(record);
      record.reviewStackLoaded = stackLoaded === true;
      await writeRecord(record);
      return publicRecord(record);
    });
  }

  async function releaseReviewSession(draftId) {
    return withDraftMutation(draftId, async () => {
      const record = await readRecord(draftId);
      record.openedFromPublished = false;
      record.reviewBaselineDocument = null;
      record.reviewBasePublishedRevision = null;
      record.reviewStackLoaded = false;
      await writeRecord(record);
      return publicRecord(record);
    });
  }

  return {
    createDraft,
    deleteDraft,
    getDraft,
    listDrafts,
    rememberReviewBaseline,
    readReviewBaseline,
    setReviewStackLoaded,
    releaseReviewSession,
    replaceDraft,
    replaceDomain,
    materializeDraft,
    popWorkingCopy,
    recordValidation,
    saveLayout,
    clearLayout,
    listBoardLimitWaiverRequests,
    requestBoardLimitWaiver,
    decideBoardLimitWaiver,
    grantBoardLimitWaiverDirect,
    revokeBoardLimitWaiver,
    markInstalled,
    markUninstalled,
    markSubmitted,
    contentHash: draftContentHash
  };
}

export default createPuzzleDraftStore;
