// Shared draft-document policy for local and hosted authoring MCP.
// Storage echoes the simplified document unchanged. JSON-LD is
// interchange-only and is never what gets persisted.
import { createPuzzleSkeleton } from "./puzzleSkeleton.js";
import {
  isJsonLdShaped,
  puzzleFromAuthoredDocument
} from "./simplifiedPuzzleSchema.js";

export { createPuzzleSkeleton };

// Shape/cardinality gate only. Incomplete-but-simplified documents stay
// writable (`document: null` plus errors); JSON-LD is the same shape so a
// caller that falls back to `normalization.document ?? document` still
// needs documentForDraftStore to avoid persisting `@context`.
export function normalizeAuthoredDocument(document) {
  const { puzzle, errors } = puzzleFromAuthoredDocument(document);
  return { document: puzzle ? document : null, errors };
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
    document: normalization.document ?? supplied,
    normalization
  };
}
