// Browser client for D1-backed authored layout overrides.
// A layout request carries one mode payload; the server merges it into the
// puzzle's existing mode-neutral envelope so saving Graph cannot erase Star.

import { layoutDocumentForMode, layoutForMode } from "./layoutDocument.js";

async function responseBody(response) {
  return response.json().catch(() => ({}));
}

function layoutPath({ puzzleId, draftId = null, mode = null }) {
  const path = draftId
    ? `/admin/drafts/${encodeURIComponent(draftId)}/layout.json`
    : `/admin/puzzles/${encodeURIComponent(puzzleId)}/layout.json`;
  return mode ? `${path}?mode=${encodeURIComponent(mode)}` : path;
}

export async function saveLayout({
  puzzleId,
  draftId = null,
  mode = "star",
  layout,
  fetchImpl = fetch
}) {
  const response = await fetchImpl(
    layoutPath({ puzzleId, draftId, mode }),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ mode, layout })
    }
  );
  const body = await responseBody(response);
  if (!response.ok) {
    throw new Error(body.error || body.detail || `Layout save failed (${response.status})`);
  }
  return body.layout || layoutDocumentForMode(mode, layout);
}

// Board settings (size, Star free-term strip) save into the same layout
// document. `null` for a key is an explicit "use the default".
export async function saveLayoutBoard({
  puzzleId,
  draftId = null,
  board,
  fetchImpl = fetch
}) {
  const response = await fetchImpl(
    layoutPath({ puzzleId, draftId }),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ board })
    }
  );
  const body = await responseBody(response);
  if (!response.ok) {
    // Validation replies carry a generic error plus the specific reasons.
    throw new Error((body.errors || []).join("; ") || body.error || `Board settings save failed (${response.status})`);
  }
  return body.layout;
}

// The automatic layout pass for one published puzzle, run by the local
// authoring server. `start` begins a run (a dry run unless `write`), and
// `status` reports the running or last finished run.
// With draftId (the layout view is showing a working copy), the server checks
// that copy's board is the published one before running the pass on it.
function layoutPassUrl(puzzleId, draftId) {
  const path = `/admin/puzzles/${encodeURIComponent(puzzleId)}/layouts-auto`;
  return draftId ? `${path}?draft=${encodeURIComponent(draftId)}` : path;
}

// modes narrows the run to some modes; minSize is the board size it starts
// from (layouts-auto.mjs --modes and --min-size).
export async function startLayoutPass({
  puzzleId, draftId = null, write = false, modes = null, minSize = null, fetchImpl = fetch
}) {
  const response = await fetchImpl(layoutPassUrl(puzzleId, draftId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      write,
      // An explicit list, even an empty one, goes to the server to check.
      ...(Array.isArray(modes) ? { modes } : {}),
      ...(minSize != null ? { minSize } : {})
    })
  });
  const body = await responseBody(response);
  if (!response.ok) throw new Error(body.error || `Layout pass could not start (${response.status})`);
  return body;
}

export async function layoutPassStatus({ puzzleId, draftId = null, fetchImpl = fetch }) {
  const response = await fetchImpl(layoutPassUrl(puzzleId, draftId), {
    cache: "no-store"
  });
  const body = await responseBody(response);
  if (!response.ok) throw new Error(body.error || `Layout pass status unavailable (${response.status})`);
  return body;
}

export async function clearLayout({
  puzzleId,
  draftId = null,
  mode = null,
  fetchImpl = fetch
}) {
  const response = await fetchImpl(
    layoutPath({ puzzleId, draftId, mode }),
    { method: "DELETE", cache: "no-store" }
  );
  const body = await responseBody(response);
  if (!response.ok) {
    throw new Error(body.error || body.detail || `Layout clear failed (${response.status})`);
  }
  return body.layout || null;
}

// Compatibility wrappers for callers that still expect the bare Star payload.
export async function saveStarLayout(args) {
  return layoutForMode(await saveLayout({ ...args, mode: "star" }), "star") || args.layout;
}

export async function clearStarLayout(args) {
  return layoutForMode(await clearLayout({ ...args, mode: "star" }), "star");
}
