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
// Status on this local page is the publish path: working copy → authoring
// play (held / cued / new on next freeze) → GitHub production. D1
// `submitted` is leftover PR-ledger state and is not shown. GitHub
// production membership comes from the Freeze snapshot: origin’s
// puzzles/manifest.js joined with that freeze’s puzzle add/update, minus
// remove, assuming the freeze merges.

import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { slugify } from "../puzzles/categories.js";
import { DraftEmptyHistoryError, DraftNotFoundError } from "./draftRepository.js";
import { renderDraftListPage, renderDraftPage, renderPuzzleReviewIssuesPage } from "./draftReviewPage.js";
import { D1ModelSuggestionRepository } from "./d1ModelSuggestionRepository.js";
import { LocalD1ConfigError } from "./localD1Config.js";
import { HttpD1Error } from "./httpD1Database.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import { createPuzzleDraftStore } from "./puzzleDraftStore.js";
import { documentForEditor, withStorageCanonicalizeFlags } from "./authoredPuzzleDocument.js";
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
  diffPublishedDraft,
  publishedDocumentFromService,
  valuesEqual
} from "./draftReviewDiff.js";
import {
  DraftFieldError,
  draftFieldRedirectPath,
  isDraftConflictError,
  parseFieldEditForm,
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
import { renderContentLifecycleResultPage, renderContentPublishResultPage } from "./catalogueReviewPage.js";
import { ContentDocumentNotFoundError, publishedRowOrNull } from "./contentDocumentRepository.js";
import { loadMergedCategoryRegistry } from "./authoringMcpTaxonomy.js";
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
  return valuesEqual(
    documentForEditor(puzzleToSimplified(puzzle)),
    documentForEditor(checkoutDocument)
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
  inCheckout = false,
  matchesCheckout = null,
  publishedDocument = null,
  categoryRegistry = undefined
}) {
  const puzzleId = typeof record.document?.id === "string"
    ? record.document.id
    : record.puzzleId || null;
  const gitPublished = publishedDocumentFromService(contentService, puzzleId);
  const baseline = publishedDocument
    ? documentForEditor(publishedDocument, { categoryRegistry })
    : gitPublished;
  const document = documentForEditor(record.document, { categoryRegistry });
  return {
    ...mapDraftListItem({ ...record, puzzleId }, {
      inCheckout,
      matchesCheckout
    }),
    puzzleId,
    title: record.document?.title || record.title || null,
    document,
    alreadyPublished: inCheckout || publishedInContentService(contentService, puzzleId),
    publishedDiff: baseline ? diffPublishedDraft(baseline, document) : null,
    validation: contentService
      ? await withUserOnlyFlags(
        contentService,
        record.document,
        withStorageCanonicalizeFlags(
          record.document,
          await contentService.validatePuzzleDraft(record.document, { categoryRegistry }),
          { categoryRegistry }
        )
      )
      : null
  };
}

// User-only flags (e.g. bridge-term-role) are merged in here, for this
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

function isWorkspaceConfigError(error) {
  return error instanceof LocalD1ConfigError
    || error instanceof HttpD1Error;
}

