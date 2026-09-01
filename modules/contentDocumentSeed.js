import { slugify } from "../puzzles/categories.js";
import { LEVEL_CATALOGUE_ID_PREFIX } from "./catalogueRegistry.js";
import { ContentDocumentNotFoundError } from "./contentDocumentRepository.js";
import { DraftNotFoundError } from "./draftRepository.js";

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

export async function upsertCatalogueDraft(repository, { document, actor }) {
  const id = document.id;
  try {
    const current = await repository.getDraft({ kind: "catalogue", id, actor });
    if (!current) throw new DraftNotFoundError(id);
    return repository.saveDraft({
      kind: "catalogue",
      id,
      document,
      actor,
      expectedRevision: current.revision
    });
  } catch (error) {
    if (!(error instanceof DraftNotFoundError)) throw error;
  }
  try {
    return await repository.createDraft({ kind: "catalogue", id, document, actor });
  } catch (error) {
    if (!/already exists/i.test(error?.message || "")) throw error;
    const current = await repository.getDraft({ kind: "catalogue", id, actor });
    return repository.saveDraft({
      kind: "catalogue",
      id,
      document,
      actor,
      expectedRevision: current.revision
    });
  }
}
