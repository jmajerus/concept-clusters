// Browser client for the administration `board` object on a working copy.
// Public play has no writer: the published puzzle already carries the flags.

async function responseBody(response) {
  return response.json().catch(() => ({}));
}

export async function saveBoardFlags({
  draftId,
  board,
  fetchImpl = fetch
}) {
  if (!draftId) {
    throw new Error("Open a working copy before changing board experiments.");
  }
  const id = encodeURIComponent(draftId);
  const current = await fetchImpl(`/admin/drafts/${id}/document.json`, { cache: "no-store" });
  const body = await responseBody(current);
  if (!current.ok) {
    throw new Error(body.error || body.detail || `Could not read the working copy (${current.status})`);
  }
  const document = { ...(body.document || {}) };
  if (board && typeof board === "object" && Object.keys(board).length) document.board = board;
  else delete document.board;
  const saved = await fetchImpl(`/admin/drafts/${id}/document`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      expected_revision: body.revision,
      document
    })
  });
  const savedBody = await responseBody(saved);
  if (!saved.ok) {
    throw new Error(savedBody.error || savedBody.detail || `Board save failed (${saved.status})`);
  }
  return savedBody.document;
}
