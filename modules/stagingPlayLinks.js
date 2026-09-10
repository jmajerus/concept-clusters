// LAN staging play links. Unpublished boards are played on the authoring
// checkout (`npm run dev`), not on Cloudflare. On that D1 surface,
// `?puzzle=<id>` resolves a working copy before a published board; `&play`
// changes its Construct board into a clean player preview. `/` still lands
// on last-played or a random showcase.

export const PLAY_MODES = ["graph", "star", "sets"];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function queryWithMode(params, mode) {
  if (mode) {
    if (!PLAY_MODES.includes(mode)) throw new Error(`Unknown play mode: ${mode}`);
    params.set("mode", mode);
  }
  // URLSearchParams serializes a flag as `play=`. Keep author-facing links
  // compact while retaining standard URLSearchParams parsing at the reader.
  const query = params.toString().replace(/(^|&)play=(?=&|$)/, "$1play");
  return `/?${query}`;
}

export function playQuery(puzzleId, mode = null) {
  if (!SLUG_RE.test(puzzleId)) {
    throw new Error(`Invalid puzzle id: ${puzzleId}`);
  }
  return queryWithMode(new URLSearchParams({ puzzle: puzzleId }), mode);
}

export function draftBoardQuery(draftId, mode = null, revision = null) {
  if (!SLUG_RE.test(draftId)) {
    throw new Error(`Invalid draft id: ${draftId}`);
  }
  const params = new URLSearchParams({ puzzle: draftId });
  if (Number.isInteger(revision) && revision > 0) params.set("revision", String(revision));
  return queryWithMode(params, mode);
}

export function draftPlayQuery(draftId, mode = null, revision = null) {
  if (!SLUG_RE.test(draftId)) {
    throw new Error(`Invalid draft id: ${draftId}`);
  }
  const params = new URLSearchParams({ puzzle: draftId, play: "" });
  if (Number.isInteger(revision) && revision > 0) params.set("revision", String(revision));
  return queryWithMode(params, mode);
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
