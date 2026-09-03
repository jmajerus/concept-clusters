// Shared POST contract for /admin/drafts/<id>. The page is the design-copy
// review surface. Publish writes the shared D1 document. LAN Play overlays
// the D1 draft in the player without writing the working tree. MCP submit
// remains if the human asks; puzzle drafts no longer show Export, Install,
// or Uninstall -- nothing but Admin Freeze writes this checkout.

import {
  CUE_FOR_FREEZE_CONFIRM,
  HOLD_FROM_FREEZE_CONFIRM,
  parseFreezeCueConfirm
} from "./contentFreezePlan.js";
import {
  REVERT_FIELD_CONFIRM,
  SAVE_CANONICAL_CONFIRM,
  SAVE_FIELD_CONFIRM,
  SAVE_WORKING_COPY_CONFIRM
} from "./draftReviewEdit.js";

export const SUBMIT_CONFIRM = "open-pull-request";
export const PUBLISH_CONFIRM = "publish";
export const REVERT_PUBLISHED_CONFIRM = "revert-published";
export const REVERT_WORKING_COPY_CONFIRM = "revert-working-copy";
export const UNPUBLISH_CONFIRM = "unpublish";
export const DELETE_DRAFT_CONFIRM = "delete-draft";
export { CUE_FOR_FREEZE_CONFIRM, HOLD_FROM_FREEZE_CONFIRM };
export { SAVE_FIELD_CONFIRM, SAVE_WORKING_COPY_CONFIRM, REVERT_FIELD_CONFIRM, SAVE_CANONICAL_CONFIRM };

export function isSameOriginRequest({ origin, referer, host } = {}) {
  const expected = String(host || "").toLowerCase();
  if (!expected) return false;
  const candidate = origin || referer;
  if (!candidate) return false;
  try {
    return new URL(candidate).host.toLowerCase() === expected;
  } catch {
    return false;
  }
}

export function parseSubmitForm(params) {
  const confirm = params.get("confirm");
  return {
    confirm,
    replace: params.get("replace") === "1",
    isSubmit: confirm === SUBMIT_CONFIRM,
    isPublish: confirm === PUBLISH_CONFIRM,
    isRevertPublished: confirm === REVERT_PUBLISHED_CONFIRM,
    isRevertWorkingCopy: confirm === REVERT_WORKING_COPY_CONFIRM,
    isUnpublish: confirm === UNPUBLISH_CONFIRM,
    isDeleteDraft: confirm === DELETE_DRAFT_CONFIRM,
    isCueForFreeze: parseFreezeCueConfirm(confirm) === true,
    isHoldFromFreeze: parseFreezeCueConfirm(confirm) === false,
    isSaveField: confirm === SAVE_FIELD_CONFIRM,
    isSaveWorkingCopy: confirm === SAVE_WORKING_COPY_CONFIRM,
    isRevertField: confirm === REVERT_FIELD_CONFIRM,
    isSaveCanonical: confirm === SAVE_CANONICAL_CONFIRM
  };
}

export async function readNodeUrlEncoded(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function actionResultShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
    .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; }
    .validation-ok { background: #dcfce7; }
    .validation-fail { background: #fee2e2; white-space: pre-wrap; }
    .meta { color: #666; font-size: 14px; }
    a { color: #2563eb; }
    .play a + a::before { content: " · "; color: #666; }
    button { font: inherit; padding: 8px 14px; border-radius: 6px; border: 0; background: #2563eb; color: #fff; cursor: pointer; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

export function submitOutcomeCopy(publication) {
  const number = publication?.githubPrNumber;
  const url = publication?.githubPrUrl;
  const label = number ? `#${number}` : "pull request";
  const link = url
    ? `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`
    : escapeHtml(label);
  const outcome = publication?.submissionOutcome;
  if (outcome === "amended") return `Updated pull request ${link} with a new commit.`;
  if (outcome === "unchanged") {
    return `Pull request ${link} already reflects this draft; nothing to push.`;
  }
  return `Opened pull request ${link}.`;
}

/** @param {{ draftId?: string, publication?: any, error?: string | null }} [opts] */
export function renderDraftSubmitResultPage({
  draftId,
  publication = null,
  error = null
} = {}) {
  const title = error ? "Could not open pull request" : "Pull request";
  const body = error
    ? `<h1>Could not open pull request</h1>
       <p class="validation validation-fail">${escapeHtml(error)}</p>
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>
       <p class="meta">If the puzzle id already exists on GitHub, retry as
       an update to those files. On the LAN checkout, edit catalogues at
       \`/admin/catalogues\`. Puzzle submit can still add this puzzle to a
       catalogue via MCP.</p>
       <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
         <input type="hidden" name="replace" value="1">
         <p><button type="submit" name="confirm" value="open-pull-request">Retry as an update</button></p>
       </form>`
    : `<h1>Pull request</h1>
       <p class="validation validation-ok">${submitOutcomeCopy(publication)}</p>
       <p>That opened a production ship path on GitHub. Play unpublished
       boards with Open board or Play on the LAN authoring server, not on
       Cloudflare. Merging stays a separate action in GitHub.</p>
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>`;
  return actionResultShell(title, body);
}

/**
 * @param {{
 *   submitDraft: (args: any) => any,
 *   draftId: string,
 *   actor?: object,
 *   replace?: boolean
 * }} args
 */
export async function submitDraftFromReview({
  submitDraft,
  draftId,
  actor,
  replace = false
}) {
  if (typeof submitDraft !== "function") {
    const error = new Error(
      "GitHub publication is not configured on this drafts server."
    );
    error.code = "ERR_SUBMIT_UNAVAILABLE";
    throw error;
  }
  return submitDraft({
    draftId,
    actor,
    replace
  });
}

export default submitDraftFromReview;