export function createLocalDraftReviewHandler({
  draftStore,
  contentService = null,
  contentDocuments = null,
  publicationActor = null,
  repositoryRoot
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
          // Legacy drafts may have been stored as JSON-LD before the
          // simplified-only draft contract was enforced. The editor and
          // preview both consume simplified documents, so apply the shared
          // read compatibility conversion without mutating stored history.
          document: documentForEditor(record.document)
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
        const record = await draftStore.replaceDraft({
          draftId,
          document: body.document,
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
              createDraft: ({ draftId, document }) =>
                draftStore.createDraft({ draftId, document }),
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
        let skeleton;
        try {
          skeleton = createPuzzleSkeleton({ id, title, category });
        } catch (error) {
          replyCreateDraft(req, res, body, 400, { message: error.message });
          return true;
        }
        const record = await draftStore.createDraft({ draftId: id, document: skeleton });
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
        const record = await draftStore.getDraft(draftId);
        const puzzleId = typeof record.document?.id === "string" ? record.document.id : record.puzzleId;
        if (!puzzleId) {
          html(res, "<p>This draft has no puzzle id to review.</p>", 400);
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
            issueId = `issue-${crypto.randomUUID()}`;
          } else {
            const issue = issueId ? await contentDocuments.getPuzzleReviewIssue({ id: puzzleId, issueId }) : null;
            if (!issue) {
              html(res, "<p>That review issue does not exist for this puzzle.</p>", 404);
              return true;
            }
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
          contentDocuments.listPuzzleReviewEvents({ id: puzzleId }),
          contentDocuments.getPublished({ kind: "puzzle", id: puzzleId }).catch(() => null)
        ]);
        html(res, renderPuzzleReviewIssuesPage({
          draft: record,
          issues,
          events,
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
      if (form.isSaveWorkingCopy) {
        try {
          const record = await draftStore.getDraft(draftId);
          const expectedRevision = Number.parseInt(params.get("expected_revision"), 10);
          await persistDraftWorkingCopy({
            draft: record,
            params,
            expectedRevision,
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
      if (form.isSaveField || form.isRevertField) {
        try {
          const record = await draftStore.getDraft(draftId);
          const puzzleId = typeof record.document?.id === "string"
            ? record.document.id
            : record.puzzleId || null;
          await persistDraftFieldEdit({
            draft: record,
            publishedDocument: publishedDocumentFromService(contentService, puzzleId),
            categoryRegistry: await loadMergedCategoryRegistry({
              contentDocuments,
              contentService,
              actor: publicationActor
            }),
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
          if (form.isRevertPublished) {
            await seedPublishedPuzzleIfAbsent(contentDocuments, contentService, puzzleId);
            const published = await contentDocuments.getPublished({
              kind: "puzzle",
              id: puzzleId
            });
            await draftStore.replaceDraft({
              draftId,
              document: published.document,
              expectedRevision: record.revision
            });
            res.writeHead(303, {
              Location: `/admin/drafts/${encodeURIComponent(draftId)}`,
              "Cache-Control": "no-store"
            });
            res.end();
            return true;
          }
          if (typeof contentService?.validatePuzzleDraft === "function") {
            const categoryRegistry = await loadMergedCategoryRegistry({
              contentDocuments,
              contentService,
              actor: publicationActor
            });
            const validation = await contentService.validatePuzzleDraft(record.document, {
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
          const published = await contentDocuments.publish({
            kind: "puzzle",
            id: puzzleId,
            document: record.document,
            actor: publicationActor
          });
          if (form.isPublishAndCue) {
            await contentDocuments.setFreezeCue({
              kind: "puzzle",
              id: puzzleId,
              actor: publicationActor,
              cued: true
            });
          }
          html(res, renderContentPublishResultPage({
            kind: "puzzle",
            id: puzzleId,
            published,
            cued: form.isPublishAndCue,
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }));
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
          }), 400);
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
            title: "Removed from authoring play",
            message: `Withdrew ${puzzleId}. Publish again to restore it.`,
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
        const record = await draftStore.getDraft(draftId);
        const { puzzle, errors } = puzzleFromAuthoredDocument(
          documentForEditor(record.document)
        );
        if (!puzzle) {
          json(res, {
            draftId,
            error: "Puzzle document is not valid simplified content",
            errors
          }, 400);
          return true;
        }
        json(res, {
          draftId,
          revision: record.revision,
          puzzle
        });
      } catch (error) {
        if (!isMissingDraft(error)) throw error;
        const message = error instanceof Error ? error.message : String(error);
        json(res, { error: "Draft not found", detail: message }, 404);
      }
      return true;
    }
    if (urlPath === "/admin/drafts") {
      const gitPuzzleIds = gitIdsFromContentService(contentService).puzzles;
      let publishedRows = contentDocuments
        ? await contentDocuments.listPublished({ kind: "puzzle", includeWithdrawn: true })
        : [];
      if (contentDocuments && contentService) {
        const seededIds = await seedPublishedPuzzles(
          contentDocuments,
          contentService,
          gitPuzzleIds,
          { existingRows: publishedRows }
        );
        // Seeding a brand-new git puzzle is rare once a corpus is settled;
        // only pay for a second listPublished round trip when it happens.
        if (seededIds.length) {
          publishedRows = await contentDocuments.listPublished({ kind: "puzzle", includeWithdrawn: true });
        }
      }
      const listed = await draftStore.listDrafts({ includeDocument: true });
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
        return {
          ...mapDraftListItem(metadata, {
            inCheckout,
            matchesCheckout
          }),
          freezeAdd: Boolean(puzzleId && freezeAdds.has(puzzleId)),
          ...freezeFlagsFromPublished(publishedById.get(puzzleId), gitPuzzleIds)
        };
      }));
      const githubSnapshot = await loadOrHydrateGithubProductionManifest({
        repositoryRoot
      });
      const corpus = listPuzzleCorpusRows({
        publishedRows,
        drafts,
        contentService
      }).map(row => {
        const fromPublished = freezeFlagsFromPublished(
          publishedById.get(row.id),
          gitPuzzleIds
        );
        return withGithubProduction({
          ...row,
          ...fromPublished,
          freezeAdd: Boolean(fromPublished.freezeAdd || (row.id && freezeAdds.has(row.id)))
        }, githubSnapshot);
      });
      html(res, renderDraftListPage(corpus, {
        variant: "local",
        githubProduction: githubSnapshot
      }));
      return true;
    }
    const match = urlPath.match(/^\/admin\/drafts\/([^/]+)$/);
    if (!match) return false;
    const draftId = decodeURIComponent(match[1]);
    try {
      const opened = await loadOrSeedPuzzleDraft({
        getDraft: id => draftStore.getDraft(id),
        createDraft: ({ draftId: id, document }) =>
          draftStore.createDraft({ draftId: id, document }),
        contentDocuments,
        contentService,
        draftId
      });
      const record = opened.draft;
      const puzzleId = typeof record.document?.id === "string"
        ? record.document.id
        : record.puzzleId || null;
      const inCheckout = await puzzleInCheckout(repositoryRoot, puzzleId);
      const checkoutDocument = inCheckout
        ? await readCheckoutDocument(repositoryRoot, puzzleId)
        : null;
      const matchesCheckout = inCheckout
        ? draftMatchesCheckout(record.document, checkoutDocument)
        : false;
      const publishedRow = await publishedRowOrNull(contentDocuments, "puzzle", puzzleId);
      const categoryRegistry = await loadMergedCategoryRegistry({
        contentDocuments,
        contentService,
        actor: publicationActor
      });
      const draft = await mapDraftDetail(record, {
        contentService,
        inCheckout,
        matchesCheckout,
        publishedDocument: publishedRow && !publishedRow.withdrawnAt
          ? publishedRow.document
          : null,
        categoryRegistry
      });
      const githubSnapshot = await loadOrHydrateGithubProductionManifest({
        repositoryRoot
      });
      // freezeAdd for this one puzzle is already fully determined by its own
      // publishedRow (see freezeFlagsFromPublished below) -- no need for a
      // separate full published_documents fetch just to check membership.
      const publishedFlags = freezeFlagsFromPublished(
        publishedRow,
        gitIdsFromContentService(contentService).puzzles
      );
      const customModelSuggestions = contentDocuments?.database
        ? await new D1ModelSuggestionRepository(contentDocuments.database).list()
        : [];
      const reviewEvents = puzzleId && contentDocuments?.listPuzzleReviewEvents
        ? await contentDocuments.listPuzzleReviewEvents({ id: puzzleId })
        : [];
      const reviewIssues = puzzleId && contentDocuments?.listPuzzleReviewIssues
        ? await contentDocuments.listPuzzleReviewIssues({ id: puzzleId, includeResolved: true })
        : [];
      html(res, renderDraftPage({
        ...draft,
        ...publishedFlags,
        lastAgentReviewedAt: publishedRow?.lastAgentReviewedAt || null,
        lastHumanReviewedAt: publishedRow?.lastHumanReviewedAt || null,
        reviewEvents,
        reviewIssues,
        inGithubProduction: inGithubProduction(githubSnapshot, puzzleId)
      }, {
        variant: "local",
        actor: publicationActor || null,
        customModelSuggestions,
        relatedPuzzleOptions: [...(contentService.knownPuzzleIds || [])],
        categoryRegistry
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
  return async function handleDefaultLocalDraftReview(req, res) {
    if (req.method !== "GET" && req.method !== "POST" && req.method !== "PUT") return false;
    const urlPath = (req.url || "").split("?")[0];
    if (urlPath !== "/admin/drafts" && !urlPath.startsWith("/admin/drafts/")) {
      return false;
    }
    try {
      workspacePromise ||= resolveLocalAuthoringWorkspace({ env, repositoryRoot });
      const resolved = await workspacePromise;
      const handleRequest = createLocalDraftReviewHandler({
        draftStore: resolved.draftStore,
        contentService,
        contentDocuments: resolved.contentDocuments,
        repositoryRoot,
        publicationActor: resolved.actor
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
