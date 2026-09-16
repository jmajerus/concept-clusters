// Browser client for the local authoring server's D1-backed layout override.
// A draft id selects the working copy; without one, the save targets the
// already-published row. Static player pages do not expose this control.

import { layoutDocumentForMode, layoutForMode } from "./layoutDocument.js";

async function responseBody(response) {
  return response.json().catch(() => ({}));
}

export async function saveLayout({ puzzleId, draftId = null, layout, fetchImpl = fetch }) {
  const path = draftId
    ? `/admin/drafts/${encodeURIComponent(draftId)}/layout.json`
    : `/admin/puzzles/${encodeURIComponent(puzzleId)}/layout.json`;
  const response = await fetchImpl(
    path,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ layout: layoutDocumentForMode("star", layout) })
    }
  );
  const body = await responseBody(response);
  if (!response.ok) {
    throw new Error(body.error || body.detail || `Layout save failed (${response.status})`);
  }
  return body.layout || layoutDocumentForMode("star", layout);
}

export async function clearLayout({ puzzleId, draftId = null, fetchImpl = fetch }) {
  const path = draftId
    ? `/admin/drafts/${encodeURIComponent(draftId)}/layout.json`
    : `/admin/puzzles/${encodeURIComponent(puzzleId)}/layout.json`;
  const response = await fetchImpl(
    path,
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
  return layoutForMode(await saveLayout(args), "star") || args.layout;
}

export async function clearStarLayout(args) {
  return layoutForMode(await clearLayout(args), "star");
}
