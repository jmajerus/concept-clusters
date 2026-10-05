export const PUBLIC_PLAY_INDEX_PATH = "/api/publications";
export const PUBLIC_PLAY_META_NAME = "cc-public-play-index";

export function publicPuzzleUrl(id, contentFingerprint, layoutFingerprint) {
  const version = `${contentFingerprint}.${layoutFingerprint}`;
  return `/api/puzzles/${encodeURIComponent(id)}.json?v=${encodeURIComponent(version)}`;
}
