// LAN staging play links. Unpublished boards are played on the authoring
// checkout (`npm run dev`), not on Cloudflare. On that D1 surface,
// `?puzzle=<id>` resolves a working copy before a published board; `&play`
// changes its Construct board into a clean player preview. `/` still lands
// on last-played or a random showcase.

const DIAGRAM_MODES = ["graph", "star", "sets"];
export const PLAY_MODES = [...DIAGRAM_MODES, "table"];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function queryWithMode(params, mode, allowedModes = PLAY_MODES) {
  if (mode) {
    if (!allowedModes.includes(mode)) throw new Error(`Unknown play mode: ${mode}`);
    params.set("mode", mode);
  }
  // URLSearchParams serializes a flag as `play=`. Keep author-facing links
  // compact while retaining standard URLSearchParams parsing at the reader.
  const query = params.toString()
    .replace(/(^|&)admin=(?=&|$)/, "$1admin")
    .replace(/(^|&)play=(?=&|$)/, "$1play");
  return `/?${query}`;
}

// The layout view (layout authoring and board settings) for a published
// puzzle or a working copy: `?puzzle=` resolves a working copy first, and
// the layout view always plays the board.
export function layoutQuery(puzzleId, mode = null) {
  if (!SLUG_RE.test(puzzleId)) {
    throw new Error(`Invalid puzzle id: ${puzzleId}`);
  }
  return queryWithMode(new URLSearchParams({ puzzle: puzzleId, author: "layout" }), mode);
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
  return queryWithMode(params, mode, DIAGRAM_MODES);
}

export function draftPlayQuery(draftId, mode = null, revision = null) {
  if (!SLUG_RE.test(draftId)) {
    throw new Error(`Invalid draft id: ${draftId}`);
  }
  const params = new URLSearchParams({ puzzle: draftId, play: "" });
  if (Number.isInteger(revision) && revision > 0) params.set("revision", String(revision));
  return queryWithMode(params, mode);
}

// Preview one filed proposal. The working copy stays as it is; play.json
// composes the proposal for that request only.
// The page URL's proposal value, forwarded unchanged to play.json. An empty
// or malformed value has to reach the server so that request 404s; a URL
// with no proposal parameter plays the working copy.
export function proposalPlaySearch(search) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  if (!params.has("proposal")) return "";
  return `?proposal=${encodeURIComponent(params.get("proposal") ?? "")}`;
}

export function draftProposalPlayQuery(draftId, proposalId) {
  if (!SLUG_RE.test(draftId)) {
    throw new Error(`Invalid draft id: ${draftId}`);
  }
  const id = Number(proposalId);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error(`Invalid proposal id: ${proposalId}`);
  }
  return queryWithMode(new URLSearchParams({
    puzzle: draftId,
    play: "",
    proposal: String(id)
  }));
}

export function stagingPlayItems(puzzleId) {
  if (!SLUG_RE.test(puzzleId)) return [];
  return [
    ["Play", playQuery(puzzleId)],
    ["Graph", playQuery(puzzleId, "graph")],
    ["Star", playQuery(puzzleId, "star")],
    ["Sets", playQuery(puzzleId, "sets")],
    ["Table", playQuery(puzzleId, "table")]
  ];
}
