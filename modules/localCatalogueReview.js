import { RESERVED_SUBCATEGORY_IDS, slugify } from "../puzzles/categories.js";
import {
  createCatalogueSkeleton,
  prepareCatalogueDocumentForPublication
} from "./catalogueAuthorEngine.js";
import {
  catalogueAdminPath,
  catalogueAuthorQuery,
  isMetaCatalogueDocument,
  renderCatalogueListPage,
  renderCatalogueSubmitResultPage,
  renderCategoryEditPage,
  renderCategoryListPage,
  renderContentLifecycleResultPage,
  renderContentPublishResultPage,
  renderMetaCatalogueEditPage
} from "./catalogueReviewPage.js";
import {
  ContentDocumentNotFoundError
} from "./contentDocumentRepository.js";
import {
  catalogueDocumentFromRegistry,
  categoryDocumentFromRegistry,
  isReservedCatalogueId,
  seedPublishedCatalogues,
  seedPublishedCategories,
  seedPublishedPuzzles
} from "./contentDocumentSeed.js";
import { DraftNotFoundError } from "./draftRepository.js";
import {
  assertCategoryTitleChangeAllowed,
  assertCategoryUnused,
  assertSubcategoryUnused
} from "./contentDocumentCitations.js";
import { isSameOriginRequest } from "./draftReviewSubmit.js";
import { createLocalGitHubPublicationService } from "./localGitHubPublication.js";
import { LocalGitHubConfigError } from "./localGitHubConfig.js";
import { LocalD1ConfigError } from "./localD1Config.js";
import { HttpD1Error } from "./httpD1Database.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";

const CREATE_CATALOGUE_CONFIRM = "create-catalogue";
const CREATE_CATEGORY_CONFIRM = "create-category";
const SUBMIT_CONFIRM = "open-pull-request";
const PUBLISH_CONFIRM = "publish";
const REVERT_CONFIRM = "revert-published";
const UNPUBLISH_CONFIRM = "unpublish";
const DELETE_DRAFT_CONFIRM = "delete-draft";
const SAVE_CATEGORY_CONFIRM = "save-category";
const SAVE_CATALOGUE_CONFIRM = "save-catalogue";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
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

function reply(req, res, jsonBody, status, { message, payload } = {}) {
  if (wantsJson(req, jsonBody)) {
    json(res, payload || { error: message }, status);
    return;
  }
  html(res, `<p>${escapeHtml(message)}</p>`, status);
}

function isUnknownDraft(error) {
  return error instanceof DraftNotFoundError
    || String(error?.message || "").startsWith("Unknown draft:");
}

function assertPublishableTitle(document, kind) {
  const title = typeof document?.title === "string" ? document.title.trim() : "";
  if (!title) {
    throw Object.assign(new Error(`${kind} needs a title before publish.`), { status: 400 });
  }
}

function assertEditableCatalogueId(id) {
  if (!id || slugify(id) !== id) {
    throw Object.assign(new Error("Catalogue id must be a lowercase URL-safe slug."), { status: 400 });
  }
  if (isReservedCatalogueId(id)) {
    throw Object.assign(new Error("That id is reserved for a derived catalogue."), { status: 400 });
  }
}

function gitCatalogue(contentService, id) {
  const catalogues = contentService?.state?.catalogues || contentService?.catalogues || [];
  return catalogues.find(item => item.id === id) || null;
}

function gitCatalogueChoices(contentService) {
  const catalogues = contentService?.state?.catalogues || contentService?.catalogues || [];
  return catalogues
    .filter(item => item?.id && !isReservedCatalogueId(item.id))
    .map(item => ({
      id: item.id,
      title: item.title,
      kind: item.kind === "meta" ? "meta" : "leaf"
    }));
}

function mergeCatalogueChoices(gitChoices, published) {
  const byId = new Map(gitChoices.map(item => [item.id, item]));
  for (const row of published) {
    byId.set(row.id, {
      id: row.id,
      title: row.title || row.document?.title || row.id,
      kind: row.document?.kind === "meta" ? "meta" : "leaf"
    });
  }
  return [...byId.values()];
}

function entriesFromForm(params, { idKey, reasonKey, removeKey, addIdKey, addReasonKey }) {
  const remove = new Set((params.getAll(removeKey) || []).filter(Boolean));
  const ids = params.getAll(idKey) || [];
  const reasons = params.getAll(reasonKey) || [];
  const entries = [];
  ids.forEach((rawId, index) => {
    const id = String(rawId || "").trim();
    if (!id || remove.has(id)) return;
    const reason = String(reasons[index] || "").trim();
    entries.push(reason ? { id, reason } : { id });
  });
  const addId = String(params.get(addIdKey) || "").trim();
  if (addId) {
    if (entries.some(entry => entry.id === addId)) {
      throw Object.assign(new Error(`"${addId}" is already listed.`), { status: 400 });
    }
    const reason = String(params.get(addReasonKey) || "").trim();
    entries.push(reason ? { id: addId, reason } : { id: addId });
  }
  return entries;
}

