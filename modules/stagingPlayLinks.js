// LAN staging play links. Unpublished boards are played on the authoring
// checkout (`npm run dev`), not on Cloudflare. `?puzzle=<id>` is the
// existing player deep link; `/` on that server still lands on last-played
// or a random showcase.

export const PLAY_MODES = ["graph", "star", "sets"];

const PUZZLE_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function playQuery(puzzleId, mode = null) {
  if (!PUZZLE_ID_RE.test(puzzleId)) {
    throw new Error(`Invalid puzzle id: ${puzzleId}`);
  }
  const query = new URLSearchParams({ puzzle: puzzleId });
  if (mode) {
    if (!PLAY_MODES.includes(mode)) throw new Error(`Unknown play mode: ${mode}`);
    query.set("mode", mode);
  }
  return `/?${query}`;
}

export function stagingPlayItems(puzzleId) {
  if (!PUZZLE_ID_RE.test(puzzleId)) return [];
  return [
    ["Play", playQuery(puzzleId)],
    ["Graph", playQuery(puzzleId, "graph")],
    ["Star", playQuery(puzzleId, "star")],
    ["Sets", playQuery(puzzleId, "sets")]
  ];
}
