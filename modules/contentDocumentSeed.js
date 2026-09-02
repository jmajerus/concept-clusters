import { slugify } from "../puzzles/categories.js";
import { LEVEL_CATALOGUE_ID_PREFIX } from "./catalogueRegistry.js";
import { ContentDocumentNotFoundError } from "./contentDocumentRepository.js";
import { DraftNotFoundError } from "./draftRepository.js";

export const OPEN_EXISTING_DRAFT_CONFIRM = "open-existing-draft";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function isReservedCatalogueId(id) {
  return id === "all" || id === "new" || String(id).startsWith(LEVEL_CATALOGUE_ID_PREFIX);
}

export function catalogueDocumentFromRegistry(catalogue) {
  return {
    id: catalogue.id,
    title: catalogue.title,
    ...(catalogue.kind === "meta" ? { kind: "meta" } : {}),
    ...(catalogue.showInLibrary === true ? { showInLibrary: true } : {}),
    ...(catalogue.info ? { info: clone(catalogue.info) } : { info: { text: "" } }),
    ordered: catalogue.ordered !== false,
    entries: (catalogue.entries || []).map(entry => ({ ...entry })),
    ...(catalogue.relatedCatalogues
      ? { relatedCatalogues: clone(catalogue.relatedCatalogues) }
      : {})
  };
}

export function categoryDocumentFromRegistry(name, meta = {}) {
  return {
    id: meta.slug || slugify(name),
    title: name,
    ...(meta.domain ? { domain: meta.domain } : {}),
    ...(meta.info ? { info: clone(meta.info) } : {}),
    ...(meta.subcategories ? { subcategories: clone(meta.subcategories) } : {})
  };
}

async function seedMissingPublished(repository, kind, candidates) {
  if (!candidates.length) return;
  const existing = new Set(
    (await repository.listPublished({ kind, includeWithdrawn: true }))
      .map(row => row.id)
  );
  const missing = [];
  const seen = new Set(existing);
  for (const item of candidates) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    missing.push(item);
  }
  if (!missing.length) return;
  if (typeof repository.seedPublishedManyIfAbsent === "function") {
    await repository.seedPublishedManyIfAbsent(missing);
    return;
  }
  for (const item of missing) {
    await repository.seedPublishedIfAbsent(item);
  }
}

export async function seedPublishedCatalogues(repository, catalogues = []) {
  const candidates = [];
  for (const catalogue of catalogues) {
    if (!catalogue?.id || isReservedCatalogueId(catalogue.id)) continue;
    candidates.push({
      kind: "catalogue",
      id: catalogue.id,
      document: catalogueDocumentFromRegistry(catalogue)
    });
  }
  await seedMissingPublished(repository, "catalogue", candidates);
}

export async function seedPublishedCategories(repository, categories = {}) {
  const candidates = Object.entries(categories).map(([name, meta]) => {
    const document = categoryDocumentFromRegistry(name, meta || {});
    return { kind: "category", id: document.id, document };
  });
  await seedMissingPublished(repository, "category", candidates);
}

export async function seedPublishedPuzzles(repository, contentService, puzzleIds = []) {
  if (!contentService) return;
  const candidates = [];
  const seen = new Set();
  for (const puzzleId of puzzleIds) {
    if (!puzzleId || seen.has(puzzleId)) continue;
    seen.add(puzzleId);
    let document;
    try {
      document = typeof contentService.getPuzzleDocumentForPublication === "function"
        ? await contentService.getPuzzleDocumentForPublication(puzzleId)
        : contentService.getPuzzleDocument(puzzleId);
    } catch {
      continue;
    }
    if (!document?.id) continue;
    candidates.push({ kind: "puzzle", id: document.id, document });
  }
  await seedMissingPublished(repository, "puzzle", candidates);
}

export async function seedPublishedPuzzleIfAbsent(
  repository,
  contentService,
  puzzleId
) {
  if (!puzzleId || !contentService?.getPuzzleDocument) return null;
  try {
    return await repository.getPublished({ kind: "puzzle", id: puzzleId });
  } catch (error) {
    if (!(error instanceof ContentDocumentNotFoundError)) throw error;
  }
  let document;
  try {
    document = await contentService.getPuzzleDocument(puzzleId);
  } catch {
    return null;
  }
  if (!document) return null;
  return repository.seedPublishedIfAbsent({
    kind: "puzzle",
    id: puzzleId,
    document
  });
}

function isMissingPuzzleDraftError(error) {
  if (error instanceof DraftNotFoundError) return true;
  const message = error?.message || "";
  return /Unknown draft:|not found/i.test(message);
}

