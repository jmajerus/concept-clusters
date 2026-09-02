import { slugify } from "../puzzles/categories.js";
import { categorySummaries, categorySummary } from "./categoryDiscovery.js";
import {
  validateCatalogueCreation,
  validateCatalogueUpdate,
  validateMetaCatalogueUpdate
} from "./catalogueValidation.js";
import { validateCategoryDocument } from "./categoryValidation.js";
import {
  catalogueDocumentFromRegistry,
  categoryDocumentFromRegistry
} from "./contentDocumentSeed.js";
import {
  draftRowOrNull,
  publishedRowOrNull
} from "./contentDocumentRepository.js";
import { gitPuzzlesFromService } from "./authoringPuzzleSearch.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

async function listRows(contentDocuments, method, args) {
  if (typeof contentDocuments?.[method] !== "function") return [];
  const rows = await contentDocuments[method](args);
  return Array.isArray(rows) ? rows : [];
}

export function gitCataloguesFromService(contentService = null) {
  if (Array.isArray(contentService?.catalogues)) return contentService.catalogues;
  if (Array.isArray(contentService?.state?.catalogues)) {
    return contentService.state.catalogues;
  }
  return [];
}

export function gitCategoriesFromService(contentService = null) {
  if (contentService?.categories && typeof contentService.categories === "object") {
    return contentService.categories;
  }
  if (contentService?.state?.categories && typeof contentService.state.categories === "object") {
    return contentService.state.categories;
  }
  return {};
}

export function catalogueInputDocument(document) {
  if (!document || typeof document !== "object") return document;
  const entries = Array.isArray(document.entries)
    ? document.entries.map(entry => {
        const item = { id: entry.id };
        if (entry.reason) item.reason = entry.reason;
        return item;
      })
    : [];
  const input = {
    id: document.id,
    title: document.title,
    ...(document.info ? { info: clone(document.info) } : {}),
    entries
  };
  if (document.kind !== "meta") return input;
  return {
    ...input,
    kind: "meta",
    ...(document.showInLibrary === true ? { showInLibrary: true } : {}),
    ordered: document.ordered !== false,
    ...(document.relatedCatalogues
      ? { relatedCatalogues: clone(document.relatedCatalogues) }
      : {})
  };
}

export function catalogueDocumentOf(catalogue) {
  if (!catalogue || typeof catalogue !== "object") return null;
  if (Array.isArray(catalogue.entries) || catalogue.kind || catalogue.info) {
    return catalogueDocumentFromRegistry(catalogue);
  }
  return clone(catalogue);
}

export function categoryRegistryEntryFromDocument(document) {
  if (!document?.title) return null;
  return {
    slug: document.id,
    ...(document.domain ? { domain: document.domain } : {}),
    ...(document.info ? { info: clone(document.info) } : {}),
    ...(document.subcategories ? { subcategories: clone(document.subcategories) } : {})
  };
}

export function mergeCategoryRegistry(gitCategories = {}, categoryRows = []) {
  const registry = { ...gitCategories };
  for (const row of categoryRows) {
    const document = row?.document;
    const entry = categoryRegistryEntryFromDocument(document);
    if (!document?.title || !entry) continue;
    registry[document.title] = entry;
  }
  return registry;
}

export function existingCategoryRecords(gitCategories = {}, categoryRows = []) {
  const byId = new Map();
  for (const [name, meta] of Object.entries(gitCategories)) {
    const id = meta?.slug || slugify(name);
    byId.set(id, { id, title: name });
  }
  for (const row of categoryRows) {
    const document = row?.document;
    if (!document?.id || !document?.title) continue;
    byId.set(document.id, { id: document.id, title: document.title });
  }
  return [...byId.values()];
}

export function mergeCatalogueDocuments({
  gitCatalogues = [],
  publishedRows = [],
  drafts = []
} = {}) {
  const byId = new Map();
  for (const catalogue of gitCatalogues) {
    const document = catalogueDocumentOf(catalogue);
    if (!document?.id) continue;
    byId.set(document.id, { source: "git", document });
  }
  for (const row of publishedRows) {
    if (!row?.id || row.withdrawnAt || !row.document) continue;
    byId.set(row.id, {
      source: "published",
      document: clone(row.document),
      revision: row.revision
    });
  }
  for (const row of drafts) {
    if (!row?.id || !row.document) continue;
    byId.set(row.id, {
      source: "draft",
      document: clone(row.document),
      revision: row.revision
    });
  }
  return [...byId.values()];
}

export function catalogueSummaryOf({ source, document, revision = null }) {
  const entries = Array.isArray(document?.entries) ? document.entries : [];
  return {
    id: document.id,
    title: document.title,
    ...(document.info ? { info: clone(document.info) } : {}),
    entryCount: entries.length,
    puzzleCount: entries.length,
    ...(document.kind === "meta" ? { kind: "meta" } : {}),
    source,
    ...(revision != null ? { revision } : {})
  };
}

export async function loadTaxonomyRows(contentDocuments, actor) {
  const [
    publishedCatalogues,
    catalogueDrafts,
    publishedCategories,
    categoryDrafts,
    publishedPuzzles
  ] = await Promise.all([
    listRows(contentDocuments, "listPublished", {
      kind: "catalogue",
      includeWithdrawn: true
    }),
    listRows(contentDocuments, "listDrafts", {
      kind: "catalogue",
      actor,
      includeDocument: true
    }),
    listRows(contentDocuments, "listPublished", {
      kind: "category",
      includeWithdrawn: true
    }),
    listRows(contentDocuments, "listDrafts", {
      kind: "category",
      actor,
      includeDocument: true
    }),
    listRows(contentDocuments, "listPublished", { kind: "puzzle" })
  ]);
  return {
    publishedCatalogues,
    catalogueDrafts,
    publishedCategories: publishedCategories.filter(row => !row.withdrawnAt),
    categoryDrafts,
    publishedPuzzles
  };
}