function appendEntry(entries, added) {
  if (!added || typeof added !== "object") return entries;
  const id = String(added.id || "").trim();
  if (!id) return entries;
  if (entries.some(entry => entry.id === id)) {
    throw Object.assign(new Error(`"${id}" is already listed.`), { status: 400 });
  }
  const reason = typeof added.reason === "string" ? added.reason.trim() : "";
  return [...entries, reason ? { id, reason } : { id }];
}

function readBool(body, params, key, fallback) {
  if (body && Object.prototype.hasOwnProperty.call(body, key)) return Boolean(body[key]);
  if (params?.has?.(key)) {
    const value = params.get(key);
    return value === "true" || value === "on" || value === "1";
  }
  if (params?.has?.("confirm")) return false;
  return fallback;
}

function listCatalogueRows(published, working) {
  const seen = new Set();
  const rows = [];
  for (const item of published) {
    seen.add(item.id);
    const draft = working.find(row => row.id === item.id);
    rows.push({
      id: item.id,
      title: draft?.title || item.title,
      published: true,
      withdrawn: Boolean(item.withdrawnAt),
      kind: (draft?.document?.kind || item.document?.kind) === "meta" ? "meta" : "leaf",
      entryCount: draft?.document?.entries?.length ?? item.document?.entries?.length ?? 0,
      updatedAt: draft?.updatedAt || item.updatedAt || ""
    });
  }
  for (const draft of working) {
    if (seen.has(draft.id)) continue;
    rows.push({
      id: draft.id,
      title: draft.title || draft.id,
      published: false,
      kind: draft.document?.kind === "meta" ? "meta" : "leaf",
      entryCount: draft.document?.entries?.length ?? 0,
      updatedAt: draft.updatedAt || ""
    });
  }
  return rows.sort((left, right) =>
    String(right.updatedAt).localeCompare(String(left.updatedAt))
    || String(left.title).localeCompare(String(right.title))
  );
}

function subcategoryCount(record) {
  const subs = record?.document?.subcategories;
  if (!subs || typeof subs !== "object" || Array.isArray(subs)) return 0;
  return Object.keys(subs).length;
}

function readFormField(body, params, key, fallback = "") {
  if (body && Object.prototype.hasOwnProperty.call(body, key)) {
    return String(body[key] ?? "").trim();
  }
  if (params?.has?.(key)) return String(params.get(key) ?? "").trim();
  return fallback;
}

function infoTextOf(info) {
  return typeof info === "string" ? info : (info?.text || "");
}

function patchInfo(current, { text, link, extraLink }) {
  const info = {
    ...(typeof current === "object" && current && !Array.isArray(current) ? current : {})
  };
  if (text !== undefined) {
    if (text) info.text = text;
    else delete info.text;
  }
  if (link !== undefined) {
    if (link) info.link = link;
    else delete info.link;
  }
  if (extraLink !== undefined) {
    if (extraLink) info.extraLink = extraLink;
    else delete info.extraLink;
  }
  return info;
}

function editInfoFields(definition, edit) {
  const info = typeof edit?.info === "string"
    ? { text: edit.info.trim() }
    : (edit?.info && typeof edit.info === "object" ? edit.info : {});
  return patchInfo(definition?.info, {
    text: typeof info.text === "string"
      ? info.text.trim()
      : (typeof edit?.info === "string" ? edit.info.trim() : undefined),
    link: typeof info.link === "string"
      ? info.link.trim()
      : (typeof edit?.link === "string" ? edit.link.trim() : undefined),
    extraLink: typeof info.extraLink === "string"
      ? info.extraLink.trim()
      : (typeof edit?.extraLink === "string" ? edit.extraLink.trim() : undefined)
  });
}

function mergeSubcategoryEdits(currentDocument, submitted) {
  const existing = currentDocument?.subcategories;
  const next = (existing && typeof existing === "object" && !Array.isArray(existing))
    ? { ...existing }
    : {};
  if (!submitted || typeof submitted !== "object" || Array.isArray(submitted)) {
    return Object.keys(next).length ? next : undefined;
  }
  for (const [id, definition] of Object.entries(next)) {
    const edit = submitted[id];
    if (!edit || typeof edit !== "object") continue;
    const title = typeof edit.title === "string"
      ? edit.title.trim()
      : String(definition?.title || "").trim();
    if (!title) {
      throw Object.assign(new Error(`Subcategory ${id} needs a title.`), { status: 400 });
    }
    next[id] = {
      ...definition,
      title,
      info: editInfoFields(definition, edit)
    };
  }
  for (const [id, edit] of Object.entries(submitted)) {
    if (next[id] || !edit || typeof edit !== "object") continue;
    const title = typeof edit.title === "string" ? edit.title.trim() : "";
    if (!title) {
      throw Object.assign(new Error(`Subcategory ${id} needs a title.`), { status: 400 });
    }
    assertSubcategoryId(id, next);
    next[id] = {
      title,
      info: editInfoFields({}, edit)
    };
  }
  return Object.keys(next).length ? next : undefined;
}