function puzzlesFromService(contentService) {
  if (typeof contentService?.listPuzzles === "function") {
    return contentService.listPuzzles();
  }
  return contentService?.puzzles || contentService?.state?.puzzles || [];
}

export function assertPuzzleDraftId(puzzleId) {
  const id = String(puzzleId || "").trim();
  if (!id || slugify(id) !== id) {
    throw Object.assign(new Error("Puzzle id must be a lowercase URL-safe slug."), {
      status: 400
    });
  }
  return id;
}

function puzzleIdOfDraft(draft) {
  return draft?.document?.id || draft?.puzzleId || draft?.draftId || draft?.id || "";
}

function extraDraftFields(draft) {
  const skip = new Set([
    "id", "title", "category", "document", "puzzleId", "draftId"
  ]);
  const extra = {};
  for (const [key, value] of Object.entries(draft || {})) {
    if (skip.has(key) || value === undefined) continue;
    extra[key] = value;
  }
  return extra;
}

/**
 * One row per puzzle id: git seed ∪ published D1 ∪ owner working copies.
 * A working copy overlays the published/git row (title, category, status).
 * A second working copy of the same puzzle id keeps its own row keyed by
 * draft id so historical `energy-flow-review` drafts stay reachable.
 *
 * @param {{
 *   publishedRows?: object[],
 *   drafts?: object[],
 *   gitPuzzles?: object[],
 *   contentService?: object | null
 * }} [options]
 */
export function listPuzzleCorpusRows({
  publishedRows = [],
  drafts = [],
  gitPuzzles = [],
  contentService = null
} = {}) {
  const byId = new Map();

  function upsert(id, patch) {
    if (!id) return null;
    const current = byId.get(id) || {
      id,
      title: id,
      category: "",
      hasWorkingCopy: false,
      published: false,
      withdrawn: false,
      inGit: false,
      draftId: null,
      status: "",
      updatedAt: ""
    };
    if (patch.title && (patch.title !== id || current.title === current.id)) {
      current.title = patch.title;
    }
    if (patch.category) current.category = patch.category;
    if (patch.hasWorkingCopy) current.hasWorkingCopy = true;
    if (patch.published) current.published = true;
    if (patch.withdrawn) current.withdrawn = true;
    if (patch.inGit) current.inGit = true;
    if (patch.draftId) current.draftId = patch.draftId;
    if (patch.status) current.status = patch.status;
    if (patch.updatedAt) current.updatedAt = patch.updatedAt;
    Object.assign(current, patch, {
      id,
      title: current.title,
      category: current.category,
      hasWorkingCopy: current.hasWorkingCopy,
      published: current.published,
      withdrawn: current.withdrawn,
      inGit: current.inGit,
      draftId: current.draftId,
      status: current.status,
      updatedAt: current.updatedAt
    });
    byId.set(id, current);
    return current;
  }

  for (const puzzle of (gitPuzzles.length ? gitPuzzles : puzzlesFromService(contentService))) {
    upsert(puzzle.id, {
      title: puzzle.title || puzzle.id,
      category: puzzle.category || "",
      inGit: true
    });
  }

  for (const row of publishedRows) {
    const document = row.document || {};
    upsert(row.id, {
      title: document.title || row.title || row.id,
      category: document.category || "",
      published: !row.withdrawnAt,
      withdrawn: Boolean(row.withdrawnAt),
      updatedAt: row.updatedAt || ""
    });
  }

  for (const draft of drafts) {
    const puzzleId = puzzleIdOfDraft(draft);
    const draftId = draft.draftId || puzzleId;
    const title = draft.title || draft.document?.title || puzzleId;
    const category = draft.document?.category || "";
    const existing = byId.get(puzzleId);
    const extras = extraDraftFields(draft);
    if (existing?.hasWorkingCopy && existing.draftId && existing.draftId !== draftId) {
      if (draftId === puzzleId) continue;
      upsert(draftId, {
        ...extras,
        title,
        category: category || existing.category,
        hasWorkingCopy: true,
        draftId,
        published: false,
        status: draft.status || "",
        updatedAt: draft.updatedAt || ""
      });
      continue;
    }
    upsert(puzzleId, {
      ...extras,
      title,
      category: category || existing?.category || "",
      hasWorkingCopy: true,
      draftId,
      status: draft.status || "",
      updatedAt: draft.updatedAt || existing?.updatedAt || ""
    });
  }

  return [...byId.values()];
}

/**
 * @param {{ contentService?: object | null, publishedRows?: object[] }} [options]
 * @returns {{ id: string, title: string }[]}
 */
