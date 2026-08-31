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
    ...(catalogue.info ? { info: clone(catalogue.info) } : { info: { text: "" } }),
    ordered: catalogue.ordered !== false,
    entries: (catalogue.entries || []).map(entry => ({ ...entry }))
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

export async function seedPublishedCatalogues(repository, catalogues = []) {
  for (const catalogue of catalogues) {
    if (!catalogue?.id || isReservedCatalogueId(catalogue.id)) continue;
    if (catalogue.kind === "meta") continue;
    await repository.seedPublishedIfAbsent({
      kind: "catalogue",
      id: catalogue.id,
      document: catalogueDocumentFromRegistry(catalogue)
    });
  }
}

export async function seedPublishedCategories(repository, categories = {}) {
  for (const [name, meta] of Object.entries(categories)) {
    const document = categoryDocumentFromRegistry(name, meta || {});
    await repository.seedPublishedIfAbsent({
      kind: "category",
      id: document.id,
      document
    });
  }
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
