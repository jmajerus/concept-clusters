// Shared draft-document policy for local and hosted authoring MCP.
// Leftover link/extraLink/seeAlso fold into `links` when a document
// enters a draft, and again when a stored draft is loaded for authoring,
// so MCP tools and the copy editor always see the current schema.
// Storage is not rewritten on read. JSON-LD is interchange-only and is
// never what gets persisted.
import { createPuzzleSkeleton } from "./puzzleSkeleton.js";
import {
  isJsonLdShaped,
  puzzleFromAuthoredDocument
} from "./simplifiedPuzzleSchema.js";
import { canonicalizeDocumentInfoLinks, hoistDocumentCitations } from "./termInfo.js";

export { createPuzzleSkeleton };

// Shape/cardinality gate only. Incomplete-but-simplified documents stay
// writable (`document: null` plus errors); JSON-LD is the same shape so a
// caller that falls back to `normalization.document ?? document` still
// needs documentForDraftStore to avoid persisting `@context`.
export function normalizeAuthoredDocument(document) {
  const { puzzle, errors } = puzzleFromAuthoredDocument(document);
  return { document: puzzle ? document : null, errors };
}

export function documentForEditor(document) {
  return hoistDocumentCitations(canonicalizeDocumentInfoLinks(document));
}

export function draftForAuthoring(draft) {
  if (!draft || typeof draft !== "object") return draft;
  return { ...draft, document: documentForEditor(draft.document) };
}

export const SAVE_TO_CANONICALIZE_FLAG_ID = "save-to-canonicalize";

const SAVE_TO_CANONICALIZE_FLAG = Object.freeze({
  id: SAVE_TO_CANONICALIZE_FLAG_ID,
  message:
    "This stored draft still uses leftover link or citation fields. Save it to persist the current schema (`links`, puzzle-level citations). The folded form is already what authoring tools show; storage does not change until you save."
});

export function storedDocumentNeedsCanonicalSave(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return false;
  }
  try {
    return JSON.stringify(documentForEditor(document)) !== JSON.stringify(document);
  } catch {
    return false;
  }
}

export function withStorageCanonicalizeFlags(storedDocument, validation) {
  const flags = Array.isArray(validation?.flags) ? [...validation.flags] : [];
  if (storedDocumentNeedsCanonicalSave(storedDocument)) {
    flags.push({ ...SAVE_TO_CANONICALIZE_FLAG });
  }
  return { ...validation, flags };
}

export function documentForDraftStore(supplied, createSkeleton) {
  if (!supplied) {
    return { document: createSkeleton(), normalization: null };
  }
  const normalization = normalizeAuthoredDocument(supplied);
  if (isJsonLdShaped(supplied)) {
    return { document: null, normalization };
  }
  return {
    document: documentForEditor(normalization.document ?? supplied),
    normalization
  };
}