export function existingPuzzleOptions({ contentService = null, publishedRows = [] } = {}) {
  const byId = new Map();
  function add(id, title, { prefer = false } = {}) {
    if (!id) return;
    const label = typeof title === "string" && title.trim() ? title.trim() : id;
    const current = byId.get(id);
    if (!current) {
      byId.set(id, { id, title: label });
      return;
    }
    if (prefer && label !== id) current.title = label;
    else if (current.title === current.id && label !== id) current.title = label;
  }
  for (const puzzle of puzzlesFromService(contentService)) {
    add(puzzle.id, puzzle.title);
  }
  for (const row of publishedRows) {
    add(row.id, row.document?.title || row.title, { prefer: true });
  }
  return [...byId.values()].sort((a, b) =>
    String(a.title).localeCompare(String(b.title)) || a.id.localeCompare(b.id)
  );
}

/**
 * @param {string} puzzleId
 * @param {{ variant?: string }} [options]
 */
export function openPuzzleWorkingCopyLocation(puzzleId, { variant = "hosted" } = {}) {
  const encoded = encodeURIComponent(puzzleId);
  return variant === "local" ? `/?draft=${encoded}` : `/admin/drafts/${encoded}`;
}

/**
 * @param {{
 *   contentDocuments?: object | null,
 *   contentService?: object | null,
 *   puzzleId: string
 * }} args
 */
export async function resolvePuzzleDocumentForDraft({
  contentDocuments = null,
  contentService = null,
  puzzleId
}) {
  if (contentDocuments) {
    const seeded = await seedPublishedPuzzleIfAbsent(
      contentDocuments,
      contentService,
      puzzleId
    );
    if (seeded?.document) return clone(seeded.document);
  }
  if (!contentService?.getPuzzleDocument) return null;
  try {
    const document = await contentService.getPuzzleDocument(puzzleId);
    return document ? clone(document) : null;
  } catch {
    return null;
  }
}

/**
 * @param {{
 *   getDraft: (id: string) => Promise<object>,
 *   createDraft: (args: { draftId: string, document: object }) => Promise<object>,
 *   contentDocuments?: object | null,
 *   contentService?: object | null,
 *   puzzleId: string
 * }} args
 * @returns {Promise<{ draft: { draftId?: string, document?: { id?: string } }, created: boolean }>}
 */
/**
 * GET `/admin/drafts/<id>`: return the working copy, creating one from the
 * published (or git-seeded) snapshot when the id exists in authoring play.
 */
export async function loadOrSeedPuzzleDraft({
  getDraft,
  createDraft,
  contentDocuments = null,
  contentService = null,
  draftId,
  puzzleId
}) {
  return openPuzzleWorkingCopy({
    getDraft,
    createDraft,
    contentDocuments,
    contentService,
    puzzleId: draftId || puzzleId
  });
}

export async function openPuzzleWorkingCopy({
  getDraft,
  createDraft,
  contentDocuments = null,
  contentService = null,
  puzzleId
}) {
  if (typeof getDraft !== "function" || typeof createDraft !== "function") {
    throw new Error("getDraft and createDraft are required");
  }
  const id = assertPuzzleDraftId(puzzleId);
  try {
    const existing = await getDraft(id);
    if (existing) return { draft: existing, created: false };
  } catch (error) {
    if (!isMissingPuzzleDraftError(error)) throw error;
  }
  const document = await resolvePuzzleDocumentForDraft({
    contentDocuments,
    contentService,
    puzzleId: id
  });
  if (!document) {
    throw Object.assign(new Error(`Unknown puzzle: ${id}`), { status: 404 });
  }
  try {
    const draft = await createDraft({ draftId: id, document });
    return { draft, created: true };
  } catch (error) {
    if (!/already exists/i.test(error?.message || "")) throw error;
    const draft = await getDraft(id);
    return { draft, created: false };
  }
}

async function upsertContentDraft(repository, { kind, document, actor }) {
  const id = document.id;
  try {
    const current = await repository.getDraft({ kind, id, actor });
    if (!current) throw new DraftNotFoundError(id);
    return repository.saveDraft({
      kind,
      id,
      document,
      actor,
      expectedRevision: current.revision
    });
  } catch (error) {
    if (!(error instanceof DraftNotFoundError)) throw error;
  }
  try {
    return await repository.createDraft({ kind, id, document, actor });
  } catch (error) {
    if (!/already exists/i.test(error?.message || "")) throw error;
    const current = await repository.getDraft({ kind, id, actor });
    return repository.saveDraft({
      kind,
      id,
      document,
      actor,
      expectedRevision: current.revision
    });
  }
}

export async function upsertCatalogueDraft(repository, { document, actor }) {
  return upsertContentDraft(repository, { kind: "catalogue", document, actor });
}

export async function upsertCategoryDraft(repository, { document, actor }) {
  return upsertContentDraft(repository, { kind: "category", document, actor });
}
