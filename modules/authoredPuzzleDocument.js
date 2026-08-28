// Shared draft-document policy for local and hosted authoring MCP.
// Leftover link/extraLink/seeAlso fold into `links` when a document
// enters a draft, and again when a stored draft is loaded for authoring,
// so MCP tools and the copy editor always see the current schema.
// Provenance folds generativeAssistance into the two-axis record, drops the
// legacy block when provenance is present, and may fill/normalize a parseable
// lesson byline from L1. Lesson Markdown that used the two-character sequence
// \n instead of real line breaks is decoded the same way. Storage is not
// rewritten on read. JSON-LD is interchange-only and is never what gets persisted.
import { createPuzzleSkeleton } from "./puzzleSkeleton.js";
import {
  isJsonLdShaped,
  puzzleFromAuthoredDocument
} from "./simplifiedPuzzleSchema.js";
import { withDecodedLearningMarkdown } from "./learningIntroduction.js";
import { canonicalizeDocumentProvenance } from "./authoringProvenance.js";
import { canonicalizeDocumentInfoLinks, hoistDocumentCitations } from "./termInfo.js";

export { createPuzzleSkeleton };

// Link/citation folding + provenance sync. Order: provenance first so a
// parseable credit can seed human contributors before other folds clone.
export function canonicalizeAuthoredDocumentFields(document) {
  return hoistDocumentCitations(
    canonicalizeDocumentInfoLinks(
      canonicalizeDocumentProvenance(document)
    )
  );
}

// Shape/cardinality gate only. Incomplete-but-simplified documents stay
// writable (`document: null` plus errors); JSON-LD is the same shape so a
// caller that falls back to `normalization.document ?? document` still
// needs documentForDraftStore to avoid persisting `@context`.
export function normalizeAuthoredDocument(document) {
  const { puzzle, errors } = puzzleFromAuthoredDocument(document);
  return { document: puzzle ? document : null, errors };
}

export function documentForEditor(document) {
  return withDecodedLearningMarkdown(
    canonicalizeAuthoredDocumentFields(document)
  );
}

export function draftForAuthoring(draft) {
  if (!draft || typeof draft !== "object") return draft;
  return { ...draft, document: documentForEditor(draft.document) };
}

export const SAVE_TO_CANONICALIZE_FLAG_ID = "save-to-canonicalize";

const SAVE_TO_CANONICALIZE_FLAG = Object.freeze({
  id: SAVE_TO_CANONICALIZE_FLAG_ID,
  message:
    "This stored draft still uses leftover link, citation, or provenance fields. Save it to persist the current schema (`links`, puzzle-level citations only, two-axis provenance). The folded form is already what authoring tools show; storage does not change until you save."
});

function withStableProvenanceKeyOrder(document) {
  const provenance = document?.provenance;
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    return document;
  }
  const { collaboration, contributors } = provenance;
  return {
    ...document,
    provenance: {
      ...(collaboration !== undefined ? { collaboration } : {}),
      ...(contributors !== undefined ? { contributors } : {})
    }
  };
}

export function storedDocumentNeedsCanonicalSave(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return false;
  }
  try {
    // Field folding only. Lesson Markdown newline decoding is a separate
    // ingest repair and must not raise this flag. Provenance key order alone
    // (collaboration before contributors) is not a storage mismatch.
    const folded = canonicalizeAuthoredDocumentFields(document);
    return JSON.stringify(folded) !== JSON.stringify(withStableProvenanceKeyOrder(document));
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