function subcategoriesFromFormParams(currentDocument, params) {
  const existing = currentDocument?.subcategories;
  if (!existing || typeof existing !== "object") return null;
  const submitted = {};
  let found = false;
  for (const id of Object.keys(existing)) {
    const title = params.get(`subcategory.${id}.title`);
    const info = params.get(`subcategory.${id}.info`);
    const link = params.get(`subcategory.${id}.link`);
    const extraLink = params.get(`subcategory.${id}.extraLink`);
    if (title == null && info == null && link == null && extraLink == null) continue;
    found = true;
    submitted[id] = {
      ...(title != null ? { title } : {}),
      info: {
        ...(info != null ? { text: info } : {}),
        ...(link != null ? { link } : {}),
        ...(extraLink != null ? { extraLink } : {})
      }
    };
  }
  return found ? submitted : null;
}

function assertSubcategoryId(id, existing) {
  if (!id) {
    throw Object.assign(new Error("New subcategory needs an id."), { status: 400 });
  }
  if (slugify(id) !== id) {
    throw Object.assign(
      new Error(`Subcategory id must be a lowercase URL-safe slug (try "${slugify(id)}").`),
      { status: 400 }
    );
  }
  if (RESERVED_SUBCATEGORY_IDS.has(id)) {
    throw Object.assign(
      new Error(`"${id}" is reserved for a generated navigation partition.`),
      { status: 400 }
    );
  }
  if (existing?.[id]) {
    throw Object.assign(new Error(`Subcategory "${id}" already exists.`), { status: 400 });
  }
}

function newSubcategoryFromInput(body, params) {
  const source = body?.new_subcategory && typeof body.new_subcategory === "object"
    ? body.new_subcategory
    : null;
  const id = String(source?.id ?? body?.new_subcategory_id ?? params.get("new_subcategory_id") ?? "").trim();
  const title = String(source?.title ?? body?.new_subcategory_title ?? params.get("new_subcategory_title") ?? "").trim();
  const infoText = typeof source?.info === "string"
    ? source.info.trim()
    : String(source?.info?.text ?? body?.new_subcategory_info ?? params.get("new_subcategory_info") ?? "").trim();
  const link = String(
    source?.link ?? source?.info?.link ?? body?.new_subcategory_link ?? params.get("new_subcategory_link") ?? ""
  ).trim();
  const extraLink = String(
    source?.extraLink ?? source?.info?.extraLink ?? body?.new_subcategory_extra_link ?? params.get("new_subcategory_extra_link") ?? ""
  ).trim();
  if (!id && !title && !infoText && !link && !extraLink) return null;
  if (!title) {
    throw Object.assign(new Error("New subcategory needs a title."), { status: 400 });
  }
  return {
    id,
    title,
    info: patchInfo({}, { text: infoText, link, extraLink })
  };
}

function listCategoryRows(published, working) {
  const seen = new Set();
  const rows = [];
  for (const item of published) {
    seen.add(item.id);
    const draft = working.find(row => row.id === item.id);
    rows.push({
      id: item.id,
      title: draft?.title || item.title,
      published: true,
      withdrawn: Boolean(item.withdrawnAt),
      subcategoryCount: subcategoryCount(draft || item),
      updatedAt: draft?.updatedAt || item.updatedAt || ""
    });
  }
  for (const draft of working) {
    if (seen.has(draft.id)) continue;
    rows.push({
      id: draft.id,
      title: draft.title || draft.id,
      published: false,
      subcategoryCount: subcategoryCount(draft),
      updatedAt: draft.updatedAt || ""
    });
  }
  return rows.sort((left, right) => String(left.title).localeCompare(String(right.title)));
}

function gitCategoryExists(contentService, categoryId) {
  const categories = contentService?.categories || contentService?.state?.categories || {};
  return Object.entries(categories).some(([name, meta]) =>
    (meta?.slug || slugify(name)) === categoryId
  );
}

function removedSubcategoryIds(body, params) {
  const fromBody = body?.remove_subcategory;
  if (Array.isArray(fromBody)) {
    return fromBody.map(value => String(value).trim()).filter(Boolean);
  }
  if (typeof fromBody === "string" && fromBody.trim()) return [fromBody.trim()];
  return (params?.getAll?.("remove_subcategory") || []).map(value => value.trim()).filter(Boolean);
}

