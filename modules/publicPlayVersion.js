import { nonCryptographicHash } from "./nonCryptographicHash.js";
import { layoutDocumentForMode } from "./layoutDocument.js";

// `large` is a legacy display hint. The Library derives it from the board,
// and publication removes it, so it must not make an otherwise identical
// frozen board miss the static path.
export function puzzleContentFingerprint(puzzle) {
  const { layout, starLayout, large, dateCreated, dateModified, ...content } = puzzle;
  return nonCryptographicHash(content);
}

export function puzzleLayoutFingerprint(layout = null, starLayout = null) {
  const document = layout || (starLayout
    ? layoutDocumentForMode("star", starLayout)
    : null);
  return nonCryptographicHash(document);
}
