// Browser client for the local authoring server's D1-backed Star layout
// override. Static player pages do not expose a layout publication control.

async function responseBody(response) {
  return response.json().catch(() => ({}));
}

export async function saveStarLayout({ puzzleId, layout, fetchImpl = fetch }) {
  const response = await fetchImpl(
    `/admin/puzzles/${encodeURIComponent(puzzleId)}/star-layout.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ layout })
    }
  );
  const body = await responseBody(response);
  if (!response.ok) {
    throw new Error(body.error || body.detail || `Layout save failed (${response.status})`);
  }
  return body.layout || layout;
}

export async function clearStarLayout({ puzzleId, fetchImpl = fetch }) {
  const response = await fetchImpl(
    `/admin/puzzles/${encodeURIComponent(puzzleId)}/star-layout.json`,
    { method: "DELETE", cache: "no-store" }
  );
  const body = await responseBody(response);
  if (!response.ok) {
    throw new Error(body.error || body.detail || `Layout clear failed (${response.status})`);
  }
  return body.layout || null;
}
