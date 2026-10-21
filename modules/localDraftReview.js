// Local /admin/drafts handler: the same HTML as the hosted authoring
// Worker, backed by the shared D1 drafts stdio MCP uses.
// Copy can be saved from the drafts page. Structure is authored on
// `/?puzzle=` (construct canvas) or via optional MCP on the same D1 row.
// Opening a GitHub pull request is a POST from the draft page. New puzzle,
// document GET/PUT, and play.json are LAN-only. Nothing here writes this
// checkout -- install_puzzle and its Install/Uninstall actions were removed
// as cross-purposed with D1 being the source of truth; only Admin Freeze
// writes puzzles/, catalogues/, and content/ now.
// GET `/admin/drafts` lists published D1 ∪ git seed ∪ working copies.
// GET `/admin/drafts/<id>` opens a working copy from the published snapshot
// when one does not already exist.
//
// Publication status describes the D1 snapshot available to public play.
// Freeze cues and GitHub snapshot membership describe the static copy.
// D1 `submitted` is leftover PR-ledger state and is not shown. GitHub
// snapshot membership comes from the Freeze snapshot: origin’s
// puzzles/index.js joined with that freeze’s puzzle add/update, minus
// remove, assuming the freeze merges.

import { layoutAttention } from "./layoutAttention.js";
import { createDerivedRowMemo, registryFingerprint, rowMarkers } from "./derivedRowMemo.js";
import { autoLayoutSettleMs, readAutoLayoutStatuses } from "./autoLayoutWatcher.js";
import { authoringWorkspacePaths } from "./authoringWorkspacePaths.js";
import { draftLayoutPassKey, layoutPassJobsFor } from "./localPlayCorpus.js";
import { createServerTiming } from "./serverTiming.js";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { CATEGORIES, slugify } from "../puzzles/categories.js";
import { matchReviewIssue, nextReviewIssueId } from "./contentDocumentRepository.js";
import { DraftEmptyHistoryError, DraftNotFoundError } from "./draftRepository.js";
import {
  renderDraftListPage,
  renderDraftPage,
  renderPuzzleReviewIssuesPage,
  renderReviewOverlapPage,
  renderStaleReviewPage,
  renderUndecidedProposalsPage
} from "./draftReviewPage.js";
import { D1ModelSuggestionRepository } from "./d1ModelSuggestionRepository.js";
import { AUTHORING_SETTINGS } from "./authoringSettings.js";
import { LocalD1ConfigError } from "./localD1Config.js";
import { HttpD1Error } from "./httpD1Database.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import {
  documentForEditor,
  documentForStorage,
  withStorageCanonicalizeFlags
} from "./authoredPuzzleDocument.js";
import { createPuzzleSkeleton } from "./puzzleSkeleton.js";
import {
  OPEN_EXISTING_DRAFT_CONFIRM,
  listPuzzleCorpusRows,
  loadOrSeedPuzzleDraft,
  openPuzzleWorkingCopy,
  openPuzzleWorkingCopyLocation,
  seedPublishedPuzzleIfAbsent,
  seedPublishedPuzzles
} from "./contentDocumentSeed.js";
import { puzzleFromAuthoredDocument } from "./simplifiedPuzzleSchema.js";
import { puzzleToSimplified } from "./puzzleSimplified.js";
import {
  LayoutConflictError,
  autoBoardConflict,
  autoEnvelopeConflict,
  autoLayoutConflict,
  emptyLayoutDocument,
  layoutDocumentWithBoard,
  liftLegacyBoard,
  withoutLegacyBoard,
  layoutDocumentForMode,
  layoutForMode,
  mergePublishLayout,
  normalizeLayoutDocument,
  stampLayoutSaved
} from "./layoutDocument.js";
import { validatePublishedPuzzleLayout } from "./layoutPublication.js";
import { draftPlayQuery } from "./stagingPlayLinks.js";
import {
  diffPublishedDraft,
  publishedDocumentFromService,
  valuesEqual
} from "./draftReviewDiff.js";
import {
  applyReviewChanges,
  freshProposalOverlaps,
  isReviewPatch,
  openStackPredecessor,
  proposalChanges,
  staleReviewChanges
} from "./reviewPatch.js";
import {
  DraftFieldError,
  draftFieldRedirectPath,
  draftEditorPublicationRedirectPath,
  draftListPublicationRedirectPath,
  draftPublicationNoticeFromSearch,
  isDraftConflictError,
  applyDraftFieldEdit,
  parseFieldEditForm,
  parseWorkingCopyEdits,
  persistDraftFieldEdit,
  persistDraftWorkingCopy,
  persistDraftCanonicalForm,
  renderDraftFieldConflictPage
} from "./draftReviewEdit.js";
import {
  isSameOriginRequest,
  parseSubmitForm,
  readNodeUrlEncoded
} from "./draftReviewSubmit.js";
import {
  DraftRenameError,
  SEEDED_ROUTE_ADMIN,
  parseRenameForm,
  puzzleIdIsLive,
  renamePuzzleDraftId,
  shadowCreateRefusal
} from "./draftIdRename.js";
import { renderContentLifecycleResultPage, renderContentPublishResultPage } from "./catalogueReviewPage.js";
import {
  ContentDocumentNotFoundError,
  PublishedRevisionConflictError,
  publishedRowOrNull
} from "./contentDocumentRepository.js";
import { loadMergedCategoryRegistry } from "./authoringMcpTaxonomy.js";
import { checkDocumentLinks, wikiLinkFlags } from "./wikiLinkCheck.js";
import { draftShadowsPublished, provenanceDiffersFromPublished, unpublishedChangeDomains } from "./draftReviewDiff.js";
import { samePlayerFacingProjection } from "./playerFacingRevision.js";
import {
  freezeFlagsFromPublished,
  gitIdsFromContentService,
  isPendingFreezeCue
} from "./contentFreezePlan.js";
import {
  inGithubProduction,
  loadOrHydrateGithubProductionManifest,
  withGithubProduction
} from "./githubProductionManifest.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

export async function puzzleInCheckout(repositoryRoot, puzzleId) {
  if (typeof puzzleId !== "string" || slugify(puzzleId) !== puzzleId) return false;
  try {
    await access(join(repositoryRoot, "content", "puzzles", `${puzzleId}.ccpuzzle.json`));
    return true;
  } catch {
    return false;
  }
}

// Same result as contentFreezePlan's publishedFreezeAddIds, computed from a
// published-rows list the caller already fetched instead of issuing another
// full listPublished round trip (documents included) for the same table.
function freezeAddIdsFromPublishedRows(publishedRows = [], gitPuzzleIds = []) {
  const git = new Set(gitPuzzleIds.filter(Boolean));
  return new Set(
    publishedRows
      .filter(row => row?.id && !row.withdrawnAt && isPendingFreezeCue(row) && !git.has(row.id))
      .map(row => row.id)
  );
}

function formatActionError(error) {
  if (!(error instanceof Error)) return String(error);
  if (Array.isArray(error.errors) && error.errors.length) {
    return `${error.message}\n${error.errors.join("\n")}`;
  }
  return error.message;
}

async function provenanceModelSettings(contentDocuments) {
  const repository = contentDocuments?.modelSuggestions
    || (contentDocuments?.database
      ? new D1ModelSuggestionRepository(contentDocuments.database)
      : null);
  if (!repository) return AUTHORING_SETTINGS;
  const modelSuggestions = await repository.listForRuntime();
  return { ...AUTHORING_SETTINGS, modelSuggestions };
}

const RECORDED_STATUSES = new Set([
  "installed",
  "submitted",
  "published",
  "review",
  "archived"
]);