export function createLocalCatalogueReviewHandler({
  contentDocuments,
  actor,
  contentService = null,
  repositoryRoot,
  env = process.env,
  exportCatalogue = null
}) {
  if (!contentDocuments) throw new Error("contentDocuments is required");
  if (!actor?.subject) throw new Error("authenticated actor is required");
  if (!repositoryRoot) throw new Error("repositoryRoot is required");

  const seededKinds = new Set();
  async function ensureSeeded(kind) {
    if (seededKinds.has(kind)) return;
    if (kind === "catalogue") {
      await seedPublishedCatalogues(
        contentDocuments,
        contentService?.state?.catalogues || contentService?.catalogues || []
      );
    } else if (kind === "category") {
      await seedPublishedCategories(
        contentDocuments,
        contentService?.state?.categories || contentService?.categories || {}
      );
    }
    seededKinds.add(kind);
  }

  async function publishedCatalogue(id) {
    try {
      return await contentDocuments.getPublished({ kind: "catalogue", id });
    } catch (error) {
      if (error instanceof ContentDocumentNotFoundError) return null;
      throw error;
    }
  }

  async function publishedCategory(id) {
    try {
      return await contentDocuments.getPublished({ kind: "category", id });
    } catch (error) {
      if (error instanceof ContentDocumentNotFoundError) return null;
      throw error;
    }
  }

  async function loadOrSeedCatalogue(catalogueId) {
    assertEditableCatalogueId(catalogueId);
    try {
      return await contentDocuments.getDraft({ kind: "catalogue", id: catalogueId, actor });
    } catch (error) {
      if (!isUnknownDraft(error)) throw error;
    }
    const published = await publishedCatalogue(catalogueId);
    if (published) {
      try {
        return await contentDocuments.createDraft({
          kind: "catalogue",
          id: catalogueId,
          document: published.document,
          actor
        });
      } catch (error) {
        if (!/already exists/i.test(error.message)) throw error;
        return contentDocuments.getDraft({ kind: "catalogue", id: catalogueId, actor });
      }
    }
    const fromGit = gitCatalogue(contentService, catalogueId);
    if (!fromGit) {
      throw Object.assign(new Error(`Unknown catalogue: ${catalogueId}`), { status: 404 });
    }
    const document = catalogueDocumentFromRegistry(fromGit);
    await contentDocuments.seedPublishedIfAbsent({
      kind: "catalogue",
      id: catalogueId,
      document
    });
    return contentDocuments.createDraft({
      kind: "catalogue",
      id: catalogueId,
      document,
      actor
    });
  }

  async function loadOrSeedCategory(categoryId) {
    if (!categoryId || slugify(categoryId) !== categoryId) {
      throw Object.assign(new Error("Category id must be a lowercase URL-safe slug."), { status: 400 });
    }
    try {
      return await contentDocuments.getDraft({ kind: "category", id: categoryId, actor });
    } catch (error) {
      if (!isUnknownDraft(error)) throw error;
    }
    const published = await publishedCategory(categoryId);
    if (!published) {
      throw Object.assign(new Error(`Unknown category: ${categoryId}`), { status: 404 });
    }
    try {
      return await contentDocuments.createDraft({
        kind: "category",
        id: categoryId,
        document: published.document,
        actor
      });
    } catch (error) {
      if (!/already exists/i.test(error.message)) throw error;
      return contentDocuments.getDraft({ kind: "category", id: categoryId, actor });
    }
  }

  return async function handleLocalCatalogueReview(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    if (!urlPath.startsWith("/admin/catalogues") && !urlPath.startsWith("/admin/categories")) {
      return false;
    }
    const sameOrigin = () => isSameOriginRequest({
      origin: req.headers?.origin || req.headers?.Origin,
      referer: req.headers?.referer || req.headers?.Referer,
      host: req.headers?.host || req.headers?.Host
    });

    async function livePuzzleDocuments() {
      const ids = (contentService?.puzzles || contentService?.state?.puzzles || [])
        .map(puzzle => puzzle?.id)
        .filter(Boolean);
      await seedPublishedPuzzles(contentDocuments, contentService, ids);
      return (await contentDocuments.listPublished({ kind: "puzzle" }))
        .map(row => row.document);
    }

    if (urlPath.startsWith("/admin/catalogues")) await ensureSeeded("catalogue");
    else await ensureSeeded("category");

    if (req.method === "GET" && urlPath === "/admin/catalogues") {
      const [published, working] = await Promise.all([
        contentDocuments.listPublished({ kind: "catalogue", includeWithdrawn: true }),
        contentDocuments.listDrafts({ kind: "catalogue", actor, includeDocument: true })
      ]);
      html(res, renderCatalogueListPage(listCatalogueRows(published, working)));
      return true;
    }

    if (req.method === "GET" && urlPath === "/admin/categories") {
      const [published, working] = await Promise.all([
        contentDocuments.listPublished({ kind: "category", includeWithdrawn: true }),
        contentDocuments.listDrafts({ kind: "category", actor, includeDocument: true })
      ]);
      html(res, renderCategoryListPage(listCategoryRows(published, working)));
      return true;
    }

    if (req.method === "POST" && urlPath === "/admin/catalogues") {
      if (!sameOrigin()) {
        reply(req, res, null, 403, { message: "Cross-origin submit is not allowed." });
        return true;
      }
      let jsonBody = null;
      try {
        const { json: body, params } = await readRequestPayload(req);
        jsonBody = body;
        const confirm = body?.confirm || params.get("confirm");
        if (confirm !== CREATE_CATALOGUE_CONFIRM) {
          reply(req, res, body, 400, { message: "Missing create-catalogue confirmation." });
          return true;
        }
        const id = String(body?.id ?? params.get("id") ?? "").trim();
        const title = String(body?.title ?? params.get("title") ?? "").trim();
        const isMeta = body?.kind === "meta" || params.get("kind") === "meta";
        try {
          assertEditableCatalogueId(id);
        } catch (error) {
          reply(req, res, body, error.status || 400, { message: error.message });
          return true;
        }
        if (await publishedCatalogue(id) || gitCatalogue(contentService, id)) {
          reply(req, res, body, 409, { message: `Catalogue "${id}" already exists.` });
          return true;
        }
        const skeleton = createCatalogueSkeleton({
          id,
          title,
          kind: isMeta ? "meta" : null
        });
        const record = await contentDocuments.createDraft({
          kind: "catalogue",
          id,
          document: skeleton,
          actor
        });
        const location = isMeta ? catalogueAdminPath(record.id) : catalogueAuthorQuery(record.id);
        if (wantsJson(req, body)) {
          json(res, {
            catalogueId: record.id,
            revision: record.revision,
            location
          }, 201);
          return true;
        }
        res.writeHead(303, {
          Location: location,
          "Cache-Control": "no-store"
        });
        res.end();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/already exists/i.test(message)) {
          reply(req, res, jsonBody, 409, { message });
          return true;
        }
        if (error.status === 400) {
          reply(req, res, jsonBody, 400, { message });
          return true;
        }
        throw error;
      }
      return true;
    }

    if (req.method === "POST" && urlPath === "/admin/categories") {
      if (!sameOrigin()) {
        reply(req, res, null, 403, { message: "Cross-origin submit is not allowed." });
        return true;
      }
      let jsonBody = null;
      try {
        const { json: body, params } = await readRequestPayload(req);
        jsonBody = body;
        const confirm = body?.confirm || params.get("confirm");
        if (confirm !== CREATE_CATEGORY_CONFIRM) {
          reply(req, res, body, 400, { message: "Missing create-category confirmation." });
          return true;
        }
        const id = String(body?.id ?? params.get("id") ?? "").trim();
        const title = String(body?.title ?? params.get("title") ?? "").trim();
        const domain = String(body?.domain ?? params.get("domain") ?? "").trim();
        const infoText = String(body?.info ?? params.get("info") ?? "").trim();
        if (!id || slugify(id) !== id) {
          reply(req, res, body, 400, { message: "Category id must be a lowercase URL-safe slug." });
          return true;
        }
        if (!title) {
          reply(req, res, body, 400, { message: "Category needs a title." });
          return true;
        }
        if (await publishedCategory(id) || gitCategoryExists(contentService, id)) {
          reply(req, res, body, 409, { message: `Category "${id}" already exists.` });
          return true;
        }
        const document = categoryDocumentFromRegistry(title, {
          slug: id,
          ...(domain ? { domain } : {}),
          ...(infoText ? { info: { text: infoText } } : {})
        });
        document.id = id;
        const record = await contentDocuments.createDraft({
          kind: "category",
          id,
          document,
          actor
        });
        const location = `/admin/categories/${encodeURIComponent(record.id)}`;
        if (wantsJson(req, body)) {
          json(res, { categoryId: record.id, revision: record.revision, location }, 201);
          return true;
        }
        res.writeHead(303, {
          Location: location,
          "Cache-Control": "no-store"
        });
        res.end();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/already exists/i.test(message)) {
          reply(req, res, jsonBody, 409, { message });
          return true;
        }
        reply(req, res, jsonBody, error.status || 400, { message });
      }
      return true;
    }

    const documentMatch = urlPath.match(/^\/admin\/catalogues\/([^/]+)\/document\.json$/);
    if (req.method === "GET" && documentMatch) {
      const catalogueId = decodeURIComponent(documentMatch[1]);
      try {
        const record = await loadOrSeedCatalogue(catalogueId);
        json(res, {
          catalogueId: record.id,
          revision: record.revision,
          published: Boolean(await publishedCatalogue(catalogueId)),
          document: record.document
        });
      } catch (error) {
        const status = error.status || (isUnknownDraft(error) ? 404 : 400);
        json(res, { error: error.message }, status);
      }
      return true;
    }

    const documentWrite = urlPath.match(/^\/admin\/catalogues\/([^/]+)\/document$/);
    if ((req.method === "PUT" || req.method === "POST") && documentWrite) {
      if (!sameOrigin()) {
        json(res, { error: "Cross-origin submit is not allowed." }, 403);
        return true;
      }
      const catalogueId = decodeURIComponent(documentWrite[1]);
      try {
        const { json: body } = await readRequestPayload(req);
        const expectedRevision = body?.expected_revision;
        const document = body?.document;
        if (!document || typeof document !== "object") {
          json(res, { error: "document is required" }, 400);
          return true;
        }
        if (document.id && document.id !== catalogueId) {
          json(res, { error: "document.id must match the catalogue id" }, 400);
          return true;
        }
        await loadOrSeedCatalogue(catalogueId);
        const record = await contentDocuments.saveDraft({
          kind: "catalogue",
          id: catalogueId,
          document: { ...document, id: catalogueId },
          actor,
          expectedRevision
        });
        json(res, {
          catalogueId: record.id,
          revision: record.revision,
          document: record.document
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/revision conflict/i.test(message)) {
          json(res, { error: message }, 409);
          return true;
        }
        json(res, { error: message }, error.status || 400);
      }
      return true;
    }

    const catalogueAction = urlPath.match(/^\/admin\/catalogues\/([^/]+)$/);
    if (req.method === "GET" && catalogueAction) {
      const catalogueId = decodeURIComponent(catalogueAction[1]);
      try {
        const record = await loadOrSeedCatalogue(catalogueId);
        if (!isMetaCatalogueDocument(record.document)) {
          res.writeHead(302, {
            Location: catalogueAuthorQuery(catalogueId),
            "Cache-Control": "no-store"
          });
          res.end();
          return true;
        }
        const publishedRows = await contentDocuments.listPublished({ kind: "catalogue" });
        const choices = mergeCatalogueChoices(gitCatalogueChoices(contentService), publishedRows);
        const published = await publishedCatalogue(catalogueId);
        html(res, renderMetaCatalogueEditPage({
          id: catalogueId,
          document: record.document,
          revision: record.revision,
          published: Boolean(published),
          withdrawn: Boolean(published?.withdrawnAt),
          leafCatalogues: choices.filter(item => item.kind !== "meta"),
          relatedCatalogues: choices
        }));
      } catch (error) {
        html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 404);
      }
      return true;
    }

    if (req.method === "POST" && catalogueAction) {
      if (!sameOrigin()) {
        html(res, "<p>Cross-origin submit is not allowed.</p>", 403);
        return true;
      }
      const catalogueId = decodeURIComponent(catalogueAction[1]);
      let jsonBody = null;
      try {
        const { json: body, params } = await readRequestPayload(req);
        jsonBody = body;
        const confirm = body?.confirm || params.get("confirm");
        if (confirm === UNPUBLISH_CONFIRM) {
          const published = await contentDocuments.unpublish({
            kind: "catalogue",
            id: catalogueId,
            actor
          });
          html(res, renderContentLifecycleResultPage({
            title: "Removed from authoring play",
            message: `Withdrew ${catalogueId}. Publish again to restore it. Freeze later deletes the git files.`,
            backHref: isMetaCatalogueDocument(published.document)
              ? catalogueAdminPath(catalogueId)
              : "/admin/catalogues"
          }));
          return true;
        }
        if (confirm === DELETE_DRAFT_CONFIRM) {
          await contentDocuments.deleteDraft({ kind: "catalogue", id: catalogueId, actor });
          html(res, renderContentLifecycleResultPage({
            title: "Working copy deleted",
            message: `Deleted the working copy for ${catalogueId}.`,
            backHref: "/admin/catalogues"
          }));
          return true;
        }
        if (confirm === SAVE_CATALOGUE_CONFIRM) {
          const current = await loadOrSeedCatalogue(catalogueId);
          if (!isMetaCatalogueDocument(current.document)) {
            html(res, "<p>Leaf catalogues edit as Library cards.</p>", 400);
            return true;
          }
          const expectedRevision = Number(body?.expected_revision ?? params.get("expected_revision"));
          const title = readFormField(body, params, "title", current.document.title || "");
          const infoText = readFormField(body, params, "info", infoTextOf(current.document.info));
          const ordered = readBool(body, params, "ordered", current.document.ordered !== false);
          let entries;
          if (Array.isArray(body?.entries)) {
            entries = body.entries.map(entry => ({
              id: String(entry?.id || "").trim(),
              ...(typeof entry?.reason === "string" && entry.reason.trim()
                ? { reason: entry.reason.trim() }
                : {})
            })).filter(entry => entry.id);
          } else if (params.has("title") || params.has("entry_id") || params.has("new_entry_id")) {
            entries = entriesFromForm(params, {
              idKey: "entry_id",
              reasonKey: "entry_reason",
              removeKey: "remove_entry",
              addIdKey: "new_entry_id",
              addReasonKey: "new_entry_reason"
            });
          } else {
            entries = (current.document.entries || []).map(entry => ({ ...entry }));
          }
          entries = appendEntry(entries, body?.new_entry);
          let relatedEntries;
          if (Array.isArray(body?.relatedCatalogues?.entries)) {
            relatedEntries = body.relatedCatalogues.entries.map(entry => ({
              id: String(entry?.id || "").trim(),
              ...(typeof entry?.reason === "string" && entry.reason.trim()
                ? { reason: entry.reason.trim() }
                : {})
            })).filter(entry => entry.id);
          } else if (params.has("related_id") || params.has("new_related_id") || params.has("title")) {
            relatedEntries = entriesFromForm(params, {
              idKey: "related_id",
              reasonKey: "related_reason",
              removeKey: "remove_related",
              addIdKey: "new_related_id",
              addReasonKey: "new_related_reason"
            });
          } else {
            relatedEntries = (current.document.relatedCatalogues?.entries || [])
              .map(entry => ({ ...entry }));
          }
          relatedEntries = appendEntry(relatedEntries, body?.new_related);
          const document = {
            ...current.document,
            id: catalogueId,
            kind: "meta",
            title,
            ordered,
            info: patchInfo(current.document.info, { text: infoText }),
            entries
          };
          if (relatedEntries.length) {
            document.relatedCatalogues = { entries: relatedEntries };
          } else {
            delete document.relatedCatalogues;
          }
          const saved = await contentDocuments.saveDraft({
            kind: "catalogue",
            id: catalogueId,
            document,
            actor,
            expectedRevision
          });
          if (wantsJson(req, body)) {
            json(res, {
              catalogueId: saved.id,
              revision: saved.revision,
              document: saved.document
            }, 200);
            return true;
          }
          res.writeHead(303, {
            Location: catalogueAdminPath(catalogueId),
            "Cache-Control": "no-store"
          });
          res.end();
          return true;
        }
        if (confirm === PUBLISH_CONFIRM) {
          const record = await loadOrSeedCatalogue(catalogueId);
          assertPublishableTitle(record.document, "Catalogue");
          const published = await contentDocuments.publish({
            kind: "catalogue",
            id: catalogueId,
            document: record.document,
            actor
          });
          if (wantsJson(req, body)) {
            json(res, published, 200);
            return true;
          }
          html(res, renderContentPublishResultPage({
            kind: "catalogue",
            id: catalogueId,
            published,
            backHref: isMetaCatalogueDocument(record.document)
              ? catalogueAdminPath(catalogueId)
              : catalogueAuthorQuery(catalogueId)
          }));
          return true;
        }
        if (confirm === REVERT_CONFIRM) {
          const record = await contentDocuments.revertDraft({
            kind: "catalogue",
            id: catalogueId,
            actor
          });
          if (wantsJson(req, body)) {
            json(res, record, 200);
            return true;
          }
          res.writeHead(303, {
            Location: isMetaCatalogueDocument(record.document)
              ? catalogueAdminPath(catalogueId)
              : catalogueAuthorQuery(catalogueId),
            "Cache-Control": "no-store"
          });
          res.end();
          return true;
        }
        if (confirm !== SUBMIT_CONFIRM) {
          reply(req, res, body, 400, { message: "Missing export or publish confirmation." });
          return true;
        }
        const record = await loadOrSeedCatalogue(catalogueId);
        const document = prepareCatalogueDocumentForPublication(record.document);
        const existsOnGit = Boolean(gitCatalogue(contentService, catalogueId));
        const publication = exportCatalogue
          ? await exportCatalogue(document, { existsOnGit, actor })
          : await (async () => {
            const service = await createLocalGitHubPublicationService({
              contentService,
              repositoryRoot,
              env
            });
            return existsOnGit
              ? service.updateCatalogue(document, { actor })
              : service.createCatalogue(document, { actor });
          })();
        if (wantsJson(req, body)) {
          json(res, publication, 201);
          return true;
        }
        html(res, renderCatalogueSubmitResultPage({ catalogueId, publication }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const status = error instanceof LocalGitHubConfigError
          || error instanceof LocalD1ConfigError
          || error instanceof HttpD1Error
          ? 503
          : (error.status || 400);
        reply(req, res, jsonBody, status, { message });
      }
      return true;
    }

    const categoryPage = urlPath.match(/^\/admin\/categories\/([^/]+)$/);
    if (req.method === "GET" && categoryPage) {
      const categoryId = decodeURIComponent(categoryPage[1]);
      try {
        const record = await loadOrSeedCategory(categoryId);
        const published = await publishedCategory(categoryId);
        html(res, renderCategoryEditPage({
          id: categoryId,
          document: record.document,
          revision: record.revision,
          published: Boolean(published),
          withdrawn: Boolean(published?.withdrawnAt)
        }));
      } catch (error) {
        html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 404);
      }
      return true;
    }

    if (req.method === "POST" && categoryPage) {
      if (!sameOrigin()) {
        html(res, "<p>Cross-origin submit is not allowed.</p>", 403);
        return true;
      }
      const categoryId = decodeURIComponent(categoryPage[1]);
      try {
        const { json: body, params } = await readRequestPayload(req);
        const confirm = body?.confirm || params.get("confirm");
        if (confirm === SAVE_CATEGORY_CONFIRM) {
          const current = await loadOrSeedCategory(categoryId);
          const expectedRevision = Number(body?.expected_revision ?? params.get("expected_revision"));
          const title = readFormField(body, params, "title", current.document.title || "");
          const domain = readFormField(body, params, "domain", current.document.domain || "");
          const infoText = readFormField(body, params, "info", infoTextOf(current.document.info));
          const infoLink = readFormField(body, params, "link", current.document.info?.link || "");
          const infoExtraLink = readFormField(
            body,
            params,
            "extraLink",
            current.document.info?.extraLink || ""
          );
          const document = {
            ...current.document,
            id: categoryId,
            title,
            info: patchInfo(current.document.info, {
              text: infoText,
              link: infoLink,
              extraLink: infoExtraLink
            })
          };
          if (domain) document.domain = domain;
          else delete document.domain;
          const submittedSubcategories = body?.subcategories
            || subcategoriesFromFormParams(current.document, params);
          const merged = mergeSubcategoryEdits(current.document, submittedSubcategories);
          const added = newSubcategoryFromInput(body, params);
          const subcategories = { ...(merged || {}) };
          if (added) {
            assertSubcategoryId(added.id, subcategories);
            subcategories[added.id] = { title: added.title, info: added.info };
          }
          const removing = removedSubcategoryIds(body, params);
          const previousTitle = current.document.title || categoryId;
          const titleChanged = title.trim() !== String(previousTitle).trim();
          if (titleChanged || removing.length) {
            const puzzles = await livePuzzleDocuments();
            if (titleChanged) {
              assertCategoryTitleChangeAllowed(puzzles, {
                id: categoryId,
                previousTitle,
                nextTitle: title
              });
            }
            for (const subId of removing) {
              assertSubcategoryUnused(puzzles, previousTitle, subId);
              delete subcategories[subId];
            }
          }
          if (Object.keys(subcategories).length) document.subcategories = subcategories;
          else delete document.subcategories;
          await contentDocuments.saveDraft({
            kind: "category",
            id: categoryId,
            document,
            actor,
            expectedRevision
          });
          res.writeHead(303, {
            Location: `/admin/categories/${encodeURIComponent(categoryId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
          return true;
        }
        if (confirm === PUBLISH_CONFIRM) {
          const record = await loadOrSeedCategory(categoryId);
          assertPublishableTitle(record.document, "Category");
          const live = await publishedCategory(categoryId);
          if (live) {
            const puzzles = await livePuzzleDocuments();
            assertCategoryTitleChangeAllowed(puzzles, {
              id: categoryId,
              previousTitle: live.document.title || categoryId,
              nextTitle: record.document.title
            });
          }
          const published = await contentDocuments.publish({
            kind: "category",
            id: categoryId,
            document: record.document,
            actor
          });
          html(res, renderContentPublishResultPage({
            kind: "category",
            id: categoryId,
            published,
            backHref: `/admin/categories/${encodeURIComponent(categoryId)}`
          }));
          return true;
        }
        if (confirm === REVERT_CONFIRM) {
          await contentDocuments.revertDraft({ kind: "category", id: categoryId, actor });
          res.writeHead(303, {
            Location: `/admin/categories/${encodeURIComponent(categoryId)}`,
            "Cache-Control": "no-store"
          });
          res.end();
          return true;
        }
        if (confirm === UNPUBLISH_CONFIRM) {
          const puzzles = await livePuzzleDocuments();
          const record = await loadOrSeedCategory(categoryId);
          assertCategoryUnused(puzzles, {
            id: categoryId,
            title: record.document.title || categoryId
          });
          await contentDocuments.unpublish({ kind: "category", id: categoryId, actor });
          html(res, renderContentLifecycleResultPage({
            title: "Removed from authoring play",
            message: `Withdrew ${categoryId}. Publish again to restore it.`,
            backHref: `/admin/categories/${encodeURIComponent(categoryId)}`
          }));
          return true;
        }
        if (confirm === DELETE_DRAFT_CONFIRM) {
          await contentDocuments.deleteDraft({ kind: "category", id: categoryId, actor });
          html(res, renderContentLifecycleResultPage({
            title: "Working copy deleted",
            message: `Deleted the working copy for ${categoryId}.`,
            backHref: "/admin/categories"
          }));
          return true;
        }
        html(res, "<p>Unknown category action.</p>", 400);
      } catch (error) {
        html(res, `<p>${escapeHtml(error.message)}</p>`, error.status || 400);
      }
      return true;
    }

    return false;
  };
}

export function createDefaultLocalCatalogueReviewHandler({
  repositoryRoot = process.cwd(),
  contentService = null,
  contentDocuments = null,
  actor = null,
  env = process.env
} = {}) {
  if (contentDocuments && actor) {
    return createLocalCatalogueReviewHandler({
      contentDocuments,
      actor,
      contentService,
      repositoryRoot,
      env
    });
  }
  let workspacePromise;
  return async function handleDefaultLocalCatalogueReview(req, res) {
    const urlPath = (req.url || "").split("?")[0];
    if (!urlPath.startsWith("/admin/catalogues") && !urlPath.startsWith("/admin/categories")) {
      return false;
    }
    try {
      workspacePromise ||= resolveLocalAuthoringWorkspace({ env, repositoryRoot });
      const resolved = await workspacePromise;
      if (!resolved.contentDocuments) {
        html(res, "<p>D1 content documents are not configured.</p>", 503);
        return true;
      }
      const handleRequest = createLocalCatalogueReviewHandler({
        contentDocuments: resolved.contentDocuments,
        actor: resolved.actor,
        contentService,
        repositoryRoot,
        env
      });
      return handleRequest(req, res);
    } catch (error) {
      if (error instanceof LocalD1ConfigError || error instanceof HttpD1Error) {
        html(res, `<p>${escapeHtml(error.message)}</p>`, 503);
        return true;
      }
      throw error;
    }
  };
}

export async function fetchLocalContentAdmin(request, options) {
  const url = new URL(request.url);
  const handleRequest = createLocalCatalogueReviewHandler(options);
  let status = 200;
  let headers = {};
  let body = "";
  const nodeHeaders = Object.fromEntries(request.headers.entries());
  if (!nodeHeaders.host && !nodeHeaders.Host) {
    nodeHeaders.host = url.host;
  }
  const handled = await handleRequest(
    {
      method: request.method,
      url: `${url.pathname}${url.search}`,
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

export default createLocalCatalogueReviewHandler;