export function knownPuzzleIds({ gitPuzzles = [], publishedPuzzles = [] } = {}) {
  const ids = new Set();
  for (const puzzle of gitPuzzles) {
    if (puzzle?.id) ids.add(puzzle.id);
  }
  for (const row of publishedPuzzles) {
    const id = row?.id || row?.document?.id;
    if (id) ids.add(id);
  }
  return ids;
}

export function cataloguesForValidation(merged) {
  return merged.map(item => item.document);
}

export async function loadCatalogueDocument({
  contentDocuments,
  contentService,
  actor,
  catalogueId
}) {
  const draft = await draftRowOrNull(contentDocuments, "catalogue", catalogueId, actor);
  if (draft?.document) {
    return { source: "draft", document: clone(draft.document), revision: draft.revision };
  }
  const published = await publishedRowOrNull(contentDocuments, "catalogue", catalogueId);
  if (published?.document && !published.withdrawnAt) {
    return {
      source: "published",
      document: clone(published.document),
      revision: published.revision
    };
  }
  if (typeof contentService?.getCatalogueDocument === "function") {
    return {
      source: "git",
      document: await contentService.getCatalogueDocument(catalogueId)
    };
  }
  const git = gitCataloguesFromService(contentService).find(item => item.id === catalogueId);
  if (!git) throw new Error(`Unknown catalogue: ${catalogueId}`);
  return { source: "git", document: catalogueDocumentOf(git) };
}

export function listMergedCatalogues({
  contentService,
  publishedCatalogues = [],
  catalogueDrafts = []
} = {}) {
  return mergeCatalogueDocuments({
    gitCatalogues: gitCataloguesFromService(contentService),
    publishedRows: publishedCatalogues,
    drafts: catalogueDrafts
  });
}

export function listMergedCategoryRegistry({
  contentService,
  publishedCategories = [],
  categoryDrafts = []
} = {}) {
  return mergeCategoryRegistry(
    gitCategoriesFromService(contentService),
    [...publishedCategories, ...categoryDrafts]
  );
}

export function listMergedCategoryRecords({
  contentService,
  publishedCategories = [],
  categoryDrafts = []
} = {}) {
  return existingCategoryRecords(
    gitCategoriesFromService(contentService),
    [...publishedCategories, ...categoryDrafts]
  );
}

export function listCategorySummaries({
  contentService,
  puzzles,
  publishedCategories = [],
  categoryDrafts = []
} = {}) {
  const registry = listMergedCategoryRegistry({
    contentService,
    publishedCategories,
    categoryDrafts
  });
  return categorySummaries(puzzles, registry);
}

export function getMergedCategory({
  contentService,
  puzzles,
  name,
  publishedCategories = [],
  categoryDrafts = []
} = {}) {
  const registry = listMergedCategoryRegistry({
    contentService,
    publishedCategories,
    categoryDrafts
  });
  const resolved = resolveCategoryName(registry, name);
  if (!resolved) {
    return categorySummary(puzzles, registry, name);
  }
  return categorySummary(puzzles, registry, resolved);
}

export function categoryInputDocument({
  name,
  contentService,
  publishedCategories = [],
  categoryDrafts = []
} = {}) {
  const registry = listMergedCategoryRegistry({
    contentService,
    publishedCategories,
    categoryDrafts
  });
  const title = resolveCategoryName(registry, name);
  if (!title) return null;
  const slug = registry[title]?.slug || slugify(title);
  const draft = categoryDrafts.find(row =>
    row.id === slug || row.document?.title === title
  );
  if (draft?.document) return categoryMcpDocument(draft.document);
  const published = publishedCategories.find(row =>
    row.id === slug || row.document?.title === title
  );
  if (published?.document) return categoryMcpDocument(published.document);
  return categoryMcpDocument(categoryDocumentFromRegistry(title, registry[title]));
}

function categoryMcpDocument(document) {
  return {
    id: document.id,
    title: document.title,
    ...(document.domain ? { domain: document.domain } : {}),
    ...(document.info ? { info: clone(document.info) } : {}),
    ...(document.subcategories ? { subcategories: clone(document.subcategories) } : {})
  };
}

export function resolveCategoryName(registry, name) {
  if (registry[name]) return name;
  const needle = slugify(name);
  for (const [title, meta] of Object.entries(registry)) {
    if ((meta?.slug || slugify(title)) === needle) return title;
  }
  return null;
}

export function previewCatalogueWrite(document, {
  mode,
  puzzleIds,
  catalogues
}) {
  const validation = mode === "create"
    ? validateCatalogueCreation(document, { puzzleIds, catalogues })
    : mode === "meta-update"
      ? validateMetaCatalogueUpdate(document, { catalogues })
      : validateCatalogueUpdate(document, { puzzleIds, catalogues });
  return {
    valid: validation.valid,
    errors: validation.errors,
    preview: validation.valid
      ? {
          catalogueId: validation.catalogue.id,
          action: mode === "create" ? "create" : "update",
          document: validation.catalogue
        }
      : null
  };
}

export function previewCategoryWrite(document, { mode, existing }) {
  const validation = validateCategoryDocument(document, { existing, mode });
  return {
    valid: validation.valid,
    errors: validation.errors,
    preview: validation.valid
      ? {
          categoryId: validation.document.id,
          action: mode === "create" ? "create" : "update",
          document: validation.document
        }
      : null
  };
}
