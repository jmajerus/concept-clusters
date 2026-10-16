// Corpus status and recency shared by the admin puzzle list and the authoring
// MCP filters, so "Past week" or "Unpublished changes" select the same rows in
// both. Freeze-pipeline states (cued, modified since Freeze, not in GitHub)
// stay with the admin page; agents do not see them.

export const RECENCY_ORDER = Object.freeze(["today", "week", "month", "older", "undated"]);

// Windows an MCP caller can ask for; each includes the shorter ones.
export const RECENCY_WINDOWS = Object.freeze(["today", "week", "month"]);

/** Today from midnight, past week = today + 6 days, past month = today + 29 days. */
export function recencyKey(updatedAt, now = new Date()) {
  const then = Date.parse(updatedAt);
  if (!Number.isFinite(then)) return "undated";
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (then >= startOfToday.getTime()) return "today";
  const weekAgo = startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000;
  if (then >= weekAgo) return "week";
  const monthAgo = startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000;
  if (then >= monthAgo) return "month";
  return "older";
}

export function updatedWithin(updatedAt, window, now = new Date()) {
  const limit = RECENCY_WINDOWS.indexOf(window);
  if (limit === -1) return true;
  const key = RECENCY_ORDER.indexOf(recencyKey(updatedAt, now));
  return key <= limit;
}

export function isPublishedLive(item) {
  return (item.published === true || item.d1Published === true)
    && item.withdrawn !== true && item.d1Withdrawn !== true;
}

export function isWorkingCopyStatus(item) {
  return item.hasWorkingCopy === true && !isPublishedLive(item);
}

export function hasUnpublishedChanges(item) {
  return isPublishedLive(item) && (
    item.unpublishedChangeDomains?.length > 0
    || item.unpublishedChanges === true
    || Number(item.publishedDiff?.total) > 0
    || item.provenanceDiffersFromPublished === true
    || item.layoutDiffersFromPublished === true
  );
}

export function isPublishedOnly(item) {
  return isPublishedLive(item) && item.hasWorkingCopy !== true;
}

// MCP status filter values, each the admin page's Show filter of the same name.
export const AGENT_CORPUS_STATUSES = Object.freeze({
  working: isWorkingCopyStatus,
  unpublished_changes: hasUnpublishedChanges,
  published_only: isPublishedOnly
});
