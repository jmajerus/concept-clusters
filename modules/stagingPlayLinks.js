// LAN staging play links. Unpublished boards are played on the authoring
// checkout (`npm run dev`), not on Cloudflare. `?draft=<draftId>` overlays
// a D1 document onto the player without writing the working tree.
// `?puzzle=<id>` remains the published-corpus deep link; `/` on that
// server still lands on last-played or a random showcase.

export const PLAY_MODES = ["graph", "star", "sets"];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function queryWithMode(params, mode) {
  if (mode) {
    if (!PLAY_MODES.includes(mode)) throw new Error(`Unknown play mode: ${mode}`);
    params.set("mode", mode);
  }
  return `/?${params}`;
}

export function playQuery(puzzleId, mode = null) {
  if (!SLUG_RE.test(puzzleId)) {
    throw new Error(`Invalid puzzle id: ${puzzleId}`);
  }
  return queryWithMode(new URLSearchParams({ puzzle: puzzleId }), mode);
}

export function draftPlayQuery(draftId, mode = null) {
  if (!SLUG_RE.test(draftId)) {
    throw new Error(`Invalid draft id: ${draftId}`);
  }
  return queryWithMode(new URLSearchParams({ draft: draftId }), mode);
}

export function stagingPlayItems(puzzleId) {
  if (!SLUG_RE.test(puzzleId)) return [];
  return [
    ["Play", playQuery(puzzleId)],
    ["Graph", playQuery(puzzleId, "graph")],
    ["Star", playQuery(puzzleId, "star")],
    ["Sets", playQuery(puzzleId, "sets")]
  ];
}