export async function readCheckoutDocument(repositoryRoot, puzzleId) {
  if (typeof puzzleId !== "string" || slugify(puzzleId) !== puzzleId) return null;
  try {
    const text = await readFile(
      join(repositoryRoot, "content", "puzzles", `${puzzleId}.ccpuzzle.json`),
      "utf8"
    );
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function draftMatchesCheckout(draftDocument, checkoutDocument) {
  if (!draftDocument || !checkoutDocument) return false;
  const { puzzle } = puzzleFromAuthoredDocument(draftDocument);
  if (!puzzle) return false;
  // Board settings live in the layout, so a checkout that Freeze has
  // already lifted still matches a draft that carries them in `board`.
  return valuesEqual(
    withoutLegacyBoard(documentForEditor(puzzleToSimplified(puzzle), { categoryRegistry: CATEGORIES })),
    withoutLegacyBoard(documentForEditor(checkoutDocument, { categoryRegistry: CATEGORIES }))
  );
}

export function thisDraftRevisionInCheckout(metadata, inCheckout, matchesCheckout) {
  if (!inCheckout) return false;
  if (matchesCheckout === true) return true;
  if (metadata.installedContentHash && metadata.contentHash) {
    return metadata.installedContentHash === metadata.contentHash;
  }
  if (matchesCheckout === false) return false;
  return metadata.status === "installed";
}

export function mapDraftListItem(metadata, {
  inCheckout = false,
  matchesCheckout = null
} = {}) {
  const publicationStatus = RECORDED_STATUSES.has(metadata.status)
    ? metadata.status
    : "draft";
  const thisDraftInCheckout = thisDraftRevisionInCheckout(
    { ...metadata, status: publicationStatus },
    inCheckout,
    matchesCheckout
  );
  const inCurrentBundle = thisDraftInCheckout ? true : null;
  return {
    ...metadata,
    publicationStatus,
    status: thisDraftInCheckout ? "published" : "draft",
    inCurrentBundle
  };
}

function publishedInContentService(contentService, puzzleId) {
  if (typeof puzzleId !== "string") return false;
  if (contentService?.knownPuzzleIds?.has(puzzleId)) return true;
  return Boolean(contentService?.state?.puzzles?.some(item => item.id === puzzleId));
}

export async function mapDraftDetail(record, {
  contentService = null,
  contentDocuments = null,
  inCheckout = false,
  matchesCheckout = null,
  publishedDocument = null,
  publishedLayout = null,
  categoryRegistry = undefined,
  checkWikiLinks = null
}) {
  const puzzleId = typeof record.document?.id === "string"
    ? record.document.id
    : record.puzzleId || null;
  const gitPublished = publishedDocumentFromService(contentService, puzzleId);
  const baseline = publishedDocument
    ? documentForEditor(publishedDocument, { categoryRegistry })
    : gitPublished;
  const document = documentForEditor(record.document, { categoryRegistry });
  // Board settings an older document carries count as layout, where play
  // reads them (see unpublishedChangeDomains).
  const layoutDiffersFromPublished = Boolean(
    publishedDocument && !valuesEqual(
      liftLegacyBoard(publishedDocument, publishedLayout || null).layout ?? null,
      // No layout of its own inherits the published one.
      liftLegacyBoard(record.document, record.layout ?? publishedLayout ?? null).layout ?? null
    )
  );
  // One diff, read twice: the summary renders it and the shadow check scores
  // it. Recomputing would canonicalize and walk the whole board again.
  const publishedDiff = baseline ? diffPublishedDraft(baseline, document) : null;
  return {
    ...mapDraftListItem({ ...record, puzzleId }, {
      inCheckout,
      matchesCheckout
    }),
    puzzleId,
    title: record.document?.title || record.title || null,
    document,
    alreadyPublished: inCheckout || publishedInContentService(contentService, puzzleId),
    // The same question the rename POST asks, so the page never offers a
    // rename the server will refuse -- withdrawn rows and git-only ids count
    // as live there too.
    puzzleIdIsLive: await puzzleIdIsLive({
      contentDocuments,
      contentService,
      puzzleId
    }),
    publishedDiff,
    playerTextDiffersFromPublished: Boolean(baseline)
      && !samePlayerFacingProjection(baseline, document),
    shadowsPublished: draftShadowsPublished({ published: baseline, publishedDiff }),
    provenanceDiffersFromPublished: provenanceDiffersFromPublished(baseline, document),
    layoutDiffersFromPublished,
    validation: contentService
      ? await withWikiLinkFlags(
        checkWikiLinks,
        document,
        await withUserOnlyFlags(
          contentService,
          document,
          withStorageCanonicalizeFlags(
            record.document,
            await contentService.validatePuzzleDraft(document, { categoryRegistry }),
            { categoryRegistry }
          )
        )
      )
      : null
  };
}

// Link problems (a Wikipedia title, or another URL that does not resolve)
// join the page-only flags the same way the structural notes do: shown to the human
// reviewer, never persisted, never part of what MCP validation returns.
// The checker is injected so the page can render without network access
// (tests, offline dev) and so the review handler decides the timeout.
async function withWikiLinkFlags(checkWikiLinks, document, validation) {
  if (typeof checkWikiLinks !== "function") return validation;
  const flags = wikiLinkFlags(await checkWikiLinks(document));
  if (!flags.length) return validation;
  return {
    ...validation,
    flags: [
      ...(validation.flags || []),
      ...flags.map(flag => ({ ...flag, pageOnly: true }))
    ]
  };
}

// User-only structural flags are merged in here, for this
// page's render only -- never into what validatePuzzleDraft itself returns,
// which is what an MCP client sees and what gets persisted via
// recordValidation. See puzzleSymmetryFlags.js. Stamped pageOnly so
// renderFlags can badge them as such -- see draftReviewPage.js.
async function withUserOnlyFlags(contentService, document, validation) {
  if (typeof contentService.computeUserOnlyFlags !== "function") return validation;
  const userOnlyFlags = await contentService.computeUserOnlyFlags(document);
  if (!userOnlyFlags.length) return validation;
  return {
    ...validation,
    flags: [
      ...(validation.flags || []),
      ...userOnlyFlags.map(flag => ({ ...flag, pageOnly: true }))
    ]
  };
}

function html(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function json(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

const CREATE_DRAFT_CONFIRM = "create-draft";

async function readRequestPayload(req) {
  const type = String(req.headers?.["content-type"] || req.headers?.["Content-Type"] || "")
    .toLowerCase();
  const chunks = [];
  if (req && typeof req[Symbol.asyncIterator] === "function") {
    for await (const chunk of req) chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (type.includes("application/json")) {
    if (!raw.trim()) return { json: {}, params: new URLSearchParams() };
    try {
      return { json: JSON.parse(raw), params: new URLSearchParams() };
    } catch {
      const error = new Error("Request body must be JSON");
      error.status = 400;
      throw error;
    }
  }
  return { json: null, params: new URLSearchParams(raw) };
}

function wantsJson(req, jsonBody) {
  const accept = String(req.headers?.accept || req.headers?.Accept || "").toLowerCase();
  const type = String(req.headers?.["content-type"] || req.headers?.["Content-Type"] || "")
    .toLowerCase();
  return Boolean(jsonBody)
    || accept.includes("application/json")
    || type.includes("application/json");
}

function replyCreateDraft(req, res, jsonBody, status, { message, payload } = {}) {
  if (wantsJson(req, jsonBody)) {
    json(res, payload || { error: message }, status);
    return;
  }
  html(res, `<p>${escapeHtml(message)}</p>`, status);
}

function isMissingDraft(error) {
  if (error instanceof DraftNotFoundError) return true;
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith("Unknown draft:") ||
    message.includes("draftId must");
}

async function publishedSnapshotsFor(contentDocuments, puzzleId, events) {
  const snapshots = {};
  if (typeof contentDocuments?.getPublishedAtRevision !== "function") return snapshots;
  // A rejection is shown against the revision it was filed on; an acceptance
  // against the revision it replaced.
  const revisions = [...new Set((events || []).flatMap(event => {
    if (event.eventType === "rejected" && Number.isInteger(event.basePublishedRevision)) {
      return [event.basePublishedRevision];
    }
    if (event.eventType === "accepted" && Number.isInteger(event.publishedRevision)) {
      return event.publishedRevision > 1
        ? [event.publishedRevision - 1, event.publishedRevision]
        : [];
    }
    return [];
  }))];
  await Promise.all(revisions.map(async revision => {
    const snapshot = await contentDocuments.getPublishedAtRevision({
      kind: "puzzle",
      id: puzzleId,
      revision
    });
    if (snapshot?.document) snapshots[revision] = snapshot.document;
  }));
  return snapshots;
}

async function recordReviewDecision(contentDocuments, {
  puzzleId,
  eventType,
  document = null,
  draftRevision = null,
  basePublishedRevision = null,
  publishedRevision = null,
  sourceEventId = null
}) {
  if (typeof contentDocuments?.recordPuzzleHumanReview !== "function") {
    throw new Error("Recording a review decision requires D1 content documents.");
  }
  await contentDocuments.recordPuzzleHumanReview({
    id: puzzleId,
    eventType,
    draftRevision,
    proposal: eventType === "rejected" ? document : null,
    basePublishedRevision: eventType === "rejected" ? basePublishedRevision : null,
    publishedRevision: eventType === "accepted" ? publishedRevision : null,
    sourceEventId
  });
}

async function currentChoiceProposals(contentDocuments, record) {
  const puzzleId = puzzleIdOf(record);
  if (!puzzleId || typeof contentDocuments?.listOpenReviewProposals !== "function") return [];
  return contentDocuments.listOpenReviewProposals({ id: puzzleId });
}

async function publishedDocumentAtRevision(contentDocuments, puzzleId, revision, published) {
  if (!Number.isInteger(revision) || !puzzleId) return null;
  if (published && !published.withdrawnAt && published.revision === revision && published.document) {
    return published.document;
  }
  if (typeof contentDocuments?.getPublishedAtRevision !== "function") return null;
  const snapshot = await contentDocuments.getPublishedAtRevision({
    kind: "puzzle",
    id: puzzleId,
    revision
  });
  return snapshot?.document || null;
}

async function legacyAnchorForEvent(contentDocuments, puzzleId, event, published, workingCopy) {
  if (isReviewPatch(event?.proposal)) return workingCopy;
  const revision = event?.basePublishedRevision;
  if (!Number.isInteger(revision)) {
    return published && !published.withdrawnAt && published.document
      ? published.document
      : workingCopy;
  }
  return publishedDocumentAtRevision(contentDocuments, puzzleId, revision, published);
}

function nextFieldDocument(record, params, { categoryRegistry, settings, publishedDocument }) {
  const form = parseFieldEditForm(params);
  const edited = documentForEditor(record.document, { categoryRegistry });
  return documentForStorage(
    applyDraftFieldEdit(edited, form, { publishedDocument, settings }),
    { categoryRegistry }
  );
}

function nextWorkingCopyDocument(record, params, { categoryRegistry, settings }) {
  let document = documentForEditor(record.document, { categoryRegistry });
  for (const form of parseWorkingCopyEdits(params)) {
    document = applyDraftFieldEdit(document, {
      ...form,
      isSaveField: true,
      isRevertField: false
    }, { settings });
  }
  return documentForStorage(document, { categoryRegistry });
}

async function interruptForReviewOverlap(res, {
  draftId,
  record,
  nextDocument,
  params,
  contentDocuments
}) {
  if (params.get("acknowledge_review_overlap") === "1") return false;
  const openProposals = await currentChoiceProposals(contentDocuments, record);
  if (!openProposals.length) return false;
  const puzzleId = puzzleIdOf(record);
  const published = puzzleId
    ? await publishedRowOrNull(contentDocuments, "puzzle", puzzleId)
    : null;
  const anchors = new Map();
  for (const event of openProposals) {
    if (isReviewPatch(event?.proposal)) continue;
    const anchor = await legacyAnchorForEvent(
      contentDocuments, puzzleId, event, published, record.document
    );
    if (anchor) anchors.set(event.id, anchor);
  }
  const hits = freshProposalOverlaps(record.document, nextDocument, openProposals, event => (
    isReviewPatch(event?.proposal) ? null : anchors.get(event.id) || null
  ));
  if (!hits.length) return false;
  html(res, renderReviewOverlapPage({ draftId, hits, params }));
  return true;
}

function puzzleIdOf(record) {
  return typeof record?.document?.id === "string" ? record.document.id : record?.puzzleId || null;
}

function staleRevisionMessage(params, record) {
  const raw = params.get("expected_revision");
  if (raw == null || raw === "") return null;
  const expected = Number.parseInt(raw, 10);
  if (Number.isInteger(expected) && expected === record.revision) return null;
  return `This working copy changed (revision ${record.revision}). Reload the drafts page.`;
}

function reviewSessionOpen(record) {
  return record?.openedFromPublished === true || record?.hasReviewBaseline === true;
}

function isWorkspaceConfigError(error) {
  return error instanceof LocalD1ConfigError
    || error instanceof HttpD1Error;
}

const DRAFT_LAYOUT_ROUTE = /^\/admin\/drafts\/([^/]+)\/layout(?:\.json)?$/;
const PUBLISHED_LAYOUT_ROUTE = /^\/admin\/puzzles\/([^/]+)\/layout(?:\.json)?$/;

/**
 * Whether the authoring server should hand a request to the draft review
 * handler: the working-copy pages and routes, and layout writes addressed
 * to a published puzzle, which land on its working copy.
 */
export function isDraftReviewRequest(req) {
  const method = req.method;
  if (!["GET", "POST", "PUT", "DELETE"].includes(method)) return false;
  const urlPath = (req.url || "").split("?")[0];
  if (urlPath === "/admin/drafts" || urlPath.startsWith("/admin/drafts/")) return true;
  return (method === "PUT" || method === "DELETE") && PUBLISHED_LAYOUT_ROUTE.test(urlPath);
}

export function createLocalDraftReviewHandler({
  draftStore,
  contentService = null,
  contentDocuments = null,
  publicationActor = null,
  repositoryRoot,
  // Link check for the draft page's flags. Pass null to render offline;
  // the default keeps the page responsive on a slow network by giving up
  // after a few seconds and saying so. A store makes D1 the cache for
  // Wikipedia titles so a title checked anywhere recently is not asked
  // again. Other URLs are probed for reachability and are not stored.
  wikiLinkStore = null,
  checkWikiLinks = document => checkDocumentLinks(document, { timeoutMs: 4000, store: wikiLinkStore }),
  // Map of draft id to automatic layout pass status for the puzzle list
  // (autoLayoutWatcher.js), on the server that runs the pass; else null.
  readAutoLayoutStatuses = null,
  // The corpus list's per-row checks, kept across loads (derivedRowMemo.js).
  rowMemo = createDerivedRowMemo()
}) {
  if (!draftStore) throw new Error("draftStore is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");

  return async function handleLocalDraftReview(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    const requestUrl = new URL(req.url || "/", "http://local.invalid");
    const sameOrigin = () => isSameOriginRequest({
      origin: req.headers?.origin || req.headers?.Origin,
      referer: req.headers?.referer || req.headers?.Referer,
      host: req.headers?.host || req.headers?.Host
    });

    const documentMatch = urlPath.match(/^\/admin\/drafts\/([^/]+)\/document(?:\.json)?$/);
    if (documentMatch && (req.method === "GET")) {
      const draftId = decodeURIComponent(documentMatch[1]);
      try {
        // The registry is read alongside the working copy, not after it.
        const categoryRegistryLoad = loadMergedCategoryRegistry({
          contentDocuments,
          contentService,
          actor: publicationActor
        });
        categoryRegistryLoad.catch(() => {});
        const record = await draftStore.getDraft(draftId);
        const expectedRevision = Number.parseInt(requestUrl.searchParams.get("revision") || "", 10);
        if (Number.isInteger(expectedRevision) && expectedRevision > 0 && record.revision !== expectedRevision) {
          json(res, {
            error: "This draft has a newer revision. Reload the draft page before opening its preview.",
            expectedRevision,
            currentRevision: record.revision
          }, 409);
          return true;
        }
        json(res, {
          draftId,
          revision: record.revision,
          // Current drafts are simplified documents. Keep this response on
          // the authoring projection path; JSON-LD conversion belongs to the
          // explicit interchange tools and never happens as a draft read.
          document: documentForEditor(record.document, {
            categoryRegistry: await categoryRegistryLoad
          })
        });
      } catch (error) {
        if (!isMissingDraft(error)) throw error;
        const message = error instanceof Error ? error.message : String(error);
        json(res, { error: "Draft not found", detail: message }, 404);
      }
      return true;
    }
    if (documentMatch && (req.method === "PUT" || req.method === "POST")) {
      if (!sameOrigin()) {
        json(res, { error: "Cross-origin submit is not allowed." }, 403);
        return true;
      }
      try {
        const { json: body } = await readRequestPayload(req);
        const expectedRevision = Number(body?.expected_revision ?? body?.expectedRevision);
        if (!Number.isInteger(expectedRevision)) {
          json(res, { error: "expected_revision is required" }, 400);
          return true;
        }
        if (!body?.document || typeof body.document !== "object" || Array.isArray(body.document)) {
          json(res, { error: "document must be an object" }, 400);
          return true;
        }
        const draftId = decodeURIComponent(documentMatch[1]);
        const categoryRegistry = await loadMergedCategoryRegistry({
          contentDocuments,
          contentService,
          actor: publicationActor
        });
        const record = await draftStore.replaceDraft({
          draftId,
          document: documentForStorage(body.document, { categoryRegistry }),
          expectedRevision
        });
        json(res, {
          draftId,
          revision: record.revision,
          document: record.document
        });
      } catch (error) {
        if (error.status === 400) {
          json(res, { error: error.message }, 400);
          return true;
        }
        if (isMissingDraft(error)) {
          const message = error instanceof Error ? error.message : String(error);
          json(res, { error: "Draft not found", detail: message }, 404);
          return true;
        }
        if (isDraftConflictError(error)) {
          json(res, { error: error.message }, 409);
          return true;
        }
        throw error;
      }
      return true;
    }

    const layoutMatch = urlPath.match(DRAFT_LAYOUT_ROUTE);
    // Layouts are edited on the working copy, like every other domain, and
    // reach players when that copy is published. A layout write addressed
    // to the published puzzle lands on its working copy, opening one from
    // the published puzzle when there is none.
    const publishedLayoutMatch = req.method === "PUT" || req.method === "DELETE"
      ? urlPath.match(PUBLISHED_LAYOUT_ROUTE)
      : null;
    if (layoutMatch || publishedLayoutMatch) {
      if (!sameOrigin()) {
        json(res, { error: "Cross-origin submit is not allowed." }, 403);
        return true;
      }
      let draftId;
      let openedWorkingCopy = false;
      if (layoutMatch) {
        draftId = decodeURIComponent(layoutMatch[1]);
      } else {
        const puzzleId = decodeURIComponent(publishedLayoutMatch[1]);
        try {
          const { draft, created } = await openPuzzleWorkingCopy({
            getDraft: id => draftStore.getDraft(id),
            createDraft: ({ draftId: id, document, seededFromPublished, basePublishedRevision }) =>
              draftStore.createDraft({ draftId: id, document, seededFromPublished, basePublishedRevision }),
            contentDocuments,
            contentService,
            categoryRegistry: await loadMergedCategoryRegistry({
              contentDocuments,
              contentService,
              actor: publicationActor
            }),
            puzzleId
          });
          draftId = draft.draftId || puzzleId;
          openedWorkingCopy = created;
        } catch (error) {
          json(res, { error: formatActionError(error), id: puzzleId }, error.status || 404);
          return true;
        }
      }
      // Each write is conditional on the draft this request read. When
      // another save lands in between, re-read and rebuild from the newer
      // layout, so neither save erases the other and author-over-auto is
      // re-checked.
      let bodyPayload = null;
      for (let attempt = 0; ; attempt++) {
        try {
          const record = await draftStore.getDraft(draftId);
          // A newly opened working copy has no layout column of its own yet.
          // Treat the current published envelope as its starting snapshot so a
          // first Graph/Circle save cannot replace an existing Star override.
          // Once the draft has saved a layout, that full snapshot remains the
          // draft's authority for subsequent mode updates and clears.
          const published = await publishedRowOrNull(
            contentDocuments,
            "puzzle",
            record.document?.id
          );
          const inheritedLayout = record.layout ?? published?.layout ?? null;
          if (req.method === "GET" || req.method === "HEAD") {
            json(res, {
              draftId,
              revision: record.revision,
              layout: inheritedLayout
            });
            return true;
          }
          if (req.method !== "PUT" && req.method !== "DELETE") return false;
          if (req.method === "DELETE") {
            const mode = requestUrl.searchParams.get("mode");
            const cleared = mode
              ? await draftStore.saveLayout({
                draftId,
                expectedUpdatedAt: record.updatedAt,
                layout: layoutDocumentForMode(mode, null, inheritedLayout)
              })
              : inheritedLayout
                ? await draftStore.saveLayout({
                  draftId,
                  expectedUpdatedAt: record.updatedAt,
                  // Board settings survive clearing every mode layout.
                  layout: normalizeLayoutDocument(inheritedLayout)?.board
                    ? layoutDocumentWithBoard({}, { schemaVersion: 1, modes: {}, board: normalizeLayoutDocument(inheritedLayout).board })
                    : emptyLayoutDocument()
                })
                : await draftStore.clearLayout(draftId);
            json(res, {
              draftId,
              ...(openedWorkingCopy ? { openedWorkingCopy } : {}),
              revision: cleared.revision,
              layout: cleared.layout || null
            });
            return true;
          }
          // The body is read once; a retry rebuilds from it.
          bodyPayload ||= readRequestPayload(req);
          const { json: body } = await bodyPayload;
          // A body that is not JSON would otherwise save as no layout at all.
          if (!body || typeof body !== "object") {
            json(res, { error: "Send the layout as JSON (Content-Type: application/json).", draftId }, 400);
            return true;
          }
          const submitted = body && Object.prototype.hasOwnProperty.call(body, "layout")
            ? body.layout
            : body;
          const mode = body?.mode || requestUrl.searchParams.get("mode") || null;
          // Board settings (size, Star free-term strip) save into the layout
          // document beside the per-mode layouts; see layoutDocumentWithBoard.
          if (body && Object.prototype.hasOwnProperty.call(body, "board") && !mode) {
            const incoming = body.board && typeof body.board === "object" ? body.board : {};
            const changes = stampLayoutSaved({
              ...incoming,
              source: incoming.source === "auto" ? "auto" : "author"
            });
            const boardConflict = autoBoardConflict(changes, inheritedLayout);
            if (boardConflict) {
              json(res, { error: boardConflict, draftId }, 409);
              return true;
            }
            const boardLayout = layoutDocumentWithBoard(changes, inheritedLayout);
            const boardRegistry = await loadMergedCategoryRegistry({
              contentDocuments,
              contentService,
              actor: publicationActor
            });
            const boardValidation = validatePublishedPuzzleLayout({
              document: documentForEditor(record.document, { categoryRegistry: boardRegistry }),
              layout: boardLayout,
              categoryRegistry: boardRegistry
            });
            if (!boardValidation.valid) {
              json(res, { error: "Layout is invalid", draftId, errors: boardValidation.errors }, 400);
              return true;
            }
            const savedBoard = await draftStore.saveLayout({ draftId, layout: boardLayout, expectedUpdatedAt: record.updatedAt });
            json(res, {
              draftId,
              ...(openedWorkingCopy ? { openedWorkingCopy } : {}),
              revision: savedBoard.revision,
              layout: savedBoard.layout || boardLayout,
              warnings: boardValidation.warnings
            });
            return true;
          }
          const modePayload = mode && submitted?.modes
            ? layoutForMode(submitted, mode)
            : submitted;
          const conflict = mode
            ? autoLayoutConflict(mode, modePayload, inheritedLayout)
            : autoEnvelopeConflict(submitted, inheritedLayout);
          if (conflict) {
            json(res, { error: conflict, draftId }, 409);
            return true;
          }
          const layout = mode
            ? layoutDocumentForMode(mode, stampLayoutSaved(modePayload), inheritedLayout)
            : normalizeLayoutDocument(submitted);
          const categoryRegistry = await loadMergedCategoryRegistry({
            contentDocuments,
            contentService,
            actor: publicationActor
          });
          const { puzzle, errors } = puzzleFromAuthoredDocument(
            documentForEditor(record.document, { categoryRegistry })
          );
          if (!puzzle) {
            json(res, {
              error: "Draft puzzle document is not valid simplified content",
              draftId,
              errors
            }, 400);
            return true;
          }
          const validation = validatePublishedPuzzleLayout({
            document: documentForEditor(record.document, { categoryRegistry }),
            layout,
            categoryRegistry,
            savingMode: mode
          });
          if (!validation.valid) {
            json(res, {
              error: "Layout is invalid",
              draftId,
              errors: validation.errors
            }, 400);
            return true;
          }
          const saved = await draftStore.saveLayout({ draftId, layout, expectedUpdatedAt: record.updatedAt });
          json(res, {
            draftId,
            ...(openedWorkingCopy ? { openedWorkingCopy } : {}),
            revision: saved.revision,
            layout: saved.layout || layout,
            warnings: validation.warnings
          });
          return true;
        } catch (error) {
          if (error instanceof LayoutConflictError && attempt < 2) continue;
          if (isMissingDraft(error)) {
            json(res, { error: "Draft not found", detail: formatActionError(error) }, 404);
            return true;
          }
          json(res, { error: formatActionError(error) }, error.status || 400);
          return true;
        }
      }
    }

    if (req.method === "POST" && urlPath === "/admin/drafts") {
      if (!sameOrigin()) {
        replyCreateDraft(req, res, null, 403, {
          message: "Cross-origin submit is not allowed."
        });
        return true;
      }
      let jsonBody = null;
      try {
        const { json: body, params } = await readRequestPayload(req);
        jsonBody = body;
        const confirm = body?.confirm || params.get("confirm");
        if (confirm === OPEN_EXISTING_DRAFT_CONFIRM) {
          const id = String(body?.id ?? params.get("id") ?? "").trim();
          try {
            const { draft, created } = await openPuzzleWorkingCopy({
              getDraft: draftId => draftStore.getDraft(draftId),
              createDraft: ({ draftId, document, seededFromPublished, basePublishedRevision }) =>
                draftStore.createDraft({ draftId, document, seededFromPublished, basePublishedRevision }),
              contentDocuments,
              contentService,
              categoryRegistry: await loadMergedCategoryRegistry({
                contentDocuments,
                contentService,
                actor: publicationActor
              }),
              puzzleId: id
            });
            const draftId = draft.draftId || id;
            const location = openPuzzleWorkingCopyLocation(draftId, { variant: "local" });
            if (wantsJson(req, body)) {
              json(res, {
                draftId,
                revision: draft.revision,
                created,
                location
              }, created ? 201 : 200);
              return true;
            }
            res.writeHead(303, {
              Location: location,
              "Cache-Control": "no-store"
            });
            res.end();
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const status = error.status || 400;
            replyCreateDraft(req, res, body, status, { message });
          }
          return true;
        }
        if (confirm !== CREATE_DRAFT_CONFIRM) {
          replyCreateDraft(req, res, body, 400, {
            message: "Missing create-draft confirmation."
          });
          return true;
        }
        const id = String(body?.id ?? params.get("id") ?? "").trim();
        const title = String(body?.title ?? params.get("title") ?? "").trim();
        const category = String(body?.category ?? params.get("category") ?? "").trim();
        if (!id || slugify(id) !== id) {
          replyCreateDraft(req, res, body, 400, {
            message: "Puzzle id must be a lowercase URL-safe slug."
          });
          return true;
        }
        // Same rule create_puzzle_draft enforces over MCP: a blank skeleton
        // under a live id shadows that board rather than editing it.
        if (await puzzleIdIsLive({ contentDocuments, contentService, puzzleId: id })) {
          replyCreateDraft(req, res, body, 409, {
            message: shadowCreateRefusal(id, { seeded: SEEDED_ROUTE_ADMIN })
          });
          return true;
        }
        let skeleton;
        try {
          skeleton = createPuzzleSkeleton({ id, title, category });
        } catch (error) {
          replyCreateDraft(req, res, body, 400, { message: error.message });
          return true;
        }
        const categoryRegistry = await loadMergedCategoryRegistry({
          contentDocuments,
          contentService,
          actor: publicationActor
        });
        const record = await draftStore.createDraft({
          draftId: id,
          document: documentForStorage(skeleton, { categoryRegistry })
        });
        if (wantsJson(req, body)) {
          json(res, {
            draftId: record.draftId,
            revision: record.revision,
            location: `/?puzzle=${encodeURIComponent(record.draftId)}`
          }, 201);
          return true;
        }
        res.writeHead(303, {
          Location: `/?puzzle=${encodeURIComponent(record.draftId)}`,
          "Cache-Control": "no-store"
        });
        res.end();
      } catch (error) {
        if (error.status === 400) {
          replyCreateDraft(req, res, jsonBody, 400, { message: error.message });
          return true;
        }
        const message = error instanceof Error ? error.message : String(error);
        if (/already exists/i.test(message)) {
          replyCreateDraft(req, res, jsonBody, 409, { message });
          return true;
        }
        throw error;
      }
      return true;
    }

    const reviewIssuesMatch = urlPath.match(/^\/admin\/drafts\/([^/]+)\/review-issues$/);
    if (reviewIssuesMatch) {
      const draftId = decodeURIComponent(reviewIssuesMatch[1]);
      const reviewPath = `/admin/drafts/${encodeURIComponent(draftId)}/review-issues`;
      if (!contentDocuments) {
        html(res, "<p>D1 published documents are not configured.</p>", 503);
        return true;
      }
      try {
        let record = null;
        try {
          record = await draftStore.getDraft(draftId);
        } catch (error) {
          if (!isMissingDraft(error)) throw error;
        }
        const puzzleId = record
          ? (typeof record.document?.id === "string" ? record.document.id : record.puzzleId)
          : draftId;
        if (!puzzleId) {
          html(res, "<p>This draft has no puzzle id to review.</p>", 400);
          return true;
        }
        if (!record && req.method === "POST") {
          html(res, "<p>That working copy has been discarded. The review record is read-only.</p>", 404);
          return true;
        }
        if (req.method === "POST") {
          if (!sameOrigin()) {
            html(res, "<p>Cross-origin submit is not allowed.</p>", 403);
            return true;
          }
          const params = await readNodeUrlEncoded(req);
          if (String(params.get("confirm") || "") !== "review-issue") {
            html(res, "<p>Unknown review-issue action.</p>", 400);
            return true;
          }
          const action = String(params.get("issue_action") || "");
          const comments = String(params.get("comments") || "").trim();
          let issueId = String(params.get("issue_id") || "").trim() || null;
          if (!["open", "note", "resolve", "reopen"].includes(action) || !comments) {
            html(res, "<p>An issue action and comments are required.</p>", 400);
            return true;
          }
          if (action === "open") {
            const threads = await contentDocuments.listPuzzleReviewIssues({
              id: puzzleId,
              includeResolved: true,
              uncapped: true
            });
            issueId = nextReviewIssueId(threads);
          } else {
            const threads = await contentDocuments.listPuzzleReviewIssues({
              id: puzzleId,
              includeResolved: true,
              uncapped: true
            });
            const issue = matchReviewIssue(threads, issueId);
            if (!issue) {
              html(res, "<p>That review issue does not exist for this puzzle.</p>", 404);
              return true;
            }
            issueId = issue.issueId;
            if ((action === "note" || action === "resolve") && issue.status !== "open") {
              html(res, "<p>Reopen this issue before adding a note or resolving it.</p>", 400);
              return true;
            }
            if (action === "reopen" && issue.status !== "resolved") {
              html(res, "<p>This issue is already open; add a note instead.</p>", 400);
              return true;
            }
          }
          await contentDocuments.recordPuzzleHumanReview({
            id: puzzleId,
            comments,
            issueId,
            eventType: { open: "open", note: "note", resolve: "resolved", reopen: "reopened" }[action],
            draftRevision: record.revision
          });
          res.writeHead(303, { Location: reviewPath, "Cache-Control": "no-store" });
          res.end();
          return true;
        }
        const [issues, events, published] = await Promise.all([
          contentDocuments.listPuzzleReviewIssues({ id: puzzleId, includeResolved: true }),
          contentDocuments.listPuzzleReviewEvents({ id: puzzleId, limit: 100 }),
          contentDocuments.getPublished({ kind: "puzzle", id: puzzleId }).catch(() => null)
        ]);
        if (!record && !published && events.length === 0) {
          html(res, `<p>Draft not found: ${escapeHtml(draftId)}</p>`, 404);
          return true;
        }
        const publishedSnapshots = await publishedSnapshotsFor(contentDocuments, puzzleId, events);
        html(res, renderPuzzleReviewIssuesPage({
          draft: record || {
            draftId: puzzleId,
            title: published?.title || puzzleId,
            document: published?.document || null
          },
          issues,
          events,
          publishedSnapshots,
          chronicleOnly: !record,
          lastAgentReviewedAt: published?.lastAgentReviewedAt || null,
          lastHumanReviewedAt: published?.lastHumanReviewedAt || null
        }));
      } catch (error) {
        const message = formatActionError(error);
        html(res, `<p>${escapeHtml(message)}</p>`, isMissingDraft(error) || /not found|Unknown/i.test(message) ? 404 : 400);
      }
      return true;
    }

    if (req.method === "POST") {
      const match = urlPath.match(/^\/admin\/drafts\/([^/]+)$/);
      if (!match) return false;
      if (!sameOrigin()) {
        html(res, "<p>Cross-origin submit is not allowed.</p>", 403);
        return true;
      }
      const params = await readNodeUrlEncoded(req);
      const form = parseSubmitForm(params);
      const draftId = decodeURIComponent(match[1]);
      if (["grant-board-limit-waiver", "decline-board-limit-waiver", "revoke-board-limit-waiver"].includes(form.confirm)) {
        if (typeof publicationActor?.subject !== "string" || !publicationActor.subject.trim()) {
          html(res, "<p>An authenticated human reviewer is required for board limit waiver decisions.</p>", 403);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const expectedRevision = Number.parseInt(params.get("expected_revision"), 10);
          const note = String(params.get("decision_note") || "").trim();
          if (form.confirm === "revoke-board-limit-waiver") {
            await draftStore.revokeBoardLimitWaiver({
              draftId,
              waiverType: String(params.get("waiver_type") || ""),
              targetId: String(params.get("target_id") || ""),
              expectedRevision,
              actor: publicationActor,
              note
            });
          } else if (params.has("request_id")) {
            await draftStore.decideBoardLimitWaiver({
              draftId,
              requestId: String(params.get("request_id") || ""),
              decision: form.confirm === "grant-board-limit-waiver" ? "granted" : "declined",
              expectedRevision,
              actor: publicationActor,
              note
            });
          } else {
            await draftStore.grantBoardLimitWaiverDirect({
              draftId,
              waiverType: String(params.get("waiver_type") || ""),
              targetId: String(params.get("target_id") || ""),
              reason: String(params.get("reason") || ""),
              expectedRevision,
              actor: publicationActor
            });
          }
          res.writeHead(303, {
            Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          const status = isDraftConflictError(error) ? 409 : (error.status || 400);
          html(res, `<p>${escapeHtml(formatActionError(error))}</p>`, status);
        }
        return true;
      }
      if (form.isSaveWorkingCopy) {
        try {
          const record = await draftStore.getDraft(draftId);
          const expectedRevision = Number.parseInt(params.get("expected_revision"), 10);
          const settings = await provenanceModelSettings(contentDocuments);
          const categoryRegistry = await loadMergedCategoryRegistry({
            contentDocuments,
            contentService,
            actor: publicationActor
          });
          const nextDocument = nextWorkingCopyDocument(record, params, { categoryRegistry, settings });
          if (await interruptForReviewOverlap(res, {
            draftId,
            record,
            nextDocument,
            params,
            contentDocuments
          })) return true;
          await persistDraftWorkingCopy({
            draft: record,
            params,
            expectedRevision,
            settings,
            categoryRegistry,
            saveDraft: ({ document, expectedRevision: revision }) =>
              draftStore.replaceDraft({ draftId, document, expectedRevision: revision })
          });
          const openProposals = await currentChoiceProposals(contentDocuments, record);
          if (openProposals.length === 0 && reviewSessionOpen(record) && typeof draftStore.releaseReviewSession === "function") {
            await draftStore.releaseReviewSession(draftId);
          }
          res.writeHead(303, {
            Location: draftFieldRedirectPath(draftId),
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          if (error instanceof DraftFieldError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 400);
            return true;
          }
          throw error;
        }
        return true;
      }
      if (form.isSaveField || form.isRevertField) {
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId || null;
          const settings = await provenanceModelSettings(contentDocuments);
          const categoryRegistry = await loadMergedCategoryRegistry({
            contentDocuments,
            contentService,
            actor: publicationActor
          });
          const publishedDocument = publishedDocumentFromService(contentService, puzzleId);
          const nextDocument = nextFieldDocument(record, params, {
            categoryRegistry,
            settings,
            publishedDocument
          });
          if (await interruptForReviewOverlap(res, {
            draftId,
            record,
            nextDocument,
            params,
            contentDocuments
          })) return true;
          await persistDraftFieldEdit({
            draft: record,
            publishedDocument,
            settings,
            categoryRegistry,
            form: parseFieldEditForm(params),
            saveDraft: ({ document, expectedRevision }) =>
              draftStore.replaceDraft({ draftId, document, expectedRevision })
          });
          res.writeHead(303, {
            Location: draftFieldRedirectPath(draftId),
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          if (error instanceof DraftFieldError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 400);
            return true;
          }
          throw error;
        }
        return true;
      }
      if (form.isSaveCanonical) {
        try {
          const record = await draftStore.getDraft(draftId);
          const expectedRevision = Number.parseInt(params.get("expected_revision"), 10);
          await persistDraftCanonicalForm({
            draft: record,
            expectedRevision,
            categoryRegistry: await loadMergedCategoryRegistry({
              contentDocuments,
              contentService,
              actor: publicationActor
            }),
            saveDraft: ({ document, expectedRevision: revision }) =>
              draftStore.replaceDraft({ draftId, document, expectedRevision: revision })
          });
          res.writeHead(303, {
            Location: draftFieldRedirectPath(draftId),
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          if (error instanceof DraftFieldError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 400);
            return true;
          }
          throw error;
        }
        return true;
      }
      if (form.isRevertWorkingCopy) {
        try {
          const record = await draftStore.getDraft(draftId);
          if (typeof draftStore.popWorkingCopy !== "function") {
            html(res, "<p>Working-copy history is not available.</p>", 503);
            return true;
          }
          await draftStore.popWorkingCopy({
            draftId,
            expectedRevision: record.revision
          });
          res.writeHead(303, {
            Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          if (error instanceof DraftEmptyHistoryError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, 400);
            return true;
          }
          throw error;
        }
        return true;
      }
      if (form.isPublish || form.isPublishAndCue || form.isRevertPublished) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId;
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to publish.</p>", 400);
            return true;
          }
          if (form.isPublish || form.isPublishAndCue) {
            const openProposals = await currentChoiceProposals(contentDocuments, record);
            if (openProposals.length && params.get("acknowledge_open_proposals") !== "1") {
              html(res, renderUndecidedProposalsPage({
                draftId,
                proposals: openProposals,
                params
              }));
              return true;
            }
          }
          if (form.isRevertPublished) {
            await seedPublishedPuzzleIfAbsent(contentDocuments, contentService, puzzleId);
            const published = await contentDocuments.getPublished({
              kind: "puzzle",
              id: puzzleId
            });
            const categoryRegistry = await loadMergedCategoryRegistry({
              contentDocuments,
              contentService,
              actor: publicationActor
            });
            await draftStore.replaceDraft({
              draftId,
              document: documentForStorage(published.document, { categoryRegistry }),
              expectedRevision: record.revision
            });
            if (typeof draftStore.saveLayout === "function") {
              await draftStore.saveLayout({
                draftId,
                layout: published.layout || null
              });
            }
            res.writeHead(303, {
              Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
              "Cache-Control": "no-store"
            });
            res.end();
            return true;
          }
          const categoryRegistry = await loadMergedCategoryRegistry({
            contentDocuments,
            contentService,
            actor: publicationActor
          });
          const authoredDocument = documentForEditor(record.document, { categoryRegistry });
          if (typeof contentService?.validatePuzzleDraft === "function") {
            const validation = await contentService.validatePuzzleDraft(authoredDocument, {
              categoryRegistry
            });
            if (validation && validation.valid === false) {
              html(res, renderContentPublishResultPage({
                kind: "puzzle",
                id: puzzleId,
                error: (validation.errors || []).join("\n") || "Draft is not valid.",
                backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
              }), 400);
              return true;
            }
          }
          const publishedBefore = await publishedRowOrNull(
            contentDocuments,
            "puzzle",
            puzzleId
          );
          // An older working copy never overwrites a layout saved on the
          // published puzzle since; those modes are kept and reported.
          const { layout: publishLayout, keptPublished } = mergePublishLayout(
            record.layout,
            publishedBefore?.layout
          );
          const layoutValidation = validatePublishedPuzzleLayout({
            document: authoredDocument,
            layout: publishLayout,
            categoryRegistry
          });
          if (!layoutValidation.valid) {
            html(res, renderContentPublishResultPage({
              kind: "puzzle",
              id: puzzleId,
              error: "The saved layout must be reconfirmed after this puzzle edit.\n" +
                layoutValidation.errors.join("\n"),
              backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
            }), 400);
            return true;
          }
          const published = await contentDocuments.publish({
            kind: "puzzle",
            id: puzzleId,
            document: documentForStorage(authoredDocument, { categoryRegistry }),
            actor: publicationActor,
            layout: publishLayout,
            markRevised: form.markRevised === true
          });
          if (reviewSessionOpen(record)) {
            await recordReviewDecision(contentDocuments, {
              puzzleId,
              eventType: "accepted",
              draftRevision: record.revision,
              publishedRevision: published.revision
            });
            if (typeof draftStore.releaseReviewSession === "function") {
              await draftStore.releaseReviewSession(draftId);
            }
          }
          if (form.isPublishAndCue) {
            await contentDocuments.setFreezeCue({
              kind: "puzzle",
              id: puzzleId,
              actor: publicationActor,
              cued: true
            });
          }
          const location = form.isPublishAndCue
            ? draftListPublicationRedirectPath({
              puzzleId,
              cued: true,
              layoutKept: keptPublished,
              layoutFallback: layoutValidation.fallbackModes
            })
            : draftEditorPublicationRedirectPath({
              draftId,
              puzzleId,
              revision: published.revision,
              layoutKept: keptPublished,
              layoutFallback: layoutValidation.fallbackModes
            });
          res.writeHead(303, {
            Location: location,
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error) || error instanceof ContentDocumentNotFoundError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, 404);
            return true;
          }
          html(res, renderContentPublishResultPage({
            kind: "puzzle",
            id: draftId,
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), error.status || 400);
        }
        return true;
      }
      if (form.isUnpublish) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId;
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to unpublish.</p>", 400);
            return true;
          }
          await contentDocuments.unpublish({
            kind: "puzzle",
            id: puzzleId,
            actor: publicationActor
          });
          html(res, renderContentLifecycleResultPage({
            title: "Unpublished",
            message: `Withdrew ${puzzleId}. Public listings may remain cached for up to 30 seconds. Publish again to restore it.`,
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }));
        } catch (error) {
          if (isMissingDraft(error) || error instanceof ContentDocumentNotFoundError) {
            html(res, `<p>${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          html(res, renderContentLifecycleResultPage({
            title: "Could not unpublish",
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        return true;
      }
      if (form.isCueForFreeze || form.isHoldFromFreeze) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId;
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to mark.</p>", 400);
            return true;
          }
          await contentDocuments.setFreezeCue({
            kind: "puzzle",
            id: puzzleId,
            actor: publicationActor,
            cued: form.isCueForFreeze
          });
          const location = form.isCueForFreeze
            ? draftListPublicationRedirectPath({
              puzzleId,
              notice: "cued",
              cued: true
            })
            : draftFieldRedirectPath(draftId);
          res.writeHead(303, {
            Location: location,
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error) || error instanceof ContentDocumentNotFoundError) {
            html(res, `<p>${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          html(res, renderContentLifecycleResultPage({
            title: "Could not update freeze cue",
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        return true;
      }
      if (form.isMarkHumanReviewed) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId;
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to mark.</p>", 400);
            return true;
          }
          await contentDocuments.recordPuzzleHumanReview({
            id: puzzleId,
            comments: params.get("comments") || null
          });
          res.writeHead(303, {
            Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error) || error instanceof ContentDocumentNotFoundError) {
            html(res, `<p>${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          html(res, renderContentLifecycleResultPage({
            title: "Could not record human review",
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        return true;
      }
      if (form.isRenameDraft) {
        try {
          const { newId } = parseRenameForm(params);
          const renamed = await renamePuzzleDraftId({
            draftId,
            newId,
            getDraft: id => draftStore.getDraft(id),
            createDraft: ({ draftId: id, document }) =>
              draftStore.createDraft({ draftId: id, document }),
            deleteDraft: (id, options) => draftStore.deleteDraft(id, options),
            saveLayout: ({ draftId: id, layout }) =>
              draftStore.saveLayout({ draftId: id, layout }),
            contentDocuments,
            contentService
          });
          res.writeHead(303, {
            Location: `/admin/drafts/${encodeURIComponent(renamed.draftId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          html(res, renderContentLifecycleResultPage({
            title: "Could not rename puzzle",
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), error instanceof DraftRenameError ? error.status : 400);
        }
        return true;
      }
      if (form.isPreviewReview || form.isPublishReview || form.isKeepPublished) {
        html(res, "<p>Reload the drafts page. A proposal is accepted or rejected onto the working copy.</p>", 400);
        return true;
      }
      if (form.isAcceptReview || form.isRejectReview) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = puzzleIdOf(record);
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to review.</p>", 400);
            return true;
          }
          const stale = staleRevisionMessage(params, record);
          if (stale) {
            html(res, renderDraftFieldConflictPage({ draftId, error: stale }), 409);
            return true;
          }
          const openProposals = await currentChoiceProposals(contentDocuments, record);
          const proposalId = Number.parseInt(params.get("proposal_id") || "", 10);
          const chosen = openProposals.find(event => event.id === proposalId);
          if (!chosen?.proposal) {
            html(res, "<p>That proposal is not open.</p>", 400);
            return true;
          }
          if (form.isRejectReview) {
            await recordReviewDecision(contentDocuments, {
              puzzleId,
              eventType: "rejected",
              document: chosen.proposal,
              draftRevision: chosen.draftRevision,
              basePublishedRevision: chosen.basePublishedRevision ?? null,
              sourceEventId: chosen.id
            });
            res.writeHead(303, {
              Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
              "Cache-Control": "no-store"
            });
            res.end();
            return true;
          }
          const predecessor = openStackPredecessor(chosen, openProposals);
          if (predecessor) {
            html(res, "<p>Accept the earlier proposal this one builds on before accepting this one.</p>", 400);
            return true;
          }
          const published = await publishedRowOrNull(contentDocuments, "puzzle", puzzleId);
          const anchor = await legacyAnchorForEvent(
            contentDocuments, puzzleId, chosen, published, record.document
          );
          if (!isReviewPatch(chosen.proposal) && !anchor) {
            html(res, "<p>This proposal was filed against a published revision that is no longer available.</p>", 409);
            return true;
          }
          const changes = proposalChanges(chosen.proposal, anchor);
          const conflicts = staleReviewChanges(record.document, changes);
          if (conflicts.length && params.get("confirm_stale") !== "1") {
            html(res, renderStaleReviewPage({
              draftId,
              proposalId: chosen.id,
              expectedRevision: record.revision,
              stale: conflicts,
              pendingCount: changes.length
            }));
            return true;
          }
          const applied = applyReviewChanges(record.document, changes, { force: conflicts.length > 0 });
          if (applied.stale.length) {
            html(res, "<p>This proposal could not be applied because a field it changes is no longer on the working copy.</p>", 409);
            return true;
          }
          const categoryRegistry = await loadMergedCategoryRegistry({
            contentDocuments,
            contentService,
            actor: publicationActor
          });
          const authoredDocument = documentForEditor(applied.document, { categoryRegistry });
          if (typeof contentService?.validatePuzzleDraft === "function") {
            const validation = await contentService.validatePuzzleDraft(authoredDocument, {
              categoryRegistry
            });
            if (validation && validation.valid === false) {
              html(res, renderContentPublishResultPage({
                kind: "puzzle",
                id: puzzleId,
                error: (validation.errors || []).join("\n") || "Draft is not valid.",
                backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
              }), 400);
              return true;
            }
          }
          if (applied.applied.length) {
            await draftStore.replaceDraft({
              draftId,
              document: documentForStorage(authoredDocument, { categoryRegistry }),
              expectedRevision: record.revision
            });
          }
          await recordReviewDecision(contentDocuments, {
            puzzleId,
            eventType: "accepted",
            draftRevision: chosen.draftRevision,
            sourceEventId: chosen.id
          });
          res.writeHead(303, {
            Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
          return true;
        } catch (error) {
          if (isMissingDraft(error) || error instanceof ContentDocumentNotFoundError) {
            html(res, `<p>${escapeHtml(error.message)}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          html(res, renderContentPublishResultPage({
            kind: "puzzle",
            id: draftId,
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), error.status || 400);
        }
        return true;
      }
      if (form.isDiscardReview || form.isUndoReview) {
        if (!contentDocuments || !publicationActor) {
          html(res, "<p>D1 published documents are not configured.</p>", 503);
          return true;
        }
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId;
          if (!puzzleId) {
            html(res, "<p>This draft has no puzzle id to review.</p>", 400);
            return true;
          }
          const openProposals = await currentChoiceProposals(contentDocuments, record);
          if (openProposals.length) {
            html(res, "<p>Accept or reject the open proposals first.</p>", 400);
            return true;
          }
          if (form.isDiscardReview && record.openedFromPublished !== true) {
            html(res, "<p>Discard review is only for a working copy this review opened.</p>", 400);
            return true;
          }
          if (form.isUndoReview && record.hasReviewBaseline !== true) {
            html(res, "<p>This review has no saved baseline to restore.</p>", 400);
            return true;
          }
          const basePublishedRevision = Number.isInteger(record.reviewBasePublishedRevision)
            ? record.reviewBasePublishedRevision
            : null;
          await recordReviewDecision(contentDocuments, {
            puzzleId,
            eventType: "rejected",
            document: record.document,
            draftRevision: record.revision,
            basePublishedRevision
          });
          if (form.isDiscardReview) {
            await draftStore.deleteDraft(draftId, { expectedRevision: record.revision });
            res.writeHead(303, {
              Location: `/admin/drafts/${encodeURIComponent(draftId)}/review-issues`,
              "Cache-Control": "no-store"
            });
            res.end();
            return true;
          }
          const baseline = await draftStore.readReviewBaseline(draftId);
          if (!baseline) {
            html(res, "<p>This review has no saved baseline to restore.</p>", 400);
            return true;
          }
          await draftStore.replaceDraft({
            draftId,
            document: baseline,
            expectedRevision: record.revision
          });
          await draftStore.releaseReviewSession(draftId);
          res.writeHead(303, {
            Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          if (isDraftConflictError(error)) {
            html(res, renderDraftFieldConflictPage({
              draftId,
              error: formatActionError(error)
            }), 409);
            return true;
          }
          html(res, `<p>${escapeHtml(formatActionError(error))}</p>`, 400);
        }
        return true;
      }
      if (form.isDeleteDraft) {
        try {
          await draftStore.deleteDraft(draftId);
          html(res, renderContentLifecycleResultPage({
            title: "Working copy deleted",
            message: `Deleted draft ${draftId}.`,
            backHref: "/admin/drafts"
          }));
        } catch (error) {
          if (isMissingDraft(error)) {
            html(res, `<p>Draft not found: ${escapeHtml(formatActionError(error))}</p>`, 404);
            return true;
          }
          html(res, renderContentLifecycleResultPage({
            title: "Could not delete draft",
            error: formatActionError(error),
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        return true;
      }
      html(res, "<p>Unrecognized action.</p>", 400);
      return true;
    }
    if (req.method !== "GET") return false;
    const playMatch = urlPath.match(/^\/admin\/drafts\/([^/]+)\/play\.json$/);
    if (playMatch) {
      const draftId = decodeURIComponent(playMatch[1]);
      try {
        // Read the registry alongside the working copy, and the published
        // row as soon as the working copy names its puzzle.
        const categoryRegistryLoad = loadMergedCategoryRegistry({
          contentDocuments,
          contentService,
          actor: publicationActor
        });
        categoryRegistryLoad.catch(() => {});
        const record = await draftStore.getDraft(draftId);
        const documentPuzzleId = typeof record.document?.id === "string" ? record.document.id : null;
        const publishedLoad = documentPuzzleId
          ? publishedRowOrNull(contentDocuments, "puzzle", documentPuzzleId)
          : null;
        publishedLoad?.catch(() => {});
        const categoryRegistry = await categoryRegistryLoad;
        const { puzzle, errors } = puzzleFromAuthoredDocument(
          documentForEditor(record.document, { categoryRegistry })
        );
        if (!puzzle) {
          json(res, {
            draftId,
            error: "Puzzle document is not valid simplified content",
            errors
          }, 400);
          return true;
        }
        const published = publishedLoad && puzzle.id === documentPuzzleId
          ? await publishedLoad
          : await publishedRowOrNull(contentDocuments, "puzzle", puzzle.id);
        const layout = record.layout ?? published?.layout;
        const starLayout = layoutForMode(layout, "star");
        const playPuzzle = layout
          ? { ...puzzle, layout, ...(starLayout ? { starLayout } : {}) }
          : puzzle;
        json(res, {
          draftId,
          revision: record.revision,
          puzzle: playPuzzle
        });
      } catch (error) {
        if (!isMissingDraft(error)) throw error;
        const message = error instanceof Error ? error.message : String(error);
        json(res, { error: "Draft not found", detail: message }, 404);
      }
      return true;
    }
    if (urlPath === "/admin/drafts") {
      const timing = createServerTiming();
      const gitPuzzleIds = gitIdsFromContentService(contentService).puzzles;
      const publishedLoad = (async () => {
        let rows = contentDocuments
          ? await contentDocuments.listPublished({ kind: "puzzle", includeWithdrawn: true })
          : [];
        if (contentDocuments && contentService) {
          const seededIds = await seedPublishedPuzzles(
            contentDocuments,
            contentService,
            gitPuzzleIds,
            { existingRows: rows }
          );
          // Seeding a brand-new git puzzle is rare once a corpus is settled;
          // only pay for a second listPublished round trip when it happens.
          if (seededIds.length) {
            rows = await contentDocuments.listPublished({ kind: "puzzle", includeWithdrawn: true });
          }
        }
        return rows;
      })();
      // The three lists are independent D1 reads; read them together.
      const [publishedRows, listed, categoryRegistry, proposalPuzzleIds] = await Promise.all([
        publishedLoad,
        draftStore.listDrafts({ includeDocument: true }),
        loadMergedCategoryRegistry({
          contentDocuments,
          contentService,
          actor: publicationActor
        }),
        typeof contentDocuments?.listPuzzleIdsWithOpenReviewProposals === "function"
          ? contentDocuments.listPuzzleIdsWithOpenReviewProposals().catch(() => [])
          : []
      ]);
      timing.phase("lists");
      const withOpenProposals = new Set(proposalPuzzleIds);
      const notice = draftPublicationNoticeFromSearch(
        requestUrl.searchParams,
        publishedRows
      );
      const registryKey = registryFingerprint(categoryRegistry);
      const publishedById = new Map(publishedRows.map(row => [row.id, row]));
      const freezeAdds = freezeAddIdsFromPublishedRows(publishedRows, gitPuzzleIds);
      const drafts = await Promise.all(listed.map(async metadata => {
        const puzzleId = typeof metadata.document?.id === "string"
          ? metadata.document.id
          : metadata.puzzleId;
        const inCheckout = await puzzleInCheckout(repositoryRoot, puzzleId);
        const checkoutDocument = inCheckout
          ? await readCheckoutDocument(repositoryRoot, puzzleId)
          : null;
        const matchesCheckout = inCheckout
          ? draftMatchesCheckout(metadata.document, checkoutDocument)
          : false;
        const publishedRow = publishedById.get(puzzleId);
        // Everything below reads only these two rows and the registry, so it
        // is recomputed only when one of them changes.
        const computeChecks = () => {
          const baseline = publishedRow?.document
            ? documentForEditor(publishedRow.document, { categoryRegistry })
            : null;
          const workingDocument = metadata.document
            ? documentForEditor(metadata.document, { categoryRegistry })
            : null;
          const publishedDiff = baseline && workingDocument
            ? timing.measure("diff", () => diffPublishedDraft(baseline, workingDocument))
            : null;
          return {
            unpublishedDomains: baseline && workingDocument && !publishedRow.withdrawnAt
              ? timing.measure("compare", () => unpublishedChangeDomains(baseline, workingDocument, {
                publishedLayout: publishedRow.layout || null,
                draftLayout: metadata.layout || null
              }))
              : [],
            // Checked against the working document: an edit outdates a fixed
            // layout the working copy inherited as well as one it saved.
            workingLayoutAttention: workingDocument
              ? timing.measure("layout-check", () => layoutAttention({
                document: workingDocument,
                layout: metadata.layout ?? publishedRow?.layout ?? null,
                categoryRegistry
              }))
              : {},
            // Reuse the publication diff for shadow detection as well.
            shadowsPublished: draftShadowsPublished({
              published: baseline,
              publishedDiff
            })
          };
        };
        // Same list the puzzle page offers. An unpublished puzzle has no
        // published revision, and its proposals still count.
        const pendingReviewCount = withOpenProposals.has(puzzleId)
          ? (await currentChoiceProposals(contentDocuments, metadata).catch(() => [])).length
          : 0;
        const { unpublishedDomains, workingLayoutAttention, shadowsPublished } = registryKey
          ? rowMemo.get(JSON.stringify([
            "working-copy", metadata.draftId, puzzleId, rowMarkers(metadata),
            rowMarkers(publishedRow), registryKey
          ]), computeChecks)
          : computeChecks();
        return {
          ...mapDraftListItem(metadata, {
            inCheckout,
            matchesCheckout
          }),
          workingLayout: metadata.layout || null,
          workingLayoutAttention,
          unpublishedChanges: unpublishedDomains.length > 0,
          unpublishedChangeDomains: unpublishedDomains,
          shadowsPublished,
          pendingReviewCount,
          freezeAdd: Boolean(puzzleId && freezeAdds.has(puzzleId)),
          ...freezeFlagsFromPublished(publishedRow, gitPuzzleIds)
        };
      }));
      // Includes reading each working copy's git checkout file, as well as
      // the diff, compare and layout-check sums reported on their own.
      timing.phase("rows");
      const githubSnapshot = await loadOrHydrateGithubProductionManifest({
        repositoryRoot
      });
      timing.phase("github");
      const corpus = listPuzzleCorpusRows({
        publishedRows,
        drafts,
        contentService
      }).map(row => {
        const fromPublished = freezeFlagsFromPublished(
          publishedById.get(row.id),
          gitPuzzleIds
        );
        // The Layouts column describes the working copy when there is one.
        // Until a working copy saves a layout of its own it inherits the
        // published one, as the layout route and publishing both treat it.
        const publishedLayout = publishedById.get(row.id)?.layout || null;
        const savedLayout = row.hasWorkingCopy
          ? row.workingLayout ?? publishedLayout
          : publishedLayout;
        const publishedRow = publishedById.get(row.id);
        const checkPublishedLayout = () => timing.measure("layout-check", () => layoutAttention({
          document: documentForEditor(publishedRow.document, { categoryRegistry }),
          layout: publishedLayout,
          categoryRegistry
        }));
        const layoutAttentionByMode = row.hasWorkingCopy
          ? row.workingLayoutAttention || {}
          : publishedRow?.document && publishedLayout
            ? registryKey
              ? rowMemo.get(JSON.stringify([
                "published", row.id, rowMarkers(publishedRow), registryKey
              ]), checkPublishedLayout)
              : checkPublishedLayout()
            : {};
        return withGithubProduction({
          ...row,
          savedLayout,
          layoutAttention: layoutAttentionByMode,
          ...fromPublished,
          freezeAdd: Boolean(fromPublished.freezeAdd || (row.id && freezeAdds.has(row.id)))
        }, githubSnapshot);
      });
      if (readAutoLayoutStatuses) {
        let statuses = new Map();
        try {
          statuses = await readAutoLayoutStatuses();
        } catch {
          // The list still renders; it just has no automatic pass badges.
        }
        corpus.forEach(row => {
          const status = row.hasWorkingCopy && row.draftId ? statuses.get(row.draftId) : null;
          if (status) row.autoLayout = status;
        });
      }
      timing.phase("corpus");
      const page = renderDraftListPage(corpus, {
        variant: "local",
        githubProduction: githubSnapshot,
        notice,
        categoryRegistry
      });
      timing.phase("render");
      timing.apply(res);
      html(res, page);
      return true;
    }
    const match = urlPath.match(/^\/admin\/drafts\/([^/]+)$/);
    if (!match) return false;
    const draftId = decodeURIComponent(match[1]);
    try {
      // Every D1 read is a round trip to the database's region, so the page
      // starts each read as soon as its inputs exist instead of one after
      // another: the category registry and the working copy together, then
      // everything that needs only the working copy.
      const categoryRegistryLoad = loadMergedCategoryRegistry({
        contentDocuments,
        contentService,
        actor: publicationActor
      });
      // The working copy is read while the registry loads, but only
      // loadOrSeedPuzzleDraft awaits that read, so its own test of what
      // counts as a missing working copy (one to seed) decides as before.
      let prefetchedDraft = draftStore.getDraft(draftId);
      prefetchedDraft.catch(() => {});
      const categoryRegistry = await categoryRegistryLoad;
      const opened = await loadOrSeedPuzzleDraft({
        // The first read is the one already in flight; a retry after a
        // create race reads again.
        getDraft: id => {
          if (prefetchedDraft && id === draftId) {
            const pending = prefetchedDraft;
            prefetchedDraft = null;
            return pending;
          }
          return draftStore.getDraft(id);
        },
        createDraft: ({ draftId: id, document, seededFromPublished, basePublishedRevision }) =>
          draftStore.createDraft({ draftId: id, document, seededFromPublished, basePublishedRevision }),
        contentDocuments,
        contentService,
        categoryRegistry,
        draftId
      });
      const record = opened.draft;
      const puzzleId = typeof record.document?.id === "string"
        ? record.document.id
        : record.puzzleId || null;
      const checkoutLoad = (async () => {
        const inCheckout = await puzzleInCheckout(repositoryRoot, puzzleId);
        const checkoutDocument = inCheckout
          ? await readCheckoutDocument(repositoryRoot, puzzleId)
          : null;
        return {
          inCheckout,
          matchesCheckout: inCheckout
            ? draftMatchesCheckout(record.document, checkoutDocument)
            : false
        };
      })();
      const publishedRowLoad = publishedRowOrNull(contentDocuments, "puzzle", puzzleId);
      const draftLoad = Promise.all([checkoutLoad, publishedRowLoad])
        .then(([{ inCheckout, matchesCheckout }, publishedRow]) => mapDraftDetail(record, {
          contentService,
          contentDocuments,
          inCheckout,
          matchesCheckout,
          publishedDocument: publishedRow && !publishedRow.withdrawnAt
            ? publishedRow.document
            : null,
          publishedLayout: publishedRow && !publishedRow.withdrawnAt
            ? publishedRow.layout
            : null,
          categoryRegistry,
          checkWikiLinks
        }));
      const [
        publishedRow,
        draft,
        githubSnapshot,
        customModelSuggestions,
        reviewEvents,
        reviewIssues,
        boardLimitWaiverRequests,
        assistanceStamps,
        reviewCandidates
      ] = await Promise.all([
        publishedRowLoad,
        draftLoad,
        loadOrHydrateGithubProductionManifest({ repositoryRoot }),
        contentDocuments?.modelSuggestions
          ? contentDocuments.modelSuggestions.listForRuntime()
          : contentDocuments?.database
            ? new D1ModelSuggestionRepository(contentDocuments.database).listForRuntime()
            : null,
        puzzleId && contentDocuments?.listPuzzleReviewEvents
          ? contentDocuments.listPuzzleReviewEvents({ id: puzzleId })
          : [],
        puzzleId && contentDocuments?.listPuzzleReviewIssues
          ? contentDocuments.listPuzzleReviewIssues({ id: puzzleId, includeResolved: true })
          : [],
        draftId && typeof draftStore.listBoardLimitWaiverRequests === "function"
          ? draftStore.listBoardLimitWaiverRequests({ draftId })
          : [],
        draftId && typeof draftStore.listAssistanceStamps === "function"
          ? draftStore.listAssistanceStamps({ draftId })
          : [],
        currentChoiceProposals(contentDocuments, record)
      ]);
      // freezeAdd for this one puzzle is already fully determined by its own
      // publishedRow (see freezeFlagsFromPublished below) -- no need for a
      // separate full published_documents fetch just to check membership.
      const publishedFlags = freezeFlagsFromPublished(
        publishedRow,
        gitIdsFromContentService(contentService).puzzles
      );
      const currentPublishedRevision = publishedRow && !publishedRow.withdrawnAt
        && Number.isInteger(publishedRow.revision)
        ? publishedRow.revision
        : null;
      const reviewAnchorDocument = reviewCandidates.length && publishedRow && !publishedRow.withdrawnAt
        ? publishedRow.document || null
        : null;
      const reviewBaseSnapshots = {};
      for (const event of reviewCandidates) {
        if (isReviewPatch(event?.proposal) || !Number.isInteger(event?.basePublishedRevision)) continue;
        if (Object.hasOwn(reviewBaseSnapshots, event.basePublishedRevision)) continue;
        const snapshot = await publishedDocumentAtRevision(
          contentDocuments, puzzleId, event.basePublishedRevision, publishedRow
        );
        if (snapshot) reviewBaseSnapshots[event.basePublishedRevision] = snapshot;
      }
      html(res, renderDraftPage({
        ...draft,
        currentPublishedRevision,
        reviewCandidates,
        reviewAnchorDocument,
        reviewBaseSnapshots,
        firstPublishedAt: publishedRow && !publishedRow.withdrawnAt
          ? publishedRow.firstPublishedAt || null
          : null,
        ...publishedFlags,
        lastAgentReviewedAt: publishedRow?.lastAgentReviewedAt || null,
        lastHumanReviewedAt: publishedRow?.lastHumanReviewedAt || null,
        reviewEvents,
        reviewIssues,
        boardLimitWaiverRequests,
        assistanceStamps,
        inGithubProduction: inGithubProduction(githubSnapshot, puzzleId)
      }, {
        variant: "local",
        actor: publicationActor || null,
        customModelSuggestions,
        relatedPuzzleOptions: [...(contentService.knownPuzzleIds || [])],
        categoryRegistry,
        notice: draftPublicationNoticeFromSearch(
          requestUrl.searchParams,
          publishedRow,
          { requireRevision: true }
        )
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        isMissingDraft(error)
        || error.status === 404
        || /Unknown puzzle|not found|Unknown draft/i.test(message)
      ) {
        html(res, `<p>Draft not found: ${escapeHtml(message)}</p>`, 404);
        return true;
      }
      throw error;
    }
    return true;
  };
}

export function createDefaultLocalDraftReviewHandler({
  repositoryRoot = process.cwd(),
  draftDirectory = null,
  contentService = null,
  draftStore = null,
  env = process.env
} = {}) {
  const remnantDirectory = draftDirectory
    || (typeof env.CONCEPT_CLUSTERS_DRAFT_DIR === "string"
      && env.CONCEPT_CLUSTERS_DRAFT_DIR.trim()
      ? env.CONCEPT_CLUSTERS_DRAFT_DIR.trim()
      : null);
  const remnantStore = draftStore
    || (remnantDirectory
      ? createPuzzleDraftStore({ directory: remnantDirectory })
      : null);
  if (remnantStore) {
    return createLocalDraftReviewHandler({
      draftStore: remnantStore,
      contentService,
      repositoryRoot
    });
  }
  let workspacePromise;
  // The inner handler is built per request; the row memo outlives it.
  const rowMemo = createDerivedRowMemo();
  return async function handleDefaultLocalDraftReview(req, res) {
    if (!isDraftReviewRequest(req)) return false;
    try {
      workspacePromise ||= resolveLocalAuthoringWorkspace({ env, repositoryRoot });
      const resolved = await workspacePromise;
      const handleRequest = createLocalDraftReviewHandler({
        draftStore: resolved.draftStore,
        contentService,
        contentDocuments: resolved.contentDocuments,
        repositoryRoot,
        publicationActor: resolved.actor,
        wikiLinkStore: resolved.wikiLinkStore || null,
        rowMemo,
        readAutoLayoutStatuses: env.AUTO_LAYOUT_PASS === "1"
          ? () => readAutoLayoutStatuses({
            statePath: authoringWorkspacePaths({ repositoryRoot, env }).autoLayoutPass,
            jobs: layoutPassJobsFor(repositoryRoot),
            jobKey: draftLayoutPassKey,
            settleMs: autoLayoutSettleMs(env)
          })
          : null
      });
      return handleRequest(req, res);
    } catch (error) {
      workspacePromise = null;
      if (!isWorkspaceConfigError(error)) throw error;
      html(res, `<p>${escapeHtml(error.message)}</p>`, 503);
      return true;
    }
  };
}

export async function fetchLocalDraftReview(request, options = {}) {
  const urlPath = new URL(request.url).pathname;
  const handleRequest = options.handleRequest ||
    createDefaultLocalDraftReviewHandler(options);
  let status = 200;
  let headers = {};
  let body = "";
  const nodeHeaders = Object.fromEntries(request.headers.entries());
  const handled = await handleRequest(
    {
      method: request.method,
      url: urlPath,
      headers: nodeHeaders,
      async *[Symbol.asyncIterator]() {
        if (request.method === "GET" || request.method === "HEAD") return;
        const bytes = Buffer.from(await request.arrayBuffer());
        if (bytes.length) yield bytes;
      }
    },
    {
      writeHead(code, nextHeaders) {
        status = code;
        headers = nextHeaders || {};
      },
      end(text = "") {
        body = text;
      }
    }
  );
  if (!handled) return null;
  return new Response(body, { status, headers });
}

export default createLocalDraftReviewHandler;
